import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && profile && profile.role !== allowedRole) {
    // If they are logged in but trying to access the wrong role's dashboard
    return <Navigate to={profile.role === 'entrepreneur' ? '/entrepreneur/dashboard' : '/investor/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
