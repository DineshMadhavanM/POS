import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { Barcode, Search, AlertCircle, Calendar, ShieldCheck, Loader2 } from 'lucide-react';

export const RetailPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [barcodeQuery, setBarcodeQuery] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get('/products');
        if (res.data.success) setProducts(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filtered = products.filter(p => p.barcode?.includes(barcodeQuery) || p.sku?.includes(barcodeQuery) || p.name.toLowerCase().includes(barcodeQuery.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-full text-slate-400"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Barcode className="w-6 h-6 text-purple-400" />
            <span>Retail Barcode & Batch Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Barcode lookup mode, SKU tracking, and product batch expiry monitor</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Barcode className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={barcodeQuery}
          onChange={(e) => setBarcodeQuery(e.target.value)}
          placeholder="Scan or type barcode string..."
          className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase text-slate-500 bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="py-4 px-5">Product Name</th>
                <th className="py-4 px-5">Barcode</th>
                <th className="py-4 px-5">SKU</th>
                <th className="py-4 px-5">Selling Price</th>
                <th className="py-4 px-5">Stock Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/40 transition">
                  <td className="py-4 px-5 font-bold text-white">{p.name}</td>
                  <td className="py-4 px-5 font-mono text-xs text-purple-400 font-bold">{p.barcode || 'N/A'}</td>
                  <td className="py-4 px-5 font-mono text-xs text-slate-400">{p.sku || 'N/A'}</td>
                  <td className="py-4 px-5 font-bold text-white">${p.sellingPrice.toFixed(2)}</td>
                  <td className="py-4 px-5 font-bold text-emerald-400">{p.currentStock} units</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
