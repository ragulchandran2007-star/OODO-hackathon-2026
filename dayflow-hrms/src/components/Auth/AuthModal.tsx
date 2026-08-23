import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('sarah.hr@dayflow.io');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('admin');
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot') {
      setResetSuccess(true);
      return;
    }
    setLoading(true);
    try {
      await login(email, password, role);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setRole(demoRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-800/60/50 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/80 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold">
              D
            </div>
            <div>
              <h2 className="text-base font-bold">
                {mode === 'login' ? 'Dayflow HRMS Sign In' : 'Reset Account Password'}
              </h2>
              <p className="text-xs text-slate-400">Enterprise Workforce Management Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast Selector */}
        {mode === 'login' && (
          <div className="p-4 bg-slate-900/80/40 border-b border-slate-700/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Demo Persona (Instant Fill):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoSelect('sarah.hr@dayflow.io', 'admin')}
                className={`p-2 rounded-lg border text-left text-xs transition-all ${
                  email === 'sarah.hr@dayflow.io'
                    ? 'border-indigo-600 bg-cyan-950/40/80 font-bold text-indigo-900'
                    : 'border-slate-700/50 bg-slate-800/60/50 hover:bg-slate-800/60/40 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> HR Admin
                </div>
                <div className="text-[10px] text-slate-500 font-normal">Sarah Jenkins</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSelect('david.chen@dayflow.io', 'employee')}
                className={`p-2 rounded-lg border text-left text-xs transition-all ${
                  email === 'david.chen@dayflow.io'
                    ? 'border-indigo-600 bg-cyan-950/40/80 font-bold text-indigo-900'
                    : 'border-slate-700/50 bg-slate-800/60/50 hover:bg-slate-800/60/40 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <User className="w-3.5 h-3.5" /> Staff Employee
                </div>
                <div className="text-[10px] text-slate-500 font-normal">David Chen</div>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-amber-950/40 text-rose-800 rounded-lg text-xs font-medium border border-rose-200">
              {error}
            </div>
          )}

          {resetSuccess ? (
            <div className="p-4 bg-teal-950/40 rounded-xl border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto" />
              <h3 className="text-xs font-bold text-emerald-900">Password Reset Email Dispatched</h3>
              <p className="text-[11px] text-teal-300">
                A secure reset link has been dispatched to {email}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setResetSuccess(false);
                  setMode('login');
                }}
                className="mt-2 text-xs font-semibold text-teal-300 hover:underline"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-indigo-600"
                    placeholder="name@dayflow.io"
                  />
                </div>
              </div>

              {mode === 'login' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-cyan-400 hover:underline font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-indigo-600"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Role Portal</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as UserRole)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:outline-indigo-600 bg-slate-800/60/50"
                    >
                      <option value="admin">HR Administrator Portal</option>
                      <option value="employee">Staff / Employee Portal</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Portal' : 'Send Reset Link'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-100 mt-2 font-medium"
                >
                  Back to Sign In
                </button>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};







