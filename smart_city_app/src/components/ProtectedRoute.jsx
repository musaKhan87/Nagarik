import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="max-w-md mx-auto my-12 text-center text-danger">
        Access Denied. You do not have permission to view this panel.
      </div>
    );
  }

  return children;
}
