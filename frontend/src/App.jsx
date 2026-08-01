import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import FuelExpenses from './pages/FuelExpenses';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function MainAppContent() {
  const { user, token } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!token || !user) {
    return <Login />;
  }

  // Render Page Component with appropriate protections
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <ProtectedRoute allowedRoles={['Dispatcher', 'Admin']}>
            <Dashboard />
          </ProtectedRoute>
        );
      case 'fleet':
        return (
          <ProtectedRoute allowedRoles={['Fleet Manager', 'Admin']}>
            <Fleet />
          </ProtectedRoute>
        );
      case 'drivers':
        return (
          <ProtectedRoute allowedRoles={['Safety Officer', 'Admin']}>
            <Drivers />
          </ProtectedRoute>
        );
      case 'trips':
        return (
          <ProtectedRoute allowedRoles={['Dispatcher', 'Admin']}>
            <Trips />
          </ProtectedRoute>
        );
      case 'maintenance':
        return (
          <ProtectedRoute allowedRoles={['Fleet Manager', 'Admin']}>
            <Maintenance />
          </ProtectedRoute>
        );
      case 'fuel-expenses':
        return (
          <ProtectedRoute allowedRoles={['Financial Analyst', 'Admin']}>
            <FuelExpenses />
          </ProtectedRoute>
        );
      case 'analytics':
        return (
          <ProtectedRoute allowedRoles={['Financial Analyst', 'Admin']}>
            <Analytics />
          </ProtectedRoute>
        );
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPageContent()}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
