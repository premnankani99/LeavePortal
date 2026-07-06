import React from 'react';
import GrantCompOffCard from '../components/admin/GrantCompOffCard';
import CompOffHistoryTable from '../components/admin/CompOffHistoryTable';
import CompOffBalanceOverview from '../components/admin/CompOffBalanceOverview';
import CompOffRequestsTable from '../components/admin/CompOffRequestsTable';

export default function AdminCompOff() {
  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col space-y-6 font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-5">
          <GrantCompOffCard />
        </div>
        <div className="lg:col-span-2 space-y-5">
          <CompOffRequestsTable />
          <CompOffHistoryTable />
        </div>
      </div>

      <div className="mt-8">
        <CompOffBalanceOverview />
      </div>
    </div>
  );
}
