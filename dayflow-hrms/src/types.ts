// Shared TypeScript types for DayFlow HRMS

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'employee'
}

export interface Employee {
  id: string
  name: string
  email: string
  department: string
  position: string
  joinDate: string
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn: string
  checkOut: string
  status: 'present' | 'absent' | 'late' | 'half-day'
}

export interface LeaveRequest {
  id: string
  employeeId: string
  type: string
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface PayrollRecord {
  id: string
  employeeId: string
  month: string
  year: number
  basicSalary: number
  deductions: number
  netSalary: number
}
