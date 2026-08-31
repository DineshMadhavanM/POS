import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Product, Category } from '../types';
import { Package, Plus, Search, Tag, Edit, Archive, Loader2, X, Check } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { organization } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    description: '',
    sellingPrice: 0,
    costPrice: 0,
    taxRate: organization?.taxRateDefault || 0,
    currentStock: 10,
    minimumStock: 5,
    isService: false
  });

  const currencySymbol = organization?.currency === 'INR' ? '₹' : organization?.currency === 'EUR' ? '€' : '$';

  const loadData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
      if (pRes.data.success) setProducts(pRes.data.data);
      if (cRes.data.success) setCategories(cRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/products', formData);
      if (res.data.success) {
        setShowAddModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create product');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Archive this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.includes(search) || p.barcode?.includes(search));

  if (loading) return <div className="flex items-center justify-center h-full text-slate-400"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Product Catalog</h1>
          <p className="text-sm text-slate-400 mt-1">Manage items, prices, tax rates, and inventory thresholds</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name, SKU, or barcode..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase text-slate-500 bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="py-4 px-5">Product</th>
                <th className="py-4 px-5">SKU / Barcode</th>
                <th className="py-4 px-5">Selling Price</th>
                <th className="py-4 px-5">Tax Rate</th>
                <th className="py-4 px-5">Stock Level</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No products found. Click "New Product" to populate catalog.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-5 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{p.name}</p>
                          <p className="text-xs text-slate-500 font-normal">{p.isService ? 'Service / Non-Stock' : 'Physical Product'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-mono text-xs text-slate-400">{p.sku || p.barcode || 'N/A'}</td>
                    <td className="py-4 px-5 font-extrabold text-blue-400">{currencySymbol}{p.sellingPrice.toFixed(2)}</td>
                    <td className="py-4 px-5 text-xs text-slate-400">{p.taxRate}%</td>
                    <td className="py-4 px-5">
                      {p.isService ? (
                        <span className="text-xs text-slate-500 font-medium">N/A</span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.currentStock <= p.minimumStock ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {p.currentStock} units
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button onClick={() => handleArchive(p._id)} className="p-2 text-slate-500 hover:text-rose-400 transition">
                        <Archive className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Chocolate Cake / Espresso"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Selling Price ({currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Min Stock Alert</label>
                  <input
                    type="number"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20"
              >
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
