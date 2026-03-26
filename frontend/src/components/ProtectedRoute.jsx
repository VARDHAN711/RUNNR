import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user.token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    const redirectPath = user.role === 'customer' ? '/customer/dashboard' : '/freelancer/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
