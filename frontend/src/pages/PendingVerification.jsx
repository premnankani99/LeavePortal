import { useEffect } from 'react';
import { usePendingVerification } from '../hooks/usePendingVerification';
import { useAuth } from '../context/AuthContext';
import PendingVerificationCard from '../components/auth/PendingVerificationCard';

export default function PendingVerification() {
  const { logout } = usePendingVerification();
  const { refreshUser } = useAuth();

  useEffect(() => {
    // Poll the backend every 3 seconds to check if status changed
    const interval = setInterval(() => {
      refreshUser();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshUser]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-6">
      <PendingVerificationCard logout={logout} />
    </div>
  );
}
