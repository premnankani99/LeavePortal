import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminEmployees } from '../../hooks/useAdminEmployees';
import EmployeeTable from '../../components/employees/EmployeeTable';
import AttendanceTable from '../../components/employees/AttendanceTable';

export default function HREmployees() {
  const navigate = useNavigate();
  const { filteredEmployees, isLoading, search, setSearch, department, setDepartment } = useAdminEmployees();
  const [viewMode, setViewMode] = useState('directory'); // 'directory' | 'attendance'

  // Handle row click to navigate to the detailed employee view
  const handleRowClick = (employee) => {
    navigate(`/hr/employees/${employee.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col space-y-6 font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex-1 min-h-0 relative z-10">
        <div className="bg-white p-6 border-b border-gray-100 rounded-t-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Directory & Attendance</h1>
            <p className="text-sm text-gray-500 mt-1">View employees or check their recent attendance performance.</p>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('directory')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'directory' ? 'bg-white text-[#7e57c2] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Directory
            </button>
            <button 
              onClick={() => setViewMode('attendance')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'attendance' ? 'bg-white text-[#7e57c2] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Attendance
            </button>
          </div>
        </div>
        <div className="bg-white border-b border-gray-100 rounded-b-2xl shadow-sm pb-4 pt-2">
          {viewMode === 'directory' ? (
            <EmployeeTable 
              filteredEmployees={filteredEmployees}
              isLoading={isLoading}
              search={search}
              setSearch={setSearch}
              department={department}
              setDepartment={setDepartment}
              readOnly={true}
              onRowClick={handleRowClick}
            />
          ) : (
            <AttendanceTable
              employees={filteredEmployees}
              isLoading={isLoading}
              search={search}
              setSearch={setSearch}
              onRowClick={handleRowClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
