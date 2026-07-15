import { useState } from 'react';
import { Gift, PlusCircle, AlertCircle, Clock, CheckCircle2, XCircle, Wallet, CalendarPlus, X, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMyCompOffs } from '../hooks/useCompOff';
import { useMyBalances, useMyRequests } from '../hooks/useLeaves';
import { useEmployeeDashboard } from '../hooks/useEmployeeDashboard';
import { Button } from '../components/ui/button';
import RequestCompOffModal from '../components/employee-dashboard/RequestCompOffModal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function EmployeeCompOff() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompOff, setSelectedCompOff] = useState(null);
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const { user } = useAuth();
  const { data: myCompOffs = [], isLoading } = useMyCompOffs();
  const { data: { available_leaves: availableLeaves = 0, comp_off_leaves: compOffLeaves = 0 } = {} } = useMyBalances();
  const { data: myRequests = [], isLoading: loadingRequests } = useMyRequests();
  const { total_leaves = 0, inProbation, monthsSinceJoining } = useEmployeeDashboard();

  const earnedCompOffs = myCompOffs
    .filter(req => req.status === 'approved')
    .reduce((sum, req) => sum + (req.daysGranted || 0), 0);

  const usedLeaves = myRequests
    .filter(req => req.status === 'approved')
    .reduce((sum, req) => sum + (req.total_days || 0), 0);
    
  const standardLeavesEarned = total_leaves;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Approved</span>;
      case 'rejected': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Rejected</span>;
      default: return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-[#7e57c2]">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Comp-Offs</h1>
            <p className="text-sm text-gray-500">Track and request your compensatory time off.</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#7e57c2] hover:bg-[#6b48a8] text-white rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all px-6"
        >
          <PlusCircle className="w-5 h-5" /> Request Comp-Off
        </Button>
      </div>

      {/* Leave Account Passbook Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 md:p-8 overflow-hidden relative">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-50 to-transparent rounded-full -mr-32 -mt-32 opacity-50 pointer-events-none"></div>
        
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-[#7e57c2]">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Leave Account</h2>
            <p className="text-sm text-gray-500">A simple breakdown of how your current balance is calculated.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 relative z-10 mx-auto max-w-5xl">
          
          {/* Card 1: Monthly Leaves */}
          <div 
            onClick={() => setIsMonthlyModalOpen(true)}
            className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col items-center text-center transform scale-[0.99] hover:scale-100 transition-all cursor-pointer hover:border-blue-300 hover:shadow-md relative group"
          >
            <div className="absolute top-3 right-3 text-blue-300 group-hover:text-blue-500 transition-colors">
              <Info className="w-4 h-4" />
            </div>
            <CalendarPlus className="w-5 h-5 text-blue-500 mb-1.5" />
            <h3 className="text-sm font-bold text-gray-700">Monthly Leaves ({new Date().toLocaleString('en-US', { month: 'long' })})</h3>
            <p className="text-[11px] text-gray-500 mb-2 leading-tight h-6">Active leaves for this month</p>
            <div className="text-3xl font-black text-gray-800">{isLoading || loadingRequests ? <Clock className="w-5 h-5 animate-spin text-gray-400" /> : availableLeaves}</div>
          </div>

          {/* Card 2: Comp-Offs */}
          <div 
            onClick={() => setIsSummaryModalOpen(true)}
            className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col items-center text-center relative transform scale-[0.99] hover:scale-100 transition-all cursor-pointer hover:border-emerald-300 hover:shadow-md group"
          >
            <div className="absolute top-3 right-3 text-emerald-300 group-hover:text-emerald-500 transition-colors">
              <Info className="w-4 h-4" />
            </div>
            <div className="hidden md:flex absolute -left-3 md:-left-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border border-gray-100 items-center justify-center text-gray-400 font-bold z-20 shadow-sm text-sm">+</div>
            <Gift className="w-5 h-5 text-emerald-500 mb-1.5" />
            <h3 className="text-sm font-bold text-gray-700">Extra Comp-Offs</h3>
            <p className="text-[11px] text-gray-500 mb-2 leading-tight h-6">Available days from extra work</p>
            <div className="text-3xl font-black text-gray-800">{isLoading ? <Clock className="w-5 h-5 animate-spin text-gray-400" /> : compOffLeaves}</div>
          </div>

          {/* Card 3: Final Balance */}
          <div className="bg-gradient-to-br from-[#7e57c2] to-[#6b48a8] shadow-lg rounded-xl p-4 flex flex-col items-center text-center relative transform md:scale-[1.02] transition-transform">
            <div className="hidden md:flex absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-gray-100 items-center justify-center text-[#7e57c2] font-black z-20 shadow-sm text-sm">=</div>
            <CheckCircle2 className="w-5 h-5 text-white mb-1.5" />
            <h3 className="text-sm font-bold text-white">Current Balance</h3>
            <p className="text-[11px] text-purple-200 mb-2 leading-tight h-6">Total days you can take off right now</p>
            <div className="text-4xl font-black text-white">{availableLeaves + compOffLeaves}</div>
          </div>
          
        </div>
      </div>

      {/* History List */}
      <Card className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <CardHeader className="border-b border-gray-50 bg-gray-50/50">
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Request History
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">{myCompOffs.length}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7e57c2]"></div>
            </div>
          ) : myCompOffs.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">No Comp-Offs requested yet</p>
              <p className="text-sm text-gray-400 mt-1">When you request a comp-off, it will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {myCompOffs.map((req) => (
                <div 
                  key={req.id} 
                  onClick={() => setSelectedCompOff(req)}
                  className="p-5 hover:bg-purple-50/50 transition-all flex flex-col sm:flex-row gap-4 justify-between sm:items-center cursor-pointer group rounded-xl m-2 border border-transparent hover:border-purple-100 shadow-sm hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(req.status)}
                      <h4 className="font-bold text-gray-900 text-lg group-hover:text-[#7e57c2] transition-colors">{req.daysGranted} Days Requested</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8 truncate max-w-sm">
                      <span className="font-medium text-gray-700">Worked Dates:</span> {req.workedDates && Array.isArray(req.workedDates) ? req.workedDates.map(d => new Date(d).toLocaleDateString()).join(', ') : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 ml-8 truncate max-w-sm">
                      <span className="font-medium text-gray-700">Reason:</span> {req.reason}
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-3 ml-8 sm:ml-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(req.status)}
                      <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#7e57c2] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition-colors border border-purple-100">
                        View Details <PlusCircle className="w-3 h-3" />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      Requested on {new Date(req.createdAt || req.grantedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <div className="sm:hidden flex items-center gap-1 text-xs font-bold text-[#7e57c2] mt-1 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100 w-max">
                        View Details &rarr;
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RequestCompOffModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Details Modal */}
      {selectedCompOff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedCompOff(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#7e57c2] p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Comp-Off Passbook Detail</h3>
                <p className="text-purple-200 text-xs">Request tracking timeline</p>
              </div>
              <button onClick={() => setSelectedCompOff(null)} className="text-purple-200 hover:text-white transition-colors bg-white/10 rounded-full p-1.5"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500 font-medium">Current Status</span>
                {getStatusBadge(selectedCompOff.status)}
              </div>

              <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
                
                {/* Step 1: Requested */}
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-[#7e57c2] rounded-full -left-[29px] top-1.5 ring-4 ring-white"></div>
                  <p className="text-xs text-gray-400 font-bold mb-1 uppercase">Step 1: Request Created</p>
                  <p className="text-sm font-semibold text-gray-900">Requested {selectedCompOff.daysRequested} Days</p>
                  <p className="text-sm text-gray-500 mt-1">On {new Date(selectedCompOff.createdAt || selectedCompOff.grantedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  <div className="bg-gray-50 p-3 rounded-lg mt-2 text-sm text-gray-700 border border-gray-100">
                    <span className="font-semibold block text-xs text-gray-400 mb-1">REASON GIVEN</span>
                    {selectedCompOff.reason}
                  </div>
                </div>

                {/* Step 2: Action Taken */}
                {selectedCompOff.status !== 'pending' && (
                  <div className="relative">
                    <div className={`absolute w-3 h-3 ${selectedCompOff.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'} rounded-full -left-[29px] top-1.5 ring-4 ring-white`}></div>
                    <p className="text-xs text-gray-400 font-bold mb-1 uppercase">Step 2: Admin Action</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedCompOff.status === 'approved' ? 'Request Approved' : 'Request Rejected'}
                    </p>
                    {selectedCompOff.status === 'approved' && (
                      <p className="text-sm font-medium text-emerald-600 mt-1">+ {selectedCompOff.daysGranted} Days credited to overall balance</p>
                    )}
                    {selectedCompOff.adminNote && (
                      <div className="bg-yellow-50 p-3 rounded-lg mt-2 text-sm text-gray-700 border border-yellow-100">
                        <span className="font-semibold block text-xs text-yellow-600 mb-1">ADMIN REMARK</span>
                        {selectedCompOff.adminNote}
                      </div>
                    )}
                  </div>
                )}
                
              </div>
              
              {selectedCompOff.status === 'approved' && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <strong>Note:</strong> Approved Comp-Off days are automatically merged into your unified "Leave Balance" pool. Whenever you apply for a leave, days will be deducted from your total balance.
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-50 bg-gray-50 flex justify-end">
              <Button onClick={() => setSelectedCompOff(null)} variant="outline">Close</Button>
            </div>
          </div>
        </div>
      )}
      {/* Monthly Leaves Modal */}
      {isMonthlyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsMonthlyModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-blue-600 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CalendarPlus className="w-6 h-6 text-blue-200" />
                <div>
                  <h3 className="font-bold text-lg">Monthly Leaves Status</h3>
                  <p className="text-blue-200 text-xs">For {new Date().toLocaleString('en-US', { month: 'long' })}</p>
                </div>
              </div>
              <button onClick={() => setIsMonthlyModalOpen(false)} className="text-blue-200 hover:text-white transition-colors bg-white/10 rounded-full p-1.5"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6">
              {inProbation ? (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-4 text-center space-y-3">
                  <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-orange-800 text-lg">Under Probation</h4>
                  <p className="text-sm text-orange-700 leading-relaxed">
                    You are currently in your 6-month probation period ({monthsSinceJoining} months completed). Standard monthly leaves are not credited until probation is successfully completed.
                  </p>
                  <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mt-2 pt-3 border-t border-orange-200">
                    Expected Allowance: 1 Day/Month
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-4 text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-blue-800 text-lg">Leave Credited</h4>
                  <p className="text-sm text-blue-700 leading-relaxed mb-2">
                    Your current Monthly Leave balance is <strong>{availableLeaves} day(s)</strong>.
                  </p>
                  <p className="text-xs text-blue-600 leading-relaxed bg-blue-100/50 p-2 rounded-lg">
                    Your standard monthly allowance is <strong>{standardLeavesEarned} day(s)</strong> per month. 
                  </p>
                </div>
              )}

              <div className="text-center text-xs text-gray-500 mt-6 px-4">
                Note: The company automatically processes standard allowances on the 1st of every month for non-probationary employees.
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-50 bg-gray-50 flex justify-end">
              <Button onClick={() => setIsMonthlyModalOpen(false)} variant="outline">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Extra Comp-Offs Summary Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsSummaryModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-emerald-600 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-lg">Comp-Off Ledger</h3>
                  <p className="text-emerald-200 text-xs">Summary of your earned days</p>
                </div>
              </div>
              <button onClick={() => setIsSummaryModalOpen(false)} className="text-emerald-200 hover:text-white transition-colors bg-white/10 rounded-full p-1.5"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-500"/> Total Earned Lifetime
                </span>
                <span className="text-lg font-bold text-gray-900">{earnedCompOffs}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400"/> Days Used/Deducted
                </span>
                <span className="text-lg font-bold text-red-500">- {earnedCompOffs - Math.max(0, availableLeaves - standardLeavesEarned)}</span>
              </div>
              
              <div className="flex justify-between items-center py-4 bg-emerald-50 px-4 rounded-xl mt-2 border border-emerald-100">
                <span className="text-emerald-800 font-bold">Active Available Balance</span>
                <span className="text-2xl font-black text-emerald-600">{Math.max(0, availableLeaves - standardLeavesEarned)}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl mt-4 text-sm text-gray-600 border border-gray-100">
                <p>When you take a leave, days are deducted from your unified balance. This ledger estimates your comp-off usage based on total lifetime earnings versus your current active balance.</p>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-50 bg-gray-50 flex justify-end">
              <Button onClick={() => setIsSummaryModalOpen(false)} variant="outline">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
