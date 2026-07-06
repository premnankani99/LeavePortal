import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leaveSchema } from '../utils/leaveValidation';
import { calculateMultiDateBreakdown } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';
import { useLeaveTypes, useCreateRequest, useMyRequests, useMyBalances } from './useLeaves';
import { useHolidays } from './useHolidays';
import { useToast } from '../context/ToastContext';

export const useLeaveForm = (onSuccess) => {
  const { user } = useAuth();
  const { data: leaveTypes = [], isLoading: loadingTypes } = useLeaveTypes();
  const { data: myLeaves = [] } = useMyRequests();
  const { data: available_leaves = 0 } = useMyBalances();
  const { holidaysList } = useHolidays();
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
      session: ''
    }
  });

  const { watch, setValue, reset } = formState;

  const selectedDates = watch('dates');
  const selectedTypeId = watch('leave_type_id');
  const isHalfDay = watch('is_half_day');
  const selectedSession = watch('session');

  const allowedTypes = leaveTypes.filter(t => t.name.includes('Casual') || t.name.includes('Sick'));

  // Expand range dates
  const expandedDates = useMemo(() => {
    if (!selectedDates) return [];
    
    const datesArr = Array.isArray(selectedDates) ? selectedDates : [selectedDates];
    if (datesArr.length === 0) return [];
    
    // If only one date is selected, it acts as both start and end date
    if (isHalfDay || datesArr.length === 1) {
      return [...datesArr];
    }
    
    const start = datesArr[0];
    const end = datesArr[1];
    
    const getJsDate = (d) => {
      if (!d) return null;
      if (d instanceof Date) return d;
      if (typeof d === 'string') return new Date(d);
      if (d && typeof d.format === 'function') return new Date(d.format("YYYY-MM-DD"));
      return new Date(`${d.year}-${String(d.month.number).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`);
    };
    
    const startDate = getJsDate(start);
    const endDate = getJsDate(end) || new Date(startDate);
    
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }, [selectedDates, isHalfDay]);

  // If switched to Half Day, enforce single date selection
  useEffect(() => {
    if (isHalfDay && selectedDates && selectedDates.length > 1) {
      setValue('dates', [selectedDates[0]]);
    }
  }, [isHalfDay, selectedDates, setValue]);

  useEffect(() => {
    if (expandedDates && expandedDates.length > 0) {
      // Calculate probation and available paid leaves
      const joinedDate = new Date(user?.created_at || new Date());
      const now = new Date();
      const diffYears = now.getFullYear() - joinedDate.getFullYear();
      const diffMonths = now.getMonth() - joinedDate.getMonth();
      const monthsSinceJoining = (diffYears * 12) + diffMonths;

      const inProbation = monthsSinceJoining < 6;
      let availablePaid = available_leaves || 0;
      
      const breakdown = calculateMultiDateBreakdown(expandedDates, availablePaid, isHalfDay, holidaysList);
      
      // Also add probation warning to breakdown
      breakdown.inProbation = inProbation;
      // Add actual balance for messaging
      breakdown.actualBalance = available_leaves || 0;
      
      setLeaveBreakdown(breakdown);
    } else {
      setLeaveBreakdown(null);
    }
  }, [expandedDates, selectedTypeId, myLeaves, user, isHalfDay, available_leaves, holidaysList]);

  const onSubmit = (data) => {
    const formattedDates = expandedDates.map(d => {
      if (typeof d === 'string') return d;
      if (d && typeof d.format === 'function') return d.format("YYYY-MM-DD");
      if (d instanceof Date) return d.toISOString().split('T')[0];
      return String(d);
    });
    
    // Sort dates
    formattedDates.sort();

    // Synchronously calculate working days to avoid stale state issues
    const syncBreakdown = calculateMultiDateBreakdown(expandedDates, available_leaves || 0, data.is_half_day, holidaysList);

    const requestPayload = {
      leave_type_id: data.leave_type_id,
      start_date: formattedDates[0],
      end_date: formattedDates[formattedDates.length - 1],
      total_days: syncBreakdown.totalWorkingDays,
      reason: data.is_half_day ? `[Half-Day: ${data.session}] ${data.reason}` : data.reason,
      is_half_day: data.is_half_day
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
    selectedSession,
    myLeaves,
    available_leaves
  };
};
