export type UserRole = 'admin' | 'employee';

export interface SalaryComponent {
  id: string;
  name: string;
  percentOfBasic?: number; // percentage of Basic Salary (for HRA/Bonus/LTA style components)
  amount: number; // computed monthly amount
}

export interface SalaryStructure {
  // Legacy simple fields (kept for backward compatibility with older records/payroll calc)
  basic: number;
  hra: number;
  allowances: number;
  taxDeduction: number;
  pfDeduction: number;
  otherDeductions: number;
  netSalary: number;

  // Wireframe-accurate wage-based structure
  monthlyWage?: number;
  yearlyWage?: number;
  basicPercent?: number; // % of wage
  hraPercent?: number; // % of basic
  standardAllowancePercent?: number; // % of wage
  performanceBonusPercent?: number; // % of basic
  leaveTravelAllowancePercent?: number; // % of basic
  fixedAllowance?: number; // wage - sum of all other components (auto-computed)
  workingDaysPerWeek?: number;
  breakTimeHours?: number;
  pfEmployeeAmount?: number;
  pfEmployeePercent?: number;
  pfEmployerAmount?: number;
  pfEmployerPercent?: number;
  professionalTax?: number;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: 'ID Proof' | 'Contract' | 'Resume' | 'Certificate' | 'Tax Form' | 'Other';
  uploadDate: string;
  size: string;
  url?: string;
}

export interface LeaveBalances {
  paid: number;
  paidTotal: number;
  sick: number;
  sickTotal: number;
  casual: number;
  casualTotal: number;
  unpaid: number;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  jobDetails: {
    title: string;
    department: string;
    joinDate: string;
    manager: string;
    employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
    workLocation: 'Office' | 'Remote' | 'Hybrid';
    status: 'Active' | 'On Leave' | 'Terminated';
  };
  salaryStructure: SalaryStructure;
  documents: EmployeeDocument[];
  leaveBalances: LeaveBalances;
  createdAt: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half-day' | 'Leave';

export interface AttendanceRecord {
  id: string;
  userId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:MM:SS AM/PM
  checkOutTime?: string; // HH:MM:SS AM/PM
  durationHours?: number;
  status: AttendanceStatus;
  notes?: string;
  location?: string;
  ipAddress?: string;
}

export type LeaveType = 'Paid' | 'Sick' | 'Casual' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  userId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type PayrollStatus = 'Draft' | 'Approved' | 'Paid';

export interface PayrollRecord {
  id: string;
  payrollMonth: string; // e.g. "August 2026" or "2026-08"
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  email: string;
  basicSalary: number;
  hra: number;
  allowances: number;
  grossSalary: number;
  taxDeduction: number;
  pfDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  generatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string; // or 'all'
  title: string;
  message: string;
  type: 'attendance' | 'leave' | 'payroll' | 'system';
  read: boolean;
  createdAt: string;
  linkTab?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  pendingLeavesCount: number;
  monthlyPayrollTotal: number;
  attendanceRate: number;
}
