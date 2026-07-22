import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../utils/config';
import { useAuth } from '../context/AuthContext';

export const useCompOffHistory = () => {
  return useQuery({
    queryKey: ['comp_off_history'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/comp-off/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch comp off history");
      return res.json();
    }
  });
};

export const useGrantCompOff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, daysGranted, reason, workedDates }) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/comp-off/grant`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ employeeId, daysGranted, reason, workedDates })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to grant comp off");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comp_off_history'] });
      queryClient.invalidateQueries({ queryKey: ['admin_verified_employees'] }); // To refresh balances in employee dropdown
    }
  });
};

export const useMyCompOffs = () => {
  return useQuery({
    queryKey: ['my_comp_offs'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/leaves/my-comp-offs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch comp offs");
      return res.json();
    }
  });
};

export const useRequestCompOff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ daysRequested, reason, workedDates }) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/leaves/compoff/request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ total_days: daysRequested, reason, workedDates })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to request comp off");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_comp_offs'] });
    }
  });
};
export const usePendingCompOffRequests = () => {
  const { role } = useAuth();
  return useQuery({
    enabled: role === 'admin' || role === 'hr',
    queryKey: ['pending_comp_offs'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/leaves/compoff/requests/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch pending requests");
      return res.json();
    }
  });
};

export const useActionCompOffRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, adminNote }) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/leaves/compoff/requests/${id}/action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status, adminNote })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to process request");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending_comp_offs'] });
      queryClient.invalidateQueries({ queryKey: ['comp_off_history'] });
      queryClient.invalidateQueries({ queryKey: ['admin_verified_employees'] });
    }
  });
};
