import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Row, Col, Space, Divider, Badge, Steps, message } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import RegisterForm from '../components/auth/RegisterForm';
import Icon from '@ant-design/icons';

// Ant Design Icons
import { 
  GoogleOutlined, 
  FacebookFilled, 
  AppleFilled,
  UserAddOutlined,
  CheckCircleFilled,
  CalendarOutlined,
  HistoryOutlined,
  BellOutlined,
  HeartFilled,
  RocketOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';

// Custom Pet Icon SVG
const PetSvg = () => (
  <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
    <path d="M512 292.5c29.8 0 54-24.2 54-54 0-29.8-24.2-54-54-54s-54 24.2-54 54c0 29.8 24.2 54 54 54zm258 54c29.8 0 54-24.2 54-54 0-29.8-24.2-54-54-54s-54 24.2-54 54c0 29.8 24.2 54 54 54zm-516 0c29.8 0 54-24.2 54-54 0-29.8-24.2-54-54-54s-54 24.2-54 54c0 29.8 24.2 54 54 54zm664 94.4c0-98.7-80.5-179.2-179.2-179.2-59.4 0-112.2 29.1-144.8 73.6-26-34.9-60.2-63-100.2-81.3C465.9 191.5 421 144 364.8 144c-69.9 0-126.5 56.7-126.5 126.5 0 4.6.2 9.1.7 13.6-97.9 19.6-179 98.1-183.9 199.5C22.9 507.9 0 547.9 0 593.7c0 74.7 60.6 135.2 135.2 135.2 62.1 0 114.3-41.7 130.2-98.9 32.7 17.4 69.8 28.2 109.1 30.7 36.1 80.8 116.1 136.9 209.8 136.9 98.4 0 182.6-61.7 214.9-148.7 31.8-9.4 58.8-30.7 76.5-59.2C934.1 603.1 972 577 972 541c0-46.5-22.8-88.2-54-113.1zM135.2 674.8c-44.9 0-81.2-36.3-81.2-81.2 0-33 19.9-62.1 48.7-74.7 9.5 127.9 108.7 230.5 235.3 243.6-25.6 39.7-69.9 65.9-119.7 65.9-79.5 0-144-64.5-144-144 0-13.8 2.1-27.1 5.8-39.7 17.5 19.6 42.9 32.1 71.2 32.1 8.3 0 15-6.7 15-15s-6.7-15-15-15c-33.3 0-60.3-27.1-60.3-60.3 0-8.3-6.7-15-15-15s-15 6.7-15 15c0 16.1 3.8 31.9 11.1 46-2.6 10.3-3.9 21.1-3.9 32 0 3.4.1 6.7.3 10 0 .4 0 .9-.1 1.3-19.7 16-32.2 40.4-32.2 67.9 0 48.2 39 87.2 87.2 87.2 33.8 0 63.1-19.2 77.8-47.3l2.2-4.4c-22.5-6.2-43.8-15.5-63.5-27.5-10.1-17.8-15.8-38.2-15.8-60zm376.9 67.7c-111.7 0-202.5-90.8-202.5-202.5s90.8-202.5 202.5-202.5S714.5 428.3 714.5 540s-90.8 202.5-202.4 202.5zM834.7 634c.9 0 1.8.1 2.7.1 36.6 0 66.2-29.7 66.2-66.2 0-36.6-29.7-66.2-66.2-66.2-.9 0-1.8 0-2.7.1-12.9-64.7-57.1-117.9-116.3-144.6-38.6-17.4-81.7-17.6-120.5-.4-18.4 8.1-35.1 19.3-49.9 33.1-21.6 20.2-38.6 45.7-49.4 74.3-.7-.1-1.4-.2-2.2-.2-26.6 0-48.3 21.6-48.3 48.3s21.6 48.3 48.3 48.3c.7 0 1.4-.1 2.2-.2 14.9 39.5 42.3 73.3 78.1 96.7-26.7 39.5-71.3 65.3-121.7 65.3-75.9 0-138.6-57.7-146.4-131.6 32.2-1.5 62.9-13.3 87.2-33.8 29.1-24.4 46.3-60.2 47.1-98.2 0-3.2.9-6.1 2.5-8.6 21.2-32.8 57.5-54.4 98.8-54.4 11.9 0 21.9-8.6 23.8-20.3 4.2-26.6 27.3-46.9 54.8-46.9 23.3 0 44-11.3 56.8-28.8 25.4 8.9 47.2 25.4 63.1 47.2 18.2 30 20.9 65.5 7.8 96.4-28.6-59.9-89.7-101.2-160.1-101.2-19.5 0-38.4 3.2-56.1 9-8.1 2.7-16.1 5.8-23.7 9.5-69.7 33.2-117.8 104.4-117.8 186.8 0 114.1 92.4 206.5 206.5 206.5 106.8 0 194.9-81 205.6-184.9z"/>
  </svg>
);

const PetIcon = props => <Icon component={PetSvg} {...props} />;

// Styled components
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  background: linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%);
  overflow: hidden;
`;

const AnimatedCard = styled(motion.div)`
  width: 100%;
  max-width: 650px;
  position: relative;
  z-index: 10;
`;

const StyledCard = styled(Card)`
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  .ant-card-head {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .ant-card-body {
    padding: 28px 36px 36px;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
`;

const LogoIcon = styled(motion.div)`
  font-size: 48px;
  color: #1890ff;
  margin-right: 12px;
  filter: drop-shadow(0 2px 8px rgba(24, 144, 255, 0.3));
`;

const SocialButton = styled(Button)`
  width: 100%;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &.google-btn {
    background-color: white;
    color: #606060;
    border: 1px solid #dadce0;
    &:hover {
      background-color: #f5f5f5;
      border-color: #d0d0d0;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    }
  }
  
  &.facebook-btn {
    background-color: #1877f2;
    color: white;
    border: none;
    &:hover {
      background-color: #166fe5;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(24, 119, 242, 0.3);
    }
  }
  
  &.apple-btn {
    background-color: black;
    color: white;
    border: none;
    &:hover {
      background-color: #333;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25);
    }
  }
  
  .anticon {
    font-size: 20px;
    margin-right: 10px;
  }
`;

const OrText = styled(Typography.Text)`
  display: flex;
  align-items: center;
  color: #8c8c8c;
  font-weight: 500;
  margin: 24px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #f0f0f0;
    margin: 0 16px;
  }
`;

const StyledTitle = styled(Typography.Title)`
  text-align: center;
  margin-bottom: 8px !important;
  background: linear-gradient(90deg, #1890ff, #52c41a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700 !important;
`;

const StyledSubtitle = styled(Typography.Text)`
  text-align: center;
  display: block;
  color: #8c8c8c;
  margin-bottom: 28px;
  font-size: 15px;
`;

const BenefitsCard = styled(motion.div)`
  margin: 32px 0;
  background: linear-gradient(145deg, #f6f8ff, #eaf7ff);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(24, 144, 255, 0.1);
`;

const BenefitItem = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .anticon {
    font-size: 18px;
    color: #52c41a;
    margin-right: 12px;
  }
  
  .benefit-text {
    font-weight: 500;
    color: #303030;
  }
`;

const FloatingShapes = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
`;

const Shape = styled(motion.div)`
  position: absolute;
  background-color: ${props => props.color};
  border-radius: ${props => props.isSquare ? '20%' : '50%'};
  opacity: 0.25;
  filter: blur(3px);
`;

const PromoBadge = styled(motion.div)`
  position: absolute;
  top: -5px;
  right: -5px;
  z-index: 20;
`;

const RegisterPage = () => {
  const [loading, setLoading] = useState({
    google: false,
    facebook: false,
    apple: false
  });
  
  const [benefits] = useState([
    {
      icon: <CalendarOutlined />,
      text: 'Đặt lịch khám và dịch vụ cho thú cưng dễ dàng'
    },
    {
      icon: <HistoryOutlined />,
      text: 'Theo dõi lịch sử y tế và hoạt động chăm sóc'
    },
    {
      icon: <BellOutlined />,
      text: 'Nhận thông báo và nhắc nhở về lịch chăm sóc'
    },
    {
      icon: <SafetyCertificateOutlined />,
      text: 'Bảo mật thông tin và quyền riêng tư'
    }
  ]);

  const handleSocialRegister = (provider) => {
    setLoading({ ...loading, [provider]: true });
    
    // Simulate loading state
    setTimeout(() => {
      setLoading({ ...loading, [provider]: false });
      message.success({
        content: `Đăng ký với ${provider} thành công`,
        icon: <RocketOutlined style={{ color: '#52c41a' }} />,
        duration: 2
      });
      // Implement actual social login logic here
    }, 1500);
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.7,
        ease: "easeOut",
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };

  const logoVariants = {
    initial: { rotate: 0, scale: 1 },
    animate: { 
      rotate: [0, 10, -10, 0],
      scale: [1, 1.1, 1],
      transition: { 
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const staggerItem = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15
      }
    }
  };

  const badgeVariants = {
    initial: { rotate: 0, scale: 1 },
    animate: { 
      rotate: [-3, 3, -3],
      scale: [1, 1.05, 1],
      transition: { 
        duration: 2, 
        repeat: Infinity,
        repeatType: "reverse" 
      }
    }
  };

  return (
    <PageContainer>
      <FloatingShapes>
        {/* Floating shapes in the background */}
        {[...Array(10)].map((_, i) => (
          <Shape
            key={i}
            color={i % 3 === 0 ? '#1890ff' : i % 3 === 1 ? '#52c41a' : '#ff4d4f'}
            isSquare={i % 5 === 0}
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 70 - 35],
              y: [0, Math.random() * 70 - 35],
              rotate: [0, Math.random() * 360],
              transition: {
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }
            }}
          />
        ))}
      </FloatingShapes>
      
      <AnimatedCard
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <PromoBadge
          variants={badgeVariants}
          initial="initial"
          animate="animate"
        >
          <Badge.Ribbon 
            text={
              <Space>
                <HeartFilled /> Trải nghiệm mới
              </Space>
            } 
            color="#ff4d4f"
            placement="end"
          >
            <div style={{ width: 30, height: 30 }}></div>
          </Badge.Ribbon>
        </PromoBadge>
        
        <StyledCard>
          <LogoContainer>
            <LogoIcon
              variants={logoVariants}
              initial="initial" 
              animate="animate"
            >
              <PetIcon />
            </LogoIcon>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Typography.Title level={2} style={{ margin: 0, color: '#1890ff', fontWeight: 700 }}>
                Pet Care <HeartFilled style={{ fontSize: '24px', color: '#ff4d4f' }} />
              </Typography.Title>
            </motion.div>
          </LogoContainer>

          <StyledTitle level={3}>
            <UserAddOutlined style={{ marginRight: 8 }} />
            Đăng ký tài khoản
          </StyledTitle>
          <StyledSubtitle>
            Tạo tài khoản để trải nghiệm đầy đủ dịch vụ chăm sóc thú cưng
          </StyledSubtitle>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <SocialButton
                  className="google-btn"
                  icon={<GoogleOutlined />}
                  onClick={() => handleSocialRegister('Google')}
                  loading={loading.google}
                >
                  Google
                </SocialButton>
              </Col>
              <Col xs={24} sm={8}>
                <SocialButton
                  className="facebook-btn"
                  icon={<FacebookFilled />}
                  onClick={() => handleSocialRegister('Facebook')}
                  loading={loading.facebook}
                >
                  Facebook
                </SocialButton>
              </Col>
              <Col xs={24} sm={8}>
                <SocialButton
                  className="apple-btn"
                  icon={<AppleFilled />}
                  onClick={() => handleSocialRegister('Apple')}
                  loading={loading.apple}
                >
                  Apple
                </SocialButton>
              </Col>
            </Row>
          </motion.div>

          <OrText>HOẶC ĐĂNG KÝ BẰNG EMAIL</OrText>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <RegisterForm />
          </motion.div>

          <BenefitsCard
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <Typography.Title level={5} style={{ marginBottom: 16 }}>
              <CheckCircleFilled style={{ color: '#52c41a', marginRight: 8 }} />
              Lợi ích khi đăng ký tài khoản
            </Typography.Title>
            
            {benefits.map((benefit, index) => (
              <BenefitItem 
                key={index}
                variants={staggerItem}
                whileHover={{ 
                  scale: 1.02, 
                  backgroundColor: 'rgba(82, 196, 26, 0.05)',
                  transition: { duration: 0.2 }
                }}
              >
                {benefit.icon}
                <span className="benefit-text">{benefit.text}</span>
              </BenefitItem>
            ))}
          </BenefitsCard>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Typography.Text type="secondary">
                Bạn đã có tài khoản?
              </Typography.Text>
              <Link to="/login">
                <Button type="link" style={{ fontWeight: 600, padding: 0 }}>
                  Đăng nhập ngay
                </Button>
              </Link>
            </Space>
          </motion.div>
        </StyledCard>
      </AnimatedCard>
    </PageContainer>
  );
};

export default RegisterPage;