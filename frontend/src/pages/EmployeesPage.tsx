import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Employee, UserRole } from '../types';
import { UserCheck, UserPlus, Shield, Mail, CheckCircle2, Loader2, X, ShieldCheck, Building2, Key } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { organization } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ companyId: string; employeeId: string; pass: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'CASHIER' as UserRole | string,
    password: 'EmpPass2026!'
  });

  const loadEmployees = async () => {
    try {
      const res = await api.get('/employees');
      if (res.data.success) setEmployees(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/employees', formData);
      if (res.data.success) {
        const empData = res.data.data;
        setShowAddModal(false);
        setCreatedCredentials({
          companyId: organization?.companyId || 'NX-REST-10001',
          employeeId: empData.employeeId || 'EMP-0001',
          pass: formData.password
        });
        setFormData({ name: '', email: '', role: 'CASHIER', password: 'EmpPass2026!' });
        loadEmployees();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add employee');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-slate-400"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-mono font-bold uppercase mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Company ID: {organization?.companyId || 'NX-REST-10001'}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Employee Directory & Role Access</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage employee access credentials, roles, and terminal permissions</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Created Credentials Modal / Alert */}
      {createdCredentials && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-emerald-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">Employee Account Created Successfully!</p>
              <p className="mt-0.5 text-slate-300">Share these login details with your staff member:</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 font-mono text-xs">
                <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400">Company ID: <strong>{createdCredentials.companyId}</strong></span>
                <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400">Employee ID: <strong>{createdCredentials.employeeId}</strong></span>
                <span className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400">Password: <strong>{createdCredentials.pass}</strong></span>
              </div>
            </div>
          </div>
          <button onClick={() => setCreatedCredentials(null)} className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 rounded-xl font-bold text-white transition self-start sm:self-center">
            Dismiss
          </button>
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase text-slate-500 bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="py-4 px-5">Employee ID</th>
                <th className="py-4 px-5">Staff Name</th>
                <th className="py-4 px-5">Email Address</th>
                <th className="py-4 px-5">Role</th>
                <th className="py-4 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">No employees added yet. Click "Add Employee" to grant terminal credentials.</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-5 font-mono text-xs font-bold text-blue-400">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-slate-500" />
                        <span>{emp.employeeId || 'EMP-0001'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-bold text-white flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center border border-blue-500/30">
                        {emp.userId?.name ? emp.userId.name.charAt(0).toUpperCase() : 'E'}
                      </div>
                      <span>{emp.userId?.name || 'Staff Member'}</span>
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-400">{emp.userId?.email || emp.invitedEmail || 'N/A'}</td>
                    <td className="py-4 px-5">
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold rounded-full">
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        emp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Add Employee to Workspace</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Arun Cashier"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Work Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="arun@restaurant.com"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assign Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="MANAGER">MANAGER (Operations & Inventory)</option>
                  <option value="CASHIER">CASHIER (POS Billing Counter)</option>
                  <option value="KITCHEN_STAFF">KITCHEN STAFF (Kitchen Display KDS Board)</option>
                  <option value="INVENTORY_STAFF">INVENTORY STAFF (Stock Updates)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Initial Terminal Password</label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Staff will use this password alongside Company ID ({organization?.companyId || 'NX-REST-10001'}) to log in.</p>
              </div>

              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition">
                Create Employee & Issue Credentials
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
