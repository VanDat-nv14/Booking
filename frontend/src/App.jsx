import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Critical path: load immediately for first paint
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';

// Lazy load heavy pages (Leaflet, large admin UI, etc.)
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const BookingHistoryPage = lazy(() => import('./pages/BookingHistoryPage'));
const HotelDetailPage = lazy(() => import('./pages/HotelDetailPage'));
const HotelMapPage = lazy(() => import('./pages/HotelMapPage'));

// const HotelDetailPage = Placeholder; // Removed
// const BookingPage = Placeholder; // Removed – thay bằng trang thanh toán riêng
// const ProfilePage = Placeholder; // Removed

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Navbar />
          <main className="container mx-auto px-4 py-6">
            <Suspense fallback={<PageFallback />}>
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
                  <Route path="/booking" element={<PaymentPage />} />
                  <Route path="/user/profile" element={<UserProfilePage />} />
                  <Route path="/user/bookings" element={<BookingHistoryPage />} />
              </Route>

            </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
