import React, { createContext, useContext, useState, useCallback } from 'react'
import type { User } from '../types'
import api from '../services/api'

interface AuthContextType {
  user: User | null
  role: 'admin' | 'employee' | null
  login: (user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'dayflow_token'
const USER_KEY = 'dayflow_user'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? (JSON.parse(stored) as User) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const persist = (nextToken: string, nextUser: User) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  // If api.ts detects a 401, log the user out so the UI can redirect to login
  useEffect(() => {
    window.addEventListener('dayflow:unauthorized', logout)
    return () => window.removeEventListener('dayflow:unauthorized', logout)
  }, [logout])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      persist(data.token, data.user)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const login = (user: User) => setUser(user)
  const logout = () => setUser(null)
  const refreshUser = useCallback(async () => {
    // no-op for now — state is updated directly after punch in/out
  }, [])

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
