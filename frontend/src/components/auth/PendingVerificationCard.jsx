import { Button } from '../ui/button';
import { ShieldAlert, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PendingVerificationCard({ logout }) {
  const { verificationStatus } = useAuth();
  const navigate = useNavigate();
  const isRejected = verificationStatus === 'rejected';

  const handleTryAgain = () => {
    logout();
    navigate('/register');
  };

  return (
    <div className={`bg-white max-w-md w-full rounded-xl shadow-lg border p-8 text-center space-y-6 ${isRejected ? 'border-red-200' : 'border-yellow-200'}`}>
      <div className={`flex justify-center ${isRejected ? 'text-red-500' : 'text-yellow-500'}`}>
        {isRejected ? <XCircle className="w-16 h-16" /> : <ShieldAlert className="w-16 h-16" />}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isRejected ? 'Application Rejected' : 'Pending Verification'}
        </h2>
        <p className="text-gray-600 text-sm">
          {isRejected 
            ? 'Your account registration has been rejected by the Admin. You cannot access the Leave Portal at this time.' 
            : 'Your account has been created successfully, but it needs to be approved by an Admin before you can access the Leave Portal.'}
        </p>
        <p className="text-gray-500 text-sm mt-4 italic">
          {isRejected 
            ? 'You may try creating an account again or contact HR for more information.' 
            : 'Please contact your HR department or wait for an email confirmation.'}
        </p>
      </div>
      <div className="pt-4 border-t border-gray-100 flex gap-4">
        {isRejected ? (
          <Button variant="default" className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={handleTryAgain}>
            Register Again
          </Button>
        ) : (
          <Button variant="outline" className="w-full" onClick={logout}>
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
}
