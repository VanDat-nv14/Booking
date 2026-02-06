import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layout, 
  Row, 
  Col, 
  Card, 
  Button, 
  Typography, 
  Badge, 
  Tag,
  Empty, 
  Divider,
  Alert, 
  Skeleton,
  theme,
  Avatar,
  Tooltip,
  Carousel,
  notification
} from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
  ShoppingCartOutlined,
  InfoCircleOutlined,
  ExclamationCircleFilled,
  ArrowRightOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  FireOutlined,
  TrophyOutlined,
  StarFilled,
  ThunderboltOutlined,
  CheckCircleFilled,
  GiftOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import productService from '../services/productService';
import cartService from '../services/cartService';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { useToken } = theme;

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(var(--primary-rgb), 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0); }
`;

const shine = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled Components
const SectionContainer = styled(motion.section)`
  padding: 80px 0;
  background: ${props => props.theme === 'light' 
    ? `linear-gradient(to bottom, ${props.bgStart}, ${props.bgEnd})`
    : `linear-gradient(135deg, #141e30, #243b55)`};
  position: relative;
  overflow: hidden;
  --primary-rgb: ${props => props.primaryRgb || '24, 144, 255'};
  margin-bottom: 84px;
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
    opacity: 0.1;
    
    &.shape1 {
      top: 10%;
      right: 10%;
      width: 200px;
      height: 200px;
      border-radius: 65% 35% 55% 45% / 35% 65% 45% 55%;
      background: ${props => props.primaryColor};
      animation: ${float} 15s ease-in-out infinite;
    }
    
    &.shape2 {
      bottom: 15%;
      left: 8%;
      width: 180px;
      height: 180px;
      border-radius: 70% 30% 50% 50% / 40% 60% 30% 60%;
      background: ${props => props.errorColor};
      animation: ${float} 13s ease-in-out infinite reverse;
    }
    
    &.shape3 {
      top: 40%;
      left: 12%;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: ${props => props.warningColor};
      animation: ${pulse} 10s ease-in-out infinite;
    }
  }
  
  .dots {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(rgba(0, 0, 0, 0.07) 1px, transparent 1px);
    background-size: 40px 40px;
  }
`;

const Sparkles = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.color || 'white'};
  box-shadow: 0 0 10px ${props => props.color || 'white'}, 
              0 0 20px ${props => props.color || 'white'};
  opacity: 0;
  z-index: 2;
  animation: ${sparkle} 2s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  top: ${props => props.top || '0%'};
  left: ${props => props.left || '0%'};
`;

const SectionHeader = styled(motion.div)`
  position: relative;
  z-index: 2;
  margin-bottom: 48px;
`;

const HeaderTitle = styled(Title)`
  position: relative;
  display: inline-block;
  background: linear-gradient(45deg, ${props => props.gradientStart}, ${props => props.gradientEnd}, ${props => props.gradientStart});
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-fill-color: transparent;
  font-weight: 800;
  animation: ${shine} 4s linear infinite;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 4px;
    border-radius: 4px;
    background: linear-gradient(to right, ${props => props.gradientStart}, ${props => props.gradientEnd});
  }
`;

const CarouselWrapper = styled.div`
  position: relative;
  padding: 0 40px;
  
  .slick-track {
    display: flex !important;
    padding: 30px 0;
  }
  
  .slick-slide {
    height: inherit !important;
    
    & > div {
      height: 100%;
    }
  }
  
  .slick-dots {
    bottom: -30px;
    
    li button {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(var(--primary-rgb), 0.3);
      
      &:hover {
        background: rgba(var(--primary-rgb), 0.5);
      }
    }
    
    li.slick-active button {
      width: 24px;
      border-radius: 10px;
      background: rgba(var(--primary-rgb), 0.8);
    }
  }
  
  .nav-button {
    position: absolute;
    top: 50%;
    z-index: 10;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: ${props => props.primaryColor};
      color: white;
      transform: translateY(-50%) scale(1.1);
    }
    
    &.prev {
      left: 0;
    }
    
    &.next {
      right: 0;
    }
  }
`;

const ProductCard = styled(motion.div)`
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  position: relative;
  
  &:hover {
    transform: translateY(-16px) scale(1.02);
    box-shadow: 0 20px 40px rgba(var(--primary-rgb), 0.15);
    
    .product-image {
      transform: scale(1.1) rotate(2deg);
    }
    
    .quick-actions {
      opacity: 1;
      transform: translateY(0);
    }
    
    .action-button.primary {
      background: linear-gradient(45deg, ${props => props.primaryColor}, ${props => props.primaryLightColor});
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.3);
    }
    
    .action-button.secondary {
      border-color: ${props => props.primaryColor};
      color: ${props => props.primaryColor};
      transform: translateY(-3px);
    }
    
    .product-title {
      color: ${props => props.primaryColor};
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  padding: 20px;
  background: ${props => props.bgColor || 'linear-gradient(135deg, #f5f7fa 0%, #eef1f5 100%)'};
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 80%);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    right: -50%;
    bottom: -50%;
    background: radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%);
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  
  &:hover::after {
    opacity: 0.5;
    animation: ${rotate} 15s linear infinite;
  }
`;

const ProductImage = styled.img`
  max-height: 80%;
  max-width: 80%;
  object-fit: contain;
  position: relative;
  z-index: 2;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
`;

const QuickActions = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
  opacity: 0.8;
  transform: translateY(-10px);
  transition: all 0.3s ease;
`;

const ActionButton = styled(Button)`
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  
  &.favorite {
    background: white;
    &:hover {
      background: ${props => props.hoverBg || '#ffecec'};
      color: #ff4d4f;
      transform: scale(1.1);
    }
    
    &.active {
      background: #ff4d4f;
      color: white;
    }
  }
  
  &.view {
    background: ${props => props.primaryColor};
    color: white;
    
    &:hover {
      background: ${props => props.primaryDarkColor};
      transform: scale(1.1);
      box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.3);
    }
  }
`;

const ProductContent = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
`;

const ProductTitle = styled(Title)`
  margin-bottom: 8px;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
`;

const ProductDescription = styled(Paragraph)`
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceTag = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  .current-price {
    color: ${props => props.primaryColor};
    font-size: 24px;
    font-weight: 700;
  }
  
  .original-price {
    margin-left: 12px;
    font-size: 16px;
    text-decoration: line-through;
    color: rgba(0, 0, 0, 0.45);
  }
  
  .discount-badge {
    margin-left: auto;
    background: linear-gradient(45deg, #ff4d4f, #ff7a45);
    border-radius: 20px;
    padding: 4px 12px;
    color: white;
    font-weight: 600;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: 0 4px 12px rgba(255, 77, 79, 0.2);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
  
  .action-button {
    height: 44px;
    border-radius: 22px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    
    &.primary {
      flex: 1;
      background: ${props => props.primaryColor};
      border: none;
      color: white;
      box-shadow: 0 8px 15px rgba(var(--primary-rgb), 0.2);
      
      .anticon {
        margin-right: 8px;
      }
    }
    
     &.secondary {
      border: 2px solid rgba(var(--primary-rgb), 0.3);
      background: white; /* Thêm background trắng */
      color: rgba(0, 0, 0, 0.65);
      padding: 0 20px;
      
      .anticon {
        margin-right: 6px;
      }
    }
  }
`;

const SpecialBadge = styled(Badge.Ribbon)`
  .ant-ribbon {
    background: ${props => props.bgColor || 'linear-gradient(45deg, #ff4d4f, #ff7a45)'};
    border-top-right-radius: 20px !important;
    border-bottom-left-radius: 20px !important;
    padding: 0 16px;
    height: 32px;
    line-height: 32px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatusTag = styled(Tag)`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 5;
  border-radius: 8px;
  padding: 4px 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const StockStatus = styled(StatusTag)`
  background: ${props => props.type === 'low' ? '#faad14' : '#52c41a'};
  color: white;
`;

const FeatureBanner = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: white;
  text-align: center;
  padding: 20px;
  font-weight: 500;
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.4s ease;
  z-index: 3;
  pointer-events: none;

  ${ProductCard}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PromotionSection = styled(motion.div)`
  margin-top: 80px;
  padding: 40px 30px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(var(--primary-rgb), 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(var(--primary-rgb), 0.15), transparent 70%);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -80px;
    left: -80px;
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, rgba(var(--primary-rgb), 0.15), transparent 70%);
    border-radius: 50%;
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(var(--primary-rgb), 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: ${props => props.color};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    border: 2px dashed rgba(var(--primary-rgb), 0.3);
    animation: ${rotate} 20s linear infinite;
  }
`;

// Empty state and skeleton components
const SkeletonCard = styled(Card)`
  border-radius: 20px;
  overflow: hidden;
  height: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  
  .ant-card-body {
    padding: 24px;
  }
  
  .ant-skeleton-image {
    width: 100% !important;
    height: 240px !important;
    border-radius: 0 !important;
  }
`;

const EmptyStateWrapper = styled.div`
  padding: 60px 40px;
  background-color: ${props => props.bgColor};
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  
  .empty-icon {
    font-size: 64px;
    color: ${props => props.iconColor};
    margin-bottom: 24px;
    opacity: 0.6;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -30%;
    left: -30%;
    width: 60%;
    height: 60%;
    background: radial-gradient(circle, ${props => props.accentColor}10, transparent 70%);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    right: -30%;
    width: 60%;
    height: 60%;
    background: radial-gradient(circle, ${props => props.accentColor}10, transparent 70%);
    border-radius: 50%;
  }
`;

// Main component
const FeaturedProductsSection = () => {
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const { token } = useToken();
  // const { addToCart } = useContext(CartContext);
  const sectionRef = useRef(null);
  const carouselRef = useRef();
  
  // Convert HEX to RGB for variable use
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      '24, 144, 255';
  };
  
  const primaryRgb = hexToRgb(token.colorPrimary);
  
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
  
  useEffect(() => {
    // Intersection Observer to trigger animations when scrolled into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    // Lấy dữ liệu sản phẩm
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        
        // Lấy tất cả sản phẩm từ API
        const allProducts = await productService.getAllProducts();
        
        // Lọc những sản phẩm có stock > 0 để hiển thị
        const availableProducts = allProducts.filter(product => product.stock > 0);
        
        // Lấy tối đa 8 sản phẩm cho trang chủ (thay vì 4 sản phẩm)
        const featured = availableProducts.slice(0, 8);
        
        // Add some delay for better loading UX
        setTimeout(() => {
          setFeaturedProducts(featured);
          setError(null);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm nổi bật:', err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchFeaturedProducts();
    
    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);
  
  // Toggle favorite status
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(productId => productId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };
  
  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  // Calculate discount percentage
  const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return null;
    return Math.round(100 - (currentPrice / originalPrice * 100));
  };
  
  // Next/Prev slide
  const handlePrev = () => {
    if (carouselRef.current) {
      carouselRef.current.prev();
    }
  };
  
  const handleNext = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };
  
  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async (product) => {
    const success = await cartService.addToCart(product, 1);
    // Message will be handled in cartService
  };
  
  // Render skeleton loading cards
  const renderSkeletons = () => {
    return [1, 2, 3, 4].map(item => (
      <Col xs={24} sm={12} md={8} lg={6} key={item}>
        <SkeletonCard
          cover={
            <div style={{ padding: 24, backgroundColor: token.colorBgContainer }}>
              <Skeleton.Image active style={{ width: '100%', height: 240 }} />
            </div>
          }
        >
          <Skeleton active paragraph={{ rows: 3 }} />
          <div style={{ marginTop: 24 }}>
            <Skeleton.Button active style={{ width: '100%', height: 44, borderRadius: 22 }} />
          </div>
        </SkeletonCard>
      </Col>
    ));
  };

  // Hiển thị thông báo lỗi
  if (error && !loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', backgroundColor: token.colorBgContainer }}>
        <Alert
          message="Đã xảy ra lỗi"
          description={error}
          type="error"
          style={{ 
            maxWidth: 500, 
            margin: '0 auto',
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
          action={
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              shape="round"
              size="middle"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </Button>
          }
          showIcon
        />
      </div>
    );
  }
  
  return (
    <SectionContainer 
      ref={sectionRef}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
      bgStart="rgba(255, 255, 255, 0.95)"
      bgEnd="rgba(245, 250, 255, 0.9)"
      primaryRgb={primaryRgb}
    >
      {/* Background decorative elements */}
      <BackgroundShapes 
        primaryColor={token.colorPrimary}
        errorColor={token.colorError}
        warningColor={token.colorWarning}
      >
        <div className="dots"></div>
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </BackgroundShapes>
      
      {/* Sparkles animation */}
      <Sparkles color={token.colorPrimary} top="15%" left="20%" delay="0.5s" />
      <Sparkles color={token.colorPrimary} top="70%" left="80%" delay="1.2s" />
      <Sparkles color={token.colorWarning} top="25%" left="85%" delay="0.8s" />
      <Sparkles color={token.colorError} top="80%" left="15%" delay="1.5s" />
      
      <Content style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '0 24px',
        position: 'relative',
        zIndex: 1
      }}>
        <SectionHeader variants={itemVariants}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: 32,
              flexWrap: 'wrap' 
            }}
          >
            <div>
              <motion.div 
                style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}
                whileHover={{ scale: 1.02 }}
              >
                <Avatar 
                  icon={<TrophyOutlined />} 
                  style={{ 
                    backgroundColor: token.colorPrimary,
                    marginRight: 16,
                    boxShadow: `0 8px 16px ${token.colorPrimary}40`,
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24
                  }} 
                />
                <HeaderTitle 
                  level={2} 
                  gradientStart={token.colorPrimary}
                  gradientEnd={token.colorPrimaryActive || '#096dd9'}
                >
                  Sản Phẩm Nổi Bật
                </HeaderTitle>
              </motion.div>
              <Text 
                style={{ 
                  display: 'block', 
                  fontSize: 18, 
                  marginLeft: 66, 
                  color: 'rgba(0, 0, 0, 0.65)',
                  maxWidth: 500,
                  lineHeight: 1.6
                }}
              >
                Những sản phẩm chất lượng cao được yêu thích nhất dành cho thú cưng của bạn
              </Text>
            </div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="primary"
                icon={<ArrowRightOutlined />}
                size="large"
                shape="round"
                style={{ 
                  fontWeight: 600,
                  boxShadow: `0 10px 20px ${token.colorPrimary}30`,
                  padding: '0 28px',
                  height: 48,
                  fontSize: 16,
                  background: `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryActive || '#096dd9'})`,
                }}
              >
                <Link to="/products" style={{ color: 'inherit' }}>Tất cả sản phẩm</Link>
              </Button>
            </motion.div>
          </motion.div>
          
          <Divider 
            style={{ 
              margin: '32px 0 48px', 
              height: 4,
              background: `linear-gradient(to right, ${token.colorPrimary}, ${token.colorBgContainer})`,
              borderRadius: 4,
              border: 'none'
            }} 
          />
        </SectionHeader>
        
        {loading ? (
          <Row gutter={[32, 32]}>
            {renderSkeletons()}
          </Row>
        ) : featuredProducts.length > 0 ? (
          <AnimatePresence>
            <CarouselWrapper primaryColor={token.colorPrimary}>
              <div 
                className="nav-button prev" 
                onClick={handlePrev}
              >
                <LeftOutlined />
              </div>
              
              <div 
                className="nav-button next" 
                onClick={handleNext}
              >
                <RightOutlined />
              </div>
              
              <Carousel 
                ref={carouselRef}
                dots={true}
                slidesToShow={4}
                slidesToScroll={1}
                autoplay
                responsive={[
                  {
                    breakpoint: 1200,
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
                      slidesToShow: 1,
                    }
                  }
                ]}
              >
                {featuredProducts.map((product) => {
                  const discountPercent = calculateDiscount(product.originalPrice, product.price);
                  const isFavorite = favorites.includes(product.productId);
                  const hasLowStock = product.stock <= 5;
                  
                  return (
                    <div style={{ padding: '0 16px' }} key={product.productId}>
                      <ProductCard
                        whileHover={{ y: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        primaryColor={token.colorPrimary}
                        primaryLightColor={token.colorPrimaryActive || '#40a9ff'}
                      >
                        {discountPercent && (
                          <SpecialBadge
                            text={
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FireOutlined /> Giảm {discountPercent}%
                              </span>
                            }
                            bgColor={`linear-gradient(45deg, ${token.colorError}, ${token.colorErrorActive || '#ff7875'})`}
                          />
                        )}
                        
                        <ImageContainer bgColor={`linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorBgElevated} 100%)`}>
                          {hasLowStock ? (
                            <StockStatus type="low">
                              <ExclamationCircleFilled /> Sắp hết hàng
                            </StockStatus>
                          ) : product.isNew ? (
                            <StatusTag color="#52c41a">
                              <CheckCircleFilled /> Mới
                            </StatusTag>
                          ) : null}
                          
                          <ProductImage 
                            alt={product.name}
                            src={product.imageUrl || `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}`}
                            className="product-image"
                          />
                          
                          <QuickActions className="quick-actions">
                            <Tooltip title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}>
                              <ActionButton
                                type="default"
                                shape="circle"
                                icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                                className={`favorite ${isFavorite ? 'active' : ''}`}
                                onClick={() => toggleFavorite(product.productId)}
                                hoverBg="#ffecec"
                              />
                            </Tooltip>
                            <Tooltip title="Xem nhanh">
                              <ActionButton 
                                shape="circle"
                                icon={<EyeOutlined />}
                                className="view"
                                primaryColor={token.colorPrimary}
                                primaryDarkColor={token.colorPrimaryActive || '#096dd9'}
                              />
                            </Tooltip>
                          </QuickActions>
                          
                          <FeatureBanner>
                            Xem chi tiết để biết thêm về sản phẩm
                          </FeatureBanner>
                        </ImageContainer>
                        
                        <ProductContent>
                          {product.brand && (
                            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
                              <Text 
                                style={{ 
                                  fontSize: 13, 
                                  textTransform: 'uppercase', 
                                  letterSpacing: '0.5px',
                                  backgroundColor: `rgba(${primaryRgb}, 0.05)`,
                                  color: token.colorPrimary,
                                  padding: '4px 12px',
                                  borderRadius: 12,
                                  fontWeight: 600
                                }}
                              >
                                {product.brand}
                              </Text>
                              
                              <div style={{ 
                                marginLeft: 'auto', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 4
                              }}>
                                <StarFilled style={{ color: token.colorWarning, fontSize: 16 }} />
                                <Text strong style={{ fontSize: 14 }}>4.8</Text>
                              </div>
                            </div>
                          )}
                          
                          <Link to={`/products/${product.productId}`}>
                            <ProductTitle 
                              level={4} 
                              className="product-title"
                            >
                              {product.name}
                            </ProductTitle>
                          </Link>
                          
                          <ProductDescription ellipsis={{ rows: 2 }}>
                            {product.description}
                          </ProductDescription>
                          
                          <PriceTag primaryColor={token.colorPrimary}>
                            <span className="current-price">{formatPrice(product.price)}</span>
                            
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="original-price">{formatPrice(product.originalPrice)}</span>
                            )}
                            
                            {discountPercent && (
                              <span className="discount-badge">
                                <ThunderboltOutlined /> Giảm {discountPercent}%
                              </span>
                            )}
                          </PriceTag>
                          
                          <ActionButtons primaryColor={token.colorPrimary}>
                            <Link to={`/products/${product.productId}`}>
                              <Button 
                                icon={<InfoCircleOutlined />}
                                className="action-button secondary"
                              >
                              Mua ngay
                              </Button>
                            </Link>
                            <Button 
                              type="primary" 
                              icon={<ShoppingCartOutlined />}
                              className="action-button primary"
                              onClick={() => handleAddToCart(product)}
                            >
                              Mua ngay
                            </Button>
                          </ActionButtons>
                        </ProductContent>
                      </ProductCard>
                    </div>
                  );
                })}
              </Carousel>
            </CarouselWrapper>
            
            <PromotionSection 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{ zIndex: 2 }}
            >
              <IconWrapper color={token.colorPrimary}>
                <GiftOutlined />
              </IconWrapper>
              <Title level={3} style={{ marginBottom: 16 }}>
                Khám phá ưu đãi đặc biệt
              </Title>
              <Text style={{ fontSize: 16, display: 'block', marginBottom: 24, maxWidth: 700, margin: '0 auto 24px' }}>
                Đăng ký ngay để nhận thông báo về sản phẩm mới và các ưu đãi đặc biệt dành cho thú cưng của bạn
              </Text>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="primary"
                  size="large"
                  shape="round"
                  icon={<ArrowRightOutlined />}
                  style={{ 
                    height: 48, 
                    padding: '0 32px', 
                    fontWeight: 600,
                    fontSize: 16,
                    background: `linear-gradient(45deg, ${token.colorPrimary}, ${token.colorPrimaryActive || '#096dd9'})`,
                    boxShadow: `0 10px 20px rgba(${primaryRgb}, 0.2)`,
                  }}
                >
                  Xem tất cả khuyến mãi
                </Button>
              </motion.div>
            </PromotionSection>
          </AnimatePresence>
        ) : (
          <EmptyStateWrapper 
            bgColor={token.colorBgContainerDisabled} 
            iconColor={token.colorTextDisabled}
            accentColor={token.colorPrimary}
          >
            <ShoppingOutlined className="empty-icon" />
            <div style={{ fontSize: 16, color: token.colorTextSecondary, marginBottom: 24 }}>
              Không có sản phẩm nào. Vui lòng quay lại sau.
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                type="primary" 
                shape="round" 
                size="large"
                icon={<ReloadOutlined />}
                style={{
                  marginTop: 16,
                  fontWeight: 500,
                  height: 48,
                  padding: '0 32px',
                }}
              >
                Tải lại trang
              </Button>
            </motion.div>
          </EmptyStateWrapper>
        )}
      </Content>
      
      {/* Global style for animations */}
      <style jsx="true">{`
        @keyframes shine {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        
        .slick-slide {
          padding: 10px;
        }
        
        .slick-dots li button {
          width: 8px;
          height: 8px;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        
        .slick-dots li.slick-active button {
          width: 20px;
          background-color: ${token.colorPrimary};
        }
      `}</style>
    </SectionContainer>
  );
};

export default FeaturedProductsSection;