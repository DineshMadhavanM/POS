import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Building2, User, Bell, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenAI: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAI }) => {
  const { user, organization, role } = useAuthStore();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left: Organization Details */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-800 rounded-lg text-blue-400 border border-slate-700">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-base leading-none">
            {organization?.businessName || 'Workspace'}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs text-slate-300 font-mono font-bold">Company ID: {organization?.companyId || 'NX-REST-10001'}</span>
          </div>
        </div>
      </div>

      {/* Right: AI Quick Action + User Profile */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenAI}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ask NexStack AI</span>
        </button>

        <div className="h-6 w-px bg-slate-800"></div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white leading-none">{user?.name || 'User'}</p>
            <p className="text-xs text-blue-400 mt-1 font-mono uppercase font-bold">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
