import React, { useState } from 'react';
import { X, Calendar, Send, AlertCircle } from 'lucide-react';
import { LeaveType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface ApplyLeaveModalProps {
  onClose: () => void;
  onSubmitted: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  onClose,
  onSubmitted
}) => {
  const { user, refreshUser } = useAuth();
  const [leaveType, setLeaveType] = useState<LeaveType>('Paid');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate day difference
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!reason.trim()) {
      setError('Please provide a reason for your leave request');
      return;
    }
    if (start > end) {
      setError('End date cannot be earlier than start date');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.applyLeave({
        userId: user.id,
        leaveType,
        startDate,
        endDate,
        totalDays: calculatedDays,
        reason
      });

      await refreshUser();
      onSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-800/60/50 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-slate-900/80 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Apply for Leave</h2>
              <p className="text-xs text-slate-400">Submit a formal time-off request for HR approval</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-amber-950/40 text-rose-800 rounded-lg text-xs font-medium flex items-center gap-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Current Available Balances Banner */}
          <div className="p-3 bg-cyan-950/40/70 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-indigo-900 font-semibold">Current Paid Leave Balance:</span>
              <p className="text-slate-400">Available: <span className="font-bold text-cyan-300">{user.leaveBalances.paid} days</span></p>
            </div>
            <div className="text-right">
              <span className="text-emerald-900 font-semibold">Sick Leave:</span>
              <p className="text-slate-400 font-bold text-teal-300">{user.leaveBalances.sick} days</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Leave Category</label>
            <select
              value={leaveType}
              onChange={e => setLeaveType(e.target.value as LeaveType)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600 bg-slate-800/60/50"
            >
              <option value="Paid">Paid Vacation Leave ({user.leaveBalances.paid} days remaining)</option>
              <option value="Sick">Sick / Medical Leave ({user.leaveBalances.sick} days remaining)</option>
              <option value="Casual">Casual / Personal Leave ({user.leaveBalances.casual} days remaining)</option>
              <option value="Unpaid">Unpaid Leave of Absence</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-900/80/40 rounded-lg border border-slate-700/50 text-xs flex items-center justify-between">
            <span className="text-slate-400">Total Requested Duration:</span>
            <span className="font-bold text-cyan-300 text-sm">{calculatedDays} Day(s)</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reason & Remarks *</label>
            <textarea
              required
              rows={3}
              placeholder="State the purpose of your leave (e.g. personal family event, doctor visit, scheduled travel)..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-700/30 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800/60/40 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};







