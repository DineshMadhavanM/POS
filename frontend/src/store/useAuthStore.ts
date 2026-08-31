import { create } from 'zustand';
import { User, Organization, UserRole } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  role: UserRole | string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, organization: Organization, role: UserRole | string, accessToken: string, refreshToken: string, permissions?: string[]) => void;
  updateOrganization: (orgData: Partial<Organization>) => void;
  hasPermission: (permissionKey: string) => boolean;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organization: null,
  role: null,
  permissions: [],
  isAuthenticated: !!localStorage.getItem('nexstack_access_token'),
  isLoading: false,

  setAuth: (user, organization, role, accessToken, refreshToken, permissions = []) => {
    localStorage.setItem('nexstack_access_token', accessToken);
    localStorage.setItem('nexstack_refresh_token', refreshToken);
    set({
      user,
      organization,
      role,
      permissions,
      isAuthenticated: true,
      isLoading: false
    });
  },

  updateOrganization: (orgData) => {
    set((state) => ({
      organization: state.organization ? { ...state.organization, ...orgData } : null
    }));
  },

  hasPermission: (permissionKey: string) => {
    const { role, permissions } = get();
    if (role === UserRole.OWNER || role === 'OWNER') return true;
    return permissions.includes(permissionKey);
  },

  logout: () => {
    localStorage.removeItem('nexstack_access_token');
    localStorage.removeItem('nexstack_refresh_token');
    set({
      user: null,
      organization: null,
      role: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false
    });
  },

  fetchProfile: async () => {
    const token = localStorage.getItem('nexstack_access_token');
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await api.get('/me');
      if (res.data.success) {
        const { user, organization, role, permissions } = res.data.data;
        set({
          user: { id: user._id, name: user.name, email: user.email, phoneNumber: user.phoneNumber },
          organization: {
            id: organization._id,
            companyId: organization.companyId,
            businessName: organization.businessName,
            businessType: organization.businessType,
            subscriptionPlan: organization.subscriptionPlan,
            currency: organization.currency,
            address: organization.address,
            gstin: organization.gstin,
            taxRateDefault: organization.taxRateDefault,
            invoicePrefix: organization.invoicePrefix
          },
          role,
          permissions: permissions || [],
          isAuthenticated: true,
          isLoading: false
        });
      }
    } catch (err) {
      set({ isAuthenticated: false, isLoading: false });
    }
  }
}));
