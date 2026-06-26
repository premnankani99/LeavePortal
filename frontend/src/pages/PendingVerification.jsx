import { usePendingVerification } from '../hooks/usePendingVerification';
import PendingVerificationCard from '../components/auth/PendingVerificationCard';

export default function PendingVerification() {
  const { logout } = usePendingVerification();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-6">
      <PendingVerificationCard logout={logout} />
    </div>
  );
}
