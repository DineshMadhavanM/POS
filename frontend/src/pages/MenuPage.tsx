import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Category, RestaurantTable, ProductModifier } from '../types';
import {
  Utensils,
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  CheckCircle2,
  Loader2,
  Clock,
  ChevronRight,
  Flame,
  MessageSquare
} from 'lucide-react';

interface OrderItem {
  product: Product;
  quantity: number;
  selectedModifiers: ProductModifier[];
  specialInstructions?: string;
}

export const MenuPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('T-01');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [sendingKOT, setSendingKOT] = useState(false);
  const [lastDispatchedKOT, setLastDispatchedKOT] = useState<string | null>(null);

  const [activeModifierProduct, setActiveModifierProduct] = useState<Product | null>(null);
  const [tempSelectedModifiers, setTempSelectedModifiers] = useState<ProductModifier[]>([]);

  const loadCatalogData = async () => {
    try {
      const [pRes, cRes, tRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/restaurant/tables')
      ]);
      if (pRes.data.success) setProducts(pRes.data.data);
      if (cRes.data.success) setCategories(cRes.data.data);
      if (tRes.data.success && tRes.data.data.length > 0) {
        setTables(tRes.data.data);
        setSelectedTable(tRes.data.data[0].tableNumber);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      (typeof p.categoryId === 'object' && p.categoryId?._id === selectedCategory) ||
      p.categoryId === selectedCategory;

    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleAddProduct = (product: Product) => {
    if (product.modifiers && product.modifiers.length > 0) {
      setActiveModifierProduct(product);
      setTempSelectedModifiers([]);
      return;
    }

    setOrderItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.product._id === product._id && item.selectedModifiers.length === 0);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prev, { product, quantity: 1, selectedModifiers: [] }];
    });
  };

  const confirmModifiersAdd = () => {
    if (!activeModifierProduct) return;

    setOrderItems((prev) => [
      ...prev,
      {
        product: activeModifierProduct,
        quantity: 1,
        selectedModifiers: [...tempSelectedModifiers]
      }
    ]);

    setActiveModifierProduct(null);
    setTempSelectedModifiers([]);
  };

  const updateQuantity = (index: number, delta: number) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendToKitchenKDS = async () => {
    if (orderItems.length === 0) {
      alert('Please add at least 1 food item to the menu order ticket.');
      return;
    }

    setSendingKOT(true);
    setLastDispatchedKOT(null);

    const subtotal = orderItems.reduce((acc, item) => {
      const modifierSum = item.selectedModifiers.reduce((mAcc, m) => mAcc + m.price, 0);
      return acc + (item.product.sellingPrice + modifierSum) * item.quantity;
    }, 0);

    const taxAmount = subtotal * 0.05;
    const totalAmount = subtotal + taxAmount;

    try {
      const payload = {
        tableNumber: selectedTable,
        subtotal,
        taxAmount,
        totalAmount,
        items: orderItems.map((item) => {
          const modifierSum = item.selectedModifiers.reduce((mAcc, m) => mAcc + m.price, 0);
          const unitPrice = item.product.sellingPrice + modifierSum;
          return {
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice,
            itemTotal: unitPrice * item.quantity,
            selectedModifiers: item.selectedModifiers,
            specialInstructions: item.specialInstructions || ''
          };
        })
      };

      const res = await api.post('/restaurant/kot', payload);
      if (res.data.success) {
        const kotNum = res.data.data.orderNumber;
        setLastDispatchedKOT(kotNum);
        setOrderItems([]);
        loadCatalogData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to dispatch order to Kitchen Display System (KDS)');
    } finally {
      setSendingKOT(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6">
      {/* LEFT: Menu Catalog Grid (Same functional layout as POS Billing) */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-2xl overflow-hidden">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              <span>Waiter Menu Order</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Select menu items and dispatch directly to Kitchen Display System (KDS)</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food items..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none mb-4">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            All Items ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat._id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500">
              No menu items match your search.
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p._id}
                onClick={() => handleAddProduct(p)}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 group shadow-md"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition line-clamp-2">
                      {p.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">₹{p.sellingPrice.toFixed(2)}</p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-700/50 text-[10px] text-slate-400 font-semibold">
                  <span>Stock: {p.currentStock}</span>
                  <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Waiter Ticket & KDS Dispatch Panel */}
      <div className="w-full lg:w-96 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white text-base">Kitchen Ticket (KOT)</h2>
              <p className="text-xs text-slate-400">Order sent directly to Kitchen Display Board</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold rounded-full border border-emerald-500/20">
              NO BILLING REQ.
            </span>
          </div>

          {/* Table Selection Dropdown / Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Select Table / Room</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            >
              {tables.length === 0 ? (
                <option value="T-01">T-01 (Main Hall)</option>
              ) : (
                tables.map((t) => (
                  <option key={t._id} value={t.tableNumber}>
                    {t.tableNumber} ({t.capacity} Seats - {t.status})
                  </option>
                ))
              )}
              <option value="TAKEAWAY">Takeaway Counter</option>
              <option value="ROOM-DELIVERY">Room Delivery</option>
            </select>
          </div>

          {/* Ticket Dispatched Success Banner */}
          {lastDispatchedKOT && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Dispatched Ticket {lastDispatchedKOT}!</span>
              </div>
              <p className="text-[11px] text-slate-300">Food items are now appearing live in the Kitchen KDS board.</p>
              <button
                onClick={() => navigate('/restaurant')}
                className="w-full py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition"
              >
                <span>View Live KDS Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Ordered Food Items List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[220px]">
            {orderItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Flame className="w-8 h-8 text-slate-600 animate-bounce" />
                <p className="text-xs">Click items from the left menu to build the waiter's order ticket.</p>
              </div>
            ) : (
              orderItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.product.name}</span>
                    <button onClick={() => removeItem(idx)} className="text-slate-500 hover:text-rose-400 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.selectedModifiers.length > 0 && (
                    <div className="text-[10px] text-amber-400 font-medium">
                      + {item.selectedModifiers.map((m) => m.name).join(', ')}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-1">
                      <button onClick={() => updateQuantity(idx, -1)} className="p-1 text-slate-400 hover:text-white">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-white px-2">{item.quantity}</span>
                      <button onClick={() => updateQuantity(idx, 1)} className="p-1 text-slate-400 hover:text-white">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs font-mono text-slate-300 font-bold">
                      ₹{(item.product.sellingPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dispatch Action Button */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <button
            type="button"
            onClick={handleSendToKitchenKDS}
            disabled={sendingKOT || orderItems.length === 0}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
          >
            {sendingKOT ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Ticket to Kitchen...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send to Kitchen (KDS)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modifiers Modal */}
      {activeModifierProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">{activeModifierProduct.name} Customization</h3>
              <button onClick={() => setActiveModifierProduct(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              <p className="text-xs text-slate-400 font-medium">Select kitchen instructions / modifiers:</p>
              {activeModifierProduct.modifiers?.map((m, idx) => {
                const isSelected = tempSelectedModifiers.some((sm) => sm.name === m.name);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setTempSelectedModifiers((prev) => prev.filter((sm) => sm.name !== m.name));
                      } else {
                        setTempSelectedModifiers((prev) => [...prev, m]);
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-xs font-bold flex justify-between items-center transition ${
                      isSelected
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span>+₹{m.price.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={confirmModifiersAdd}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20"
            >
              Add to Waiter Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
