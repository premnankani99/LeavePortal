import { CheckCircle, Clock, XCircle, RefreshCcw, CalendarDays, Loader2, AlertCircle } from 'lucide-react';

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
  if (lower.includes('sick')) return 'bg-blue-500';
  if (lower.includes('maternity') || lower.includes('paternity')) return 'bg-pink-500';
  if (lower.includes('compensatory')) return 'bg-green-500';
  return 'bg-purple-500';
};

const formatTime = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function LeaveHistoryTable({ loadingLeaves, filteredLeaves, statusFilter, typeFilter, setWithdrawTarget, isWithdrawing }) {
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

            const startFmt = new Date(req.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const endFmt = new Date(req.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            let sessionDisplay = "Half Day";
            let cleanReason = req.reason || '—';
            if (req.is_half_day) {
              const match = req.reason?.match(/\[Half-Day: (.*?)\]/);
              if (match) {
                sessionDisplay = `Half Day - ${match[1] === 'Morning' ? 'AM' : 'PM'}`;
                cleanReason = req.reason.replace(/\[Half-Day: .*?\]\s*/, '');
              }
            }
            
            const dateRange = req.start_date === req.end_date ? startFmt : `${startFmt} – ${endFmt}`;
            const typeClass = getLeaveTypeBgClass(req.leave_types?.name);

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
                <td className="px-5 py-4 text-[11px] text-gray-500">
                  <div className="space-y-1">
                    <div><span className="font-semibold">Applied:</span> {submitDate}</div>
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
                  {req.admin_note && <p className="text-[10px] mt-1 text-gray-400 italic truncate max-w-[120px]">{req.admin_note}</p>}
                </td>

                <td className="px-5 py-4">
                  {(req.status === 'pending' || req.status === 'approved') && (
                    <button
                      onClick={() => setWithdrawTarget(req)}
                      disabled={isWithdrawing}
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
  );
}
