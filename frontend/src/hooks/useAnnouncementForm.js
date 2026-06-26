import { useState } from 'react';
import { useCreateAnnouncement } from './useAnnouncements';
import { useToast } from '../context/ToastContext';

export const useAnnouncementForm = (onSuccessCallback) => {
  const createMutation = useCreateAnnouncement();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal',
    category: 'general',
    target_audience: 'all',
    target_department_id: '',
    is_pinned: false,
    requires_acknowledgement: false,
    send_email: false,
  });

  const resetForm = () => {
    setFormData({
      title: '', message: '', priority: 'normal', category: 'general',
      target_audience: 'all', target_department_id: '', is_pinned: false,
      requires_acknowledgement: false, send_email: false
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Announcement published successfully!");
        resetForm();
        if (onSuccessCallback) onSuccessCallback();
      },
      onError: (err) => toast.error("Failed to publish: " + err.message)
    });
  };

  return {
    formData,
    setFormData,
    handleSubmit,
    resetForm,
    isSubmitting: createMutation.isPending
  };
};
