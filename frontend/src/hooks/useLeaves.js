import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/config';

// Hardcoded Leave Types since we removed the table
export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ['leave_types'],
    queryFn: async () => {
      return [
        { id: 'Sick Leave', name: 'Sick Leave', color_code: 'red' },
        { id: 'Casual Leave', name: 'Casual Leave', color_code: 'blue' },
        { id: 'Earned Leave', name: 'Earned Leave', color_code: 'green' }
      ];
    }
  });
};

export const useMyBalances = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['leave_balances', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Mocked for now, as we moved logic to Prisma profiles
      return [];
    },
    enabled: !!user
  });
};

// Hooks for Leave Requests
export const useMyRequests = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['leave_requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`${API_BASE_URL}/api/leaves/my-leaves/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch leaves");
      const data = await res.json();
      // Map to frontend structure
      return data.map(req => ({
        ...req,
        leave_types: { name: req.leave_type }
      }));
    },
    enabled: !!user
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (requestData) => {
      const res = await fetch(`${API_BASE_URL}/api/leaves/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requestData,
          employee_id: user.id,
          leave_type: requestData.leave_type_id || 'Casual Leave'
        })
      });
      if (!res.ok) throw new Error("Failed to apply leave");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave_requests', user?.id] });
    }
  });
};

export const useWithdrawRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ requestId, datesToWithdraw }) => {
      const res = await fetch(`${API_BASE_URL}/api/leaves/withdraw/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datesToWithdraw })
      });
      if (!res.ok) throw new Error("Failed to withdraw");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave_requests', user?.id] });
    }
  });
};

// ==========================================
// ADMIN HOOKS
// ==========================================

export const useAllRequests = () => {
  return useQuery({
    queryKey: ['admin_all_requests'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/leaves/all`);
      if (!res.ok) throw new Error("Failed to fetch all leaves");
      const data = await res.json();
      return data.map(req => ({
        ...req,
        profiles: req.employee || { full_name: 'Unknown', email: 'N/A' },
        leave_types: { name: req.leave_type }
      }));
    }
  });
};

export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, newStatus, adminNote }) => {
      const res = await fetch(`${API_BASE_URL}/api/leaves/status/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNote })
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_all_requests'] });
    }
  });
};

// Admin Verification
export const usePendingVerifications = () => {
  return useQuery({
    queryKey: ['admin_pending_verifications'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin/pending`);
      if (!res.ok) throw new Error("Failed to fetch pending verifications");
      return res.json();
    }
  });
};

export const useVerifiedEmployees = () => {
  return useQuery({
    queryKey: ['admin_verified_employees'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/admin/verified`);
      if (!res.ok) throw new Error("Failed to fetch verified employees");
      return res.json();
    }
  });
};

export const useUpdateVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status }) => {
      const backendStatus = status === 'verified' ? 'approved' : 'rejected';
      const res = await fetch(`${API_BASE_URL}/api/admin/verify/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: backendStatus })
      });
      if (!res.ok) throw new Error("Failed to update verification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_pending_verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin_verified_employees'] });
    }
  });
};
