import React, { useState, useEffect } from 'react';
import { Shield, Settings as SettingsIcon, Save, Check, RefreshCw } from 'lucide-react';

export default function Settings() {
  const [depotName, setDepotName] = useState(() => localStorage.getItem('transitops_depot_name') || 'Gandhinagar Depot GJ4');
  const [currency, setCurrency] = useState(() => localStorage.getItem('transitops_currency') || 'INR (Rs)');
  const [distanceUnit, setDistanceUnit] = useState(() => localStorage.getItem('transitops_distance_unit') || 'Kilometers');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      localStorage.setItem('transitops_depot_name', depotName);
      localStorage.setItem('transitops_currency', currency);
      localStorage.setItem('transitops_distance_unit', distanceUnit);
      setLoading(false);
      
      // Trigger success toast
      setToast({
        type: 'success',
        message: 'Settings updated successfully!'
      });
    }, 800);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const rbacData = [
    { role: 'Fleet Manager', fleet: '✓', driver: '✓', trip: '–', fuelExp: '–', analytics: '✓' },
    { role: 'Dispatcher', fleet: 'view', driver: '–', trip: '✓', fuelExp: '–', analytics: '–' },
    { role: 'Safety Officer', fleet: '–', driver: '✓', trip: 'view', fuelExp: '–', analytics: '–' },
    { role: 'Financial Analyst', fleet: 'view', driver: '–', trip: '–', fuelExp: '✓', analytics: '✓' }
  ];

  const getCellBadge = (val) => {
    if (val === '✓') {
      return (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          ✓
        </span>
      );
    }
    if (val === 'view') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-600 dark:bg-blue-950/45 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30 uppercase tracking-widest text-[9px]">
          view
        </span>
      );
    }
    return (
      <span className="text-slate-300 dark:text-slate-700 font-bold font-mono">
        —
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in relative font-sans">
      
      {/* Toast Alert Popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-100 transition-all duration-300 transform translate-y-0 animate-slide-in">
          <div className="h-5 w-5 bg-brand-500 rounded-full flex items-center justify-center text-white">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Settings</span>
          </h1>
          <p className="text-xs text-slate-400">Configure global depot variables and review platform access control</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: GENERAL SETTINGS */}
        <form onSubmit={handleSave} className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest pb-3 border-b dark:border-slate-850">
              General
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Depot Name
              </label>
              <input
                type="text"
                required
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Gandhinagar Depot GJ4"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Currency
              </label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="INR (Rs)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Distance Unit
              </label>
              <input
                type="text"
                required
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Kilometers"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-brand-500/10 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save changes</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: ROLE-BASED ACCESS (RBAC) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest pb-3 border-b dark:border-slate-850 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Role-Based Access (RBAC)</span>
            </h2>
          </div>

          <div className="overflow-x-auto text-slate-800 dark:text-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-105 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">Fleet</th>
                  <th className="py-3 px-4 text-center">Driver</th>
                  <th className="py-3 px-4 text-center">Trip</th>
                  <th className="py-3 px-4 text-center">Fuel/Exp.</th>
                  <th className="py-3 px-4 text-center">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {rbacData.map((row) => (
                  <tr key={row.role} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white">{row.role}</td>
                    <td className="py-4 px-4 text-center">{getCellBadge(row.fleet)}</td>
                    <td className="py-4 px-4 text-center">{getCellBadge(row.driver)}</td>
                    <td className="py-4 px-4 text-center">{getCellBadge(row.trip)}</td>
                    <td className="py-4 px-4 text-center">{getCellBadge(row.fuelExp)}</td>
                    <td className="py-4 px-4 text-center">{getCellBadge(row.analytics)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
