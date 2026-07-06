import { Calendar as CalendarIcon } from 'lucide-react';

export default function HolidaysHeader({ currentYear }) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
      <div className="p-3 bg-purple-100 text-[#7e57c2] rounded-xl">
        <CalendarIcon className="w-6 h-6" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Holidays</h1>
        <p className="text-gray-500 text-sm mt-1">Official list of public holidays for {currentYear}</p>
      </div>
    </div>
  );
}
