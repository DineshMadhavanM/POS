import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StockMovement, Product, Supplier } from '../types';
import { Boxes, ArrowUpRight, ArrowDownLeft, Plus, RefreshCw, AlertCircle, Loader2, X } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

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

  const loadData = async () => {
    try {
      const [mRes, pRes, sRes] = await Promise.all([
        api.get('/inventory/movements'),
        api.get('/products'),
        api.get('/suppliers')
      ]);
      if (mRes.data.success) setMovements(mRes.data.data);
      if (pRes.data.success) setProducts(pRes.data.data);
      if (sRes.data.success) setSuppliers(sRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) return <div className="flex items-center justify-center h-full text-slate-400"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Inventory & Stock Movements</h1>
          <p className="text-sm text-slate-400 mt-1">Audit trail for stock entries, purchases, waste, and supplier management</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700 transition"
          >
            + Supplier
          </button>
          <button
            onClick={() => {
              if (products.length > 0) setAdjustData(prev => ({ ...prev, productId: products[0]._id }));
              setShowAdjustModal(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Adjust Stock</span>
          </button>
        </div>
      </div>

      {/* Stock Movement Audit Log Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-400" />
            <span>Stock Audit Trail</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Last 100 Movements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase text-slate-500 bg-slate-900/90 border-b border-slate-800">
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
