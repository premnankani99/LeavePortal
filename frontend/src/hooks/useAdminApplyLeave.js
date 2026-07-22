import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leaveSchema } from '../utils/leaveValidation';
import { calculateMultiDateBreakdown } from '../utils/dateUtils';
import { useLeaveTypes, useAdminCreateRequestOnBehalf } from './useLeaves';
import { useHolidays } from './useHolidays';
import { useToast } from '../context/ToastContext';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../utils/config';

export const useAdminApplyLeave = (onSuccess, employees = []) => {
  const { data: leaveTypes = [], isLoading: loadingTypes } = useLeaveTypes();
  const { holidaysList } = useHolidays();
  const createRequest = useAdminCreateRequestOnBehalf();
  const toast = useToast();
  
  const [leaveBreakdown, setLeaveBreakdown] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  
  // Fetch specific employee leaves and balances
  const { data: employeeData, isLoading: loadingEmployee } = useQuery({
    queryKey: ['employeeDetails', selectedEmployeeId],
    queryFn: async () => {
      if (!selectedEmployeeId) return { leaves: [], available_leaves: 0, profile: null };
      
      const token = localStorage.getItem('token');
      const leavesRes = await fetch(`${API_BASE_URL}/api/leaves/employee/${selectedEmployeeId}`, { headers: { Authorization: `Bearer ${token}` } });
      
      const leaves = leavesRes.ok ? await leavesRes.json() : [];
      const profile = employees.find(emp => emp.id === selectedEmployeeId) || null;
      
      return { 
        leaves, 
        available_leaves: profile?.available_leaves || 0,
        profile 
      };
    },
    enabled: !!selectedEmployeeId && employees.length > 0
  });

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

  const expandedDates = useMemo(() => {
    if (!selectedDates) return [];
    
    const datesArr = Array.isArray(selectedDates) ? selectedDates : [selectedDates];
    if (datesArr.length === 0) return [];
    
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

  useEffect(() => {
    if (isHalfDay && selectedDates && selectedDates.length > 1) {
      setValue('dates', [selectedDates[0]]);
    }
  }, [isHalfDay, selectedDates, setValue]);

  useEffect(() => {
    if (expandedDates && expandedDates.length > 0 && employeeData?.profile) {
      const joinedDate = new Date(employeeData.profile.created_at || new Date());
      const now = new Date();
      const diffYears = now.getFullYear() - joinedDate.getFullYear();
      const diffMonths = now.getMonth() - joinedDate.getMonth();
      const monthsSinceJoining = (diffYears * 12) + diffMonths;

      const inProbation = monthsSinceJoining < 6;
      let availablePaid = (employeeData.available_leaves || 0) + (employeeData.comp_off_leaves || 0);
      
      const breakdown = calculateMultiDateBreakdown(expandedDates, availablePaid, isHalfDay, holidaysList);
      breakdown.inProbation = inProbation;
      breakdown.actualBalance = (employeeData.available_leaves || 0) + (employeeData.comp_off_leaves || 0);
      
      setLeaveBreakdown(breakdown);
    } else {
      setLeaveBreakdown(null);
    }
  }, [expandedDates, selectedTypeId, employeeData, isHalfDay, holidaysList]);

  const onSubmit = (data) => {
    if (!selectedEmployeeId) {
      toast.error("Please select an employee first");
      return;
    }

    const formattedDates = expandedDates.map(d => {
      if (typeof d === 'string') return d;
      if (d && typeof d.format === 'function') return d.format("YYYY-MM-DD");
      if (d instanceof Date) return d.toISOString().split('T')[0];
      return String(d);
    });
    
    // Sort dates
    formattedDates.sort();

    // Synchronously calculate working days to avoid stale state issues
    const syncBreakdown = calculateMultiDateBreakdown(expandedDates, (employeeData?.available_leaves || 0) + (employeeData?.comp_off_leaves || 0), data.is_half_day, holidaysList);

    const requestPayload = {
      employee_id: selectedEmployeeId,
      leave_type_id: data.leave_type_id,
      start_date: formattedDates[0],
      end_date: formattedDates[formattedDates.length - 1],
      total_days: syncBreakdown.totalWorkingDays,
      reason: data.is_half_day ? `[Half-Day: ${data.session}] ${data.reason}` : data.reason,
      is_half_day: data.is_half_day
    };

    createRequest.mutate(requestPayload, {
      onSuccess: () => {
        toast.success('Leave successfully applied on behalf of employee! 🎉');
        reset();
        setSelectedEmployeeId('');
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
    myLeaves: employeeData?.leaves || [],
    available_leaves: employeeData?.available_leaves || 0,
    employeeData,
    selectedEmployeeId,
    setSelectedEmployeeId,
    loadingEmployee
  };
};
