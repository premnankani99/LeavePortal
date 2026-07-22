import React, { useState, useMemo } from 'react';
import { useAllRequests } from '../hooks/useLeaves';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { ChevronLeft, ChevronRight, Calendar, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';


dayjs.extend(isBetween);

export default function LeaveCalendar() {
  const { data: allRequests = [], isLoading } = useAllRequests();
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const handlePrevDay = () => setSelectedDate(prev => prev.subtract(1, 'day'));
  const handleNextDay = () => setSelectedDate(prev => prev.add(1, 'day'));
  const handleToday = () => setSelectedDate(dayjs());

  const absentEmployees = useMemo(() => {
    // Only approved leaves
    const approved = allRequests.filter(r => r.status === 'approved');

    const filtered = approved.filter(req => {
      const start = dayjs(req.start_date).startOf('day');
      const end = dayjs(req.end_date).endOf('day');
      const current = selectedDate.startOf('day');

      if (current.isBetween(start, end, 'day', '[]')) {
        // Check for partial withdrawals
        if (req.withdrawn_dates) {
          const withdrawnArray = typeof req.withdrawn_dates === 'string' 
            ? JSON.parse(req.withdrawn_dates) 
            : req.withdrawn_dates;
          
          if (Array.isArray(withdrawnArray)) {
            const isWithdrawnToday = withdrawnArray.some(d => dayjs(d).isSame(current, 'day'));
            if (isWithdrawnToday) return false;
          }
        }
        return true;
      }
      return false;
    });

    // Deduplicate by employee_id so the same person doesn't show up twice
    const uniqueEmployees = [];
    const seenIds = new Set();
    for (const req of filtered) {
      if (!seenIds.has(req.employee_id)) {
        seenIds.add(req.employee_id);
        uniqueEmployees.push(req);
      }
    }
    return uniqueEmployees;
  }, [allRequests, selectedDate]);

  const displayDate = selectedDate.format('dddd, MMMM D, YYYY');

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center tracking-tight">
            <Calendar className="w-8 h-8 mr-3 text-[#7e57c2]" />
            Away Calendar
          </h1>
          <p className="text-gray-500 mt-1">View who is absent on any given date</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
            <button 
              onClick={handlePrevDay}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleToday}
              className="px-4 py-2 hover:bg-white hover:shadow-sm rounded-lg transition-all font-medium text-gray-700 hover:text-gray-900"
            >
              Today
            </button>
            <button 
              onClick={handleNextDay}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600 hover:text-gray-900"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative flex-1 max-w-[200px]">
            <input 
              type="date" 
              value={selectedDate.format('YYYY-MM-DD')}
              onChange={(e) => setSelectedDate(dayjs(e.target.value))}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-purple-500 outline-none transition-shadow w-full"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 tracking-tight">{displayDate}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {absentEmployees.length} {absentEmployees.length === 1 ? 'employee' : 'employees'} away on this date.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : absentEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {absentEmployees.map(req => (
            <Link to={`/admin/employees/${req.employee_id}`} key={req.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 flex flex-col justify-between hover:border-[#7e57c2] cursor-pointer">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 truncate pr-2">{req.profiles?.full_name}</h3>
                  <span className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                    {req.leave_type}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  {req.profiles?.designation || 'Employee'}
                </div>
                {req.reason && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-2 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                    "{req.reason}"
                  </p>
                )}
              </div>
              
              {req.is_half_day && (
                <div className="mt-4 inline-flex self-start items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                  Half Day
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 border-dashed rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
            <UserX className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Everyone is present</h3>
          <p className="text-gray-500 max-w-sm mx-auto">No approved leaves were found for this date. The whole team is available.</p>
        </div>
      )}
    </div>
  );
}
