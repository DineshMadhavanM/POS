import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1`
  : '/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexstack_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('nexstack_refresh_token');
        if (refreshToken) {
          const res = await axios.post(`${BASE_URL}/refresh`, { refreshToken });
          if (res.data.success) {
            const { accessToken, refreshToken: newRefresh } = res.data.data;
            localStorage.setItem('nexstack_access_token', accessToken);
            localStorage.setItem('nexstack_refresh_token', newRefresh);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshErr) {
        localStorage.removeItem('nexstack_access_token');
        localStorage.removeItem('nexstack_refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
