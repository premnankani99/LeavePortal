import { X, CalendarDays, Clock, FileText, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

const formatTime = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function LeaveDetailsModal({ request, onClose }) {
  if (!request) return null;

  const datesReq = `${new Date(request.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${request.start_date !== request.end_date ? ` to ${new Date(request.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}`;
  
  const submitDate = formatTime(request.created_at);
  const approvedDate = formatTime(request.approved_at);
  const rejectedDate = formatTime(request.rejected_at);
  const withdrawnDate = formatTime(request.withdrawn_at);

  const totalDays = request.total_days || 0;
  const paidDays = request.paid_days !== null && request.paid_days !== undefined ? request.paid_days : 0;
  const unpaidDays = Math.max(0, totalDays - paidDays);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7e57c2] flex items-center justify-center text-white font-bold">
              {request.profiles?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">{request.profiles?.full_name}</h3>
              <p className="text-xs text-gray-500">{request.profiles?.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Leave Status</p>
              <Badge className="capitalize text-sm px-3 py-1" variant={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'danger' : 'secondary'}>
                {request.status === 'cancelled' ? 'withdrawn' : request.status}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Leave Type</p>
              <p className="font-semibold text-gray-900">{request.leave_types?.name || request.leave_type || 'Leave'}</p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100/50">
            <div className="flex items-start gap-3">
              <CalendarDays className="w-5 h-5 text-[#7e57c2] mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">{datesReq}</p>
                <div className="flex gap-4 mt-2">
                  <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-0.5">Total Days</p>
                    <p className="font-bold text-gray-900">{totalDays}</p>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-0.5">Paid Leave</p>
                    <p className="font-bold text-emerald-600">{paidDays}</p>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-0.5">Unpaid Leave</p>
                    <p className="font-bold text-orange-500">{unpaidDays}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 text-sm">
              <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-700">Reason for leave</p>
                <p className="text-gray-600 mt-1 leading-relaxed">{request.reason}</p>
              </div>
            </div>

            {request.admin_note && (
              <div className="flex gap-3 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-700">Admin Comment</p>
                  <p className="text-gray-600 mt-1 leading-relaxed">{request.admin_note}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Timeline
            </h4>
            <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-gray-100 bg-white shadow-sm">
                  <p className="text-xs font-semibold text-gray-700">Applied</p>
                  <p className="text-[10px] text-gray-500">{submitDate}</p>
                </div>
              </div>

              {approvedDate && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-emerald-100 bg-emerald-50 shadow-sm">
                    <p className="text-xs font-semibold text-emerald-700">Approved</p>
                    <p className="text-[10px] text-emerald-600/80">{approvedDate}</p>
                  </div>
                </div>
              )}

              {rejectedDate && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-red-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <AlertCircle className="w-3 h-3" />
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-red-100 bg-red-50 shadow-sm">
                    <p className="text-xs font-semibold text-red-700">Rejected</p>
                    <p className="text-[10px] text-red-600/80">{rejectedDate}</p>
                  </div>
                </div>
              )}

              {withdrawnDate && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-gray-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-gray-200 bg-gray-50 shadow-sm">
                    <p className="text-xs font-semibold text-gray-700">Withdrawn</p>
                    <p className="text-[10px] text-gray-500">{withdrawnDate}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
