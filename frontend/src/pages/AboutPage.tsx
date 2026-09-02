import React, { useState } from 'react';
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
  CheckCircle2,
  ChevronRight,
  Award,
  Code2,
  Database,
  Laptop,
  HeartHandshake,
  DollarSign,
  Clock,
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  Boxes,
  UserCheck,
  BarChart3,
  Settings,
  Coffee,
  ShoppingBag,
  Cpu,
  Globe,
  Server,
  Check,
  ArrowUpRight,
  Mail,
  Github,
  Linkedin,
  Terminal,
  Printer,
  FileSpreadsheet
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [activeFacilityTab, setActiveFacilityTab] = useState<'restaurant' | 'cafe' | 'bakery' | 'retail'>('restaurant');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<number>(0);

  const facilities = {
    restaurant: {
      title: 'Restaurant & Fine Dining Facility',
      subtitle: 'Complete Dine-in, Table Management & Live Kitchen Orchestration',
      icon: Utensils,
      color: 'emerald',
      badge: 'Hospitality Engine',
      description:
        'Engineered for bustling restaurants needing seamless dining room flow, split billing, waiter order taking, and real-time kitchen coordination.',
      features: [
        {
          title: 'Interactive Visual Table Layout',
          desc: 'Manage seating arrangements, real-time occupancy status (Available, Occupied, Billed, Reserved), and dining guest count.'
        },
        {
          title: 'Waiter Mobile Terminal & Menu Ordering',
          desc: 'Waiters take orders directly at table-side with instant modifier options (extra spicy, sauce on side) and course routing.'
        },
        {
          title: 'Live Kitchen Display System (KDS)',
          desc: 'Kitchen tickets stream in real-time with color-coded wait timers, item status (Pending, Cooking, Ready), and bump-bar actions.'
        },
        {
          title: 'Advanced Split & Multi-Tender Billing',
          desc: 'Split orders by item or seat, compute automated service charges, tips, and accept mixed Cash/Card/UPI transactions.'
        }
      ],
      benefits: ['Eliminate missed kitchen tickets', '35% faster table turnover', 'Zero billing miscalculations']
    },
    cafe: {
      title: 'Cafe & Quick Service (QSR) Facility',
      subtitle: 'High-Velocity Counter Billing, Custom Modifiers & Loyalty',
      icon: Coffee,
      color: 'amber',
      badge: 'Speed of Service',
      description:
        'Designed for high-throughput coffee shops, boba bars, and express cafes where seconds count during rush hour.',
      features: [
        {
          title: 'Sub-Second Counter Checkout',
          desc: 'Tap-to-add hot beverages, automated pastry pairings, and single-click checkout with thermal receipt auto-print.'
        },
        {
          title: 'Deep Beverage Customization Matrix',
          desc: 'Configure milk substitutes (Oat, Almond, Soy), sweetness levels, ice percentages, and flavor shot add-ons.'
        },
        {
          title: 'Barista Dispatch Queue',
          desc: 'Separate drink prep ticket screen with audio notifications so baristas begin brewing the instant payment is confirmed.'
        },
        {
          title: 'Customer Loyalty & Phone Lookup',
          desc: 'Recognize repeat patrons by mobile number, award instant reward points, and redeem stored credit.'
        }
      ],
      benefits: ['Sub-30 second average order time', 'Higher average order value via add-ons', 'Repeat customer retention']
    },
    bakery: {
      title: 'Bakery & Confectionery Facility',
      subtitle: 'Custom Cake Calendars, Advance Deposits & Batch Scheduling',
      icon: Cake,
      color: 'pink',
      badge: 'Artisan Crafted',
      description:
        'Tailored specifically for sweet shops, custom cake studios, and artisan bakers managing pre-orders, deliveries, and perishable batches.',
      features: [
        {
          title: 'Custom Cake Order Builder',
          desc: 'Schedule custom cakes with multi-tier flavors, custom lettering messages, icing designs, and delivery dates.'
        },
        {
          title: 'Advance Deposit & Balance Settlement',
          desc: 'Collect token advance payments at the time of booking with automated balance reminders upon pickup or dispatch.'
        },
        {
          title: 'Chef Decorator Production Sheet',
          desc: 'Dedicated bakery view for master decorators showing daily preparation timelines and custom customer requests.'
        },
        {
          title: 'Batch Freshness & Ingredient Expiry',
          desc: 'Track perishable batches (frosting, cream, dough) to ensure optimal shelf freshness and zero food waste.'
        }
      ],
      benefits: ['Zero lost custom cake slips', 'Guaranteed advance payment tracking', 'Organized daily baking schedules']
    },
    retail: {
      title: 'Retail & Supermarket Facility',
      subtitle: 'Laser Barcode Checkout, Matrix Inventory & Supplier Tracking',
      icon: Barcode,
      color: 'purple',
      badge: 'High-Volume Commerce',
      description:
        'Built for grocery stores, boutiques, convenience stores, and electronics retail handling massive SKU catalogs and high-volume barcode scanning.',
      features: [
        {
          title: 'Lightning-Fast Barcode Scanner Support',
          desc: 'Instant USB & Bluetooth laser barcode scanner integration with continuous scan mode and auto-quantity increment.'
        },
        {
          title: 'Comprehensive Inventory & Batch Ledger',
          desc: 'Manage SKUs, variants, cost prices vs MRP, supplier records, and real-time stock levels across categories.'
        },
        {
          title: 'Automated Low-Stock Trigger Alerts',
          desc: 'Visual warning badges when items fall below safety thresholds with one-click reorder list exports.'
        },
        {
          title: 'Bulk CSV Product Import & Export',
          desc: 'Effortlessly import thousands of catalog items with barcodes, categories, and tax brackets in seconds.'
        }
      ],
      benefits: ['Fastest counter queue clearance', 'Accurate profit margin calculations', 'Real-time stock loss prevention']
    }
  };

  const workspaceModules = [
    {
      id: 1,
      title: 'POS Billing Terminal',
      icon: ShoppingCartIcon,
      tag: 'Core Terminal',
      desc: 'The central command center for transactions. Features instant product search, barcode scanner integration, custom line discounts, multi-tender split payments (Cash, UPI, Card), and automated ESC/POS thermal receipt printing.',
      highlights: ['Instant Product Filtering', 'Split Tender (Cash + UPI + Card)', 'Line & Cart Level Discounts', 'Direct Thermal Printing']
    },
    {
      id: 2,
      title: 'Live Table & Floor Manager',
      icon: UtensilsCrossed,
      tag: 'Dine-In Operations',
      desc: 'Visual room floor plan showing table occupancy in real time. Enables waiters and hosts to seat guests, track active dining timers, merge tables for large parties, and instantly link bills to specific table numbers.',
      highlights: ['Color-Coded Status (Vacant, Busy, Billed)', 'Custom Room & Table Layouts', 'Dine-In Timer Tracking', 'Direct Table Billing']
    },
    {
      id: 3,
      title: 'Kitchen Display System (KDS)',
      icon: Terminal,
      tag: 'Kitchen Automation',
      desc: 'Paperless kitchen order tickets (KOT). Incoming orders stream directly to kitchen screens with active cooking timers, station routing (Grill, Bar, Pastry), and one-click status transitions (Pending -> Cooking -> Ready).',
      highlights: ['Real-Time Ticket Stream', 'Preparation Elapsed Timers', 'Audio Bell Alerts', 'Paperless Green Workflow']
    },
    {
      id: 4,
      title: 'Products & Category Hierarchy',
      icon: Package,
      tag: 'Catalog Management',
      desc: 'Rich catalog management with multi-level category trees, image uploads, barcode assignments, cost price vs selling price margins, tax configuration, and availability toggles.',
      highlights: ['Visual Category Grouping', 'Tax & GST Slabs Setup', 'Barcode SKU Mapping', 'Instant Stock Toggles']
    },
    {
      id: 5,
      title: 'Stock Ledger & Inventory Control',
      icon: Boxes,
      tag: 'Supply Chain',
      desc: 'Real-time inventory decrementing with every checkout. Complete audit logs of stock adjustments, low-stock threshold triggers, supplier purchase logs, and wastage write-offs.',
      highlights: ['Automatic Stock Decrement', 'Low Stock Push Warnings', 'Stock Adjustment History', 'Supplier Purchase Logs']
    },
    {
      id: 6,
      title: 'Customer CRM & Loyalty Engine',
      icon: Users,
      tag: 'Customer Growth',
      desc: 'Centralized customer directory recording lifetime spend, order history, visit frequency, contact details, and reward point balances to drive repeat business and customer loyalty.',
      highlights: ['Customer Lifetime Value (LTV)', 'Phone Number Fast Search', 'Reward Points System', 'Transaction History']
    },
    {
      id: 7,
      title: 'Staff Management & Role-Based Access (RBAC)',
      icon: UserCheck,
      tag: 'Security & Access',
      desc: 'Granular permissions for Owners, Managers, Cashiers, Waiters, and Kitchen Staff. Features rapid 4-digit PIN authentication for shared counter terminals with comprehensive staff activity audit trails.',
      highlights: ['Granular Role Permissions', 'Quick 4-Digit Staff PIN Login', 'Shift Performance Logs', 'Fraud Prevention Controls']
    },
    {
      id: 8,
      title: 'Sales Analytics & Financial Insights',
      icon: BarChart3,
      tag: 'Business Intelligence',
      desc: 'Visual dashboards displaying hourly sales velocity, revenue trends, top-selling items, category performance, payment mode distribution, and End-of-Day (Z-Report) cash drawer reconciliation.',
      highlights: ['Real-Time Revenue Charts', 'Top-Selling Items Matrix', 'End-of-Day Z-Report', 'Gross Profit Margins']
    },
    {
      id: 9,
      title: 'AI Business Assistant Copilot',
      icon: Bot,
      tag: 'Intelligent AI',
      desc: 'An integrated conversational AI assistant ready to answer complex business questions in natural language: "What was my highest grossing item this week?", "Which items need restocking tomorrow?", or "Compare weekend revenue velocity".',
      highlights: ['Natural Language Querying', 'Predictive Restock Advice', 'Revenue Trend Summaries', 'Context-Aware Assistance']
    },
    {
      id: 10,
      title: 'Multi-Tenant Architecture & Super Admin',
      icon: ShieldCheck,
      tag: 'Cloud Infrastructure',
      desc: 'Strict tenant data isolation with individual organization schemas, companyId partition filters, JWT token security, and a dedicated Super Admin control center to manage SaaS subscriptions and system health.',
      highlights: ['Zero-Leak Data Isolation', 'Super Admin Tenant Oversight', 'Real-Time WebSockets Sync', 'Cloud Backup & Supabase Sync']
    }
  ];

  function ShoppingCartIcon(props: any) {
    return <Receipt {...props} />;
  }

  const activeFac = facilities[activeFacilityTab];
  const ActiveFacIcon = activeFac.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col w-full max-w-full overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between z-20 border-b border-slate-800/80">
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
            N
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-xl text-white tracking-tight leading-tight">NexStack POS</span>
            <span className="text-[10px] text-blue-400 font-medium -mt-0.5">Cloud SaaS Platform</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
          <Link to="/" className="hover:text-blue-400 transition">Home</Link>
          <a href="#founder" className="hover:text-blue-400 transition">Founder & Vision</a>
          <a href="#facilities" className="hover:text-blue-400 transition">Facilities & Products</a>
          <a href="#workspace" className="hover:text-blue-400 transition">Workspace Modules</a>
          <a href="#architecture" className="hover:text-blue-400 transition">Architecture</a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition flex items-center gap-1.5 active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition flex items-center gap-1.5 active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 text-center max-w-5xl mx-auto w-full">
        {/* Glow backdrop decorative effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse shrink-0" />
          <span>About NexStack POS & Architectural Overview</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
          Empowering Next-Gen Commerce with{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
            Smart Cloud POS
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          NexStack POS is a multi-tenant cloud SaaS ecosystem designed to power high-velocity hospitality and retail businesses — providing seamless point-of-sale billing, live kitchen synchronization, cake pre-orders, laser barcode inventory, and AI-driven business intelligence.
        </p>

        {/* Metric Badges */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <p className="text-2xl sm:text-3xl font-black text-purple-400">4-in-1</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Industry Engines</p>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <p className="text-2xl sm:text-3xl font-black text-amber-400">24/7</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Real-Time Cloud Sync</p>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section id="founder" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900/40 border-y border-slate-800/80 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>Leadership & Vision</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Meet the Founder & Chief Architect
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              The engineering minds driving modern, frictionless point-of-sale innovations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Founder Profile Card */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 rounded-3xl border border-blue-500/30 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Avatar / Portrait placeholder with rich badge */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-1 shadow-xl shadow-blue-500/20">
                    <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-white font-black text-4xl group-hover:scale-105 transition duration-300">
                      DM
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-2 border-slate-950 rounded-full p-1.5 text-white shadow-md">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Dinesh Madhavan
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-blue-400 mt-1">
                  Founder & Chief Software Architect
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  NexStack Multi-Tenant SaaS Platform
                </p>

                {/* Badges */}
                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-medium">
                    Full-Stack Cloud Architect
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium">
                    Multi-Tenant Systems
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium">
                    POS & KDS Engineering
                  </span>
                </div>

                {/* Social & Contact */}
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-800/80 w-full justify-center">
                  <a
                    href="https://github.com/DineshMadhavanM"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                  <a
                    href="https://github.com/DineshMadhavanM/POS"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-white transition flex items-center gap-1.5 text-xs"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Repository</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Founder Vision Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Founder's Note</span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  "We built NexStack POS to bridge the gap between heavy enterprise software and nimble modern store operations."
                </h3>
                <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
                  Traditional Point-of-Sale systems suffer from three major vulnerabilities: they are tethered to clunky local hardware, lack real-time synchronization between waiters and kitchen staff, or force rigid single-industry workflows that cannot adapt when a business expands.
                </p>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Under the architectural leadership of <strong>Dinesh Madhavan</strong>, NexStack was designed from line one as a cloud-native, high-concurrency SaaS engine with:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs sm:text-sm">Zero-Leak Security</h5>
                    <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5">Isolated company namespaces with cryptographically signed tokens and granular RBAC.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs sm:text-sm">Real-Time Sync</h5>
                    <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5">Sub-second updates across waiters, counter POS, kitchen screens, and mobile terminals.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg shrink-0 mt-0.5">
                    <Cake className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs sm:text-sm">Industry-Tailored</h5>
                    <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5">Purpose-built workflows for Restaurants, Bakeries, Cafes, and Retail outlets.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs sm:text-sm">AI-Driven Insights</h5>
                    <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5">Built-in AI copilot that translates sales data into actionable profit advice.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities & Products Explanation Section */}
      <section id="facilities" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Store className="w-3.5 h-3.5" />
            <span>Facility & Product Ecosystem</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Specialized Facilities for Every Business Model
          </h2>
          <p className="text-slate-400 text-xs sm:text-base mt-2">
            Explore how NexStack adapts its interface, logic, and hardware support for your exact venue type
          </p>
        </div>

        {/* Facility Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          <button
            onClick={() => setActiveFacilityTab('restaurant')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition duration-200 active:scale-95 ${
              activeFacilityTab === 'restaurant'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Restaurants</span>
          </button>

          <button
            onClick={() => setActiveFacilityTab('cafe')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition duration-200 active:scale-95 ${
              activeFacilityTab === 'cafe'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Cafes & QSR</span>
          </button>

          <button
            onClick={() => setActiveFacilityTab('bakery')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition duration-200 active:scale-95 ${
              activeFacilityTab === 'bakery'
                ? 'bg-pink-500 text-slate-950 shadow-lg shadow-pink-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Cake className="w-4 h-4" />
            <span>Bakeries</span>
          </button>

          <button
            onClick={() => setActiveFacilityTab('retail')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition duration-200 active:scale-95 ${
              activeFacilityTab === 'retail'
                ? 'bg-purple-500 text-slate-950 shadow-lg shadow-purple-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>Retail Outlets</span>
          </button>
        </div>

        {/* Facility Details Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <ActiveFacIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white">{activeFac.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    {activeFac.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">{activeFac.subtitle}</p>
              </div>
            </div>

            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition flex items-center gap-1.5 active:scale-95 self-start md:self-auto"
            >
              <span>Setup This Business</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm mt-6 leading-relaxed">
            {activeFac.description}
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8">
            {activeFac.features.map((feat, idx) => (
              <div key={idx} className="p-4 sm:p-5 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">{feat.title}</h4>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed pl-8.5">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Key Advantages */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facility Highlights:</span>
            {activeFac.benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Workspace All Sections Breakdown */}
      <section id="workspace" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900/50 border-y border-slate-800/80 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Deep Dive</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Main Workspace: All 10 Core Modules Explained
            </h2>
            <p className="text-slate-400 text-xs sm:text-base mt-2">
              Every section inside the NexStack Workspace is engineered for performance, precision, and zero clutter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaceModules.map((module) => {
              const ModIcon = module.icon;
              return (
                <div
                  key={module.id}
                  className="p-6 bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-3xl transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition">
                        <ModIcon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                        {module.tag}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-mono font-bold text-blue-400">#{module.id}</span>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition">
                        {module.title}
                      </h3>
                    </div>

                    <p className="text-slate-400 text-xs sm:text-sm mt-2.5 leading-relaxed">
                      {module.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-1.5">
                    {module.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cloud Architecture & Security Section */}
      <section id="architecture" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Technical Foundation</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            High-Performance Cloud Architecture
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Built with modern, battle-tested cloud technologies for zero downtime and infinite scalability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">Strict Multi-Tenant Segregation</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Every query is scoped strictly through company ID indexes. Automated Mongoose schema plugins enforce complete data isolation across organizations with zero cross-tenant leakage.
            </p>
          </div>

          <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">WebSocket & Supabase Sync</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Live bi-directional sync powers table status updates, instant kitchen ticket alerts, and counter checkout status without requiring page refreshes or costly manual polling.
            </p>
          </div>

          <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">Hardware & ESC/POS Ready</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Native browser thermal printer commands (ESC/POS 80mm & 58mm), automatic cash drawer triggers, and plug-and-play USB/Bluetooth laser barcode scanner inputs.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24 max-w-5xl mx-auto w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/70 via-indigo-900/50 to-slate-900 border border-blue-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-4 sm:space-y-6">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Transform Your Business with NexStack POS?
            </h3>
            <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
              Register your organization today and experience instant cloud checkout, real-time KDS, and AI-powered intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Launch Your Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700 transition active:scale-95 flex items-center justify-center"
              >
                Owner Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive SaaS Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/90 py-12 sm:py-16 px-4 sm:px-6 w-full text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Col 1: Brand & Founder */}
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
              Next-generation cloud point of sale engineered for Restaurants, Cafes, Bakeries, and Retail outlets. Founded and architected by <strong>Dinesh Madhavan</strong>.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://github.com/DineshMadhavanM/POS"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition flex items-center gap-1.5"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Repo</span>
              </a>
              <Link
                to="/about"
                className="p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 transition flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>About Founder</span>
              </Link>
            </div>
          </div>

          {/* Col 2: Facilities */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Facilities & Solutions</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about#facilities" className="hover:text-blue-400 transition">Restaurant & Dining</Link></li>
              <li><Link to="/about#facilities" className="hover:text-amber-400 transition">Cafe & QSR Express</Link></li>
              <li><Link to="/about#facilities" className="hover:text-pink-400 transition">Bakery & Cake Pre-Orders</Link></li>
              <li><Link to="/about#facilities" className="hover:text-purple-400 transition">Retail & Barcode POS</Link></li>
            </ul>
          </div>

          {/* Col 3: Workspace Modules */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Main Workspace</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about#workspace" className="hover:text-blue-400 transition">POS Billing Terminal</Link></li>
              <li><Link to="/about#workspace" className="hover:text-blue-400 transition">Live Table & Floor Plan</Link></li>
              <li><Link to="/about#workspace" className="hover:text-blue-400 transition">Kitchen Display (KDS)</Link></li>
              <li><Link to="/about#workspace" className="hover:text-blue-400 transition">Inventory & Stock Ledger</Link></li>
              <li><Link to="/about#workspace" className="hover:text-blue-400 transition">Analytics & Z-Reports</Link></li>
              <li><Link to="/about#workspace" className="hover:text-blue-400 transition">AI Copilot Assistant</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform & Access */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Platform & Access</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-white transition">Business Owner Login</Link></li>
              <li><Link to="/employee-login" className="text-emerald-400 hover:text-emerald-300 transition">Staff Terminal Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Register Workspace</Link></li>
              <li><Link to="/admin-login" className="text-purple-400 hover:text-purple-300 transition">Super Admin Panel</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition">About Dinesh Madhavan</Link></li>
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
