import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

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

  return children;
};

export default ProtectedRoute;
