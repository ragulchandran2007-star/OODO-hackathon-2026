import React from 'react';
import { X, Printer, Download, DollarSign, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PayrollRecord } from '../../types';

interface PayslipModalProps {
  payroll: PayrollRecord | null;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  payroll,
  onClose
}) => {
  if (!payroll) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-800/60/50 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        
        {/* Controls Bar (Hidden during print) */}
        <div className="px-6 py-3 bg-slate-900/80 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-teal-300" />
            <h2 className="text-sm font-bold">Salary Slip • {payroll.payrollMonth}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-8 space-y-6 text-slate-100 bg-slate-800/60/50" id="printable-payslip">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-700/50 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold text-xl">
                D
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-100">Dayflow Technologies Inc.</h1>
                <p className="text-xs text-slate-500">742 Evergreen Terrace, Suite 400, San Francisco, CA 94107</p>
                <p className="text-[11px] text-slate-400">EIN: 94-3829104 • contact@dayflow.io</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-purple-950/60 text-purple-300">
                Official Pay Stub
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-2">Period: {payroll.payrollMonth}</p>
              <p className="text-[11px] text-slate-400 font-mono">Ref: {payroll.transactionId || 'TXN-DF-2026'}</p>
            </div>
          </div>

          {/* Employee Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/80/40 border border-slate-700/50 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Employee Name</span>
              <span className="font-bold text-slate-100">{payroll.employeeName}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Employee ID</span>
              <span className="font-mono font-semibold text-slate-800">{payroll.employeeId}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Department</span>
              <span className="font-medium text-slate-800">{payroll.department}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Designation</span>
              <span className="font-medium text-slate-800">{payroll.designation}</span>
            </div>
          </div>

          {/* Earnings & Deductions Double Column Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Earnings */}
            <div className="border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="bg-teal-950/40 px-4 py-2.5 border-b border-slate-700/50 flex justify-between font-bold text-xs text-emerald-900">
                <span>Earnings Breakdown</span>
                <span>Amount ($)</span>
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Basic Salary</span>
                  <span className="font-semibold text-slate-100">${payroll.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-semibold text-slate-100">${payroll.hra.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Special / Travel Allowance</span>
                  <span className="font-semibold text-slate-100">${payroll.allowances.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-700/50 flex justify-between font-bold text-slate-100">
                  <span>Gross Earnings</span>
                  <span className="text-teal-300">${payroll.grossSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="bg-amber-950/40 px-4 py-2.5 border-b border-slate-700/50 flex justify-between font-bold text-xs text-rose-900">
                <span>Statutory Deductions</span>
                <span>Amount ($)</span>
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Income Tax (TDS / Federal)</span>
                  <span className="font-semibold text-slate-100">${payroll.taxDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Provident Fund (PF / 401k)</span>
                  <span className="font-semibold text-slate-100">${payroll.pfDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Health Insurance & Medical</span>
                  <span className="font-semibold text-slate-100">${payroll.otherDeductions.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-700/50 flex justify-between font-bold text-slate-100">
                  <span>Total Deductions</span>
                  <span className="text-amber-300">-${payroll.totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Net Pay Callout */}
          <div className="bg-slate-900/80 text-white rounded-xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                Total Net Payable Amount
              </span>
              <p className="text-xs text-teal-300 mt-0.5">Disbursed via Direct Bank Deposit</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-teal-300">
                ${payroll.netSalary.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Footer & Authenticity Stamp */}
          <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-teal-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Computer Generated Document — No Physical Signature Required</span>
            </div>
            <span>Dayflow HRMS Payroll Engine</span>
          </div>

        </div>

      </div>
    </div>
  );
};







