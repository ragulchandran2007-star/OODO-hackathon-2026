import React, { useState } from 'react';
import { 
  X, 
  User, 
  Briefcase, 
  DollarSign, 
  FileText, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Save, 
  Upload, 
  Trash2, 
  Download,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Employee, EmployeeDocument } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  computeSalary,
  toSalaryStructure,
  DEFAULT_BASIC_PERCENT,
  DEFAULT_HRA_PERCENT,
  DEFAULT_STANDARD_ALLOWANCE_PERCENT,
  DEFAULT_PERFORMANCE_BONUS_PERCENT,
  DEFAULT_LTA_PERCENT,
  DEFAULT_PF_EMPLOYEE_PERCENT,
  DEFAULT_PF_EMPLOYER_PERCENT,
  DEFAULT_PROFESSIONAL_TAX,
  DEFAULT_WORKING_DAYS_PER_WEEK,
  DEFAULT_BREAK_TIME_HOURS
} from '../../utils/salaryCalc';

interface EmployeeProfileModalProps {
  employee: Employee | null;
  onClose: () => void;
  onUpdated: () => void;
  /** When true (e.g. opened from the directory card list), the profile opens
   * in a read-only mode and editing controls are hidden, regardless of role. */
  viewOnly?: boolean;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  employee,
  onClose,
  onUpdated,
  viewOnly = false
}) => {
  const { role: currentUserRole, user: currentUser, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'job' | 'salary' | 'documents'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!employee) return null;

  const isAdmin = currentUserRole === 'admin';
  const isOwnProfile = currentUser?.id === employee.id;
  const canEdit = !viewOnly && (isAdmin || isOwnProfile);
  // Salary Info tab should only be visible to Admins.
  const canSeeSalaryTab = isAdmin;

  // Form states
  const [formData, setFormData] = useState<Employee>({ ...employee });

  // Wage-based Salary Info config (wireframe-accurate). Initialized from the
  // employee's stored structure, falling back to sane defaults / legacy basic pay.
  const [salaryConfig, setSalaryConfig] = useState(() => {
    const s = employee.salaryStructure;
    const monthlyWage = s.monthlyWage ?? (s.basic > 0 ? Math.round(s.basic / ((s.basicPercent ?? DEFAULT_BASIC_PERCENT) / 100)) : 50000);
    return {
      monthlyWage,
      basicPercent: s.basicPercent ?? DEFAULT_BASIC_PERCENT,
      hraPercent: s.hraPercent ?? DEFAULT_HRA_PERCENT,
      standardAllowancePercent: s.standardAllowancePercent ?? DEFAULT_STANDARD_ALLOWANCE_PERCENT,
      performanceBonusPercent: s.performanceBonusPercent ?? DEFAULT_PERFORMANCE_BONUS_PERCENT,
      leaveTravelAllowancePercent: s.leaveTravelAllowancePercent ?? DEFAULT_LTA_PERCENT,
      pfEmployeePercent: s.pfEmployeePercent ?? DEFAULT_PF_EMPLOYEE_PERCENT,
      pfEmployerPercent: s.pfEmployerPercent ?? DEFAULT_PF_EMPLOYER_PERCENT,
      professionalTax: s.professionalTax ?? DEFAULT_PROFESSIONAL_TAX,
      workingDaysPerWeek: s.workingDaysPerWeek ?? DEFAULT_WORKING_DAYS_PER_WEEK,
      breakTimeHours: s.breakTimeHours ?? DEFAULT_BREAK_TIME_HOURS
    };
  });

  // Recompute every component whenever the wage or any percentage changes.
  const computedSalary = computeSalary(salaryConfig);

  // Keep formData.salaryStructure in sync with the live computed salary so
  // Save persists the up-to-date structure (and legacy fields stay correct).
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      salaryStructure: toSalaryStructure(computedSalary, salaryConfig)
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    salaryConfig.monthlyWage,
    salaryConfig.basicPercent,
    salaryConfig.hraPercent,
    salaryConfig.standardAllowancePercent,
    salaryConfig.performanceBonusPercent,
    salaryConfig.leaveTravelAllowancePercent,
    salaryConfig.pfEmployeePercent,
    salaryConfig.pfEmployerPercent,
    salaryConfig.professionalTax,
    salaryConfig.workingDaysPerWeek,
    salaryConfig.breakTimeHours
  ]);

  // If a non-admin somehow lands on the salary tab (e.g. stale state), bounce to Personal Details.
  React.useEffect(() => {
    if (activeTab === 'salary' && !canSeeSalaryTab) {
      setActiveTab('personal');
    }
  }, [activeTab, canSeeSalaryTab]);

  const handleSave = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      // If employee, only update allowed fields
      const payload: Partial<Employee> = isAdmin ? formData : {
        phone: formData.phone,
        address: formData.address,
        avatar: formData.avatar,
        emergencyContact: formData.emergencyContact
      };

      await api.updateEmployee(employee.id, payload);
      setSuccessMsg('Profile changes successfully saved.');
      await refreshUser();
      onUpdated();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMockDocument = async (docType: string) => {
    const newDoc: EmployeeDocument = {
      id: `doc-${Date.now()}`,
      name: `${docType.replace(/\s+/g, '_')}_${employee.name.replace(/\s+/g, '_')}.pdf`,
      type: docType as any,
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`
    };

    const updatedDocs = [...(formData.documents || []), newDoc];
    setFormData(prev => ({ ...prev, documents: updatedDocs }));
    await api.updateEmployee(employee.id, { documents: updatedDocs });
    onUpdated();
  };

  const handleDeleteDocument = async (docId: string) => {
    const updatedDocs = (formData.documents || []).filter(d => d.id !== docId);
    setFormData(prev => ({ ...prev, documents: updatedDocs }));
    await api.updateEmployee(employee.id, { documents: updatedDocs });
    onUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-800/60/50 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900/80 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={formData.avatar}
              alt={formData.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-400"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{formData.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-indigo-300 border border-indigo-400/30">
                  {formData.employeeId}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-emerald-300">
                  {formData.jobDetails.status}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {formData.jobDetails.title} • {formData.jobDetails.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewOnly && (
              <span className="px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider border border-slate-600">
                View Only
              </span>
            )}
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-all"
              >
                Edit Profile
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-700/50 bg-slate-900/80/40 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setActiveTab('personal')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'personal'
                ? 'border-indigo-600 text-cyan-400'
                : 'border-transparent hover:text-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Personal Details
          </button>
          <button
            onClick={() => setActiveTab('job')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'job'
                ? 'border-indigo-600 text-cyan-400'
                : 'border-transparent hover:text-slate-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Job & Organization
          </button>
          {canSeeSalaryTab && (
            <button
              onClick={() => setActiveTab('salary')}
              className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'salary'
                  ? 'border-indigo-600 text-cyan-400'
                  : 'border-transparent hover:text-slate-100'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" /> Salary Structure
            </button>
          )}
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'documents'
                ? 'border-indigo-600 text-cyan-400'
                : 'border-transparent hover:text-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Documents ({formData.documents?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {successMsg && (
            <div className="p-3 bg-teal-950/40 text-teal-300 border border-emerald-200 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              {successMsg}
            </div>
          )}

          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    disabled={!isAdmin || !isEditing}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    disabled={!isAdmin || !isEditing}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number {isOwnProfile && <span className="text-cyan-400">(Editable by Employee)</span>}
                  </label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.avatar}
                    onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Residential Address {isOwnProfile && <span className="text-cyan-400">(Editable by Employee)</span>}
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 bg-slate-900/80/40 rounded-xl border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-100 mb-3 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  Emergency Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Contact Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.emergencyContact?.name || ''}
                      onChange={e => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                      })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Relationship</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.emergencyContact?.relationship || ''}
                      onChange={e => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                      })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Emergency Phone</label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={formData.emergencyContact?.phone || ''}
                      onChange={e => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                      })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JOB & ORGANIZATION */}
          {activeTab === 'job' && (
            <div className="space-y-4">
              {!isAdmin && (
                <div className="p-3 bg-amber-950/40 text-amber-300 rounded-lg text-xs flex items-center gap-2 border border-amber-700/50">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Job and Organizational designations are read-only for employees. Only HR Admins may modify these.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Designation / Title</label>
                  <input
                    type="text"
                    disabled={!isAdmin || !isEditing}
                    value={formData.jobDetails.title}
                    onChange={e => setFormData({
                      ...formData,
                      jobDetails: { ...formData.jobDetails, title: e.target.value }
                    })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    disabled={!isAdmin || !isEditing}
                    value={formData.jobDetails.department}
                    onChange={e => setFormData({
                      ...formData,
                      jobDetails: { ...formData.jobDetails, department: e.target.value }
                    })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                  >
                    <option value="Human Resources">Human Resources</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reporting Manager</label>
                  <input
                    type="text"
                    disabled={!isAdmin || !isEditing}
                    value={formData.jobDetails.manager}
                    onChange={e => setFormData({
                      ...formData,
                      jobDetails: { ...formData.jobDetails, manager: e.target.value }
                    })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Joining</label>
                  <input
                    type="date"
                    disabled={!isAdmin || !isEditing}
                    value={formData.jobDetails.joinDate}
                    onChange={e => setFormData({
                      ...formData,
                      jobDetails: { ...formData.jobDetails, joinDate: e.target.value }
                    })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Employment Type</label>
                  <select
                    disabled={!isAdmin || !isEditing}
                    value={formData.jobDetails.employmentType}
                    onChange={e => setFormData({
                      ...formData,
                      jobDetails: { ...formData.jobDetails, employmentType: e.target.value as any }
                    })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work Location Model</label>
                  <select
                    disabled={!isAdmin || !isEditing}
                    value={formData.jobDetails.workLocation}
                    onChange={e => setFormData({
                      ...formData,
                      jobDetails: { ...formData.jobDetails, workLocation: e.target.value as any }
                    })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                  >
                    <option value="Office">In-Office HQ</option>
                    <option value="Remote">100% Remote</option>
                    <option value="Hybrid">Hybrid Flexible</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SALARY INFO (wage + % component auto-calculation, per spec) */}
          {activeTab === 'salary' && canSeeSalaryTab && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/40 border border-amber-700/50 rounded-lg text-[11px] text-amber-300">
                Salary components are calculated automatically from the Monthly Wage. Fixed Allowance
                absorbs whatever remains so the total never exceeds the defined wage.
              </div>

              {/* Wage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/80/40 rounded-xl border border-slate-700/50 space-y-1">
                  <label className="block text-[11px] text-slate-400 font-semibold">Month Wage</label>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      disabled={!isAdmin || !isEditing}
                      value={salaryConfig.monthlyWage}
                      onChange={e => setSalaryConfig(cfg => ({ ...cfg, monthlyWage: Math.max(0, Number(e.target.value)) }))}
                      className="w-full text-lg font-bold p-2 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                    />
                    <span className="text-xs text-slate-500 whitespace-nowrap">/ Month</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-900/80/40 rounded-xl border border-slate-700/50 space-y-1">
                  <label className="block text-[11px] text-slate-400 font-semibold">Yearly Wage</label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-slate-100">
                      ${computedSalary.yearlyWage.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 whitespace-nowrap">/ Year</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Auto-computed as Monthly Wage × 12</p>
                </div>
              </div>

              {/* Working schedule */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/80/40 rounded-xl border border-slate-700/50">
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">No. of working days / week</label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    disabled={!isAdmin || !isEditing}
                    value={salaryConfig.workingDaysPerWeek}
                    onChange={e => setSalaryConfig(cfg => ({ ...cfg, workingDaysPerWeek: Number(e.target.value) }))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                  />
                </div>
                <div className="p-4 bg-slate-900/80/40 rounded-xl border border-slate-700/50">
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">Break Time (hrs)</label>
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    disabled={!isAdmin || !isEditing}
                    value={salaryConfig.breakTimeHours}
                    onChange={e => setSalaryConfig(cfg => ({ ...cfg, breakTimeHours: Number(e.target.value) }))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                  />
                </div>
              </div>

              {/* Salary Components */}
              <div className="p-4 bg-slate-900/80/40 rounded-xl border border-slate-700/50 space-y-3">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 text-teal-300">
                  <DollarSign className="w-3.5 h-3.5" /> Salary Components
                </h4>

                {/* Basic Salary */}
                <SalaryComponentRow
                  label="Basic Salary"
                  description="Define Basic salary from company cost, computed as % of Monthly Wage"
                  amount={computedSalary.basic}
                  percent={salaryConfig.basicPercent}
                  disabled={!isAdmin || !isEditing}
                  onPercentChange={p => setSalaryConfig(cfg => ({ ...cfg, basicPercent: p }))}
                />

                {/* HRA */}
                <SalaryComponentRow
                  label="House Rent Allowance"
                  description="HRA provided to employees, computed as % of Basic Salary"
                  amount={computedSalary.hra}
                  percent={salaryConfig.hraPercent}
                  disabled={!isAdmin || !isEditing}
                  onPercentChange={p => setSalaryConfig(cfg => ({ ...cfg, hraPercent: p }))}
                />

                {/* Standard Allowance */}
                <SalaryComponentRow
                  label="Standard Allowance"
                  description="A standard, fixed-ratio allowance provided as part of salary, computed as % of Wage"
                  amount={computedSalary.standardAllowance}
                  percent={salaryConfig.standardAllowancePercent}
                  disabled={!isAdmin || !isEditing}
                  onPercentChange={p => setSalaryConfig(cfg => ({ ...cfg, standardAllowancePercent: p }))}
                />

                {/* Performance Bonus */}
                <SalaryComponentRow
                  label="Performance Bonus"
                  description="Variable amount paid during payroll, defined as % of Basic Salary"
                  amount={computedSalary.performanceBonus}
                  percent={salaryConfig.performanceBonusPercent}
                  disabled={!isAdmin || !isEditing}
                  onPercentChange={p => setSalaryConfig(cfg => ({ ...cfg, performanceBonusPercent: p }))}
                />

                {/* Leave Travel Allowance */}
                <SalaryComponentRow
                  label="Leave Travel Allowance"
                  description="LTA paid to cover travel expenses, calculated as % of Basic Salary"
                  amount={computedSalary.leaveTravelAllowance}
                  percent={salaryConfig.leaveTravelAllowancePercent}
                  disabled={!isAdmin || !isEditing}
                  onPercentChange={p => setSalaryConfig(cfg => ({ ...cfg, leaveTravelAllowancePercent: p }))}
                />

                {/* Fixed Allowance (read-only remainder) */}
                <div className="grid grid-cols-12 gap-2 items-center py-1.5 border-t border-slate-700/50 pt-2">
                  <div className="col-span-6">
                    <p className="text-xs font-semibold text-slate-800">Fixed Allowance</p>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Fixed allowance = Wage − total of all other components (auto-computed)
                    </p>
                  </div>
                  <div className="col-span-3">
                    <div className="w-full text-xs p-2 rounded-lg border border-slate-700/50 bg-slate-800/60/40 text-right font-semibold text-slate-300">
                      ${computedSalary.fixedAllowance.toLocaleString()}
                    </div>
                  </div>
                  <div className="col-span-3 text-right text-[11px] text-slate-400">/ month</div>
                </div>

                {/* Component total sanity check */}
                <div className={`mt-1 p-2 rounded-lg text-[11px] font-semibold flex items-center justify-between ${
                  computedSalary.componentsTotal <= computedSalary.monthlyWage + 0.01
                    ? 'bg-teal-950/40 text-teal-300 border border-emerald-200'
                    : 'bg-amber-950/40 text-amber-300 border border-rose-200'
                }`}>
                  <span>Total of all components</span>
                  <span>${computedSalary.componentsTotal.toLocaleString()} / ${computedSalary.monthlyWage.toLocaleString()}</span>
                </div>
              </div>

              {/* PF + Tax */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/80/40 rounded-xl border border-slate-700/50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 text-cyan-300">
                    <ShieldCheck className="w-3.5 h-3.5" /> Provident Fund (PF) Contribution
                  </h4>
                  <p className="text-[10px] text-slate-400 -mt-2">PF is calculated based on the Basic Salary</p>

                  <div className="grid grid-cols-2 gap-2 items-end">
                    <div>
                      <label className="block text-[11px] text-slate-400">Employee</label>
                      <div className="w-full text-xs p-2 rounded-lg border border-slate-700/50 bg-slate-800/60/40 font-semibold">
                        ${computedSalary.pfEmployeeAmount.toLocaleString()} / month
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400">Employee %</label>
                      <input
                        type="number"
                        step={0.5}
                        disabled={!isAdmin || !isEditing}
                        value={salaryConfig.pfEmployeePercent}
                        onChange={e => setSalaryConfig(cfg => ({ ...cfg, pfEmployeePercent: Number(e.target.value) }))}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-end">
                    <div>
                      <label className="block text-[11px] text-slate-400">Employer</label>
                      <div className="w-full text-xs p-2 rounded-lg border border-slate-700/50 bg-slate-800/60/40 font-semibold">
                        ${computedSalary.pfEmployerAmount.toLocaleString()} / month
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400">Employer %</label>
                      <input
                        type="number"
                        step={0.5}
                        disabled={!isAdmin || !isEditing}
                        value={salaryConfig.pfEmployerPercent}
                        onChange={e => setSalaryConfig(cfg => ({ ...cfg, pfEmployerPercent: Number(e.target.value) }))}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80/40 rounded-xl border border-slate-700/50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 text-amber-300">
                    <DollarSign className="w-3.5 h-3.5" /> Tax Deductions
                  </h4>
                  <div>
                    <label className="block text-[11px] text-slate-400">Professional Tax ($ / month)</label>
                    <input
                      type="number"
                      disabled={!isAdmin || !isEditing}
                      value={salaryConfig.professionalTax}
                      onChange={e => setSalaryConfig(cfg => ({ ...cfg, professionalTax: Number(e.target.value) }))}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Professional Tax deducted from the Gross salary</p>
                  </div>
                </div>
              </div>

              {/* Net take-home summary */}
              <div className="p-4 bg-cyan-950/40/70 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-900">Total Net Monthly Take-Home</span>
                  <p className="text-2xl font-bold text-indigo-950">
                    ${computedSalary.netMonthly.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-cyan-300 mt-0.5">
                    Gross ${computedSalary.grossMonthly.toLocaleString()} − PF ${computedSalary.pfEmployeeAmount.toLocaleString()} − Tax ${computedSalary.professionalTax.toLocaleString()}
                  </p>
                </div>
                <span className="text-xs px-3 py-1 bg-cyan-600 text-white font-semibold rounded-lg whitespace-nowrap">
                  Fixed Wage
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Uploaded Documents & Credentials</h4>
                  <p className="text-xs text-slate-500">Employment agreements, government IDs, and certifications</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddMockDocument('Certificate')}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-indigo-100 text-cyan-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload ID / Doc
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-700/30 border border-slate-700/50 rounded-xl overflow-hidden">
                {(!formData.documents || formData.documents.length === 0) ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No documents on file yet.
                  </div>
                ) : (
                  formData.documents.map(doc => (
                    <div key={doc.id} className="p-3.5 flex items-center justify-between hover:bg-slate-900/80/40">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-950/40 text-amber-400 flex items-center justify-center font-bold text-xs">
                          PDF
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-100">{doc.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800/60/40 text-slate-400">{doc.type}</span>
                            <span>Uploaded {doc.uploadDate}</span>
                            <span>• {doc.size}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => alert(`Viewing document: ${doc.name} (Verified Authenticated Document)`)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 rounded-lg transition-colors"
                          title="Preview Document"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-950/40 rounded-lg transition-colors"
                            title="Remove Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-900/80/40 border-t border-slate-700/50 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Registered on {new Date(formData.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            {isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-300 text-xs font-medium hover:bg-slate-800/60/40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
            {!isEditing && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800/60 text-white text-xs font-medium hover:bg-slate-900/80"
              >
                Close
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

/** A single auto-calculated salary component row: shows the computed dollar
 * amount (read-only) alongside an editable percentage input that drives it. */
const SalaryComponentRow: React.FC<{
  label: string;
  description: string;
  amount: number;
  percent: number;
  disabled: boolean;
  onPercentChange: (percent: number) => void;
}> = ({ label, description, amount, percent, disabled, onPercentChange }) => {
  return (
    <div className="grid grid-cols-12 gap-2 items-center py-1.5">
      <div className="col-span-6">
        <p className="text-xs font-semibold text-slate-800">{label}</p>
        <p className="text-[10px] text-slate-400 leading-snug">{description}</p>
      </div>
      <div className="col-span-3">
        <div className="w-full text-xs p-2 rounded-lg border border-slate-700/50 bg-slate-800/60/40 text-right font-semibold text-slate-300">
          ${amount.toLocaleString()}
        </div>
      </div>
      <div className="col-span-3 flex items-center gap-1">
        <input
          type="number"
          step={0.5}
          disabled={disabled}
          value={percent}
          onChange={e => onPercentChange(Number(e.target.value))}
          className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-800/60/50 disabled:bg-slate-800/60/40 text-right"
        />
        <span className="text-[11px] text-slate-400">%</span>
      </div>
    </div>
  );
};








