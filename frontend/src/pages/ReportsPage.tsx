import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import {
  Download,
  TrendingUp,
  CreditCard,
  ListFilter,
  PieChart as PieIcon,
  Loader2,
  Smartphone,
  Landmark,
  Banknote,
  Clock,
  Award,
  Layers,
  ShoppingBag,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { organization } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'products'>('overview');
  const [daysFilter, setDaysFilter] = useState<number>(7);

  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const currencySymbol = organization?.currency === 'USD' ? '$' : '₹';

  // Load Reports Summary Data
  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/reports');
        if (res.data.success) {
          setReportsData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load reports summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  // Load Sales Chart Data when daysFilter changes
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        const res = await api.get(`/analytics/sales-chart?days=${daysFilter}`);
        if (res.data.success) {
          setChartData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load sales chart:', err);
      } finally {
        setChartLoading(false);
      }
    };

    fetchChartData();
  }, [daysFilter]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!reportsData) return;

    const { overview, payments, products } = reportsData;
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Title
    csvContent += "NEXSTACK POS - BUSINESS PERFORMANCE REPORT\n\n";

    // Overview Section
    csvContent += "OVERVIEW SUMMARY\n";
    csvContent += `Total Revenue (All Time),${currencySymbol}${overview.totalRevenue}\n`;
    csvContent += `Today's Revenue,${currencySymbol}${overview.todaySales}\n`;
    csvContent += `Monthly Revenue,${currencySymbol}${overview.monthlySales}\n`;
    csvContent += `Total Completed Orders,${overview.totalOrders}\n`;
    csvContent += `Average Order Value,${currencySymbol}${overview.avgOrderValue}\n\n`;

    // Payment Methods Section
    csvContent += "PAYMENT BREAKDOWN\n";
    csvContent += `UPI Payments,${payments.breakdown.upi.count} transactions,${currencySymbol}${payments.breakdown.upi.total}\n`;
    csvContent += `Card Payments,${payments.breakdown.card.count} transactions,${currencySymbol}${payments.breakdown.card.total}\n`;
    csvContent += `Cash Payments,${payments.breakdown.cash.count} transactions,${currencySymbol}${payments.breakdown.cash.total}\n`;
    csvContent += `Credit Payments,${payments.breakdown.credit.count} transactions,${currencySymbol}${payments.breakdown.credit.total} (Pending: ${currencySymbol}${payments.breakdown.credit.pending})\n\n`;

    // Top Products Section
    csvContent += "TOP SELLING PRODUCTS\n";
    csvContent += "Rank,Product Name,Units Sold,Revenue,Share %\n";
    products.forEach((p: any, idx: number) => {
      csvContent += `${idx + 1},"${p.name}",${p.quantity},${currencySymbol}${p.revenue},${p.share}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `POS_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <p className="text-sm font-medium">Loading analytics insights...</p>
      </div>
    );
  }

  // Fallback defaults if database has no data yet
  const overview = reportsData?.overview || {
    totalRevenue: 0,
    todaySales: 0,
    monthlySales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    salesByCategory: []
  };

  const payments = reportsData?.payments || {
    todaySales: 0,
    monthlySales: 0,
    todayOrdersCount: 0,
    breakdown: {
      upi: { count: 0, total: 0 },
      card: { count: 0, total: 0 },
      cash: { count: 0, total: 0 },
      credit: { count: 0, total: 0, pending: 0 }
    }
  };

  const productsList = reportsData?.products || [];

  // Default color palette for Sales by Category
  const CATEGORY_COLORS = ['#84cc16', '#38bdf8', '#a855f7', '#f43f5e', '#fb923c', '#eab308', '#06b6d4', '#64748b'];

  const categoryPieData = overview.salesByCategory && overview.salesByCategory.length > 0
    ? overview.salesByCategory.map((c: any, i: number) => ({
        name: c.name,
        value: c.percentage > 0 ? c.percentage : 1,
        revenue: c.revenue,
        percentage: c.percentage,
        color: c.color || CATEGORY_COLORS[i % CATEGORY_COLORS.length]
      }))
    : [{ name: 'No Categories', value: 100, revenue: 0, percentage: 100, color: '#334155' }];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Business performance insights</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export</span>
        </button>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex justify-center">
        <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-1 shadow-lg max-w-md w-full">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'payments'
                ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'products'
                ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Products</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: OVERVIEW ==================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Total Revenue & Metric Summary Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                TOTAL REVENUE (ALL TIME)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
                  {currencySymbol}{overview.totalRevenue.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                <span className="text-emerald-400">{currencySymbol}{overview.todaySales.toLocaleString()}</span> today &nbsp;·&nbsp;{' '}
                <span className="text-emerald-400">{currencySymbol}{overview.monthlySales.toLocaleString()}</span> this month
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
              <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  TOTAL ORDERS
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1 block">
                  {overview.totalOrders}
                </span>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  AVG. ORDER
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-sky-400 mt-1 block">
                  {currencySymbol}{overview.avgOrderValue}
                </span>
              </div>
            </div>
          </div>

          {/* Revenue Trend Chart Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Revenue Trend</h3>
                <p className="text-xs text-slate-400">Collected payments over time</p>
              </div>

              <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 p-1 rounded-xl">
                <button
                  onClick={() => setDaysFilter(7)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    daysFilter === 7
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => setDaysFilter(14)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    daysFilter === 14
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  14D
                </button>
                <button
                  onClick={() => setDaysFilter(30)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    daysFilter === 30
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  30D
                </button>
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              {chartLoading ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  No revenue data recorded for this period.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickFormatter={(val) => `${currencySymbol}${val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                      }}
                      formatter={(val: any) => [`${currencySymbol}${val}`, 'Revenue']}
                      labelFormatter={(label, items) => {
                        const item = items[0]?.payload;
                        return item ? `${item.day} (${item.date})` : label;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Sales by Category Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Sales by Category</h3>
                <p className="text-xs text-slate-400">Product category breakdown</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
              {/* Donut Chart */}
              <div className="md:col-span-5 flex justify-center h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc'
                      }}
                      formatter={(val: any, name: any, props: any) => [
                        `${currencySymbol}${props.payload.revenue.toLocaleString()} (${props.payload.percentage}%)`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend & Progress Bars */}
              <div className="md:col-span-7 space-y-3">
                {overview.salesByCategory.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No category sales data recorded.</p>
                ) : (
                  overview.salesByCategory.map((cat: any, idx: number) => {
                    const color = cat.color || CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-slate-200">{cat.name}</span>
                          </div>
                          <span className="text-slate-400 font-bold">{cat.percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(cat.percentage, 3)}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: PAYMENTS ==================== */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Revenue Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 border border-emerald-500/30 p-5 rounded-3xl shadow-xl backdrop-blur-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  TODAY'S REVENUE
                </span>
                <span className="text-3xl font-black text-emerald-400 mt-2 block tracking-tight">
                  {currencySymbol}{payments.todaySales.toLocaleString()}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Show Today</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-sky-500/30 p-5 rounded-3xl shadow-xl backdrop-blur-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  MONTHLY REVENUE
                </span>
                <span className="text-3xl font-black text-sky-400 mt-2 block tracking-tight">
                  {currencySymbol}{payments.monthlySales.toLocaleString()}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Show Month</span>
                <ArrowUpRight className="w-4 h-4 text-sky-400" />
              </div>
            </div>
          </div>

          {/* Today's Payment Breakdown */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Today's Payment Breakdown</h3>
                <p className="text-xs text-slate-400">Per payment method</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* UPI */}
              <div className="bg-indigo-950/30 border border-indigo-500/20 hover:border-indigo-500/40 p-4 rounded-2xl flex items-center justify-between transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">UPI</h4>
                    <p className="text-xs text-slate-400">{payments.breakdown.upi.count} payments today</p>
                  </div>
                </div>
                <span className="text-lg font-extrabold text-indigo-300">
                  {currencySymbol}{payments.breakdown.upi.total.toLocaleString()}
                </span>
              </div>

              {/* Card */}
              <div className="bg-sky-950/30 border border-sky-500/20 hover:border-sky-500/40 p-4 rounded-2xl flex items-center justify-between transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Card</h4>
                    <p className="text-xs text-slate-400">{payments.breakdown.card.count} payments today</p>
                  </div>
                </div>
                <span className="text-lg font-extrabold text-sky-300">
                  {currencySymbol}{payments.breakdown.card.total.toLocaleString()}
                </span>
              </div>

              {/* Cash */}
              <div className="bg-amber-950/30 border border-amber-500/20 hover:border-amber-500/40 p-4 rounded-2xl flex items-center justify-between transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Cash</h4>
                    <p className="text-xs text-slate-400">{payments.breakdown.cash.count} payments today</p>
                  </div>
                </div>
                <span className="text-lg font-extrabold text-amber-300">
                  {currencySymbol}{payments.breakdown.cash.total.toLocaleString()}
                </span>
              </div>

              {/* Credit */}
              <div className="bg-rose-950/30 border border-rose-500/20 hover:border-rose-500/40 p-4 rounded-2xl flex items-center justify-between transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Credit</h4>
                    <p className="text-xs text-slate-400">{payments.breakdown.credit.count} payments today</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                    (-) {currencySymbol}{payments.breakdown.credit.pending.toLocaleString()} PENDING
                  </span>
                  <span className="text-lg font-extrabold text-rose-300">
                    {currencySymbol}{payments.breakdown.credit.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: PRODUCTS ==================== */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Top Selling Products</h3>
                <p className="text-xs text-slate-400">Ranked by revenue generated</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {productsList.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  No product sales records recorded yet.
                </div>
              ) : (
                productsList.map((item: any, idx: number) => {
                  // Badge styling based on rank
                  const isGold = idx === 0;
                  const isSilver = idx === 1;
                  const isBronze = idx === 2;

                  return (
                    <div
                      key={idx}
                      className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-2xl space-y-2 hover:bg-slate-800/80 transition"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          {/* Rank Icon / Number */}
                          <div
                            className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center shadow-md ${
                              isGold
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : isSilver
                                ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40'
                                : isBronze
                                ? 'bg-orange-600/20 text-orange-300 border border-orange-500/40'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : `#${idx + 1}`}
                          </div>

                          <div>
                            <h4 className="font-bold text-white text-sm">{item.name}</h4>
                            <span className="text-xs text-slate-400 font-medium">
                              {item.quantity} sold
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-extrabold text-emerald-400 block">
                            {currencySymbol}{item.revenue.toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            {item.share}% share
                          </span>
                        </div>
                      </div>

                      {/* Percentage Share Progress Bar */}
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(item.share, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
