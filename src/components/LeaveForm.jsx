import { useState, useEffect } from 'react';
import DatePickerDefault from "react-multi-date-picker";
const DatePicker = DatePickerDefault.default || DatePickerDefault;
import { calculateMultiDateBreakdown, COMPANY_HOLIDAYS, HOLIDAY_NAMES } from '../utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FileUp, Info, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLeaveTypes, useCreateRequest, useMyBalances } from '../hooks/useLeaves';
import { useToast } from '../context/ToastContext';

const schema = z.object({
  leave_type_id: z.string().min(1, "Please select a leave type"),
  dates: z.array(z.any()).min(1, "Please select at least one date"),
  reason: z.string().min(5, "Reason must be at least 5 characters long"),
  emergency_contact: z.string().optional(),
  is_half_day: z.boolean().optional(),
  is_compensatory: z.boolean().optional()
});

export default function LeaveForm({ onSuccess }) {
  const { data: leaveTypes = [], isLoading: loadingTypes } = useLeaveTypes();
  const { data: balances = [] } = useMyBalances();
  const createRequest = useCreateRequest();
  const toast = useToast();
  
  const [leaveBreakdown, setLeaveBreakdown] = useState(null);
  
  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      leave_type_id: '',
      dates: [],
      reason: '',
      emergency_contact: '',
      is_half_day: false,
      is_compensatory: false
    }
  });

  const selectedDates = watch('dates');
  const selectedTypeId = watch('leave_type_id');
  const isHalfDay = watch('is_half_day');
  const isCompensatory = watch('is_compensatory');

  useEffect(() => {
    if (selectedDates && selectedDates.length > 0) {
      // Find balance for selected type
      const balanceRec = balances.find(b => b.leave_type_id === selectedTypeId);
      const availablePaid = balanceRec ? balanceRec.available : 0;
      
      const breakdown = calculateMultiDateBreakdown(selectedDates, availablePaid, isHalfDay, isCompensatory);
      setLeaveBreakdown(breakdown);
    } else {
      setLeaveBreakdown(null);
    }
  }, [selectedDates, selectedTypeId, balances, isHalfDay, isCompensatory]);

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
      reason: data.reason,
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

  if (loadingTypes) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-[#9b72e5]" /></div>;

  return (
    <Card className="w-full bg-white shadow-sm border-blue-100 border-t-4 border-t-[#7e57c2]">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-800">Apply for Leave</CardTitle>
        <p className="text-sm text-gray-500 mt-1">Please fill in your details and select the dates.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-sans">
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Leave Type</label>
            <Controller
              name="leave_type_id"
              control={control}
              render={({ field }) => (
                <select 
                  {...field}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:border-[#7e57c2] focus:ring-[#7e57c2] text-sm"
                >
                  <option value="">Select a leave type...</option>
                  {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
            />
            {errors.leave_type_id && <p className="text-xs text-red-500">{errors.leave_type_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Dates</label>
            <Controller
              name="dates"
              control={control}
              render={({ field }) => (
                <DatePicker 
                  multiple 
                  value={field.value} 
                  onChange={field.onChange} 
                  format="YYYY-MM-DD"
                  minDate={new Date()}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '14px' }}
                  calendarPosition="bottom-left"
                  fixMainPosition
                  mapDays={({ date }) => {
                    const dateStr = `${date.year}-${String(date.month.number).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
                    const jsDate = new Date(dateStr);
                    const dayOfWeek = jsDate.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const isHoliday = COMPANY_HOLIDAYS.includes(dateStr);

                    if (isWeekend) {
                      return {
                        disabled: true,
                        style: { color: '#d1d5db', backgroundColor: '#f9fafb', cursor: 'not-allowed' },
                        title: dayOfWeek === 6 ? 'Saturday – Weekend' : 'Sunday – Weekend'
                      };
                    }
                    if (isHoliday) {
                      return {
                        disabled: true,
                        style: { color: '#f97316', backgroundColor: '#fff7ed', cursor: 'not-allowed', fontWeight: '600' },
                        title: HOLIDAY_NAMES[dateStr] || 'Public Holiday'
                      };
                    }
                  }}
                />
              )}
            />
            {errors.dates && <p className="text-xs text-red-500">{errors.dates.message}</p>}
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <Controller
                name="is_half_day"
                control={control}
                render={({ field }) => (
                  <input 
                    type="checkbox" 
                    className="rounded text-[#7e57c2] focus:ring-[#7e57c2]" 
                    checked={field.value} 
                    onChange={field.onChange} 
                  />
                )}
              />
              <span className="text-sm font-medium text-gray-700">Is this a Half Day?</span>
            </label>

            {isHalfDay && (
              <label className="flex items-center space-x-2 cursor-pointer pl-6">
                <Controller
                  name="is_compensatory"
                  control={control}
                  render={({ field }) => (
                    <input 
                      type="checkbox" 
                      className="rounded text-green-500 focus:ring-green-500" 
                      checked={field.value} 
                      onChange={field.onChange} 
                    />
                  )}
                />
                <span className="text-sm font-medium text-gray-600">I will compensate these hours during the week (No salary/leave cut)</span>
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <textarea 
                  {...field}
                  placeholder="Please specify detailed reason..."
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm focus:border-[#7e57c2] focus:ring-[#7e57c2]" rows="3"
                />
              )}
            />
            {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
          </div>

          {leaveBreakdown && (
            <div className="bg-[#f3f0fc] border border-[#d6c7f8] rounded-md p-4 mt-2">
              <div className="flex">
                <Info className="h-5 w-5 text-[#7e57c2] mr-2" />
                <div className="text-sm text-[#5b3c99]">
                  <p><strong>Total Days Off:</strong> {leaveBreakdown.totalWorkingDays}</p>
                  {leaveBreakdown.unpaidLeaves > 0 && (
                    <p className="text-red-600 mt-1 font-semibold">⚠️ Loss of Pay (LOP): {leaveBreakdown.unpaidLeaves} Days</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <Button type="submit" disabled={createRequest.isPending} className="w-full bg-[#9b72e5] hover:bg-[#7e57c2] text-white">
            {createRequest.isPending ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
