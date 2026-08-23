import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { EmployeeDashboard } from './components/Dashboard/EmployeeDashboard';
import { EmployeeList } from './components/Employees/EmployeeList';
import { EmployeeProfileModal } from './components/Employees/EmployeeProfileModal';
import { AddEmployeeModal } from './components/Employees/AddEmployeeModal';
import { AttendanceTracker } from './components/Attendance/AttendanceTracker';
import { LeaveManagement } from './components/Leave/LeaveManagement';
import { ApplyLeaveModal } from './components/Leave/ApplyLeaveModal';
import { PayrollManagement } from './components/Payroll/PayrollManagement';
import { AnalyticsReports } from './components/Analytics/AnalyticsReports';
import { ProjectExportModal } from './components/Export/ProjectExportModal';
import { LoginScreen } from './components/Auth/LoginScreen';
import { WelcomeTransition } from './components/Auth/WelcomeTransition';
import { GlobalLiquidEther } from './components/GlobalLiquidEther';
import { Employee } from './types';

const MainLayout: React.FC = () => {
  const { user, role, activeTab, setActiveTab } = useAuth();
  
  // Modals state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<Employee | null>(null);
  const [profileViewOnly, setProfileViewOnly] = useState(false);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);

  return (
    <div className="app-shell min-h-screen flex flex-col font-sans text-slate-100 antialiased selection:bg-violet-400 selection:text-white animate-in fade-in duration-500">
      <GlobalLiquidEther />
      {/* Global Application Header */}
      <Header
        onOpenProjectExport={() => setShowExportModal(true)}
        onOpenAuth={() => {}}
        onOpenProfile={() => {
          if (user) {
            setSelectedProfileEmployee(user);
            setProfileViewOnly(false); // "My Profile" is always editable by its owner
          }
        }}
      />

      {/* Main Workspace Layout */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Main Stage View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab !== 'dashboard' && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/12 px-3 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-md transition-all hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-violet-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
            )}
            
            {/* 1. DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              role === 'admin' ? (
                <AdminDashboard
                  onOpenAddEmployee={() => setShowAddEmployeeModal(true)}
                  onSelectEmployee={(emp) => {
                    setSelectedProfileEmployee(emp);
                    setProfileViewOnly(true);
                  }}
                />
              ) : (
                <EmployeeDashboard
                  onApplyLeave={() => setShowApplyLeaveModal(true)}
                  onViewPayslips={() => setActiveTab('payroll')}
                  onViewAttendance={() => setActiveTab('attendance')}
                />
              )
            )}

            {/* 2. EMPLOYEES DIRECTORY */}
            {activeTab === 'employees' && (
              <EmployeeList
                onSelectEmployee={(emp) => {
                  setSelectedProfileEmployee(emp);
                  setProfileViewOnly(true); // Cards open the profile in a view-only (non-editable) mode
                }}
                onOpenAddModal={() => setShowAddEmployeeModal(true)}
              />
            )}

            {/* 3. ATTENDANCE & LIVE CLOCK */}
            {activeTab === 'attendance' && (
              <AttendanceTracker />
            )}

            {/* 4. LEAVE & TIME-OFF */}
            {activeTab === 'leaves' && (
              <LeaveManagement />
            )}

            {/* 5. PAYROLL & COMPENSATION */}
            {activeTab === 'payroll' && (
              <PayrollManagement />
            )}

            {/* 6. ANALYTICS & REPORTS */}
            {activeTab === 'analytics' && (
              <AnalyticsReports />
            )}

            {/* 7. PROJECT EXPORT & ARCHITECTURE */}
            {activeTab === 'project-export' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
                <div className="max-w-3xl space-y-4">
                  <h1 className="text-2xl font-bold text-slate-900">Project Flow & Source Code Package</h1>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Dayflow HRMS is built with a decoupled MongoDB backend and a responsive React frontend.
                    You can inspect the full architecture or download the ready-to-run ZIP archive below.
                  </p>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Open Flow Diagram & ZIP Packager
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Global Modals */}
      {showExportModal && (
        <ProjectExportModal onClose={() => setShowExportModal(false)} />
      )}

      {showAddEmployeeModal && (
        <AddEmployeeModal
          onClose={() => setShowAddEmployeeModal(false)}
          onCreated={() => {
            // Refreshes view
          }}
        />
      )}

      {selectedProfileEmployee && (
        <EmployeeProfileModal
          employee={selectedProfileEmployee}
          viewOnly={profileViewOnly}
          onClose={() => {
            setSelectedProfileEmployee(null);
            setProfileViewOnly(false);
          }}
          onUpdated={() => {
            // refresh
          }}
        />
      )}

      {showApplyLeaveModal && (
        <ApplyLeaveModal
          onClose={() => setShowApplyLeaveModal(false)}
          onSubmitted={() => {
            // refresh
          }}
        />
      )}
    </div>
  );
};

const AppGate: React.FC = () => {
  const { user, loading, justLoggedIn, clearJustLoggedIn } = useAuth();
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    if (justLoggedIn && user) {
      setShowTransition(true);
    }
  }, [justLoggedIn, user]);

  // Initial session restore check (from a previously persisted, real login)
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-900/40 animate-pulse">
            D
          </div>
          <div className="w-40 h-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-1/2 bg-indigo-500 rounded-full animate-[loading-bar_1.1s_ease-in-out_infinite]" />
          </div>
        </div>
        <style>{`
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(60%); }
            100% { transform: translateX(220%); }
          }
        `}</style>
      </div>
    );
  }

  // Not authenticated: main app must never be shown
  if (!user) {
    return <LoginScreen />;
  }

  // Just authenticated: play a short, polished welcome transition, then reveal the app
  if (showTransition) {
    return (
      <WelcomeTransition
        userName={user.name}
        onComplete={() => {
          setShowTransition(false);
          clearJustLoggedIn();
        }}
      />
    );
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}
