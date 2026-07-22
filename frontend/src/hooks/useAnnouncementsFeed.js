import { useState, useMemo } from 'react';
import { useMyAnnouncements } from './useAnnouncements';

export const useAnnouncementsFeed = () => {
    console.log("[Frontend Component] Rendering useAnnouncementsFeed in useAnnouncementsFeed.js");
  const { data: announcements = [], isLoading } = useMyAnnouncements();
  const [selectedAnn, setSelectedAnn] = useState(null);
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return announcements.filter(ann => {
      if (filterCat !== 'all' && ann.category !== filterCat) return false;
      if (search && !ann.title.toLowerCase().includes(search.toLowerCase()) && !ann.message.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [announcements, filterCat, search]);

  return {
    isLoading,
    filtered,
    selectedAnn,
    setSelectedAnn,
    filterCat,
    setFilterCat,
    search,
    setSearch
  };
};
