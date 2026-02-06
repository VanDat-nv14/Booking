import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import orderService from '../services/orderService';
import OrderReviewSection from '../components/order/OrderReviewSection';
import { getOrderStatusInfo, getPaymentStatusInfo, canCancelOrder } from '../utils/orderStatusUtils';
import styled, { keyframes, css } from 'styled-components';

// Ant Design Components
import {
  Layout,
  Typography,
  Button,
  Card,
  Table,
  Tag,
  Avatar,
  Spin,
  Alert,
  Divider,
  Steps,
  Space,
  Row,
  Col,
  Modal,
  Descriptions,
  Badge,
  Statistic,
  List,
  Result,
  Empty,
  Tooltip,
  message,
  Progress,
  Timeline
} from 'antd';

// Ant Design Icons
import {
  ArrowLeftOutlined,
  CarOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  MessageOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  InboxOutlined,
  GiftOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  PrinterOutlined,
  DownloadOutlined,
  StarOutlined,
  RightOutlined,
  ExclamationCircleFilled,
  DollarOutlined,
  ShoppingCartOutlined,
  GlobalOutlined,
  CheckOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
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

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }
`;

// Add new animation
const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

// Styled Components with solid colors
const PageContainer = styled(Content)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  animation: ${css`${fadeIn} 0.5s ease-out`};
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const StatusBadge = styled(Badge)`
  .ant-badge-status-dot {
    width: 10px;
    height: 10px;
  }
`;

const HeaderCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
  border-left: 5px solid ${props => props.borderColor || '#1890ff'};
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
    transform: translateY(-3px);
  }
  
  .ant-card-body {
    padding: 28px;
  }
  
  .header-avatar {
    background-color: ${props => props.bgColor || 'rgba(24, 144, 255, 0.1)'};
    color: ${props => props.color || '#1890ff'};
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }
  
  .header-avatar:hover {
    transform: scale(1.1) rotate(12deg);
  }
`;

const ProductCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.1);
  }
  
  .ant-table-thead > tr > th {
    background-color: #f0f7ff;
    font-weight: 600;
  }
  
  .product-img {
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transition: transform 0.3s ease;
  }
  
  .product-img:hover {
    transform: scale(1.08);
  }
  
  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    background-color: #f0f7ff;
    padding: 16px 24px;
  }
  
  .ant-card-head-title {
    font-weight: 600;
    font-size: 16px;
  }
`;

const InfoCard = styled(Card)`
  border-radius: 16px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.1);
    transform: translateY(-3px);
  }
  
  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    background-color: #f0f7ff;
    padding: 14px 24px;
  }
  
  .ant-card-head-title {
    font-weight: 600;
  }
  
  .ant-card-body {
    padding: 20px 24px;
  }
`;

const StatusSteps = styled(Steps)`
  margin-top: 24px;
  
  .ant-steps-item-title {
    font-weight: 500;
  }
  
  .ant-steps-item-icon {
    background-color: #fff;
    border-color: #1890ff;
  }
  
  .ant-steps-item-active .ant-steps-item-icon {
    background-color: #1890ff;
    box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2);
    animation: ${css`${pulse} 2s infinite`};
  }
`;

const ActionButton = styled(Button)`
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  font-weight: 500;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const StatusTag = styled(Tag)`
  border-radius: 6px;
  font-weight: 600;
  padding: 6px 12px;
  border: none;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
`;

const ProgressWrapper = styled.div`
  padding: 32px 0 16px;
  
  .status-line {
    height: 6px;
    background-color: #f0f0f0;
    position: relative;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .status-progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #1890ff;
    border-radius: 8px;
    transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 1px 4px rgba(24, 144, 255, 0.4);
  }
  
  .status-steps {
    display: flex;
    justify-content: space-between;
  }
  
  .status-step {
    text-align: center;
    flex: 1;
    position: relative;
  }
  
  .step-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    background-color: #f0f0f0;
    color: #999;
    font-size: 18px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    border: 2px solid transparent;
  }
  
  .step-icon.active {
    background-color: #1890ff;
    color: white;
    box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15);
    animation: ${css`${pulse} 2s infinite`};
    transform: scale(1.1);
  }
  
  .step-icon.completed {
    background-color: #52c41a;
    color: white;
    border: 2px solid rgba(82, 196, 26, 0.2);
  }
  
  .step-text {
    font-size: 13px;
    color: #999;
    transition: all 0.3s ease;
    max-width: 80px;
    margin: 0 auto;
    font-weight: 400;
  }
  
  .step-text.active {
    color: #1890ff;
    font-weight: 600;
    transform: scale(1.05);
  }
  
  .step-text.completed {
    color: #52c41a;
    font-weight: 600;
  }
  
  .connector {
    position: absolute;
    top: 20px;
    height: 2px;
    background-color: #f0f0f0;
    width: calc(100% - 40px);
    left: calc(50% + 20px);
    z-index: 0;
  }
  
  .connector.active {
    background-color: #1890ff;
  }
`;

const TotalPriceRow = styled(Row)`
  background-color: #f5f8ff;
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
`;

const ListIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    background-color: rgba(24, 144, 255, 0.15);
  }
`;

const OrderTimeline = styled(Timeline)`
  margin-top: 20px;
  padding: 16px;
  
  .ant-timeline-item-tail {
    border-left: 2px solid #e8e8e8;
  }
  
  .ant-timeline-item-head {
    width: 16px;
    height: 16px;
  }
  
  .ant-timeline-item-content {
    padding-bottom: 20px;
  }
  
  .timeline-date {
    color: #8c8c8c;
    font-size: 12px;
    display: block;
    margin-top: 4px;
  }
`;

const SummaryBanner = styled.div`
  background-color: #e6f7ff;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #52c41a;
  
  .banner-content {
    flex: 1;
  }
  
  .banner-actions {
    margin-left: 16px;
  }
`;

const AnimatedButton = styled(Button)`
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background-color: rgba(255,255,255,0.3);
    transition: all 0.5s ease;
    z-index: -1;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

// Media query helper for responsive views
const ResponsiveRow = styled(Row)`
  @media (max-width: 768px) {
    flex-direction: column;
    
    .ant-col {
      width: 100%;
      max-width: 100%;
      flex: 0 0 100%;
      margin-bottom: 16px;
    }
  }
`;

const ResponsiveSpace = styled(Space)`
  @media (max-width: 576px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    
    .ant-space-item {
      margin-right: 0 !important;
      margin-bottom: 8px !important;
      width: 100%;
    }
    
    button {
      width: 100%;
    }
  }
`;

const BounceAvatar = styled.div`
  animation: ${bounce} 2s infinite;
`;

const ShimmerBar = styled.div`
  width: 50%;
  height: 100%;
  background-color: #1890ff;
  position: absolute;
  animation: ${shimmer} 1.5s infinite;
`;

const OrderDetailPage = () => {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const isAdmin = currentUser?.role === 'Admin';
  const navigate = useNavigate();
  
  // Display message at component mount
  useEffect(() => {
    message.config({
      top: 80,
      duration: 2,
      maxCount: 3,
    });
    
    message.loading({ content: 'Đang tải thông tin đơn hàng...', key: 'orderLoad' });
  }, []);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderById(orderId);
      setOrder(orderData);
      setError(null);
      message.success({ content: 'Tải thông tin đơn hàng thành công!', key: 'orderLoad' });
    } catch (err) {
      setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
      message.error({ content: 'Không thể tải thông tin đơn hàng!', key: 'orderLoad' });
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, fetchOrderDetails]);

  const handleCancelOrder = () => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn hàng',
      icon: <ExclamationCircleFilled style={{ color: '#ff4d4f' }} />,
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.',
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      async onOk() {
        try {
          await orderService.cancelOrder(orderId);
          setOrder({ ...order, status: 'Cancelled' });
          message.success('Đã hủy đơn hàng thành công!');
        } catch (err) {
          message.error('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
          console.error('Error cancelling order:', err);
        }
      }
    });
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      message.loading({ content: 'Đang cập nhật trạng thái...', key: 'updateStatus' });
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      setOrder(updatedOrder);
      message.success({ content: 'Cập nhật trạng thái thành công!', key: 'updateStatus' });
    } catch (err) {
      message.error({ content: 'Không thể cập nhật trạng thái đơn hàng!', key: 'updateStatus' });
      console.error('Error updating order status:', err);
    }
  };

  const getStatusInfo = (status) => {
    const statusInfo = getOrderStatusInfo(status);
    
    // Thêm icon cho từng trạng thái
    let icon;
    switch (statusInfo.text) {
      case 'Chờ xử lý':
        icon = <ClockCircleOutlined />;
        break;
      case 'Đang xử lý':
        icon = <SyncOutlined spin />;
        break;
      case 'Đã xác nhận':
        icon = <InboxOutlined />;
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
        icon = <ShoppingOutlined />;
    }
    
    return {
      ...statusInfo,
      icon,
      status: statusInfo.antdStatus
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text, record) => (
        <Space size="middle">
          {record.imageUrl && (
            <Avatar 
              src={record.imageUrl} 
              shape="square" 
              size={72} 
              className="product-img"
            />
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{text}</div>
            {record.productOption && (
              <Tag color="blue" style={{ fontWeight: 500, borderRadius: '4px', fontSize: '12px' }}>
                {record.productOption}
              </Tag>
            )}
            {record.productId && (
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: '4px' }}>
                ID: {record.productId}
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => (
        <Text style={{ fontWeight: 500, color: '#666' }}>
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (quantity) => (
        <Tag 
          color="blue" 
          style={{ 
            borderRadius: '12px', 
            padding: '4px 12px', 
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)'
          }}
        >
          {quantity}
        </Tag>
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'right',
      render: (_, record) => (
        <Text strong style={{ 
          color: '#1890ff', 
          fontSize: '16px',
          textShadow: '0 0 1px rgba(24, 144, 255, 0.2)'
        }}>
          {formatCurrency(record.price * record.quantity)}
        </Text>
      ),
    }
  ];

  // Enhanced loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        backgroundColor: '#f5f7fa',
        borderRadius: '16px',
        margin: '24px'
      }}>
        <BounceAvatar>
          <Avatar 
            size={80} 
            icon={<ShoppingOutlined />} 
            style={{ 
              backgroundColor: '#1890ff',
              boxShadow: '0 8px 16px rgba(24, 144, 255, 0.3)'
            }} 
          />
        </BounceAvatar>
        <Space direction="vertical" align="center" style={{ marginTop: 24 }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            Đang tải thông tin đơn hàng
          </Title>
          <Spin size="large" tip="Vui lòng đợi trong giây lát..." />
          <div style={{ 
            width: '200px', 
            height: '6px', 
            backgroundColor: '#f0f0f0',
            borderRadius: '3px',
            marginTop: '16px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <ShimmerBar />
          </div>
          <Text type="secondary" style={{ marginTop: 16 }}>
            Chúng tôi đang lấy thông tin chi tiết về đơn hàng của bạn
          </Text>
        </Space>
      </div>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Result
          status="error"
          title="Đã xảy ra lỗi"
          subTitle={error}
          extra={[
            <ActionButton 
              type="primary" 
              key="retry" 
              icon={<SyncOutlined />}
              onClick={() => window.location.reload()}
            >
              Thử lại
            </ActionButton>,
            <ActionButton 
              key="back" 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
              Quay lại
            </ActionButton>
          ]}
        />
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer>
        <Result
          status="warning"
          icon={<InfoCircleOutlined style={{ color: '#faad14' }} />}
          title={
            <Title level={2} style={{ color: '#faad14' }}>
              Không tìm thấy đơn hàng
            </Title>
          }
          subTitle={
            <Text style={{ fontSize: '16px' }}>
              Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này.
              Vui lòng kiểm tra lại mã đơn hàng hoặc liên hệ với bộ phận hỗ trợ.
            </Text>
          }
          extra={
            <Space size="middle" direction="vertical" style={{ width: '100%' }}>
              <ActionButton 
                type="primary" 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                size="large"
                style={{ 
                  minWidth: '180px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 500
                }}
              >
                Quay lại
              </ActionButton>
              <ActionButton
                onClick={() => navigate('/orders')}
                icon={<FileTextOutlined />}
                style={{ 
                  minWidth: '180px'
                }}
              >
                Xem tất cả đơn hàng
              </ActionButton>
            </Space>
          }
        />
        <SummaryBanner>
          <div className="banner-content">
            <Title level={4} style={{ marginBottom: 8 }}>
              Bạn muốn tạo đơn hàng mới?
            </Title>
            <Text>
              Khám phá bộ sưu tập sản phẩm mới nhất dành cho thú cưng của bạn.
            </Text>
          </div>
          <div className="banner-actions">
            <Space>
              <AnimatedButton 
                type="primary" 
                icon={<ShoppingCartOutlined />}
                size="large"
                onClick={() => navigate('/products')}
              >
                Mua sắm ngay
              </AnimatedButton>
            </Space>
          </div>
        </SummaryBanner>
      </PageContainer>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <PageContainer>
      {/* Page Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space size={12}>
            <Title level={2} style={{ margin: 0 }}>
              Chi tiết đơn hàng <Text type="primary">#{order.orderId}</Text>
            </Title>
          </Space>
        </Col>
        <Col>
          <ActionButton 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
          >
            Quay lại
          </ActionButton>
        </Col>
      </Row>

      {/* Order Status Card - Simplified */}
      <HeaderCard borderColor={statusInfo.color} bgColor={statusInfo.bgColor}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Space size={16} align="start">
              <Avatar 
                size={64} 
                className="header-avatar" 
                style={{ 
                  backgroundColor: statusInfo.bgColor, 
                  color: statusInfo.color 
                }} 
                icon={statusInfo.icon} 
              />
              <div>
                <Text type="secondary">Trạng thái đơn hàng</Text>
                <div style={{ marginTop: 4 }}>
                  <Space>
                    <Title level={4} style={{ margin: 0 }}>
                      {statusInfo.text}
                    </Title>
                    <StatusTag color={statusInfo.status}>
                      {statusInfo.text}
                    </StatusTag>
                  </Space>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Space>
                    <CalendarOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary">
                      Đặt ngày: {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </Space>
                </div>
              </div>
            </Space>

            {/* Detailed Progress Bar - 7 Steps */}
            {order.status.toLowerCase() !== 'cancelled' && (
              <div style={{ marginTop: 24 }}>
                <Progress 
                  percent={statusInfo.step < 0 ? 0 : (statusInfo.step / 5) * 100} 
                  strokeColor={statusInfo.color}
                  showInfo={false}
                  style={{ marginBottom: 16 }}
                />
                <Row justify="space-between" style={{ fontSize: 10 }}>
                  <Col><Text type="secondary" style={{ fontSize: 10 }}>Chờ xử lý</Text></Col>
                  <Col><Text type="secondary" style={{ fontSize: 10 }}>Đang xử lý</Text></Col>
                  <Col><Text type="secondary" style={{ fontSize: 10 }}>Đã xác nhận</Text></Col>
                  <Col><Text type="secondary" style={{ fontSize: 10 }}>Đang giao</Text></Col>
                  <Col><Text type="secondary" style={{ fontSize: 10 }}>Đã giao</Text></Col>
                  <Col><Text type="secondary" style={{ fontSize: 10 }}>Hoàn thành</Text></Col>
                </Row>
              </div>
            )}
          </Col>
          <Col xs={24} md={8}>
            <Row justify="end">
              <Space direction="vertical" style={{ width: '100%' }}>
                {/* Admin controls - simplified */}
                {isAdmin && (
                  <Card 
                    size="small" 
                    title="Cập nhật trạng thái"
                    style={{ marginTop: 16 }}
                  >
                    <Space wrap>
                      {[
                        { value: 'DangXuLy', label: 'Đang xử lý' },
                        { value: 'DaXacNhan', label: 'Đã xác nhận' },
                        { value: 'DangGiaoHang', label: 'Đang giao hàng' },
                        { value: 'DaGiaoHang', label: 'Đã giao hàng' },
                        { value: 'HoanThanh', label: 'Hoàn thành' },
                        { value: 'DaHuy', label: 'Đã hủy' }
                      ].map((statusOption) => (
                        <Button
                          key={statusOption.value}
                          type={order.status === statusOption.value ? 'primary' : 'default'}
                          onClick={() => handleUpdateStatus(statusOption.value)}
                          disabled={order.status === statusOption.value || order.status === 'DaHuy'}
                          size="small"
                        >
                          {statusOption.label}
                        </Button>
                      ))}
                    </Space>
                  </Card>
                )}
              </Space>
            </Row>
          </Col>
        </Row>
      </HeaderCard>

      <ResponsiveRow gutter={24}>
        {/* Order Items Section */}
        <Col xs={24} lg={16}>
          <ProductCard
            title={
              <Space>
                <ShoppingOutlined style={{ color: '#1890ff' }} />
                <span>Sản phẩm đã đặt</span>
              </Space>
            }
          >
            <Table
              dataSource={order.orderItems}
              columns={columns}
              rowKey={(record) => record.orderItemId || record.productId}
              pagination={false}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <Text strong>Tổng tiền sản phẩm:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} />
                    <Table.Summary.Cell index={2} align="right">
                      <Text strong>{formatCurrency(order.subtotalAmount)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <Text>Phí vận chuyển:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} />
                    <Table.Summary.Cell index={2} align="right">
                      <Text>{formatCurrency(order.shippingFee || 0)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  {order.discount > 0 && (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <Text type="danger">Giảm giá:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} />
                      <Table.Summary.Cell index={2} align="right">
                        <Text type="danger">-{formatCurrency(order.discount)}</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                  <Table.Summary.Row>
                    <Table.Summary.Cell 
                      index={0} 
                      colSpan={2}
                      style={{ borderTop: '1px solid #f0f0f0' }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: 600 }}>Tổng thanh toán:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell 
                      index={1}
                      style={{ borderTop: '1px solid #f0f0f0' }}
                    />
                    <Table.Summary.Cell 
                      index={2} 
                      align="right"
                      style={{ borderTop: '1px solid #f0f0f0' }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: 600, color: '#f5222d' }}>
                        {formatCurrency(order.totalAmount)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </ProductCard>
        </Col>

        {/* Order Info Section - Simplified */}
        <Col xs={24} lg={8}>
          {/* Combined Payment & Delivery Info */}
          <InfoCard
            title={
              <Space>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                <span>Thông tin đơn hàng</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* Payment Info */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Thanh toán</Text>
                <Space direction="vertical" size="small">
                  <div>
                    <Text type="secondary">Phương thức: </Text>
                    <Text>{order.paymentMethod || 'Thanh toán khi nhận hàng'}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Trạng thái: </Text>
                    <Tag color={getPaymentStatusInfo(order.paymentStatus).color}>
                      {getPaymentStatusInfo(order.paymentStatus).text}
                    </Tag>
                  </div>
                </Space>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              {/* Delivery Info */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Giao hàng</Text>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">Người nhận: </Text>
                    <Text>{order.recipientName}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Số điện thoại: </Text>
                    <Text>{order.recipientPhone}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Địa chỉ: </Text>
                    <Text>{order.shippingAddress}</Text>
                  </div>
                  {order.note && (
                    <div>
                      <Text type="secondary">Ghi chú: </Text>
                      <Text italic>{order.note}</Text>
                    </div>
                  )}
                </Space>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              {/* Order Summary */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Tóm tắt</Text>
                <Row justify="space-between" style={{ marginBottom: 8 }}>
                  <Col><Text type="secondary">Số sản phẩm:</Text></Col>
                  <Col><Text>{order.orderItems?.length || 0}</Text></Col>
                </Row>
                <Row justify="space-between" style={{ marginBottom: 8 }}>
                  <Col><Text type="secondary">Ngày đặt:</Text></Col>
                  <Col><Text>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</Text></Col>
                </Row>
                <Row justify="space-between">
                  <Col><Text strong>Tổng tiền:</Text></Col>
                  <Col><Text strong style={{ color: '#f5222d' }}>{formatCurrency(order.totalAmount)}</Text></Col>
                </Row>
              </div>
            </Space>
          </InfoCard>

          {/* Detailed Order Status - 7 Steps */}
          <InfoCard
            title={
              <Space>
                <CalendarOutlined style={{ color: '#1890ff' }} />
                <span>Trạng thái đơn hàng</span>
              </Space>
            }
          >
            <Steps
              current={statusInfo.step === -1 ? 0 : statusInfo.step}
              status={statusInfo.step === -1 ? 'error' : 'process'}
              direction="vertical"
              size="small"
              style={{ width: '100%' }}
            >
              <Step
                title="Chờ xử lý"
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Đơn hàng đã được tạo - {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </Text>
                  </div>
                }
                icon={statusInfo.step >= 0 ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              />
              <Step
                title="Đang xử lý"
                description="Cửa hàng đang chuẩn bị đơn hàng của bạn"
                icon={statusInfo.step >= 1 ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              />
              <Step
                title="Đã xác nhận"
                description="Đơn hàng đã được xác nhận và chuẩn bị giao"
                icon={statusInfo.step >= 2 ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              />
              <Step
                title="Đang giao hàng"
                description="Đơn hàng đang trên đường đến với bạn"
                icon={statusInfo.step >= 3 ? <CarOutlined /> : <ClockCircleOutlined />}
              />
              <Step
                title="Đã giao hàng"
                description="Đơn hàng đã được giao đến địa chỉ"
                icon={statusInfo.step >= 4 ? <GiftOutlined /> : <ClockCircleOutlined />}
              />
              <Step
                title="Hoàn thành"
                description="Đơn hàng đã hoàn tất thành công"
                icon={statusInfo.step >= 5 ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              />
            </Steps>
            
            {/* Current Status Highlight */}
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              backgroundColor: statusInfo.bgColor,
              borderRadius: 8,
              border: `1px solid ${statusInfo.color}20`
            }}>
              <Space>
                {statusInfo.icon}
                <div>
                  <Text strong style={{ color: statusInfo.color }}>
                    Trạng thái hiện tại: {statusInfo.text}
                  </Text>
                  {statusInfo.step === -1 && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Đơn hàng đã bị hủy
                      </Text>
                    </div>
                  )}
                </div>
              </Space>
            </div>
          </InfoCard>
        </Col>
      </ResponsiveRow>

      {/* Order Review Section */}
      <OrderReviewSection 
        order={order} 
        onReviewUpdate={() => {
          // Optional: refresh order data if needed
          fetchOrderDetails();
        }}
      />

      {/* Simple Call to Action */}
      <Card
        style={{ 
          marginTop: 24, 
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          backgroundColor: '#f9fcff',
          textAlign: 'center'
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            Cảm ơn bạn đã mua sắm!
          </Title>
          <Text type="secondary">
            Cần hỗ trợ? Liên hệ với chúng tôi qua hotline: <Text strong>1900 1234</Text>
          </Text>
          <Space>
            <ActionButton 
              type="primary" 
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/products')}
            >
              Tiếp tục mua sắm
            </ActionButton>
            <ActionButton 
              icon={<FileTextOutlined />}
              onClick={() => navigate('/orders')}
            >
              Xem đơn hàng khác
            </ActionButton>
          </Space>
        </Space>
      </Card>
    </PageContainer>
  );
};

export default OrderDetailPage;