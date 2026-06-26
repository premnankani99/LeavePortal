import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Megaphone, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useMarkAnnouncementRead, useAcknowledgeAnnouncement } from '../hooks/useAnnouncements';
import { useToast } from '../context/ToastContext';

export default function AnnouncementModal({ announcement, onClose }) {
  const markReadMutation = useMarkAnnouncementRead();
  const acknowledgeMutation = useAcknowledgeAnnouncement();
  const toast = useToast();
  
  const [isAcknowledged, setIsAcknowledged] = useState(
    announcement.my_read?.acknowledged_at ? true : false
  );

  // Mark as read when opened
  useState(() => {
    if (announcement && !announcement.my_read?.read_at) {
      markReadMutation.mutate(announcement.id);
    }
  }, [announcement]);

  if (!announcement) return null;

  const handleAcknowledge = () => {
    acknowledgeMutation.mutate(announcement.id, {
      onSuccess: () => {
        setIsAcknowledged(true);
        toast.success("Announcement acknowledged.");
        onClose(); // Optional: close immediately or let them close manually
      },
      onError: (err) => toast.error("Failed to acknowledge: " + err.message)
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'important': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const needsAcknowledge = announcement.requires_acknowledgement && !isAcknowledged;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className={`px-6 py-4 flex justify-between items-center ${announcement.priority === 'urgent' ? 'bg-red-50' : 'bg-gray-50'} border-b border-gray-100`}>
          <div className="flex items-center gap-3">
            {announcement.priority === 'urgent' ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <Megaphone className="w-5 h-5 text-purple-600" />
            )}
            <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
          </div>
          {/* Only allow closing if no ack required, or already ack'd */}
          {!needsAcknowledge && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge className={`${getPriorityColor(announcement.priority)} capitalize border-0`}>{announcement.priority}</Badge>
            <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full">{announcement.category.replace('_', ' ')}</span>
            <span className="text-xs text-gray-400 ml-auto">
              Posted by {announcement.profiles?.full_name} • {new Date(announcement.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50/50 p-4 rounded-xl border border-gray-100 min-h-[100px] whitespace-pre-wrap">
            {announcement.message}
          </div>

          {announcement.attachment_url && (
            <div className="mt-4">
              <a href={announcement.attachment_url} target="_blank" rel="noreferrer" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                View Attachment
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          {needsAcknowledge ? (
            <div className="w-full flex items-center justify-between">
              <p className="text-sm text-gray-500 font-medium">Please acknowledge to dismiss.</p>
              <Button 
                onClick={handleAcknowledge}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={acknowledgeMutation.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                I Acknowledge
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={onClose}>Close</Button>
          )}
        </div>

      </div>
    </div>
  );
}
