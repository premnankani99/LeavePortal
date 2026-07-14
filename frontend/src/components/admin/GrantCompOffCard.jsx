import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGrantCompOff } from '../../hooks/useCompOff';
import { useAdminEmployees } from '../../hooks/useAdminEmployees';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Gift } from 'lucide-react';
import { Controller } from 'react-hook-form';

const compOffSchema = z.object({
  employeeId: z.string().min(1, "Please select an employee"),
  daysGranted: z.number()
    .min(0.5, "Minimum grant is 0.5 days")
    .max(30, "Maximum grant is 30 days")
    .step(0.5, "Must be a multiple of 0.5"),
  workedDates: z.array(z.string().min(1, "Date is required")),
  reason: z.string().min(5, "Please provide a valid reason (min 5 chars)")
});

export default function GrantCompOffCard() {
  const { filteredEmployees, isLoading: loadingEmployees } = useAdminEmployees();
  const grantMutation = useGrantCompOff();
  const toast = useToast();

  const { register, control, handleSubmit, formState: { errors }, reset, setValue, getValues } = useForm({
    resolver: zodResolver(compOffSchema),
    defaultValues: {
      employeeId: '',
      daysGranted: 1,
      workedDates: [''],
      reason: ''
    }
  });

  const onSubmit = (data) => {
    grantMutation.mutate(data, {
      onSuccess: (res) => {
        toast.success(`Comp-off granted. New leave balance is ${res.newBalance} days.`);
        reset();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to grant comp off");
      }
    });
  };

  return (
    <Card className="border-t-4 border-t-[#7e57c2] shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-[#7e57c2]" />
          <CardTitle className="text-gray-800 text-lg">Grant Comp-Off</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-5 flex-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select 
              {...register('employeeId')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:ring-purple-500 focus:border-purple-500 ${errors.employeeId ? 'border-red-500' : 'border-gray-300'}`}
              disabled={loadingEmployees}
            >
              <option value="">Select Employee</option>
              {filteredEmployees?.filter(e => e.role === 'employee').map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.email}) - Bal: {emp.available_leaves}
                </option>
              ))}
            </select>
            {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Days to Grant</label>
            <Controller
              name="daysGranted"
              control={control}
              render={({ field }) => (
                <input 
                  type="number"
                  step="0.5"
                  {...field}
                  onChange={(e) => {
                    field.onChange(parseFloat(e.target.value));
                    const days = parseFloat(e.target.value) || 1;
                    const numDates = Math.ceil(days);
                    const currentDates = getValues('workedDates') || [];
                    if (currentDates.length < numDates) {
                        setValue('workedDates', [...currentDates, ...Array(numDates - currentDates.length).fill('')]);
                    } else if (currentDates.length > numDates) {
                        setValue('workedDates', currentDates.slice(0, numDates));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:ring-purple-500 focus:border-purple-500 ${errors.daysGranted ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g. 1.5"
                />
              )}
            />
            {errors.daysGranted && <p className="text-red-500 text-xs mt-1">{errors.daysGranted.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Worked Dates (Overtime Dates)</label>
            <Controller
              name="workedDates"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {field.value.map((_, index) => (
                    <input 
                      key={index}
                      type="date"
                      value={field.value[index] || ''}
                      onChange={(e) => {
                        const newDates = [...field.value];
                        newDates[index] = e.target.value;
                        field.onChange(newDates);
                      }}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:ring-purple-500 focus:border-purple-500 ${errors.workedDates ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  ))}
                </div>
              )}
            />
            {errors.workedDates && <p className="text-red-500 text-xs mt-1">All dates are required</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea 
              {...register('reason')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:ring-purple-500 focus:border-purple-500 min-h-[80px] ${errors.reason ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g. Worked weekend Nov 1-2"
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#7e57c2] hover:bg-[#6a48a3] text-white font-medium shadow-md"
            disabled={grantMutation.isPending}
          >
            {grantMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Grant Comp-Off
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
