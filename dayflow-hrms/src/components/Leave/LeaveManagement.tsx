import React, { useState, useEffect } from 'react';
import { 
  CalendarOff, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Users, 
  MessageSquare,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LeaveRequest } from '../../types';
import { ApplyLeaveModal } from './ApplyLeaveModal';
import { LeaveReviewModal } from './LeaveReviewModal';

export const LeaveManagement: React.FC = () => {
  const { user, role, refreshUser } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRequest | null>(null);

  const isAdmin = role === 'admin';

  const fetchLeaves = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const params: any = {};
      if (!isAdmin) {
        params.userId = user.id;
      }
      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }
      const data = await api.getLeaves(params);
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user, role, statusFilter]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-indigo-600" />
            Leave & Time-Off Management
          </h1>
          <p className="text-xs text-slate-500">
            {isAdmin 
              ? 'Oversee corporate time-off applications, leave quotas, and approval queues' 
              : 'View statutory leave balances and track application progress'}
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Paid Leave Quota</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
              Annual
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{user.leaveBalances.paid}</span>
            <span className="text-xs text-slate-500 font-medium">/{user.leaveBalances.paidTotal} days</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${(user.leaveBalances.paid / user.leaveBalances.paidTotal) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sick & Medical</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Health
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{user.leaveBalances.sick}</span>
            <span className="text-xs text-slate-500 font-medium">/{user.leaveBalances.sickTotal} days</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${(user.leaveBalances.sick / user.leaveBalances.sickTotal) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Casual Leave</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
              Flexible
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{user.leaveBalances.casual}</span>
            <span className="text-xs text-slate-500 font-medium">/{user.leaveBalances.casualTotal} days</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${(user.leaveBalances.casual / user.leaveBalances.casualTotal) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Unpaid Days</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              Payroll Deduction
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{user.leaveBalances.unpaid}</span>
            <span className="text-xs text-slate-500 font-medium">days taken</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Adjusted on payslip</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', 'Pending', 'Approved', 'Rejected'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {st} Requests
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Total: {leaves.length} records
        </span>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Dates</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Reviewer Notes</th>
                {isAdmin && <th className="px-5 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    Loading leave applications...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                leaves.map(leave => (
                  <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-semibold text-slate-900">{leave.employeeName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{leave.employeeId} • {leave.department}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium text-[11px]">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700 font-medium whitespace-nowrap">
                      {leave.startDate} → {leave.endDate}
                    </td>
                    <td className="px-5 py-3 font-semibold text-indigo-700">
                      {leave.totalDays} day(s)
                    </td>
                    <td className="px-5 py-3 text-slate-600 max-w-xs">
                      <p className="line-clamp-2">{leave.reason}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${
                        leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        leave.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {leave.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {leave.status === 'Rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                        {leave.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-[11px]">
                      {leave.reviewerNotes ? (
                        <div>
                          <p className="font-medium text-slate-700 italic">"{leave.reviewerNotes}"</p>
                          <span className="text-[10px] text-slate-400">by {leave.reviewedBy}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3 text-right">
                        {leave.status === 'Pending' ? (
                          <button
                            onClick={() => setReviewingLeave(leave)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs transition-all"
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            onClick={() => setReviewingLeave(leave)}
                            className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 text-xs font-medium rounded-md"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showApplyModal && (
        <ApplyLeaveModal
          onClose={() => setShowApplyModal(false)}
          onSubmitted={fetchLeaves}
        />
      )}

      {reviewingLeave && (
        <LeaveReviewModal
          leave={reviewingLeave}
          onClose={() => setReviewingLeave(null)}
          onReviewed={fetchLeaves}
        />
      )}
    </div>
  );
};
