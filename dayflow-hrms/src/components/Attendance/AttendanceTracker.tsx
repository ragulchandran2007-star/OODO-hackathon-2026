import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Plane,
  LogIn,
  LogOut,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AttendanceRecord, AttendanceStatus, Employee } from '../../types';
import { ManualAttendanceModal } from './ManualAttendanceModal';

// ---------------------------------------------------------------------------
// Helpers: Work Hours / Extra Hours are derived from checkInTime/checkOutTime
// on the fly, so no schema changes are required on AttendanceRecord.
// Workflow spec: "Work Hours" + "Extra hours" columns (workflow.pdf, Attendance
// List View screens for both Admin and Employee).
// ---------------------------------------------------------------------------
const STANDARD_WORKDAY_HOURS = 8;

function parseTimeToMinutes(t?: string): number | null {
  if (!t) return null;
  const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3]?.toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

function computeHours(checkIn?: string, checkOut?: string) {
  const inM = parseTimeToMinutes(checkIn);
  const outM = parseTimeToMinutes(checkOut);
  if (inM === null || outM === null) return { workHours: 0, extraHours: 0 };
  let diff = outM - inM;
  if (diff < 0) diff += 24 * 60; // overnight shift guard
  const hours = diff / 60;
  return {
    workHours: Math.round(hours * 100) / 100,
    extraHours: Math.round(Math.max(0, hours - STANDARD_WORKDAY_HOURS) * 100) / 100
  };
}

function formatHM(hoursDecimal: number): string {
  const h = Math.floor(hoursDecimal);
  const m = Math.round((hoursDecimal - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function fmtDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function weekdayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: 'long' });
}

function monthLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

// Status legend, matching the Green dot / Airplane / Yellow dot legend used
// elsewhere in the workflow for employee attendance status.
const StatusBadge: React.FC<{ status: AttendanceStatus }> = ({ status }) => {
  const map: Record<string, { cls: string; icon: React.ReactNode }> = {
    Present: { cls: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle2 className="w-3 h-3" /> },
    'Half-day': { cls: 'bg-blue-100 text-blue-800', icon: <Clock className="w-3 h-3" /> },
    Leave: { cls: 'bg-amber-100 text-amber-800', icon: <Plane className="w-3 h-3" /> },
    Absent: { cls: 'bg-rose-100 text-rose-800', icon: <XCircle className="w-3 h-3" /> }
  };
  const cfg = map[status] || map.Absent;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.cls}`}>
      {cfg.icon}
      {status}
    </span>
  );
};

export const AttendanceTracker: React.FC = () => {
  const { user, role, refreshUser } = useAuth();
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);
  const [punchLoading, setPunchLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  // Admin/HR Officer: single-day view + search (workflow: "Attendances List
  // view — For Admin/HR Officer" with Date <-/-> and Day, plus a search bar).
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Employee: month view (workflow: "For Employees" — Oct <-/->, Count of
  // days present, Leaves count, Total working days).
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const isAdmin = role === 'admin';

  const fetchAttendance = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const params: any = {};
      if (!isAdmin) {
        params.userId = user.id;
      }
      const records = await api.getAttendance(params);
      setAttendanceList(records);

      const todayStr = fmtDate(new Date());
      const myToday = records.find(
        r => (r.userId === user.id || r.employeeId === user.employeeId) && r.date === todayStr
      );
      setTodayRecord(myToday || null);

      if (isAdmin && employees.length === 0) {
        const emps = await api.getEmployees();
        setEmployees(emps);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role]);

  const handlePunchIn = async () => {
    if (!user) return;
    setPunchLoading(true);
    try {
      const rec = await api.checkIn(user.id, 'Punched in via Live Web portal', user.jobDetails.workLocation);
      setTodayRecord(rec);
      await fetchAttendance();
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
      const rec = await api.checkOut(user.id);
      setTodayRecord(rec);
      await fetchAttendance();
      await refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setPunchLoading(false);
    }
  };

  // ---- Admin: records for the selected day, filtered by search + status ----
  const dayRecords = useMemo(() => {
    const dayStr = fmtDate(selectedDay);
    return attendanceList
      .filter(r => r.date === dayStr)
      .filter(r => selectedStatus === 'All' || r.status === selectedStatus)
      .filter(r =>
        searchTerm.trim() === '' ||
        r.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [attendanceList, selectedDay, selectedStatus, searchTerm]);

  // ---- Employee: records for the selected month + summary stats ----
  const monthRecords = useMemo(() => {
    const y = selectedMonth.getFullYear();
    const m = selectedMonth.getMonth();
    return attendanceList
      .filter(r => {
        const d = new Date(r.date);
        return d.getFullYear() === y && d.getMonth() === m;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [attendanceList, selectedMonth]);

  const monthSummary = useMemo(() => {
    const daysPresent = monthRecords.filter(r => r.status === 'Present' || r.status === 'Half-day').length;
    const leavesCount = monthRecords.filter(r => r.status === 'Leave').length;
    const totalWorkingDays = monthRecords.length;
    return { daysPresent, leavesCount, totalWorkingDays };
  }, [monthRecords]);

  const shiftDay = (delta: number) => {
    const d = new Date(selectedDay);
    d.setDate(d.getDate() + delta);
    setSelectedDay(d);
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() + delta);
    setSelectedMonth(d);
  };

  const checkedIn = !!todayRecord?.checkInTime;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Attendance
          </h1>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? 'Day-wise attendance for all employees. Basis for payroll payable-day calculation.'
              : 'Your day-wise attendance, based on your working time including breaks.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Log Manual Attendance
          </button>
        )}
      </div>

      {/* Live Punch Clock Widget — red/green status dot per workflow note:
          "Upon successful Check IN, the red status dot changes to green." */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${checkedIn ? 'bg-emerald-400' : 'bg-rose-500'} ${
                  checkedIn ? 'animate-pulse' : ''
                }`}
                title={checkedIn ? 'Checked in' : 'Not checked in'}
              />
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                Self-Service Attendance Punch
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {checkedIn ? 'Active Shift Registered' : 'Not Checked In Yet'}
            </h2>
            <p className="text-xs text-slate-300">
              {checkedIn
                ? `Check In: ${todayRecord?.checkInTime}${
                    todayRecord?.checkOutTime ? ` • Check Out: ${todayRecord.checkOutTime}` : ''
                  }`
                : 'Since 00:00 PM — click below to check in.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!checkedIn ? (
              <button
                onClick={handlePunchIn}
                disabled={punchLoading}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {punchLoading ? 'Processing...' : 'Check In'}
              </button>
            ) : !todayRecord?.checkOutTime ? (
              <button
                onClick={handlePunchOut}
                disabled={punchLoading}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                {punchLoading ? 'Processing...' : 'Check Out'}
              </button>
            ) : (
              <div className="px-4 py-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Workday Completed (
                {formatHM(computeHours(todayRecord?.checkInTime, todayRecord?.checkOutTime).workHours)} hrs)
              </div>
            )}
          </div>
        </div>
      </div>

      {isAdmin ? (
        <AdminDayView
          loading={loading}
          records={dayRecords}
          selectedDay={selectedDay}
          onShiftDay={shiftDay}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      ) : (
        <EmployeeMonthView
          loading={loading}
          records={monthRecords}
          selectedMonth={selectedMonth}
          onShiftMonth={shiftMonth}
          summary={monthSummary}
        />
      )}

      {showManualModal && (
        <ManualAttendanceModal onClose={() => setShowManualModal(false)} onSaved={fetchAttendance} />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Admin / HR Officer — day-by-day list of every employee, with search
// (workflow.pdf: "Attendances List view — For Admin/HR Officer")
// ---------------------------------------------------------------------------
const AdminDayView: React.FC<{
  loading: boolean;
  records: AttendanceRecord[];
  selectedDay: Date;
  onShiftDay: (delta: number) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
  searchTerm: string;
  onSearchChange: (s: string) => void;
}> = ({ loading, records, selectedDay, onShiftDay, selectedStatus, onStatusChange, searchTerm, onSearchChange }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onShiftDay(-1)}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onShiftDay(1)}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          aria-label="Next day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="text-xs font-semibold text-slate-800 ml-1">
          {fmtDate(selectedDay).split('-').reverse().join('/')}{' '}
          <span className="text-slate-400 font-normal">• {weekdayLabel(selectedDay)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search employee..."
            className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 w-48"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', 'Present', 'Half-day', 'Leave', 'Absent'].map(st => (
            <button
              key={st}
              onClick={() => onStatusChange(st)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          <tr>
            <th className="px-5 py-3">Employee</th>
            <th className="px-5 py-3">Department</th>
            <th className="px-5 py-3">Check In</th>
            <th className="px-5 py-3">Check Out</th>
            <th className="px-5 py-3">Work Hours</th>
            <th className="px-5 py-3">Extra Hours</th>
            <th className="px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                Loading attendance entries...
              </td>
            </tr>
          ) : records.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                No attendance records for this day.
              </td>
            </tr>
          ) : (
            records.map(record => {
              const { workHours, extraHours } = computeHours(record.checkInTime, record.checkOutTime);
              return (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-900">{record.employeeName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{record.employeeId}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{record.department}</td>
                  <td className="px-5 py-3 font-mono text-slate-800">
                    {record.checkInTime || <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-800">
                    {record.checkOutTime || <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium">{formatHM(workHours)}</td>
                  <td className="px-5 py-3 text-slate-700 font-medium">{formatHM(extraHours)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Employee — month view with summary stats
// (workflow.pdf: "For Employees" — Count of days present / Leaves count /
// Total working days, day-wise table below)
// ---------------------------------------------------------------------------
const EmployeeMonthView: React.FC<{
  loading: boolean;
  records: AttendanceRecord[];
  selectedMonth: Date;
  onShiftMonth: (delta: number) => void;
  summary: { daysPresent: number; leavesCount: number; totalWorkingDays: number };
}> = ({ loading, records, selectedMonth, onShiftMonth, summary }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onShiftMonth(-1)}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onShiftMonth(1)}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="text-xs font-semibold text-slate-800 ml-1">{monthLabel(selectedMonth)}</div>
      </div>

      <div className="flex items-center gap-4">
        <SummaryPill label="Count of Days Present" value={summary.daysPresent} />
        <SummaryPill label="Leaves Count" value={summary.leavesCount} />
        <SummaryPill label="Total Working Days" value={summary.totalWorkingDays} />
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          <tr>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3">Check In</th>
            <th className="px-5 py-3">Check Out</th>
            <th className="px-5 py-3">Work Hours</th>
            <th className="px-5 py-3">Extra Hours</th>
            <th className="px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                Loading attendance entries...
              </td>
            </tr>
          ) : records.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                No attendance records for this month.
              </td>
            </tr>
          ) : (
            records.map(record => {
              const { workHours, extraHours } = computeHours(record.checkInTime, record.checkOutTime);
              return (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                    {record.date.split('-').reverse().join('/')}
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-800">
                    {record.checkInTime || <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-800">
                    {record.checkOutTime || <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium">{formatHM(workHours)}</td>
                  <td className="px-5 py-3 text-slate-700 font-medium">{formatHM(extraHours)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const SummaryPill: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="text-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
    <p className="text-sm font-bold text-slate-900 leading-none">{value}</p>
    <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-1">{label}</p>
  </div>
);
