import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  DollarSign, 
  Printer, 
  FileText, 
  Download, 
  Plus, 
  CheckCircle2, 
  Search, 
  Filter, 
  ShieldCheck,
  TrendingUp,
  Building2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PayrollRecord, Employee } from '../../types';
import { PayslipModal } from './PayslipModal';

export const PayrollManagement: React.FC = () => {
  const { user, role } = useAuth();
  const [payrollList, setPayrollList] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [generating, setGenerating] = useState(false);

  const isAdmin = role === 'admin';

  const fetchPayroll = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const params: any = { month: selectedMonth };
      if (!isAdmin) {
        params.employeeId = user.employeeId;
      }
      const data = await api.getPayroll(params);
      setPayrollList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [user, role, selectedMonth]);

  const handleGenerateBatch = async () => {
    setGenerating(true);
    try {
      await api.generatePayroll(selectedMonth);
      await fetchPayroll();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const totalGrossDisbursement = payrollList.reduce((acc, p) => acc + p.grossSalary, 0);
  const totalNetDisbursement = payrollList.reduce((acc, p) => acc + p.netSalary, 0);
  const totalTaxWithheld = payrollList.reduce((acc, p) => acc + p.taxDeduction, 0);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            Payroll & Compensation Management
          </h1>
          <p className="page-subtitle text-xs">
            {isAdmin 
              ? 'Calculate statutory salary components, process monthly disbursements, and print stubs' 
              : 'View monthly earnings breakdowns and download authenticated payslips'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleGenerateBatch}
              disabled={generating}
              className="flex items-center gap-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              Run {selectedMonth} Batch
            </button>
          )}
        </div>
      </div>

      {/* Admin KPI Summary */}
      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/60/50 p-5 rounded-xl border border-slate-700/50 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Total Monthly Gross Payout</span>
            <div className="mt-2 text-2xl font-bold text-slate-100">
              ${totalGrossDisbursement.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Across all active employees</p>
          </div>

          <div className="bg-slate-800/60/50 p-5 rounded-xl border border-slate-700/50 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Total Net Disbursed</span>
            <div className="mt-2 text-2xl font-bold text-teal-400">
              ${totalNetDisbursement.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Direct Bank Deposit (ACH)</p>
          </div>

          <div className="bg-slate-800/60/50 p-5 rounded-xl border border-slate-700/50 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Total Statutory Taxes & PF</span>
            <div className="mt-2 text-2xl font-bold text-amber-400">
              ${totalTaxWithheld.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Remitted to Revenue Service</p>
          </div>
        </div>
      ) : (
        /* Employee Compensation Snapshot */
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                Current Monthly Take-Home (August 2026)
              </span>
              <p className="text-3xl font-bold text-white mt-1">
                ${user.salaryStructure.netSalary.toLocaleString()}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Basic: ${user.salaryStructure.basic.toLocaleString()} • HRA: ${user.salaryStructure.hra.toLocaleString()} • Allowances: ${user.salaryStructure.allowances.toLocaleString()}
              </p>
            </div>
            {payrollList.length > 0 && (
              <button
                onClick={() => setSelectedRecord(payrollList[0])}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                View & Print Latest Slip
              </button>
            )}
          </div>
        </div>
      )}

      {/* Month Selector & Controls */}
      <div className="bg-slate-800/60/50 p-4 rounded-xl border border-slate-700/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Pay Period:</span>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-300 bg-slate-800/60/50 focus:outline-indigo-600 font-medium"
          >
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
            <option value="June 2026">June 2026</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          {payrollList.length} Payslip Records Generated
        </span>
      </div>

      {/* Payroll Table */}
      <div className="bg-slate-800/60/50 rounded-xl border border-slate-700/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80/40 border-b border-slate-700/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Basic Pay</th>
                <th className="px-5 py-3">HRA + Allowances</th>
                <th className="px-5 py-3">Gross Salary</th>
                <th className="px-5 py-3">Deductions</th>
                <th className="px-5 py-3">Net Take-Home</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    Loading payroll records...
                  </td>
                </tr>
              ) : payrollList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    No payroll entries found for {selectedMonth}.
                  </td>
                </tr>
              ) : (
                payrollList.map(record => (
                  <tr key={record.id} className="hover:bg-slate-900/80/40 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-semibold text-slate-100">{record.employeeName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{record.employeeId}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400">{record.department}</td>
                    <td className="px-5 py-3 text-slate-300 font-medium">${record.basicSalary.toLocaleString()}</td>
                    <td className="px-5 py-3 text-slate-300 font-medium">${(record.hra + record.allowances).toLocaleString()}</td>
                    <td className="px-5 py-3 font-semibold text-slate-100">${record.grossSalary.toLocaleString()}</td>
                    <td className="px-5 py-3 font-medium text-amber-400">-${record.totalDeductions.toLocaleString()}</td>
                    <td className="px-5 py-3 font-bold text-teal-300 text-sm">
                      ${record.netSalary.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-950/60 text-teal-300 text-[10px] font-semibold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        {record.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="px-3 py-1 bg-cyan-950/40 hover:bg-indigo-100 text-cyan-300 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Payslip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRecord && (
        <PayslipModal
          payroll={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};







