import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Calendar, User, MessageSquare } from 'lucide-react';
import { LeaveRequest } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface LeaveReviewModalProps {
  leave: LeaveRequest | null;
  onClose: () => void;
  onReviewed: () => void;
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  leave,
  onClose,
  onReviewed
}) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!leave) return null;

  const handleReview = async () => {
    setLoading(true);
    try {
      await api.reviewLeave(leave.id, {
        status,
        reviewerNotes: reviewerNotes || (status === 'Approved' ? 'Approved by HR' : 'Declined per policy'),
        reviewerName: user?.name || 'HR Admin'
      });

      onReviewed();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold">Review Leave Request</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Employee Request Snapshot */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">{leave.employeeName}</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
                {leave.leaveType} Leave
              </span>
            </div>
            <p className="text-slate-500">
              Department: <span className="font-medium text-slate-800">{leave.department}</span> • ID: <span className="font-medium text-slate-800">{leave.employeeId}</span>
            </p>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-medium text-slate-700">
              <span>Dates: {leave.startDate} to {leave.endDate}</span>
              <span className="text-indigo-600 font-bold">{leave.totalDays} day(s)</span>
            </div>
            <div className="pt-1 text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Reason:</span>
              <p className="italic">{leave.reason}</p>
            </div>
          </div>

          {/* Decision Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Decision Action</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('Approved')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  status === 'Approved'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Approve Request
              </button>

              <button
                type="button"
                onClick={() => setStatus('Rejected')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  status === 'Rejected'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                Reject Request
              </button>
            </div>
          </div>

          {/* Reviewer Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              Comments / Notes to Employee
            </label>
            <textarea
              rows={3}
              placeholder={status === 'Approved' ? 'e.g. Approved. Please hand over priority tickets.' : 'e.g. Please reschedule due to product launch.'}
              value={reviewerNotes}
              onChange={e => setReviewerNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-indigo-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleReview}
              disabled={loading}
              className={`px-5 py-2 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 ${
                status === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {status === 'Approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {loading ? 'Submitting...' : `Confirm ${status}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
