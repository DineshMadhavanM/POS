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
  const [showMobileCart, setShowMobileCart] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<Array<{ method: 'CASH' | 'UPI' | 'CARD'; amount: number }>>([
    { method: 'UPI', amount: 0 }
  ]);

  const [custNameInput, setCustNameInput] = useState('');
  const [custPhoneInput, setCustPhoneInput] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [discountMode, setDiscountMode] = useState<'pct' | 'amt'>('pct');

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
    setCustNameInput(cart.selectedCustomer?.name || '');
    setCustPhoneInput(cart.selectedCustomer?.phoneNumber || '');
    setSelectedPaymentMethod('UPI');
    setPaymentMethods([{ method: 'UPI', amount: cart.getGrandTotal() }]);
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
        customerName: custNameInput || cart.selectedCustomer?.name || 'Walk-in Customer',
        customerPhone: custPhoneInput || cart.selectedCustomer?.phoneNumber || '',
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
        paymentDetails: [{ method: selectedPaymentMethod, amount: cart.getGrandTotal() }]
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
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pr-1 items-start content-start">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500">
              No products found matching filters.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const itemInCart = cart.items.find(i => i.product._id === p._id);
              const qtyInCart = itemInCart ? itemInCart.quantity : 0;

              return (
                <div
                  key={p._id}
                  onClick={() => cart.addItem(p)}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between cursor-pointer transition-all duration-200 group shadow-xl relative overflow-hidden self-start min-h-[140px] ${
                    qtyInCart > 0
                      ? 'bg-slate-900 border-blue-500/60 ring-1 ring-blue-500/30'
                      : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-blue-500/40'
                  }`}
                >
                  {/* Quantity Badge if in cart */}
                  {qtyInCart > 0 && (
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] shadow-md flex items-center gap-1">
                      <span>{qtyInCart} in cart</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-mono text-slate-500">{p.sku || p.barcode || 'ITEM'}</span>
                      {!p.isService && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          p.currentStock <= p.minimumStock ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          Stock: {p.currentStock}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-white text-sm line-clamp-2 group-hover:text-blue-400 transition leading-snug">{p.name}</h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Price</span>
                      <span className="text-base font-extrabold text-blue-400 font-mono">
                        {currencySymbol}{p.sellingPrice.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cart.addItem(p);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition ${
                        qtyInCart > 0
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                          : 'bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{qtyInCart > 0 ? 'Add More' : 'Add'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: Live POS Cart Panel (Desktop) */}
      <div className="hidden lg:flex w-96 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex-col justify-between shadow-2xl backdrop-blur-xl">
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

      {/* Flutter-style Mobile Floating Cart Summary Bar */}
      {cart.items.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-3 right-3 z-20 bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-2xl flex items-center justify-between text-white border border-blue-400/30 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs">
              {cart.items.reduce((s, i) => s + i.quantity, 0)}
            </div>
            <div>
              <span className="text-[11px] text-blue-100 block leading-none">Cart Total</span>
              <span className="text-sm font-black font-mono">{currencySymbol}{cart.getGrandTotal().toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => setShowMobileCart(true)}
            className="px-3.5 py-2 bg-white text-blue-600 font-bold rounded-xl text-xs shadow-md active:scale-95 transition"
          >
            View Cart ({currencySymbol}{cart.getGrandTotal().toFixed(2)}) →
          </button>
        </div>
      )}

      {/* Flutter-style Mobile Slide-up Bottom Sheet Cart Modal */}
      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end p-0">
          <div
            onClick={() => setShowMobileCart(false)}
            className="flex-1 w-full"
          />
          <div className="bg-slate-900 border-t border-slate-700 w-full max-h-[85vh] rounded-t-3xl p-5 flex flex-col justify-between shadow-2xl animate-slide-up pb-safe">
            {/* Sheet Handle */}
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                <span>Your Order Cart</span>
              </h3>
              <button
                onClick={() => setShowMobileCart(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 my-3 overflow-y-auto max-h-60 space-y-2 pr-1">
              {cart.items.map((item) => (
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
              ))}
            </div>

            {/* Totals & Checkout */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <div className="flex justify-between text-base font-extrabold text-white">
                <span>Grand Total:</span>
                <span className="text-blue-400">{currencySymbol}{cart.getGrandTotal().toFixed(2)}</span>
              </div>

              <button
                onClick={() => {
                  setShowMobileCart(false);
                  handleOpenCheckout();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Pay</span>
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* MODAL: Checkout */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-3xl space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-xl">Checkout</h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Order Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cart.setOrderType('RETAIL_SALE')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition border ${
                    cart.orderType === 'RETAIL_SALE'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  Walk-in
                </button>
                <button
                  type="button"
                  onClick={() => cart.setOrderType('TAKEAWAY')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition border ${
                    cart.orderType === 'TAKEAWAY'
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
                      onClick={() => {
                        setSelectedPaymentMethod(item.method as any);
                        setPaymentMethods([{ method: item.method as any, amount: cart.getGrandTotal() }]);
                      }}
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

            {/* Itemized Cart Items Summary */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 space-y-2 max-h-36 overflow-y-auto">
              {cart.items.length === 0 ? (
                <div className="text-xs text-slate-400 flex justify-between items-center">
                  <span>Triple chocolate brownie × 1</span>
                  <span className="font-bold text-white">₹79</span>
                </div>
              ) : (
                cart.items.map((item) => (
                  <div key={item.product._id} className="flex justify-between items-center text-xs">
                    <span className="text-slate-200 font-medium">{item.product.name} × {item.quantity}</span>
                    <span className="text-white font-bold">{currencySymbol}{item.itemTotal.toFixed(0)}</span>
                  </div>
                ))
              )}
            </div>

            {/* Subtotal, Discount & Total */}
            <div className="space-y-2.5 text-xs pt-1 border-t border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200 font-bold">{currencySymbol}{cart.getSubtotal().toFixed(2)}</span>
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
                    value={discountMode === 'pct' ? (cart.discountPercentage || '') : (cart.discountAmount || '')}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      if (discountMode === 'pct') {
                        cart.setDiscountPercentage(val);
                      } else {
                        cart.setDiscountAmount(val);
                      }
                    }}
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
                        cart.setDiscountPercentage(pct);
                      }}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold border transition ${
                        cart.discountPercentage === pct && discountMode === 'pct'
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
                <span className="text-emerald-400 font-mono text-base">{currencySymbol}{cart.getGrandTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Confirm Payment Button */}
            <button
              onClick={handleFinalizeCheckout}
              disabled={checkoutLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
            >
              {checkoutLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Confirm Payment · {currencySymbol}{cart.getGrandTotal().toFixed(2)}</span>
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
