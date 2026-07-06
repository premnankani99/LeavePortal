import { useState, useEffect, useContext } from 'react';
import { Clock, CalendarDays, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

function getGreeting() {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good Morning';
  if (hr < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardHeader({ pendingVerifsCount }) {
  const { user } = useContext(AuthContext);
  const firstName = user?.full_name?.replace(/\badmin\b/i, '').trim().split(' ')[0] || 'Admin';
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });

  return (
    <div className="rounded-xl bg-gradient-to-r from-[#7e57c2] to-[#9b72e5] p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="relative z-10">
        <p className="text-purple-200 text-sm font-medium animate-in fade-in slide-in-from-left-4 duration-500">{getGreeting()},</p>
        <h1 className="text-3xl font-bold text-white mt-1 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
          {firstName} <span className="inline-block animate-bounce origin-bottom-right">👋</span>
        </h1>
        <p className="text-purple-100 text-sm mt-2 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
          Welcome to the Leave Portal {user?.role?.toLowerCase() === 'hr' ? 'HR' : 'Administration'} Dashboard
        </p>
      </div>
      
      <div className="mt-5 md:mt-0 relative z-10 flex flex-col items-end gap-3 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
        <div className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-lg border border-white/30 text-white flex items-center gap-3 shadow-sm">
          <div className="flex flex-col items-end border-r border-white/20 pr-3">
            <span className="text-xs font-medium text-purple-100 uppercase tracking-wider flex items-center gap-1">
              <CalendarDays className="w-3 h-3" /> Date
            </span>
            <span className="font-bold text-sm mt-0.5">{dateStr}</span>
          </div>
          <div className="flex flex-col items-start pl-1">
            <span className="text-xs font-medium text-purple-100 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3" /> Time
            </span>
            <span className="font-bold text-sm mt-0.5">{timeStr}</span>
          </div>
        </div>

        {pendingVerifsCount > 0 && (
          <Link to="/admin/verification-queue" className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-900 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-amber-300 transition-colors">
            <AlertTriangle className="w-4 h-4" />
            {pendingVerifsCount} verification{pendingVerifsCount > 1 ? 's' : ''} pending
          </Link>
        )}
      </div>
    </div>
  );
}
