import { useMemo } from 'react';
import { useVerifiedEmployees, useAllRequests, usePendingVerifications } from './useLeaves';
import dayjs from 'dayjs';
import { Users, FileText, Briefcase, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const useAdminDashboardStats = () => {
  const { data: verifiedEmployees = [], isLoading: loadingEmp } = useVerifiedEmployees();
  const { data: allRequests = [], isLoading: loadingReq } = useAllRequests();
  const { data: pendingVerifs = [] } = usePendingVerifications();
  const { role } = useAuth();

  const stats = useMemo(() => {
    const pendingRequests = allRequests.filter(r => r.status === 'pending');
    const approvedRequests = allRequests.filter(r => r.status === 'approved');
    const rejectedRequests = allRequests.filter(r => r.status === 'rejected');

    const onLeaveToday = approvedRequests.filter(r => {
      const today = dayjs();
      return today.isAfter(dayjs(r.start_date).subtract(1, 'day')) && today.isBefore(dayjs(r.end_date).add(1, 'day'));
    }).length;

    const kpis = [
      { title: 'Active Employees', value: verifiedEmployees.length, icon: Users, iconColor: 'text-[#7e57c2]', iconBg: 'bg-purple-100', sub: `+${pendingVerifs.length} pending`, path: role === 'hr' ? '/hr/employees' : '/admin/employees' },
      { title: 'On Leave Today', value: onLeaveToday, icon: Briefcase, iconColor: 'text-[#7e57c2]', iconBg: 'bg-purple-100', sub: 'currently away', path: role === 'hr' ? '/hr/leaves' : '/admin/leave-queue' },
      { title: 'Pending Approvals', value: pendingRequests.length, icon: Clock, iconColor: 'text-amber-600', iconBg: 'bg-amber-100', sub: 'awaiting action', path: role === 'hr' ? '/hr/leaves' : '/admin/leave-queue' },
      { title: 'Total Requests', value: allRequests.length, icon: FileText, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100', sub: `${approvedRequests.length} approved`, path: role === 'hr' ? '/hr/leaves' : '/admin/leave-queue' },
    ];

    return {
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      onLeaveToday,
      kpis
    };
  }, [allRequests, verifiedEmployees, pendingVerifs]);

  return {
    verifiedEmployees,
    allRequests,
    pendingVerifs,
    loadingEmp,
    loadingReq,
    ...stats
  };
};
