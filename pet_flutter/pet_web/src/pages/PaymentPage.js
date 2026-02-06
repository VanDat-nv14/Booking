import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import cartService from '../services/cartService';
import { AuthContext } from '../context/AuthContext';
import orderService from '../services/orderService';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import { getProductImageUrl } from '../utils/imageUtils';
import {
  Typography,
  Form,
  Button,
  Card,
  Table,
  Row,
  Col,
  Alert,
  Space,
  Divider,
  message,
  Badge,
  Tag,
  Avatar,
  Result,
  Layout,
  Spin
} from 'antd';
import {
  ShoppingCartOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  CarOutlined,
  ShopOutlined,
  LockOutlined,
  UserOutlined,
  RightOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';

const { Title, Text } = Typography;
const { Content } = Layout;

// Pet Icon Component
const PawIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21A2 2 0 0 0 5 23H19A2 2 0 0 0 21 21V9M19 19H5V3H13V9H19Z"/>
  </svg>
);

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Styled Components
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
    margin-bottom: 12px;
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

const StepsContainer = styled.div`
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
      background: linear-gradient(to right, #52c41a 50%, #1890ff 50%, #1890ff 75%, #e5e5e5 75%);
      z-index: 1;
      transform: translateY(-50%);
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
      animation: ${pulse} 2s infinite;
    }
    
    &.pending {
      background: #f0f0f0;
      color: #999;
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

const PaymentContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(24, 144, 255, 0.1);
  border: 2px solid #e6f7ff;
  animation: ${fadeIn} 0.6s ease-out;
`;

const OrderSummary = styled.div`
  background: #f8faff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e6f7ff;
  
  .order-item {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .product-image {
      margin-right: 16px;
    }
    
    .product-info {
      flex: 1;
      
      .product-name {
        font-weight: 600;
        color: #1890ff;
        margin-bottom: 4px;
      }
      
      .product-meta {
        font-size: 12px;
        color: #666;
      }
    }
    
    .product-price {
      font-weight: 700;
      color: #1890ff;
      font-size: 16px;
    }
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    &.total-row {
      background: #e6f7ff;
      margin: 16px -24px -24px;
      padding: 20px 24px;
      border-radius: 0 0 12px 12px;
      
      .total-label {
        font-size: 18px;
        font-weight: 700;
        color: #1890ff;
      }
      
      .total-amount {
        font-size: 20px;
        font-weight: 800;
        color: #1890ff;
      }
    }
  }
`;

const PaymentPage = () => {
  const [form] = Form.useForm();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Log khi component được render
  console.log('PaymentPage rendered', {
    locationState: location.state,
    orderData
  });

  useEffect(() => {
    console.log('PaymentPage useEffect running', {
      locationState: location.state
    });
    
    // Kiểm tra xem có dữ liệu đơn hàng được truyền từ trang checkout không
    if (location.state?.orderData) {
      console.log('Found orderData in location state:', location.state.orderData);
      setOrderData(location.state.orderData);
      form.setFieldsValue({
        paymentMethod: 'COD'
      });
      setDataLoaded(true);
    } else {
      console.log('No orderData found, redirecting to checkout');
      message.warning('Vui lòng hoàn thành thông tin đặt hàng trước');
      navigate('/checkout');
    }
  }, [location, navigate, form]);

  // Sử dụng dữ liệu từ orderData thay vì load từ API
  const cartItems = orderData?.cartItems || [];
  const shippingFee = orderData?.shippingFee || 30000;
  
  // Tính lại cartTotal từ cartItems để đảm bảo đúng
  const cartTotal = cartItems.reduce((total, item) => {
    const itemPrice = item.product?.Price || item.product?.price || item.price || 0;
    console.log('Item calculation:', {
      itemName: item.product?.Name || item.product?.name,
      itemPrice,
      quantity: item.quantity,
      subtotal: itemPrice * item.quantity
    });
    return total + (itemPrice * item.quantity);
  }, 0);
  
  console.log('PaymentPage calculation summary:', {
    cartItems: cartItems.length,
    cartTotal,
    shippingFee,
    totalAmount: cartTotal + shippingFee,
    orderDataSubtotal: orderData?.subtotal
  });
  
  // Tính tổng tiền cuối cùng
  const totalAmount = cartTotal + shippingFee;

  // Clear cart function
  const clearCart = async () => {
    try {
      await cartService.clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    console.log('Starting order submission with values:', values);
    console.log('CartItems structure for debugging:', cartItems);
    console.log('Sample cartItem structure:', cartItems[0]);

    try {
      if (!orderData) {
        throw new Error('Không có thông tin đơn hàng. Vui lòng thử lại.');
      }

      // Tạo mảng orderItems từ cartItems
      const orderItems = cartItems.map(item => {
        console.log('Processing cart item:', {
          item,
          productId: item.ProductId || item.productId,
          hasProductId: !!(item.ProductId || item.productId),
          quantity: item.quantity,
          price: item.product?.Price || item.product?.price || item.price || 0
        });
        
        return {
          productId: item.ProductId || item.productId,  // Sửa mapping productId 
          quantity: item.quantity,
          price: item.product?.Price || item.product?.price || item.price || 0,
          productOption: item.option || null
        };
      });

      // Tạo đối tượng đơn hàng mới
      const newOrder = {
        recipientName: orderData.recipientName,
        recipientPhone: orderData.recipientPhone,
        shippingAddress: orderData.shippingAddress,
        note: orderData.note || '',
        paymentMethod: values.paymentMethod,
        shippingFee: shippingFee,
        totalAmount: totalAmount,
        orderItems: orderItems
      };
      
      console.log('Final order object to be submitted:', newOrder);
      console.log('Order validation check:', {
        hasRecipientName: !!newOrder.recipientName,
        hasRecipientPhone: !!newOrder.recipientPhone,
        hasShippingAddress: !!newOrder.shippingAddress,
        hasPaymentMethod: !!newOrder.paymentMethod,
        orderItemsCount: newOrder.orderItems.length,
        orderItemsValid: newOrder.orderItems.every(item => 
          item.productId && item.quantity > 0 && item.price >= 0
        )
      });

      // Debug alert để xem data gửi đi
      alert(`📤 SENDING ORDER DATA:\n${JSON.stringify(newOrder, null, 2)}`);

      // Gọi API để tạo đơn hàng
      const createdOrder = await orderService.createOrder(newOrder);
      console.log('Order creation successful. Response:', createdOrder);

      if (!createdOrder || !createdOrder.orderId) {
        throw new Error('Không nhận được mã đơn hàng. Vui lòng thử lại.');
      }
      
      // Xóa giỏ hàng sau khi đặt hàng thành công
      await clearCart();
      
      // Dispatch event để cập nhật stock trong các trang khác
      window.dispatchEvent(new CustomEvent('orderSuccess', { 
        detail: { 
          orderId: createdOrder.orderId,
          orderItems: orderData.orderItems 
        } 
      }));
      window.dispatchEvent(new CustomEvent('stockUpdated'));
      
      // Thông báo thành công
      message.success('Đặt hàng thành công!');
      
      // Chuyển hướng đến trang đặt hàng thành công
      navigate('/order-success', { 
        state: { 
          success: true, 
          message: 'Đặt hàng thành công!',
          orderId: createdOrder.orderId 
        },
        replace: true
      });
      
    } catch (err) {
      console.error('Error during order submission:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      
      if (err.response) {
        console.error('Error status:', err.response.status);
        console.error('Error data:', err.response.data);
        
        if (err.response.status === 400) {
          // Hiển thị lỗi chi tiết từ backend
          const backendError = typeof err.response.data === 'string' 
            ? err.response.data 
            : err.response.data?.message || 'Thông tin đơn hàng không hợp lệ';
          
          console.error('🚨 Backend 400 Error Details:', backendError);
          alert(`❌ BACKEND ERROR 400:\n${backendError}`); // Temporary debug alert
          
          errorMessage = backendError;
        } else if (err.response.status === 401) {
          errorMessage = 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
        } else if (err.response.status === 500) {
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
        } else {
          errorMessage = err.response.data?.message || err.response.data || errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  // Loading state khi chưa load xong dữ liệu
  if (!dataLoaded) {
    return (
      <StyledContent>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Đang tải thông tin thanh toán...</Text>
          </div>
        </div>
      </StyledContent>
    );
  }

  // Kiểm tra dữ liệu trước khi render
  if (!orderData || !cartItems || cartItems.length === 0) {
    return (
      <StyledContent>
        <Result
          status="warning"
          title="Không thể tiến hành thanh toán"
          subTitle="Vui lòng kiểm tra giỏ hàng và thông tin đặt hàng trước khi thanh toán"
          extra={
            <Button 
              type="primary" 
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/checkout')}
              size="large"
            >
              Quay lại trang đặt hàng
            </Button>
          }
        />
      </StyledContent>
    );
  }

  return (
    <StyledContent>
      <PageHeader>
        <Title level={2} className="page-title">
          <PawIcon /> Thanh toán đơn hàng
        </Title>
        <Text className="breadcrumb-text">
          <a href="/">Trang chủ</a>
          <RightOutlined className="separator" />
          <a href="/cart">Giỏ hàng</a>
          <RightOutlined className="separator" />
          <a href="/checkout">Đặt hàng</a>
          <RightOutlined className="separator" />
          Thanh toán
        </Text>
      </PageHeader>

      <StepsContainer>
        <div className="steps-header">
          <Title level={3}>Quy trình mua hàng</Title>
          <Text>Bước 3/4: Thanh toán đơn hàng</Text>
        </div>
        
        <div className="custom-steps">
          <div className="step-item">
            <div className="step-icon completed">
              <CheckCircleOutlined />
            </div>
            <div className="step-content">
              <div className="step-title">Giỏ hàng</div>
              <div className="step-description">Đã hoàn thành</div>
            </div>
          </div>
          
          <div className="step-item">
            <div className="step-icon completed">
              <CheckCircleOutlined />
            </div>
            <div className="step-content">
              <div className="step-title">Thông tin</div>
              <div className="step-description">Đã hoàn thành</div>
            </div>
          </div>
          
          <div className="step-item">
            <div className="step-icon active">
              <CreditCardOutlined />
            </div>
            <div className="step-content">
              <div className="step-title">Thanh toán</div>
              <div className="step-description">Đang thực hiện</div>
            </div>
          </div>
          
          <div className="step-item">
            <div className="step-icon pending">
              <CheckCircleOutlined />
            </div>
            <div className="step-content">
              <div className="step-title">Hoàn tất</div>
              <div className="step-description">Chờ xử lý</div>
            </div>
          </div>
        </div>
      </StepsContainer>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={14}>
          <PaymentContainer>
            <Title level={4} style={{ color: '#1890ff', marginBottom: 24 }}>
              <CreditCardOutlined /> Phương thức thanh toán
            </Title>
            
            {error && (
              <Alert
                message="Lỗi thanh toán"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              size="large"
            >
              <Form.Item
                name="paymentMethod"
                label="Chọn phương thức thanh toán"
                rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
                initialValue="COD"
              >
                <PaymentMethodSelector />
              </Form.Item>

              <Alert
                message="Thông tin thanh toán"
                description={
                  <div>
                    <p>🔒 Thanh toán an toàn với mã hóa SSL</p>
                    <p>📞 Hỗ trợ 24/7: 1900-123-456</p>
                    <p>💰 Hoàn tiền 100% nếu có vấn đề</p>
                    <p>🚚 Miễn phí đổi trả trong 7 ngày</p>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={<SafetyOutlined />}
                  style={{ 
                    width: '100%', 
                    height: 48,
                    fontSize: 16,
                    fontWeight: 600
                  }}
                >
                  Hoàn tất đặt hàng
                </Button>
              </Form.Item>
            </Form>
          </PaymentContainer>
        </Col>
        
        <Col xs={24} lg={10}>
          <PaymentContainer>
            <Title level={4} style={{ color: '#1890ff', marginBottom: 24 }}>
              <ShoppingCartOutlined /> Tóm tắt đơn hàng
            </Title>
            
            <OrderSummary>
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="order-item">
                  <div className="product-image">
                    <Avatar
                      shape="square"
                      size={60}
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
                  <div className="product-info">
                    <div className="product-name">{item.product?.Name || item.product?.name}</div>
                    <div className="product-meta">
                      SL: {item.quantity}
                      {item.option && (
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {item.option}
                        </Tag>
                      )}
                    </div>
                  </div>
                  <div className="product-price">
                    {formatCurrency((item.product?.Price || item.product?.price || 0) * item.quantity)}
                  </div>
                </div>
              ))}
              
              <div className="summary-row">
                <Text>Tạm tính:</Text>
                <Text strong>{formatCurrency(cartTotal)}</Text>
              </div>
              
              <div className="summary-row">
                <Text>Phí vận chuyển:</Text>
                <Text strong>{formatCurrency(shippingFee)}</Text>
              </div>
              
              <div className="summary-row total-row">
                <Text className="total-label">Tổng cộng:</Text>
                <Text className="total-amount">{formatCurrency(totalAmount)}</Text>
              </div>
            </OrderSummary>

            <Alert
              message="Thông tin giao hàng"
              description={
                <div>
                  <p><strong>Người nhận:</strong> {orderData.recipientName}</p>
                  <p><strong>Điện thoại:</strong> {orderData.recipientPhone}</p>
                  <p><strong>Địa chỉ:</strong> {orderData.shippingAddress}</p>
                  {orderData.note && (
                    <p><strong>Ghi chú:</strong> {orderData.note}</p>
                  )}
                </div>
              }
              type="info"
              style={{ marginTop: 16 }}
            />
          </PaymentContainer>
        </Col>
      </Row>
    </StyledContent>
  );
};

export default PaymentPage;