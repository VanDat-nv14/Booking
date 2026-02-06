import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Typography, 
  Button, 
  theme,
  Badge
} from 'antd';
import { 
  MedicineBoxFilled,
  ShoppingFilled,
  TeamOutlined,
  ArrowRightOutlined,
  HeartFilled,
  SafetyCertificateFilled,
  StarFilled
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;
const { useToken } = theme;

// Animations
const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shine = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 5px 0px rgba(var(--color-rgb), 0.4); }
  50% { box-shadow: 0 0 20px 5px rgba(var(--color-rgb), 0.6); }
  100% { box-shadow: 0 0 5px 0px rgba(var(--color-rgb), 0.4); }
`;

// Styled Components
const SectionContainer = styled(motion.div)`
  padding: 100px 0;
  background: linear-gradient(135deg, ${props => props.bgStart}, ${props => props.bgEnd});
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 60%;
    height: 100%;
    background: radial-gradient(circle at top right, rgba(24, 144, 255, 0.07), transparent 70%);
    z-index: 0;
  }
  
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 70%;
    height: 70%;
    background: radial-gradient(circle at bottom left, rgba(245, 34, 45, 0.05), transparent 60%);
    z-index: 0;
  }
`;

const BackgroundShapes = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
  
  .shape {
    position: absolute;
    opacity: 0.07;
    
    &.shape1 {
      top: 15%;
      right: 10%;
      width: 120px;
      height: 120px;
      border-radius: 65% 35% 65% 35% / 35% 65% 35% 65%;
      background: ${props => props.primaryColor};
      animation: ${float} 10s ease-in-out infinite;
    }
    
    &.shape2 {
      bottom: 12%;
      left: 10%;
      width: 150px;
      height: 150px;
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      background: ${props => props.infoColor};
      animation: ${float} 12s ease-in-out infinite reverse;
    }
    
    &.shape3 {
      top: 45%;
      left: 15%;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: ${props => props.successColor};
      animation: ${pulse} 8s ease-in-out infinite;
    }
  }
  
  .dots {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(rgba(0, 0, 0, 0.07) 1px, transparent 1px);
    background-size: 30px 30px;
  }
`;

const SectionHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: 80px;
  position: relative;
  z-index: 2;
`;

const HeaderIcon = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.bgColor};
  margin-bottom: 30px;
  position: relative;
  color: white;
  box-shadow: 0 15px 35px rgba(${props => props.shadowColor}, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    background: linear-gradient(45deg, ${props => props.gradientStart}, transparent, ${props => props.gradientEnd});
    background-size: 200% 200%;
    animation: ${rotate} 8s linear infinite;
    opacity: 0.7;
    z-index: -1;
  }
  
  .inner-icon {
    font-size: 48px;
  }
`;

const GradientTitle = styled(motion.h2)`
  font-weight: 800;
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
  font-size: 42px;
  background: linear-gradient(45deg, #1890ff, #52c41a, #1890ff);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-fill-color: transparent;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 5px;
    border-radius: 5px;
    background: linear-gradient(to right, #1890ff, #52c41a);
    background-size: 200% 200%;
    animation: ${shine} 4s linear infinite;
  }
`;

const ServiceCard = styled(motion.div)`
  height: 100%;
  border-radius: 20px;
  overflow: visible;
  position: relative;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(${props => props.borderColor}, 0.1);
  z-index: 1;
  
  --color-rgb: ${props => props.colorRgb};
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    padding: 2px;
    background: linear-gradient(225deg, rgba(${props => props.borderColor}, 0.3), transparent);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-16px) scale(1.03);
    box-shadow: 0 20px 40px rgba(${props => props.shadowColor}, 0.15);
    
    .service-icon {
      transform: translateY(-8px) scale(1.08);
      animation: ${glowPulse} 2s infinite;
    }
    
    .action-button {
      background: ${props => props.buttonColor};
      color: white;
      transform: translateX(5px);
    }
  }
  
  .card-content {
    padding: 30px;
    padding-top: 70px;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  top: -30px;
  left: 30px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.bgLight}, ${props => props.bgDark});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 10px 25px rgba(${props => props.shadowColor}, 0.35);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 2;
  
  .icon-inner {
    font-size: 42px;
  }
`;

const ServiceTitle = styled(Title)`
  color: ${props => props.color};
  font-weight: 700;
  margin-bottom: 16px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 3px;
    background: ${props => props.color};
    border-radius: 3px;
  }
`;

const ServiceDescription = styled(Paragraph)`
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.8;
  margin-bottom: 30px;
  flex: 1;
`;

const ActionButton = styled(Button)`
  padding: 10px 24px;
  height: auto;
  font-weight: 600;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  background: rgba(${props => props.bgColor}, 0.08);
  border: none;
  border-radius: 30px;
  margin-top: auto;
  align-self: flex-start;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 5px 15px rgba(${props => props.bgColor}, 0.15);
  
  .button-icon {
    margin-left: 8px;
    transition: transform 0.3s ease;
  }
  
  &:hover .button-icon {
    transform: translateX(5px);
  }
`;

const FeatureBadge = styled(Badge)`
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 3;
  
  .ant-badge-count {
    background: linear-gradient(45deg, ${props => props.gradientStart}, ${props => props.gradientEnd});
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 0 10px;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;

const ServiceSection = () => {
  const { token } = useToken();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  // Enhanced services data
  const services = [
    {
      id: 1,
      title: 'Dịch Vụ Y Tế & Chăm Sóc',
      description: 'Các dịch vụ y tế chuyên nghiệp từ khám bệnh, tiêm phòng đến chăm sóc toàn diện cho thú cưng của bạn.',
      icon: <MedicineBoxFilled className="icon-inner" />,
      link: '/services',
      buttonText: 'XEM DỊCH VỤ Y TẾ',
      color: token.colorPrimary,
      colorRgb: '24, 144, 255',
      badgeText: 'Chăm sóc toàn diện',
      badgeIcon: <HeartFilled />,
      badgeColors: ['#ff4d4f', '#ff7a45'],
      features: ['Khám bệnh', 'Tiêm phòng', 'Spa & Grooming']
    },
    {
      id: 2,
      title: 'Sản Phẩm Chất Lượng Cao',
      description: 'Mua sắm các sản phẩm chất lượng từ thức ăn, thuốc bổ sung đến đồ chơi và phụ kiện cao cấp cho thú cưng.',
      icon: <ShoppingFilled className="icon-inner" />,
      link: '/products',
      buttonText: 'KHÁM PHÁ SẢN PHẨM',
      color: token.colorInfo || '#1890ff',
      colorRgb: '24, 144, 255',
      badgeText: 'Chất lượng hàng đầu',
      badgeIcon: <SafetyCertificateFilled />,
      badgeColors: ['#52c41a', '#b7eb8f'],
      features: ['Thức ăn dinh dưỡng', 'Phụ kiện cao cấp', 'Thuốc & Vitamin']
    },
    {
      id: 3,
      title: 'Đội Ngũ Chuyên Gia',
      description: 'Gặp gỡ đội ngũ bác sĩ thú y và chuyên gia chăm sóc với nhiều năm kinh nghiệm và tình yêu với động vật.',
      icon: <TeamOutlined className="icon-inner" />,
      link: '/staff',
      buttonText: 'GẶP ĐỘI NGŨ CHUYÊN GIA',
      color: token.colorSuccess || '#52c41a',
      colorRgb: '82, 196, 26',
      badgeText: 'Chuyên môn cao',
      badgeIcon: <StarFilled />,
      badgeColors: ['#faad14', '#ffd591'],
      features: ['Bác sĩ giàu kinh nghiệm', 'Nhân viên tận tâm', 'Huấn luyện viên']
    }
  ];
  
  // Hex to RGB conversion for animations
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      '0, 0, 0';
  };
  
  // Intersection Observer to trigger animations when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);
  
  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20
      }
    }
  };

  return (
    <SectionContainer 
      ref={sectionRef}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
      bgStart={token.colorBgContainer}
      bgEnd={token.colorBgElevated}
    >
      <BackgroundShapes 
        primaryColor={token.colorPrimary}
        infoColor={token.colorInfo || "#1890ff"}
        successColor={token.colorSuccess || "#52c41a"}
      >
        <div className="dots"></div>
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </BackgroundShapes>
      
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        <SectionHeader variants={itemVariants}>
          <HeaderIcon 
            bgColor={`linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive || '#096dd9'})`}
            shadowColor={hexToRgb(token.colorPrimary)}
            gradientStart={token.colorPrimary}
            gradientEnd={token.colorPrimaryActive || '#096dd9'}
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              duration: 5, 
              ease: "easeInOut", 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <ShoppingFilled className="inner-icon" />
          </HeaderIcon>
          
          <GradientTitle>Dịch Vụ Của Chúng Tôi</GradientTitle>
          
          <motion.div variants={itemVariants}>
            <Paragraph 
              style={{ 
                fontSize: 18, 
                color: token.colorTextSecondary,
                maxWidth: 800,
                margin: '30px auto 0',
                lineHeight: 1.8
              }}
            >
              Chúng tôi cung cấp các dịch vụ và sản phẩm cao cấp từ đội ngũ chuyên gia, 
              đảm bảo thú cưng của bạn luôn khỏe mạnh và hạnh phúc mỗi ngày
            </Paragraph>
          </motion.div>
        </SectionHeader>

        <Row gutter={[40, 60]}>
          {services.map((service, index) => (
            <Col xs={24} md={8} key={service.id}>
              <motion.div 
                variants={itemVariants}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                transition={{ delay: index * 0.2 }}
              >
                <ServiceCard 
                  whileHover={{ 
                    y: -16,
                    scale: 1.03,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  colorRgb={service.colorRgb}
                  borderColor={service.colorRgb}
                  shadowColor={service.colorRgb}
                  buttonColor={service.color}
                >
                  <FeatureBadge 
                    count={
                      <>
                        {service.badgeIcon} {service.badgeText}
                      </>
                    }
                    gradientStart={service.badgeColors[0]}
                    gradientEnd={service.badgeColors[1]}
                  />
                  
                  <IconWrapper 
                    className="service-icon"
                    bgLight={`${service.color}dd`}
                    bgDark={service.color}
                    shadowColor={service.colorRgb}
                  >
                    {service.icon}
                  </IconWrapper>
                  
                  <div className="card-content">
                    <ServiceTitle 
                      level={4} 
                      color={service.color}
                    >
                      {service.title}
                    </ServiceTitle>
                    
                    <ServiceDescription>
                      {service.description}
                    </ServiceDescription>
                    
                    <div style={{ marginBottom: 24 }}>
                      {service.features.map((feature, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: 8,
                            color: 'rgba(0, 0, 0, 0.65)'
                          }}
                        >
                          <div 
                            style={{ 
                              width: 6, 
                              height: 6, 
                              borderRadius: '50%', 
                              background: service.color,
                              marginRight: 10
                            }}
                          />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <ActionButton 
                      className="action-button"
                      type="text"
                      color={service.color}
                      bgColor={service.colorRgb}
                    >
                      <Link to={service.link} style={{ color: 'inherit' }}>
                        {service.buttonText}
                        <ArrowRightOutlined className="button-icon" />
                      </Link>
                    </ActionButton>
                  </div>
                </ServiceCard>
              </motion.div>
            </Col>
          ))}
        </Row>
      </div>
    </SectionContainer>
  );
};

export default ServiceSection;