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

interface EmployeeProfileModalProps {
  employee: Employee | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  employee,
  onClose,
  onUpdated
}) => {
  const { role: currentUserRole, user: currentUser, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'job' | 'salary' | 'documents'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!employee) return null;

  const isAdmin = currentUserRole === 'admin';
  const isOwnProfile = currentUser?.id === employee.id;
  const canEdit = isAdmin || isOwnProfile;

  // Form states
  const [formData, setFormData] = useState<Employee>({ ...employee });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={formData.avatar}
              alt={formData.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-400"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{formData.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {formData.employeeId}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  {formData.jobDetails.status}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {formData.jobDetails.title} • {formData.jobDetails.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all"
              >
                Edit Profile
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('personal')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'personal'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Personal Details
          </button>
          <button
            onClick={() => setActiveTab('job')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'job'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Job & Organization
          </button>
          <button
            onClick={() => setActiveTab('salary')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'salary'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Salary Structure
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'documents'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Documents ({formData.documents?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    disabled={!isAdmin || !isEditing}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    disabled={!isAdmin || !isEditing}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number {isOwnProfile && <span className="text-indigo-600">(Editable by Employee)</span>}
                  </label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.avatar}
                    onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Residential Address {isOwnProfile && <span className="text-indigo-600">(Editable by Employee)</span>}
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  Emergency Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Contact Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.emergencyContact?.name || ''}
                      onChange={e => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                      })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Relationship</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.emergencyContact?.relationship || ''}
                      onChange={e => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                      })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Emergency Phone</label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={formData.emergencyContact?.phone || ''}
                      onChange={e => setFormData({
                        ...formData,
                        emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                      })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
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
                <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs flex items-center gap-2 border border-amber-200">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Job and Organizational designations are read-only for employees. Only HR Admins may modify these.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Title</label>
                  <input
                    type="text"
                    disabled={!isAdmin || !isEditing}
                    value={formData.jobDetails.title}
                    onChange={e => setFormData({
                      ...formData,
                      jobDetails: { ...formData.jobDetails, title: e.target.value }
                    })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    disabled={!isAdmin || !isEditing}
                    value={formData.jobDetails.department}
                    onChange={e => setFormData({
                      ...formData,
                      jobDetails: { ...formData.jobDetails, department: e.target.value }
                    })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting Manager</label>
                  <input
                    type="text"
                    disabled={!isAdmin || !isEditing}
                    value={formData.jobDetails.manager}
                    onChange={e => setFormData({
                      ...formData,
                      jobDetails: { ...formData.jobDetails, manager: e.target.value }
                    })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Joining</label>
                  <input
                    type="date"
                    disabled={!isAdmin || !isEditing}
                    value={formData.jobDetails.joinDate}
                    onChange={e => setFormData({
                      ...formData,
                      jobDetails: { ...formData.jobDetails, joinDate: e.target.value }
                    })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    disabled={!isAdmin || !isEditing}
                    value={formData.jobDetails.employmentType}
                    onChange={e => setFormData({
                      ...formData,
                      jobDetails: { ...formData.jobDetails, employmentType: e.target.value as any }
                    })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Location Model</label>
                  <select
                    disabled={!isAdmin || !isEditing}
                    value={formData.jobDetails.workLocation}
                    onChange={e => setFormData({
                      ...formData,
                      jobDetails: { ...formData.jobDetails, workLocation: e.target.value as any }
                    })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                  >
                    <option value="Office">In-Office HQ</option>
                    <option value="Remote">100% Remote</option>
                    <option value="Hybrid">Hybrid Flexible</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SALARY STRUCTURE */}
          {activeTab === 'salary' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-900">Total Net Monthly Take-Home</span>
                  <p className="text-2xl font-bold text-indigo-950">
                    ${formData.salaryStructure.netSalary.toLocaleString()}
                  </p>
                </div>
                <span className="text-xs px-3 py-1 bg-indigo-600 text-white font-semibold rounded-lg">
                  Approved 2026 Tier
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 text-emerald-700">
                    <DollarSign className="w-3.5 h-3.5" /> Gross Earnings Components
                  </h4>
                  <div>
                    <label className="block text-[11px] text-slate-600">Basic Pay ($)</label>
                    <input
                      type="number"
                      disabled={!isAdmin || !isEditing}
                      value={formData.salaryStructure.basic}
                      onChange={e => {
                        const basic = Number(e.target.value);
                        const gross = basic + formData.salaryStructure.hra + formData.salaryStructure.allowances;
                        const ded = formData.salaryStructure.taxDeduction + formData.salaryStructure.pfDeduction + formData.salaryStructure.otherDeductions;
                        setFormData({
                          ...formData,
                          salaryStructure: { ...formData.salaryStructure, basic, netSalary: gross - ded }
                        });
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">House Rent Allowance (HRA) ($)</label>
                    <input
                      type="number"
                      disabled={!isAdmin || !isEditing}
                      value={formData.salaryStructure.hra}
                      onChange={e => {
                        const hra = Number(e.target.value);
                        const gross = formData.salaryStructure.basic + hra + formData.salaryStructure.allowances;
                        const ded = formData.salaryStructure.taxDeduction + formData.salaryStructure.pfDeduction + formData.salaryStructure.otherDeductions;
                        setFormData({
                          ...formData,
                          salaryStructure: { ...formData.salaryStructure, hra, netSalary: gross - ded }
                        });
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Special & Travel Allowances ($)</label>
                    <input
                      type="number"
                      disabled={!isAdmin || !isEditing}
                      value={formData.salaryStructure.allowances}
                      onChange={e => {
                        const allowances = Number(e.target.value);
                        const gross = formData.salaryStructure.basic + formData.salaryStructure.hra + allowances;
                        const ded = formData.salaryStructure.taxDeduction + formData.salaryStructure.pfDeduction + formData.salaryStructure.otherDeductions;
                        setFormData({
                          ...formData,
                          salaryStructure: { ...formData.salaryStructure, allowances, netSalary: gross - ded }
                        });
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 text-rose-700">
                    <DollarSign className="w-3.5 h-3.5" /> Statutory Deductions
                  </h4>
                  <div>
                    <label className="block text-[11px] text-slate-600">Income Tax (TDS) ($)</label>
                    <input
                      type="number"
                      disabled={!isAdmin || !isEditing}
                      value={formData.salaryStructure.taxDeduction}
                      onChange={e => {
                        const taxDeduction = Number(e.target.value);
                        const gross = formData.salaryStructure.basic + formData.salaryStructure.hra + formData.salaryStructure.allowances;
                        const ded = taxDeduction + formData.salaryStructure.pfDeduction + formData.salaryStructure.otherDeductions;
                        setFormData({
                          ...formData,
                          salaryStructure: { ...formData.salaryStructure, taxDeduction, netSalary: gross - ded }
                        });
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Provident Fund (PF / 401k) ($)</label>
                    <input
                      type="number"
                      disabled={!isAdmin || !isEditing}
                      value={formData.salaryStructure.pfDeduction}
                      onChange={e => {
                        const pfDeduction = Number(e.target.value);
                        const gross = formData.salaryStructure.basic + formData.salaryStructure.hra + formData.salaryStructure.allowances;
                        const ded = formData.salaryStructure.taxDeduction + pfDeduction + formData.salaryStructure.otherDeductions;
                        setFormData({
                          ...formData,
                          salaryStructure: { ...formData.salaryStructure, pfDeduction, netSalary: gross - ded }
                        });
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Health Insurance & Other Deductions ($)</label>
                    <input
                      type="number"
                      disabled={!isAdmin || !isEditing}
                      value={formData.salaryStructure.otherDeductions}
                      onChange={e => {
                        const otherDeductions = Number(e.target.value);
                        const gross = formData.salaryStructure.basic + formData.salaryStructure.hra + formData.salaryStructure.allowances;
                        const ded = formData.salaryStructure.taxDeduction + formData.salaryStructure.pfDeduction + otherDeductions;
                        setFormData({
                          ...formData,
                          salaryStructure: { ...formData.salaryStructure, otherDeductions, netSalary: gross - ded }
                        });
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Uploaded Documents & Credentials</h4>
                  <p className="text-xs text-slate-500">Employment agreements, government IDs, and certifications</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddMockDocument('Certificate')}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload ID / Doc
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {(!formData.documents || formData.documents.length === 0) ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No documents on file yet.
                  </div>
                ) : (
                  formData.documents.map(doc => (
                    <div key={doc.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                          PDF
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{doc.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{doc.type}</span>
                            <span>Uploaded {doc.uploadDate}</span>
                            <span>• {doc.size}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => alert(`Viewing document: ${doc.name} (Verified Authenticated Document)`)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Preview Document"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Registered on {new Date(formData.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            {isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
            {!isEditing && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-900"
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
