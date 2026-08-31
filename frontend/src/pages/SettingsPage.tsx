import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Settings, Shield, CreditCard, Building2, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { organization } = useAuthStore();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Organization & Subscription Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage tenant workspace details, billing tier, and active feature flags</p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          <span>Tenant Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <span className="text-xs text-slate-500 block uppercase">Business Name</span>
            <span className="font-semibold text-white">{organization?.businessName}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase">Industry Module Type</span>
            <span className="font-semibold text-blue-400">{organization?.businessType}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase">Currency</span>
            <span className="font-semibold text-white">{organization?.currency}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase">GSTIN / Tax Registration</span>
            <span className="font-mono text-slate-400">{organization?.gstin || 'Not configured'}</span>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <span>SaaS Subscription Plan</span>
          </h3>
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold font-mono rounded-full border border-indigo-500/30">
            {organization?.subscriptionPlan || 'FREE_TRIAL'}
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Your workspace is currently on the <strong>{organization?.subscriptionPlan || 'FREE_TRIAL'}</strong> tier. Enjoy full access to multi-tenant isolation, inventory controls, POS billing, and AI business queries.
        </p>
      </div>
    </div>
  );
};
