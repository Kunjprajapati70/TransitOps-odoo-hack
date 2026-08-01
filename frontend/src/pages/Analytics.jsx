import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  FileText, Download, BarChart2, TrendingUp, AlertTriangle, UserCheck
} from 'lucide-react';

export default function Analytics() {
  const [reportType, setReportType] = useState('roi'); // 'roi', 'drivers', 'fuel'
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/reports/${reportType}`);
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load report data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleExport = (format, type) => {
    // We can directly open the backend URL in a new window to trigger file downloads!
    // Since our token is required for route protection, we can pass it as a query parameter 
    // or trigger it via a native download fetch with headers. 
    // Triggering via fetch is secure and prevents browser popup blocks:
    const token = localStorage.getItem('token');
    
    // Create direct URL
    const url = `http://localhost:5000/api/analytics/export/${format}/${type}`;
    
    // Download helper
    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Download failed');
      return res.blob();
    })
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${type}_report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    })
    .catch(err => {
      console.error(err);
      alert('Failed to download report. Ensure target server is online.');
    });
  };

  return (
    <div className="space-y-6 animate-fade-in relative font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Analytics &amp; Compliance Reporting</h1>
          <p className="text-xs text-slate-400">Generate, review, and download enterprise reports</p>
        </div>
      </div>

      {/* THREE CAROUSEL OR TAB SELECT BOXES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div 
          onClick={() => { setReportType('roi'); setReportData([]); }}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            reportType === 'roi' 
              ? 'bg-brand-500/10 border-brand-500 shadow-md translate-y-[-2px]' 
              : 'glass-panel border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <TrendingUp className="w-5 h-5 text-brand-605" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Financials</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3">Vehicle ROI Report</h3>
          <p className="text-slate-455 text-[10px] mt-1 leading-normal">Operational profits vs asset acquisition cost ratios.</p>
        </div>

        <div 
          onClick={() => { setReportType('drivers'); setReportData([]); }}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            reportType === 'drivers' 
              ? 'bg-brand-500/10 border-brand-500 shadow-md translate-y-[-2px]' 
              : 'glass-panel border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <UserCheck className="w-5 h-5 text-indigo-505" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Safety</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3">Driver Performance</h3>
          <p className="text-slate-455 text-[10px] mt-1 leading-normal">Trips completed, distance traveled, &amp; safety scores.</p>
        </div>

        <div 
          onClick={() => { setReportType('fuel'); setReportData([]); }}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            reportType === 'fuel' 
              ? 'bg-brand-500/10 border-brand-500 shadow-md translate-y-[-2px]' 
              : 'glass-panel border-slate-200 dark:border-slate-805 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <BarChart2 className="w-5 h-5 text-teal-505" />
            <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Compliance</span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3">Fuel efficiency logs</h3>
          <p className="text-slate-450 text-[10px] mt-1 leading-normal">Average mileage, liter usage, and dispatch distances.</p>
        </div>

      </div>

      {/* PREVIEW CONTAINER */}
      <div className="rounded-2xl glass-panel overflow-hidden border">
        
        {/* Report Top Export Bar */}
        <div className="p-4 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-xs tracking-wider uppercase text-slate-500 dark:text-slate-405">
              {reportType === 'roi' && 'Vehicle ROI Grid Preview'}
              {reportType === 'drivers' && 'Driver Safety Grid Preview'}
              {reportType === 'fuel' && 'Fuel Efficiency logs Preview'}
            </span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => handleExport('csv', reportType)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={() => handleExport('pdf', reportType)}
              className="px-3 py-1.5 bg-brand-650 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>

        {/* View Grid */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto"></div>
            </div>
          ) : reportType === 'roi' ? (
            
            /* ROI TABLE */
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 font-bold uppercase text-slate-400">
                  <th className="py-3 px-6">Reg No</th>
                  <th className="py-3 px-6">Vehicle Name</th>
                  <th className="py-3 px-6 font-mono text-center">Acquisition Cost</th>
                  <th className="py-3 px-6 font-mono text-center">Total Revenue</th>
                  <th className="py-3 px-6 font-mono text-center">Op Cost (Fuel/Upkeep)</th>
                  <th className="py-3 px-6 font-mono text-center">Net Profit</th>
                  <th className="py-3 px-6 font-mono text-right">Calculated ROI %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {reportData.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-950 dark:text-white uppercase">{r.registrationNumber}</td>
                    <td className="py-3.5 px-6 font-semibold">{r.name}</td>
                    <td className="py-3.5 px-6 font-mono text-center">₹{r.acquisitionCost?.toLocaleString() || '0'}</td>
                    <td className="py-3.5 px-6 font-mono text-center text-green-600 dark:text-green-400 font-semibold">₹{r.revenue?.toLocaleString() || '0'}</td>
                    <td className="py-3.5 px-6 font-mono text-center text-red-500">₹{r.operationalCost?.toLocaleString() || '0'}</td>
                    <td className="py-3.5 px-6 font-mono text-center font-bold">₹{r.netProfit?.toLocaleString() || '0'}</td>
                    <td className="py-3.5 px-6 font-mono text-right font-black text-brand-655 text-sm">{r.roi}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

          ) : reportType === 'drivers' ? (
            
            /* DRIVERS PERFORMANCE TABLE */
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 font-bold uppercase text-slate-400">
                  <th className="py-3 px-6">Driver Name</th>
                  <th className="py-3 px-6">License No</th>
                  <th className="py-3 px-6 text-center">Safety Score</th>
                  <th className="py-3 px-6 text-center">Completed trips</th>
                  <th className="py-3 px-6 font-mono text-center">Total Distance</th>
                  <th className="py-3 px-6 font-mono text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {reportData.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-950 dark:text-white">{r.name}</td>
                    <td className="py-3.5 px-6 font-mono">{r.licenseNumber}</td>
                    <td className="py-3.5 px-6 text-center font-bold font-mono">{r.safetyScore}/100</td>
                    <td className="py-3.5 px-6 text-center font-semibold font-mono">{r.completedTrips}</td>
                    <td className="py-3.5 px-6 font-mono text-center">{r.distanceTraveled} km</td>
                    <td className="py-3.5 px-6 font-mono text-right text-green-600 dark:text-green-400 font-bold">₹{r.revenueGenerated?.toLocaleString() || '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          ) : (
            
            /* FUEL EFFICIENCY TABLE */
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-850 font-bold uppercase text-slate-450 dark:text-slate-400">
                  <th className="py-3 px-6">Trip ID</th>
                  <th className="py-3 px-6">Fleet Unit</th>
                  <th className="py-3 px-6">Odometer Distance</th>
                  <th className="py-3 px-6">Fuel Consumed</th>
                  <th className="py-3 px-6 text-right">Calculated efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs text-slate-700 dark:text-slate-300">
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-400">No completed trip fuel logs present. Log trip returns first.</td>
                  </tr>
                ) : (
                  reportData.map(r => (
                    <tr key={r.tripId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-900 dark:text-white uppercase">{r.tripId}</td>
                      <td className="py-3.5 px-6 font-semibold">{r.vehicleName} <span className="text-[10px] text-slate-450 font-mono">({r.vehicleRegNumber})</span></td>
                      <td className="py-3.5 px-6 font-mono">{r.distance} km</td>
                      <td className="py-3.5 px-6 font-mono">{r.fuelConsumed} L</td>
                      <td className="py-3.5 px-6 font-mono text-right font-extrabold text-brand-655">{r.efficiency} km/L</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          )}
        </div>

      </div>

    </div>
  );
}
