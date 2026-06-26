import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/config';

const API_BASE = `${API_BASE_URL}/api/announcements`;

// Admin Hook: Get all announcements
export const useAllAnnouncements = () => {
  return useQuery({
    queryKey: ['admin_announcements'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/all`);
      if (!res.ok) throw new Error("Failed to fetch announcements");
      return res.json();
    }
  });
};

// Employee Hook: Get applicable announcements
export const useMyAnnouncements = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my_announcements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`${API_BASE}/my/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch announcements");
      return res.json();
    },
    enabled: !!user
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newAnn) => {
      const res = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAnn,
          author_id: user.id
        })
      });
      if (!res.ok) throw new Error("Failed to create announcement");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_announcements'] });
      queryClient.invalidateQueries({ queryKey: ['my_announcements'] });
    }
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Failed to delete announcement");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_announcements'] });
    }
  });
};

export const useMarkAnnouncementRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (announcementId) => {
      const res = await fetch(`${API_BASE}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcement_id: announcementId,
          employee_id: user.id
        })
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_announcements'] });
    }
  });
};

// Assuming acknowledge uses the same endpoint for now since there's no separate acknowledged_at field in Prisma schema
export const useAcknowledgeAnnouncement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (announcementId) => {
      const res = await fetch(`${API_BASE}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcement_id: announcementId,
          employee_id: user.id
        })
      });
      if (!res.ok) throw new Error("Failed to acknowledge");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_announcements'] });
    }
  });
};

export const useAnnouncementReads = (announcementId) => {
  return useQuery({
    queryKey: ['announcement_reads', announcementId],
    queryFn: async () => {
      if (!announcementId) return [];
      const res = await fetch(`${API_BASE}/${announcementId}/reads`);
      if (!res.ok) throw new Error("Failed to fetch reads");
      return res.json();
    },
    enabled: !!announcementId
  });
};
