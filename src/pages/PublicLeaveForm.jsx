import LeaveForm from '../components/LeaveForm';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicLeaveForm() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl mb-8">
        <div className="flex justify-center text-blue-600 mb-4">
          <Calendar className="w-12 h-12" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Leave Application Form
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Fill out this form to apply for leave. Your request will be sent to HR.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <LeaveForm />
      </div>

      <div className="mt-12 text-center">
        <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">
          Admin Login
        </Link>
      </div>
    </div>
  );
}
