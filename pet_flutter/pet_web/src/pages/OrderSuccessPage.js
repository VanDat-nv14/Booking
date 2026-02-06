import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Result,
  Typography,
  Spin,
  Card,
  Row,
  Col,
  Button,
  Divider,
  Alert,
  Tag,
  Descriptions,
  Space,
  Statistic,
  Layout
} from 'antd';
import {
  CheckCircleOutlined,
  HomeOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  LoadingOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CarOutlined,
  ShopOutlined,
  MailOutlined,
  RightOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons';
import orderService from '../services/orderService';
import { getOrderStatusInfo } from '../utils/orderStatusUtils';
import styled, { keyframes } from 'styled-components';

const { Title, Text, Paragraph } = Typography;
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

const celebrationAnimation = keyframes`
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
  background: #f8fafc;
  min-height: 100vh;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const SuccessHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  .ant-result {
    padding: 0;
    background: none;
    
    .ant-result-icon {
      .anticon {
        color: #52c41a;
        font-size: 80px;
        animation: ${celebrationAnimation} 2s ease-in-out infinite;
      }
    }
    
    .ant-result-title {
      color: #1a1a1a;
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 16px;
    }
    
    .ant-result-subtitle {
      color: #64748b;
      font-size: 18px;
      max-width: 500px;
      margin: 0 auto;
    }
  }
`;

const ModernStepsContainer = styled.div`
  margin-bottom: 50px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  .steps-header {
    text-align: center;
    margin-bottom: 40px;
    
    h3 {
      color: #1a1a1a;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    
    p {
      color: #64748b;
      font-size: 16px;
      margin: 0;
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
      left: 10%;
      right: 10%;
      height: 4px;
      background: #52c41a;
      border-radius: 2px;
      z-index: 1;
    }
    
    .step-item {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      background: white;
      padding: 0 20px;
      
      .step-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        margin-bottom: 16px;
        position: relative;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        
        &.completed {
          background: #52c41a;
          color: white;
          
          .anticon {
            font-size: 32px;
          }
        }
      }
      
      .step-content {
        .step-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        
        .step-description {
          font-size: 14px;
          color: #64748b;
          max-width: 120px;
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    padding: 24px;
    
    .custom-steps {
      flex-direction: column;
      gap: 30px;
      
      &::before {
        display: none;
      }
      
      .step-item {
        .step-icon {
          width: 60px;
          height: 60px;
          font-size: 20px;
        }
      }
    }
  }
`;

const OrderDetailsContainer = styled.div`
  .ant-card {
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
    border: none;
    margin-bottom: 24px;
    
    .ant-card-head {
      background: #f8fafc;
      border-bottom: 1px solid #e6f0fa;
      border-radius: 16px 16px 0 0;
      
      .card-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 18px;
        font-weight: 600;
        
        .card-title-icon {
          color: #1890ff;
          font-size: 20px;
        }
      }
    }
  }
  
  .order-statistic {
    .ant-statistic-title {
      color: #64748b;
      font-weight: 500;
    }
    
    &.total-amount .ant-statistic-content {
      color: #52c41a !important;
    }
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
  
  .action-button {
    height: 56px;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 600;
    padding: 0 32px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.3s ease;
    
    &.home-button {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      color: #475569;
      
      &:hover {
        background: #e2e8f0;
        border-color: #cbd5e1;
        transform: translateY(-2px);
      }
    }
    
    &.shop-button {
      border: 2px solid #1890ff;
      color: #1890ff;
      
      &:hover {
        background: #1890ff;
        color: white;
        transform: translateY(-2px);
      }
    }
    
    &.orders-button {
      background: #1890ff;
      border: none;
      
      &:hover {
        background: #1890ff;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(24, 144, 255, 0.4);
      }
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    
    .action-button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  
  .ant-spin {
    .ant-spin-dot {
      font-size: 40px;
    }
    
    .ant-spin-text {
      color: #64748b;
      font-size: 16px;
      margin-top: 16px;
    }
  }
`;

const NoteCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: none;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.07);
  margin: 24px 0;
  
  .note-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .note-icon {
      color: #1890ff;
      font-size: 16px;
      margin-top: 2px;
    }
  }
`;

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy orderId từ state của location hoặc từ URL params
  const orderId = location.state?.orderId || new URLSearchParams(location.search).get('id');

  console.log('🎉 OrderSuccessPage LOADED!', {
    locationState: location.state,
    locationSearch: location.search,
    orderId: orderId,
    currentPath: window.location.pathname
  });

  useEffect(() => {
    console.log('OrderSuccessPage useEffect running', {
      orderId,
      locationState: location.state
    });

    // Nếu không có orderId, chuyển hướng về trang chủ
    if (!orderId) {
      console.warn('No orderId found, redirecting to home page');
      navigate('/');
      return;
    }

    // Lấy thông tin đơn hàng
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        console.log(`Fetching order details for orderId: ${orderId}`);
        const orderData = await orderService.getOrderById(orderId);
        console.log('Order data received:', orderData);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Không thể tải thông tin đơn hàng. Vui lòng kiểm tra trong trang Đơn hàng của tôi.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  // Format thời gian
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mapping phương thức thanh toán
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận hàng';
      case 'Banking':
        return 'Chuyển khoản ngân hàng';
      case 'MoMo':
        return 'Ví MoMo';
      default:
        return method;
    }
  };

  // Render payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'COD':
        return <DollarOutlined style={{ color: '#faad14' }} />;
      case 'Banking':
        return <ShopOutlined style={{ color: '#1890ff' }} />;
      case 'MoMo':
        return <ShoppingOutlined style={{ color: '#eb2f96' }} />;
      default:
        return <CreditCardOutlined />;
    }
  };

  // Hiển thị trạng thái đơn hàng
  const getStatusTag = (status) => {
    const statusInfo = getOrderStatusInfo(status);
    
    // Map icon based on status text
    let icon;
    switch (statusInfo.text) {
      case 'Chờ xử lý':
        icon = <ClockCircleOutlined />;
        break;
      case 'Đang xử lý':
        icon = <ClockCircleOutlined />;
        break;
      case 'Đã xác nhận':
        icon = <CheckCircleOutlined />;
        break;
      case 'Đang giao hàng':
        icon = <CarOutlined />;
        break;
      case 'Đã giao hàng':
        icon = <CheckCircleOutlined />;
        break;
      case 'Hoàn thành':
        icon = <CheckCircleOutlined />;
        break;
      case 'Đã hủy':
        icon = <CloseCircleOutlined />;
        break;
      default:
        icon = null;
    }
    
    return <Tag color={statusInfo.antdStatus} icon={icon}>{statusInfo.text}</Tag>;
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} 
          tip="Đang tải thông tin đơn hàng..."
        />
      </LoadingContainer>
    );
  }

  const steps = [
    {
      title: 'Giỏ hàng',
      description: 'Xem lại sản phẩm',
      icon: ShoppingCartOutlined,
      status: 'completed'
    },
    {
      title: 'Thông tin',
      description: 'Nhập thông tin giao hàng',
      icon: UserOutlined,
      status: 'completed'
    },
    {
      title: 'Thanh toán',
      description: 'Chọn phương thức thanh toán',
      icon: CreditCardOutlined,
      status: 'completed'
    },
    {
      title: 'Hoàn tất',
      description: 'Xác nhận đơn hàng',
      icon: CheckCircleOutlined,
      status: 'completed'
    }
  ];

  return (
    <StyledContent>
      <SuccessHeader>
        <Result
          status="success"
          title="Đặt hàng thành công!"
          subTitle="Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý."
        />
      </SuccessHeader>
      
      <ModernStepsContainer>
        <div className="steps-header">
          <Title level={3}>Quy trình mua hàng</Title>
          <Text>Hoàn tất! Đơn hàng của bạn đã được xử lý thành công</Text>
        </div>
        
        <div className="custom-steps">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="step-item">
                <div className={`step-icon ${step.status}`}>
                  <IconComponent />
                </div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </ModernStepsContainer>

        <Divider />
        
        {error ? (
          <Alert
            message="Không thể tải thông tin đơn hàng"
            description={error}
            type="warning"
            showIcon
          />
        ) : order ? (
          <OrderDetailsContainer>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card 
                  className="order-info-card"
                  title={
                    <div className="card-title">
                      <InfoCircleOutlined className="card-title-icon" />
                      <span>Thông tin đơn hàng</span>
                    </div>
                  }
                  bordered={false}
                >
                  <Descriptions column={1} size="small" className="order-descriptions">
                    <Descriptions.Item 
                      label="Mã đơn hàng" 
                      labelStyle={{ fontWeight: 500 }}
                    >
                      <Text strong className="order-id">#{order.orderId}</Text>
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label="Ngày đặt hàng" 
                      labelStyle={{ fontWeight: 500 }}
                    >
                      <Space>
                        <ClockCircleOutlined />
                        <span>{formatDateTime(order.orderDate)}</span>
                      </Space>
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label="Trạng thái đơn hàng" 
                      labelStyle={{ fontWeight: 500 }}
                    >
                      {getStatusTag(order.status)}
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label="Phương thức thanh toán" 
                      labelStyle={{ fontWeight: 500 }}
                    >
                      <Space>
                        {getPaymentMethodIcon(order.paymentMethod)}
                        <span>{getPaymentMethodText(order.paymentMethod)}</span>
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card 
                  className="shipping-info-card"
                  title={
                    <div className="card-title">
                      <UserOutlined className="card-title-icon" />
                      <span>Thông tin giao hàng</span>
                    </div>
                  }
                  bordered={false}
                >
                  <Descriptions column={1} size="small" className="order-descriptions">
                    <Descriptions.Item 
                      label="Người nhận" 
                      labelStyle={{ fontWeight: 500 }}
                    >
                      <Space>
                        <UserOutlined />
                        <span>{order.recipientName}</span>
                      </Space>
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label="Số điện thoại" 
                      labelStyle={{ fontWeight: 500 }}
                    >
                      <Space>
                        <PhoneOutlined />
                        <span>{order.recipientPhone}</span>
                      </Space>
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label="Địa chỉ giao hàng" 
                      labelStyle={{ fontWeight: 500 }}
                    >
                      <Space align="start">
                        <EnvironmentOutlined style={{ marginTop: 4 }} />
                        <span>{order.shippingAddress}</span>
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              
              <Col xs={24}>
                <Card 
                  className="payment-summary-card"
                  title={
                    <div className="card-title">
                      <DollarOutlined className="card-title-icon" />
                      <span>Tổng quan đơn hàng</span>
                    </div>
                  }
                  bordered={false}
                >
                  <Row gutter={24} className="payment-summary">
                    <Col xs={24} sm={8}>
                      <Statistic 
                        title="Tổng số sản phẩm" 
                        value={order.orderItems?.length || 0} 
                        suffix="sản phẩm"
                        className="order-statistic"
                      />
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <Statistic 
                        title="Phí vận chuyển" 
                        value={formatCurrency(order.shippingFee || 0)} 
                        className="order-statistic"
                      />
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <Statistic 
                        title="Tổng thanh toán" 
                        value={formatCurrency(order.totalAmount)} 
                        className="order-statistic total-amount"
                        valueStyle={{ color: '#f5222d', fontWeight: 'bold' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </OrderDetailsContainer>
        ) : (
          <Alert
            message="Không thể hiển thị thông tin đơn hàng"
            description="Bạn có thể kiểm tra trong mục Đơn hàng của tôi."
            type="info"
            showIcon
          />
        )}
        
        <NoteCard bordered={false}>
          <Space direction="vertical" size="middle">
            <div className="note-item">
              <MailOutlined className="note-icon" />
              <Text>Chúng tôi sẽ gửi email xác nhận đơn hàng và thông tin chi tiết đến địa chỉ email của bạn.</Text>
            </div>
            
            <div className="note-item">
              <FileTextOutlined className="note-icon" />
              <Text>Bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi".</Text>
            </div>
            
            <div className="note-item">
              <CarOutlined className="note-icon" />
              <Text>Đơn hàng thường được giao trong vòng 2-3 ngày làm việc.</Text>
            </div>
          </Space>
        </NoteCard>
        
        <Divider />
        
        <ActionButtonsContainer>
          <Button 
            type="default" 
            icon={<HomeOutlined />}
            size="large"
            className="action-button home-button"
            onClick={() => navigate('/')}
          >
            Trang chủ
          </Button>
          
          <Button 
            type="primary" 
            ghost
            icon={<ShoppingOutlined />}
            size="large"
            className="action-button shop-button"
            onClick={() => navigate('/products')}
          >
            Tiếp tục mua sắm
          </Button>
          
          <Button 
            type="primary" 
            icon={<FileTextOutlined />}
            size="large"
            className="action-button orders-button"
            onClick={() => navigate('/orders')}
          >
            Đơn hàng của tôi
          </Button>
        </ActionButtonsContainer>
    </StyledContent>
  );
};

export default OrderSuccessPage;