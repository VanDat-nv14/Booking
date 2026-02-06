import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServicesPage from './pages/ServicesPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import 'bootstrap/dist/css/bootstrap.min.css';
// Import các trang Order
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import StaffPage from './pages/StaffPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

import ChatbotSupport from './components/ChatbotSupport';
import { NotificationProvider } from './context/NotificationContext';

// Import trang giỏ hàng
import CartPage from './pages/CartPage';

// Import trang quên mật khẩu
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Import các trang pets
import MyPetsPage from './pages/pets/MyPetsPage';
import PetDetailPage from './pages/pets/PetDetailPage';
import AddPetPage from './pages/pets/AddPetPage';
import EditPetPage from './pages/pets/EditPetPage';

// Import các trang appointment
import AppointmentList from './components/appointment/AppointmentList';
import AppointmentDetail from './components/appointment/AppointmentDetail';
import AppointmentForm from './components/appointment/AppointmentForm';
import AppointmentCalendar from './components/appointment/AppointmentCalendar';

// Import các trang admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Import các trang blog
import BlogPage from './pages/blog/BlogPage';
import BlogDetailPage from './pages/blog/BlogDetailPage';
import BlogManagement from './components/admin/BlogManagement';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import styled from 'styled-components';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ===== THÊM IMPORT SYNCMANAGER =====
import syncManager from './utils/syncManager';

// Tạo component wrapper để kiểm tra đường dẫn hiện tại
const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.includes('/admin');
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      
      // Giải mã token để lấy thông tin
      const decoded = jwtDecode(credentialResponse.credential);
      
      // Gọi API với URL đầy đủ và format giống như đã test trong Postman
      const response = await axios.post('https://localhost:7164/api/Auth/external-login', {
        provider: 'Google',
        idToken: credentialResponse.credential, // Token từ Google
        email: decoded.email,
        name: decoded.name || "User",
        picture: decoded.picture || ""
      });
      
      // Xử lý response (giống như bạn đã nhận được trong Postman)
      const { token, user } = response.data;
      
      // Lưu token và thông tin người dùng
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Chuyển hướng trang
      setSuccess(true);
      setTimeout(() => {
        if (user && user.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 800);
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Đăng nhập thất bại: ' + (error.response?.data || error.message));
      setLoading(false);
    }
  };

  return (
    <NotificationProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Routes cho trang sản phẩm */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            
            {/* Quên mật khẩu */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Cart route */}
            <Route path="/cart" element={<CartPage />} />
            
            {/* Public routes - Blog */}
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            
            {/* Protected routes - Trang hồ sơ người dùng */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            
            {/* Protected routes - Quản lý đơn hàng */}
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/payment" 
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/orders/:id" 
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/order-success" 
              element={<OrderSuccessPage />}
            />
            
            {/* Protected routes - Quản lý thú cưng */}
            <Route 
              path="/pets/add" 
              element={
                <ProtectedRoute>
                  <AddPetPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/pets/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditPetPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/pets/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditPetPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/pets/:id" 
              element={
                <ProtectedRoute>
                  <PetDetailPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/pets" 
              element={
                <ProtectedRoute>
                  <MyPetsPage />
                </ProtectedRoute>
              }
            />
            
            {/* Protected routes - Quản lý lịch hẹn */}
            <Route 
              path="/appointments/add" 
              element={
                <ProtectedRoute>
                  <AppointmentForm />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/appointments/edit/:id" 
              element={
                <ProtectedRoute>
                  <AppointmentForm isEditing={true} />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/appointments/calendar" 
              element={
                <ProtectedRoute>
                  <AppointmentCalendar />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/appointments/:id" 
              element={
                <ProtectedRoute>
                  <AppointmentDetail />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/appointments" 
              element={
                <ProtectedRoute>
                  <AppointmentList />
                </ProtectedRoute>
              }
            />
            
            {/* Protected routes - Quản lý hồ sơ y tế */}
            <Route 
              path="/medical-records" 
              element={
                <ProtectedRoute>
                  <MedicalRecordsPage />
                </ProtectedRoute>
              }
            />

            <Route path="/staff" element={<StaffPage />} />

            {/* Admin routes */}
            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/blog" element={<AdminRoute><BlogManagement /></AdminRoute>} />
          </Routes>
        </main>
        
        {/* Chỉ hiển thị Footer nếu không phải trang admin */}
        {!isAdminPage && <Footer />}
        
        <ChatbotSupport />
      </div>
    </NotificationProvider>
  );
};

const AppContainer = styled.div`
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

function App() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      
      // Giải mã token để lấy thông tin
      const decoded = jwtDecode(credentialResponse.credential);
      
      // Gọi API với URL đầy đủ
      const response = await axios.post('https://localhost:7164/api/Auth/external-login', {
        provider: 'Google',
        idToken: credentialResponse.credential,
        email: decoded.email,
        name: decoded.name || "User",
        picture: decoded.picture || ""
      });
      
      // Xử lý response
      const { token, user } = response.data;
      
      // Lưu token và thông tin người dùng
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Chuyển hướng trang
      setSuccess(true);
      setTimeout(() => {
        if (user && user.role === 'Admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      }, 800);
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Đăng nhập thất bại: ' + (error.response?.data || error.message));
      setLoading(false);
    }
  };

  // ===== KHỞI TẠO SYNCMANAGER =====
  useEffect(() => {
    console.log('🚀 App: Initializing SyncManager for global real-time synchronization');
    
    // SyncManager đã được khởi tạo tự động khi import
    // Chúng ta chỉ cần log để biết nó đã hoạt động
    
    // Cleanup khi app unmount
    return () => {
      console.log('🛑 App: Cleaning up SyncManager');
      syncManager.destroy();
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId="261005055168-52qfvdmp7n3fo022tffqco0o4ilvp7hb.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;