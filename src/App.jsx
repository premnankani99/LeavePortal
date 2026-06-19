import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { LeaveProvider } from './context/LeaveContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import './App.css';

import PendingVerification from './pages/PendingVerification';
import AdminRequests from './pages/AdminRequests';
import AdminAuditLogs from './pages/AdminAuditLogs';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Component to protect routes
const queryClient = new QueryClient();
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, role, isVerified } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  // Enforce pending verification
  if (role !== 'Admin' && !isVerified) {
    return <PendingVerification />;
  }

  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <LeaveProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes wrapped in Layout */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout><EmployeeDashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin>
                    <Layout><AdminDashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute requireAdmin>
                    <Layout><div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">Holiday Settings (Coming Soon)</div></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/requests" element={
                  <ProtectedRoute requireAdmin>
                    <Layout><AdminRequests /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/audit-logs" element={
                  <ProtectedRoute requireAdmin>
                    <Layout><AdminAuditLogs /></Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
          </LeaveProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
