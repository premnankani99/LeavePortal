import { AlertTriangle } from 'lucide-react';

export default function UrgentAnnouncementAlert({ urgentUnread, onSelect }) {
  if (!urgentUnread) return null;

  return (
    <div className="bg-red-500 text-white rounded-xl p-4 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 shrink-0" />
        <div>
          <p className="font-bold">Urgent: {urgentUnread.title}</p>
          <p className="text-sm text-red-100">Please read this important message immediately.</p>
        </div>
      </div>
      <button 
        onClick={() => onSelect(urgentUnread)}
        className="bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 transition-colors shrink-0"
      >
        View Message
      </button>
    </div>
  );
}
