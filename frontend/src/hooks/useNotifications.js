import { useState, useEffect, useMemo } from 'react';
import { Bell, CheckCircle2, XCircle, RefreshCcw, AlertCircle } from 'lucide-react';
import { useMyRequests, useAllRequests, usePendingVerifications } from './useLeaves';
import { useAuth } from '../context/AuthContext';

// Helper to format "time ago"
function timeAgo(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const useNotifications = () => {
  const { role, user } = useAuth();
  const { data: myLeaves = [], isLoading: loadingMy } = useMyRequests();
  const { data: allRequests = [], isLoading: loadingAll } = useAllRequests();
  const { data: pendingVerifications = [], isLoading: loadingVerif } = usePendingVerifications();

  const [lastReadTime, setLastReadTime] = useState(() => {
    return user ? Number(localStorage.getItem(`notif_read_${user.id}`) || '0') : 0;
  });

  useEffect(() => {
    const updateRead = () => {
      setLastReadTime(user ? Number(localStorage.getItem(`notif_read_${user.id}`) || '0') : 0);
    };
    window.addEventListener('notifications_read', updateRead);
    return () => window.removeEventListener('notifications_read', updateRead);
  }, [user]);

  const notificationsList = useMemo(() => {
    const notifs = [];

    if (role === 'admin') {
      // 1. Pending Leave Requests
      allRequests.forEach(leave => {
        const type = leave.leave_types?.name || 'Leave';
        const empName = leave.profiles?.full_name || leave.profiles?.email || 'An employee';
        const range = new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        if (leave.status === 'pending') {
          const tDate = new Date(leave.created_at);
          notifs.push({
            id: `req_${leave.id}`,
            title: 'New Leave Request',
            message: `${empName} applied for ${type} starting ${range}.`,
            timeDate: tDate,
            time: timeAgo(leave.created_at),
            icon: Bell,
            iconBg: 'bg-blue-100 text-blue-600',
            isUnread: tDate.getTime() > lastReadTime
          });
        }

        if (leave.status === 'withdrawal_requested') {
          const dTime = leave.withdrawal_requested_at || leave.updated_at;
          const tDate = new Date(dTime);
          notifs.push({
            id: `wreq_${leave.id}`,
            title: 'Leave Withdrawal Pending',
            message: `${empName} wants to withdraw their ${type} starting ${range}.`,
            timeDate: tDate,
            time: timeAgo(dTime),
            icon: AlertCircle,
            iconBg: 'bg-orange-100 text-orange-600',
            isUnread: tDate.getTime() > lastReadTime
          });
        }
      });

      // 2. Pending Employee Verifications
      pendingVerifications.forEach(emp => {
        const tDate = new Date(emp.created_at);
        notifs.push({
          id: `verify_${emp.id}`,
          title: 'Account Verification Pending',
          message: `${emp.full_name || emp.email} is waiting for account approval.`,
          timeDate: tDate,
          time: timeAgo(emp.created_at),
          icon: AlertCircle,
          iconBg: 'bg-yellow-100 text-yellow-600',
          isUnread: tDate.getTime() > lastReadTime
        });
      });

    } else {
      // Employee logic
      myLeaves.forEach(leave => {
        const type = leave.leave_types?.name || 'Leave';
        const range = new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        if (leave.approved_at) {
          const tDate = new Date(leave.approved_at);
          notifs.push({
            id: `app_${leave.id}`,
            title: 'Leave Approved',
            message: `Your request for ${type} starting ${range} was approved.`,
            timeDate: tDate,
            time: timeAgo(leave.approved_at),
            icon: CheckCircle2,
            iconBg: 'bg-emerald-100 text-emerald-600',
            isUnread: tDate.getTime() > lastReadTime
          });
        }

        if (leave.rejected_at) {
          const tDate = new Date(leave.rejected_at);
          notifs.push({
            id: `rej_${leave.id}`,
            title: 'Leave Rejected',
            message: `Your request for ${type} starting ${range} was rejected.`,
            timeDate: tDate,
            time: timeAgo(leave.rejected_at),
            icon: XCircle,
            iconBg: 'bg-red-100 text-red-600',
            isUnread: tDate.getTime() > lastReadTime
          });
        }

        if (leave.withdrawn_at) {
          const tDate = new Date(leave.withdrawn_at);
          notifs.push({
            id: `wd_${leave.id}`,
            title: 'Leave Withdrawn',
            message: `Your request for ${type} starting ${range} was withdrawn.`,
            timeDate: tDate,
            time: timeAgo(leave.withdrawn_at),
            icon: RefreshCcw,
            iconBg: 'bg-gray-100 text-gray-600',
            isUnread: tDate.getTime() > lastReadTime
          });
        }
        
        if (leave.withdrawal_requested_at && leave.status === 'withdrawal_requested') {
          const tDate = new Date(leave.withdrawal_requested_at);
          notifs.push({
            id: `wreq_${leave.id}`,
            title: 'Withdrawal Pending',
            message: `Your partial withdrawal request for ${type} is pending admin approval.`,
            timeDate: tDate,
            time: timeAgo(leave.withdrawal_requested_at),
            icon: AlertCircle,
            iconBg: 'bg-orange-100 text-orange-600',
            isUnread: tDate.getTime() > lastReadTime
          });
        }
      });
    }

    // Add static welcome notification
    notifs.push({
      id: 'welcome',
      title: 'Welcome to the Leave Portal!',
      message: 'Setup your profile and review your leave balance.',
      timeDate: new Date(0), // Oldest
      time: 'A while ago',
      icon: Bell,
      iconBg: 'bg-purple-100 text-purple-600',
      isUnread: false
    });

    // Sort by newest first
    return notifs.sort((a, b) => b.timeDate - a.timeDate);
  }, [myLeaves, allRequests, pendingVerifications, role, user, lastReadTime]);

  return {
    notificationsList,
    isLoading: role === 'admin' ? (loadingAll || loadingVerif) : loadingMy
  };
};
