import { Button } from '../ui/button';
import { useAnnouncementForm } from '../../hooks/useAnnouncementForm';

export default function CreateAnnouncementModal({ isOpen, onClose }) {
  const { formData, setFormData, handleSubmit, isSubmitting } = useAnnouncementForm(onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-900">Create New Announcement</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                type="text" required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="E.g., Office closed on Friday"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                required rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Detailed message..."
                value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="general">General</option>
                  <option value="policy_update">Policy Update</option>
                  <option value="holiday">Holiday</option>
                  <option value="event">Event</option>
                  <option value="hr_update">HR Update</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={formData.target_audience} onChange={e => setFormData({...formData, target_audience: e.target.value})}
              >
                <option value="all">All Employees</option>
              </select>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" 
                  checked={formData.is_pinned} onChange={e => setFormData({...formData, is_pinned: e.target.checked})} />
                <span className="text-sm font-medium text-gray-700">Pin to Employee Dashboard</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" 
                  checked={formData.requires_acknowledgement} onChange={e => setFormData({...formData, requires_acknowledgement: e.target.checked})} />
                <div>
                  <span className="text-sm font-medium text-gray-700 block">Requires Acknowledgement</span>
                  <span className="text-xs text-gray-500">Employees must explicitly acknowledge this message.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" 
                  checked={formData.send_email} onChange={e => setFormData({...formData, send_email: e.target.checked})} />
                <div>
                  <span className="text-sm font-medium text-gray-700 block">Send Email</span>
                  <span className="text-xs text-gray-500">Send via email service.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
