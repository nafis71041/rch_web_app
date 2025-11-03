import React, { useEffect, useState } from 'react';
import './dashboardPage.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userInfo, setUserInfo] = useState(null);
  const [summary, setSummary] = useState({
    total_pregnant_women: 0,
    total_eligible_couples: 0,
    total_children: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userRes, summaryRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/user-info`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard/summary`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setUserInfo(userRes.data.user);
        setSummary(summaryRes.data.summary);
      } catch (err) {
        // Use server-provided error message, no hardcoded fallback
        setError(err.response?.data?.message || 'Error fetching dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { state: { message: 'Logged out successfully.' } });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Always visible menu bar */}
      <div className="menu-bar">
        <button onClick={() => window.location.reload()}>Home</button>
        <button onClick={() => navigate('/change-password')}>Change Password</button>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Error banner stays visible within the dashboard */}
      {error && <div className="error-banner">{error}</div>}

      {/* User Info Section */}
      {userInfo && (
        <div className="user-info">
          <p><strong>Name:</strong> {userInfo.user_name}</p>
          <p><strong>Role:</strong> {userInfo.user_role}</p>
          <p><strong>Phone:</strong> {userInfo.phone_number}</p>

          <label><strong>Village:</strong></label>
          <select>
            {userInfo.village_list?.map((village, i) => (
              <option key={i} value={village}>{village}</option>
            ))}
          </select>
        </div>
      )}

      {/* Summary Section */}
      <div className="summary-section">
        <div className="summary-box">
          <h3>Pregnant Women</h3>
          <p>{summary.total_pregnant_women}</p>
        </div>
        <div className="summary-box">
          <h3>Eligible Couples</h3>
          <p>{summary.total_eligible_couples}</p>
        </div>
        <div className="summary-box">
          <h3>Children</h3>
          <p>{summary.total_children}</p>
        </div>
      </div>

      {/* Main Navigation Boxes */}
      <div className="main-navigation">
        <button onClick={() => navigate('/ec-registration')}>EC Registration</button>
        <button onClick={() => navigate('/ec-registration/search')}>EC Update</button>
        <button onClick={() => navigate('/pw/search')}>PW Update</button>
        <button onClick={() => navigate('/child/search')}>Child Update</button>
        {/* <button onClick={() => navigate('/anc-tracking')}>ANC Tracking</button> */}
        {/* <button onClick={() => navigate('/immunization-tracking')}>Immunization Tracking</button> */}
      </div>
    </div>
  );
};

export default DashboardPage;