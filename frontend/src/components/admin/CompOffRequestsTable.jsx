import { useState } from 'react';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';
import { usePendingCompOffRequests, useActionCompOffRequest } from '../../hooks/useCompOff';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export default function CompOffRequestsTable() {
  const { data: pendingRequests = [], isLoading } = usePendingCompOffRequests();
  const { mutate: actionRequest, isPending } = useActionCompOffRequest();
  const toast = useToast();
  
  const [comments, setComments] = useState({});

  const handleCommentChange = (id, value) => {
    setComments(prev => ({ ...prev, [id]: value }));
  };

  const handleAction = (id, status) => {
    const adminNote = comments[id] || '';
    
    if (status === 'rejected' && !adminNote.trim()) {
      toast.error("Please provide a reason (comment) before rejecting the request.");
      return;
    }

    actionRequest({ id, status, adminNote }, {
      onSuccess: () => {
        toast.success(`Comp-Off request ${status} successfully!`);
        setComments(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      }
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border-purple-100 border-t-4 border-t-[#7e57c2]">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
            Pending Requests <span className="ml-3 bg-purple-100 text-[#7e57c2] px-2.5 py-0.5 rounded-full text-xs">...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="animate-spin text-[#7e57c2] w-8 h-8" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border-purple-100 border-t-4 border-t-[#7e57c2]">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
          Pending Comp-Off Requests
          <span className="ml-3 bg-purple-100 text-[#7e57c2] px-2.5 py-0.5 rounded-full text-xs">
            {pendingRequests.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingRequests.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-gray-100 rounded-xl">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium text-lg">No pending requests</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(req => (
              <div key={req.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col md:flex-row gap-4 justify-between items-start">
                <div className="flex-1 w-full space-y-3">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-[#7e57c2] font-bold text-xs">
                          {(req.employee?.full_name || req.employee?.email)?.charAt(0).toUpperCase()}
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg">{req.employee?.full_name || req.employee?.email}</h4>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                        <span className="font-semibold text-gray-700">Days Requested:</span> 
                        <span className="bg-purple-50 text-[#7e57c2] px-2 py-0.5 rounded-md font-bold">{req.daysGranted}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-semibold text-gray-700">Worked Dates:</span> {req.workedDates && Array.isArray(req.workedDates) ? req.workedDates.map(d => new Date(d).toDateString()).join(', ') : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-semibold text-gray-700">Reason:</span> {req.reason}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Requested on {new Date(req.createdAt || req.grantedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="w-full">
                    <input 
                      type="text" 
                      placeholder="Admin Comment (Optional, required for rejection)" 
                      value={comments[req.id] || ''}
                      onChange={(e) => handleCommentChange(req.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7e57c2] outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto md:flex-col shrink-0 self-stretch md:self-auto justify-end pt-2 md:pt-0">
                  <Button 
                    onClick={() => handleAction(req.id, 'approved')} 
                    disabled={isPending}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </Button>
                  <Button 
                    onClick={() => handleAction(req.id, 'rejected')} 
                    disabled={isPending}
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
