import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { UserCheck, Loader2, X, AlertCircle, Lock } from 'lucide-react';
import { formatActiveDateRanges } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';

export default function LeaveApprovalQueue({ 
  pendingRequests, 
  loadingReqs, 
  comments, 
  onCommentChange, 
  onAction, 
  isProcessingRequest 
}) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { user } = useAuth();

  const handleAction = (id, action) => {
    console.log("[Frontend Component] Rendering handleAction in LeaveApprovalQueue.jsx");
    const success = onAction(id, action);
    if (success !== false) {
      setSelectedRequest(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative">
      <Card className="border-t-4 border-t-purple-500 flex-1 flex flex-col shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-auto p-4">
          {loadingReqs ? (
            <div className="flex-1 flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-[#7e57c2] w-8 h-8" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-base">Queue is empty. You're all caught up!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingRequests.map(req => {
                let sessionDisplay = "Full Day";
                if (req.is_half_day) {
                  const match = req.reason?.match(/\[Half-Day: (.*?)\]/);
                  if (match) {
                    sessionDisplay = `Half Day (${match[1] === 'Morning' ? 'AM' : 'PM'})`;
                  }
                }
                const datesReq = formatActiveDateRanges(req.start_date, req.end_date, req.withdrawn_dates);
                
                const isUnpaid = req.leave_type?.includes('Unpaid');
                const badgeColor = isUnpaid ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-green-100 text-green-700 border-green-200';
                const statusLabel = isUnpaid ? 'Unpaid LOP' : 'Paid';

                const isWithdrawal = req.status === 'withdrawal_requested';

                return (
                  <div 
                    key={req.id} 
                    onClick={() => setSelectedRequest(req)}
                    className="group cursor-pointer p-5 border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 group-hover:bg-purple-500 transition-colors"></div>
                    <div className="flex items-start sm:items-center gap-4 pl-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 border border-purple-200">
                        {req.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h4 className="font-bold text-gray-900 group-hover:text-[#7e57c2] transition-colors text-lg leading-tight">{req.profiles?.full_name}</h4>
                          <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                            {statusLabel}
                          </span>
                          {isWithdrawal && (
                            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border bg-red-100 text-red-700 border-red-200 flex items-center gap-1 shadow-sm">
                              <AlertCircle className="w-3 h-3" /> Withdrawal
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 flex flex-wrap items-center gap-1.5 font-medium">
                          <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md text-xs">{req.leave_types?.name || 'Leave'}</span>
                          <span>•</span>
                          <span className="text-gray-900 font-semibold">{req.total_days} days</span>
                          <span>•</span>
                          <span className="text-gray-500">{datesReq}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pl-3 sm:pl-0">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-full px-5 font-semibold text-[#7e57c2] border-purple-200 hover:bg-[#7e57c2] hover:text-white transition-all shadow-sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Dialog */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {(() => {
              const req = selectedRequest;
              let sessionDisplay = "Full Day";
              let cleanReason = req.reason || 'No reason provided';
              if (req.is_half_day) {
                const match = req.reason?.match(/\[Half-Day: (.*?)\]/);
                if (match) {
                  sessionDisplay = `Half Day - ${match[1] === 'Morning' ? 'AM' : 'PM'}`;
                  cleanReason = req.reason.replace(/\[Half-Day: .*?\]\s*/, '');
                }
              }
              const datesReq = formatActiveDateRanges(req.start_date, req.end_date, req.withdrawn_dates);
              const appliedAt = new Date(req.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              
              const isUnpaid = req.leave_type?.includes('Unpaid');
              const isWithdrawal = req.status === 'withdrawal_requested';

              return (
                <div className="flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Leave Request</h3>
                      <p className="text-sm text-gray-500">{req.profiles?.full_name}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedRequest(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 overflow-y-auto space-y-5">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Leave Type</p>
                        <p className="font-semibold text-gray-900">{req.leave_types?.name || 'Leave'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Duration</p>
                        <p className="font-semibold text-gray-900">{req.total_days} Days ({sessionDisplay})</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-gray-500 mb-1">Dates</p>
                        <p className="font-semibold text-gray-900">{datesReq}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-gray-500 mb-1">Applied On</p>
                        <p className="font-semibold text-gray-900">{appliedAt}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500 mb-1">Payment Status</p>
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${isUnpaid ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                          {req.leave_type}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-gray-500 text-sm mb-1">Reason</p>
                      <p className="font-medium text-gray-800 text-sm whitespace-pre-wrap">{cleanReason}</p>
                    </div>

                    {isWithdrawal && req.withdrawn_dates && (
                      <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-red-800 text-sm">
                        <p className="font-bold mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> 
                          Partial Withdrawal Requested For:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          {(typeof req.withdrawn_dates === 'string' ? JSON.parse(req.withdrawn_dates) : req.withdrawn_dates).map(d => (
                            <li key={d} className="font-medium">{new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Footer / Actions */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50">
                    {user?.role === 'admin' && !req.profiles?.managers?.some(m => m.id === user.id) ? (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <Lock className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">You cannot approve or reject this request because you are not assigned as this employee's reporting manager.</p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Admin Comment (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Project deadline on Friday"
                            value={comments[req.id] || ''}
                            onChange={(e) => onCommentChange(req.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-[#7e57c2] focus:border-[#7e57c2]"
                          />
                        </div>
                        <div className="flex gap-3">
                          {isWithdrawal ? (
                            <>
                              <Button 
                                variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleAction(req.id, 'approved')} disabled={isProcessingRequest}
                              >
                                Reject Withdrawal
                              </Button>
                              <Button 
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={() => handleAction(req.id, 'cancelled')} disabled={isProcessingRequest}
                              >
                                Approve Withdrawal
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleAction(req.id, 'rejected')} disabled={isProcessingRequest}
                              >
                                Reject Leave
                              </Button>
                              <Button 
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleAction(req.id, 'approved')} disabled={isProcessingRequest}
                              >
                                Approve Leave
                              </Button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
