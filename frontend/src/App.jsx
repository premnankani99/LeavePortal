import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeLeaves from './pages/EmployeeLeaves';
import ApplyLeave from './pages/ApplyLeave';
import EmployeeCompOff from './pages/EmployeeCompOff';
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
import AdminEmployeeDetail from './pages/AdminEmployeeDetail';
import AdminCompOff from './pages/AdminCompOff';
import AdminApplyLeave from './pages/AdminApplyLeave';
import Holidays from './pages/Holidays';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import LeaveCalendar from './pages/LeaveCalendar';
import HRDashboard from './pages/hr/HRDashboard';
import HREmployees from './pages/hr/HREmployees';
import HREmployeeDetail from './pages/hr/HREmployeeDetail';
import HRLeaveHistory from './pages/hr/HRLeaveHistory';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Component to protect routes
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents "baar baar api call" when switching tabs
      retry: 1, // Reduces red marks in network tab (fails fast instead of retrying 3 times)
      staleTime: 5 * 60 * 1000, // Caches data for 5 minutes
    },
  },
});
const ProtectedRoute = ({ children, allowedRoles }) => {
    console.log("[Frontend Component] Rendering ProtectedRoute in App.jsx");
  const { user, role, isVerified } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Fallback redirects based on role
    if (role?.toLowerCase() === 'hr') return <Navigate to="/hr/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  // Enforce pending verification for non-admins and non-hr (only employees go through standard verification blocker in this app context, though we might want to block HR too if they need verification. For now, let's block anyone not admin if unverified)
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
                  <ProtectedRoute allowedRoles={['employee', 'admin']}>
                    <Layout><EmployeeDashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/leaves" element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <Layout><EmployeeLeaves /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/apply-leave" element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <Layout><ApplyLeave /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/my-comp-offs" element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <Layout><EmployeeCompOff /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/holidays" element={
                  <ProtectedRoute allowedRoles={['employee', 'admin', 'hr']}>
                    <Layout><Holidays /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute allowedRoles={['employee', 'admin', 'hr']}>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute allowedRoles={['employee', 'admin', 'hr']}>
                    <Layout><Notifications /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout><AdminDashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/employees" element={<ProtectedRoute allowedRoles={['admin', 'hr']}><Layout><AdminEmployees /></Layout></ProtectedRoute>} />
                <Route path="/admin/employees/:employeeId" element={<ProtectedRoute allowedRoles={['admin', 'hr']}><Layout><AdminEmployeeDetail /></Layout></ProtectedRoute>} />
                <Route path="/admin/leave-queue" element={<ProtectedRoute allowedRoles={['admin', 'hr']}><Layout><AdminLeaveQueue /></Layout></ProtectedRoute>} />
                <Route path="/admin/verification-queue" element={<ProtectedRoute allowedRoles={['admin', 'hr']}><Layout><AdminVerificationQueue /></Layout></ProtectedRoute>} />
                <Route path="/admin/comp-off" element={<ProtectedRoute allowedRoles={['admin', 'hr']}><Layout><AdminCompOff /></Layout></ProtectedRoute>} />
                <Route path="/admin/apply-leave" element={<ProtectedRoute allowedRoles={['admin', 'hr']}><Layout><AdminApplyLeave /></Layout></ProtectedRoute>} />
                <Route path="/admin/away" element={<ProtectedRoute allowedRoles={['admin', 'hr']}><Layout><LeaveCalendar /></Layout></ProtectedRoute>} />

                {/* HR Routes */}
                <Route path="/hr/dashboard" element={
                  <ProtectedRoute allowedRoles={['hr']}>
                    <Layout><HRDashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/hr/employees" element={
                  <ProtectedRoute allowedRoles={['hr']}>
                    <Layout><HREmployees /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/hr/employees/:employeeId" element={
                  <ProtectedRoute allowedRoles={['hr']}>
                    <Layout><HREmployeeDetail /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/hr/history" element={
                  <ProtectedRoute allowedRoles={['hr']}>
                    <Layout><HRLeaveHistory /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/hr/away" element={
                  <ProtectedRoute allowedRoles={['admin', 'hr']}>
                    <Layout><LeaveCalendar /></Layout>
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
