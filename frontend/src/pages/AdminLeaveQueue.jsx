import { useAdminRequests } from '../hooks/useAdminRequests';
import LeaveApprovalQueue from '../components/requests/LeaveApprovalQueue';
import ProcessedHistory from '../components/requests/ProcessedHistory';

export default function AdminLeaveQueue() {
  const {
    loadingReqs,
    pendingRequests,
    processedRequests,
    comments,
    handleCommentChange,
    handleAction,
    isProcessingRequest
  } = useAdminRequests();

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col space-y-6 font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex-1 grid grid-cols-1 gap-6">
        <LeaveApprovalQueue 
          pendingRequests={pendingRequests}
          loadingReqs={loadingReqs}
          comments={comments}
          onCommentChange={handleCommentChange}
          onAction={handleAction}
          isProcessingRequest={isProcessingRequest}
        />
      </div>

      <div className="flex-1 grid grid-cols-1 gap-6">
        <ProcessedHistory processedRequests={processedRequests} />
      </div>
    </div>
  );
}
