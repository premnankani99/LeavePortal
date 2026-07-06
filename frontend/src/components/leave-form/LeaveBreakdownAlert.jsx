import { Info } from 'lucide-react';

export default function LeaveBreakdownAlert({ leaveBreakdown }) {
  if (!leaveBreakdown) return null;

  return (
    <div className={`border rounded-md p-4 mt-2 ${leaveBreakdown.unpaidLeaves > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
      <div className="flex items-start">
        <Info className={`h-5 w-5 mr-2 mt-0.5 shrink-0 ${leaveBreakdown.unpaidLeaves > 0 ? 'text-red-500' : 'text-green-500'}`} />
        <div className={`text-sm ${leaveBreakdown.unpaidLeaves > 0 ? 'text-red-800' : 'text-green-800'}`}>
          {leaveBreakdown.unpaidLeaves > 0 && leaveBreakdown.paidLeavesUsed > 0 && (
            <p className="text-red-600 font-semibold">
              ⚠️ {leaveBreakdown.paidLeavesUsed} day{leaveBreakdown.paidLeavesUsed !== 1 ? 's' : ''} will be deducted from your balance, and the remaining {leaveBreakdown.unpaidLeaves} day{leaveBreakdown.unpaidLeaves !== 1 ? 's' : ''} will be Unpaid (Loss of Pay).
            </p>
          )}

          {leaveBreakdown.unpaidLeaves > 0 && leaveBreakdown.paidLeavesUsed === 0 && (
            <p className="text-red-600 font-semibold">
              ⚠️ {leaveBreakdown.unpaidLeaves} day{leaveBreakdown.unpaidLeaves !== 1 ? 's' : ''} will be counted as unpaid leave (Loss of Pay).
            </p>
          )}
          
          {leaveBreakdown.unpaidLeaves === 0 && leaveBreakdown.totalWorkingDays > 0 && (
            <p className="text-green-600 font-semibold">
              ✓ {leaveBreakdown.totalWorkingDays} day{leaveBreakdown.totalWorkingDays !== 1 ? 's' : ''} will be deducted from your balance. This leave is fully paid!
            </p>
          )}

          {leaveBreakdown.inProbation && (
            <p className={`mt-1 font-semibold ${leaveBreakdown.unpaidLeaves > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ⚠️ You are in your 6-month probation period. All leaves are unpaid (Loss of Pay).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
