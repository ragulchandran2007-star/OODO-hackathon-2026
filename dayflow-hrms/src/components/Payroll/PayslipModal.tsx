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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        
        {/* Controls Bar (Hidden during print) */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold">Salary Slip • {payroll.payrollMonth}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-8 space-y-6 text-slate-900 bg-white" id="printable-payslip">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                D
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Dayflow Technologies Inc.</h1>
                <p className="text-xs text-slate-500">742 Evergreen Terrace, Suite 400, San Francisco, CA 94107</p>
                <p className="text-[11px] text-slate-400">EIN: 94-3829104 • contact@dayflow.io</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-purple-100 text-purple-800">
                Official Pay Stub
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-2">Period: {payroll.payrollMonth}</p>
              <p className="text-[11px] text-slate-400 font-mono">Ref: {payroll.transactionId || 'TXN-DF-2026'}</p>
            </div>
          </div>

          {/* Employee Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Employee Name</span>
              <span className="font-bold text-slate-900">{payroll.employeeName}</span>
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
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-50 px-4 py-2.5 border-b border-slate-200 flex justify-between font-bold text-xs text-emerald-900">
                <span>Earnings Breakdown</span>
                <span>Amount ($)</span>
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Basic Salary</span>
                  <span className="font-semibold text-slate-900">${payroll.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-semibold text-slate-900">${payroll.hra.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Special / Travel Allowance</span>
                  <span className="font-semibold text-slate-900">${payroll.allowances.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Gross Earnings</span>
                  <span className="text-emerald-700">${payroll.grossSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-rose-50 px-4 py-2.5 border-b border-slate-200 flex justify-between font-bold text-xs text-rose-900">
                <span>Statutory Deductions</span>
                <span>Amount ($)</span>
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Income Tax (TDS / Federal)</span>
                  <span className="font-semibold text-slate-900">${payroll.taxDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Provident Fund (PF / 401k)</span>
                  <span className="font-semibold text-slate-900">${payroll.pfDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Health Insurance & Medical</span>
                  <span className="font-semibold text-slate-900">${payroll.otherDeductions.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Total Deductions</span>
                  <span className="text-rose-700">-${payroll.totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Net Pay Callout */}
          <div className="bg-slate-900 text-white rounded-xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                Total Net Payable Amount
              </span>
              <p className="text-xs text-emerald-400 mt-0.5">Disbursed via Direct Bank Deposit</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-emerald-400">
                ${payroll.netSalary.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Footer & Authenticity Stamp */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
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
