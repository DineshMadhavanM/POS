import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Product, Category } from '../types';
import { Package, Plus, Search, Tag, Edit, Trash2, Archive, Loader2, X, Columns, Table as TableIcon, Utensils } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { organization } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'columns' | 'table'>('columns');
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

  const currencySymbol = organization?.currency === 'USD' ? '$' : '₹';

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
      if (pRes.data.success) {
        setProducts(pRes.data.data);
      }
      if (cRes.data.success) {
        setCategories(cRes.data.data);
      }
    } catch (err) {
      console.error('[Products Load Error]', err);
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
        setFormData({
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
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create product');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete product');
      return;
    }
    setProducts(prev => prev.filter(p => p._id !== id));
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search);

    if (!matchesSearch) return false;
    if (selectedCategory === 'ALL') return true;

    const catName = typeof p.categoryId === 'object' ? p.categoryId?.name : '';
    const catId = typeof p.categoryId === 'string' ? p.categoryId : p.categoryId?._id;

    return (
      catId === selectedCategory ||
      catName?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      p.name.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  });

  // Group products into food category columns (Biryani, Dosa, Starters, etc.)
  const groupedCategories = categories.map(cat => {
    const items = filteredProducts.filter(p => {
      const catId = typeof p.categoryId === 'string' ? p.categoryId : p.categoryId?._id;
      const catName = typeof p.categoryId === 'object' ? p.categoryId?.name : '';
      return (
        catId === cat._id ||
        catName?.toLowerCase() === cat.name.toLowerCase()
      );
    });
    return { ...cat, items };
  });

  // Include uncategorized items if any
  const categorizedIds = new Set(
    groupedCategories.flatMap(g => g.items.map(i => i._id))
  );
  const uncategorizedItems = filteredProducts.filter(p => !categorizedIds.has(p._id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-100">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            <span>Product Catalog & Menu Columns</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage items, prices, tax rates, and food category columns
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('columns')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'columns'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-4 h-4" />
              <span>Category Columns</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Table View</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Product</span>
          </button>
        </div>
      </div>

      {/* Category Tabs Filter Bar */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition border ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            All Categories ({products.length})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name || selectedCategory === cat._id;
            return (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition border flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.colorCode || '#3B82F6' }}></span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name, SKU, or barcode..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Empty State if no products exist */}
      {products.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-2xl">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Products Found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            Click "New Product" to populate your real-time catalog.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      ) : viewMode === 'columns' ? (
        /* CATEGORY COLUMNS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedCategories
            .filter(catGroup => selectedCategory === 'ALL' || selectedCategory === catGroup.name || selectedCategory === catGroup._id)
            .map((catGroup) => {
              const themeColor = catGroup.colorCode || '#3B82F6';

              return (
                <div
                  key={catGroup._id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 flex flex-col justify-between"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: themeColor }}
                      ></div>
                      <h2 className="font-bold text-lg text-white">
                        {catGroup.name}
                      </h2>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                      {catGroup.items.length} items
                    </span>
                  </div>

                  {/* Food Items in this Column */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                    {catGroup.items.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500 italic bg-slate-800/30 border border-slate-800 rounded-2xl">
                        No products in {catGroup.name}
                      </div>
                    ) : (
                      catGroup.items.map((item) => (
                        <div
                          key={item._id}
                          className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 flex items-center justify-between hover:border-blue-500/50 transition group"
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-white">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                                {item.sku || 'ITEM'}
                              </span>
                              <span>• Stock: {item.currentStock}</span>
                            </div>
                          </div>

                          <div className="text-right flex items-center gap-3">
                            <div>
                              <span className="font-extrabold text-base text-blue-400">
                                {currencySymbol}{item.sellingPrice.toFixed(2)}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteProduct(item._id, item.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}

          {/* Uncategorized Column */}
          {uncategorizedItems.length > 0 && selectedCategory === 'ALL' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-500"></div>
                  <h2 className="font-bold text-lg text-white">
                    Uncategorized Items
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                  {uncategorizedItems.length} items
                </span>
              </div>
              <div className="space-y-3">
                {uncategorizedItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-white">{item.name}</h4>
                      <span className="text-xs text-slate-400">Stock: {item.currentStock}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-blue-400">
                        {currencySymbol}{item.sellingPrice.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleDeleteProduct(item._id, item.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW */
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
                {filteredProducts.map((p) => (
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
                      <button onClick={() => handleDeleteProduct(p._id, p.name)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition" title="Delete Product">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg p-6 rounded-3xl space-y-4 shadow-2xl">
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
                  placeholder="e.g. Chicken Dum Biryani, Masala Dosa..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
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
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
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
