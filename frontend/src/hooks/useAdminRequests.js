import { useState, useMemo } from 'react';
import { useAllRequests, usePendingVerifications, useUpdateVerification, useUpdateRequestStatus } from './useLeaves';
import { useToast } from '../context/ToastContext';

export const useAdminRequests = () => {
    console.log("[Frontend Component] Rendering useAdminRequests in useAdminRequests.js");
  const { data: allRequests = [], isLoading: loadingReqs } = useAllRequests();
  const { data: pendingVerifications = [], isLoading: loadingVerifications } = usePendingVerifications();
  const verifyMutation = useUpdateVerification();
  const requestMutation = useUpdateRequestStatus();
  const toast = useToast();

  const [rejectTarget, setRejectTarget] = useState(null);
  const [comments, setComments] = useState({});

  const handleVerify = (userId) => {
    console.log("[Frontend Component] Rendering handleVerify in useAdminRequests.js");
    verifyMutation.mutate({ userId, status: 'verified' }, {
      onSuccess: () => toast.success("Employee verified successfully!"),
      onError: (err) => toast.error("Failed to verify employee: " + err.message)
    });
  };

  const handleReject = (userId, name) => {
    console.log("[Frontend Component] Rendering handleReject in useAdminRequests.js");
    setRejectTarget({ id: userId, name });
  };

  const confirmReject = () => {
    console.log("[Frontend Component] Rendering confirmReject in useAdminRequests.js");
    if (rejectTarget) {
      verifyMutation.mutate({ userId: rejectTarget.id, status: 'rejected' }, {
        onSuccess: () => toast.success("Employee rejected."),
        onError: (err) => toast.error("Failed to reject employee: " + err.message)
      });
      setRejectTarget(null);
    }
  };

  const handleCommentChange = (id, value) => {
    console.log("[Frontend Component] Rendering handleCommentChange in useAdminRequests.js");
    setComments(prev => ({ ...prev, [id]: value }));
  };

  const handleAction = (requestId, newStatus) => {
    console.log("[Frontend Component] Rendering handleAction in useAdminRequests.js");
    const adminNote = comments[requestId] || '';
    
    if (newStatus === 'rejected' && !adminNote.trim()) {
      toast.error("Please provide a reason (comment) before rejecting the leave.");
      return false;
    }

    requestMutation.mutate({ requestId, newStatus, adminNote }, {
      onSuccess: () => {
        toast.success(`Leave request ${newStatus} successfully!`);
        setComments(prev => {
          const updated = { ...prev };
          delete updated[requestId];
          return updated;
        });
      },
      onError: (err) => toast.error("Failed to process request: " + err.message)
    });
    
    return true;
  };

  const pendingRequests = useMemo(() => allRequests.filter(r => r.status === 'pending' || r.status === 'withdrawal_requested'), [allRequests]);
  const processedRequests = useMemo(() => allRequests.filter(r => r.status !== 'pending' && r.status !== 'withdrawal_requested' && r.status !== 'cancelled'), [allRequests]);

  return {
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
    isVerifying: verifyMutation.isPending,
    isProcessingRequest: requestMutation.isPending
  };
};
