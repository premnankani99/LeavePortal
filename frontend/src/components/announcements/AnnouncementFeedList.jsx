import { Megaphone, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

const getPriorityBadge = (priority) => {
  switch (priority) {
    case 'urgent': return <Badge className="bg-red-100 text-red-700 border-0">Urgent</Badge>;
    case 'important': return <Badge className="bg-amber-100 text-amber-700 border-0">Important</Badge>;
    default: return null;
  }
};

export default function AnnouncementFeedList({ isLoading, filtered, onSelect }) {
  if (isLoading) {
    return <div className="text-center py-16 text-gray-500 text-lg">Loading announcements...</div>;
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
        <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <p className="text-gray-500 font-medium text-lg">No announcements found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filtered.map((ann) => {
        const isUnread = !ann.my_read?.read_at;
        const needsAck = ann.requires_acknowledgement && !ann.my_read?.acknowledged_at;
        
        return (
          <Card 
            key={ann.id} 
            className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${ann.priority === 'urgent' ? 'border-l-red-500' : ann.is_pinned ? 'border-l-purple-500' : 'border-l-transparent'} ${isUnread ? 'bg-purple-50/30' : 'bg-white'}`}
            onClick={() => onSelect(ann)}
          >
            <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {ann.priority === 'urgent' ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Megaphone className="w-4 h-4 text-purple-500" />}
                  <h3 className={`text-lg truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                    {ann.title}
                  </h3>
                  {isUnread && <span className="w-2 h-2 bg-purple-600 rounded-full"></span>}
                </div>
                <p className="text-gray-500 text-sm truncate max-w-2xl">{ann.message}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                  <span>Posted {new Date(ann.created_at).toLocaleDateString()}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="capitalize">{ann.category.replace('_', ' ')}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {getPriorityBadge(ann.priority)}
                {ann.is_pinned && <Badge className="bg-purple-100 text-purple-700 border-0">Pinned</Badge>}
                {needsAck && <Badge className="bg-orange-100 text-orange-700 border-0">Action Required</Badge>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
