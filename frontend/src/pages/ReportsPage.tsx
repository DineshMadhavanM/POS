import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { BarChart3, Download, FileText, TrendingUp, Loader2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { organization } = useAuthStore();
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currencySymbol = organization?.currency === 'INR' ? '₹' : organization?.currency === 'EUR' ? '€' : '$';

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await api.get('/analytics/top-products');
        if (res.data.success) setTopProducts(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full text-slate-400"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Business Analytics & Tax Reports</h1>
          <p className="text-sm text-slate-400 mt-1">High-velocity product performance and fiscal sales summaries</p>
        </div>

        <button
          onClick={() => alert('Exporting Tax Summary CSV...')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Tax Summary CSV</span>
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <span>Top Selling Products Velocity</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">No sales records available yet.</td>
                </tr>
              ) : (
                topProducts.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-blue-400">#{idx + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{item.name}</td>
                    <td className="py-3.5 px-4 font-bold">{item.quantity} units</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400">{currencySymbol}{item.revenue.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
