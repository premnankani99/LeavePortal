import { useAdminDashboardStats } from '../hooks/useAdminDashboardStats';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import KpiCards from '../components/dashboard/KpiCards';
import RequestBreakdown from '../components/dashboard/RequestBreakdown';
import RecentRequests from '../components/dashboard/RecentRequests';

export default function AdminDashboard() {
  const { 
    allRequests, 
    pendingVerifs, 
    loadingReq, 
    pendingRequests, 
    approvedRequests, 
    rejectedRequests, 
    kpis 
  } = useAdminDashboardStats();

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col space-y-6 font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeader pendingVerifsCount={pendingVerifs.length} />
      <KpiCards kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
        <RequestBreakdown 
          allRequests={allRequests}
          approvedRequests={approvedRequests}
          pendingRequests={pendingRequests}
          rejectedRequests={rejectedRequests}
        />
        <RecentRequests 
          allRequests={allRequests}
          loadingReq={loadingReq}
        />
      </div>
    </div>
  );
}
