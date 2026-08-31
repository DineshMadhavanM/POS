import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Building2, Lock, AlertCircle, Loader2, ArrowRight, ShieldCheck, Users } from 'lucide-react';

export const EmployeeLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    companyId: '',
    employeeId: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/employee-login', formData);
      if (res.data.success) {
        const { user, organization, role, accessToken, refreshToken, permissions } = res.data.data;
        setAuth(user, organization, role, accessToken, refreshToken, permissions);

        // Smart Role-Based Redirection
        if (role === 'CASHIER') {
          navigate('/pos');
        } else if (role === 'KITCHEN_STAFF') {
          navigate('/restaurant');
        } else if (role === 'INVENTORY_STAFF') {
          navigate('/inventory');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid Company ID, Employee ID, or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl relative z-10 border border-slate-800">
        {/* Auth Role Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl mb-6">
          <Link
            to="/login"
            className="py-2.5 px-3 rounded-xl font-bold text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition"
          >
            <Building2 className="w-4 h-4" />
            <span>Admin / Owner</span>
          </Link>
          <button
            type="button"
            className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 text-white shadow-md flex items-center justify-center gap-1.5 transition"
          >
            <Users className="w-4 h-4" />
            <span>Employee Login</span>
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-lg shadow-emerald-500/20 mb-3">
            N
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Employee Terminal Login</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Staff Member Sign In</h2>
          <p className="text-slate-400 text-xs mt-1">
            Enter your Company ID, Employee ID, and Password assigned by Admin
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmployeeLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">Company ID</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value.toUpperCase() })}
                placeholder="e.g. NX-REST-10001"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase tracking-widest font-mono transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">Employee ID</label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                placeholder="e.g. EMP-0001"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase tracking-widest font-mono transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Employee...</span>
              </>
            ) : (
              <>
                <span>Sign In to Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-800/80 pt-4 flex flex-col gap-2 text-center text-xs text-slate-400">
          <div>
            Are you a Business Owner?{' '}
            <Link to="/login" className="text-blue-400 hover:underline font-semibold">
              Admin Login
            </Link>
          </div>
          <div>
            Don't have a workspace?{' '}
            <Link to="/register" className="text-emerald-400 hover:underline font-semibold">
              Register Business
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
