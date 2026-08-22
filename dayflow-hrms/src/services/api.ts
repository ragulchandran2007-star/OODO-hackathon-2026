import axios from 'axios';
import type { AttendanceRecord, Employee } from '../types';

// ---------------------------------------------------------------------------
// Mock data — used as fallback when the backend routes aren't ready yet.
// ---------------------------------------------------------------------------
const today = new Date().toISOString().split('T')[0];
const thisMonth = today.slice(0, 7);

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001', employeeId: 'EMP001', name: 'Arjun Mehta', email: 'arjun@dayflow.in',
    jobDetails: { department: 'Engineering', position: 'Software Engineer', workLocation: 'Office HQ' },
  },
  {
    id: 'emp-002', employeeId: 'EMP002', name: 'Priya Nair', email: 'priya@dayflow.in',
    jobDetails: { department: 'Design', position: 'UI/UX Designer', workLocation: 'Office HQ' },
  },
  {
    id: 'emp-003', employeeId: 'EMP003', name: 'Rohit Sharma', email: 'rohit@dayflow.in',
    jobDetails: { department: 'HR', position: 'HR Manager', workLocation: 'Remote' },
  },
  {
    id: 'emp-004', employeeId: 'EMP004', name: 'Sneha Kapoor', email: 'sneha@dayflow.in',
    jobDetails: { department: 'Sales', position: 'Sales Executive', workLocation: 'Office HQ' },
  },
];

function genMockAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const [year, month] = thisMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const statuses: AttendanceRecord['status'][] = ['Present', 'Present', 'Present', 'Half-day', 'Leave', 'Absent'];

  MOCK_EMPLOYEES.forEach(emp => {
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (date > today) continue;
      const dow = new Date(date).getDay();
      if (dow === 0 || dow === 6) continue;

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const hasTime = status === 'Present' || status === 'Half-day';
      records.push({
        id: `${emp.id}-${date}`,
        userId: emp.id,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.jobDetails.department,
        date,
        checkInTime: hasTime ? '09:00 AM' : undefined,
        checkOutTime: hasTime && status === 'Present' ? '06:00 PM' : hasTime ? '01:00 PM' : undefined,
        status,
        location: emp.jobDetails.workLocation,
        durationHours: status === 'Present' ? 9 : status === 'Half-day' ? 4 : 0,
      });
    }
  });
  return records;
}

const MOCK_ATTENDANCE: AttendanceRecord[] = genMockAttendance();

const axiosInstance = axios.create({ baseURL: '/api' });

// Named export — components import: { api } from '../../services/api'
export const api = {
  getEmployees: async (): Promise<Employee[]> => {
    try {
      const res = await axiosInstance.get('/employees');
      return res.data;
    } catch {
      return MOCK_EMPLOYEES;
    }
  },

  getAttendance: async (params?: { userId?: string }): Promise<AttendanceRecord[]> => {
    try {
      const res = await axiosInstance.get('/attendance', { params });
      return res.data;
    } catch {
      if (params?.userId) return MOCK_ATTENDANCE.filter(r => r.userId === params.userId);
      return MOCK_ATTENDANCE;
    }
  },

  checkIn: async (userId: string, notes: string, location: string): Promise<AttendanceRecord> => {
    try {
      const res = await axiosInstance.post('/attendance/checkin', { userId, notes, location });
      return res.data;
    } catch {
      const now = new Date();
      const existing = MOCK_ATTENDANCE.find(r => r.userId === userId && r.date === today);
      if (existing) {
        existing.checkInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        existing.status = 'Present';
        return existing;
      }
      const emp = MOCK_EMPLOYEES.find(e => e.id === userId);
      const record: AttendanceRecord = {
        id: `${userId}-${today}`,
        userId, employeeId: emp?.employeeId ?? userId,
        employeeName: emp?.name ?? 'Unknown',
        department: emp?.jobDetails.department ?? '',
        date: today,
        checkInTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Present', notes, location,
      };
      MOCK_ATTENDANCE.push(record);
      return record;
    }
  },

  checkOut: async (userId: string): Promise<AttendanceRecord> => {
    try {
      const res = await axiosInstance.post('/attendance/checkout', { userId });
      return res.data;
    } catch {
      const now = new Date();
      const existing = MOCK_ATTENDANCE.find(r => r.userId === userId && r.date === today);
      if (existing) {
        existing.checkOutTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return existing;
      }
      return { id: `${userId}-${today}`, userId, date: today, status: 'Present',
        checkOutTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    }
  },

  addManualAttendance: async (data: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    try {
      const res = await axiosInstance.post('/attendance/manual', data);
      return res.data;
    } catch {
      const idx = MOCK_ATTENDANCE.findIndex(r => r.userId === data.userId && r.date === data.date);
      if (idx !== -1) MOCK_ATTENDANCE.splice(idx, 1);
      const record = { ...data, id: `manual-${Date.now()}` } as AttendanceRecord;
      MOCK_ATTENDANCE.push(record);
      return record;
    }
  },
};

export default axiosInstance;
