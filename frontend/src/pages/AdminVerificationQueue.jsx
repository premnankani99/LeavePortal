import ConfirmDialog from '../components/ConfirmDialog';
import { useAdminRequests } from '../hooks/useAdminRequests';
import VerificationQueue from '../components/requests/VerificationQueue';

export default function AdminVerificationQueue() {
  const {
    loadingVerifications,
    pendingVerifications,
    rejectTarget,
    setRejectTarget,
    handleVerify,
    handleReject,
    confirmReject,
    isVerifying
  } = useAdminRequests();

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ConfirmDialog
        isOpen={!!rejectTarget}
        title="Reject Employee?"
        message={`Are you sure you want to reject "${rejectTarget?.name || 'this user'}"? They will not be able to access the portal.`}
        confirmLabel="Yes, Reject"
        onConfirm={confirmReject}
        onCancel={() => setRejectTarget(null)}
      />

      <div className="flex-1 w-full flex flex-col">
        <VerificationQueue 
          pendingVerifications={pendingVerifications}
          loadingVerifications={loadingVerifications}
          onVerify={handleVerify}
          onReject={handleReject}
          isVerifying={isVerifying}
        />
      </div>
    </div>
  );
}
