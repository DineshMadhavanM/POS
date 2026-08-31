import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { KOTTicket } from '../types';
import {
  ClipboardList,
  Utensils,
  Clock,
  Ban,
  CheckCircle2,
  Loader2,
  DollarSign,
  Receipt,
  ArrowRight,
  RefreshCw,
  Flame
} from 'lucide-react';

export const CurrentOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<KOTTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadCurrentOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/restaurant/kot');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('[LoadCurrentOrders Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentOrders();
    const interval = setInterval(loadCurrentOrders, 10000); // Live poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleCancelOrder = async (id: string, tableNum: string) => {
    if (!window.confirm(`Are you sure you want to cancel order ticket for Table ${tableNum}? This will free up the table.`)) {
      return;
    }

    setCancellingId(id);
    try {
      const res = await api.put(`/restaurant/kot/${id}/status`, { status: 'CANCELLED' });
      if (res.data.success) {
        setOrders((prev) => prev.filter((o) => o._id !== id));
        loadCurrentOrders();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const activeOrders = orders.filter((o) => o.status !== 'SERVED' && (o.status as string) !== 'CANCELLED');

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-400" />
            <span>Current Active Orders & Bills</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Live table orders sent from Menu. Track kitchen status, bill totals, and cancel orders</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCurrentOrders}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Orders List / Bills Grid */}
      {activeOrders.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Receipt className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Table Orders</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            When waiters select food items on the Menu page and click "Send to Kitchen", the active order bill cards will appear here.
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
          >
            <span>Open Waiter Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOrders.map((order) => {
            const subtotal = order.subtotal || order.items.reduce((acc, i) => acc + (i.unitPrice || 10) * i.quantity, 0);
            const taxAmount = order.taxAmount || subtotal * 0.05;
            const totalAmount = order.totalAmount || subtotal + taxAmount;

            const isPending = order.status === 'PENDING';
            const isPreparing = order.status === 'PREPARING';

            return (
              <div
                key={order._id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                {/* Order Bill Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold rounded-lg">
                        {order.tableNumber || 'T-01'}
                      </span>
                      <span className="font-mono text-xs text-slate-400 font-bold">{order.orderNumber}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Ordered {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border ${
                      isPending
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : isPreparing
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-2.5 flex-1 max-h-56 overflow-y-auto pr-1">
                  {order.items.map((item, idx) => {
                    const uPrice = item.unitPrice || 0;
                    const iTotal = item.itemTotal || uPrice * item.quantity;
                    return (
                      <div key={idx} className="flex justify-between items-start text-xs border-b border-slate-800/60 pb-2">
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span className="text-emerald-400 font-mono">{item.quantity}x</span>
                            <span>{item.productName}</span>
                          </div>
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <p className="text-[10px] text-amber-400 mt-0.5">
                              + {item.selectedModifiers.map((m) => m.name).join(', ')}
                            </p>
                          )}
                          {item.specialInstructions && (
                            <p className="text-[10px] text-slate-400 italic mt-0.5">"{item.specialInstructions}"</p>
                          )}
                        </div>

                        {uPrice > 0 && (
                          <div className="text-right font-mono text-slate-300 font-bold">
                            ₹{iTotal.toFixed(2)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bill Breakdown Total */}
                <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                  {subtotal > 0 && (
                    <>
                      <div className="flex justify-between text-slate-400">
                        <span>Subtotal:</span>
                        <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Tax (5%):</span>
                        <span className="font-mono">₹{taxAmount.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center text-sm font-extrabold text-white pt-1">
                    <span>Total Bill:</span>
                    <span className="font-mono text-emerald-400 text-base">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Cancel & Action Buttons */}
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCancelOrder(order._id, order.tableNumber || 'T-01')}
                    disabled={cancellingId === order._id}
                    className="py-2.5 px-3 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow"
                  >
                    {cancellingId === order._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel Order</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/pos')}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Pay Bill (POS)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
