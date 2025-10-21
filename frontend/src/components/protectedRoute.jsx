import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ allowedRoles }) => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
  const token = localStorage.getItem('token');

    if (!token) {
      setChecking(false);
      setAuthenticated(false);
      return;
    }

    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/verify-token`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.data.valid) {
          setAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthenticated(false);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  // Wait until verification completes
  if (checking) {
    return (
      <div className="loading-container">
        <div className="loading-container">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
