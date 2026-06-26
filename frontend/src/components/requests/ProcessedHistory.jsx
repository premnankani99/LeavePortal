import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const formatTime = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function ProcessedHistory({ processedRequests }) {
  return (
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
                    <th className="px-4 py-3">Timings</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-md">Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {processedRequests.map(req => {
                    const datesReq = `${new Date(req.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${req.start_date !== req.end_date ? ` - ${new Date(req.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}`;
                    
                    const submitDate = formatTime(req.created_at);
                    const approvedDate = formatTime(req.approved_at);
                    const rejectedDate = formatTime(req.rejected_at);
                    const withdrawnDate = formatTime(req.withdrawn_at);
                    
                    return (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {req.profiles?.full_name} <br/>
                          <span className="text-xs text-gray-500 font-normal">{req.profiles?.email}</span>
                        </td>
                        <td className="px-4 py-3">{req.leave_types?.name}</td>
                        <td className="px-4 py-3">
                          {req.total_days} days <br/>
                          <span className="text-xs text-gray-400">{datesReq}</span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-gray-500 min-w-[140px]">
                          <div className="space-y-1">
                            <div><span className="font-semibold">Applied:</span> {submitDate}</div>
                            {approvedDate && <div><span className="font-semibold text-emerald-600">Approved:</span> {approvedDate}</div>}
                            {rejectedDate && <div><span className="font-semibold text-red-600">Rejected:</span> {rejectedDate}</div>}
                            {withdrawnDate && <div><span className="font-semibold text-gray-600">Withdrawn:</span> {withdrawnDate}</div>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'secondary'}>
                            {req.status === 'cancelled' ? 'withdrawn' : req.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{req.admin_note || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
