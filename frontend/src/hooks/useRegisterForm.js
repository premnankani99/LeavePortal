import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const useRegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { user, role, register } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, role, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error, data } = await register(fullName, email, password);

      if (error) {
        toast.error(error);
        console.error("SignUp Error:", error);
      } else {
        toast.success("Registration successful! Waiting for Admin verification.");
        // Auto redirect to home after 1 second
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (err) {
      console.error("Caught Error:", err);
      toast.error(err?.message || "A network error occurred.");
    }
    setLoading(false);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    loading,
    showPassword,
    setShowPassword,
    handleRegister
  };
};
