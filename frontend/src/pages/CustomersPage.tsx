import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Customer } from '../types';
import { Users, Plus, Search, Award, Phone, Mail, Loader2, X, ShoppingBag, Calendar, Clock, ChevronRight } from 'lucide-react';

interface OrderHistoryItem {
  _id: string;
  orderNumber: string;
  type: string;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  subtotal: number;
  items: { productName: string; quantity: number; unitPrice: number; itemTotal: number }[];
  createdAt: string;
}

export const CustomersPage: React.FC = () => {
  const { organization } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<OrderHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    address: ''
  });

  const currencySymbol = organization?.currency === 'USD' ? '$' : '₹';

  const loadCustomers = async () => {
    try {
      const res = await api.get('/customers');
      if (res.data.success) setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers', formData);
      if (res.data.success) {
        setShowAddModal(false);
        setFormData({ name: '', phoneNumber: '', email: '', address: '' });
        loadCustomers();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create customer');
    }
  };

  const handleOpenCustomerHistory = async (cust: Customer) => {
    setSelectedCustomer(cust);
    setHistoryLoading(true);
    setCustomerOrders([]);
    try {
      const res = await api.get(`/customers/${cust._id}`);
      if (res.data.success && res.data.data.orders) {
        setCustomerOrders(res.data.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phoneNumber.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Customer Management & Order History</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time customer records, contact info, total spend, and complete order history from POS Checkout
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Search input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name or phone number..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Customers List Grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-2xl">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Customer Records Found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            When users check out on the POS page and enter a customer name and phone number, their profile and order history will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <div
              key={c._id}
              onClick={() => handleOpenCustomerHistory(c)}
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition cursor-pointer group shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition">{c.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3 text-blue-400" />
                    <span>{c.phoneNumber || 'N/A'}</span>
                  </p>
                </div>
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-full flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{c.loyaltyPoints || 0} PTS</span>
                </div>
              </div>

              {c.email && (
                <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{c.email}</span>
                </p>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Spend:</span>
                <div className="flex items-center gap-1 font-extrabold text-blue-400 text-sm">
                  <span>{currencySymbol}{c.totalPurchases?.toFixed(2) || '0.00'}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Profile & Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg p-6 rounded-3xl space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-lg">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-blue-400" />
                  <span>{selectedCustomer.phoneNumber}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-white p-1 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            {/* Summary Stat Bar */}
            <div className="grid grid-cols-2 gap-3 bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 block">Total Spend</span>
                <span className="font-extrabold text-base text-blue-400">
                  {currencySymbol}{selectedCustomer.totalPurchases?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Loyalty Reward Points</span>
                <span className="font-extrabold text-base text-amber-400">
                  {selectedCustomer.loyaltyPoints || 0} PTS
                </span>
              </div>
            </div>

            {/* Order History Section */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Order History ({customerOrders.length})
              </h4>

              {historyLoading ? (
                <div className="py-8 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                  Loading order history...
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs italic bg-slate-800/30 rounded-2xl border border-slate-800">
                  <ShoppingBag className="w-6 h-6 mx-auto mb-2 opacity-50 text-slate-400" />
                  No completed orders for this customer yet.
                </div>
              ) : (
                customerOrders.map((ord) => (
                  <div
                    key={ord._id}
                    className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-blue-400 font-mono">{ord.orderNumber}</span>
                      <span className="text-emerald-400">{currencySymbol}{ord.grandTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">
                        {ord.type}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-bold">
                        {ord.status}
                      </span>
                    </div>

                    {ord.items && ord.items.length > 0 && (
                      <div className="pt-2 border-t border-slate-700/50 space-y-1 text-[11px]">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-300">
                            <span>{it.productName} × {it.quantity}</span>
                            <span>{currencySymbol}{(it.itemTotal || it.quantity * it.unitPrice).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Add New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Email Address (optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ramesh@example.com"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition"
              >
                Save Customer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
