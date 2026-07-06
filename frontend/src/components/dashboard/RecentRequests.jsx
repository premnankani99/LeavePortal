import { Clock, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function RecentRequests({ allRequests, loadingReq }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
      <div className="p-5 border-b border-gray-100 shrink-0 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> Recent Requests
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Latest leave submissions across all employees</p>
        </div>
      </div>
      <div className="overflow-y-auto flex-1">
        {loadingReq ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-[#7e57c2] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : allRequests.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm h-full flex items-center justify-center">No requests yet.</div>
        ) : (
          allRequests.slice(0, 10).map(req => {
            const sc = req.status === 'approved'
              ? { icon: CheckCircle, cls: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Approved' }
              : req.status === 'rejected'
              ? { icon: XCircle, cls: 'text-red-500', bg: 'bg-red-50', label: 'Rejected' }
              : req.status === 'cancelled'
              ? { icon: RefreshCcw, cls: 'text-gray-500', bg: 'bg-gray-50', label: 'Withdrawn' }
              : { icon: Clock, cls: 'text-amber-500', bg: 'bg-amber-50', label: 'Pending' };
            const StatusIcon = sc.icon;
            
            let sessionDisplay = "Half Day";
            if (req.is_half_day) {
              const match = req.reason?.match(/\[Half-Day: (.*?)\]/);
              if (match) {
                sessionDisplay = match[1] === 'Morning' ? 'AM' : 'PM';
              }
            }

            return (
              <div key={req.id} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <div className={`${sc.bg} p-2.5 rounded-xl shrink-0`}>
                  <StatusIcon className={`w-5 h-5 ${sc.cls}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{req.profiles?.full_name || req.profiles?.email || 'Employee'}</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: req.leave_types?.color_code || '#7e57c2' }} />
                    {req.leave_types?.name} · {req.total_days} day{req.total_days !== 1 ? 's' : ''} {req.is_half_day && <span className="font-bold text-[#7e57c2] bg-purple-100 px-1.5 rounded">(Half Day - {sessionDisplay})</span>}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${sc.bg} ${sc.cls}`}>{sc.label}</span>
                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{dayjs(req.created_at).fromNow()}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
