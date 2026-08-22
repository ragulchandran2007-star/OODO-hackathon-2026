import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CalendarOff, 
  Wallet, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  LogIn, 
  LogOut, 
  FileText, 
  AlertCircle, 
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AttendanceRecord, LeaveRequest, PayrollRecord } from '../../types';

interface EmployeeDashboardProps {
  onOpenProfile: () => void;
  onOpenApplyLeave: () => void;
  onOpenPayslip: (record: PayrollRecord) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  onOpenProfile,
  onOpenApplyLeave,
  onOpenPayslip
}) => {
  const { user, setActiveTab, refreshUser } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [latestPayroll, setLatestPayroll] = useState<PayrollRecord | null>(null);
  const [punchLoading, setPunchLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadUserData = async () => {
    if (!user) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [atts, leaves, payrollList] = await Promise.all([
        api.getAttendance({ userId: user.id, date: todayStr }),
        api.getLeaves({ userId: user.id }),
        api.getPayroll({ employeeId: user.employeeId })
      ]);

      if (atts.length > 0) {
        setTodayAttendance(atts[0]);
      } else {
        setTodayAttendance(null);
      }
      setRecentLeaves(leaves.slice(0, 4));
      if (payrollList.length > 0) {
        setLatestPayroll(payrollList[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const handlePunchIn = async () => {
    if (!user) return;
    setPunchLoading(true);
    try {
      const record = await api.checkIn(user.id, 'Self-service web punch', user.jobDetails.workLocation);
      setTodayAttendance(record);
      await refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchOut = async () => {
    if (!user) return;
    setPunchLoading(true);
    try {
      const record = await api.checkOut(user.id);
      setTodayAttendance(record);
      await refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setPunchLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Live Clock */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/40 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-700/50">
                  {user.jobDetails.department}
                </span>
                <span className="text-xs text-indigo-200">ID: {user.employeeId}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
                Welcome back, {user.name.split(' ')[0]}!
              </h1>
              <p className="text-xs text-indigo-200 mt-0.5">
                {user.jobDetails.title} • {user.jobDetails.employmentType} ({user.jobDetails.workLocation})
              </p>
            </div>
          </div>

          {/* Quick Punch Clock Card */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-4 border border-indigo-500/20 flex flex-col sm:flex-row items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold">Live System Time</p>
              <p className="text-xl font-mono font-bold text-white">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-[11px] text-slate-300">
                {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!todayAttendance?.checkInTime ? (
                <button
                  onClick={handlePunchIn}
                  disabled={punchLoading}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  {punchLoading ? 'Punching...' : 'Punch In Now'}
                </button>
              ) : !todayAttendance.checkOutTime ? (
                <div className="flex flex-col gap-1">
                  <div className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Checked in at {todayAttendance.checkInTime}
                  </div>
                  <button
                    onClick={handlePunchOut}
                    disabled={punchLoading}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    {punchLoading ? 'Punching...' : 'Punch Out'}
                  </button>
                </div>
              ) : (
                <div className="text-center bg-indigo-950/80 px-3 py-2 rounded-lg border border-indigo-700/50">
                  <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Shift Completed
                  </span>
                  <span className="text-[10px] text-slate-300">
                    {todayAttendance.checkInTime} - {todayAttendance.checkOutTime}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Quick Access Feature Cards (Spec Section 3.2.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Profile */}
        <div 
          onClick={onOpenProfile}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <User className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mt-3">Employee Profile</h3>
          <p className="text-xs text-slate-500 mt-0.5">Job details, documents & contact settings</p>
          <div className="mt-3 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
            View full profile →
          </div>
        </div>

        {/* Card 2: Attendance Tracking */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mt-3">Daily Attendance</h3>
          <p className="text-xs text-slate-500 mt-0.5">Monthly timesheets & punch histories</p>
          <div className="mt-3 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            Open calendar view →
          </div>
        </div>

        {/* Card 3: Leave Requests */}
        <div 
          onClick={() => setActiveTab('leaves')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <CalendarOff className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mt-3">Leave & Time-Off</h3>
          <p className="text-xs text-slate-500 mt-0.5">{user.leaveBalances.paid} paid days remaining</p>
          <div className="mt-3 text-[11px] font-semibold text-amber-600 flex items-center gap-1">
            Apply or track status →
          </div>
        </div>

        {/* Card 4: Salary & Payslips */}
        <div 
          onClick={() => setActiveTab('payroll')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Wallet className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mt-3">Salary & Payslips</h3>
          <p className="text-xs text-slate-500 mt-0.5">Net Pay: ${user.salaryStructure.netSalary.toLocaleString()}</p>
          <div className="mt-3 text-[11px] font-semibold text-purple-600 flex items-center gap-1">
            Download pay receipt →
          </div>
        </div>
      </div>

      {/* Main Content Grid: Leave Balances & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Balances Widget (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarOff className="w-4 h-4 text-indigo-600" />
                My Leave Balances (2026)
              </h2>
              <p className="text-xs text-slate-500">Allocated paid and statutory time-off days</p>
            </div>
            <button
              onClick={onOpenApplyLeave}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all"
            >
              Apply for Leave
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Paid Leave */}
            <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
              <span className="text-[11px] font-semibold text-indigo-900">Paid Leave</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-indigo-950">{user.leaveBalances.paid}</span>
                <span className="text-xs text-indigo-600 font-medium">/{user.leaveBalances.paidTotal} days</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-indigo-200 mt-2">
                <div 
                  className="h-full bg-indigo-600 rounded-full" 
                  style={{ width: `${(user.leaveBalances.paid / user.leaveBalances.paidTotal) * 100}%` }}
                />
              </div>
            </div>

            {/* Sick Leave */}
            <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-900">Sick Leave</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-emerald-950">{user.leaveBalances.sick}</span>
                <span className="text-xs text-emerald-600 font-medium">/{user.leaveBalances.sickTotal} days</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-emerald-200 mt-2">
                <div 
                  className="h-full bg-emerald-600 rounded-full" 
                  style={{ width: `${(user.leaveBalances.sick / user.leaveBalances.sickTotal) * 100}%` }}
                />
              </div>
            </div>

            {/* Casual Leave */}
            <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100">
              <span className="text-[11px] font-semibold text-amber-900">Casual Leave</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-amber-950">{user.leaveBalances.casual}</span>
                <span className="text-xs text-amber-600 font-medium">/{user.leaveBalances.casualTotal} days</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-amber-200 mt-2">
                <div 
                  className="h-full bg-amber-600 rounded-full" 
                  style={{ width: `${(user.leaveBalances.casual / user.leaveBalances.casualTotal) * 100}%` }}
                />
              </div>
            </div>

            {/* Unpaid Leave Taken */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-700">Unpaid Taken</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{user.leaveBalances.unpaid}</span>
                <span className="text-xs text-slate-500 font-medium">days</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Deducted from payroll</p>
            </div>
          </div>

          {/* Recent Leave Requests List */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 mb-2">My Recent Applications</h3>
            {recentLeaves.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No leaves applied recently.</p>
            ) : (
              <div className="space-y-2">
                {recentLeaves.map(l => (
                  <div key={l.id} className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{l.leaveType} Leave</span>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span className="text-slate-600">{l.startDate} to {l.endDate} ({l.totalDays}d)</span>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{l.reason}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      l.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Latest Payslip Summary & Quick Actions (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-600" />
                Latest Salary Slip
              </h2>
              <p className="text-xs text-slate-500">August 2026</p>
            </div>
            {latestPayroll && (
              <button
                onClick={() => onOpenPayslip(latestPayroll)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" /> View Slip
              </button>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-4 rounded-xl text-white">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Net Pay Credited</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Direct Deposit
              </span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">
              ${user.salaryStructure.netSalary.toLocaleString()}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px]">Basic Salary</span>
                <span className="font-semibold">${user.salaryStructure.basic.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">HRA & Allowances</span>
                <span className="font-semibold">${(user.salaryStructure.hra + user.salaryStructure.allowances).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Earnings:</span>
              <span className="font-semibold text-slate-900">
                ${(user.salaryStructure.basic + user.salaryStructure.hra + user.salaryStructure.allowances).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Deductions (Tax + PF):</span>
              <span className="font-semibold text-rose-600">
                -${(user.salaryStructure.taxDeduction + user.salaryStructure.pfDeduction + user.salaryStructure.otherDeductions).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveTab('payroll')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors text-center"
            >
              All Historic Payslips
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
