import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeLeaves from './pages/EmployeeLeaves';
import ApplyLeave from './pages/ApplyLeave';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import './App.css';

import PendingVerification from './pages/PendingVerification';
import AdminLeaveQueue from './pages/AdminLeaveQueue';
import AdminVerificationQueue from './pages/AdminVerificationQueue';
import AdminEmployees from './pages/AdminEmployees';
import Holidays from './pages/Holidays';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Component to protect routes
const queryClient = new QueryClient();
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, role, isVerified } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Enforce pending verification
  if (role !== 'admin' && !isVerified) {
    return <PendingVerification />;
  }

  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Protected Routes wrapped in Layout */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout><EmployeeDashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/leaves" element={
                  <ProtectedRoute>
                    <Layout><EmployeeLeaves /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/apply-leave" element={
                  <ProtectedRoute>
                    <Layout><ApplyLeave /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/holidays" element={
                  <ProtectedRoute>
                    <Layout><Holidays /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Layout><Notifications /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin>
                    <Layout><AdminDashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/employees" element={
                  <ProtectedRoute requireAdmin>
                    <Layout><AdminEmployees /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/leave-queue" element={
                  <ProtectedRoute requireAdmin>
                    <Layout><AdminLeaveQueue /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/verification-queue" element={
                  <ProtectedRoute requireAdmin>
                    <Layout><AdminVerificationQueue /></Layout>
                  </ProtectedRoute>
                } />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
