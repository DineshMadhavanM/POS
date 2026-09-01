import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Utensils,
  UtensilsCrossed,
  BarChart3,
  Menu as MenuIcon
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenDrawer }) => {
  const location = useLocation();
  const { role } = useAuthStore();

  const navItems = role === 'WAITER' ? [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Menu Order', path: '/menu', icon: Utensils },
    { name: 'Orders', path: '/current-orders', icon: ClipboardList },
    { name: 'Table & KDS', path: '/restaurant', icon: UtensilsCrossed },
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Billing', path: '/pos', icon: ShoppingCart },
    { name: 'Orders', path: '/current-orders', icon: ClipboardList },
    { name: 'Menu', path: '/menu', icon: Utensils },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flutter-bottom-nav px-2 py-1.5 pb-safe flex items-center justify-around select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-95"
          >
            <div
              className={`w-10 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/25 text-blue-400 shadow-sm border border-blue-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span
              className={`text-[10px] font-semibold mt-0.5 tracking-tight transition-colors duration-150 ${
                isActive ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              {item.name}
            </span>
          </NavLink>
        );
      })}

      {/* More / Menu Drawer Trigger */}
      <button
        onClick={onOpenDrawer}
        className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 text-slate-400 hover:text-slate-200"
      >
        <div className="w-10 h-7 rounded-full flex items-center justify-center bg-slate-800/40 border border-slate-700/40 text-slate-300">
          <MenuIcon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight text-slate-400">
          More
        </span>
      </button>
    </nav>
  );
};
