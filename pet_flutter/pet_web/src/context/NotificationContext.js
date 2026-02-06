import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { notification, Button, Modal, Typography, Space, Divider, Tag } from 'antd';
import { 
  SmileOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  CheckCircleFilled,
  HeartFilled,
  FireFilled,
  ThunderboltFilled,
  GiftOutlined,
  RocketOutlined,
  StarOutlined,
  StarFilled,
  ShoppingOutlined,
  CrownOutlined
} from '@ant-design/icons';
import './notifications.css'; 
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

// Create context
const NotificationContext = createContext();

// Hook to use the context
export const useNotification = () => useContext(NotificationContext);

// Animation variants for framer-motion
const modalVariants = {
  hidden: { 
    scale: 0.8, 
    opacity: 0,
    y: 20
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20,
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    y: -20,
    transition: { 
      duration: 0.3,
      ease: "easeOut" 
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 25
    }
  }
};

const floatVariants = {
  hidden: { y: 0 },
  visible: {
    y: [0, -10, 0],
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: 3,
      ease: "easeInOut"
    }
  }
};

const shimmerVariants = {
  hidden: { x: "-100%", opacity: 0.3 },
  visible: {
    x: "100%",
    opacity: 0.6,
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: 2,
      ease: "easeInOut"
    }
  }
};

export const NotificationProvider = ({ children }) => {
  const [api, contextHolder] = notification.useNotification();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [centerModalVisible, setCenterModalVisible] = useState(false);
  const [activePromotion, setActivePromotion] = useState(null);
  const notificationDisplayed = useRef(false);

  // Show welcome notification
  const showWelcomeNotification = useCallback(() => {
    if (!hasShownWelcome && !notificationDisplayed.current) {
      notificationDisplayed.current = true;
      
      setTimeout(() => {
        setCenterModalVisible(true);
        setHasShownWelcome(true);
        
        // Show promo after 1 second
        setTimeout(() => {
          setActivePromotion({
            title: "Ưu đãi đặc biệt",
            code: "WELCOME20",
            discount: "20%",
            expiry: "7 ngày",
            benefit: "tất cả dịch vụ"
          });
        }, 1000);
      }, 2000);
    }
  }, [hasShownWelcome]);

  // Show regular notification
  const showNotification = useCallback((type, message, description, duration = 6) => {
    const notificationTypes = {
      info: {
        icon: <InfoCircleOutlined className="notification-icon info-icon" />,
        className: "notification-info"
      },
      success: {
        icon: <CheckCircleFilled className="notification-icon success-icon" />,
        className: "notification-success"
      },
      promo: {
        icon: <GiftOutlined className="notification-icon promo-icon" />,
        className: "notification-promo"
      },
      special: {
        icon: <FireFilled className="notification-icon special-icon" />,
        className: "notification-special"
      },
      announcement: {
        icon: <RocketOutlined className="notification-icon announcement-icon" />,
        className: "notification-announcement"
      }
    };
    
    const config = notificationTypes[type] || notificationTypes.info;
    
    api.open({
      message,
      description,
      icon: config.icon,
      duration,
      placement: 'topRight',
      className: `animated-notification ${config.className}`,
      btn: type === 'promo' && (
        <Button type="primary" size="small" className="notification-action-btn">
          <ShoppingOutlined /> Sử dụng ngay
        </Button>
      )
    });
    
  }, [api]);

  // Show different types of notifications
  const showSuccessNotification = useCallback((message, description) => {
    showNotification('success', message, description);
  }, [showNotification]);
  
  const showPromoNotification = useCallback((message, description) => {
    showNotification('promo', message, description, 10);
  }, [showNotification]);
  
  const showSpecialNotification = useCallback((message, description) => {
    showNotification('special', message, description, 8);
  }, [showNotification]);
  
  const showAnnouncementNotification = useCallback((message, description) => {
    showNotification('announcement', message, description, 10);
  }, [showNotification]);

  // Show welcome notification when component mounts
  useEffect(() => {
    showWelcomeNotification();
  }, [showWelcomeNotification]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setCenterModalVisible(false);
  }, []);

  // Close handler for outside clicks
  const handleOutsideClick = useCallback((e) => {
    // Nếu click vào wrapper bên ngoài (không phải nội dung modal)
    if (e.target.className.includes('enhanced-modal-wrapper')) {
      handleCloseModal();
    }
  }, [handleCloseModal]);

  return (
    <NotificationContext.Provider 
      value={{ 
        showNotification, 
        showSuccessNotification, 
        showPromoNotification,
        showSpecialNotification,
        showAnnouncementNotification
      }}
    >
      {contextHolder}
      
      {/* Welcome modal */}
      <AnimatePresence>
        {centerModalVisible && (
          <div 
            className="enhanced-modal-wrapper"
            onClick={handleOutsideClick}
          >
            <Modal
              open={centerModalVisible}
              footer={null}
              onCancel={handleCloseModal}
              centered
              closeIcon={<CloseOutlined className="enhanced-close-icon" />}
              className="welcome-modal enhanced-modal"
              width={400}
              maskClosable={true}
              styles={{ mask: { backdropFilter: 'blur(10px)' } }}
            >
              <motion.div 
                className="welcome-modal-content"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()} // Ngăn click từ lan truyền
              >
                {/* Nút đóng tùy chỉnh - sang trọng hơn */}
                <button 
                  className="custom-modal-close" 
                  onClick={handleCloseModal}
                  aria-label="Đóng"
                >
                  ×
                </button>
                
                {/* Decorative elements - thêm sang trọng */}
                <motion.div variants={itemVariants} className="welcome-modal-decoration top-left" />
                <motion.div variants={itemVariants} className="welcome-modal-decoration top-right" />
                <motion.div variants={itemVariants} className="welcome-modal-decoration bottom-left" />
                <motion.div variants={itemVariants} className="welcome-modal-decoration bottom-right" />
                
                {/* Pet animation - cải thiện sang trọng */}
                <motion.div 
                  className="welcome-animation-container"
                  variants={floatVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="pet-animation">
                    <div className="pet-head"></div>
                    <div className="pet-body"></div>
                    <div className="pet-tail"></div>
                  </div>
                </motion.div>
                
                {/* Premium badge - tăng sang trọng */}
                <motion.div 
                  className="premium-badge"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, type: "spring" }}
                >
                  <CrownOutlined /> Premium
                </motion.div>
                
                <motion.div variants={itemVariants} className="welcome-icon">
                  <HeartFilled className="icon-pulse" />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Title level={3} className="welcome-title">
                    Chào mừng đến <span className="highlight">Pet Care!</span>
                  </Title>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Paragraph className="welcome-message">
                    Cảm ơn bạn đã ghé thăm trang web của chúng tôi. Khám phá các dịch vụ chăm sóc 
                    thú cưng cao cấp cho người bạn bốn chân của bạn.
                  </Paragraph>
                </motion.div>
                
                {activePromotion && (
                  <motion.div 
                    variants={itemVariants}
                    className="promo-container elite-promo"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.5 }}
                  >
                    <div className="promo-badge">
                      <StarFilled /> Ưu đãi VIP
                    </div>
                    <div className="promo-content">
                      <Title level={5}>Giảm {activePromotion.discount} cho {activePromotion.benefit}</Title>
                      <div className="promo-code">
                        <Text code copyable className="code-text">{activePromotion.code}</Text>
                        <motion.div 
                          className="shimmer-effect"
                          variants={shimmerVariants}
                          initial="hidden"
                          animate="visible"
                        />
                      </div>
                      <Text type="secondary" className="promo-expiry">
                        <Tag color="gold" className="premium-tag">Ưu đãi đặc biệt</Tag> 
                        Hết hạn sau {activePromotion.expiry}
                      </Text>
                    </div>
                  </motion.div>
                )}
                
                <motion.div variants={itemVariants} className="feature-bullets">
                  <Space direction="vertical" size="small">
                    <div className="feature-item premium-feature">
                      <CheckCircleFilled className="feature-icon" /> Đặt lịch nhanh chóng &amp; dễ dàng
                    </div>
                    <div className="feature-item premium-feature">
                      <CheckCircleFilled className="feature-icon" /> Bác sĩ thú y chuyên nghiệp
                    </div>
                    <div className="feature-item premium-feature">
                      <CheckCircleFilled className="feature-icon" /> Dịch vụ chăm sóc toàn diện
                    </div>
                  </Space>
                </motion.div>
                
                <motion.div variants={itemVariants} className="welcome-buttons">
                  <Space>
                    <Button 
                      type="primary" 
                      size="large"
                      onClick={handleCloseModal}
                      className="primary-button premium-button"
                    >
                      <ThunderboltFilled /> Khám phá ngay
                    </Button>
                    
                    <Button 
                      type="default" 
                      size="large"
                      onClick={() => {
                        handleCloseModal();
                        window.location.href = '/services';
                      }}
                      className="secondary-button"
                    >
                      Xem dịch vụ
                    </Button>
                  </Space>
                </motion.div>

                {/* Signature line - tạo cảm giác cao cấp */}
                <motion.div 
                  className="signature-line"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 1.5 }}
                >
                  <span>Chúng tôi yêu thú cưng của bạn ♥</span>
                </motion.div>
              </motion.div>
            </Modal>
          </div>
        )}
      </AnimatePresence>

      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;