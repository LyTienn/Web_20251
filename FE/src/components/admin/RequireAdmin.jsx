import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAdmin({ children }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const location = useLocation();
  const role = (user?.role || '').toUpperCase();

  if (!isAuthenticated || role !== 'ADMIN') {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}
