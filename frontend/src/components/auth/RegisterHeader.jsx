import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function RegisterHeader() {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex justify-center text-blue-600">
        <Calendar className="w-12 h-12" />
      </div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Register New Account
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
