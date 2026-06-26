import { Users, Search } from 'lucide-react';

export default function EmployeeDirectoryHeader({ search, setSearch }) {
  return (
    <div className="flex justify-end gap-4 border-b border-gray-100 pb-4">
      <div className="relative w-full sm:w-64">
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#9b72e5] focus:border-transparent outline-none transition-all shadow-sm"
        />
      </div>
    </div>
  );
}
