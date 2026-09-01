import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { signInWithGoogle } from '../services/supabase';
import { getErrorMessage } from '../utils/errorHelper';
import { BusinessType } from '../types';
import { Store, Utensils, Cake, Barcode, User, Mail, Lock, Phone, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    name: (location.state as any)?.name || '',
    email: (location.state as any)?.email || '',
    password: '',
    phoneNumber: '',
    businessName: '',
    businessType: 'RESTAURANT' as BusinessType
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/register', formData);
      if (res.data.success) {
        const { user, organization, role, accessToken, refreshToken } = res.data.data;
        setAuth(user, organization, role, accessToken, refreshToken);
        navigate('/onboarding');
      }
    } catch (err: any) {
      const details = err.response?.data?.details;
      if (Array.isArray(details) && details.length > 0) {
        setError(details.map((d: any) => `${d.path ? d.path.join('.') : 'field'}: ${d.message}`).join(', '));
      } else {
        setError(getErrorMessage(err, 'Registration failed. Please check your inputs.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to initiate Google OAuth sign-in.'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-3.5 sm:p-6 py-6 sm:py-10 relative overflow-x-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="text-center mb-5 sm:mb-6">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl sm:text-2xl mx-auto shadow-lg shadow-blue-500/30">
            N
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-3 sm:mt-4">Create Organization Workspace</h2>
          <p className="text-slate-400 text-xs mt-1">
            Register your business and launch your cloud POS workspace
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-slate-950/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition mb-5 sm:mb-6 shadow-md active:scale-98"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="truncate">Register with Google</span>
        </button>

        <div className="relative flex items-center justify-center mb-5 sm:mb-6">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-900 px-3 text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider absolute">Or Fill Business Details</span>
        </div>

        {error && (
          <div className="mb-5 sm:mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1 sm:mb-1.5 uppercase tracking-wider">Owner Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alice Smith"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1 sm:mb-1.5 uppercase tracking-wider">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alice@bakery.com"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1 sm:mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1 sm:mb-1.5 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1 sm:mb-1.5 uppercase tracking-wider">Business Name</label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="ABC Bakery & Bistro"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Business Type Selection */}
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Select Business Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'RESTAURANT', label: 'Restaurant', icon: Utensils },
                { type: 'CAFE', label: 'Cafe', icon: Utensils },
                { type: 'BAKERY', label: 'Bakery', icon: Cake },
                { type: 'RETAIL', label: 'Retail', icon: Barcode }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = formData.businessType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setFormData({ ...formData, businessType: item.type as BusinessType })}
                    className={`p-2.5 sm:p-3 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-[11px] sm:text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Workspace...</span>
              </>
            ) : (
              <>
                <span>Register & Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 sm:mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-blue-400 hover:underline font-semibold">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
