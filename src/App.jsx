import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { USER_ROLES } from './constants/roles';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ResidentDashboard from './pages/ResidentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';

// Helper component to redirect authenticated users from / or /login to their role dashboard
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 dark:border-neutral-700 border-t-black dark:border-t-white" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === USER_ROLES.ADMIN || user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (user.role === USER_ROLES.TECHNICIAN || user.role === 'technician') {
    return <Navigate to="/technician" replace />;
  } else if (user.role === USER_ROLES.RESIDENT || user.role === 'resident') {
    return <Navigate to="/resident" replace />;
  }

  return <Navigate to="/login" replace />;
};

// Login Route Guard - If already logged in, redirect to appropriate dashboard
const PublicLoginRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 dark:border-neutral-700 border-t-black dark:border-t-white" />
      </div>
    );
  }

  if (user) {
    if (user.role === USER_ROLES.ADMIN || user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === USER_ROLES.TECHNICIAN || user.role === 'technician') {
      return <Navigate to="/technician" replace />;
    } else if (user.role === USER_ROLES.RESIDENT || user.role === 'resident') {
      return <Navigate to="/resident" replace />;
    }
  }

  return <LoginPage />;
};

export default function App() {
  const { loading } = useAuth();

  return (
    <div
      id="app-root"
      data-app-ready={!loading ? 'true' : 'false'}
      className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-black bg-twinsoft-grid text-neutral-900 dark:text-neutral-100 transition-colors duration-200"
    >
      <Navbar />

      <main className="flex-1 pb-12 flex flex-col">
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<PublicLoginRoute />} />

          {/* Resident Protected Route */}
          <Route
            path="/resident"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.RESIDENT]}>
                <ResidentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Technician Protected Route */}
          <Route
            path="/technician"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.TECHNICIAN]}>
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Catch-All */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </main>

      <footer className="border-t border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-black/70 backdrop-blur-md py-4 text-center text-xs text-neutral-500 dark:text-neutral-500 transition-colors">
        Residential Society Complaint Management System • Facility Operations OS
      </footer>
    </div>
  );
}
