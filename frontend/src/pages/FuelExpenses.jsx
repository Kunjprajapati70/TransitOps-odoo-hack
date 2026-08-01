import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Plus, Fuel, DollarSign, Calendar, Search, X, CheckCircle, AlertTriangle
} from 'lucide-react';

export default function FuelExpenses() {
  const [activeTab, setActiveTab] = useState('fuel'); // 'fuel' or 'expenses'
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenseLogs, setExpenseLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // List of vehicles
  const [vehicles, setVehicles] = useState([]);

  // Modal States
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Form Fields - Fuel
  const [fuelVehicleId, setFuelVehicleId] = useState('');
  const [fuelQty, setFuelQty] = useState(10);
  const [fuelCost, setFuelCost] = useState(15);
  const [fuelDate, setFuelDate] = useState('');

  // Form Fields - Expenses
  const [expVehicleId, setExpVehicleId] = useState('');
  const [expTolls, setExpTolls] = useState(0);
  const [expParking, setExpParking] = useState(0);
  const [expRepair, setExpRepair] = useState(0);
  const [expOther, setExpOther] = useState(0);
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState('');

  // Feedbacks
  const [errorFeedback, setErrorFeedback] = useState('');
  const [toast, setToast] = useState(null);

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFuel = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fuel-expenses/fuel');
      if (res.data.success) {
        setFuelLogs(res.data.data);
      }
    } catch (err) {
      console.error(err.message);
      triggerToast('Failed to fetch fuel logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fuel-expenses/expenses');
      if (res.data.success) {
        setExpenseLogs(res.data.data);
      }
    } catch (err) {
      console.error(err.message);
      triggerToast('Failed to fetch expense sheets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehiclesList = async () => {
    try {
      const res = await api.get('/vehicles?limit=100');
      if (res.data.success) {
        setVehicles(res.data.data);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'fuel') {
      fetchFuel();
    } else {
      fetchExpenses();
    }
  }, [activeTab]);

  const openFuelCreate = () => {
    fetchVehiclesList();
    setFuelVehicleId('');
    setFuelQty(15);
    setFuelCost(20);
    setFuelDate(new Date().toISOString().split('T')[0]);
    setErrorFeedback('');
    setShowFuelModal(true);
  };

  const openExpenseCreate = () => {
    fetchVehiclesList();
    setExpVehicleId('');
    setExpTolls(0);
    setExpParking(0);
    setExpRepair(0);
    setExpOther(0);
    setExpDesc('');
    setExpDate(new Date().toISOString().split('T')[0]);
    setErrorFeedback('');
    setShowExpenseModal(true);
  };

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setErrorFeedback('');
    if (!fuelVehicleId) {
      setErrorFeedback('Please select a vehicle');
      return;
    }
    try {
      const res = await api.post('/fuel-expenses/fuel', {
        vehicle: fuelVehicleId,
        quantity: Number(fuelQty),
        cost: Number(fuelCost),
        date: fuelDate
      });
      if (res.data.success) {
        triggerToast('Fuel log recorded successfully');
        setShowFuelModal(false);
        fetchFuel();
      }
    } catch (err) {
      setErrorFeedback(err.response?.data?.message || 'Failed to submit fuel log');
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setErrorFeedback('');
    if (!expVehicleId || !expDesc.trim()) {
      setErrorFeedback('Please select a vehicle and enter description');
      return;
    }
    try {
      const res = await api.post('/fuel-expenses/expenses', {
        vehicle: expVehicleId,
        toll: Number(expTolls),
        parking: Number(expParking),
        repair: Number(expRepair),
        other: Number(expOther),
        description: expDesc,
        date: expDate
      });
      if (res.data.success) {
        triggerToast('Expense ticket created');
        setShowExpenseModal(false);
        fetchExpenses();
      }
    } catch (err) {
      setErrorFeedback(err.response?.data?.message || 'Failed to submit expense log');
    }
  };

  const handleDeleteFuel = async (id) => {
    if (!window.confirm('Remove this fuel log profile?')) return;
    try {
      await api.delete(`/fuel-expenses/fuel/${id}`);
      triggerToast('Fuel log removed');
      fetchFuel();
    } catch (err) {
      triggerToast('Remove operation failed', 'error');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense ticket?')) return;
    try {
      await api.delete(`/fuel-expenses/expenses/${id}`);
      triggerToast('Expense ticket removed');
      fetchExpenses();
    } catch (err) {
      triggerToast('Remove operation failed', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Financial fuel & Expenses</h1>
          <p className="text-xs text-slate-400">Manage fuel ticket receipts, highway tolls, and incidental repair costs</p>
        </div>
        
        <div>
          {activeTab === 'fuel' ? (
            <button 
              onClick={openFuelCreate}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-550/20 active:scale-95 transition-all dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              <Plus className="w-4 h-4" />
              <span>Log Fuel Receipt</span>
            </button>
          ) : (
            <button 
              onClick={openExpenseCreate}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-550/20 active:scale-95 transition-all dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              <Plus className="w-4 h-4" />
              <span>Log Incidentals</span>
            </button>
          )}
        </div>
      </div>

      {/* TABS CONTROLLERS */}
      <div className="flex border-b dark:border-slate-800 select-none">
        <button
          onClick={() => setActiveTab('fuel')}
          className={`px-6 py-3 font-semibold text-xs tracking-wider uppercase border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'fuel'
              ? 'border-brand-500 text-brand-600 dark:text-brand-405 font-bold'
              : 'border-transparent text-slate-450 hover:text-slate-705'
          }`}
        >
          <Fuel className="w-4 h-4" />
          <span>Fuel Receipts ({fuelLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-6 py-3 font-semibold text-xs tracking-wider uppercase border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'expenses'
              ? 'border-brand-500 text-brand-600 dark:text-brand-405 font-bold'
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Miscellaneous Tickets ({expenseLogs.length})</span>
        </button>
      </div>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <div className="rounded-2xl glass-panel overflow-hidden border">
        
        {loading ? (
          <div className="text-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto"></div>
          </div>
        ) : activeTab === 'fuel' ? (
          
          /* FUEL LIST GRID */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-850 text-xs font-bold uppercase text-slate-450 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/10">
                  <th className="py-4 px-6 fixed-width">Vehicle</th>
                  <th className="py-4 px-6">Quantity (L)</th>
                  <th className="py-4 px-6">Unit Price</th>
                  <th className="py-4 px-6">Total Cost</th>
                  <th className="py-4 px-6">Log Date</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                {fuelLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">No fuel records logged.</td>
                  </tr>
                ) : (
                  fuelLogs.map(f => (
                    <tr key={f._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                      <td className="py-4 px-6 font-bold">
                        {f.vehicle?.name || 'Retired'} 
                        <span className="text-[10px] text-slate-450 ml-1 font-mono">({f.vehicle?.registrationNumber})</span>
                      </td>
                      <td className="py-4 px-6 font-mono font-semibold">{f.quantity} L</td>
                      <td className="py-4 px-6 font-mono">₹{(f.cost / f.quantity).toFixed(2)} / L</td>
                      <td className="py-4 px-6 font-mono font-bold text-amber-600 dark:text-amber-400">₹{f.cost.toLocaleString()}</td>
                      <td className="py-4 px-6 font-mono">{new Date(f.date).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleDeleteFuel(f._id)}
                          className="px-2.5 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-455 hover:text-red-500 rounded-lg font-bold"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        ) : (
          
          /* EXPENSES LIST GRID */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-850 text-xs font-bold uppercase text-slate-450 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/10">
                  <th className="py-4 px-6">Vehicle</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Cost Buckets</th>
                  <th className="py-4 px-6 font-mono">Total Paid</th>
                  <th className="py-4 px-6">Log Date</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                {expenseLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">No incidental expenses logged.</td>
                  </tr>
                ) : (
                  expenseLogs.map(e => {
                    const totalCost = e.toll + e.parking + e.repair + e.other;
                    return (
                      <tr key={e._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                        <td className="py-4 px-6 font-bold">
                          {e.vehicle?.name || 'Retired'} 
                          <span className="text-[10px] text-slate-450 ml-1 font-mono">({e.vehicle?.registrationNumber})</span>
                        </td>
                        <td className="py-4 px-6 max-w-xs leading-normal font-medium truncate">{e.description}</td>
                        <td className="py-4 px-6 space-y-0.5 text-[10px]">
                          {e.toll > 0 && <span className="block">Tolls: ₹{e.toll}</span>}
                          {e.parking > 0 && <span className="block">Parking: ₹{e.parking}</span>}
                          {e.repair > 0 && <span className="block text-orange-600 dark:text-orange-400">Repair: ₹{e.repair}</span>}
                          {e.other > 0 && <span className="block text-slate-450">Other: ₹{e.other}</span>}
                        </td>
                        <td className="py-4 px-6 font-mono font-extrabold text-amber-600 dark:text-amber-405">₹{totalCost.toLocaleString()}</td>
                        <td className="py-4 px-6 font-mono">{new Date(e.date).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => handleDeleteExpense(e._id)}
                            className="px-2.5 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-455 hover:text-red-500 rounded-lg font-bold"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        )}

      </div>

      {/* FUEL MODAL */}
      {showFuelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-205 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Log Fuel Entry Ticket
              </h3>
              <button onClick={() => setShowFuelModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorFeedback && (
              <div className="flex gap-2.5 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30 p-3 rounded-xl text-red-700 dark:text-red-400 text-xs mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorFeedback}</span>
              </div>
            )}

            <form onSubmit={handleFuelSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
              
              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Select Roster Vehicle *</label>
                <select
                  required
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="input-field shadow-sm py-2 px-3 text-slate-850 dark:bg-slate-900"
                >
                  <option value="">-- Choose fleet unit --</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Fuel Quantity (Liters) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={fuelQty}
                    onChange={(e) => setFuelQty(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-855"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Total cost (₹) *</label>
                  <input
                    type="number"
                    required
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-855"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Refuel Date *</label>
                <input
                  type="date"
                  required
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  className="input-field shadow-sm py-2 px-3 text-slate-855"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFuelModal(false)}
                  className="px-4 py-2 border dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl dark:bg-brand-500 dark:hover:bg-brand-600 font-bold"
                >
                  Submit Log
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-205 dark:border-slate-805">
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Log Operational Incidentals
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorFeedback && (
              <div className="flex gap-2.5 bg-red-50 border border-red-200 dark:bg-red-955/20 dark:border-red-900/30 p-3 rounded-xl text-red-700 dark:text-red-400 text-xs mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorFeedback}</span>
              </div>
            )}

            <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
              
              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Select Roster Vehicle *</label>
                <select
                  required
                  value={expVehicleId}
                  onChange={(e) => setExpVehicleId(e.target.value)}
                  className="input-field shadow-sm py-2 px-3 text-slate-850 dark:bg-slate-900"
                >
                  <option value="">-- Choose fleet unit --</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Highway Tolls (₹)</label>
                  <input
                    type="number"
                    value={expTolls}
                    onChange={(e) => setExpTolls(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-855"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Terminal Parking (₹)</label>
                  <input
                    type="number"
                    value={expParking}
                    onChange={(e) => setExpParking(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-855"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Emergency Repairs (₹)</label>
                  <input
                    type="number"
                    value={expRepair}
                    onChange={(e) => setExpRepair(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-855"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Other charges (₹)</label>
                  <input
                    type="number"
                    value={expOther}
                    onChange={(e) => setExpOther(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-855"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Log Date *</label>
                <input
                  type="date"
                  required
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="input-field shadow-sm py-2 px-3 text-slate-855"
                />
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Ticket Description / Notes *</label>
                <textarea
                  required
                  rows="2"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. NH-8 toll plazas and tyre patch repairs..."
                  className="input-field shadow-sm py-2 px-3 text-slate-855"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border dark:border-slate-805 rounded-xl hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl dark:bg-brand-500 dark:hover:bg-brand-600 font-bold"
                >
                  File Ticket
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* NOTIFY TOAST BANNER */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-55 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl shadow-2xl transition-all animate-bounce">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <span className="text-xs font-bold">{toast.msg}</span>
        </div>
      )}

    </div>
  );
}
