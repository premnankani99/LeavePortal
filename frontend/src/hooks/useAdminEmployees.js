import { useState, useMemo } from 'react';
import { useVerifiedEmployees } from './useLeaves';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../utils/config';
import { useAuth } from '../context/AuthContext';

export const useAdminEmployees = () => {
  const { data: verifiedEmployees = [], isLoading } = useVerifiedEmployees();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const filteredEmployees = useMemo(() => {
    return verifiedEmployees.filter(e => {
      const matchesSearch = (e.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
                            (e.email || '').toLowerCase().includes(search.toLowerCase());
      const matchesDept = department === 'All' || e.designation === department;
      return matchesSearch && matchesDept;
    });
  }, [verifiedEmployees, search, department]);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE_URL}/api/admin/employee/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete employee');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['verified_employees']);
      queryClient.invalidateQueries(['admin_dashboard_stats']);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`${API_BASE_URL}/api/admin/employee/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update employee');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['verified_employees']);
    }
  });

  return {
    filteredEmployees,
    isLoading,
    search,
    setSearch,
    department,
    setDepartment,
    deleteEmployee: deleteMutation.mutate,
    isDeleting: deleteMutation.isLoading,
    updateEmployee: updateMutation.mutateAsync,
    isUpdating: updateMutation.isLoading
  };
};
