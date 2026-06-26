import { Button } from '../ui/button';
import { ShieldAlert } from 'lucide-react';

export default function PendingVerificationCard({ logout }) {
  return (
    <div className="bg-white max-w-md w-full rounded-xl shadow-lg border border-yellow-200 p-8 text-center space-y-6">
      <div className="flex justify-center text-yellow-500">
        <ShieldAlert className="w-16 h-16" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Verification</h2>
        <p className="text-gray-600 text-sm">
          Your account has been created successfully, but it needs to be approved by an Admin before you can access the Leave Portal.
        </p>
        <p className="text-gray-500 text-sm mt-4 italic">
          Please contact your HR department or wait for an email confirmation.
        </p>
      </div>
      <div className="pt-4 border-t border-gray-100">
        <Button variant="outline" className="w-full" onClick={logout}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
