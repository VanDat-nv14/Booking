// Cập nhật imports
import React, { useState, useEffect, useCallback, useRef } from 'react';
import dayjs from '../../utils/dayjs'; // Using configured dayjs with plugins
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'; // Thêm dòng này
import axiosClient from '../../utils/axiosClient';
import signalRService from '../../services/signalrService'; // Thêm SignalR service
import {
  generateTimeSlots,
  getAvailableTimeSlots, 
  getAppointmentStatus,
  formatTimeDisplay,
  convert24hTo12h,
  saveSelectedTimeToStorage,
  restoreSelectedTimeFromStorage,
  createDateWithTime
} from '../../utils/dateUtils';

import { 
  Layout, 
  Typography, 
  Button, 
  Steps, 
  Card, 
  Row, 
  Col, 
  Form, 
  Select, 
  Input, 
  DatePicker, 
  TimePicker, 
  message, 
  Divider, 
  Space, 
  Radio, 
  Checkbox, 
  Tooltip, 
  Avatar, 
  Calendar, 
  Badge, 
  Tag, 
  Modal,
  Spin,
  Alert
} from 'antd';
import { theme } from 'antd';
import { 
  ArrowLeftOutlined, 
  CalendarOutlined, 
  ScheduleOutlined, 
  SkinOutlined, 
  UserOutlined, 
  FileTextOutlined, 
  InfoCircleOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  WarningOutlined, 
  CreditCardOutlined, 
  RightOutlined, 
  LeftOutlined, 
  TagOutlined, 
  CheckOutlined, 
  QuestionCircleOutlined, 
  ManOutlined, 
  WomanOutlined,
  GiftOutlined, // Thay thế BirthdayCakeOutlined bằng GiftOutlined
  DashboardOutlined,
  CloseCircleOutlined,
  EditOutlined,
  SendOutlined,
  ReloadOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format, addDays, addWeeks, startOfDay, endOfDay, isAfter, isBefore, parseISO, isToday, isTomorrow } from 'date-fns';
import { vi } from 'date-fns/locale';
import styled, { keyframes } from 'styled-components';
import appointmentService from '../../services/appointmentService';
import petService from '../../services/petService';
import serviceService from '../../services/serviceService';
import staffService from '../../services/staffService';
import useAuth from '../../hooks/useAuth';
import TimeSlotGrid from './TimeSlotGridWrapper'; // Thêm import
import { motion, AnimatePresence } from 'framer-motion';
import appointmentSyncManager from '../../utils/appointmentSync'; // Add sync manager

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { useToken } = theme;
const { RangePicker } = DatePicker;

// Thêm animations
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

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Styled components
const StyledCard = styled(Card)`
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

const PetCard = styled(Card)`
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: visible;
  background: ${props => props.selected ? 'linear-gradient(135deg, #f0f7ff, #e6f7ff)' : 'white'};
  border: 2px solid ${props => props.selected ? '#1890ff' : '#f0f0f0'};
  
  &:hover {
    border-color: #1890ff;
    transform: translateY(-6px);
    box-shadow: 0 10px 20px rgba(24, 144, 255, 0.15);
  }
`;

const ServiceCard = styled(Card)`
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: visible;
  background: ${props => props.selected ? 'linear-gradient(135deg, #e6fffb, #f0f5ff)' : 'white'};
  border: 2px solid ${props => props.selected ? '#13c2c2' : '#f0f0f0'};
  
  &:hover {
    border-color: #13c2c2;
    transform: translateY(-6px);
    box-shadow: 0 10px 20px rgba(19, 194, 194, 0.15);
  }
`;

const StepContent = styled.div`
  margin-top: 24px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
`;

const AnimatedButton = styled(Button)`
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to bottom right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(45deg);
    transition: all 0.3s ease;
  }
  
  &:hover::after {
    animation: ${shimmer} 1.5s ease-in-out;
  }
`;

const FloatingAvatar = styled(Avatar)`
  animation: ${float} 3s ease-in-out infinite;
`;

const PulsatingBadge = styled(Badge)`
  .ant-badge-count {
    animation: ${pulse} 2s infinite;
  }
`;

// Thêm custom PetIcon
const PetIcon = () => (
  <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
    <path d="M923 283.6c-23.8-9.9-48.5-10.1-72.3-0.4c-23.8 9.5-43.2 27.5-54.8 50.7c-23.2 46.5-13.1 102.9 23.3 133c36.1 30.2 88.6 33.1 128.8 7.2c42.8-27.4 61.8-82.5 41.8-131.1c-9.5-22.9-26.9-42.1-49.5-52.2c-5.8-2.6-12-4.6-17.3-7.2zM327.8 366c36.3 0.3 72.4-16.9 95.9-46.3c24.1-29.8 30.3-70.1 16.6-105.7c-13.7-35.9-46.1-62.6-84-69c-36.9-6.1-75.7 5.4-102.3 31.2c-27 26.1-39.5 65-32.7 102.2c6.9 37.4 33.5 69.5 69.4 83.1c12.3 4.7 24.9 7.1 37.1 4.5zM834.2 403.6c-26.8 0-51.5 10.5-69.9 29.7c-18.6 19.4-29 45.4-28.6 72.5c0.4 27.1 11.7 52.7 31 71.3c19.3 18.5 45.1 28.2 71.3 27c26.1-1.3 51-12.8 68.9-32.6c18-19.9 27.1-45.8 25.3-72c-1.8-26.1-12.7-50.7-31-68.5c-18.3-17.7-42.6-27.4-67-27.4zM320 512c0-55.6-21.6-107.8-60.9-147.1C219.8 325.5 167.6 304 112 304S4.2 325.5-35.1 364.9C-74.4 404.2-96 456.4-96 512s21.6 107.8 60.9 147.1C4.2 698.5 56.4 720 112 720s107.8-21.6 147.1-60.9C298.4 619.8 320 567.6 320 512zM112 448c-19.7 0-35.8 16-35.8 35.8c0 19.7 16 35.8 35.8 35.8c20.1 0 35.8-16.1 35.8-35.8c0-19.7-15.8-35.8-35.8-35.8zM208 384c-9.9 0-17.9 8.1-17.9 17.9c0 9.9 8.1 17.9 17.9 17.9c9.9 0 17.9-8.1 17.9-17.9c0-9.9-8-17.9-17.9-17.9zM664.3 435.9c-16.6-25.3-43.2-42.5-73.2-47.1c-30.5-4.3-62.4 3.8-87.5 22.7c-25 18.9-41.3 47.8-44.3 79c-3.1 31.3 7.5 63.2 28.7 86.6c21.1 23.4 51.7 37.2 83.1 37.7c31.3 0.5 62.4-11.9 84.4-33.8c22.1-21.9 34.7-52.8 34.7-84.3c0.1-21.3-8.7-42.6-19.2-60.8c-2.6-4.4-4.5-9.3-6.7-0zM532 448c-9.9 0-17.9 8.1-17.9 17.9c0 9.9 8.1 17.9 17.9 17.9c9.9 0 17.9-8.1 17.9-17.9c0-9.9-8-17.9-17.9-17.9zM880 304c-19.9 0-36 16.1-36 36s16.1 36 36 36s36-16.1 36-36s-16.1-36-36-36z" />
  </svg>
);

// Styled components và helper functions
const StyledCardHeader = ({ icon, title, color = 'primary', action }) => {
  const { token } = useToken();
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      marginBottom: 24,
      paddingBottom: 16,
      borderBottom: `1px solid ${token[color === 'primary' ? 'colorPrimary' : color === 'success' ? 'colorSuccess' : color === 'error' ? 'colorError' : 'colorInfo']}20`
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Avatar 
          style={{ 
            backgroundColor: token[color === 'primary' ? 'colorPrimary' : color === 'success' ? 'colorSuccess' : color === 'error' ? 'colorError' : 'colorInfo'] + '15',
            color: token[color === 'primary' ? 'colorPrimary' : color === 'success' ? 'colorSuccess' : color === 'error' ? 'colorError' : 'colorInfo'],
            marginRight: 12
          }}
          icon={icon}
        />
        <Title level={4} style={{ 
          margin: 0,
          color: token[color === 'primary' ? 'colorPrimary' : color === 'success' ? 'colorSuccess' : color === 'error' ? 'colorError' : 'colorInfo']
        }}>
          {title}
        </Title>
      </div>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

// PetInfoItem component
const PetInfoItem = ({ icon, label, value }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
      {icon}
      <div style={{ marginLeft: 12 }}>
        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
          {label}
        </Text>
        <Text strong style={{ fontSize: '14px' }}>
          {value}
        </Text>
      </div>
    </div>
  );
};

// ServiceInfoItem component
const ServiceInfoItem = ({ icon, label, value }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
      {icon}
      <div style={{ marginLeft: 12 }}>
        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
          {label}
        </Text>
        <Text strong style={{ fontSize: '14px' }}>
          {value}
        </Text>
      </div>
    </div>
  );
};

// Function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

// Function to get the user-friendly formatted date
const getFormattedDate = (date) => {
  if (!date) return '';
  
  try {
    // Kiểm tra nếu đang trong context của formData và có selectedTimeString
    // Đây là một biến tĩnh, không thể truy cập trực tiếp formData từ đây
    // Sẽ ưu tiên sử dụng thông tin thời gian từ Date object
    
    // Format giờ từ đối tượng Date
    const timeFormatted = format(date, 'HH:mm');
    
    // Date object đã tự động điều chỉnh theo múi giờ người dùng
    if (isToday(date)) {
      return `Hôm nay, ${timeFormatted} - ${format(date, 'dd/MM/yyyy')}`;
    } else if (isTomorrow(date)) {
      return `Ngày mai, ${timeFormatted} - ${format(date, 'dd/MM/yyyy')}`;
    } else {
      return `${timeFormatted} - ${format(date, 'EEEE, dd/MM/yyyy', { locale: vi })}`;
    }
  } catch (e) {
    console.error("Error formatting date:", e);
    
    // Fallback nếu format lỗi
    try {
      return date.toLocaleString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e2) {
      console.error("Error in fallback formatting:", e2);
      return String(date);
    }
  }
};

// Cập nhật thông báo giờ làm việc

const validateTimeValue = (time) => {
  // Kiểm tra thời gian có nằm trong giờ mở cửa không (8:00 - 21:30)
  const hour = time.getHours();
  const minute = time.getMinutes();
  
  // Chuyển giờ và phút sang số phút kể từ 00:00
  const totalMinutes = hour * 60 + minute;
  
  // Giờ mở cửa (8:00) và đóng cửa (21:30) tính theo phút
  const openingTime = 8 * 60; // 8:00 = 480 phút
  const closingTime = 21 * 60 + 30; // 21:30 = 1290 phút
  
  return totalMinutes >= openingTime && totalMinutes <= closingTime;
};

// Thêm sau các import
const checkIfTimesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

// Thêm hàm formatDateTimeWithTimeZoneOffset để điều chỉnh múi giờ
const formatDateTimeWithTimeZoneOffset = (date) => {
  // Tính toán độ lệch múi giờ hiện tại (phút)
  const tzOffset = date.getTimezoneOffset();
  
  // Tạo một bản sao của date để không thay đổi giá trị gốc
  const adjustedDate = new Date(date);
  
  // Bù đắp độ lệch để đảm bảo UTC date đúng với local time
  // Ví dụ: nếu ở UTC+7, getTimezoneOffset() trả về -420 phút
  // Chúng ta cần điều chỉnh thêm 420 phút để bù khi chuyển sang UTC
  adjustedDate.setMinutes(adjustedDate.getMinutes() - tzOffset);
  
  return adjustedDate.toISOString();
};

// Thêm hàm điều chỉnh múi giờ khi nhận lịch hẹn từ server
const adjustTimeZoneFromServer = (dateString) => {
  if (!dateString) return null;
  
  // Chuyển đổi chuỗi ISO thành đối tượng Date
  const date = new Date(dateString);
  
  // Đối tượng Date tự động điều chỉnh theo múi giờ địa phương
  // Không cần thêm xử lý gì nữa
  
  return date;
};

// Cập nhật hàm isValidTime để kiểm tra chặt chẽ hơn
const isValidTime = (time) => {
  if (!time) return false;
  
  // Kiểm tra thời gian có nằm trong giờ mở cửa không (8:00 - 21:30)
  const hour = time.getHours();
  const minute = time.getMinutes();
  
  // Chuyển giờ và phút sang số phút kể từ 00:00
  const totalMinutes = hour * 60 + minute;
  
  // Giờ mở cửa (8:00) và đóng cửa (21:30) tính theo phút
  const openingTime = 8 * 60; // 8:00 = 480 phút
  const closingTime = 21 * 60 + 30; // 21:30 = 1290 phút
  
  return totalMinutes >= openingTime && totalMinutes <= closingTime;
};

// Thêm hàm kiểm tra thời gian kết thúc
const isEndTimeValid = (startTime, duration) => {
  if (!startTime) return false;
  
  const endTimeDate = new Date(startTime);
  endTimeDate.setMinutes(endTimeDate.getMinutes() + duration);
  
  const endHour = endTimeDate.getHours();
  const endMinute = endTimeDate.getMinutes();
  const endTotalMinutes = endHour * 60 + endMinute;
  
  // Giờ đóng cửa (21:30)
  const closingTime = 21 * 60 + 30; // 21:30 = 1290 phút
  
  return endTotalMinutes <= closingTime;
};

// Sửa lại hàm generateDefaultTimeSlots để tối ưu hiệu năng
const generateDefaultTimeSlots = (selectedDate, duration = 60, staffId = null) => {
  console.log(`Generating default time slots for date ${selectedDate} with duration ${duration} minutes`);
  
  // Chặn trường hợp selectedDate không hợp lệ
  if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
    console.error('selectedDate không hợp lệ:', selectedDate);
    return [];
  }
  
  // Kiểm tra thiết bị có bộ nhớ thấp không để giảm số lượng slot
  const isLowMemory = checkIsBrowserUsingLowMemory();
  
  // Tạo các khung giờ mặc định
  const slots = [];
  
  // Tạo một bản sao của selectedDate để không ảnh hưởng đến tham số gốc
  const baseDate = new Date(selectedDate);
  
  // Sử dụng timeStep lớn hơn để giảm số khung giờ được tạo
  // Thay vì 15 phút, sử dụng ít nhất 30 phút hoặc thời lượng dịch vụ
  const timeStep = Math.max(30, duration);
  console.log(`Using time step of ${timeStep} minutes based on service duration`);
  
  // Giới hạn số lượng khung giờ tối đa để tránh treo browser
  const MAX_SLOTS = isLowMemory ? 20 : 40;
  
  // Giờ mở cửa và đóng cửa (tính bằng phút từ đầu ngày)
  const openingMinutes = 8 * 60; // 8:00
  const closingMinutes = 21 * 60 + 30; // 21:30
  
  // Biến để theo dõi số slot đã tạo
  let slotCount = 0;
  
  // Giờ hiện tại
  const now = new Date();
  const isToday = baseDate.toDateString() === now.toDateString();
  
  // Nếu là ngày hiện tại, chúng ta bắt đầu từ giờ hiện tại (làm tròn lên)
  let startMinutes = openingMinutes;
  if (isToday) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    // Làm tròn lên đến timeStep phút tiếp theo
    startMinutes = Math.ceil(currentTotalMinutes / timeStep) * timeStep;
  }
  
  // Chỉ tạo slot cho một phạm vi giờ hợp lý, không phải toàn bộ ngày
  for (let currentMinutes = startMinutes; currentMinutes <= closingMinutes - duration; currentMinutes += timeStep) {
    // Kiểm tra số lượng slot để tránh treo browser
    if (slotCount >= MAX_SLOTS) {
      console.log(`Đã đạt đến giới hạn số lượng slot (${MAX_SLOTS}). Dừng tạo slot.`);
      break;
    }
    
    const hour = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;
    
    // Tạo thời gian bắt đầu
    const startTime = new Date(baseDate);
    startTime.setHours(hour, minute, 0, 0);
    
    // Tính thời gian kết thúc dựa trên thời lượng dịch vụ
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    
    // Đảm bảo thời gian kết thúc không vượt quá 21:30
    const maxEndTime = new Date(baseDate);
    maxEndTime.setHours(21, 30, 0, 0);
    
    if (endTime > maxEndTime) {
      continue;
    }
    
    // Kiểm tra nếu thời gian bắt đầu là trong quá khứ (nếu là ngày hiện tại)
    if (isToday && startTime < now) {
      continue;
    }
    
    // Định dạng thời gian
    const formattedStartTime = dayjs(startTime).format('HH:mm');
    
    // Thêm slot vào danh sách với số lượng thuộc tính tối thiểu
    slots.push({
      id: `default-${startTime.getTime()}`,
      startTime: startTime,
      endTime: endTime,
      staffId: staffId || null,
      available: true,
      startTimeString: formattedStartTime,
      duration: duration
    });
    
    slotCount++;
  }
  
  console.log(`Đã tạo ${slots.length} khung giờ với thời lượng dịch vụ ${duration} phút`);
  return slots;
};

// Sửa hàm isTimeSlotBooked để xử lý cả hai định dạng dữ liệu
const isTimeSlotBooked = (timeSlot, appointments, staffId) => {
  if (!appointments || !appointments.length || !staffId) {
    return false;
  }

  // Lấy giờ:phút của timeSlot cần kiểm tra
  const slotTime = typeof timeSlot.format === 'function' 
    ? timeSlot.format('HH:mm') 
    : dayjs(timeSlot).format('HH:mm');
  
  console.log(`Checking if slot ${slotTime} is booked for staff ${staffId}`);
  
  // Kiểm tra trong danh sách appointments
  const isBooked = appointments.some(appointment => {
    // Check by startTime field (from API staff-schedule)
    if (appointment.startTime) {
      return appointment.startTime === slotTime;
    }
    
    // Check by traditional appointmentDate (from other APIs)
    if (appointment.appointmentDate) {
      // Chỉ xét các cuộc hẹn của nhân viên này và không bị hủy/hoàn thành
      if (String(appointment.staffId) !== String(staffId)) {
        return false;
      }
      
      if (['Cancelled', 'No-Show', 'Completed'].includes(appointment.status)) {
        return false;
      }
      
      // Lấy giờ:phút của appointment
      const appointmentTime = dayjs(appointment.appointmentDate).format('HH:mm');
      
      // So sánh trực tiếp giờ:phút
      return slotTime === appointmentTime;
    }
    
    // Check by start field (direct from API)
    if (appointment.start) {
      return appointment.start === slotTime;
    }
    
    return false;
  });

  console.log(`Slot ${slotTime} is ${isBooked ? 'BOOKED' : 'FREE'}`);
  return isBooked;
};

const validateTimeInBusinessHours = (time) => {
  if (!time) return false;
  
  // Kiểm tra thời gian có nằm trong giờ mở cửa không (8:00 - 21:30)
  const hour = time.getHours();
  const minute = time.getMinutes();
  
  // Chuyển giờ và phút sang số phút kể từ 00:00
  const totalMinutes = hour * 60 + minute;
  
  // Giờ mở cửa (8:00) và đóng cửa (21:30) tính theo phút
  const openingTime = 8 * 60; // 8:00 = 480 phút
  const closingTime = 21 * 60 + 30; // 21:30 = 1290 phút
  
  return totalMinutes >= openingTime && totalMinutes <= closingTime;
};

// Add this utility function at the top of the AppointmentForm.js file (after imports)
const getImageUrl = (photoPath) => {
  if (!photoPath) return 'https://via.placeholder.com/300?text=No+Image';
  
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  
  // Lấy phần baseURL từ axiosClient và loại bỏ phần "/api"
  const baseUrl = process.env.REACT_APP_API_URL || 'https://localhost:7164';
  const formattedPath = photoPath.startsWith('/') ? photoPath : '/' + photoPath;
  
  return `${baseUrl}${formattedPath}`;
};

// Cập nhật hàm kiểm tra khả năng hủy lịch hẹn
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

// Hàm validate định dạng ngày
const validateDateFormat = (dateStr) => {
  // Validate format DD/MM/YYYY or DD-MM-YYYY
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }
  
  // Tách chuỗi thành các thành phần
  let day, month, year;
  
  if (dateStr.includes('/')) {
    [day, month, year] = dateStr.split('/');
  } else if (dateStr.includes('-')) {
    [day, month, year] = dateStr.split('-');
  } else {
    return null;
  }
  
  // Chuyển đổi thành số
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10) - 1; // Tháng trong JS là 0-11
  const yearNum = parseInt(year, 10);
  
  if (dayNum < 1 || dayNum > 31 || monthNum < 0 || monthNum > 11) {
    return null;
  }
  
  // Tạo đối tượng Date
  const dateObj = new Date(yearNum, monthNum, dayNum);
  
  // Kiểm tra đối tượng Date hợp lệ
  if (isNaN(dateObj.getTime())) {
    return null;
  }
  
  return dateObj;
};

// Thêm hàm để phát hiện tình trạng bộ nhớ thấp
const checkIsBrowserUsingLowMemory = () => {
  // Phát hiện thiết bị có bộ nhớ thấp hoặc trình duyệt cũ
  const isLowMemoryDevice = 
    // Phát hiện mobile (thường có bộ nhớ thấp)
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    // Safari trên iOS thường có ít bộ nhớ
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream ||
    // Cũ Internet Explorer
    /MSIE|Trident/.test(navigator.userAgent);
    
  return isLowMemoryDevice;
};

// Hàm xử lý time slot trả về đối tượng thông tin thay vì gọi các state setters
// Phiên bản này dùng cho scope global
const processTimeSlot = (slot) => {
  try {
    console.log('Processing time slot:', slot);
    
    // Đối với thiết bị có bộ nhớ thấp, đơn giản hóa các bước xử lý
    const isLowMemory = checkIsBrowserUsingLowMemory();
    
    if (isLowMemory) {
      // Trả về đối tượng đơn giản hóa thay vì gọi setters
      return {
        type: 'LOW_MEMORY',
        selectedTimeSlot: {
          startTime: slot.startTime,
          startTimeString: slot.startTimeString || slot.startTime
        },
        appointmentDate: slot.selectedDateTime || new Date()
      };
    }
    
    // Xử lý thông thường đối với thiết bị có đủ bộ nhớ
    // Lấy startTimeStr từ slot
    let startTimeStr = '';
    if (slot.startTimeString) {
      startTimeStr = slot.startTimeString;
    } else if (slot.startTime) {
      startTimeStr = typeof slot.startTime === 'string' 
        ? slot.startTime 
        : (slot.startTime instanceof Date 
            ? dayjs(slot.startTime).format('HH:mm') 
            : '');
    }
    
    if (!startTimeStr) {
      return { type: 'ERROR', message: 'Không tìm thấy thông tin thời gian trong slot.' };
    }
    
    // Trả về thông tin để component gọi confirmSelectTimeSlot
    return {
      type: 'NORMAL',
      selectedTimeSlot: slot,
      startTimeStr: startTimeStr
    };
  } catch (error) {
    console.error('Error in processTimeSlot:', error);
    return { type: 'ERROR', message: 'Có lỗi xảy ra khi chọn khung giờ. Vui lòng thử lại.' };
  }
};

const AppointmentForm = ({ 
  isEditing = false, 
  userId: propsUserId = null, // Admin có thể truyền userId từ ngoài
  isAdminMode = false, // Chế độ admin
  onSuccess = null // Callback khi tạo thành công
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  // Nếu admin mode, dùng propsUserId, không thì dùng authUser
  const user = isAdminMode && propsUserId ? { userId: propsUserId } : authUser;
  
  const theme = useToken();
  
  console.log("AppointmentForm rendering...");
  console.log("isEditing:", isEditing);
  console.log("isAdminMode:", isAdminMode);
  console.log("propsUserId:", propsUserId);
  console.log("id:", id);
  console.log("user:", user);
  
  // Active step for the form process
  const [activeStep, setActiveStep] = useState(0);
  
  const [formData, setFormData] = useState({
    petId: '',
    serviceId: '',
    staffId: '',
    appointmentDate: new Date(new Date().setMinutes(Math.ceil(new Date().getMinutes() / 30) * 30)),
    notes: ''
  });
  
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [duration, setDuration] = useState(0);
  const [endTime, setEndTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSlotAvailable, setIsSlotAvailable] = useState(null); // null nghĩa là chưa kiểm tra
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]); // Thêm state
  const [fetchingSlots, setFetchingSlots] = useState(false); // Thêm state
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // Thêm state
  const [bookedAppointments, setBookedAppointments] = useState([]); // Thêm state
  
  // Thêm state kiểm tra xem có thể chỉnh sửa không
  const [canEdit, setCanEdit] = useState(true);
  const [timeLeftMessage, setTimeLeftMessage] = useState("");
  
  // Thêm flag để theo dõi xem tối ưu hóa có được kích hoạt không
  const [optimizationEnabled, setOptimizationEnabled] = useState(false);
  
  // Add state for pet busy time slots
  const [petBusyTimeSlots, setPetBusyTimeSlots] = useState([]);
  
  // Thêm state để hiển thị thông báo khi chọn khung giờ
  const [selectedTimeMessage, setSelectedTimeMessage] = useState("");
  
  // Thêm state mới để lưu trữ các cuộc hẹn của thú cưng
  const [petAppointments, setPetAppointments] = useState([]);
  
  // SignalR states cho real-time sharing
  const [signalRConnection, setSignalRConnection] = useState(null);
  // Generate unique user ID for this session/tab
  const [currentUserId] = useState(() => {
    // Try to get existing ID from sessionStorage (tab-specific) first
    let userId = sessionStorage.getItem('currentUserId');
    
    if (!userId) {
      // Generate new unique ID for this tab
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('currentUserId', userId);
      console.log('🆔 [AppointmentForm] Generated new user ID for this tab:', userId);
    } else {
      console.log('🆔 [AppointmentForm] Using existing user ID for this tab:', userId);
    }
    
    return userId;
  });
  
  // **DEBUG: Track petBusyTimeSlots state changes**
  useEffect(() => {
    console.log(`🎯 [AppointmentForm] petBusyTimeSlots state changed:`, {
      count: petBusyTimeSlots?.length || 0,
      slots: petBusyTimeSlots,
      petId: formData.petId,
      date: formData.appointmentDate ? dayjs(formData.appointmentDate).format('YYYY-MM-DD') : 'No date'
    });
    
    // Force trigger TimeSlotGrid re-render
    if (petBusyTimeSlots && petBusyTimeSlots.length > 0) {
      console.log(`🚨 [STATE CHANGE] Pet ${formData.petId} now has ${petBusyTimeSlots.length} busy slots - UI should update`);
    }
  }, [petBusyTimeSlots, formData.petId, formData.appointmentDate]);
  
  // Initialize SignalR connection
  useEffect(() => {
    const initializeSignalR = async () => {
      try {
        console.log('🔌 [AppointmentForm] Initializing SignalR...');
        await signalRService.initialize();
        setSignalRConnection(signalRService.getConnection());
        console.log('✅ [AppointmentForm] SignalR initialized successfully');
        
        // Store userId in localStorage for consistency
        localStorage.setItem('userId', currentUserId);
        localStorage.setItem('userName', user?.name || user?.username || 'Anonymous User');
      } catch (error) {
        console.error('❌ [AppointmentForm] Failed to initialize SignalR:', error);
      }
    };
    
    initializeSignalR();
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 [AppointmentForm] Cleaning up SignalR');
      // Don't disconnect here as other components might be using it
      // signalRService.disconnect();
    };
  }, [currentUserId, user]);

  // **REMOVED: Replaced by enhanced pet data loading above**
  
  // ===== THÊM HÀM generateUserTimeSlots GIỐNG ADMIN =====
  const generateUserTimeSlots = (selectedDate, serviceDuration = 30, petBusySlots = [], staffBusySlots = [], staffAppointments = [], petAppointments = []) => {
    if (!selectedDate) return [];
    
    console.log(`[generateUserTimeSlots] Tạo slots với thời lượng dịch vụ: ${serviceDuration} phút`);
    
    const actualServiceDuration = serviceDuration || 30;
    const bufferTime = 10; // Buffer time 10 phút
    const slotInterval = actualServiceDuration + bufferTime; // Khoảng cách giữa các slot
    
    console.log(`🎯 [generateUserTimeSlots] SLOT CALCULATION:`, {
      inputServiceDuration: serviceDuration,
      actualServiceDuration: actualServiceDuration,
      bufferTime: bufferTime,
      calculatedSlotInterval: slotInterval,
      formula: `${actualServiceDuration} + ${bufferTime} = ${slotInterval} minutes`
    });
    
    const slots = [];
    const date = new Date(selectedDate);
    
    // Giờ làm việc: 8:00 - 21:30
    const startTime = 8 * 60; // 8:00 in minutes
    const endTime = 21 * 60 + 30; // 21:30 in minutes
    
    // ✅ FIXED: Kiểm tra slot kết thúc không quá 21:30 thay vì chỉ kiểm tra start time
    for (let currentTime = startTime; currentTime < endTime; currentTime += slotInterval) {
      // Kiểm tra slot có kết thúc trước hoặc tại 21:30 không
      const slotEndTime = currentTime + actualServiceDuration;
      if (slotEndTime > endTime) {
        console.log(`⏰ Slot ${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${(currentTime % 60).toString().padStart(2, '0')} bị bỏ qua vì sẽ kết thúc sau 21:30`);
        break;
      }
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const slotStartStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Tính thời gian kết thúc dịch vụ (không bao gồm buffer trong display)
      const serviceEndMinutes = currentTime + actualServiceDuration;
      const serviceEndHours = Math.floor(serviceEndMinutes / 60);
      const serviceEndMins = serviceEndMinutes % 60;
      const slotEndStr = `${serviceEndHours.toString().padStart(2, '0')}:${serviceEndMins.toString().padStart(2, '0')}`;
      
      // **ENHANCED LOGIC**: Kiểm tra slot có bị trùng với lịch bận không (dựa vào overlap thay vì exact match)
      let isPetBusy = petBusySlots.includes(slotStartStr); // Check exact match first
      
             // **NEW**: Check overlap with pet appointments if not exact match
       if (!isPetBusy && petAppointments && petAppointments.length > 0) {
         console.log(`🔍 [PET OVERLAP] Checking slot ${slotStartStr} against ${petAppointments.length} pet appointments`);
         isPetBusy = petAppointments.some(apt => {
          const aptStartTime = dayjs(apt.appointmentDate).format('HH:mm');
          const aptDuration = apt.duration || apt.serviceDuration || apt.service?.duration || 30;
          const aptEndTime = dayjs(`2023-01-01T${aptStartTime}`).add(aptDuration, 'minute').format('HH:mm');
          
          const slotEndTime = dayjs(`2023-01-01T${slotStartStr}`).add(actualServiceDuration, 'minute').format('HH:mm');
          
          // 🔧 FIXED: Correct overlap logic for pet appointments
          const aptStart = dayjs(`2023-01-01T${aptStartTime}`);
          const aptEnd = dayjs(`2023-01-01T${aptEndTime}`);
          const slotStart = dayjs(`2023-01-01T${slotStartStr}`);
          const slotEnd = dayjs(`2023-01-01T${slotEndTime}`);
          
          // Two time periods overlap if: Start1 < End2 AND Start2 < End1
          const hasOverlap = slotStart.isBefore(aptEnd) && aptStart.isBefore(slotEnd);
          
          if (hasOverlap) {
            // Calculate exact overlap duration
            const overlapStart = slotStart.isAfter(aptStart) ? slotStart : aptStart;
            const overlapEnd = slotEnd.isBefore(aptEnd) ? slotEnd : aptEnd;
            const overlapDuration = overlapEnd.diff(overlapStart, 'minute');
            
            // Mark as busy if there's any meaningful overlap (more than 1 minute)
            const isSignificantOverlap = overlapDuration >= 1;
            
            console.log(`🐕 [PET OVERLAP CHECK] Slot ${slotStartStr}-${slotEndTime} vs Pet Appointment ${aptStartTime}-${aptEndTime}:`, {
              hasOverlap,
              overlapDuration,
              isSignificantOverlap
            });
            
            return isSignificantOverlap;
          } else {
            console.log(`✅ [NO PET OVERLAP] Slot ${slotStartStr}-${slotEndTime} does NOT overlap with pet appointment ${aptStartTime}-${aptEndTime}`);
            return false;
          }
          
          return false;
        });
      }
      
      // Staff busy check: kiểm tra theo cả start time và overlap với appointments
      let isStaffBusy = staffBusySlots.includes(slotStartStr);
      
      // 🔍 DEBUG: Log staffBusySlots for specific slots
      if (slotStartStr === '13:50' || slotStartStr === '19:40') {
        console.log(`🔍 [DEBUG] Staff busy check for slot ${slotStartStr}:`, {
          slotStartStr,
          staffBusySlots,
          isStaffBusy,
          staffAppointmentsCount: staffAppointments ? staffAppointments.length : 0
        });
      }
      
              // Additional check: if we have staff appointments data, check for duration overlap
        if (!isStaffBusy && staffAppointments && staffAppointments.length > 0) {
        // 🔍 DEBUG: Log staff appointments for debugging
        if (slotStartStr === '13:50' || slotStartStr === '19:40') {
          console.log(`🔍 [DEBUG] Staff appointments for slot ${slotStartStr}:`, staffAppointments.map(apt => ({
            staffId: apt.staffId,
            appointmentDate: apt.appointmentDate,
            startTime: dayjs(apt.appointmentDate).format('HH:mm'),
            duration: apt.duration || apt.serviceDuration || apt.service?.duration || 30
          })));
        }
        
        isStaffBusy = staffAppointments.some(apt => {
          const aptStartTime = dayjs(apt.appointmentDate).format('HH:mm');
          const aptDuration = apt.duration || apt.serviceDuration || apt.service?.duration || 30;
          const aptEndTime = dayjs(`2023-01-01T${aptStartTime}`).add(aptDuration, 'minute').format('HH:mm');
          
          // Check if this slot overlaps with the appointment
          const slotEndTime = dayjs(`2023-01-01T${slotStartStr}`).add(actualServiceDuration, 'minute').format('HH:mm');
          
          const aptStart = dayjs(`2023-01-01T${aptStartTime}`);
          const aptEnd = dayjs(`2023-01-01T${aptEndTime}`);
          const slotStart = dayjs(`2023-01-01T${slotStartStr}`);
          const slotEnd = dayjs(`2023-01-01T${slotEndTime}`);
          
          // 🔧 FIXED: Correct overlap logic - slots should only be busy if they actually overlap
          // Two time periods overlap if: Start1 < End2 AND Start2 < End1
          const hasOverlap = slotStart.isBefore(aptEnd) && aptStart.isBefore(slotEnd);
          
          console.log(`👤 [OVERLAP CHECK] Slot ${slotStartStr}-${slotEndTime} vs Appointment ${aptStartTime}-${aptEndTime}:`, {
            hasOverlap,
            slotStart: slotStart.format('HH:mm'),
            slotEnd: slotEnd.format('HH:mm'),
            aptStart: aptStart.format('HH:mm'),
            aptEnd: aptEnd.format('HH:mm'),
            check1: `${slotStart.format('HH:mm')} < ${aptEnd.format('HH:mm')} = ${slotStart.isBefore(aptEnd)}`,
            check2: `${aptStart.format('HH:mm')} < ${slotEnd.format('HH:mm')} = ${aptStart.isBefore(slotEnd)}`
          });
          
          if (hasOverlap) {
            // Calculate exact overlap duration
            const overlapStart = slotStart.isAfter(aptStart) ? slotStart : aptStart;
            const overlapEnd = slotEnd.isBefore(aptEnd) ? slotEnd : aptEnd;
            const overlapDuration = overlapEnd.diff(overlapStart, 'minute');
            
            // Mark as busy if there's any meaningful overlap (more than 1 minute)
            const isSignificantOverlap = overlapDuration >= 1;
            
            console.log(`👤 [OVERLAP RESULT] Overlap duration: ${overlapDuration} minutes, significant: ${isSignificantOverlap}`);
            return isSignificantOverlap;
          } else {
            console.log(`✅ [NO OVERLAP] Slot ${slotStartStr}-${slotEndTime} does NOT overlap with appointment ${aptStartTime}-${aptEndTime}`);
            return false;
          }
          
          return false;
        });
      }
      
      // 🔍 DEBUG: Log specific slot check - especially for current time slot
      const currentTime = dayjs().format('HH:mm');
      if (slotStartStr === '13:50' || slotStartStr === '19:40' || slotStartStr === currentTime || isPetBusy || isStaffBusy) {
        console.log(`🔍 [SLOT DEBUG] ${slotStartStr} check (current time: ${currentTime}):`, {
          slotStartStr: slotStartStr,
          currentTime: currentTime,
          isCurrentTimeSlot: slotStartStr <= currentTime && currentTime < slotEndStr,
          petBusySlots: petBusySlots,
          isPetBusy: isPetBusy,
          staffBusySlots: staffBusySlots,
          staffAppointmentsCount: staffAppointments ? staffAppointments.length : 0,
          isStaffBusy: isStaffBusy,
          finalAvailable: !isPetBusy && !isStaffBusy
        });
      }
      
      const slotData = {
        id: `user-slot-${slotStartStr.replace(':', '-')}`,
        startTime: slotStartStr,
        endTime: slotEndStr,
        duration: actualServiceDuration,
        bufferTime: bufferTime,
        display: `${slotStartStr} - ${slotEndStr}`,
        available: !isPetBusy && !isStaffBusy,
        isPetBusy: isPetBusy,
        isStaffBusy: isStaffBusy,
        busyReason: isPetBusy ? 'Thú cưng có lịch' : (isStaffBusy ? 'Nhân viên có lịch' : null)
      };
      
      slots.push(slotData);
    }
    
    console.log(`[generateUserTimeSlots] Đã tạo ${slots.length} slots với interval ${slotInterval} phút (ADMIN-COMPATIBLE)`);
    return slots;
  };

  const fetchStaffForSelectedService = async (serviceId) => {
    try {
      setLoading(true);
      const staffData = await staffService.getStaffByService(serviceId);
      if (Array.isArray(staffData)) {
        setStaff(staffData);
      }
    } catch (error) {
      console.error("Error fetching staff for service:", error);
      message.error("Không thể tải danh sách nhân viên cho dịch vụ này");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate form data
      let isValid = true;
      const errors = {};
      
      if (!formData.petId) {
        errors.petId = "Vui lòng chọn thú cưng";
        isValid = false;
      }
      
      if (!formData.serviceId) {
        errors.serviceId = "Vui lòng chọn dịch vụ";
        isValid = false;
      }
      
      if (!formData.appointmentDate) {
        errors.appointmentDate = "Vui lòng chọn ngày hẹn";
        isValid = false;
      }
      
      // Thêm validation chi tiết cho ngày giờ
      if (formData.appointmentDate) {
        const dateTimeErrors = validateAppointmentDateTime(formData.appointmentDate, formData.selectedTimeSlot);
        if (dateTimeErrors.length > 0) {
          errors.appointmentDate = dateTimeErrors[0]; // Hiển thị lỗi đầu tiên
          isValid = false;
        }
      }
      
      if (!isValid) {
        setValidationErrors(errors);
        setLoading(false);
        return;
      }
      
      // Log dữ liệu trước khi gửi
      console.log('📋 Dữ liệu form hiện tại:', formData);
      console.log('⏰ Thời gian đặt lịch:', formData.appointmentDate);
      console.log('🎯 Time slot đã chọn:', formData.selectedTimeSlot);
      console.log('🔍 [SUBMIT] selectedService data:', selectedService);
      console.log('🔍 [SUBMIT] selectedService.duration:', selectedService?.duration);
      console.log('🔍 [SUBMIT] formData.serviceDuration:', formData.serviceDuration);
      
      // ✅ SỬ DỤNG DURATION TỪ SLOT ĐÃ CHỌN THAY VÌ formData.serviceDuration
      const actualServiceDuration = formData.selectedTimeSlot?.actualServiceDuration || selectedService?.duration || 20;
      console.log('🎯 [SUBMIT] Sử dụng actualServiceDuration từ slot:', actualServiceDuration);
      
      // Chuẩn bị appointmentDate để gửi đi
      let appointmentDateToSend = formData.appointmentDate;
      
      // Nếu có selectedTimeSlot với thông tin giờ chính xác, ưu tiên sử dụng
      if (formData.selectedTimeSlot && 
          formData.selectedTimeSlot.exactHour !== undefined && 
          formData.selectedTimeSlot.exactMinute !== undefined) {
        
        console.log('🎯 Sử dụng thông tin giờ từ selectedTimeSlot');
        
        try {
          // Lấy ngày từ appointmentDate hiện tại
          let baseDate;
          
          if (formData.appointmentDate instanceof Date) {
            baseDate = new Date(formData.appointmentDate);
          } else if (typeof formData.appointmentDate === 'string') {
            baseDate = new Date(formData.appointmentDate);
          } else {
            // Fallback: sử dụng ngày hiện tại
            baseDate = new Date();
            console.warn('⚠️ Không thể xác định ngày từ appointmentDate, sử dụng ngày hiện tại');
          }
          
          // Đặt giờ phút từ selectedTimeSlot vào ngày đã chọn
          const { exactHour, exactMinute } = formData.selectedTimeSlot;
          baseDate.setHours(exactHour, exactMinute, 0, 0);
          
          // Tạo chuỗi ISO local (không có Z)
          const year = baseDate.getFullYear();
          const month = String(baseDate.getMonth() + 1).padStart(2, '0');
          const day = String(baseDate.getDate()).padStart(2, '0');
          const hours = String(exactHour).padStart(2, '0');
          const minutes = String(exactMinute).padStart(2, '0');
          
          appointmentDateToSend = `${year}-${month}-${day}T${hours}:${minutes}:00`;
          
          console.log('✅ Đã tạo appointmentDate từ selectedTimeSlot:', appointmentDateToSend);
          console.log(`📅 Ngày: ${year}-${month}-${day}, ⏰ Giờ: ${hours}:${minutes}`);
          
        } catch (error) {
          console.error('❌ Lỗi khi xử lý thời gian từ selectedTimeSlot:', error);
          console.log('🔄 Fallback: sử dụng appointmentDate gốc');
        }
      } else if (formData.selectedTimeString) {
        // Nếu chỉ có selectedTimeString, kết hợp với appointmentDate
        console.log('📝 Sử dụng selectedTimeString:', formData.selectedTimeString);
        
        try {
          let baseDate;
          
          if (formData.appointmentDate instanceof Date) {
            baseDate = dayjs(formData.appointmentDate);
          } else {
            baseDate = dayjs(formData.appointmentDate);
          }
          
          // Parse thời gian từ selectedTimeString (format HH:mm)
          const [hours, minutes] = formData.selectedTimeString.split(':').map(Number);
          
          // Tạo đối tượng Date với ngày và giờ mới
          const finalDateTime = baseDate.hour(hours).minute(minutes).second(0).millisecond(0);
          
          // Tạo chuỗi ISO local
          appointmentDateToSend = finalDateTime.format('YYYY-MM-DDTHH:mm:ss');
          
          console.log('✅ Đã tạo appointmentDate từ selectedTimeString:', appointmentDateToSend);
          
        } catch (error) {
          console.error('❌ Lỗi khi xử lý selectedTimeString:', error);
          console.log('🔄 Fallback: sử dụng appointmentDate gốc');
        }
      } else {
        console.log('ℹ️ Không có thông tin time slot cụ thể, sử dụng appointmentDate gốc');
      }
      
      // Tạo object dữ liệu để gửi đi
      const appointmentData = {
        petId: parseInt(formData.petId),
        serviceId: parseInt(formData.serviceId),
        appointmentDate: appointmentDateToSend,
        notes: formData.notes || "",
        // Thêm thông tin chi tiết về thời gian đã chọn
        exactHour: formData.selectedTimeSlot?.exactHour,
        exactMinute: formData.selectedTimeSlot?.exactMinute,
        selectedTimeString: formData.selectedTimeString,
        // Thông tin múi giờ
        timeZoneOffset: new Date().getTimezoneOffset(),
        clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      // ✅ CHỈ THÊM staffId KHI CÓ NHÂN VIÊN ĐƯỢC CHỌN  
      if (formData.staffId && formData.staffId !== "" && formData.staffId !== "0") {
        appointmentData.staffId = parseInt(formData.staffId);
        console.log('🎯 [SUBMIT] Thêm staffId do user chọn:', appointmentData.staffId);
      } else {
        console.log('🎯 [SUBMIT] KHÔNG gửi staffId - để backend xử lý "Chưa phân công"');
        // Không thêm staffId vào appointmentData - backend sẽ handle null/undefined staffId
      }
      
      console.log('📤 Dữ liệu cuối cùng sẽ gửi lên server:', appointmentData);
      
      // DEBUG: Kiểm tra busy slots hiện tại
              console.log('🔍 [DEBUG] Current pet busy slots:', petBusyTimeSlots);
        console.log('🔍 [DEBUG] LocalStorage debug keys:');
        const storageKeys = Object.keys(localStorage).filter(key => key.includes('petBusy') || key.includes('debug'));
        storageKeys.forEach(key => {
          console.log(`  - ${key}: ${localStorage.getItem(key)}`);
        });
        
        // DEBUG: Hiển thị toàn bộ appointmentData sẽ gửi
        console.log('🚀 [DEBUG FULL DATA] appointmentData sẽ gửi:');
        console.log('  - petId:', appointmentData.petId);
        console.log('  - serviceId:', appointmentData.serviceId);
        console.log('  - appointmentDate:', appointmentData.appointmentDate);
        console.log('  - staffId:', appointmentData.staffId || 'KHÔNG CÓ');
        console.log('  - notes:', appointmentData.notes);
        console.log('  - Full object:', JSON.stringify(appointmentData, null, 2));
      
      let response;
      
      // Kiểm tra xem đang là tạo mới hay cập nhật
      if (isEditing && id) {
        console.log(`🔄 Đang cập nhật lịch hẹn có ID: ${id}`);
        
        // Gọi API cập nhật lịch hẹn
        response = await appointmentService.updateAppointment(id, appointmentData);
        
        console.log('✅ Kết quả cập nhật lịch hẹn:', response);
        
        if (response) {
          message.success('Cập nhật lịch hẹn thành công!');
          console.log('🎉 Chuyển hướng về danh sách lịch hẹn');
          navigate('/appointments');
        } else {
          message.error('Có lỗi xảy ra khi cập nhật lịch hẹn.');
        }
      } else {
        console.log('✨ Đang tạo lịch hẹn mới');
        
        // Log thông tin debug trước khi gọi API
        console.log('🔍 Thông tin debug trước khi tạo lịch:');
        console.log('  - Ngày hiện tại:', dayjs().format('DD/MM/YYYY HH:mm'));
        console.log('  - Ngày đặt lịch:', dayjs(appointmentDateToSend).format('DD/MM/YYYY HH:mm'));
        console.log('  - Thú cưng ID:', appointmentData.petId);
        console.log('  - Dịch vụ ID:', appointmentData.serviceId);
        console.log('  - Nhân viên ID:', appointmentData.staffId || 'Không chỉ định');
        
        // Gọi API tạo lịch hẹn
        response = await appointmentService.createAppointment(appointmentData);
        
        console.log('✅ Kết quả từ server:', response);
        
        if (response && (response.id || response.appointmentId)) {
          message.success('Đặt lịch hẹn thành công!');
          console.log('🎉 Lịch hẹn đã được tạo với ID:', response.id || response.appointmentId);
          
          // **ĐỒNG BỘ: KHI TẠO APPOINTMENT, HỆ THỐNG SẼ TỰ ĐỘNG CẬP NHẬT DATABASE**
          // Không cần lưu localStorage vì backend database đã handle
          console.log(`✅ [USER SYNC] Appointment created successfully, backend database will be updated automatically`);
          
          // **Trigger refresh để đồng bộ với admin**
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refresh-all-timeslots', {
              detail: {
                reason: 'appointment-created',
                appointmentId: response.id || response.appointmentId,
                petId: formData.petId,
                date: formData.appointmentDate
              }
            }));
          }, 500);
          
          // Nếu có callback (dùng trong admin mode), gọi callback
          if (isAdminMode && onSuccess) {
            console.log('🔄 [ADMIN MODE] Gọi callback onSuccess');
            onSuccess(response);
          } else {
            console.log('🔄 Chuyển hướng về danh sách lịch hẹn');
            navigate('/appointments');
          }
        } else {
          console.warn('⚠️ Server trả về response không mong đợi:', response);
          message.error('Có lỗi xảy ra khi đặt lịch hẹn.');
        }
      }
    } catch (error) {
      console.error('Lỗi khi xử lý lịch hẹn:', error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.response) {
        console.error('❌ [SUBMIT ERROR] Full error response:', error.response);
        console.error('❌ [SUBMIT ERROR] Error data:', error.response.data);
        console.error('❌ [SUBMIT ERROR] Error status:', error.response.status);
        console.error('❌ [SUBMIT ERROR] Error message:', error.response.data?.message || error.response.data);
        
        // Hiển thị lỗi chi tiết hơn cho user
        const errorMessage = error.response.data?.message || error.response.data || 'Không thể xử lý lịch hẹn';
        message.error(`Lỗi ${error.response.status}: ${errorMessage}`);
      } else if (error.request) {
        console.error('Lỗi request:', error.request);
        message.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        message.error('Có lỗi xảy ra: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    console.log(`🔍 [HANDLE NEXT] activeStep=${activeStep}, formData:`, {
      petId: formData.petId,
      serviceId: formData.serviceId,
      appointmentDate: formData.appointmentDate,
      selectedTimeString: formData.selectedTimeString
    });
    console.log(`🔍 [HANDLE NEXT] selectedTimeSlot:`, selectedTimeSlot);
    
    let isValid = true;
    const errors = {};
    
    if (activeStep === 0 && !formData.petId) {
      errors.petId = "Vui lòng chọn thú cưng";
      isValid = false;
    }
    
    if (activeStep === 1 && !formData.serviceId) {
      errors.serviceId = "Vui lòng chọn dịch vụ";
      isValid = false;
    }
    
    if (activeStep === 2) {
      if (!formData.appointmentDate) {
        errors.appointmentDate = "Vui lòng chọn ngày hẹn";
        isValid = false;
      }
      
      // THÊM KIỂM TRA SLOT ĐÃ CHỌN
      if (!selectedTimeSlot || !formData.selectedTimeString) {
        errors.slot = "Vui lòng chọn khung giờ";
        isValid = false;
        console.log(`🚫 [HANDLE NEXT] Missing time slot selection`);
      }
    }
    
    console.log(`🔍 [HANDLE NEXT] Validation result: isValid=${isValid}, errors:`, errors);
    
    if (!isValid) {
      setValidationErrors(errors);
      return;
    }
    
    // **CRITICAL: Refresh pet data when moving from step 1 to step 2**
    if (activeStep === 1 && formData.petId && formData.appointmentDate) {
      try {
        const dateStr = dayjs(formData.appointmentDate).format('YYYY-MM-DD');
        console.log(`🔄 [STEP TRANSITION] Moving to step 2 - force refreshing pet data for pet ${formData.petId} on ${dateStr}`);
        
        message.loading({ content: 'Đang kiểm tra lịch của thú cưng...', key: 'petRefresh' });
        
        // **FORCE CLEAR CACHE FIRST**
        const cacheKey = `petBusySlots_${formData.petId}_${dateStr}`;
        localStorage.removeItem(cacheKey);
        
        // Force refresh pet busy slots
        const freshPetBusySlots = await appointmentService.getPetBusyTimeSlots(formData.petId, dateStr);
        const freshPetAppointments = await appointmentService.getPetAppointments(formData.petId, dateStr);
        
        console.log(`✅ [STEP TRANSITION] Fresh data loaded:`, {
          busySlots: freshPetBusySlots.length,
          appointments: freshPetAppointments.length,
          busySlotsData: freshPetBusySlots,
          appointmentsData: freshPetAppointments
        });
        
        setPetBusyTimeSlots(freshPetBusySlots || []);
        setPetAppointments(freshPetAppointments || []);
        
        message.success({ content: 'Đã cập nhật lịch thú cưng', key: 'petRefresh', duration: 2 });
      } catch (error) {
        console.error('❌ [STEP TRANSITION] Error refreshing pet data:', error);
        message.error({ content: 'Không thể cập nhật lịch thú cưng', key: 'petRefresh' });
      }
    }
    
    console.log(`✅ [HANDLE NEXT] Moving to step ${activeStep + 1}`);
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  useEffect(() => {
    // Chỉ kiểm tra khi đang ở chế độ chỉnh sửa (isEditing = true)
    if (isEditing && formData.appointmentDate) {
      const now = new Date();
      const appointmentTime = new Date(formData.appointmentDate);
      const hoursLeft = (appointmentTime - now) / (1000 * 60 * 60);
      
      if (hoursLeft < 24) {
        setCanEdit(false);
        setTimeLeftMessage(`Lịch hẹn chỉ có thể cập nhật ít nhất 24 giờ trước thời gian đã đặt. 
                          Hiện tại còn ${Math.max(0, Math.floor(hoursLeft))} giờ ${Math.max(0, Math.floor((hoursLeft % 1) * 60))} phút.`);
      } else {
        setCanEdit(true);
        setTimeLeftMessage("");
      }
    }
  }, [isEditing, formData.appointmentDate]);
  
  // Thêm hàm checkTimeSlotAvailability ở đây
  const checkTimeSlotAvailability = async (date, serviceId, staffId = null) => {
    if (!date || !serviceId) return true; // Return true by default if missing required parameters
    
    try {
      setCheckingAvailability(true);
      setIsSlotAvailable(null);
      
      console.log("Checking availability for:", {
        date: date instanceof Date ? date.toISOString() : date,
        serviceId,
        staffId: staffId || null,
        petId: formData.petId || null // Thêm petId từ formData
      });
      
      // Gọi service để kiểm tra khả dụng của slot - đã được cập nhật trong appointmentService.js
      // để sử dụng tham số dateStr và petIdStr
      const result = await appointmentService.checkTimeSlotAvailability(
        date,
        serviceId,
        staffId,
        formData.petId // Truyền petId từ formData
      );
      
      console.log("Slot availability check result:", result);
      
      // Kiểm tra nếu kết quả có message về lỗi hoặc mặc định
      if (result && result.message && (result.message.includes("mặc định") || result.message.includes("lỗi kết nối"))) {
        // Nếu là lỗi API nhưng đã trả về kết quả mặc định, vẫn cho phép tiếp tục
        console.log("Using default availability due to API error");
        message.warning("Không thể kiểm tra tính khả dụng của khung giờ do lỗi kết nối. Hệ thống sẽ cho phép bạn tiếp tục.");
        setIsSlotAvailable(true);
        setValidationErrors(prev => ({
          ...prev,
          slot: ""
        }));
        return true;
      }
      
      // Xử lý kết quả bình thường
      const isAvailable = result && (result.available === true || result.isAvailable === true);
      setIsSlotAvailable(isAvailable);
      
      if (!isAvailable) {
        const reason = result && result.reason ? result.reason : "Khung giờ đã được đặt. Vui lòng chọn thời gian khác.";
        setValidationErrors(prev => ({
          ...prev,
          slot: reason
        }));
        message.error(reason + " Bạn vẫn có thể tiếp tục, nhưng lưu ý rằng cuộc hẹn có thể bị trùng lịch.");
      } else {
        setValidationErrors(prev => ({
          ...prev,
          slot: ""
        }));
      }
      
      return isAvailable;
    } catch (error) {
      console.error("Error checking time slot availability:", error);
      // Trong trường hợp lỗi, vẫn cho phép tiếp tục nhưng hiển thị cảnh báo
      message.warning("Không thể kiểm tra trạng thái khả dụng do lỗi kết nối. Bạn vẫn có thể tiếp tục đặt lịch.");
      setIsSlotAvailable(true);
      setValidationErrors(prev => ({
        ...prev,
        slot: "Không thể kiểm tra trạng thái khả dụng. Vui lòng thử lại sau khi đặt lịch."
      }));
      return true; // Vẫn trả về true để cho phép tiếp tục
    } finally {
      setCheckingAvailability(false);
    }
  };
  
  // Sửa hàm checkStaffSchedule để gửi thông báo và cập nhật UI hiệu quả hơn
  const checkStaffSchedule = async (staffId, date) => {
    try {
      // Hiển thị thông báo đang kiểm tra
      message.loading({ content: 'Đang kiểm tra lịch của nhân viên...', key: 'staffCheck' });
      
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      console.log(`Checking staff ${staffId} schedule on ${formattedDate}`);
      
      // Gọi API kiểm tra lịch nhân viên
      const response = await appointmentService.checkStaffSchedule(staffId, formattedDate);
      
      // Log kết quả để debug
      console.log("👨‍⚕️ [STAFF SCHEDULE] Response:", response);
      console.log("👨‍⚕️ [STAFF SCHEDULE] Appointments:", response?.appointments);
      console.log("👨‍⚕️ [STAFF SCHEDULE] Appointments count:", response?.appointments?.length || 0);
      
      // Kiểm tra dữ liệu trả về
      if (response && response.appointments && Array.isArray(response.appointments)) {
        // Thông báo kết quả kiểm tra
        if (response.appointments.length > 0) {
          message.warning({
            content: `Nhân viên đã có ${response.appointments.length} lịch hẹn vào ngày này. Các khung giờ bận sẽ không thể chọn.`,
            key: 'staffCheck',
            duration: 5
          });
        } else {
          message.success({
            content: 'Nhân viên còn trống lịch vào ngày này.',
            key: 'staffCheck',
            duration: 2
          });
        }

        // Cập nhật state
        setBookedAppointments(response.appointments);
        
        // Thêm xử lý để đánh dấu UI và cập nhật giao diện
        // Phát sự kiện để component TimeSlotGrid cập nhật hiển thị
        window.dispatchEvent(new CustomEvent('staff-appointments-updated', {
          detail: {
            staffId: staffId,
            appointments: response.appointments,
            date: formattedDate
          }
        }));
        
        // Sau khi nhận kết quả, yêu cầu refresh giao diện
        window.dispatchEvent(new CustomEvent('refresh-timeslot-ui', {
          detail: {
            type: 'staff-schedule-updated',
            staffId: staffId
          }
        }));
      }
      
      return response;
    } catch (error) {
      console.error("Error checking staff schedule:", error);
      message.error({
        content: 'Không thể kiểm tra lịch của nhân viên',
        key: 'staffCheck'
      });
      
      // Trả về mặc định để tránh crash
      return { 
        isWorking: true, 
        staffName: "Error",
        workingHours: [],
        appointments: []
      };
    }
  };

  // Thêm handler cho việc chọn time slot
  const handleSelectTimeSlot = (slot) => {
    console.log("🚨 [HANDLER CALLED] handleSelectTimeSlot called with slot:", slot);
    
    if (!slot) {
      console.log("❌ [HANDLER] Slot is null/undefined, returning early");
      return;
    }
    
    console.log("🎯 [SLOT SELECTION] User clicked slot:", slot);
    console.log("🎯 [SLOT SELECTION] Current selectedTimeSlot before update:", selectedTimeSlot);
    
    // Sử dụng debounce để tránh xử lý nhiều lần liên tiếp
    if (window.timeSlotSelectionTimeout) {
      console.log("🎯 [SLOT SELECTION] Clearing previous timeout");
      clearTimeout(window.timeSlotSelectionTimeout);
    }

    window.timeSlotSelectionTimeout = setTimeout(() => {
      try {
        // Kiểm tra xem thú cưng có bận vào khung giờ này không
        const timeStr = slot.startTime instanceof Date 
          ? dayjs(slot.startTime).format('HH:mm') 
          : (typeof slot.startTime === 'string' ? slot.startTime : slot.startTimeString || slot.timeDisplayString);
        
        console.log("Checking if pet is busy at time:", timeStr);

        // Lấy thông tin khung giờ bận từ cache trước
        const cacheKey = `petBusySlots_${formData.petId}_${dayjs(formData.appointmentDate).format('YYYY-MM-DD')}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData) {
          try {
            const busySlots = JSON.parse(cachedData);
            
            if (busySlots && Array.isArray(busySlots) && busySlots.includes(timeStr)) {
              console.error(`Thú cưng đã có lịch hẹn vào khung giờ ${timeStr}`);
              message.error({
                content: `Thú cưng của bạn đã có lịch hẹn vào khung giờ ${timeStr}. Vui lòng chọn khung giờ khác.`,
                key: 'pet-busy-error'
              });
              return; // Ngăn không cho chọn slot này
          }
        } catch (e) {
            console.error('Lỗi khi parse dữ liệu từ cache:', e);
          }
        }
        
        // Chỉ cập nhật state khi thực sự cần thiết
        const isDifferentSlot = !selectedTimeSlot || 
                              selectedTimeSlot.id !== slot.id || 
                              selectedTimeSlot.startTime?.toString() !== slot.startTime?.toString();
        
        if (isDifferentSlot) {
          // Tạo và lưu trữ time slot
          console.log("🎯 [SLOT SELECTION] Setting new selectedTimeSlot:", slot);
          setSelectedTimeSlot(slot);
          
          // Sử dụng selectedDateTime từ slot nếu có, nếu không thì tạo mới
          let startTime;
          if (slot.selectedDateTime) {
            console.log("Using pre-calculated selectedDateTime:", slot.selectedDateTime);
            startTime = slot.selectedDateTime;
          } else if (slot.startTime instanceof Date) {
            startTime = slot.startTime;
          } else if (typeof slot.startTime === 'string') {
            // Chuyển đổi từ string 'HH:mm' thành Date object
            const [hours, minutes] = slot.startTime.split(':').map(Number);
            startTime = dayjs(formData.appointmentDate)
                          .hour(hours)
                          .minute(minutes)
                          .second(0)
                          .toDate();
          } else if (slot.startTimeString) {
            // Fallback nếu startTime không phải string hoặc Date
            const [hours, minutes] = slot.startTimeString.split(':').map(Number);
            startTime = dayjs(formData.appointmentDate)
                          .hour(hours)
                          .minute(minutes)
                          .second(0)
                          .toDate();
          }
          
          // Cập nhật form data
          if (startTime) {
            const dateTimeString = dayjs(startTime).format('YYYY-MM-DD HH:mm:ss');
            
            // Tính thời gian kết thúc dự kiến - SỬ DỤNG DURATION TỪ SLOT HOẶC SELECTEDSERVICE
            const actualServiceDuration = slot.actualServiceDuration || selectedService?.duration || 20;
            const endTime = dayjs(startTime).add(actualServiceDuration, 'minutes').toDate();
            const endTimeString = dayjs(endTime).format('YYYY-MM-DD HH:mm:ss');
            console.log(`🎯 [SLOT SELECTION] Tính endTime với actualServiceDuration: ${actualServiceDuration} phút`);
            
            console.log("Setting appointment time to:", dateTimeString);
            console.log("Setting end time to:", endTimeString);
            
            // Lấy thời gian hiển thị từ slot hoặc từ startTime
            const displayTimeString = slot.startTimeString || dayjs(startTime).format('HH:mm');
            
            // **FIXED: CHỈ CẬP NHẬT FORM DATA VỚI THỜI GIAN USER CHỌN**
            setFormData(prev => ({
              ...prev,
              appointmentDate: startTime.toISOString(),
              appointmentTime: dateTimeString,
              expectedEndTime: endTimeString,
              selectedTimeSlot: slot,
              selectedTimeString: displayTimeString
            }));
            
            console.log(`✅ [SLOT SELECTION] CHỈ LƯU 1 KHUNG GIỜ: ${displayTimeString} - ${dayjs(endTime).format('HH:mm')}`);
            
            console.log(`✅ [SLOT SELECTION] Updated formData.selectedTimeString: ${displayTimeString}`);
            console.log(`🔍 [SLOT SELECTION] Current selectedService:`, selectedService);
            console.log(`🔍 [SLOT SELECTION] selectedService.duration:`, selectedService?.duration);
            console.log(`🔍 [SLOT SELECTION] formData.serviceDuration:`, formData.serviceDuration);
            
            // Lưu endTime để hiển thị thời gian kết thúc
            setEndTime(endTime);
            
            // **FIXED: NGĂN CHẶN TẠO THÊM SLOTS BẰNG CÁCH KHÔNG GỌI CÁC EVENT BROADCAST**
            // Hiển thị thông báo xác nhận
            message.success(`Đã chọn khung giờ ${displayTimeString}`, 2);
      } else {
            console.error('Không thể chuyển đổi thời gian từ:', slot);
            message.error('Không thể xác định thời gian. Vui lòng thử lại.');
            }
          } else {
          // Vẫn là slot hiện tại, hiển thị thông báo nhưng không thay đổi state
          message.info(`Bạn đã chọn khung giờ ${slot.startTimeString || (typeof slot.startTime === 'string' ? slot.startTime : dayjs(slot.startTime).format('HH:mm'))}`, 1);
          }
        } catch (error) {
        console.error('Lỗi khi chọn khung giờ:', error);
        message.error('Đã xảy ra lỗi khi chọn khung giờ. Vui lòng thử lại.');
      }
    }, 200); // Debounce 200ms để tránh gọi nhiều lần
  };

  // DEBUG: Theo dõi selectedTimeSlot changes
  useEffect(() => {
    console.log("🔍 [SELECTED SLOT CHANGE] selectedTimeSlot changed to:", selectedTimeSlot);
    if (selectedTimeSlot && selectedTimeSlot._clickTime) {
      const timeSinceClick = Date.now() - selectedTimeSlot._clickTime;
      console.log(`🔍 [SELECTED SLOT CHANGE] Time since user click: ${timeSinceClick}ms`);
    }
    
    // Force trigger TimeSlotGrid re-render để hiển thị selection
    if (selectedTimeSlot) {
      console.log(`🎨 [FORCE RENDER] Triggering re-render for slot selection: ${selectedTimeSlot.startTimeString || selectedTimeSlot.startTime}`);
    }
  }, [selectedTimeSlot]);
  
  // ✅ CONSOLIDATED: Load all pet data (busy slots + appointments) in one useEffect to prevent race conditions
  useEffect(() => {
    if (formData.petId) {
      const dateToUse = formData.appointmentDate || dayjs().format('YYYY-MM-DD');
      console.log('🐕 [PET DATA] Loading pet busy slots and appointments');
      console.log('🐕 [PET DATA] Pet ID:', formData.petId, 'Date:', dateToUse);
      
      // ✅ NUCLEAR OPTION: Clear ALL appointment-related cache to prevent ghost data
      try {
        const allKeys = Object.keys(localStorage);
        const appointmentKeys = allKeys.filter(key => 
          key.includes('staffBusy') || 
          key.includes('petBusy') || 
          key.includes('staffSchedule') || 
          key.includes('appointmentCache') ||
          key.includes('busySlots') ||
          key.includes('Appointment')
        );
        appointmentKeys.forEach(key => {
          localStorage.removeItem(key);
          console.log(`🗑️ [NUCLEAR CLEAR] Removed: ${key}`);
        });
        console.log(`🗑️ [NUCLEAR CLEAR] Cleared ${appointmentKeys.length} appointment cache keys`);
        
        // Also clear any cache that might contain 16:20 ghost data
        const ghostKeys = allKeys.filter(key => {
          try {
            const value = localStorage.getItem(key);
            return value && value.includes('16:20');
          } catch (e) {
            return false;
          }
        });
        ghostKeys.forEach(key => {
          console.log(`👻 [GHOST DATA] Found 16:20 in cache: ${key}`);
          localStorage.removeItem(key);
        });
        
      } catch (e) {
        console.warn('Could not clear appointment cache:', e);
      }
      
      const loadPetData = async () => {
        try {
          console.log(`🐕 [PET DATA] Starting comprehensive pet data load for pet ${formData.petId}`);
          
          // **METHOD 1: Use fetchPetAppointments which loads everything**
          await fetchPetAppointments();
          console.log(`✅ [PET DATA] Pet data loaded via fetchPetAppointments`);
          
        } catch (error) {
          console.error('❌ [PET DATA] Error loading pet data:', error);
          setPetBusyTimeSlots([]);
          setPetAppointments([]);
        }
      };
      
      loadPetData();
    } else {
      // Clear pet data if no pet selected
      console.log('🐕 [PET DATA] No pet selected - clearing pet data');
      setPetBusyTimeSlots([]);
      setPetAppointments([]);
    }
  }, [formData.petId, formData.appointmentDate]);

  // ✅ UNIFIED: Generate slots for both pet-only and pet+staff scenarios
  useEffect(() => {
    if (formData.petId && formData.serviceId) {
      const dateToUse = formData.appointmentDate || dayjs().format('YYYY-MM-DD');
      
      // ✅ ADD DELAY: Wait for pet busy slots to be loaded first
      console.log('🎯 [UNIFIED SLOTS] Starting slot generation...');
      console.log('🎯 [UNIFIED SLOTS] Pet ID:', formData.petId, 'Service ID:', formData.serviceId, 'Staff ID:', formData.staffId || 'None');
      console.log('🎯 [UNIFIED SLOTS] Current pet busy slots:', petBusyTimeSlots);
      
      // Add a small delay to ensure pet busy slots have been loaded
      const timeoutId = setTimeout(() => {
        const loadAndGenerateSlots = async () => {
          try {
            setFetchingSlots(true);
            const formattedDate = dayjs(dateToUse).format('YYYY-MM-DD');
            
            console.log(`📡 [API SLOTS] Calling backend getAvailableTimeSlots:`);
            console.log(`   - Date: ${formattedDate}`);
            console.log(`   - ServiceId: ${formData.serviceId}`);
            console.log(`   - StaffId: ${formData.staffId || 'null'}`);
            console.log(`   - PetId: ${formData.petId || 'null'}`);
            
            // ✅ SỬ DỤNG API BACKEND THAY VÌ GENERATE LOCAL
            const backendSlots = await appointmentService.getAvailableTimeSlots(
              formattedDate,
              formData.serviceId,
              formData.staffId || null,
              formData.petId || null
            );
            
            console.log(`✅ [API SLOTS] Backend returned ${backendSlots.length} slots`);
            
            // Debug: Count busy slots from backend
            const petBusyCount = backendSlots.filter(slot => slot.isPetBusy).length;
            const staffBusyCount = backendSlots.filter(slot => slot.isStaffBusy).length;
            console.log(`🔍 [API SLOTS] Pet busy count: ${petBusyCount}, Staff busy count: ${staffBusyCount}`);
            
            // Debug staff busy slots specifically
            const staffBusySlots = backendSlots.filter(slot => slot.isStaffBusy);
            if (staffBusySlots.length > 0) {
              console.log(`👤 [API SLOTS] Staff busy slots:`, staffBusySlots.map(slot => ({
                time: slot.startTimeString || slot.startTime,
                reason: slot.unavailableReason || 'Staff busy'
              })));
            }
            
            setAvailableSlots(backendSlots);
            
            // **FALLBACK: Nếu API thất bại, vẫn generate local như trước**
            if (!backendSlots || backendSlots.length === 0) {
              console.log(`⚠️ [API SLOTS] Backend returned no slots, generating fallback...`);
              
              // Load staff data if staff selected (for fallback)
              let staffBusySlots = [];
              let staffAppointments = [];
              
              if (formData.staffId) {
                try {
                  staffAppointments = await fetchStaffAppointments(formData.staffId, formattedDate);
                  setBookedAppointments(staffAppointments);
                  staffBusySlots = await fetchStaffBusySlots(formData.staffId, formattedDate);
                } catch (error) {
                  console.error('❌ [FALLBACK] Error fetching staff data:', error);
                  staffBusySlots = [];
                  staffAppointments = [];
                  setBookedAppointments([]);
                }
              } else {
                setBookedAppointments([]);
              }
              
              // Generate fallback slots
              const serviceDuration = selectedService ? selectedService.duration : 30;
              const fallbackSlots = generateUserTimeSlots(
                dateToUse,
                serviceDuration,
                petBusyTimeSlots,
                staffBusySlots,
                staffAppointments,
                petAppointments
              );
              
              console.log(`🔄 [FALLBACK] Generated ${fallbackSlots.length} fallback slots`);
              setAvailableSlots(fallbackSlots);
            } else {
              // Update staff appointments from backend data if available
              if (formData.staffId) {
                try {
                  const staffAppointments = await fetchStaffAppointments(formData.staffId, formattedDate);
                  setBookedAppointments(staffAppointments);
                } catch (error) {
                  console.error('❌ [API SLOTS] Error fetching staff appointments:', error);
                  setBookedAppointments([]);
                }
              }
            }
            
          } catch (error) {
            console.error('❌ [API SLOTS] Error in API slot generation:', error);
            setAvailableSlots([]);
          } finally {
            setFetchingSlots(false);
          }
        };
        
        loadAndGenerateSlots();
      }, 300); // Small delay to ensure pet data is loaded
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData.petId, formData.serviceId, formData.staffId, formData.appointmentDate, petBusyTimeSlots]);



  // Debug effect to track when dependencies change
  useEffect(() => {
    console.log(`🔄 USEEFFECT TRIGGER:`, {
      petId: formData.petId,
      appointmentDate: formData.appointmentDate ? dayjs(formData.appointmentDate).format('YYYY-MM-DD') : 'None',
      serviceId: formData.serviceId || 'None', 
      staffId: formData.staffId || 'None',
      petBusySlots: petBusyTimeSlots.length
    });
  }, [formData.petId, formData.appointmentDate, formData.serviceId, formData.staffId, petBusyTimeSlots]);

  // **ĐỒNG BỘ VỚI ADMIN: THÊM LOGIC STAFF BUSY**
  const fetchStaffBusySlots = async (staffId, date) => {
    if (!staffId || !date) {
      console.warn('❌ [USER SYNC] fetchStaffBusySlots: Missing staffId or date');
      return [];
    }
    
    try {
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      console.log(`👤 [USER SYNC] Fetching busy slots for staff ${staffId} on ${formattedDate}`);
      
      // ✅ CLEAR CACHE FIRST to avoid stale data
      const cacheKey = `staffBusySlots_${staffId}_${formattedDate}`;
      try {
        localStorage.removeItem(cacheKey);
        console.log(`🗑️ [CACHE CLEAR] Removed stale cache: ${cacheKey}`);
      } catch (e) {
        console.warn('Could not clear cache:', e);
      }
      
      // ===== SỬ DỤNG API CHUYÊN BIỆT TRƯỚC (GIỐNG ADMIN) =====
      try {
        const response = await axiosClient.get(`/Staff/${staffId}/busy-slots?date=${formattedDate}`);
        if (response.data && Array.isArray(response.data)) {
          console.log(`✅ [USER SYNC] Staff ${staffId} busy slots from API:`, response.data);
          console.log(`🚨 [BUSY SLOTS API] Current petId: ${formData.petId}, API returned ${response.data.length} busy slots`);
          return response.data;
        }
      } catch (apiError) {
        console.warn('📡 [USER SYNC] Staff busy slots API not available, using fallback method:', apiError.message);
      }
      
      // ===== FALLBACK: SỬ DỤNG APPOINTMENTSERVICE (GIỐNG ADMIN) =====
      const busySlots = await appointmentService.getStaffBusyTimeSlots(staffId, formattedDate);
      console.log(`🔄 [USER SYNC] Staff ${staffId} busy slots from service:`, busySlots);
      console.log(`🚨 [BUSY SLOTS SERVICE] Current petId: ${formData.petId}, Service returned ${busySlots.length} busy slots`);
      
      return Array.isArray(busySlots) ? busySlots : [];
    } catch (error) {
      console.error(`❌ [USER SYNC] Error fetching staff busy slots for staff ${staffId}:`, error);
      return [];
    }
  };

  const fetchStaffAppointments = async (staffId, date) => {
    if (!staffId || !date) {
      console.warn('❌ [USER SYNC] fetchStaffAppointments: Missing staffId or date');
      return [];
    }
    
    try {
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      console.log(`👤 [USER SYNC] Fetching appointments for staff ${staffId} on ${formattedDate}`);
      
      // ===== DÙNG CHECKSTAFFSCHEDULE (GIỐNG ADMIN) =====
      const scheduleData = await appointmentService.checkStaffSchedule(staffId, formattedDate);
      
      console.log(`👤 [USER SYNC] Raw scheduleData:`, scheduleData);
      
      if (scheduleData && scheduleData.appointments) {
        console.log(`✅ [USER SYNC] Staff ${staffId} appointments:`, scheduleData.appointments);
        
        // Debug each appointment
        scheduleData.appointments.forEach((apt, index) => {
          console.log(`🔍 [DEBUG] Appointment ${index}:`, {
            petId: apt.petId,
            petIdType: typeof apt.petId,
            currentPetId: formData.petId,
            currentPetIdType: typeof formData.petId,
            isMatch: apt.petId === formData.petId,
            isMatchStrict: String(apt.petId) === String(formData.petId),
            appointmentTime: apt.appointmentDate ? dayjs(apt.appointmentDate).format('HH:mm') : 'unknown',
            status: apt.status
          });
        });
        
        // 🔧 FIX: Không lọc ra appointments của pet hiện tại nữa
        // Chỉ lọc ra những appointments đã cancelled/completed
        const filteredAppts = scheduleData.appointments.filter(apt => {
          const isNotCancelled = !['Cancelled', 'Completed'].includes(apt.status);
          
          console.log(`🔍 [FILTER] Appointment ${apt.appointmentDate ? dayjs(apt.appointmentDate).format('HH:mm') : 'unknown'}:`, {
            isNotCancelled,
            willInclude: isNotCancelled,
            petId: apt.petId,
            status: apt.status
          });
          
          return isNotCancelled;
        });
        
        console.log(`✅ [USER SYNC] Original appointments: ${scheduleData.appointments.length}`);
        console.log(`✅ [USER SYNC] Filtered appointments: ${filteredAppts.length}`);
        console.log(`✅ [USER SYNC] Excluded appointments: ${scheduleData.appointments.length - filteredAppts.length}`);
        console.log(`🚨 [USER SYNC] Current petId: ${formData.petId} (${typeof formData.petId})`);
        
        return filteredAppts;
      }
      
      return [];
    } catch (error) {
      console.error(`❌ [USER SYNC] Error fetching staff appointments for staff ${staffId}:`, error);
      return [];
    }
  };

  // **REMOVED: XÓA USEEFFECT PHỨ TẠP VÀ KHÔNG CẦN THIẾT**

  // Thêm useEffect này sau các state declarations
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        
        // Fetch pets for the current user
        let petsData;
        if (isAdminMode && propsUserId) {
          // Admin mode: load pets của userId được chỉ định
          console.log('🔧 [ADMIN MODE] Loading pets for userId:', propsUserId);
          petsData = await petService.getPetsByUserId(propsUserId);
        } else {
          // User mode: load pets của user đang login
          console.log('👤 [USER MODE] Loading pets for current user');
          petsData = await petService.getUserPets();
        }
        
        if (Array.isArray(petsData)) {
          console.log('🐾 Loaded pets:', petsData);
          setPets(petsData);
          // If there's at least one pet, select the first one by default
          if (petsData.length > 0 && !isEditing) {
            setFormData(prev => ({ ...prev, petId: petsData[0].petId }));
            setSelectedPet(petsData[0]);
          }
        }
        
        // Fetch available services
        const servicesData = await serviceService.getAllServices();
        if (Array.isArray(servicesData)) {
          setServices(servicesData);
        }
        
        // Fetch staff if we're in edit mode
        if (isEditing && id) {
          const appointmentData = await appointmentService.getAppointmentById(id);
          if (appointmentData) {
            // Set form data and related states...
            console.log("Đã tải thông tin lịch hẹn để chỉnh sửa:", appointmentData);
            
            // Tìm thú cưng tương ứng trong danh sách
            const petFound = petsData.find(pet => pet.petId === appointmentData.petId);
            if (petFound) {
              setSelectedPet(petFound);
            }
            
            // Tìm dịch vụ tương ứng
            const serviceFound = servicesData.find(service => service.serviceId === appointmentData.serviceId);
            if (serviceFound) {
              setSelectedService(serviceFound);
              setDuration(serviceFound.duration || 30);
            }
            
            // Chuẩn bị ngày hẹn từ dữ liệu API
            let appointmentDate = appointmentData.appointmentDate;
            if (appointmentDate) {
              // Đảm bảo đúng định dạng và không bị ảnh hưởng bởi múi giờ
              appointmentDate = adjustTimeZoneFromServer(appointmentDate);
            }
            
            // Cập nhật formData với dữ liệu từ API
            setFormData({
              petId: appointmentData.petId,
              serviceId: appointmentData.serviceId,
              staffId: appointmentData.staffId || '',
              appointmentDate: appointmentDate,
              notes: appointmentData.notes || '',
              // Thêm các thông tin khác cần thiết
              selectedTimeSlot: {
                startTime: appointmentDate,
                exactHour: new Date(appointmentDate).getHours(),
                exactMinute: new Date(appointmentDate).getMinutes()
              }
            });
            
            // Nếu có thông tin về nhân viên, tải danh sách nhân viên
            if (appointmentData.serviceId) {
              await fetchStaffForSelectedService(appointmentData.serviceId);
              
              // Nếu có staffId, tìm và chọn nhân viên tương ứng
              if (appointmentData.staffId) {
                // Chờ danh sách nhân viên được tải
                const staffData = await staffService.getStaffByService(appointmentData.serviceId);
                if (Array.isArray(staffData)) {
                  const staffFound = staffData.find(s => s.staffId === appointmentData.staffId);
                  if (staffFound) {
                    setSelectedStaff(staffFound);
                  }
                }
              }
            }
            
            // Tính giờ kết thúc
            const startDate = new Date(appointmentDate);
            const serviceDuration = serviceFound?.duration || 30;
            const calculatedEndTime = new Date(startDate.getTime() + serviceDuration * 60000);
            setEndTime(calculatedEndTime);
            
            // Đánh dấu cuộc hẹn này là đang được chỉnh sửa
            setSelectedTimeSlot({
              startTime: appointmentDate,
              endTime: calculatedEndTime,
              isAvailable: true,
              exactHour: startDate.getHours(),
              exactMinute: startDate.getMinutes()
            });
            
            // Di chuyển đến bước cuối cùng để xem tổng quan
            setActiveStep(3);
          } else {
            message.error('Không tìm thấy thông tin lịch hẹn');
            navigate('/appointments');
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        setError("Không thể tải dữ liệu ban đầu. Vui lòng thử lại sau.");
      } finally {
        // Make sure to set initialLoading to false regardless of success or failure
        setInitialLoading(false);
      }
    };
    
    loadInitialData();
  }, [id, isEditing, isAdminMode, propsUserId]); // Thêm dependencies để reload khi admin chọn user khác

  // Add this useEffect after the existing useEffect for formData.serviceId
  useEffect(() => {
    // Check if serviceId is available
    if (formData.serviceId) {
      console.log("Service ID changed, fetching staff for service:", formData.serviceId);
      
      // Call function to fetch staff for the selected service
      fetchStaffForSelectedService(formData.serviceId);
    }
  }, [formData.serviceId]);  // This will run whenever serviceId changes

  useEffect(() => {
    if (initialLoading) {
      console.log('Form is in initialLoading state');
    } else {
      console.log('Initial loading complete, form data:', formData);
      console.log('Selected date:', formData.appointmentDate);
      console.log('End time:', endTime);
      
      // Log valid date check
      if (formData.appointmentDate) {
        const isValid = dayjs(formData.appointmentDate).isValid();
        console.log('Is appointment date valid?', isValid);
        if (!isValid) {
          console.warn('Invalid appointment date detected:', formData.appointmentDate);
        }
      }
    }
  }, [initialLoading]);

  // Thêm một effect để cập nhật trực tiếp UI mỗi khi component render
  useEffect(() => {
    if (formData.petId && formData.appointmentDate) {
      console.log('🎨 Cập nhật UI cho các khung giờ bận');
      
      // Lấy key cache cho thú cưng và ngày hiện tại
      const cacheKey = `petBusySlots_${formData.petId}_${dayjs(formData.appointmentDate).format('YYYY-MM-DD')}`;
      
      // Lấy dữ liệu từ cache
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        try {
          const busySlots = JSON.parse(cachedData);
          
          if (busySlots && busySlots.length > 0) {
            console.log(`🎨 Đánh dấu ${busySlots.length} slot bận trên UI`);
            
            // Gửi event để cập nhật slot trong component TimeSlotGrid
            window.dispatchEvent(new CustomEvent('pet-busy-slots-updated', { 
              detail: { 
                petId: formData.petId,
                date: formData.appointmentDate,
                busySlots: busySlots,
                serviceDuration: formData.serviceId ? formData.serviceDuration : 30
              } 
            }));
          }
        } catch (e) {
          console.error('Lỗi khi đọc dữ liệu cache:', e);
        }
      }
    }
  }, [formData.petId, formData.appointmentDate, formData.serviceId, formData.serviceDuration]);

  // ✅ REMOVED: SERVICE CHANGED useEffect - Logic moved to UNIFIED SLOTS useEffect to prevent race conditions

  // Gọi API để lấy thông tin lịch hẹn mới nhất
  const fetchPetAppointments = async () => {
    try {
      // Kiểm tra tính hợp lệ của input
      if (!formData.petId || !formData.appointmentDate) {
        console.error(`Thiếu dữ liệu cần thiết để lấy lịch hẹn: petId=${formData.petId}, date=${formData.appointmentDate}`);
        return;
      }

      // Sử dụng AbortController để có thể hủy request nếu cần
      const controller = new AbortController();
      const signal = controller.signal;
      
      // Lưu controller vào window object để có thể hủy từ nơi khác
      if (window.currentPetAppointmentsFetch) {
        window.currentPetAppointmentsFetch.abort();
      }
      window.currentPetAppointmentsFetch = controller;
      
      console.log(`🚨 [DATE DEBUG] Raw formData.appointmentDate:`, formData.appointmentDate);
      console.log(`🚨 [DATE DEBUG] Type:`, typeof formData.appointmentDate);
      
      const formattedDate = dayjs(formData.appointmentDate).format('YYYY-MM-DD');
      const today = dayjs().format('YYYY-MM-DD');
      const isFutureDate = formattedDate > today;
      
      console.log(`🚨 [DATE DEBUG] Formatted date for API:`, formattedDate);
      console.log(`📅 [DATE DEBUG] Today: ${today}, Target: ${formattedDate}, Is future: ${isFutureDate}`);
      console.log(`🔍 Đang lấy thông tin lịch hẹn cho thú cưng ${formData.petId} vào ngày ${formattedDate}`);
      
      message.loading({ content: `Đang kiểm tra lịch của thú cưng cho ngày ${formattedDate}...`, key: 'petBusyCheck', duration: 1 });
      
      // Gọi API lấy danh sách các khung giờ bận
      const response = await appointmentService.getPetBusyTimeSlots(
        formData.petId, 
        formattedDate, 
        { signal }
      );
      
      // Gọi API lấy chi tiết các cuộc hẹn của thú cưng trong ngày
      const appointmentsResponse = await appointmentService.getPetAppointments(
        formData.petId,
        formattedDate,
        { signal }
      );
      
      // Lưu danh sách đầy đủ các cuộc hẹn vào state
      if (appointmentsResponse && Array.isArray(appointmentsResponse)) {
        console.log(`✅ Lấy thành công ${appointmentsResponse.length} cuộc hẹn chi tiết từ API`);
        
        // Đảm bảo chỉ lấy lịch hẹn cho đúng ngày đã chọn
        const appointmentsForSelectedDate = appointmentsResponse.filter(apt => {
          if (!apt || !apt.appointmentDate) return false;
          
          // Lấy ngày từ appointmentDate
          const appointmentDate = dayjs(apt.appointmentDate).format('YYYY-MM-DD');
          // So sánh với ngày được chọn
          return appointmentDate === formattedDate;
        });
        
        console.log(`✅ Đã lọc ra ${appointmentsForSelectedDate.length} cuộc hẹn vào ngày ${formattedDate}`);
        
        // Log chi tiết thông tin từng cuộc hẹn
        appointmentsForSelectedDate.forEach((apt, index) => {
          const startTime = apt.appointmentDate ? dayjs(apt.appointmentDate).format('HH:mm') : 'không xác định';
          let duration = apt.duration || apt.serviceDuration;
          
          // Tính duration dựa vào expected end time nếu có
          if (!duration && apt.expectedEndDate && apt.appointmentDate) {
            const start = dayjs(apt.appointmentDate);
            const end = dayjs(apt.expectedEndDate);
            const diffMinutes = end.diff(start, 'minute');
            if (diffMinutes > 0) {
              duration = diffMinutes;
              // Gán giá trị này vào đối tượng appointment
              apt.calculatedDuration = diffMinutes;
            }
          }
          
          // Tính thời gian kết thúc
          let endTime = 'không xác định';
          if (startTime !== 'không xác định' && duration) {
            const startDateTime = dayjs(`2023-01-01T${startTime}`);
            endTime = startDateTime.add(duration, 'minute').format('HH:mm');
          } else if (apt.expectedEndDate) {
            endTime = dayjs(apt.expectedEndDate).format('HH:mm');
          }
          
          console.log(`📅 Cuộc hẹn ${index + 1}: ${startTime}-${endTime} (${duration || 'không xác định'} phút) - Trạng thái: ${apt.status || 'Đã đặt lịch'}`);
          
          // Đảm bảo cuộc hẹn có thời lượng - SỬ DỤNG SERVICE DURATION THỰC TẾ
          if (!apt.duration && !apt.serviceDuration) {
            // Lấy service duration thực tế từ selectedService hoặc services data
            const actualServiceDuration = selectedService ? selectedService.duration : 
              (services && apt.serviceId ? 
                (services.find(s => s.serviceId === apt.serviceId)?.duration || 30) : 30
              );
            
            console.log(`🔧 [Pet Appointment] Setting duration for appointment: serviceId=${apt.serviceId}, actualDuration=${actualServiceDuration}`);
            apt.duration = apt.calculatedDuration || actualServiceDuration; // Dùng service duration thực tế thay vì 90
          }
        });
        
        // Cập nhật state với lịch hẹn đã lọc
        setPetAppointments(appointmentsForSelectedDate);
        
        // **CRITICAL: Convert appointments to busy time slots immediately**
        const busyTimeSlotsFromAppointments = appointmentsForSelectedDate.map(apt => {
          return dayjs(apt.appointmentDate).format('HH:mm');
        });
        
        console.log(`🚨 [IMMEDIATE UPDATE] Setting petBusyTimeSlots from appointments:`, busyTimeSlotsFromAppointments);
        console.log(`📅 [DATE CHECK] Fetching for date: ${formattedDate}, appointments for this date: ${appointmentsForSelectedDate.length}`);
        
        // Always update state, even if empty (to clear previous data)
        setPetBusyTimeSlots(busyTimeSlotsFromAppointments);
        
        // Thêm sự kiện custom để thông báo đến các component khác
        window.dispatchEvent(new CustomEvent('pet-appointments-updated', { 
          detail: { 
            petId: formData.petId,
            date: formData.appointmentDate,
            appointments: appointmentsForSelectedDate,
            busyTimeSlots: busyTimeSlotsFromAppointments
          } 
        }));
      }
      
      if (response && Array.isArray(response)) {
        console.log(`✅ Lấy thành công ${response.length} khung giờ bận từ API`);
        
        // Hiển thị thông báo tương ứng
        if (response.length > 0) {
          message.warning({ 
            content: `Thú cưng của bạn đã có ${response.length} lịch hẹn vào ngày ${formattedDate}. Các khung giờ trùng lịch sẽ hiện màu đỏ và không thể chọn.`, 
            key: 'petBusyCheck',
            duration: 5
          });
        } else {
          message.success({ 
            content: `Thú cưng chưa có lịch hẹn vào ngày ${formattedDate}.`, 
            key: 'petBusyCheck',
            duration: 2
          });
        }
        
        // Xóa các key cũ trong localStorage trước khi lưu dữ liệu mới
        try {
          const allKeys = Object.keys(localStorage);
          const oldBusySlotKeys = allKeys.filter(key => 
            key.startsWith('debugPetBusyTimeSlots_') || 
            key.startsWith('petBusySlots_')
          );
          
          console.log(`Tìm thấy ${oldBusySlotKeys.length} key cũ cần xóa`);
          
          oldBusySlotKeys.forEach(key => {
            // Chỉ xóa các key không liên quan đến ngày hiện tại
            if (!key.includes(formattedDate)) {
              console.log(`Xóa key cũ: ${key}`);
              localStorage.removeItem(key);
            }
          });
        } catch (e) {
          console.warn('Lỗi khi xóa dữ liệu cũ:', e);
        }
        
        // Lưu vào localStorage với các key khác nhau để đảm bảo tương thích
        try {
          // Key cụ thể cho pet và ngày
          const specificKey = `debugPetBusyTimeSlots_${formattedDate}_${formData.petId}`;
          // Key cho ngày
          const dateKey = `debugPetBusyTimeSlots_${formattedDate}`;
          // Key chung
          const generalKey = 'debugPetBusyTimeSlots';
          // Key mới cho cả pet và ngày
          const newSpecificKey = `petBusySlots_${formData.petId}_${formattedDate}`;
          
          // Lưu dữ liệu với tất cả các key
          localStorage.setItem(specificKey, JSON.stringify(response));
          localStorage.setItem(dateKey, JSON.stringify(response));
          localStorage.setItem(generalKey, JSON.stringify(response));
          localStorage.setItem(newSpecificKey, JSON.stringify(response));
          
          // Lưu thông tin ngày hiện tại để biết dữ liệu chung thuộc về ngày nào
          localStorage.setItem('lastStoredBusySlotsDate', formattedDate);
          
          console.log(`Đã lưu ${response.length} khung giờ bận vào localStorage với các key:`, {
            specificKey,
            dateKey,
            generalKey,
            newSpecificKey
          });
        } catch (e) {
          console.error('Lỗi khi lưu dữ liệu vào localStorage:', e);
        }
        
        // Gửi thông tin mới nhất đến TimeSlotGrid - ƯU TIÊN formData.serviceDuration
        const currentServiceDuration = formData.serviceDuration || selectedService?.duration || 30;
        console.log(`🔧 [AppointmentForm] Sending serviceDuration to TimeSlotGrid: ${currentServiceDuration} (formData.serviceDuration=${formData.serviceDuration}, selectedService=${selectedService?.name})`);
        
        window.dispatchEvent(new CustomEvent('pet-busy-slots-updated', { 
          detail: { 
            petId: formData.petId,
            date: formData.appointmentDate,
            busySlots: response,
            serviceDuration: currentServiceDuration
          } 
        }));
        
        // Gửi thông tin chi tiết về cuộc hẹn
        if (appointmentsResponse && Array.isArray(appointmentsResponse) && appointmentsResponse.length > 0) {
          window.dispatchEvent(new CustomEvent('pet-appointments-updated', {
            detail: {
              petId: formData.petId,
              date: formData.appointmentDate,
              appointments: appointmentsResponse
            }
          }));
        }
        
        // Kích hoạt hiển thị cảnh báo nếu có khung giờ bận
        if (response.length > 0) {
          window.dispatchEvent(new CustomEvent('show-pet-busy-warning', { 
            detail: { 
              petId: formData.petId,
              busySlots: response
            } 
          }));
        }
        
        // ✅ REMOVED: Direct availableSlots update - This is handled by the unified useEffect to prevent race conditions
        // The unified useEffect will regenerate slots based on updated petBusyTimeSlots state
      }
    } catch (error) {
      // Kiểm tra xem lỗi có phải do request bị hủy không
      if (error.name !== 'AbortError') {
        console.error('❌ Lỗi khi tự động lấy thông tin lịch hẹn của thú cưng:', error);
        message.error({ 
          content: 'Không thể kiểm tra lịch của thú cưng. Vui lòng thử lại sau.', 
          key: 'petBusyCheck' 
        });
      }
    } finally {
      window.currentPetAppointmentsFetch = null;
    }
  };

  // ✅ DISABLED: request-pet-busy-slots event listener to prevent multiple fetchPetAppointments calls
  // All data loading is now handled by consolidated useEffect
  /*
  useEffect(() => {
    // Event listener disabled to prevent race conditions
  }, []);
  */

  // ✅ DISABLED: All event listeners to prevent race conditions and flickering
  // All data loading is now handled by consolidated useEffect above
  useEffect(() => {
    console.log('🚫 [AppointmentForm] Event listeners COMPLETELY DISABLED to prevent race conditions');
    // No event listeners, no sync manager, no polling
    // Data flows only through useEffect dependencies
    return () => {}; // No cleanup needed
  }, []);

  // Thêm useEffect mới để cập nhật selectedPet khi petId thay đổi
  useEffect(() => {
    if (formData.petId && pets && pets.length > 0) {
      const pet = pets.find(p => p.petId === formData.petId);
      if (pet) {
        console.log('Cập nhật selectedPet sau khi chọn:', pet.name);
        setSelectedPet(pet);
      }
    }
  }, [formData.petId, pets]);

  // Xử lý khi chọn khung giờ
  const handleTimeSlotSelect = (timeSlot) => {
    console.log('Khung giờ được chọn:', timeSlot);
    
    setSelectedTimeSlot(timeSlot);
    setSelectedTimeMessage(`Bạn đã chọn khung giờ ${timeSlot.startTimeString || timeSlot.startTime}.`);
    
    // Ưu tiên sử dụng dữ liệu giờ gốc được đánh dấu trong timeSlot
    if (timeSlot.exactHour !== undefined && timeSlot.exactMinute !== undefined) {
      console.log(`Sử dụng giờ chính xác: ${timeSlot.exactHour}:${timeSlot.exactMinute}`);
      
      try {
        // Lấy ngày từ appointmentDate hoặc tạo mới
        let baseDate;
        if (formData.appointmentDate) {
          baseDate = new Date(formData.appointmentDate);
        } else {
          baseDate = new Date();
        }
        
        // Đặt giờ và phút chính xác
        baseDate.setHours(timeSlot.exactHour, timeSlot.exactMinute, 0, 0);
        
        // FIXED: Tạo chuỗi ISO local time (không có Z)
        const dateStr = baseDate.toISOString().split('T')[0];
        const formattedISOString = `${dateStr}T${timeSlot.exactHour.toString().padStart(2, '0')}:${timeSlot.exactMinute.toString().padStart(2, '0')}:00`;
        
        console.log('Tạo appointmentDate với giờ chính xác:', formattedISOString);
        console.log('Thời gian gốc:', timeSlot.originalTimeString);
        
        setFormData(prev => ({
          ...prev,
          appointmentDate: formattedISOString,
          selectedTimeString: timeSlot.startTimeString || timeSlot.originalTimeString,
          selectedTimeSlot: timeSlot
        }));
        
        return;
      } catch (error) {
        console.error('Lỗi khi xử lý giờ chính xác:', error);
      }
    }
    
    // Ưu tiên sử dụng appointmentDate được tính sẵn từ TimeSlotGrid
    if (timeSlot.appointmentDate) {
      console.log('Sử dụng appointmentDate đã tính sẵn:', timeSlot.appointmentDate);
      
      // Cập nhật formData với appointmentDate đã được chuẩn hóa
      setFormData(prev => ({
        ...prev,
        appointmentDate: timeSlot.appointmentDate,
        selectedTimeString: timeSlot.startTimeString || timeSlot.startTime,
        selectedTimeSlot: timeSlot
      }));
    } 
    // Nếu không có appointmentDate nhưng có fullDateObject
    else if (timeSlot.fullDateObject && timeSlot.fullDateObject instanceof Date) {
      console.log('Sử dụng fullDateObject:', timeSlot.fullDateObject);
      
      // Cập nhật formData với fullDateObject chuyển thành ISO string
      setFormData(prev => ({
        ...prev,
        appointmentDate: timeSlot.fullDateObject.toISOString(),
        selectedTimeString: timeSlot.startTimeString || timeSlot.startTime,
        selectedTimeSlot: timeSlot
      }));
    }
    // Fallback: Tự tạo ngày giờ từ selectedDate và startTimeString
    else {
      console.log('Tự tạo đối tượng Date từ:', formData.appointmentDate, timeSlot.startTimeString || timeSlot.startTime);
      
      try {
        // Lấy ngày từ formData.appointmentDate
        const baseDate = new Date(formData.appointmentDate);
        
        // Parse time từ timeSlot
        const timeString = timeSlot.startTimeString || timeSlot.startTime;
        const [hours, minutes] = timeString.split(':').map(Number);
        
        // Đặt giờ và phút vào baseDate
        baseDate.setHours(hours, minutes, 0, 0);
        console.log('Đã tạo appointmentDate:', baseDate, baseDate.toISOString());
        
        // Cập nhật formData
        setFormData(prev => ({
          ...prev,
          appointmentDate: baseDate.toISOString(),
          selectedTimeString: timeString,
          selectedTimeSlot: timeSlot
        }));
      } catch (error) {
        console.error('Lỗi khi tạo ngày giờ:', error);
        message.error('Có lỗi xảy ra khi chọn khung giờ. Vui lòng thử lại.');
      }
    }
    
    // Chuyển tự động sang bước tiếp theo nếu cần
    if (activeStep === 3) {
      setTimeout(() => {
        handleNext();
      }, 500);
    }
  };

  // **REMOVED: XÓA HÀM fetchPetBusySlots VÌ KHÔNG SỬ DỤNG API BACKEND**

  // **REMOVED: Đã merge vào combined useEffect ở trên để tránh conflict**

  // Hàm kiểm tra tính hợp lệ của ngày giờ đặt lịch
  const validateAppointmentDateTime = (appointmentDate, selectedTimeSlot) => {
    const errors = [];
    
    try {
      // Kiểm tra appointmentDate
      if (!appointmentDate) {
        errors.push("Chưa chọn ngày hẹn");
        return errors;
      }
      
      let dateToCheck;
      
      // Xử lý appointmentDate
      if (appointmentDate instanceof Date) {
        dateToCheck = dayjs(appointmentDate);
      } else if (typeof appointmentDate === 'string') {
        dateToCheck = dayjs(appointmentDate);
      } else {
        errors.push("Định dạng ngày hẹn không hợp lệ");
        return errors;
      }
      
      // Kiểm tra tính hợp lệ của ngày
      if (!dateToCheck.isValid()) {
        errors.push("Ngày hẹn không hợp lệ");
        return errors;
      }
      
      // Kiểm tra ngày không được trong quá khứ
      const now = dayjs();
      if (dateToCheck.isBefore(now, 'day')) {
        errors.push("Không thể đặt lịch cho ngày trong quá khứ");
      }
      
      // Nếu là ngày hôm nay, kiểm tra thời gian
      if (dateToCheck.isSame(now, 'day') && selectedTimeSlot) {
        let timeToCheck;
        
        if (selectedTimeSlot.exactHour !== undefined && selectedTimeSlot.exactMinute !== undefined) {
          timeToCheck = dateToCheck.hour(selectedTimeSlot.exactHour).minute(selectedTimeSlot.exactMinute);
        } else if (selectedTimeSlot.startTime) {
          timeToCheck = dayjs(selectedTimeSlot.startTime);
        } else {
          errors.push("Không thể xác định thời gian đặt lịch");
          return errors;
        }
        
        // Kiểm tra thời gian không được trong quá khứ (với buffer 30 phút)
        const minimumTime = now.add(30, 'minute');
        if (timeToCheck.isBefore(minimumTime)) {
          errors.push(`Thời gian đặt lịch phải sau ${minimumTime.format('HH:mm')} (tối thiểu 30 phút từ bây giờ)`);
        }
      }
      
      // Kiểm tra thời gian trong giờ làm việc (8:00 - 21:30)
      if (selectedTimeSlot && selectedTimeSlot.exactHour !== undefined) {
        const hour = selectedTimeSlot.exactHour;
        const minute = selectedTimeSlot.exactMinute || 0;
        
        if (hour < 8 || hour > 21 || (hour === 21 && minute > 30)) {
          errors.push("Thời gian đặt lịch phải trong giờ làm việc (8:00 - 21:30)");
        }
      }
      
      console.log('✅ Kiểm tra ngày giờ hoàn tất:', {
        date: dateToCheck.format('DD/MM/YYYY'),
        time: selectedTimeSlot?.exactHour !== undefined ? 
          `${selectedTimeSlot.exactHour}:${String(selectedTimeSlot.exactMinute || 0).padStart(2, '0')}` : 
          'Chưa chọn',
        errors: errors
      });
      
    } catch (error) {
      console.error('❌ Lỗi khi validate ngày giờ:', error);
      errors.push("Có lỗi khi kiểm tra ngày giờ đặt lịch");
    }
    
    return errors;
  };

  // **ENHANCED: Load pet busy slots whenever pet or date changes**
  useEffect(() => {
    if (formData.petId && formData.appointmentDate) {
      const loadPetData = async () => {
        try {
          const dateStr = dayjs(formData.appointmentDate).format('YYYY-MM-DD');
          console.log(`🐕 [PET DATA] Loading data for pet ${formData.petId} on ${dateStr}`);
          
          // **CRITICAL: Load pet busy slots FIRST**
          console.log(`📡 [PET BUSY] Fetching pet busy slots...`);
          const petBusySlots = await appointmentService.getPetBusyTimeSlots(formData.petId, dateStr);
          console.log(`✅ [PET BUSY] Received ${petBusySlots.length} busy slots:`, petBusySlots);
          setPetBusyTimeSlots(petBusySlots || []);
          
          // **CRITICAL: Load pet appointments for detailed info**
          console.log(`📡 [PET APPOINTMENTS] Fetching pet appointments...`);
          const petAppts = await appointmentService.getPetAppointments(formData.petId, dateStr);
          console.log(`✅ [PET APPOINTMENTS] Received ${petAppts.length} appointments:`, petAppts);
          setPetAppointments(petAppts || []);
          
          // **IMPORTANT: Log the combined result**
          console.log(`🎯 [PET DATA COMPLETE] Pet ${formData.petId} has:`, {
            busySlots: petBusySlots.length,
            appointments: petAppts.length,
            date: dateStr
          });
          
        } catch (error) {
          console.error('❌ [PET DATA] Error loading pet data:', error);
          // **IMPORTANT: Clear on error to avoid stale data**
          setPetBusyTimeSlots([]);
          setPetAppointments([]);
        }
      };
      
      loadPetData();
    } else {
      // Clear pet data if no pet selected
      console.log('🐕 [PET DATA] No pet selected - clearing pet data');
      setPetBusyTimeSlots([]);
      setPetAppointments([]);
    }
  }, [formData.petId, formData.appointmentDate]);

  if (initialLoading) {
    console.log("AppointmentForm is in initialLoading state");
    return (
      <div style={{ padding: '24px' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  // Phần render chính của AppointmentForm
  return (
    <Layout.Content style={{ padding: '24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Card 
          title={<StyledCardHeader icon={<CalendarOutlined />} title="Thông tin lịch hẹn" />}
          variant="outlined" 
          styles={{
            body: { padding: '20px' }
          }}
        >
          {/* Header */}
          <div style={{ 
            padding: '24px 24px 0',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                icon={<ArrowLeftOutlined />} 
                type="default"
                shape="round"
                style={{ marginRight: 16 }}
                onClick={() => navigate('/appointments')}
              >
                Quay lại
              </Button>
              <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
                {isEditing ? 'Cập nhật lịch hẹn' : 'Đặt lịch hẹn mới'}
              </Title>
            </div>
            
            <Tag 
              icon={<CalendarOutlined />} 
              color="blue"
              style={{ 
                padding: '6px 12px', 
                borderRadius: 16,
                fontSize: '14px'
              }}
            >
              {isEditing ? "Cập nhật lịch hẹn" : "Đặt lịch mới"}
            </Tag>
          </div>
          
          <Divider style={{ margin: '16px 0' }} />
          
          {/* Error alerts */}
          <div style={{ padding: '0 24px' }}>
            {error && (
              <Alert
                message="Lỗi"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
            )}
            
            {debugInfo && (
              <Alert
                message="Thông tin gỡ lỗi"
                description={debugInfo}
                type="info"
                showIcon
                closable
                onClose={() => setDebugInfo(null)}
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
            )}
            
            {validationErrors.slot && (
              <Alert
                message={validationErrors.slot}
                type="warning"
                showIcon
                icon={<WarningOutlined />}
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
            )}
          </div>
          
          {/* Main content */}
          <div style={{ padding: '16px 24px 24px' }}>
            <Steps
              current={activeStep}
              style={{ marginBottom: 40 }}
              responsive={true}
            >
              <Step 
                title="Chọn thú cưng" 
                status={activeStep === 0 ? 'process' : formData.petId ? 'finish' : 'wait'}
                icon={formData.petId && activeStep !== 0 ? <CheckCircleOutlined /> : null} 
              />
              <Step 
                title="Chọn dịch vụ" 
                status={activeStep === 1 ? 'process' : formData.serviceId ? 'finish' : 'wait'}
                icon={formData.serviceId && activeStep !== 1 ? <CheckCircleOutlined /> : null} 
              />
              <Step 
                title="Chọn thời gian" 
                status={activeStep === 2 ? 'process' : (formData.appointmentDate && isSlotAvailable) ? 'finish' : 'wait'}
                icon={(formData.appointmentDate && isSlotAvailable && activeStep !== 2) ? <CheckCircleOutlined /> : null} 
              />
              <Step 
                title="Xác nhận" 
                status={activeStep === 3 ? 'process' : 'wait'} 
              />
            </Steps>
            
            <Form layout="vertical" onFinish={handleSubmit}>
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  {/* Step 1: Chọn thú cưng */}
                  {activeStep === 0 && (
                    <StepContent>
                      <StyledCardHeader 
                        icon={<PetIcon />} 
                        title="Chọn thú cưng" 
                        color="primary"
                      />
                      
                      <Row gutter={[16, 16]}>
                        {pets && pets.length > 0 ? (
                          pets.map((pet) => (
                            <Col xs={24} sm={12} md={8} key={pet.petId}>
                              <PetCard
                                key={pet.petId}
                                pet={pet}
                                petSize={pet.size}
                                selected={formData.petId === pet.petId}
                                onClick={() => {
                                  console.log(`🐕 PET CHANGED: From ${formData.petId} to ${pet.petId}`);
                                  console.log(`👤 Current staffId: ${formData.staffId} (should be preserved)`);
                                  setFormData(prev => ({...prev, petId: pet.petId}));
                                }}
                                bodyStyle={{ padding: 16 }}
                              >
                                {formData.petId === pet.petId && (
                                  <Badge 
                                    count={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                    offset={[-5, 5]}
                                    style={{ 
                                      backgroundColor: 'white',
                                      borderRadius: '50%',
                                      position: 'absolute',
                                      top: -8,
                                      right: -8,
                                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                                    }}
                                  />
                                )}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  {pet.photo ? (
                                    <Avatar
                                      src={getImageUrl(pet.photo)}
                                      alt={pet.name}
                                      size={56}
                                      style={{ marginRight: 12 }}
                                    />
                                  ) : (
                                    <Avatar
                                      size={56}
                                      icon={<PetIcon />}
                                      style={{ 
                                        marginRight: 12,
                                        backgroundColor: formData.petId === pet.petId ? '#1890ff' : '#f0f0f0',
                                        color: formData.petId === pet.petId ? 'white' : '#1890ff'
                                      }}
                                    />
                                  )}
                                  <div>
                                    <Text 
                                      strong
                                      style={{ 
                                        fontSize: 16,
                                        display: 'block',
                                        color: formData.petId === pet.petId ? '#1890ff' : 'inherit'
                                      }}
                                    >
                                      {pet.name}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 14 }}>
                                      {pet.species} {pet.breed ? `- ${pet.breed}` : ''}
                                    </Text>
                                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                                      {pet.gender === 'Male' || pet.gender === 'Đực' ? (
                                        <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                                      ) : (
                                        <WomanOutlined style={{ color: '#eb2f96', marginRight: 4 }} />
                                      )}
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        {pet.gender === 'Male' || pet.gender === 'Đực' ? 'Đực' : 'Cái'}
                                      </Text>
                                    </div>
                                  </div>
                                </div>
                              </PetCard>
                            </Col>
                          ))
                        ) : (
                          <Col span={24}>
                            <Alert
                              message="Bạn chưa có thú cưng"
                              description="Vui lòng thêm thú cưng trước khi đặt lịch."
                              type="info"
                              showIcon
                              style={{ borderRadius: 8 }}
                            />
                          </Col>
                        )}
                      </Row>
                      
                      {validationErrors.petId && (
                        <Text type="danger" style={{ display: 'block', marginTop: 12 }}>
                          {validationErrors.petId}
                        </Text>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                        <AnimatedButton
                          type="primary"
                          onClick={handleNext}
                          disabled={!formData.petId}
                          icon={<RightOutlined />}
                          size="large"
                          shape="round"
                        >
                          Tiếp theo
                        </AnimatedButton>
                      </div>
                    </StepContent>
                  )}
                  
                  {/* Step 2: Chọn dịch vụ */}
                  {activeStep === 1 && (
                    <StepContent>
                      <StyledCardHeader 
                        icon={<SkinOutlined />} 
                        title="Chọn dịch vụ" 
                        color="cyan"
                      />
                      
                      <Row gutter={[16, 16]}>
                        {services && services.length > 0 ? (
                          services.map((service) => (
                            <Col xs={24} sm={12} key={service.serviceId}>
                              <ServiceCard
                                key={service.serviceId}
                                service={service}
                                price={service.price}
                                duration={service.duration || 30}
                                selected={formData.serviceId === service.serviceId}
                                onClick={() => {
                                  console.log(`🔧 [SERVICE SELECTION] User clicked service: ${service.name} (${service.duration} minutes)`);
                                  console.log(`🔧 [SERVICE SELECTION] Full service data:`, service);
                                  setFormData(prev => ({...prev, serviceId: service.serviceId, serviceDuration: service.duration}));
                                  setSelectedService(service);
                                  console.log(`✅ [SERVICE SELECTION] Updated: serviceDuration=${service.duration}, selectedService=${service.name}`);
                                  // Also clear previous validation errors
                                  setValidationErrors(prev => ({...prev, serviceId: null}));
                                  
                                  // Trigger refresh pet busy slots với duration chính xác
                                  if (formData.petId && formData.appointmentDate) {
                                    console.log(`🔄 [SERVICE SELECTION] Refreshing pet busy slots with new duration: ${service.duration}`);
                                    setTimeout(() => {
                                      fetchPetAppointments();
                                    }, 100);
                                  }
                                }}
                                bodyStyle={{ padding: 16 }}
                              >
                                {formData.serviceId === service.serviceId && (
                                  <Badge 
                                    count={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                    offset={[-5, 5]}
                                    style={{ 
                                      backgroundColor: 'white',
                                      borderRadius: '50%',
                                      position: 'absolute',
                                      top: -8,
                                      right: -8,
                                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                                    }}
                                  />
                                )}
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <Avatar
                                      style={{ 
                                        backgroundColor: formData.serviceId === service.serviceId ? '#13c2c2' : '#e6fffb',
                                        color: formData.serviceId === service.serviceId ? 'white' : '#13c2c2',
                                        marginRight: 12
                                      }}
                                      icon={<SkinOutlined />}
                                    />
                                    <div>
                                      <Text 
                                        strong
                                        style={{ 
                                          display: 'block',
                                          fontSize: 16,
                                          color: formData.serviceId === service.serviceId ? '#13c2c2' : 'inherit'
                                        }}
                                      >
                                        {service.name}
                                      </Text>
                                      <Tag
                                        color={
                                          service.category === 'Grooming' ? 'blue' :
                                          service.category === 'Healthcare' ? 'green' :
                                          'default'
                                        }
                                        style={{ borderRadius: 12, marginTop: 4 }}
                                      >
                                        {service.category === 'Grooming' ? 'Chăm sóc & Làm đẹp' :
                                         service.category === 'Healthcare' ? 'Y tế & Sức khỏe' :
                                         service.category}
                                      </Tag>
                                    </div>
                                  </div>
                                  
                                  <div 
                                    style={{ 
                                      marginBottom: 12,
                                      height: 40,
                                      overflow: 'hidden',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical'
                                    }}
                                  >
                                    <Text type="secondary">
                                      {service.description || 'Không có mô tả chi tiết'}
                                    </Text>
                                  </div>
                                  
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <ClockCircleOutlined style={{ color: '#13c2c2', marginRight: 4 }} />
                                      <Text type="secondary">
                                        {service.duration} phút
                                      </Text>
                                    </div>
                                    
                                    <Text 
                                      strong
                                      style={{ 
                                        fontSize: 16,
                                        color: formData.serviceId === service.serviceId ? '#13c2c2' : 'inherit'
                                      }}
                                    >
                                      {formatCurrency(service.price || 0)}
                                    </Text>
                                  </div>
                                </div>
                              </ServiceCard>
                            </Col>
                          ))
                        ) : (
                          <Col span={24}>
                            <Alert
                              message="Không có dịch vụ nào khả dụng"
                              type="info"
                              showIcon
                              style={{ borderRadius: 8 }}
                            />
                          </Col>
                        )}
                      </Row>
                      
                      {validationErrors.serviceId && (
                        <Text type="danger" style={{ display: 'block', marginTop: 12 }}>
                          {validationErrors.serviceId}
                        </Text>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                        <Button
                          icon={<LeftOutlined />}
                          onClick={handleBack}
                          shape="round"
                        >
                          Quay lại
                        </Button>
                        <AnimatedButton
                          type="primary"
                          onClick={handleNext}
                          disabled={!formData.serviceId}
                          icon={<RightOutlined />}
                          shape="round"
                          style={{ background: '#13c2c2', borderColor: '#13c2c2' }}
                        >
                          Tiếp theo
                        </AnimatedButton>
                      </div>
                    </StepContent>
                  )}
                  
                  {/* Step 3: Chọn thời gian */}
                  {activeStep === 2 && (
                    <StepContent>
                      <StyledCardHeader 
                        icon={<ScheduleOutlined />} 
                        title="Chọn thời gian" 
                        color="success"
                      />
                      
                      <Alert
                        message="Giờ làm việc: 8:00 - 21:30"
                        description={
                          <div>
                            <p>Chỉ có thể đặt lịch trong khoảng thời gian này. Vui lòng chọn thời gian hẹn sao cho dịch vụ kết thúc trước 9:30 tối.</p>
                            <p><strong>Hướng dẫn:</strong> Sau khi chọn khung giờ phù hợp, bạn có thể thay đổi lựa chọn bằng cách nhấn vào khung giờ khác. Khi đã hài lòng với lựa chọn, nhấn nút "Tiếp theo" để xác nhận và hoàn tất đặt lịch.</p>
                          </div>
                        }
                        type="info"
                        showIcon
                        style={{ marginBottom: 16, borderRadius: 8 }}
                      />
                      
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Ngày hẹn"
                            required
                            validateStatus={validationErrors.appointmentDate ? 'error' : ''}
                            help={validationErrors.appointmentDate}
                          >
                            <DatePicker
                              format="DD/MM/YYYY"
                              placeholder="Chọn ngày"
                              style={{ width: '100%' }}
                              value={formData.appointmentDate && dayjs(formData.appointmentDate).isValid() ? dayjs(formData.appointmentDate) : null}
                              onChange={(date) => {
                                // Lấy ngày hiện tại đã chọn trước đó để clear cache
                                const currentDateStr = formData.appointmentDate ? 
                                  dayjs(formData.appointmentDate).format('YYYY-MM-DD') : null;
                                
                                const newDate = date;
                                const newDateStr = newDate ? dayjs(newDate).format('YYYY-MM-DD') : null;
                                
                                console.log(`📅 Ngày thay đổi từ ${currentDateStr} sang ${newDateStr}`);
                                
                                if (currentDateStr !== newDateStr) {
                                  console.log(`📅 Ngày thay đổi từ ${currentDateStr} sang ${newDateStr} - Đang reset state và fetch dữ liệu mới`);
                                  
                                  // Clear TẤT CẢ cache cũ trước khi chuyển ngày (không chỉ riêng petId hiện tại)
                                  try {
                                    const allKeys = Object.keys(localStorage);
                                    const keysToRemove = allKeys.filter(key => 
                                      key.includes('petBusySlots_') || 
                                      key.includes('debugPetBusyTimeSlots') ||
                                      key.includes('staffBusySlots_') ||
                                      key.includes('timeSlotAvailability_') ||
                                      key.includes('staffSchedule_') ||
                                      key === 'debugPetBusyTimeSlots' ||
                                      key === 'lastStoredBusySlotsDate'
                                    );
                                    
                                    console.log(`🗑️ Đang xóa ${keysToRemove.length} cache cũ:`, keysToRemove);
                                    
                                    keysToRemove.forEach(key => {
                                      localStorage.removeItem(key);
                                    });
                                    
                                    console.log(`🗑️ Đã xóa tất cả cache cũ khi chuyển ngày`);
                                  } catch (e) {
                                    console.warn('Không thể xóa cache cũ:', e);
                                  }
                                  
                                  // Reset TẤT CẢ state liên quan đến lịch hẹn
                                  setPetBusyTimeSlots([]);
                                  setPetAppointments([]);
                                  setBookedAppointments([]);
                                  setSelectedTimeSlot(null);
                                  
                                  // Cập nhật state với ngày mới và reset các state liên quan
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    appointmentDate: newDate, 
                                    selectedTimeSlot: null,
                                    selectedTimeString: null
                                  }));
                                  
                                  // Broadcast sự kiện để clear UI cũ
                                  window.dispatchEvent(new CustomEvent('clear-all-busy-slots', {
                                    detail: {
                                      oldDate: currentDateStr,
                                      newDate: newDateStr,
                                      reason: 'date-changed'
                                    }
                                  }));
                                  
                                  // Nếu có petId và ngày mới, tải dữ liệu mới
                                  if (formData.petId && newDateStr) {
                                    console.log(`🔄 Tải dữ liệu mới cho thú cưng ${formData.petId}, ngày ${newDateStr}`);
                                    
                                    // Gọi API để lấy dữ liệu mới cho ngày mới
                                    appointmentService.getPetBusyTimeSlots(formData.petId, newDateStr)
                                      .then(apiData => {
                                        console.log(`✅ Lấy được ${apiData?.length || 0} busy slots cho ngày ${newDateStr}`);
                                        
                                        // Lưu vào cache ngay
                                        try {
                                          const specificKey = `petBusySlots_${formData.petId}_${newDateStr}`;
                                          const debugSpecificKey = `debugPetBusyTimeSlots_${newDateStr}_${formData.petId}`;
                                          const debugDateKey = `debugPetBusyTimeSlots_${newDateStr}`;
                                          const generalKey = 'debugPetBusyTimeSlots';
                                          
                                          localStorage.setItem(specificKey, JSON.stringify(apiData || []));
                                          localStorage.setItem(debugSpecificKey, JSON.stringify(apiData || []));
                                          localStorage.setItem(debugDateKey, JSON.stringify(apiData || []));
                                          localStorage.setItem(generalKey, JSON.stringify(apiData || []));
                                          localStorage.setItem('lastStoredBusySlotsDate', newDateStr);
                                          
                                          console.log(`💾 Đã lưu ${apiData?.length || 0} busy slots vào cache cho ngày ${newDateStr}`);
                                        } catch (e) {
                                          console.error('Lỗi khi lưu cache mới:', e);
                                        }
                                        
                                        // Cập nhật state
                                        setPetBusyTimeSlots(apiData || []);
                                        
                                        // Broadcast để cập nhật UI
                                        window.dispatchEvent(new CustomEvent('pet-busy-slots-updated', { 
                                          detail: { 
                                            petId: formData.petId,
                                            date: newDate,
                                            busySlots: apiData || [],
                                            serviceDuration: formData.serviceDuration || 30,
                                            source: 'date-change'
                                          } 
                                        }));
                                        
                                        console.log(`📢 Đã broadcast dữ liệu mới cho ngày ${newDateStr}`);
                                      })
                                      .catch(error => {
                                        console.error('Lỗi khi tải dữ liệu cho ngày mới:', error);
                                        
                                        // Ngay cả khi có lỗi, vẫn broadcast với mảng rỗng để clear UI
                                        window.dispatchEvent(new CustomEvent('pet-busy-slots-updated', { 
                                          detail: { 
                                            petId: formData.petId,
                                            date: newDate,
                                            busySlots: [],
                                            serviceDuration: formData.serviceDuration || 30,
                                            source: 'date-change-error'
                                          } 
                                        }));
                                      });
                                    
                                    // Cũng lấy dữ liệu appointment chi tiết
                                    appointmentService.getPetAppointments(formData.petId, newDateStr)
                                      .then(appointmentData => {
                                        console.log(`✅ Lấy được ${appointmentData?.length || 0} appointments cho ngày ${newDateStr}`);
                                        setPetAppointments(appointmentData || []);
                                        
                                        // Broadcast appointment data
                                        window.dispatchEvent(new CustomEvent('pet-appointments-updated', {
                                          detail: {
                                            petId: formData.petId,
                                            date: newDate,
                                            appointments: appointmentData || []
                                          }
                                        }));
                                      })
                                      .catch(error => {
                                        console.error('Lỗi khi tải appointment data cho ngày mới:', error);
                                        setPetAppointments([]);
                                      });
                                  }
                                } else {
                                  // Ngày không thay đổi, chỉ cập nhật appointmentDate
                                  setFormData(prev => ({ ...prev, appointmentDate: newDate }));
                                }
                              }}
                              disabledDate={(current) => {
                                // Không cho phép chọn ngày trong quá khứ
                                return current && current < dayjs().startOf('day');
                              }}
                              inputReadOnly
                              size="large"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Nhân viên (tùy chọn)"
                            extra="Để trống nếu không có yêu cầu về nhân viên"
                          >
                            <Select
                              placeholder="Chọn nhân viên"
                              value={formData.staffId}
                              onChange={(value) => {
                                console.log(`👨‍⚕️ [STAFF SELECTION] User selected staff: ${value}`);
                                console.log(`🐕 [STAFF SELECTION] Pet busy data will be preserved:`, {
                                  petBusyTimeSlots: petBusyTimeSlots?.length || 0,
                                  petAppointments: petAppointments?.length || 0
                                });
                                
                                setFormData(prev => ({...prev, staffId: value}));
                              }}
                              allowClear
                              style={{ width: '100%' }}
                              size="large"
                              loading={loading}
                            >
                              {staff && staff.length > 0 ? (
                                staff.map((s) => (
                                  <Select.Option key={s.staffId} value={s.staffId}>
                                    {s.fullName}
                                  </Select.Option>
                                ))
                              ) : (
                                <Select.Option disabled>Không có nhân viên nào khả dụng</Select.Option>
                              )}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      
                      {/* Hiển thị lưới thời gian cho việc chọn time slot */}
                      {formData.serviceId && formData.petId && (
                        <Card
                          title={
                            <Typography.Title level={5} style={{ margin: 0, padding: 0 }}>
                              Chọn thời gian
                              {selectedService && (
                                <Tag color="blue" style={{ marginLeft: 8 }}>
                                  {selectedService.name} ({selectedService.duration} phút)
                                </Tag>
                              )}
                            </Typography.Title>
                          }
                          style={{ marginTop: 16 }}
                        >
                          <div style={{ marginBottom: 16 }}>
                            <Alert
                              message={selectedTimeSlot && formData.appointmentDate ? 
                                "Đã chọn thời gian thành công!" : 
                                "Hãy chọn khung giờ phù hợp"
                              }
                              description={
                                selectedTimeSlot && formData.appointmentDate ? (
                                  <div>
                                    <p>
                                      Bạn đã chọn khung giờ <strong>{
                                        selectedTimeSlot.startTimeString || 
                                        (dayjs(selectedTimeSlot.startTime).isValid() ? 
                                          dayjs(selectedTimeSlot.startTime).format('HH:mm') : 'không xác định')
                                      }</strong>.
                                    </p>
                                    <p>
                                      Bạn có thể chọn lại khung giờ khác nếu muốn, hoặc nhấn nút "Tiếp theo" để tiếp tục.
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    <p>
                                      Chọn một khung giờ từ danh sách bên dưới. Các khung giờ màu xanh là còn trống và có thể chọn.
                                      {checkingAvailability && <span> Đang kiểm tra khả dụng...</span>}
                                    </p>
                                    {isSlotAvailable === false && (
                                      <div style={{ marginTop: 8, color: '#ff4d4f' }}>
                                        <WarningOutlined /> Khung giờ đã chọn đã bị đặt hoặc không khả dụng. Vui lòng chọn khung giờ khác.
                                      </div>
                                    )}
                                  </div>
                                )
                              }
                              type={selectedTimeSlot && formData.appointmentDate ? "success" : "info"}
                              showIcon
                            />
                            
                            
                            {/* DEBUG INFO */}
                            {/*
                            <div style={{ background: '#f9f9f9', padding: '8px', marginTop: '8px', borderRadius: '4px', fontSize: '12px' }}>
                              <div><strong>Debug:</strong> formStage={formStage}, petId={formData.petId}, serviceId={formData.serviceId}</div>
                              <div>staffId={formData.staffId}, appointmentDate={formData.appointmentDate?.toString()}</div>
                            </div>
                            */}
                          </div>
                          
                          {/* DEBUG: Removed for production */}

                          
                          <TimeSlotGrid
                            key={`timeslot-${formData.staffId}-${formData.petId}-${dayjs(formData.appointmentDate).format('YYYY-MM-DD')}`}
                            availableSlots={availableSlots}
                            selectedSlot={selectedTimeSlot || null}
                            onSelectTimeSlot={handleSelectTimeSlot}
                            onSelectSlot={handleSelectTimeSlot}
                            serviceDuration={selectedService ? selectedService.duration : 30}
                            appointments={bookedAppointments}
                            selectedStaffId={formData.staffId}
                            setSelectedStaffId={(staffId) => {
                              setFormData(prev => ({...prev, staffId}));
                            }}
                            selectedDate={formData.appointmentDate ? new Date(formData.appointmentDate) : new Date()}
                            selectedPetId={formData.petId}
                            selectedService={selectedService}
                            petBusyTimeSlots={petBusyTimeSlots}
                            petAppointments={petAppointments}
                            // SignalR real-time sharing props
                            signalRConnection={signalRConnection}
                            currentUserId={currentUserId}
                            loading={fetchingSlots}
                            shouldShowDebugInfo={false}
                          />
                          

                          
                          {/* Thêm thông báo sau khi đã chọn thời gian */}
                          {selectedTimeSlot && formData.appointmentDate && (
                            <Alert
                              message="Đã chọn khung giờ thành công!"
                              type="success"
                              showIcon
                              style={{ marginBottom: 16, marginTop: 16, borderRadius: 8 }}
                            />
                          )}
                          
                          {validationErrors.slot && (
                            <Alert
                              message={validationErrors.slot}
                              type="warning"
                              showIcon
                              icon={<WarningOutlined />}
                              style={{ marginBottom: 16, borderRadius: 8 }}
                            />
                          )}
                        </Card>
                      )}
                      
                      {/* Code hiển thị trạng thái kiểm tra khả dụng giữ nguyên... */}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                        <Button
                          icon={<LeftOutlined />}
                          onClick={handleBack}
                          shape="round"
                        >
                          Quay lại
                        </Button>
                        
                        {isEditing && !canEdit && (
                          <Alert
                            message="Không thể cập nhật"
                            description={timeLeftMessage}
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16, maxWidth: 400 }}
                          />
                        )}
                        
                        <Button
                          type="primary"
                          htmlType="submit"
                          disabled={isEditing && !canEdit}
                          loading={loading}
                        >
                          {isEditing ? 'Cập nhật lịch hẹn' : 'Đặt lịch hẹn'}
                        </Button>
                      </div>
                    </StepContent>
                  )}
                  
                  {/* Step 4: Xác nhận */}
                  {activeStep === 3 && (
                    <StepContent>
                      <StyledCardHeader 
                        icon={<InfoCircleOutlined />} 
                        title="Xác nhận thông tin" 
                        color="warning"
                      />
                      
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                          <Card title="Thông tin thú cưng" variant="outlined" style={{ height: '100%' }}>
                            {selectedPet && (
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {selectedPet.photo ? (
                                  <Avatar
                                    src={getImageUrl(selectedPet.photo)}
                                    alt={selectedPet.name}
                                    size={64}
                                    style={{ marginRight: 16 }}
                                  />
                                ) : (
                                  <Avatar
                                    size={64}
                                    icon={<PetIcon />}
                                    style={{ marginRight: 16, backgroundColor: '#1890ff' }}
                                  />
                                )}
                                <div>
                                  <Text strong style={{ fontSize: 16, display: 'block' }}>
                                    {selectedPet.name}
                                  </Text>
                                  <Text type="secondary" style={{ display: 'block' }}>
                                    {selectedPet.species} {selectedPet.breed ? `- ${selectedPet.breed}` : ''}
                                  </Text>
                                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                                    {selectedPet.gender === 'Male' || selectedPet.gender === 'Đực' ? (
                                      <ManOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                                    ) : (
                                      <WomanOutlined style={{ color: '#eb2f96', marginRight: 4 }} />
                                    )}
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {selectedPet.gender === 'Male' || selectedPet.gender === 'Đực' ? 'Đực' : 'Cái'}
                                    </Text>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Card>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          <Card title="Thông tin dịch vụ" variant="outlined" style={{ height: '100%' }}>
                            {selectedService && (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
                                  <Avatar
                                    style={{ backgroundColor: '#13c2c2', marginRight: 12 }}
                                    icon={<SkinOutlined />}
                                  />
                                  <div>
                                    <Text strong style={{ fontSize: 16, display: 'block' }}>
                                      {selectedService.name}
                                    </Text>
                                    <Tag
                                      color={
                                        selectedService.category === 'Grooming' ? 'blue' :
                                        selectedService.category === 'Healthcare' ? 'green' :
                                        'default'
                                      }
                                      style={{ borderRadius: 12, marginTop: 4 }}
                                    >
                                      {selectedService.category === 'Grooming' ? 'Chăm sóc & Làm đẹp' :
                                       selectedService.category === 'Healthcare' ? 'Y tế & Sức khỏe' :
                                       selectedService.category}
                                    </Tag>
                                  </div>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <ClockCircleOutlined style={{ color: '#13c2c2', marginRight: 4 }} />
                                    <Text type="secondary">
                                      {selectedService.duration} phút
                                    </Text>
                                  </div>
                                  <div>
                                    <Text strong style={{ fontSize: 16 }}>
                                      {formatCurrency(selectedService.price || 0)}
                                    </Text>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Card>
                        </Col>
                        
                        <Col span={24}>
                          <Card 
                            variant="outlined"
                            style={{ 
                              background: '#f6ffed',
                              borderColor: '#b7eb8f'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                              <ScheduleOutlined style={{ color: '#52c41a', fontSize: 20, marginRight: 8 }} />
                              <Title level={5} style={{ margin: 0, color: '#52c41a' }}>
                                Thời gian đã chọn
                              </Title>
                            </div>
                            
                            <Row align="middle" gutter={[16, 16]}>
                              <Col xs={24} sm={16}>
                                {formData.selectedTimeString ? (
                                  <Text strong style={{ fontSize: 16, display: 'block' }}>
                                    {(() => {
                                      try {
                                        if (!formData.appointmentDate || !dayjs(formData.appointmentDate).isValid()) {
                                          return `${formData.selectedTimeString} - Ngày không hợp lệ`;
                                        }
                                        
                                        const appointmentDateObj = new Date(formData.appointmentDate);
                                        if (isToday(appointmentDateObj)) {
                                          return `Hôm nay, ${formData.selectedTimeString} - ${dayjs(appointmentDateObj).format('DD/MM/YYYY')}`;
                                        } else if (isTomorrow(appointmentDateObj)) {
                                          return `Ngày mai, ${formData.selectedTimeString} - ${dayjs(appointmentDateObj).format('DD/MM/YYYY')}`;
                                        } else {
                                          return `${dayjs(appointmentDateObj).format('dddd, DD/MM/YYYY')} - ${formData.selectedTimeString}`;
                                        }
                                      } catch (error) {
                                        console.error('Error formatting appointment date:', error);
                                        return `${formData.selectedTimeString} - Ngày không hợp lệ`;
                                      }
                                    })()}
                                  </Text>
                                ) : (
                                  <Text strong style={{ fontSize: 16, display: 'block' }}>
                                    {getFormattedDate(formData.appointmentTime ? dayjs(formData.appointmentTime).toDate() : formData.appointmentDate)}
                                  </Text>
                                )}
                                
                                {formData.selectedTimeString && selectedService && (
                                  <Text type="secondary">
                                    Kết thúc dự kiến: {
                                      (() => {
                                        try {
                                          if (!endTime || !dayjs(endTime).isValid()) {
                                            return 'N/A';
                                          }
                                          return dayjs(endTime).format('HH:mm');
                                        } catch (error) {
                                          console.error('Error formatting end time:', error);
                                          return 'N/A';
                                        }
                                      })()
                                    }
                                  </Text>
                                )}
                              </Col>
                              
                              {selectedStaff && (
                                <Col xs={24} sm={8}>
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar 
                                      src={selectedStaff.avatar} 
                                      style={{ marginRight: 8 }}
                                    >
                                      {selectedStaff.fullName.charAt(0)}
                                    </Avatar>
                                    <div>
                                      <Text strong style={{ display: 'block' }}>
                                        {selectedStaff.fullName}
                                      </Text>
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        Nhân viên được chỉ định
                                      </Text>
                                    </div>
                                  </div>
                                </Col>
                              )}
                            </Row>
                            
                            {formData.notes && (
                              <div style={{ 
                                marginTop: 16, 
                                padding: '12px 0 0',
                                borderTop: '1px dashed #d9d9d9'
                              }}>
                                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                                  Ghi chú:
                                </Text>
                                <Text type="secondary">
                                  {formData.notes}
                                </Text>
                              </div>
                            )}
                          </Card>
                        </Col>
                      </Row>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                        <Button
                          icon={<LeftOutlined />}
                          onClick={handleBack}
                          shape="round"
                        >
                          Quay lại
                        </Button>
                        
                        {isEditing && !canEdit && (
                          <Alert
                            message="Không thể cập nhật"
                            description={timeLeftMessage}
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16, maxWidth: 400 }}
                          />
                        )}
                        
                        <Button
                          type="primary"
                          htmlType="submit"
                          disabled={isEditing && !canEdit}
                          loading={loading}
                        >
                          {isEditing ? 'Cập nhật lịch hẹn' : 'Đặt lịch hẹn'}
                        </Button>
                      </div>
                    </StepContent>
                  )}
                </Col>
                
                <Col xs={24} lg={8}>
                  {/* Sidebar component */}
                  <div style={{ position: 'sticky', top: 24 }}>
                    {/* Pet info summary */}
                    {selectedPet && (
                      <StyledCard style={{ marginBottom: 16 }}>
                        <div 
                          style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                            borderBottom: '1px solid #f0f0f0',
                            paddingBottom: 12
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FloatingAvatar 
                              icon={<PetIcon />}
                              style={{ 
                                backgroundColor: '#1890ff15',
                                color: '#1890ff',
                                marginRight: 8
                              }}
                            />
                            <Text strong>Thú cưng đã chọn</Text>
                          </div>
                          
                          <Tooltip title="Chỉnh sửa lựa chọn">
                            <Button
                              icon={<EditOutlined />}
                              size="small"
                              shape="circle"
                              onClick={() => setActiveStep(0)}
                              type={activeStep === 0 ? 'primary' : 'default'}
                            />
                          </Tooltip>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                          {selectedPet.photo ? (
                            <Avatar
                              src={getImageUrl(selectedPet.photo)}
                              alt={selectedPet.name}
                              size={64}
                              style={{ marginRight: 16 }}
                            />
                          ) : (
                            <Avatar
                              size={64}
                              icon={<PetIcon />}
                              style={{ 
                                marginRight: 16,
                                backgroundColor: '#1890ff'
                              }}
                            />
                          )}
                          <div>
                            <Text strong style={{ fontSize: 16, display: 'block' }}>
                              {selectedPet.name}
                            </Text>
                            <Text type="secondary" style={{ display: 'block' }}>
                              {selectedPet.species} {selectedPet.breed ? `- ${selectedPet.breed}` : ''}
                            </Text>
                          </div>
                        </div>
                        
                        <Divider style={{ margin: '8px 0 16px' }} />
                        
                        <Row gutter={[8, 8]}>
                          <Col span={12}>
                            <PetInfoItem 
                              icon={selectedPet.gender === 'Male' || selectedPet.gender === 'Đực' 
                                ? <ManOutlined style={{ color: '#1890ff' }} /> 
                                : <WomanOutlined style={{ color: '#eb2f96' }} />}
                              label="Giới tính"
                              value={selectedPet.gender === 'Male' || selectedPet.gender === 'Đực' ? 'Đực' : 'Cái'}
                            />
                          </Col>
                          
                          {(selectedPet.dateOfBirth || selectedPet.birthdate) && (
                            <Col span={12}>
                              <PetInfoItem 
                                icon={<GiftOutlined style={{ color: '#1890ff' }} />}
                                label="Tuổi"
                                value={`${new Date().getFullYear() - new Date(selectedPet.dateOfBirth || selectedPet.birthdate).getFullYear()} tuổi`}
                              />
                            </Col>
                          )}
                          
                          {selectedPet.weight && (
                            <Col span={12}>
                              <PetInfoItem 
                                icon={<DashboardOutlined style={{ color: '#1890ff' }} />}
                                label="Cân nặng"
                                value={`${selectedPet.weight} kg`}
                              />
                            </Col>
                          )}
                        </Row>
                      </StyledCard>
                    )}
                    
                    {/* Service info summary */}
                    {selectedService && (
                      <StyledCard style={{ marginBottom: 16 }}>
                        <div 
                          style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                            borderBottom: '1px solid #f0f0f0',
                            paddingBottom: 12
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FloatingAvatar 
                              icon={<SkinOutlined />}
                              style={{ 
                                backgroundColor: '#13c2c215',
                                color: '#13c2c2',
                                marginRight: 8
                              }}
                            />
                            <Text strong>Dịch vụ đã chọn</Text>
                          </div>
                          
                          <Tooltip title="Chỉnh sửa lựa chọn">
                            <Button
                              icon={<EditOutlined />}
                              size="small"
                              shape="circle"
                              onClick={() => setActiveStep(1)}
                              type={activeStep === 1 ? 'primary' : 'default'}
                            />
                          </Tooltip>
                        </div>
                        
                        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                          {selectedService.name}
                        </Text>
                        
                        <Tag
                          color={
                            selectedService.category === 'Grooming' ? 'blue' :
                            selectedService.category === 'Healthcare' ? 'green' :
                            'default'
                          }
                          style={{ borderRadius: 12, marginBottom: 12 }}
                        >
                          {selectedService.category === 'Grooming' ? 'Chăm sóc & Làm đẹp' :
                           selectedService.category === 'Healthcare' ? 'Y tế & Sức khỏe' :
                           selectedService.category}
                        </Tag>
                        
                        <Paragraph 
                          type="secondary" 
                          ellipsis={{ rows: 2 }}
                          style={{ marginBottom: 16 }}
                        >
                          {selectedService.description || 'Không có mô tả chi tiết.'}
                        </Paragraph>
                        
                        <Divider style={{ margin: '0 0 16px' }} />
                        
                        <Row gutter={[8, 8]}>
                          <Col span={12}>
                            <ServiceInfoItem 
                              icon={<ClockCircleOutlined style={{ color: '#13c2c2' }} />}
                              label="Thời gian"
                              value={`${selectedService.duration} phút`}
                            />
                          </Col>
                          <Col span={12}>
                            <ServiceInfoItem 
                              icon={<CreditCardOutlined style={{ color: '#13c2c2' }} />}
                              label="Giá dịch vụ"
                              value={formatCurrency(selectedService.price || 0)}
                            />
                          </Col>
                        </Row>
                      </StyledCard>
                    )}
                    
                    {/* Appointment time summary */}
                    {formData.appointmentDate && endTime && (
                      <StyledCard style={{ marginBottom: 16 }}>
                        <div 
                          style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                            borderBottom: '1px solid #f0f0f0',
                            paddingBottom: 12
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FloatingAvatar 
                              icon={<ScheduleOutlined />}
                              style={{ 
                                backgroundColor: '#52c41a15',
                                color: '#52c41a',
                                marginRight: 8
                              }}
                            />
                            <Text strong>Thời gian đã chọn</Text>
                          </div>
                          
                          <Tooltip title="Chỉnh sửa lựa chọn">
                            <Button
                              icon={<EditOutlined />}
                              size="small"
                              shape="circle"
                              onClick={() => setActiveStep(2)}
                              type={activeStep === 2 ? 'primary' : 'default'}
                            />
                          </Tooltip>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                            {getFormattedDate(formData.appointmentDate)}
                          </Text>
                          
                          <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                            Kết thúc dự kiến: {
                              (() => {
                                try {
                                  if (!endTime || !dayjs(endTime).isValid()) {
                                    return 'N/A';
                                  }
                                  return dayjs(endTime).format('HH:mm');
                                } catch (error) {
                                  console.error('Error formatting end time:', error);
                                  return 'N/A';
                                }
                              })()
                            }
                          </Text>
                          
                          <PulsatingBadge
                            status={isSlotAvailable === true ? "success" : isSlotAvailable === false ? "error" : "warning"}
                            text={
                              isSlotAvailable === true 
                                ? "Khung giờ khả dụng" 
                                : isSlotAvailable === false 
                                  ? "Khung giờ đã được đặt" 
                                  : "Đang kiểm tra khả dụng"
                            }
                            style={{ 
                              color: isSlotAvailable === true 
                                ? '#52c41a' 
                                : isSlotAvailable === false 
                                  ? '#f5222d' 
                                  : '#faad14'
                            }}
                          />
                          
                          {selectedStaff && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              marginTop: 12 
                            }}>
                              <Avatar 
                                src={selectedStaff.avatar} 
                                size="small"
                                style={{ marginRight: 8 }}
                              >
                                {selectedStaff.fullName.charAt(0)}
                              </Avatar>
                              <Text>
                                {selectedStaff.fullName}
                              </Text>
                            </div>
                          )}
                        </div>
                      </StyledCard>
                    )}
                    
                    {/* Info Card */}
                    <Card
                      style={{ 
                        borderRadius: 12,
                        background: 'linear-gradient(to right, #f0f5ff, #e6f7ff)'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: '#1890ff',
                        marginBottom: 8
                      }}>
                        <InfoCircleOutlined style={{ marginRight: 8 }} />
                        <Text strong style={{ color: '#1890ff' }}>Lưu ý</Text>
                      </div>
                      <Text type="secondary">
                        Vui lòng đến sớm 10-15 phút trước giờ hẹn. Nếu bạn cần hủy hoặc đổi lịch, vui lòng thông báo trước ít nhất 24 giờ.
                      </Text>
                    </Card>
                  </div>
                </Col>
              </Row>
            </Form>
          </div>
        </Card>
      </div>
    </Layout.Content>
  );
};

export default AppointmentForm;



