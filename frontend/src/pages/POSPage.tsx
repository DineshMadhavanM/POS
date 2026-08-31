import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Product, Category, Customer } from '../types';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  CreditCard,
  QrCode,
  Banknote,
  Printer,
  CheckCircle2,
  X,
  Loader2,
  Percent,
  Receipt
} from 'lucide-react';

export const POSPage: React.FC = () => {
  const { organization } = useAuthStore();
  const cart = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<Array<{ method: 'CASH' | 'UPI' | 'CARD'; amount: number }>>([
    { method: 'CASH', amount: 0 }
  ]);

  const [completedInvoice, setCompletedInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const currencySymbol = organization?.currency === 'USD' ? '$' : '₹';

  // Load products, categories, customers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, custRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
          api.get('/customers')
        ]);
        if (prodRes.data.success) setProducts(prodRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (custRes.data.success) setCustomers(custRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Barcode scanner submission
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const found = products.find(p => p.barcode === barcodeInput.trim() || p.sku === barcodeInput.trim());
    if (found) {
      cart.addItem(found);
      setBarcodeInput('');
    } else {
      alert(`No product found matching barcode "${barcodeInput}"`);
    }
  };

  // Filter products by category & search
  const filteredProducts = products.filter(p => {
    const matchesCategory = !selectedCategoryId || (typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId) === selectedCategoryId;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode?.includes(searchQuery) || p.sku?.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Open Checkout
  const handleOpenCheckout = () => {
    if (cart.items.length === 0) return;
    setPaymentMethods([{ method: 'CASH', amount: cart.getGrandTotal() }]);
    setShowCheckoutModal(true);
  };

  // Process Final Order & Invoice Checkout
  const handleFinalizeCheckout = async () => {
    setCheckoutLoading(true);
    try {
      // 1. Create Draft Order
      const orderPayload = {
        type: cart.orderType,
        tableId: cart.selectedTableId || undefined,
        tableNumber: cart.selectedTableNumber || undefined,
        customerId: cart.selectedCustomer?._id || undefined,
        customerName: cart.selectedCustomer?.name || undefined,
        customerPhone: cart.selectedCustomer?.phoneNumber || undefined,
        items: cart.items.map(item => ({
          productId: item.product._id,
          productName: item.product.name,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          taxRate: item.taxRate,
          selectedModifiers: item.selectedModifiers,
          itemTotal: item.itemTotal
        })),
        subtotal: cart.getSubtotal(),
        taxTotal: cart.getTaxTotal(),
        discountTotal: cart.getDiscountTotal(),
        grandTotal: cart.getGrandTotal(),
        notes: cart.notes
      };

      const orderRes = await api.post('/pos/orders', orderPayload);
      if (!orderRes.data.success) throw new Error('Failed to create order');

      const order = orderRes.data.data;

      // 2. Checkout Invoice
      const checkoutRes = await api.post('/pos/checkout', {
        orderId: order._id,
        paymentDetails: paymentMethods
      });

      if (checkoutRes.data.success) {
        setCompletedInvoice(checkoutRes.data.data.invoice);
        setShowCheckoutModal(false);
        setShowReceiptModal(true);
        cart.clearCart();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 overflow-hidden">
      {/* LEFT: Product Catalog & Search Bar */}
      <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
        {/* Top Controls: Search Bar & Barcode Scanner Simulation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name, SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <form onSubmit={handleBarcodeSubmit} className="relative">
            <Barcode className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan barcode & hit Enter..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </form>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryId('')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition ${
              !selectedCategoryId ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategoryId(cat._id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition ${
                selectedCategoryId === cat._id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pr-1">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500">
              No products found matching filters.
            </div>
          ) : (
            filteredProducts.map((p) => (
              <button
                key={p._id}
                onClick={() => cart.addItem(p)}
                className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 text-left flex flex-col justify-between group transition duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-mono text-slate-500">{p.sku || p.barcode || 'N/A'}</span>
                    {!p.isService && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        p.currentStock <= p.minimumStock ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        Stock: {p.currentStock}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm line-clamp-2 group-hover:text-blue-400 transition">{p.name}</h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-base font-extrabold text-blue-400">
                    {currencySymbol}{p.sellingPrice.toFixed(2)}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Live POS Cart Panel */}
      <div className="w-full lg:w-96 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
        {/* Cart Header & Customer selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-400" />
              <span>Current Cart</span>
            </h3>
            <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full font-semibold">
              {cart.items.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>

          {/* Customer attachment bar */}
          <div className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <UserPlus className="w-4 h-4 text-blue-400" />
              <span className="font-medium">
                {cart.selectedCustomer ? cart.selectedCustomer.name : 'Walk-in Customer'}
              </span>
            </div>
            <button
              onClick={() => setShowCustomerModal(true)}
              className="text-blue-400 hover:underline font-semibold"
            >
              {cart.selectedCustomer ? 'Change' : '+ Customer'}
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 my-3 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center">
              <Receipt className="w-8 h-8 text-slate-600 mb-2" />
              <span>Cart is empty. Tap items on catalog to add to bill.</span>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.product._id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
                <div className="flex-1 pr-2">
                  <h5 className="font-semibold text-white text-xs">{item.product.name}</h5>
                  <p className="text-xs text-blue-400 font-mono mt-0.5">
                    {currencySymbol}{item.unitPrice.toFixed(2)} × {item.quantity} = {currencySymbol}{item.itemTotal.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => cart.updateQuantity(item.product._id, -1)}
                    className="p-1 text-slate-400 hover:text-white bg-slate-700 rounded-md"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-white w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => cart.updateQuantity(item.product._id, 1)}
                    className="p-1 text-slate-400 hover:text-white bg-slate-700 rounded-md"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => cart.removeItem(item.product._id)}
                    className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-md ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout Actions */}
        <div className="border-t border-slate-800 pt-3 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Subtotal:</span>
            <span>{currencySymbol}{cart.getSubtotal().toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-xs text-slate-400">
            <span>Tax ({organization?.taxRateDefault || 0}%):</span>
            <span>{currencySymbol}{cart.getTaxTotal().toFixed(2)}</span>
          </div>

          {cart.getDiscountTotal() > 0 && (
            <div className="flex justify-between text-xs text-emerald-400">
              <span>Discount Applied:</span>
              <span>-{currencySymbol}{cart.getDiscountTotal().toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
            <span>Grand Total:</span>
            <span className="text-blue-400">{currencySymbol}{cart.getGrandTotal().toFixed(2)}</span>
          </div>

          <button
            onClick={handleOpenCheckout}
            disabled={cart.items.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay & Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* MODAL: Customer Selector */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base">Select Customer</h3>
              <button onClick={() => setShowCustomerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  cart.setCustomer(null);
                  setShowCustomerModal(false);
                }}
                className="w-full p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-left text-xs font-semibold text-slate-300"
              >
                Walk-in Customer (Guest)
              </button>
              {customers.map((c) => (
                <button
                  key={c._id}
                  onClick={() => {
                    cart.setCustomer(c);
                    setShowCustomerModal(false);
                  }}
                  className="w-full p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-left flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-white text-xs">{c.name}</p>
                    <p className="text-[10px] text-slate-400">{c.phoneNumber}</p>
                  </div>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                    {c.loyaltyPoints} Points
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Split Checkout */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg p-6 rounded-3xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-lg">Checkout Payment</h3>
                <p className="text-xs text-slate-400">Total Payable: {currencySymbol}{cart.getGrandTotal().toFixed(2)}</p>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { method: 'CASH', label: 'Cash', icon: Banknote },
                  { method: 'UPI', label: 'UPI QR', icon: QrCode },
                  { method: 'CARD', label: 'Card', icon: CreditCard }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = paymentMethods[0]?.method === item.method;
                  return (
                    <button
                      key={item.method}
                      onClick={() => setPaymentMethods([{ method: item.method as any, amount: cart.getGrandTotal() }])}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition ${
                        isSelected ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold' : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleFinalizeCheckout}
              disabled={checkoutLoading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
            >
              {checkoutLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirm Payment & Issue Receipt</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Receipt & Print Preview */}
      {showReceiptModal && completedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-3xl space-y-4">
            <div className="text-center border-b border-slate-800 pb-4">
              <h3 className="font-extrabold text-white text-xl">{organization?.businessName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{organization?.address || 'Tax Invoice Receipt'}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold rounded-full">
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
