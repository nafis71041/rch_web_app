// DashboardPage.jsx
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
      <div className="page page--loading">
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page page--dashboard">
      <nav className="nav">
        <div className="nav-container">
          <a href="/" className="nav-logo">Dashboard</a>
          <ul className="nav-links">
            <li><button className="nav-btn" onClick={() => window.location.reload()}>Home</button></li>
            <li><button className="nav-btn" onClick={() => navigate('/change-password')}>Change Password</button></li>
            <li><button className="nav-btn" onClick={handleLogout}>Logout</button></li>
          </ul>
        </div>
      </nav>

      <main className="section section--dashboard">
        {error && <div className="banner banner--error">{error}</div>}

        {userInfo && (
          <section className="user-section">
            <div className="user-card user-card--wide">
              <h2 className="user-title">User Information</h2>
              <div className="user-details">
                <p><strong>Name:</strong> {userInfo.user_name}</p>
                <p><strong>Role:</strong> {userInfo.user_role}</p>
                <p><strong>Phone:</strong> {userInfo.phone_number}</p>

                <label className="label"><strong>Village:</strong></label>
                <select className="dropdown">
                  {userInfo.village_list?.map((village, i) => (
                    <option key={i} value={village}>{village}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        <section className="summary-section">
          <div className="summary-header">
            <h2 className="summary-title">Summary</h2>
          </div>
          <div className="summary-grid">
            <div className="summary-box">
              <h3 className="summary-label">Pregnant Women</h3>
              <p className="summary-value">{summary.total_pregnant_women}</p>
            </div>
            <div className="summary-box">
              <h3 className="summary-label">Eligible Couples</h3>
              <p className="summary-value">{summary.total_eligible_couples}</p>
            </div>
            <div className="summary-box">
              <h3 className="summary-label">Children</h3>
              <p className="summary-value">{summary.total_children}</p>
            </div>
          </div>
        </section>

        <section className="navigation-section">
          <h2 className="navigation-title">Actions</h2>
          <div className="navigation-grid">
            <button className="nav-action-btn" onClick={() => navigate('/ec-registration')}>EC Registration</button>
            <button className="nav-action-btn" onClick={() => navigate('/ec-registration/search')}>EC Update</button>
            <button className="nav-action-btn" onClick={() => navigate('/pw/search')}>PW Update</button>
            <button className="nav-action-btn" onClick={() => navigate('/child/search')}>Child Immunization Update</button>
          </div>
        </section>
      </main>

      <footer className="footer footer--dashboard">
        <p>© 2025 Matrima</p>
      </footer>
    </div>
  );
};

export default DashboardPage;
