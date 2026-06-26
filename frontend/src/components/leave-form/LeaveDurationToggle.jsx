export default function LeaveDurationToggle({ isHalfDay, setValue, errors }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700">Duration</label>
      <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
        <button 
          type="button" 
          onClick={() => { setValue('is_half_day', false); setValue('session', ''); setValue('is_compensatory', false); }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isHalfDay ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Full day
        </button>
        <button 
          type="button" 
          onClick={() => setValue('is_half_day', true)}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isHalfDay ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Half day
        </button>
      </div>
      {errors.is_half_day && <p className="text-xs text-red-500">{errors.is_half_day.message}</p>}
    </div>
  );
}
