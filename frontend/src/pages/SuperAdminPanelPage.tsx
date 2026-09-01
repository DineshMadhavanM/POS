import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  ShieldCheck,
  Building2,
  Utensils,
  Cake,
  Barcode,
  Users,
  Search,
  Download,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Package,
  ShoppingCart,
  ExternalLink,
  Loader2,
  Store,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';

export const SuperAdminPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  useEffect(() => {
    const fetchRegistry = async () => {
      try {
        setLoading(true);
        const res = await api.get('/super-admin/tenants');
        if (res.data.success) {
          setTenants(res.data.data.tenants || []);
          setStats(res.data.data.stats || {});
        }
      } catch (err) {
        console.error('Failed to load super admin tenant registry:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistry();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminUser');
    navigate('/');
  };

  // Export Registered Shops to CSV
  const handleExportCSV = () => {
    if (tenants.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "NEXSTACK POS - SUPER ADMIN MASTER REGISTERED SHOPS DIRECTORY\n\n";
    csvContent += "Company ID,Shop / Business Name,Category,Admin Owner Name,Admin Email,Admin Phone Number,Products Count,Orders Count,Registered Date\n";

    tenants.forEach((t) => {
      const regDate = new Date(t.createdAt).toLocaleDateString();
      csvContent += `"${t.companyId}","${t.shopName}","${t.businessType}","${t.adminName}","${t.adminEmail}","${t.adminPhone}",${t.productsCount},${t.ordersCount},"${regDate}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Master_Tenants_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter tenants based on search query & business category
  const filteredTenants = tenants.filter((t) => {
    const matchesCategory = selectedCategory === 'ALL' || t.businessType === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.shopName.toLowerCase().includes(q) ||
      t.companyId.toLowerCase().includes(q) ||
      t.adminName.toLowerCase().includes(q) ||
      t.adminEmail.toLowerCase().includes(q) ||
      t.adminPhone.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (type: string) => {
    switch (type) {
      case 'RESTAURANT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Utensils className="w-3 h-3" />
            <span>Restaurant</span>
          </span>
        );
      case 'CAFE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Utensils className="w-3 h-3" />
            <span>Cafe</span>
          </span>
        );
      case 'BAKERY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/10 border border-pink-500/30 text-pink-400">
            <Cake className="w-3 h-3" />
            <span>Bakery</span>
          </span>
        );
      case 'RETAIL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Barcode className="w-3 h-3" />
            <span>Retail</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Store className="w-3 h-3" />
            <span>{type}</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Super Admin Top Header */}
      <header className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-8 py-4 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-xl text-white tracking-tight leading-tight">
                  Super Admin Panel
                </h1>
                <span className="hidden xs:inline-block px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-bold uppercase">
                  Root
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">Master Registered Shops & Business Directory</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export Directory</span>
              <span className="sm:hidden">Export</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Panel</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* KPI Master Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Shops</span>
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xl sm:text-3xl font-black text-white">{stats?.totalShops || tenants.length}</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Restaurants</span>
              <Utensils className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xl sm:text-3xl font-black text-emerald-400">{stats?.totalRestaurants || 0}</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Cafes</span>
              <Utensils className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xl sm:text-3xl font-black text-amber-400">{stats?.totalCafes || 0}</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Bakeries</span>
              <Cake className="w-4 h-4 text-pink-400" />
            </div>
            <span className="text-xl sm:text-3xl font-black text-pink-400">{stats?.totalBakeries || 0}</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Retail</span>
              <Barcode className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xl sm:text-3xl font-black text-purple-400">{stats?.totalRetail || 0}</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-xl sm:text-3xl font-black text-sky-400">{stats?.totalUsers || 0}</span>
          </div>
        </div>

        {/* Search & Category Filter Header */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl sm:rounded-3xl shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by shop name, owner, email, phone, or company ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'ALL', label: 'All Shops' },
                { id: 'RESTAURANT', label: 'Restaurants' },
                { id: 'CAFE', label: 'Cafes' },
                { id: 'BAKERY', label: 'Bakeries' },
                { id: 'RETAIL', label: 'Retail' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Directory Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-72 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <p className="text-xs sm:text-sm font-medium">Loading registered shops directory...</p>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-2">
            <Store className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No Registered Shops Found</h4>
            <p className="text-xs text-slate-400">No registered business matched your search query or selected filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Shop / Business</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Admin Owner</th>
                    <th className="py-3.5 px-4">Admin Email</th>
                    <th className="py-3.5 px-4">Phone Number</th>
                    <th className="py-3.5 px-4">Products / Orders</th>
                    <th className="py-3.5 px-4">Registered Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTenants.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{t.shopName}</div>
                        <span className="font-mono text-[10px] text-purple-400 font-semibold">{t.companyId}</span>
                      </td>
                      <td className="py-3.5 px-4">{getCategoryBadge(t.businessType)}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{t.adminName}</td>
                      <td className="py-3.5 px-4">
                        <a
                          href={`mailto:${t.adminEmail}`}
                          className="text-blue-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{t.adminEmail}</span>
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <a
                          href={`tel:${t.adminPhone}`}
                          className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{t.adminPhone}</span>
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-semibold text-slate-300">
                            📦 {t.productsCount} items
                          </span>
                          <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-semibold text-slate-300">
                            🧾 {t.ordersCount} orders
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-medium">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedTenant(t)}
                          className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg text-xs font-bold transition border border-purple-500/30 active:scale-95"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Cards View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTenants.map((t) => (
                <div
                  key={t._id}
                  className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{t.shopName}</h4>
                      <span className="font-mono text-[10px] text-purple-400 font-bold">{t.companyId}</span>
                    </div>
                    {getCategoryBadge(t.businessType)}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Admin Owner:</span>
                      <span className="font-bold text-slate-200">{t.adminName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Admin Email:</span>
                      <a href={`mailto:${t.adminEmail}`} className="text-blue-400 font-mono text-[11px] truncate max-w-[200px]">
                        {t.adminEmail}
                      </a>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Phone Number:</span>
                      <a href={`tel:${t.adminPhone}`} className="text-emerald-400 font-mono font-bold text-[11px]">
                        {t.adminPhone}
                      </a>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-400">Activity:</span>
                      <span className="text-slate-300 text-[11px]">
                        {t.productsCount} products • {t.ordersCount} orders
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Registered:</span>
                      <span className="text-slate-400 text-[11px]">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTenant(t)}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md active:scale-95 flex items-center justify-center gap-1.5 mt-2"
                  >
                    <span>Inspect Shop Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Tenant Detailed Inspection Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block font-bold">
                  {selectedTenant.companyId}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">{selectedTenant.shopName}</h3>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Business Category:</span>
                <div>{getCategoryBadge(selectedTenant.businessType)}</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Admin Owner Name:</span>
                <span className="font-bold text-white">{selectedTenant.adminName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Admin Email:</span>
                <a href={`mailto:${selectedTenant.adminEmail}`} className="text-blue-400 font-mono">
                  {selectedTenant.adminEmail}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Admin Phone Number:</span>
                <a href={`tel:${selectedTenant.adminPhone}`} className="text-emerald-400 font-bold font-mono">
                  {selectedTenant.adminPhone}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Shop Address:</span>
                <span className="text-slate-300 truncate max-w-[220px]">{selectedTenant.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tax / GSTIN:</span>
                <span className="font-mono text-slate-300">{selectedTenant.gstin}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Currency Default:</span>
                <span className="font-mono text-slate-300">{selectedTenant.currency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Subscription Status:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase text-[10px]">
                  {selectedTenant.subscriptionStatus} ({selectedTenant.subscriptionPlan})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Products Cataloged:</span>
                <span className="font-bold text-white">{selectedTenant.productsCount} items</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Completed Orders:</span>
                <span className="font-bold text-white">{selectedTenant.ordersCount} orders</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Workspace Registered Date:</span>
                <span className="text-slate-300">{new Date(selectedTenant.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTenant(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
