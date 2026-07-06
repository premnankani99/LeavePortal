import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download, ArrowLeft, Mail, Calendar as CalendarIcon, ShieldCheck, Phone, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { API_BASE_URL } from '../../utils/config';

// Fetch specific employee info
const fetchEmployee = async (id) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/admin/verified`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch employee');
  const employees = await res.json();
  return employees.find(e => e.id === id);
};

// Fetch employee leaves
const fetchEmployeeLeaves = async (id) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/leaves/employee/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch leaves');
  return await res.json();
};

export default function HREmployeeDetail() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: employee, isLoading: empLoading } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => fetchEmployee(employeeId),
  });

  const { data: leaves, isLoading: leavesLoading } = useQuery({
    queryKey: ['employeeLeaves', employeeId],
    queryFn: () => fetchEmployeeLeaves(employeeId),
  });

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // Helper to get leave status for a specific day
  const getLeaveForDay = (day) => {
    if (!leaves) return null;
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Reset time for proper comparison
    dateToCheck.setHours(0, 0, 0, 0);

    for (let leave of leaves) {
      if (leave.status === 'rejected' || leave.status === 'cancelled' || leave.status === 'withdrawn') continue;
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (dateToCheck >= start && dateToCheck <= end) {
        // Exclude withdrawn dates if partially withdrawn
        if (leave.withdrawn_dates) {
          const withdrawnArray = typeof leave.withdrawn_dates === 'string' ? JSON.parse(leave.withdrawn_dates) : leave.withdrawn_dates;
          const isWithdrawn = withdrawnArray.some(d => new Date(d).getTime() === dateToCheck.getTime());
          if (isWithdrawn) continue;
        }

        // Check if weekend (exclude weekends from normal leaves unless specifically applied, but our basic logic usually just skips weekends from counting, but they are visually inside the range. Let's just return the leave)
        const isWeekend = dateToCheck.getDay() === 0 || dateToCheck.getDay() === 6;
        
        return {
          ...leave,
          isWeekend
        };
      }
    }
    return null;
  };

  // Generate Calendar Days Array
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null); // Empty slots before the 1st
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Calculate Monthly Summary
  const calculateSummary = () => {
    let totalWorkingDays = 0;
    let daysPresent = 0;
    let paidLeaveUsed = 0;
    let unpaidLeaveUsed = 0;
    let halfDaysUsed = 0;

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        totalWorkingDays++;
        const leave = getLeaveForDay(i);
        if (!leave) {
          daysPresent++;
        } else if (leave.status === 'approved') {
          if (leave.leave_type.toLowerCase().includes('half')) {
            halfDaysUsed++;
            daysPresent += 0.5;
            if (leave.leave_type.toLowerCase().includes('unpaid')) {
              unpaidLeaveUsed += 0.5;
            } else {
              paidLeaveUsed += 0.5;
            }
          } else {
            if (leave.leave_type.toLowerCase().includes('unpaid')) {
              unpaidLeaveUsed++;
            } else {
              paidLeaveUsed++;
            }
          }
        }
      }
    }
    return { totalWorkingDays, daysPresent, paidLeaveUsed, unpaidLeaveUsed, halfDaysUsed };
  };

  const summary = calculateSummary();

  const overallStats = useMemo(() => {
    const stats = { lastWeek: 0, lastMonth: 0, overall: 0 };
    if (!leaves) return stats;
    
    const now = dayjs();
    const lastWeekStart = now.subtract(7, 'day').startOf('day');
    const lastMonthStart = now.subtract(30, 'day').startOf('day');

    leaves.forEach(req => {
      if (req.status === 'rejected' || req.status === 'withdrawn') return;
      const startDate = dayjs(req.start_date);
      const endDate = dayjs(req.end_date);
      
      let days = endDate.diff(startDate, 'day') + 1;
      if (req.is_half_day) days = 0.5;
      
      stats.overall += days;

      if (startDate.isAfter(lastWeekStart) || endDate.isAfter(lastWeekStart)) {
        stats.lastWeek += days;
      }
      if (startDate.isAfter(lastMonthStart) || endDate.isAfter(lastMonthStart)) {
        stats.lastMonth += days;
      }
    });
    return stats;
  }, [leaves]);

  const handleExport = () => {
    // Generate CSV
    let csv = 'Date,Day,Status,Leave Type,Paid/Unpaid\n';
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const formattedDate = date.toLocaleDateString();
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      let statusStr = isWeekend ? 'Weekend' : 'Present';
      let leaveTypeStr = 'N/A';
      let paidUnpaid = 'N/A';

      const leave = getLeaveForDay(i);
      
      if (leave && !isWeekend) {
        statusStr = leave.status === 'approved' ? 'On Leave (Approved)' : 'On Leave (Pending)';
        leaveTypeStr = leave.leave_type;
        paidUnpaid = leave.leave_type.toLowerCase().includes('unpaid') ? 'Unpaid' : 'Paid';
        if (leave.leave_type.toLowerCase().includes('half')) {
          statusStr += ' (Half Day)';
        }
      }

      csv += `"${formattedDate}","${dayName}","${statusStr}","${leaveTypeStr}","${paidUnpaid}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${employee?.full_name?.replace(' ', '_') || 'employee'}_leaves_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (empLoading || leavesLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!employee) {
    return <div className="p-8">Employee not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <button 
        onClick={() => navigate('/hr/dashboard')}
        className="flex items-center text-gray-500 hover:text-[#7e57c2] transition-colors mb-6 w-fit"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      {/* Employee Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6 mb-6">
        <div className="w-24 h-24 rounded-full bg-[#7e57c2] flex items-center justify-center text-white font-bold text-3xl shrink-0">
          {(employee.full_name || employee.email).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900">{employee.full_name}</h1>
          <p className="text-gray-500 mb-3">{employee.designation || 'Employee'}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
            <span className="flex items-center"><Mail className="w-4 h-4 mr-1 text-gray-400" /> {employee.email}</span>
            <span className="flex items-center"><CalendarIcon className="w-4 h-4 mr-1 text-gray-400" /> Joined: {new Date(employee.date_of_joining || employee.created_at).toLocaleDateString()}</span>
            <span className="flex items-center bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100"><ShieldCheck className="w-4 h-4 mr-1" /> {employee.verification_status}</span>
          </div>
        </div>
        <div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Quick Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Leaves Last 7 Days</p>
            <h3 className="text-2xl font-bold text-gray-900">{overallStats.lastWeek} <span className="text-sm font-normal text-gray-400">days</span></h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Leaves Last 30 Days</p>
            <h3 className="text-2xl font-bold text-gray-900">{overallStats.lastMonth} <span className="text-sm font-normal text-gray-400">days</span></h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Overall Leaves</p>
            <h3 className="text-2xl font-bold text-gray-900">{overallStats.overall} <span className="text-sm font-normal text-gray-400">days</span></h3>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Attendance Calendar</h2>
            <div className="flex items-center gap-4">
              <button onClick={() => changeMonth(-1)} className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <span className="font-semibold text-gray-800 text-lg w-40 text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => changeMonth(1)} className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-semibold text-gray-500 uppercase">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={idx} className="h-24 rounded-xl bg-gray-50/50 border border-transparent"></div>;
              
              const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
              const leave = getLeaveForDay(day);

              let bgColor = isWeekend ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-100';
              let badge = null;

              if (leave && !leave.isWeekend) {
                if (leave.status === 'approved') {
                  bgColor = 'bg-emerald-50 border-emerald-200';
                  badge = <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">Approved</span>;
                } else if (leave.status === 'pending') {
                  bgColor = 'bg-amber-50 border-amber-200';
                  badge = <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">Pending</span>;
                }
              }

              return (
                <div key={idx} className={`h-24 p-2 rounded-xl border flex flex-col justify-between transition-colors ${bgColor}`}>
                  <div className="flex justify-between items-start">
                    <span className={`font-medium ${isWeekend ? 'text-gray-400' : 'text-gray-700'}`}>{day}</span>
                  </div>
                  <div className="mt-auto flex flex-col gap-1 items-start">
                    {badge}
                    {leave && leave.leave_type.toLowerCase().includes('half') && !leave.isWeekend && (
                      <span className="bg-purple-100 text-purple-700 text-[9px] uppercase font-bold px-1 rounded truncate w-full text-center">Half Day</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-gray-600 font-medium">Total Working Days</span>
              <span className="font-bold text-gray-900 text-lg">{summary.totalWorkingDays}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-purple-50 border border-purple-100">
              <span className="text-purple-800 font-medium">Days Present</span>
              <span className="font-bold text-purple-900 text-lg">{summary.daysPresent}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-emerald-800 font-medium">Paid Leaves Used</span>
              <span className="font-bold text-emerald-900 text-lg">{summary.paidLeaveUsed}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-red-50 border border-red-100">
              <span className="text-red-800 font-medium">Unpaid Leaves (LOP)</span>
              <span className="font-bold text-red-900 text-lg">{summary.unpaidLeaveUsed}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-purple-50 border border-purple-100">
              <span className="text-purple-800 font-medium">Half Days Used</span>
              <span className="font-bold text-purple-900 text-lg">{summary.halfDaysUsed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
