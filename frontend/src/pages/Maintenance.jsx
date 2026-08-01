import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Plus, Wrench, Search, X, CheckCircle, AlertTriangle, Calendar, Award
} from 'lucide-react';

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // List of vehicles
  const [vehicles, setVehicles] = useState([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentId, setCurrentId] = useState(null);

  // Form Fields
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [type, setType] = useState('Routine');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(100);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maintStatus, setMaintStatus] = useState('Scheduled');

  // Popups and Errors
  const [errorFeedback, setErrorFeedback] = useState('');
  const [toast, setToast] = useState(null);

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/maintenance?page=${page}&limit=5&search=${encodeURIComponent(search)}&status=${status}`);
      if (res.data.success) {
        setLogs(res.data.data);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error(err.message);
      triggerToast('Unable to fetch upkeep history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehiclesList = async () => {
    try {
      const res = await api.get('/vehicles?limit=100');
      if (res.data.success) {
        // filter out Retired
        setVehicles(res.data.data.filter(v => v.status !== 'Retired'));
      }
    } catch (err) {
      console.error('Failed to pre-fetch vehicle roster:', err.message);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const openCreateModal = () => {
    fetchVehiclesList();
    setModalMode('create');
    setSelectedVehicleId('');
    setType('Routine');
    setDescription('');
    setCost(200);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setMaintStatus('Scheduled');
    setErrorFeedback('');
    setShowModal(true);
  };

  const openEditModal = (log) => {
    fetchVehiclesList();
    setModalMode('edit');
    setCurrentId(log._id);
    setSelectedVehicleId(log.vehicle?._id || '');
    setType(log.type);
    setDescription(log.description);
    setCost(log.cost);
    setStartDate(new Date(log.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(log.endDate).toISOString().split('T')[0]);
    setMaintStatus(log.status);
    setErrorFeedback('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorFeedback('');

    if (!selectedVehicleId || !description.trim() || !startDate || !endDate) {
      setErrorFeedback('Please select a vehicle and fill description & dates.');
      return;
    }

    const payload = {
      vehicle: selectedVehicleId,
      type,
      description,
      cost: Number(cost),
      startDate,
      endDate,
      status: maintStatus
    };

    try {
      if (modalMode === 'create') {
        const res = await api.post('/maintenance', payload);
        if (res.data.success) {
          triggerToast('Maintenance scheduled successfully');
          setShowModal(false);
          fetchLogs();
        }
      } else {
        const res = await api.put(`/maintenance/${currentId}`, payload);
        if (res.data.success) {
          triggerToast('Maintenance log updated');
          setShowModal(false);
          fetchLogs();
        }
      }
    } catch (err) {
      setErrorFeedback(err.response?.data?.message || 'Failed to save maintenance sheet');
    }
  };

  const handleQuickStatusChange = async (log, nextStatus) => {
    try {
      const res = await api.put(`/maintenance/${log._id}`, { status: nextStatus });
      if (res.data.success) {
        triggerToast(`Log updated to ${nextStatus}. Vehicle status synchronized.`);
        fetchLogs();
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Upkeep status update failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance record permanently?')) return;
    try {
      const res = await api.delete(`/maintenance/${id}`);
      if (res.data.success) {
        triggerToast('Record removed successfully');
        fetchLogs();
      }
    } catch (err) {
      triggerToast('Unable to remove record', 'error');
    }
  };

  const getStatusColor = (lStatus) => {
    switch (lStatus) {
      case 'Completed': return 'bg-green-105 text-green-700 dark:bg-green-950 dark:text-green-300';
      case 'In Progress': return 'bg-orange-105 text-orange-705 dark:bg-orange-955 dark:text-orange-300';
      case 'Scheduled': return 'bg-blue-105 text-blue-707 dark:bg-blue-950 dark:text-blue-300';
      default: return 'bg-slate-105 text-slate-707 dark:bg-slate-800 dark:text-slate-350';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Upkeep & Maintenances</h1>
          <p className="text-xs text-slate-400">Track vehicle service logs, inspections, and alternator upkeep</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-550/20 active:scale-95 transition-all dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          <span>Book Upkeep</span>
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 rounded-xl glass-panel">
        <form onSubmit={handleSearchSubmit} className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search vehicle model or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-1.5 pl-3 pr-10 rounded-xl text-xs border border-slate-205 bg-white/50 text-slate-850 dark:border-slate-805 dark:bg-slate-950/40 dark:text-white"
          />
          <button type="submit" className="absolute right-3 top-2 text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex gap-3">
          <select 
            value={status} 
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-white border dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-350"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* MAINTENANCE LOGS TABLE/CARDS */}
      <div className="rounded-2xl glass-panel overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-450 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/10">
                <th className="py-4 px-6">Fleet Unit</th>
                <th className="py-4 px-6">Type &amp; details</th>
                <th className="py-4 px-6 font-mono">Cost</th>
                <th className="py-4 px-6">Scheduled Range</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400 font-medium">No service records found.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-950 dark:text-white">{log.vehicle?.name || 'Retired/None'}</div>
                      <div className="text-[10px] text-slate-450 font-mono">({log.vehicle?.registrationNumber || 'N/A'})</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold">{log.type}</div>
                      <div className="text-[10px] text-slate-450 leading-relaxed max-w-xs truncate">{log.description}</div>
                    </td>
                    <td className="py-4 px-6 font-mono font-medium text-amber-600 dark:text-amber-400">₹{log.cost.toLocaleString()}</td>
                    <td className="py-4 px-6 font-mono">
                      <div>S: {new Date(log.startDate).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-450">E: {new Date(log.endDate).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1">
                      {log.status === 'Scheduled' && (
                        <button 
                          onClick={() => handleQuickStatusChange(log, 'In Progress')}
                          className="px-2.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[10px] font-bold active:scale-95 transition-all text-center inline-block"
                        >
                          Start Upkeep
                        </button>
                      )}
                      {log.status === 'In Progress' && (
                        <button 
                          onClick={() => handleQuickStatusChange(log, 'Completed')}
                          className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold active:scale-95 transition-all text-center inline-block"
                        >
                          Mark Completed
                        </button>
                      )}
                      
                      <button 
                        onClick={() => openEditModal(log)}
                        className="p-1 px-2 border dark:border-slate-805 hover:bg-slate-105 rounded text-[10px] font-medium text-slate-500 dark:text-slate-400 dark:hover:text-white inline-block cursor-pointer align-middle"
                        title="Edit Record"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(log._id)}
                        className="p-1 px-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 dark:text-slate-400 dark:hover:text-red-400 rounded text-[10px] inline-block font-medium cursor-pointer align-middle"
                        title="Delete Record"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {pages > 1 && (
          <div className="p-4 border-t dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/10">
            <span className="text-slate-455">Showing Page {page} of {pages} ({total} service rows)</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border rounded-lg bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(p + 1, pages))}
                disabled={page === pages}
                className="px-3 py-1.5 border rounded-lg bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE/EDIT DIALOG MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-205 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {modalMode === 'create' ? 'Schedule Upkeep Log' : 'Edit Upkeep Record'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorFeedback && (
              <div className="flex gap-2.5 bg-red-50 border border-red-200 dark:bg-red-955/20 dark:border-red-900/30 p-3 rounded-xl text-red-700 dark:text-red-400 text-xs mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorFeedback}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
              
              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Select Roster Vehicle *</label>
                <select
                  required
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="input-field shadow-sm py-2 px-3 text-slate-850 dark:bg-slate-900"
                >
                  <option value="">-- Choose Unit to Inspect --</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.registrationNumber}) - Odometer: {v.currentOdometer} km | Status: {v.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Upkeep Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850 dark:bg-slate-900"
                  >
                    <option value="Routine">Routine Inspection</option>
                    <option value="Preventative">Preventative Care</option>
                    <option value="Repair">Repair Maintenance</option>
                    <option value="Breakdown">Breakdown Recovery</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Estimated Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Status *</label>
                <select
                  value={maintStatus}
                  onChange={(e) => setMaintStatus(e.target.value)}
                  className="input-field shadow-sm py-2 px-3 text-slate-850 dark:bg-slate-900"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress (Locks Vehicle to In Shop)</option>
                  <option value="Completed">Completed (Frees Vehicle to Available)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Work description *</label>
                <textarea
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe parts replaced or scheduled checklists..."
                  className="input-field shadow-sm py-2 px-3 text-slate-850"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl dark:bg-brand-500 dark:hover:bg-brand-600 font-bold"
                >
                  {modalMode === 'create' ? 'Book' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* FLOAT NOTIFY TOAST BANNER */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-55 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl shadow-2xl transition-all animate-bounce">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <span className="text-xs font-bold">{toast.msg}</span>
        </div>
      )}

    </div>
  );
}
