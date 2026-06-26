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
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/leaves/my-leaves`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch leaves");
      const data = await res.json();
      // Map to frontend structure
      return data.map(req => ({
        ...req,
        leave_types: { name: req.leave_type }
      }));
    },
    enabled: !!user,
    refetchInterval: 5000
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (requestData) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/leaves/apply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      queryClient.invalidateQueries({ queryKey: ['admin_all_requests'] });
    }
  });
};

export const useWithdrawRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ requestId, datesToWithdraw }) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/leaves/withdraw/${requestId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ datesToWithdraw })
      });
      if (!res.ok) throw new Error("Failed to withdraw");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave_requests', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin_all_requests'] });
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/leaves/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch all leaves");
      const data = await res.json();
      return data.map(req => ({
        ...req,
        profiles: req.employee || { full_name: 'Unknown', email: 'N/A' },
        leave_types: { name: req.leave_type }
      }));
    },
    refetchInterval: 5000
  });
};

export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, newStatus, adminNote }) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/leaves/status/${requestId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch pending verifications");
      return res.json();
    },
    refetchInterval: 5000
  });
};

export const useVerifiedEmployees = () => {
  return useQuery({
    queryKey: ['admin_verified_employees'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/verified`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch verified employees");
      return res.json();
    },
    refetchInterval: 5000
  });
};

export const useUpdateVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status }) => {
      const token = localStorage.getItem('token');
      const backendStatus = status === 'verified' ? 'approved' : 'rejected';
      const res = await fetch(`${API_BASE_URL}/api/admin/verification/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
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
