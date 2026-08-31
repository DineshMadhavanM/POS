import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Customer } from '../types';
import { Users, Plus, Search, Award, Phone, Mail, MapPin, Loader2, X } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { organization } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    address: ''
  });

  const currencySymbol = organization?.currency === 'INR' ? '₹' : organization?.currency === 'EUR' ? '€' : '$';

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

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phoneNumber.includes(search));

  if (loading) return <div className="flex items-center justify-center h-full text-slate-400"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customer CRM & Loyalty</h1>
          <p className="text-sm text-slate-400 mt-1">Manage customer records, order history, and loyalty reward points</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name or phone..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c) => (
          <div key={c._id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{c.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3 text-blue-400" />
                  <span>{c.phoneNumber}</span>
                </p>
              </div>
              <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-full flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>{c.loyaltyPoints} PTS</span>
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
              <span className="font-extrabold text-blue-400">{currencySymbol}{c.totalPurchases?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Add New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sarah Jenkins"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sarah@example.com"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20">
                Save Customer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
