import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Typography, 
  Card, 
  Button, 
  Row, 
  Col, 
  Divider, 
  Avatar, 
  Space, 
  Tooltip,
  theme,
  Badge
} from 'antd';
import { 
  TeamOutlined,
  ArrowRightOutlined, 
  ShopOutlined, 
  BankOutlined,
  StarOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  HeartOutlined,
  RiseOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { Carousel } from 'antd';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

const rotateGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shine = keyframes`
  0% { 
    background-position: -100px; 
    opacity: 0;
  }
  50% { 
    opacity: 1; 
  }
  100% { 
    background-position: 300px;
    opacity: 0;
  }
`;

// Thêm hiệu ứng mới vào phần animations
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

const glowing = keyframes`
  0% { box-shadow: 0 0 5px rgba(24, 144, 255, 0.5); }
  50% { box-shadow: 0 0 20px rgba(24, 144, 255, 0.8); }
  100% { box-shadow: 0 0 5px rgba(24, 144, 255, 0.5); }
`;

const animatedGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled Components with enhanced animations
const SectionContainer = styled(motion.div)`
  padding: 100px 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 250, 255, 0.9) 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: radial-gradient(circle at top right, rgba(24, 144, 255, 0.1), transparent 70%);
    z-index: 0;
    animation: ${pulse} 15s infinite alternate;
  }
  
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 15%;
    right: 0;
    height: 60%;
    background: radial-gradient(circle at bottom left, rgba(245, 34, 45, 0.07), transparent 60%);
    z-index: 0;
    animation: ${pulse} 15s infinite alternate-reverse;
  }
`;

const AnimatedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
  
  .shape {
    position: absolute;
    opacity: 0.15;
    
    &.shape1 {
      top: 10%;
      right: 10%;
      width: 150px;
      height: 150px;
      border-radius: 72% 28% 70% 30% / 39% 55% 45% 61%;
      background: linear-gradient(45deg, #1890ff, #52c41a);
      animation: ${float} 12s ease-in-out infinite;
    }
    
    &.shape2 {
      bottom: 8%;
      left: 8%;
      width: 120px;
      height: 120px;
      border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%;
      background: linear-gradient(45deg, #fa8c16, #ff4d4f);
      animation: ${float} 10s ease-in-out infinite reverse;
    }
    
    &.shape3 {
      top: 35%;
      left: 15%;
      width: 80px;
      height: 80px;
      border-radius: 61% 39% 52% 48% / 44% 59% 41% 56%;
      background: linear-gradient(45deg, #722ed1, #13c2c2);
      animation: ${float} 14s ease-in-out infinite;
    }
  }
  
  .dots {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(rgba(24, 144, 255, 0.15) 1px, transparent 1px);
    background-size: 30px 30px;
  }
`;

const SectionHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: 80px;
  position: relative;
  z-index: 2;
`;

// Cập nhật animation của IconCircle để tránh lỗi với positionalValues
const IconCircle = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(47, 184, 255, 0.2));
  margin-bottom: 28px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    background: linear-gradient(90deg, #1890ff, #52c41a, #fa8c16, #1890ff);
    background-size: 300% 300%;
    animation: ${animatedGradient} 4s linear infinite;
    z-index: -1;
    opacity: 0.3;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    border: 2px dashed rgba(24, 144, 255, 0.4);
    animation: ${rotateGradient} 10s linear infinite;
    z-index: -2;
  }
`;

const GradientTitle = styled(motion.h2)`
  font-weight: 800;
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
  font-size: 40px;
  background: linear-gradient(135deg, #096dd9, #1890ff, #096dd9);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-fill-color: transparent;
  animation: ${rotateGradient} 5s linear infinite;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(to right, #1890ff, #52c41a);
  }
`;

// Cập nhật PartnerLogoCard với hiệu ứng 3D hover
const PartnerLogoCard = styled(motion.div)`
  height: 140px;
  margin: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  overflow: hidden;
  background: white;
  position: relative;
  perspective: 1000px;
  transform-style: preserve-3d;
  
  &:hover {
    transform: translateY(-12px) scale(1.05) rotateY(10deg);
    box-shadow: 0 20px 40px rgba(24, 144, 255, 0.15);
    border-color: rgba(24, 144, 255, 0.2);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100px;
    width: 50px;
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    transform: skewX(-15deg);
    animation: ${shine} 4s infinite;
  }
  
  img {
    max-width: 85%;
    max-height: 85%;
    object-fit: contain;
    transition: all 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    filter: grayscale(0.3);
    transform-style: preserve-3d;
  }
  
  &:hover img {
    transform: scale(1.15) translateZ(20px);
    filter: grayscale(0);
  }
`;

const PartnerCard = styled(motion.div)`
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  background: white;
  perspective: 1000px;
  
  &:hover {
    transform: translateY(-16px) scale(1.02) rotateX(2deg) rotateY(2deg);
    box-shadow: 0 20px 40px rgba(24, 144, 255, 0.15), 0 0 15px rgba(24, 144, 255, 0.1);
  }
  
  .logo-wrapper {
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.05), rgba(24, 144, 255, 0.1));
    border-bottom: 1px solid rgba(24, 144, 255, 0.08);
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100px;
      width: 50px;
      height: 100%;
      background: rgba(255, 255, 255, 0.3);
      transform: skewX(-15deg);
      transition: 0.7s;
    }
  }
  
  &:hover .logo-wrapper {
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.08), rgba(82, 196, 26, 0.1));
    background-size: 200% 200%;
    animation: ${animatedGradient} 3s ease infinite;
  }
  
  &:hover .logo-wrapper::after {
    animation: ${shine} 1.2s ease-in-out;
  }
  
  .partner-logo {
    max-width: 85%;
    max-height: 85%;
    object-fit: contain;
    transition: all 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    filter: grayscale(0.2);
  }
  
  &:hover .partner-logo {
    transform: scale(1.15) rotate(2deg) translateZ(20px);
    filter: grayscale(0);
  }
  
  .content {
    padding: 24px;
    min-height: 150px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .action-footer {
    padding: 16px 24px;
    border-top: 1px dashed rgba(24, 144, 255, 0.1);
    display: flex;
    justify-content: center;
  }
  
  .badge {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10;
  }
`;

// Sửa FeatureBadge để tránh xung đột animation
const FeatureBadge = styled(Badge)`
  .ant-badge-count {
    background: linear-gradient(135deg, #1890ff, #52c41a);
    background-size: 200% 200%;
    animation: ${animatedGradient} 3s ease infinite;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
    padding: 0 8px;
    font-weight: 600;
    border: none;
  }
`;

const StyledDivider = styled(Divider)`
  &::before, &::after {
    border-top: 1px dashed rgba(24, 144, 255, 0.2) !important;
  }
  
  .ant-divider-inner-text {
    padding: 0 20px;
    background: rgba(24, 144, 255, 0.05);
    border-radius: 20px;
  }
`;

// Cập nhật nút GradientButton với hiệu ứng ánh sáng sống động
const GradientButton = styled(Button)`
  background: linear-gradient(45deg, #1890ff, #52c41a);
  background-size: 200% auto;
  animation: ${animatedGradient} 4s ease infinite;
  border: none;
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 10px 25px rgba(24, 144, 255, 0.25);
    animation: ${glowing} 1.5s infinite;
  }
  
  &::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -60%;
    width: 20%;
    height: 200%;
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(30deg);
    transition: 0.7s;
  }
  
  &:hover::after {
    animation: ${shimmer} 1.5s infinite;
  }
`;

// Cập nhật OutlineButton với hiệu ứng mượt mà
const OutlineButton = styled(Button)`
  border: 2px solid rgba(24, 144, 255, 0.5);
  transition: all 0.3s ease;
  font-weight: 500;
  overflow: hidden;
  position: relative;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(24, 144, 255, 0.1);
    border-color: #1890ff;
    color: #1890ff;
  }
  
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(24, 144, 255, 0.2), transparent);
    transition: all 0.3s ease;
  }
  
  &:hover::after {
    left: 100%;
  }
`;

const PartnerStat = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  
  .icon {
    color: ${props => props.color || '#1890ff'};
    margin-right: 8px;
    font-size: 14px;
  }
  
  .text {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
  }
`;

// Cập nhật StyledCarousel với hiệu ứng navigation buttons
const StyledCarousel = styled(Carousel)`
  .slick-track {
    display: flex !important;
    padding: 20px 0;
  }
  
  .slick-slide {
    height: inherit !important;
    display: flex !important;
    align-items: center;
    justify-content: center;
  }
  
  .slick-slide > div {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .slick-dots {
    bottom: -30px;
    
    li button {
      background: rgba(24, 144, 255, 0.3);
      border-radius: 4px;
      height: 6px;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(24, 144, 255, 0.5);
      }
    }
    
    li.slick-active button {
      background: linear-gradient(90deg, #1890ff, #52c41a);
      width: 20px;
    }
  }
  
  .slick-prev, .slick-next {
    opacity: 0;
    width: 40px;
    height: 40px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    z-index: 10;
    transition: all 0.3s ease;
    
    &:before {
      color: #1890ff;
      font-size: 18px;
    }
    
    &:hover {
      background: #1890ff;
      &:before {
        color: white;
      }
    }
  }
  
  &:hover {
    .slick-prev, .slick-next {
      opacity: 1;
    }
  }
`;

// Sửa CtaCard để tránh xung đột animation
const CtaCard = styled(motion.div)`
  margin-top: 100px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.05), rgba(24, 144, 255, 0.1));
  border: 1px solid rgba(24, 144, 255, 0.15);
  position: relative;
  overflow: hidden;
  text-align: center;
  padding: 60px 40px 50px;
  box-shadow: 0 20px 60px rgba(24, 144, 255, 0.1);
  transition: all 0.4s ease;
  
  .cta-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.1;
    background-image: url('/images/pattern.svg');
    background-repeat: repeat;
    background-size: 300px;
    z-index: 0;
    transition: all 0.5s ease;
  }
  
  &:hover .cta-bg {
    opacity: 0.15;
    transform: scale(1.05);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #1890ff, #52c41a, #fa8c16, #1890ff);
    background-size: 300% 300%;
    animation: ${animatedGradient} 3s linear infinite;
  }
`;

// Helper function to truncate description text
const truncateDescription = (description, maxLength = 80) => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength) + '...';
};

// Container variants for framer-motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.5
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
      stiffness: 200, 
      damping: 20
    }
  }
};

const fadeInUpVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

const PartnersSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { token } = useToken();
  
  // Enhanced partner data with more details
  const partners = [
    {
      id: 1,
      name: 'Royal Canin',
      logo: '/images/logos/partner1.png',
      description: truncateDescription('Thức ăn dinh dưỡng cao cấp dành riêng cho từng giống chó, mèo với công thức đặc biệt giúp tăng cường sức khỏe toàn diện.'),
      featured: true,
      stats: [
        { icon: <GlobalOutlined />, text: 'Có mặt tại hơn 100 quốc gia', color: '#1890ff' },
        { icon: <TrophyOutlined />, text: 'Thương hiệu uy tín hơn 50 năm', color: '#fa8c16' },
      ]
    },
    {
      id: 2,
      name: 'Pedigree',
      logo: '/images/logos/partner2.png',
      description: truncateDescription('Thương hiệu thức ăn và phụ kiện cho chó hàng đầu, mang đến dinh dưỡng cân bằng và đầy đủ cho mọi giống chó.'),
      featured: false,
      stats: [
        { icon: <HeartOutlined />, text: 'Được tin dùng bởi 40+ triệu thú cưng', color: '#ff4d4f' },
        { icon: <SafetyCertificateOutlined />, text: 'Chứng nhận về an toàn thực phẩm', color: '#52c41a' },
      ]
    },
    {
      id: 3,
      name: 'Whiskas',
      logo: '/images/logos/partner3.png',
      description: truncateDescription('Chuyên các sản phẩm dinh dưỡng dành cho mèo, được nghiên cứu theo từng giai đoạn phát triển của mèo từ nhỏ đến trưởng thành.'),
      featured: false,
      stats: [
        { icon: <RiseOutlined />, text: 'Thương hiệu #1 cho mèo tại Việt Nam', color: '#722ed1' },
        { icon: <CheckCircleOutlined />, text: 'Được khuyên dùng bởi bác sĩ thú y', color: '#13c2c2' },
      ]
    },
    {
      id: 4,
      name: 'Hill\'s',
      logo: '/images/logos/partner4.png',
      description: truncateDescription('Thức ăn theo toa bác sĩ với công thức đặc biệt hỗ trợ điều trị cho thú cưng mắc các bệnh lý khác nhau.'),
      featured: true,
      stats: [
        { icon: <StarOutlined />, text: 'Công thức độc quyền cho từng bệnh lý', color: '#1890ff' },
        { icon: <CheckCircleOutlined />, text: '70+ năm nghiên cứu dinh dưỡng', color: '#52c41a' },
      ]
    },
    {
      id: 5,
      name: 'Pet Supplies',
      logo: '/images/logos/partner5.png',
      description: truncateDescription('Cung cấp các phụ kiện thú cưng chất lượng cao, từ vòng cổ đến đồ chơi huấn luyện, giường nệm và nhiều sản phẩm khác.'),
      featured: false,
      stats: [
        { icon: <CheckCircleOutlined />, text: 'Hơn 500+ sản phẩm đa dạng', color: '#13c2c2' },
        { icon: <HeartOutlined />, text: 'Chất liệu thân thiện với môi trường', color: '#52c41a' },
      ]
    },
    {
      id: 6,
      name: 'Vet Pharmacy',
      logo: '/images/logos/partner6.png',
      description: truncateDescription('Nhà cung cấp dược phẩm thú y chất lượng, thuốc điều trị và thực phẩm chức năng giúp bảo vệ và nâng cao sức khỏe thú cưng.'),
      featured: false,
      stats: [
        { icon: <SafetyCertificateOutlined />, text: 'Đạt chuẩn GMP thế giới', color: '#1890ff' },
        { icon: <CheckCircleOutlined />, text: '100% thuốc có nguồn gốc rõ ràng', color: '#fa8c16' },
      ]
    },
  ];

  // Intersection Observer to detect when section is visible
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

  return (
    <SectionContainer 
      ref={sectionRef}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <AnimatedBackground aria-hidden="true">
        <div className="dots"></div>
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </AnimatedBackground>
      
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <SectionHeader variants={fadeInUpVariants}>
          <IconCircle
            animate={{ 
              rotate: [0, 5, 0, -5, 0],
              scale: [1, 1.03, 1, 1.03, 1]
            }}
            transition={{ 
              duration: 5, 
              ease: "easeInOut", 
              repeat: Infinity
            }}
          >
            <Avatar 
              size={70}
              icon={<TeamOutlined style={{ fontSize: 32 }} />}
              style={{ 
                backgroundColor: token.colorPrimary,
                boxShadow: '0 10px 20px rgba(24, 144, 255, 0.3)'
              }}
            />
          </IconCircle>
          
          <GradientTitle
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            style={{
              textShadow: '0 2px 10px rgba(24, 144, 255, 0.2)'
            }}
          >
            Đối Tác Đáng Tin Cậy
          </GradientTitle>
          
          <motion.div variants={itemVariants}>
            <Paragraph
              style={{
                maxWidth: 800,
                margin: '32px auto 0',
                lineHeight: 1.8,
                fontSize: '18px',
                color: 'rgba(0, 0, 0, 0.7)',
              }}
            >
              Chúng tôi tự hào hợp tác với các thương hiệu hàng đầu trong ngành chăm sóc thú cưng để mang đến sản phẩm và dịch vụ 
              chất lượng cao nhất. Mỗi đối tác đều được lựa chọn kỹ lưỡng để đảm bảo chất lượng và sự an toàn cho thú cưng của bạn.
            </Paragraph>
          </motion.div>
        </SectionHeader>
        
        {/* Logo Slider */}
        <motion.div 
          style={{ margin: '60px 0 100px' }}
          variants={fadeInUpVariants}
        >
          <StyledCarousel
            autoplay
            dots={true}
            slidesToShow={4}
            slidesToScroll={1}
            autoplaySpeed={3000}
            infinite
            pauseOnHover
            responsive={[
              {
                breakpoint: 1200,
                settings: {
                  slidesToShow: 4,
                }
              },
              {
                breakpoint: 992,
                settings: {
                  slidesToShow: 3,
                }
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 2,
                }
              },
              {
                breakpoint: 576,
                settings: {
                  slidesToShow: 1.2,
                  centerMode: true,
                  centerPadding: '40px'
                }
              }
            ]}
          >
            {partners.map(partner => (
              <div key={partner.id} style={{ padding: '0 12px' }}>
                <PartnerLogoCard
                  whileHover={{ y: -10, scale: 1.05 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15
                  }}
                >
                  <img 
                    src={partner.logo}
                    alt={partner.name}
                    style={{
                      maxWidth: '85%',
                      maxHeight: '85%',
                      objectFit: 'contain'
                    }}
                  />
                </PartnerLogoCard>
              </div>
            ))}
          </StyledCarousel>
        </motion.div>
        
        {/* Section Divider */}
        <StyledDivider orientation="center" style={{ margin: '80px 0 60px' }}>
          <Text style={{ fontSize: 15, fontWeight: 600, letterSpacing: 1, color: '#1890ff' }}>
            NHỮNG THƯƠNG HIỆU ĐẲNG CẤP
          </Text>
        </StyledDivider>
        
        {/* Partner Grid Cards */}
        <Row gutter={[32, 32]}>
          {partners.map((partner, index) => (
            <Col xs={24} sm={12} md={8} key={partner.id}>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <PartnerCard
                  whileHover={{ 
                    y: -10, 
                    scale: 1.02
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15
                  }}
                >
                  {partner.featured && (
                    <div className="badge">
                      <FeatureBadge count="Nổi bật" />
                    </div>
                  )}
                  
                  <div className="logo-wrapper">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="partner-logo"
                    />
                  </div>
                  
                  <div className="content">
                    <Title 
                      level={5}
                      ellipsis={{ rows: 1 }}
                      style={{
                        fontWeight: 600,
                        marginBottom: 10,
                        transition: 'color 0.3s ease',
                        color: 'rgba(0, 0, 0, 0.85)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {partner.name}
                    </Title>
                    
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{
                        color: 'rgba(0, 0, 0, 0.65)',
                        fontSize: 14,
                        lineHeight: 1.6,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        marginBottom: 16
                      }}
                    >
                      {partner.description}
                    </Paragraph>
                    
                    {partner.stats.map((stat, idx) => (
                      <PartnerStat key={idx} color={stat.color}>
                        <span className="icon">{stat.icon}</span>
                        <span className="text">{stat.text}</span>
                      </PartnerStat>
                    ))}
                  </div>
                  
                  <div className="action-footer">
                    <Tooltip title="Xem chi tiết về đối tác">
                      <OutlineButton 
                        type="default"
                        icon={<ArrowRightOutlined />}
                        shape="round"
                        size="middle"
                      >
                        Khám phá thêm
                      </OutlineButton>
                    </Tooltip>
                  </div>
                </PartnerCard>
              </motion.div>
            </Col>
          ))}
        </Row>
        
        {/* Call to Action */}
        <CtaCard
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="cta-bg"></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Avatar 
              size={80}
              icon={<BankOutlined style={{ fontSize: 36 }} />}
              style={{ 
                backgroundColor: 'white',
                color: token.colorPrimary,
                boxShadow: '0 10px 20px rgba(24, 144, 255, 0.2)',
                marginBottom: 24,
                border: '4px solid rgba(24, 144, 255, 0.1)'
              }}
            />
            
            <Title level={3} style={{ fontWeight: 700, color: '#1890ff', marginBottom: 20 }}>
              Trở Thành Đối Tác Của Chúng Tôi
            </Title>
            
            <Paragraph style={{ maxWidth: 700, margin: '0 auto 32px', color: 'rgba(0, 0, 0, 0.7)', fontSize: 16 }}>
              Bạn muốn giới thiệu sản phẩm hoặc dịch vụ đến những người yêu thú cưng? Hãy trở thành đối tác của chúng tôi
              và cùng mang đến những trải nghiệm tốt nhất cho thú cưng trên khắp Việt Nam.
            </Paragraph>
            
            <Space size={16}>
              <GradientButton 
                type="primary" 
                size="large"
                icon={<BankOutlined />}
                shape="round"
              >
                Liên Hệ Hợp Tác
              </GradientButton>
              
              <OutlineButton 
                type="default" 
                size="large" 
                icon={<ShopOutlined />}
                shape="round"
              >
                Tìm Hiểu Thêm
              </OutlineButton>
            </Space>
          </div>
        </CtaCard>
      </div>
    </SectionContainer>
  );
};

export default PartnersSection;