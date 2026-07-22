import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/button';
import { KeyRound, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    console.log("[Frontend Async] Executing handleSubmit in ForgotPassword.jsx");
    e.preventDefault();
    setLoading(true);

    const { error } = await forgotPassword(email);

    if (error) {
      toast.error(error);
      setLoading(false);
    } else {
      toast.success("If your email is registered, you will receive an OTP shortly.");
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 bg-[#7e57c2]/10 text-[#7e57c2] rounded-full flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Reset your password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email and we'll send you a 6-digit OTP to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#7e57c2] focus:border-[#7e57c2] sm:text-sm"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full bg-[#7e57c2] hover:bg-[#6c48a7]" disabled={loading || !email}>
                {loading ? 'Sending...' : 'Send Reset OTP'}
              </Button>
            </div>
            
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-[#7e57c2] hover:text-[#5e35b1] flex items-center justify-center w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
