import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  LogIn, 
  LogOut, 
  Plus, 
  Filter, 
  Search, 
  Users,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AttendanceRecord, AttendanceStatus, Employee } from '../../types';
import { ManualAttendanceModal } from './ManualAttendanceModal';

export const AttendanceTracker: React.FC = () => {
  const { user, role, refreshUser } = useAuth();
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);
  const [punchLoading, setPunchLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  const isAdmin = role === 'admin';

  const fetchAttendance = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const params: any = {};
      if (!isAdmin) {
        params.userId = user.id;
      } else if (selectedEmployeeId !== 'All') {
        params.employeeId = selectedEmployeeId;
      }
      
      const records = await api.getAttendance(params);
      setAttendanceList(records);

      // Find current user's today record
      const todayStr = new Date().toISOString().split('T')[0];
      const myToday = records.find(r => (r.userId === user.id || r.employeeId === user.employeeId) && r.date === todayStr);
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
  }, [user, role, selectedEmployeeId]);

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

  // Filter records
  const filteredRecords = attendanceList.filter(record => {
    if (selectedStatus !== 'All' && record.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchesName = record.employeeName?.toLowerCase().includes(q);
      const matchesId = record.employeeId?.toLowerCase().includes(q);
      if (!matchesName && !matchesId) return false;
    }
    return true;
  });

  const STANDARD_WORK_HOURS = 8;

  const getExtraHours = (record: AttendanceRecord): number => {
    if (!record.durationHours) return 0;
    const extra = record.durationHours - STANDARD_WORK_HOURS;
    return extra > 0 ? Math.round(extra * 100) / 100 : 0;
  };

  // Employee-facing summary stats (Count of days present, Leaves count, Total working days)
  const employeeStats = React.useMemo(() => {
    if (isAdmin) return null;
    const presentDays = attendanceList.filter(r => r.status === 'Present' || r.status === 'Half-day').length;
    const leaveDays = attendanceList.filter(r => r.status === 'Leave').length;
    const totalWorkingDays = attendanceList.length;
    return { presentDays, leaveDays, totalWorkingDays };
  }, [attendanceList, isAdmin]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Attendance Tracking & Timesheets
          </h1>
          <p className="text-xs text-slate-500">
            {isAdmin 
              ? 'Real-time corporate attendance logs, punches, and timesheet records' 
              : 'Your personal daily punches and attendance history'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Log Manual Attendance
            </button>
          )}
        </div>
      </div>

      {/* Live Punch Clock Widget (Available to all users) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                Self-Service Attendance Punch
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {todayRecord?.checkInTime ? 'Active Shift Registered' : 'Not Punched In Yet'}
            </h2>
            <p className="text-xs text-slate-300">
              {todayRecord?.checkInTime 
                ? `Punch In Time: ${todayRecord.checkInTime} ${todayRecord.checkOutTime ? `• Punch Out: ${todayRecord.checkOutTime}` : ''}`
                : 'Click below to register your official workday timestamp.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!todayRecord?.checkInTime ? (
              <button
                onClick={handlePunchIn}
                disabled={punchLoading}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                {punchLoading ? 'Processing...' : 'Punch In (Check-In)'}
              </button>
            ) : !todayRecord.checkOutTime ? (
              <button
                onClick={handlePunchOut}
                disabled={punchLoading}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                {punchLoading ? 'Processing...' : 'Punch Out (Check-Out)'}
              </button>
            ) : (
              <div className="px-4 py-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-300" />
                Workday Shift Completed ({todayRecord.durationHours || 8} hrs)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employee Summary Stats (Count of days present / Leaves count / Total working days) */}
      {!isAdmin && employeeStats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/60/50 p-4 rounded-xl border border-slate-700/50 shadow-xs text-center">
            <p className="text-2xl font-bold text-teal-400">{employeeStats.presentDays}</p>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mt-1">Count of Days Present</p>
          </div>
          <div className="bg-slate-800/60/50 p-4 rounded-xl border border-slate-700/50 shadow-xs text-center">
            <p className="text-2xl font-bold text-amber-600">{employeeStats.leaveDays}</p>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mt-1">Leaves Count</p>
          </div>
          <div className="bg-slate-800/60/50 p-4 rounded-xl border border-slate-700/50 shadow-xs text-center">
            <p className="text-2xl font-bold text-slate-100">{employeeStats.totalWorkingDays}</p>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mt-1">Total Working Days</p>
          </div>
        </div>
      )}

      {/* Filter Controls for Admin / User */}
      <div className="bg-slate-800/60/50 p-4 rounded-xl border border-slate-700/50 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {isAdmin && (
            <>
              <div className="relative w-full md:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name or ID..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-700/50 focus:outline-indigo-600"
                />
              </div>
              <div className="w-full md:w-64">
                <select
                  value={selectedEmployeeId}
                  onChange={e => setSelectedEmployeeId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-700/50 bg-slate-800/60/50"
                >
                  <option value="All">All Employees</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.employeeId}>
                      {e.name} ({e.employeeId})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Present', 'Half-day', 'Leave', 'Absent'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedStatus === st
                    ? 'bg-cyan-600 text-white font-semibold'
                    : 'bg-slate-900/80/40 hover:bg-slate-800/60/40 text-slate-400 border border-slate-700/50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-500 self-end md:self-center">
          Showing {filteredRecords.length} records
        </span>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-slate-800/60/50 rounded-xl border border-slate-700/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80/40 border-b border-slate-700/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Punch In</th>
                <th className="px-5 py-3">Punch Out</th>
                <th className="px-5 py-3">Duration</th>
                {isAdmin && <th className="px-5 py-3">Extra Hours</th>}
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Location / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="py-12 text-center text-xs text-slate-400">
                    Loading attendance entries...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="py-12 text-center text-xs text-slate-400">
                    No attendance records found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-900/80/40 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-100 whitespace-nowrap">
                      {record.date}
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-semibold text-slate-100">{record.employeeName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{record.employeeId}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400">{record.department}</td>
                    <td className="px-5 py-3 font-mono text-slate-800">
                      {record.checkInTime || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-800">
                      {record.checkOutTime || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-5 py-3 text-slate-300 font-medium">
                      {record.durationHours ? `${record.durationHours} hrs` : '-'}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3 font-medium">
                        {getExtraHours(record) > 0 ? (
                          <span className="text-teal-300">+{getExtraHours(record)} hrs</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        record.status === 'Present' ? 'bg-teal-950/60 text-teal-300' :
                        record.status === 'Half-day' ? 'bg-blue-100 text-blue-800' :
                        record.status === 'Leave' ? 'bg-amber-950/60 text-amber-300' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      <span className="line-clamp-1">{record.notes || record.location || 'Office HQ'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showManualModal && (
        <ManualAttendanceModal
          onClose={() => setShowManualModal(false)}
          onSaved={fetchAttendance}
        />
      )}
    </div>
  );
};







