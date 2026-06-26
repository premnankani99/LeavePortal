import { useState, useMemo } from 'react';
import { useMyRequests, useLeaveTypes, useWithdrawRequest } from './useLeaves';
import { useToast } from '../context/ToastContext';

export const useEmployeeLeaves = () => {
  const { data: myLeaves = [], isLoading: loadingLeaves } = useMyRequests();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const withdrawMutation = useWithdrawRequest();
  const toast = useToast();
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [withdrawTarget, setWithdrawTarget] = useState(null);

  const handleWithdraw = (datesToWithdraw = []) => {
    if (withdrawTarget) {
      withdrawMutation.mutate({ requestId: withdrawTarget.id, datesToWithdraw }, {
        onSuccess: () => {
          toast.success("Leave withdrawal processed successfully.");
          setWithdrawTarget(null);
        },
        onError: (err) => {
          toast.error("Failed to withdraw request: " + err.message);
        }
      });
    }
  };

  const filteredLeaves = useMemo(() => {
    return myLeaves.filter(req => {
      const matchStatus = statusFilter === 'All' || req.status === statusFilter.toLowerCase();
      const matchType = typeFilter === 'All' || req.leave_types?.name === typeFilter;
      return matchStatus && matchType;
    });
  }, [myLeaves, statusFilter, typeFilter]);

  return {
    loadingLeaves,
    leaveTypes,
    withdrawMutation,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    withdrawTarget,
    setWithdrawTarget,
    handleWithdraw,
    filteredLeaves
  };
};
