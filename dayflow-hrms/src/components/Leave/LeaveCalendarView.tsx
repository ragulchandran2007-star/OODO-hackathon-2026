import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LeaveRequest } from '../../types';

interface LeaveCalendarViewProps {
  leaves: LeaveRequest[];
  isAdmin: boolean;
  onSelectLeave: (leave: LeaveRequest) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function parseDateOnly(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function isDateWithinRange(date: Date, startStr: string, endStr: string): boolean {
  const start = parseDateOnly(startStr);
  const end = parseDateOnly(endStr);
  const t = new Date(date).setHours(0, 0, 0, 0);
  return t >= new Date(start).setHours(0, 0, 0, 0) && t <= new Date(end).setHours(0, 0, 0, 0);
}

export const LeaveCalendarView: React.FC<LeaveCalendarViewProps> = ({ leaves, isAdmin, onSelectLeave }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Map day-of-month -> leaves active on that day
  const leavesByDay = useMemo(() => {
    const map: Record<number, LeaveRequest[]> = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(viewYear, viewMonth, day);
      const dayLeaves = leaves.filter(l => isDateWithinRange(cellDate, l.startDate, l.endDate));
      if (dayLeaves.length > 0) map[day] = dayLeaves;
    }
    return map;
  }, [leaves, viewYear, viewMonth, daysInMonth]);

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const statusDotColor = (status: string) =>
    status === 'Approved' ? 'bg-teal-500' : status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500';

  return (
    <div className="bg-slate-800/60/50 rounded-xl border border-slate-700/50 shadow-xs p-5 space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-800/60/40 text-slate-500 cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setViewMonth(today.getMonth());
              setViewYear(today.getFullYear());
            }}
            className="px-2.5 py-1 text-[11px] font-semibold text-cyan-400 hover:bg-cyan-950/40 rounded-lg cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-800/60/40 text-slate-500 cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500" /> Approved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending / To Approve
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" /> Rejected
        </span>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-[10px] font-bold text-slate-400 uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }
          const isToday =
            day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const dayLeaves = leavesByDay[day] || [];

          return (
            <div
              key={day}
              className={`aspect-square p-1 rounded-lg border text-left flex flex-col gap-0.5 overflow-hidden ${
                isToday ? 'border-indigo-500 bg-cyan-950/40/60' : 'border-slate-700/30 bg-slate-900/80/40/50'
              }`}
            >
              <span className={`text-[10px] font-semibold ${isToday ? 'text-cyan-300' : 'text-slate-500'}`}>
                {day}
              </span>
              <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                {dayLeaves.slice(0, 2).map(l => (
                  <button
                    key={l.id}
                    onClick={() => isAdmin && onSelectLeave(l)}
                    className={`w-full text-left px-1 py-0.5 rounded text-[9px] font-medium truncate flex items-center gap-1 ${
                      l.status === 'Approved'
                        ? 'bg-teal-950/60 text-teal-300'
                        : l.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-950/60 text-amber-300'
                    } ${isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                    title={`${l.employeeName} • ${l.leaveType} • ${l.status}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor(l.status)}`} />
                    {isAdmin ? l.employeeName?.split(' ')[0] : l.leaveType}
                  </button>
                ))}
                {dayLeaves.length > 2 && (
                  <span className="text-[9px] text-slate-400 px-1">+{dayLeaves.length - 2} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isAdmin && (
        <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/30">
          Tip: click a pending entry on the calendar to open the Approve / Reject review panel.
        </p>
      )}
    </div>
  );
};







