import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Building2, User, Sparkles, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenAI: () => void;
  onOpenDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAI, onOpenDrawer }) => {
  const { user, organization, role } = useAuthStore();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left: Hamburger (mobile) & Organization Details */}
      <div className="flex items-center gap-3">
        {onOpenDrawer && (
          <button
            onClick={onOpenDrawer}
            className="lg:hidden p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition active:scale-95"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="p-2 bg-slate-800/80 rounded-xl text-blue-400 border border-slate-700/60 hidden xs:flex">
          <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <div className="min-w-0">
          <h2 className="font-bold text-white text-sm sm:text-base leading-none truncate max-w-[150px] sm:max-w-[240px]">
            {organization?.businessName || 'Workspace'}
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] text-slate-400 font-mono font-medium truncate">
              {organization?.companyId || 'NX-REST-10001'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: AI Quick Action + User Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onOpenAI}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 text-xs font-semibold rounded-xl border border-indigo-500/30 transition active:scale-95 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs sm:text-sm font-semibold text-white leading-none">{user?.name || 'User'}</p>
            <p className="text-[10px] text-blue-400 mt-1 font-mono uppercase font-bold">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
