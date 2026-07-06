import React from 'react';
import { useAllRequests } from '../../hooks/useLeaves';
import ProcessedHistory from '../../components/requests/ProcessedHistory';
import { Loader2 } from 'lucide-react';

export default function HRLeaveHistory() {
  const { data: allRequests = [], isLoading } = useAllRequests();
  const filteredRequests = allRequests.filter(req => 
    req.status !== 'withdrawn' && 
    req.status !== 'cancelled' && 
    req.status !== 'withdrawal_requested'
  );

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col space-y-6 font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex-1 grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[#7e57c2] w-8 h-8" />
          </div>
        ) : (
          <ProcessedHistory processedRequests={filteredRequests} />
        )}
      </div>
    </div>
  );
}
