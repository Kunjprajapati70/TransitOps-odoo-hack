import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Plus, Edit2, Trash2, Search, X, CheckCircle, AlertTriangle
} from 'lucide-react';

export default function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentId, setCurrentId] = useState(null);

  // Form Fields
  const [regNo, setRegNo] = useState('');
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [vehicleType, setVehicleType] = useState('Van');
  const [capacity, setCapacity] = useState(500);
  const [odometer, setOdometer] = useState(0);
  const [cost, setCost] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [vehicleStatus, setVehicleStatus] = useState('Available');

  // Validation feedback
  const [errorFeedback, setErrorFeedback] = useState('');
  const [toast, setToast] = useState(null);

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vehicles?page=${page}&limit=5&search=${encodeURIComponent(search)}&type=${type}&status=${status}`);
      if (res.data.success) {
        setVehicles(res.data.data);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error(err.message);
      triggerToast('Unable to fetch vehicles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, type, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVehicles();
  };

  const openCreateModal = () => {
    setModalMode('create');
    setRegNo('');
    setName('');
    setModel('');
    setVehicleType('Van');
    setCapacity(500);
    setOdometer(0);
    setCost(0);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setVehicleStatus('Available');
    setErrorFeedback('');
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setModalMode('edit');
    setCurrentId(vehicle._id);
    setRegNo(vehicle.registrationNumber);
    setName(vehicle.name);
    setModel(vehicle.model);
    setVehicleType(vehicle.type);
    setCapacity(vehicle.maxLoadCapacity);
    setOdometer(vehicle.currentOdometer);
    setCost(vehicle.acquisitionCost);
    setPurchaseDate(new Date(vehicle.purchaseDate).toISOString().split('T')[0]);
    setVehicleStatus(vehicle.status);
    setErrorFeedback('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorFeedback('');

    if (!regNo.trim() || !name.trim() || !model.trim()) {
      setErrorFeedback('Please complete all required fields.');
      return;
    }

    const payload = {
      registrationNumber: regNo,
      name,
      model,
      type: vehicleType,
      maxLoadCapacity: Number(capacity),
      currentOdometer: Number(odometer),
      acquisitionCost: Number(cost),
      purchaseDate,
      status: vehicleStatus
    };

    try {
      if (modalMode === 'create') {
        const res = await api.post('/vehicles', payload);
        if (res.data.success) {
          triggerToast('Vehicle registered successfully');
          setShowModal(false);
          fetchVehicles();
        }
      } else {
        const res = await api.put(`/vehicles/${currentId}`, payload);
        if (res.data.success) {
          triggerToast('Vehicle updated successfully');
          setShowModal(false);
          fetchVehicles();
        }
      }
    } catch (err) {
      setErrorFeedback(err.response?.data?.message || 'Unique validation constraints check failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to retire or delete this vehicle?')) return;
    try {
      const res = await api.delete(`/vehicles/${id}`);
      if (res.data.success) {
        triggerToast('Vehicle deleted successfully');
        fetchVehicles();
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to delete vehicle', 'error');
    }
  };

  const getStatusColor = (vStatus) => {
    switch (vStatus) {
      case 'Available': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
      case 'On Trip': return 'bg-blue-105 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case 'In Shop': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      case 'Retired': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Header and Add button */}
      <div className="flex items-center justify-between pb-2 border-b dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Fleet Administration</h1>
          <p className="text-xs text-slate-400">Total fleet inventory and dispatch tracking status</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-550/20 active:scale-95 transition-all dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 rounded-xl glass-panel">
        <form onSubmit={handleSearchSubmit} className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search registration no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-1.5 pl-3 pr-10 rounded-xl text-xs border border-slate-200 bg-white/50 text-slate-850 dark:border-slate-800 dark:bg-slate-950/40 dark:text-white"
          />
          <button type="submit" className="absolute right-3 top-2 text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex gap-3 flex-wrap">
          <select 
            value={type} 
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="bg-white border dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-350"
          >
            <option value="All">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Mini">Mini</option>
          </select>
          <select 
            value={status} 
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-white border dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-350"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {/* FLEET INVENTORY TABLE */}
      <div className="rounded-2xl glass-panel overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-450 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/10">
                <th className="py-4 px-6">Reg No.</th>
                <th className="py-4 px-6">Name/Model</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Capacity</th>
                <th className="py-4 px-6">Odometer</th>
                <th className="py-4 px-6">Acq. Cost</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400 font-medium">No vehicles registered in fleet.</td>
                </tr>
              ) : (
                vehicles.map(v => (
                  <tr key={v._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white uppercase">{v.registrationNumber}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800 dark:text-slate-205">{v.name}</div>
                      <div className="text-[10px] text-slate-450">{v.model}</div>
                    </td>
                    <td className="py-4 px-6">{v.type}</td>
                    <td className="py-4 px-6 font-mono">{v.maxLoadCapacity} kg</td>
                    <td className="py-4 px-6 font-mono">{v.currentOdometer.toLocaleString()} km</td>
                    <td className="py-4 px-6 font-mono">₹{v.acquisitionCost.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${getStatusColor(v.status)}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(v)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all inline-block"
                        title="Edit Vehicle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(v._id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-all inline-block"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION SECTION */}
        {pages > 1 && (
          <div className="p-4 border-t dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/10">
            <span className="text-slate-450">Showing Page {page} of {pages} ({total} total units)</span>
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
                {modalMode === 'create' ? 'Register New Vehicle' : 'Edit Fleet Vehicle'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorFeedback && (
              <div className="flex gap-2.5 bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30 p-3 rounded-xl text-red-700 dark:text-red-400 text-xs mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorFeedback}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="e.g. GJ01AB452"
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Vehicle Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. VAN-05"
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Vehicle Model *</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Ford Transit Custom"
                  className="input-field shadow-sm py-2 px-3 text-slate-850"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Vehicle Type *</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850 dark:bg-slate-900"
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Mini">Mini</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Max Load (kg) *</label>
                  <input
                    type="number"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Odometer (km)</label>
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Acquisition Cost (₹) *</label>
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
                  <label className="block mb-1.5 uppercase tracking-wider">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Vehicle Status *</label>
                  <select
                    value={vehicleStatus}
                    onChange={(e) => setVehicleStatus(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850 dark:bg-slate-900"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl dark:bg-brand-500 dark:hover:bg-brand-600 font-bold"
                >
                  {modalMode === 'create' ? 'Register' : 'Save Changes'}
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
