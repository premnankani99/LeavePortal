import { Filter } from 'lucide-react';

export default function LeaveHistoryHeader({ statusFilter, setStatusFilter, typeFilter, setTypeFilter, leaveTypes }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <h2 className="text-lg font-bold text-gray-900">Request History</h2>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 text-gray-600 bg-white focus:ring-2 focus:ring-[#9b72e5] focus:border-transparent outline-none"
        >
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Withdrawn</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 text-gray-600 bg-white focus:ring-2 focus:ring-[#9b72e5] focus:border-transparent outline-none"
        >
          <option value="All">All Types</option>
          {leaveTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      </div>
    </div>
  );
}
