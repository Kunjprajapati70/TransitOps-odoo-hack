import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Plus, Route, Search, X, CheckCircle, AlertTriangle, Play, Check, ChevronRight
} from 'lucide-react';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Lists of available objects for dropdown selection in Modal
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  // Modal states
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Create Form Fields
  const [tripId, setTripId] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState(100);
  const [distance, setDistance] = useState(10);
  const [revenue, setRevenue] = useState(200);
  const [dispatchImmediately, setDispatchImmediately] = useState(false);

  // Complete Form Fields
  const [fuelConsumed, setFuelConsumed] = useState(10);

  // Popups and Errors
  const [errorFeedback, setErrorFeedback] = useState('');
  const [toast, setToast] = useState(null);

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/trips?page=${page}&limit=5&search=${encodeURIComponent(search)}&status=${status}`);
      if (res.data.success) {
        setTrips(res.data.data);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error(err.message);
      triggerToast('Unable to fetch trips', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEntities = async () => {
    try {
      // Fetch vehicles that are Available (for assignment)
      const vehRes = await api.get('/vehicles?limit=100&status=Available');
      if (vehRes.data.success) {
        setAvailableVehicles(vehRes.data.data);
      }

      // Fetch drivers that are Available (and verify license in modal details if needed)
      const drvRes = await api.get('/drivers?limit=100&status=Available');
      if (drvRes.data.success) {
        // filter out expired on client side or let backend validations block
        setAvailableDrivers(drvRes.data.data);
      }
    } catch (err) {
      console.error('Failed to pre-fetch available resources:', err.message);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTrips();
  };

  const openCreateModal = () => {
    fetchAvailableEntities();
    setTripId(`TR${Math.floor(100 + Math.random() * 900)}`);
    setSource('');
    setDestination('');
    setSelectedVehicleId('');
    setSelectedDriverId('');
    setCargoWeight(600);
    setDistance(50);
    setRevenue(800);
    setDispatchImmediately(false);
    setErrorFeedback('');
    setShowDispatchModal(true);
  };

  const checkCargoWeightValidation = () => {
    if (!selectedVehicleId) return null;
    const v = availableVehicles.find(x => x._id === selectedVehicleId);
    if (!v) return null;
    if (Number(cargoWeight) > v.maxLoadCapacity) {
      return `Vehicle capacity exceeded! Selected vehicle capacity is ${v.maxLoadCapacity} kg, cargo weight is ${cargoWeight} kg. Dispatch will be blocked.`;
    }
    return null;
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setErrorFeedback('');

    if (!tripId.trim() || !source.trim() || !destination.trim() || !selectedVehicleId || !selectedDriverId) {
      setErrorFeedback('Please select a vehicle, driver, and fill in routes.');
      return;
    }

    const weightIssue = checkCargoWeightValidation();
    if (weightIssue) {
      setErrorFeedback(weightIssue);
      return;
    }

    const payload = {
      tripId: tripId.toUpperCase().trim(),
      source,
      destination,
      vehicle: selectedVehicleId,
      driver: selectedDriverId,
      cargoWeight: Number(cargoWeight),
      plannedDistance: Number(distance),
      revenue: Number(revenue),
      status: dispatchImmediately ? 'Dispatched' : 'Draft'
    };

    try {
      const res = await api.post('/trips', payload);
      if (res.data.success) {
        triggerToast(dispatchImmediately ? 'Trip dispatched successfully!' : 'Trip draft saved');
        setShowDispatchModal(false);
        fetchTrips();
      }
    } catch (err) {
      setErrorFeedback(err.response?.data?.message || 'Failed to dispatch or register trip');
    }
  };

  const handleStartDispatch = async (trip) => {
    try {
      const res = await api.put(`/trips/${trip._id}`, { status: 'Dispatched' });
      if (res.data.success) {
        triggerToast(`Trip ${trip.tripId} Dispatched & vehicle locked.`);
        fetchTrips();
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Dispatch transition failed', 'error');
    }
  };

  const openCompleteModal = (trip) => {
    setSelectedTrip(trip);
    // Suggest general fuel consumption (e.g. 8-12 km/L average, let's suggest distance / 10)
    setFuelConsumed(parseFloat((trip.plannedDistance / 6).toFixed(1)));
    setShowCompleteModal(true);
  };

  const handleCompleteTripSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/trips/${selectedTrip._id}`, { 
        status: 'Completed',
        fuelConsumed: Number(fuelConsumed)
      });
      if (res.data.success) {
        triggerToast(`Trip completed! Fuel recorded. Odometer incremented.`);
        setShowCompleteModal(false);
        fetchTrips();
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleCancelTrip = async (trip) => {
    if (!window.confirm(`Are you sure you want to cancel Trip ${trip.tripId}?`)) return;
    try {
      const res = await api.put(`/trips/${trip._id}`, { status: 'Cancelled' });
      if (res.data.success) {
        triggerToast(`Trip ${trip.tripId} Cancelled.`);
        fetchTrips();
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Cancel operation failed', 'error');
    }
  };

  const getStatusColor = (tStatus) => {
    switch (tStatus) {
      case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
      case 'Dispatched': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case 'Draft': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Trip Dispatch & Routing</h1>
          <p className="text-xs text-slate-400">Schedule routes, monitor live transits, and log returns</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-550/20 active:scale-95 transition-all dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          <span>New Dispatch</span>
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 rounded-xl glass-panel">
        <form onSubmit={handleSearchSubmit} className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search Trip ID, Source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-1.5 pl-3 pr-10 rounded-xl text-xs border border-slate-200 bg-white/50 text-slate-850 dark:border-slate-800 dark:bg-slate-950/40 dark:text-white"
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
            <option value="All">All statuses</option>
            <option value="Draft">Draft</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* TRIPS LIST TABLE */}
      <div className="rounded-2xl glass-panel overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-450 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/10">
                <th className="py-4 px-6">Trip ID</th>
                <th className="py-4 px-6">Source / Destination</th>
                <th className="py-4 px-6">Allocations</th>
                <th className="py-4 px-6">Distance / Rev</th>
                <th className="py-4 px-6 font-mono">Weight (Cap)</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-medium">No trips registered.</td>
                </tr>
              ) : (
                trips.map(t => (
                  <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white uppercase">{t.tripId}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{t.source}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                        <span>{t.destination}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>V: {t.vehicle?.name || 'N/A'} <span className="text-[10px] dark:text-slate-400 font-mono">({t.vehicle?.registrationNumber || 'None'})</span></div>
                      <div className="text-[10px] text-slate-450 mt-0.5">D: {t.driver?.name || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div>{t.plannedDistance} km</div>
                      <div className="text-[10px] text-green-600 dark:text-green-400 font-semibold mt-0.5">₹{t.revenue.toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-6 font-mono font-medium">
                      {t.cargoWeight} kg 
                      <span className="text-slate-450 text-[10px]"> / {t.vehicle?.maxLoadCapacity || 0} kg</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${getStatusColor(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1">
                      {t.status === 'Draft' && (
                        <>
                          <button 
                            onClick={() => handleStartDispatch(t)}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold inline-flex items-center gap-1 active:scale-95 transition-all shadow-sm"
                          >
                            <Play className="w-3 h-3" />
                            <span>Dispatch</span>
                          </button>
                          <button 
                            onClick={() => handleCancelTrip(t)}
                            className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-350 dark:bg-slate-805 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 active:scale-95 transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {t.status === 'Dispatched' && (
                        <>
                          <button 
                            onClick={() => openCompleteModal(t)}
                            className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold inline-flex items-center gap-1 active:scale-95 transition-all shadow-sm"
                          >
                            <Check className="w-3 h-3" />
                            <span>Complete</span>
                          </button>
                          <button 
                            onClick={() => handleCancelTrip(t)}
                            className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-750 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 active:scale-95 transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {(t.status === 'Completed' || t.status === 'Cancelled') && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Archived</span>
                      )}
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
            <span className="text-slate-455">Showing Page {page} of {pages} ({total} dispatches)</span>
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

      {/* DISPATCH CREATE DIALOG MODAL */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-205 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Create New Dispatch
              </h3>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorFeedback && (
              <div className="flex gap-2.5 bg-red-50 border border-red-200 dark:bg-red-955/20 dark:border-red-900/30 p-3 rounded-xl text-red-700 dark:text-red-400 text-xs mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorFeedback}</span>
              </div>
            )}

            <form onSubmit={handleCreateTrip} className="space-y-4 text-xs font-semibold text-slate-500">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Trip ID *</label>
                  <input
                    type="text"
                    required
                    value={tripId}
                    onChange={(e) => setTripId(e.target.value)}
                    placeholder="TR052"
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Cargo Weight (kg) *</label>
                  <input
                    type="number"
                    required
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Source Hub *</label>
                  <input
                    type="text"
                    required
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Vadodara depot"
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Destination Hub *</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Surat depot"
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Select Available Vehicle *</label>
                <select
                  required
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="input-field shadow-sm py-2 px-3 text-slate-850 dark:bg-slate-900"
                >
                  <option value="">-- Choose Ready Fleet Unit --</option>
                  {availableVehicles.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.registrationNumber}) - Max {v.maxLoadCapacity} kg
                    </option>
                  ))}
                </select>
                {availableVehicles.length === 0 && (
                  <span className="text-[10px] text-amber-500 mt-1 block leading-normal">* Note: No vehicles details return status 'Available'. Complete upkeep logs or finish transits.</span>
                )}
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Select Available Driver *</label>
                <select
                  required
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="input-field shadow-sm py-2 px-3 text-slate-850 dark:bg-slate-900"
                >
                  <option value="">-- Choose Ready Driver --</option>
                  {availableDrivers.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.licenseNumber}) - Category {d.licenseCategory} | Score: {d.safetyScore}
                    </option>
                  ))}
                </select>
                {availableDrivers.length === 0 && (
                  <span className="text-[10px] text-amber-500 mt-1 block leading-normal">* Note: No drivers are status 'Available'.</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Planned Distance (km) *</label>
                  <input
                    type="number"
                    required
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Revenue (₹) *</label>
                  <input
                    type="number"
                    required
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox"
                  id="dispatchNow"
                  checked={dispatchImmediately}
                  onChange={(e) => setDispatchImmediately(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500/50 dark:border-slate-800 dark:bg-slate-900"
                />
                <label htmlFor="dispatchNow" className="cursor-pointer select-none text-slate-700 dark:text-slate-300 font-bold">
                  Lock & Dispatch Immediately (Status = Dispatched)
                </label>
              </div>

              {/* Warnings display */}
              {checkCargoWeightValidation() && (
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-[10px] leading-relaxed">
                  <strong>Warning:</strong> {checkCargoWeightValidation()}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 border dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkCargoWeightValidation() !== null}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl dark:bg-brand-500 dark:hover:bg-brand-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {dispatchImmediately ? 'Dispatch Now' : 'Save Draft'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* COMPLETE TRIP MODAL - FUEL ENTRY */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-205 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Complete Trip {selectedTrip?.tripId}
              </h3>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteTripSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
              
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl space-y-1.5 mb-2">
                <div>Route: <span className="font-bold text-slate-700 dark:text-slate-350">{selectedTrip?.source} &rarr; {selectedTrip?.destination}</span></div>
                <div>Vehicle: <span className="font-mono">{selectedTrip?.vehicle?.name}</span></div>
                <div>Expected Odometer addition: <span className="font-mono text-brand-600 font-bold">+{selectedTrip?.plannedDistance} km</span></div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Actual Fuel Consumed (Liters) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={fuelConsumed}
                  onChange={(e) => setFuelConsumed(e.target.value)}
                  className="input-field shadow-sm py-2 px-3 text-slate-850"
                />
                <span className="text-[10px] text-slate-450 mt-1 block leading-normal">
                  * System will auto calculate fuel efficiency ({selectedTrip ? (selectedTrip.plannedDistance / (fuelConsumed || 1)).toFixed(2) : 0} km/L) and file a Fuel Ticket entry.
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 border dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl dark:bg-green-500 dark:hover:bg-green-600 font-bold"
                >
                  Log Return
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
