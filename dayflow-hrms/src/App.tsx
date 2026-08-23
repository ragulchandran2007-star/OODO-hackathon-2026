import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
import { AuthModal } from './components/Auth/AuthModal';
import { GlobalLiquidEther } from './components/GlobalLiquidEther';
import { Employee } from './types';

const MainLayout: React.FC = () => {
  const { user, role, activeTab, setActiveTab } = useAuth();
  
  // Modals state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<Employee | null>(null);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      <GlobalLiquidEther />
      <div className="absolute inset-0 bg-slate-100/88 backdrop-blur-[1px] pointer-events-none" />

      {/* Global Application Header */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header
          onOpenProjectExport={() => setShowExportModal(true)}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenProfile={() => {
            if (user) setSelectedProfileEmployee(user);
          }}
        />

        {/* Main Workspace Layout */}
        <div className="flex-1 flex">
          {/* Navigation Sidebar */}
          <Sidebar />

          {/* Dynamic Main Stage View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
            
            {/* 1. DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              role === 'admin' ? (
                <AdminDashboard
                  onOpenAddEmployee={() => setShowAddEmployeeModal(true)}
                  onSelectEmployee={(emp) => setSelectedProfileEmployee(emp)}
                />
              ) : (
                <EmployeeDashboard
                  onOpenProfile={() => { if (user) setSelectedProfileEmployee(user); }}
                  onOpenApplyLeave={() => setShowApplyLeaveModal(true)}
                  onOpenPayslip={() => setActiveTab('payroll')}
                />
              )
            )}

            {/* 2. EMPLOYEES DIRECTORY */}
            {activeTab === 'employees' && (
              <EmployeeList
                onSelectEmployee={(emp) => setSelectedProfileEmployee(emp)}
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
      </div>

      {/* Global Modals */}
      {showExportModal && (
        <ProjectExportModal onClose={() => setShowExportModal(false)} />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
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
          onClose={() => setSelectedProfileEmployee(null)}
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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
