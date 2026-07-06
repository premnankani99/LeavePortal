import React from 'react';
import { useCompOffHistory } from '../../hooks/useCompOff';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Loader2, History } from 'lucide-react';

export default function CompOffHistoryTable() {
  const { data: history, isLoading } = useCompOffHistory();

  return (
    <Card className="border-t-4 border-t-[#7e57c2] shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#7e57c2]" />
          <CardTitle className="text-gray-800 text-lg">Grant History</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-0 flex-1 overflow-auto max-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : history?.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No comp-off grants history found.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 sticky top-0 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Days</th>
                <th className="px-4 py-3 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history?.map((grant) => (
                <tr key={grant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{grant.employee.full_name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]" title={grant.reason}>{grant.reason}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      +{grant.daysGranted}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {new Date(grant.updatedAt || grant.grantedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
