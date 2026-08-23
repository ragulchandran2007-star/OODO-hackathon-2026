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
import { DashboardStats, Employee, PayrollRecord } from '../../types';

export const AnalyticsReports: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deptCounts, setDeptCounts] = useState<Record<string, number>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [analytics, emps, payrollRows] = await Promise.all([
          api.getAnalytics(),
          api.getEmployees(),
          api.getPayroll({ month: 'August 2026' })
        ]);
        setStats(analytics.stats);
        setDeptCounts(analytics.departmentCounts);
        setEmployees(emps);
        setPayroll(payrollRows);
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

  const deptChart = Object.entries(deptCounts).map(([label, value]) => ({ label, value: Number(value) }));
  const maxDept = Math.max(1, ...deptChart.map(d => d.value));
  const compensationChart = payroll.length
    ? payroll.map(p => ({ label: p.employeeName.split(' ')[0], gross: p.grossSalary, net: p.netSalary }))
    : employees.map(e => ({
        label: e.name.split(' ')[0],
        gross: e.salaryStructure.basic + e.salaryStructure.hra + e.salaryStructure.allowances,
        net: e.salaryStructure.netSalary
      }));
  const maxComp = Math.max(1, ...compensationChart.map(d => d.gross));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Executive Analytics & Workforce Reports
          </h1>
          <p className="page-subtitle text-xs">
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-300" />
              Payroll Gross vs Net
            </h2>
            <p className="text-xs text-slate-500">Current pay period compensation comparison</p>
          </div>
          <div className="h-64 overflow-x-auto">
            <svg viewBox={`0 0 ${Math.max(520, compensationChart.length * 86)} 220`} className="h-full min-w-full" role="img" aria-label="Gross and net salary bar chart">
              <line x1="42" y1="18" x2="42" y2="178" stroke="rgba(226,232,240,.32)" />
              <line x1="42" y1="178" x2={Math.max(500, compensationChart.length * 86)} y2="178" stroke="rgba(226,232,240,.32)" />
              {compensationChart.map((item, index) => {
                const x = 64 + index * 82;
                const grossHeight = Math.max(8, (item.gross / maxComp) * 142);
                const netHeight = Math.max(8, (item.net / maxComp) * 142);
                return (
                  <g key={item.label}>
                    <rect x={x} y={178 - grossHeight} width="22" height={grossHeight} rx="5" fill="url(#grossGradient)" />
                    <rect x={x + 28} y={178 - netHeight} width="22" height={netHeight} rx="5" fill="url(#netGradient)" />
                    <text x={x + 25} y="203" textAnchor="middle" fill="rgba(226,232,240,.78)" fontSize="10">{item.label}</text>
                  </g>
                );
              })}
              <defs>
                <linearGradient id="grossGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor="#a78bfa" />
                  <stop offset="1" stopColor="#6d5dfc" />
                </linearGradient>
                <linearGradient id="netGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor="#2dd4bf" />
                  <stop offset="1" stopColor="#0f766e" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex gap-4 text-[11px] text-slate-500">
            <span><span className="inline-block h-2 w-2 rounded-full bg-violet-400" /> Gross</span>
            <span><span className="inline-block h-2 w-2 rounded-full bg-teal-400" /> Net</span>
          </div>
        </div>

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

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
              Department Report Graph
            </h2>
            <p className="text-xs text-slate-500">Headcount comparison by business unit</p>
          </div>
          <div className="h-56">
            <svg viewBox="0 0 520 190" className="h-full w-full" role="img" aria-label="Department headcount report chart">
              <line x1="36" y1="15" x2="36" y2="150" stroke="rgba(226,232,240,.32)" />
              <line x1="36" y1="150" x2="500" y2="150" stroke="rgba(226,232,240,.32)" />
              {deptChart.map((item, index) => {
                const x = 58 + index * 86;
                const h = Math.max(8, (item.value / maxDept) * 116);
                return (
                  <g key={item.label}>
                    <rect x={x} y={150 - h} width="42" height={h} rx="8" fill="rgba(124,92,255,.82)" />
                    <text x={x + 21} y={142 - h} textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">{item.value}</text>
                    <text x={x + 21} y="171" textAnchor="middle" fill="rgba(226,232,240,.78)" fontSize="9">{item.label.slice(0, 10)}</text>
                  </g>
                );
              })}
            </svg>
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
