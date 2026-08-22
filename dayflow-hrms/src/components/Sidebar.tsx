import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarOff, 
  Wallet, 
  BarChart3, 
  FileArchive, 
  ShieldAlert,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, role, user } = useAuth();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      adminOnly: false
    },
    {
      id: 'employees',
      label: 'Employees Directory',
      icon: Users,
      badge: role === 'admin' ? 'Manage' : null,
      adminOnly: false
    },
    {
      id: 'attendance',
      label: 'Attendance & Clock',
      icon: Clock,
      badge: 'Live',
      adminOnly: false
    },
    {
      id: 'leaves',
      label: 'Leave & Time-Off',
      icon: CalendarOff,
      badge: null,
      adminOnly: false
    },
    {
      id: 'payroll',
      label: 'Payroll & Salary',
      icon: Wallet,
      badge: role === 'admin' ? 'Payroll Control' : 'Payslips',
      adminOnly: false
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
      badge: null,
      adminOnly: false
    },
    {
      id: 'project-export',
      label: 'Project ZIP & Flow',
      icon: FileArchive,
      badge: 'MongoDB',
      adminOnly: false
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between h-[calc(100vh-57px)] sticky top-[57px] select-none">
      <div className="p-3 space-y-6 overflow-y-auto">
        {/* Role & Workspace Indicator */}
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Portal</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              role === 'admin' 
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' 
                : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
            }`}>
              {role === 'admin' ? 'HR Administrator' : 'Staff Portal'}
            </span>
          </div>
          <p className="text-xs text-slate-200 font-medium mt-1 truncate">{user?.name || 'Guest User'}</p>
          <p className="text-[11px] text-slate-400 truncate">{user?.jobDetails.title}</p>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2">
            Main Modules
          </div>
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-3 border-t border-slate-800">
        <div className="bg-slate-800/40 rounded-lg p-2.5 border border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-indigo-300 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Full-Stack Architecture</span>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-400">
            Node.js Express + MongoDB ready backend with real REST API endpoints.
          </p>
        </div>
      </div>
    </aside>
  );
};
