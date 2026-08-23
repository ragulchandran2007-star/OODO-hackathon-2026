import React, { useState } from 'react';
import { Lock, Mail, User, ShieldCheck, CheckCircle2, ArrowRight, Building2, Phone, Upload, Eye, EyeOff, Copy, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlobalLiquidEther } from '../GlobalLiquidEther';
import { api } from '../../services/api';

type AuthView = 'signin' | 'signup' | 'forgot';

export const LoginScreen: React.FC = () => {
  const { login, register, error } = useAuth();
  const [view, setView] = useState<AuthView>(() => new URLSearchParams(window.location.search).get('resetToken') ? 'forgot' : 'signin');

  // Sign in state
  const [loginId, setLoginId] = useState('sarah.hr@dayflow.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sign up state
  const [companyName, setCompanyName] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [createdLoginId, setCreatedLoginId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.search).get('resetToken') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    try {
      await login(loginId.trim(), password);
    } catch (err: any) {
      setFormError(err.message || 'Invalid Login ID/Email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (demoEmail: string) => {
    setLoginId(demoEmail);
    setPassword('password123');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!companyName.trim() || !signupName.trim() || !signupEmail.trim() || !signupPhone.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (signupPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        role: 'admin'
      });
      setCreatedLoginId(res?.user?.employeeId || null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create your account.');
    } finally {
      setLoading(false);
    }
  };

  const copyLoginId = (id: string) => {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const resetAllFormsAndGo = (target: AuthView) => {
    setFormError(null);
    setResetSuccess(false);
    setResetMessage(null);
    setDevResetUrl(null);
    setView(target);
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setResetSuccess(false);
    setResetMessage(null);
    setDevResetUrl(null);

    if (!loginId.trim() || !loginId.includes('@')) {
      setFormError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.requestPasswordReset(loginId.trim());
      setResetSuccess(true);
      setResetMessage(res.message);
      setDevResetUrl(res.resetUrl || null);
    } catch (err: any) {
      setFormError(err.message || 'Unable to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(resetToken, newPassword);
      setResetSuccess(true);
      setResetMessage(res.message);
      window.history.replaceState({}, '', window.location.pathname);
      setResetToken('');
      setPassword(newPassword);
    } catch (err: any) {
      setFormError(err.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      <GlobalLiquidEther />
      <div className="absolute inset-0 bg-slate-950/8 pointer-events-none" />

      {/* Brand mark, top-left, visible on larger screens */}
      <div className="absolute top-6 left-6 hidden sm:flex items-center gap-2.5 text-white/90 z-10">
        <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center font-bold text-lg">
          D
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">dayflow</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 border border-white/20">
              HRMS
            </span>
          </div>
          <p className="text-[11px] text-white/60">Every workday, perfectly aligned.</p>
        </div>
      </div>

      <div
        key={view}
        className="login-card relative rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900/80 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold">
              D
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-1.5">
                {view === 'signin' && (<><Sparkles className="w-3.5 h-3.5 text-indigo-300" /> Welcome Back</>)}
                {view === 'signup' && 'Create Your Company Account'}
                {view === 'forgot' && 'Reset Account Password'}
              </h2>
              <p className="text-xs text-slate-400">Enterprise Workforce Management Portal</p>
            </div>
          </div>
        </div>

        {/* ================= SIGN IN VIEW ================= */}
        {view === 'signin' && (
          <>
            <div className="p-4 bg-slate-900/80/40 border-b border-slate-700/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Select Demo Persona (Instant Fill):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('sarah.hr@dayflow.io')}
                  className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    loginId === 'sarah.hr@dayflow.io'
                      ? 'border-violet-300 bg-violet-500/20 font-bold text-white shadow-lg shadow-violet-950/30'
                      : 'border-white/15 bg-violet-950/20 hover:bg-violet-500/15 hover:border-violet-300/60 text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> HR Admin
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">Sarah Jenkins</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoSelect('david.chen@dayflow.io')}
                  className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    loginId === 'david.chen@dayflow.io'
                      ? 'border-violet-300 bg-violet-500/20 font-bold text-white shadow-lg shadow-violet-950/30'
                      : 'border-white/15 bg-violet-950/20 hover:bg-violet-500/15 hover:border-violet-300/60 text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                    <User className="w-3.5 h-3.5" /> Staff Employee
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal">David Chen</div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="p-6 space-y-4">
              {(formError || error) && (
                <div className="p-3 bg-amber-950/40 text-rose-800 rounded-lg text-xs font-medium border border-rose-200 animate-in fade-in slide-in-from-top-1">
                  {formError || error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Login ID / Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                    placeholder="OIJODO20220001 or name@dayflow.io"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => resetAllFormsAndGo('forgot')}
                    className="text-[11px] text-cyan-400 hover:underline font-medium cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-400 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md hover:shadow-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500">
                Don't have an Account?{' '}
                <button
                  type="button"
                  onClick={() => resetAllFormsAndGo('signup')}
                  className="text-cyan-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            </form>
          </>
        )}

        {/* ================= SIGN UP VIEW ================= */}
        {view === 'signup' && (
          <div className="p-6">
            {createdLoginId ? (
              <div className="p-4 bg-teal-950/40 rounded-xl border border-emerald-200 text-center space-y-3 animate-in fade-in zoom-in-95">
                <CheckCircle2 className="w-9 h-9 text-teal-400 mx-auto" />
                <h3 className="text-sm font-bold text-emerald-900">Account Created Successfully</h3>
                <p className="text-[11px] text-teal-300">
                  Your Login ID has been auto-generated. Use it (or your email) to sign in.
                </p>
                <div className="flex items-center justify-center gap-2 bg-slate-800/60/50 border border-emerald-300 rounded-lg px-3 py-2">
                  <span className="font-mono text-sm font-bold text-emerald-900 tracking-wide">{createdLoginId}</span>
                  <button
                    type="button"
                    onClick={() => copyLoginId(createdLoginId)}
                    className="text-teal-300 hover:text-emerald-900 cursor-pointer"
                    aria-label="Copy Login ID"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-teal-300">
                  You're already signed in — taking you to your dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-amber-950/40 text-rose-800 rounded-lg text-xs font-medium border border-rose-200 animate-in fade-in slide-in-from-top-1">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                        placeholder="Odoo India"
                      />
                    </div>
                    <label className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-slate-300 bg-slate-900/80/40 hover:bg-slate-800/60/40 cursor-pointer overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-4 h-4 text-slate-500" />
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Upload your company/app logo (optional)</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                      placeholder="Jordan Doe"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Your Login ID will be auto-generated from your first &amp; last name.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                      placeholder="jordan.doe@company.io"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={signupPhone}
                      onChange={e => setSignupPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={signupConfirmPassword}
                        onChange={e => setSignupConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md hover:shadow-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    <>
                      Sign Up
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => resetAllFormsAndGo('signin')}
                    className="text-cyan-400 font-semibold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}
          </div>
        )}

        {/* ================= FORGOT PASSWORD VIEW ================= */}
        {view === 'forgot' && (
          <div className="p-6">
            {resetSuccess ? (
              <div className="p-4 bg-teal-950/40 rounded-xl border border-emerald-200 text-center space-y-2 animate-in fade-in zoom-in-95">
                <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto" />
                <h3 className="text-xs font-bold text-emerald-900">Password Reset Ready</h3>
                <p className="text-[11px] text-teal-300">
                  {resetMessage || 'Your password reset request was processed.'}
                </p>
                {devResetUrl && (
                  <a
                    href={devResetUrl}
                    className="block rounded-lg border border-emerald-300 bg-emerald-950/20 px-3 py-2 text-[11px] font-semibold text-emerald-100 hover:bg-teal-500/20"
                  >
                    Open development reset link
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => resetAllFormsAndGo('signin')}
                  className="mt-2 text-xs font-semibold text-teal-300 hover:underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={resetToken ? handleConfirmPasswordReset : handleRequestPasswordReset} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-amber-950/40 text-rose-800 rounded-lg text-xs font-medium border border-rose-200">
                    {formError}
                  </div>
                )}

                {resetToken ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                        placeholder="Enter a new password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                        placeholder="Confirm the new password"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={loginId}
                        onChange={e => setLoginId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                        placeholder="name@dayflow.io"
                      />
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  {loading ? 'Processing...' : resetToken ? 'Update Password' : 'Send Reset Link'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => resetAllFormsAndGo('signin')}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-100 mt-2 font-medium cursor-pointer"
                >
                  Back to Sign In
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};







