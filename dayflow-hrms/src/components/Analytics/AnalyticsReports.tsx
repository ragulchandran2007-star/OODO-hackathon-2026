import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CalendarOff, 
  Clock, 
  DollarSign, 
  Download, 
  Building2, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../../services/api';
import { DashboardStats, Employee, LeaveRequest, AttendanceRecord } from '../../types';

export const AnalyticsReports: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deptCounts, setDeptCounts] = useState<Record<string, number>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [analytics, emps] = await Promise.all([
          api.getAnalytics(),
          api.getEmployees()
        ]);
        setStats(analytics.stats);
        setDeptCounts(analytics.departmentCounts);
        setEmployees(emps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const exportEmployeesCSV = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Title', 'Basic Salary', 'Net Salary', 'Role', 'Status'];
    const rows = employees.map(e => [
      e.employeeId,
      `"${e.name}"`,
      e.email,
      e.jobDetails.department,
      `"${e.jobDetails.title}"`,
      e.salaryStructure.basic,
      e.salaryStructure.netSalary,
      e.role,
      e.jobDetails.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dayflow_HRMS_Workforce_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Executive Analytics & Workforce Reports
          </h1>
          <p className="text-xs text-slate-500">
            Real-time organizational telemetry, attendance ratios, and compensation audit
          </p>
        </div>

        <button
          onClick={exportEmployeesCSV}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Workforce CSV Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Workforce Headcount</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats?.totalEmployees || 0}</span>
            <span className="text-xs text-emerald-600 font-semibold">+100% active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all global locations</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Daily Attendance Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{stats?.attendanceRate || 0}%</span>
            <span className="text-xs text-slate-500 font-medium">punctuality</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{stats?.presentToday || 0} staff checked in</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Pending Leave Pipeline</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{stats?.pendingLeavesCount || 0}</span>
            <span className="text-xs text-amber-700 font-medium">pending approval</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Approval turnaround &lt; 24h</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Monthly Compensation Run</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-700">
              ${(stats?.monthlyPayrollTotal || 0).toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Direct Deposit Disbursed</p>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Headcount Bar Graph */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Department Workforce Distribution
            </h2>
            <p className="text-xs text-slate-500">Staff density across departments</p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const numCount = Number(count);
              const pct = stats?.totalEmployees ? Math.round((numCount / stats.totalEmployees) * 100) : 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{dept}</span>
                    <span className="text-slate-900 font-bold">{numCount} ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance & Compliance Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Attendance & Compliance Auditing
            </h2>
            <p className="text-xs text-slate-500">Weekly shift metrics and statutory alignment</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Average Working Hours</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">8.2 hrs / day</span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">100% compliant</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Leave Utilization</span>
              <span className="text-xl font-bold text-indigo-700 mt-1 block">22.4%</span>
              <span className="text-[10px] text-slate-500 mt-1 inline-block">Healthy work-life balance</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Payroll Accuracy</span>
              <span className="text-xl font-bold text-emerald-600 mt-1 block">99.9%</span>
              <span className="text-[10px] text-slate-500 mt-1 inline-block">Automated calculation</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Remote / Hybrid Share</span>
              <span className="text-xl font-bold text-purple-700 mt-1 block">60.0%</span>
              <span className="text-[10px] text-slate-500 mt-1 inline-block">Hybrid workplace model</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
