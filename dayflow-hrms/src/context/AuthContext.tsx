import React, { createContext, useContext, useState, useCallback } from 'react'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  role: 'admin' | 'employee' | null
  login: (user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

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
