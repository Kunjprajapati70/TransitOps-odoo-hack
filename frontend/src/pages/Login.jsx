import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Truck, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url(/login-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-blue-950/50 backdrop-blur-[2px]" />

      {/* Animated floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* TOP LEFT LOGO */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
        <div className="bg-brand-500 p-2 rounded-xl text-white shadow-lg shadow-brand-500/30">
          <Truck className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-xl tracking-tight text-white leading-none">TransitOps</span>
          <span className="text-[10px] text-blue-300/80 font-medium tracking-wider uppercase">Smart Transport Platform</span>
        </div>
      </div>

      {/* GLASSMORPHISM LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        <div
          className="rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(15, 23, 42, 0.70)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* Card Header */}
          <div className="px-8 pt-8 pb-6 border-b border-white/10">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-400">Sign in to your TransitOps account</p>
          </div>

          {/* Card Body */}
          <div className="px-8 py-7 space-y-5">

            {/* Error Alert */}
            {error && (
              <div className="flex gap-3 bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl text-red-300 text-sm animate-shake">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dispatcher@transitops.com"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500/50 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500/50 transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-600 text-brand-500 focus:ring-brand-500/30 bg-transparent"
                  />
                  <span className="text-xs">Remember me</span>
                </label>
                <a href="#" className="text-xs font-semibold text-brand-400 hover:text-brand-300 hover:underline transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-6 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25"
                style={{
                  background: submitting
                    ? 'rgba(99,102,241,0.5)'
                    : 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Authenticating...
                  </span>
                ) : (
                  'Sign In →'
                )}
              </button>
            </form>

            {/* Role hints */}
            <div className="mt-2 p-4 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Demo Accounts</p>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
                <span>🚛 Fleet Manager</span>
                <span>📋 Dispatcher</span>
                <span>🛡️ Safety Officer</span>
                <span>💰 Financial Analyst</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-2 font-mono">All passwords: <span className="text-slate-400">password123</span></p>
            </div>

          </div>

          {/* Card Footer */}
          <div className="px-8 pb-6 text-center text-[10px] text-slate-600 tracking-wider uppercase font-mono">
            TransitOps © 2026 — RBAC System Secured
          </div>
        </div>
      </div>

    </div>
  );
}
