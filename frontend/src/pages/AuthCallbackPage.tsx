import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { getErrorMessage } from '../utils/errorHelper';
import { Loader2, AlertCircle } from 'lucide-react';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleGoogleAuthCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          throw new Error(sessionError?.message || 'Failed to retrieve Google OAuth session.');
        }

        const supabaseUser = session.user;
        const email = supabaseUser.email;
        const name = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'Google User';
        const avatarUrl = supabaseUser.user_metadata?.avatar_url || '';

        // Call backend google-auth handler
        const res = await api.post('/google-auth', {
          email,
          name,
          avatarUrl
        });

        if (res.data.success) {
          if (res.data.data.isNewUser) {
            navigate('/register', { state: { email, name } });
          } else {
            const { user, organization, role, accessToken, refreshToken } = res.data.data;
            setAuth(user, organization, role, accessToken, refreshToken);
            navigate('/dashboard');
          }
        }
      } catch (err: any) {
        setError(getErrorMessage(err, 'Google authentication failed.'));
      }
    };

    handleGoogleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-4">
        {error ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-lg">Google Sign-In Failed</h3>
            <p className="text-sm text-slate-400">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto" />
            <h3 className="font-bold text-white text-lg">Authenticating with Google...</h3>
            <p className="text-xs text-slate-400">Verifying session and launching your organization workspace</p>
          </div>
        )}
      </div>
    </div>
  );
};
