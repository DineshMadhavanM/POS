import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { StockMovement, Product, Supplier } from '../types';
import {
  ClipboardList,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  Loader2,
  X,
  Boxes,
  ShoppingBag,
  Plus,
  Printer,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  taxRate: number;
  itemTotal: number;
}

interface OrderRecord {
  _id: string;
  orderNumber: string;
  todayOrderNo?: number;
  customerName?: string;
  customerPhone?: string;
  type: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  grandTotal: number;
  subtotal: number;
  taxTotal: number;
  items: OrderItem[];
  createdAt: string;
}

export const InventoryPage: React.FC = () => {
  const { organization } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'stock'>('orders');

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  const [adjustData, setAdjustData] = useState({
    productId: '',
    type: 'PURCHASE',
    quantityDelta: 10,
    notes: ''
  });

  const [supplierData, setSupplierData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstin: '',
    address: ''
  });

  const currencySymbol = organization?.currency === 'USD' ? '$' : '₹';

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordRes, mRes, pRes, sRes] = await Promise.all([
        api.get('/pos/orders'),
        api.get('/inventory/movements'),
        api.get('/products'),
        api.get('/suppliers')
      ]);

      if (ordRes.data.success) setOrders(ordRes.data.data);
      if (mRes.data.success) setMovements(mRes.data.data);
      if (pRes.data.success) setProducts(pRes.data.data);
      if (sRes.data.success) setSuppliers(sRes.data.data);
    } catch (err) {
      console.error('[Order History Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteOrder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this order from history?')) return;
    try {
      await api.delete(`/pos/orders/${id}`);
    } catch (err) {
      console.error(err);
    }
    setOrders(prev => prev.filter(o => o._id !== id));
  };

  const handleShareOrder = async (ord: OrderRecord) => {
    const itemsText = ord.items?.map(i => `- ${i.productName} (x${i.quantity}): ${currencySymbol}${(i.itemTotal || i.quantity * i.unitPrice).toFixed(2)}`).join('\n') || '';
    const shareText = `*${organization?.businessName || 'NexStack POS'} - Order Receipt*\nOrder ID: #${ord._id.slice(-6).toUpperCase()}\nDate: ${new Date(ord.createdAt).toLocaleString()}\nCustomer: ${ord.customerName || 'Walk-in Customer'}\nPayment: ${ord.paymentMethod || 'Cash'}\n\n*Items:*\n${itemsText}\n\n*Total Amount:* ${currencySymbol}${ord.grandTotal.toFixed(2)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order Bill #${ord._id.slice(-6).toUpperCase()}`,
          text: shareText
        });
        return;
      } catch (e) {
        // user cancelled or share unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      alert('Order bill details copied to clipboard!');
    } catch (e) {
      alert(shareText);
    }
  };

  const handlePrintOrder = (ord: OrderRecord) => {
    const printWindow = window.open('', '_blank', 'width=450,height=650');
    if (!printWindow) {
      window.print();
      return;
    }
    const itemsHtml = ord.items?.map(i => `
      <tr>
        <td style="padding: 6px 0;">${i.productName} x ${i.quantity}</td>
        <td style="text-align: right; padding: 6px 0;">${currencySymbol}${(i.itemTotal || i.quantity * i.unitPrice).toFixed(2)}</td>
      </tr>
    `).join('') || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Order Receipt #${ord._id.slice(-6).toUpperCase()}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; font-size: 13px; color: #111; line-height: 1.4; }
            .header { text-align: center; margin-bottom: 16px; border-bottom: 2px dashed #ccc; padding-bottom: 12px; }
            .header h2 { margin: 0 0 4px 0; font-size: 18px; font-weight: bold; }
            .header p { margin: 2px 0; font-size: 11px; color: #555; }
            .info { margin-bottom: 12px; font-size: 12px; }
            .info p { margin: 3px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th { border-bottom: 1px solid #000; padding: 6px 0; font-size: 11px; text-transform: uppercase; }
            .total { border-top: 2px dashed #ccc; margin-top: 16px; padding-top: 12px; font-size: 15px; font-weight: bold; display: flex; justify-content: space-between; }
            .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #666; border-top: 1px solid #eee; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${organization?.businessName || 'NexStack POS'}</h2>
            <p>${organization?.address || 'Tax Invoice Receipt'}</p>
            <p style="font-weight:bold; margin-top:6px;">Order #${ord._id.slice(-6).toUpperCase()}</p>
            <p>${new Date(ord.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
          <div class="info">
            <p><strong>Customer:</strong> ${ord.customerName || 'Walk-in Customer'}</p>
            <p><strong>Order Type:</strong> ${ord.type}</p>
            <p><strong>Payment Method:</strong> ${ord.paymentMethod || 'Cash'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Item</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="total">
            <span>Total Paid</span>
            <span>${currencySymbol}${ord.grandTotal.toFixed(2)}</span>
          </div>
          <div class="footer">
            <p>Thank you for dining with us!</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/adjust', adjustData);
      if (res.data.success) {
        setShowAdjustModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Stock adjustment failed');
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/suppliers', supplierData);
      if (res.data.success) {
        setShowSupplierModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Supplier registration failed');
    }
  };

  const filteredOrders = orders.filter(ord => {
    const term = search.toLowerCase();
    return (
      (ord.orderNumber && ord.orderNumber.toLowerCase().includes(term)) ||
      (ord._id && ord._id.toLowerCase().includes(term)) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(term)) ||
      (ord.type && ord.type.toLowerCase().includes(term)) ||
      (ord.paymentMethod && ord.paymentMethod.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-100">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-blue-400" />
            <span>Order History</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time track and manage all customer order records, payment methods, and daily order sequence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition border border-slate-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-blue-400" />
            <span>Refresh</span>
          </button>
          <Link
            to="/pos"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Customer Order History ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'stock'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Stock Audit Movements ({movements.length})</span>
        </button>
      </div>

      {/* TAB 1: ORDER HISTORY TABLE */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, customer name, type, method..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Table Container */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-500 font-bold text-xs tracking-wider uppercase">
                    <th className="py-4 px-6">Today Order #</th>
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Total</th>
                    <th className="py-4 px-6">Method</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-400" />
                        No order history records found. Create an order on the POS page.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => {
                      const displayId = ord._id.length > 8 ? ord._id.slice(-6).toUpperCase() : ord._id;
                      const orderTypeLabel = ord.type === 'TAKEAWAY' ? 'TAKEAWAY' : 'WALK-IN';

                      return (
                        <tr
                          key={ord._id}
                          onClick={() => setSelectedOrder(ord)}
                          className="hover:bg-slate-800/40 transition cursor-pointer"
                        >
                          {/* Today Order # */}
                          <td className="py-4 px-6 font-bold text-white">
                            #{ord.todayOrderNo ?? 1}
                          </td>

                          {/* Order ID */}
                          <td className="py-4 px-6 font-mono font-bold text-blue-400">
                            {displayId}
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-6 text-slate-200">
                            {ord.customerName || 'Walk-in Customer'}
                          </td>

                          {/* Type */}
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                              ord.type === 'TAKEAWAY'
                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                : 'bg-lime-500/10 text-lime-400 border border-lime-500/20'
                            }`}>
                              {orderTypeLabel}
                            </span>
                          </td>

                          {/* Total */}
                          <td className="py-4 px-6 font-bold text-white">
                            {currencySymbol}{ord.grandTotal.toFixed(2)}
                          </td>

                          {/* Method */}
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                              ord.paymentMethod === 'UPI'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : ord.paymentMethod === 'Card'
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {ord.paymentMethod || 'Cash'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                              {ord.status || 'DELIVERED'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteOrder(ord._id, e)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                                title="Delete Order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK AUDIT MOVEMENTS */}
      {activeTab === 'stock' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-400" />
              <span>Stock Movements Audit Trail</span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSupplierModal(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
              >
                + Supplier
              </button>
              <button
                onClick={() => {
                  if (products.length > 0) setAdjustData(prev => ({ ...prev, productId: products[0]._id }));
                  setShowAdjustModal(true);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
              >
                Adjust Stock
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase text-slate-500 bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-5">Date & Time</th>
                  <th className="py-4 px-5">Product Name</th>
                  <th className="py-4 px-5">Type</th>
                  <th className="py-4 px-5">Stock Change</th>
                  <th className="py-4 px-5">Previous ➔ New</th>
                  <th className="py-4 px-5">Notes / Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">No stock movements recorded yet.</td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-4 px-5 text-xs text-slate-400">{new Date(m.createdAt).toLocaleString()}</td>
                      <td className="py-4 px-5 font-bold text-white">{m.productId?.name || 'Deleted Product'}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          m.type === 'SALE' ? 'bg-blue-500/10 text-blue-400' :
                          m.type === 'PURCHASE' ? 'bg-emerald-500/10 text-emerald-400' :
                          m.type === 'RETURN' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-extrabold">
                        <span className={m.quantityDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono text-xs text-slate-400">{m.previousStock} ➔ <strong className="text-white">{m.newStock}</strong></td>
                      <td className="py-4 px-5 text-xs text-slate-400 truncate max-w-xs">{m.notes || m.referenceId || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3 gap-3">
              <div className="flex items-center gap-3">
                {/* Print & Share Buttons Top Left */}
                <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => handlePrintOrder(selectedOrder)}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition"
                    title="Print Order Bill"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareOrder(selectedOrder)}
                    className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                    title="Share Order Bill"
                  >
                    <Share2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Share</span>
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-white leading-tight">
                    Order #{selectedOrder._id.slice(-6).toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(selectedOrder.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white font-bold p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <div>
                  <span className="text-xs text-slate-400 block">Customer</span>
                  <span className="font-semibold text-white">
                    {selectedOrder.customerName || 'Walk-in Customer'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Order Type</span>
                  <span className="font-semibold text-white">{selectedOrder.type}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Payment Method</span>
                  <span className="font-semibold text-white">
                    {selectedOrder.paymentMethod || 'Cash'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Status</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Order Items</h4>
                <div className="divide-y divide-slate-800/80">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-white">{item.productName}</p>
                        <p className="text-xs text-slate-400">
                          {item.quantity} x {currencySymbol}{item.unitPrice}
                        </p>
                      </div>
                      <span className="font-bold text-white">
                        {currencySymbol}{item.itemTotal || item.quantity * item.unitPrice}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Totals */}
              <div className="border-t border-slate-800 pt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span>{currencySymbol}{selectedOrder.subtotal || selectedOrder.grandTotal}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>GST / Tax</span>
                  <span>{currencySymbol}{selectedOrder.taxTotal || 0}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Paid</span>
                  <span className="text-emerald-400">
                    {currencySymbol}{selectedOrder.grandTotal}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Manual Stock Adjustment</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Product</label>
                <select
                  value={adjustData.productId}
                  onChange={(e) => setAdjustData({ ...adjustData, productId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (Current Stock: {p.currentStock})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Movement Type</label>
                  <select
                    value={adjustData.type}
                    onChange={(e) => setAdjustData({ ...adjustData, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="PURCHASE">PURCHASE (+)</option>
                    <option value="ADJUSTMENT">ADJUSTMENT (+/-)</option>
                    <option value="RETURN">RETURN (+)</option>
                    <option value="WASTE">WASTE (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Quantity Delta</label>
                  <input
                    type="number"
                    required
                    value={adjustData.quantityDelta}
                    onChange={(e) => setAdjustData({ ...adjustData, quantityDelta: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Reason</label>
                <input
                  type="text"
                  value={adjustData.notes}
                  onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
                  placeholder="Restock from main supplier / Damaged box..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20">
                Submit Stock Movement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Add Supplier Record</h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Supplier Company Name</label>
                <input
                  type="text"
                  required
                  value={supplierData.name}
                  onChange={(e) => setSupplierData({ ...supplierData, name: e.target.value })}
                  placeholder="Global Dairy & Ingredients Co."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={supplierData.phone}
                    onChange={(e) => setSupplierData({ ...supplierData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    value={supplierData.gstin}
                    onChange={(e) => setSupplierData({ ...supplierData, gstin: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20">
                Save Supplier
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
