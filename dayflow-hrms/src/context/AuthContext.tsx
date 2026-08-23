import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: Employee | null;
  role: UserRole;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: { employeeId?: string; name: string; email: string; password: string; role: 'admin' | 'employee' }) => Promise<{ token: string; user: Employee } | undefined>;
  logout: () => void;
  justLoggedIn: boolean;
  clearJustLoggedIn: () => void;
  switchUser: (email: string) => Promise<void>;
  updateCurrentUserProfile: (updates: Partial<Employee>) => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [justLoggedIn, setJustLoggedIn] = useState<boolean>(false);

  // Only restore a session if the user actually authenticated before
  // (persisted token/email from a real login). No silent auto-login.
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('dayflow_token');
        const storedEmail = localStorage.getItem('dayflow_user_email');
        if (storedToken && storedEmail) {
          const employees = await api.getEmployees();
          const matched = employees.find(e => e.email === storedEmail);
          if (matched) {
            setUser(matched);
            setToken(storedToken);
          } else {
            localStorage.removeItem('dayflow_token');
            localStorage.removeItem('dayflow_user_email');
          }
        }
      } catch (err) {
        console.error('Failed to restore session', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string = 'password123') => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('dayflow_user_email', res.user.email);
      localStorage.setItem('dayflow_token', res.token);
      setJustLoggedIn(true);
    } catch (err: any) {
      setError(err.message || 'Invalid Login ID/Email or password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { employeeId?: string; name: string; email: string; password: string; role: 'admin' | 'employee' }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('dayflow_user_email', res.user.email);
      localStorage.setItem('dayflow_token', res.token);
      setJustLoggedIn(true);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('dayflow_user_email');
    localStorage.removeItem('dayflow_token');
    setUser(null);
    setToken(null);
    setError(null);
    setJustLoggedIn(false);
  };

  const clearJustLoggedIn = () => setJustLoggedIn(false);

  const switchUser = async (email: string) => {
    setLoading(true);
    try {
      const employees = await api.getEmployees();
      const target = employees.find(e => e.email === email);
      if (target) {
        setUser(target);
        localStorage.setItem('dayflow_user_email', target.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const updated = await api.getEmployeeById(user.id);
      setUser(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const updateCurrentUserProfile = async (updates: Partial<Employee>) => {
    if (!user) return;
    try {
      const updated = await api.updateEmployee(user.id, updates);
      setUser(updated);
    } catch (err) {
      console.error('Failed to update profile', err);
      throw err;
    }
  };

  const role: UserRole = user?.role || 'employee';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        error,
        login,
        register,
        logout,
        switchUser,
        updateCurrentUserProfile,
        activeTab,
        setActiveTab,
        refreshUser,
        justLoggedIn,
        clearJustLoggedIn
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
