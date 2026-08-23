import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: Employee | null;
  role: UserRole;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  register: (data: { employeeId?: string; name: string; email: string; password: string; role: 'admin' | 'employee' }) => Promise<{ token: string; user: Employee }>;
  logout: () => void;
  switchUser: (email: string) => Promise<void>;
  updateCurrentUserProfile: (updates: Partial<Employee>) => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [token, setToken] = useState<string | null>('mock-jwt-token');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Initialize with default HR admin or stored user
  useEffect(() => {
    const initAuth = async () => {
      try {
        const employees = await api.getEmployees();
        if (employees.length > 0) {
          const storedEmail = localStorage.getItem('dayflow_user_email');
          const matched = storedEmail ? employees.find(e => e.email === storedEmail) : null;
          setUser(matched || employees[0]); // Default to first employee (Sarah Jenkins - HR Admin)
        }
      } catch (err) {
        console.error('Failed to load initial user', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string = 'password123', _role?: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('dayflow_user_email', res.user.email);
    } catch (err: any) {
      // Fallback find employee
      const employees = await api.getEmployees();
      const found = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setUser(found);
        localStorage.setItem('dayflow_user_email', found.email);
      } else {
        setError(err.message || 'Login failed');
        throw new Error(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { employeeId?: string; name: string; email: string; password: string; role: 'admin' | 'employee' }) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('dayflow_user_email', res.user.email);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('dayflow_user_email');
    setUser(null);
    setToken(null);
  };

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
        refreshUser
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
