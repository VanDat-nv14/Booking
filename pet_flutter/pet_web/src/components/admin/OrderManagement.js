import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Select,
  DatePicker,
  Input,
  Modal,
  Form,
  Row,
  Col,
  Statistic,
  Divider,
  message,
  Tooltip,
  Badge,
  Typography,
  Dropdown,
  Popconfirm,
  Drawer,
  Descriptions,
  Timeline,
  Steps,
  Alert,
  Spin
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExportOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TruckOutlined,
  GiftOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  PrinterOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  TagOutlined,
  UserOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import orderService from '../../services/orderService';
import useAuth from '../../hooks/useAuth';
import { getOrderStatusInfo, getAdminStatusOptions, canCancelOrder, ORDER_STATUS } from '../../utils/orderStatusUtils';
import './OrderManagement.css';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;
const { Step } = Steps;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [form] = Form.useForm();
  const { user } = useAuth();

  // Sử dụng định nghĩa trạng thái đơn hàng từ utils
  const getStatusIcon = (status) => {
    const statusInfo = getOrderStatusInfo(status);
    switch (statusInfo.text) {
      case 'Chờ xử lý':
        return <ClockCircleOutlined />;
      case 'Đang xử lý':
        return <ExclamationCircleOutlined />;
      case 'Đã xác nhận':
        return <CheckCircleOutlined />;
      case 'Đang giao hàng':
        return <TruckOutlined />;
      case 'Đã giao hàng':
        return <GiftOutlined />;
      case 'Hoàn thành':
        return <CheckCircleOutlined />;
      case 'Đã hủy':
        return <CloseCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  // Định nghĩa trạng thái thanh toán
  const paymentStatuses = {
    'ChoThanhToan': { label: 'Chờ thanh toán', color: 'orange' },
    'DaThanhToan': { label: 'Đã thanh toán', color: 'green' },
    'DaHuy': { label: 'Đã hủy', color: 'red' }
  };

  // Phương thức thanh toán
  const paymentMethods = {
    'COD': { label: 'Thanh toán khi nhận hàng', icon: '💰' },
    'VNPAY': { label: 'VNPay', icon: '💳' },
    'MOMO': { label: 'Momo', icon: '📱' },
    'Banking': { label: 'Chuyển khoản ngân hàng', icon: '🏦' }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateRange]);

  useEffect(() => {
    calculateStatistics();
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let ordersData = [];

      if (statusFilter !== 'all' && statusFilter) {
        ordersData = await orderService.getOrdersByStatus(statusFilter);
      } else if (dateRange.length === 2) {
        ordersData = await orderService.getOrdersByDateRange(
          dateRange[0].toDate(),
          dateRange[1].toDate()
        );
      } else {
        ordersData = await orderService.getAllOrders();
      }

      setOrders(ordersData);
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = () => {
    if (!orders.length) return;

    const stats = {
      total: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      pending: orders.filter(o => o.status === ORDER_STATUS.CHO_XU_LY).length,
      processing: orders.filter(o => o.status === ORDER_STATUS.DANG_XU_LY).length,
      confirmed: orders.filter(o => o.status === ORDER_STATUS.DA_XAC_NHAN).length,
      shipping: orders.filter(o => o.status === ORDER_STATUS.DANG_GIAO_HANG).length,
      delivered: orders.filter(o => o.status === ORDER_STATUS.DA_GIAO_HANG).length,
      completed: orders.filter(o => o.status === ORDER_STATUS.HOAN_THANH).length,
      cancelled: orders.filter(o => o.status === ORDER_STATUS.DA_HUY).length
    };

    setStatistics(stats);
  };

  const handleViewOrder = async (orderId) => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderById(orderId);
      setSelectedOrder(orderData);
      setDetailVisible(true);
    } catch (error) {
      message.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    form.setFieldsValue({
      status: order.status,
      shippingAddress: order.shippingAddress,
      notes: order.notes
    });
    setEditVisible(true);
  };

  const handleUpdateOrder = async (values) => {
    try {
      setLoading(true);
      await orderService.updateOrderStatus(selectedOrder.orderId, values.status);
      message.success('Cập nhật đơn hàng thành công');
      setEditVisible(false);
      fetchOrders();
    } catch (error) {
      message.error('Không thể cập nhật đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      await orderService.cancelOrder(orderId);
      message.success('Hủy đơn hàng thành công');
      fetchOrders();
    } catch (error) {
      message.error('Không thể hủy đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    return getOrderStatusInfo(status).step;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = searchText === '' || 
        order.orderId.toString().includes(searchText) ||
        order.userName.toLowerCase().includes(searchText.toLowerCase()) ||
        order.shippingAddress.toLowerCase().includes(searchText.toLowerCase());
      
      return matchesSearch;
    });
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 80,
      render: (id) => (
        <Text strong style={{ color: '#1890ff' }}>
          #{id}
        </Text>
      )
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userName',
      key: 'userName',
      render: (name, record) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            ID: {record.userId}
          </Text>
        </div>
      )
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => (
        <div>
          <CalendarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          {formatDate(date)}
        </div>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
          {formatCurrency(amount)}
        </Text>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount
    },
    {
      title: 'Trạng thái đơn hàng',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusInfo = getOrderStatusInfo(status);
        const icon = getStatusIcon(status);
        return (
          <Tag 
            color={statusInfo.antdStatus}
            icon={icon}
            style={{ fontSize: 12, padding: '4px 8px', fontWeight: 500 }}
          >
            {statusInfo.text}
          </Tag>
        );
      }
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status, record) => (
        <div>
          <Tag color={paymentStatuses[status]?.color || 'default'}>
            {paymentStatuses[status]?.label || status}
          </Tag>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {paymentMethods[record.paymentMethod]?.icon} {paymentMethods[record.paymentMethod]?.label || record.paymentMethod}
          </Text>
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => {
        const actionItems = [
          {
            key: 'view',
            label: 'Xem chi tiết',
            icon: <EyeOutlined />,
            onClick: () => handleViewOrder(record.orderId)
          },
          {
            key: 'edit',
            label: 'Cập nhật trạng thái',
            icon: <EditOutlined />,
            onClick: () => handleEditOrder(record)
          }
        ];

        if (canCancelOrder(record.status)) {
          actionItems.push({
            key: 'cancel',
            label: 'Hủy đơn hàng',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleCancelOrder(record.orderId)
          });
        }

        return (
          <Dropdown
            menu={{
              items: actionItems
            }}
            trigger={['click']}
            placement="bottomLeft"
          >
            <Button 
              type="text" 
              icon={<MoreOutlined />}
              style={{ 
                border: '1px solid #d9d9d9',
                borderRadius: 6
              }}
            />
          </Dropdown>
        );
      }
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          <ShoppingCartOutlined style={{ marginRight: 12 }} />
          Quản lý đơn hàng
        </Title>
        <Text type="secondary">Quản lý và theo dõi tất cả đơn hàng trong hệ thống</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={statistics.total || 0}
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={statistics.totalRevenue || 0}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Chờ xử lý"
              value={statistics.pending || 0}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={statistics.completed || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Trạng thái"
              size="large"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">Tất cả</Option>
              {getAdminStatusOptions().map(option => (
                <Option key={option.value} value={option.value}>
                  {getStatusIcon(option.value)} {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              size="large"
              style={{ width: '100%' }}
              placeholder={['Từ ngày', 'Đến ngày']}
              value={dateRange}
              onChange={setDateRange}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />}
                size="large"
                onClick={fetchOrders}
                loading={loading}
              >
                Tải lại
              </Button>
              <Button 
                icon={<ExportOutlined />}
                size="large"
              >
                Xuất Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={getFilteredOrders()}
          rowKey="orderId"
          loading={loading}
          pagination={{
            total: getFilteredOrders().length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} đơn hàng`
          }}
          scroll={{ x: 1200 }}
          rowClassName={(record, index) => 
            index % 2 === 0 ? 'even-row' : 'odd-row'
          }
        />
      </Card>

      {/* Order Detail Modal */}
      <Drawer
        title={
          <div>
            <ShoppingCartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Chi tiết đơn hàng #{selectedOrder?.orderId}
          </div>
        }
        width={720}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        extra={
          <Space>
            <Button 
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
            >
              In hóa đơn
            </Button>
            <Button 
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setDetailVisible(false);
                handleEditOrder(selectedOrder);
              }}
            >
              Cập nhật
            </Button>
          </Space>
        }
      >
        {selectedOrder && (
          <div>
            {/* Order Progress */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Title level={5}>Tiến trình đơn hàng</Title>
              <Steps
                current={getStatusStep(selectedOrder.status)}
                size="small"
                items={[
                  { title: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
                  { title: 'Đang xử lý', icon: <ExclamationCircleOutlined /> },
                  { title: 'Đã xác nhận', icon: <CheckCircleOutlined /> },
                  { title: 'Đang giao hàng', icon: <TruckOutlined /> },
                  { title: 'Đã giao hàng', icon: <GiftOutlined /> },
                  { title: 'Hoàn thành', icon: <CheckCircleOutlined /> }
                ]}
              />
            </Card>

            {/* Customer Info */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Title level={5}>
                <UserOutlined style={{ marginRight: 8 }} />
                Thông tin khách hàng
              </Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Tên khách hàng">
                  {selectedOrder.userName}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ giao hàng">
                  <HomeOutlined style={{ marginRight: 8 }} />
                  {selectedOrder.shippingAddress}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Order Info */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Title level={5}>
                <TagOutlined style={{ marginRight: 8 }} />
                Thông tin đơn hàng
              </Title>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Mã đơn hàng">
                  #{selectedOrder.orderId}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">
                  {formatDate(selectedOrder.orderDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getOrderStatusInfo(selectedOrder.status).antdStatus} icon={getStatusIcon(selectedOrder.status)}>
                    {getOrderStatusInfo(selectedOrder.status).text}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Thanh toán">
                  <Tag color={paymentStatuses[selectedOrder.paymentStatus]?.color}>
                    {paymentStatuses[selectedOrder.paymentStatus]?.label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức thanh toán" span={2}>
                  {paymentMethods[selectedOrder.paymentMethod]?.icon} {paymentMethods[selectedOrder.paymentMethod]?.label}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Order Items */}
            <Card size="small">
              <Title level={5}>Sản phẩm đã đặt</Title>
              <Table
                size="small"
                dataSource={selectedOrder.orderItems}
                rowKey="orderItemId"
                pagination={false}
                columns={[
                  {
                    title: 'Sản phẩm',
                    dataIndex: 'productName',
                    key: 'productName',
                    render: (name, record) => (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {record.productImage && (
                          <img 
                            src={`${process.env.REACT_APP_API_URL}/wwwroot/uploads/products/${record.productImage}`}
                            alt={name}
                            style={{ 
                              width: 40, 
                              height: 40, 
                              objectFit: 'cover',
                              borderRadius: 4,
                              marginRight: 12
                            }}
                          />
                        )}
                        <div>
                          <Text strong>{name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            ID: {record.productId}
                          </Text>
                        </div>
                      </div>
                    )
                  },
                  {
                    title: 'Đơn giá',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => formatCurrency(price)
                  },
                  {
                    title: 'Số lượng',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    align: 'center'
                  },
                  {
                    title: 'Thành tiền',
                    dataIndex: 'subtotal',
                    key: 'subtotal',
                    render: (subtotal) => (
                      <Text strong>{formatCurrency(subtotal)}</Text>
                    )
                  }
                ]}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3}>
                      <Text strong>Tổng cộng:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
                        {formatCurrency(selectedOrder.totalAmount)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </Card>
          </div>
        )}
      </Drawer>

      {/* Edit Order Modal */}
      <Modal
        title={
          <div>
            <EditOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Cập nhật đơn hàng #{selectedOrder?.orderId}
          </div>
        }
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateOrder}
        >
          <Alert
            message="Lưu ý"
            description="Việc thay đổi trạng thái đơn hàng sẽ ảnh hưởng đến quy trình xử lý và giao hàng."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form.Item
            name="status"
            label="Trạng thái đơn hàng"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select size="large" placeholder="Chọn trạng thái">
              {getAdminStatusOptions().map(option => (
                <Option key={option.value} value={option.value}>
                  {getStatusIcon(option.value)} {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                icon={<CheckCircleOutlined />}
              >
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        .even-row {
          background-color: #fafafa;
        }
        .odd-row {
          background-color: #ffffff;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </div>
  );
};

export default OrderManagement; 
