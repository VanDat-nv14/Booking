 import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import orderService from '../services/orderService';
import { getOrderStatusInfo, canCancelOrder, ORDER_STATUS } from '../utils/orderStatusUtils';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Alert,
  Tabs,
  Select,
  DatePicker,
  Row,
  Col,
  Card,
  Empty,
  Spin,
  Skeleton,
  Badge,
  Tooltip,
  Modal,
  Result,
  Divider,
  Statistic,
  message,
  Avatar
} from 'antd';
import {
  ShoppingOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  EditOutlined,
  FilterOutlined,
  CalendarOutlined,
  CarOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FireOutlined,
  UserOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  RightOutlined,
  EnvironmentOutlined,
  StarOutlined,
  TruckOutlined,
  GiftOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

// Enhanced animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); }
  50% { transform: scale(1.05); box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15); }
  100% { transform: scale(1); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(24, 144, 255, 0.3); }
  50% { box-shadow: 0 0 20px rgba(24, 144, 255, 0.6); }
  100% { box-shadow: 0 0 5px rgba(24, 144, 255, 0.3); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Luxury styled components with solid colors
const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  background: #f8faff;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(24, 144, 255, 0.02);
    z-index: -1;
  }
`;

const HeaderSection = styled(motion.div)`
  margin-bottom: 40px;
  text-align: center;
  position: relative;
`;

const HeaderGlow = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background-color: rgba(24, 144, 255, 0.05);
  border-radius: 50%;
  z-index: -1;
`;

const HeaderTitle = styled(Title)`
  margin-bottom: 10px !important;
  font-weight: 800 !important;
  color: #1a3d7c !important;
  letter-spacing: -0.5px !important;
  text-transform: uppercase !important;
  position: relative;
  display: inline-block !important;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background-color: #2a6ac8;
    border-radius: 3px;
  }
`;

const HeaderIcon = styled(motion.div)`
  font-size: 80px;
  color: #2a6ac8;
  margin: 0 auto 20px;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f0f7ff;
  box-shadow: 0 15px 35px rgba(24, 144, 255, 0.15);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: rgba(255, 255, 255, 0.8);
    transform: rotate(45deg);
    animation: ${shimmer} 3s infinite linear;
  }
  
  .anticon {
    font-size: 60px;
    color: #2a6ac8;
  }
`;

const HeaderSubtitle = styled(Text)`
  font-size: 18px !important;
  color: rgba(0, 0, 0, 0.65) !important;
  max-width: 600px;
  margin: 0 auto;
  display: block;
  font-weight: 400;
`;

const StatsCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  height: 100%;
  border-left: 5px solid ${props => props.$color || '#1890ff'};
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  .stats-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    background-color: ${props => `${props.$color}15` || '#1890ff15'};
    color: ${props => props.$color || '#1890ff'};
    font-size: 28px;
    margin-bottom: 20px;
    transition: all 0.3s ease;
  }
  
  &:hover .stats-icon {
    transform: scale(1.1) rotate(10deg);
    background-color: ${props => props.$color || '#1890ff'};
    color: white;
  }
  
  .stats-title {
    font-size: 16px;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .stats-value {
    font-size: 36px;
    font-weight: 800;
    color: #1f1f1f;
    margin-bottom: 5px;
    line-height: 1.2;
  }
  
  .stats-footer {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    font-weight: 500;
  }
  
  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 5px;
    background-color: ${props => props.$color || '#1890ff'};
    transition: width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
`;

const TabsContainer = styled(Card)`
  margin-bottom: 30px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: none;
  
  .ant-tabs-nav {
    margin-bottom: 0 !important;
    padding: 10px 10px 0;
  }
  
  .ant-tabs-tab {
    border-radius: 10px 10px 0 0 !important;
    padding: 12px 20px !important;
    margin: 0 8px 0 0 !important;
    transition: all 0.3s ease !important;
    background-color: #f5f7ff !important;
    border: none !important;
    
    &:hover {
      background-color: #e6f7ff !important;
    }
  }
  
  .ant-tabs-tab-active {
    background-color: white !important;
    
    .ant-tabs-tab-btn {
      color: #2a6ac8 !important;
      font-weight: 600 !important;
    }
  }
  
  .ant-tabs-tab-btn {
    font-size: 15px;
    display: flex;
    align-items: center;
    
    .anticon {
      margin-right: 8px;
      font-size: 16px;
    }
  }
  
  .ant-tabs-content-holder {
    background: white;
    padding: 20px;
  }
  
  .ant-tabs-ink-bar {
    background-color: #2a6ac8;
    height: 3px;
    border-radius: 3px;
  }
`;

const FilterSection = styled.div`
  padding: 20px;
  background-color: #f9faff;
  border-radius: 15px;
  margin-bottom: 20px;
`;

const LuxurySelect = styled(Select)`
  .ant-select-selector {
    height: 45px !important;
    border-radius: 12px !important;
    border: 2px solid transparent !important;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05) !important;
    padding: 0 20px !important;
  }
  
  .ant-select-selection-item {
    display: flex !important;
    align-items: center !important;
    line-height: 45px !important;
    
    .anticon {
      margin-right: 10px;
      font-size: 16px;
    }
  }
  
  &:hover .ant-select-selector,
  &.ant-select-focused .ant-select-selector {
    border-color: #2a6ac8 !important;
    box-shadow: 0 8px 20px rgba(42, 106, 200, 0.15) !important;
  }
`;

const LuxuryDatePicker = styled(RangePicker)`
  height: 45px !important;
  border-radius: 12px !important;
  border: 2px solid transparent !important;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05) !important;
  
  &:hover,
  &.ant-picker-focused {
    border-color: #2a6ac8 !important;
    box-shadow: 0 8px 20px rgba(42, 106, 200, 0.15) !important;
  }
  
  .ant-picker-input {
    height: 100%;
  }
`;

const FilterButton = styled(Button)`
  height: 45px !important;
  border-radius: 12px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  background-color: #2a6ac8 !important;
  border: none !important;
  box-shadow: 0 8px 20px rgba(42, 106, 200, 0.2) !important;
  
  &:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 12px 25px rgba(42, 106, 200, 0.3) !important;
    background-color: #1a3d7c !important;
  }
  
  &:active {
    transform: translateY(0) !important;
  }
`;

const TableCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  
  .ant-table {
    background: white;
  }
  
  .ant-table-thead > tr > th {
    background-color: #f5f7ff !important;
    font-weight: 600;
    padding: 16px 20px;
    
    &::before {
      display: none;
    }
  }
  
  .ant-table-tbody > tr > td {
    padding: 16px 20px;
    transition: all 0.3s;
  }
  
  .ant-table-tbody > tr:hover > td {
    background-color: rgba(230, 247, 255, 0.4);
  }
  
  .ant-table-pagination {
    margin: 16px 20px !important;
  }
`;

const OrderCode = styled.div`
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  color: #2a6ac8;
  background-color: rgba(42, 106, 200, 0.08);
  padding: 6px 10px;
  border-radius: 8px;
  display: inline-block;
  transition: all 0.3s;
  
  &:hover {
    background-color: rgba(42, 106, 200, 0.15);
    transform: translateY(-2px);
  }
`;

const CustomerInfo = styled.div`
  display: flex;
  align-items: center;
  
  .customer-avatar {
    margin-right: 10px;
    background-color: #2a6ac8;
    
    .anticon {
      color: white;
    }
  }
  
  .customer-name {
    font-weight: 500;
  }
`;

const OrderDate = styled.div`
  display: flex;
  align-items: center;
  
  .date-icon {
    margin-right: 10px;
    color: #2a6ac8;
    background-color: rgba(42, 106, 200, 0.08);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
  }
`;

const OrderAmount = styled.div`
  font-weight: 700;
  color: #2a6ac8;
  background-color: rgba(42, 106, 200, 0.08);
  padding: 6px 12px;
  border-radius: 8px;
  display: inline-block;
`;

const StatusBadge = styled(Tag)`
  border: none !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  padding: 6px 10px !important;
  border-radius: 8px !important;
  display: inline-flex !important;
  align-items: center !important;
  box-shadow: 0 3px 6px ${props => props.color ? `${props.color}20` : 'rgba(0, 0, 0, 0.1)'} !important;
  
  .anticon {
    margin-right: 6px;
    font-size: 14px;
  }
`;

const ActionButtons = styled(Space)`
  .action-btn {
    border-radius: 10px;
    height: 36px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
    font-weight: 600;
    display: flex;
    align-items: center;
    
    &:hover {
      transform: translateY(-3px);
    }
    
    .anticon {
      font-size: 16px;
    }
  }
  
  .view-btn {
    background-color: #2a6ac8;
    color: white;
    
    &:hover {
      box-shadow: 0 8px 15px rgba(42, 106, 200, 0.25);
      background-color: #1a3d7c;
    }
  }
  
  .cancel-btn {
    background-color: #ef473a;
    color: white;
    
    &:hover {
      box-shadow: 0 8px 15px rgba(239, 71, 58, 0.25);
      background-color: #cb2b3e;
    }
  }
  
  .edit-btn {
    background-color: #ED8F03;
    color: white;
    
    &:hover {
      box-shadow: 0 8px 15px rgba(237, 143, 3, 0.25);
      background-color: #FFB75E;
    }
  }
`;

const EmptyStateCard = styled(Card)`
  text-align: center;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: none;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(24, 144, 255, 0.02);
    z-index: 0;
  }
  
  .empty-icon {
    font-size: 100px;
    color: #d9d9d9;
    margin-bottom: 20px;
    animation: ${float} 4s ease-in-out infinite;
  }
  
  .empty-text {
    margin-bottom: 30px;
    position: relative;
    z-index: 1;
  }
  
  .empty-title {
    color: #1f1f1f;
    margin-bottom: 10px !important;
  }
  
  .empty-description {
    color: rgba(0, 0, 0, 0.45);
    max-width: 500px;
    margin: 0 auto;
  }
  
  .shop-btn {
    height: 48px;
    border-radius: 12px;
    padding: 0 30px;
    font-size: 16px;
    font-weight: 600;
    background-color: #2a6ac8;
    border: none;
    box-shadow: 0 10px 20px rgba(42, 106, 200, 0.2);
    position: relative;
    overflow: hidden;
    z-index: 1;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(42, 106, 200, 0.3);
      background-color: #1a3d7c;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.2);
      transition: 0.5s;
      z-index: -1;
    }
    
    &:hover::before {
      left: 100%;
    }
    
    .anticon {
      margin-right: 8px;
      font-size: 18px;
    }
  }
`;

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    processing: 0,
    completed: 0,
    cancelled: 0
  });
  const { currentUser } = useContext(AuthContext);
  const isAdmin = currentUser?.role === 'Admin';

  // State for tabs and filters
  const [tabKey, setTabKey] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let ordersData;

        if (isAdmin) {
          // Admin - fetch based on tab
          switch (tabKey) {
            case 'status':
              if (statusFilter) {
                ordersData = await orderService.getOrdersByStatus(statusFilter);
              } else {
                ordersData = await orderService.getAllOrders();
              }
              break;
            case 'date':
              if (dateRange && dateRange[0] && dateRange[1]) {
                ordersData = await orderService.getOrdersByDateRange(dateRange[0].toDate(), dateRange[1].toDate());
              } else {
                ordersData = await orderService.getAllOrders();
              }
              break;
            default:
              ordersData = await orderService.getAllOrders();
          }
        } else {
          // Regular user - only their orders
          ordersData = await orderService.getUserOrders();
        }
        
        setOrders(ordersData);
        
        // Calculate statistics
        if (ordersData.length > 0) {
          const stats = {
            total: ordersData.length,
            processing: ordersData.filter(o => 
              [ORDER_STATUS.CHO_XU_LY, ORDER_STATUS.DANG_XU_LY, ORDER_STATUS.DA_XAC_NHAN, ORDER_STATUS.DANG_GIAO_HANG].includes(
                o.status || ORDER_STATUS.CHO_XU_LY
              )
            ).length,
            completed: ordersData.filter(o => 
              [ORDER_STATUS.DA_GIAO_HANG, ORDER_STATUS.HOAN_THANH].includes(
                o.status || ORDER_STATUS.CHO_XU_LY
              )
            ).length,
            cancelled: ordersData.filter(o => o.status === ORDER_STATUS.DA_HUY).length
          };
          setOrderStats(stats);
        }
        
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [tabKey, statusFilter, dateRange, isAdmin]);

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
        icon = <InfoCircleOutlined />;
    }
    
    return { 
      color: statusInfo.color,
      label: statusInfo.text,
      icon: icon
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const handleCancelOrder = (orderId) => {
    confirm({
      title: 'Xác nhận hủy đơn hàng',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.',
      okText: 'Xác nhận hủy',
      okType: 'danger',
      cancelText: 'Giữ lại',
      async onOk() {
        try {
          await orderService.cancelOrder(orderId);
          // Cập nhật danh sách đơn hàng sau khi hủy
          setOrders(orders.map(order => 
            order.orderId === orderId 
              ? { ...order, status: 'Cancelled' } 
              : order
          ));
          message.success('Đơn hàng đã được hủy thành công');
        } catch (err) {
          setError('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
          message.error('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
          console.error('Error cancelling order:', err);
        }
      }
    });
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text) => <OrderCode>#{text}</OrderCode>,
    },
    ...(isAdmin ? [{
      title: 'Khách hàng',
      dataIndex: 'userName',
      key: 'userName',
      render: (text) => (
        <CustomerInfo>
          <Avatar size={32} icon={<UserOutlined />} className="customer-avatar" />
          <span className="customer-name">{text || 'Không có tên'}</span>
        </CustomerInfo>
      ),
    }] : []),
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (text) => (
        <OrderDate>
          <span className="date-icon"><CalendarOutlined /></span>
          {new Date(text).toLocaleDateString('vi-VN')}
        </OrderDate>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <OrderAmount>{formatCurrency(amount)}</OrderAmount>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusInfo = getStatusTag(status);
        return (
          <StatusBadge 
            color={statusInfo.color}
            icon={statusInfo.icon}
          >
            {statusInfo.label}
          </StatusBadge>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <ActionButtons size="small">
          <Button
            className="action-btn view-btn"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/orders/${record.orderId}`)}
          >
            Chi tiết
          </Button>
          
          {isAdmin && canCancelOrder(record.status) && (
            <Button
              className="action-btn edit-btn"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/orders/${record.orderId}/edit`)}
            >
              Cập nhật
            </Button>
          )}
        </ActionButtons>
      ),
    },
  ];

  const renderStatsCards = () => {
    if (!isAdmin) return null;
    
    const statsData = [
      {
        title: 'Tổng đơn hàng',
        value: orderStats.total,
        icon: <ShoppingOutlined />,
        color: '#2a6ac8',
        percent: 100
      },
      {
        title: 'Đang xử lý',
        value: orderStats.processing,
        icon: <ClockCircleOutlined />,
        color: '#faad14',
        percent: (orderStats.processing / orderStats.total) * 100 || 0
      },
      {
        title: 'Hoàn thành',
        value: orderStats.completed,
        icon: <CheckCircleOutlined />,
        color: '#52c41a',
        percent: (orderStats.completed / orderStats.total) * 100 || 0
      },
      {
        title: 'Đã hủy',
        value: orderStats.cancelled,
        icon: <CloseCircleOutlined />,
        color: '#f5222d',
        percent: (orderStats.cancelled / orderStats.total) * 100 || 0
      }
    ];
    
    return (
      <Row gutter={[24, 24]} style={{ marginBottom: 30 }}>
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <StatsCard $color={stat.color}>
                <div className="stats-icon">
                  {stat.icon}
                </div>
                <div className="stats-title">{stat.title}</div>
                <div className="stats-value">{stat.value}</div>
                <div className="stats-footer">
                  {stat.percent.toFixed(0)}% trong tổng số
                </div>
                <div className="progress-bar" style={{ width: `${stat.percent}%` }}></div>
              </StatsCard>
            </motion.div>
          </Col>
        ))}
      </Row>
    );
  };

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <EmptyStateCard>
        <ShoppingCartOutlined className="empty-icon" />
        
        <div className="empty-text">
          <Title level={3} className="empty-title">Bạn chưa có đơn hàng nào</Title>
          <Text className="empty-description">
            Khám phá các sản phẩm và dịch vụ của chúng tôi để bắt đầu mua sắm. Chúng tôi có nhiều lựa chọn tuyệt vời đang chờ bạn!
          </Text>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            className="shop-btn"
            icon={<ShoppingOutlined />}
            onClick={() => navigate('/products')}
          >
            Mua sắm ngay
          </Button>
        </motion.div>
      </EmptyStateCard>
    </motion.div>
  );
  
  const renderFilterTabs = () => {
    if (!isAdmin) return null;
    
    return (
      <TabsContainer>
        <Tabs 
          activeKey={tabKey} 
          onChange={setTabKey}
          type="card"
        >
          <TabPane 
            tab={<><AppstoreOutlined />Tất cả đơn hàng</>}
            key="all"
          />
          <TabPane 
            tab={<><FilterOutlined />Lọc theo trạng thái</>}
            key="status"
          >
            <FilterSection>
              <Row gutter={16} align="middle">
                <Col xs={24} md={18} lg={20}>
                  <LuxurySelect
                    placeholder="Chọn trạng thái đơn hàng"
                    style={{ width: '100%' }}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    allowClear
                  >
                    <Select.Option value="">Tất cả trạng thái</Select.Option>
                    <Select.Option value={ORDER_STATUS.CHO_XU_LY}>
                      <ClockCircleOutlined style={{ color: '#faad14' }} /> Chờ xử lý
                    </Select.Option>
                    <Select.Option value={ORDER_STATUS.DANG_XU_LY}>
                      <ExclamationCircleOutlined style={{ color: '#1890ff' }} /> Đang xử lý
                    </Select.Option>
                    <Select.Option value={ORDER_STATUS.DA_XAC_NHAN}>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> Đã xác nhận
                    </Select.Option>
                    <Select.Option value={ORDER_STATUS.DANG_GIAO_HANG}>
                      <TruckOutlined style={{ color: '#722ed1' }} /> Đang giao hàng
                    </Select.Option>
                    <Select.Option value={ORDER_STATUS.DA_GIAO_HANG}>
                      <GiftOutlined style={{ color: '#52c41a' }} /> Đã giao hàng
                    </Select.Option>
                    <Select.Option value={ORDER_STATUS.HOAN_THANH}>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> Hoàn thành
                    </Select.Option>
                    <Select.Option value={ORDER_STATUS.DA_HUY}>
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Đã hủy
                    </Select.Option>
                  </LuxurySelect>
                </Col>
                <Col xs={24} md={6} lg={4} style={{ textAlign: 'right' }}>
                  <Text type="secondary">
                    {statusFilter ? 'Đã lọc' : 'Hiển thị tất cả'}
                  </Text>
                </Col>
              </Row>
            </FilterSection>
          </TabPane>
          <TabPane 
            tab={<><CalendarOutlined />Lọc theo ngày</>}
            key="date"
          >
            <FilterSection>
              <Row gutter={16} align="middle">
                <Col xs={24} md={18}>
                  <LuxuryDatePicker 
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder={['Từ ngày', 'Đến ngày']}
                    onChange={setDateRange}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <FilterButton 
                    type="primary" 
                    icon={<SearchOutlined />}
                    disabled={!dateRange}
                    block
                  >
                    Lọc kết quả
                  </FilterButton>
                </Col>
              </Row>
            </FilterSection>
          </TabPane>
        </Tabs>
      </TabsContainer>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <HeaderSection>
          <Skeleton.Avatar active size={120} shape="circle" />
          <Skeleton active paragraph={{ rows: 1 }} />
        </HeaderSection>
        
        {isAdmin && (
          <Row gutter={[24, 24]} style={{ marginBottom: 30 }}>
            {[1, 2, 3, 4].map(i => (
              <Col xs={24} sm={12} md={6} key={i}>
                <Card style={{ borderRadius: 20 }}>
                  <Skeleton active paragraph={{ rows: 1 }} />
                </Card>
              </Col>
            ))}
          </Row>
        )}
        
        <Card style={{ borderRadius: 20 }}>
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeaderGlow />
        <HeaderIcon
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1
          }}
          whileHover={{ 
            rotate: [0, -10, 10, -10, 0],
            transition: { duration: 0.5 }
          }}
        >
          <Badge count={orders.length} overflowCount={99}>
            <ShoppingOutlined />
          </Badge>
        </HeaderIcon>
        
        <HeaderTitle level={2}>
          {isAdmin ? 'Quản lý đơn hàng' : 'Đơn hàng của tôi'}
        </HeaderTitle>
        
        <HeaderSubtitle>
          {isAdmin 
            ? 'Xem và quản lý tất cả đơn hàng trên hệ thống. Dễ dàng theo dõi trạng thái và cập nhật thông tin đơn hàng.' 
            : 'Xem và theo dõi các đơn hàng của bạn. Kiểm tra trạng thái và lịch sử mua sắm một cách dễ dàng.'}
        </HeaderSubtitle>
      </HeaderSection>
      
      {error && (
        <Alert
          message="Có lỗi xảy ra"
          description={error}
          type="error"
          showIcon
          closable
          style={{ 
            marginBottom: 24, 
            borderRadius: 16,
            border: 'none',
            boxShadow: '0 10px 30px rgba(255, 77, 79, 0.1)'
          }}
        />
      )}
      
      {renderStatsCards()}
      
      {renderFilterTabs()}
      
      {!error && orders.length === 0 ? (
        renderEmptyState()
      ) : (
        <TableCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Table 
            columns={columns} 
            dataSource={orders} 
            rowKey="orderId"
            pagination={{ 
              pageSize: 8,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
              showSizeChanger: true,
              pageSizeOptions: ['8', '16', '24'],
              style: { marginBottom: 0 }
            }}
            components={{
              body: {
                row: (props) => (
                  <motion.tr
                    {...props}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )
              }
            }}
          />
        </TableCard>
      )}
    </PageContainer>
  );
};

export default OrdersPage;