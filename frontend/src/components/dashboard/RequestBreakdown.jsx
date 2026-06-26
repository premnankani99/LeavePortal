import { Activity } from 'lucide-react';

export default function RequestBreakdown({ allRequests, approvedRequests, pendingRequests, rejectedRequests }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-[400px] flex flex-col">
      <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
        <Activity className="w-4 h-4 text-[#7e57c2]" /> Request Breakdown
      </h3>
      <p className="text-xs text-gray-400 mb-6">All-time status distribution</p>
      
      <div className="flex-1 flex flex-col justify-center">
        {allRequests.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No requests yet</div>
        ) : (
          <div className="space-y-4">
            {[
              { label: 'Approved', count: approvedRequests.length, cls: 'bg-emerald-500' },
              { label: 'Pending', count: pendingRequests.length, cls: 'bg-amber-400' },
              { label: 'Rejected', count: rejectedRequests.length, cls: 'bg-red-500' },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600 font-medium">{s.label}</span>
                  <span className="font-bold text-gray-800">{s.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${s.cls}`} 
                    style={{ width: `${allRequests.length > 0 ? (s.count / allRequests.length) * 100 : 0}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {allRequests.length > 0 && (
        <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-3 text-center shrink-0">
          {[
            { label: 'Total', val: allRequests.length },
            { label: 'Approval %', val: allRequests.length > 0 ? `${Math.round((approvedRequests.length / allRequests.length) * 100)}%` : '0%' },
            { label: 'Open', val: pendingRequests.length },
          ].map(m => (
            <div key={m.label}>
              <p className="text-xl font-bold text-gray-900">{m.val}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
