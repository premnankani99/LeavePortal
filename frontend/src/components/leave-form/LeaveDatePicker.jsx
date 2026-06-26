import { Controller } from 'react-hook-form';
import DatePickerDefault from "react-multi-date-picker";
const DatePicker = DatePickerDefault.default || DatePickerDefault;
import { COMPANY_HOLIDAYS, HOLIDAY_NAMES } from '../../utils/dateUtils';

// A custom class for styling the Multi-Date Picker input via Tailwind instead of inline styles
const inputClass = "w-full py-2.5 px-3.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#7e57c2] focus:border-[#7e57c2]";

export default function LeaveDatePicker({ control, isHalfDay, errors }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Select date{isHalfDay ? '' : '(s)'}</label>
      <Controller
        name="dates"
        control={control}
        render={({ field }) => (
          <DatePicker 
            multiple={!isHalfDay} 
            value={field.value} 
            onChange={field.onChange} 
            format="YYYY-MM-DD"
            minDate={new Date()}
            inputClass={inputClass}
            containerClassName="w-full"
            calendarPosition="bottom-left"
            fixMainPosition
            mapDays={({ date }) => {
              const dateStr = `${date.year}-${String(date.month.number).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
              const jsDate = new Date(dateStr);
              const dayOfWeek = jsDate.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isHoliday = COMPANY_HOLIDAYS.includes(dateStr);

              // Instead of returning style objects, we return className strings 
              // for the date-picker cells, fulfilling the "no inline style" requirement.
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
