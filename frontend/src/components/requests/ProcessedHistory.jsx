import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Eye } from 'lucide-react';
import LeaveDetailsModal from './LeaveDetailsModal';
import { formatActiveDateRanges } from '../../utils/dateUtils';

const formatTime = (dateString) => {
    console.log("[Frontend Component] Rendering formatTime in ProcessedHistory.jsx");
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function ProcessedHistory({ processedRequests }) {
  const [selectedRequest, setSelectedRequest] = useState(null);

  return (
    <div className="mt-8 relative">
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
              <table className="w-full text-base text-left">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide text-center">Employee</th>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide text-center">Leave Type</th>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide text-center">Dates</th>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide text-center">Timings</th>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide text-center">Status</th>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {processedRequests.map(req => {
                    const datesReq = formatActiveDateRanges(req.start_date, req.end_date, req.withdrawn_dates);
                    
                    const submitDate = formatTime(req.created_at);
                    const approvedDate = formatTime(req.approved_at);
                    const rejectedDate = formatTime(req.rejected_at);
                    const withdrawnDate = formatTime(req.withdrawn_at);
                    
                    return (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-medium text-gray-900">
                          {req.profiles?.full_name} <br/>
                          <span className="text-sm text-gray-500 font-normal">{req.profiles?.email}</span>
                        </td>
                        <td className="px-5 py-4">{req.leave_types?.name}</td>
                        <td className="px-5 py-4">
                          {req.total_days} days <br/>
                          <span className="text-sm text-gray-500">{datesReq}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 min-w-[200px] whitespace-nowrap">
                          <div className="space-y-1.5 bg-gray-50/50 p-2 rounded border border-gray-100">
                            <div><span className="font-semibold text-gray-700">Applied:</span> {submitDate}</div>
                            {approvedDate && <div><span className="font-semibold text-emerald-600">Approved:</span> {approvedDate}</div>}
                            {rejectedDate && <div><span className="font-semibold text-red-600">Rejected:</span> {rejectedDate}</div>}
                            {withdrawnDate && <div><span className="font-semibold text-gray-600">Withdrawn:</span> {withdrawnDate}</div>}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Badge className="capitalize" variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : req.status === 'cancelled' ? 'black' : 'secondary'}>
                            {req.status === 'cancelled' ? 'withdrawn' : req.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button 
                            onClick={() => setSelectedRequest(req)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#7e57c2] bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-100"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedRequest && (
        <LeaveDetailsModal 
          request={selectedRequest} 
          onClose={() => setSelectedRequest(null)} 
        />
      )}
    </div>
  );
}
