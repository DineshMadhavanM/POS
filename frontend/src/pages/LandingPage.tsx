import React from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Utensils,
  Cake,
  Barcode,
  ShieldCheck,
  Zap,
  BarChart3,
  Bot,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/25">
            N
          </div>
          <span className="font-bold text-xl text-white tracking-tight">NexStack POS</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/employee-login"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition flex items-center gap-1.5"
          >
            <span>Employee Login</span>
          </Link>
          <Link
            to="/login"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            Admin / Owner Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition"
          >
            Register Business
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-6 text-center max-w-5xl mx-auto flex-1 flex flex-col justify-center items-center">
        {/* Glow backdrop decorative effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span>Next-Generation Multi-Tenant POS SaaS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
          Smart POS for <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">Modern Businesses</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed">
          Cloud-based Point of Sale, multi-tenant inventory control, instant KDS billing, bakery cake scheduling, and AI-powered sales insights built for growth.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 transition"
          >
            <span>Launch Your Workspace</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition flex items-center justify-center"
          >
            Demo Sign In
          </Link>
        </div>
      </section>

      {/* Business Types Grid */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800/80 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Tailored for Every Industry</h2>
            <p className="text-slate-400 text-sm mt-2">Isolated workspaces with specialized modules for your business workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Restaurants & Cafes</h3>
              <p className="text-slate-400 text-sm mt-2">Interactive floor tables, order modifiers, and real-time Kitchen Display System (KDS).</p>
            </div>

            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-pink-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
                <Cake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Bakeries</h3>
              <p className="text-slate-400 text-sm mt-2">Custom cake scheduling, delivery dates, advance deposit tracking, and custom instructions.</p>
            </div>

            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <Barcode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Retail Outlets</h3>
              <p className="text-slate-400 text-sm mt-2">High-speed barcode scanner billing, batch management, and supplier stock entries.</p>
            </div>

            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Multi-Outlet Ready</h3>
              <p className="text-slate-400 text-sm mt-2">Centralized organization dashboard with scalable branch structure capability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="p-3 bg-blue-600/10 text-blue-400 rounded-xl shrink-0 h-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Multi-Tenant Data Isolation</h4>
              <p className="text-slate-400 text-sm mt-1">Strict database query pre-filters ensure absolute privacy across every registered business.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl shrink-0 h-fit">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Fast Cashier POS Billing</h4>
              <p className="text-slate-400 text-sm mt-1">Optimized checkout workflow with keyboard shortcuts, split payments, and instant receipts.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-purple-600/10 text-purple-400 rounded-xl shrink-0 h-fit">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">AI Business Assistant</h4>
              <p className="text-slate-400 text-sm mt-1">Ask natural language questions regarding revenue velocity, sales trends, and stock depletion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 bg-slate-900/60 border-t border-slate-800 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white">Simple, Transparent Plans</h2>
          <p className="text-slate-400 text-sm mt-2">Scale seamlessly as your business grows</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Starter</h3>
                <p className="text-3xl font-black text-white mt-4">$29 <span className="text-sm font-normal text-slate-400">/ mo</span></p>
                <p className="text-slate-400 text-xs mt-2">Single outlet POS for boutique stores</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-300 text-left">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Standard POS Billing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Product & Stock Tracking</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Basic Reports</li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 font-semibold rounded-xl text-sm transition">Choose Starter</Link>
            </div>

            <div className="p-8 bg-gradient-to-b from-blue-950/80 to-slate-900 rounded-3xl border-2 border-blue-500 shadow-xl shadow-blue-500/10 flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs uppercase font-bold px-3 py-1 rounded-full tracking-wider">Most Popular</div>
              <div>
                <h3 className="text-xl font-bold text-white">Professional</h3>
                <p className="text-3xl font-black text-white mt-4">$69 <span className="text-sm font-normal text-slate-400">/ mo</span></p>
                <p className="text-slate-400 text-xs mt-2">Complete suite for high-volume venues</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-300 text-left">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Everything in Starter</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Restaurant Tables & KDS Display</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Bakery Cake Custom Scheduler</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Assistant Queries</li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-500 font-semibold text-white rounded-xl text-sm transition shadow-lg shadow-blue-500/20">Choose Professional</Link>
            </div>

            <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Enterprise</h3>
                <p className="text-3xl font-black text-white mt-4">$149 <span className="text-sm font-normal text-slate-400">/ mo</span></p>
                <p className="text-slate-400 text-xs mt-2">Multi-branch franchises & chains</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-300 text-left">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Outlets & Staff</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Advanced Stock Audit Logs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority 24/7 SLA Support</li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 font-semibold rounded-xl text-sm transition">Choose Enterprise</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 px-6 text-center text-xs text-slate-500">
        <p>© 2026 NexStack POS SaaS Engine. Built for modern business success.</p>
      </footer>
    </div>
  );
};
