import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login_page/loginPage';
import DashboardPage from './pages/dashboard_page/dashboardPage';
import ChangePasswordPage from './pages/change_password_page/changePasswordPage';
import ProtectedRoute from './components/protectedRoute';
import NotFoundPage from './pages/not_found_page/NotFoundPage';
import RegisterPage from './pages/register/RegisterPage';
import ECPage from './pages/ec_page/ECPage';
import PWSearchPage from './pages/pw_page/PWSearchPage';
import PWPage from './pages/pw_page/PWPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/ec-registration/:mother_id?" element={<ECPage />} />
          <Route path="/pw/search" element={<PWSearchPage />} />
          <Route path="/pw/:motherId/pregnancy/:pregnancyId" element={<PWPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;