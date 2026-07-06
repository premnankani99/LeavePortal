import React, { useMemo } from 'react';
import { useAllRequests } from '../../hooks/useLeaves';
import { Search } from 'lucide-react';
import dayjs from 'dayjs';

export default function AttendanceTable({ employees, isLoading, search, setSearch, onRowClick }) {
  const { data: allRequests = [], isLoading: requestsLoading } = useAllRequests();

  const attendanceStats = useMemo(() => {
    const stats = {};
    const now = dayjs();
    const lastWeekStart = now.subtract(7, 'day').startOf('day');
    const lastMonthStart = now.subtract(30, 'day').startOf('day');

    // Initialize stats
    employees.forEach(emp => {
      stats[emp.id] = {
        lastWeek: 0,
        lastMonth: 0,
        overall: 0,
      };
    });

    allRequests.forEach(req => {
      if (req.status === 'rejected' || req.status === 'withdrawn') return;
      if (!stats[req.employee_id]) return; // if employee not in our verified list yet

      const startDate = dayjs(req.start_date);
      const endDate = dayjs(req.end_date);
      
      // Calculate days (simple inclusive subtraction, typically one would exclude weekends, but this is a rough metric)
      let days = endDate.diff(startDate, 'day') + 1;
      
      // If it's a half day
      if (req.is_half_day) days = 0.5;
      
      stats[req.employee_id].overall += days;

      // Check if it overlaps with last week
      if (startDate.isAfter(lastWeekStart) || endDate.isAfter(lastWeekStart)) {
        stats[req.employee_id].lastWeek += days;
      }
      
      // Check if it overlaps with last month
      if (startDate.isAfter(lastMonthStart) || endDate.isAfter(lastMonthStart)) {
        stats[req.employee_id].lastMonth += days;
      }
    });

    return stats;
  }, [allRequests, employees]);

  if (isLoading || requestsLoading) {
    return <div className="p-10 text-center text-gray-500">Loading attendance data...</div>;
  }

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50/50">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7e57c2]/20 focus:border-[#7e57c2] transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-y border-gray-100">
              <th className="py-3.5 px-6 text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="py-3.5 px-6 text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Department</th>
              <th className="py-3.5 px-6 text-[13px] font-semibold text-gray-500 uppercase tracking-wider text-center">Last 7 Days</th>
              <th className="py-3.5 px-6 text-[13px] font-semibold text-gray-500 uppercase tracking-wider text-center">Last 30 Days</th>
              <th className="py-3.5 px-6 text-[13px] font-semibold text-gray-500 uppercase tracking-wider text-center">Overall (All Time)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {employees.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-gray-500">
                  No employees found matching your criteria
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const stat = attendanceStats[emp.id] || { lastWeek: 0, lastMonth: 0, overall: 0 };
                return (
                  <tr 
                    key={emp.id} 
                    onClick={() => onRowClick && onRowClick(emp)}
                    className="hover:bg-[#7e57c2]/5 transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#7e57c2]/10 text-[#7e57c2] flex items-center justify-center font-bold text-sm uppercase">
                          {emp.full_name?.charAt(0) || emp.email?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-[#7e57c2] transition-colors">
                            {emp.full_name || 'Unnamed Employee'}
                          </p>
                          <p className="text-xs text-gray-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {emp.department || 'Not Assigned'}
                    </td>
                    <td className="py-4 px-6 text-sm text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full font-medium text-xs ${stat.lastWeek > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {stat.lastWeek} days off
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full font-medium text-xs ${stat.lastMonth > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {stat.lastMonth} days off
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 text-center">
                      {stat.overall} days total
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
