import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import api from '../services/api';
import { 
  LayoutDashboard, Truck, Users, Route, 
  Wrench, Fuel, BarChart3, Settings, 
  LogOut, Sun, Moon, Bell, Menu, X, Check, ShieldAlert
} from 'lucide-react';

export default function DashboardLayout({ children, currentPage, setCurrentPage }) {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  // Search logic states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Dispatcher', 'Admin'] },
    { id: 'fleet', label: 'Fleet', icon: Truck, roles: ['Fleet Manager', 'Admin'] },
    { id: 'drivers', label: 'Drivers', icon: Users, roles: ['Safety Officer', 'Admin'] },
    { id: 'trips', label: 'Trips', icon: Route, roles: ['Dispatcher', 'Admin'] },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, roles: ['Fleet Manager', 'Admin'] },
    { id: 'fuel-expenses', label: 'Fuel & Expenses', icon: Fuel, roles: ['Financial Analyst', 'Admin'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['Financial Analyst', 'Admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: [] } // all roles can see settings
  ];

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setUnreadNotifications(res.data.data);
      }
      const countRes = await api.get('/notifications/unread-count');
      if (countRes.data.success) {
        setNotifCount(countRes.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      fetchNotifs();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleGlobalSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim().length === 0) {
      setSearchResults(null);
      return;
    }

    try {
      // Query vehicles, drivers, and trips by keyword
      const vehicleRes = await api.get(`/vehicles?search=${encodeURIComponent(val)}`);
      const driverRes = await api.get(`/drivers?search=${encodeURIComponent(val)}`);
      const tripRes = await api.get(`/trips?search=${encodeURIComponent(val)}`);

      setSearchResults({
        vehicles: vehicleRes.data.data.slice(0, 3),
        drivers: driverRes.data.data.slice(0, 3),
        trips: tripRes.data.data.slice(0, 3)
      });
    } catch (err) {
      console.error('Global search error:', err.message);
    }
  };

  const selectSearchResult = (pageToLoad) => {
    setCurrentPage(pageToLoad);
    setSearchQuery('');
    setSearchResults(null);
  };

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-[#08101d] transition-colors duration-300">
      
      {/* 1. SIDEBAR FOR DESKTOP & MOBILE COVERS */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0d1f3c 60%, #0f2347 100%)', borderRight: '1px solid rgba(99,102,241,0.12)' }}>
        <div className="h-16 flex items-center justify-between px-6 border-b" style={{ borderColor: 'rgba(99,102,241,0.15)', background: 'rgba(5,11,28,0.8)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg text-white shadow-lg" style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">TransitOps</span>
              <div className="text-[9px] font-medium tracking-widest uppercase" style={{ color: 'rgba(148,163,184,0.6)' }}>Fleet Management</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menuItems
            .filter((item) => item.roles.length === 0 || item.roles.includes(user?.role))
            .map((item) => {
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group`}
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(59,130,246,0.15) 100%)',
                  borderLeft: '3px solid #6366f1',
                  color: '#a5b4fc',
                  boxShadow: '0 0 20px rgba(99,102,241,0.15)',
                } : {
                  color: 'rgba(148,163,184,0.7)',
                  borderLeft: '3px solid transparent',
                }}
              >
                <item.icon className={`w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-110 flex-shrink-0`}
                  style={{ color: isActive ? '#818cf8' : 'rgba(148,163,184,0.6)' }} />
                <span className={isActive ? 'text-indigo-200 font-semibold' : 'group-hover:text-slate-200'}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(99,102,241,0.12)', background: 'rgba(5,11,28,0.5)' }}>
          {/* User mini profile */}
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)' }}>
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-300 truncate">{user?.name}</div>
              <div className="text-[10px] font-mono truncate" style={{ color: 'rgba(148,163,184,0.5)' }}>{user?.role}</div>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
            style={{ color: 'rgba(248,113,113,0.8)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Side background overlay for mobile menu */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/55 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. MAIN CONTAINER */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        
        {/* TOP BAR / NAVIGATION HEADER */}
        <header 
          className="h-16 sticky top-0 z-20 flex items-center justify-between px-6 backdrop-blur-xl"
          style={theme === 'dark' ? { 
            background: 'rgba(8,16,29,0.90)', 
            borderBottom: '1px solid rgba(99,102,241,0.12)' 
          } : { 
            background: 'rgba(255,255,255,0.85)', 
            borderBottom: '1px solid rgba(226,232,240,0.9)' 
          }}
        >
          
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 p-1.5 rounded-lg dark:hover:bg-slate-800">
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Global Search */}
            <div className="relative max-w-sm w-full hidden sm:block">
              <input
                type="text"
                value={searchQuery}
                onChange={handleGlobalSearch}
                placeholder="Global search vehicle, driver, trip..."
                className="w-full py-2 pl-4 pr-10 rounded-xl text-sm border border-slate-200 bg-slate-100/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-white"
              />
              <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-mono">⌘K</span>

              {/* Global search result popover */}
              {searchResults && searchQuery && (
                <div className="absolute top-12 left-0 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 text-sm max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-500 dark:text-slate-405">Search Hits</span>
                    <button onClick={() => setSearchResults(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Vehicles */}
                  <div className="mb-3">
                    <div className="text-xs text-brand-650 font-bold mb-1 uppercase tracking-wider">Vehicles</div>
                    {searchResults.vehicles.length === 0 ? (
                      <div className="text-xs text-slate-400 px-2">No vehicle hits.</div>
                    ) : (
                      searchResults.vehicles.map(v => (
                        <div 
                          key={v._id} 
                          onClick={() => selectSearchResult('fleet')}
                          className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer flex justify-between text-xs"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-200">{v.name}</span>
                          <span className="text-slate-450">{v.registrationNumber}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Drivers */}
                  <div className="mb-3">
                    <div className="text-xs text-brand-650 font-bold mb-1 uppercase tracking-wider">Drivers</div>
                    {searchResults.drivers.length === 0 ? (
                      <div className="text-xs text-slate-400 px-2">No driver hits.</div>
                    ) : (
                      searchResults.drivers.map(d => (
                        <div 
                          key={d._id} 
                          onClick={() => selectSearchResult('drivers')}
                          className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer flex justify-between text-xs"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-200">{d.name}</span>
                          <span className="text-slate-450">{d.licenseNumber}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Trips */}
                  <div>
                    <div className="text-xs text-brand-650 font-bold mb-1 uppercase tracking-wider">Trips</div>
                    {searchResults.trips.length === 0 ? (
                      <div className="text-xs text-slate-400 px-2">No trip hits.</div>
                    ) : (
                      searchResults.trips.map(t => (
                        <div 
                          key={t._id} 
                          onClick={() => selectSearchResult('trips')}
                          className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer flex justify-between text-xs"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-200">{t.tripId}</span>
                          <span className="text-slate-450">{t.source} &rarr; {t.destination}</span>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Dark mode switcher */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl transition-all active:scale-95"
              style={theme === 'dark' ? {
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: '#a5b4fc'
              } : {
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(226,232,240,0.8)',
                color: '#475569'
              }}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Notification button dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl relative transition-all active:scale-95"
                style={theme === 'dark' ? {
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: '#a5b4fc'
                } : {
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(226,232,240,0.8)',
                  color: '#475569'
                }}
              >
                <Bell className="w-4 h-4" />
                {notifCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-extrabold animate-pulse">
                    {notifCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div 
                  className="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl p-4 z-50"
                  style={theme === 'dark' ? {
                    background: '#0d1a2e',
                    border: '1px solid rgba(99,102,241,0.15)',
                  } : {
                    background: '#ffffff',
                    border: '1px solid rgba(226,232,240,0.9)',
                  }}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <span className="font-bold text-sm text-slate-950 dark:text-white">Active Alerts ({notifCount})</span>
                    <button 
                      onClick={markAllRead}
                      className="text-xs text-brand-600 hover:underline dark:text-brand-405 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {unreadNotifications.length === 0 ? (
                      <div className="text-center text-xs py-6 text-slate-400">All quiet! No pending compliance alerts.</div>
                    ) : (
                      unreadNotifications.map(n => (
                        <div 
                          key={n._id} 
                          className={`p-2.5 rounded-xl border flex gap-2 text-xs transition-colors ${
                            n.isRead 
                              ? 'bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/40 text-slate-450' 
                              : 'bg-brand-50/50 dark:bg-brand-950/20 border-brand-100/50 dark:border-brand-900/10 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <ShieldAlert className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                          <div className="flex-1">
                            <p>{n.message}</p>
                            <span className="text-[9px] text-slate-450 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile widget */}
            <div 
              className="flex items-center gap-3 pl-3 ml-1"
              style={{ borderLeft: theme === 'dark' ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(226,232,240,0.9)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#3b82f6)' }}>
                {user?.name?.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-white">{user.name}</div>
                <div className="text-[10px] font-mono" style={{ color: theme === 'dark' ? 'rgba(148,163,184,0.5)' : '#94a3b8' }}>{user.role}</div>
              </div>
            </div>

          </div>
        </header>

        {/* 3. SCROLLABLE PAGE VIEW */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
