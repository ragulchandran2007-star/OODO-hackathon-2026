import { Router, Request, Response } from 'express';
import { db } from './db';

const router = Router();

// ================= AUTH ROUTES =================
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findEmployeeByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password: _, ...userWithoutPassword } = user;
  return res.json({
    token: `jwt-token-${user.id}-${Date.now()}`,
    user: userWithoutPassword
  });
});

router.post('/auth/register', (req: Request, res: Response) => {
  const { employeeId, name, email, password, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const existing = db.findEmployeeByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newEmp = db.addEmployee({
    employeeId,
    name,
    email,
    password,
    role: role || 'employee',
    jobDetails: {
      title: role === 'admin' ? 'HR Specialist' : 'Software Associate',
      department: role === 'admin' ? 'Human Resources' : 'Engineering'
    }
  });

  const { password: _, ...userWithoutPassword } = newEmp;
  return res.status(201).json({
    token: `jwt-token-${newEmp.id}-${Date.now()}`,
    user: userWithoutPassword
  });
});

router.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  // Extract user id or return first admin/employee as fallback
  const user = db.employees[0];
  const { password: _, ...userWithoutPassword } = user;
  return res.json({ user: userWithoutPassword });
});

// ================= EMPLOYEES ROUTES =================
router.get('/employees', (req: Request, res: Response) => {
  const { department, search, status } = req.query;
  let results = db.employees.map(({ password: _, ...emp }) => emp);

  if (department && typeof department === 'string') {
    results = results.filter(e => e.jobDetails.department.toLowerCase() === department.toLowerCase());
  }

  if (status && typeof status === 'string') {
    results = results.filter(e => e.jobDetails.status.toLowerCase() === status.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.employeeId.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.jobDetails.title.toLowerCase().includes(q) ||
      e.jobDetails.department.toLowerCase().includes(q)
    );
  }

  return res.json(results);
});

router.get('/employees/:id', (req: Request, res: Response) => {
  const emp = db.findEmployeeById(req.params.id);
  if (!emp) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  const { password: _, ...userWithoutPassword } = emp;
  return res.json(userWithoutPassword);
});

router.post('/employees', (req: Request, res: Response) => {
  const created = db.addEmployee(req.body);
  const { password: _, ...userWithoutPassword } = created;
  return res.status(201).json(userWithoutPassword);
});

router.put('/employees/:id', (req: Request, res: Response) => {
  const updated = db.updateEmployee(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  const { password: _, ...userWithoutPassword } = updated;
  return res.json(userWithoutPassword);
});

router.delete('/employees/:id', (req: Request, res: Response) => {
  const success = db.deleteEmployee(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  return res.json({ success: true, message: 'Employee record archived' });
});

// ================= ATTENDANCE ROUTES =================
router.get('/attendance', (req: Request, res: Response) => {
  const { date, userId, employeeId } = req.query;
  let records = db.attendance;

  if (date && typeof date === 'string') {
    records = records.filter(a => a.date === date);
  }
  if (userId && typeof userId === 'string') {
    records = records.filter(a => a.userId === userId || a.employeeId === userId);
  }
  if (employeeId && typeof employeeId === 'string') {
    records = records.filter(a => a.employeeId === employeeId);
  }

  return res.json(records);
});

router.post('/attendance/checkin', (req: Request, res: Response) => {
  const { userId, notes, location } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const record = db.checkIn(userId, notes, location);
  if (!record) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  return res.json(record);
});

router.post('/attendance/checkout', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const record = db.checkOut(userId);
  if (!record) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  return res.json(record);
});

router.post('/attendance/manual', (req: Request, res: Response) => {
  const record = db.addManualAttendance(req.body);
  return res.status(201).json(record);
});

router.put('/attendance/:id', (req: Request, res: Response) => {
  const updated = db.updateAttendanceRecord(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Attendance record not found' });
  }
  return res.json(updated);
});

// ================= LEAVES ROUTES =================
router.get('/leaves', (req: Request, res: Response) => {
  const { userId, status } = req.query;
  let leaves = db.leaves;

  if (userId && typeof userId === 'string') {
    leaves = leaves.filter(l => l.userId === userId || l.employeeId === userId);
  }
  if (status && typeof status === 'string') {
    leaves = leaves.filter(l => l.status.toLowerCase() === status.toLowerCase());
  }

  return res.json(leaves);
});

router.post('/leaves', (req: Request, res: Response) => {
  const { userId, leaveType, startDate, endDate, totalDays, reason } = req.body;
  if (!userId || !leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({ error: 'All leave fields are required' });
  }

  const newLeave = db.applyLeave({
    userId,
    leaveType,
    startDate,
    endDate,
    totalDays: totalDays || 1,
    reason
  });

  if (!newLeave) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  return res.status(201).json(newLeave);
});

router.put('/leaves/:id/review', (req: Request, res: Response) => {
  const { status, reviewerNotes, reviewerName } = req.body;
  if (!status || !['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Valid status (Approved or Rejected) is required' });
  }

  const reviewed = db.reviewLeave(
    req.params.id,
    status,
    reviewerNotes || 'Processed by HR',
    reviewerName || 'HR Admin'
  );

  if (!reviewed) {
    return res.status(404).json({ error: 'Leave request not found' });
  }

  return res.json(reviewed);
});

// ================= PAYROLL ROUTES =================
router.get('/payroll', (req: Request, res: Response) => {
  const { month, employeeId } = req.query;
  let list = db.payroll;

  if (month && typeof month === 'string') {
    list = list.filter(p => p.payrollMonth.toLowerCase() === month.toLowerCase());
  }
  if (employeeId && typeof employeeId === 'string') {
    list = list.filter(p => p.employeeId === employeeId);
  }

  return res.json(list);
});

router.post('/payroll/generate', (req: Request, res: Response) => {
  const { month } = req.body;
  const targetMonth = month || 'August 2026';
  const generated = db.generatePayrollForMonth(targetMonth);
  return res.json({ success: true, count: generated.length, records: generated });
});

router.put('/payroll/:id', (req: Request, res: Response) => {
  const updated = db.updatePayrollRecord(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Payroll record not found' });
  }
  return res.json(updated);
});

// ================= ANALYTICS & DASHBOARD =================
router.get('/analytics', (req: Request, res: Response) => {
  const totalEmployees = db.employees.length;
  const today = new Date().toISOString().split('T')[0];
  const todayAtt = db.attendance.filter(a => a.date === today);

  const presentToday = todayAtt.filter(a => a.status === 'Present').length;
  const onLeaveToday = todayAtt.filter(a => a.status === 'Leave').length;
  const absentToday = Math.max(0, totalEmployees - presentToday - onLeaveToday);

  const pendingLeavesCount = db.leaves.filter(l => l.status === 'Pending').length;
  const monthlyPayrollTotal = db.employees.reduce((acc, e) => acc + e.salaryStructure.netSalary, 0);
  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 100;

  // Department distribution
  const departmentCounts: Record<string, number> = {};
  db.employees.forEach(e => {
    const dept = e.jobDetails.department || 'General';
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  });

  return res.json({
    stats: {
      totalEmployees,
      presentToday,
      absentToday,
      onLeaveToday,
      pendingLeavesCount,
      monthlyPayrollTotal,
      attendanceRate
    },
    departmentCounts,
    recentLeaves: db.leaves.slice(0, 5),
    todayAttendance: todayAtt
  });
});

// ================= NOTIFICATIONS ROUTES =================
router.get('/notifications', (req: Request, res: Response) => {
  const { userId } = req.query;
  let notifs = db.notifications;
  if (userId && typeof userId === 'string') {
    notifs = notifs.filter(n => n.userId === 'all' || n.userId === userId);
  }
  return res.json(notifs);
});

router.put('/notifications/:id/read', (req: Request, res: Response) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
  }
  return res.json({ success: true });
});

export default router;
