import { Info } from 'lucide-react';

export default function LeaveBreakdownAlert({ leaveBreakdown }) {
  if (!leaveBreakdown) return null;

  return (
    <div className={`border rounded-md p-4 mt-2 ${leaveBreakdown.unpaidLeaves > 0 ? 'bg-orange-50 border-orange-200' : 'bg-[#1e293b] border-[#334155]'}`}>
      <div className="flex items-start">
        <Info className={`h-5 w-5 mr-2 mt-0.5 shrink-0 ${leaveBreakdown.unpaidLeaves > 0 ? 'text-orange-500' : 'text-[#94a3b8]'}`} />
        <div className={`text-sm ${leaveBreakdown.unpaidLeaves > 0 ? 'text-orange-800' : 'text-[#cbd5e1]'}`}>
          <p>This will count as {leaveBreakdown.totalWorkingDays} day{leaveBreakdown.totalWorkingDays !== 1 ? 's' : ''} against your leave balance.</p>
          
          {leaveBreakdown.inProbation && (
            <p className="mt-1 font-semibold text-red-600">
              ⚠️ You are in your 6-month probation period. All leaves are unpaid (Loss of Pay).
            </p>
          )}
          
          {!leaveBreakdown.inProbation && leaveBreakdown.unpaidLeaves > 0 && (
            <p className="text-orange-600 mt-1 font-semibold">
              ⚠️ Loss of Pay (LOP): {leaveBreakdown.unpaidLeaves} Day(s) 
              <span className="font-normal block text-xs mt-0.5">(You are entitled to 1 paid leave per month)</span>
            </p>
          )}
          
          {!leaveBreakdown.inProbation && leaveBreakdown.unpaidLeaves === 0 && leaveBreakdown.totalWorkingDays > 0 && (
            <p className="text-green-600 mt-1 font-semibold">
              ✓ This leave is fully paid (within your 1 per month quota).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
