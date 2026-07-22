import { useState, useEffect } from 'react';
import { Clock, CalendarDays } from 'lucide-react';

export default function WelcomeBanner({ greeting, firstName, stats }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
        console.log("[Frontend Effect] Triggered in WelcomeBanner.jsx");
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });

  return (
    <div className="rounded-xl bg-gradient-to-r from-[#7e57c2] to-[#9b72e5] p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="relative z-10">
        <p className="text-purple-200 text-sm font-medium animate-in fade-in slide-in-from-left-4 duration-500">{greeting},</p>
        <h1 className="text-3xl font-bold text-white mt-1 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
          {firstName} <span className="inline-block animate-bounce origin-bottom-right">👋</span>
        </h1>
        <p className="text-purple-100 text-sm mt-2 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
          You have <span className="font-bold text-white">{stats.pending}</span> pending request{stats.pending !== 1 ? 's' : ''} and <span className="font-bold text-white">{stats.approved}</span> approved this year
        </p>
      </div>
      
      <div className="mt-5 md:mt-0 relative z-10 flex gap-4 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
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
      </div>
    </div>
  );
}
