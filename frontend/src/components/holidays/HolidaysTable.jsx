import { TreePine, Sun, Trash2, Loader2 } from 'lucide-react';

export default function HolidaysTable({ sortedHolidays, currentYear, isHolidayAdmin, onDelete, isDeleting }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
      {sortedHolidays.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <TreePine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg">No holidays configured yet for {currentYear}.</p>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-base text-left">
            <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-5 font-semibold text-gray-600 uppercase tracking-wide text-sm">Date</th>
                <th className="px-6 py-5 font-semibold text-gray-600 uppercase tracking-wide text-sm">Day</th>
                <th className="px-6 py-5 font-semibold text-gray-600 uppercase tracking-wide text-sm">Holiday Name</th>
                {isHolidayAdmin && (
                  <th className="px-6 py-5 font-semibold text-gray-600 uppercase tracking-wide text-sm text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedHolidays.map((holiday, idx) => {
                const isPast = holiday.date < new Date(new Date().setHours(0,0,0,0));
                return (
                  <tr key={holiday.id || idx} className={`hover:bg-purple-50/50 transition-colors group ${isPast ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium group-hover:text-[#7e57c2] transition-colors">
                      {holiday.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {holiday.date.toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium flex items-center gap-2">
                      {!isPast && <Sun className="w-4 h-4 text-amber-500 group-hover:animate-spin-slow" />}
                      {holiday.name}
                      {isPast && <span className="ml-2 text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase tracking-wider font-semibold">Past</span>}
                    </td>
                    {isHolidayAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => onDelete(holiday.id)}
                          disabled={isDeleting}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Holiday"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
