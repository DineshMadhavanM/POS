import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RestaurantTable, KOTTicket } from '../types';
import { UtensilsCrossed, Plus, Clock, CheckCircle2, AlertCircle, Loader2, X, Check, Ban, Trash2 } from 'lucide-react';

export const RestaurantPage: React.FC = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [kotTickets, setKotTickets] = useState<KOTTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTableModal, setShowAddTableModal] = useState(false);

  const [tableData, setTableData] = useState({ tableNumber: 'T-01', capacity: 4 });

  const loadData = async () => {
    try {
      const [tRes, kRes] = await Promise.all([
        api.get('/restaurant/tables'),
        api.get('/restaurant/kot')
      ]);
      if (tRes.data.success) setTables(tRes.data.data);
      if (kRes.data.success) setKotTickets(kRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/restaurant/tables', tableData);
      if (res.data.success) {
        setShowAddTableModal(false);
        setTableData({ tableNumber: `T-0${tables.length + 2}`, capacity: 4 });
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create table');
    }
  };

  const handleDeleteTable = async (id: string, tableNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete Table ${tableNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.delete(`/restaurant/tables/${id}`);
      if (res.data.success) {
        setTables((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete table');
    }
  };

  const handleUpdateTableStatus = async (id: string, status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED') => {
    // Optimistic UI Update: Immediately change full box color
    setTables((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status } : t))
    );

    try {
      await api.put(`/restaurant/tables/${id}/status`, { status });
    } catch (err) {
      console.error('Failed to update table status', err);
      loadData(); // revert on failure
    }
  };

  const handleUpdateKOTStatus = async (id: string, status: string) => {
    try {
      await api.put(`/restaurant/kot/${id}/status`, { status });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-slate-400"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-8">
      {/* SECTION 1: Interactive Table Management Floor Map */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-emerald-400" />
              <span>Restaurant & Cafe Floor Map</span>
            </h1>
            <p className="text-sm text-slate-400">Live seating availability layout. Click <strong>Green</strong> for Available or <strong>Red</strong> for Occupied</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-xs bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl font-bold">
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Green: Available</span>
              <span className="flex items-center gap-1 text-rose-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Red: Occupied</span>
            </div>

            <button
              onClick={() => setShowAddTableModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Table</span>
            </button>
          </div>
        </div>

        {/* Floor Map Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {tables.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/60 rounded-3xl border border-slate-800">
              No floor tables added yet. Click "Add Table" to set up floor layout.
            </div>
          ) : (
            tables.map((t) => {
              const isAvailable = t.status === 'AVAILABLE';
              const isOccupied = t.status === 'OCCUPIED';
              const isReserved = t.status === 'RESERVED';

              return (
                <div
                  key={t._id}
                  className={`p-5 rounded-3xl border-2 flex flex-col justify-between transition-all duration-300 shadow-xl ${
                    isAvailable
                      ? 'bg-gradient-to-b from-emerald-950/90 via-emerald-900/40 to-slate-950 border-emerald-500/80 shadow-emerald-500/20 text-emerald-100'
                      : isOccupied
                      ? 'bg-gradient-to-b from-rose-950/90 via-rose-900/40 to-slate-950 border-rose-500/80 shadow-rose-500/20 text-rose-100'
                      : 'bg-gradient-to-b from-amber-950/90 via-amber-900/40 to-slate-950 border-amber-500/80 shadow-amber-500/20 text-amber-100'
                  }`}
                >
                  {/* Table Header */}
                  <div className="flex items-center justify-between w-full border-b border-white/10 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-black tracking-wider text-white uppercase">{t.tableNumber}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTable(t._id, t.tableNumber);
                        }}
                        className="p-1 text-white/50 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition"
                        title="Delete Table"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border shadow-sm ${
                        isAvailable
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                          : isOccupied
                          ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                      }`}
                    >
                      {isAvailable ? 'AVAILABLE ✓' : isOccupied ? 'OCCUPIED ✕' : 'RESERVED'}
                    </span>
                  </div>

                  {/* Seating Details */}
                  <div className="text-center my-3">
                    <span className="text-3xl font-black text-white tracking-tight drop-shadow">{t.capacity}</span>
                    <span className="block text-xs uppercase font-bold text-slate-300 tracking-wider mt-0.5">Seats Capacity</span>
                  </div>

                  {/* Green & Red Color Toggle Buttons */}
                  <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateTableStatus(t._id, 'AVAILABLE')}
                      className={`py-2 px-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 transition shadow-lg ${
                        isAvailable
                          ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 scale-105 shadow-emerald-500/40'
                          : 'bg-emerald-950/80 hover:bg-emerald-600 text-emerald-300 border border-emerald-500/50'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>GREEN</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateTableStatus(t._id, 'OCCUPIED')}
                      className={`py-2 px-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 transition shadow-lg ${
                        isOccupied
                          ? 'bg-rose-600 text-white ring-2 ring-rose-300 scale-105 shadow-rose-500/40'
                          : 'bg-rose-950/80 hover:bg-rose-600 text-rose-300 border border-rose-500/50'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>RED</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 2: Kitchen Display System (KDS) Live Tickets Board */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Kitchen Display System (KDS)</h2>
          <p className="text-sm text-slate-400">Incoming Kitchen Order Tickets (KOT) with live preparation state</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['PENDING', 'PREPARING', 'READY'].map((statusKey) => {
            const ticketsInStatus = kotTickets.filter(k => k.status === statusKey);
            return (
              <div key={statusKey} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      statusKey === 'PENDING' ? 'bg-amber-400' : statusKey === 'PREPARING' ? 'bg-blue-400' : 'bg-emerald-400'
                    }`}></span>
                    <span>{statusKey}</span>
                  </h3>
                  <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full font-bold">
                    {ticketsInStatus.length}
                  </span>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {ticketsInStatus.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No orders in {statusKey} queue.</p>
                  ) : (
                    ticketsInStatus.map((ticket) => (
                      <div key={ticket._id} className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-3 shadow">
                        <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                          <span className="font-mono text-xs font-bold text-blue-400">{ticket.orderNumber}</span>
                          <span className="text-xs font-semibold text-slate-300">Table: {ticket.tableNumber}</span>
                        </div>

                        <ul className="space-y-1 text-xs text-slate-200">
                          {ticket.items.map((item, i) => (
                            <li key={i} className="flex justify-between font-medium">
                              <span>{item.quantity}x {item.productName}</span>
                              {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                                <span className="text-[10px] text-amber-400">({item.selectedModifiers.map(m => m.name).join(', ')})</span>
                              )}
                            </li>
                          ))}
                        </ul>

                        {statusKey === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateKOTStatus(ticket._id, 'PREPARING')}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20"
                          >
                            Start Preparing ➔
                          </button>
                        )}
                        {statusKey === 'PREPARING' && (
                          <button
                            onClick={() => handleUpdateKOTStatus(ticket._id, 'READY')}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20"
                          >
                            Mark Ready ➔
                          </button>
                        )}
                        {statusKey === 'READY' && (
                          <button
                            onClick={() => handleUpdateKOTStatus(ticket._id, 'SERVED')}
                            className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl text-xs"
                          >
                            Mark Served ✓
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add Table */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Add Floor Table</h3>
              <button onClick={() => setShowAddTableModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Table Code / Number</label>
                <input
                  type="text"
                  required
                  value={tableData.tableNumber}
                  onChange={(e) => setTableData({ ...tableData, tableNumber: e.target.value })}
                  placeholder="e.g. T-01"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={tableData.capacity}
                  onChange={(e) => setTableData({ ...tableData, capacity: parseInt(e.target.value) || 2 })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition">
                Save Floor Table
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
