import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Bar, Pie 
} from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { 
  Truck, Users, Route, Percent, DollarSign, Wrench, ArrowRight
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data.success) {
          setStats(res.data.data.kpis);
          setCharts(res.data.data.charts);
        }

        // Fetch recent trips
        const tripRes = await api.get('/trips?limit=5');
        if (tripRes.data.success) {
          setRecentTrips(tripRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  // Monthly Rev vs Exp Chart
  const barChartData = {
    labels: charts?.monthlyLabels || [],
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: charts?.revenueDataset || [],
        backgroundColor: '#f59e0b',
        borderRadius: 8,
      },
      {
        label: 'Operational Expenses (₹)',
        data: charts?.expenseDataset || [],
        backgroundColor: '#475569',
        borderRadius: 8,
      }
    ]
  };

  // Vehicle Status distribution Chart
  const pieChartData = {
    labels: charts?.vehicleStatusDistribution?.labels || [],
    datasets: [
      {
        data: charts?.vehicleStatusDistribution?.data || [],
        backgroundColor: ['#22c55e', '#3b82f6', '#f97316', '#ef4444'],
        borderWidth: 1,
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
      case 'Dispatched': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case 'On Trip': return 'bg-blue-100 text-blue-750 dark:bg-blue-950 dark:text-blue-300';
      case 'Draft': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Filters (Mock display match mockup) */}
      <div className="flex flex-wrap gap-4 items-center justify-between pb-2 border-b border-slate-205 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Dashboard Overview</h1>
          <p className="text-xs text-slate-400">Fleet summary, utilization, and live logs</p>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <select 
            value={vehicleTypeFilter} 
            onChange={(e) => setVehicleTypeFilter(e.target.value)}
            className="bg-white border dark:bg-slate-900 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-650 dark:text-slate-300"
          >
            <option value="All">Vehicle Type: All</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Mini">Mini</option>
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border dark:bg-slate-900 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-650 dark:text-slate-300"
          >
            <option value="All">Status: All</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
          </select>
        </div>
      </div>

      {/* KPI GRID CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="kpi-card border-l-4 border-l-brand-500">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active fleet</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.activeVehicles || 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Total: {stats?.totalVehicles || 0}</div>
          <Truck className="absolute right-4 bottom-4 w-6 h-6 text-slate-200 dark:text-slate-800" />
        </div>

        <div className="kpi-card border-l-4 border-l-green-500">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Available vehicles</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.availableVehicles || 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Ready for dispatch</div>
          <Truck className="absolute right-4 bottom-4 w-6 h-6 text-green-200 dark:text-green-950/30" />
        </div>

        <div className="kpi-card border-l-4 border-l-orange-500">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vehicles In Shop</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{String(stats?.vehiclesInMaintenance || 0).padStart(2, '0')}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Undergoing repair</div>
          <Wrench className="absolute right-4 bottom-4 w-6 h-6 text-orange-200 dark:text-orange-950/30" />
        </div>

        <div className="kpi-card border-l-4 border-l-blue-500">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Drivers on Duty</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.driversOnDuty || 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Total staff: {stats?.totalDrivers || 0}</div>
          <Users className="absolute right-4 bottom-4 w-6 h-6 text-blue-200 dark:text-blue-950/30" />
        </div>

        <div className="kpi-card border-l-4 border-l-indigo-500">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Trips</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.activeTrips || 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Completed: {stats?.completedTrips || 0}</div>
          <Route className="absolute right-4 bottom-4 w-6 h-6 text-indigo-200 dark:text-indigo-950/30" />
        </div>

        <div className="kpi-card border-l-4 border-l-amber-500">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fleet Utilization</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.fleetUtilization || 0}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Capacity efficiency</div>
          <Percent className="absolute right-4 bottom-4 w-6 h-6 text-amber-200 dark:text-amber-950/30" />
        </div>

        <div className="kpi-card border-l-4 border-l-teal-500">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fuel Cost</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">₹{stats?.totalFuelCost || 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Auto aggregated</div>
          <DollarSign className="absolute right-4 bottom-4 w-6 h-6 text-teal-200 dark:text-teal-950/30" />
        </div>

        <div className="kpi-card border-l-4 border-l-slate-500">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Op Cost</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">₹{(stats?.totalFuelCost || 0) + (stats?.totalMaintenanceCost || 0)}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Fuel + Maintenance</div>
          <DollarSign className="absolute right-4 bottom-4 w-6 h-6 text-slate-200 dark:text-slate-800" />
        </div>

      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue vs Fuel analytics Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-4">Revenue vs Operational Expenses (6 Months)</h2>
          <div className="h-72">
            <Bar 
              data={barChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                  y: { grid: { color: 'rgba(148, 163, 184, 0.15)' } },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="p-6 rounded-2xl glass-panel flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-4">Vehicle Fleet Status</h2>
          </div>
          <div className="h-60 flex justify-center items-center">
            <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

      </div>

      {/* RECENT TRIPS LOGS */}
      <div className="p-6 rounded-2xl glass-panel">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-405">Recent Dispatch Logs</h2>
            <p className="text-xs text-slate-400">Overview of recent trip dispatches</p>
          </div>
          <button className="text-xs text-brand-600 dark:text-brand-405 font-bold flex items-center gap-1 hover:underline">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-450 dark:text-slate-400">
                <th className="py-3 px-4">Trip ID</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Weight (kg)</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentTrips.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-400 font-medium">No logs present.</td>
                </tr>
              ) : (
                recentTrips.map(trip => (
                  <tr key={trip._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{trip.tripId}</td>
                    <td className="py-3 px-4">{trip.source} &rarr; {trip.destination}</td>
                    <td className="py-3 px-4 font-medium">{trip.vehicle?.name || 'N/A'} <span className="text-[10px] text-slate-450 font-mono">({trip.vehicle?.registrationNumber})</span></td>
                    <td className="py-3 px-4">{trip.driver?.name || 'N/A'}</td>
                    <td className="py-3 px-4 font-mono">{trip.cargoWeight} kg</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
