import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Category, Product } from '../types';
import { Layers, Plus, Search, Edit2, Trash2, Loader2, X, Utensils, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    colorCode: '#10B981'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([api.get('/categories'), api.get('/products')]);
      if (cRes.data.success) {
        setCategories(cRes.data.data);
      }
      if (pRes.data.success) {
        setProducts(pRes.data.data);
      }
    } catch (err) {
      console.error('[Categories Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setShowAddModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', colorCode: '#10B981' });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
    } catch (err) {
      console.error(err);
    }
    setCategories(prev => prev.filter(c => c._id !== id));
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      colorCode: cat.colorCode || '#10B981'
    });
    setShowAddModal(true);
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const getProductCountForCategory = (catName: string, catId: string) => {
    return products.filter(p => {
      if (p.categoryId) {
        if (typeof p.categoryId === 'string') return p.categoryId === catId;
        return p.categoryId._id === catId || p.categoryId.name === catName;
      }
      return false;
    }).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-100">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Layers className="w-6 h-6 text-emerald-400" />
            <span>Food Categories</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Organize food categories for your real-time menu and products
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', description: '', colorCode: '#10B981' });
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      {/* Categories Cards Grid or Empty State */}
      {filteredCategories.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-2xl">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Categories Found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            Click "New Category" above to add real-time categories like Biryani, Dosa, Starters, Beverages, etc.
          </p>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', description: '', colorCode: '#10B981' });
              setShowAddModal(true);
            }}
            className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => {
            const count = getProductCountForCategory(cat.name, cat._id);
            const color = cat.colorCode || '#10B981';

            return (
              <div
                key={cat._id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl transition flex flex-col justify-between hover:border-slate-700 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shadow-md shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white">
                          {cat.name}
                        </h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                          {count} {count === 1 ? 'food item' : 'food items'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[2.5rem]">
                    {cat.description || 'Category description'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">Menu Column</span>
                  <Link
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline"
                  >
                    <span>View Foods</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingCategory ? 'Edit Category' : 'Create Food Category'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Biryani, Dosa, Starters, Beverages..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of items..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Theme Color Code
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={formData.colorCode}
                    onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-700 cursor-pointer p-0.5 bg-slate-800"
                  />
                  <input
                    type="text"
                    value={formData.colorCode}
                    onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl font-mono text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
