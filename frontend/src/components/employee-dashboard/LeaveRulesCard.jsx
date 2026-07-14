import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

export default function LeaveRulesCard({ inProbation, availablePaid, monthsSinceJoining }) {
  const percentageUsed = inProbation ? 0 : (availablePaid === 0 ? 100 : 0);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex-1 hover:shadow-md transition-shadow duration-300 group">
      <h3 className="text-[17px] font-bold text-gray-800 flex items-center gap-2 mb-3.5">
        <AlertCircle className="w-[18px] h-[18px] text-[#7e57c2]" /> 
        Your Leave Policy
      </h3>

      {inProbation ? (
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-3.5">
          <p className="text-orange-800 text-[15px] font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> You are in Probation
          </p>
          <p className="text-orange-700 text-[13px] mt-1.5">
            During your first 6 months, you are only eligible for <span className="font-bold">Unpaid Leave</span>. 
            Paid leaves will unlock after probation. ({monthsSinceJoining} months completed)
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-800 text-[15px] font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Paid Leave Balance
            </p>
            <span className="text-[13px] font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
              {availablePaid} left
            </span>
          </div>
          
          {/* Progress Bar Container */}
          <div className="w-full bg-green-200 rounded-full h-2.5 mb-2 mt-4 overflow-hidden relative">
            <div 
              className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${percentageUsed > 0 ? 'bg-amber-500' : 'bg-green-500'}`} 
              style={{ width: `${percentageUsed}%` }}
            ></div>
          </div>
          
          <p className="text-green-700 text-sm mt-3 flex justify-between">
            <span>Quota: Accrues 1 leave/month</span>
          </p>
        </div>
      )}
    </div>
  );
}
