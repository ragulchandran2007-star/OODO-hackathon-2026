import React, { useState, useEffect } from 'react';
import { X, Clock, Save, User, Calendar } from 'lucide-react';
import { AttendanceStatus, Employee } from '../../types';
import { api } from '../../services/api';

interface ManualAttendanceModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export const ManualAttendanceModal: React.FC<ManualAttendanceModalProps> = ({
  onClose,
  onSaved
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInTime, setCheckInTime] = useState('09:00 AM');
  const [checkOutTime, setCheckOutTime] = useState('05:30 PM');
  const [status, setStatus] = useState<AttendanceStatus>('Present');
  const [notes, setNotes] = useState('Manual admin entry / adjusted punch');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEmps = async () => {
      const list = await api.getEmployees();
      setEmployees(list);
      if (list.length > 0) setSelectedEmpId(list[0].id);
    };
    loadEmps();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    setLoading(true);
    try {
      await api.addManualAttendance({
        userId: emp.id,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.jobDetails.department,
        date,
        checkInTime: status === 'Present' || status === 'Half-day' ? checkInTime : undefined,
        checkOutTime: status === 'Present' || status === 'Half-day' ? checkOutTime : undefined,
        durationHours: status === 'Present' ? 8.5 : status === 'Half-day' ? 4 : 0,
        status,
        notes,
        location: 'Office HQ'
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold">Log Manual Attendance</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Employee</label>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeId} - {emp.jobDetails.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Attendance Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as AttendanceStatus)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
            >
              <option value="Present">Present (Full Day)</option>
              <option value="Half-day">Half-day (4 Hours)</option>
              <option value="Absent">Absent (Unexcused)</option>
              <option value="Leave">On Approved Leave</option>
            </select>
          </div>

          {(status === 'Present' || status === 'Half-day') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Punch In Time</label>
                <input
                  type="text"
                  value={checkInTime}
                  onChange={e => setCheckInTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Punch Out Time</label>
                <input
                  type="text"
                  value={checkOutTime}
                  onChange={e => setCheckOutTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Remarks / Reason</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
