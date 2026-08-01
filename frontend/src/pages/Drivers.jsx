import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Plus, Edit2, Trash2, Search, X, CheckCircle, AlertTriangle, ShieldCheck
} from 'lucide-react';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentId, setCurrentId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [licenseCat, setLicenseCat] = useState('LMV');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [safetyScore, setSafetyScore] = useState(100);
  const [driverStatus, setDriverStatus] = useState('Available');

  // Popups
  const [errorFeedback, setErrorFeedback] = useState('');
  const [toast, setToast] = useState(null);

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/drivers?page=${page}&limit=5&search=${encodeURIComponent(search)}&category=${category}&status=${status}`);
      if (res.data.success) {
        setDrivers(res.data.data);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error(err.message);
      triggerToast('Unable to fetch drivers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, category, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDrivers();
  };

  const openCreateModal = () => {
    setModalMode('create');
    setName('');
    setLicenseNo('');
    setLicenseCat('LMV');
    setLicenseExpiry(new Date(new Date().getFullYear() + 3, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]);
    setContact('');
    setEmail('');
    setSafetyScore(100);
    setDriverStatus('Available');
    setErrorFeedback('');
    setShowModal(true);
  };

  const openEditModal = (driver) => {
    setModalMode('edit');
    setCurrentId(driver._id);
    setName(driver.name);
    setLicenseNo(driver.licenseNumber);
    setLicenseCat(driver.licenseCategory);
    setLicenseExpiry(new Date(driver.licenseExpiryDate).toISOString().split('T')[0]);
    setContact(driver.contactNumber);
    setEmail(driver.email);
    setSafetyScore(driver.safetyScore);
    setDriverStatus(driver.status);
    setErrorFeedback('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorFeedback('');

    if (!name.trim() || !licenseNo.trim() || !email.trim()) {
      setErrorFeedback('Please complete all required fields.');
      return;
    }

    const payload = {
      name,
      licenseNumber: licenseNo,
      licenseCategory: licenseCat,
      licenseExpiryDate: licenseExpiry,
      contactNumber: contact,
      email,
      safetyScore: Number(safetyScore),
      status: driverStatus
    };

    try {
      if (modalMode === 'create') {
        const res = await api.post('/drivers', payload);
        if (res.data.success) {
          triggerToast('Driver registered successfully');
          setShowModal(false);
          fetchDrivers();
        }
      } else {
        const res = await api.put(`/drivers/${currentId}`, payload);
        if (res.data.success) {
          triggerToast('Driver details updated');
          setShowModal(false);
          fetchDrivers();
        }
      }
    } catch (err) {
      setErrorFeedback(err.response?.data?.message || 'Unique compliance checks failed. Check license and email.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this driver profile permanently?')) return;
    try {
      const res = await api.delete(`/drivers/${id}`);
      if (res.data.success) {
        triggerToast('Driver profile deleted');
        fetchDrivers();
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Delete operation failed', 'error');
    }
  };

  const getStatusColor = (dStatus, expiryStr) => {
    // Check if expired
    const isExpired = new Date(expiryStr) < new Date();
    if (isExpired) return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';

    switch (dStatus) {
      case 'Available': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
      case 'On Trip': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case 'Off Duty': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'Suspended': return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
    }
  };

  const checkLicenseExpiryBadge = (expiryStr) => {
    const today = new Date();
    const expiry = new Date(expiryStr);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff <= 0) {
      return <span className="ml-1.5 px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-350 font-extrabold text-[9px] uppercase font-mono">EXPIRED</span>;
    } else if (daysDiff <= 30) {
      return <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-105 text-amber-705 dark:bg-amber-955 dark:text-amber-350 font-extrabold text-[9px] uppercase font-mono">SOON</span>;
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in relative font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Driver & Safety Compliance</h1>
          <p className="text-xs text-slate-400">Driver lists, licensing credentials, and safety profile scores</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-550/20 active:scale-95 transition-all dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          <Plus className="w-4 h-4" />
          <span>Add Driver</span>
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 rounded-xl glass-panel">
        <form onSubmit={handleSearchSubmit} className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search name, license no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-1.5 pl-3 pr-10 rounded-xl text-xs border border-slate-205 bg-white/50 text-slate-850 dark:border-slate-805 dark:bg-slate-95a/40 dark:text-white"
          />
          <button type="submit" className="absolute right-3 top-2 text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex gap-3 flex-wrap">
          <select 
            value={category} 
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="bg-white border dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-350"
          >
            <option value="All">All Categories</option>
            <option value="LMV">LMV (Light Vehicle)</option>
            <option value="HMV">HMV (Heavy Vehicle)</option>
            <option value="Other">Other Category</option>
          </select>
          <select 
            value={status} 
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-white border dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-350"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* DRIVERS LIST TABLE */}
      <div className="rounded-2xl glass-panel overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-450 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/10">
                <th className="py-4 px-6">Driver</th>
                <th className="py-4 px-6">License Details</th>
                <th className="py-4 px-6 text-center">Safety Score</th>
                <th className="py-4 px-6">Contact info</th>
                <th className="py-4 px-6">Status</th>
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
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400 font-medium">No safety drivers registered on roster.</td>
                </tr>
              ) : (
                drivers.map(d => {
                  const isExpired = new Date(d.licenseExpiryDate) < new Date();
                  return (
                    <tr key={d._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-850 dark:text-white">{d.name}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold">{d.licenseNumber} <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-450 uppercase">{d.licenseCategory}</span></div>
                        <div className="text-[10px] text-slate-450 mt-0.5 flex items-center">
                          <span>Expiry: {new Date(d.licenseExpiryDate).toLocaleDateString()}</span>
                          {checkLicenseExpiryBadge(d.licenseExpiryDate)}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${d.safetyScore >= 90 ? 'bg-green-500' : d.safetyScore >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                          <span className="font-semibold font-mono">{d.safetyScore}/100</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>{d.contactNumber}</div>
                        <div className="text-[10px] text-slate-450">{d.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${getStatusColor(d.status, d.licenseExpiryDate)}`}>
                          {isExpired ? 'Blocked (Expired)' : d.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button 
                          onClick={() => openEditModal(d)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all inline-block"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(d._id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-all inline-block"
                          title="Delete Driver"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION SECTION */}
        {pages > 1 && (
          <div className="p-4 border-t dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/10">
            <span className="text-slate-455">Showing Page {page} of {pages} ({total} profiles)</span>
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {modalMode === 'create' ? 'Register New Driver' : 'Edit Driver Profile'}
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
              
              <div>
                <label className="block mb-1.5 uppercase tracking-wider">Driver Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="input-field shadow-sm py-2 px-3 text-slate-850"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">License Number *</label>
                  <input
                    type="text"
                    required
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    placeholder="e.g. DL-88213"
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">License Category *</label>
                  <select
                    value={licenseCat}
                    onChange={(e) => setLicenseCat(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850 dark:bg-slate-900"
                  >
                    <option value="LMV">LMV (Light Motor)</option>
                    <option value="HMV">HMV (Heavy Motor)</option>
                    <option value="Other">Other Category</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase tracking-wider">License Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={licenseExpiry}
                  onChange={(e) => setLicenseExpiry(e.target.value)}
                  className="input-field shadow-sm py-2 px-3 text-slate-850"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Contact Number *</label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex@transitops.com"
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Safety Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase tracking-wider">Status *</label>
                  <select
                    value={driverStatus}
                    onChange={(e) => setDriverStatus(e.target.value)}
                    className="input-field shadow-sm py-2 px-3 text-slate-850 dark:bg-slate-900"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
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
                  {modalMode === 'create' ? 'Register' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* FLOAT NOTIFY BANNER */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-55 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl shadow-2xl transition-all animate-bounce">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <span className="text-xs font-bold">{toast.msg}</span>
        </div>
      )}

    </div>
  );
}
