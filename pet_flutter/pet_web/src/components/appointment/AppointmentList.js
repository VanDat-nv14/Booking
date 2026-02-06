import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Typography, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Tooltip, 
  Modal, 
  Card, 
  Spin, 
  Avatar, 
  Divider,
  Badge,
  Empty,
  message,
  DatePicker
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  CalendarOutlined, 
  LoadingOutlined,
  InfoCircleOutlined,
  SolutionOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import styled, { keyframes } from 'styled-components';
import appointmentService from '../../services/appointmentService';
import useAuth from '../../hooks/useAuth';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;
const { RangePicker } = DatePicker;

// Animations
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

const shine = keyframes`
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.6); }
  70% { box-shadow: 0 0 0 15px rgba(24, 144, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const StyledCard = styled(Card)`
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #fff, #f9f9f9);
  border: none;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 32px rgba(24, 144, 255, 0.15);
  }
`;

// Cập nhật ActionButton
const ActionButton = styled(Button)`
  margin: 0 4px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  &:hover {
    transform: scale(1.2);
  }
  
  &.delete-btn:hover {
    background-color: #ff4d4f;
    color: white;
    box-shadow: 0 0 10px rgba(255, 77, 79, 0.5);
  }
  
  &.view-btn:hover {
    background-color: #1890ff;
    color: white;
    box-shadow: 0 0 10px rgba(24, 144, 255, 0.5);
  }
  
  &.edit-btn:hover {
    background-color: #52c41a;
    color: white;
    box-shadow: 0 0 10px rgba(82, 196, 26, 0.5);
  }
`;

const AnimatedTitle = styled(Title)`
  background: linear-gradient(to right, #1890ff, #52c41a, #722ed1, #1890ff);
  background-size: 300% auto;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: ${shine} 7s linear infinite;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0;
`;

const FloatingIcon = styled.div`
  animation: ${float} 4s ease-in-out infinite;
  display: inline-flex;
  margin-right: 16px;
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff, #46a6ff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(24, 144, 255, 0.2);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid #1890ff;
    animation: ${glowPulse} 2s infinite;
  }
`;

const AnimatedButton = styled(Button)`
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  transform-origin: center;
  
  &:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 100%
    );
    transform: skewX(-25deg);
    transition: all 0.75s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const StyledTable = styled(Table)`
  .ant-table {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .ant-table-thead > tr > th {
    background: linear-gradient(to right, #f0f5ff, #e6f7ff);
    border-bottom: none;
    padding: 16px 16px;
    font-weight: 600;
  }
  
  .ant-table-tbody > tr {
    transition: all 0.3s;
  }
  
  .ant-table-tbody > tr:hover {
    transform: translateX(5px);
    box-shadow: -5px 0 0 #1890ff;
  }
  
  .ant-table-row:nth-child(odd) {
    background-color: rgba(240, 245, 255, 0.2);
  }
  
  .ant-table-cell {
    padding: 14px 16px;
  }
  
  .ant-pagination-item-active {
    border-color: #1890ff;
    font-weight: 600;
    transform: scale(1.1);
    box-shadow: 0 2px 5px rgba(24, 144, 255, 0.2);
  }
`;

// Cập nhật PulsingTag
const PulsingTag = styled(Tag)`
  border-radius: 12px;
  padding: 0 10px;
  margin: 0;
  border: none;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.1);
    animation: ${pulse} 1.5s infinite;
  }
  
  .anticon {
    margin-right: 5px;
  }
`;

const StatusBadge = styled(Badge)`
  .ant-badge-status-dot {
    width: 10px;
    height: 10px;
    box-shadow: 0 0 0 4px ${props => `${props.color}22`};
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  animation: ${fadeInUp} 0.5s ease-out;

  .ant-empty-image {
    height: 120px;
    margin-bottom: 24px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #e6f7ff, #f0f5ff);
  margin: -24px -24px 24px -24px;
  padding: 24px;
  border-radius: 16px 16px 0 0;
  border-bottom: 1px solid rgba(24, 144, 255, 0.1);
`;

const RotatingIcon = styled.div`
  display: inline-flex;
  &:hover {
    animation: ${rotate} 2s linear infinite;
  }
`;

// Component
const AppointmentList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [cancelCountCache, setCancelCountCache] = useState({
    count: null,
    timestamp: null
  });

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let data;
      
      if (user.role === 'Admin' || user.role === 'Staff') {
        if (user.role === 'Staff') {
          data = await appointmentService.getStaffAppointments();
        } else {
          data = await appointmentService.getAllAppointments();
        }
      } else {
        data = await appointmentService.getUserAppointments();
      }
      
      setAppointments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(typeof err === 'string' ? err : 'Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.');
      message.error('Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setTableParams({
      pagination,
    });
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1,
      },
    });
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1,
      },
    });
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1,
      },
    });
  };

  // Sửa hàm hasCancelledTooManyTimes để trả về số lượng lần hủy thay vì boolean và sử dụng cache
  const hasCancelledTooManyTimes = async () => {
    try {
      // Kiểm tra cache, nếu đã có kết quả và chưa quá 5 phút thì dùng lại
      const now = new Date();
      const cacheExpiry = 5 * 60 * 1000; // 5 phút
      
      if (cancelCountCache.count !== null && 
          cancelCountCache.timestamp && 
          (now - cancelCountCache.timestamp < cacheExpiry)) {
        console.log('Sử dụng cache cho số lần hủy:', cancelCountCache.count);
        return cancelCountCache.count;
      }
      
      // Nếu không có cache hoặc cache hết hạn, gọi API
      console.log('Đang lấy số lần hủy từ API...');
      
      // Lấy danh sách lịch hẹn của người dùng hiện tại
      const userAppointments = await appointmentService.getUserAppointments();
      
      // Lấy tháng hiện tại
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Lọc ra các lịch hẹn đã hủy trong tháng hiện tại
      const cancelledAppointments = userAppointments.filter(appointment => {
        const updatedAt = new Date(appointment.updatedAt || appointment.createdAt);
        return appointment.status === 'Cancelled' && 
               updatedAt >= firstDayOfMonth && 
               updatedAt <= lastDayOfMonth;
      });
      
      const cancelCount = cancelledAppointments.length;
      console.log('Số lần hủy trong tháng:', cancelCount);
      
      // Lưu kết quả vào cache
      setCancelCountCache({
        count: cancelCount,
        timestamp: now
      });
      
      // Trả về số lượng lần đã hủy
      return cancelCount;
    } catch (error) {
      console.error('Error checking cancel limit:', error);
      // Mặc định trả về 0 nếu có lỗi
      return 0;
    }
  };

  const hasEditedTooManyTimes = async (appointmentId) => {
    try {
      // Gọi API để lấy lịch sử chỉnh sửa của cuộc hẹn
      const editHistory = await appointmentService.getAppointmentEditHistory(appointmentId);
      
      // Nếu đã sửa từ 2 lần trở lên, trả về true
      return editHistory.length >= 2;
    } catch (error) {
      console.error('Error checking edit limit:', error);
      // Mặc định cho phép nếu có lỗi
      return false;
    }
  };

  // Cập nhật hàm showCancelConfirm
  const showCancelConfirm = async (appointment) => {
    console.log("===== SHOW CANCEL CONFIRM =====");
    console.log("showCancelConfirm được gọi với appointment:", appointment);
    
    // Kiểm tra nhanh xem lịch đã qua chưa
    if (isAppointmentPassed(appointment.appointmentDate)) {
      message.error("Không thể hủy lịch hẹn đã qua");
      Modal.warning({
        title: 'Không thể hủy lịch hẹn',
        content: 'Lịch hẹn này đã qua thời gian diễn ra, bạn không thể hủy nó.',
        okText: 'Đã hiểu'
      });
      return;
    }
    
    // Biến lưu lý do hủy
    let cancelReason = '';
    
    try {
      // Lấy số lần đã hủy trong tháng
      const cancelledCount = await hasCancelledTooManyTimes();
      const remainingCancellations = 3 - cancelledCount;
      
      // Kiểm tra nếu đã hết lượt hủy
      if (remainingCancellations <= 0) {
        Modal.error({
          title: 'Không thể hủy lịch hẹn',
          content: (
            <div>
              <p>Bạn đã sử dụng hết 3 lần hủy lịch trong tháng này.</p>
              <p>Vui lòng liên hệ trực tiếp với cửa hàng để được hỗ trợ.</p>
            </div>
          ),
          okText: 'Đã hiểu'
        });
        return;
      }
      
      // Sử dụng Modal.confirm trực tiếp thay vì gọi API trước
      Modal.confirm({
        title: 'Xác nhận hủy lịch hẹn',
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        content: (
          <div>
            <p>Bạn có chắc chắn muốn hủy lịch hẹn này không? Thao tác này không thể hoàn tác.</p>
            
            <div style={{ marginTop: 16 }}>
              <Input.TextArea 
                placeholder="Vui lòng nhập lý do hủy lịch (tùy chọn)" 
                rows={3}
                onChange={(e) => { 
                  cancelReason = e.target.value;
                  console.log("Lý do hủy:", cancelReason);
                }}
              />
            </div>
            
            {/* Hiển thị số lần đã hủy trong tháng */}
            <div style={{ marginTop: 16, padding: 10, background: '#f5f5f5', borderRadius: 4 }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                Bạn đã hủy <b>{cancelledCount}</b> lịch hẹn trong tháng này (còn <b>{remainingCancellations}</b> lần).
              </p>
            </div>
              <div style={{ marginTop: 8, color: '#1890ff', fontSize: '13px' }}>
              <InfoCircleOutlined style={{ marginRight: 4 }} />
              Lưu ý: Chỉ có thể hủy lịch hẹn trước thời điểm diễn ra ít nhất 24 giờ và mỗi tháng chỉ được hủy tối đa 3 lần.
            </div>
          </div>
        ),
        okText: 'Xác nhận hủy',
        okType: 'danger',
        cancelText: 'Đóng',
        async onOk() {
          try {
            console.log("Nút xác nhận hủy được nhấn");
            const loadingMsg = message.loading("Đang xử lý yêu cầu hủy lịch...", 0);
            
            try {
              // Kiểm tra các điều kiện
              if (!canCancelAppointment(appointment)) {
                loadingMsg();
                message.error('Không thể hủy lịch hẹn trong vòng 24 giờ trước khi diễn ra.');
                return Promise.reject('Không thể hủy lịch quá gần thời điểm diễn ra');
              }
              
              // Tiến hành hủy lịch
              console.log("Gọi API hủy lịch với ID:", appointment.appointmentId, "và lý do:", cancelReason);
              await appointmentService.cancelAppointment(appointment.appointmentId, cancelReason);
              
              loadingMsg();
              
              // Hiển thị thông báo thành công chi tiết
              Modal.success({
                title: 'Hủy lịch hẹn thành công',
                content: (
                  <div>
                    <p>Lịch hẹn của bạn đã được hủy thành công.</p>
                    <p>Bạn đã sử dụng {cancelledCount + 1}/3 lần hủy lịch trong tháng này.</p>
                    {cancelReason && <p><b>Lý do hủy:</b> {cancelReason}</p>}
                  </div>
                ),
                okText: 'Đóng'
              });
              
              // Cập nhật lại danh sách lịch hẹn
              console.log("Đang tải lại danh sách lịch hẹn...");
              await fetchAppointments();
              
              // Cập nhật cache số lần hủy
              setCancelCountCache({
                count: cancelledCount + 1,
                timestamp: new Date()
              });
              
              return Promise.resolve();
            } catch (error) {
              loadingMsg();
              console.error('Lỗi khi hủy lịch hẹn:', error);
              
              if (error.response?.data?.message?.includes("maximum number of cancellations")) {
                Modal.error({
                  title: 'Không thể hủy lịch hẹn',
                  content: 'Bạn đã vượt quá giới hạn hủy lịch (3 lần/tháng). Vui lòng liên hệ hỗ trợ.',
                  okText: 'Đóng'
                });
              } else {
                Modal.error({
                  title: 'Lỗi khi hủy lịch hẹn',
                  content: error.response?.data?.message || 'Có lỗi xảy ra khi hủy lịch hẹn.',
                  okText: 'Đóng'
                });
              }
              
              return Promise.reject(error);
            }
          } catch (error) {
            console.error('Lỗi xử lý tổng thể:', error);
            Modal.error({
              title: 'Lỗi xảy ra',
              content: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
              okText: 'Đóng'
            });
            return Promise.reject(error);
          }
        },
      });
    } catch (error) {
      console.error('Lỗi khi kiểm tra số lần hủy:', error);
      message.error('Không thể kiểm tra giới hạn hủy lịch. Vui lòng thử lại sau.');
    }
  };

  // Cập nhật đoạn code kiểm tra khả năng hủy lịch hẹn trong AppointmentList.js
  const canCancelAppointment = (appointment) => {
    // Nếu lịch hẹn không phải trạng thái cho phép hủy
    if (appointment.status !== 'Scheduled' && appointment.status !== 'Confirmed') {
      console.log('Không thể hủy: Trạng thái không cho phép', appointment.status);
      return false;
    }
    
    // Kiểm tra thời gian (không thể hủy lịch hẹn đã qua)
    const appointmentTime = new Date(appointment.appointmentDate);
    const now = new Date();
    
    if (appointmentTime < now) {
      console.log('Không thể hủy: Lịch hẹn đã qua');
      return false;
    }      // Kiểm tra thời gian (không thể hủy lịch hẹn trong vòng 24 giờ)
    const hoursLeft = (appointmentTime - now) / (1000 * 60 * 60);
    
    if (hoursLeft <= 24) {
      console.log('Không thể hủy: Còn ít hơn 24 giờ', hoursLeft);
      return false;
    }
    
    return true;  // Cho phép hủy
  };

  // Cập nhật xử lý khung giờ làm việc
  const isValidAppointmentTime = (date) => {
    // Kiểm tra khung giờ làm việc (8:00 - 21:30)
    const hour = date.getHours();
    const minute = date.getMinutes();
    const totalMinutes = hour * 60 + minute;
    
    // Giờ mở cửa (8:00) và đóng cửa (21:30)
    const openingTime = 8 * 60; // 8:00 = 480 phút
    const closingTime = 21 * 60 + 30; // 21:30 = 1290 phút
    
    return totalMinutes >= openingTime && totalMinutes <= closingTime;
  };

  // Cập nhật hàm getStatusTag để đồng bộ với các trạng thái và màu sắc
  const getStatusTag = (status) => {
    let color, text, icon, bgColor;
    
    switch (status) {
      case 'Scheduled':
        color = '#1890ff';
        bgColor = '#e6f7ff';
        text = 'Đã đặt lịch';
        icon = <CalendarOutlined />;
        break;
      case 'Confirmed':
        color = '#2f54eb';
        bgColor = '#f0f5ff';
        text = 'Đã xác nhận';
        icon = <CheckOutlined />;
        break;
      case 'Completed':
        color = '#52c41a';
        bgColor = '#f6ffed';
        text = 'Đã hoàn thành';
        icon = <CheckOutlined />;
        break;
      case 'Cancelled':
        color = '#f5222d';
        bgColor = '#fff1f0';
        text = 'Đã hủy';
        icon = <CloseOutlined />;
        break;
      case 'No-Show':
        color = '#fa8c16';
        bgColor = '#fff7e6';
        text = 'Không đến';
        icon = <WarningOutlined />;
        break;
      case 'Pending':
        color = '#faad14';
        bgColor = '#fffbe6';
        text = 'Đang chờ';
        icon = <ClockCircleOutlined />;
        break;
      default:
        color = '#d9d9d9';
        bgColor = '#fafafa';
        text = status;
        icon = <InfoCircleOutlined />;
    }
    
    return (
      <PulsingTag style={{ backgroundColor: bgColor, color: color }}>
        <StatusBadge status="processing" color={color} />
        {icon} {text}
      </PulsingTag>
    );
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) {
        return 'Ngày không hợp lệ';
      }

      // Tách ngày và giờ từ chuỗi ISO để tránh bị chuyển đổi timezone
      const dateStr = dateString.split('T')[0]; // YYYY-MM-DD
      const timeStr = dateString.split('T')[1]?.split('.')[0] || '00:00:00'; // HH:MM:SS

      // Sử dụng chuỗi ngày và giờ để hiển thị chính xác
      const dateDisplay = format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
      const timeDisplay = timeStr.substring(0, 5); // Lấy HH:MM
      
      return `${dateDisplay} ${timeDisplay}`;
    } catch (e) {
      console.error('Lỗi định dạng ngày:', e);
      return 'Ngày không hợp lệ';
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    return (
      (appointment.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       appointment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       appointment.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === '' || appointment.status === statusFilter) &&
      (!dateRange || !dateRange[0] || !dateRange[1] || 
        (new Date(appointment.appointmentDate) >= dateRange[0].startOf('day') && 
         new Date(appointment.appointmentDate) <= dateRange[1].endOf('day')))
    );
  });

  const handleAddNewAppointment = () => {
    // Chuyển thẳng đến trang đặt lịch
    navigate('/appointments/add');
    
    // Hoặc nếu vẫn muốn giữ thông báo, hãy đảm bảo onOk được gọi đúng cách:
    /*
    Modal.info({
      title: 'Giờ làm việc',
      content: (
        <div>
          <p>Vui lòng lưu ý giờ làm việc của chúng tôi:</p>
          <p><strong>8:00 sáng - 9:30 tối</strong> hàng ngày</p>
          <p>Chỉ có thể đặt lịch trong khoảng thời gian này và dịch vụ phải kết thúc trước 9:30 tối.</p>
        </div>
      ),
      onOk() {
        navigate('/appointments/add');
      },
      okText: 'Đặt lịch ngay',
    });
    */
  };

  // Thêm hàm kiểm tra xem lịch hẹn đã qua hay chưa
  const isAppointmentPassed = (appointmentDate) => {
    const now = new Date();
    const appDate = new Date(appointmentDate);
    return appDate < now;
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (text, record) => {
        try {
          if (!text) return 'Thời gian không có';
          
          // Kiểm tra định dạng của text để xử lý đúng
          console.log('Thời gian gốc từ API:', text);
          
          // Giữ nguyên thời gian gốc từ backend, không chuyển đổi múi giờ
          // Tách lấy ngày và giờ từ chuỗi ISO
          const parts = text.split('T');
          if (parts.length !== 2) {
            return text; // Nếu không phải định dạng ISO chuẩn, hiển thị nguyên gốc
          }
          
          const dateStr = parts[0]; // YYYY-MM-DD
          const timePart = parts[1].split('.')[0]; // HH:MM:SS
          const timeStr = timePart.substring(0, 5); // HH:MM
          
          // Format lại ngày tháng theo định dạng Việt Nam
          const dateDisplay = format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
          
          // Tính thời gian kết thúc nếu có thông tin về duration
          let endTimeStr = '';
          if (record.duration) {
            try {
              // Tính thời gian kết thúc dựa trên thời gian bắt đầu và duration
              const [hours, minutes] = timeStr.split(':').map(Number);
              let endHour = hours;
              let endMinute = minutes + Number(record.duration);
              
              // Xử lý nếu phút vượt quá 60
              if (endMinute >= 60) {
                endHour += Math.floor(endMinute / 60);
                endMinute = endMinute % 60;
                
                // Xử lý nếu giờ vượt quá 24
                if (endHour >= 24) {
                  endHour = endHour % 24;
                }
              }
              
              // Format lại thời gian kết thúc
              endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
            } catch (err) {
              console.error('Lỗi tính thời gian kết thúc:', err);
            }
          }
          
          return (
            <div style={{ whiteSpace: 'nowrap' }}>
              <div>{dateDisplay}</div>
              <div style={{ color: '#1890ff', fontWeight: 500 }}>
                {timeStr}
                {endTimeStr && ` - ${endTimeStr}`}
              </div>
            </div>
          );
        } catch (e) {
          console.error('Lỗi xử lý thời gian:', e, 'Giá trị gốc:', text);
          return 'Thời gian không hợp lệ';
        }
      },
      sorter: (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userName',
      key: 'userName',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Thú cưng',
      dataIndex: 'petName',
      key: 'petName',
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName',
    },
    {
      title: 'Nhân viên',
      dataIndex: 'staffName',
      key: 'staffName',
      render: (text) => text || <Text type="secondary">Chưa phân công</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Đã đặt lịch', value: 'Scheduled' },
        { text: 'Đã xác nhận', value: 'Confirmed' },
        { text: 'Đã hoàn thành', value: 'Completed' },
        { text: 'Đã hủy', value: 'Cancelled' },
        { text: 'Không đến', value: 'No-Show' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết" placement="bottom">
            <ActionButton 
              type="text" 
              icon={<EyeOutlined />} 
              shape="circle"
              onClick={() => navigate(`/appointments/${record.appointmentId}`)}
              className="view-btn"
            />
          </Tooltip>
          
          <Tooltip title={isAppointmentPassed(record.appointmentDate) ? "Không thể chỉnh sửa lịch hẹn đã qua" : "Sửa lịch hẹn"} placement="bottom">
            <ActionButton 
              type="text" 
              icon={<EditOutlined />} 
              shape="circle"
              onClick={(e) => {
                e.stopPropagation();
                handleEditAppointment(record.appointmentId);
              }}
              className="edit-btn"
              disabled={isAppointmentPassed(record.appointmentDate)}
              style={{ 
                cursor: isAppointmentPassed(record.appointmentDate) ? 'not-allowed' : 'pointer',
                color: isAppointmentPassed(record.appointmentDate) ? '#d9d9d9' : undefined
              }}
            />
          </Tooltip>
          
          <Tooltip title={
            isAppointmentPassed(record.appointmentDate) ? "Không thể hủy lịch hẹn đã qua" : 
            (record.status !== "Scheduled" && record.status !== "Confirmed") ? "Chỉ có thể hủy lịch hẹn ở trạng thái đã đặt hoặc đã xác nhận" :
            "Hủy lịch hẹn"
          } placement="bottom">
            <ActionButton 
              type="text" 
              icon={<DeleteOutlined />} 
              shape="circle"
              danger={!isAppointmentPassed(record.appointmentDate) && (record.status === "Scheduled" || record.status === "Confirmed")}
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                // Kiểm tra nhanh điều kiện
                if (isAppointmentPassed(record.appointmentDate)) {
                  message.error("Không thể hủy lịch hẹn đã qua");
                  return;
                }
                
                if (record.status !== "Scheduled" && record.status !== "Confirmed") {
                  message.error("Chỉ có thể hủy lịch hẹn ở trạng thái đã đặt hoặc đã xác nhận");
                  return;
                }
                
                // Hiển thị modal xác nhận hủy lịch đơn giản
                showCancelConfirm(record);
              }}
              disabled={isAppointmentPassed(record.appointmentDate) || (record.status !== "Scheduled" && record.status !== "Confirmed")}
              style={{ 
                cursor: (isAppointmentPassed(record.appointmentDate) || (record.status !== "Scheduled" && record.status !== "Confirmed")) ? 'not-allowed' : 'pointer',
                color: (isAppointmentPassed(record.appointmentDate) || (record.status !== "Scheduled" && record.status !== "Confirmed")) ? '#d9d9d9' : undefined
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Cập nhật hàm handleEditAppointment
  const handleEditAppointment = async (appointmentId) => {
    try {
      // Tìm thông tin lịch hẹn
      const appointment = appointments.find(app => app.appointmentId === appointmentId);
      
      if (!appointment) {
        message.error('Không tìm thấy thông tin lịch hẹn.');
        return;
      }
      
      // Kiểm tra xem lịch hẹn đã qua hay chưa
      if (isAppointmentPassed(appointment.appointmentDate)) {
        message.error('Không thể chỉnh sửa lịch hẹn đã qua.');
        Modal.warning({
          title: 'Không thể chỉnh sửa',
          content: 'Lịch hẹn này đã qua thời gian diễn ra, bạn không thể chỉnh sửa nó.',
          okText: 'Đã hiểu'
        });
        return;
      }
      
      // Kiểm tra số lần chỉnh sửa
      const tooManyEdits = await hasEditedTooManyTimes(appointmentId);
      if (tooManyEdits) {
        message.error('Bạn đã vượt quá giới hạn chỉnh sửa (2 lần/lịch hẹn). Vui lòng liên hệ hỗ trợ.');
        return;
      }
      
      // Nếu chưa vượt quá giới hạn, chuyển đến trang chỉnh sửa
      navigate(`/appointments/edit/${appointmentId}`);
    } catch (error) {
      console.error('Error in handleEditAppointment:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  // Cập nhật phần render chính
  return (
    <Content style={{ padding: '24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <StyledCard>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FloatingIcon>
                <IconWrapper>
                  <CalendarOutlined style={{ fontSize: 24, color: 'white' }} />
                </IconWrapper>
              </FloatingIcon>
              <div>
                <AnimatedTitle level={3}>
                  Danh sách lịch hẹn
                </AnimatedTitle>
                <Text style={{ fontSize: 16, opacity: 0.8 }}>
                  Quản lý tất cả lịch hẹn của bạn tại đây
                </Text>
              </div>
            </div>
            
            <Space>
              <AnimatedButton
                type="default"
                icon={<CalendarOutlined />}
                onClick={() => navigate('/appointments/calendar')}
                style={{ borderRadius: '8px' }}
              >
                Xem lịch
              </AnimatedButton>
              <AnimatedButton
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddNewAppointment}
                style={{ 
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1890ff, #096dd9)'
                }}
              >
                Đặt lịch mới
              </AnimatedButton>
            </Space>
          </CardHeader>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <Search
              placeholder="Tìm kiếm theo tên thú cưng, khách hàng, dịch vụ..."
              onSearch={handleSearch}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 350, borderRadius: '8px' }}
              allowClear
              enterButton={<SearchOutlined />}
            />
            
            <Space>
              <RangePicker 
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                style={{ borderRadius: '8px' }}
              />
              
              <Select
                placeholder="Lọc theo trạng thái"
                style={{ width: 200, borderRadius: '8px' }}
                onChange={handleStatusFilterChange}
                value={statusFilter}
                allowClear
                suffixIcon={<FilterOutlined style={{ color: '#1890ff' }} />}
                dropdownStyle={{ borderRadius: '8px' }}
              >
                <Option value="">Tất cả trạng thái</Option>
                <Option value="Scheduled">Đã đặt lịch</Option>
                <Option value="Confirmed">Đã xác nhận</Option>
                <Option value="Completed">Đã hoàn thành</Option>
                <Option value="Cancelled">Đã hủy</Option>
                <Option value="No-Show">Không đến</Option>
              </Select>
            </Space>
          </div>
          
          <StyledTable
            columns={columns.map(col => {
              // Customize column render for actions
              if (col.key === 'action') {
                return {
                  ...col,
                  render: (_, record) => (
                    <Space size="small">
                      <Tooltip title="Xem chi tiết" placement="bottom">
                        <ActionButton 
                          type="text" 
                          icon={<EyeOutlined />} 
                          shape="circle"
                          onClick={() => navigate(`/appointments/${record.appointmentId}`)}
                          className="view-btn"
                        />
                      </Tooltip>
                      
                      <Tooltip title={isAppointmentPassed(record.appointmentDate) ? "Không thể chỉnh sửa lịch hẹn đã qua" : "Sửa lịch hẹn"} placement="bottom">
                        <ActionButton 
                          type="text" 
                          icon={<EditOutlined />} 
                          shape="circle"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAppointment(record.appointmentId);
                          }}
                          className="edit-btn"
                          disabled={isAppointmentPassed(record.appointmentDate)}
                          style={{ 
                            cursor: isAppointmentPassed(record.appointmentDate) ? 'not-allowed' : 'pointer',
                            color: isAppointmentPassed(record.appointmentDate) ? '#d9d9d9' : undefined
                          }}
                        />
                      </Tooltip>
                      
                      <Tooltip title={
                        isAppointmentPassed(record.appointmentDate) ? "Không thể hủy lịch hẹn đã qua" : 
                        (record.status !== "Scheduled" && record.status !== "Confirmed") ? "Chỉ có thể hủy lịch hẹn ở trạng thái đã đặt hoặc đã xác nhận" :
                        "Hủy lịch hẹn"
                      } placement="bottom">
                        <ActionButton 
                          type="text" 
                          icon={<DeleteOutlined />} 
                          shape="circle"
                          danger={!isAppointmentPassed(record.appointmentDate) && (record.status === "Scheduled" || record.status === "Confirmed")}
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Kiểm tra nhanh điều kiện
                            if (isAppointmentPassed(record.appointmentDate)) {
                              message.error("Không thể hủy lịch hẹn đã qua");
                              return;
                            }
                            
                            if (record.status !== "Scheduled" && record.status !== "Confirmed") {
                              message.error("Chỉ có thể hủy lịch hẹn ở trạng thái đã đặt hoặc đã xác nhận");
                              return;
                            }
                            
                            // Hiển thị modal xác nhận hủy lịch đơn giản
                            showCancelConfirm(record);
                          }}
                          disabled={isAppointmentPassed(record.appointmentDate) || (record.status !== "Scheduled" && record.status !== "Confirmed")}
                          style={{ 
                            cursor: (isAppointmentPassed(record.appointmentDate) || (record.status !== "Scheduled" && record.status !== "Confirmed")) ? 'not-allowed' : 'pointer',
                            color: (isAppointmentPassed(record.appointmentDate) || (record.status !== "Scheduled" && record.status !== "Confirmed")) ? '#d9d9d9' : undefined
                          }}
                        />
                      </Tooltip>
                    </Space>
                  ),
                };
              }
              return col;
            })}
            dataSource={filteredAppointments}
            rowKey="appointmentId"
            pagination={{
              ...tableParams.pagination,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} lịch hẹn`,
              pageSizeOptions: ['10', '20', '50'],
              position: ['bottomCenter']
            }}
            onChange={handleTableChange}
            loading={loading}
            locale={{
              emptyText: (
                <EmptyStateContainer>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_DEFAULT}
                    imageStyle={{ height: 120 }}
                    description={
                      <Space direction="vertical" size="middle" align="center">
                        <Text strong style={{ fontSize: 16 }}>
                          {filteredAppointments.length === 0 && appointments.length > 0 
                            ? 'Không tìm thấy lịch hẹn phù hợp với bộ lọc.'
                            : 'Bạn chưa có lịch hẹn nào.'}
                        </Text>
                        {filteredAppointments.length === 0 && appointments.length === 0 && (
                          <AnimatedButton 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/appointments/add')}
                            size="large"
                            style={{ 
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                              height: '48px',
                              fontSize: '16px'
                            }}
                          >
                            Đặt lịch ngay
                          </AnimatedButton>
                        )}
                      </Space>
                    }
                  />
                </EmptyStateContainer>
              )
            }}
            rowClassName={() => 'animate__animated animate__fadeIn'}
          />
        </StyledCard>
      </div>
    </Content>
  );
};

export default AppointmentList;