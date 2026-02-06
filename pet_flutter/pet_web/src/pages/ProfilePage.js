import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes, css, ThemeProvider } from 'styled-components';
import { 
  Layout,
  Typography,
  Avatar,
  Tabs,
  Spin,
  Alert,
  Card,
  Row,
  Col,
  Divider,
  Space,
  Badge,
  Tag,
  Button,
  message,
  Tooltip,
  ConfigProvider,
  theme,
  Progress,
  Statistic,
  Empty,
  Image,
  Skeleton,
  Modal
} from 'antd';
import { 
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  CameraOutlined,
  CalendarOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  EditOutlined,
  GiftOutlined,
  ShoppingOutlined,
  HeartOutlined,
  TrophyOutlined,
  StarOutlined,
  BellOutlined,
  HistoryOutlined,
  CrownOutlined,
  FireOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  SettingOutlined,
  CompassOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import authService from '../services/authService';
import ProfileForm from '../components/profile/ProfileForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import { getUserProfile, updateUserProfile } from '../services/userService';
import petService from '../services/petService';
import orderService from '../services/orderService';
import appointmentService from '../services/appointmentService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { useToken } = theme;

// Enhanced animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const wave = keyframes`
  0% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(10px) translateY(-5px); }
  50% { transform: translateX(0) translateY(0); }
  75% { transform: translateX(-10px) translateY(5px); }
  100% { transform: translateX(0) translateY(0); }
`;

const glitter = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
`;

const zoomIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const aurora = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const spinAround = keyframes`
  from { transform: rotate(0deg) scale(1); }
  to { transform: rotate(360deg) scale(1.2); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(24, 144, 255, 0.3); }
  50% { box-shadow: 0 0 20px rgba(24, 144, 255, 0.6); }
  100% { box-shadow: 0 0 5px rgba(24, 144, 255, 0.3); }
`;

const morphBg = keyframes`
  0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Store animation names for reference
glitter.getName = () => 'glitter';
aurora.getName = () => 'aurora';
gradientFlow.getName = () => 'gradientFlow';

// Modern Styled Components
const PageContainer = styled.div`
  position: relative;
  overflow: hidden;
  padding: 40px 0;
  background: linear-gradient(135deg, #f8faff 0%, #f5f7ff 100%);
`;

const GlassCard = styled(Card)`
  border-radius: 24px;
  overflow: visible;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.07);
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  
  &:hover {
    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.1);
  }
  
  .ant-card-body {
    padding: 0;
  }
`;

const ProfileHeader = styled.div`
  position: relative;
  padding: 0;
  margin: 0;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
`;

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: none;
  opacity: 0.05;
  z-index: 1;
`;

const HeaderGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$theme?.colorPrimary || '#1890ff'};
  z-index: 0;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    background: linear-gradient(to top, rgba(255, 255, 255, 0.1), transparent);
    z-index: 1;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 50px 40px;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const ProfileSection = styled.div`
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const LuxuryAvatar = styled(motion.div)`
  position: relative;
  display: inline-block;
  
  .avatar-border {
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    padding: 5px;
    background: rgba(255, 255, 255, 0.5);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
  
  .ant-avatar {
    border: 3px solid white;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .camera-btn {
    position: absolute;
    bottom: 5px;
    right: 5px;
    background: white;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$theme.colorPrimary};
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    z-index: 10;
    
    &:hover {
      background: ${props => props.$theme.colorPrimary};
      color: white;
    }
    
    .anticon {
      font-size: 18px;
    }
  }
`;

const UserName = styled(Title)`
  color: white !important;
  margin: 0 !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  font-weight: 600 !important;
  letter-spacing: -0.5px !important;
  position: relative !important;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 30px;
    height: 2px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.5);
  }
`;

const UserTag = styled(Tag)`
  margin: 0;
  padding: 4px 10px !important;
  border-radius: 4px !important;
  border: none !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  background: rgba(255, 255, 255, 0.2) !important;
  
  .anticon {
    margin-right: 4px;
  }
`;

const UserMeta = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
  
  .anticon {
    margin-right: 8px;
    font-size: 14px;
  }
`;

const ActionButton = styled(Button)`
  border-radius: 4px !important;
  height: 40px !important;
  padding: 0 16px !important;
  font-weight: 500 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.2s ease !important;
  
  &:hover {
    transform: translateY(-2px) !important;
  }
  
  .anticon {
    font-size: 16px !important;
    margin-right: 6px !important;
  }
  
  &.update-profile-btn {
    background: white !important;
    color: ${props => props.$theme?.colorPrimary || '#1890ff'} !important;
    border: none !important;
    
    &:hover {
      background: #f0f0f0 !important;
    }
  }
`;

const StatsContainer = styled.div`
  margin: -20px -10px 30px;
  padding: 25px 20px;
  background: #f9fafb;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  position: relative;
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  padding: 20px;
  height: 100%;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1;
  border-left: 3px solid ${props => props.$color || props.$theme.colorPrimary};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    
    .stat-icon {
      color: ${props => props.$color || props.$theme.colorPrimary};
    }
    
    .stat-value {
      color: ${props => props.$color || props.$theme.colorPrimary};
    }
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    background: #f5f5f5;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 16px;
    transition: all 0.3s ease;
  }
  
  .stat-title {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    margin-bottom: 6px;
    font-weight: 400;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: #262626;
    transition: color 0.3s;
    line-height: 1;
  }
`;

const TabContainer = styled.div`
  margin-top: 30px;
`;

const CustomTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 0 !important;
    position: relative;
    z-index: 5;
  }

  .ant-tabs-tab {
    padding: 12px 16px !important;
    transition: all 0.2s ease !important;
    border-radius: 8px 8px 0 0 !important;
    margin: 0 4px 0 0 !important;
    
    &:hover {
      color: ${props => props.$theme.colorPrimary} !important;
      background: rgba(0, 0, 0, 0.02) !important;
    }
  }
  
  .ant-tabs-tab-active {
    background: white !important;
    
    .ant-tabs-tab-btn {
      color: ${props => props.$theme.colorPrimary} !important;
      font-weight: 500 !important;
    }
  }
  
  .ant-tabs-ink-bar {
    display: none !important;
  }
  
  .ant-tabs-content {
    background: white;
    border-radius: 0 8px 8px 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  }
`;

const TabLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .anticon {
    font-size: 16px;
  }
`;

const SectionTitle = styled(Title)`
  position: relative;
  display: inline-block;
  margin-bottom: 24px !important;
  font-weight: 600 !important;
  font-size: 18px !important;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 2px;
    background: ${props => props.$theme?.colorPrimary || '#1890ff'};
    border-radius: 1px;
  }
  
  &.update-title {
    color: ${props => props.$theme?.colorPrimary || '#1890ff'};
  }
`;

const InfoBlock = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
  
  &:hover {
    background: #f5f7fa;
    transform: translateY(-3px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
  }
  
  .info-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    font-size: 20px;
    color: ${props => props.$theme?.colorPrimary || '#1890ff'};
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
    transition: all 0.3s;
    border: 1px solid #f0f0f0;
  }
  
  &:hover .info-icon {
    color: white;
    background: ${props => props.$theme?.colorPrimary || '#1890ff'};
    border-color: ${props => props.$theme?.colorPrimary || '#1890ff'};
  }
  
  .info-content {
    flex: 1;
  }
  
  .info-label {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    margin-bottom: 4px;
    font-weight: 400;
  }
  
  .info-value {
    font-size: 16px;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
  }
`;

const AchievementSection = styled(motion.div)`
  background: #f9fafb;
  border-radius: 8px;
  padding: 30px;
  margin: 30px 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
`;

const SectionHeading = styled.div`
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #262626;
  }
  
  p {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const AchievementBadge = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .badge-icon {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: ${props => props.$color || props.$theme.colorPrimary};
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
    border: 1px solid #f0f0f0;
  }
  
  .badge-name {
    font-size: 14px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.65);
    text-align: center;
    transition: all 0.3s;
  }
  
  &:hover {
    .badge-icon {
      transform: translateY(-5px);
      color: white;
      background: ${props => props.$color || props.$theme.colorPrimary};
    }
    
    .badge-name {
      color: ${props => props.$color || props.$theme.colorPrimary};
    }
  }
`;

const ProgressContainer = styled.div`
  max-width: 700px;
  margin: 30px auto 10px;
  position: relative;
  z-index: 1;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  
  .ant-progress-inner {
    height: 8px !important;
    border-radius: 4px !important;
    background: #f5f5f5 !important;
  }
  
  .ant-progress-bg {
    border-radius: 4px !important;
  }
  
  .progress-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.65);
    
    .progress-percent {
      color: ${props => props.$theme?.colorPrimary || '#1890ff'};
    }
  }
`;

const ProfileLoading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
  flex-direction: column;
  background: #f9fafb;
  
  .loading-text {
    margin-top: 16px;
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    font-weight: 400;
  }
  
  .ant-spin {
    .ant-spin-dot {
      transform: scale(1.2);
    }
    
    .ant-spin-dot-item {
      background-color: ${props => props.$theme.colorPrimary};
    }
  }
`;

const ErrorContainer = styled(motion.div)`
  max-width: 600px;
  margin: 60px auto;
  text-align: center;
  
  .ant-alert {
    border-radius: 8px;
    border: 1px solid #ffccc7;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    padding: 20px;
    
    .ant-alert-icon {
      font-size: 20px;
    }
    
    .ant-alert-message {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .ant-alert-description {
      font-size: 14px;
    }
  }
  
  .retry-button {
    margin-top: 20px;
    height: 40px;
    border-radius: 4px;
    font-weight: 500;
    font-size: 14px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

// Thêm styled component cho modal
const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 8px;
    overflow: hidden;
  }
  
  .ant-modal-header {
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;
  }
  
  .ant-modal-body {
    padding: 24px;
  }
  
  .ant-modal-footer {
    border-top: 1px solid #f0f0f0;
  }
`;

const ProfilePage = () => {
  const { token } = useToken();
  const user = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState('1');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [animatedStats, setAnimatedStats] = useState(false);
  const statsRef = useRef(null);
  
  // Thay đổi state để kiểm soát hiển thị modal thay vì hiển thị form trong tab
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Thêm state cho dữ liệu thống kê thực từ API
  const [userStats, setUserStats] = useState({
    petCount: 0,
    ordersCount: 0,
    appointmentsCount: 0,
    favorites: 0
  });

  // Achievements for demo purposes
  const achievements = [
    { name: "Thú cưng đầu tiên", icon: <HeartOutlined />, color: token.colorSuccess },
    { name: "Khách hàng thân thiết", icon: <TrophyOutlined />, color: token.colorWarning },
    { name: "Lịch hẹn đầy đủ", icon: <CheckCircleOutlined />, color: token.colorInfo },
    { name: "Người yêu thú cưng", icon: <StarOutlined />, color: token.colorError }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  // Fetch user profile
  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (user?.userId) {
          const data = await getUserProfile(user.userId);
          
          if (isMounted) {
            setUserProfile(data);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
    
    return () => {
      isMounted = false;
    };
  }, [user?.userId]);

  // Thêm useEffect mới để lấy dữ liệu từ các API
  useEffect(() => {
    let isMounted = true;
    
    const fetchUserStats = async () => {
      try {
        // Nếu chưa đăng nhập thì không fetch dữ liệu
        if (!user) return;
        
        // Lấy dữ liệu thú cưng
        const petsData = await petService.getUserPets();
        
        // Lấy dữ liệu đơn hàng
        const ordersData = await orderService.getUserOrders();
        
        // Lấy dữ liệu lịch hẹn
        const appointmentsData = await appointmentService.getUserAppointments();
        
        if (isMounted) {
          setUserStats({
            petCount: Array.isArray(petsData) ? petsData.length : 0,
            ordersCount: Array.isArray(ordersData) ? ordersData.length : 0,
            appointmentsCount: Array.isArray(appointmentsData) ? appointmentsData.length : 0,
            favorites: 0 // Giữ mặc định vì chưa có API lấy danh sách ưa thích
          });
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu thống kê:', err);
        // Không hiện lỗi để người dùng vẫn có thể xem các thông tin khác
      }
    };
    
    fetchUserStats();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Intersection observer for stats section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedStats) {
          setAnimatedStats(true);
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [animatedStats, userProfile]);

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Handle profile update
  const handleProfileUpdate = async (updatedData) => {
    try {
      if (user && user.userId) {
        const data = await updateUserProfile(user.userId, updatedData);
        
        // Update local state
        setUserProfile(data);
        
        // Update user in localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const updatedUser = {
          ...storedUser,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          avatar: data.avatar
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Trigger userProfileUpdated event for header component to update
        window.dispatchEvent(new Event('userProfileUpdated'));
        
        // Show success message
        messageApi.success({
          content: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircleOutlined style={{ color: token.colorSuccess }} />
              <span>Cập nhật thông tin thành công</span>
            </div>
          ),
          duration: 4,
          icon: <CheckCircleOutlined style={{ color: token.colorSuccess }} />
        });
        
        // Hide modal after successful update
        setShowProfileModal(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      messageApi.error({
        content: err.response?.data?.message || 'Không thể cập nhật thông tin',
        duration: 4
      });
    }
  };

  // Handle password change
  const handlePasswordChange = (success) => {
    if (success) {
      messageApi.success({
        content: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircleOutlined style={{ color: token.colorSuccess }} />
            <span>Đổi mật khẩu thành công</span>
          </div>
        ),
        duration: 4
      });
      
      // Hide modal after successful password change
      setShowPasswordModal(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString || Date.now());
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return 'Không xác định';
    }
  };

  // Get user's name
  const getUserName = () => {
    return userProfile?.fullName || user?.fullName || user?.username || 'Người dùng';
  };

  // Get avatar URL
  const getUserAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return avatarPath.startsWith('http') 
      ? avatarPath 
      : `https://localhost:7164${avatarPath.startsWith('/') ? avatarPath : '/' + avatarPath}`;
  };

  if (loading) {
    return (
      <ProfileLoading $theme={token}>
        <Spin size="large" />
        <div className="loading-text">Đang tải thông tin...</div>
      </ProfileLoading>
    );
  }

  if (error) {
    return (
      <ErrorContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Alert
          message="Không thể tải thông tin"
          description={error}
          type="error"
          showIcon
        />
        <Button 
          type="primary" 
          danger 
          size="large" 
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Thử lại
        </Button>
      </ErrorContainer>
    );
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            cardGutter: 0,
            horizontalItemGutter: 0,
            horizontalItemPadding: "12px 16px",
            titleFontSize: 16
          }
        }
      }}
    >
      {contextHolder}
      
      <PageContainer>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <GlassCard>
                <ProfileHeader>
                  <HeaderGradient $theme={token} />
                  <BackgroundPattern />
                  
                  <HeaderContent>
                    <Row gutter={[30, 30]} align="middle">
                      <Col xs={24} sm={10} md={8} lg={6} style={{ textAlign: 'center' }}>
                        <LuxuryAvatar
                          whileHover={{ scale: 1.02 }}
                          $theme={token}
                        >
                          <div className="avatar-border" />
                          <Avatar
                            size={150}
                            icon={<UserOutlined />}
                            src={getUserAvatarUrl(userProfile?.avatar)}
                          />
                          <Button 
                            className="camera-btn"
                            icon={<CameraOutlined />}
                            onClick={() => setShowProfileModal(true)}
                          />
                        </LuxuryAvatar>
                      </Col>
                      
                      <Col xs={24} sm={14} md={16} lg={18}>
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Space align="center" size={12}>
                            <UserName level={2}>
                              {getUserName()}
                            </UserName>
                            
                            <Badge
                              count={
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ 
                                    duration: 1,
                                    repeat: Infinity,
                                    repeatDelay: 3
                                  }}
                                >
                                  <CheckCircleOutlined style={{ color: 'white' }} />
                                </motion.div>
                              }
                              color={token.colorSuccess}
                              offset={[0, 0]}
                            >
                              <UserTag color="success">
                                <CheckCircleOutlined /> Đã xác thực
                              </UserTag>
                            </Badge>
                          </Space>
                        </motion.div>
                        
                        <UserMeta>
                          <CalendarOutlined />
                          <Text style={{ color: 'inherit' }}>
                            Thành viên từ: {formatDate(userProfile?.createdAt)}
                          </Text>
                        </UserMeta>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          style={{ 
                            marginTop: 24, 
                            display: 'flex', 
                            gap: 12, 
                            flexWrap: 'wrap' 
                          }}
                        >
                          <ActionButton 
                            icon={<EditOutlined />}
                            onClick={() => setShowProfileModal(true)}
                            className="update-profile-btn"
                            $theme={token}
                          >
                            Cập nhật thông tin
                          </ActionButton>
                          
                          <ActionButton 
                            icon={<LockOutlined />}
                            onClick={() => setShowPasswordModal(true)}
                            $theme={token}
                            style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              color: 'white'
                            }}
                          >
                            Đổi mật khẩu
                          </ActionButton>
                        </motion.div>
                      </Col>
                    </Row>
                  </HeaderContent>
                </ProfileHeader>
                
                <ProfileSection>
                  <StatsContainer ref={statsRef} $light={true}>
                    <Row gutter={[20, 20]}>
                      <Col xs={24} sm={12} md={6}>
                        <StatCard
                          variants={itemVariants}
                          whileHover={{ y: -10 }}
                          $theme={token}
                          $color={token.colorSuccess}
                        >
                          <div className="stat-icon">
                            <HeartOutlined />
                          </div>
                          <div className="stat-title">Thú cưng</div>
                          <div className="stat-value">{userStats.petCount}</div>
                        </StatCard>
                      </Col>
                      
                      <Col xs={24} sm={12} md={6}>
                        <StatCard
                          variants={itemVariants}
                          whileHover={{ y: -10 }}
                          $theme={token}
                          $color={token.colorWarning}
                        >
                          <div className="stat-icon">
                            <ShoppingOutlined />
                          </div>
                          <div className="stat-title">Đơn hàng</div>
                          <div className="stat-value">{userStats.ordersCount}</div>
                        </StatCard>
                      </Col>
                      
                      <Col xs={24} sm={12} md={6}>
                        <StatCard
                          variants={itemVariants}
                          whileHover={{ y: -10 }}
                          $theme={token}
                          $color={token.colorInfo}
                        >
                          <div className="stat-icon">
                            <CalendarOutlined />
                          </div>
                          <div className="stat-title">Lịch hẹn</div>
                          <div className="stat-value">{userStats.appointmentsCount}</div>
                        </StatCard>
                      </Col>
                      
                      <Col xs={24} sm={12} md={6}>
                        <StatCard
                          variants={itemVariants}
                          whileHover={{ y: -10 }}
                          $theme={token}
                          $color={token.colorError}
                        >
                          <div className="stat-icon">
                            <GiftOutlined />
                          </div>
                          <div className="stat-title">Ưa thích</div>
                          <div className="stat-value">{userStats.favorites}</div>
                        </StatCard>
                      </Col>
                    </Row>
                  </StatsContainer>
                  
                  <AchievementSection
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <SectionHeading $theme={token}>
                      <h3>🏆 Thành tựu của bạn</h3>
                      <p>Tiếp tục sử dụng dịch vụ để mở khóa thêm nhiều phần thưởng</p>
                    </SectionHeading>
                    
                    <Row gutter={[30, 40]} justify="center">
                      {achievements.map((achievement, index) => (
                        <Col key={index} xs={12} sm={6}>
                          <AchievementBadge
                            $theme={token}
                            $color={achievement.color}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            whileHover={{ y: -10 }}
                          >
                            <div className="badge-icon">
                              {achievement.icon}
                            </div>
                            <div className="badge-name">{achievement.name}</div>
                          </AchievementBadge>
                        </Col>
                      ))}
                    </Row>
                    
                    <ProgressContainer>
                      <div className="progress-label">
                        <span>Tiến trình</span>
                        <span className="progress-percent">65%</span>
                      </div>
                      <Progress 
                        percent={65} 
                        strokeWidth={16}
                        strokeColor={{
                          '0%': token.colorPrimary,
                          '100%': token.colorPrimaryActive,
                        }}
                        status="active"
                        showInfo={false}
                      />
                      <div style={{ 
                        textAlign: 'center', 
                        marginTop: 15, 
                        color: 'rgba(0, 0, 0, 0.6)',
                        fontSize: 15,
                        fontWeight: 500
                      }}>
                        <Badge status="processing" /> Bạn đã đạt được 65% thành tựu
                      </div>
                    </ProgressContainer>
                  </AchievementSection>
                  
                  <TabContainer>
                    <CustomTabs
                      activeKey={activeTab}
                      onChange={handleTabChange}
                      type="card"
                      size="large"
                      $theme={token}
                      items={[
                        {
                          key: '1',
                          label: (
                            <TabLabel>
                              <UserOutlined />
                              <span>Thông tin cá nhân</span>
                            </TabLabel>
                          ),
                          children: (
                            <AnimatePresence mode="wait">
                              <motion.div
                                key="personal-info"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                {userProfile && (
                                  <div style={{ marginBottom: 40 }}>
                                    <SectionTitle level={4} $theme={token}>
                                      Thông tin cơ bản
                                    </SectionTitle>
                                    
                                    <Row gutter={[20, 20]}>
                                      {userProfile.email && (
                                        <Col xs={24} md={12}>
                                          <InfoBlock $theme={token}>
                                            <div className="info-icon">
                                              <MailOutlined />
                                            </div>
                                            <div className="info-content">
                                              <div className="info-label">Email</div>
                                              <div className="info-value">{userProfile.email}</div>
                                            </div>
                                          </InfoBlock>
                                        </Col>
                                      )}
                                      
                                      {userProfile.phone && (
                                        <Col xs={24} md={12}>
                                          <InfoBlock $theme={token}>
                                            <div className="info-icon">
                                              <PhoneOutlined />
                                            </div>
                                            <div className="info-content">
                                              <div className="info-label">Số điện thoại</div>
                                              <div className="info-value">{userProfile.phone}</div>
                                            </div>
                                          </InfoBlock>
                                        </Col>
                                      )}
                                      
                                      {userProfile.address && (
                                        <Col xs={24}>
                                          <InfoBlock $theme={token}>
                                            <div className="info-icon">
                                              <HomeOutlined />
                                            </div>
                                            <div className="info-content">
                                              <div className="info-label">Địa chỉ</div>
                                              <div className="info-value">{userProfile.address}</div>
                                            </div>
                                          </InfoBlock>
                                        </Col>
                                      )}
                                    </Row>
                                  </div>
                                )}
                              </motion.div>
                            </AnimatePresence>
                          ),
                        },
                        {
                          key: '2',
                          label: (
                            <TabLabel>
                              <SafetyCertificateOutlined />
                              <span>Bảo mật</span>
                            </TabLabel>
                          ),
                          children: (
                            <AnimatePresence mode="wait">
                              <motion.div
                                key="security"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <SectionTitle level={4} $theme={token}>
                                  Thông tin bảo mật
                                </SectionTitle>
                                
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <Alert
                                    message={
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <LockOutlined style={{ color: token.colorWarning, fontSize: 18 }} />
                                        <div>
                                          <div style={{ fontWeight: 600, marginBottom: 4 }}>Bảo mật tài khoản</div>
                                          <div style={{ fontSize: 14 }}>
                                            Để bảo mật tài khoản, bạn nên sử dụng mật khẩu mạnh bao gồm chữ cái, số và ký tự đặc biệt
                                          </div>
                                        </div>
                                      </div>
                                    }
                                    type="warning"
                                    showIcon={false}
                                    style={{
                                      marginBottom: 30,
                                      borderRadius: 8,
                                      border: '1px solid #ffe58f'
                                    }}
                                  />
                                </motion.div>
                              </motion.div>
                            </AnimatePresence>
                          ),
                        }
                      ]}
                    />
                  </TabContainer>
                </ProfileSection>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </PageContainer>
      
      {/* Modal cập nhật thông tin */}
      <StyledModal
        title="Cập nhật thông tin cá nhân"
        open={showProfileModal}
        onCancel={() => setShowProfileModal(false)}
        footer={null}
        width={700}
        destroyOnClose
        centered
      >
        {userProfile && (
          <ProfileForm 
            userProfile={userProfile || user} 
            onSubmit={handleProfileUpdate}
          />
        )}
      </StyledModal>
      
      {/* Modal đổi mật khẩu */}
      <StyledModal
        title="Đổi mật khẩu"
        open={showPasswordModal}
        onCancel={() => setShowPasswordModal(false)}
        footer={null}
        width={550}
        destroyOnClose
        centered
      >
        <ChangePasswordForm
          userId={user?.userId}
          onSuccess={handlePasswordChange}
        />
      </StyledModal>
    </ConfigProvider>
  );
};

export default ProfilePage;