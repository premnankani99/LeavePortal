import { useState } from 'react';
import { useEmployeeLeaves } from '../hooks/useEmployeeLeaves';
import PartialWithdrawModal from '../components/requests/PartialWithdrawModal';
import LeaveHistoryHeader from '../components/employee-leaves/LeaveHistoryHeader';
import LeaveHistoryTable from '../components/employee-leaves/LeaveHistoryTable';
import LeaveDetailsModal from '../components/requests/LeaveDetailsModal';

export default function EmployeeLeaves() {
  const [selectedLeave, setSelectedLeave] = useState(null);
  const {
    loadingLeaves,
    leaveTypes,
    withdrawMutation,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    withdrawTarget,
    setWithdrawTarget,
    handleWithdraw,
    handleAdjust,
    adjustMutation,
    user,
    filteredLeaves
  } = useEmployeeLeaves();

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
      
      {withdrawTarget && (
        <PartialWithdrawModal 
          leave={withdrawTarget}
          onClose={() => setWithdrawTarget(null)}
          onConfirm={handleWithdraw}
          isProcessing={withdrawMutation.isPending}
        />
      )}

      {selectedLeave && (
        <LeaveDetailsModal 
          request={selectedLeave} 
          onClose={() => setSelectedLeave(null)} 
        />
      )}

      <LeaveHistoryHeader 
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        leaveTypes={leaveTypes}
      />

      <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <LeaveHistoryTable 
          loadingLeaves={loadingLeaves}
          filteredLeaves={filteredLeaves}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          setWithdrawTarget={setWithdrawTarget}
          isWithdrawing={withdrawMutation.isPending}
          handleAdjust={handleAdjust}
          isAdjusting={adjustMutation.isPending}
          user={user}
          onViewDetails={setSelectedLeave}
        />
      </div>

    </div>
  );
}
