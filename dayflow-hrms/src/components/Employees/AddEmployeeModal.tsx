import React, { useState } from 'react';
import { X, UserPlus, Save, Briefcase, DollarSign, User, ShieldCheck } from 'lucide-react';
import { Employee, UserRole } from '../../types';
import { api } from '../../services/api';

interface AddEmployeeModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  onClose,
  onCreated
}) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('employee');
  const [employeeId, setEmployeeId] = useState(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [title, setTitle] = useState('Associate Engineer');
  const [department, setDepartment] = useState('Engineering');
  const [manager, setManager] = useState('Sarah Jenkins (HR)');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [address, setAddress] = useState('100 Pine Street, San Francisco, CA');
  const [employmentType, setEmploymentType] = useState<'Full-Time' | 'Part-Time' | 'Contract' | 'Intern'>('Full-Time');
  const [workLocation, setWorkLocation] = useState<'Office' | 'Remote' | 'Hybrid'>('Hybrid');
  const [basicSalary, setBasicSalary] = useState(6000);
  const [hra, setHra] = useState(2000);
  const [allowances, setAllowances] = useState(1000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    try {
      const gross = basicSalary + hra + allowances;
      const tax = Math.round(gross * 0.12);
      const pf = Math.round(basicSalary * 0.07);
      const other = 100;
      const net = gross - (tax + pf + other);

      await api.createEmployee({
        employeeId,
        name,
        email,
        role,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
        phone,
        address,
        jobDetails: {
          title,
          department,
          joinDate: new Date().toISOString().split('T')[0],
          manager,
          employmentType,
          workLocation,
          status: 'Active'
        },
        salaryStructure: {
          basic: basicSalary,
          hra,
          allowances,
          taxDeduction: tax,
          pfDeduction: pf,
          otherDeductions: other,
          netSalary: net
        }
      });

      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Onboard New Employee</h2>
              <p className="text-xs text-slate-400">Initialize profile, job designation, and compensation tier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Section 1: Basic & Credentials */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" /> Identity & Access
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Corporate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="jordan.miller@dayflow.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Role / Access Level</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
                >
                  <option value="employee">Standard Employee (Staff)</option>
                  <option value="admin">HR Administrator / Manager</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Job Details */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Organizational Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Designation Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Employment Model</label>
                <select
                  value={employmentType}
                  onChange={e => setEmploymentType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Work Location</label>
                <select
                  value={workLocation}
                  onChange={e => setWorkLocation(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
                >
                  <option value="Hybrid">Hybrid Flexible</option>
                  <option value="Office">Office HQ</option>
                  <option value="Remote">100% Remote</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Salary Tier */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-600" /> Monthly Salary Baseline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Basic Salary ($)</label>
                <input
                  type="number"
                  value={basicSalary}
                  onChange={e => setBasicSalary(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">HRA ($)</label>
                <input
                  type="number"
                  value={hra}
                  onChange={e => setHra(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Allowances ($)</label>
                <input
                  type="number"
                  value={allowances}
                  onChange={e => setAllowances(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Statutory deductions (Income Tax & PF) and 24 paid vacation days will be calculated automatically.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? 'Creating...' : 'Complete Onboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
