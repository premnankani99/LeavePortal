import React from 'react';
import AdminApplyLeaveForm from '../components/admin/AdminApplyLeaveForm';
import { useNavigate } from 'react-router-dom';

export default function AdminApplyLeave() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate to admin leaves queue after successful submission
    navigate('/admin/leave-queue');
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 font-sans pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <AdminApplyLeaveForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
