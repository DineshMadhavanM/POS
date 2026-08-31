import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { KOTTicket } from '../types';
import {
  ClipboardList,
  Utensils,
  Clock,
  Ban,
  CheckCircle2,
  Loader2,
  Receipt,
  ArrowRight,
  RefreshCw,
  X,
  QrCode,
  CreditCard,
  Banknote,
  Printer
} from 'lucide-react';

export const CurrentOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { organization } = useAuthStore();

  const [orders, setOrders] = useState<KOTTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Modal checkout state
  const [selectedPayOrder, setSelectedPayOrder] = useState<KOTTicket | null>(null);
  const [orderType, setOrderType] = useState<'RETAIL_SALE' | 'TAKEAWAY'>('RETAIL_SALE');
  const [custNameInput, setCustNameInput] = useState('');
  const [custPhoneInput, setCustPhoneInput] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [discountMode, setDiscountMode] = useState<'pct' | 'amt'>('pct');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Receipt modal state
  const [completedInvoice, setCompletedInvoice] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const currencySymbol = organization?.currency === 'USD' ? '$' : '₹';

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

  const handleOpenPayCheckout = (order: KOTTicket) => {
    setSelectedPayOrder(order);
    setOrderType(order.tableNumber === 'TAKEAWAY' ? 'TAKEAWAY' : 'RETAIL_SALE');
    setCustNameInput('');
    setCustPhoneInput('');
    setSelectedPaymentMethod('UPI');
    setDiscountMode('pct');
    setDiscountValue(0);
  };

  const getPaySubtotal = () => {
    if (!selectedPayOrder) return 0;
    return selectedPayOrder.subtotal || selectedPayOrder.items.reduce((sum, item) => sum + (item.itemTotal || (item.unitPrice || 0) * item.quantity), 0);
  };

  const getPayTax = () => {
    return 0;
  };

  const getPayDiscount = () => {
    const sub = getPaySubtotal();
    if (discountMode === 'pct') {
      return (sub * discountValue) / 100;
    }
    return Math.min(discountValue, sub);
  };

  const getPayGrandTotal = () => {
    const sub = getPaySubtotal();
    const disc = getPayDiscount();
    return Math.max(0, sub - disc);
  };

  const handleFinalizePayCheckout = async () => {
    if (!selectedPayOrder) return;
    setCheckoutLoading(true);

    try {
      let targetOrderId = (selectedPayOrder as any).orderId;

      // 1. If no orderId attached, create the order first
      if (!targetOrderId) {
        const orderPayload = {
          type: orderType,
          tableNumber: selectedPayOrder.tableNumber,
          customerName: custNameInput || 'Walk-in Customer',
          customerPhone: custPhoneInput || '',
          items: selectedPayOrder.items.map(item => ({
            productId: (item as any).productId || '650000000000000000000000',
            productName: item.productName,
            unitPrice: item.unitPrice || 0,
            quantity: item.quantity,
            taxRate: 5,
            selectedModifiers: item.selectedModifiers || [],
            itemTotal: item.itemTotal || (item.unitPrice || 0) * item.quantity
          })),
          subtotal: getPaySubtotal(),
          taxTotal: getPayTax(),
          discountTotal: getPayDiscount(),
          grandTotal: getPayGrandTotal(),
          notes: `KOT Ticket ${selectedPayOrder.orderNumber}`
        };

        const createRes = await api.post('/pos/orders', orderPayload);
        if (createRes.data.success) {
          targetOrderId = createRes.data.data._id;
        }
      }

      // 2. Finalize POS Invoice Checkout
      const checkoutRes = await api.post('/pos/checkout', {
        orderId: targetOrderId,
        paymentDetails: [{ method: selectedPaymentMethod, amount: getPayGrandTotal() }]
      });

      if (checkoutRes.data.success) {
        setCompletedInvoice(checkoutRes.data.data.invoice);

        // 3. Mark KOT Ticket status as SERVED
        await api.put(`/restaurant/kot/${selectedPayOrder._id}/status`, { status: 'SERVED' });

        // Immediately filter out the paid order so the card disappears automatically from active orders UI!
        const paidId = selectedPayOrder._id;
        const paidNum = selectedPayOrder.orderNumber;
        setOrders((prev) => prev.filter((o) => o._id !== paidId && o.orderNumber !== paidNum));

        setSelectedPayOrder(null);
        setShowReceiptModal(true);
        loadCurrentOrders();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const activeOrders = orders.filter(
    (o) => o.status !== 'SERVED' && (o.status as string) !== 'CANCELLED' && (o.status as string) !== 'COMPLETED' && (o.status as string) !== 'PAID'
  );

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
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
            <ClipboardList className="w-6 h-6 text-blue-400" />
            <span>Current Active Orders & Bills</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Live table orders sent from Menu. Track kitchen status, bill totals, and pop up checkout payment
          </p>
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
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-2xl">
          <Receipt className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Table Orders</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            When waiters select food items on the Menu page and click "Send to Kitchen", active order cards will appear here for checkout.
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
            const totalAmount = subtotal;

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
                            {currencySymbol}{iTotal.toFixed(2)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bill Breakdown Total */}
                <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                  {subtotal > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal:</span>
                      <span className="font-mono">{currencySymbol}{subtotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm font-extrabold text-white pt-1">
                    <span>Total Bill:</span>
                    <span className="font-mono text-emerald-400 text-base">{currencySymbol}{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Cancel & Pay Bill (POS) Button */}
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
                    onClick={() => handleOpenPayCheckout(order)}
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

      {/* POPUP MODAL: Checkout Payment */}
      {selectedPayOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-3xl space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-xl">Checkout</h3>
                <p className="text-xs text-blue-400 font-mono mt-0.5">
                  Table: {selectedPayOrder.tableNumber} • Ticket #{selectedPayOrder.orderNumber}
                </p>
              </div>
              <button onClick={() => setSelectedPayOrder(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Order Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('RETAIL_SALE')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition border ${
                    orderType === 'RETAIL_SALE'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  Walk-in
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('TAKEAWAY')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition border ${
                    orderType === 'TAKEAWAY'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  Takeaway
                </button>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Customer</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Name (opt)</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={custNameInput}
                    onChange={(e) => setCustNameInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Phone (opt)</label>
                  <input
                    type="text"
                    placeholder="Phone"
                    value={custPhoneInput}
                    onChange={(e) => setCustPhoneInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { method: 'UPI', label: 'UPI', icon: QrCode },
                  { method: 'CARD', label: 'Card', icon: CreditCard },
                  { method: 'CASH', label: 'Cash', icon: Banknote }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedPaymentMethod === item.method;
                  return (
                    <button
                      key={item.method}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(item.method as any)}
                      className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition text-xs font-bold ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Itemized Order Items Summary */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 space-y-2 max-h-36 overflow-y-auto">
              {selectedPayOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-medium">{item.productName} × {item.quantity}</span>
                  <span className="text-white font-bold">{currencySymbol}{(item.itemTotal || (item.unitPrice || 0) * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            {/* Subtotal, Discount & Total */}
            <div className="space-y-2.5 text-xs pt-1 border-t border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200 font-bold">{currencySymbol}{getPaySubtotal().toFixed(2)}</span>
              </div>

              {/* Discount Section */}
              <div className="space-y-2 bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-bold">Discount</span>
                  <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex items-center">
                    <button
                      type="button"
                      onClick={() => setDiscountMode('pct')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${discountMode === 'pct' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountMode('amt')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${discountMode === 'amt' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    >
                      {currencySymbol}
                    </button>
                  </div>
                </div>

                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder={discountMode === 'pct' ? 'Enter percentage...' : 'Enter discount amount...'}
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Preset Chips: 0%, 5%, 10%, 15% */}
                <div className="flex items-center gap-2 pt-1">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setDiscountMode('pct');
                        setDiscountValue(pct);
                      }}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold border transition ${
                        discountValue === pct && discountMode === 'pct'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-extrabold text-white pt-1">
                <span>Total</span>
                <span className="text-emerald-400 font-mono text-base">{currencySymbol}{getPayGrandTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Confirm Payment Button */}
            <button
              onClick={handleFinalizePayCheckout}
              disabled={checkoutLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
            >
              {checkoutLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Confirm Payment · {currencySymbol}{getPayGrandTotal().toFixed(2)}</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Receipt & Print Preview */}
      {showReceiptModal && completedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="text-center border-b border-slate-800 pb-4">
              <h3 className="font-extrabold text-white text-xl">{organization?.businessName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{organization?.address || 'Tax Invoice Receipt'}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold rounded-full border border-emerald-500/20">
                Invoice #{completedInvoice.invoiceNumber}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 py-2 border-b border-slate-800">
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(completedInvoice.issuedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{completedInvoice.customerName || 'Walk-in Customer'}</span>
              </div>
            </div>

            <div className="flex justify-between text-base font-extrabold text-white py-2">
              <span>Paid Amount:</span>
              <span className="text-emerald-400">{currencySymbol}{completedInvoice.grandTotal?.toFixed(2)}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
