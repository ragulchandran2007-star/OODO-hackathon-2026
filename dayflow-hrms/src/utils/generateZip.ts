import JSZip from 'jszip';

export async function generateProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file('README.md', `# Dayflow - Human Resource Management System (HRMS)
> Every workday, perfectly aligned.

A modern, full-stack Human Resource Management System built with **React, TypeScript, Express, and MongoDB / Mongoose**.

## Features
- **Role-Based Access Control**: Separate secure portals for HR Admins and Employees.
- **Employee Management**: Profile directory, job details, compensation structure, documents, and emergency contacts.
- **Attendance & Timesheets**: Real-time punch in/punch out with live tracking, monthly calendar timesheets, and admin status overrides.
- **Leave & Time-Off System**: Leave application with automatic balance deduction, multi-day calendar support, and approval workflows.
- **Payroll & Salary Engine**: Gross/net salary calculator with tax, PF, HRA allowances, and printable professional payslips.
- **Executive Analytics**: Real-time workforce metrics, department distribution, attendance rates, and exportable reports.

---

## 🚀 Quick Start Instructions

### 1. Prerequisites
- Node.js (v18 or v20+)
- MongoDB (Local instance or MongoDB Atlas URI)

### 2. Installation
\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration
Copy \`.env.example\` to \`.env\` and provide your configuration:
\`\`\`bash
cp .env.example .env
\`\`\`

\`\`\`env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dayflow_hrms
JWT_SECRET=dayflow_secure_jwt_secret_token_2026
\`\`\`

### 4. Running the Project
\`\`\`bash
# Development mode (starts Express server with Vite middleware on port 3000)
npm run dev

# Production build
npm run build
npm start
\`\`\`

---

## 🐳 Docker Deployment
\`\`\`bash
docker compose up --build
\`\`\`
`);

  zip.file('docker-compose.yml', `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - MONGODB_URI=mongodb://mongo:27017/dayflow_hrms
      - JWT_SECRET=dayflow_prod_secret_2026
    depends_on:
      - mongo

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
`);

  zip.file('Dockerfile', `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
`);

  zip.file('.env.example', `# Server Configuration
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dayflow_hrms
JWT_SECRET=dayflow_jwt_secret_hrms_secure_token
GEMINI_API_KEY=
APP_URL=http://localhost:3000
`);

  zip.file('package.json', JSON.stringify({
    name: "dayflow-hrms",
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      "dev": "tsx server.ts",
      "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
      "start": "node dist/server.cjs",
      "lint": "tsc --noEmit"
    },
    dependencies: {
      "@tailwindcss/vite": "^4.1.14",
      "@vitejs/plugin-react": "^5.0.4",
      "dotenv": "^17.2.3",
      "express": "^4.21.2",
      "jszip": "^3.10.1",
      "lucide-react": "^0.546.0",
      "motion": "^12.23.24",
      "mongoose": "^8.9.5",
      "react": "^19.0.1",
      "react-dom": "^19.0.1",
      "vite": "^6.2.3"
    },
    devDependencies: {
      "@types/express": "^4.17.21",
      "@types/node": "^22.14.0",
      "autoprefixer": "^10.4.21",
      "esbuild": "^0.25.0",
      "tailwindcss": "^4.1.14",
      "tsx": "^4.21.0",
      "typescript": "~5.8.2"
    }
  }, null, 2));

  // Backend folder structure
  const serverFolder = zip.folder('server');
  serverFolder?.file('server.ts', `import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use('/api', apiRouter);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Dayflow HRMS running on http://localhost:\${PORT}\`);
  });
}

startServer();
`);

  const modelsFolder = serverFolder?.folder('models');
  modelsFolder?.file('User.ts', `import mongoose, { Schema, Document } from 'mongoose';

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
    name: String,
    relationship: String,
    phone: String
  },
  jobDetails: {
    title: String,
    department: String,
    joinDate: String,
    manager: String,
    employmentType: String,
    workLocation: String,
    status: { type: String, default: 'Active' }
  },
  salaryStructure: {
    basic: Number,
    hra: Number,
    allowances: Number,
    taxDeduction: Number,
    pfDeduction: Number,
    otherDeductions: Number,
    netSalary: Number
  },
  documents: Array,
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
`);

  modelsFolder?.file('Attendance.ts', `import mongoose, { Schema, Document } from 'mongoose';

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
  checkInTime: String,
  checkOutTime: String,
  durationHours: Number,
  status: { type: String, enum: ['Present', 'Absent', 'Half-day', 'Leave'], default: 'Present' },
  notes: String,
  location: String
}, { timestamps: true });

export const AttendanceModel = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
`);

  modelsFolder?.file('Leave.ts', `import mongoose, { Schema, Document } from 'mongoose';

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
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

const LeaveSchema = new Schema<ILeaveRequest>({
  userId: { type: String, required: true, index: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: String,
  leaveType: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  totalDays: { type: Number, default: 1 },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  reviewerNotes: String,
  reviewedBy: String,
  reviewedAt: Date
}, { timestamps: true });

export const LeaveModel = mongoose.models.Leave || mongoose.model<ILeaveRequest>('Leave', LeaveSchema);
`);

  modelsFolder?.file('Payroll.ts', `import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
  payrollMonth: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
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
  transactionId?: string;
}

const PayrollSchema = new Schema<IPayroll>({
  payrollMonth: { type: String, required: true, index: true },
  employeeId: { type: String, required: true, index: true },
  employeeName: { type: String, required: true },
  department: String,
  designation: String,
  basicSalary: Number,
  hra: Number,
  allowances: Number,
  grossSalary: Number,
  taxDeduction: Number,
  pfDeduction: Number,
  otherDeductions: Number,
  totalDeductions: Number,
  netSalary: Number,
  status: { type: String, enum: ['Draft', 'Approved', 'Paid'], default: 'Approved' },
  paymentDate: String,
  transactionId: String
}, { timestamps: true });

export const PayrollModel = mongoose.models.Payroll || mongoose.model<IPayroll>('Payroll', PayrollSchema);
`);

  return zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string = 'Dayflow-HRMS-Complete-Project.zip') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
