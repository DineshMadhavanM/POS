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
  Banknote,
  ShoppingBag,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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
    csvContent += `Cash Payments,${payments.breakdown.cash.count} transactions,${currencySymbol}${payments.breakdown.cash.total}\n\n`;

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
      <div className="flex flex-col items-center justify-center h-80 gap-3 text-slate-400">
        <Loader2 className="w-9 h-9 animate-spin text-emerald-500" />
        <p className="text-xs sm:text-sm font-medium">Loading analytics insights...</p>
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
    <div className="w-full max-w-full space-y-4 sm:space-y-6 pb-12 overflow-x-hidden">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Business performance insights</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export</span>
        </button>
      </div>

      {/* Segmented Control Tabs - Strictly responsive grid */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-slate-900/95 border border-slate-800 p-1 rounded-2xl grid grid-cols-3 gap-1 shadow-lg w-full">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === 'payments'
                ? 'bg-white text-slate-900 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === 'products'
                ? 'bg-white text-slate-900 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Products</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: OVERVIEW ==================== */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6 animate-fadeIn w-full min-w-0">
          {/* Total Revenue & Metric Summary Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-xl space-y-4 sm:space-y-6 w-full min-w-0">
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">
                TOTAL REVENUE (ALL TIME)
              </span>
              <div className="flex items-baseline gap-2 mt-1 sm:mt-2">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400 tracking-tight">
                  {currencySymbol}{overview.totalRevenue.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2 font-medium">
                <span className="text-emerald-400">{currencySymbol}{overview.todaySales.toLocaleString()}</span> today &nbsp;·&nbsp;{' '}
                <span className="text-emerald-400">{currencySymbol}{overview.monthlySales.toLocaleString()}</span> this month
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-800/80">
              <div className="bg-slate-800/40 border border-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl min-w-0">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">
                  TOTAL ORDERS
                </span>
                <span className="text-xl sm:text-3xl font-extrabold text-blue-400 mt-0.5 sm:mt-1 block">
                  {overview.totalOrders}
                </span>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl min-w-0">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">
                  AVG. ORDER
                </span>
                <span className="text-xl sm:text-3xl font-extrabold text-sky-400 mt-0.5 sm:mt-1 block truncate">
                  {currencySymbol}{overview.avgOrderValue}
                </span>
              </div>
            </div>
          </div>

          {/* Revenue Trend Chart Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-xl space-y-3 sm:space-y-4 w-full min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Revenue Trend</h3>
                <p className="text-[11px] sm:text-xs text-slate-400">Collected payments over time</p>
              </div>

              <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 p-0.5 sm:p-1 rounded-xl">
                <button
                  onClick={() => setDaysFilter(7)}
                  className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition ${
                    daysFilter === 7
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => setDaysFilter(14)}
                  className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition ${
                    daysFilter === 14
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  14D
                </button>
                <button
                  onClick={() => setDaysFilter(30)}
                  className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition ${
                    daysFilter === 30
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  30D
                </button>
              </div>
            </div>

            <div className="h-56 sm:h-64 w-full min-w-0 overflow-hidden pt-2">
              {chartLoading ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs sm:text-sm">
                  No revenue data recorded for this period.
                </div>
              ) : (
                <ResponsiveContainer width="99%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(val) => `${currencySymbol}${val}`}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(100, 116, 139, 0.1)', radius: 8 }}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                        fontSize: '12px'
                      }}
                      formatter={(val: any) => [`${currencySymbol}${val}`, 'Revenue']}
                      labelFormatter={(label, items) => {
                        const item = items[0]?.payload;
                        return item ? `${item.day} (${item.date})` : label;
                      }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Sales by Category Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-xl space-y-3 sm:space-y-4 w-full min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <PieIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">Sales by Category</h3>
                <p className="text-[11px] sm:text-xs text-slate-400">Product category breakdown</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center pt-2 w-full min-w-0">
              {/* Donut Chart */}
              <div className="md:col-span-5 w-full h-44 sm:h-52 min-w-0 flex justify-center overflow-hidden">
                <ResponsiveContainer width="99%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
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
                        color: '#f8fafc',
                        fontSize: '12px'
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
              <div className="md:col-span-7 space-y-2.5 sm:space-y-3 w-full min-w-0">
                {overview.salesByCategory.length === 0 ? (
                  <p className="text-xs sm:text-sm text-slate-500 py-4 text-center">No category sales data recorded.</p>
                ) : (
                  overview.salesByCategory.map((cat: any, idx: number) => {
                    const color = cat.color || CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                    return (
                      <div key={idx} className="space-y-1 min-w-0">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-slate-200 truncate">{cat.name}</span>
                          </div>
                          <span className="text-slate-400 font-bold shrink-0">{cat.percentage}%</span>
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
        <div className="space-y-4 sm:space-y-6 animate-fadeIn w-full min-w-0">
          {/* Revenue Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0">
            <div className="bg-slate-900/90 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-xl flex flex-col justify-between min-w-0">
              <div>
                <span className="text-[11px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  TODAY'S REVENUE
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1.5 sm:mt-2 block tracking-tight truncate">
                  {currencySymbol}{payments.todaySales.toLocaleString()}
                </span>
              </div>
              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Show Today</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-sky-500/30 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-xl flex flex-col justify-between min-w-0">
              <div>
                <span className="text-[11px] sm:text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  MONTHLY REVENUE
                </span>
                <span className="text-2xl sm:text-3xl font-black text-sky-400 mt-1.5 sm:mt-2 block tracking-tight truncate">
                  {currencySymbol}{payments.monthlySales.toLocaleString()}
                </span>
              </div>
              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Show Month</span>
                <ArrowUpRight className="w-4 h-4 text-sky-400" />
              </div>
            </div>
          </div>

          {/* Today's Payment Breakdown */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-xl space-y-3 sm:space-y-4 w-full min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">Today's Payment Breakdown</h3>
                <p className="text-[11px] sm:text-xs text-slate-400">Per payment method</p>
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2 w-full min-w-0">
              {/* UPI */}
              <div className="bg-indigo-950/30 border border-indigo-500/20 hover:border-indigo-500/40 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-between transition min-w-0">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs sm:text-sm">UPI</h4>
                    <p className="text-[11px] text-slate-400 truncate">{payments.breakdown.upi.count} payments today</p>
                  </div>
                </div>
                <span className="text-base sm:text-lg font-extrabold text-indigo-300 shrink-0">
                  {currencySymbol}{payments.breakdown.upi.total.toLocaleString()}
                </span>
              </div>

              {/* Card */}
              <div className="bg-sky-950/30 border border-sky-500/20 hover:border-sky-500/40 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-between transition min-w-0">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs sm:text-sm">Card</h4>
                    <p className="text-[11px] text-slate-400 truncate">{payments.breakdown.card.count} payments today</p>
                  </div>
                </div>
                <span className="text-base sm:text-lg font-extrabold text-sky-300 shrink-0">
                  {currencySymbol}{payments.breakdown.card.total.toLocaleString()}
                </span>
              </div>

              {/* Cash */}
              <div className="bg-amber-950/30 border border-amber-500/20 hover:border-amber-500/40 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-between transition min-w-0">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs sm:text-sm">Cash</h4>
                    <p className="text-[11px] text-slate-400 truncate">{payments.breakdown.cash.count} payments today</p>
                  </div>
                </div>
                <span className="text-base sm:text-lg font-extrabold text-amber-300 shrink-0">
                  {currencySymbol}{payments.breakdown.cash.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: PRODUCTS ==================== */}
      {activeTab === 'products' && (
        <div className="space-y-4 sm:space-y-6 animate-fadeIn w-full min-w-0">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-xl space-y-3 sm:space-y-4 w-full min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">Top Selling Products</h3>
                <p className="text-[11px] sm:text-xs text-slate-400">Ranked by revenue generated</p>
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2 w-full min-w-0">
              {productsList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs sm:text-sm">
                  No product sales records recorded yet.
                </div>
              ) : (
                productsList.map((item: any, idx: number) => {
                  const isGold = idx === 0;
                  const isSilver = idx === 1;
                  const isBronze = idx === 2;

                  return (
                    <div
                      key={idx}
                      className="bg-slate-800/50 border border-slate-700/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl space-y-2 hover:bg-slate-800/80 transition min-w-0"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 min-w-0">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                          {/* Rank Icon / Number */}
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center shadow-md shrink-0 ${
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

                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-xs sm:text-sm truncate">{item.name}</h4>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {item.quantity} sold
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm sm:text-base font-extrabold text-emerald-400 block">
                            {currencySymbol}{item.revenue.toLocaleString()}
                          </span>
                          <span className="text-[10px] sm:text-xs font-semibold text-slate-400">
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
