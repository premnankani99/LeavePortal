import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { UserCheck, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAllRequests, usePendingVerifications, useUpdateVerification, useUpdateRequestStatus } from '../hooks/useLeaves';

import ConfirmDialog from '../components/ConfirmDialog';

export default function AdminRequests() {
  const { data: allRequests = [], isLoading: loadingReqs } = useAllRequests();
  const { data: pendingVerifications = [], isLoading: loadingVerifications } = usePendingVerifications();
  const verifyMutation = useUpdateVerification();
  const requestMutation = useUpdateRequestStatus();
  
  const [rejectTarget, setRejectTarget] = useState(null); // { id, name }

  const handleVerify = (userId) => {
    verifyMutation.mutate({ userId, status: 'verified' });
  };

  const handleReject = (userId, name) => {
    setRejectTarget({ id: userId, name });
  };

  const confirmReject = () => {
    if (rejectTarget) {
      verifyMutation.mutate({ userId: rejectTarget.id, status: 'rejected' });
      setRejectTarget(null);
    }
  };

  const [comments, setComments] = useState({});
  const handleCommentChange = (id, value) => setComments(prev => ({ ...prev, [id]: value }));

  const handleAction = (requestId, newStatus) => {
    const adminNote = comments[requestId] || '';
    requestMutation.mutate({ requestId, newStatus, adminNote }, {
      onSuccess: () => {
        setComments(prev => {
          const updated = { ...prev };
          delete updated[requestId];
          return updated;
        });
      }
    });
  };

  const pendingRequests = allRequests.filter(r => r.status === 'pending');
  const processedRequests = allRequests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">

      {/* Custom Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!rejectTarget}
        title="Reject Employee?"
        message={`Are you sure you want to reject "${rejectTarget?.name || 'this user'}"? They will not be able to access the portal.`}
        confirmLabel="Yes, Reject"
        onConfirm={confirmReject}
        onCancel={() => setRejectTarget(null)}
      />
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Requests Queue</h2>
        <p className="text-gray-500 mt-1">Manage pending employee verifications and leave requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Employee Verification Queue */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader className="pb-2">
              <CardTitle>Employee Verification Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingVerifications ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-purple-500" /></div>
              ) : pendingVerifications.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No new employees pending verification.</p>
                </div>
              ) : (
                <div className="space-y-3 mt-2">
                  {pendingVerifications.map(emp => (
                    <div key={emp.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-sm uppercase">
                          {(emp.full_name || emp.email || 'U').charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{emp.full_name || 'No Name Provided'}</h4>
                          <p className="text-xs text-gray-500">{emp.email}</p>
                          <p className="text-[10px] text-purple-500 font-medium mt-0.5">Pending Verification</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex items-center gap-1.5"
                          onClick={() => handleReject(emp.id, emp.full_name)}
                          disabled={verifyMutation.isPending}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
                          onClick={() => handleVerify(emp.id)}
                          disabled={verifyMutation.isPending}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Leave Approvals Queue */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-2">
              <CardTitle>Leave Approval Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingReqs ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" /></div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Queue is empty. You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {pendingRequests.map(req => {
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
                              {req.is_half_day && <span className="bg-purple-100 text-purple-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Half Day</span>}
                              {req.is_compensatory && <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Will Compensate</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-gray-50 p-3 rounded-md">
                        <div className="col-span-2">
                          <span className="text-gray-500">Reason: </span>
                          <span className="font-medium text-gray-800">{req.reason}</span>
                        </div>
                      </div>

                      {/* Inline Comment & Actions */}
                      <div className="border-t border-gray-100 pt-4 mt-2">
                        <div className="mb-3">
                          <input
                            type="text"
                            placeholder="Add an optional comment (e.g. Project deadline on Friday)"
                            value={comments[req.id] || ''}
                            onChange={(e) => handleCommentChange(req.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" size="sm" className="text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleAction(req.id, 'rejected')} disabled={requestMutation.isPending}
                          >Reject</Button>
                          <Button 
                            size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAction(req.id, 'approved')} disabled={requestMutation.isPending}
                          >Approve</Button>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Processed Leave History */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Processed Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            {processedRequests.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No processed requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-md">Employee</th>
                      <th className="px-4 py-3">Leave Type</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-tr-md">Comment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {processedRequests.map(req => {
                      const datesReq = `${new Date(req.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${req.start_date !== req.end_date ? ` - ${new Date(req.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}`;
                      return (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{req.profiles?.full_name} <br/><span className="text-xs text-gray-500 font-normal">{req.profiles?.email}</span></td>
                        <td className="px-4 py-3">{req.leave_types?.name}</td>
                        <td className="px-4 py-3">{req.total_days} days <br/><span className="text-xs text-gray-400">{datesReq}</span></td>
                        <td className="px-4 py-3">
                          <Badge variant={req.status === 'approved' ? 'success' : 'danger'}>{req.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{req.admin_note || '-'}</td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
