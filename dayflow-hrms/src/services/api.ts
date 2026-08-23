import { Employee, AttendanceRecord, LeaveRequest, PayrollRecord, AppNotification, DashboardStats } from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ token: string; user: Employee }> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login');
    }
    return res.json();
  },

  register: async (data: { employeeId?: string; name: string; email: string; password: string; role: 'admin' | 'employee' }): Promise<{ token: string; user: Employee }> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register');
    }
    return res.json();
  },

  requestPasswordReset: async (email: string): Promise<{ success: boolean; delivered: boolean; message: string; resetUrl?: string }> => {
    const res = await fetch(`${API_BASE}/auth/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to request password reset');
    return data;
  },

  resetPassword: async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  // Employees
  getEmployees: async (params?: { department?: string; search?: string; status?: string }): Promise<Employee[]> => {
    const query = new URLSearchParams();
    if (params?.department) query.append('department', params.department);
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    
    const res = await fetch(`${API_BASE}/employees?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch employees');
    return res.json();
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    const res = await fetch(`${API_BASE}/employees/${id}`);
    if (!res.ok) throw new Error('Failed to fetch employee');
    return res.json();
  },

  createEmployee: async (empData: Partial<Employee>): Promise<Employee> => {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empData)
    });
    if (!res.ok) throw new Error('Failed to create employee');
    return res.json();
  },

  updateEmployee: async (id: string, updates: Partial<Employee>): Promise<Employee> => {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update employee');
    return res.json();
  },

  deleteEmployee: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete employee');
    return res.json();
  },

  // Attendance
  getAttendance: async (params?: { date?: string; userId?: string; employeeId?: string }): Promise<AttendanceRecord[]> => {
    const query = new URLSearchParams();
    if (params?.date) query.append('date', params.date);
    if (params?.userId) query.append('userId', params.userId);
    if (params?.employeeId) query.append('employeeId', params.employeeId);

    const res = await fetch(`${API_BASE}/attendance?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },

  checkIn: async (userId: string, notes?: string, location?: string): Promise<AttendanceRecord> => {
    const res = await fetch(`${API_BASE}/attendance/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, notes, location })
    });
    if (!res.ok) throw new Error('Failed to check in');
    return res.json();
  },

  checkOut: async (userId: string): Promise<AttendanceRecord> => {
    const res = await fetch(`${API_BASE}/attendance/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to check out');
    return res.json();
  },

  addManualAttendance: async (data: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    const res = await fetch(`${API_BASE}/attendance/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to record attendance');
    return res.json();
  },

  updateAttendance: async (id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    const res = await fetch(`${API_BASE}/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update attendance');
    return res.json();
  },

  // Leaves
  getLeaves: async (params?: { userId?: string; status?: string }): Promise<LeaveRequest[]> => {
    const query = new URLSearchParams();
    if (params?.userId) query.append('userId', params.userId);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE}/leaves?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch leaves');
    return res.json();
  },

  applyLeave: async (data: { userId: string; leaveType: string; startDate: string; endDate: string; totalDays: number; reason: string }): Promise<LeaveRequest> => {
    const res = await fetch(`${API_BASE}/leaves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to apply leave');
    return res.json();
  },

  reviewLeave: async (id: string, data: { status: 'Approved' | 'Rejected'; reviewerNotes?: string; reviewerName?: string }): Promise<LeaveRequest> => {
    const res = await fetch(`${API_BASE}/leaves/${id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to review leave');
    return res.json();
  },

  // Payroll
  getPayroll: async (params?: { month?: string; employeeId?: string }): Promise<PayrollRecord[]> => {
    const query = new URLSearchParams();
    if (params?.month) query.append('month', params.month);
    if (params?.employeeId) query.append('employeeId', params.employeeId);

    const res = await fetch(`${API_BASE}/payroll?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch payroll');
    return res.json();
  },

  generatePayroll: async (month: string): Promise<{ success: boolean; count: number; records: PayrollRecord[] }> => {
    const res = await fetch(`${API_BASE}/payroll/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month })
    });
    if (!res.ok) throw new Error('Failed to generate payroll');
    return res.json();
  },

  updatePayroll: async (id: string, updates: Partial<PayrollRecord>): Promise<PayrollRecord> => {
    const res = await fetch(`${API_BASE}/payroll/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update payroll');
    return res.json();
  },

  // Analytics
  getAnalytics: async (): Promise<{
    stats: DashboardStats;
    departmentCounts: Record<string, number>;
    recentLeaves: LeaveRequest[];
    todayAttendance: AttendanceRecord[];
  }> => {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Notifications
  getNotifications: async (userId?: string): Promise<AppNotification[]> => {
    const query = userId ? `?userId=${userId}` : '';
    const res = await fetch(`${API_BASE}/notifications${query}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
  }
};
