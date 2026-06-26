import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { UserCheck, Loader2 } from 'lucide-react';

export default function LeaveApprovalQueue({ 
  pendingRequests, 
  loadingReqs, 
  comments, 
  onCommentChange, 
  onAction, 
  isProcessingRequest 
}) {
  return (
    <div className="flex-1 flex flex-col">
      <Card className="border-t-4 border-t-purple-500 flex-1 flex flex-col shadow-sm">

        <CardContent className="flex-1 flex flex-col overflow-auto">
          {loadingReqs ? (
            <div className="flex-1 flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-purple-500 w-8 h-8" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Queue is empty. You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {pendingRequests.map(req => {
                let sessionDisplay = "Half Day";
                let cleanReason = req.reason || 'No reason provided';
                if (req.is_half_day) {
                  const match = req.reason?.match(/\[Half-Day: (.*?)\]/);
                  if (match) {
                    sessionDisplay = `Half Day - ${match[1] === 'Morning' ? 'AM' : 'PM'}`;
                    cleanReason = req.reason.replace(/\[Half-Day: .*?\]\s*/, '');
                  }
                }
                const datesReq = `${new Date(req.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${req.start_date !== req.end_date ? ` - ${new Date(req.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}`;

                return (
                  <div key={req.id} className="p-5 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{req.leave_types?.name || 'Leave'}</h4>
                        <p className="text-sm text-gray-500">Applied by: <span className="font-medium text-gray-800">{req.profiles?.full_name} ({req.profiles?.email})</span></p>
                        <p className="text-sm text-gray-500">Applied for {req.total_days} days: {datesReq}</p>
                        {(req.is_half_day || req.is_compensatory) && (
                          <div className="flex gap-2 mt-2">
                            {req.is_half_day && <span className="bg-purple-100 text-purple-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">{sessionDisplay}</span>}
                            {req.is_compensatory && <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Will Compensate</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-gray-50 p-3 rounded-md">
                      <div className="col-span-2">
                        <span className="text-gray-500">Reason: </span>
                        <span className="font-medium text-gray-800">{cleanReason}</span>
                      </div>
                      
                      {req.status === 'withdrawal_requested' && req.withdrawn_dates && (
                        <div className="col-span-2 mt-2 bg-orange-100 border border-orange-200 p-2 rounded text-orange-800">
                          <span className="font-semibold block mb-1">Partial Withdrawal Requested For:</span>
                          <ul className="list-disc pl-5">
                            {(typeof req.withdrawn_dates === 'string' ? JSON.parse(req.withdrawn_dates) : req.withdrawn_dates).map(d => (
                              <li key={d} className="font-medium">{new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Inline Comment & Actions */}
                    <div className="border-t border-gray-100 pt-4 mt-2">
                      <div className="mb-3">
                        <input
                          type="text"
                          placeholder="Add an optional comment (e.g. Project deadline on Friday)"
                          value={comments[req.id] || ''}
                          onChange={(e) => onCommentChange(req.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        {req.status === 'withdrawal_requested' ? (
                          <>
                            <Button 
                              variant="outline" size="sm" className="text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
                              onClick={() => onAction(req.id, 'approved')} disabled={isProcessingRequest}
                            >Reject Withdrawal</Button>
                            <Button 
                              size="sm" className="bg-orange-500 hover:bg-orange-600 text-white"
                              onClick={() => onAction(req.id, 'cancelled')} disabled={isProcessingRequest}
                            >Approve Withdrawal</Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="outline" size="sm" className="text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
                              onClick={() => onAction(req.id, 'rejected')} disabled={isProcessingRequest}
                            >Reject</Button>
                            <Button 
                              size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => onAction(req.id, 'approved')} disabled={isProcessingRequest}
                            >Approve</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
