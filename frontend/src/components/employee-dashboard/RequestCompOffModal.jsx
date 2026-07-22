import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Calendar } from 'lucide-react';
import { useRequestCompOff } from '../../hooks/useCompOff';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/button';

const schema = z.object({
  daysRequested: z.coerce.number().min(0.5, "Minimum 0.5 days").max(10, "Maximum 10 days"),
  workedDates: z.array(z.string().min(1, "Date is required")),
  reason: z.string().min(5, "Reason must be at least 5 characters")
});

export default function RequestCompOffModal({ isOpen, onClose }) {
  const { mutate: requestCompOff, isPending } = useRequestCompOff();
  const toast = useToast();

  const { control, handleSubmit, formState: { errors }, reset, setValue, getValues } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      daysRequested: 1,
      workedDates: [''],
      reason: ''
    }
  });

  if (!isOpen) return null;

  const onSubmit = (data) => {
    console.log("[Frontend Component] Rendering onSubmit in RequestCompOffModal.jsx");
    const payload = {
      daysRequested: data.daysRequested,
      reason: data.reason,
      workedDates: data.workedDates
    };
    requestCompOff(payload, {
      onSuccess: () => {
        toast.success("Comp-Off request submitted successfully!");
        reset();
        onClose();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to submit request");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#7e57c2]" />
            <h3 className="text-lg font-bold text-gray-900">Request Comp-Off</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Days</label>
            <Controller
              name="daysRequested"
              control={control}
              render={({ field }) => (
                <input 
                  type="number" 
                  step="0.5"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    const days = parseFloat(e.target.value) || 1;
                    const numDates = Math.ceil(days);
                    const currentDates = getValues('workedDates') || [];
                    if (currentDates.length < numDates) {
                        setValue('workedDates', [...currentDates, ...Array(numDates - currentDates.length).fill('')]);
                    } else if (currentDates.length > numDates) {
                        setValue('workedDates', currentDates.slice(0, numDates));
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e57c2] focus:border-transparent outline-none transition-all"
                />
              )}
            />
            {errors.daysRequested && <p className="text-xs text-red-500 mt-1">{errors.daysRequested.message}</p>}
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
                      max={new Date().toISOString().split('T')[0]} // Cannot be in future
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e57c2] focus:border-transparent outline-none transition-all"
                    />
                  ))}
                </div>
              )}
            />
            {errors.workedDates && <p className="text-xs text-red-500 mt-1">All dates are required</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Reference</label>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <textarea 
                  {...field}
                  placeholder="e.g., Worked on weekend for project XYZ"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7e57c2] focus:border-transparent outline-none transition-all resize-none h-24"
                />
              )}
            />
            {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-[#7e57c2] hover:bg-[#5e35b1] text-white rounded-full">
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
