import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './changePasswordPage.css';

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const successTimer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(successTimer);
    }
  }, [success]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.new_password !== formData.confirm_new_password) {
      setError('New password and confirm password do not match');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/change-password`,
        {
          current_password: formData.current_password,
          new_password: formData.new_password
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess(response.data.message);
      setFormData({ current_password: '', new_password: '', confirm_new_password: '' });

    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/', { state: { message: 'Session expired. Please login again.' }, replace: true });
        return;
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Password change failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <main className="page--changepw">
      <nav className="nav--pw">
        <div className="nav-container">
          <a href="/" className="nav-logo">MySite</a>
          <div className="nav-links">
            <button className="nav-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="nav-btn active">Change Password</button>
          </div>
        </div>
      </nav>

      <section className="section--changepw">
        <div className="form-container--pw">
          <h2 className="form-title">Change Password</h2>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}

          <form className="form--pw" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="current_password">Current Password</label>
              <input
                type="password"
                className="form-input"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new_password">New Password</label>
              <input
                type="password"
                className="form-input"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm_new_password">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                name="confirm_new_password"
                value={formData.confirm_new_password}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </button>
              <button type="button" className="btn btn--secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>

      <footer className="footer--pw">
        <p>© 2025 MySite. All rights reserved.</p>
      </footer>
    </main>
  );
};

export default ChangePasswordPage;
