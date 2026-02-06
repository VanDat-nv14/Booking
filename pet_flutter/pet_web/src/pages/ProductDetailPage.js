import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import cartService from '../services/cartService';
import {
  Row,
  Col,
  Typography,
  Button,
  Card,
  Divider,
  Tabs,
  Rate,
  Breadcrumb,
  Spin,
  message,
  InputNumber,
  List,
  Tag,
  Space,
  Tooltip,
  Image,
  notification,
  Empty,
  Layout,
  Badge,
  theme
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  PlusOutlined,
  MinusOutlined,
  ShareAltOutlined,
  ArrowRightOutlined,
  HomeOutlined,
  ShoppingOutlined,
  TagOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RightOutlined,
  StarOutlined,
  LikeOutlined,
  SafetyOutlined,
  GiftOutlined
} from '@ant-design/icons';
import productService from '../services/productService';
import ReviewSection from '../components/review/ReviewSection';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Content } = Layout;
const { useToken } = theme;

// Styled Components
const StyledContent = styled(Content)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px 60px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  margin: 20px 0;
  font-size: 15px;
  
  .ant-breadcrumb-link {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  a {
    color: rgba(0, 0, 0, 0.65);
    transition: color 0.3s;
    
    &:hover {
      color: #1890ff;
    }
  }
`;

const ProductImageCard = styled(Card)`
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
  background: #fff;
  height: 100%;
  
  .ant-card-body {
    padding: 0;
  }
`;

const MainImageWrapper = styled.div`
  position: relative;
  margin-bottom: 12px;
  
  .ant-image {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    
    .ant-image-img {
      object-fit: contain;
      height: 400px;
      width: 100%;
      background: #f5f5f5;
      transition: transform 0.3s;
      
      &:hover {
        transform: scale(1.02);
      }
    }
  }
`;

const GalleryContainer = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px;
  margin: 0 10px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 4px;
  }
`;

const GalleryItem = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  border: 2px solid ${props => props.active ? '#1890ff' : 'transparent'};
  transition: all 0.3s;
  
  &:hover {
    border-color: #40a9ff;
    transform: translateY(-2px);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductInfoCard = styled(Card)`
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
  
  .ant-card-body {
    padding: 24px;
  }
`;

const ProductTitle = styled(Title)`
  margin-bottom: 16px !important;
  font-weight: 700 !important;
  color: #262626 !important;
  line-height: 1.3 !important;
  display: inline-block;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -8px;
    width: 40px;
    height: 3px;
    background: #1890ff;
    border-radius: 2px;
  }
`;

const MetaContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
`;

const RatingWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  
  .ant-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
`;

const PriceContainer = styled.div`
  background: linear-gradient(135deg, #f9f9f9, #f0f2f5);
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background: linear-gradient(to bottom, #1890ff, #52c41a);
    border-radius: 3px 0 0 3px;
  }
  
  .price-title {
    color: #ff4d4f !important;
    font-weight: 700 !important;
    font-size: 28px !important;
    margin: 0 !important;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 16px 0;
  
  .ant-tag {
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    
    &.stock-tag {
      background: ${props => props.inStock ? '#f6ffed' : '#fff1f0'};
      border-color: ${props => props.inStock ? '#b7eb8f' : '#ffa39e'};
      color: ${props => props.inStock ? '#52c41a' : '#ff4d4f'};
    }
  }
`;

const ProductDescription = styled(Paragraph)`
  font-size: 15px;
  line-height: 1.6;
  color: #595959;
  margin: 20px 0;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const AttributesContainer = styled(Row)`
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
`;

const AttributeItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .attribute-label {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }
  
  .attribute-value {
    font-size: 15px;
    font-weight: 600;
  }
`;

const QuantityContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
  
  .quantity-label {
    min-width: 80px;
    font-weight: 600;
  }
  
  .quantity-controls {
    display: flex;
    align-items: center;
    
    .ant-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      border-color: #d9d9d9;
      
      &:hover:not(:disabled) {
        color: #40a9ff;
        border-color: #40a9ff;
      }
    }
    
    .ant-input-number {
      width: 60px;
      margin: 0 8px;
      
      input {
        text-align: center;
      }
    }
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 32px;
  
  .ant-btn {
    height: 48px;
    font-size: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 24px;
    transition: all 0.3s;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.cart-button {
      background: #fff;
      color: #1890ff;
      border-color: #1890ff;
      flex: 1;
      
      &:hover:not(:disabled) {
        background: #e6f7ff;
      }
    }
    
    &.buy-button {
      background: linear-gradient(135deg, #1890ff, #096dd9);
      border: none;
      color: #fff;
      flex: 1;
      font-weight: 600;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #40a9ff, #1890ff);
      }
    }
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const TabsCard = styled(Card)`
  margin-top: 32px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
  
  .ant-tabs-nav {
    margin-bottom: 0;
    padding: 0 16px;
    
    &::before {
      border-bottom-color: #f0f0f0;
    }
  }
  
  .ant-tabs-tab {
    padding: 16px 20px;
    
    &.ant-tabs-tab-active .ant-tabs-tab-btn {
      color: #1890ff;
      font-weight: 600;
    }
  }
  
  .ant-tabs-content {
    padding: 24px;
  }
`;

const TabContent = styled.div`
  padding: 16px 0;
`;

const ListWrapper = styled(List)`
  .ant-list-item {
    padding: 12px 24px;
    display: flex;
    align-items: center;
    
    &:nth-child(odd) {
      background-color: #fafafa;
    }
  }
`;

const RelatedProductsSection = styled.div`
  margin-top: 48px;
  
  .section-header {
    text-align: center;
    margin-bottom: 32px;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -12px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(to right, #1890ff, #52c41a);
      border-radius: 3px;
    }
  }
`;

const RelatedProductCard = styled(Card)`
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  height: 100%;
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
  
  .ant-card-cover {
    overflow: hidden;
    
    img {
      transition: transform 0.5s;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }
  
  .ant-card-meta-title {
    font-size: 15px;
    margin-bottom: 8px;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  
  .ant-spin {
    margin-bottom: 24px;
  }
  
  .loading-text {
    color: rgba(0, 0, 0, 0.65);
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 48px 0;
  max-width: 500px;
  margin: 0 auto;
`;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useToken();
  
  // Sử dụng CartContext
  // const { addToCart } = useContext(CartContext);
  
  // State cho sản phẩm
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho tabs
  const [activeTab, setActiveTab] = useState('1');
  
  // State cho số lượng mua
  const [quantity, setQuantity] = useState(1);
  
  // State cho yêu thích
  const [isFavorite, setIsFavorite] = useState(false);
    // State cho ảnh hiện tại
  const [currentImage, setCurrentImage] = useState(0);
  
  // State cho danh sách ảnh sản phẩm
  const [productImages, setProductImages] = useState([]);
  
  // State cho sản phẩm liên quan
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Lấy thông tin sản phẩm
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const productData = await productService.getProductById(id);
        setProduct(productData);
        
        // Lấy danh sách ảnh sản phẩm
        try {
          const images = await productService.getProductImages(id);
          if (images && images.length > 0) {
            setProductImages(images);
          } else {
            // Nếu không có ảnh nào, dùng ảnh chính của sản phẩm
            setProductImages([{ 
              id: 'main', 
              imageUrl: productData.imageUrl || `https://via.placeholder.com/500x500?text=${encodeURIComponent(productData.name || 'Product')}`,
              isPrimary: true 
            }]);
          }
        } catch (imageError) {
          console.log('Error loading product images:', imageError);
          // Fallback to main product image
          setProductImages([{ 
            id: 'main', 
            imageUrl: productData.imageUrl || `https://via.placeholder.com/500x500?text=${encodeURIComponent(productData.name || 'Product')}`,
            isPrimary: true 
          }]);
        }
        setError(null);
      } catch (err) {
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
        console.error('Error fetching product data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProductData();
    }
  }, [id]);

  // Lấy sản phẩm liên quan
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Lấy tất cả sản phẩm
        const allProducts = await productService.getAllProducts();
        
        // Lọc bỏ sản phẩm hiện tại và những sản phẩm hết hàng
        const filteredProducts = allProducts.filter(p => 
          p.productId !== parseInt(id) && p.stock > 0
        );
        
        // Ưu tiên sản phẩm cùng danh mục
        const sameCategory = filteredProducts.filter(p => 
          p.category === product?.category
        );
        
        // Lấy random 4 sản phẩm
        let selectedProducts = [];
        
        if (sameCategory.length >= 4) {
          // Nếu có đủ sản phẩm cùng danh mục, chọn random 4 sản phẩm từ danh mục đó
          const shuffled = sameCategory.sort(() => 0.5 - Math.random());
          selectedProducts = shuffled.slice(0, 4);
        } else {
          // Nếu không đủ, lấy tất cả sản phẩm cùng danh mục và bổ sung từ danh mục khác
          selectedProducts = [...sameCategory];
          const otherProducts = filteredProducts.filter(p => 
            p.category !== product?.category
          );
          const shuffledOthers = otherProducts.sort(() => 0.5 - Math.random());
          const needed = 4 - selectedProducts.length;
          selectedProducts = [...selectedProducts, ...shuffledOthers.slice(0, needed)];
        }
        
        setRelatedProducts(selectedProducts);
      } catch (error) {
        console.error('Error fetching related products:', error);
        setRelatedProducts([]);
      }
    };

    // Chỉ fetch khi đã có thông tin sản phẩm chính
    if (product && id) {
      fetchRelatedProducts();
    }
  }, [id, product]);
  
  // Thêm event listener để cập nhật stock khi có order thành công
  useEffect(() => {
    const handleStockUpdate = () => {
      // Reload thông tin sản phẩm để cập nhật stock mới
      if (id) {
        productService.getProductById(id)
          .then(productData => {
            setProduct(prevProduct => ({
              ...prevProduct,
              stock: productData.stock
            }));
            console.log('Product stock updated after order:', productData.stock);
          })
          .catch(err => {
            console.error('Error updating product stock:', err);
          });
      }
    };

    // Listen for stock update events
    window.addEventListener('stockUpdated', handleStockUpdate);
    window.addEventListener('orderSuccess', handleStockUpdate);
    
    return () => {
      window.removeEventListener('stockUpdated', handleStockUpdate);
      window.removeEventListener('orderSuccess', handleStockUpdate);
    };
  }, [id]);
  
  // Xử lý tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  // Xử lý thay đổi số lượng
  const handleQuantityChange = (value) => {
    if (value > 0 && value <= (product?.stock || 1)) {
      setQuantity(value);
    }
  };
  
  // Xử lý yêu thích
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    notification.success({
      message: !isFavorite ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích',
      description: !isFavorite 
        ? 'Sản phẩm đã được thêm vào danh sách yêu thích của bạn.' 
        : 'Sản phẩm đã được xóa khỏi danh sách yêu thích của bạn.',
      placement: 'bottomRight',
      icon: !isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />,
    });
  };
  
  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    // Thêm sản phẩm vào giỏ hàng
    const success = await cartService.addToCart(product, quantity);
    // Message will be handled in cartService
  };
  
  // Xử lý mua ngay
  const handleBuyNow = async () => {
    // Thêm sản phẩm vào giỏ hàng và chuyển đến trang thanh toán
    const success = await cartService.addToCart(product, quantity);
    if (success) {
      navigate('/checkout');
    }
  };
    // Tạo gallery images từ danh sách ảnh thật
  const galleryImages = productImages.length > 0 
    ? productImages.map(img => img.imageUrl)
    : [product?.imageUrl || `https://via.placeholder.com/500x500?text=${encodeURIComponent(product?.name || 'Product')}`];
  
  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  // Hiển thị loading
  if (loading) {
    return (
      <StyledContent>
        <LoadingContainer>
          <Spin size="large" />
          <Title level={4} className="loading-text">
            Đang tải thông tin sản phẩm...
          </Title>
        </LoadingContainer>
      </StyledContent>
    );
  }
  
  // Hiển thị lỗi
  if (error || !product) {
    return (
      <StyledContent>
        <ErrorContainer>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ color: '#ff4d4f', fontSize: 16 }}>
                {error || "Không tìm thấy sản phẩm"}
              </span>
            }
          />
          <Button 
            type="primary" 
            onClick={() => navigate('/products')} 
            style={{ marginTop: 16 }}
          >
            Quay lại danh sách sản phẩm
          </Button>
        </ErrorContainer>
      </StyledContent>
    );
  }

  return (
    <StyledContent>
      {/* Breadcrumbs */}
      <StyledBreadcrumb separator={<RightOutlined style={{ fontSize: 10 }} />}>
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> Trang chủ
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/products">
            <ShoppingOutlined /> Sản phẩm
          </Link>
        </Breadcrumb.Item>
        {product.category && (
          <Breadcrumb.Item>
            <Link to={`/products?category=${product.category}`}>
              <TagOutlined /> {product.category}
            </Link>
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </StyledBreadcrumb>
      
      <Row gutter={[32, 32]}>
        {/* Ảnh sản phẩm */}
        <Col xs={24} lg={10}>
          <ProductImageCard>
            <MainImageWrapper>
              <Image
                src={galleryImages[currentImage]}
                alt={product.name}
                preview={{
                  src: galleryImages[currentImage],
                }}
              />
            </MainImageWrapper>
            
            <GalleryContainer>
              {galleryImages.map((image, index) => (
                <GalleryItem 
                  key={index}
                  active={currentImage === index}
                  onClick={() => setCurrentImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`Product view ${index + 1}`} 
                  />
                </GalleryItem>
              ))}
            </GalleryContainer>
          </ProductImageCard>
        </Col>
        
        {/* Thông tin sản phẩm */}
        <Col xs={24} lg={14}>
          <ProductInfoCard>
            <ProductTitle level={2}>{product.name}</ProductTitle>
            
            <MetaContainer>
              <RatingWrapper>
                <Rate allowHalf defaultValue={4.5} disabled style={{ fontSize: 16 }} />
                <Text type="secondary" style={{ marginLeft: 8 }}>(120 đánh giá)</Text>
              </RatingWrapper>
              
              <ActionButtons>
                <Tooltip title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}>
                  <Button 
                    shape="circle" 
                    icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} 
                    onClick={handleToggleFavorite}
                    size="large"
                  />
                </Tooltip>
                <Tooltip title="Chia sẻ sản phẩm">
                  <Button shape="circle" icon={<ShareAltOutlined />} size="large" />
                </Tooltip>
              </ActionButtons>
            </MetaContainer>
            
            <PriceContainer>
              <Title level={3} className="price-title">
                {formatPrice(product.price)}
              </Title>
            </PriceContainer>
            
            <TagsContainer inStock={product.stock > 0}>
              <Tag 
                className="stock-tag"
                icon={product.stock > 0 ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              >
                {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
              </Tag>
              
              {product.category && (
                <Tag color="blue" icon={<TagOutlined />}>
                  <Link to={`/products?category=${product.category}`}>
                    {product.category}
                  </Link>
                </Tag>
              )}
              
              {product.isNew && (
                <Tag color="green" icon={<GiftOutlined />}>
                  Sản phẩm mới
                </Tag>
              )}
            </TagsContainer>
            
            <ProductDescription>
              {product.description}
            </ProductDescription>
            
            <Divider style={{ margin: '24px 0' }} />
            
            {/* Thương hiệu và thông tin khác */}
            <AttributesContainer gutter={24}>
              {product.brand && (
                <Col span={12}>
                  <AttributeItem>
                    <Text className="attribute-label">Thương hiệu</Text>
                    <Text className="attribute-value">{product.brand}</Text>
                  </AttributeItem>
                </Col>
              )}
              
              <Col span={12}>
                <AttributeItem>
                  <Text className="attribute-label">Mã sản phẩm</Text>
                  <Text className="attribute-value">#{product.productId || id}</Text>
                </AttributeItem>
              </Col>
            </AttributesContainer>
            
            {/* Chọn số lượng */}
            <QuantityContainer>
              <Text strong className="quantity-label">Số lượng:</Text>
              <div className="quantity-controls">
                <Button 
                  icon={<MinusOutlined />} 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                />
                <InputNumber 
                  min={1} 
                  max={product.stock} 
                  value={quantity} 
                  onChange={handleQuantityChange}
                  controls={false}
                />
                <Button 
                  icon={<PlusOutlined />} 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                />
              </div>
            </QuantityContainer>
            
            {/* Nút thêm giỏ hàng và mua ngay */}
            <ButtonsContainer>
              <Button 
                className="cart-button"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                size="large"
              >
                Thêm vào giỏ hàng
              </Button>
              <Button 
                className="buy-button"
                type="primary" 
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                size="large"
              >
                Mua ngay
              </Button>
            </ButtonsContainer>
          </ProductInfoCard>
        </Col>
      </Row>
      
      {/* Tabs thông tin chi tiết */}
      <TabsCard>
        <Tabs defaultActiveKey="1" onChange={handleTabChange}>
          <TabPane 
            tab={
              <span>
                <InfoCircleOutlined /> Mô tả chi tiết
              </span>
            } 
            key="1"
          >
            <TabContent>
              <Paragraph style={{ fontSize: '15px', lineHeight: 1.8 }}>
                {product.description}
              </Paragraph>
            </TabContent>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SafetyOutlined /> Thông số kỹ thuật
              </span>
            } 
            key="2"
          >
            <TabContent>
              <Row gutter={[32, 32]}>
                <Col xs={24} md={12}>
                  <Title level={5} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <InfoCircleOutlined /> Thông tin chung
                  </Title>
                  <ListWrapper
                    bordered
                    dataSource={[
                      { label: 'Thương hiệu', value: product.brand || 'Không có thông tin' },
                      { label: 'Danh mục', value: product.category },
                      { label: 'Xuất xứ', value: 'Việt Nam' },
                      { label: 'Trọng lượng', value: '500g' },
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <Text type="secondary" style={{ width: 150, fontWeight: 500 }}>{item.label}:</Text>
                        <Text strong>{item.value}</Text>
                      </List.Item>
                    )}
                  />
                </Col>
                
                <Col xs={24} md={12}>
                  <Title level={5} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SafetyOutlined /> Thông số kỹ thuật
                  </Title>
                  <ListWrapper
                    bordered
                    dataSource={[
                      { label: 'Chất liệu', value: 'Nhựa cao cấp' },
                      { label: 'Kích thước', value: '20 x 15 x 5 cm' },
                      { label: 'Màu sắc', value: 'Xanh, Đỏ, Vàng' },
                      { label: 'Đối tượng', value: 'Chó, Mèo' },
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <Text type="secondary" style={{ width: 150, fontWeight: 500 }}>{item.label}:</Text>
                        <Text strong>{item.value}</Text>
                      </List.Item>
                    )}
                  />
                </Col>
              </Row>
            </TabContent>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <StarOutlined /> Đánh giá
              </span>
            } 
            key="3"
          >
            <TabContent>
              <ReviewSection productId={product?.productId || id} />
            </TabContent>
          </TabPane>
        </Tabs>
      </TabsCard>
      
      {/* Sản phẩm liên quan */}
      <RelatedProductsSection>
        <div className="section-header">
          <Title level={3} style={{ textAlign: 'center', margin: 0, fontWeight: 600 }}>
            Sản phẩm liên quan
          </Title>
          <Paragraph type="secondary" style={{ textAlign: 'center', marginTop: 8 }}>
            Khám phá thêm các sản phẩm tương tự
          </Paragraph>
        </div>
        
        <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
          {relatedProducts.length > 0 ? (
            relatedProducts.map((relatedProduct) => (
              <Col xs={12} sm={8} md={6} key={relatedProduct.productId}>
                <Link to={`/products/${relatedProduct.productId}`}>
                  <RelatedProductCard
                    hoverable
                    cover={
                      <img
                        alt={relatedProduct.name}
                        src={relatedProduct.imageUrl || `https://via.placeholder.com/300x300?text=${encodeURIComponent(relatedProduct.name)}`}
                        style={{ height: 180, objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/300x300?text=${encodeURIComponent(relatedProduct.name)}`;
                        }}
                      />
                    }
                    bodyStyle={{ padding: '12px 16px' }}
                  >
                    <Card.Meta
                      title={
                        <Text ellipsis={{ tooltip: relatedProduct.name }} style={{ fontSize: 14 }}>
                          {relatedProduct.name}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <div>
                            <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
                              {relatedProduct.category}
                            </Tag>
                          </div>
                          <Rate allowHalf defaultValue={4} disabled style={{ fontSize: 12 }} />
                          <Text type="danger" strong style={{ fontSize: 16 }}>
                            {formatPrice(relatedProduct.price)}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Còn lại: {relatedProduct.stock}
                          </Text>
                        </Space>
                      }
                    />
                  </RelatedProductCard>
                </Link>
              </Col>
            ))
          ) : (
            // Hiển thị skeleton khi đang tải
            [1, 2, 3, 4].map((item) => (
              <Col xs={12} sm={8} md={6} key={item}>
                <RelatedProductCard>
                  <Card loading={true} />
                </RelatedProductCard>
              </Col>
            ))
          )}
        </Row>
      </RelatedProductsSection>
    </StyledContent>
  );
};

export default ProductDetailPage;