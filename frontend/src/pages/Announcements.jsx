import AnnouncementModal from '../components/AnnouncementModal';
import { useAnnouncementsFeed } from '../hooks/useAnnouncementsFeed';
import AnnouncementsHeader from '../components/announcements/AnnouncementsHeader';
import AnnouncementFeedList from '../components/announcements/AnnouncementFeedList';

export default function Announcements() {
  const {
    isLoading,
    filtered,
    selectedAnn,
    setSelectedAnn,
    filterCat,
    setFilterCat,
    search,
    setSearch
  } = useAnnouncementsFeed();

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col space-y-6 font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {selectedAnn && (
        <AnnouncementModal 
          announcement={selectedAnn} 
          onClose={() => setSelectedAnn(null)} 
        />
      )}

      <AnnouncementsHeader 
        search={search}
        setSearch={setSearch}
        filterCat={filterCat}
        setFilterCat={setFilterCat}
      />

      <AnnouncementFeedList 
        isLoading={isLoading}
        filtered={filtered}
        onSelect={setSelectedAnn}
      />
    </div>
  );
}
