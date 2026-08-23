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
  Search,
  List,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LeaveRequest } from '../../types';
import { ApplyLeaveModal } from './ApplyLeaveModal';
import { LeaveReviewModal } from './LeaveReviewModal';
import { LeaveCalendarView } from './LeaveCalendarView';

export const LeaveManagement: React.FC = () => {
  const { user, role, refreshUser } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRequest | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-cyan-400" />
            Leave & Time-Off Management
          </h1>
          <p className="text-xs text-slate-500">
            {isAdmin 
              ? 'Oversee corporate time-off applications, leave quotas, and approval queues' 
              : 'View statutory leave balances and track application progress'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-800/60/40 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-slate-800/60/50 text-cyan-300 shadow-xs' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendar' ? 'bg-slate-800/60/50 text-cyan-300 shadow-xs' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Apply for Leave
          </button>
        </div>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/60/50 p-4 rounded-xl border border-slate-700/50 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Paid Leave Quota</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-cyan-300 font-semibold">
              Annual
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-100">{user.leaveBalances.paid}</span>
            <span className="text-xs text-slate-500 font-medium">/{user.leaveBalances.paidTotal} days</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800/60/40 mt-2 overflow-hidden">
            <div
              className="h-full bg-cyan-600 rounded-full"
              style={{ width: `${(user.leaveBalances.paid / user.leaveBalances.paidTotal) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/60/50 p-4 rounded-xl border border-slate-700/50 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sick & Medical</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950/60 text-teal-300 font-semibold">
              Health
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-100">{user.leaveBalances.sick}</span>
            <span className="text-xs text-slate-500 font-medium">/{user.leaveBalances.sickTotal} days</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800/60/40 mt-2 overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full"
              style={{ width: `${(user.leaveBalances.sick / user.leaveBalances.sickTotal) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/60/50 p-4 rounded-xl border border-slate-700/50 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Casual Leave</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 font-semibold">
              Flexible
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-100">{user.leaveBalances.casual}</span>
            <span className="text-xs text-slate-500 font-medium">/{user.leaveBalances.casualTotal} days</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800/60/40 mt-2 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${(user.leaveBalances.casual / user.leaveBalances.casualTotal) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/60/50 p-4 rounded-xl border border-slate-700/50 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Unpaid Days</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/60/40 text-slate-300 font-semibold">
              Payroll Deduction
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-100">{user.leaveBalances.unpaid}</span>
            <span className="text-xs text-slate-500 font-medium">days taken</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Adjusted on payslip</p>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <LeaveCalendarView leaves={leaves} isAdmin={isAdmin} onSelectLeave={setReviewingLeave} />
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="bg-slate-800/60/50 p-3 rounded-xl border border-slate-700/50 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['All', 'Pending', 'Approved', 'Rejected'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-900/80/40 hover:bg-slate-800/60/40 text-slate-400 border border-slate-700/50'
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
          <div className="bg-slate-800/60/50 rounded-xl border border-slate-700/50 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80/40 border-b border-slate-700/50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
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
                <tbody className="divide-y divide-slate-700/30">
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
                      <tr key={leave.id} className="hover:bg-slate-900/80/40 transition-colors">
                        <td className="px-5 py-3">
                          <div>
                            <p className="font-semibold text-slate-100">{leave.employeeName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{leave.employeeId} • {leave.department}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800/60/40 text-slate-800 font-medium text-[11px]">
                            {leave.leaveType}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-300 font-medium whitespace-nowrap">
                          {leave.startDate} → {leave.endDate}
                        </td>
                        <td className="px-5 py-3 font-semibold text-cyan-300">
                          {leave.totalDays} day(s)
                        </td>
                        <td className="px-5 py-3 text-slate-400 max-w-xs">
                          <p className="line-clamp-2">{leave.reason}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${
                            leave.status === 'Approved' ? 'bg-teal-950/60 text-teal-300' :
                            leave.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-950/60 text-amber-300'
                          }`}>
                            {leave.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-teal-400" />}
                            {leave.status === 'Rejected' && <XCircle className="w-3 h-3 text-amber-400" />}
                            {leave.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-[11px]">
                          {leave.reviewerNotes ? (
                            <div>
                              <p className="font-medium text-slate-300 italic">"{leave.reviewerNotes}"</p>
                              <span className="text-[10px] text-slate-400">by {leave.reviewedBy}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-3 text-right">
                            {leave.status === 'Pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setReviewingLeave(leave)}
                                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-md shadow-xs transition-all cursor-pointer"
                                >
                                  Review
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReviewingLeave(leave)}
                                className="px-2.5 py-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60/40 text-xs font-medium rounded-md cursor-pointer"
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
        </>
      )}

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







