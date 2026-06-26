import { Controller } from 'react-hook-form';
import DatePickerDefault from "react-multi-date-picker";
const DatePicker = DatePickerDefault.default || DatePickerDefault;
import { COMPANY_HOLIDAYS, HOLIDAY_NAMES } from '../../utils/dateUtils';

// A custom class for styling the Multi-Date Picker input via Tailwind instead of inline styles
const inputClass = "w-full py-2.5 px-3.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#7e57c2] focus:border-[#7e57c2]";

export default function LeaveDatePicker({ control, isHalfDay, errors, myLeaves = [] }) {
  const now = new Date();
  const maxDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const appliedDates = new Set();
  myLeaves.forEach(leave => {
    if (leave.status === 'rejected' || leave.status === 'cancelled' || leave.status === 'withdrawn') return;
    
    let currentDate = new Date(leave.start_date);
    const end = new Date(leave.end_date);
    while (currentDate <= end) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      appliedDates.add(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Select date{isHalfDay ? '' : '(s)'}</label>
      <Controller
        name="dates"
        control={control}
        render={({ field }) => (
          <DatePicker 
            range={!isHalfDay}
            rangeHover={!isHalfDay}
            value={field.value} 
            onChange={(dates) => {
              // If user clicks the same date twice in range mode, it sets start and end to the same date.
              // We intercept this and clear the selection instead, to simulate "deselect".
              if (Array.isArray(dates) && dates.length === 2) {
                const start = dates[0];
                const end = dates[1];
                if (start && end && start.format("YYYY-MM-DD") === end.format("YYYY-MM-DD")) {
                  field.onChange([]); // Clear the selection
                  return;
                }
              }
              field.onChange(dates);
            }}
            format="YYYY-MM-DD"
            minDate={new Date()}
            maxDate={maxDate}
            inputClass={inputClass}
            containerClassName="w-full sm:w-1/2"
            calendarPosition="bottom-left"
            fixMainPosition
            mapDays={({ date }) => {
              const dateStr = `${date.year}-${String(date.month.number).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
              const jsDate = new Date(dateStr);
              const dayOfWeek = jsDate.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isHoliday = COMPANY_HOLIDAYS.includes(dateStr);
              const isApplied = appliedDates.has(dateStr);

              if (isApplied) {
                return {
                  disabled: true,
                  className: "text-red-500 bg-red-50 cursor-not-allowed font-semibold line-through",
                  title: 'Already applied for leave on this date'
                };
              }
              if (isWeekend) {
                return {
                  disabled: true,
                  className: "text-gray-300 bg-gray-50 cursor-not-allowed",
                  title: dayOfWeek === 6 ? 'Saturday – Weekend' : 'Sunday – Weekend'
                };
              }
              if (isHoliday) {
                return {
                  disabled: true,
                  className: "text-orange-500 bg-orange-50 cursor-not-allowed font-semibold",
                  title: HOLIDAY_NAMES[dateStr] || 'Public Holiday'
                };
              }
            }}
          />
        )}
      />
      {errors.dates && <p className="text-xs text-red-500">{errors.dates.message}</p>}
    </div>
  );
}
