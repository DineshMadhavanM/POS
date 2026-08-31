import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  ShoppingCart,
  Boxes,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { organization } = useAuthStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [metricsRes, chartRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/sales-chart?days=7')
        ]);

        if (metricsRes.data.success) setMetrics(metricsRes.data.data);
        if (chartRes.data.success) setChartData(chartRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const currencySymbol = organization?.currency === 'INR' ? '₹' : organization?.currency === 'EUR' ? '€' : '$';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {organization?.businessName}
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Operational Overview for {organization?.businessType} Module • {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/pos"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Launch POS Billing</span>
          </Link>
          <Link
            to="/products"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl flex items-center gap-2 border border-slate-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Revenue</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {currencySymbol}{metrics?.todaySales?.toFixed(2) || '0.00'}
            </h3>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Orders</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {metrics?.todayOrdersCount || 0}
            </h3>
          </div>
          <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">All-Time Revenue</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {currencySymbol}{metrics?.totalRevenue?.toFixed(2) || '0.00'}
            </h3>
          </div>
          <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Depletion</p>
            <h3 className="text-2xl font-extrabold text-rose-400 mt-1">
              {metrics?.lowStockCount || 0} Items
            </h3>
          </div>
          <div className="p-3.5 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Sales Velocity Trend</h3>
            <p className="text-xs text-slate-400">Daily revenue totals over the last 7 days</p>
          </div>
          <Link to="/reports" className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
            <span>Detailed Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
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
