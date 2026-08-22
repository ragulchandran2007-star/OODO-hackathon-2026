/**
 * MongoDB / Mongoose Models for Dayflow HRMS
 * These schemas provide 100% production-ready MongoDB ODM models for deployment with MongoDB Atlas or local MongoDB.
 */

export const MongoDBSchemaDefinitions = `
import mongoose, { Schema, Document } from 'mongoose';

// --- User / Employee Schema ---
export interface IUser extends Document {
  employeeId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'employee';
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
    employmentType: string;
    workLocation: string;
    status: string;
  };
  salaryStructure: {
    basic: number;
    hra: number;
    allowances: number;
    taxDeduction: number;
    pfDeduction: number;
    otherDeductions: number;
    netSalary: number;
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    size: string;
    url?: string;
  }>;
  leaveBalances: {
    paid: number;
    paidTotal: number;
    sick: number;
    sickTotal: number;
    casual: number;
    casualTotal: number;
    unpaid: number;
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  employeeId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  emergencyContact: {
    name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  jobDetails: {
    title: { type: String, default: 'Team Member' },
    department: { type: String, default: 'General' },
    joinDate: { type: String, default: '' },
    manager: { type: String, default: '' },
    employmentType: { type: String, default: 'Full-Time' },
    workLocation: { type: String, default: 'Hybrid' },
    status: { type: String, default: 'Active' }
  },
  salaryStructure: {
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    taxDeduction: { type: Number, default: 0 },
    pfDeduction: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 }
  },
  documents: [{
    id: String,
    name: String,
    type: String,
    uploadDate: String,
    size: String,
    url: String
  }],
  leaveBalances: {
    paid: { type: Number, default: 24 },
    paidTotal: { type: Number, default: 24 },
    sick: { type: Number, default: 10 },
    sickTotal: { type: Number, default: 10 },
    casual: { type: Number, default: 6 },
    casualTotal: { type: Number, default: 6 },
    unpaid: { type: Number, default: 0 }
  }
}, { timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// --- Attendance Schema ---
export interface IAttendance extends Document {
  userId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  durationHours?: number;
  status: 'Present' | 'Absent' | 'Half-day' | 'Leave';
  notes?: string;
  location?: string;
}

const AttendanceSchema = new Schema<IAttendance>({
  userId: { type: String, required: true, index: true },
  employeeId: { type: String, required: true, index: true },
  employeeName: { type: String, required: true },
  department: { type: String, default: 'General' },
  date: { type: String, required: true, index: true },
  checkInTime: { type: String },
  checkOutTime: { type: String },
  durationHours: { type: Number, default: 0 },
  status: { type: String, enum: ['Present', 'Absent', 'Half-day', 'Leave'], default: 'Present' },
  notes: { type: String },
  location: { type: String, default: 'Office HQ' }
}, { timestamps: true });

export const AttendanceModel = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

// --- Leave Request Schema ---
export interface ILeaveRequest extends Document {
  userId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: 'Paid' | 'Sick' | 'Casual' | 'Unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: Date;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>({
  userId: { type: String, required: true, index: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: { type: String, default: 'General' },
  leaveType: { type: String, enum: ['Paid', 'Sick', 'Casual', 'Unpaid'], required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  totalDays: { type: Number, required: true, default: 1 },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
  appliedAt: { type: Date, default: Date.now },
  reviewerNotes: { type: String },
  reviewedBy: { type: String },
  reviewedAt: { type: Date }
}, { timestamps: true });

export const LeaveModel = mongoose.models.Leave || mongoose.model<ILeaveRequest>('Leave', LeaveRequestSchema);

// --- Payroll Record Schema ---
export interface IPayroll extends Document {
  payrollMonth: string;
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
  status: 'Draft' | 'Approved' | 'Paid';
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
}

const PayrollSchema = new Schema<IPayroll>({
  payrollMonth: { type: String, required: true, index: true },
  employeeId: { type: String, required: true, index: true },
  employeeName: { type: String, required: true },
  department: { type: String },
  designation: { type: String },
  email: { type: String },
  basicSalary: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 },
  grossSalary: { type: Number, default: 0 },
  taxDeduction: { type: Number, default: 0 },
  pfDeduction: { type: Number, default: 0 },
  otherDeductions: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Approved', 'Paid'], default: 'Approved' },
  paymentDate: { type: String },
  paymentMethod: { type: String, default: 'Direct Bank Deposit' },
  transactionId: { type: String }
}, { timestamps: true });

export const PayrollModel = mongoose.models.Payroll || mongoose.model<IPayroll>('Payroll', PayrollSchema);
`;
