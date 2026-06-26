import { useHolidays } from '../hooks/useHolidays';
import HolidaysHeader from '../components/holidays/HolidaysHeader';
import HolidaysTable from '../components/holidays/HolidaysTable';

export default function Holidays() {
  const { currentYear, sortedHolidays } = useHolidays();

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col space-y-6 font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <HolidaysHeader currentYear={currentYear} />

      <div className="flex-1 flex flex-col shadow-sm overflow-hidden mt-2">
        <HolidaysTable 
          sortedHolidays={sortedHolidays} 
          currentYear={currentYear} 
        />
      </div>

    </div>
  );
}
