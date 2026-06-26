import { Controller } from 'react-hook-form';

export default function LeaveTypeSelect({ control, allowedTypes, errors }) {
  return (
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
            {allowedTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
      />
      {errors.leave_type_id && <p className="text-xs text-red-500">{errors.leave_type_id.message}</p>}
    </div>
  );
}
