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
  Smartphone,
  Coffee,
  Package,
  BarChart3
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
            to="/about"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>About Us & Founder</span>
          </Link>
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
            to="/about"
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 transition active:scale-95"
          >
            About
          </Link>
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
        <Link
          to="/about"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8 backdrop-blur-md transition group"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse shrink-0" />
          <span className="truncate">Next-Gen Multi-Tenant POS Platform • Meet the Founder</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
        </Link>

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
            to="/about"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition flex items-center justify-center active:scale-95"
          >
            Explore Platform & Founder
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
            <Link to="/about#facilities" className="p-4 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition group shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition">
                  <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition">Restaurants & Cafes</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  Floor tables, waiter menu ordering, item modifiers, and real-time Kitchen Display System (KDS).
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 mt-4 inline-flex items-center gap-1 group-hover:underline">
                View Restaurant Facility <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            {/* Card 2: Bakery */}
            <Link to="/about#facilities" className="p-4 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-pink-500/40 transition group shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition">
                  <Cake className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-pink-400 transition">Bakeries</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  Custom cake scheduling, delivery dates, advance deposit tracking, and chef instructions.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-pink-400 mt-4 inline-flex items-center gap-1 group-hover:underline">
                View Bakery Facility <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            {/* Card 3: Retail */}
            <Link to="/about#facilities" className="p-4 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition group shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition">
                  <Barcode className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-400 transition">Retail Outlets</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  High-speed barcode scanner billing, batch management, low-stock alerts, and supplier receipts.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-purple-400 mt-4 inline-flex items-center gap-1 group-hover:underline">
                View Retail Facility <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            {/* Card 4: Multi-Tenant */}
            <Link to="/about#architecture" className="p-4 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition group shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition">
                  <Store className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition">Multi-Tenant Ready</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  Isolated cloud workspaces with enterprise role-based staff access and centralized reporting.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-blue-400 mt-4 inline-flex items-center gap-1 group-hover:underline">
                View Architecture <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
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
                to="/about"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/40 font-bold rounded-xl text-xs sm:text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Meet Founder & Architect</span>
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 transition active:scale-95 flex items-center justify-center"
              >
                Owner Login
              </Link>
              <Link
                to="/admin-login"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 hover:text-white border border-purple-500/40 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-purple-500/10 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Super Admin Panel</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Landing Page Footer Section */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 sm:py-16 px-4 sm:px-6 w-full text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Col 1: Brand & Founder Dinesh Madhavan */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-black text-lg shadow-md">
                N
              </div>
              <div>
                <span className="font-bold text-white text-base tracking-tight leading-none block">NexStack POS</span>
                <span className="text-[10px] text-blue-400 font-medium">Cloud Multi-Tenant SaaS Engine</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              An enterprise-grade multi-tenant Point of Sale system with real-time Kitchen Displays, dynamic table maps, custom cake ordering, barcode retail matrix, and AI insights.
            </p>
            <div className="p-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl max-w-sm space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Founder & Chief Architect</span>
              </div>
              <p className="text-slate-300 text-xs font-semibold">Dinesh Madhavan</p>
              <p className="text-[11px] text-slate-400">Architected for frictionless restaurant, cafe, bakery, and retail operations.</p>
              <Link to="/about#founder" className="text-blue-400 hover:text-blue-300 text-[11px] font-semibold inline-flex items-center gap-1 pt-1">
                Read Dinesh Madhavan's Vision <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Col 2: Facilities & Products */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Facilities & Products</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about#facilities" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Restaurants & Dining</span>
                </Link>
              </li>
              <li>
                <Link to="/about#facilities" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cafes & QSR Express</span>
                </Link>
              </li>
              <li>
                <Link to="/about#facilities" className="hover:text-pink-400 transition flex items-center gap-1.5">
                  <Cake className="w-3.5 h-3.5 text-pink-400" />
                  <span>Bakeries & Cake Pre-Orders</span>
                </Link>
              </li>
              <li>
                <Link to="/about#facilities" className="hover:text-purple-400 transition flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-purple-400" />
                  <span>Retail & Barcode POS</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Main Workspace Sections */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Main Workspace</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about#workspace" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-blue-400" />
                  <span>POS Billing Terminal</span>
                </Link>
              </li>
              <li>
                <Link to="/about#workspace" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Table & Floor Manager</span>
                </Link>
              </li>
              <li>
                <Link to="/about#workspace" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Kitchen Display (KDS)</span>
                </Link>
              </li>
              <li>
                <Link to="/about#workspace" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-400" />
                  <span>Inventory & Stock Ledger</span>
                </Link>
              </li>
              <li>
                <Link to="/about#workspace" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Analytics & Z-Reports</span>
                </Link>
              </li>
              <li>
                <Link to="/about#workspace" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Business Assistant</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Security */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Platform & Access</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-white transition">Business Owner Sign In</Link></li>
              <li><Link to="/employee-login" className="text-emerald-400 hover:text-emerald-300 transition">Staff Terminal Access</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Register Workspace</Link></li>
              <li><Link to="/admin-login" className="text-purple-400 hover:text-purple-300 transition">Super Admin Panel</Link></li>
              <li><Link to="/about" className="text-blue-400 hover:text-blue-300 font-semibold transition">About Dinesh Madhavan</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 NexStack POS SaaS Platform. Built & Architected by Dinesh Madhavan. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-300 transition">About Us</Link>
            <Link to="/login" className="hover:text-slate-300 transition">Sign In</Link>
            <Link to="/register" className="hover:text-slate-300 transition">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
