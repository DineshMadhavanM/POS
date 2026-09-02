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
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  Boxes,
  UserCheck,
  BarChart3,
  Settings,
  Coffee,
  Cpu,
  Check,
  ArrowUpRight,
  Github,
  Terminal,
  Printer,
  ClipboardList,
  HelpCircle,
  TrendingUp,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [activeFacilityTab, setActiveFacilityTab] = useState<'restaurant' | 'cafe' | 'bakery' | 'retail'>('restaurant');
  const [workspaceFilter, setWorkspaceFilter] = useState<'ALL' | 'MAIN' | 'INDUSTRY'>('ALL');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

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

  // Comprehensive Main Workspace & Industry Modules Feature Guide
  const workspaceFeatureDetails = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      path: '/dashboard',
      category: 'MAIN' as const,
      categoryLabel: 'Main Workspace',
      icon: LayoutDashboard,
      themeColor: 'blue',
      subtitle: 'Real-Time Executive Operations Cockpit',
      what: 'The central operational overview cockpit that aggregates live daily gross revenue, total completed sales count, real-time dining room table occupancy rates, fast action shortcuts, and an active stream of recent store transactions with live background synchronization.',
      why: 'Business owners and floor managers need instantaneous situational awareness without manually tallying paper receipts or consolidating spreadsheets. It provides immediate visibility into daily targets, peak traffic rushes, and current store velocity at a glance.',
      highlights: [
        'Live Revenue & Sales Volume Counters',
        'Visual Table Occupancy & Seating Gauge',
        'Quick Shortcuts to POS, Waiter & KDS',
        'Recent Transaction Stream with Live Sync'
      ]
    },
    {
      id: 'menu',
      title: 'Waiter & Menu Order',
      path: '/menu',
      category: 'MAIN' as const,
      categoryLabel: 'Main Workspace',
      icon: Utensils,
      themeColor: 'emerald',
      subtitle: 'Table-Side Digital Ordering & Course Routing',
      what: 'A touch-optimized digital ordering interface built for waitstaff and floor order-takers. Allows rapid table-side dish selection across menu categories, configuring item modifiers (spiciness levels, extra toppings, special dietary instructions), and assigning tickets to specific table numbers or takeaway tokens.',
      why: 'Eliminates handwritten paper order slips that often get lost, smeared, or miscommunicated. Cuts table-to-kitchen transmission delays to zero and allows kitchen chefs to begin food preparation the exact second the waiter presses confirm.',
      highlights: [
        'Mobile & Tablet-Optimized Order Entry',
        'Dynamic Modifier & Preparation Notes',
        'One-Tap Real-Time Kitchen KDS Firing',
        'Instant Dine-In vs Takeaway Tagging'
      ]
    },
    {
      id: 'pos',
      title: 'POS Billing',
      path: '/pos',
      category: 'MAIN' as const,
      categoryLabel: 'Main Workspace',
      icon: Receipt,
      themeColor: 'indigo',
      subtitle: 'High-Velocity Multi-Tender Checkout Register',
      what: 'The high-speed billing register featuring lightning-fast product search, laser barcode scanner integration, cart discount controls, customer association, multi-tender split payment processing (Cash, UPI QR, Credit/Debit Card), and automated ESC/POS thermal printing.',
      why: 'Checkout speed is the single most critical factor in customer satisfaction during peak store rush. This register prevents long checkout queues, ensures mathematical tax calculation accuracy, and outputs professional printed receipts in milliseconds.',
      highlights: [
        'Multi-Tender Split (Cash + UPI + Card)',
        'Direct ESC/POS Thermal Printing (80mm/58mm)',
        'Cart & Line Item Discount Modifiers',
        'Continuous Laser Barcode Scanner Input'
      ]
    },
    {
      id: 'current-orders',
      title: 'Current Orders',
      path: '/current-orders',
      category: 'MAIN' as const,
      categoryLabel: 'Main Workspace',
      icon: ClipboardList,
      themeColor: 'amber',
      subtitle: 'Live Kitchen & Order Pipeline Board',
      what: 'A dynamic operational workflow board tracking all active orders in flight across their entire lifecycle: Pending -> In Preparation -> Ready to Serve -> Completed or Cancelled, with elapsed preparation timers.',
      why: 'Prevents kitchen ticket blind spots and delays by giving floor managers, cashiers, and expeditors complete visibility over order turnaround times, helping catch delays before customers complain.',
      highlights: [
        'Full Order Lifecycle Pipeline Tracking',
        'Elapsed Preparation Time Counters',
        'One-Click Status Advance & Bump Bar',
        'Cancellation & Special Notes Audit'
      ]
    },
    {
      id: 'products',
      title: 'Products',
      path: '/products',
      category: 'MAIN' as const,
      categoryLabel: 'Main Workspace',
      icon: Package,
      themeColor: 'purple',
      subtitle: 'Master Item, Pricing & SKU Directory',
      what: 'The central inventory catalog manager where managers configure products, selling prices, unit cost prices, gross profit margins, SKU barcodes, inventory stock counts, tax/GST slabs, and active store availability toggles.',
      why: 'Centralizes pricing and prevents cashiers from selling items at incorrect rates or selling out-of-stock items, while maintaining accurate cost margin tracking across your entire product catalog.',
      highlights: [
        'Cost vs Selling Price Profit Margin Matrix',
        'SKU & Barcode Auto-Generator Support',
        'Instant Active / Inactive Availability Toggles',
        'Product Images & Category Association'
      ]
    },
    {
      id: 'categories',
      title: 'Categories',
      path: '/categories',
      category: 'MAIN' as const,
      categoryLabel: 'Main Workspace',
      icon: Layers,
      themeColor: 'sky',
      subtitle: 'Menu & Department Visual Taxonomy',
      what: 'A visual taxonomy builder to organize your catalog into intuitive collections (e.g. Starters, Main Course, Hot Beverages, Pastries, Fresh Produce) with customizable color tags and display sorting orders.',
      why: 'Reduces cashier and waiter item lookup time from seconds to a single tap, keeping menus clean, structured, and easy to navigate even for venues with hundreds of menu items or retail SKUs.',
      highlights: [
        'Visual Color & Icon Taxonomy Badges',
        'Custom Display Sort Order Controls',
        'Category-Level Availability Toggles',
        'Seamless Sync with POS & Waiter Menu'
      ]
    },
    {
      id: 'inventory',
      title: 'Order History',
      path: '/inventory',
      category: 'MAIN' as const,
      categoryLabel: 'Main Workspace',
      icon: Boxes,
      themeColor: 'teal',
      subtitle: 'Historical Invoices & Stock Deduction Ledger',
      what: 'A comprehensive sales archive tracking all completed invoices with payment method splits, cashier timestamps, customer names, tax breakdown, and automated real-time stock deduction logs.',
      why: 'Essential for processing customer returns/refunds, re-printing tax invoices, auditing cashier cash drawers, settling payment disputes, and tracking inventory shrinkage over time.',
      highlights: [
        'Full Receipt Re-Printing & PDF Export',
        'Date Range, Payment Mode & Cashier Filters',
        'Automatic Real-Time Stock Ledger Updates',
        'Detailed Line-by-Line Invoice Audit'
      ]
    },
    {
      id: 'customers',
      title: 'Customers',
      path: '/customers',
      category: 'MAIN' as const,
      categoryLabel: 'Main Workspace',
      icon: Users,
      themeColor: 'pink',
      subtitle: 'Integrated Customer CRM & Loyalty Engine',
      what: 'A centralized Customer Relationship Management (CRM) directory storing customer profiles with phone numbers, email addresses, total order counts, lifetime spend (LTV), last visit dates, and stored loyalty reward balances.',
      why: 'Repeat customers drive the vast majority of store revenue. This module turns anonymous walk-in transactions into loyal repeat patrons by enabling phone-number checkout, visit tracking, and reward point redemptions.',
      highlights: [
        'Instant Phone Number Checkout Lookup',
        'Customer Lifetime Value (LTV) Tracking',
        'Stored Loyalty & Reward Point Balances',
        'Order History & Visit Frequency Metrics'
      ]
    },
    {
      id: 'employees',
      title: 'Employees',
      path: '/employees',
      category: 'MAIN' as const,
      categoryLabel: 'Main Workspace',
      icon: UserCheck,
      themeColor: 'rose',
      subtitle: 'Staff Roles & 4-Digit Security PINs',
      what: 'Staff roster management with Role-Based Access Control (RBAC) supporting Owner, Manager, Cashier, Waiter, and Kitchen Staff roles, each secured with an individual 4-digit PIN for rapid terminal unlocking.',
      why: 'Protects sensitive financial reports and settings from non-managerial staff while enabling rapid, frictionless staff switching on shared counter POS terminals without entering slow passwords.',
      highlights: [
        'Granular Role-Based Access Control (RBAC)',
        'Fast 4-Digit PIN Counter Switching',
        'Individual Shift & Sales Performance Logs',
        'Staff Account Activation / Suspension'
      ]
    },
    {
      id: 'reports',
      title: 'Reports',
      path: '/reports',
      category: 'MAIN' as const,
      categoryLabel: 'Main Workspace',
      icon: BarChart3,
      themeColor: 'emerald',
      subtitle: 'Financial Intelligence & End-of-Day Z-Reports',
      what: 'A robust financial analytics suite providing gross revenue velocity graphs, top-selling product leaderboards, hourly sales distribution charts, payment method splits (UPI vs Cash vs Card), and End-of-Day (Z-Reports).',
      why: 'Delivers clear, data-driven clarity on profitability, best-selling dishes/items, peak store hours, and precise cash drawer reconciliation at closing time so you never lose track of store revenue.',
      highlights: [
        'End-of-Day (Z-Report) Cash Reconciliation',
        'Payment Tender Distribution Breakdown',
        'Top 10 Best-Selling Items Matrix',
        'Gross Profit Margins & Tax Summary Reports'
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      path: '/settings',
      category: 'MAIN' as const,
      categoryLabel: 'Main Workspace',
      icon: Settings,
      themeColor: 'slate',
      subtitle: 'Organization Branding & Hardware Config',
      what: 'The master configuration room where owners configure store legal name, company ID, currency symbols (₹, $, €, £), tax/GST identification numbers, thermal printer baud rates, and cloud database sync.',
      why: 'Ensures every printed receipt is legally compliant with local commercial tax laws and accurately reflects your store branding, contact information, and connected hardware peripherals.',
      highlights: [
        'Store Branding & Tax Identification Setup',
        'Custom Currency & Decimal Formatting',
        'Thermal Printer ESC/POS Configuration',
        'Multi-Tenant Company ID Verification'
      ]
    },
    {
      id: 'restaurant',
      title: 'Table & KDS (Industry Module)',
      path: '/restaurant',
      category: 'INDUSTRY' as const,
      categoryLabel: 'Industry Module (Restaurant & Cafe)',
      icon: UtensilsCrossed,
      themeColor: 'emerald',
      subtitle: 'Dining Room Floor Map & Live Kitchen Tickets',
      what: 'An interactive dining floor room layout (Main Hall, Patio, Bar) showing live table statuses (Available, Occupied, Billed, Reserved) combined with a digital Kitchen Display System (KDS) displaying real-time order tickets with cooking timers.',
      why: 'Solves dining floor chaos by giving hostesses visual seating control and replaces noisy paper kitchen printers with a synchronized digital screen that alerts chefs the second an order is placed.',
      highlights: [
        'Custom Room & Floor Table Layout Map',
        'Real-Time Table Status Indicators',
        'Color-Coded KDS Cooking Timers',
        'Paperless Kitchen Station Bump-Bar'
      ]
    },
    {
      id: 'bakery',
      title: 'Custom Cake Orders (Industry Module)',
      path: '/bakery',
      category: 'INDUSTRY' as const,
      categoryLabel: 'Industry Module (Bakery)',
      icon: Cake,
      themeColor: 'pink',
      subtitle: 'Bakery Calendar & Advance Deposit Tracker',
      what: 'A specialized bakery order scheduler with delivery dates, occasion details, multi-tier flavor customization, advance deposit collection, balance tracking, and decorator production sheets.',
      why: 'Eliminates lost custom cake order slips, guarantees advance token payment before bakers start preparation, and ensures zero delivery mix-ups on custom celebration cakes.',
      highlights: [
        'Cake Occasion & Custom Lettering Notes',
        'Advance Deposit & Balance Tracking',
        'Delivery Date Calendar Matrix',
        'Chef Decorator Production Worksheets'
      ]
    },
    {
      id: 'retail',
      title: 'Barcode & Batches (Industry Module)',
      path: '/retail',
      category: 'INDUSTRY' as const,
      categoryLabel: 'Industry Module (Retail)',
      icon: Barcode,
      themeColor: 'purple',
      subtitle: 'Laser Retail Scanner & Batch Expiry Matrix',
      what: 'A retail inventory and checkout accelerator featuring instant laser barcode scanner lookup, product batch numbers, manufacturing/expiry date tracking, and bulk CSV catalog imports.',
      why: 'Supermarkets and retail stores deal with thousands of SKUs. This module guarantees lightning-fast scan-and-bill checkout while preventing expired items from reaching the customer.',
      highlights: [
        'Continuous Barcode Laser Scanning',
        'Batch & Expiry Date Tracking',
        'Bulk CSV Product Catalog Import',
        'Low-Stock Automatic Warnings'
      ]
    }
  ];

  const filteredFeatures = workspaceFeatureDetails.filter((feat) => {
    if (workspaceFilter === 'ALL') return true;
    return feat.category === workspaceFilter;
  });

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
          <a href="#facilities" className="hover:text-blue-400 transition">Facilities</a>
          <a href="#workspace-features" className="text-blue-400 font-bold transition">Workspace Features</a>
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

      {/* Dedicated Comprehensive Main Workspace & Industry Modules Feature Guide */}
      <section id="workspace-features" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900/60 border-y border-slate-800/80 w-full scroll-mt-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Full Project Feature Encyclopedia</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Main Workspace & Industry Modules: What & Why
            </h2>
            <p className="text-slate-400 text-xs sm:text-base mt-2 leading-relaxed">
              A comprehensive breakdown explaining exactly <strong>what each module is</strong> and <strong>why it is essential</strong> to your business operations.
            </p>
          </div>

          {/* Direct Quick Link Navigation Strip */}
          <div className="mb-10 p-4 sm:p-6 bg-slate-900/90 border border-slate-800/90 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Direct Workspace Module Quick Links:</span>
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">Click any badge to jump or navigate</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {workspaceFeatureDetails.map((feat) => {
                const Icon = feat.icon;
                return (
                  <Link
                    key={feat.id}
                    to={feat.path}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 text-xs font-medium transition duration-150 active:scale-95 group"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition" />
                    <span>{feat.title}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setWorkspaceFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                workspaceFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              All Features ({workspaceFeatureDetails.length})
            </button>
            <button
              onClick={() => setWorkspaceFilter('MAIN')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                workspaceFilter === 'MAIN'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Main Workspace (11)
            </button>
            <button
              onClick={() => setWorkspaceFilter('INDUSTRY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                workspaceFilter === 'INDUSTRY'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Industry Modules (3)
            </button>
          </div>

          {/* Detailed Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  id={`feature-${feat.id}`}
                  className="p-6 sm:p-7 bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-3xl transition-all duration-200 hover:shadow-2xl hover:shadow-blue-500/5 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header with Title, Category Badge, and Link */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-400 transition">
                              {feat.title}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-400 font-medium">{feat.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          feat.category === 'MAIN'
                            ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        }`}>
                          {feat.categoryLabel}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                          {feat.path}
                        </span>
                      </div>
                    </div>

                    {/* What It Is Block */}
                    <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>WHAT IT IS:</span>
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        {feat.what}
                      </p>
                    </div>

                    {/* Why You Need It Block */}
                    <div className="p-3.5 bg-indigo-950/20 rounded-2xl border border-indigo-500/20 space-y-1">
                      <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>WHY YOU NEED IT:</span>
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        {feat.why}
                      </p>
                    </div>

                    {/* Highlights List */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Key Capabilities:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {feat.highlights.map((h, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Launch Action */}
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <Link
                      to={feat.path}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition group/btn"
                    >
                      <span>Open {feat.title} in Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition" />
                    </Link>
                    <Link
                      to="/login"
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition"
                    >
                      Sign In to Access
                    </Link>
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
              <li><Link to="/about#workspace-features" className="hover:text-blue-400 transition">Dashboard Cockpit</Link></li>
              <li><Link to="/about#workspace-features" className="hover:text-blue-400 transition">Waiter & Menu Order</Link></li>
              <li><Link to="/about#workspace-features" className="hover:text-blue-400 transition">POS Billing Terminal</Link></li>
              <li><Link to="/about#workspace-features" className="hover:text-blue-400 transition">Current Orders Pipeline</Link></li>
              <li><Link to="/about#workspace-features" className="hover:text-blue-400 transition">Products & Catalog</Link></li>
              <li><Link to="/about#workspace-features" className="hover:text-blue-400 transition">Categories Taxonomy</Link></li>
              <li><Link to="/about#workspace-features" className="hover:text-blue-400 transition">Order History & Ledger</Link></li>
              <li><Link to="/about#workspace-features" className="hover:text-blue-400 transition">Customers CRM</Link></li>
              <li><Link to="/about#workspace-features" className="hover:text-blue-400 transition">Employees & PINs</Link></li>
              <li><Link to="/about#workspace-features" className="hover:text-blue-400 transition">Reports & Analytics</Link></li>
              <li><Link to="/about#workspace-features" className="hover:text-blue-400 transition">Settings & Hardware</Link></li>
              <li><Link to="/about#workspace-features" className="hover:text-emerald-400 transition">Table & KDS Module</Link></li>
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
