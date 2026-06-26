import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leaveSchema } from '../utils/leaveValidation';
import { calculateMultiDateBreakdown } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';
import { useLeaveTypes, useCreateRequest, useMyRequests } from './useLeaves';
import { useToast } from '../context/ToastContext';

export const useLeaveForm = (onSuccess) => {
  const { profile } = useAuth();
  const { data: leaveTypes = [], isLoading: loadingTypes } = useLeaveTypes();
  const { data: myLeaves = [] } = useMyRequests();
  const createRequest = useCreateRequest();
  const toast = useToast();
  
  const [leaveBreakdown, setLeaveBreakdown] = useState(null);
  
  const formState = useForm({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leave_type_id: '',
      dates: [],
      reason: '',
      emergency_contact: '',
      is_half_day: false,
      is_compensatory: false,
      session: ''
    }
  });

  const { watch, setValue, reset } = formState;

  const selectedDates = watch('dates');
  const selectedTypeId = watch('leave_type_id');
  const isHalfDay = watch('is_half_day');
  const isCompensatory = watch('is_compensatory');
  const selectedSession = watch('session');

  const allowedTypes = leaveTypes.filter(t => t.name.includes('Casual') || t.name.includes('Sick'));

  // If switched to Half Day, enforce single date selection
  useEffect(() => {
    if (isHalfDay && selectedDates && selectedDates.length > 1) {
      setValue('dates', [selectedDates[0]]);
    }
  }, [isHalfDay, selectedDates, setValue]);

  useEffect(() => {
    if (selectedDates && selectedDates.length > 0) {
      // Calculate probation and available paid leaves
      const joinedDate = new Date(profile?.created_at || new Date());
      const now = new Date();
      const diffYears = now.getFullYear() - joinedDate.getFullYear();
      const diffMonths = now.getMonth() - joinedDate.getMonth();
      const monthsSinceJoining = (diffYears * 12) + diffMonths;

      let availablePaid = 0;
      if (monthsSinceJoining >= 6) {
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let daysTakenThisMonth = 0;
        myLeaves.forEach(req => {
          if (req.status === 'rejected' || req.status === 'cancelled') return;
          const reqStart = new Date(req.start_date);
          if (reqStart.getMonth() === currentMonth && reqStart.getFullYear() === currentYear) {
            daysTakenThisMonth += req.total_days || 0;
          }
        });
        
        availablePaid = Math.max(0, 1 - daysTakenThisMonth);
      }
      
      const breakdown = calculateMultiDateBreakdown(selectedDates, availablePaid, isHalfDay, isCompensatory);
      
      // Also add probation warning to breakdown
      breakdown.inProbation = monthsSinceJoining < 6;
      setLeaveBreakdown(breakdown);
    } else {
      setLeaveBreakdown(null);
    }
  }, [selectedDates, selectedTypeId, myLeaves, profile, isHalfDay, isCompensatory]);

  const onSubmit = (data) => {
    const formattedDates = data.dates.map(d => {
      if (typeof d === 'string') return d;
      if (d && typeof d.format === 'function') return d.format("YYYY-MM-DD");
      if (d instanceof Date) return d.toISOString().split('T')[0];
      return String(d);
    });
    
    // Sort dates
    formattedDates.sort();

    const requestPayload = {
      leave_type_id: data.leave_type_id,
      start_date: formattedDates[0],
      end_date: formattedDates[formattedDates.length - 1],
      total_days: leaveBreakdown ? leaveBreakdown.totalWorkingDays : formattedDates.length,
      reason: data.is_half_day ? `[Half-Day: ${data.session}] ${data.reason}` : data.reason,
      is_half_day: data.is_half_day,
      is_compensatory: data.is_compensatory
    };

    createRequest.mutate(requestPayload, {
      onSuccess: () => {
        toast.success('Leave application submitted successfully! 🎉');
        reset();
        setLeaveBreakdown(null);
        if (onSuccess) onSuccess();
      },
      onError: (err) => {
        toast.error('Error submitting request: ' + err.message);
      }
    });
  };

  return {
    formState,
    loadingTypes,
    allowedTypes,
    leaveBreakdown,
    onSubmit,
    isSubmitting: createRequest.isPending,
    isHalfDay,
    selectedSession
  };
};
