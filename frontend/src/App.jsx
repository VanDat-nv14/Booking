import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AuthCallback from './pages/AuthCallback';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import Placeholder from './pages/Placeholder';
import { AuthProvider } from './context/AuthContext';

import UserProfilePage from './pages/UserProfilePage';
import SearchPage from './pages/SearchPage';
import HotelDetailPage from './pages/HotelDetailPage';
import HotelMapPage from './pages/HotelMapPage';

// const HotelDetailPage = Placeholder; // Removed
const BookingPage = Placeholder; // Keeping generic booking page placeholder if needed, mostly covered by Detail
// const ProfilePage = Placeholder; // Removed

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Navbar />
          <main className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Protected Routes */}
              <Route element={<PrivateRoute allowedRoles={['ADMIN', 'Admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>
              
              <Route element={<PrivateRoute allowedRoles={['HOTEL_MANAGER', 'HotelManager']} />}>
                <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              </Route>
              
              <Route path="/hotels/map" element={<HotelMapPage />} />
              <Route path="/hotels/:id" element={<HotelDetailPage />} />

              <Route element={<PrivateRoute />}>
                  <Route path="/booking" element={<BookingPage />} />
                   <Route path="/user/profile" element={<UserProfilePage />} />
              </Route>

            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
