import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cartService from '../services/cartService';
import { getProductImageUrl } from '../utils/imageUtils';
import {
  Layout,
  Typography,
  Button,
  Card,
  Row,
  Col,
  Modal,
  Spin,
  message,
  Divider,
  InputNumber,
  Space,
  Breadcrumb,
  Avatar,
  Tag,
  ConfigProvider,
  theme,
  Checkbox
} from 'antd';
import {
  DeleteOutlined,
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  ExclamationCircleOutlined,
  CreditCardOutlined,
  HomeOutlined,
  PlusOutlined,
  MinusOutlined,
  UserOutlined,
  CheckCircleOutlined,
  RightOutlined,
  ShopOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { Content } = Layout;
const { useToken } = theme;

// Paw Icon Component
const PawIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21A2 2 0 0 0 5 23H19A2 2 0 0 0 21 21V9M19 19H5V3H13V9H19Z"/>
  </svg>
);

// Styled Components - Đơn màu xanh dương
const StyledContent = styled(Content)`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  background: #f5f8ff;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  .page-title {
    color: #1890ff;
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  
  .breadcrumb-text {
    color: #666;
    font-size: 14px;
    
    a {
      color: #1890ff;
      text-decoration: none;
      
      &:hover {
        color: #0050b3;
      }
    }
    
    .separator {
      margin: 0 8px;
      color: #999;
    }
  }
`;

const ModernStepsContainer = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(24, 144, 255, 0.1);
  border: 1px solid #e6f7ff;
  
  .steps-header {
    text-align: center;
    margin-bottom: 32px;
    
    h3 {
      color: #1890ff;
      margin-bottom: 8px;
    }
  }
  
  .custom-steps {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 60px;
      right: 60px;
      height: 2px;
      background: linear-gradient(to right, #1890ff 25%, #e5e5e5 25%);
      z-index: 1;
      transform: translateY(-50%);
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 24px;
      
      &::before {
        display: none;
      }
    }
  }
  
  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    z-index: 2;
    flex: 1;
    max-width: 200px;
    
    @media (max-width: 768px) {
      flex-direction: row;
      text-align: left;
      max-width: 100%;
      justify-content: flex-start;
    }
  }
  
  .step-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 12px;
    font-weight: bold;
    
    &.completed {
      background: #52c41a;
      color: white;
    }
    
    &.active {
      background: #1890ff;
      color: white;
      box-shadow: 0 0 20px rgba(24, 144, 255, 0.3);
    }
    
    &.pending {
      background: #f0f0f0;
      color: #999;
    }
    
    @media (max-width: 768px) {
      margin-bottom: 0;
      margin-right: 16px;
    }
  }
  
  .step-title {
    font-weight: 600;
    color: #1890ff;
    margin-bottom: 4px;
  }
  
  .step-description {
    font-size: 12px;
    color: #666;
  }
`;

const MainContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(24, 144, 255, 0.1);
  border: 1px solid #e6f7ff;
  overflow: hidden;
`;

const EmptyCartContainer = styled.div`
  text-align: center;
  padding: 80px 24px;
  
  .empty-icon {
    font-size: 80px;
    color: #1890ff;
    margin-bottom: 24px;
  }
  
  .empty-title {
    font-size: 24px;
    font-weight: 600;
    color: #1890ff;
    margin-bottom: 12px;
  }
  
  .empty-description {
    color: #666;
    margin-bottom: 32px;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const CartItemCard = styled(Card)`
  margin-bottom: 16px;
  border: 1px solid #e6f7ff;
  border-radius: 12px;
  
  .ant-card-body {
    padding: 24px;
  }
  
  &:hover {
    box-shadow: 0 4px 20px rgba(24, 144, 255, 0.15);
    border-color: #1890ff;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  
  .product-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e6f7ff;
  }
  
  .product-details {
    flex: 1;
    
    .product-name {
      font-size: 16px;
      font-weight: 600;
      color: #1890ff;
      margin-bottom: 4px;
    }
    
    .product-price {
      font-size: 18px;
      font-weight: 700;
      color: #1890ff;
    }
    
    .product-option {
      margin-top: 4px;
    }
  }
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  .quantity-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid #1890ff;
    background: white;
    color: #1890ff;
    
    &:hover {
      background: #1890ff;
      color: white;
    }
  }
  
  .quantity-input {
    width: 60px;
    text-align: center;
    border: 1px solid #1890ff;
    border-radius: 6px;
  }
`;

const CartSummary = styled.div`
  background: #f8faff;
  padding: 24px;
  border-top: 1px solid #e6f7ff;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    &.total-row {
      border-top: 1px solid #e6f7ff;
      padding-top: 12px;
      margin-top: 16px;
      
      .total-label {
        font-size: 18px;
        font-weight: 600;
        color: #1890ff;
      }
      
      .total-amount {
        font-size: 20px;
        font-weight: 700;
        color: #1890ff;
      }
    }
  }
  
  .checkout-button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    background: #1890ff;
    border: none;
    border-radius: 8px;
    margin-top: 16px;
    
    &:hover {
      background: #0050b3;
    }
  }
`;

const CartPage = () => {
  const [cart, setCart] = useState({ cartItems: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]); // Track selected cart items
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  // Tải giỏ hàng khi component mount
  useEffect(() => {
    loadCart();
    
    // Lắng nghe sự kiện cập nhật giỏ hàng
    const handleCartUpdate = () => {
      loadCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Function hiển thị toast tương tự ServiceManagement
  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      setCart(cartData);
      
      // Auto select all items when cart loads
      if (cartData.cartItems && cartData.cartItems.length > 0) {
        const allItemIds = cartData.cartItems.map(item => item.cartItemId);
        setSelectedItems(allItemIds);
      }
      
      // Debug: Log cart data để kiểm tra cấu trúc
      console.log('Cart data loaded:', cartData);
      if (cartData.cartItems && cartData.cartItems.length > 0) {
        console.log('First cart item structure:', cartData.cartItems[0]);
        console.log('Product in first item:', cartData.cartItems[0].product);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      message.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }
    
    try {
      const success = await cartService.updateCartItem(cartItemId, newQuantity);
      if (success) {
        await loadCart(); // Tải lại giỏ hàng để đồng bộ
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = (cartItemId, productName) => {
    // Set confirm delete state tương tự ServiceManagement
    setConfirmDelete({ cartItemId, productName });
  };

  // Function xác nhận xóa item tương tự ServiceManagement
  const confirmRemoveItem = async () => {
    if (!confirmDelete) return;
    
    const { cartItemId, productName } = confirmDelete;
    
    try {
      // Hiển thị loading
      message.loading({ content: 'Đang xóa sản phẩm...', key: 'removeItem', duration: 0 });
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://localhost:7164/api/Cart/items/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Lỗi xóa sản phẩm (HTTP ${response.status})`);
      }
      
      // Thành công - Hiển thị toast tương tự ServiceManagement
      showToast('Đã xóa sản phẩm khỏi giỏ hàng thành công', 'success');
      
      // Cập nhật selectedItems khi xóa item
      setSelectedItems(prev => prev.filter(id => id !== cartItemId));
      
      // Tải lại giỏ hàng
      await loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
      showToast(`Lỗi: ${error.message || 'Không thể xóa sản phẩm'}`, 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleClearCart = () => {
    // Set confirm clear cart tương tự ServiceManagement
    setConfirmDelete({ isClearAll: true, productName: 'toàn bộ giỏ hàng' });
  };

  // Function xác nhận xóa toàn bộ giỏ hàng
  const confirmClearCart = async () => {
    try {
      // Hiển thị loading
      message.loading({ content: 'Đang xóa toàn bộ giỏ hàng...', key: 'clearCart', duration: 0 });
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://localhost:7164/api/Cart/clear`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Lỗi xóa giỏ hàng (HTTP ${response.status})`);
      }
      
      // Thành công - Hiển thị toast tương tự ServiceManagement
      showToast('Đã xóa toàn bộ giỏ hàng thành công', 'success');
      
      // Reset selectedItems khi clear cart
      setSelectedItems([]);
      
      // Tải lại giỏ hàng
      await loadCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      showToast(`Lỗi: ${error.message || 'Không thể xóa giỏ hàng'}`, 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  // Checkbox handlers
  const handleItemSelect = (cartItemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, cartItemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== cartItemId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allItemIds = cart.cartItems.map(item => item.cartItemId);
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems([]);
    }
  };

  // Calculate totals for selected items only
  const getSelectedItemsData = () => {
    const selectedCartItems = cart.cartItems.filter(item => selectedItems.includes(item.cartItemId));
    const total = selectedCartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const itemCount = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      cartItems: selectedCartItems,
      total,
      itemCount
    };
  };

  // Chuyển đến checkout với dữ liệu đã chọn
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    
    // Đồng bộ cart state với checkout (chỉ items được chọn)
    const checkoutData = getSelectedItemsData();
    
    // Lưu vào sessionStorage để checkout có thể truy cập
    sessionStorage.setItem('checkoutCart', JSON.stringify(checkoutData));
    
    navigate('/checkout');
  };



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  if (loading) {
    return (
      <StyledContent>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Đang tải giỏ hàng...</Text>
          </div>
        </div>
      </StyledContent>
    );
  }

  // Giỏ hàng trống
  if (cart.cartItems.length === 0) {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          }
        }}
      >
        <StyledContent>
          <PageHeader>
            <Title level={2} className="page-title">
              <PawIcon /> Giỏ hàng của bạn
            </Title>
            <Text className="breadcrumb-text">
              <Link to="/">Trang chủ</Link>
              <RightOutlined className="separator" />
              Giỏ hàng
            </Text>
          </PageHeader>

          <ModernStepsContainer>
            <div className="steps-header">
              <Title level={3}>Quy trình mua hàng</Title>
              <Text>Chỉ cần 4 bước đơn giản để hoàn tất đơn hàng</Text>
            </div>
            
            <div className="custom-steps">
              <div className="step-item">
                <div className="step-icon active">
                  <ShoppingCartOutlined />
                </div>
                <div className="step-content">
                  <div className="step-title">Giỏ hàng</div>
                  <div className="step-description">Xem lại sản phẩm</div>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-icon pending">
                  <UserOutlined />
                </div>
                <div className="step-content">
                  <div className="step-title">Thông tin</div>
                  <div className="step-description">Nhập thông tin giao hàng</div>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-icon pending">
                  <CreditCardOutlined />
                </div>
                <div className="step-content">
                  <div className="step-title">Thanh toán</div>
                  <div className="step-description">Chọn phương thức thanh toán</div>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-icon pending">
                  <CheckCircleOutlined />
                </div>
                <div className="step-content">
                  <div className="step-title">Hoàn tất</div>
                  <div className="step-description">Xác nhận đơn hàng</div>
                </div>
              </div>
            </div>
          </ModernStepsContainer>

          <MainContainer>
            <EmptyCartContainer>
              <ShoppingCartOutlined className="empty-icon" />
              <div className="empty-title">Giỏ hàng trống</div>
              <div className="empty-description">
                Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy tiếp tục mua sắm!
              </div>
              <Space>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<ShoppingOutlined />}
                  onClick={() => navigate('/products')}
                >
                  Tiếp tục mua sắm
                </Button>
              </Space>
            </EmptyCartContainer>
          </MainContainer>
        </StyledContent>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        }
      }}
    >
      <StyledContent>
        <PageHeader>
          <Title level={2} className="page-title">
            <PawIcon /> Giỏ hàng của bạn
          </Title>
          <Text className="breadcrumb-text">
            <Link to="/">Trang chủ</Link>
            <RightOutlined className="separator" />
            Giỏ hàng ({cart.itemCount} sản phẩm)
          </Text>
        </PageHeader>

        <ModernStepsContainer>
          <div className="steps-header">
            <Title level={3}>Quy trình mua hàng</Title>
            <Text>Chỉ cần 4 bước đơn giản để hoàn tất đơn hàng</Text>
          </div>
          
          <div className="custom-steps">
            <div className="step-item">
              <div className="step-icon active">
                <ShoppingCartOutlined />
              </div>
              <div className="step-content">
                <div className="step-title">Giỏ hàng</div>
                <div className="step-description">Xem lại sản phẩm</div>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-icon pending">
                <UserOutlined />
              </div>
              <div className="step-content">
                <div className="step-title">Thông tin</div>
                <div className="step-description">Nhập thông tin giao hàng</div>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-icon pending">
                <CreditCardOutlined />
              </div>
              <div className="step-content">
                <div className="step-title">Thanh toán</div>
                <div className="step-description">Chọn phương thức thanh toán</div>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-icon pending">
                <CheckCircleOutlined />
              </div>
              <div className="step-content">
                <div className="step-title">Hoàn tất</div>
                <div className="step-description">Xác nhận đơn hàng</div>
              </div>
            </div>
          </div>
        </ModernStepsContainer>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={16}>
            <MainContainer>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Checkbox
                      checked={selectedItems.length === cart.cartItems.length && cart.cartItems.length > 0}
                      indeterminate={selectedItems.length > 0 && selectedItems.length < cart.cartItems.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    >
                      <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                        Chọn tất cả ({selectedItems.length}/{cart.cartItems.length})
                      </Title>
                    </Checkbox>
                  </div>
                  <Button 
                    type="link" 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleClearCart}
                  >
                    Xóa tất cả
                  </Button>
                </div>
                
                {cart.cartItems.map((item) => (
                  <CartItemCard 
                    key={item.cartItemId}
                    style={{
                      opacity: selectedItems.includes(item.cartItemId) ? 1 : 0.6,
                      border: selectedItems.includes(item.cartItemId) ? '2px solid #1890ff' : '1px solid #d9d9d9'
                    }}
                  >
                    <ProductInfo>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Checkbox
                          checked={selectedItems.includes(item.cartItemId)}
                          onChange={(e) => handleItemSelect(item.cartItemId, e.target.checked)}
                        />
                        <div className="product-image">
                          <Avatar
                            shape="square"
                            size={80}
                            src={getProductImageUrl(
                              item.product?.Photo || 
                              item.product?.photo || 
                              item.product?.imageUrl || 
                              item.Photo || 
                              item.photo ||
                              item.imageUrl
                            )}
                            icon={<ShopOutlined />}
                          />
                        </div>
                      </div>
                      <div className="product-details">
                        <div className="product-name">{item.product?.Name || item.product?.name}</div>
                        <div className="product-price">{formatCurrency(item.product?.Price || item.product?.price || 0)}</div>
                        {item.option && (
                          <div className="product-option">
                            <Tag color="blue">{item.option}</Tag>
                          </div>
                        )}
                      </div>
                    </ProductInfo>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <QuantityControls>
                        <Button
                          className="quantity-btn"
                          icon={<MinusOutlined />}
                          onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        />
                        <InputNumber
                          className="quantity-input"
                          value={item.quantity}
                          min={1}
                          onChange={(value) => handleUpdateQuantity(item.cartItemId, value)}
                        />
                        <Button
                          className="quantity-btn"
                          icon={<PlusOutlined />}
                          onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        />
                      </QuantityControls>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                          {formatCurrency((item.product?.Price || item.product?.price || 0) * item.quantity)}
                        </Text>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveItem(item.cartItemId, item.product?.Name || item.product?.name)}
                        />
                      </div>
                    </div>
                  </CartItemCard>
                ))}
              </div>
            </MainContainer>
          </Col>
          
          <Col xs={24} lg={8}>
            <MainContainer>
              <CartSummary>
                <Title level={4} style={{ color: '#1890ff', marginBottom: '20px' }}>
                  Tóm tắt đơn hàng
                </Title>
                
                <div className="summary-row">
                  <Text>Sản phẩm đã chọn:</Text>
                  <Text strong>{selectedItems.length}/{cart.cartItems.length}</Text>
                </div>
                
                <div className="summary-row">
                  <Text>Tạm tính:</Text>
                  <Text strong>{formatCurrency(getSelectedItemsData().total)}</Text>
                </div>
                
                <div className="summary-row">
                  <Text>Phí vận chuyển:</Text>
                  <Text strong>{selectedItems.length > 0 ? formatCurrency(30000) : formatCurrency(0)}</Text>
                </div>
                
                <div className="summary-row total-row">
                  <Text className="total-label">Tổng cộng:</Text>
                  <Text className="total-amount">
                    {formatCurrency(selectedItems.length > 0 ? getSelectedItemsData().total + 30000 : 0)}
                  </Text>
                </div>
                
                <Button
                  type="primary"
                  className="checkout-button"
                  icon={<CreditCardOutlined />}
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                >
                  Tiến hành thanh toán ({selectedItems.length} sản phẩm)
                </Button>
                
                <Button
                  type="default"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/products')}
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  Tiếp tục mua sắm
                </Button>
              </CartSummary>
            </MainContainer>
          </Col>
        </Row>

        {/* Modal xác nhận xóa tương tự ServiceManagement */}
        {confirmDelete && (
          <ModalOverlay>
            <ConfirmModal>
              <ModalHeader>
                <h2>Xác nhận xóa</h2>
                <CloseButton onClick={() => setConfirmDelete(null)}>
                  ×
                </CloseButton>
              </ModalHeader>
              <ModalContent>
                <div className="confirm-icon">
                  <ExclamationCircleOutlined style={{ fontSize: '60px', color: '#FF5252' }} />
                </div>
                <p style={{ fontSize: '16px', margin: '20px 0', textAlign: 'center' }}>
                  Bạn có chắc chắn muốn xóa "{confirmDelete.productName}" khỏi giỏ hàng?
                </p>
                                 <div className="modal-actions">
                   <Button onClick={() => setConfirmDelete(null)}>
                     Hủy
                   </Button>
                   <Button 
                     type="primary" 
                     danger
                     onClick={confirmDelete.isClearAll ? confirmClearCart : confirmRemoveItem}
                   >
                     {confirmDelete.isClearAll ? 'Xóa tất cả' : 'Xóa'}
                   </Button>
                 </div>
              </ModalContent>
            </ConfirmModal>
          </ModalOverlay>
        )}

        {/* Toast notification tương tự ServiceManagement */}
        {toast.show && (
          <Toast className={toast.type}>
            {toast.type === 'success' ? (
              <CheckCircleOutlined />
            ) : (
              <ExclamationCircleOutlined />
            )}
            <span>{toast.message}</span>
          </Toast>
        )}
      </StyledContent>
    </ConfigProvider>
  );
};

// Styled components for modal and toast
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ConfirmModal = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;

  h2 {
    margin: 0;
    color: #1f1f1f;
    font-weight: 600;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  
  &:hover {
    color: #666;
  }
`;

const ModalContent = styled.div`
  padding: 30px 24px;
  text-align: center;

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 24px;
  }
`;

const Toast = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideInRight 0.3s ease;

  &.success {
    background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  }

  &.error {
    background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  }

  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

export default CartPage; 