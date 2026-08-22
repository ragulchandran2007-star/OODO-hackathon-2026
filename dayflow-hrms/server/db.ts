import { Employee, AttendanceRecord, LeaveRequest, LeaveType, PayrollRecord, AppNotification } from '../src/types';

// Seed initial employees
const initialEmployees: (Employee & { password: string })[] = [
  {
    id: 'emp-1',
    employeeId: 'HR-1001',
    name: 'Sarah Jenkins',
    email: 'sarah.hr@dayflow.io',
    password: 'password123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Suite 400, San Francisco, CA 94107',
    emergencyContact: {
      name: 'Robert Jenkins',
      relationship: 'Spouse',
      phone: '+1 (555) 876-5432'
    },
    jobDetails: {
      title: 'Head of Human Resources',
      department: 'Human Resources',
      joinDate: '2023-01-15',
      manager: 'Alex Vance (CEO)',
      employmentType: 'Full-Time',
      workLocation: 'Hybrid',
      status: 'Active'
    },
    salaryStructure: {
      basic: 6500,
      hra: 2200,
      allowances: 1300,
      taxDeduction: 1200,
      pfDeduction: 450,
      otherDeductions: 150,
      netSalary: 8200
    },
    documents: [
      {
        id: 'doc-1',
        name: 'Employment_Contract_Sarah_Jenkins.pdf',
        type: 'Contract',
        uploadDate: '2023-01-15',
        size: '1.4 MB'
      },
      {
        id: 'doc-2',
        name: 'Passport_National_ID.pdf',
        type: 'ID Proof',
        uploadDate: '2023-01-15',
        size: '850 KB'
      }
    ],
    leaveBalances: {
      paid: 18,
      paidTotal: 24,
      sick: 8,
      sickTotal: 10,
      casual: 4,
      casualTotal: 6,
      unpaid: 0
    },
    createdAt: '2023-01-15T09:00:00.000Z'
  },
  {
    id: 'emp-2',
    employeeId: 'DEV-2042',
    name: 'David Chen',
    email: 'david.chen@dayflow.io',
    password: 'password123',
    role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 345-6789',
    address: '120 Market Street, Apt 8B, San Francisco, CA 94105',
    emergencyContact: {
      name: 'Li Chen',
      relationship: 'Sibling',
      phone: '+1 (555) 987-6543'
    },
    jobDetails: {
      title: 'Senior Full Stack Engineer',
      department: 'Engineering',
      joinDate: '2023-04-10',
      manager: 'Marcus Brody (VP Eng)',
      employmentType: 'Full-Time',
      workLocation: 'Office',
      status: 'Active'
    },
    salaryStructure: {
      basic: 7200,
      hra: 2500,
      allowances: 1500,
      taxDeduction: 1450,
      pfDeduction: 500,
      otherDeductions: 100,
      netSalary: 9150
    },
    documents: [
      {
        id: 'doc-3',
        name: 'Senior_Engineer_Offer_Letter.pdf',
        type: 'Contract',
        uploadDate: '2023-04-10',
        size: '2.1 MB'
      },
      {
        id: 'doc-4',
        name: 'AWS_Certified_Architect.pdf',
        type: 'Certificate',
        uploadDate: '2023-09-20',
        size: '1.2 MB'
      }
    ],
    leaveBalances: {
      paid: 14,
      paidTotal: 24,
      sick: 7,
      sickTotal: 10,
      casual: 3,
      casualTotal: 6,
      unpaid: 0
    },
    createdAt: '2023-04-10T09:00:00.000Z'
  },
  {
    id: 'emp-3',
    employeeId: 'DES-3011',
    name: 'Elena Rostova',
    email: 'elena.rostova@dayflow.io',
    password: 'password123',
    role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 456-7890',
    address: '455 Mission Bay Blvd N, San Francisco, CA 94158',
    emergencyContact: {
      name: 'Dmitri Rostov',
      relationship: 'Parent',
      phone: '+1 (555) 123-9988'
    },
    jobDetails: {
      title: 'Lead UI/UX Product Designer',
      department: 'Design',
      joinDate: '2023-06-01',
      manager: 'Alex Vance (CEO)',
      employmentType: 'Full-Time',
      workLocation: 'Hybrid',
      status: 'Active'
    },
    salaryStructure: {
      basic: 6800,
      hra: 2300,
      allowances: 1200,
      taxDeduction: 1300,
      pfDeduction: 480,
      otherDeductions: 120,
      netSalary: 8400
    },
    documents: [
      {
        id: 'doc-5',
        name: 'Elena_Design_Portfolio_NDA.pdf',
        type: 'Contract',
        uploadDate: '2023-06-01',
        size: '3.4 MB'
      }
    ],
    leaveBalances: {
      paid: 19,
      paidTotal: 24,
      sick: 9,
      sickTotal: 10,
      casual: 5,
      casualTotal: 6,
      unpaid: 0
    },
    createdAt: '2023-06-01T09:00:00.000Z'
  },
  {
    id: 'emp-4',
    employeeId: 'MKT-4089',
    name: 'Marcus Brody',
    email: 'marcus.brody@dayflow.io',
    password: 'password123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 567-8901',
    address: '880 Howard St, San Francisco, CA 94103',
    emergencyContact: {
      name: 'Clara Brody',
      relationship: 'Spouse',
      phone: '+1 (555) 777-6655'
    },
    jobDetails: {
      title: 'VP of Product & Engineering',
      department: 'Product',
      joinDate: '2022-11-01',
      manager: 'Alex Vance (CEO)',
      employmentType: 'Full-Time',
      workLocation: 'Office',
      status: 'Active'
    },
    salaryStructure: {
      basic: 9500,
      hra: 3200,
      allowances: 2000,
      taxDeduction: 2200,
      pfDeduction: 750,
      otherDeductions: 250,
      netSalary: 11500
    },
    documents: [
      {
        id: 'doc-6',
        name: 'Executive_Agreement_Marcus.pdf',
        type: 'Contract',
        uploadDate: '2022-11-01',
        size: '2.8 MB'
      }
    ],
    leaveBalances: {
      paid: 21,
      paidTotal: 24,
      sick: 10,
      sickTotal: 10,
      casual: 6,
      casualTotal: 6,
      unpaid: 0
    },
    createdAt: '2022-11-01T09:00:00.000Z'
  },
  {
    id: 'emp-5',
    employeeId: 'FIN-5022',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@dayflow.io',
    password: 'password123',
    role: 'employee',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 678-9012',
    address: '2101 Webster St, Oakland, CA 94612',
    emergencyContact: {
      name: 'Vikram Sharma',
      relationship: 'Parent',
      phone: '+1 (555) 333-2211'
    },
    jobDetails: {
      title: 'Financial Controller & Payroll Lead',
      department: 'Finance',
      joinDate: '2023-08-15',
      manager: 'Sarah Jenkins (HR)',
      employmentType: 'Full-Time',
      workLocation: 'Remote',
      status: 'Active'
    },
    salaryStructure: {
      basic: 6200,
      hra: 2000,
      allowances: 1100,
      taxDeduction: 1150,
      pfDeduction: 430,
      otherDeductions: 120,
      netSalary: 7600
    },
    documents: [
      {
        id: 'doc-7',
        name: 'CPA_License_Verification.pdf',
        type: 'Certificate',
        uploadDate: '2023-08-15',
        size: '1.9 MB'
      }
    ],
    leaveBalances: {
      paid: 16,
      paidTotal: 24,
      sick: 8,
      sickTotal: 10,
      casual: 4,
      casualTotal: 6,
      unpaid: 0
    },
    createdAt: '2023-08-15T09:00:00.000Z'
  }
];

// Helper to get today's date formatted
const getTodayStr = () => new Date().toISOString().split('T')[0];

// Seed initial Attendance
const today = getTodayStr();
const initialAttendance: AttendanceRecord[] = [
  {
    id: 'att-1',
    userId: 'emp-1',
    employeeId: 'HR-1001',
    employeeName: 'Sarah Jenkins',
    department: 'Human Resources',
    date: today,
    checkInTime: '08:45 AM',
    status: 'Present',
    notes: 'In-office regular punch',
    location: 'San Francisco HQ'
  },
  {
    id: 'att-2',
    userId: 'emp-2',
    employeeId: 'DEV-2042',
    employeeName: 'David Chen',
    department: 'Engineering',
    date: today,
    checkInTime: '09:05 AM',
    status: 'Present',
    notes: 'Remote secure punch',
    location: 'Remote (Home)'
  },
  {
    id: 'att-3',
    userId: 'emp-3',
    employeeId: 'DES-3011',
    employeeName: 'Elena Rostova',
    department: 'Design',
    date: today,
    checkInTime: '09:15 AM',
    status: 'Present',
    notes: 'Design sync meeting attendance',
    location: 'San Francisco HQ'
  },
  {
    id: 'att-4',
    userId: 'emp-4',
    employeeId: 'MKT-4089',
    employeeName: 'Marcus Brody',
    department: 'Product',
    date: today,
    checkInTime: '08:30 AM',
    checkOutTime: '05:45 PM',
    durationHours: 9.25,
    status: 'Present',
    location: 'San Francisco HQ'
  },
  {
    id: 'att-5',
    userId: 'emp-5',
    employeeId: 'FIN-5022',
    employeeName: 'Ananya Sharma',
    department: 'Finance',
    date: today,
    status: 'Leave',
    notes: 'Approved Paid Vacation Day',
    location: 'Remote'
  }
];

// Seed initial Leaves
const initialLeaves: LeaveRequest[] = [
  {
    id: 'leave-1',
    userId: 'emp-2',
    employeeId: 'DEV-2042',
    employeeName: 'David Chen',
    department: 'Engineering',
    leaveType: 'Paid',
    startDate: '2026-08-25',
    endDate: '2026-08-27',
    totalDays: 3,
    reason: 'Attending React & Cloud Architecture Conference and taking personal time off.',
    status: 'Pending',
    appliedAt: '2026-08-20T14:30:00.000Z'
  },
  {
    id: 'leave-2',
    userId: 'emp-3',
    employeeId: 'DES-3011',
    employeeName: 'Elena Rostova',
    department: 'Design',
    leaveType: 'Sick',
    startDate: '2026-08-18',
    endDate: '2026-08-18',
    totalDays: 1,
    reason: 'Dental appointment and recovery.',
    status: 'Approved',
    appliedAt: '2026-08-17T09:00:00.000Z',
    reviewerNotes: 'Approved. Get well soon Elena!',
    reviewedBy: 'Sarah Jenkins (HR)',
    reviewedAt: '2026-08-17T11:20:00.000Z'
  },
  {
    id: 'leave-3',
    userId: 'emp-5',
    employeeId: 'FIN-5022',
    employeeName: 'Ananya Sharma',
    department: 'Finance',
    leaveType: 'Paid',
    startDate: today,
    endDate: today,
    totalDays: 1,
    reason: 'Family event and personal day.',
    status: 'Approved',
    appliedAt: '2026-08-15T10:00:00.000Z',
    reviewerNotes: 'Approved. Enjoy your day off!',
    reviewedBy: 'Sarah Jenkins (HR)',
    reviewedAt: '2026-08-16T14:00:00.000Z'
  }
];

// Seed initial Payroll
const initialPayroll: PayrollRecord[] = [
  {
    id: 'pay-1',
    payrollMonth: 'August 2026',
    employeeId: 'HR-1001',
    employeeName: 'Sarah Jenkins',
    department: 'Human Resources',
    designation: 'Head of Human Resources',
    email: 'sarah.hr@dayflow.io',
    basicSalary: 6500,
    hra: 2200,
    allowances: 1300,
    grossSalary: 10000,
    taxDeduction: 1200,
    pfDeduction: 450,
    otherDeductions: 150,
    totalDeductions: 1800,
    netSalary: 8200,
    status: 'Approved',
    paymentDate: '2026-08-31',
    paymentMethod: 'Direct Deposit (ACH)',
    transactionId: 'TXN-DF-202608-8819',
    generatedAt: '2026-08-20T08:00:00.000Z'
  },
  {
    id: 'pay-2',
    payrollMonth: 'August 2026',
    employeeId: 'DEV-2042',
    employeeName: 'David Chen',
    department: 'Engineering',
    designation: 'Senior Full Stack Engineer',
    email: 'david.chen@dayflow.io',
    basicSalary: 7200,
    hra: 2500,
    allowances: 1500,
    grossSalary: 11200,
    taxDeduction: 1450,
    pfDeduction: 500,
    otherDeductions: 100,
    totalDeductions: 2050,
    netSalary: 9150,
    status: 'Approved',
    paymentDate: '2026-08-31',
    paymentMethod: 'Direct Deposit (ACH)',
    transactionId: 'TXN-DF-202608-9920',
    generatedAt: '2026-08-20T08:00:00.000Z'
  },
  {
    id: 'pay-3',
    payrollMonth: 'August 2026',
    employeeId: 'DES-3011',
    employeeName: 'Elena Rostova',
    department: 'Design',
    designation: 'Lead UI/UX Product Designer',
    email: 'elena.rostova@dayflow.io',
    basicSalary: 6800,
    hra: 2300,
    allowances: 1200,
    grossSalary: 10300,
    taxDeduction: 1300,
    pfDeduction: 480,
    otherDeductions: 120,
    totalDeductions: 1900,
    netSalary: 8400,
    status: 'Approved',
    paymentDate: '2026-08-31',
    paymentMethod: 'Direct Deposit (ACH)',
    transactionId: 'TXN-DF-202608-7711',
    generatedAt: '2026-08-20T08:00:00.000Z'
  },
  {
    id: 'pay-4',
    payrollMonth: 'August 2026',
    employeeId: 'MKT-4089',
    employeeName: 'Marcus Brody',
    department: 'Product',
    designation: 'VP of Product & Engineering',
    email: 'marcus.brody@dayflow.io',
    basicSalary: 9500,
    hra: 3200,
    allowances: 2000,
    grossSalary: 14700,
    taxDeduction: 2200,
    pfDeduction: 750,
    otherDeductions: 250,
    totalDeductions: 3200,
    netSalary: 11500,
    status: 'Approved',
    paymentDate: '2026-08-31',
    paymentMethod: 'Direct Deposit (ACH)',
    transactionId: 'TXN-DF-202608-5544',
    generatedAt: '2026-08-20T08:00:00.000Z'
  },
  {
    id: 'pay-5',
    payrollMonth: 'August 2026',
    employeeId: 'FIN-5022',
    employeeName: 'Ananya Sharma',
    department: 'Finance',
    designation: 'Financial Controller & Payroll Lead',
    email: 'ananya.sharma@dayflow.io',
    basicSalary: 6200,
    hra: 2000,
    allowances: 1100,
    grossSalary: 9300,
    taxDeduction: 1150,
    pfDeduction: 430,
    otherDeductions: 120,
    totalDeductions: 1700,
    netSalary: 7600,
    status: 'Approved',
    paymentDate: '2026-08-31',
    paymentMethod: 'Direct Deposit (ACH)',
    transactionId: 'TXN-DF-202608-6622',
    generatedAt: '2026-08-20T08:00:00.000Z'
  }
];

// Seed initial Notifications
const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'all',
    title: 'New Leave Request Submitted',
    message: 'David Chen applied for 3 days Paid Leave from Aug 25 to Aug 27.',
    type: 'leave',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    linkTab: 'leaves'
  },
  {
    id: 'notif-2',
    userId: 'emp-2',
    title: 'Attendance Confirmed',
    message: 'Your punch-in for today was registered at 09:05 AM.',
    type: 'attendance',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    linkTab: 'attendance'
  },
  {
    id: 'notif-3',
    userId: 'all',
    title: 'August Payroll Processed',
    message: 'Monthly payroll for August 2026 has been calculated and approved.',
    type: 'payroll',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    linkTab: 'payroll'
  }
];

// In-Memory Database Store Class
class DayflowDatabase {
  employees = [...initialEmployees];
  attendance = [...initialAttendance];
  leaves = [...initialLeaves];
  payroll = [...initialPayroll];
  notifications = [...initialNotifications];

  // Employee methods
  findEmployeeByEmail(email: string) {
    return this.employees.find(e => e.email.toLowerCase() === email.toLowerCase());
  }

  findEmployeeById(id: string) {
    return this.employees.find(e => e.id === id || e.employeeId === id);
  }

  addEmployee(empData: any) {
    const newId = `emp-${Date.now()}`;
    const newEmp: Employee & { password: string } = {
      id: newId,
      employeeId: empData.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: empData.name,
      email: empData.email,
      password: empData.password || 'password123',
      role: empData.role || 'employee',
      avatar: empData.avatar || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80`,
      phone: empData.phone || '+1 (555) 000-0000',
      address: empData.address || 'San Francisco, CA',
      emergencyContact: empData.emergencyContact || {
        name: 'Family Contact',
        relationship: 'Other',
        phone: '+1 (555) 000-0000'
      },
      jobDetails: {
        title: empData.jobDetails?.title || 'Team Member',
        department: empData.jobDetails?.department || 'General',
        joinDate: empData.jobDetails?.joinDate || getTodayStr(),
        manager: empData.jobDetails?.manager || 'Sarah Jenkins',
        employmentType: empData.jobDetails?.employmentType || 'Full-Time',
        workLocation: empData.jobDetails?.workLocation || 'Hybrid',
        status: 'Active'
      },
      salaryStructure: empData.salaryStructure || {
        basic: 5000,
        hra: 1500,
        allowances: 1000,
        taxDeduction: 1000,
        pfDeduction: 350,
        otherDeductions: 100,
        netSalary: 6050
      },
      documents: empData.documents || [],
      leaveBalances: {
        paid: 24,
        paidTotal: 24,
        sick: 10,
        sickTotal: 10,
        casual: 6,
        casualTotal: 6,
        unpaid: 0
      },
      createdAt: new Date().toISOString()
    };
    this.employees.push(newEmp);
    return newEmp;
  }

  updateEmployee(id: string, updates: Partial<Employee>) {
    const index = this.employees.findIndex(e => e.id === id || e.employeeId === id);
    if (index === -1) return null;

    this.employees[index] = {
      ...this.employees[index],
      ...updates,
      jobDetails: {
        ...this.employees[index].jobDetails,
        ...(updates.jobDetails || {})
      },
      salaryStructure: {
        ...this.employees[index].salaryStructure,
        ...(updates.salaryStructure || {})
      },
      emergencyContact: {
        ...this.employees[index].emergencyContact,
        ...(updates.emergencyContact || {})
      }
    };
    return this.employees[index];
  }

  deleteEmployee(id: string) {
    const initialLen = this.employees.length;
    this.employees = this.employees.filter(e => e.id !== id && e.employeeId !== id);
    return this.employees.length < initialLen;
  }

  // Attendance methods
  getAttendanceForDate(date: string) {
    return this.attendance.filter(a => a.date === date);
  }

  getAttendanceForUser(userId: string) {
    return this.attendance.filter(a => a.userId === userId || a.employeeId === userId);
  }

  checkIn(userId: string, notes?: string, location?: string) {
    const emp = this.findEmployeeById(userId);
    if (!emp) return null;

    const todayDate = getTodayStr();
    const existing = this.attendance.find(a => a.userId === emp.id && a.date === todayDate);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (existing) {
      existing.checkInTime = timeStr;
      existing.status = 'Present';
      if (notes) existing.notes = notes;
      if (location) existing.location = location;
      return existing;
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: emp.id,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.jobDetails.department,
      date: todayDate,
      checkInTime: timeStr,
      status: 'Present',
      notes: notes || 'Standard punch-in',
      location: location || 'Office HQ'
    };
    this.attendance.unshift(newRecord);
    return newRecord;
  }

  checkOut(userId: string) {
    const emp = this.findEmployeeById(userId);
    if (!emp) return null;

    const todayDate = getTodayStr();
    const existing = this.attendance.find(a => a.userId === emp.id && a.date === todayDate);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (existing) {
      existing.checkOutTime = timeStr;
      existing.durationHours = 8.5; // Calculated or standard
      return existing;
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: emp.id,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.jobDetails.department,
      date: todayDate,
      checkOutTime: timeStr,
      status: 'Present',
      durationHours: 8.0,
      location: 'Office HQ'
    };
    this.attendance.unshift(newRecord);
    return newRecord;
  }

  updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>) {
    const index = this.attendance.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.attendance[index] = { ...this.attendance[index], ...updates };
    return this.attendance[index];
  }

  addManualAttendance(recordData: any) {
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: recordData.userId,
      employeeId: recordData.employeeId,
      employeeName: recordData.employeeName,
      department: recordData.department || 'General',
      date: recordData.date || getTodayStr(),
      checkInTime: recordData.checkInTime,
      checkOutTime: recordData.checkOutTime,
      durationHours: recordData.durationHours || 8,
      status: recordData.status || 'Present',
      notes: recordData.notes || 'Admin manual log',
      location: recordData.location || 'Office HQ'
    };
    this.attendance.unshift(newRecord);
    return newRecord;
  }

  // Leaves methods
  applyLeave(data: { userId: string; leaveType: LeaveType; startDate: string; endDate: string; totalDays: number; reason: string }) {
    const emp = this.findEmployeeById(data.userId);
    if (!emp) return null;

    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      userId: emp.id,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.jobDetails.department,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: data.totalDays || 1,
      reason: data.reason,
      status: 'Pending',
      appliedAt: new Date().toISOString()
    };

    this.leaves.unshift(newLeave);

    // Notify admins
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'all',
      title: `New ${data.leaveType} Leave Request`,
      message: `${emp.name} requested ${data.totalDays} day(s) off from ${data.startDate} to ${data.endDate}.`,
      type: 'leave',
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: 'leaves'
    });

    return newLeave;
  }

  reviewLeave(leaveId: string, status: 'Approved' | 'Rejected', reviewerNotes: string, reviewerName: string) {
    const leave = this.leaves.find(l => l.id === leaveId);
    if (!leave) return null;

    leave.status = status;
    leave.reviewerNotes = reviewerNotes;
    leave.reviewedBy = reviewerName;
    leave.reviewedAt = new Date().toISOString();

    // If approved, deduct leave balance from employee
    if (status === 'Approved') {
      const emp = this.findEmployeeById(leave.userId);
      if (emp && emp.leaveBalances) {
        if (leave.leaveType === 'Paid') {
          emp.leaveBalances.paid = Math.max(0, emp.leaveBalances.paid - leave.totalDays);
        } else if (leave.leaveType === 'Sick') {
          emp.leaveBalances.sick = Math.max(0, emp.leaveBalances.sick - leave.totalDays);
        } else if (leave.leaveType === 'Casual') {
          emp.leaveBalances.casual = Math.max(0, emp.leaveBalances.casual - leave.totalDays);
        } else if (leave.leaveType === 'Unpaid') {
          emp.leaveBalances.unpaid += leave.totalDays;
        }
      }
    }

    // Add notification for employee
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: leave.userId,
      title: `Leave Request ${status}`,
      message: `Your request for ${leave.leaveType} leave (${leave.startDate} to ${leave.endDate}) was ${status.toLowerCase()} by ${reviewerName}.`,
      type: 'leave',
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: 'leaves'
    });

    return leave;
  }

  // Payroll methods
  generatePayrollForMonth(monthStr: string) {
    const records: PayrollRecord[] = this.employees.map(emp => {
      const gross = emp.salaryStructure.basic + emp.salaryStructure.hra + emp.salaryStructure.allowances;
      const deductions = emp.salaryStructure.taxDeduction + emp.salaryStructure.pfDeduction + emp.salaryStructure.otherDeductions;
      const net = gross - deductions;

      return {
        id: `pay-${Date.now()}-${emp.employeeId}`,
        payrollMonth: monthStr,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.jobDetails.department,
        designation: emp.jobDetails.title,
        email: emp.email,
        basicSalary: emp.salaryStructure.basic,
        hra: emp.salaryStructure.hra,
        allowances: emp.salaryStructure.allowances,
        grossSalary: gross,
        taxDeduction: emp.salaryStructure.taxDeduction,
        pfDeduction: emp.salaryStructure.pfDeduction,
        otherDeductions: emp.salaryStructure.otherDeductions,
        totalDeductions: deductions,
        netSalary: net,
        status: 'Approved',
        paymentDate: `${monthStr.replace(' ', '-')}-28`,
        paymentMethod: 'Direct Bank Transfer',
        transactionId: `TXN-DF-${Date.now().toString().slice(-6)}`,
        generatedAt: new Date().toISOString()
      };
    });

    this.payroll = [...records, ...this.payroll.filter(p => p.payrollMonth !== monthStr)];
    return records;
  }

  updatePayrollRecord(id: string, updates: Partial<PayrollRecord>) {
    const idx = this.payroll.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.payroll[idx] = { ...this.payroll[idx], ...updates };
    return this.payroll[idx];
  }
}

export const db = new DayflowDatabase();
