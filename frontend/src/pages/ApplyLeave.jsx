import React from 'react';
import LeaveForm from '../components/LeaveForm';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ApplyLeave() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate to leave history after successful submission
    navigate('/leaves');
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 font-sans pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">


      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <LeaveForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
