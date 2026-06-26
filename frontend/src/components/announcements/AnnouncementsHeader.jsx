import { Search, Filter } from 'lucide-react';

export default function AnnouncementsHeader({ search, setSearch, filterCat, setFilterCat }) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Announcements Feed</h2>
        <p className="text-gray-500 mt-1">Stay updated with the latest company news and policies.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search announcements..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="policy_update">Policy Updates</option>
            <option value="holiday">Holidays</option>
            <option value="event">Events</option>
            <option value="hr_update">HR Updates</option>
          </select>
        </div>
      </div>
    </>
  );
}
