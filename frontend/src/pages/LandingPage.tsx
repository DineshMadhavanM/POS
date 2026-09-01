import React from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Utensils,
  Cake,
  Barcode,
  ShieldCheck,
  Zap,
  Bot,
  ArrowRight,
  Sparkles,
  Users,
  LogIn,
  Layers,
  Receipt,
  Smartphone
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col w-full max-w-full overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between z-20">
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
            N
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-xl text-white tracking-tight leading-tight">NexStack POS</span>
            <span className="text-[10px] text-blue-400 font-medium -mt-0.5">Cloud SaaS Engine</span>
          </div>
        </Link>

        {/* Desktop Navigation Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            to="/employee-login"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition flex items-center gap-1.5 active:scale-95"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Employee Login</span>
          </Link>
          <Link
            to="/login"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition flex items-center gap-1.5 active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition flex items-center gap-1.5 active:scale-95"
          >
            <span>Register Business</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Navigation Actions */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            to="/login"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 transition active:scale-95"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 shadow-md transition active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 text-center max-w-5xl mx-auto flex-1 flex flex-col justify-center items-center w-full min-w-0">
        {/* Glow backdrop decorative effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/20 blur-[100px] sm:blur-[140px] rounded-full pointer-events-none"></div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse shrink-0" />
          <span className="truncate">Next-Gen Multi-Tenant POS Platform</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl">
          Smart Cloud POS for{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
            Modern Businesses
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed">
          Cloud Point of Sale, multi-tenant inventory control, instant waiter KDS ticketing, bakery cake scheduling, and AI-powered sales insights built for growth.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2.5 transition active:scale-95"
          >
            <span>Launch Your Workspace</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition flex items-center justify-center active:scale-95"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Quick Action Link */}
        <div className="mt-4 sm:hidden flex items-center gap-1 text-xs text-slate-400">
          <span>Are you staff?</span>
          <Link to="/employee-login" className="text-emerald-400 font-semibold underline">
            Employee Terminal Login
          </Link>
        </div>
      </section>

      {/* Business Types Grid */}
      <section className="py-12 sm:py-16 bg-slate-900/50 border-y border-slate-800/80 px-4 sm:px-6 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Tailored for Every Industry</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">Specialized modules designed specifically for your venue's workflow</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: Restaurant */}
            <div className="p-4 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition group shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition">Restaurants & Cafes</h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Floor tables, waiter menu ordering, item modifiers, and real-time Kitchen Display System (KDS).
              </p>
            </div>

            {/* Card 2: Bakery */}
            <div className="p-4 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-pink-500/40 transition group shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition">
                <Cake className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-pink-400 transition">Bakeries</h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Custom cake scheduling, delivery dates, advance deposit tracking, and chef instructions.
              </p>
            </div>

            {/* Card 3: Retail */}
            <div className="p-4 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition group shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition">
                <Barcode className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-400 transition">Retail Outlets</h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                High-speed barcode scanner billing, batch management, low-stock alerts, and supplier receipts.
              </p>
            </div>

            {/* Card 4: Multi-Tenant */}
            <div className="p-4 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition group shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition">
                <Store className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition">Multi-Tenant Ready</h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Isolated cloud workspaces with enterprise role-based staff access and centralized reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          <div className="p-5 sm:p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl sm:rounded-3xl flex gap-4 items-start">
            <div className="p-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">Multi-Tenant Data Isolation</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Strict database isolation ensures absolute privacy and secure data separation across every business.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl sm:rounded-3xl flex gap-4 items-start">
            <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">Lightning-Fast POS Billing</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Optimized checkout workflow supporting UPI, Card, and Cash split payments with instant thermal receipts.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl sm:rounded-3xl flex gap-4 items-start">
            <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-2xl shrink-0">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">AI Business Assistant</h4>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Ask natural language queries regarding revenue velocity, sales trends, and inventory restock recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-20 max-w-5xl mx-auto w-full">
        <div className="p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-4 sm:space-y-6">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Upgrade Your Operations?
            </h3>
            <p className="text-slate-300 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
              Launch your organization workspace today and start serving customers with our cloud POS engine.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Create Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 transition active:scale-95 flex items-center justify-center"
              >
                Owner Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 border-t border-slate-800/80 px-4 sm:px-6 text-center text-xs text-slate-500">
        <p>© 2026 NexStack POS SaaS Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};
