import React, { useState } from 'react';
import { useAdminEmployees } from '../../hooks/useAdminEmployees';
import { useCompOffHistory } from '../../hooks/useCompOff';
import { Search, TrendingUp, Users, X, Calendar } from 'lucide-react';

export default function CompOffBalanceOverview() {
  const { filteredEmployees, isLoading } = useAdminEmployees();
  const { data: compOffHistory = [] } = useCompOffHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Filter only employees, not HR/Admins
  const employees = filteredEmployees?.filter(e => e.role === 'employee') || [];
  
  // Apply local search
  const displayed = employees.filter(e => 
    e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmployeeCompOffs = (empId) => {
    console.log("[Frontend Component] Rendering getEmployeeCompOffs in CompOffBalanceOverview.jsx");
    return compOffHistory.filter(c => c.employeeId === empId);
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-[400px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-[#7e57c2] rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Employee Balance Overview</h3>
              <p className="text-sm text-gray-500">Quickly check leave balances across the team</p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#7e57c2] focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <Users className="w-8 h-8 text-gray-300" />
                <p className="text-gray-400 text-sm">Loading balances...</p>
              </div>
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              No employees found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayed.map(emp => {
                const percentage = Math.min((emp.available_leaves / (emp.total_leaves || 20)) * 100, 100);
                const isHigh = emp.available_leaves > 15;
                
                return (
                  <div 
                    key={emp.id} 
                    onClick={() => setSelectedEmployee(emp)}
                    className="p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-[#7e57c2] transition-colors">{emp.full_name}</p>
                        <p className="text-xs text-gray-500">{emp.designation || 'Employee'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${isHigh ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-[#7e57c2]'}`}>
                        {emp.available_leaves} days
                      </span>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Available</span>
                        <span>{emp.total_leaves} Total</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${isHigh ? 'bg-green-500' : 'bg-[#7e57c2]'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.full_name}</h3>
                <p className="text-sm text-gray-500">{selectedEmployee.designation || 'Employee'}</p>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-auto custom-scrollbar flex-1">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl mb-6">
                <div>
                  <p className="text-sm font-medium text-purple-900">Total Available Balance</p>
                  <p className="text-xs text-purple-700/70 mt-1">Includes monthly quota and comp-offs</p>
                </div>
                <div className="text-2xl font-black text-[#7e57c2]">
                  {selectedEmployee.available_leaves} <span className="text-base font-medium">days</span>
                </div>
              </div>

              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7e57c2]" />
                Comp-Off Grant History
              </h4>
              
              <div className="space-y-3">
                {getEmployeeCompOffs(selectedEmployee.id).length === 0 ? (
                  <div className="text-center p-6 border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm">
                    No comp-offs have been granted to this employee yet.
                  </div>
                ) : (
                  getEmployeeCompOffs(selectedEmployee.id).map(grant => (
                    <div key={grant.id} className="p-4 border border-gray-100 rounded-xl hover:border-purple-200 transition-colors bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900 text-sm">{grant.reason}</span>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap">
                          +{grant.daysGranted} days
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Granted on: {new Date(grant.grantedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
