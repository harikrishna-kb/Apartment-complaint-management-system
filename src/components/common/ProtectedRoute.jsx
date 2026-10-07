import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLES } from '../../constants/roles';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 dark:border-neutral-700 border-t-black dark:border-t-white" />
      </div>
    );
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their own valid dashboard instead of rendering blank or looping
    if (user.role === 'resident' || user.role === USER_ROLES.RESIDENT) {
      return <Navigate replace to="/resident" />;
    }
    if (user.role === 'technician' || user.role === USER_ROLES.TECHNICIAN) {
      return <Navigate replace to="/technician" />;
    }
    if (user.role === 'admin' || user.role === USER_ROLES.ADMIN) {
      return <Navigate replace to="/admin" />;
    }
    return <Navigate replace to="/login" />;
  }

  return children;
}
