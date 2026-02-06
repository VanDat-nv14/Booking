import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import cartService from '../../services/cartService';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';

import { 
  Layout, 
  Menu, 
  Button, 
  Drawer, 
  Avatar, 
  Badge, 
  Dropdown, 
  Space, 
  Divider, 
  Typography,
  Tooltip,
  Tag,
  ConfigProvider,
  theme
} from 'antd';

import { 
  HomeOutlined, 
  ShoppingOutlined, 
  MedicineBoxOutlined, 
  ReadOutlined, 
  ContactsOutlined, 
  MenuOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  DashboardOutlined, 
  ShoppingCartOutlined, 
  CloseOutlined, 
  RightOutlined,
  CrownOutlined,
  SettingOutlined,
  DownOutlined,
  TeamOutlined,
  FileTextOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';

// Custom Pet Icon since Ant Design doesn't have one
const PetIcon = props => (
  <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M4.5,9.5c0,0.8,0.7,1.5,1.5,1.5S7.5,10.3,7.5,9.5S6.8,8,6,8S4.5,8.7,4.5,9.5z M9,6c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1 S9.6,6,9,6z M13,6c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1S13.6,6,13,6z M16.5,8c-0.8,0-1.5,0.7-1.5,1.5s0.7,1.5,1.5,1.5 s1.5-0.7,1.5-1.5S17.3,8,16.5,8z M19.5,10c-0.8,0-1.5,0.7-1.5,1.5s0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5S20.3,10,19.5,10z M18.5,13 c-0.8,0-1.5,0.7-1.5,1.5s0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5S19.3,13,18.5,13z M16,16c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1 S16.6,16,16,16z M12,16c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1S12.6,16,12,16z M14.5,11c0,1.4-1.1,2.5-2.5,2.5S9.5,12.4,9.5,11 c0-0.3,0-0.5,0.1-0.7c-0.2,0.2-0.3,0.4-0.3,0.7c0,0.6,0.4,1,1,1s1-0.4,1-1c0-0.1,0-0.3-0.1-0.4c0.2,0.3,0.5,0.4,0.8,0.4 c0.3,0,0.5-0.1,0.7-0.3c0,0,0,0,0,0c0.5,0,0.9-0.2,1.3-0.4C14.3,10.3,14.5,10.6,14.5,11z M8,16c-0.6,0-1,0.4-1,1s0.4,1,1,1 s1-0.4,1-1S8.6,16,8,16z M4.5,13c-0.8,0-1.5,0.7-1.5,1.5s0.7,1.5,1.5,1.5S6,15.3,6,14.5S5.3,13,4.5,13z M3,10 c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1S3.6,10,3,10z"></path>
  </svg>
);

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;
const { useToken } = theme;

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px) rotate(-5deg); }
  50% { transform: translateY(-8px) rotate(-2deg); }
  100% { transform: translateY(0px) rotate(-5deg); }
`;

const shine = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.6); }
  70% { box-shadow: 0 0 0 10px rgba(24, 144, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); }
`;

const scaleIn = keyframes`
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const morphBackground = keyframes`
  0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const floatWithRotate = keyframes`
  0% { transform: translateY(0px) rotate(-5deg); }
  25% { transform: translateY(-8px) rotate(-2deg); }
  50% { transform: translateY(-12px) rotate(0deg); }
  75% { transform: translateY(-6px) rotate(3deg); }
  100% { transform: translateY(0px) rotate(-5deg); }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 5px rgba(24, 144, 255, 0.5), 0 0 10px rgba(24, 144, 255, 0.3); }
  50% { box-shadow: 0 0 15px rgba(24, 144, 255, 0.8), 0 0 20px rgba(24, 144, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(24, 144, 255, 0.5), 0 0 10px rgba(24, 144, 255, 0.3); }
`;

const jiggle = keyframes`
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
`;

// Styled components
const LogoWrapper = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colorPrimary}, ${props => props.theme.colorPrimaryActive});
  background-size: 200% 200%;
  animation: ${gradientShift} 8s ease infinite, ${morphBackground} 15s ease-in-out infinite, ${floatWithRotate} 6s ease-in-out infinite;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  box-shadow: 0 6px 20px ${props => props.theme.colorPrimary}60;
  position: relative;
  z-index: 1;
  
  &::before, &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 3px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.8),
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.6;
    z-index: -1;
  }
  
  &::after {
    filter: blur(20px);
    opacity: 0.3;
  }
  
  &:hover {
    animation-play-state: paused;
    transform: scale(1.1);
  }
`;

const LogoTitle = styled(Title)`
  margin: 0 !important;
  font-weight: 800 !important;
  background: linear-gradient(45deg, ${props => props.theme.colorPrimary}, ${props => props.theme.colorPrimaryActive}, #4096ff, ${props => props.theme.colorPrimary}) !important;
  background-size: 300% !important;
  animation: ${shine} 4s linear infinite !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  letter-spacing: 0.5px !important;
  position: relative !important;
  text-shadow: 0 5px 15px rgba(24, 144, 255, 0.2);
  transform: translateZ(0);
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, ${props => props.theme.colorPrimary}, transparent);
    transform: scaleX(0.3);
    transform-origin: left;
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  &:hover::after {
    transform: scaleX(1);
  }
`;

const StyledBadge = styled(Badge)`
  .ant-badge-count {
    box-shadow: 0 0 0 2px #fff;
    padding: 0 6px;
    height: 20px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 12px;
    background: linear-gradient(45deg, #ff4d4f, #ff7875);
    animation: ${pulse} 2.5s infinite;
  }
  
  &:hover .ant-badge-count {
    transform: scale(1.1);
    animation: ${glowPulse} 1.5s infinite;
  }
`;

const GlowButton = styled(Button)`
  &.ant-btn-primary {
    background: linear-gradient(45deg, ${props => props.theme.colorPrimary}, ${props => props.theme.colorPrimaryActive}) !important;
    background-size: 200% 200% !important;
    animation: ${gradientShift} 5s ease infinite !important;
    border: none !important;
    box-shadow: 0 8px 20px ${props => props.theme.colorPrimary}30 !important;
    position: relative !important;
    overflow: hidden !important;
    z-index: 1 !important;
    
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, 
        ${props => props.theme.colorPrimary}, 
        ${props => props.theme.colorPrimaryActive},
        ${props => props.theme.colorPrimary});
      background-size: 400%;
      z-index: -1;
      filter: blur(10px);
      opacity: 0;
      transition: opacity 0.4s;
    }
    
    &:hover::before {
      opacity: 0.8;
      animation: ${gradientShift} 2s infinite;
    }
    
    &:hover {
      transform: translateY(-5px) !important;
      box-shadow: 0 15px 25px ${props => props.theme.colorPrimary}50 !important;
    }
    
    &:active {
      transform: translateY(-2px) !important;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      transition: all 0.6s;
    }
    
    &:hover::after {
      left: 100%;
    }
  }
`;

const UserAvatar = styled(Avatar)`
  background: linear-gradient(135deg, ${props => props.theme.colorPrimary}, ${props => props.theme.colorPrimaryActive});
  font-size: 14px;
  font-weight: 700;
  border: 2px solid rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${props => props.theme.colorPrimary}40, transparent);
    opacity: 0;
    transition: opacity 0.4s;
    z-index: -1;
    filter: blur(8px);
  }
  
  &:hover {
    transform: scale(1.15) translateY(-3px);
    box-shadow: 0 10px 20px rgba(24, 144, 255, 0.3);
    
    &::after {
      opacity: 1;
    }
  }
`;

const UserDropdownWrapper = styled.div`
  cursor: pointer;
  padding: 6px 10px 6px 12px;
  border-radius: 40px;
  border: 1px solid rgba(24, 144, 255, 0.15);
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
  
  &:hover {
    border-color: ${props => props.theme.colorPrimary};
    background-color: rgba(240, 248, 255, 0.95);
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(24, 144, 255, 0.15);
  }
  
  .user-name {
    transition: all 0.3s;
  }
  
  &:hover .user-name {
    color: ${props => props.theme.colorPrimary};
    font-weight: 600;
  }
`;

const CartButton = styled(Button)`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colorBgTextHover};
  color: ${props => props.theme.colorPrimary};
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
  
  &:hover {
    transform: translateY(-5px) scale(1.1);
    box-shadow: 0 10px 25px rgba(24, 144, 255, 0.25);
    background: ${props => props.theme.colorPrimary}20;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, ${props => props.theme.colorPrimary}40 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s;
    z-index: 0;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  .anticon {
    font-size: 22px;
    z-index: 1;
    transition: all 0.3s;
  }
  
  &:hover .anticon {
    transform: scale(1.2);
    animation: ${jiggle} 0.6s ease-in-out;
  }
`;

// Tạo một styled component riêng cho CSS global
const GlobalStyle = styled.div`
  .user-dropdown-menu {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12) !important;
    animation: ${scaleIn} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .drawer-logo-wrapper {
    animation: ${floatWithRotate} 6s ease-in-out infinite;
  }
  
  @keyframes cartPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
  
  .ant-badge-count-sm {
    animation: cartPulse 2s infinite;
  }
  
  /* Các styles khác */
  @media (max-width: 768px) {
    .desktop-menu {
      display: none;
    }
    .mobile-menu-button {
      display: block !important;
    }
    .user-name {
      display: none !important;
    }
    .login-button {
      display: none;
    }
  }
  
  .app-header {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }
  
  .app-header.scrolled {
    background: rgba(255, 255, 255, 0.95) !important;
    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1) !important;
  }
`;

const Header = () => {
  const { token } = useToken();
  const auth = useAuth();
  const [user, setUser] = useState(null);
  const logout = auth?.logout;
  const [cartItemCount, setCartItemCount] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // State to track current active path
  const [activePath, setActivePath] = useState('/');
  
  // State for scroll position to add shadow effect
  const [scrolled, setScrolled] = useState(false);
  
  // Định nghĩa handleUserUpdate ở đây, bên ngoài các useEffect
  const handleUserUpdate = () => {
    // Đảm bảo đọc dữ liệu mới nhất từ localStorage khi có sự kiện userProfileUpdated
    console.log('User profile updated event received in Header');
    
    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        console.log('Updated user from localStorage:', storedUser);
        console.log('Avatar from localStorage:', storedUser.avatar);
        
        // Force re-render bằng cách tạo object mới
        setUser({...storedUser});
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  };
  
  // Listen for changes from localStorage and auth
  useEffect(() => {
    const updateUserData = () => {
      if (auth?.user) {
        setUser(auth.user);
        return;
      }
      
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          setUser(storedUser);
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    
    updateUserData();
    
    const handleStorageChange = () => {
      updateUserData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Add scroll listener
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [auth]);
  
  // Tách riêng useEffect cho sự kiện userProfileUpdated
  useEffect(() => {
    window.addEventListener('userProfileUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleUserUpdate);
    };
  }, []);  // Empty dependency array to ensure it only runs once
  
  // Update active path when location changes
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  // Load cart count for authenticated users
  useEffect(() => {
    const loadCartCount = async () => {
      if (user) {
        try {
          const count = await cartService.getCartItemCount();
          setCartItemCount(count);
        } catch (error) {
          console.error('Error loading cart count:', error);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    };

    loadCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => {
      if (user) {
        loadCartCount();
      }
    };

    // Listen for custom cart update events
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user]);
  
  // Handle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Handle logout
  const handleLogout = () => {
    if (logout) {
      setUser(null);
      logout();
      navigate('/');
    }
  };
  
  // Check if in admin section
  const isInAdminSection = location.pathname.startsWith('/admin');
  
  // Check if user is admin
  const isAdmin = user && user.role === 'Admin';
  
  // Don't show header for Admin when in Admin section
  if (isAdmin && isInAdminSection) {
    return null;
  }
  
  // Menu items
  const menuItems = [
    { label: 'Trang chủ', path: '/', icon: <HomeOutlined /> },
    { label: 'Sản phẩm', path: '/products', icon: <ShoppingOutlined /> },
    { label: 'Dịch vụ', path: '/services', icon: <MedicineBoxOutlined /> },
    { label: 'Blog', path: '/blog', icon: <ReadOutlined /> },
    { label: 'Liên hệ', path: '/contact', icon: <ContactsOutlined /> }
  ];
  
  // User menu items
  const userMenuItems = [
    ...(isAdmin ? [{ key: 'admin', label: 'Quản trị', path: '/admin', icon: <CrownOutlined style={{ color: token.colorPrimary }} /> }] : []),
    { key: 'profile', label: 'Hồ sơ', path: '/profile', icon: <UserOutlined style={{ color: token.colorPrimary }} /> },
    { key: 'pets', label: 'Thú cưng', path: '/pets', icon: <PetIcon style={{ color: token.colorSuccess }} /> },
    { key: 'orders', label: 'Đơn hàng', path: '/orders', icon: <ShoppingOutlined style={{ color: token.colorWarning }} /> },
    { key: 'appointments', label: 'Lịch hẹn', path: '/appointments', icon: <CalendarOutlined style={{ color: token.colorInfo }} /> },
    { key: 'medical', label: 'Hồ sơ y tế', path: '/medical-records', icon: <FileTextOutlined style={{ color: token.colorError }} /> },
    { 
      key: 'divider', 
      type: 'divider' 
    },
    { 
      key: 'logout', 
      danger: true,
      label: (
        <Space>
          <LogoutOutlined />
          <span>Đăng xuất</span>
        </Space>
      )
    }
  ];

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Check if path is active
  const isActive = (path) => {
    return activePath === path || 
      (path !== '/' && activePath.startsWith(path));
  };
  
  // Handle user menu click
  const handleUserMenuClick = (e) => {
    if (e.key === 'logout') {
      handleLogout();
    }
  };
  
  // Create user menu dropdown items
  const userDropdownItems = {
    items: userMenuItems.map(item => {
      if (item.type === 'divider') {
        return {
          type: 'divider'
        };
      }
      return {
        key: item.key,
        danger: item.danger || false,
        label: item.path ? (
          <Link to={item.path}>
            <Space>
              {item.icon}
              <span>{item.label}</span>
            </Space>
          </Link>
        ) : (
          item.label
        )
      };
    }),
    onClick: handleUserMenuClick
  };
  
  // Get user avatar URL
  const getUserAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }
    
    // URL tương đối (từ server)
    return `${process.env.REACT_APP_API_URL || 'https://localhost:7164'}${avatarPath.startsWith('/') ? avatarPath : '/' + avatarPath}`;
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            horizontalItemSelectedColor: token.colorPrimary,
            horizontalItemHoverColor: token.colorPrimary,
            itemSelectedColor: token.colorPrimary,
            itemHoverColor: token.colorPrimary,
          },
        },
      }}
    >
      <GlobalStyle />
      <AntHeader
        className={`app-header ${scrolled ? 'scrolled' : ''}`}
        style={{
          background: 'white',
          padding: '0',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: scrolled 
            ? '0 4px 20px rgba(0, 0, 0, 0.08)' 
            : '0 2px 8px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s ease',
          borderBottom: `1px solid ${token.colorBorderDivider}`,
          height: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            height: 72,
          }}
        >
          {/* Mobile Menu Button */}
          <div className="mobile-menu-button" style={{ display: 'none' }}>
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: '20px' }} />}
              onClick={toggleDrawer}
              style={{ color: token.colorPrimary }}
            />
          </div>
          
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LogoWrapper theme={token}>
              <PetIcon style={{ color: '#fff', fontSize: 24 }} />
            </LogoWrapper>
            
            <Link to="/" style={{ textDecoration: 'none' }}>
              <LogoTitle
                level={4}
                theme={token}
              >
                Pet Web
              </LogoTitle>
            </Link>
            
            {isAdmin && (
              <Tag 
                color={token.colorPrimaryActive} 
                style={{ 
                  marginLeft: 10, 
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                Admin
              </Tag>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <div className="desktop-menu">
            <Menu 
              mode="horizontal" 
              selectedKeys={menuItems.filter(item => isActive(item.path)).map(item => item.path)}
              style={{ 
                border: 'none', 
                backgroundColor: 'transparent',
                fontWeight: 500,
                fontSize: '15px'
              }}
              items={
                menuItems.map(item => ({
                  key: item.path,
                  icon: item.icon,
                  label: (
                    <Link to={item.path}>
                      {item.label}
                    </Link>
                  )
                }))
              }
            />
          </div>
          
          {/* Right Section (Cart & User) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            {/* Cart */}
            <Tooltip title="Giỏ hàng" placement="bottom">
                              <StyledBadge count={cartItemCount || 0} size="small" offset={[-5, 5]}>
                <CartButton
                  type="text"
                  icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />}
                  onClick={() => navigate('/cart')}
                  theme={token}
                />
              </StyledBadge>
            </Tooltip>
            
            {/* User section */}
            {user ? (
              <Dropdown 
                menu={userDropdownItems} 
                placement="bottomRight"
                arrow
                trigger={['click']}
                dropdownRender={(menu) => (
                  <div
                    className="user-dropdown-menu"
                    style={{
                      backgroundColor: 'white',
                      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
                      borderRadius: 12,
                      padding: 0,
                      overflow: 'hidden',
                      width: 300,
                    }}
                  >
                    <div
                      style={{
                        padding: '24px',
                        textAlign: 'center',
                        borderBottom: `1px solid ${token.colorBorderDivider}`,
                        background: `linear-gradient(135deg, ${token.colorBgTextHover}, #f0f7ff)`,
                      }}
                    >
                      <Avatar
                        size={64}
                        src={getUserAvatarUrl(user.avatar)}
                        style={{
                          backgroundColor: token.colorPrimary,
                          fontSize: 24,
                          fontWeight: 600,
                          margin: '0 auto 12px',
                          border: `4px solid ${token.colorBgContainer}`,
                          boxShadow: `0 4px 12px ${token.colorPrimary}30`,
                        }}
                      >
                        {!user.avatar && getInitials(user.fullName || user.username)}
                      </Avatar>
                      <Title level={5} style={{ margin: '0 0 4px', fontWeight: 600 }}>
                        {user.fullName || user.username}
                      </Title>
                      <Text type="secondary" style={{ fontSize: 14 }}>
                        {user.email}
                      </Text>
                      {isAdmin && (
                        <div style={{ marginTop: 8 }}>
                          <Tag 
                            color={token.colorPrimaryActive}
                            icon={<CrownOutlined />}
                            style={{ 
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 600
                            }}
                          >
                            Quản trị viên
                          </Tag>
                        </div>
                      )}
                    </div>
                    {menu}
                  </div>
                )}
              >
                <UserDropdownWrapper theme={token}>
                  <Space>
                    <UserAvatar
                      size={32}
                      src={getUserAvatarUrl(user.avatar)}
                      theme={token}
                    >
                      {!user.avatar && getInitials(user.fullName || user.username)}
                    </UserAvatar>
                    <Text 
                      style={{ 
                        fontSize: 14, 
                        fontWeight: 500,
                        display: 'inline-block',
                      }}
                      className="user-name"
                    >
                      {user.fullName || user.username}
                    </Text>
                    <DownOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                  </Space>
                </UserDropdownWrapper>
              </Dropdown>
            ) : (
              <Space size={10}>
                <Button
                  type="default"
                  shape="round"
                  onClick={() => navigate('/login')}
                  style={{
                    fontWeight: 500,
                    borderColor: token.colorPrimaryBorder,
                    color: token.colorPrimary,
                  }}
                  className="login-button"
                >
                  Đăng nhập
                </Button>
                <GlowButton
                  type="primary"
                  shape="round"
                  onClick={() => navigate('/register')}
                  style={{
                    fontWeight: 500,
                  }}
                  className="register-button"
                  theme={token}
                >
                  Đăng ký
                </GlowButton>
              </Space>
            )}
          </div>
        </div>
        
        {/* Mobile Drawer */}
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
                  borderRadius: 12,
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 6px 16px ${token.colorPrimary}40`,
                  transform: 'rotate(-5deg)',
                }}
              >
                <PetIcon style={{ color: '#fff', fontSize: 20 }} />
              </div>
              <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
                Pet Web
              </Title>
            </div>
          }
          placement="left"
          onClose={toggleDrawer}
          open={drawerOpen}
          width={280}
          closeIcon={<CloseOutlined style={{ fontSize: 16 }} />}
          headerStyle={{ borderBottom: `1px solid ${token.colorBorderDivider}` }}
          bodyStyle={{ padding: 0 }}
        >
          {user && (
            <div
              style={{
                padding: '16px 20px',
                textAlign: 'center',
                background: token.colorBgTextHover,
                borderBottom: `1px solid ${token.colorBorderDivider}`,
              }}
            >
              <Avatar
                size={64}
                src={getUserAvatarUrl(user.avatar)}
                style={{
                  backgroundColor: token.colorPrimary,
                  fontSize: 24,
                  fontWeight: 600,
                  margin: '0 auto 12px',
                  border: `4px solid ${token.colorBgContainer}`,
                  boxShadow: `0 4px 12px ${token.colorPrimary}30`,
                }}
              >
                {!user.avatar && getInitials(user.fullName || user.username)}
              </Avatar>
              <Title level={5} style={{ margin: '0 0 4px', fontWeight: 600 }}>
                {user.fullName || user.username}
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                {user.email}
              </Text>
              {isAdmin && (
                <div style={{ marginTop: 8 }}>
                  <Tag 
                    color={token.colorPrimaryActive}
                    icon={<CrownOutlined />}
                    style={{ 
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    Quản trị viên
                  </Tag>
                </div>
              )}
            </div>
          )}
          
          <div style={{ padding: '12px 0' }}>
            <Text 
              type="secondary" 
              style={{ 
                padding: '0 24px', 
                fontSize: 12, 
                fontWeight: 600, 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: 8
              }}
            >
              Trang chính
            </Text>
            
            <Menu
              mode="inline"
              selectedKeys={[...menuItems.filter(item => isActive(item.path)).map(item => item.path), isActive('/cart') && '/cart']}
              style={{ 
                border: 'none', 
                backgroundColor: 'transparent'
              }}
              items={[
                ...menuItems.map(item => ({
                  key: item.path,
                  icon: item.icon,
                  label: (
                    <Link to={item.path} onClick={toggleDrawer}>
                      {item.label}
                    </Link>
                  )
                })),
                {
                  key: '/cart',
                  icon: (
                    <Badge count={cartItemCount || 0} size="small" offset={[0, 0]}>
                      <ShoppingCartOutlined />
                    </Badge>
                  ),
                  label: (
                    <Link to="/cart" onClick={toggleDrawer}>
                      Giỏ hàng
                    </Link>
                  )
                }
              ]}
            />
            
            {user && (
              <div style={{ marginTop: 16 }}>
                <Divider style={{ margin: '12px 0' }} />
                
                <Text 
                  type="secondary" 
                  style={{ 
                    padding: '0 24px', 
                    fontSize: 12, 
                    fontWeight: 600, 
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'block',
                    marginBottom: 8,
                    marginTop: 16
                  }}
                >
                  Tài khoản
                </Text>
                
                <Menu
                  mode="inline"
                  selectedKeys={[...userMenuItems.filter(item => item.path && isActive(item.path)).map(item => item.key)]}
                  style={{ 
                    border: 'none', 
                    backgroundColor: 'transparent'
                  }}
                  items={
                    userMenuItems
                      .filter(item => item.type !== 'divider' && item.key !== 'logout')
                      .map(item => ({
                        key: item.key,
                        icon: item.icon,
                        label: (
                          <Link to={item.path} onClick={toggleDrawer}>
                            {item.label}
                          </Link>
                        )
                      }))
                  }
                />
              </div>
            )}
          </div>
          
          <div 
            style={{ 
              padding: '16px 20px',
              borderTop: `1px solid ${token.colorBorderDivider}`,
              position: 'absolute',
              bottom: 0,
              width: '100%',
              background: token.colorBgContainer
            }}
          >
            {user ? (
              <Button 
                type="primary" 
                danger 
                block 
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                shape="round"
                size="large"
              >
                Đăng xuất
              </Button>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                <Button 
                  type="primary" 
                  block
                  size="large"
                  onClick={() => {
                    navigate('/login');
                    toggleDrawer();
                  }}
                  shape="round"
                  style={{
                    background: `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
                    border: 'none',
                  }}
                >
                  Đăng nhập
                </Button>
                <Button 
                  block 
                  size="large"
                  onClick={() => {
                    navigate('/register');
                    toggleDrawer();
                  }}
                  shape="round"
                  style={{
                    borderColor: token.colorPrimary,
                    color: token.colorPrimary,
                  }}
                >
                  Đăng ký
                </Button>
              </Space>
            )}
          </div>
        </Drawer>
      </AntHeader>
    </ConfigProvider>
  );
};

export default Header;