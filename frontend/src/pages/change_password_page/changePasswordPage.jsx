import { useState, useEffect} from 'react';
import './changePasswordPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

      // // Optional: redirect to dashboard after success
      // setTimeout(() => {
      //   navigate('/dashboard');
      // }, 3000);
    } catch (err) {
      // If token is missing or invalid, redirect to login
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
    <div className="change-password-container">
      <form className="change-password-form" onSubmit={handleSubmit}>
        <h2>Change Password</h2>

        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        <div className="form-group">
          <label htmlFor="current_password">Current Password</label>
          <input
            type="password"
            name="current_password"
            value={formData.current_password}
            onChange={handleChange}
            placeholder="Enter current password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="new_password">New Password</label>
          <input
            type="password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            placeholder="Enter new password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm_new_password">Confirm New Password</label>
          <input
            type="password"
            name="confirm_new_password"
            value={formData.confirm_new_password}
            onChange={handleChange}
            placeholder="Confirm new password"
            required
          />
        </div>

        <div className="button-group">
          <button type="submit" className="change-password-button" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
          <button type="button" className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;