import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ShieldOff } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if the user's role is in the allowedRoles list
  const hasAccess = !allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-6 animate-fade-in">
        <div className="bg-red-100 dark:bg-red-950/30 p-5 rounded-full mb-5">
          <ShieldOff className="w-10 h-10 text-red-500 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          You don't have permission to access this module. 
          This feature is restricted to: <span className="font-bold text-slate-700 dark:text-slate-300">{allowedRoles?.join(', ')}</span>.
        </p>
        <div className="mt-5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
          Your role: <span className="text-brand-500 font-bold">{user.role}</span>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
