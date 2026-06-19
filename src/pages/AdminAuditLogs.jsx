import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export default function AdminAuditLogs() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin_audit_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          profiles (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  const getActionColor = (action) => {
    if (action.includes('APPROVED') || action.includes('VERIFIED')) return 'success';
    if (action.includes('REJECTED')) return 'danger';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Audit Logs</h2>
        <p className="text-gray-500 mt-1">Immutable record of all admin actions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 50 actions)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Admin</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Target Table</th>
                    <th className="px-4 py-3">Target ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {log.profiles?.full_name || 'System / Auto'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getActionColor(log.action)}>{log.action}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{log.target_table}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs truncate max-w-[150px]" title={log.target_id}>
                        {log.target_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
