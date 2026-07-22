import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const useLoginForm = () => {
    console.log("[Frontend Component] Rendering useLoginForm in useLoginForm.js");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { user, role, login } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
        console.log("[Frontend Effect] Triggered in useLoginForm.js");
    if (user) {
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, role, navigate]);

  const handleLogin = async (e) => {
    console.log("[Frontend Async] Executing handleLogin in useLoginForm.js");
    e.preventDefault();
    setLoading(true);
    
    const { error, requireOtp } = await login(email, password);

    if (requireOtp) {
      toast.error("Email not verified. A new OTP has been sent to your email.");
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      setLoading(false);
      return;
    }

    if (error) {
      toast.error(error);
      setLoading(false);
    } else {
      toast.success("Welcome back!");
      // Wait for useEffect to navigate based on role
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    showPassword,
    setShowPassword,
    handleLogin
  };
};
