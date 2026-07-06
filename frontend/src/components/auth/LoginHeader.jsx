import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function LoginHeader() {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex justify-center text-[#7e57c2]">
        <Calendar className="w-12 h-12" />
      </div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to Leave Portal
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Or{' '}
        <Link to="/register" className="font-medium text-[#7e57c2] hover:text-[#7e57c2]">
          register a new employee account
        </Link>
      </p>
    </div>
  );
}
