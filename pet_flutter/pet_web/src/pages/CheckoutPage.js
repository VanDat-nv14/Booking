import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import cartService from '../services/cartService';
import { getProductImageUrl } from '../utils/imageUtils';
import {
  Typography,
  Form,
  Input,
  Button,
  Card,
  Table,
  Row,
  Col,
  Alert,
  Space,
  Divider,
  Steps,
  Result,
  message,
  Tag,
  Avatar,
  Badge,
  Layout,
  Tooltip,
  ConfigProvider,
  Spin
} from 'antd';
import {
  ShoppingCartOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  MessageOutlined,
  CarOutlined,
  SecurityScanOutlined,
  ShopOutlined,
  LockOutlined,
  ArrowRightOutlined,
  RightOutlined,
  SafetyOutlined,
  GiftOutlined,
  HeartOutlined,
  StarOutlined,
  SmileOutlined,
  CalendarOutlined,
  RocketOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { Content } = Layout;

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

const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
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

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const shine = keyframes`
  0% {
    background-position: -100px;
  }
  40%, 100% {
    background-position: 320px;
  }
`;

// Pet Paw Icon for pet-themed branding
const PawIcon = () => (
  <svg viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor">
    <path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5.3-86.2 32.6-96.8 70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3-14.3-70.1 10.2-84.1 59.7.9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2-25.8 0-46.7-20.9-46.7-46.7v-1.6c0-10.4 1.6-20.8 5.2-30.5zM411.6 198.6c-18.9 32.4-14.3 70.1 10.2 84.1s59.7-.9 78.5-33.3 14.3-70.1-10.2-84.1-59.7.9-78.5 33.3zM285.5 92.9c-14.3 42.9.3 86.2 32.6 96.8s70.1-15.6 84.4-58.5-.3-86.2-32.6-96.8-70.1 15.6-84.4 58.5z"/>
  </svg>
);

// Enhanced Styled Components - Đơn màu xanh dương
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
  margin-bottom: 40px;
  text-align: center;
  
  .page-title {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    color: #1890ff;
    gap: 16px;
    
    .anticon, svg {
      font-size: 32px;
    }
  }
  
  .breadcrumb-text {
    font-size: 15px;
    color: #666;
    
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

const CheckoutStepsContainer = styled.div`
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
      background: linear-gradient(to right, #1890ff 50%, #e5e5e5 50%);
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

const CheckoutContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(24, 144, 255, 0.1);
  border: 1px solid #e6f7ff;
  overflow: hidden;
`;

const FormSection = styled.div`
  padding: 32px;
  
  .form-title {
    color: #1890ff;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .ant-form-item-label > label {
    color: #1890ff;
    font-weight: 600;
  }
  
  .ant-input, .ant-input:focus {
    border-color: #e6f7ff;
    
    &:hover {
      border-color: #1890ff;
    }
    
    &:focus {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }
`;

const OrderSummarySection = styled.div`
  background: #f8faff;
  padding: 32px;
  border-left: 1px solid #e6f7ff;
  
  .summary-title {
    color: #1890ff;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .order-item {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e6f7ff;
    
    .product-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
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
      font-weight: 600;
      color: #1890ff;
    }
  }
  
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
`;

const EmptyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  
  .ant-result-icon {
    color: #1890ff;
  }
`;

const CheckoutPage = () => {
  const [form] = Form.useForm();
  const { currentUser } = useContext(AuthContext);
  const [cart, setCart] = useState({ cartItems: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const navigate = useNavigate();

  // Phí vận chuyển cố định
  const shippingFee = cart.cartItems && cart.cartItems.length > 0 ? 30000 : 0;
  
  // Thời gian giao hàng dự kiến
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  // Tải giỏ hàng khi component mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        // Kiểm tra sessionStorage trước để đồng bộ với CartPage
        const savedCart = sessionStorage.getItem('checkoutCart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
          // Xóa sau khi sử dụng
          sessionStorage.removeItem('checkoutCart');
        } else {
          // Nếu không có trong sessionStorage, tải từ service
          const cartData = await cartService.getCart();
          setCart(cartData);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        message.error('Không thể tải giỏ hàng');
      } finally {
        setLoading(false);
      }
    };
    
    loadCart();
  }, []);

  // Đồng bộ form với thông tin user
  useEffect(() => {
    // Chỉ redirect khi đã load xong cart và cart thực sự trống
    if (!loading && (!cart.cartItems || cart.cartItems.length === 0)) {
      navigate('/cart');
      return;
    }
    
    // Set giá trị mặc định từ thông tin user
    if (currentUser && useSavedAddress) {
      form.setFieldsValue({
        recipientName: currentUser?.fullName || '',
        recipientPhone: currentUser?.phone || '',
        shippingAddress: currentUser?.address || '',
        note: ''
      });
    }
  }, [cart.cartItems, navigate, currentUser, form, useSavedAddress, loading]);

  // Hàm xử lý khi người dùng submit form
  const handleSubmit = (values) => {
    setSubmitting(true);
    
    try {
      // Kiểm tra dữ liệu đầu vào
      const { recipientName, recipientPhone, shippingAddress } = values;
      
      if (!recipientName || !recipientPhone || !shippingAddress) {
        message.error('Vui lòng điền đầy đủ thông tin giao hàng!');
        setSubmitting(false);
        return;
      }
      
      // Tạo dữ liệu đơn hàng hoàn chỉnh
      const orderData = {
        ...values,
        cartItems: cart.cartItems,
        subtotal: cart.total,
        shippingFee: shippingFee,
        total: cart.total + shippingFee,
        estimatedDelivery: estimatedDelivery
      };
      
      // Lưu lại thời gian hoàn thành đơn hàng
      setTimeout(() => {
        // Chuyển đến trang thanh toán kèm theo dữ liệu đơn hàng đầy đủ
        navigate('/payment', {
          state: {
            orderData: orderData
          }
        });
      }, 1500);
    } catch (err) {
      // Hiển thị thông báo lỗi
      const errorMessage = err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      message.error(errorMessage);
      setSubmitting(false);
    }
  };
  
  const toggleSavedAddress = () => {
    setUseSavedAddress(!useSavedAddress);
    
    if (!useSavedAddress && currentUser) {
      // Nếu bật lại địa chỉ đã lưu, cập nhật form với dữ liệu người dùng
      form.setFieldsValue({
        recipientName: currentUser.fullName || '',
        recipientPhone: currentUser.phone || '',
        shippingAddress: currentUser.address || '',
      });
    } else if (useSavedAddress) {
      // Nếu tắt địa chỉ đã lưu, xóa các trường địa chỉ
      form.setFieldsValue({
        recipientName: '',
        recipientPhone: '',
        shippingAddress: '',
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };
  
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);
  };

  // Loading state khi đang tải cart
  if (loading) {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          }
        }}
      >
        <StyledContent>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Đang tải thông tin giỏ hàng...</Text>
            </div>
          </div>
        </StyledContent>
      </ConfigProvider>
    );
  }

  if (!cart.cartItems || cart.cartItems.length === 0) {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          }
        }}
      >
        <StyledContent>
          <EmptyContainer>
            <Result
              icon={<PawIcon />}
              title="Giỏ hàng của bạn đang trống"
              subTitle="Vui lòng thêm sản phẩm vào giỏ hàng để tiến hành thanh toán. Khám phá các sản phẩm tuyệt vời cho thú cưng của bạn."
              extra={
                <Button 
                  type="primary" 
                  icon={<ShoppingCartOutlined />}
                  onClick={() => navigate('/products')}
                  size="large"
                >
                  Khám phá sản phẩm
                </Button>
              }
            />
          </EmptyContainer>
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
            <PawIcon /> Thông tin thanh toán
          </Title>
          <Text className="breadcrumb-text">
            <Link to="/">Trang chủ</Link>
            <RightOutlined className="separator" />
            <Link to="/cart">Giỏ hàng</Link>
            <RightOutlined className="separator" />
            Thanh toán
          </Text>
        </PageHeader>

        <CheckoutStepsContainer>
          <div className="steps-header">
            <Title level={3}>Quy trình mua hàng</Title>
            <Text>Bước 2/4: Nhập thông tin giao hàng</Text>
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
              <div className="step-icon active">
                <UserOutlined />
              </div>
              <div className="step-content">
                <div className="step-title">Thông tin</div>
                <div className="step-description">Đang nhập thông tin</div>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-icon pending">
                <CreditCardOutlined />
              </div>
              <div className="step-content">
                <div className="step-title">Thanh toán</div>
                <div className="step-description">Chọn phương thức</div>
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
        </CheckoutStepsContainer>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={14}>
            <CheckoutContainer>
              <FormSection>
                <Title level={4} className="form-title">
                  <UserOutlined /> Thông tin giao hàng
                </Title>
                
                {currentUser && (
                  <Alert
                    message={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                          {useSavedAddress 
                            ? '✅ Đang sử dụng địa chỉ đã lưu' 
                            : '📝 Đang nhập địa chỉ mới'
                          }
                        </span>
                        <Button
                          type="link"
                          size="small"
                          onClick={toggleSavedAddress}
                        >
                          {useSavedAddress ? 'Đổi địa chỉ' : 'Dùng địa chỉ đã lưu'}
                        </Button>
                      </div>
                    }
                    type="info"
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
                    name="recipientName"
                    label="Họ và tên người nhận"
                    rules={[
                      { required: true, message: 'Vui lòng nhập họ tên!' },
                      { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Nhập họ và tên người nhận"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="recipientPhone"
                    label="Số điện thoại"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số điện thoại!' },
                      { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Nhập số điện thoại"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="shippingAddress"
                    label="Địa chỉ giao hàng"
                    rules={[
                      { required: true, message: 'Vui lòng nhập địa chỉ!' },
                      { min: 10, message: 'Địa chỉ phải có ít nhất 10 ký tự!' }
                    ]}
                  >
                    <Input
                      prefix={<HomeOutlined />}
                      placeholder="Nhập địa chỉ giao hàng chi tiết"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="note"
                    label="Ghi chú (tùy chọn)"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Ghi chú về đơn hàng (thời gian giao hàng, yêu cầu đặc biệt...)"
                    />
                  </Form.Item>
                  
                  <Alert
                    message="Thông tin giao hàng"
                    description={
                      <div>
                        <p>🚚 Thời gian giao hàng: {formatDate(estimatedDelivery)}</p>
                        <p>📞 Hotline hỗ trợ: 1900-123-456</p>
                        <p>🔒 Thanh toán an toàn với các phương thức đa dạng</p>
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
                      loading={submitting}
                      icon={<ArrowRightOutlined />}
                      style={{ 
                        width: '100%', 
                        height: 48,
                        fontSize: 16,
                        fontWeight: 600
                      }}
                    >
                      Tiếp tục thanh toán
                    </Button>
                  </Form.Item>
                </Form>
              </FormSection>
            </CheckoutContainer>
          </Col>
          
          <Col xs={24} lg={10}>
            <CheckoutContainer>
              <OrderSummarySection>
                <Title level={4} className="summary-title">
                  <ShoppingCartOutlined /> Đơn hàng của bạn
                </Title>
                
                <div style={{ marginBottom: 24 }}>
                  {cart.cartItems.map((item) => (
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
                </div>
                
                <div className="summary-row">
                  <Text>Tạm tính:</Text>
                  <Text strong>{formatCurrency(cart.total)}</Text>
                </div>
                
                <div className="summary-row">
                  <Text>Phí vận chuyển:</Text>
                  <Text strong>{formatCurrency(shippingFee)}</Text>
                </div>
                
                <div className="summary-row total-row">
                  <Text className="total-label">Tổng cộng:</Text>
                  <Text className="total-amount">{formatCurrency(cart.total + shippingFee)}</Text>
                </div>
                
                <Alert
                  message="Cam kết của chúng tôi"
                  description={
                    <div>
                      <p>✅ Sản phẩm chính hãng 100%</p>
                      <p>🚚 Giao hàng nhanh trong 1-3 ngày</p>
                      <p>💰 Hoàn tiền nếu không hài lòng</p>
                      <p>📞 Hỗ trợ 24/7</p>
                    </div>
                  }
                  type="success"
                  style={{ marginTop: 16 }}
                />
              </OrderSummarySection>
            </CheckoutContainer>
          </Col>
        </Row>
      </StyledContent>
    </ConfigProvider>
  );
};

export default CheckoutPage;