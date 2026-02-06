import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Button, 
  Divider, 
  Spin, 
  Alert, 
  Space, 
  Tooltip, 
  Radio, 
  Badge, 
  Select, 
  Empty,
  Calendar,
  Tag,
  Avatar,
  Popover,
  Modal,
  Input,
  message
} from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  CalendarOutlined, 
  PlusOutlined, 
  ClockCircleOutlined, 
  EyeOutlined, 
  ScheduleOutlined,
  CalendarTwoTone,
  AppstoreOutlined,
  BarsOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  UserOutlined,
  TeamOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  isSameDay, 
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isWithinInterval,
  isBefore,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  getDay,
  parseISO,
  isToday
} from 'date-fns';
import { vi } from 'date-fns/locale';
import styled, { keyframes } from 'styled-components';
import appointmentService from '../../services/appointmentService';
import useAuth from '../../hooks/useAuth';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;

// Thêm animations và styled components
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 10px rgba(24, 144, 255, 0.5); }
  50% { box-shadow: 0 0 20px rgba(24, 144, 255, 0.8); }
  100% { box-shadow: 0 0 10px rgba(24, 144, 255, 0.5); }
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

const FloatingIcon = styled.div`
  animation: ${float} 3s ease-in-out infinite;
  display: inline-flex;
  margin-right: 16px;
`;

const AnimatedTitle = styled(Title)`
  background: linear-gradient(to right, #1890ff, #52c41a, #1890ff);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: ${shine} 5s linear infinite;
`;

// Cập nhật CalendarHeader để có nền đậm hơn
const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #e6f7ff, #cfe9ff); // Màu đậm hơn
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid #b7daff; // Thêm viền
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.1); // Thêm shadow
`;

const AnimatedButton = styled(Button)`
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

// Cập nhật AppointmentCard để có màu chữ và nền tương phản tốt hơn
const AppointmentCard = styled.div`
  margin: 4px;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: ${props => props.color};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: ${pulse} 1s infinite;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom right,
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.05)
    );
    pointer-events: none;
  }
`;

const GlowingDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 8px;
  animation: ${glow} 2s infinite;
`;

// Cập nhật CalendarCell để làm nổi bật ngày hiện tại rõ ràng hơn
const CalendarCell = styled.div`
  height: ${props => props.view === 'week' ? '300px' : '130px'};
  border: 1px solid ${props => props.isToday ? '#1890ff' : '#f0f0f0'};
  border-radius: 4px;
  background-color: ${props => props.isToday ? '#e6f7ff' : props.isCurrentMonth ? 'white' : '#f5f5f5'};
  overflow: auto;
  transition: all 0.3s;
  padding: 4px;
  
  &:hover {
    box-shadow: 0 0 10px rgba(24, 144, 255, 0.2);
  }
  
  .date-header {
    position: sticky;
    top: 0;
    background-color: ${props => props.isToday ? '#e6f7ff' : props.isCurrentMonth ? 'white' : '#f5f5f5'};
    padding: 4px 8px;
    border-bottom: ${props => props.isToday ? '2px solid #1890ff' : '1px solid #f0f0f0'};
    font-weight: ${props => props.isToday ? 'bold' : 'normal'};
    z-index: 1;
    color: ${props => props.isToday ? '#1890ff' : '#262626'}; // Đảm bảo màu chữ nổi bật
  }
`;

// Cập nhật WeekHeader với gradient ít hơn và chữ rõ hơn
const WeekHeader = styled.div`
  background: linear-gradient(to right, #1890ff, #40a9ff);
  color: white;
  padding: 8px;
  text-align: center;
  border-radius: 8px 8px 0 0;
  font-weight: bold;
  text-shadow: 0 1px 1px rgba(0,0,0,0.2);
`;

// Cập nhật DayNumber để hiển thị rõ hơn
const DayNumber = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 50%;
  background-color: ${props => props.isToday ? '#1890ff' : 'transparent'};
  color: ${props => props.isToday ? 'white' : '#262626'};
  font-weight: ${props => props.isToday ? 'bold' : 'normal'};
`;

// Functions for UI
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

const getStatusIcon = (status) => {
  switch (status) {
    case 'Scheduled':
      return <ClockCircleOutlined />;
    case 'Confirmed':
      return <CheckCircleOutlined />;
    case 'Completed':
      return <CheckCircleOutlined />;
    case 'Cancelled':
      return <CloseCircleOutlined />;
    case 'No-Show':
      return <WarningOutlined />;
    default:
      return <InfoCircleOutlined />;
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

// Thêm chức năng kiểm tra khả năng hủy lịch để hiển thị đúng các nút hành động

const canCancelAppointment = (appointment) => {
  // Nếu lịch hẹn không phải trạng thái cho phép hủy
  if (appointment.status !== 'Scheduled' && appointment.status !== 'Confirmed') {
    return false;
  }
  
  // Kiểm tra thời gian (không thể hủy lịch hẹn trong vòng 24 giờ)
  const appointmentTime = new Date(appointment.appointmentDate);
  const now = new Date();
  const hoursLeft = (appointmentTime - now) / (1000 * 60 * 60);
  
  return hoursLeft > 24;  // Cho phép hủy nếu còn hơn 24 giờ
};

const AppointmentCalendar = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Thêm dòng này
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [staffFilter, setStaffFilter] = useState('');
  
  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      let startDate, endDate;
      if (viewMode === 'week') {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Week starts on Monday
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      } else {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      }
      
      let data;
      if (user.role === 'Admin') {
        data = await appointmentService.getAppointmentsByDateRange(
          startDate.toISOString(),
          endDate.toISOString()
        );
      } else if (user.role === 'Staff' && user.staffId) {
        data = await appointmentService.getStaffAppointmentsByDateRange(
          user.staffId,
          startDate.toISOString(),
          endDate.toISOString()
        );
      } else {
        data = await appointmentService.getUserAppointments();
      }
      
      setAppointments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(typeof err === 'string' ? err : 'Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, viewMode, user]);
  
  const showCancelConfirm = (appointment) => {
    if (!canCancelAppointment(appointment)) {
      message.error('Không thể hủy lịch hẹn trong vòng 24 giờ trước khi diễn ra.');
      return;
    }
    
    let cancelReason = '';
    
    Modal.confirm({
      title: 'Xác nhận hủy lịch hẹn',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn hủy lịch hẹn này không?</p>
          <div style={{ marginTop: 16 }}>
            <Input.TextArea 
              placeholder="Vui lòng nhập lý do hủy lịch (tùy chọn)" 
              rows={3}
              onChange={(e) => { cancelReason = e.target.value; }}
            />
          </div>
          <div style={{ marginTop: 8, color: '#1890ff', fontSize: '13px' }}>
            <InfoCircleOutlined style={{ marginRight: 4 }} />
            Lưu ý: Chỉ có thể hủy lịch hẹn trước thời điểm diễn ra ít nhất 24 giờ.
          </div>
        </div>
      ),
      okText: 'Xác nhận hủy',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk() {
        return handleCancelAppointment(appointment.appointmentId, cancelReason);
      },
    });
  };
  
  const handleCancelAppointment = async (appointmentId, reason) => {
    try {
      setLoading(true);
      await appointmentService.cancelAppointmentWithReason(appointmentId, reason);
      
      message.success('Lịch hẹn đã được hủy thành công');
      fetchAppointments();
    } catch (error) {
      message.error(`Không thể hủy lịch hẹn: ${error.message || 'Đã xảy ra lỗi'}`);
    } finally {
      setLoading(false);
    }
  };

  // Weekly View Component
  const renderWeekView = () => {
    // Get days of the week
    const startDay = startOfWeek(currentDate, { weekStartsOn: 1 });
    const endDay = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDay, end: endDay });
    
    return (
      <Row gutter={[8, 8]}>
        {/* Day headers */}
        {days.map((day, index) => (
          <Col span={24/7} key={`header-${index}`}>
            <WeekHeader>
              <div>{format(day, 'EEEE', { locale: vi })}</div>
              <div style={{ fontSize: '12px' }}>{format(day, 'dd/MM/yyyy', { locale: vi })}</div>
            </WeekHeader>
          </Col>
        ))}
        
        {/* Calendar cells */}
        {days.map((day, index) => {
          const dayAppointments = appointments.filter(a => 
            isSameDay(parseISO(a.appointmentDate), day)
          );
          
          // Apply staff filter if set
          const filteredAppointments = staffFilter 
            ? dayAppointments.filter(a => a.staffId === parseInt(staffFilter))
            : dayAppointments;
          
          return (
            <Col span={24/7} key={`day-${index}`}>
              <CalendarCell 
                view="week" 
                isToday={isToday(day)}
                isCurrentMonth={true}
              >
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.appointmentId}
                      color={getStatusColor(appointment.status)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                        <Text strong style={{ color: 'white' }}>
                          {format(parseISO(appointment.appointmentDate), 'HH:mm', { locale: vi })}
                        </Text>
                      </div>
                      
                      <Text style={{ display: 'block', color: 'white', fontWeight: 'bold', marginBottom: '2px' }}>
                        {appointment.serviceName}
                      </Text>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ color: 'white', fontSize: '12px' }}>
                          {appointment.petName} - {appointment.userName}
                        </Text>
                        
                        <Tooltip title="Xem chi tiết">
                          <Link to={`/appointments/${appointment.appointmentId}`}>
                            <Button 
                              type="primary" // Chuyển từ "text" thành "primary"
                              size="small"
                              icon={<EyeOutlined />}
                              style={{ 
                                marginLeft: '4px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                          </Link>
                        </Tooltip>

                        {canCancelAppointment(appointment) && (
                          <Button 
                            type="text" 
                            icon={<DeleteOutlined />}
                            size="small"
                            danger 
                            onClick={(e) => {
                              e.stopPropagation();
                              showCancelConfirm(appointment);
                            }}
                          >
                            Hủy
                          </Button>
                        )}
                      </div>
                    </AppointmentCard>
                  ))
                ) : (
                  // Cập nhật Empty state để hiển thị rõ hơn
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<Text style={{ color: '#262626', fontWeight: '500' }}>Không có lịch hẹn</Text>}
                    style={{ 
                      margin: '24px 0',
                      padding: '16px',
                      backgroundColor: '#f0f5ff', // Màu nền đậm hơn so với #f9f9f9
                      borderRadius: '8px',
                      border: '1px solid #d6e4ff'
                    }}
                  />
                )}
              </CalendarCell>
            </Col>
          );
        })}
      </Row>
    );
  };
  
  // Monthly View Component
  const renderMonthView = () => {
    // First day of month
    const firstDay = startOfMonth(currentDate);
    // Last day of month
    const lastDay = endOfMonth(currentDate);
    // Day of week of first day (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = getDay(firstDay);
    
    // Previous month days to show
    const prevMonthDays = [];
    if (startDayOfWeek !== 1) { // If first day is not Monday
      const daysBefore = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
      for (let i = daysBefore; i > 0; i--) {
        prevMonthDays.push(addDays(firstDay, -i));
      }
    }
    
    // Current month days
    const currentMonthDays = eachDayOfInterval({ start: firstDay, end: lastDay });
    
    // Next month days to show
    const nextMonthDays = [];
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const daysNeeded = totalDays <= 35 ? 35 : 42; // 5 or 6 rows of 7 days
    if (totalDays < daysNeeded) {
      for (let i = 1; i <= daysNeeded - totalDays; i++) {
        nextMonthDays.push(addDays(lastDay, i));
      }
    }
    
    // All days to display
    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    
    // Week headers
    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    
    return (
      <>
        <Row gutter={[8, 8]}>
          {/* Day headers */}
          {weekDays.map((day, index) => (
            <Col span={24/7} key={`header-${index}`}>
              <WeekHeader style={{ padding: '4px' }}>{day}</WeekHeader>
            </Col>
          ))}
          
          {/* Calendar cells */}
          {allDays.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isDayToday = isToday(day);
            
            const dayAppointments = appointments.filter(a => 
              isSameDay(parseISO(a.appointmentDate), day)
            );
            
            // Apply staff filter if set
            const filteredAppointments = staffFilter 
              ? dayAppointments.filter(a => a.staffId === parseInt(staffFilter))
              : dayAppointments;
            
            return (
              <Col span={24/7} key={`day-${index}`}>
                <CalendarCell 
                  view="month"
                  isToday={isDayToday}
                  isCurrentMonth={isCurrentMonth}
                  style={{ opacity: isCurrentMonth ? 1 : 0.5 }}
                >
                  <div className="date-header">
                    <DayNumber 
                      isToday={isDayToday}
                      style={{ 
                        fontWeight: isDayToday ? 'bold' : 'normal',
                      }}
                    >
                      {format(day, 'd', { locale: vi })}
                    </DayNumber>
                  </div>
                  
                  {filteredAppointments.slice(0, 3).map((appointment) => (
                    <AppointmentCard
                      key={appointment.appointmentId}
                      color={getStatusColor(appointment.status)}
                      style={{ 
                        margin: '2px',
                        padding: '2px 8px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      <Link 
                        to={`/appointments/${appointment.appointmentId}`} 
                        style={{ 
                          color: 'white', 
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          display: 'block',
                          textShadow: '0 1px 1px rgba(0,0,0,0.2)' 
                        }}
                      >
                        {format(parseISO(appointment.appointmentDate), 'HH:mm', { locale: vi })} - {appointment.petName}
                      </Link>
                    </AppointmentCard>
                  ))}
                  
                  {filteredAppointments.length > 3 && (
                    <Tooltip title={`${filteredAppointments.length - 3} lịch hẹn khác`}>
                      <Tag 
                        color="#1890ff"
                        style={{ 
                          margin: '2px', 
                          cursor: 'pointer',
                          fontSize: '11px',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        +{filteredAppointments.length - 3} khác
                      </Tag>
                    </Tooltip>
                  )}
                </CalendarCell>
              </Col>
            );
          })}
        </Row>
      </>
    );
  };
  
  const handlePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };
  
  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  const handleToggleView = () => {
    setViewMode(viewMode === 'week' ? 'month' : 'week');
  };
  
  const handleStaffFilterChange = (event) => {
    setStaffFilter(event.target.value);
  };
  
  return (
    <Content style={{ padding: '24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <StyledCard style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FloatingIcon>
                <Avatar 
                  icon={<CalendarTwoTone twoToneColor="#1890ff" />} 
                  size={48}
                  style={{ backgroundColor: '#e6f7ff' }}
                />
              </FloatingIcon>
              <div>
                <AnimatedTitle level={4} style={{ margin: 0, fontWeight: 600 }}>
                  Lịch hẹn
                </AnimatedTitle>
                <Text type="secondary">Xem lịch hẹn theo tuần hoặc tháng</Text>
              </div>
            </div>
            
            <Space>
              {user.role === 'Admin' && (
                <Select
                  placeholder="Nhân viên"
                  style={{ width: 200 }}
                  value={staffFilter}
                  onChange={(value) => setStaffFilter(value)}
                  allowClear
                >
                  <Option value="">Tất cả nhân viên</Option>
                  {/* Add staff members from API */}
                </Select>
              )}
              
              <AnimatedButton
                icon={<ScheduleOutlined />}
                onClick={() => navigate('/appointments')}
              >
                Danh sách
              </AnimatedButton>

              <AnimatedButton
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/appointments/add')}
              >
                Đặt lịch mới
              </AnimatedButton>
            </Space>
          </div>
        </StyledCard>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <Spin size="large" tip="Đang tải lịch hẹn..." />
          </div>
        ) : error ? (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        ) : (
          <StyledCard>
            <CalendarHeader>
              <Space>
                <AnimatedButton 
                  type="primary" 
                  shape="circle" 
                  icon={<LeftOutlined />} 
                  onClick={handlePrevious}
                />
                <AnimatedButton onClick={handleToday}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  Hôm nay
                </AnimatedButton>
                <AnimatedButton 
                  type="primary" 
                  shape="circle" 
                  icon={<RightOutlined />} 
                  onClick={handleNext}
                />
              </Space>
              
              <Title level={5} style={{ 
                margin: 0, 
                fontWeight: 'bold',
                color: '#1890ff',
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '4px 12px',
                borderRadius: '16px'
              }}>
                {viewMode === 'week' 
                  ? `Tuần ${format(currentDate, "'số' w, yyyy", { locale: vi })}`
                  : format(currentDate, 'MMMM yyyy', { locale: vi })}
              </Title>
              
              <Radio.Group 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="week">
                  <BarsOutlined style={{ marginRight: 4 }} />
                  Tuần
                </Radio.Button>
                <Radio.Button value="month">
                  <AppstoreOutlined style={{ marginRight: 4 }} />
                  Tháng
                </Radio.Button>
              </Radio.Group>
            </CalendarHeader>
            
            {viewMode === 'week' ? renderWeekView() : renderMonthView()}
            
            <Divider />
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '0 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <GlowingDot color="#1890ff" />
                <Text strong style={{ color: '#1890ff' }}>Đã đặt lịch</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <GlowingDot color="#2f54eb" />
                <Text strong style={{ color: '#2f54eb' }}>Đã xác nhận</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <GlowingDot color="#52c41a" />
                <Text strong style={{ color: '#52c41a' }}>Đã hoàn thành</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <GlowingDot color="#f5222d" />
                <Text strong style={{ color: '#f5222d' }}>Đã hủy</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <GlowingDot color="#fa8c16" />
                <Text strong style={{ color: '#fa8c16' }}>Không đến</Text>
              </div>
            </div>
          </StyledCard>
        )}
      </div>
    </Content>
  );
};

export default AppointmentCalendar;