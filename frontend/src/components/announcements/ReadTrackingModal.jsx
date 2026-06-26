import { Badge } from '../ui/badge';
import { Eye, CheckCircle2 } from 'lucide-react';
import { useAnnouncementReads } from '../../hooks/useAnnouncements';

export default function ReadTrackingModal({ announcementId, onClose }) {
  const { data: reads = [], isLoading } = useAnnouncementReads(announcementId);

  if (!announcementId) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600" /> Read Tracking
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading data...</div>
          ) : reads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No employees have read this yet.</div>
          ) : (
            <div className="space-y-3">
              {reads.map(read => (
                <div key={read.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{read.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">Read: {new Date(read.read_at).toLocaleString()}</p>
                  </div>
                  {read.acknowledged_at && (
                    <Badge variant="success" className="bg-green-100 text-green-700 border-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ack
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
