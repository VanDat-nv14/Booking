import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layout, 
  Typography, 
  Card, 
  Button, 
  Divider, 
  Tag, 
  Row, 
  Col, 
  Spin, 
  Alert, 
  Modal, 
  Space, 
  Form, 
  Input, 
  Select,
  Avatar,
  Descriptions,
  Tooltip,
  Badge,
  message
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  SkinOutlined, 
  UserOutlined, 
  EditOutlined, 
  CloseCircleOutlined, 
  CheckCircleOutlined, 
  ScheduleOutlined, 
  DollarOutlined, 
  ExclamationCircleOutlined, 
  FileTextOutlined, 
  InfoCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  LikeOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import styled, { keyframes } from 'styled-components';
import appointmentService from '../../services/appointmentService';
import useAuth from '../../hooks/useAuth';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

// Thêm animations và styled components
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(24, 144, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(24, 144, 255, 0.5); }
  50% { box-shadow: 0 0 20px rgba(24, 144, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(24, 144, 255, 0.5); }
`;

const shine = keyframes`
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

const StyledCard = styled(Card)`
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }
`;

const AnimatedTitle = styled(Title)`
  background: linear-gradient(to right, #1890ff, #52c41a, #1890ff);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: ${shine} 5s linear infinite;
`;

const FloatingIcon = styled.div`
  animation: ${float} 3s ease-in-out infinite;
  display: inline-flex;
  margin-right: 16px;
`;

const PulsingTag = styled(Tag)`
  &:hover {
    animation: ${pulse} 1.5s infinite;
  }
`;

const StatusIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  animation: ${glow} 2s infinite;
  background-color: ${props => props.color};
  color: white;
  font-size: 32px;
`;

const AnimatedButton = styled(Button)`
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  
  .anticon {
    margin-right: 8px;
    color: #1890ff;
  }
`;

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  });
  const [message, setMessage] = useState(location.state?.message || null);
  
  const fetchAppointment = useCallback(async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentById(id);
      setAppointment(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointment details:', err);
      setError(typeof err === 'string' ? err : 'Không thể tải thông tin lịch hẹn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);
  
  const handleOpenCancelDialog = () => {
    setOpenCancelDialog(true);
  };
  
  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };
  
  const handleCancelAppointment = async () => {
    try {
      await appointmentService.cancelAppointment(appointment.appointmentId);
      setMessage('Hủy lịch hẹn thành công');
      handleCloseCancelDialog();
      fetchAppointment();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError(typeof err === 'string' ? err : 'Không thể hủy lịch hẹn. Vui lòng thử lại sau.');
      handleCloseCancelDialog();
    }
  };
  
  const handleOpenStatusDialog = () => {
    setStatusUpdate({
      status: appointment.status,
      notes: appointment.notes || ''
    });
    setOpenStatusDialog(true);
  };
  
  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
  };
  
  const handleStatusChange = (event) => {
    setStatusUpdate({
      ...statusUpdate,
      status: event.target.value
    });
  };
  
  const handleNotesChange = (event) => {
    setStatusUpdate({
      ...statusUpdate,
      notes: event.target.value
    });
  };
  
  const handleStatusUpdate = async () => {
    try {
      await appointmentService.updateAppointmentStatus(
        appointment.appointmentId, 
        statusUpdate
      );
      setMessage('Cập nhật trạng thái lịch hẹn thành công');
      handleCloseStatusDialog();
      fetchAppointment();
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError(typeof err === 'string' ? err : 'Không thể cập nhật trạng thái lịch hẹn. Vui lòng thử lại sau.');
      handleCloseStatusDialog();
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return '#1890ff'; // blue
      case 'Confirmed':
        return '#2f54eb'; // geekblue
      case 'Completed':
        return '#52c41a'; // success
      case 'Cancelled':
        return '#f5222d'; // error
      case 'No-Show':
        return '#fa8c16'; // warning
      default:
        return '#d9d9d9'; // default
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return '#e6f7ff'; // blue light
      case 'Confirmed':
        return '#f0f5ff'; // geekblue light
      case 'Completed':
        return '#f6ffed'; // success light
      case 'Cancelled':
        return '#fff1f0'; // error light
      case 'No-Show':
        return '#fff7e6'; // warning light
      default:
        return '#fafafa'; // default light
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'Đã đặt lịch';
      case 'Confirmed':
        return 'Đã xác nhận';
      case 'Completed':
        return 'Đã hoàn thành';
      case 'Cancelled':
        return 'Đã hủy';
      case 'No-Show':
        return 'Không đến';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Scheduled':
        return <ScheduleOutlined />;
      case 'Confirmed':
        return <CheckCircleOutlined />;
      case 'Completed':
        return <CheckCircleOutlined />;
      case 'Cancelled':
        return <CloseCircleOutlined />;
      case 'No-Show':
        return <WarningOutlined />;
      default:
        return <ScheduleOutlined />;
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Không có thông tin';
    try {
      return format(new Date(dateString), 'HH:mm - dd/MM/yyyy', { locale: vi });
    } catch (e) {
      return 'Ngày không hợp lệ';
    }
  };
  
  // Check if user is admin or staff
  const isAdminOrStaff = user && (user.role === 'Admin' || user.role === 'Staff');
  
  // Check if appointment is in a state that can be modified
  const canModify = appointment && 
    (appointment.status === 'Scheduled' || appointment.status === 'Confirmed');
  
  // Check if user is the owner of this appointment
  const isOwner = appointment && user && appointment.userId === user.id;
  
  // Check if staff is assigned to this appointment
  const isAssignedStaff = appointment && user && 
    appointment.staffId && user.staffId === appointment.staffId;
  
  // Cập nhật component render
  // Thay thế phần loading
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  // Thay thế phần error
  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ maxWidth: 800, margin: '24px auto' }}
      />
    );
  }

  // Thay thế phần not found
  if (!appointment) {
    return (
      <Alert
        message="Không tìm thấy thông tin"
        description="Không tìm thấy thông tin lịch hẹn yêu cầu."
        type="info"
        showIcon
        style={{ maxWidth: 800, margin: '24px auto' }}
      />
    );
  }

  // Thay thế phần return component chính
  return (
    <Content style={{ padding: '24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {message && (
          <Alert
            message="Thành công"
            description={message}
            type="success"
            showIcon
            closable
            onClose={() => setMessage(null)}
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FloatingIcon>
              <Avatar 
                icon={<CalendarOutlined />} 
                size={48}
                style={{ 
                  backgroundColor: '#e6f7ff', 
                  color: '#1890ff',
                }}
              />
            </FloatingIcon>
            <div>
              <AnimatedTitle level={4} style={{ margin: 0, fontWeight: 600 }}>
                Chi tiết lịch hẹn
              </AnimatedTitle>
              <Text type="secondary">Xem và quản lý thông tin chi tiết lịch hẹn</Text>
            </div>
          </div>
          
          <PulsingTag 
            icon={getStatusIcon(appointment.status)} 
            color={getStatusColor(appointment.status)}
            style={{ 
              padding: '6px 12px', 
              fontSize: '14px',
              fontWeight: 'bold',
              borderRadius: 16
            }}
          >
            {getStatusText(appointment.status)}
          </PulsingTag>
        </div>
        
        <Row gutter={[24, 24]}>
          {/* Main Content - Appointment Details */}
          <Col xs={24} lg={16}>
            <StyledCard>
              <div 
                style={{ 
                  padding: '16px 24px',
                  marginTop: -24,
                  marginLeft: -24,
                  marginRight: -24,
                  marginBottom: 24,
                  background: '#1890ff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <CalendarOutlined style={{ marginRight: 8, fontSize: 18 }} />
                <Title level={4} style={{ margin: 0, color: 'white' }}>
                  Thông tin lịch hẹn
                </Title>
              </div>
              
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12}>
                  <InfoItem>
                    <CalendarOutlined />
                    <div>
                      <Text type="secondary">Ngày & Giờ hẹn</Text>
                      <div>
                        <Text strong>{formatDate(appointment.appointmentDate)}</Text>
                      </div>
                    </div>
                  </InfoItem>
                </Col>
                
                <Col xs={24} sm={12}>
                  <InfoItem>
                    <ClockCircleOutlined />
                    <div>
                      <Text type="secondary">Thời gian kết thúc (dự kiến)</Text>
                      <div>
                        <Text strong>{appointment.endTime ? formatDate(appointment.endTime) : 'Không xác định'}</Text>
                      </div>
                    </div>
                  </InfoItem>
                </Col>
                
                <Col xs={24} sm={12}>
                  <InfoItem>
                    <SkinOutlined />
                    <div>
                      <Text type="secondary">Dịch vụ</Text>
                      <div>
                        <Text strong>{appointment.serviceName || 'Không có thông tin'}</Text>
                      </div>
                    </div>
                  </InfoItem>
                </Col>
                
                <Col xs={24} sm={12}>
                  <InfoItem>
                    <DollarOutlined />
                    <div>
                      <Text type="secondary">Giá dịch vụ</Text>
                      <div>
                        <Text strong>{(appointment.servicePrice || 0).toLocaleString('vi-VN')} VNĐ</Text>
                      </div>
                    </div>
                  </InfoItem>
                </Col>
                
                <Col xs={24} sm={12}>
                  <InfoItem>
                    <UserOutlined />
                    <div>
                      <Text type="secondary">Khách hàng</Text>
                      <div>
                        <Text strong>{appointment.userName || 'Không có thông tin'}</Text>
                      </div>
                    </div>
                  </InfoItem>
                </Col>
                
                <Col xs={24} sm={12}>
                  <InfoItem style={{ alignItems: 'flex-start' }}>
                    <Avatar 
                      icon={<UserOutlined />} 
                      style={{ 
                        marginRight: 8,
                        backgroundColor: '#1890ff15',
                        color: '#1890ff'
                      }}
                    />
                    <div>
                      <Text type="secondary">Nhân viên phụ trách</Text>
                      <div>
                        <Text strong>{appointment.staffName || 'Chưa phân công'}</Text>
                      </div>
                    </div>
                  </InfoItem>
                </Col>
              </Row>
              
              {appointment.notes && (
                <>
                  <Divider style={{ margin: '24px 0 16px' }} dashed />
                  <InfoItem>
                    <FileTextOutlined />
                    <div>
                      <Text type="secondary">Ghi chú</Text>
                      <div>
                        <Text>{appointment.notes}</Text>
                      </div>
                    </div>
                  </InfoItem>
                </>
              )}
              
              {/* Action Buttons */}
              <Divider style={{ margin: '24px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <AnimatedButton
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/appointments')}
                >
                  Quay lại
                </AnimatedButton>
                
                <Space>
                  {canModify && (isOwner || isAdminOrStaff) && (
                    <AnimatedButton
                      type="primary"
                      ghost
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/appointments/edit/${appointment.appointmentId}`)}
                    >
                      Sửa lịch hẹn
                    </AnimatedButton>
                  )}
                  
                  {isAdminOrStaff && appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
                    <AnimatedButton
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={handleOpenStatusDialog}
                    >
                      Cập nhật trạng thái
                    </AnimatedButton>
                  )}
                  
                  {canModify && (isOwner || isAdminOrStaff || isAssignedStaff) && appointment.status !== 'Cancelled' && (
                    <AnimatedButton
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={handleOpenCancelDialog}
                    >
                      Hủy lịch hẹn
                    </AnimatedButton>
                  )}
                </Space>
              </div>
            </StyledCard>
          </Col>
          
          {/* Right Column - Status Info */}
          <Col xs={24} lg={8}>
            <StyledCard>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <StatusIcon color={getStatusColor(appointment.status)}>
                  {getStatusIcon(appointment.status)}
                </StatusIcon>
                
                <Title level={3} style={{ margin: 0, color: getStatusColor(appointment.status) }}>
                  {getStatusText(appointment.status)}
                </Title>
                
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  ID: #{appointment.appointmentId}
                </Text>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Thời gian tạo">
                  {appointment.createdAt ? formatDate(appointment.createdAt) : 'Không có thông tin'}
                </Descriptions.Item>
                
                {appointment.updatedAt && (
                  <Descriptions.Item label="Cập nhật lần cuối">
                    {formatDate(appointment.updatedAt)}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </StyledCard>
            
            {appointment.status === 'Completed' && (
              <StyledCard 
                style={{ 
                  marginTop: 16, 
                  background: '#f6ffed', 
                  borderColor: '#b7eb8f'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: 36, color: '#52c41a', marginBottom: 16 }} />
                  <Title level={4} style={{ color: '#52c41a', margin: 0 }}>
                    Lịch hẹn đã hoàn thành
                  </Title>
                  <Paragraph style={{ marginTop: 8 }}>
                    Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
                  </Paragraph>
                  <div style={{ marginTop: 16 }}>
                    <AnimatedButton type="primary" ghost icon={<LikeOutlined />}>
                      Đánh giá dịch vụ
                    </AnimatedButton>
                  </div>
                </div>
              </StyledCard>
            )}
            
            {appointment.status === 'Cancelled' && (
              <StyledCard 
                style={{ 
                  marginTop: 16, 
                  background: '#fff1f0', 
                  borderColor: '#ffa39e'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <CloseCircleOutlined style={{ fontSize: 36, color: '#f5222d', marginBottom: 16 }} />
                  <Title level={4} style={{ color: '#f5222d', margin: 0 }}>
                    Lịch hẹn đã bị hủy
                  </Title>
                  <Paragraph style={{ marginTop: 8 }}>
                    Bạn có thể đặt lịch hẹn mới bất cứ lúc nào.
                  </Paragraph>
                  <div style={{ marginTop: 16 }}>
                    <AnimatedButton type="primary" onClick={() => navigate('/appointments/add')}>
                      Đặt lịch mới
                    </AnimatedButton>
                  </div>
                </div>
              </StyledCard>
            )}
            
            <StyledCard style={{ marginTop: 16 }}>
              <InfoCircleOutlined style={{ fontSize: 16, color: '#1890ff', marginRight: 8 }} />
              <Title level={5} style={{ margin: '0 0 16px 0' }}>
                Lưu ý
              </Title>
              <Paragraph type="secondary">
                Vui lòng đến sớm 10-15 phút trước giờ hẹn. Nếu bạn cần hủy hoặc đổi lịch, vui lòng thông báo trước ít nhất 24 giờ.
              </Paragraph>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Mọi thắc mắc xin liên hệ hotline: <Text strong>0123 456 789</Text>
              </Paragraph>
            </StyledCard>
          </Col>
        </Row>
        
        {/* Cancel Appointment Modal */}
        <Modal
          title="Xác nhận hủy lịch hẹn"
          open={openCancelDialog}
          onCancel={handleCloseCancelDialog}
          footer={[
            <Button key="cancel" onClick={handleCloseCancelDialog}>
              Đóng
            </Button>,
            <Button key="confirm" danger type="primary" onClick={handleCancelAppointment}>
              Xác nhận hủy
            </Button>
          ]}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
            <ExclamationCircleOutlined style={{ color: '#f5222d', fontSize: 22, marginRight: 16, marginTop: 4 }} />
            <div>
              <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                Bạn có chắc chắn muốn hủy lịch hẹn này không?
              </Text>
              <Text type="secondary">
                Thao tác này không thể hoàn tác. Nếu bạn muốn đặt lại lịch hẹn, bạn sẽ cần tạo một lịch hẹn mới.
              </Text>
            </div>
          </div>
        </Modal>
        
        {/* Update Status Modal */}
        <Modal
          title="Cập nhật trạng thái lịch hẹn"
          open={openStatusDialog}
          onCancel={handleCloseStatusDialog}
          footer={[
            <Button key="cancel" onClick={handleCloseStatusDialog}>
              Hủy bỏ
            </Button>,
            <Button key="confirm" type="primary" onClick={handleStatusUpdate}>
              Cập nhật
            </Button>
          ]}
        >
          <Form layout="vertical">
            <Form.Item 
              label="Trạng thái" 
              style={{ marginBottom: 16 }}
            >
              <Select
                value={statusUpdate.status}
                onChange={handleStatusChange}
                style={{ width: '100%' }}
              >
                <Option value="Scheduled">Đã đặt lịch</Option>
                <Option value="Confirmed">Đã xác nhận</Option>
                <Option value="Completed">Đã hoàn thành</Option>
                <Option value="Cancelled">Đã hủy</Option>
                <Option value="No-Show">Không đến</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="Ghi chú">
              <TextArea
                rows={4}
                value={statusUpdate.notes}
                onChange={handleNotesChange}
                placeholder="Nhập ghi chú cho trạng thái mới"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Content>
  );
};

export default AppointmentDetail;