import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && profile) {
    const userRole = (profile.role || '').toLowerCase();
    const targetRole = allowedRole.toLowerCase();

    const isAdmin = userRole === 'super_admin' || userRole === 'admin';

    if (targetRole === 'super_admin' || targetRole === 'admin') {
      if (!isAdmin) {
        return <Navigate to={userRole === 'entrepreneur' ? '/entrepreneur/dashboard' : '/investor/dashboard'} replace />;
      }
    } else if (userRole !== targetRole && !isAdmin) {
      return <Navigate to={userRole === 'entrepreneur' ? '/entrepreneur/dashboard' : '/investor/dashboard'} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
