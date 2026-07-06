import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/config';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ye check karega ki pehle se koi user login hai ya nahi
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setRole(parsedUser.role);
      setIsVerified(parsedUser.verification_status === 'approved');
      setVerificationStatus(parsedUser.verification_status || 'pending');
      
      // Silently fetch fresh data in background to keep context updated
      refreshUser();
    }
    setLoading(false);
  }, []);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const { user: updatedUser } = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setRole(updatedUser.role);
        setIsVerified(updatedUser.verification_status === 'approved');
        setVerificationStatus(updatedUser.verification_status || 'pending');
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403 && data.requireOtp) {
          return { data, error: null, requireOtp: true };
        }
        throw new Error(data.error);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setRole(data.user.role);
      setIsVerified(data.user.verification_status === 'approved');
      setVerificationStatus(data.user.verification_status || 'pending');

      return { data, error: null, requireOtp: false };
    } catch (error) {
      return { data: null, error: error.message, requireOtp: false };
    }
  };

  const register = async (full_name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, email, password })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      if (data.requireOtp) {
        return { data, error: null, requireOtp: true };
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setRole(data.user.role);
      setIsVerified(data.user.verification_status === 'approved');
      setVerificationStatus(data.user.verification_status || 'pending');

      return { data, error: null, requireOtp: false };
    } catch (error) {
      return { data: null, error: error.message, requireOtp: false };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setRole(data.user.role);
      setIsVerified(data.user.verification_status === 'approved');
      setVerificationStatus(data.user.verification_status || 'pending');

      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRole(null);
    setIsVerified(false);
    setVerificationStatus('pending');
  };

  return (
    <AuthContext.Provider value={{ user, role, isVerified, verificationStatus, loading, login, register, verifyOtp, forgotPassword, resetPassword, logout, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
