import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.some(r => r.toLowerCase() === user.role?.toLowerCase())) {
    // Redirect to their respective dashboard if they try to access unauthorized role page
    const role = user.role?.toLowerCase() || '';
    
    if (role.includes('head')) return <Navigate to="/head-authority/dashboard" replace />;
    if (role.includes('citizen')) return <Navigate to="/citizen/dashboard" replace />;
    
    return <Navigate to="/" replace />;
  }

  return children;
};
