import { Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { useLeaveForm } from '../hooks/useLeaveForm';

import LeaveTypeSelect from './leave-form/LeaveTypeSelect';
import LeaveDurationToggle from './leave-form/LeaveDurationToggle';
import LeaveDatePicker from './leave-form/LeaveDatePicker';
import LeaveBreakdownAlert from './leave-form/LeaveBreakdownAlert';

export default function LeaveForm({ onSuccess }) {
  const {
    formState: { control, handleSubmit, setValue, formState: { errors } },
    loadingTypes,
    allowedTypes,
    leaveBreakdown,
    onSubmit,
    isSubmitting,
    isHalfDay,
    selectedSession,
    myLeaves,
    available_leaves,
    comp_off_leaves
  } = useLeaveForm(onSuccess);

  if (loadingTypes) {
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin mx-auto text-[#9b72e5]" />
      </div>
    );
  }

  return (
    <Card className="w-full bg-white shadow-sm border-purple-100 border-t-4 border-t-[#7e57c2]">
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold text-gray-800">Apply for Leave</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Please fill in your details and select the dates.</p>
        </div>
        <div className="bg-purple-50 text-[#7e57c2] px-3 py-1.5 rounded-lg text-sm font-semibold border border-purple-100">
          Balance: {(available_leaves || 0) + (comp_off_leaves || 0)} Days
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-sans">
          
          <LeaveTypeSelect 
            control={control} 
            allowedTypes={allowedTypes} 
            errors={errors} 
          />

          <LeaveDurationToggle 
            isHalfDay={isHalfDay} 
            setValue={setValue} 
            errors={errors} 
          />

          <LeaveDatePicker 
            control={control} 
            isHalfDay={isHalfDay} 
            errors={errors} 
            myLeaves={myLeaves}
          />

          {isHalfDay && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-semibold text-gray-700">Session</label>
              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setValue('session', 'Morning', { shouldValidate: true })}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${selectedSession === 'Morning' ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Morning
                </button>
                <button 
                  type="button" 
                  onClick={() => setValue('session', 'Afternoon', { shouldValidate: true })}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${selectedSession === 'Afternoon' ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Afternoon
                </button>
              </div>
              {errors.session && <p className="text-xs text-red-500 mt-1">{errors.session.message}</p>}

            </div>
          )}

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

          <LeaveBreakdownAlert leaveBreakdown={leaveBreakdown} />

          <Button type="submit" disabled={isSubmitting} className="w-full bg-[#7e57c2] hover:bg-[#5e35b1] text-white">
            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
