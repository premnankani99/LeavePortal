import { CheckCircle, Clock, XCircle, RefreshCcw, CalendarDays, Loader2, AlertCircle, Eye, Ban } from 'lucide-react';
import { formatActiveDateRanges } from '../../utils/dateUtils';
const getStatusConfig = (status) => {
  switch (status) {
    case 'approved': return { label: 'Approved', icon: CheckCircle, cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
    case 'rejected': return { label: 'Rejected', icon: XCircle, cls: 'bg-red-50 text-red-700 border border-red-200' };
    case 'cancelled': return { label: 'Withdrawn', icon: RefreshCcw, cls: 'bg-gray-50 text-gray-700 border border-gray-200' };
    case 'withdrawal_requested': return { label: 'Withdrawal Req', icon: AlertCircle, cls: 'bg-orange-50 text-orange-700 border border-orange-200' };
    default: return { label: 'Pending', icon: Clock, cls: 'bg-amber-50 text-amber-700 border border-amber-200' };
  }
};

const getLeaveTypeBgClass = (typeName) => {
  if (!typeName) return 'bg-purple-500';
  const lower = typeName.toLowerCase();
  if (lower.includes('casual')) return 'bg-purple-500';
  if (lower.includes('sick')) return 'bg-purple-500';
  if (lower.includes('maternity') || lower.includes('paternity')) return 'bg-pink-500';
  if (lower.includes('compensatory')) return 'bg-green-500';
  return 'bg-purple-500';
};

const formatTime = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function LeaveHistoryTable({ loadingLeaves, filteredLeaves, statusFilter, typeFilter, setWithdrawTarget, isWithdrawing, handleAdjust, isAdjusting, user, onViewDetails }) {
  if (loadingLeaves) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-[#9b72e5] w-7 h-7" />
      </div>
    );
  }

  if (filteredLeaves.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 group hover:bg-purple-100 transition-colors cursor-pointer">
          <CalendarDays className="w-10 h-10 text-[#9b72e5] group-hover:animate-bounce" />
        </div>
        <p className="text-gray-700 font-semibold text-xl">No requests found</p>
        <p className="text-base text-gray-400 mt-2 max-w-sm mx-auto text-center">
          {statusFilter !== 'All' || typeFilter !== 'All' ? 'Try changing your filters.' : "You haven't requested any time off yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-base text-left">
        <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
          <tr>
            {['Leave Type', 'Dates', 'Reason', 'Timings', 'Status', 'Actions'].map(h => (
              <th key={h} className="px-5 py-4 font-semibold text-sm text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filteredLeaves.map(req => {
            const sc = getStatusConfig(req.status);
            const StatusIcon = sc.icon;
            
            const submitDate = formatTime(req.created_at);
            const approvedDate = formatTime(req.approved_at);
            const rejectedDate = formatTime(req.rejected_at);
            const withdrawnDate = formatTime(req.withdrawn_at);
            const withdrawReqDate = formatTime(req.withdrawal_requested_at);

            const dateRange = formatActiveDateRanges(req.start_date, req.end_date, req.withdrawn_dates);
            const typeClass = getLeaveTypeBgClass(req.leave_types?.name);

            const currentPaid = req.paid_days !== null ? req.paid_days : req.total_days;
            const hasUnpaid = req.total_days > currentPaid;
            const canAdjust = hasUnpaid && user?.available_leaves > 0 && (req.status === 'pending' || req.status === 'approved');
            
            let sessionDisplay = "Half Day";
            let cleanReason = req.reason || '—';
            if (req.is_half_day) {
              const match = req.reason?.match(/\[Half-Day: (.*?)\]/);
              if (match) {
                sessionDisplay = `Half Day - ${match[1] === 'Morning' ? 'AM' : 'PM'}`;
                cleanReason = req.reason.replace(/\[Half-Day: .*?\]\s*/, '');
              }
            }
            
            let showAdjust = false;
            if (canAdjust) {
                const now = new Date();
                const leaveStart = new Date(req.start_date);
                if (leaveStart.getMonth() === now.getMonth() && leaveStart.getFullYear() === now.getFullYear()) {
                    const diffTime = now.getTime() - leaveStart.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                    if (diffDays <= 8) showAdjust = true;
                }
            }

            return (
              <tr key={req.id} className="hover:bg-purple-50/50 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${typeClass}`} />
                    <span className="font-medium text-gray-800">{req.leave_types?.name || 'Leave'}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    <span>{dateRange}</span>
                    {req.is_half_day ? (
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{sessionDisplay}</span>
                    ) : (
                      <span className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{req.total_days}d</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500 max-w-[160px] truncate" title={cleanReason}>{cleanReason}</td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  <div className="space-y-1.5 bg-gray-50/50 p-2 rounded border border-gray-100">
                    <div><span className="font-semibold text-gray-700">Applied:</span> {submitDate}</div>
                    {approvedDate && <div><span className="font-semibold text-emerald-600">Approved:</span> {approvedDate}</div>}
                    {rejectedDate && <div><span className="font-semibold text-red-600">Rejected:</span> {rejectedDate}</div>}
                    {withdrawReqDate && <div><span className="font-semibold text-orange-600">Withdraw Req:</span> {withdrawReqDate}</div>}
                    {withdrawnDate && <div><span className="font-semibold text-gray-600">Withdrawn:</span> {withdrawnDate}</div>}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${sc.cls}`}>
                    <StatusIcon className="w-3 h-3" />{sc.label}
                  </span>
                  {req.admin_note && (
                    <div className="mt-2 text-sm text-gray-700 bg-gray-50/80 p-2.5 rounded-lg border border-gray-100 shadow-sm">
                      <span className="font-semibold text-gray-900 block mb-0.5 text-xs">Admin Note:</span>
                      {req.admin_note}
                    </div>
                  )}
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onViewDetails(req)}
                      className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 hover:text-purple-800 transition-colors border border-purple-100 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </button>
                    {(req.status === 'pending' || req.status === 'approved') && (
                      <button
                        onClick={() => setWithdrawTarget(req)}
                        disabled={isWithdrawing}
                        className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100 shadow-sm disabled:opacity-50"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Withdraw
                      </button>
                    )}
                    {showAdjust && (
                      <button
                        onClick={() => handleAdjust(req.id)}
                        disabled={isAdjusting}
                        className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-colors border border-blue-100 shadow-sm disabled:opacity-50"
                        title="Use your available balance to make this leave Paid"
                      >
                        {isAdjusting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                        Make Paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
