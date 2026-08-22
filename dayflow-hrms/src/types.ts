// Shared TypeScript types for DayFlow HRMS

export type AttendanceStatus = 'Present' | 'Half-day' | 'Leave' | 'Absent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  employeeId?: string;
  jobDetails: {
    department: string;
    position: string;
    workLocation: string;
  };
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  jobDetails: {
    department: string;
    position: string;
    workLocation: string;
  };
}

export interface AttendanceRecord {
  id: string;
  userId?: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  notes?: string;
  location?: string;
  durationHours?: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  deductions: number;
  netSalary: number;
}
