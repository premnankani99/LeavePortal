import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Megaphone, Trash2, Eye } from 'lucide-react';

export default function AnnouncementList({ announcements, isLoading, onDelete, onViewReads }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'important': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="flex-1 flex flex-col shadow-sm">
      <CardContent className="p-0 flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-16 text-gray-500">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No announcements found. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-base text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-5 font-semibold text-sm uppercase tracking-wide">Title & Category</th>
                  <th className="px-6 py-5 font-semibold text-sm uppercase tracking-wide">Priority</th>
                  <th className="px-6 py-5 font-semibold text-sm uppercase tracking-wide">Target Audience</th>
                  <th className="px-6 py-5 font-semibold text-sm uppercase tracking-wide">Status</th>
                  <th className="px-6 py-5 font-semibold text-sm uppercase tracking-wide">Posted</th>
                  <th className="px-6 py-5 font-semibold text-sm uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {announcements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {ann.is_pinned && <span className="w-2 h-2 bg-purple-500 rounded-full" title="Pinned"></span>}
                        {ann.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 capitalize">{ann.category.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getPriorityColor(ann.priority)} capitalize border-0`}>{ann.priority}</Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-600 capitalize">
                      {ann.target_audience.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onViewReads(ann.id)}
                        className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 text-xs font-medium bg-purple-50 px-2 py-1 rounded hover:bg-purple-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Reads
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => onDelete(ann)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
