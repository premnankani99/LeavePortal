import ConfirmDialog from '../components/ConfirmDialog';
import { useAdminRequests } from '../hooks/useAdminRequests';
import VerificationQueue from '../components/requests/VerificationQueue';
import LeaveApprovalQueue from '../components/requests/LeaveApprovalQueue';
import ProcessedHistory from '../components/requests/ProcessedHistory';

export default function AdminRequests() {
  const {
    loadingReqs,
    loadingVerifications,
    pendingVerifications,
    pendingRequests,
    processedRequests,
    rejectTarget,
    setRejectTarget,
    comments,
    handleVerify,
    handleReject,
    confirmReject,
    handleCommentChange,
    handleAction,
    isVerifying,
    isProcessingRequest
  } = useAdminRequests();

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
        <VerificationQueue 
          pendingVerifications={pendingVerifications}
          loadingVerifications={loadingVerifications}
          onVerify={handleVerify}
          onReject={handleReject}
          isVerifying={isVerifying}
        />

        <LeaveApprovalQueue 
          pendingRequests={pendingRequests}
          loadingReqs={loadingReqs}
          comments={comments}
          onCommentChange={handleCommentChange}
          onAction={handleAction}
          isProcessingRequest={isProcessingRequest}
        />
      </div>

      <ProcessedHistory processedRequests={processedRequests} />
    </div>
  );
}
