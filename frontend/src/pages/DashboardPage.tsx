import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  ShoppingCart,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { organization } = useAuthStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  // Initial dashboard load
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const metricsRes = await api.get('/analytics/dashboard');
        if (metricsRes.data.success) setMetrics(metricsRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Fetch sales chart data based on weekly / monthly period
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        const days = period === 'weekly' ? 7 : 30;
        const chartRes = await api.get(`/analytics/sales-chart?days=${days}`);
        if (chartRes.data.success) {
          setChartData(chartRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load sales chart:', err);
      } finally {
        setChartLoading(false);
      }
    };

    fetchChartData();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const currencySymbol = organization?.currency === 'USD' ? '$' : '₹';

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Welcome Banner */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Welcome back, {organization?.businessName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Operational Overview for {organization?.businessType} Module • {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            to="/pos"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Launch POS Billing</span>
          </Link>
          <Link
            to="/products"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 border border-slate-700 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Revenue</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {currencySymbol}{metrics?.todaySales?.toFixed(2) || '0.00'}
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Orders</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {metrics?.todayOrdersCount || 0}
            </h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">All-Time Revenue</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {currencySymbol}{metrics?.totalRevenue?.toFixed(2) || '0.00'}
            </h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Depletion</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-rose-400 mt-1">
              {metrics?.lowStockCount || 0} Items
            </h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Revenue Overview - Bar Chart Section */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Revenue Overview</h3>
            <p className="text-xs text-slate-400">Sales performance</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Weekly / Monthly Toggle */}
            <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700/70 p-1 rounded-xl">
              <button
                onClick={() => setPeriod('weekly')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  period === 'weekly'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setPeriod('monthly')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  period === 'monthly'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monthly
              </button>
            </div>

            <Link to="/reports" className="text-xs font-semibold text-emerald-400 hover:underline hidden sm:flex items-center gap-1">
              <span>Detailed Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="h-64 w-full pt-4 min-w-0 overflow-hidden">
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
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currencySymbol}${val}`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(100, 116, 139, 0.1)', radius: 8 }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
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

      {/* Recent Activity Table */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Recent POS Transactions</h3>

        {metrics?.recentOrders?.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No transactions recorded yet. Launch POS billing to make your first sale!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {metrics?.recentOrders?.map((ord: any) => (
                  <tr key={ord._id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-400">{ord.orderNumber}</td>
                    <td className="py-3 px-4 text-xs uppercase font-medium text-slate-400">{ord.type}</td>
                    <td className="py-3 px-4">{ord.customerName || 'Walk-in Customer'}</td>
                    <td className="py-3 px-4 font-bold text-white">{currencySymbol}{ord.grandTotal?.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        ord.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
