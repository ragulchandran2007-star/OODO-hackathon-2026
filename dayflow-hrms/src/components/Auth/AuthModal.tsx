import React from 'react'

const AuthModal: React.FC = () => {
  const { login, register, loading, error } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'employee'>('employee')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (mode === 'register' && !name.trim()) {
      setLocalError('Please enter your full name')
      return
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(name, email, password, role)
      }
    } catch {
      // error surfaced via AuthContext
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setLocalError(null)
  }

  return (
    <div className="authScreen">
      <div className="authAmbient authAmbient--one" />
      <div className="authAmbient authAmbient--two" />

      <div className="authCard">
        <div className="authBrand">
          <div className="authLogo">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L4 6v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V6l-8-4z"
                fill="url(#authLogoGradient)"
              />
              <path d="M9 12l2 2 4-4" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="authLogoGradient" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#818cf8" />
                  <stop offset="1" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="authBrandName">DayFlow</span>
        </div>

        <h1 className="authTitle">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="authSubtitle">
          {mode === 'login'
            ? 'Sign in to manage your workforce, effortlessly.'
            : 'Join DayFlow and streamline your HR operations.'}
        </p>

        <div className="authTabs">
          <button
            type="button"
            className={`authTab ${mode === 'login' ? 'authTab--active' : ''}`}
            onClick={() => mode !== 'login' && switchMode()}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`authTab ${mode === 'register' ? 'authTab--active' : ''}`}
            onClick={() => mode !== 'register' && switchMode()}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="authForm" noValidate>
          {mode === 'register' && (
            <label className="authField">
              <span className="authFieldLabel">Full name</span>
              <input
                className="authInput"
                type="text"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
          )}

          <label className="authField">
            <span className="authFieldLabel">Email address</span>
            <input
              className="authInput"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="authField">
            <span className="authFieldLabel">Password</span>
            <div className="authPasswordWrap">
              <input
                className="authInput authInput--withIcon"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
              />
              <button
                type="button"
                className="authPasswordToggle"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.5 4.9A9.8 9.8 0 0112 4.5c5 0 9 4 10.5 7.5-.5 1.1-1.2 2.2-2.1 3.2M6.6 6.6C4.5 8 3 10 1.5 12c1.9 4.2 6 7.5 10.5 7.5 1.4 0 2.7-.3 3.9-.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1.5 12S5 4.5 12 4.5 22.5 12 22.5 12 19 19.5 12 19.5 1.5 12 1.5 12z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {mode === 'register' && (
            <label className="authField">
              <span className="authFieldLabel">Account type</span>
              <div className="authRoleToggle">
                <button
                  type="button"
                  className={`authRoleBtn ${role === 'employee' ? 'authRoleBtn--active' : ''}`}
                  onClick={() => setRole('employee')}
                >
                  Employee
                </button>
                <button
                  type="button"
                  className={`authRoleBtn ${role === 'admin' ? 'authRoleBtn--active' : ''}`}
                  onClick={() => setRole('admin')}
                >
                  Admin
                </button>
              </div>
            </label>
          )}

          {(error || localError) && (
            <div className="authError">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
              </svg>
              {localError || error}
            </div>
          )}

          <button className="authSubmit" type="submit" disabled={loading}>
            {loading ? (
              <span className="authSpinner" />
            ) : (
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        <p className="authSwitchLine">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" className="authSwitchLink" onClick={switchMode}>
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthModal
