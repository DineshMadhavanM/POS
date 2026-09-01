import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { getErrorMessage } from '../utils/errorHelper';
import { ShieldCheck, Lock, Mail, AlertCircle, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const SuperAdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/super-admin/login', {
        email: email.trim(),
        password: password.trim()
      });
      if (res.data.success) {
        localStorage.setItem('superAdminToken', res.data.data.token);
        localStorage.setItem('superAdminUser', JSON.stringify(res.data.data));
        navigate('/super-admin');
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Invalid Super Admin credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-3.5 sm:p-6 py-6 sm:py-10 relative overflow-x-hidden">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-purple-600/15 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/90 border border-purple-500/30 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>

        <div className="text-center mb-5 sm:mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-500/30 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5">
            <span>Root Super Administrator</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Super Admin Portal</h2>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Master directory & tenant overview for all registered shops
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSuperAdminLogin} className="space-y-3.5 sm:space-y-4">
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Admin Email ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email address..."
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 focus:border-purple-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter master password..."
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-950/80 border border-slate-800 focus:border-purple-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 mt-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Master Access...</span>
              </>
            ) : (
              <>
                <span>Enter Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-800/80 pt-4 text-center">
          <p className="text-[11px] text-slate-500">
            Authorised Super Administrators Only • Secure Master Console
          </p>
        </div>
      </div>
    </div>
  );
};
