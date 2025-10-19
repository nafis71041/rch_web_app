import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login_page/loginPage';
import DashboardPage from './pages/dashboard_page/dashboardPage';
import ChangePasswordPage from './pages/change_password_page/changePasswordPage';
import ProtectedRoute from './components/protectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/change-password" element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
        />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
        />
      </Routes>
    </Router>
  );
}

export default App;