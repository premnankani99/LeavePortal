import { Link } from 'react-router-dom';
import { Megaphone, ChevronRight, AlertTriangle } from 'lucide-react';

export default function AnnouncementsWidget({ displayAnnouncements, onSelect }) {
  if (displayAnnouncements.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-purple-600" /> 
          Recent Announcements
        </h2>
        <Link to="/announcements" className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="divide-y divide-gray-100">
        {displayAnnouncements.map(ann => {
          const isUnread = !ann.my_read?.read_at;
          return (
            <div 
              key={ann.id} 
              onClick={() => onSelect(ann)}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-4 ${isUnread ? 'bg-purple-50/30' : ''}`}
            >
              <div className={`p-2 rounded-full shrink-0 mt-0.5 ${ann.priority === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
                {ann.priority === 'urgent' ? <AlertTriangle className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-base truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                  {ann.is_pinned && '📌 '}{ann.title}
                </h4>
                <p className="text-sm text-gray-500 truncate mt-0.5">{ann.message}</p>
              </div>
              {isUnread && <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 shrink-0"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
