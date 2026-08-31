import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { CustomCakeOrder } from '../types';
import { Cake, Plus, Calendar, Clock, DollarSign, Loader2, X } from 'lucide-react';

export const BakeryPage: React.FC = () => {
  const { organization } = useAuthStore();
  const [cakeOrders, setCakeOrders] = useState<CustomCakeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryDateTime: new Date().toISOString().slice(0, 16),
    cakeFlavour: 'Belgian Dark Chocolate',
    cakeWeightKg: 2.0,
    customMessage: 'Happy Birthday!',
    customInstructions: 'Eggless, Tiered cake',
    totalPrice: 85.0,
    advancePaid: 30.0
  });

  const currencySymbol = organization?.currency === 'INR' ? '₹' : organization?.currency === 'EUR' ? '€' : '$';

  const loadOrders = async () => {
    try {
      const res = await api.get('/bakery/cake-orders');
      if (res.data.success) setCakeOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/bakery/cake-orders', formData);
      if (res.data.success) {
        setShowAddModal(false);
        loadOrders();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create cake order');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/bakery/cake-orders/${id}/status`, { status });
      loadOrders();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-slate-400"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cake className="w-6 h-6 text-pink-400" />
            <span>Bakery Custom Cake Orders</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Schedule custom cake deliveries, advance deposits, and remaining balance tracking</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-pink-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Cake Order</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cakeOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/60 rounded-3xl border border-slate-800">
            No custom cake orders scheduled yet. Click "New Cake Order" to register a booking.
          </div>
        ) : (
          cakeOrders.map((order) => (
            <div key={order._id} className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-base">{order.customerName}</h3>
                  <p className="text-xs text-slate-400">{order.customerPhone}</p>
                </div>
                <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full ${
                  order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-pink-400 font-semibold">
                  <Calendar className="w-4 h-4" />
                  <span>Delivery: {new Date(order.deliveryDateTime).toLocaleString()}</span>
                </div>
                <p><strong>Flavour:</strong> {order.cakeFlavour} ({order.cakeWeightKg} kg)</p>
                {order.customMessage && <p className="italic text-slate-400">"{order.customMessage}"</p>}
                {order.customInstructions && <p className="text-slate-400">Notes: {order.customInstructions}</p>}
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Total Order Price:</span>
                  <span className="font-bold text-white">{currencySymbol}{order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Advance Deposit:</span>
                  <span>{currencySymbol}{order.advancePaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-400 font-bold">
                  <span>Balance Due:</span>
                  <span>{currencySymbol}{order.remainingBalance.toFixed(2)}</span>
                </div>
              </div>

              {order.status !== 'DELIVERED' && (
                <div className="flex gap-2 pt-2">
                  {order.status === 'RECEIVED' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'PREPARING')}
                      className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs"
                    >
                      Bake Cake ➔
                    </button>
                  )}
                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'READY')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                    >
                      Cake Ready ➔
                    </button>
                  )}
                  {order.status === 'READY' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'DELIVERED')}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs"
                    >
                      Mark Delivered ✓
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Schedule Custom Cake Order</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Customer Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Delivery Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.deliveryDateTime}
                    onChange={(e) => setFormData({ ...formData, deliveryDateTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Cake Flavour</label>
                  <input
                    type="text"
                    required
                    value={formData.cakeFlavour}
                    onChange={(e) => setFormData({ ...formData, cakeFlavour: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Weight (KG)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={formData.cakeWeightKg}
                    onChange={(e) => setFormData({ ...formData, cakeWeightKg: parseFloat(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Total Price</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalPrice}
                    onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Advance Paid</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.advancePaid}
                    onChange={(e) => setFormData({ ...formData, advancePaid: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Message on Cake</label>
                <input
                  type="text"
                  value={formData.customMessage}
                  onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                  placeholder="Happy 30th Birthday Alex!"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <button type="submit" className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-pink-500/20">
                Book Custom Cake
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
