import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  CalendarOff, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Building2,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DashboardStats, LeaveRequest, AttendanceRecord, Employee } from '../../types';

interface AdminDashboardProps {
  onOpenAddEmployee: () => void;
  onSelectEmployee: (emp: Employee) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenAddEmployee,
  onSelectEmployee
}) => {
  const { setActiveTab } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [departmentCounts, setDepartmentCounts] = useState<Record<string, number>>({});
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, leavesData, empsData] = await Promise.all([
        api.getAnalytics(),
        api.getLeaves({ status: 'Pending' }),
        api.getEmployees()
      ]);

      setStats(analyticsData.stats);
      setDepartmentCounts(analyticsData.departmentCounts);
      setTodayAttendance(analyticsData.todayAttendance);
      setPendingLeaves(leavesData);
      setEmployees(empsData);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickReview = async (leaveId: string, status: 'Approved' | 'Rejected') => {
    try {
      setReviewingId(leaveId);
      await api.reviewLeave(leaveId, {
        status,
        reviewerNotes: status === 'Approved' ? 'Quick approved via Admin Dashboard' : 'Rejected via Admin Dashboard',
        reviewerName: 'HR Admin'
      });
      await loadDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-800">
                Odoo-Style HRMS Core
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-2">
              HR Administration & Workforce Operations
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Monitor active shifts, approve pending leaves, inspect employee records, and oversee payroll across all departments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddEmployee}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Onboard Employee
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Payroll Control
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Headcount */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Workforce</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats?.totalEmployees || 0}</span>
            <span className="text-xs font-medium text-emerald-600">Active Staff</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 4 departments</p>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Present Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats?.presentToday || 0}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {stats?.attendanceRate || 0}% rate
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{stats?.onLeaveToday || 0} on approved leave</p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Leave Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <CalendarOff className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{pendingLeaves.length}</span>
            <span className="text-xs font-medium text-amber-700">Requires Action</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting manager approval</p>
        </div>

        {/* Monthly Payroll Total */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Monthly Net Payroll</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ${(stats?.monthlyPayrollTotal || 0).toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500">/ mo</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Status: Approved & Scheduled</p>
        </div>
      </div>

      {/* Action Queues & Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Leave Approvals Queue (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarOff className="w-4 h-4 text-indigo-600" />
                Pending Leave Requests
              </h2>
              <p className="text-xs text-slate-500">Review time-off requests submitted by team members</p>
            </div>
            <button
              onClick={() => setActiveTab('leaves')}
              className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">All caught up!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No pending leave requests in the queue.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingLeaves.map(leave => (
                <div key={leave.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {leave.employeeName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{leave.employeeName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {leave.department}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                          {leave.leaveType} Leave
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">{leave.reason}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Duration: <span className="font-semibold text-slate-700">{leave.startDate}</span> to{' '}
                        <span className="font-semibold text-slate-700">{leave.endDate}</span> ({leave.totalDays} days)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleQuickReview(leave.id, 'Approved')}
                      disabled={reviewingId === leave.id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleQuickReview(leave.id, 'Rejected')}
                      disabled={reviewingId === leave.id}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 border border-rose-200 transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Department Breakdown & Quick Stats (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 min-w-0">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Departments Headcount
            </h2>
            <p className="text-xs text-slate-500">Distribution across business units</p>
          </div>

          <div className="space-y-3">
            {Object.entries(departmentCounts).map(([dept, count]) => {
              const numCount = Number(count);
              const percentage = stats?.totalEmployees ? Math.round((numCount / stats.totalEmployees) * 100) : 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{dept}</span>
                    <span className="text-slate-500 font-semibold">{numCount} staff ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-900 mb-2">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('employees')}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-left transition-all text-xs font-medium"
              >
                Employees Directory
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-left transition-all text-xs font-medium"
              >
                Daily Timesheets
              </button>
              <button
                onClick={() => setActiveTab('payroll')}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-left transition-all text-xs font-medium"
              >
                Salary Structures
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-left transition-all text-xs font-medium"
              >
                Reports & Audit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Attendance Roster & Employee Quick Switch */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Today's Attendance Roster
            </h2>
            <p className="text-xs text-slate-500">Live punch status and check-in times for all employees</p>
          </div>
          <button
            onClick={() => setActiveTab('attendance')}
            className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
          >
            Open Timesheet Tracker <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Employee</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Punch In</th>
                <th className="pb-3">Punch Out</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map(emp => {
                const att = todayAttendance.find(a => a.employeeId === emp.employeeId || a.userId === emp.id);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 flex items-center gap-2.5">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{emp.name}</p>
                        <p className="text-[10px] text-slate-400">{emp.employeeId}</p>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{emp.jobDetails.department}</td>
                    <td className="py-3 font-medium text-slate-800">
                      {att?.checkInTime || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3 font-medium text-slate-800">
                      {att?.checkOutTime || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3">
                      {att?.status === 'Present' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          Present
                        </span>
                      ) : att?.status === 'Leave' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                          On Leave
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-semibold">
                          Not Punched
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onSelectEmployee(emp)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Inspect Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
