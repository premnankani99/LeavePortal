import { Activity, FileText, CheckCircle, Clock, XCircle, MinusCircle } from 'lucide-react';

export default function LeaveActivityStats({ myLeavesLength, approvedLeaves, pendingLeaves, rejectedLeaves, withdrawnLeaves }) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit sticky top-6">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-[#7e57c2]" /> Leave Activity Stats</h3>
        <div className="flex flex-col gap-3.5">
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between">
            <div>
              <p className="text-[#7e57c2] text-sm font-semibold mb-0.5">Total Requests</p>
              <p className="text-2xl font-bold text-purple-900">{myLeavesLength}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-[#7e57c2]">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold mb-0.5">Approved</p>
              <p className="text-2xl font-bold text-green-900">{approvedLeaves}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-semibold mb-0.5">Pending</p>
              <p className="text-2xl font-bold text-amber-900">{pendingLeaves}</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-semibold mb-0.5">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{rejectedLeaves}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-0.5">Withdrawn</p>
              <p className="text-2xl font-bold text-gray-800">{withdrawnLeaves}</p>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              <MinusCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
