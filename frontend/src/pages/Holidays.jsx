import { useState } from 'react';
import { useHolidays } from '../hooks/useHolidays';
import HolidaysHeader from '../components/holidays/HolidaysHeader';
import HolidaysTable from '../components/holidays/HolidaysTable';
import { Plus, Calendar as CalendarIcon, Loader2 } from 'lucide-react';

export default function Holidays() {
  const { currentYear, sortedHolidays, isLoading, isHolidayAdmin, addHoliday, isAdding, deleteHoliday, isDeleting } = useHolidays();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '', type: 'public', description: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddSubmit = async (e) => {
    console.log("[Frontend Async] Executing handleAddSubmit in Holidays.jsx");
    e.preventDefault();
    setErrorMsg('');
    try {
      await addHoliday(newHoliday);
      setNewHoliday({ date: '', name: '', type: 'public', description: '' });
      setShowAddForm(false);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col space-y-6 font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <HolidaysHeader currentYear={currentYear} />
        {isHolidayAdmin && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-[#7e57c2] hover:bg-[#6c48a3] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm w-fit"
          >
            <Plus className="w-5 h-5" />
            Add Holiday
          </button>
        )}
      </div>

      {showAddForm && isHolidayAdmin && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-lg text-gray-900 mb-2">Add New Holiday</h3>
          {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{errorMsg}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" required min={new Date().toISOString().split('T')[0]} value={newHoliday.date} onChange={e => setNewHoliday({...newHoliday, date: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7e57c2] focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
              <input type="text" required placeholder="e.g. Diwali" value={newHoliday.name} onChange={e => setNewHoliday({...newHoliday, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7e57c2] focus:border-transparent outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={isAdding} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarIcon className="w-4 h-4" />}
              Save Holiday
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 flex flex-col shadow-sm overflow-hidden mt-2">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-[#7e57c2]" />
          </div>
        ) : (
          <HolidaysTable 
            sortedHolidays={sortedHolidays} 
            currentYear={currentYear} 
            isHolidayAdmin={isHolidayAdmin}
            onDelete={deleteHoliday}
            isDeleting={isDeleting}
          />
        )}
      </div>

    </div>
  );
}
