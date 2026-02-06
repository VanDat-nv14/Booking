import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Tag,
  Tooltip,
  Skeleton,
  Space,
  Rate,
  Badge
} from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  ShoppingCartOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  CarOutlined,
  EyeOutlined,
  StarFilled,
  FireOutlined,
  TrophyOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const { Text, Paragraph } = Typography;

// Format giá tiền
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const shine = keyframes`
  0% { background-position: -100px; }
  60% { background-position: 200px; }
  100% { background-position: 200px; }
`;

// Styled Components with enhanced animations
const StyledCard = styled(motion.div)`
  height: 100%;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  background: #fff;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
    z-index: 1;
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100px;
    width: 50px;
    height: 100%;
    background: rgba(255,255,255,0.2);
    transform: skewX(-20deg);
    transition: 0.7s;
    filter: blur(5px);
  }
  
  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
    
    &::after {
      animation: ${shine} 1.2s ease-in-out;
    }
  }
`;

const CardContent = styled.div`
  padding: 18px;
  display: flex;
  flex-direction: column;
  height: calc(100% - 240px);
`;

const ImageWrapper = styled.div`
  position: relative;
  height: 240px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(to bottom, 
      rgba(0, 0, 0, 0) 70%, 
      rgba(0, 0, 0, 0.3) 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 1;
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s cubic-bezier(0.33, 1, 0.68, 1);
  }
  
  &:hover img {
    transform: scale(1.08);
  }
  
  &:hover .action-buttons {
    opacity: 1;
    transform: translateY(0);
  }
  
  &:hover .gradient-overlay {
    opacity: 1;
  }
`;

const SkeletonWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .ant-skeleton-image {
    width: 100% !important;
    height: 100% !important;
  }
`;

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const GradientOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0) 50%, 
    rgba(0, 0, 0, 0.4) 100%);
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 1;
`;

const ActionButtons = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 5;
`;

const ActionButton = styled(Button)`
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  color: #555;
  border: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    color: #1890ff;
    background: white;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
  }
  
  &.buy-now-action {
    &:hover {
      color: #ff4d4f;
    }
  }
  
  &:disabled {
    background: rgba(245, 245, 245, 0.8);
    color: #d9d9d9;
    &:hover {
      transform: none;
    }
  }
  
  .anticon {
    font-size: 18px;
  }
`;

const FavoriteButton = styled(Button)`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &.favorited {
    background: #ff4d4f;
    border-color: #ff4d4f;
    color: white;
    animation: ${pulse} 1s ease infinite;
  }
  
  &:hover {
    transform: scale(1.1);
  }
  
  .anticon {
    font-size: 18px;
  }
`;

const StockTag = styled(Tag)`
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
  font-weight: 600;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 20px;
  border: none;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  animation: ${float} 3s ease-in-out infinite;
`;

const DiscountTag = styled(Tag)`
  position: absolute;
  left: 12px;
  top: ${props => props.hasStockTag ? '48px' : '12px'};
  z-index: 5;
  font-weight: 700;
  font-size: 13px;
  padding: 2px 10px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  box-shadow: 0 3px 8px rgba(255, 77, 79, 0.25);
  
  animation: ${pulse} 2s ease-in-out infinite;
`;

const ShippingTag = styled(Tag)`
  position: absolute;
  left: 12px;
  top: ${props => {
    if (props.hasStockTag && props.hasDiscountTag) return '84px';
    if (props.hasStockTag || props.hasDiscountTag) return '48px';
    return '12px';
  }};
  z-index: 5;
  font-weight: 500;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: linear-gradient(135deg, #52c41a, #85ce61);
  color: white;
  box-shadow: 0 3px 6px rgba(82, 196, 26, 0.2);
  animation: ${float} 4s ease-in-out infinite;
`;

const HotTag = styled(Tag)`
  position: absolute;
  right: 12px;
  top: 60px;
  z-index: 5;
  font-weight: 600;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: linear-gradient(135deg, #fa8c16, #ffd591);
  color: white;
  box-shadow: 0 3px 6px rgba(250, 140, 22, 0.2);
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const NewTag = styled(Tag)`
  position: absolute;
  right: 12px;
  top: 60px;
  z-index: 5;
  font-weight: 600;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: linear-gradient(135deg, #1890ff, #69c0ff);
  color: white;
  box-shadow: 0 3px 6px rgba(24, 144, 255, 0.2);
  animation: ${pulse} 2s ease-in-out infinite;
`;

const BestSellerTag = styled(Tag)`
  position: absolute;
  right: 12px;
  top: 100px;
  z-index: 5;
  font-weight: 600;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: linear-gradient(135deg, #722ed1, #b37feb);
  color: white;
  box-shadow: 0 3px 6px rgba(114, 46, 209, 0.2);
  animation: ${float} 3s ease-in-out infinite;
`;

const PriceTag = styled.div`
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  z-index: 4;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }
`;

const CurrentPrice = styled(Text)`
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(90deg, #ff4d4f, #ff7875);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const OriginalPrice = styled(Text)`
  font-size: 13px;
  color: #999;
  text-decoration: line-through;
  margin: 0;
`;

const BrandText = styled(Text)`
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background-color: #1890ff;
    border-radius: 50%;
  }
`;

const ProductNameLink = styled(Link)`
  display: block;
  margin-bottom: 10px;

  &:hover {
    text-decoration: none;
  }
  
  .ant-typography {
    font-size: 17px;
    font-weight: 600;
    color: #262626;
    transition: color 0.3s;
    margin: 0;
    line-height: 1.4;
    
    &:hover {
      color: #1890ff;
      background: linear-gradient(to right, #1890ff, #69c0ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
`;

const RatingWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 6px;
  
  .ant-rate {
    font-size: 14px;
    color: #fadb14;
    margin-right: 4px;
    
    .ant-rate-star {
      margin-right: 2px;
    }
  }
  
  .review-count {
    font-size: 13px;
    color: #999;
  }
`;

const ProductDescription = styled(Paragraph)`
  font-size: 14px;
  color: #595959;
  margin-bottom: 14px;
  flex-grow: 1;
  line-height: 1.6;
`;

const ButtonsWrapper = styled(Space)`
  margin-top: auto;
  width: 100%;
  
  .ant-btn {
    border-radius: 8px;
    height: 40px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    
    &.details-btn {
      border-color: #d9d9d9;
      color: #595959;
      
      &:hover {
        border-color: #1890ff;
        color: #1890ff;
        transform: translateY(-3px);
        box-shadow: 0 4px 10px rgba(24, 144, 255, 0.15);
      }
    }
    
    &.buy-now-btn {
      background: linear-gradient(135deg, #ff4d4f, #ff7875);
      border: none;
      box-shadow: 0 4px 8px rgba(255, 77, 79, 0.2);
      position: relative;
      overflow: hidden;
      
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
      
      &:hover {
        background: linear-gradient(135deg, #ff7875, #ff4d4f);
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(255, 77, 79, 0.3);
        
        &::after {
          animation: ${shimmer} 1.5s infinite;
        }
      }
      
      &:disabled {
        background: #f5f5f5;
        color: rgba(0, 0, 0, 0.25);
        box-shadow: none;
        border: 1px solid #d9d9d9;
        
        &:hover {
          transform: none;
        }
      }
    }
  }
`;

const SaleCountBadge = styled(Badge)`
  position: absolute;
  display: inline-block;
  bottom: 15px;
  left: 15px;
  z-index: 4;
  
  .ant-badge-count {
    background: linear-gradient(135deg, #1890ff, #69c0ff);
    box-shadow: 0 3px 6px rgba(24, 144, 255, 0.2);
    border-radius: 10px;
    padding: 0 8px;
    height: auto;
    line-height: 20px;
    font-size: 12px;
    font-weight: 600;
  }
`;

// Product Card Component with enhanced animations
const ProductCardComponent = ({ 
  product, 
  onBuyNow, 
  onAddToCart, 
  onAddToWishlist,
  viewMode
}) => {
  const [favorited, setFavorited] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate random property for demo purposes
  const [isHot, setIsHot] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [salesCount, setSalesCount] = useState(0);
  
  useEffect(() => {
    // For demo purposes, randomly assign "Hot", "New", or "Best Seller" tags
    // In a real app, these would come from the product data
    if (product.stock > 0) {
      // Random tag generation
      const random = Math.random();
      if (random < 0.3) setIsHot(true);
      else if (random < 0.6) setIsNew(true);
      else if (random < 0.8) setIsBestSeller(true);
      
      // Random sales count for popular products
      if (product.rating && product.rating >= 4) {
        setSalesCount(Math.floor(Math.random() * 500) + 100);
      }
    }
  }, [product]);
  
  // Xử lý thêm vào yêu thích
  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorited(!favorited);
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };
  
  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };
  
  // Xử lý sự kiện mua ngay
  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow(product);
    }
  };
  
  // Tính giá khuyến mãi nếu có
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(100 - (product.price / product.originalPrice * 100)) 
    : 0;

  // Hiển thị trạng thái tồn kho
  const getStockStatus = () => {
    if (product.stock <= 0) {
      return { color: 'error', text: 'Hết hàng', icon: <CloseCircleOutlined /> };
    }
    if (product.stock <= 5) {
      return { color: 'warning', text: 'Sắp hết hàng', icon: <ClockCircleOutlined /> };
    }
    return { color: 'success', text: 'Còn hàng', icon: <CheckCircleOutlined /> };
  };
  
  const stockStatus = getStockStatus();
  
  // Cover sẽ bao gồm ảnh và các badges/buttons
  const cardCover = (
    <ImageWrapper 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hiển thị skeleton khi ảnh đang tải */}
      {!imageLoaded && (
        <SkeletonWrapper>
          <Skeleton.Image active />
        </SkeletonWrapper>
      )}
      
      {/* Ảnh sản phẩm */}
      <ProductImage
        src={product.imageUrl || `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}`}
        alt={product.name}
        onLoad={() => setImageLoaded(true)}
        style={{ visibility: imageLoaded ? 'visible' : 'hidden' }}
      />
      
      {/* Hiệu ứng gradient khi hover */}
      <GradientOverlay className="gradient-overlay" />
      
      {/* Các nút tương tác khi hover */}
      <ActionButtons className="action-buttons">
        <Tooltip title="Xem chi tiết">
          <Link to={`/products/${product.productId}`}>
            <ActionButton
              icon={<EyeOutlined />}
              shape="circle"
              size="large"
            />
          </Link>
        </Tooltip>
        
        <Tooltip title="Thêm vào giỏ hàng">
          <ActionButton
            icon={<ShoppingCartOutlined />}
            shape="circle"
            size="large"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          />
        </Tooltip>
        
        <Tooltip title="Mua ngay">
          <ActionButton
            className="buy-now-action"
            icon={<ThunderboltOutlined />}
            shape="circle"
            size="large"
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
          />
        </Tooltip>
      </ActionButtons>
      
      {/* Badge yêu thích */}
      <FavoriteButton
        type={favorited ? "primary" : "default"}
        shape="circle"
        icon={favorited ? <HeartFilled /> : <HeartOutlined />}
        onClick={handleToggleFavorite}
        className={favorited ? "favorited" : ""}
      />
      
      {/* Trạng thái hàng */}
      <StockTag color={stockStatus.color}>
        {stockStatus.icon} {stockStatus.text}
      </StockTag>
      
      {/* Badge khuyến mại */}
      {hasDiscount && (
        <DiscountTag color="red" hasStockTag={true}>
          <FireOutlined /> -{discountPercent}%
        </DiscountTag>
      )}
      
      {/* Badge miễn phí vận chuyển */}
      {product.freeShipping && (
        <ShippingTag
          icon={<RocketOutlined />}
          color="green"
          hasStockTag={true}
          hasDiscountTag={hasDiscount}
        >
          Miễn phí vận chuyển
        </ShippingTag>
      )}
      
      {/* Hot tag */}
      {isHot && (
        <HotTag>
          <FireOutlined /> Hot
        </HotTag>
      )}
      
      {/* New tag */}
      {isNew && (
        <NewTag>
          <RocketOutlined /> Mới
        </NewTag>
      )}
      
      {/* Best seller tag */}
      {isBestSeller && (
        <BestSellerTag>
          <TrophyOutlined /> Bán chạy
        </BestSellerTag>
      )}
      
      {/* Sales count badge */}
      {salesCount > 0 && (
        <SaleCountBadge count={`Đã bán ${salesCount}`} />
      )}
      
      {/* Tag giá */}
      <PriceTag>
        <CurrentPrice>
          {formatPrice(product.price)}
        </CurrentPrice>
        {hasDiscount && (
          <OriginalPrice>
            {formatPrice(product.originalPrice)}
          </OriginalPrice>
        )}
      </PriceTag>
    </ImageWrapper>
  );

  // Card variants for motion animation
  const cardVariants = {
    hover: {
      y: -10,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  // List view styling if viewMode is list
  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover="hover"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%' }}
      >
        <Card
          hoverable
          style={{ 
            display: 'flex', 
            flexDirection: 'row',
            height: 'auto',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
          }}
          bodyStyle={{ 
            padding: '20px', 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column'
          }}
          bordered={false}
        >
          <div style={{ 
            width: '280px', 
            position: 'relative', 
            overflow: 'hidden',
            borderRadius: '8px',
            marginRight: '20px'
          }}>
            {cardCover}
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Brand name */}
            {product.brand && (
              <BrandText type="secondary">
                {product.brand}
              </BrandText>
            )}
            
            {/* Product name */}
            <Tooltip title={product.name}>
              <ProductNameLink to={`/products/${product.productId}`}>
                <Text
                  ellipsis={{ rows: 2 }}
                >
                  {product.name}
                </Text>
              </ProductNameLink>
            </Tooltip>
            
            {/* Đánh giá sao */}
            {product.rating && (
              <RatingWrapper>
                <Rate 
                  disabled 
                  defaultValue={product.rating} 
                  allowHalf 
                  character={<StarFilled />} 
                />
                <Text type="secondary" className="review-count">
                  ({product.reviewCount || 0})
                </Text>
              </RatingWrapper>
            )}
            
            {/* Mô tả ngắn */}
            <ProductDescription
              ellipsis={{ rows: 3 }}
            >
              {product.description}
            </ProductDescription>
            
            {/* Các nút hành động */}
            <ButtonsWrapper size={12} wrap style={{ marginTop: 'auto' }}>
              <Button
                className="details-btn"
                icon={<InfoCircleOutlined />}
                href={`/products/${product.productId}`}
                style={{ flex: 1 }}
              >
                Chi tiết
              </Button>
              
              <Button
                type="primary"
                className="buy-now-btn"
                icon={<ThunderboltOutlined />}
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                style={{ flex: 1 }}
              >
                Mua ngay
              </Button>
              
              <Button
                type="primary"
                style={{ 
                  background: '#1890ff', 
                  borderColor: '#1890ff',
                  flex: 1
                }}
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                Thêm vào giỏ
              </Button>
            </ButtonsWrapper>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Default grid view
  return (
    <motion.div
      whileHover="hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ height: '100%' }}
    >
      <StyledCard
        variants={cardVariants}
      >
        {cardCover}
        
        <CardContent>
          {/* Brand name */}
          {product.brand && (
            <BrandText type="secondary">
              {product.brand}
            </BrandText>
          )}
          
          {/* Product name */}
          <Tooltip title={product.name}>
            <ProductNameLink to={`/products/${product.productId}`}>
              <Text
                ellipsis={{ rows: 2 }}
              >
                {product.name}
              </Text>
            </ProductNameLink>
          </Tooltip>
          
          {/* Đánh giá sao */}
          {product.rating && (
            <RatingWrapper>
              <Rate 
                disabled 
                defaultValue={product.rating} 
                allowHalf 
                character={<StarFilled />} 
              />
              <Text type="secondary" className="review-count">
                ({product.reviewCount || 0})
              </Text>
            </RatingWrapper>
          )}
          
          {/* Mô tả ngắn */}
          <ProductDescription
            ellipsis={{ rows: 2 }}
          >
            {product.description}
          </ProductDescription>
          
          {/* Các nút hành động */}
          <ButtonsWrapper size={8} wrap>
            <Button
              className="details-btn"
              icon={<InfoCircleOutlined />}
              block
              href={`/products/${product.productId}`}
            >
              Chi tiết
            </Button>
            
            <Button
              type="primary"
              className="buy-now-btn"
              icon={<ThunderboltOutlined />}
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              block
            >
              Mua ngay
            </Button>
          </ButtonsWrapper>
        </CardContent>
      </StyledCard>
    </motion.div>
  );
};

export default ProductCardComponent;