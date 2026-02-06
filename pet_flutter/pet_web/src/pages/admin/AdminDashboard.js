import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import useAuth from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import UserManagement from '../../components/admin/UserManagement';
import AppointmentManagement from '../../components/admin/AppointmentManagement';
import ServiceManagement from '../../components/admin/ServiceManagement';
import ProductManagement from '../../components/admin/ProductManagement';
import CategoryManagement from '../../components/admin/CategoryManagement';
import BlogManagement from '../../components/admin/BlogManagement';
import StaffScheduleManager from '../../components/admin/StaffScheduleManager';
import StaffAccountCreation from '../../components/admin/StaffAccountCreation';
import StaffServiceAssignment from '../../components/admin/StaffServiceAssignment';
import OrderManagement from '../../components/admin/OrderManagement';
import AdminReviewManagement from '../../components/admin/AdminReviewManagement';
import axiosClient from '../../utils/axiosClient';
import './admin-dashboard.css';

// Import Ant Design Icons
import { 
  DashboardOutlined, 
  UserOutlined, 
  UserAddOutlined,
  ShoppingOutlined, 
  CustomerServiceOutlined, 
  HeartOutlined, 
  CalendarOutlined, 
  SettingOutlined, 
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  FileOutlined,
  TagsOutlined,
  ShoppingCartOutlined,
  StarOutlined
} from '@ant-design/icons';

// Styled Components
const AdminDashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #f4f7fe;
  position: relative;
  font-family: 'Poppins', sans-serif;
  overflow-x: hidden;
  color: #2b3674;
`;

const AdminContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  /* Thêm style này để ẩn footer và đảm bảo contennt lấp đầy không gian */
  min-height: 100vh; 
  position: relative;
  isolation: isolate; /* Cô lập admin panel khỏi các thành phần khác */
`;

const Sidebar = styled(motion.div)`
  width: 260px;
  background: linear-gradient(180deg, #304FFE 0%, #304FFE 100%);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  z-index: 10;
  position: fixed;
  left: ${props => props.isVisible ? '0' : '-260px'};
  top: 0;
  bottom: 0;
  overflow-y: auto;
  color: white;
  transition: left 0.3s ease;
  
  &::-webkit-scrollbar {
    width: 5px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
  }
  
  @media (max-width: 768px) {
    width: 240px;
    left: ${props => props.isVisible ? '0' : '-240px'};
  }
`;

const SidebarHeader = styled.div`
  padding: 25px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h2 {
    color: white;
    margin: 0;
    font-weight: 600;
    font-size: 1.5rem;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 10px;
    
    span {
      font-weight: 300;
      opacity: 0.8;
    }
  }
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 20px 0;
  margin: 0;
`;

const MenuItem = styled(motion.li)`
  padding: 14px 20px;
  margin: 5px 15px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  color: rgba(255, 255, 255, 0.7);
  
  .anticon {
    font-size: 18px;
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    font-weight: 600;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
    
    &::before {
      content: '';
      position: absolute;
      left: -15px;
      top: 50%;
      transform: translateY(-50%);
      height: 30px;
      width: 4px;
      background: white;
      border-radius: 0 4px 4px 0;
    }
  }
  
  &:hover:not(.active) {
    background: rgba(255, 255, 255, 0.08);
    color: white;
    transform: translateX(5px);
  }
`;

// Sửa MainContent để chiếm toàn bộ không gian khả dụng
const MainContent = styled.div`
  flex: 1;
  margin-left: ${props => props.sidebarVisible ? '260px' : '0'};
  transition: margin-left 0.3s ease;
  padding: 20px 30px;
  width: calc(100% - ${props => props.sidebarVisible ? '260px' : '0px'});
  max-width: 100%;
  min-height: 100vh;
  background: #f4f7fe;
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    padding: 15px;
  }
`;

// Điều chỉnh Header để rộng hơn
const Header = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
`;

const Breadcrumb = styled.div`
  font-size: 14px;
  color: #707EAE;
  
  span:last-child {
    color: #2B3674;
    font-weight: 600;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Greeting = styled.div`
  font-size: 14px;
  font-weight: 500;
  text-align: right;
  color: #707EAE;
`;

const Avatar = styled(motion.div)`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #304FFE, #304FFE);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(67, 24, 255, 0.3);
  
  span {
    font-size: 16px;
    text-transform: uppercase;
  }
`;

// Sửa ContentWrapper để loại bỏ mọi giới hạn chiều rộng
const ContentWrapper = styled(motion.div)`
  margin-bottom: 40px;
  width: 100%;
  padding: 0;
`;

const PlaceholderContent = styled(motion.div)`
  .section-title {
    font-size: 1.8rem;
    margin-bottom: 15px;
    color: #333;
  }
  
  p {
    color: #666;
    margin-bottom: 30px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 25px;
  display: flex;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  min-height: 140px;
  
  &::before {
    content: '';
    position: absolute;
    width: 140px;
    height: 140px;
    background: ${props => props.bgColor || '#3498db'}15;
    border-radius: 50%;
    top: -40px;
    right: -40px;
    z-index: 0;
  }
  
  .stat-icon {
    width: 70px;
    height: 70px;
    border-radius: 18px;
    background: ${props => props.bgColor || '#3498db'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 25px;
    box-shadow: 0 5px 10px ${props => props.bgColor || '#3498db'}40;
    z-index: 1;
    
    .anticon {
      font-size: 32px;
      color: white;
    }
    
    &.users { background: #A0D7E7; }
    &.pets { background: #FF9AD5; }
    &.appointments { background: #CFC8FF; }
    &.services { background: #FFCE73; }
  }
  
  .stat-details {
    z-index: 1;
    flex: 1;
  }
  
  h3 {
    margin: 0 0 8px 0;
    color: #707EAE;
    font-size: 16px;
    font-weight: 500;
  }
  
  .stat-value {
    font-size: 32px;
    font-weight: 700;
    color: #2B3674;
    margin: 0 0 8px 0;
  }
  
  .stat-label {
    font-size: 14px;
    color: #707EAE;
    margin: 0;
  }
`;

const LoadingStats = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  
  .loader {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
  
  p {
    color: #777;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled(motion.div)`
  background-color: #fff8f8;
  border-left: 4px solid #e74c3c;
  color: #e74c3c;
  padding: 15px;
  margin-bottom: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  
  .anticon {
    margin-right: 10px;
    font-size: 18px;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const Toast = ({ show, message, type, onClose }) => {
  return show ? (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        backgroundColor: type === 'success' ? '#1EC276' : type === 'error' ? '#FF5252' : '#304FFE',
        color: 'white',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        zIndex: 1000,
        minWidth: '300px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <div>{message}</div>
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '15px'
        }}
      >
        &times;
      </button>
    </motion.div>
  ) : null;
};

const ToggleButton = styled(motion.button)`
  position: fixed;
  left: ${props => props.sidebarVisible ? '270px' : '10px'};
  top: 10px;
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 5px 10px rgba(0,0,0,0.1);
  transition: left 0.3s ease;
  
  .anticon {
    font-size: 18px;
    color: #304FFE;
  }
`;

// Thêm style cho AppointmentContainer trong AppointmentManagement.js
const AppointmentContainer = styled.div`
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.5s ease;
  overflow: hidden;
  position: relative;
  margin: 0 20px; /* Thêm margin để tránh dính sát vào cạnh */

  /* ... các styles khác giữ nguyên ... */
`;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    users: 0,
    pets: 0,
    appointments: 0,
    services: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info' // 'info', 'success', 'error'
  });
  
  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const menuItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      }
    }
  };

  // Kiểm tra kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch dữ liệu dashboard
  useEffect(() => {
    // Chỉ gọi fetchDashboardStats khi user đã đăng nhập, là Admin và đang ở tab dashboard
    if (user && user.role === 'Admin' && activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab, user]);

  // Hàm đóng toast
  const closeToast = () => {
    setToast({...toast, show: false});
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hàm chuyển tab và ẩn sidebar trên mobile
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy số lượng người dùng
      let usersCount = 0;
      
      try {
        const usersResponse = await axiosClient.get('/api/Users');
        usersCount = usersResponse.data.length;
      } catch (userError) {
        try {
          // Thử đường dẫn thay thế
          const usersResponse = await axiosClient.get('/Users');
          usersCount = usersResponse.data.length;
        } catch (alternativeError) {
          try {
            // Thử đường dẫn cuối cùng
            const usersResponse = await axiosClient.get('/api/admin/Users');
            usersCount = usersResponse.data.length;
          } catch (finalError) {
            console.error('All user API paths failed:', finalError);
          }
        }
      }
      
      // Thử lấy thông tin về pets nếu có API
      let petsCount = 0;
      try {
        const petsResponse = await axiosClient.get('/api/Pets');
        petsCount = petsResponse.data.length;
      } catch (petError) {
        try {
          const petsResponse = await axiosClient.get('/Pets');
          petsCount = petsResponse.data.length;
        } catch (alternativePetError) {}
      }
      
      // Thử lấy thông tin về appointments nếu có API
      let appointmentsCount = 0;
      try {
        const appointmentsResponse = await axiosClient.get('/api/Appointments');
        appointmentsCount = appointmentsResponse.data.length;
      } catch (apptError) {
        try {
          const appointmentsResponse = await axiosClient.get('/Appointments');
          appointmentsCount = appointmentsResponse.data.length;
        } catch (alternativeApptError) {}
      }
      
      // Thử lấy thông tin về services nếu có API
      let servicesCount = 0;
      try {
        const servicesResponse = await axiosClient.get('/api/Services');
        servicesCount = servicesResponse.data.length;
      } catch (serviceError) {
        try {
          const servicesResponse = await axiosClient.get('/Services');
          servicesCount = servicesResponse.data.length;
        } catch (alternativeServiceError) {}
      }

      // Thử lấy thông tin về orders nếu có API
      let ordersCount = 0;
      try {
        const ordersResponse = await axiosClient.get('/api/Orders');
        ordersCount = ordersResponse.data.length;
      } catch (orderError) {
        try {
          const ordersResponse = await axiosClient.get('/Orders');
          ordersCount = ordersResponse.data.length;
        } catch (alternativeOrderError) {}
      }
      
      setStats({
        users: usersCount,
        pets: petsCount,
        appointments: appointmentsCount,
        services: servicesCount,
        orders: ordersCount
      });
      
      setToast({
        show: true,
        message: 'Dữ liệu dashboard đã được tải thành công',
        type: 'success'
      });
      
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Không thể tải thông tin thống kê. Vui lòng thử lại sau.');
      setToast({
        show: true,
        message: 'Không thể tải dữ liệu dashboard',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Render các nội dung khác nhau tùy thuộc vào tab được chọn
  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <PlaceholderContent
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          <h2 className="section-title">Tổng quan</h2>
          <p>Chào mừng đến với bảng điều khiển quản trị. Dưới đây là tổng quan về hoạt động của hệ thống dịch vụ thú cưng.</p>
          
          {error && (
            <ErrorMessage
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ExclamationCircleOutlined />
              {error}
            </ErrorMessage>
          )}
          
          {loading && stats.users === 0 ? (
            <LoadingStats
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="loader"></div>
              <p>Đang tải thông tin thống kê...</p>
            </LoadingStats>
          ) : (
            <>
              <StatsGrid>
                <StatCard 
                  bgColor="#3498db" 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
                  whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                  className="stat-card-animation"
                >
                  <div className="stat-icon users">
                    <TeamOutlined />
                  </div>
                  <div className="stat-details">
                    <h3>Người dùng</h3>
                    <p className="stat-value">{stats.users}</p>
                    <p className="stat-label">Tổng số người dùng</p>
                  </div>
                </StatCard>
                
                <StatCard 
                  bgColor="#e74c3c" 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
                  whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                  className="stat-card-animation"
                >
                  <div className="stat-icon pets">
                    <HeartOutlined />
                  </div>
                  <div className="stat-details">
                    <h3>Thú cưng</h3>
                    <p className="stat-value">{stats.pets}</p>
                    <p className="stat-label">Thú cưng đã đăng ký</p>
                  </div>
                </StatCard>
                
                <StatCard 
                  bgColor="#2ecc71" 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
                  whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                  className="stat-card-animation"
                >
                  <div className="stat-icon appointments">
                    <CalendarOutlined />
                  </div>
                  <div className="stat-details">
                    <h3>Lịch hẹn</h3>
                    <p className="stat-value">{stats.appointments}</p>
                    <p className="stat-label">Lịch hẹn đã đặt</p>
                  </div>
                </StatCard>
                
                <StatCard 
                  bgColor="#f39c12" 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.4 }}
                  whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                  className="stat-card-animation"
                >
                  <div className="stat-icon services">
                    <CustomerServiceOutlined />
                  </div>
                  <div className="stat-details">
                    <h3>Dịch vụ</h3>
                    <p className="stat-value">{stats.services}</p>
                    <p className="stat-label">Dịch vụ hiện có</p>
                  </div>
                </StatCard>
                
                <StatCard 
                  bgColor="#9b59b6" 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.5 }}
                  whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                  className="stat-card-animation"
                >
                  <div className="stat-icon orders">
                    <ShoppingCartOutlined />
                  </div>
                  <div className="stat-details">
                    <h3>Đơn hàng</h3>
                    <p className="stat-value">{stats.orders || 0}</p>
                    <p className="stat-label">Tổng đơn hàng</p>
                  </div>
                </StatCard>
              </StatsGrid>
            </>
          )}
        </PlaceholderContent>
      );
    } else if (activeTab === 'users') {
      return <UserManagement />;
    } else if (activeTab === 'appointments') {
      return <AppointmentManagement />;
    } else if (activeTab === 'services') {
      return <ServiceManagement />;
    } else if (activeTab === 'products') {
      return <ProductManagement />;
    } else if (activeTab === 'categories') {
      return <CategoryManagement />;
    } else if (activeTab === 'orders') {
      return <OrderManagement />;
    } else if (activeTab === 'blog') {
      return <BlogManagement />;
    } else if (activeTab === 'reviews') {
      return <AdminReviewManagement />;
    } else if (activeTab === 'staffSchedule') {
      return <StaffScheduleManager />;
    } else if (activeTab === 'createStaff') {
      return <StaffAccountCreation />;
    } else if (activeTab === 'assignStaffServices') {
      return <StaffServiceAssignment />;
    } else {
      return (
        <PlaceholderContent>
          <h2 className="section-title">Đang phát triển</h2>
          <p>Chức năng này đang được phát triển và sẽ sẵn sàng trong thời gian tới.</p>
        </PlaceholderContent>
      );
    }
  };

  // Đặt điều kiện kiểm tra sau tất cả các hooks
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'Admin') {
    return <Navigate to="/" />;
  }

  return (
    <AdminDashboardContainer>
      {/* Thêm div bao bọc toàn bộ nội dung để kiểm soát hiển thị */}
      <AdminContent>
        <Sidebar 
          isVisible={showSidebar}
          variants={sidebarVariants}
          initial="hidden"
          animate={showSidebar ? "visible" : "hidden"}
        >
          <SidebarHeader>
            <h2><TeamOutlined /> Pet<span>Web</span></h2>
          </SidebarHeader>
          <MenuList>
            <MenuItem 
              className={activeTab === 'dashboard' ? 'active' : ''} 
              onClick={() => handleTabChange('dashboard')}
              variants={menuItemVariants}
            >
              <DashboardOutlined /> Tổng quan
            </MenuItem>
            <MenuItem 
              className={activeTab === 'users' ? 'active' : ''} 
              onClick={() => handleTabChange('users')}
              variants={menuItemVariants}
            >
              <UserOutlined /> Quản lý người dùng
            </MenuItem>
            <MenuItem 
              className={activeTab === 'appointments' ? 'active' : ''} 
              onClick={() => handleTabChange('appointments')}
              variants={menuItemVariants}
            >
              <CalendarOutlined /> Quản lý lịch hẹn
            </MenuItem>
            <MenuItem 
              className={activeTab === 'services' ? 'active' : ''} 
              onClick={() => handleTabChange('services')}
              variants={menuItemVariants}
            >
              <CustomerServiceOutlined /> Dịch vụ
            </MenuItem>
            <MenuItem 
              className={activeTab === 'products' ? 'active' : ''} 
              onClick={() => handleTabChange('products')}
              variants={menuItemVariants}
            >
              <ShoppingOutlined /> Sản phẩm
            </MenuItem>
            <MenuItem 
              className={activeTab === 'categories' ? 'active' : ''} 
              onClick={() => handleTabChange('categories')}
              variants={menuItemVariants}
            >
              <TagsOutlined /> Danh mục
            </MenuItem>
            <MenuItem 
              className={activeTab === 'orders' ? 'active' : ''} 
              onClick={() => handleTabChange('orders')}
              variants={menuItemVariants}
            >
              <ShoppingCartOutlined /> Quản lý đơn hàng
            </MenuItem>
            <MenuItem 
              className={activeTab === 'blog' ? 'active' : ''} 
              onClick={() => handleTabChange('blog')}
              variants={menuItemVariants}
            >
              <FileOutlined /> Quản lý Blog
            </MenuItem>
            <MenuItem 
              className={activeTab === 'reviews' ? 'active' : ''} 
              onClick={() => handleTabChange('reviews')}
              variants={menuItemVariants}
            >
              <StarOutlined /> Quản lý đánh giá
            </MenuItem>
            <MenuItem 
              className={activeTab === 'staffSchedule' ? 'active' : ''} 
              onClick={() => handleTabChange('staffSchedule')}
              variants={menuItemVariants}
            >
              <CalendarOutlined /> Quản lý ca làm
            </MenuItem>
            <MenuItem 
              className={activeTab === 'createStaff' ? 'active' : ''} 
              onClick={() => handleTabChange('createStaff')}
              variants={menuItemVariants}
            >
              <UserAddOutlined /> Tạo tài khoản nhân viên
            </MenuItem>
            <MenuItem 
              className={activeTab === 'assignStaffServices' ? 'active' : ''} 
              onClick={() => handleTabChange('assignStaffServices')}
              variants={menuItemVariants}
            >
              <UserOutlined /> Gán dịch vụ cho nhân viên
            </MenuItem>
            <MenuItem 
              className={activeTab === 'settings' ? 'active' : ''} 
              onClick={() => handleTabChange('settings')}
              variants={menuItemVariants}
            >
              <SettingOutlined /> Cài đặt
            </MenuItem>
            <MenuItem 
              onClick={handleLogout}
              variants={menuItemVariants}
              style={{ marginTop: '30px', color: 'rgba(255, 255, 255, 0.9)' }}
            >
              <LogoutOutlined /> Đăng xuất
            </MenuItem>
          </MenuList>
        </Sidebar>
        
        <MainContent sidebarVisible={showSidebar && !isMobile}>
          <Header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Breadcrumb>
              <span>Admin</span> / <span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
            </Breadcrumb>
            <UserInfo>
              <Greeting>Xin chào, {user?.fullName || 'Admin'}</Greeting>
              <Avatar 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{user?.fullName ? user.fullName.charAt(0) : 'A'}</span>
              </Avatar>
            </UserInfo>
          </Header>
          
          <ContentWrapper
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="*" element={renderContent()} />
            </Routes>
          </ContentWrapper>
        </MainContent>
        
        {/* Nút hiện/ẩn sidebar - luôn hiển thị */}
        <ToggleButton 
          sidebarVisible={showSidebar}
          onClick={() => setShowSidebar(!showSidebar)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {showSidebar ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </ToggleButton>
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toast.show && (
            <Toast 
              show={toast.show} 
              message={toast.message} 
              type={toast.type} 
              onClose={closeToast} 
            />
          )}
        </AnimatePresence>
      </AdminContent>
    </AdminDashboardContainer>
  );
};

export default AdminDashboard;


