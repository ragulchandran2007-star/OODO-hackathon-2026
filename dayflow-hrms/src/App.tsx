import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AttendanceTracker } from './components/Attendance/AttendanceTracker';
import {
  Clock, LayoutDashboard, Users, Calendar,
  Banknote, BarChart3, Download, LogOut, ChevronRight
} from 'lucide-react';

// ─── Sidebar ────────────────────────────────────────────────────────────────
const navItems = [
  { label: 'Dashboard',   icon: LayoutDashboard, active: false },
  { label: 'Attendance',  icon: Clock,            active: true  },
  { label: 'Employees',   icon: Users,            active: false },
  { label: 'Leave',       icon: Calendar,         active: false },
  { label: 'Payroll',     icon: Banknote,         active: false },
  { label: 'Analytics',   icon: BarChart3,        active: false },
  { label: 'Export',      icon: Download,         active: false },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  return (
    <aside style={{
      width: 232,
      minHeight: '100vh',
      background: '#0f172a',
      borderRight: '1px solid #1e293b',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Clock size={16} color="white" />
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 14, lineHeight: 1 }}>DayFlow</p>
            <p style={{ color: '#818cf8', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>HRMS</p>
          </div>
        </div>
      </div>

      {/* User card */}
      {user && (
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e293b' }}>
          <div style={{
            background: '#1e293b', borderRadius: 10, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#4f46e5', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontWeight: 700,
              fontSize: 13, flexShrink: 0
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </p>
              <p style={{ color: '#64748b', fontSize: 10, textTransform: 'capitalize', marginTop: 2 }}>
                {user.role} · {user.jobDetails?.department}
              </p>
              <p style={{ color: '#475569', fontSize: 10, marginTop: 1 }}>{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px' }}>
        {navItems.map(({ label, icon: Icon, active }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 9, marginBottom: 2, cursor: 'pointer',
            background: active ? '#4f46e5' : 'transparent',
            color: active ? 'white' : '#64748b',
            fontWeight: active ? 600 : 500,
            fontSize: 12,
            transition: 'all 0.15s',
          }}>
            <Icon size={15} color={active ? 'white' : '#475569'} />
            <span style={{ flex: 1 }}>{label}</span>
            {active && <ChevronRight size={12} color="#a5b4fc" />}
          </div>
        ))}
      </nav>

      {/* Footer info */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', color: '#ef4444' }}>
          <LogOut size={13} />
          <span style={{ fontSize: 11, fontWeight: 500 }}>Sign Out</span>
        </div>
        <p style={{ fontSize: 10, color: '#334155', textAlign: 'center', marginTop: 6 }}>
          DayFlow HRMS · Hackathon 2026
        </p>
      </div>
    </aside>
  );
};

// ─── Header ──────────────────────────────────────────────────────────────────
const Header: React.FC = () => (
  <header style={{
    height: 52, background: 'white', borderBottom: '1px solid #e2e8f0',
    padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0,
  }}>
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Attendance</p>
      <p style={{ fontSize: 10, color: '#94a3b8' }}>
        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
    <div style={{
      fontSize: 11, color: '#64748b',
      background: '#f1f5f9', padding: '4px 12px', borderRadius: 20,
    }}>
      🚀 Hackathon 2026 — Attendance Module
    </div>
  </header>
);

// ─── Main shell ──────────────────────────────────────────────────────────────
const Shell: React.FC = () => {
  const { user, login } = useAuth();

  useEffect(() => {
    if (!user) {
      login({
        id: 'emp-001',
        name: 'Arjun Mehta',
        email: 'arjun@dayflow.in',
        role: 'admin',           // ← change to 'employee' to test employee view
        employeeId: 'EMP001',
        jobDetails: { department: 'Engineering', position: 'Engineering Manager', workLocation: 'Office HQ' },
      });
    }
  }, []);

  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
      <p style={{ color: '#64748b', fontSize: 13 }}>Loading…</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <AttendanceTracker />
        </main>
      </div>
    </div>
  );
};

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

export default App;
