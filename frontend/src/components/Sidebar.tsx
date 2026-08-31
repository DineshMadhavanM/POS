import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  LayoutDashboard,
  Utensils,
  ClipboardList,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  UserCheck,
  UtensilsCrossed,
  Cake,
  Barcode,
  BarChart3,
  Settings,
  Sparkles,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  onOpenAI: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAI }) => {
  const { organization, role, logout } = useAuthStore();
  const businessType = organization?.businessType || 'RESTAURANT';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['OWNER', 'MANAGER'] },
    { name: 'Waiter Menu & KOT', path: '/menu', icon: Utensils, roles: ['OWNER', 'MANAGER', 'CASHIER', 'KITCHEN_STAFF'] },
    { name: 'Current Orders', path: '/current-orders', icon: ClipboardList, roles: ['OWNER', 'MANAGER', 'CASHIER', 'KITCHEN_STAFF'] },
    { name: 'POS Billing', path: '/pos', icon: ShoppingCart, roles: ['OWNER', 'MANAGER', 'CASHIER'] },
    { name: 'Products', path: '/products', icon: Package, roles: ['OWNER', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF'] },
    { name: 'Inventory', path: '/inventory', icon: Boxes, roles: ['OWNER', 'MANAGER', 'INVENTORY_STAFF'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['OWNER', 'MANAGER', 'CASHIER'] },
    { name: 'Employees', path: '/employees', icon: UserCheck, roles: ['OWNER', 'MANAGER'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['OWNER', 'MANAGER', 'CASHIER'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['OWNER'] }
  ];

  const filteredNav = navItems.filter(item => !role || item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 backdrop-blur-xl z-20">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
            N
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight leading-none">NexStack POS</h1>
            <p className="text-xs text-blue-400 font-medium mt-1 uppercase tracking-wider">{businessType}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Workspace</div>
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          {/* Industry Specific Modules */}
          <div className="pt-4 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry Modules</div>

          {(businessType === 'RESTAURANT' || businessType === 'CAFE') && (
            <NavLink
              to="/restaurant"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
              <span>Table & KDS</span>
            </NavLink>
          )}

          {businessType === 'BAKERY' && (
            <NavLink
              to="/bakery"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-pink-600/15 text-pink-400 border border-pink-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Cake className="w-4 h-4 text-pink-400" />
              <span>Custom Cake Orders</span>
            </NavLink>
          )}

          {businessType === 'RETAIL' && (
            <NavLink
              to="/retail"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Barcode className="w-4 h-4 text-purple-400" />
              <span>Barcode & Batches</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Footer / AI Assistant & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={onOpenAI}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
          <span>AI Assistant</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl text-sm font-medium transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
