import { Activity, FileText, CheckCircle, Clock } from 'lucide-react';

export default function LeaveActivityStats({ myLeavesLength, approvedLeaves, pendingLeaves }) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-[#7e57c2]" /> Leave Activity Stats</h3>
        <div className="flex flex-col gap-5">
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-base font-semibold mb-1">Total Requests</p>
              <p className="text-4xl font-bold text-purple-900">{myLeavesLength}</p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-purple-500">
              <FileText className="w-7 h-7" />
            </div>
          </div>
          <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex items-center justify-between">
            <div>
              <p className="text-green-600 text-base font-semibold mb-1">Approved</p>
              <p className="text-4xl font-bold text-green-900">{approvedLeaves}</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-500">
              <CheckCircle className="w-7 h-7" />
            </div>
          </div>
          <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-base font-semibold mb-1">Pending</p>
              <p className="text-4xl font-bold text-amber-900">{pendingLeaves}</p>
            </div>
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
              <Clock className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
