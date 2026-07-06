import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminEmployees } from '../hooks/useAdminEmployees';
import EmployeeTable from '../components/employees/EmployeeTable';

export default function AdminEmployees() {
  const { filteredEmployees, isLoading, search, setSearch, department, setDepartment, deleteEmployee, updateEmployee } = useAdminEmployees();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col font-sans pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <div className="flex-1 min-h-0 relative z-10">
        <EmployeeTable 
          filteredEmployees={filteredEmployees}
          isLoading={isLoading}
          search={search}
          setSearch={setSearch}
          department={department}
          setDepartment={setDepartment}
          onDelete={deleteEmployee}
          onUpdate={updateEmployee}
          onRowClick={(emp) => navigate(`/admin/employees/${emp.id}`)}
        />
      </div>
    </div>
  );
}
