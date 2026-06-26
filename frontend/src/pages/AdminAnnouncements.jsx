import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAllAnnouncements, useDeleteAnnouncement } from '../hooks/useAnnouncements';

import AnnouncementList from '../components/announcements/AnnouncementList';
import CreateAnnouncementModal from '../components/announcements/CreateAnnouncementModal';
import ReadTrackingModal from '../components/announcements/ReadTrackingModal';

export default function AdminAnnouncements() {
  const { data: announcements = [], isLoading } = useAllAnnouncements();
  const deleteMutation = useDeleteAnnouncement();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [readTrackingTarget, setReadTrackingTarget] = useState(null);

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: () => toast.success("Announcement deleted."),
        onError: (err) => toast.error("Failed to delete: " + err.message)
      });
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col space-y-6 font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Announcement?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmLabel="Yes, Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ReadTrackingModal 
        announcementId={readTrackingTarget} 
        onClose={() => setReadTrackingTarget(null)} 
      />

      <div className="flex justify-end mb-4">
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </div>

      <AnnouncementList 
        announcements={announcements} 
        isLoading={isLoading} 
        onDelete={setDeleteTarget} 
        onViewReads={setReadTrackingTarget} 
      />

      <CreateAnnouncementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
