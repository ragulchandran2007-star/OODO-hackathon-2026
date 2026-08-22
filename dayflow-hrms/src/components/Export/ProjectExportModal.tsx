import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Database, 
  FolderTree, 
  Server, 
  Layers, 
  CheckCircle2, 
  Code, 
  Terminal, 
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { generateProjectZip, downloadBlob } from '../../utils/generateZip';

interface ProjectExportModalProps {
  onClose: () => void;
}

export const ProjectExportModal: React.FC<ProjectExportModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'structure' | 'mongodb' | 'instructions'>('flow');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await generateProjectZip();
      downloadBlob(blob, 'Dayflow-HRMS-Complete-Project.zip');
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 my-6">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Dayflow HRMS • Project Flow & Full Source Code</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  MongoDB + Express + React
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Complete enterprise human resource management solution with production-ready MongoDB schemas & ZIP packaging
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-bounce' : ''}`} />
              {downloading ? 'Packing Source Files...' : 'Download Full Project ZIP'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('flow')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'flow'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Project Flow Diagram
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'structure'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" /> Directory Structure
          </button>
          <button
            onClick={() => setActiveTab('mongodb')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'mongodb'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> MongoDB & Mongoose Schemas
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'instructions'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Setup & Run Guide
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: PROJECT FLOW */}
          {activeTab === 'flow' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">End-to-End System Flow Architecture</h3>
                <p className="text-xs text-slate-500">
                  Visual mapping of how client requests route to Express endpoints, Mongoose ODM, and MongoDB database collections.
                </p>
              </div>

              {/* Architecture Flow Box */}
              <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Step 1 */}
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                      1. React Client (SPA)
                    </span>
                    <h4 className="text-xs font-bold text-white">Interactive Portals</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Role-based Admin & Employee Dashboards, Live Check-in, Leave requests, and Payslip viewer.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      2. API Client / Fetch
                    </span>
                    <h4 className="text-xs font-bold text-white">REST API Contract</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Typed JSON request payloads, JWT authorization headers, and error handling.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      3. Express Server
                    </span>
                    <h4 className="text-xs font-bold text-white">Business Logic Engine</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Statutory salary math, leave balance deductions, automatic timestamps, and auth checks.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                      4. MongoDB Database
                    </span>
                    <h4 className="text-xs font-bold text-white">Mongoose ODM</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Collections for Users, Attendance logs, Leave requests, Payroll records, and Audit telemetry.
                    </p>
                  </div>
                </div>
              </div>

              {/* Functional Modules Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Employee & Admin Role Matrix
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc">
                    <li>HR Admin: Manage all employees, approve/reject leaves, run payroll batch.</li>
                    <li>Employee: Punch in/out, view payslips, apply for leaves, edit emergency info.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dual-Mode Storage Architecture
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc">
                    <li>Cloud preview mode: In-memory seed database with zero-setup instant demo.</li>
                    <li>MongoDB production mode: Connects to MongoDB Atlas via <code className="text-indigo-600 font-mono">MONGODB_URI</code>.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STRUCTURE */}
          {activeTab === 'structure' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Complete Project Directory Tree</h3>
                <p className="text-xs text-slate-500">
                  Included in the generated ZIP file ready for extraction and immediate execution:
                </p>
              </div>

              <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                <pre>{`dayflow-hrms-fullstack/
├── .env.example                     # Environment variables (MONGODB_URI, PORT)
├── package.json                     # Frontend & Backend dependencies and scripts
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite build tool setup with Tailwind CSS
├── server.ts                        # Unified Express entry point with Vite middleware
├── server/                          # Backend Node.js & MongoDB architecture
│   ├── db.ts                        # In-memory persistence & seed store
│   ├── routes.ts                    # REST API routes (Auth, Employees, Leaves, Attendance, Payroll)
│   └── models/
│       └── mongooseSchemas.ts       # Production Mongoose Schemas (User, Attendance, Leave, Payroll)
└── src/                             # Modern React 19 Frontend
    ├── main.tsx                     # React client mounting entry
    ├── App.tsx                      # Root component with routing and modal state
    ├── index.css                    # Tailwind CSS v4 directives and print styles
    ├── types.ts                     # Full TypeScript interfaces
    ├── context/
    │   └── AuthContext.tsx          # Role-Based Authentication & Session Provider
    ├── services/
    │   └── api.ts                   # Typed API service client
    ├── components/
    │   ├── Header.tsx               # Global navigation, demo switch & punch badge
    │   ├── Sidebar.tsx              # Modular sidebar navigation
    │   ├── Dashboard/
    │   │   ├── AdminDashboard.tsx   # Executive analytics and workflow queues
    │   │   └── EmployeeDashboard.tsx# Self-service employee portal
    │   ├── Employees/
    │   │   ├── EmployeeList.tsx     # Searchable workforce directory (Grid & Table)
    │   │   ├── EmployeeProfileModal.tsx # Tabbed profile, compensation & documents
    │   │   └── AddEmployeeModal.tsx # Onboarding modal with salary calculator
    │   ├── Attendance/
    │   │   ├── AttendanceTracker.tsx# Real-time punch widget and timesheet records
    │   │   └── ManualAttendanceModal.tsx # HR manual punch override modal
    │   ├── Leave/
    │   │   ├── LeaveManagement.tsx  # Leave quotas, time-off requests, and history
    │   │   ├── ApplyLeaveModal.tsx  # Employee time-off application modal
    │   │   └── LeaveReviewModal.tsx # HR Approval / Rejection modal with comments
    │   ├── Payroll/
    │   │   ├── PayrollManagement.tsx# Batch payroll generator & salary overview
    │   │   └── PayslipModal.tsx     # Printable formal pay stub with deductions
    │   ├── Analytics/
    │   │   └── AnalyticsReports.tsx # Headcount visual graphs and CSV export
    │   └── Export/
    │       └── ProjectExportModal.tsx # Project flow and ZIP packaging modal
    └── utils/
        └── generateZip.ts           # JSZip packaging engine`}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: MONGODB SCHEMAS */}
          {activeTab === 'mongodb' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mongoose / MongoDB Schema Declarations</h3>
                <p className="text-xs text-slate-500">
                  Ready to deploy to MongoDB Atlas, local MongoDB Community, or Docker:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <Database className="w-3.5 h-3.5 text-indigo-600" />
                    1. User & Employee Collection (`users`)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    Stores employee profiles, credentials, role (Admin/Employee), contact info, emergency contacts, job details, compensation structure, and uploaded credentials.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    2. Attendance Log Collection (`attendances`)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    Indexes punch-in/punch-out timestamps, shift duration hours, status (Present, Half-day, Leave, Absent), and location flags.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <Database className="w-3.5 h-3.5 text-amber-600" />
                    3. Leave Requests Collection (`leaves`)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    Stores leave applications with dates, category (Paid, Sick, Casual, Unpaid), status (Pending, Approved, Rejected), employee reason, and HR reviewer comments.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <Database className="w-3.5 h-3.5 text-purple-600" />
                    4. Payroll Records Collection (`payrolls`)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    Stores generated monthly pay stubs with itemized basic pay, HRA, allowances, TDS tax deductions, PF contributions, and net payout.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETUP GUIDE */}
          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">How to Run Locally on Your Machine</h3>
                <p className="text-xs text-slate-500">
                  Follow these simple steps after downloading and unzipping the project:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                    Extract the ZIP & Install Dependencies
                  </div>
                  <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono">
                    unzip Dayflow-HRMS-Complete-Project.zip<br/>
                    cd dayflow-hrms<br/>
                    npm install
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                    Set Up Environment (Optional for MongoDB)
                  </div>
                  <p className="text-slate-600">
                    Create a <code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-slate-800">.env</code> file. If left blank, it automatically runs in high-speed in-memory store mode:
                  </p>
                  <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono">
                    MONGODB_URI=mongodb://localhost:27017/dayflow-hrms<br/>
                    PORT=3000
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                    Start the Full-Stack Dev Server
                  </div>
                  <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono">
                    npm run dev
                  </div>
                  <p className="text-slate-600">
                    Open <code className="font-mono text-indigo-600">http://localhost:3000</code> in your browser!
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Self-contained Full-Stack Project with Zero External Bloat
          </span>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'Packing...' : 'Download ZIP Archive'}
          </button>
        </div>

      </div>
    </div>
  );
};
