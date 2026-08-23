import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  LogOut, 
  User as UserIcon, 
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AppNotification } from '../types';

interface HeaderProps {
  onOpenProjectExport: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProjectExport,
  onOpenAuth,
  onOpenProfile
}) => {
  const { user, role, logout, setActiveTab } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<{ checkedIn: boolean; time?: string }>({ checkedIn: false });

  // Fetch notifications and attendance status
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const notifs = await api.getNotifications(user.id);
        setNotifications(notifs);

        const todayStr = new Date().toISOString().split('T')[0];
        const atts = await api.getAttendance({ userId: user.id, date: todayStr });
        if (atts.length > 0 && atts[0].checkInTime) {
          setTodayAttendance({ checkedIn: true, time: atts[0].checkInTime });
        } else {
          setTodayAttendance({ checkedIn: false });
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notifId: string, linkTab?: string) => {
    try {
      await api.markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
      if (linkTab) {
        setActiveTab(linkTab);
        setShowNotifications(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="app-header sticky top-0 z-40 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-cyan-500/30">
              D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-100 font-sans">dayflow</span>
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  HRMS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Every workday, perfectly aligned.</p>
            </div>
          </div>
        </div>

        {/* Action Controls & User Profile */}
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Punch Status Badge */}
          {user && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60/50 border border-slate-700/50 text-xs backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Today:</span>
              {todayAttendance.checkedIn ? (
                <span className="flex items-center gap-1 text-teal-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  Punched In ({todayAttendance.time})
                </span>
              ) : (
                <span className="text-amber-400 font-medium">Not Checked In</span>
              )}
            </div>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800/60 rounded-xl shadow-xl border border-slate-700/50 py-2 z-50 backdrop-blur-sm animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/30">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id, n.linkTab)}
                        className={`p-3 hover:bg-slate-700/40 transition-colors cursor-pointer text-left ${!n.read ? 'bg-cyan-950/30' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-100">{n.title}</p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl hover:bg-slate-700/50 transition-all border border-slate-700/50"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-slate-100 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-cyan-400 capitalize font-medium">
                    {user.role === 'admin' ? 'HR Admin' : user.jobDetails.title}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800/60 rounded-xl shadow-xl border border-slate-700/50 py-1.5 z-50 backdrop-blur-sm animate-in fade-in zoom-in-95">
                  <div className="px-4 py-3 border-b border-slate-700/50">
                    <p className="text-xs font-semibold text-slate-100">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 font-semibold uppercase tracking-wider">
                        ID: {user.employeeId}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 font-medium">
                        {user.jobDetails.department}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProfile();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-700/40 flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      View Full Profile & Salary
                    </button>
                  </div>

                  <div className="border-t border-slate-700/50 py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        onOpenAuth();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-amber-400 hover:bg-amber-500/10 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-amber-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-500"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};






