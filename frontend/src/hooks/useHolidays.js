import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../utils/config';
import { useAuth } from '../context/AuthContext';

export const useHolidays = () => {
    console.log("[Frontend Component] Rendering useHolidays in useHolidays.js");
  const currentYear = new Date().getFullYear();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ['holidays'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/holidays`);
      if (!res.ok) throw new Error("Failed to fetch holidays");
      const data = await res.json();
      return data.map(h => {
        const d = new Date(h.date);
        return {
          id: h.id,
          date: d,
          dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
          name: h.name,
          description: h.description,
          type: h.type
        };
      }).sort((a, b) => a.date - b.date);
    }
  });

  const addHolidayMutation = useMutation({
    mutationFn: async (holidayData) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/holidays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(holidayData)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add holiday');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['holidays']);
    }
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/holidays/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete holiday');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['holidays']);
    }
  });

  const isHolidayAdmin = user?.role === 'admin' || user?.role?.toLowerCase() === 'hr';

  return {
    currentYear,
    sortedHolidays: holidays,
    holidaysList: holidays.map(h => h.dateStr), // Array of date strings for easy checking
    isLoading,
    isHolidayAdmin,
    addHoliday: addHolidayMutation.mutateAsync,
    isAdding: addHolidayMutation.isLoading,
    deleteHoliday: deleteHolidayMutation.mutateAsync,
    isDeleting: deleteHolidayMutation.isLoading
  };
};
