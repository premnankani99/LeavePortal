import { useState, useMemo } from 'react';
import LeaveForm from '../components/LeaveForm';
import { useAuth } from '../context/AuthContext';
import { Thermometer, Umbrella, UserPlus, Users, X, Loader2, PlusCircle, Filter, CheckCircle, Clock, XCircle, CalendarDays, TrendingUp, RefreshCcw } from 'lucide-react';
import { useMyBalances, useMyRequests, useLeaveTypes, useWithdrawRequest } from '../hooks/useLeaves';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';

export default function EmployeeDashboard() {
  const { user, profile } = useAuth();
  const { data: myLeaves = [], isLoading: loadingLeaves } = useMyRequests();
  const { data: myBalances = [], isLoading: loadingBalances } = useMyBalances();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const withdrawMutation = useWithdrawRequest();
  const toast = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [withdrawTarget, setWithdrawTarget] = useState(null);

  const handleWithdraw = () => {
    if (withdrawTarget) {
      withdrawMutation.mutate(withdrawTarget.id, {
        onSuccess: () => {
          toast.success("Leave request withdrawn successfully.");
          setWithdrawTarget(null);
        },
        onError: (err) => {
          toast.error("Failed to withdraw request: " + err.message);
        }
      });
    }
  };

  const getIconForType = (typeName = '') => {
    if (typeName.includes('Sick')) return Thermometer;
    if (typeName.includes('Vacation') || typeName.includes('Earned')) return Umbrella;
    if (typeName.includes('Casual')) return UserPlus;
    if (typeName.includes('Maternity') || typeName.includes('Paternity')) return Users;
    return CalendarDays;
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved': return { label: 'Approved', icon: CheckCircle, cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
      case 'rejected': return { label: 'Rejected', icon: XCircle, cls: 'bg-red-50 text-red-700 border border-red-200' };
      case 'cancelled': return { label: 'Withdrawn', icon: RefreshCcw, cls: 'bg-gray-50 text-gray-700 border border-gray-200' };
      default: return { label: 'Pending', icon: Clock, cls: 'bg-amber-50 text-amber-700 border border-amber-200' };
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: myLeaves.length,
    approved: myLeaves.filter(l => l.status === 'approved').length,
    pending: myLeaves.filter(l => l.status === 'pending').length,
    rejected: myLeaves.filter(l => l.status === 'rejected').length,
  }), [myLeaves]);

  // Merge balances with defaults if new employee
  const displayBalances = useMemo(() => {
    return leaveTypes.map(type => {
      const existing = myBalances.find(b => b.leave_types?.name === type.name);
      if (existing) return existing;
      return { id: `default-${type.id}`, leave_types: type, allocated: type.default_annual_quota, used: 0 };
    });
  }, [myBalances, leaveTypes]);

  // Filter leaves
  const filteredLeaves = useMemo(() => {
    return myLeaves.filter(req => {
      const matchStatus = statusFilter === 'All' || req.status === statusFilter.toLowerCase();
      const matchType = typeFilter === 'All' || req.leave_types?.name === typeFilter;
      return matchStatus && matchType;
    });
  }, [myLeaves, statusFilter, typeFilter]);

  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-10">

      <ConfirmDialog
        isOpen={!!withdrawTarget}
        title="Withdraw Leave Request?"
        message="Are you sure you want to withdraw this leave request? This action cannot be undone."
        confirmLabel="Yes, Withdraw"
        onConfirm={handleWithdraw}
        onCancel={() => setWithdrawTarget(null)}
      />

      {/* Enhanced Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#7e57c2] to-[#9b72e5] p-6 flex items-center justify-between shadow-lg">
        <div>
          <p className="text-purple-200 text-sm font-medium">{greeting},</p>
          <h1 className="text-2xl font-bold text-white mt-1">{firstName} 👋</h1>
          <p className="text-purple-100 text-sm mt-2">You have <span className="font-bold text-white">{stats.pending}</span> pending request{stats.pending !== 1 ? 's' : ''} and <span className="font-bold text-white">{stats.approved}</span> approved this year.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-[#7e57c2] hover:bg-purple-50 px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          Apply Leave
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, icon: CalendarDays, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className={`${s.bg} p-3 rounded-lg`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Balance Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#9b72e5]" /> Leave Balance</h2>
          <span className="text-xs text-gray-400">Year {new Date().getFullYear()}</span>
        </div>
        {loadingBalances ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#9b72e5] w-8 h-8" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayBalances.map((bal) => {
              const Icon = getIconForType(bal.leave_types?.name || '');
              const pct = bal.allocated > 0 ? Math.round((bal.used / bal.allocated) * 100) : 0;
              const remaining = (bal.allocated || 0) - (bal.used || 0);
              const color = bal.leave_types?.color_code || '#7e57c2';
              return (
                <div key={bal.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer">
                  <div className="h-1 w-full" style={{ backgroundColor: color }} />
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{bal.leave_types?.name}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{remaining} <span className="text-base font-medium text-gray-400">left</span></p>
                      </div>
                      <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}18` }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{bal.used} used</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
                      </div>
                      <p className="text-xs text-gray-400">{bal.allocated} days total</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-900">Request History</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 text-gray-600 bg-white focus:ring-2 focus:ring-[#9b72e5] focus:border-transparent outline-none"
            >
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Withdrawn</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 text-gray-600 bg-white focus:ring-2 focus:ring-[#9b72e5] focus:border-transparent outline-none"
            >
              <option value="All">All Types</option>
              {leaveTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {loadingLeaves ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#9b72e5] w-7 h-7" /></div>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-8 h-8 text-[#9b72e5]" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">No requests found</p>
              <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                {statusFilter !== 'All' || typeFilter !== 'All' ? 'Try changing your filters.' : "You haven't requested any time off yet."}
              </p>
              {statusFilter === 'All' && typeFilter === 'All' && (
                <button onClick={() => setIsModalOpen(true)} className="mt-5 bg-[#9b72e5] text-white hover:bg-[#7e57c2] px-5 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Request Time Off
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Leave Type', 'Dates', 'Reason', 'Applied On', 'Status', 'Review', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLeaves.map(req => {
                    const sc = getStatusConfig(req.status);
                    const StatusIcon = sc.icon;
                    const submitDate = req.created_at ? new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
                    const startFmt = new Date(req.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const endFmt = new Date(req.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const dateRange = req.start_date === req.end_date ? startFmt : `${startFmt} – ${endFmt}`;
                    return (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: req.leave_types?.color_code || '#7e57c2' }} />
                            <span className="font-medium text-gray-800">{req.leave_types?.name || 'Leave'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          {dateRange}
                          <span className="ml-2 text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{req.total_days}d</span>
                        </td>
                        <td className="px-5 py-4 text-gray-500 max-w-[160px] truncate" title={req.reason}>{req.reason || '—'}</td>
                        <td className="px-5 py-4 text-gray-500">{submitDate}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${sc.cls}`}>
                            <StatusIcon className="w-3 h-3" />{sc.label}
                          </span>
                          {req.admin_note && <p className="text-[10px] mt-1 text-gray-400 italic truncate max-w-[120px]">{req.admin_note}</p>}
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs">
                          {req.status === 'approved' || req.status === 'rejected' ? 'HR Dept.' : '—'}
                        </td>
                        <td className="px-5 py-4">
                          {(req.status === 'pending' || req.status === 'approved') && (
                            <button
                              onClick={() => setWithdrawTarget(req)}
                              disabled={withdrawMutation.isPending}
                              className="text-xs text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-md font-medium transition-colors"
                            >
                              Withdraw
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Apply for Leave</h3>
                <p className="text-sm text-gray-500 mt-0.5">Submit a new leave request for approval</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <LeaveForm onSuccess={() => setIsModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
