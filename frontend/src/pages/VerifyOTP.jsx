import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/button';
import { ShieldCheck } from 'lucide-react';

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { verifyOtp, user, role } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await verifyOtp(email, otp);

    if (error) {
      toast.error(error);
      setLoading(false);
    } else {
      toast.success("Email verified successfully! You are now logged in.");
      // The useEffect in AuthContext or App will handle the redirect, but let's push to home just in case
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 bg-[#7e57c2]/10 text-[#7e57c2] rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Verify Your Email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a 6-digit OTP to <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#7e57c2] focus:border-[#7e57c2] text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="------"
                  maxLength={6}
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full bg-[#7e57c2] hover:bg-[#6c48a7]" disabled={loading || otp.length < 6}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
