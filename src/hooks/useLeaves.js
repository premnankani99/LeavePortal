import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Hooks for Leave Types
export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ['leave_types'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leave_types').select('*');
      if (error) throw error;
      return data;
    }
  });
};

// Hooks for Balances
export const useMyBalances = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['leave_balances', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('leave_balances')
        .select(`
          *,
          leave_types (
            name,
            color_code
          )
        `)
        .eq('employee_id', user.id)
        .eq('year', new Date().getFullYear());
      
      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          leave_types ( name )
        `)
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newRequest) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert([{
          ...newRequest,
          employee_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave_requests', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['leave_balances', user?.id] });
    }
  });
};

export const useWithdrawRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (requestId) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .eq('employee_id', user.id) // Security check
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave_requests', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['leave_balances', user?.id] });
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
      // Fetch all requests
      const { data: requests, error: reqError } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (reqError) throw reqError;

      if (!requests || requests.length === 0) return [];

      // Fetch all profiles to map employee details
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name, email');
      if (profError) throw profError;

      // Fetch all leave types
      const { data: types, error: typeError } = await supabase
        .from('leave_types')
        .select('id, name');
      if (typeError) throw typeError;

      // Merge data in JavaScript to completely avoid Supabase ambiguous foreign key errors
      return requests.map(req => ({
        ...req,
        profiles: profiles.find(p => p.id === req.employee_id) || { full_name: 'Unknown', email: 'N/A' },
        leave_types: types.find(t => t.id === req.leave_type_id) || { name: 'Leave' }
      }));
    }
  });
};

export const usePendingVerifications = () => {
  return useQuery({
    queryKey: ['admin_pending_verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('verification_status', 'pending');
      if (error) throw error;
      console.log("Pending verifications fetched:", data);
      return data;
    }
  });
};

export const useVerifiedEmployees = () => {
  return useQuery({
    queryKey: ['admin_verified_employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('verification_status', 'verified')
        .neq('role', 'admin'); // Exclude admin accounts
      if (error) throw error;
      return data;
    }
  });
};

export const useUpdateVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ verification_status: status, is_active: status === 'verified' })
        .eq('id', userId)
        .select();
      if (error) throw error;
      
      // Also log audit action
      await supabase.from('audit_logs').insert([{
        action: status === 'verified' ? 'USER_VERIFIED' : 'USER_REJECTED',
        target_table: 'profiles',
        target_id: userId
      }]);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_pending_verifications'] });
    }
  });
};

export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ requestId, newStatus, adminNote }) => {
      // Update the request
      const { data, error } = await supabase
        .from('leave_requests')
        .update({ 
          status: newStatus, 
          admin_note: adminNote,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;

      // Add a comment if note exists
      if (adminNote) {
        await supabase.from('request_comments').insert([{
          leave_request_id: requestId,
          author_id: user.id,
          comment_text: adminNote,
          comment_type: newStatus === 'rejected' ? 'rejection_reason' : 'condition'
        }]);
      }

      // Log audit
      await supabase.from('audit_logs').insert([{
        actor_id: user.id,
        action: newStatus === 'rejected' ? 'LEAVE_REJECTED' : 'LEAVE_APPROVED',
        target_table: 'leave_requests',
        target_id: requestId
      }]);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_all_requests'] });
    }
  });
};
