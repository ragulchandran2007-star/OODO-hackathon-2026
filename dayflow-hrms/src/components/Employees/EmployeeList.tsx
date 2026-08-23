import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  LayoutGrid, 
  List, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  MoreVertical, 
  ShieldCheck, 
  FileText,
  DollarSign
} from 'lucide-react';
import { Employee } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface EmployeeListProps {
  onSelectEmployee: (emp: Employee) => void;
  onOpenAddModal: () => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  onSelectEmployee,
  onOpenAddModal
}) => {
  const { role } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await api.getEmployees({
        search: searchTerm,
        department: selectedDept !== 'All' ? selectedDept : undefined
      });
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, selectedDept]);

  const departments = ['All', 'Human Resources', 'Engineering', 'Design', 'Product', 'Finance', 'Marketing'];

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Workforce Directory ({employees.length})
          </h1>
          <p className="page-subtitle text-xs">
            Browse corporate profiles, job assignments, and compensation tiers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Onboard Employee
            </button>
          )}

          <div className="flex items-center bg-slate-800/60/40 p-1 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-slate-800/60/50 shadow-xs text-cyan-400' : 'text-slate-500 hover:text-slate-100'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'table' ? 'bg-slate-800/60/50 shadow-xs text-cyan-400' : 'text-slate-500 hover:text-slate-100'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-800/60/50 p-4 rounded-xl border border-slate-700/50 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, ID, title, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-700/50 focus:outline-indigo-600"
          />
        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Dept:
          </span>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedDept === dept
                  ? 'bg-cyan-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-900/80/40 hover:bg-slate-800/60/40 text-slate-400 border border-slate-700/50'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading workforce records...</div>
      ) : employees.length === 0 ? (
        <div className="py-16 text-center bg-slate-800/60/50 rounded-xl border border-dashed border-slate-700/50 p-8">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No employees found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or department filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(emp => (
            <div
              key={emp.id}
              onClick={() => onSelectEmployee(emp)}
              className="bg-slate-800/60/50 rounded-xl border border-slate-700/50 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700/50 shadow-xs"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-100 leading-tight">{emp.name}</h3>
                      <p className="text-xs text-cyan-400 font-medium">{emp.jobDetails.title}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/60/40 text-slate-300 font-semibold font-mono">
                          {emp.employeeId}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-950/40 text-teal-300 font-medium">
                          {emp.jobDetails.department}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950/60 text-teal-300 font-semibold uppercase tracking-wider">
                    {emp.jobDetails.status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/30 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/30 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-500">
                  Net: <span className="font-semibold text-slate-100">${emp.salaryStructure.netSalary.toLocaleString()}</span>/mo
                </div>
                <span className="text-cyan-400 font-semibold text-xs hover:underline">
                  View Profile & Documents →
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-slate-800/60/50 rounded-xl border border-slate-700/50 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80/40 border-b border-slate-700/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Designation</th>
                  <th className="px-5 py-3">Work Location</th>
                  <th className="px-5 py-3">Net Salary</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {employees.map(emp => (
                  <tr
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className="hover:bg-slate-900/80/40 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 flex items-center gap-3">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700/50"
                      />
                      <div>
                        <p className="font-semibold text-slate-100">{emp.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{emp.employeeId}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-300 font-medium">{emp.jobDetails.department}</td>
                    <td className="px-5 py-3 text-slate-400">{emp.jobDetails.title}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800/60/40 text-slate-300 text-[10px] font-medium">
                        {emp.jobDetails.workLocation}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-100">
                      ${emp.salaryStructure.netSalary.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        emp.role === 'admin' ? 'bg-amber-950/60 text-amber-300' : 'bg-indigo-100 text-cyan-300'
                      }`}>
                        {emp.role === 'admin' ? 'Admin' : 'Employee'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectEmployee(emp);
                        }}
                        className="text-xs font-semibold text-cyan-400 hover:text-indigo-900 bg-cyan-950/40 hover:bg-indigo-100 px-3 py-1 rounded-md"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};







