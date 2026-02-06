import React, { useState, useEffect } from 'react';
import axiosClient from '../../utils/axiosClient';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { notification } from 'antd';
import appointmentSyncManager from '../../utils/appointmentSync'; // Add sync manager
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  PieChartOutlined,
  CheckCircleOutlined, 
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  ShopOutlined,
  InfoCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  ScheduleOutlined,
  WarningOutlined,
  LeftOutlined,
  RightOutlined,
  DashboardOutlined,
  BellOutlined,
  ToolOutlined,
  SettingOutlined,
  PlusOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from '../../utils/dayjs'; // Using configured dayjs with plugins

// Thêm import appointmentService
import appointmentService from '../../services/appointmentService';

// Thêm import staffService
import staffService from '../../services/staffService';

// Thay đổi import useAuth từ context thành import từ hooks
import useAuth from '../../hooks/useAuth';

// Thêm import CompleteAppointmentForm
import CompleteAppointmentForm from '../appointment/CompleteAppointmentForm';

// Thêm import cho styled components
import { UnassignedBadge, AssignedBadge, StaffAssignButton } from './StyledComponents';

// Thêm import TimeSlotGrid component
import TimeSlotGrid from '../appointment/TimeSlotGrid';

// Thêm import AdminCreateAppointment wrapper
import AdminCreateAppointment from './AdminCreateAppointment';

// Thêm import isPetBusySlot helper
import { isPetBusySlot } from '../appointment/isPetBusySlot';

// Thêm constants cho buffer time và min duration
const BUFFER_TIME_MINUTES = 10; // 10 phút giữa các lịch hẹn
const DEFAULT_SERVICE_DURATION = 30; // Thời lượng dịch vụ mặc định nếu không có thông tin

// Thêm các styled components
const AppointmentContainer = styled.div`
  width: 100%;
  background: #f7faff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  animation: fadeIn 0.5s ease;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, #304FFE 0%, #304FFE 50%, #304FFE 100%);
    background-size: 200% 100%;
    animation: shimmer 3s infinite linear;
  }

  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #2B3674;
    margin: 0 0 30px 0;
    display: flex;
    align-items: center;
    gap: 15px;
    
    .anticon {
      font-size: 30px;
      background: linear-gradient(135deg, #304FFE, #304FFE);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  @keyframes shimmer {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 35px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(67, 24, 255, 0.1);
  }
  
  .icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    background-size: 150% 150%;
    animation: gradientShift 3s ease infinite;
  }
  
  .content {
    h4 {
      font-size: 14px;
      color: #707EAE;
      margin: 0 0 8px;
      font-weight: 500;
    }
    
    .number {
      font-size: 28px;
      font-weight: 700;
      color: #2B3674;
      margin: 0;
      background: linear-gradient(135deg, #304FFE, #304FFE);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 35px;
  align-items: center;
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  input {
    width: 100%;
    padding: 14px 20px 14px 55px;
    border: 2px solid #e6e9f0;
    border-radius: 16px;
    font-size: 15px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    color: #2B3674;
    background: rgba(244, 247, 254, 0.5);

    &:focus {
      outline: none;
      border-color: #304FFE;
      box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.15);
      background: white;
    }
    
    &::placeholder {
      color: #8F9BBA;
    }
  }

  .anticon {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: #304FFE;
    font-size: 20px;
    transition: all 0.3s ease;
  }
  
  &:focus-within .anticon {
    color: #304FFE;
  }
`;

const DateFilter = styled.div`
  position: relative;
  
  input {
    padding: 14px 20px 14px 55px;
    border: 2px solid #e6e9f0;
    border-radius: 16px;
    font-size: 15px;
    transition: all 0.3s;
    color: #2B3674;
    background: rgba(244, 247, 254, 0.5);
    
    &:focus {
      outline: none;
      border-color: #304FFE;
      box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.15);
      background: white;
    }
  }
  
  .anticon {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: #304FFE;
    font-size: 20px;
  }
`;

const StatusFilter = styled.div`
  position: relative;
  
  select {
    padding: 14px 20px 14px 55px;
    border: 2px solid #e6e9f0;
    border-radius: 16px;
    font-size: 15px;
    transition: all 0.3s;
    color: #2B3674;
    background: rgba(244, 247, 254, 0.5);
    min-width: 220px;
    appearance: none;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: #304FFE;
      box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.15);
      background: white;
    }
  }
  
  .anticon {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: #304FFE;
    font-size: 20px;
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #304FFE;
    pointer-events: none;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03);
  
  table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      padding: 18px 20px;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
    }
    
    th {
      font-weight: 600;
      color: #2B3674;
      background: #F4F7FE;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    tr:last-child td {
      border-bottom: none;
    }
    
    tr {
      transition: all 0.2s ease;
    }
    
    tbody tr:hover {
      background: #F9FAFC;
      transform: translateY(-1px);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.03);
    }
    
    .no-data {
      text-align: center;
      padding: 50px;
      color: #707EAE;
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  
  &.pending {
    background-color: rgba(255, 170, 0, 0.1);
    color: #FFAA00;
  }
  
  &.scheduled {
    background-color: rgba(58, 139, 255, 0.1);
    color: #3A8BFF;
  }
  
  &.confirmed {
    background-color: rgba(122, 132, 255, 0.1);
    color: #7A84FF;
  }
  
  &.completed {
    background-color: rgba(5, 205, 153, 0.1);
    color: #05CD99;
    animation: fadeIn 0.5s ease;
  }
  
  &.cancelled {
    background-color: rgba(255, 82, 82, 0.1);
    color: #FF5252;
    animation: fadeIn 0.5s ease;
  }
  
  &.no-show {
    background-color: rgba(255, 140, 22, 0.1);
    color: #fa8c16;
    animation: fadeIn 0.5s ease;
    font-weight: 700;
  }
  
  .anticon {
    font-size: 16px;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  
  button {
    padding: 8px 16px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    
    &.edit {
      background: rgba(58, 139, 255, 0.1);
      color: #3A8BFF;
      
      &:hover {
        background: rgba(58, 139, 255, 0.2);
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(58, 139, 255, 0.2);
      }
    }
    
    &.confirm {
      background: rgba(122, 132, 255, 0.1);
      color: #7A84FF;
      
      &:hover {
        background: rgba(122, 132, 255, 0.2);
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(122, 132, 255, 0.2);
      }
    }
    
    &.complete {
      background: rgba(5, 205, 153, 0.1);
      color: #05CD99;
      
      &:hover {
        background: rgba(5, 205, 153, 0.2);
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(5, 205, 153, 0.2);
      }
    }
    
    &.cancel-appointment {
      background: rgba(255, 82, 82, 0.1);
      color: #FF5252;
      
      &:hover {
        background: rgba(255, 82, 82, 0.2);
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(255, 82, 82, 0.2);
      }
    }
    
    &.delete {
      background: rgba(255, 82, 82, 0.1);
      color: #FF5252;
      
      &:hover {
        background: rgba(255, 82, 82, 0.2);
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(255, 82, 82, 0.2);
      }
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
  }
`;

const EditForm = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 35px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border-left: 5px solid #304FFE;
  
  h2 {
    font-size: 22px;
    font-weight: 700;
    color: #2B3674;
    margin: 0 0 25px 0;
    padding-bottom: 15px;
    border-bottom: 1px solid #eef0f7;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    grid-column: 1 / -1;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 5px;
  
  label {
    display: block;
    margin-bottom: 10px;
    font-weight: 600;
    color: #2B3674;
    font-size: 14px;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 14px;
    border: 2px solid #e6e9f0;
    border-radius: 14px;
    font-size: 15px;
    transition: all 0.3s;
    background: #F9FAFC;
    color: #2B3674;
    
    &:focus {
      outline: none;
      border-color: #304FFE;
      box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.15);
      background: white;
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 120px;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  
  button {
    padding: 12px 24px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    &.save {
      background: linear-gradient(135deg, #304FFE, #304FFE);
      color: white;
      box-shadow: 0 8px 20px rgba(67, 24, 255, 0.25);
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 25px rgba(67, 24, 255, 0.4);
      }
    }
    
    &.cancel {
      background: #F4F7FE;
      color: #707EAE;
      
      &:hover {
        background: #E5ECF6;
        transform: translateY(-3px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
      }
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(11, 20, 55, 0.5);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ConfirmModal = styled(motion.div)`
  background: white;
  border-radius: 24px;
  padding: 35px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
  
  h3 {
    font-size: 24px;
    font-weight: 700;
    color: #2B3674;
    margin: 0 0 15px 0;
  }
  
  p {
    color: #707EAE;
    margin-bottom: 30px;
    font-size: 16px;
    line-height: 1.6;
  }
  
  .icon {
    margin-bottom: 25px;
    font-size: 70px;
    color: #FF5252;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  .dialog-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    
    button {
      padding: 14px 28px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      min-width: 140px;
      
      &.delete {
        background: linear-gradient(135deg, #FF5252, #FF7676);
        color: white;
        box-shadow: 0 10px 20px rgba(255, 82, 82, 0.25);
        
        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(255, 82, 82, 0.4);
        }
      }
      
      &.cancel {
        background: #F4F7FE;
        color: #707EAE;
        
        &:hover {
          background: #E5ECF6;
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        }
      }
    }
  }
`;

const ToastMessage = styled(motion.div)`
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 18px 25px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 18px;
  z-index: 1100;
  min-width: 350px;
  
  &.success {
    border-left: 5px solid #05CD99;
    
    .toast-icon {
      color: #05CD99;
      font-size: 22px;
    }
  }
  
  &.error {
    border-left: 5px solid #FF5252;
    
    .toast-icon {
      color: #FF5252;
      font-size: 22px;
    }
  }
  
  .toast-content {
    flex: 1;
    font-weight: 600;
    color: #2B3674;
    font-size: 15px;
  }
  
  .toast-close {
    background: none;
    border: none;
    color: #707EAE;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      color: #2B3674;
    }
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 0;
  color: #707EAE;
  
  .spinner {
    margin-bottom: 25px;
    animation: spin 1s linear infinite;
    font-size: 50px;
    background: linear-gradient(135deg, #304FFE, #304FFE);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    font-size: 18px;
    font-weight: 500;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  padding: 20px 0;
  
  .pagination-button {
    padding: 10px 15px;
    border: 2px solid #e6e9f0;
    background: white;
    color: #707EAE;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    &:hover:not(:disabled) {
      border-color: #304FFE;
      color: #304FFE;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(67, 24, 255, 0.2);
    }
    
    &.active {
      background: linear-gradient(135deg, #304FFE, #304FFE);
      color: white;
      border-color: #304FFE;
      box-shadow: 0 5px 15px rgba(67, 24, 255, 0.3);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  .pagination-info {
    color: #707EAE;
    font-size: 14px;
    margin: 0 20px;
  }
  
  .per-page-select {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #707EAE;
    font-size: 14px;
    
    select {
      padding: 8px 12px;
      border: 2px solid #e6e9f0;
      border-radius: 8px;
      background: white;
      color: #2B3674;
      font-weight: 500;
      cursor: pointer;
      
      &:focus {
        outline: none;
        border-color: #304FFE;
      }
    }
  }
`;

const Toast = ({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <ToastMessage className={type} initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
      <span className="toast-icon">
        {type === 'success' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
      </span>
      <div className="toast-content">{message}</div>
      <button className="toast-close" onClick={onClose}><CloseOutlined /></button>
    </ToastMessage>
  );
};

// Sửa lại định nghĩa component ConfirmDialog

const ConfirmDialog = ({ isOpen, title, content, onConfirm, onCancel, setConfirmDialog, confirmDialog }) => {
  if (!isOpen) return null;

  // Xử lý hàm đóng dialog
  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else {
      setConfirmDialog({...confirmDialog, isOpen: false});
    }
  };

  // Xử lý hàm xác nhận
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    // Tự động đóng dialog sau khi xử lý
    setConfirmDialog({...confirmDialog, isOpen: false});
  };
  
  return (
    <ModalOverlay 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      onClick={handleClose} // Đóng modal khi click ngoài
    >
      <ConfirmModal 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()} // Ngăn sự kiện click lan ra ngoài
      >
        <div className="icon"><ExclamationCircleOutlined /></div>
        <h3>{title}</h3>
        <p>{content}</p>
        <div className="dialog-actions">
          <button className="cancel" onClick={handleClose}>
            Hủy
          </button>
          <button className="delete" onClick={handleConfirm}>
            Xác nhận
          </button>
        </div>
      </ConfirmModal>
    </ModalOverlay>
  );
};

const AppointmentStats = ({ appointments }) => {
  const pending = appointments.filter(a => a.status === 'Pending' || a.status === 'Scheduled').length;
  const confirmed = appointments.filter(a => a.status === 'Confirmed').length;
  const completed = appointments.filter(a => a.status === 'Completed').length;
  const cancelled = appointments.filter(a => a.status === 'Cancelled').length;
  
  return (
    <StatsContainer>
      <StatCard>
        <div className="icon" style={{ background: 'linear-gradient(135deg, #304FFE 0%, #304FFE 100%)' }}>
          <PieChartOutlined />
        </div>
        <div className="content">
          <h4>Tổng lịch hẹn</h4>
          <p className="number">{appointments.length}</p>
        </div>
      </StatCard>
      <StatCard>
        <div className="icon" style={{ background: 'linear-gradient(135deg, #FFAA00 0%, #FFBD59 100%)' }}>
          <ClockCircleOutlined />
        </div>
        <div className="content">
          <h4>Đang chờ</h4>
          <p className="number">{pending}</p>
        </div>
      </StatCard>
      <StatCard>
        <div className="icon" style={{ background: 'linear-gradient(135deg, #7A84FF 0%, #A7B1FF 100%)' }}>
          <ScheduleOutlined />
        </div>
        <div className="content">
          <h4>Đã xác nhận</h4>
          <p className="number">{confirmed}</p>
        </div>
      </StatCard>
      <StatCard>
        <div className="icon" style={{ background: 'linear-gradient(135deg, #05CD99 0%, #6BE4BA 100%)' }}>
          <CheckCircleOutlined />
        </div>
        <div className="content">
          <h4>Đã hoàn thành</h4>
          <p className="number">{completed}</p>
        </div>
      </StatCard>
    </StatsContainer>
  );
};

// ✅ FIXED: Các hàm xử lý timezone - đơn giản hóa để tránh lỗi
const formatDateTimeWithTimeZoneOffset = (date) => {
  if (!date) return null;
  
  // Đơn giản: chỉ cần lấy ISO string và loại bỏ 'Z' để giữ nguyên local time
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  
  console.log('🕐 [formatDateTimeWithTimeZoneOffset] Input:', inputDate);
  console.log('🕐 [formatDateTimeWithTimeZoneOffset] Local Hours:', inputDate.getHours());
  
  // Lấy các thành phần ngày giờ từ local time
  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, '0');
  const day = String(inputDate.getDate()).padStart(2, '0');
  const hours = String(inputDate.getHours()).padStart(2, '0');
  const minutes = String(inputDate.getMinutes()).padStart(2, '0');
  const seconds = String(inputDate.getSeconds()).padStart(2, '0');
  
  // Tạo chuỗi ISO local (không có 'Z')
  const localISOString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  
  console.log('🕐 [formatDateTimeWithTimeZoneOffset] Output (local ISO):', localISOString);
  
  return localISOString;
};

const adjustTimeZoneFromServer = (dateString) => {
  if (!dateString) return null;
  
  console.log('🔧 adjustTimeZoneFromServer input:', dateString);
  
  // Nếu đã là Date object, trả về nguyên trạng
  if (dateString instanceof Date) {
    console.log('🔧 adjustTimeZoneFromServer - already Date object:', dateString);
    return dateString;
  }
  
  // ✅ FIXED: Không cần chuyển đổi timezone - chỉ parse trực tiếp
  // Server đã gửi đúng local time hoặc browser sẽ tự chuyển đổi
  const date = new Date(dateString);
  console.log('🔧 adjustTimeZoneFromServer - parsed date:', date);
  console.log('🔧 adjustTimeZoneFromServer - hours:', date.getHours());
  
  return date;
};

// Kiểm tra thời gian trong giờ làm việc (8:00 - 21:30)
const isWithinBusinessHours = (time) => {
  if (!time) return false;
  
  try {
    const timeObj = new Date(time);
    const hours = timeObj.getHours();
    const minutes = timeObj.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // Giờ làm việc: 8:00 - 21:30
    return totalMinutes >= 480 && totalMinutes <= 1290;
  } catch (error) {
    console.error("Lỗi khi kiểm tra giờ làm việc:", error);
    return false;
  }
};

const AppointmentManagement = () => {
  // Lấy thông tin người dùng từ useAuth
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [users, setUsers] = useState([]);
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    content: '',
    onConfirm: null
  });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Thêm state cho modal hoàn thành lịch hẹn
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Thêm state cho tính năng quản lý lịch hẹn chưa có nhân viên
  const [showStaffAssignModal, setShowStaffAssignModal] = useState(false);
  const [selectedUnassignedAppointment, setSelectedUnassignedAppointment] = useState(null);
  const [availableStaffForService, setAvailableStaffForService] = useState([]);
  const [selectedStaffForAssignment, setSelectedStaffForAssignment] = useState(null);
  const [staffScheduleModal, setStaffScheduleModal] = useState(false);
  const [staffScheduleData, setStaffScheduleData] = useState(null);
  const [loadingStaffSchedule, setLoadingStaffSchedule] = useState(false);

  // Thêm state cho TimeSlotGrid
  const [showTimeSlotView, setShowTimeSlotView] = useState(false);
  const [staffTimeSlots, setStaffTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [staffAppointments, setStaffAppointments] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  // Thêm state mới cho edit form với TimeSlotGrid
  const [showEditTimeSlotGrid, setShowEditTimeSlotGrid] = useState(false);
  const [editTimeSlots, setEditTimeSlots] = useState([]);
  const [selectedEditTimeSlot, setSelectedEditTimeSlot] = useState(null);
  const [petBusyTimeSlots, setPetBusyTimeSlots] = useState([]);
  const [petAppointments, setPetAppointments] = useState([]);
  const [loadingEditTimeSlots, setLoadingEditTimeSlots] = useState(false);
  const [availableStaffForEdit, setAvailableStaffForEdit] = useState([]);
  const [editAppointments, setEditAppointments] = useState([]);

  // Thêm state cho staff busy slots
  const [staffBusyTimeSlots, setStaffBusyTimeSlots] = useState([]);
  const [editStaffAppointments, setEditStaffAppointments] = useState([]);
  
  // ===== THÊM STATE THIẾU CHO EDIT STAFF BUSY SLOTS =====
  const [editStaffBusyTimeSlots, setEditStaffBusyTimeSlots] = useState([]);
  const [currentAppointmentTime, setCurrentAppointmentTime] = useState(null);

  // ===== STATE CHO TẠO LỊCH HẸN MỚI =====
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    userId: '',
    petId: '',
    serviceId: '',
    staffId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });
  const [createTimeSlots, setCreateTimeSlots] = useState([]);
  const [selectedCreateTimeSlot, setSelectedCreateTimeSlot] = useState(null);
  const [loadingCreateTimeSlots, setLoadingCreateTimeSlots] = useState(false);
  const [availableStaffForCreate, setAvailableStaffForCreate] = useState([]);
  const [userPets, setUserPets] = useState([]);
  const [createPetBusySlots, setCreatePetBusySlots] = useState([]);
  const [createPetAppointments, setCreatePetAppointments] = useState([]);

  // Chuyển đổi tiếng Anh -> tiếng Việt
  const statusEnToVi = {
    'Pending': 'Đang chờ',
    'Confirmed': 'Đã xác nhận',
    'Completed': 'Đã hoàn thành',
    'Cancelled': 'Đã hủy',
    'Scheduled': 'Đã đặt lịch',
    'No-Show': 'Không đến'
  };

  // Chuyển đổi tiếng Việt -> tiếng Anh
  const statusViToEn = {
    'Đang chờ': 'Pending',
    'Đã xác nhận': 'Confirmed',
    'Đã hoàn thành': 'Completed',
    'Đã hủy': 'Cancelled',
    'Đã đặt lịch': 'Scheduled',
    'Không đến': 'No-Show'
  };
  
  // Lấy icon cho trạng thái
  const getStatusIcon = (status) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'pending' || lowerStatus === 'đang chờ')
      return <ClockCircleOutlined style={{ color: '#FFAA00' }} />;
    if (lowerStatus === 'scheduled' || lowerStatus === 'đã đặt lịch' || lowerStatus === 'đã lên lịch')
      return <ScheduleOutlined style={{ color: '#3A8BFF' }} />;
    if (lowerStatus === 'confirmed' || lowerStatus === 'đã xác nhận')
      return <InfoCircleOutlined style={{ color: '#7A84FF' }} />;
    if (lowerStatus === 'completed' || lowerStatus === 'đã hoàn thành') 
      return <CheckCircleOutlined style={{ color: '#05CD99' }} />;
    if (lowerStatus === 'cancelled' || lowerStatus === 'đã hủy')
      return <CloseCircleOutlined style={{ color: '#FF5252' }} />;
    if (lowerStatus === 'no-show' || lowerStatus === 'không đến')
      return <WarningOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />;
    return null;
  };
  
  // Kiểm tra xem lịch hẹn có thể chỉnh sửa không
  const canEditAppointment = (appointment) => {
    // Kiểm tra nếu lịch hẹn đã hoàn thành hoặc đã hủy
    if (appointment.status === 'Completed' || appointment.status === 'Cancelled' || appointment.status === 'No-Show') {
      return false;
    }
    return true;
  };

  // Form state cho chỉnh sửa lịch hẹn
  const [formData, setFormData] = useState({
    userId: '',
    petId: '',
    serviceId: '',
    appointmentDate: '',
    appointmentTime: '',
    status: 'Đang chờ',
    notes: ''
  });

  // Danh sách các trạng thái
  const statusList = {
    'Đang chờ': 'pending',
    'Đã xác nhận': 'confirmed',
    'Đã hoàn thành': 'completed',
    'Đã hủy': 'cancelled'
  };
  
  // Hàm combine date và time
  const combineDateTime = (date, time) => {
    if (!date) return null;
    if (!time) return `${date}T00:00:00`;
    return `${date}T${time}:00`;
  };

  // Hàm tách giờ từ chuỗi ISO datetime
  const extractTimeFromISOString = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Lỗi khi trích xuất thời gian:', error);
      return '';
    }
  };

  // Load lịch hẹn khi component mount
  useEffect(() => {
    fetchAppointments();
    fetchUsers();
    fetchPets();
    fetchServices();
  }, []);

  // Auto-select current appointment time slot when editTimeSlots changes
  useEffect(() => {
    if (currentAppointmentTime && editTimeSlots.length > 0 && !selectedEditTimeSlot) {
      console.log('🎯 Auto-selecting current time slot:', currentAppointmentTime);
      
      const currentSlot = editTimeSlots.find(slot => {
        const slotTime = slot.startTimeString || 
                       (slot.startTime instanceof Date ? 
                        dayjs(slot.startTime).format('HH:mm') : 
                        slot.startTime);
        return slotTime === currentAppointmentTime;
      });
      
      if (currentSlot) {
        console.log('✅ Auto-selected current time slot:', currentSlot);
        setSelectedEditTimeSlot(currentSlot);
      } else {
        console.log('⚠️ Current time slot not found in generated slots');
      }
    }
  }, [editTimeSlots, currentAppointmentTime, selectedEditTimeSlot]);

  // Load time slots when creating new appointment
  useEffect(() => {
    if (createFormData.serviceId && createFormData.appointmentDate) {
      loadCreateTimeSlots();
    }
  }, [createFormData.serviceId, createFormData.appointmentDate]);

  // Lấy danh sách lịch hẹn từ API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log('Đang tải lịch hẹn...');
      
      // Sử dụng appointmentService thay vì gọi API trực tiếp
      let appointmentsData;
      
      try {
        // Ưu tiên sử dụng appointmentService
        const response = await appointmentService.getAllAppointments();
        appointmentsData = response;
        console.log('Dữ liệu lịch hẹn đã nhận từ service:', appointmentsData);
        
        // DEBUG: Kiểm tra timezone của appointment đầu tiên
        if (appointmentsData && appointmentsData.length > 0) {
          const firstAppt = appointmentsData[0];
          console.log('🕐 DEBUG TIMEZONE - First appointment raw date:', firstAppt.appointmentDate);
          console.log('🕐 DEBUG TIMEZONE - Date type:', typeof firstAppt.appointmentDate);
          const testDate = new Date(firstAppt.appointmentDate);
          console.log('🕐 DEBUG TIMEZONE - After new Date():', testDate);
          console.log('🕐 DEBUG TIMEZONE - toString():', testDate.toString());
          console.log('🕐 DEBUG TIMEZONE - toISOString():', testDate.toISOString());
          console.log('🕐 DEBUG TIMEZONE - toLocaleString():', testDate.toLocaleString());
          console.log('🕐 DEBUG TIMEZONE - getHours():', testDate.getHours());
          console.log('🕐 DEBUG TIMEZONE - getMinutes():', testDate.getMinutes());
        }
      } catch (serviceError) {
        console.error('Lỗi khi sử dụng appointmentService:', serviceError);
        
        // Fallback nếu service gặp lỗi
        const response = await axiosClient.get('/Appointments');
        appointmentsData = response.data;
        console.log('Dữ liệu lịch hẹn đã nhận từ fallback:', appointmentsData);
      }
      
      // Chuẩn hóa trạng thái và dữ liệu ngày giờ
      const normalizedAppointments = appointmentsData.map(appointment => {
        // Xử lý trạng thái
        if (appointment.status && typeof appointment.status === 'string') {
          if (statusViToEn[appointment.status]) {
            appointment.status = statusViToEn[appointment.status];
          } 
          else if (!['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-Show', 'Pending'].includes(appointment.status)) {
            appointment.status = appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).toLowerCase();
          }
        } else {
          appointment.status = 'Scheduled';
        }
        
        // Chuẩn hóa định dạng ngày giờ
        if (appointment.appointmentDate) {
          console.log('🕐 [FETCH] Raw appointment date from server:', appointment.appointmentDate);
          
          // ✅ FIXED: Không cần adjust timezone - browser sẽ tự parse đúng
          // Nếu server gửi ISO string với 'Z', new Date() sẽ tự chuyển sang local time
          // Nếu server gửi local time không có 'Z', new Date() sẽ giữ nguyên
          const parsedDate = new Date(appointment.appointmentDate);
          appointment.appointmentDate = parsedDate;
          
          console.log('🕐 [FETCH] Parsed date (local):', parsedDate);
          console.log('🕐 [FETCH] Local hours:', parsedDate.getHours());
        }
        
        return appointment;
      });
      
      setAppointments(normalizedAppointments);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải lịch hẹn:', err);
      setError('Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      // Thử lấy từ endpoint Users trước
      const response = await axiosClient.get('/Users');
      setUsers(response.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng:', err);
      try {
        // Fallback đến /api/Users
        const response = await axiosClient.get('/api/Users');
        setUsers(response.data);
      } catch (error) {
        console.error('Tất cả các đường dẫn để tải người dùng đều thất bại');
      }
    }
  };

  // Lấy danh sách thú cưng
  const fetchPets = async () => {
    try {
      // Thử lấy từ endpoint Pets trước
      const response = await axiosClient.get('/Pets');
      setPets(response.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách thú cưng:', err);
      try {
        // Fallback đến /api/Pets
        const response = await axiosClient.get('/api/Pets');
        setPets(response.data);
      } catch (error) {
        console.error('Tất cả các đường dẫn để tải thú cưng đều thất bại');
      }
    }
  };

  // Lấy danh sách dịch vụ
  const fetchServices = async () => {
    try {
      // Thử lấy từ endpoint Services trước
      const response = await axiosClient.get('/Services');
      setServices(response.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách dịch vụ:', err);
      try {
        // Fallback đến /api/Services
        const response = await axiosClient.get('/api/Services');
        setServices(response.data);
      } catch (error) {
        console.error('Tất cả các đường dẫn để tải dịch vụ đều thất bại');
      }
    }
  };

  // Xử lý thay đổi input trong form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Thêm hàm fetch pet busy slots
  const fetchPetBusySlots = async (petId, date) => {
    if (!petId || !date) {
      console.warn('❌ fetchPetBusySlots: Missing petId or date');
      return [];
    }
    
    try {
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      console.log(`🐕 Fetching busy slots for pet ${petId} on ${formattedDate}`);
      
      // ===== SỬ DỤNG API CHUYÊN BIỆT TRƯỚC =====
      try {
        const response = await axiosClient.get(`/Appointments/Pet/${petId}/busy-slots?date=${formattedDate}`);
        if (response.data && Array.isArray(response.data)) {
          console.log(`✅ Pet ${petId} busy slots from API:`, response.data);
          return response.data;
        }
      } catch (apiError) {
        console.warn('📡 Pet busy slots API not available, using fallback method:', apiError.message);
      }
      
      // ===== FALLBACK: SỬ DỤNG APPOINTMENTSERVICE =====
      const busySlots = await appointmentService.getPetBusyTimeSlots(petId, formattedDate);
      console.log(`🔄 Pet ${petId} busy slots from service:`, busySlots);
      
      return Array.isArray(busySlots) ? busySlots : [];
    } catch (error) {
      console.error(`❌ Error fetching pet busy slots for pet ${petId}:`, error);
      return [];
    }
  };

  // Thêm hàm fetch pet appointments
  const fetchPetAppointments = async (petId, date) => {
    if (!petId || !date) {
      console.warn('❌ fetchPetAppointments: Missing petId or date');
      return [];
    }
    
    try {
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      console.log(`🐕 Fetching appointments for pet ${petId} on ${formattedDate}`);
      
      // ===== SỬ DỤNG API CHUYÊN BIỆT TRƯỚC =====
      try {
        const response = await axiosClient.get(`/Appointments/Pet/${petId}/appointments?date=${formattedDate}`);
        if (response.data && Array.isArray(response.data)) {
          console.log(`✅ Pet ${petId} appointments from API:`, response.data);
          return response.data;
        }
      } catch (apiError) {
        console.warn('📡 Pet appointments API not available, using fallback method:', apiError.message);
      }
      
      // ===== FALLBACK: LỌC TỪ TẤT CẢ LỊCH HẸN =====
      const allAppointments = appointments.filter(apt => 
        apt.petId === parseInt(petId) && 
        dayjs(apt.appointmentDate).format('YYYY-MM-DD') === formattedDate &&
        !['Cancelled', 'Completed'].includes(apt.status) // Loại trừ đã hủy/hoàn thành
      );
      
      console.log(`🔄 Pet ${petId} appointments from filtered list:`, allAppointments);
      return allAppointments;
    } catch (error) {
      console.error(`❌ Error fetching pet appointments for pet ${petId}:`, error);
      return [];
    }
  };

  // Thêm hàm fetch staff busy slots
  const fetchStaffBusySlots = async (staffId, date) => {
    if (!staffId || !date) {
      console.warn('❌ fetchStaffBusySlots: Missing staffId or date');
      return [];
    }
    
    try {
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      console.log(`👤 [FETCH STAFF BUSY] Fetching busy slots for staff ${staffId} on ${formattedDate}`);
      
      // ===== SỬ DỤNG API CHUYÊN BIỆT TRƯỚC =====
      try {
        const response = await axiosClient.get(`/Staff/${staffId}/busy-slots?date=${formattedDate}`);
        if (response.data && Array.isArray(response.data)) {
          console.log(`✅ [FETCH STAFF BUSY] Staff ${staffId} busy slots from API:`, response.data);
          return response.data;
        }
      } catch (apiError) {
        console.warn('📡 Staff busy slots API not available, using fallback method:', apiError.message);
      }
      
      // ===== FALLBACK: SỬ DỤNG APPOINTMENTSERVICE =====
      const busySlots = await appointmentService.getStaffBusyTimeSlots(staffId, formattedDate);
      console.log(`🔄 [FETCH STAFF BUSY] Staff ${staffId} busy slots from service:`, busySlots);
      
      return Array.isArray(busySlots) ? busySlots : [];
    } catch (error) {
      console.error(`❌ Error fetching staff busy slots for staff ${staffId}:`, error);
      return [];
    }
  };

  // Thêm hàm fetch staff appointments
  const fetchStaffAppointments = async (staffId, date) => {
    if (!staffId || !date) {
      console.warn('❌ fetchStaffAppointments: Missing staffId or date');
      return [];
    }
    
    try {
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      console.log(`👤 [FETCH STAFF APPTS] Fetching appointments for staff ${staffId} on ${formattedDate}`);
      
      // ===== DÙNG CHECKSTAFFSCHEDULE =====
      const scheduleData = await appointmentService.checkStaffSchedule(staffId, formattedDate);
      
      console.log(`👤 [FETCH STAFF APPTS] Raw scheduleData:`, scheduleData);
      
      if (scheduleData && scheduleData.appointments) {
        console.log(`✅ [FETCH STAFF APPTS] Staff ${staffId} appointments:`, scheduleData.appointments);
        const filteredAppts = scheduleData.appointments.filter(apt => 
          !['Cancelled', 'Completed'].includes(apt.status) // Loại trừ đã hủy/hoàn thành
        );
        console.log(`✅ [FETCH STAFF APPTS] Filtered appointments (active only):`, filteredAppts);
        return scheduleData.appointments.filter(apt => 
          !['Cancelled', 'Completed'].includes(apt.status) // Loại trừ đã hủy/hoàn thành
        );
      }
      
      return [];
    } catch (error) {
      console.error(`❌ Error fetching staff appointments for staff ${staffId}:`, error);
      return [];
    }
  };

  // Thêm hàm load time slots cho edit
  const loadEditTimeSlots = async (serviceId, staffId, date, petId, excludeAppointmentId = null) => {
    try {
      setLoadingEditTimeSlots(true);
      console.log('🔄 loadEditTimeSlots called with:', { serviceId, staffId, date, petId, excludeAppointmentId });
      
      // ===== VALIDATE INPUT PARAMETERS =====
      if (!serviceId || !date || !petId) {
        const missingParams = [];
        if (!serviceId) missingParams.push('serviceId');
        if (!date) missingParams.push('date');
        if (!petId) missingParams.push('petId');
        
        const errorMsg = `❌ Missing required parameters: ${missingParams.join(', ')}`;
        console.error(errorMsg);
        setToast({
          show: true,
          message: errorMsg,
          type: 'error'
        });
        return;
      }
      
      // ===== LẤY THỜI LƯỢNG DỊCH VỤ THỰC TẾ =====
      const actualServiceDuration = getServiceDuration(serviceId, services);
      console.log(`🕐 Edit: Using actual service duration: ${actualServiceDuration} minutes for service ${serviceId}`);
      
      // ===== FETCH PET BUSY SLOTS AND APPOINTMENTS =====
      const [busySlots, petAppts] = await Promise.all([
        fetchPetBusySlots(petId, date),
        fetchPetAppointments(petId, date)
      ]);
      
      console.log(`🐕 Pet ${petId} busy slots:`, busySlots);
      console.log(`🐕 Pet ${petId} appointments:`, petAppts);
      
      // ===== FETCH STAFF BUSY SLOTS IF STAFF SELECTED =====
      let staffBusySlots = [];
      let staffAppts = [];
      
      if (staffId) {
        [staffBusySlots, staffAppts] = await Promise.all([
          fetchStaffBusySlots(staffId, date),
          fetchStaffAppointments(staffId, date)
        ]);
        
        console.log(`👤 Staff ${staffId} busy slots:`, staffBusySlots);
        console.log(`👤 Staff ${staffId} appointments:`, staffAppts);
        
        setEditStaffBusyTimeSlots(staffBusySlots);
        setEditStaffAppointments(staffAppts);
      }
      
      // ===== TẠO SLOTS VỚI DURATION THỰC TẾ THAY VÌ GỌI API =====
      console.log('🔧 Creating time slots with actual service duration instead of API call...');
      
      // ===== FILTER OUT CURRENT APPOINTMENT FROM STAFF BUSY SLOTS =====
      let filteredStaffBusySlots = staffBusySlots;
      let filteredStaffAppts = staffAppts; // Declare at function scope
      
      if (excludeAppointmentId && staffAppts.length > 0) {
        console.log(`🔧 [ADMIN DEBUG] Filtering out appointmentId ${excludeAppointmentId} from staff busy slots`);
        
        // Tạo lại staffBusySlots từ staff appointments, loại trừ appointment đang edit
        filteredStaffAppts = staffAppts.filter(apt => 
          apt.appointmentId !== excludeAppointmentId && 
          apt.id !== excludeAppointmentId
        );
        
        filteredStaffBusySlots = filteredStaffAppts.map(apt => {
          if (apt.appointmentDate) {
            return dayjs(apt.appointmentDate).format('HH:mm');
          }
          return null;
        }).filter(Boolean);
        
        console.log(`🔧 [ADMIN DEBUG] Original staff appointments:`, staffAppts.length);
        console.log(`🔧 [ADMIN DEBUG] Filtered staff appointments:`, filteredStaffAppts.length);
        console.log(`🔧 [ADMIN DEBUG] Original staffBusySlots:`, staffBusySlots);
        console.log(`🔧 [ADMIN DEBUG] Filtered staffBusySlots:`, filteredStaffBusySlots);
      }
      
      const generatedSlots = generateEditTimeSlots(
        date,
        actualServiceDuration,
        busySlots,
        filteredStaffBusySlots,
        excludeAppointmentId,
        filteredStaffAppts,
        petAppts
      );
      
      console.log(`✅ Generated ${generatedSlots.length} edit time slots with actual service duration ${actualServiceDuration} minutes`);
      
      // ===== CẬP NHẬT STATES =====
      setEditTimeSlots(generatedSlots);
      setPetBusyTimeSlots(busySlots);
      setPetAppointments(petAppts);
      
    } catch (error) {
      const errorMessage = `❌ Error loading edit time slots: ${error.message || error}`;
      console.error(errorMessage, error);
      setToast({
        show: true,
        message: 'Không thể tải khung giờ. Vui lòng thử lại.',
        type: 'error'
      });
    } finally {
      setLoadingEditTimeSlots(false);
    }
  };

  // Thêm handler cho TimeSlotGrid trong edit mode
  const handleEditTimeSlotSelect = (slot) => {
    console.log('Selected edit time slot:', slot);
    setSelectedEditTimeSlot(slot);
    
    // Update form data with selected time
    // ===== SỬA LỖI: ĐẢNG BẢO CHỌN ĐÚNG THUỘC TÍNH TIME =====
    const slotTime = slot.startTimeString || slot.startTime || 
                    (slot.startTime instanceof Date ? 
                     dayjs(slot.startTime).format('HH:mm') : 
                     (typeof slot.startTime === 'string' ? slot.startTime : ''));
    
    // Validate time before setting
    if (slotTime && slotTime.match(/^\d{2}:\d{2}$/)) {
      setFormData(prev => ({
        ...prev,
        appointmentTime: slotTime,
        staffId: slot.staffId || prev.staffId
      }));
    } else {
      console.warn('⚠️ Invalid time slot selected:', slot);
      setToast({
        show: true,
        message: 'Khung giờ không hợp lệ. Vui lòng chọn lại.',
        type: 'error'
      });
    }
  };

  // Cập nhật hàm handleChange để reload time slots khi thay đổi service/staff/date
  const handleChangeWithTimeSlots = async (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    
    // Reload time slots when key fields change
    if ((name === 'serviceId' || name === 'staffId' || name === 'appointmentDate') && 
        newFormData.serviceId && newFormData.appointmentDate && newFormData.petId) {
      
      // Load staff for new service
      if (name === 'serviceId') {
        try {
          const staff = await staffService.getStaffByService(value);
          setAvailableStaffForEdit(Array.isArray(staff) ? staff : []);
          // Reset staff selection when service changes
          setFormData(prev => ({ ...prev, staffId: '' }));
        } catch (error) {
          console.error('Error loading staff for service:', error);
        }
      }
      
      await loadEditTimeSlots(
        newFormData.serviceId,
        newFormData.staffId,
        newFormData.appointmentDate,
        newFormData.petId,
        currentAppointment?.appointmentId
      );
      
      // Reset selected time slot when parameters change
      setSelectedEditTimeSlot(null);
    }
  };

  // Bắt đầu chỉnh sửa lịch hẹn
  const handleEdit = async (appointment) => {
    console.log('🔧 Starting edit for appointment:', appointment);
    setCurrentAppointment(appointment);
    
    // Set form data
    setFormData({
      userId: appointment.userId,
      petId: appointment.petId,
      serviceId: appointment.serviceId,
      staffId: appointment.staffId || '',
      appointmentDate: formatDateForInput(appointment.appointmentDate),
      appointmentTime: extractTimeFromISOString(appointment.appointmentDate),
      status: statusEnToVi[appointment.status] || appointment.status,
      notes: appointment.notes || ''
    });
    
    setEditMode(true);
    
    // ===== LOAD STAFF FOR SERVICE =====
    if (appointment.serviceId) {
      try {
        const staff = await staffService.getStaffByService(appointment.serviceId);
        setAvailableStaffForEdit(Array.isArray(staff) ? staff : []);
        console.log('✅ Loaded staff for service:', staff);
      } catch (error) {
        console.error('❌ Error loading staff for service:', error);
        setAvailableStaffForEdit([]);
      }
    }
    
    // ===== IMMEDIATELY LOAD BUSY SLOTS AND TIME SLOTS =====
    if (appointment.appointmentDate && appointment.serviceId && appointment.petId) {
      console.log('🔄 Loading busy slots and time slots immediately...');
      
      try {
        // Load busy slots and time slots in parallel
        await loadEditTimeSlots(
          appointment.serviceId,
          appointment.staffId,
          appointment.appointmentDate,
          appointment.petId,
          appointment.appointmentId
        );
        
        // Store current appointment time for auto-selection
        const currentTime = extractTimeFromISOString(appointment.appointmentDate);
        console.log('🎯 Storing current time for auto-selection:', currentTime);
        setCurrentAppointmentTime(currentTime);
        
      } catch (error) {
        console.error('❌ Error loading initial edit data:', error);
        setToast({
          show: true,
          message: 'Không thể tải thông tin lịch bận. Vui lòng thử lại.',
          type: 'error'
        });
      }
    } else {
      console.warn('⚠️ Missing required data for loading time slots:', {
        appointmentDate: appointment.appointmentDate,
        serviceId: appointment.serviceId,
        petId: appointment.petId
      });
    }
  };

  // Load time slots for creating new appointment
  const loadCreateTimeSlots = async () => {
    try {
      setLoadingCreateTimeSlots(true);
      
      const selectedDate = createFormData.appointmentDate;
      const serviceId = parseInt(createFormData.serviceId);
      const petId = parseInt(createFormData.petId);
      
      console.log('📅 Loading time slots for create:', { selectedDate, serviceId, petId });
      
      // Load lịch bận của thú cưng song song với time slots
      const [slotsResponse, petBusySlots, petAppts] = await Promise.all([
        appointmentService.getAvailableTimeSlots(selectedDate, serviceId, null, petId),
        appointmentService.getPetBusyTimeSlots(petId, selectedDate),
        appointmentService.getPetAppointments(petId, selectedDate)
      ]);
      
      console.log('✅ Loaded data:', {
        slots: slotsResponse?.timeSlots?.length || 0,
        petBusySlots: petBusySlots?.length || 0,
        petAppointments: petAppts?.length || 0,
        petBusySlotsData: petBusySlots,
        petApptsData: petAppts
      });
      
      // Set pet busy slots và appointments
      console.log('🔴 Setting createPetBusySlots:', petBusySlots);
      console.log('📋 Setting createPetAppointments:', petAppts);
      setCreatePetBusySlots(petBusySlots || []);
      setCreatePetAppointments(petAppts || []);
      
      if (slotsResponse && slotsResponse.timeSlots) {
        console.log('📋 Time slots count:', slotsResponse.timeSlots.length);
        setCreateTimeSlots(slotsResponse.timeSlots);
      } else {
        console.warn('⚠️ No time slots in response:', slotsResponse);
        setCreateTimeSlots([]);
      }
    } catch (error) {
      console.error('❌ Error loading create time slots:', error);
      notification.error({
        message: 'Lỗi',
        description: error.message || 'Không thể tải khung giờ. Vui lòng thử lại.'
      });
      setCreateTimeSlots([]);
      setCreatePetBusySlots([]);
      setCreatePetAppointments([]);
    } finally {
      setLoadingCreateTimeSlots(false);
    }
  };

  // Create new appointment
  const handleCreateAppointment = async () => {
    try {
      if (!selectedCreateTimeSlot) {
        notification.warning({
          message: 'Thiếu thông tin',
          description: 'Vui lòng chọn khung giờ'
        });
        return;
      }

      setLoading(true);

      // Prepare appointment data
      const localDate = dayjs(createFormData.appointmentDate);
      const [hours, minutes] = createFormData.appointmentTime.split(':');
      localDate.set('hour', parseInt(hours)).set('minute', parseInt(minutes));

      // Calculate timezone offset
      const timezoneOffsetMinutes = localDate.toDate().getTimezoneOffset();
      
      // Create UTC datetime from local time
      const utcDateTime = new Date(localDate.toDate().getTime() - (timezoneOffsetMinutes * 60000));

      const appointmentData = {
        petId: parseInt(createFormData.petId),
        serviceId: parseInt(createFormData.serviceId),
        staffId: createFormData.staffId ? parseInt(createFormData.staffId) : null,
        appointmentDate: utcDateTime.toISOString(),
        notes: createFormData.notes || ''
      };

      console.log('Creating appointment:', appointmentData);

      const result = await appointmentService.createAppointment(appointmentData);

      if (result) {
        notification.success({
          message: 'Thành công',
          description: 'Tạo lịch hẹn thành công!'
        });

        // Reset form and close modal
        setShowCreateModal(false);
        setCreateFormData({
          userId: '',
          petId: '',
          serviceId: '',
          staffId: '',
          appointmentDate: '',
          appointmentTime: '',
          notes: ''
        });
        setSelectedCreateTimeSlot(null);
        setCreateTimeSlots([]);
        setCreatePetBusySlots([]);
        setCreatePetAppointments([]);
        setUserPets([]);

        // Reload appointments
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      notification.error({
        message: 'Lỗi',
        description: error.message || 'Không thể tạo lịch hẹn. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Hủy bỏ chỉnh sửa
  const handleCancel = () => {
    setEditMode(false);
    setCurrentAppointment(null);
    setShowEditTimeSlotGrid(false);
    setSelectedEditTimeSlot(null);
    setEditTimeSlots([]);
    setPetBusyTimeSlots([]);
    setPetAppointments([]);
    setAvailableStaffForEdit([]);
    setStaffBusyTimeSlots([]);
    setEditStaffAppointments([]);
    setCurrentAppointmentTime(null); // Reset current appointment time
  };

  // Lưu thay đổi lịch hẹn
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validation
      if (!formData.appointmentDate) {
        setToast({
          show: true,
          message: 'Vui lòng chọn ngày hẹn',
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      if (!selectedEditTimeSlot && !formData.appointmentTime) {
        setToast({
          show: true,
          message: 'Vui lòng chọn khung giờ hẹn',
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Use selected time slot or manual time input
      const timeToUse = selectedEditTimeSlot ? 
        (selectedEditTimeSlot.startTimeString || 
         (selectedEditTimeSlot.startTime instanceof Date ? 
          dayjs(selectedEditTimeSlot.startTime).format('HH:mm') : 
          selectedEditTimeSlot.startTime)) : 
        formData.appointmentTime;
      
      // Staff ID to use
      const staffIdToUse = selectedEditTimeSlot?.staffId || formData.staffId;
      
      // ✅ FIX TIMEZONE ISSUE:
      // Tạo datetime theo UTC để gửi lên server
      // Ví dụ: user chọn 2h chiều (14:00) ở Việt Nam
      // Ta cần gửi lên server là 14:00 theo giờ Việt Nam (chứ không phải 14:00 UTC)
      const [hours, minutes] = timeToUse.split(':').map(Number);
      const localDate = new Date(formData.appointmentDate);
      localDate.setHours(hours, minutes, 0, 0);
      
      // Lấy timezone offset (Việt Nam = -420 phút = -7 giờ so với UTC)
      const timezoneOffsetMinutes = localDate.getTimezoneOffset();
      
      // Tạo UTC datetime bằng cách CỘNG offset (vì offset là âm)
      const utcDateTime = new Date(localDate.getTime() - (timezoneOffsetMinutes * 60000));
      
      console.log('🕐 [TIMEZONE DEBUG] Selected date:', formData.appointmentDate);
      console.log('🕐 [TIMEZONE DEBUG] Selected time:', timeToUse);
      console.log('🕐 [TIMEZONE DEBUG] Local datetime:', localDate);
      console.log('🕐 [TIMEZONE DEBUG] Timezone offset (minutes):', timezoneOffsetMinutes);
      console.log('🕐 [TIMEZONE DEBUG] UTC datetime to send:', utcDateTime);
      console.log('🕐 [TIMEZONE DEBUG] UTC ISO string:', utcDateTime.toISOString());
      
      // Validate business hours (kiểm tra theo giờ local, không phải UTC)
      const hour = localDate.getHours();
      const minute = localDate.getMinutes();
      const totalMinutes = hour * 60 + minute;
      
      const openingTime = 8 * 60; // 8:00
      const closingTime = 21 * 60 + 30; // 21:30
      
      if (totalMinutes < openingTime || totalMinutes > closingTime) {
        setToast({
          show: true,
          message: 'Thời gian hẹn phải trong giờ làm việc: 8:00 - 21:30',
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Check service duration + buffer time
      const serviceDuration = getServiceDuration(formData.serviceId, services);
      const endTimeMinutes = totalMinutes + serviceDuration + BUFFER_TIME_MINUTES;
      if (endTimeMinutes > closingTime) {
        setToast({
          show: true,
          message: `Dịch vụ này kéo dài ${serviceDuration} phút (thêm ${BUFFER_TIME_MINUTES} phút buffer time) và sẽ kết thúc sau 21:30, vui lòng chọn thời gian sớm hơn`,
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Check for overlapping appointments (excluding current one)
      // ✅ FIX: Sử dụng localDate để kiểm tra overlap
      const hasOverlap = checkForOverlappingAppointments(
        localDate, 
        serviceDuration, 
        currentAppointment?.appointmentId
      );
      
      if (hasOverlap) {
        setToast({
          show: true,
          message: 'Thời gian này đã có lịch hẹn khác. Vui lòng chọn thời gian khác.',
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Check pet busy slots (dùng localDate, không phải UTC)
      const timeStr = dayjs(localDate).format('HH:mm');
      const isPetBusy = checkAppointmentConflictForEdit(
        timeStr, 
        petBusyTimeSlots, 
        petAppointments, 
        serviceDuration,
        currentAppointment.appointmentId // Loại trừ appointment đang được chỉnh sửa
      );
      
      if (isPetBusy) {
        setToast({
          show: true,
          message: 'Thú cưng đã có lịch hẹn khác trong khung giờ này. Vui lòng chọn thời gian khác.',
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Check staff busy slots if staff is selected
      if (staffIdToUse) {
        const isStaffBusy = checkStaffConflictForEdit(
          timeStr, 
          staffBusyTimeSlots, 
          editStaffAppointments, 
          currentAppointment.appointmentId
        );
        
        if (isStaffBusy) {
          setToast({
            show: true,
            message: 'Nhân viên đã có lịch hẹn khác trong khung giờ này. Vui lòng chọn thời gian khác.',
            type: 'error'
          });
          setLoading(false);
          return;
        }
      }
      
      // Prepare update data
      // ✅ FIX TIMEZONE: utcDateTime đã được tạo đúng UTC từ local time
      // Backend sẽ nhận UTC time và tự convert về local timezone để validate
      const updatedData = {
        userId: formData.userId,
        petId: formData.petId,
        serviceId: formData.serviceId,
        staffId: staffIdToUse || null,
        appointmentDate: utcDateTime.toISOString(), // Gửi UTC datetime
        status: statusViToEn[formData.status] || formData.status,
        notes: formData.notes
      };
      
      console.log('🕐 [ADMIN SAVE] Local time selected:', `${hours}:${minutes}`);
      console.log('🕐 [ADMIN SAVE] UTC sent to server:', updatedData.appointmentDate);
      
      console.log('Updating appointment with data:', updatedData);
      
      // Update appointment
      let response;
      let success = false;
      
      try {
        response = await appointmentService.updateAppointment(
          currentAppointment.appointmentId, 
          updatedData
        );
        console.log('Update response from service:', response);
        success = true;
      } catch (serviceError) {
        console.error('Error using appointmentService:', serviceError);
        
        try {
          response = await axiosClient.put(
            `/Appointments/${currentAppointment.appointmentId}`, 
            updatedData
          );
          console.log('Update response from fallback 1:', response.data);
          response = response.data;
          success = true;
        } catch (error1) {
          console.error('Error using /Appointments path:', error1);
          
          response = await axiosClient.put(
            `/api/Appointments/${currentAppointment.appointmentId}`, 
            updatedData
          );
          console.log('Update response from fallback 2:', response.data);
          response = response.data;
          success = true;
        }
      }
      
      if (success) {
        setToast({
          show: true,
          message: 'Cập nhật lịch hẹn thành công',
          type: 'success'
        });
        
        // ===== THÊM ĐỒNG BỘ KHUNG GIỜ GÁN NHÂN VIÊN =====
        try {
          const appointmentData = currentAppointment;
          // ✅ FIX TIMEZONE: Sử dụng utcDateTime đã được convert đúng
          const newAppointmentData = {
            ...appointmentData,
            staffId: staffIdToUse,
            appointmentDate: utcDateTime.toISOString(), // UTC datetime
            status: statusViToEn[formData.status] || formData.status
          };
          
          // 1. Đồng bộ lịch bận của thú cưng (dùng localDate)
          if (appointmentData.petId) {
            console.log(`🔄 Đồng bộ lịch bận thú cưng ${appointmentData.petId}`);
            window.dispatchEvent(new CustomEvent('pet-busy-slots-updated', {
              detail: {
                petId: appointmentData.petId,
                date: dayjs(localDate).format('YYYY-MM-DD'),
                action: 'update',
                oldAppointment: appointmentData,
                newAppointment: newAppointmentData
              }
            }));
          }
          
          // 2. Đồng bộ lịch bận của nhân viên CŨ (nếu có)
          if (appointmentData.staffId && appointmentData.staffId !== staffIdToUse) {
            console.log(`🔄 Xóa lịch bận nhân viên cũ ${appointmentData.staffId}`);
            window.dispatchEvent(new CustomEvent('staff-appointments-updated', {
              detail: {
                staffId: appointmentData.staffId,
                date: dayjs(localDate).format('YYYY-MM-DD'),
                action: 'remove',
                appointmentId: appointmentData.appointmentId
              }
            }));
          }
          
          // 3. Đồng bộ lịch bận của nhân viên MỚI
          if (staffIdToUse) {
            console.log(`🔄 Thêm lịch bận nhân viên mới ${staffIdToUse}`);
            window.dispatchEvent(new CustomEvent('staff-appointments-updated', {
              detail: {
                staffId: staffIdToUse,
                date: dayjs(localDate).format('YYYY-MM-DD'),
                action: 'add',
                appointment: newAppointmentData
              }
            }));
          }
          
          // 4. Đồng bộ khung giờ gán nhân viên trong TimeSlotGrid
          window.dispatchEvent(new CustomEvent('appointment-updated', {
            detail: {
              appointmentId: currentAppointment.appointmentId,
              oldData: appointmentData,
              newData: newAppointmentData,
              staffChanged: appointmentData.staffId !== staffIdToUse,
              timeChanged: dayjs(appointmentData.appointmentDate).format('HH:mm') !== timeStr
            }
          }));
          
          // 5. Làm mới cache lịch bận (dùng localDate)
          const cacheKeys = [
            `petBusySlots_${appointmentData.petId}_${dayjs(localDate).format('YYYY-MM-DD')}`,
            `staffBusySlots_${appointmentData.staffId}_${dayjs(localDate).format('YYYY-MM-DD')}`,
            `staffBusySlots_${staffIdToUse}_${dayjs(localDate).format('YYYY-MM-DD')}`
          ];
          
          cacheKeys.forEach(key => {
            if (key.includes('undefined') || key.includes('null')) return;
            try {
              localStorage.removeItem(key);
              console.log(`🗑️ Đã xóa cache: ${key}`);
            } catch (e) {
              console.warn('Lỗi khi xóa cache:', e);
            }
          });
          
          // 6. Kích hoạt làm mới UI toàn bộ
          setTimeout(() => {
            // Sử dụng sync manager thay vì custom event
            appointmentSyncManager.notifyAppointmentUpdated({
              appointmentId: currentAppointment.appointmentId,
              petId: currentAppointment.petId,
              staffId: currentAppointment.staffId,
              appointmentDate: currentAppointment.appointmentDate
            });
          }, 100);
          
        } catch (syncError) {
          console.error('Lỗi khi đồng bộ dữ liệu:', syncError);
          // Không block luồng chính nếu có lỗi đồng bộ
          setToast({
            show: true,
            message: '⚠️ Lịch hẹn đã được lưu nhưng có thể chưa đồng bộ hoàn toàn. Vui lòng refresh trang.',
            type: 'warning'
          });
        }
        
        // ===== THÊM THÔNG BÁO ĐỒNG BỘ =====
        setTimeout(() => {
          setToast({
            show: true,
            message: '✅ Lịch hẹn đã được cập nhật và đồng bộ với tất cả khung giờ gán nhân viên',
            type: 'success'
          });
        }, 300);
        
        fetchAppointments();
        setEditMode(false);
        setCurrentAppointment(null);
        setShowEditTimeSlotGrid(false);
        setSelectedEditTimeSlot(null);
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      setToast({
        show: true,
        message: `Không thể cập nhật lịch hẹn: ${err.response?.data?.message || err.message || err}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Sửa lại các hàm xử lý sự kiện cho các nút

  // 1. Sửa lại hàm updateAppointmentStatus
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      console.log(`Cập nhật trạng thái lịch hẹn ${appointmentId} thành ${newStatus}`);
      
      // Chuyển đổi trạng thái sang tiếng Anh (nếu đang là tiếng Việt)
      const englishStatus = statusViToEn[newStatus] || newStatus;
      
      // Hiển thị dialog xác nhận với thông điệp phù hợp
      let confirmContent = `Bạn có chắc muốn cập nhật trạng thái lịch hẹn #${appointmentId} thành "${newStatus}"?`;
      
      // Thêm thông tin bổ sung dựa trên trạng thái
      if (englishStatus === 'Completed') {
        confirmContent += ' Khung giờ này sẽ được mở lại cho người khác đặt nếu còn trong tương lai.';
      } else if (englishStatus === 'Cancelled') {
        confirmContent += ' Khung giờ này sẽ được mở lại cho người khác đặt.';
      } else if (englishStatus === 'No-Show') {
        confirmContent += ' Khung giờ này sẽ không được mở lại cho người khác đặt nếu thời gian đã qua.';
      }
      
      setConfirmDialog({
        isOpen: true,
        title: `Cập nhật trạng thái thành ${newStatus}`,
        content: confirmContent,
        onConfirm: async () => {
          try {
            // Tìm thông tin chi tiết của lịch hẹn để cập nhật lịch bận
            const appointmentToUpdate = appointments.find(a => a.appointmentId === appointmentId);
            if (!appointmentToUpdate) {
              throw new Error("Không tìm thấy thông tin lịch hẹn");
            }
            
            // Sử dụng appointmentService
            let success = false;
            
            try {
              // Ưu tiên sử dụng appointmentService
              await appointmentService.updateAppointmentStatus(appointmentId, englishStatus);
              success = true;
            } catch (serviceError) {
              console.error('Lỗi khi sử dụng appointmentService:', serviceError);
              
              // Fallback nếu service gặp lỗi
              try {
                // Đảm bảo payload đúng định dạng
                const statusOnly = {
                  status: englishStatus
                };
                console.log("Sending status payload:", statusOnly);
                
                await axiosClient.patch(`/Appointments/${appointmentId}/status`, statusOnly);
                success = true;
              } catch (e1) {
                console.log("First attempt failed:", e1);
                try {
                  // Thử cách khác - dùng PUT thay vì PATCH
                  await axiosClient.put(`/Appointments/${appointmentId}/status`, { 
                    status: englishStatus 
                  });
                  success = true;
                } catch (e2) {
                  console.log("Second attempt failed:", e2);
                  // Thử cách thứ ba - cập nhật toàn bộ đối tượng
                  const appointment = appointments.find(a => a.appointmentId === appointmentId);
                  if (appointment) {
                    appointment.status = englishStatus;
                    await axiosClient.put(`/Appointments/${appointmentId}`, appointment);
                    success = true;
                  } else {
                    throw new Error("Không tìm thấy lịch hẹn");
                  }
                }
              }
            }
            
            if (success) {
              // Cập nhật lịch bận của thú cưng và nhân viên
              if (englishStatus === 'Cancelled' || englishStatus === 'Completed') {
                try {
                  // Cập nhật lịch bận của thú cưng
                  if (appointmentToUpdate.petId) {
                    console.log(`Cập nhật lịch bận cho thú cưng ${appointmentToUpdate.petId}`);
                    // Gửi sự kiện cập nhật lịch bận của thú cưng
                    const updatePetBusyEvent = new CustomEvent('pet-busy-slots-updated', {
                      detail: {
                        petId: appointmentToUpdate.petId,
                        date: dayjs(appointmentToUpdate.appointmentDate).format('YYYY-MM-DD')
                      }
                    });
                    window.dispatchEvent(updatePetBusyEvent);
                  }
                  
                  // Cập nhật lịch bận của nhân viên
                  if (appointmentToUpdate.staffId) {
                    console.log(`Cập nhật lịch bận cho nhân viên ${appointmentToUpdate.staffId}`);
                    // Gửi sự kiện cập nhật lịch bận của nhân viên
                    const updateStaffBusyEvent = new CustomEvent('staff-busy-slots-updated', {
                      detail: {
                        staffId: appointmentToUpdate.staffId,
                        date: dayjs(appointmentToUpdate.appointmentDate).format('YYYY-MM-DD')
                      }
                    });
                    window.dispatchEvent(updateStaffBusyEvent);
                  }
                } catch (updateError) {
                  console.error("Lỗi khi cập nhật lịch bận:", updateError);
                  // Không dừng luồng xử lý nếu việc cập nhật lịch bận gặp lỗi
                }
              }
              
              // Hiển thị thông báo phù hợp với trạng thái
              let successMessage = '';
              switch(englishStatus) {
                case 'Completed':
                  successMessage = `Lịch hẹn đã được đánh dấu là hoàn thành. Khung giờ đã được mở lại.`;
                  break;
                case 'Cancelled':
                  successMessage = `Lịch hẹn đã được hủy. Khung giờ đã được mở lại cho người khác đặt.`;
                  break;
                case 'No-Show':
                  successMessage = `Lịch hẹn đã được đánh dấu là không đến.`;
                  break;
                default:
                  successMessage = `Trạng thái lịch hẹn đã được cập nhật thành ${newStatus}`;
              }
              
              setToast({
                show: true,
                message: successMessage,
                type: 'success'
              });
              
              await fetchAppointments(); // Tải lại danh sách
            }
          } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái lịch hẹn:', err);
            setToast({
              show: true,
              message: `Không thể cập nhật trạng thái lịch hẹn: ${err.response?.data?.message || err.message || 'Lỗi không xác định'}`,
              type: 'error'
            });
          } finally {
            setLoading(false);
          }
        }
      });
    } catch (err) {
      console.error('Lỗi khi xử lý cập nhật trạng thái:', err);
      setLoading(false);
    }
  };

  // 2. Sửa lại hàm handleDelete
  const handleDelete = (appointmentId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa lịch hẹn',
      content: `Bạn có chắc chắn muốn xóa lịch hẹn #${appointmentId}? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          setLoading(true);
          
          // Sử dụng appointmentService
          let success = false;
          
          try {
            // Ưu tiên sử dụng appointmentService
            await appointmentService.deleteAppointment(appointmentId);
            success = true;
          } catch (serviceError) {
            console.error('Không thể xóa bằng deleteAppointment:', serviceError);
            
            try {
              // Thử phương thức cancel
              await appointmentService.cancelAppointment(appointmentId);
              success = true;
            } catch (cancelError) {
              console.error('Không thể xóa bằng cancelAppointment:', cancelError);
              
              // Fallback cuối cùng - dùng axiosClient
              try {
                await axiosClient.delete(`/Appointments/${appointmentId}`);
                success = true;
              } catch (deleteError) {
                // Thử lại một lần nữa với đường dẫn khác
                await axiosClient.delete(`/api/Appointments/${appointmentId}`);
                success = true;
              }
            }
          }
          
          if (success) {
            setToast({
              show: true,
              message: 'Xóa lịch hẹn thành công',
              type: 'success'
            });
            
            await fetchAppointments();
          }
        } catch (err) {
          console.error('Lỗi khi xóa lịch hẹn:', err);
          setToast({
            show: true,
            message: `Không thể xóa lịch hẹn: ${err.message || 'Lỗi không xác định'}`,
            type: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Xử lý hoàn thành lịch hẹn sớm
  const handleCompleteAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsCompleteModalVisible(true);
  };

  const handleCompleteSuccess = () => {
    setIsCompleteModalVisible(false);
    fetchAppointments(); // Refresh lịch hẹn
  };

  // Định dạng ngày tháng cho input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Định dạng ngày tháng để hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch (error) {
      console.error('Lỗi định dạng ngày:', error);
      return 'Ngày không hợp lệ';
    }
  };

  // Định dạng giờ từ chuỗi datetime
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Lỗi định dạng giờ:', error);
      return '';
    }
  };

  // Đóng thông báo toast
  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  // Lấy tên người dùng từ ID
  const getUserName = (userId) => {
    const user = users.find(u => u.userId === userId);
    return user ? user.fullName : 'Không rõ';
  };

  // Lấy tên thú cưng từ ID
  const getPetName = (petId) => {
    const pet = pets.find(p => p.petId === petId);
    return pet ? pet.name : 'Không rõ';
  };

  // Lấy tên dịch vụ từ ID
  const getServiceName = (serviceId) => {
    const service = services.find(s => s.serviceId === serviceId);
    return service ? service.name : 'Không rõ';
  };

  // Lọc danh sách lịch hẹn dựa trên tìm kiếm và bộ lọc
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      getUserName(appointment.userId)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === '' || appointment.status === filterStatus;
    
    const matchesDate = !filterDate || formatDateForInput(appointment.appointmentDate) === filterDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Hiển thị màu sắc cho trạng thái
  const getStatusBadgeClass = (status) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'pending' || lowerStatus === 'đang chờ')
      return 'pending';
    if (lowerStatus === 'scheduled' || lowerStatus === 'đã đặt lịch' || lowerStatus === 'đã lên lịch')
      return 'scheduled';
    if (lowerStatus === 'confirmed' || lowerStatus === 'đã xác nhận')
      return 'confirmed';
    if (lowerStatus === 'completed' || lowerStatus === 'đã hoàn thành') 
      return 'completed';
    if (lowerStatus === 'cancelled' || lowerStatus === 'đã hủy')
      return 'cancelled';
    if (lowerStatus === 'no-show' || lowerStatus === 'không đến')
      return 'no-show';
    return '';
  };

  // Thêm hàm mới để tạo thông báo dựa trên trạng thái
  const getStatusNotification = (status, appointmentDate) => {
    if (!status || !appointmentDate) return '';
    
    const formattedDate = formatDate(appointmentDate);
    const formattedTime = formatTime(appointmentDate);
    
    // Dựa vào trạng thái để tạo thông báo phù hợp
    switch(status) {
      case 'Completed':
        return `Cảm ơn bạn đã sử dụng dịch vụ. Lịch hẹn của bạn đã hoàn thành vào ${formattedDate} lúc ${formattedTime}.`;
      case 'Cancelled':
        return `Lịch hẹn vào ${formattedDate} lúc ${formattedTime} đã bị hủy. Vui lòng liên hệ trung tâm để biết thêm chi tiết.`;
      case 'No-Show':
        return `Bạn đã bỏ lỡ lịch hẹn vào ${formattedDate} lúc ${formattedTime}. Vui lòng liên hệ trung tâm để đặt lịch mới.`;
      default:
        return '';
    }
  };
  
  // Tính toán các lịch hẹn hiển thị trên trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // Hàm chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Hàm chuyển đến trang trước
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Hàm chuyển đến trang tiếp theo
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Xử lý thay đổi số lượng item trên mỗi trang
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi số lượng items
  };

  // Thêm hàm canCancelAppointment vào đây
  const canCancelAppointment = (appointment) => {
    // Nếu lịch hẹn không phải trạng thái cho phép hủy
    if (appointment.status !== 'Scheduled' && appointment.status !== 'Confirmed') {
      return false;
    }
    
    // Kiểm tra thời gian (không thể hủy lịch hẹn trong vòng 24 giờ)
    const appointmentTime = new Date(appointment.appointmentDate);
    const now = new Date();
    const hoursLeft = (appointmentTime - now) / (1000 * 60 * 60);
    
    // Admin có thể hủy bất kỳ lúc nào
    if (user?.role === 'Admin') {
      return true;
    }
    
    return hoursLeft > 24;  // Cho phép hủy nếu còn hơn 24 giờ
  };

  // Thêm các hàm tiện ích để tính toán thời lượng dịch vụ và thời gian kết thúc
  const getServiceDuration = (serviceId, services) => {
    if (!serviceId || !services || !services.length) return DEFAULT_SERVICE_DURATION;
    
    const service = services.find(s => s.serviceId === parseInt(serviceId));
    return service && service.duration ? service.duration : DEFAULT_SERVICE_DURATION;
  };

  // Tính toán thời gian kết thúc dựa trên thời gian bắt đầu và thời lượng dịch vụ
  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime) return null;
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    return endTime;
  };

  // Định dạng thời gian kết thúc để hiển thị
  const formatEndTime = (startTime, durationMinutes) => {
    if (!startTime) return '';
    const endTime = calculateEndTime(startTime, durationMinutes);
    if (!endTime) return '';
    
    return endTime.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Kiểm tra xem có lịch hẹn nào chồng chéo không
  const checkForOverlappingAppointments = (newStartTime, serviceDuration, appointmentId = null) => {
    if (!newStartTime || !serviceDuration) return false;
    
    const newStartDateTime = new Date(newStartTime);
    const newEndDateTime = calculateEndTime(newStartTime, serviceDuration + BUFFER_TIME_MINUTES);
    
    return appointments.some(appointment => {
      // Bỏ qua chính lịch hẹn đang được sửa
      if (appointmentId && appointment.appointmentId === appointmentId) return false;
      
      // Bỏ qua các lịch hẹn đã hủy hoặc không đến
      if (appointment.status === 'Cancelled' || appointment.status === 'No-Show') return false;
      
      const existingStartTime = new Date(appointment.appointmentDate);
      const existingEndTime = calculateEndTime(
        appointment.appointmentDate,
        getServiceDuration(appointment.serviceId, services) + BUFFER_TIME_MINUTES
      );
      
      // Kiểm tra chồng chéo thời gian
      return (
        (newStartDateTime < existingEndTime && newEndDateTime > existingStartTime)
      );
    });
  };

  // Thêm hàm để lấy danh sách nhân viên cho dịch vụ
  const fetchStaffForService = async (serviceId) => {
    try {
      setLoading(true);
      const staffData = await staffService.getStaffByService(serviceId);
      console.log('Staff data for service:', staffData);
      setAvailableStaffForService(Array.isArray(staffData) ? staffData : []);
    } catch (error) {
      console.error('Error fetching staff for service:', error);
      setToast({
        show: true,
        message: 'Không thể tải danh sách nhân viên cho dịch vụ này',
        type: 'error'
      });
      setAvailableStaffForService([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm tạo các time slot cho nhân viên dựa trên thời lượng dịch vụ thực tế
  const generateStaffTimeSlots = (selectedDate, serviceDuration = 30, appointmentTime = null) => {
    if (!selectedDate) return [];
    
    console.log(`[generateStaffTimeSlots] Tạo slots với thời lượng dịch vụ: ${serviceDuration} phút`);
    
    const actualServiceDuration = serviceDuration || 30;
    const bufferTime = 10; // Buffer time 10 phút
    const slotInterval = actualServiceDuration + bufferTime; // Khoảng cách giữa các slot
    
    const slots = [];
    const date = new Date(selectedDate);
    
    // Giờ làm việc: 8:00 - 21:30
    for (let hour = 8; hour <= 21; hour++) {
      const startMinutes = hour === 21 ? [0, 30] : [0, 30]; // Chỉ tạo slot đến 21:30
      
      for (const minute of startMinutes) {
        if (hour === 21 && minute > 30) break; // Không tạo slot sau 21:30
        
        const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Tính thời gian kết thúc dịch vụ
        const startTimeInMinutes = hour * 60 + minute;
        const serviceEndInMinutes = startTimeInMinutes + actualServiceDuration;
        
        // Kiểm tra xem dịch vụ có kết thúc trước 21:30 không
        if (serviceEndInMinutes <= 21 * 60 + 30) {
          const serviceEndHour = Math.floor(serviceEndInMinutes / 60);
          const serviceEndMinute = serviceEndInMinutes % 60;
          const serviceEndTime = `${serviceEndHour.toString().padStart(2, '0')}:${serviceEndMinute.toString().padStart(2, '0')}`;
          
          const slotData = {
            id: `slot-${slotTime.replace(':', '-')}`,
            startTime: slotTime,
            endTime: serviceEndTime,
            duration: actualServiceDuration,
            bufferTime: bufferTime,
            display: `${slotTime} - ${serviceEndTime}`,
            isAvailable: true,
            isSelected: appointmentTime === slotTime
          };
          
          slots.push(slotData);
        }
      }
    }
    
    console.log(`[generateStaffTimeSlots] Đã tạo ${slots.length} slots với interval ${slotInterval} phút`);
    return slots;
  };

  // Thêm hàm load lịch của nhân viên với khung giờ
  const loadStaffScheduleWithTimeSlots = async (staffId, appointmentDate) => {
    if (!staffId || !appointmentDate) {
      console.error('Missing required parameters: staffId or appointmentDate');
      return [];
    }

    const startHour = 8;
    const endHour = 21;
    const endMinute = 30;
    
    // ===== SỬ DỤNG THỜI GIAN DỊCH VỤ THỰC TẾ + BUFFER =====
    // Get service duration from current appointment or default to 30
    const currentServiceDuration = formData.serviceId ? getServiceDuration(formData.serviceId, services) : 30;
    const actualServiceDuration = currentServiceDuration || 30;
    const BUFFER_TIME_MINUTES = 10; // Define the buffer time constant
    const totalSlotTime = actualServiceDuration + BUFFER_TIME_MINUTES; // duration + 10 phút buffer
    
    console.log(`🔧 Generating EDIT time slots with service duration: ${actualServiceDuration} minutes + ${BUFFER_TIME_MINUTES} buffer = ${totalSlotTime} minutes total`);
    
    // ===== TẠO SLOTS THEO THỜI GIAN DỊCH VỤ THỰC TẾ =====
    const date = dayjs(appointmentDate); // Create dayjs object from appointmentDate
    let currentTime = date.set('hour', startHour).set('minute', 0);
    const endTime = date.set('hour', endHour).set('minute', endMinute);
    
    // Fetch pet and staff busy slots
    const petBusySlots = petBusyTimeSlots || [];
    const staffBusySlots = staffBusyTimeSlots || [];
    
    const slots = [];
    
    while (currentTime.isBefore(endTime) || currentTime.isSame(endTime)) {
      const hour = currentTime.hour();
      const minute = currentTime.minute();
      
      // Kiểm tra slot có kết thúc trước 21:30 không
      const slotEndTime = currentTime.add(actualServiceDuration, 'minute');
      if (slotEndTime.isAfter(endTime)) {
        console.log(`⏰ Edit slot ${currentTime.format('HH:mm')} bị bỏ qua vì sẽ kết thúc sau 21:30`);
        break;
      }
      
      const startTimeStr = currentTime.format('HH:mm');
      
      // Kiểm tra xem slot có trong quá khứ không
      const isPast = dayjs().isAfter(currentTime);
      
      // Kiểm tra pet và staff busy
      const isPetBusy = petBusySlots.includes(startTimeStr);
      const isStaffBusy = staffBusySlots.includes(startTimeStr);
      
      slots.push({
        id: `edit-slot-${hour}-${minute}`,
        // ===== SỬA LỖI: DÙNG STRING THAY VÌ DATE OBJECT =====
        startTime: startTimeStr, // String thay vì Date object
        startTimeString: startTimeStr,
        endTime: slotEndTime.format('HH:mm'), // String thay vì Date object
        endTimeString: slotEndTime.format('HH:mm'),
        duration: actualServiceDuration, // Thời gian dịch vụ thực tế
        bufferTime: BUFFER_TIME_MINUTES, // Buffer time
        totalTime: totalSlotTime, // Tổng thời gian
        available: !isPast && !isPetBusy && !isStaffBusy,
        isPast: isPast,
        isPetBusy: isPetBusy,
        isStaffBusy: isStaffBusy,
        isAvailable: !isPast && !isPetBusy && !isStaffBusy,
        unavailableReason: isPast ? 'Đã qua' : 
                          (isPetBusy ? 'Thú cưng bận' : 
                          (isStaffBusy ? 'Nhân viên bận' : '')),
        // Thêm thông tin cần thiết cho TimeSlotGrid
        staffId: null, // Không có staff cụ thể cho edit slots
        staffName: 'Nhân viên',
        selectedDate: dayjs(appointmentDate).format('YYYY-MM-DD'), // Use appointmentDate parameter
        selectedDateTime: currentTime.toISOString(), // ✅ FIX: Dùng ISO string trực tiếp
        // Thêm thông tin debug
        debugInfo: {
          serviceEnd: slotEndTime.format('HH:mm'),
          bufferEnd: slotEndTime.add(BUFFER_TIME_MINUTES, 'minute').format('HH:mm'),
          actualServiceDuration,
          bufferTime: BUFFER_TIME_MINUTES,
          originalISOString: currentTime.toISOString(), // Giữ cho debug
          formattedDateTime: currentTime.toISOString() // ✅ FIX: Dùng ISO string trực tiếp
        }
      });
      
      // ===== CHUYỂN ĐẾN SLOT TIẾP THEO =====
      currentTime = currentTime.add(totalSlotTime, 'minute');
    }
    
    console.log(`✅ Generated ${slots.length} EDIT time slots with service duration ${actualServiceDuration}min + ${BUFFER_TIME_MINUTES}min buffer`);
    
    return slots;
  };

  // Helper function để kiểm tra conflict khi edit appointment
  const checkAppointmentConflictForEdit = (timeStr, petBusyTimeSlots, petAppointments, serviceDuration, excludeAppointmentId) => {
    return isPetBusySlot(timeStr, petBusyTimeSlots, petAppointments, serviceDuration, excludeAppointmentId);
  };

  // Helper function để kiểm tra staff conflict khi edit appointment
  const checkStaffConflictForEdit = (timeStr, staffBusyTimeSlots, staffAppointments, excludeAppointmentId) => {
    // Kiểm tra busy slots cứng
    if (staffBusyTimeSlots.includes(timeStr)) {
      return true;
    }
    
    // Kiểm tra appointments của staff, loại trừ appointment đang edit
    return staffAppointments.some(apt => {
      // Loại trừ appointment đang được chỉnh sửa
      if (apt.appointmentId && String(apt.appointmentId) === String(excludeAppointmentId)) {
        return false;
      }
      
      const aptTime = apt.appointmentDate ? 
        dayjs(apt.appointmentDate).format('HH:mm') : 
        (apt.startTime ? 
         (typeof apt.startTime === 'string' ? apt.startTime : dayjs(apt.startTime).format('HH:mm')) : 
         null);
      return aptTime === timeStr;
    });
  };

  // ===== THÊM HÀM TẠO KHUNG GIỜ CHO EDIT FORM =====
  const generateEditTimeSlots = (selectedDate, serviceDuration = 30, petBusySlots = [], staffBusySlots = [], excludeAppointmentId = null, staffAppointments = [], petAppointments = []) => {
    if (!selectedDate) return [];
    
    console.log(`[generateEditTimeSlots] Tạo slots với thời lượng dịch vụ: ${serviceDuration} phút`);
    console.log(`👨‍⚕️ [ADMIN DEBUG] Received staffBusySlots:`, staffBusySlots);
    console.log(`🐕 [ADMIN DEBUG] Received petBusySlots:`, petBusySlots);
    console.log(`🔧 [ADMIN DEBUG] Excluding appointmentId:`, excludeAppointmentId);
    
    const actualServiceDuration = serviceDuration || 30;
    const bufferTime = 10; // Buffer time 10 phút
    const slotInterval = actualServiceDuration + bufferTime; // Khoảng cách giữa các slot dựa trên service duration
    
    const slots = [];
    const date = new Date(selectedDate);
    
    // Giờ làm việc: 8:00 - 21:30
    const startTime = 8 * 60; // 8:00 in minutes
    const endTime = 21 * 60 + 30; // 21:30 in minutes
    
    // Tạo slots với interval thực tế (service duration + buffer)
    for (let currentTime = startTime; currentTime + actualServiceDuration <= endTime; currentTime += slotInterval) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const slotStartStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Tính thời gian kết thúc dịch vụ (không bao gồm buffer trong display)
      const serviceEndMinutes = currentTime + actualServiceDuration;
      const serviceEndHours = Math.floor(serviceEndMinutes / 60);
      const serviceEndMins = serviceEndMinutes % 60;
      const slotEndStr = `${serviceEndHours.toString().padStart(2, '0')}:${serviceEndMins.toString().padStart(2, '0')}`;
      
      // **ENHANCED LOGIC**: Kiểm tra slot có bị trùng với lịch bận không (dựa vào duration thực tế)
      let isPetBusy = petBusySlots.includes(slotStartStr);
      let isStaffBusy = staffBusySlots.includes(slotStartStr);
      
      // Simple pet busy check - if slot start time falls within any appointment time range
      if (!isPetBusy && petAppointments && petAppointments.length > 0) {
        isPetBusy = petAppointments.some(apt => {
          // Skip the appointment being edited
          if (excludeAppointmentId && apt.appointmentId === excludeAppointmentId) return false;
          
          // Validate appointment date
          if (!apt.appointmentDate) {
            console.warn('⚠️ Pet appointment missing appointmentDate:', apt);
            return false;
          }
          
          try {
            const aptStartTime = dayjs(apt.appointmentDate).format('HH:mm');
            const aptDuration = apt.duration || apt.serviceDuration || apt.service?.duration || 30;
            const aptEndTime = dayjs(`2023-01-01T${aptStartTime}`).add(aptDuration, 'minute').format('HH:mm');
            
            // Simple logic: slot is busy if it starts within appointment time range
            const slotTime = dayjs(`2023-01-01T${slotStartStr}`);
            const aptStart = dayjs(`2023-01-01T${aptStartTime}`);
            const aptEnd = dayjs(`2023-01-01T${aptEndTime}`);
            
            // Check if slot start time is within appointment time range [start, end)
            const isWithinRange = slotTime.isSameOrAfter(aptStart) && slotTime.isBefore(aptEnd);
          
          // DEBUG: Log all appointments being checked
          console.log(`🔍 [DEBUG] Checking slot ${slotStartStr} vs appointment:`, {
            appointmentId: apt.appointmentId,
            aptStart: aptStartTime,
            aptEnd: aptEndTime,
            aptDuration: aptDuration,
            slotTime: slotStartStr,
            isWithinRange: isWithinRange,
            excludeAppointmentId: excludeAppointmentId
          });
          
            if (isWithinRange) {
              console.log(`🐕 [ADMIN EDIT] Pet busy - slot ${slotStartStr} falls within appointment ${aptStartTime}-${aptEndTime} (appointmentId: ${apt.appointmentId})`);
            }
            
            return isWithinRange;
          } catch (error) {
            console.error('⚠️ Error processing pet appointment:', error, apt);
            return false;
          }
        });
      }
      
      // Simple staff busy check - if slot start time falls within any appointment time range
      if (!isStaffBusy && staffAppointments && staffAppointments.length > 0) {
        isStaffBusy = staffAppointments.some(apt => {
          // Skip the appointment being edited
          if (excludeAppointmentId && apt.appointmentId === excludeAppointmentId) return false;
          
          // Validate appointment date
          if (!apt.appointmentDate) {
            console.warn('⚠️ Staff appointment missing appointmentDate:', apt);
            return false;
          }
          
          try {
            const aptStartTime = dayjs(apt.appointmentDate).format('HH:mm');
            const aptDuration = apt.duration || apt.serviceDuration || apt.service?.duration || 30;
            const aptEndTime = dayjs(`2023-01-01T${aptStartTime}`).add(aptDuration, 'minute').format('HH:mm');
            
            // Simple logic: slot is busy if it starts within appointment time range
            const slotTime = dayjs(`2023-01-01T${slotStartStr}`);
            const aptStart = dayjs(`2023-01-01T${aptStartTime}`);
            const aptEnd = dayjs(`2023-01-01T${aptEndTime}`);
            
            // Check if slot start time is within appointment time range [start, end)
            const isWithinRange = slotTime.isSameOrAfter(aptStart) && slotTime.isBefore(aptEnd);
            
            if (isWithinRange) {
              console.log(`👤 [ADMIN EDIT] Staff busy - slot ${slotStartStr} falls within appointment ${aptStartTime}-${aptEndTime}`);
            }
            
            return isWithinRange;
          } catch (error) {
            console.error('⚠️ Error processing staff appointment:', error, apt);
            return false;
          }
        });
      }
      
      // DEBUG: Log specific slot check (for key slots)
      if (slotStartStr === '14:40' || slotStartStr === '19:40' || slotStartStr === '18:30' || slotStartStr === '19:00' || slotStartStr === '19:30') {
        console.log(`👨‍⚕️ [ADMIN DEBUG] Slot ${slotStartStr} check:`, {
          slotStartStr: slotStartStr,
          actualServiceDuration: actualServiceDuration,
          slotInterval: slotInterval,
          petBusySlots: petBusySlots,
          staffBusySlots: staffBusySlots,
          isPetBusy: isPetBusy,
          isStaffBusy: isStaffBusy,
          petAppointments: petAppointments?.map(apt => ({
            appointmentId: apt.appointmentId,
            startTime: dayjs(apt.appointmentDate).format('HH:mm'),
            duration: apt.duration || apt.serviceDuration || apt.service?.duration || 30,
            endTime: dayjs(apt.appointmentDate).add(apt.duration || apt.serviceDuration || apt.service?.duration || 30, 'minute').format('HH:mm')
          })) || [],
          excludeAppointmentId: excludeAppointmentId
        });
      }
      
      const slotData = {
        id: `edit-slot-${slotStartStr.replace(':', '-')}`,
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
    
    console.log(`[generateEditTimeSlots] Đã tạo ${slots.length} slots với interval ${slotInterval} phút`);
    return slots;
  };

  // ===== THÊM CÁC HÀM THIẾU =====
  
  // Kiểm tra xem appointment có thiếu nhân viên không
  const isUnassignedAppointment = (appointment) => {
    return !appointment.staffId || appointment.staffId === null || appointment.staffId === '';
  };

  // Xử lý khi click vào appointment chưa có nhân viên
  const handleUnassignedAppointmentClick = (appointment) => {
    setSelectedUnassignedAppointment(appointment);
    setShowStaffAssignModal(true);
    
    // Fetch available staff for this service
    if (appointment.serviceId) {
      fetchStaffForService(appointment.serviceId);
    }
  };

  // Gán nhân viên cho appointment
  const assignStaffToAppointment = async (appointmentId, staffId, timeSlot = null) => {
    try {
      setLoading(true);
      console.log('🔄 Assigning staff to appointment:', {
        appointmentId,
        staffId,
        timeSlot: timeSlot ? timeSlot.startTimeString || timeSlot.startTime : 'no change'
      });
      
      // Tìm appointment hiện tại để lấy thông tin
      const currentAppointment = appointments.find(apt => apt.appointmentId === appointmentId);
      if (!currentAppointment) {
        throw new Error('Không tìm thấy lịch hẹn');
      }
      
      // Chuẩn bị dữ liệu cập nhật
      const updateData = {
        ...currentAppointment,
        staffId: staffId
      };
      
      // Nếu có thay đổi thời gian, cập nhật appointmentDate
      if (timeSlot && !timeSlot.isCurrentAppointmentSlot) {
        const slotTime = timeSlot.startTimeString || timeSlot.startTime;
        const currentDate = dayjs(currentAppointment.appointmentDate).format('YYYY-MM-DD');
        
        // ✅ FIX TIMEZONE: Tạo UTC datetime đúng cách
        const [hours, minutes] = slotTime.split(':').map(Number);
        const localDate = new Date(currentDate);
        localDate.setHours(hours, minutes, 0, 0);
        
        // Lấy timezone offset và tạo UTC datetime
        const timezoneOffsetMinutes = localDate.getTimezoneOffset();
        const utcDateTime = new Date(localDate.getTime() - (timezoneOffsetMinutes * 60000));
        
        updateData.appointmentDate = utcDateTime.toISOString();
        
        console.log(`⏰ [ASSIGN STAFF] Changing appointment time:`);
        console.log(`   - From: ${formatTime(currentAppointment.appointmentDate)}`);
        console.log(`   - To (local): ${slotTime}`);
        console.log(`   - To (UTC): ${utcDateTime.toISOString()}`);
      }
      
      // Sử dụng appointmentService.updateAppointment thay vì fetch
      const updatedAppointment = await appointmentService.updateAppointment(appointmentId, updateData);
      
      console.log('✅ Staff assigned successfully:', updatedAppointment);
      
      // Refresh appointments list
      await fetchAppointments();
      
      // Hiển thị thông báo thành công
      const successMessage = timeSlot && !timeSlot.isCurrentAppointmentSlot 
        ? `Đã gán nhân viên và đổi thời gian thành ${timeSlot.startTimeString || timeSlot.startTime}!`
        : 'Đã gán nhân viên thành công!';
        
      setToast({
        show: true,
        message: successMessage,
        type: 'success'
      });

      // Close modals
      setShowStaffAssignModal(false);
      setShowTimeSlotView(false);
      setSelectedUnassignedAppointment(null);
      setSelectedStaffForAssignment(null);
      setSelectedTimeSlot(null);
      
      // Trigger refresh events for UI sync
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refresh-all-timeslots', {
          detail: {
            reason: 'staff-assigned',
            appointmentId: appointmentId,
            staffId: staffId
          }
        }));
      }, 500);
      
    } catch (error) {
      console.error('❌ Error assigning staff:', error);
      setToast({
        show: true,
        message: `Lỗi khi gán nhân viên: ${error.message || error}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra xung đột thời gian
  const checkTimeConflict = (appointmentTime, staffId, excludeAppointmentId = null) => {
    if (!appointmentTime || !staffId) return false;
    
    const appointmentDate = new Date(appointmentTime);
    const appointmentTimeStr = appointmentDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Check against existing appointments for this staff
    return appointments.some(apt => {
      // Skip the appointment being edited
      if (excludeAppointmentId && apt.appointmentId === excludeAppointmentId) {
        return false;
      }
      
      // Check if same staff and overlapping time
      if (apt.staffId === staffId) {
        const existingDate = new Date(apt.appointmentDate);
        const existingTimeStr = existingDate.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Simple time conflict check (same time)
        return existingTimeStr === appointmentTimeStr;
      }
      
      return false;
    });
  };

  // Xử lý chọn time slot
  const handleTimeSlotSelect = (timeSlot) => {
    console.log('Time slot selected:', timeSlot);
    setSelectedTimeSlot(timeSlot);
    setSelectedEditTimeSlot(timeSlot);
    
    // Update form data with selected time
    if (timeSlot && timeSlot.startTime) {
      const timeStr = typeof timeSlot.startTime === 'string' ? 
        timeSlot.startTime : 
        dayjs(timeSlot.startTime).format('HH:mm');
        
      setFormData(prev => ({
        ...prev,
        appointmentTime: timeStr
      }));
    }
  };

  // ===== KẾT THÚC CÁC HÀM THIẾU =====

  return (
    <AppointmentContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}><CalendarOutlined /> Quản lý lịch hẹn</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #304FFE 0%, #304FFE 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          <PlusOutlined /> Tạo lịch hẹn mới
        </button>
      </div>
      
      {error && (
        <div style={{ margin: '0 0 20px', padding: '15px', background: 'rgba(255, 82, 82, 0.1)', borderRadius: '16px', color: '#FF5252', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ExclamationCircleOutlined />
          {error}
        </div>
      )}
      
      <AppointmentStats appointments={appointments} />
      
      <FilterContainer>
        <SearchBox>
          <SearchOutlined />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng hoặc ghi chú"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>
        
        <DateFilter>
          <CalendarOutlined />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </DateFilter>
        
        <StatusFilter>
          <FilterOutlined />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Đang chờ</option>
            <option value="Scheduled">Đã đặt lịch</option>
            <option value="Confirmed">Đã xác nhận</option>
            <option value="Completed">Đã hoàn thành</option>
            <option value="No-Show">Không đến</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </StatusFilter>
      </FilterContainer>

      {editMode && currentAppointment && (
        <EditForm>
          <h2>Chỉnh sửa lịch hẹn #{currentAppointment.appointmentId}</h2>
          <FormGrid>
            <FormGroup>
              <label>Khách hàng:</label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChangeWithTimeSlots}
                disabled={true}
                style={{ 
                  backgroundColor: '#f5f5f5', 
                  cursor: 'not-allowed',
                  color: '#666'
                }}
              >
                <option value="">Chọn khách hàng</option>
                {users.map(user => (
                  <option key={user.userId} value={user.userId}>
                    {user.fullName}
                  </option>
                ))}
              </select>
            </FormGroup>
            
            <FormGroup>
              <label>Thú cưng:</label>
              <select
                name="petId"
                value={formData.petId}
                onChange={handleChangeWithTimeSlots}
              >
                <option value="">Chọn thú cưng</option>
                {pets
                  .filter(pet => pet.userId === formData.userId)
                  .map(pet => (
                    <option key={pet.petId} value={pet.petId}>
                      {pet.name}
                    </option>
                  ))}
              </select>
            </FormGroup>
            
            <FormGroup>
              <label>Dịch vụ:</label>
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChangeWithTimeSlots}
              >
                <option value="">Chọn dịch vụ</option>
                {services.map(service => (
                  <option key={service.serviceId} value={service.serviceId}>
                    {service.name} ({service.duration} phút)
                  </option>
                ))}
              </select>
            </FormGroup>
            
            <FormGroup>
              <label>Ngày hẹn:</label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChangeWithTimeSlots}
              />
            </FormGroup>
            
            <FormGroup>
              <label>Nhân viên:</label>
              <select
                name="staffId"
                value={formData.staffId}
                onChange={handleChangeWithTimeSlots}
              >
                <option value="">Tự động gán nhân viên</option>
                {availableStaffForEdit.map(staff => (
                  <option key={staff.staffId} value={staff.staffId}>
                    {staff.fullName}
                  </option>
                ))}
              </select>
            </FormGroup>
            
            <FormGroup>
              <label>Trạng thái:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Đang chờ">Đang chờ</option>
                <option value="Đã đặt lịch">Đã đặt lịch</option>
                <option value="Đã xác nhận">Đã xác nhận</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
                <option value="Không đến">Không đến</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </FormGroup>
            
            <FormGroup className="full-width">
              <label>Ghi chú:</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              ></textarea>
            </FormGroup>
          </FormGrid>
          
          {/* Time Slot Selection */}
          {formData.serviceId && formData.appointmentDate && formData.petId && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ marginBottom: '20px', color: '#2B3674' }}>
                <ClockCircleOutlined style={{ marginRight: '8px', color: '#304FFE' }} />
                Chọn khung giờ hẹn
              </h3>
              
              {/* ===== THÔNG TIN LỊCH BẬN HIỆN TẠI ===== */}
              <div style={{ marginBottom: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

              </div>
              
              {/* Current selection info */}
              {selectedEditTimeSlot && (
                <div style={{
                  background: 'linear-gradient(135deg, #e6f7ff, #cfe9ff)',
                  padding: '15px 20px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '1px solid #91d5ff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircleOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                    <div>
                      <div style={{ fontWeight: '600', color: '#1890ff' }}>
                        Đã chọn khung giờ: {selectedEditTimeSlot.startTimeString || 
                          (selectedEditTimeSlot.startTime instanceof Date ? 
                           dayjs(selectedEditTimeSlot.startTime).format('HH:mm') : 
                           selectedEditTimeSlot.startTime)}
                      </div>
                      {selectedEditTimeSlot.staffId && (
                        <div style={{ fontSize: '13px', color: '#1890ff', marginTop: '4px' }}>
                          Nhân viên: {selectedEditTimeSlot.staffName || 'Đã gán'}
                        </div>
                      )}
                      {/* Hiển thị cảnh báo nếu có xung đột */}
                      {(selectedEditTimeSlot.isPetBusy || selectedEditTimeSlot.isStaffBusy) && (
                        <div style={{ marginTop: '8px' }}>
                          {selectedEditTimeSlot.isPetBusy && (
                            <div style={{ color: '#ff4d4f', fontSize: '12px' }}>
                              ⚠️ {selectedEditTimeSlot.petBusyReason}
                            </div>
                          )}
                          {selectedEditTimeSlot.isStaffBusy && (
                            <div style={{ color: '#ff4d4f', fontSize: '12px' }}>
                              ⚠️ {selectedEditTimeSlot.staffBusyReason}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {loadingEditTimeSlots ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <SyncOutlined spin style={{ fontSize: '32px', color: '#304FFE' }} />
                  <p style={{ marginTop: '15px', color: '#666' }}>Đang tải khung giờ...</p>
                </div>
              ) : (
                <TimeSlotGrid
                  availableSlots={editTimeSlots}
                  selectedSlot={selectedEditTimeSlot}
                  onSelectTimeSlot={handleEditTimeSlotSelect}
                  selectedDate={formData.appointmentDate}
                  selectedService={{
                    name: getServiceName(formData.serviceId),
                    duration: getServiceDuration(formData.serviceId, services)
                  }}
                  appointments={editAppointments}
                  selectedStaffId={formData.staffId}
                  serviceDuration={getServiceDuration(formData.serviceId, services)}
                  petBusyTimeSlots={petBusyTimeSlots}
                  petAppointments={petAppointments}
                  staffBusyTimeSlots={staffBusyTimeSlots}
                  staffAppointments={editStaffAppointments}
                  loading={loadingEditTimeSlots}
                />
              )}
            </div>
          )}
          
          {/* Manual time input fallback */}
          {(!formData.serviceId || !formData.appointmentDate || !formData.petId) && (
            <div style={{ marginTop: '20px' }}>
              <FormGroup>
                <label>Thời gian (thủ công):</label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChangeWithTimeSlots}
                  style={{ borderColor: '#ffaa00' }}
                />
                <div style={{ fontSize: '12px', color: '#fa8c16', marginTop: '5px' }}>
                  ⚠️ Vui lòng chọn đầy đủ dịch vụ, ngày và thú cưng để sử dụng chọn khung giờ thông minh
                </div>
              </FormGroup>
            </div>
          )}
          
          <FormActions>
            <button className="cancel" onClick={handleCancel}>Hủy bỏ</button>
            <button className="save" onClick={handleSave} disabled={loading}>
              {loading ? <SyncOutlined spin style={{ marginRight: '5px' }} /> : null}
              Lưu thay đổi
            </button>
          </FormActions>
        </EditForm>
      )}

      <TableContainer>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ngày & Giờ</th>
              <th>Khách hàng</th>
              <th>Thú cưng</th>
              <th>Dịch vụ</th>
              <th>Nhân viên</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              currentAppointments.map(appointment => (
                <tr key={appointment.appointmentId}>
                  <td>{appointment.appointmentId}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '500' }}>{formatDate(appointment.appointmentDate)}</span>
                      <span style={{ color: '#707EAE', fontSize: '13px' }}>
                        {formatTime(appointment.appointmentDate)} - {formatEndTime(
                          appointment.appointmentDate, 
                          getServiceDuration(appointment.serviceId, services) + BUFFER_TIME_MINUTES
                        )}
                      </span>
                      {/* Thêm thông báo dựa trên trạng thái */}
                      {(appointment.status === 'Completed' || appointment.status === 'Cancelled' || appointment.status === 'No-Show') && (
                        <div style={{ 
                          marginTop: '5px', 
                          padding: '5px 8px', 
                          fontSize: '11px', 
                          background: 'rgba(0, 0, 0, 0.03)', 
                          borderRadius: '6px',
                          fontStyle: 'italic',
                          color: appointment.status === 'Completed' ? '#05CD99' : 
                                  appointment.status === 'Cancelled' ? '#FF5252' : '#fa8c16'
                        }}>
                          {getStatusNotification(appointment.status, appointment.appointmentDate)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserOutlined style={{ color: '#707EAE' }} />
                      {getUserName(appointment.userId)}
                    </div>
                  </td>
                  <td>{getPetName(appointment.petId)}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShopOutlined style={{ color: '#707EAE' }} />
                        {getServiceName(appointment.serviceId)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#707EAE', display: 'flex', flexDirection: 'column' }}>
                        <span>Thời lượng: {getServiceDuration(appointment.serviceId, services)} phút</span>
                        <span>Buffer time: {BUFFER_TIME_MINUTES} phút</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {isUnassignedAppointment(appointment) ? (
                      <UnassignedBadge onClick={() => handleUnassignedAppointmentClick(appointment)}>
                        <WarningOutlined className="warning-icon" />
                        <span className="text">Chưa có nhân viên</span>
                        <TeamOutlined className="team-icon" />
                      </UnassignedBadge>
                    ) : (
                      <AssignedBadge>
                        <TeamOutlined className="team-icon" />
                        <span className="text">Đã gán nhân viên</span>
                      </AssignedBadge>
                    )}
                  </td>
                  <td>
                    <StatusBadge className={getStatusBadgeClass(appointment.status)}>
                      {getStatusIcon(appointment.status)}
                      {statusEnToVi[appointment.status] || appointment.status}
                    </StatusBadge>
                  </td>
                  <td>
                    <ActionButtons>
                      {/* Nút gán nhân viên cho lịch hẹn chưa có nhân viên */}
                      {isUnassignedAppointment(appointment) && (
                        <StaffAssignButton onClick={() => handleUnassignedAppointmentClick(appointment)} disabled={loading}>
                          <TeamOutlined /> Gán nhân viên
                        </StaffAssignButton>
                      )}
                      
                      {/* Nút sửa đã có */}
                      {canEditAppointment(appointment) ? (
                        <button 
                          className="edit" 
                          onClick={() => handleEdit(appointment)}
                          disabled={loading}
                        >
                          <EditOutlined /> Sửa
                        </button>
                      ) : (
                        <button 
                          className="edit" 
                          disabled={true}
                          style={{ opacity: 0.5, cursor: 'not-allowed' }}
                          title="Không thể sửa lịch hẹn đã hoàn thành, đã hủy hoặc không đến"
                        >
                          <EditOutlined /> Sửa
                        </button>
                      )}
                      
                      {/* Thêm các nút thay đổi trạng thái */}
                      {(appointment.status === 'Pending' || appointment.status === 'Scheduled') && (
                        <button 
                          className="confirm" 
                          onClick={() => updateAppointmentStatus(appointment.appointmentId, 'Đã xác nhận')}
                          disabled={loading}
                        >
                          <CheckOutlined /> Xác nhận
                        </button>
                      )}
                      
                      {appointment.status === 'Confirmed' && (
                        <>
                          <button 
                            className="complete" 
                            onClick={() => updateAppointmentStatus(appointment.appointmentId, 'Đã hoàn thành')}
                            disabled={loading}
                          >
                            <CheckCircleOutlined /> Hoàn thành
                          </button>
                          
                          <button 
                            className="cancel-appointment"
                            onClick={() => updateAppointmentStatus(appointment.appointmentId, 'Không đến')}
                            disabled={loading}
                          >
                            <WarningOutlined /> Không đến
                          </button>
                        </>
                      )}
                      
                      {canCancelAppointment(appointment) && 
                      (appointment.status === 'Scheduled' || appointment.status === 'Confirmed' || appointment.status === 'Pending') && (
                        <button 
                          className="cancel-appointment" 
                          onClick={() => updateAppointmentStatus(appointment.appointmentId, 'Đã hủy')}
                          disabled={loading}
                        >
                          <CloseOutlined /> Hủy
                        </button>
                      )}
                    </ActionButtons>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <SyncOutlined spin />
                      Đang tải lịch hẹn...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                      <InfoCircleOutlined style={{ fontSize: '40px', color: '#707EAE', marginBottom: '15px' }} />
                      Không tìm thấy lịch hẹn nào
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableContainer>

      {/* Thêm phân trang ở đây */}
      {filteredAppointments.length > 0 && (
        <Pagination>
          <button 
            className="pagination-button" 
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <LeftOutlined />
          </button>
          
          {/* Hiển thị các nút số trang */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Logic để hiển thị 5 nút trang gần trang hiện tại
            let pageNum;
            if (totalPages <= 5) {
              // Nếu tổng số trang <= 5, hiển thị tất cả
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              // Nếu ở gần đầu, hiển thị 5 trang đầu
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              // Nếu ở gần cuối, hiển thị 5 trang cuối
              pageNum = totalPages - 4 + i;
            } else {
              // Ở giữa, hiển thị 2 trang trước, trang hiện tại, 2 trang sau
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => paginate(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            className="pagination-button" 
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <RightOutlined />
          </button>
          
          <span className="pagination-info">
            Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredAppointments.length)} / {filteredAppointments.length} lịch hẹn
          </span>
          
          <div className="per-page-select">
            <label>Hiển thị:</label>
            <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </Pagination>
      )}

      <ConfirmDialog 
        {...confirmDialog}
        setConfirmDialog={setConfirmDialog}
        confirmDialog={confirmDialog}
      />
      
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      {/* Thêm modal hoàn thành lịch hẹn */}
      <CompleteAppointmentForm
        visible={isCompleteModalVisible}
        appointment={selectedAppointment}
        onClose={() => setIsCompleteModalVisible(false)}
        onSuccess={handleCompleteSuccess}
      />

      {/* Modal gán nhân viên cho lịch hẹn chưa có nhân viên */}
      {showStaffAssignModal && selectedUnassignedAppointment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '25px',
              paddingBottom: '15px',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <h2 style={{
                margin: 0,
                color: '#2B3674',
                fontSize: '24px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <TeamOutlined style={{ color: '#304FFE' }} />
                Gán nhân viên cho lịch hẹn #{selectedUnassignedAppointment.appointmentId}
              </h2>
              <button
                onClick={() => {
                  setShowStaffAssignModal(false);
                  setSelectedUnassignedAppointment(null);
                  setSelectedStaffForAssignment(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '5px'
                }}
              >
                <CloseOutlined />
              </button>
            </div>

            {/* Thông tin lịch hẹn */}
            <div style={{
              background: 'linear-gradient(135deg, #f8faff, #f0f7ff)',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '25px',
              border: '1px solid #e6f1ff'
            }}>
              <h3 style={{ margin: '0 0 15px', color: '#2B3674', fontSize: '18px' }}>
                <InfoCircleOutlined style={{ marginRight: '8px', color: '#304FFE' }} />
                Thông tin lịch hẹn
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
                <div>
                  <strong>Khách hàng:</strong> {getUserName(selectedUnassignedAppointment.userId)}
                </div>
                <div>
                  <strong>Thú cưng:</strong> {getPetName(selectedUnassignedAppointment.petId)}
                </div>
                <div>
                  <strong>Dịch vụ:</strong> {getServiceName(selectedUnassignedAppointment.serviceId)}
                </div>
                <div>
                  <strong>Ngày giờ:</strong> {formatDate(selectedUnassignedAppointment.appointmentDate)} - {formatTime(selectedUnassignedAppointment.appointmentDate)}
                </div>
              </div>
            </div>

            {/* Danh sách nhân viên */}
            <div>
              <h3 style={{ margin: '0 0 15px', color: '#2B3674', fontSize: '18px' }}>
                <TeamOutlined style={{ marginRight: '8px', color: '#304FFE' }} />
                Chọn nhân viên cho dịch vụ này
              </h3>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <SyncOutlined spin style={{ fontSize: '24px', color: '#304FFE' }} />
                  <p style={{ marginTop: '10px', color: '#666' }}>Đang tải danh sách nhân viên...</p>
                </div>
              ) : availableStaffForService.length > 0 ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {availableStaffForService.map(staff => (
                    <div
                      key={staff.staffId}
                      style={{
                        padding: '16px',
                        border: selectedStaffForAssignment?.staffId === staff.staffId 
                          ? '2px solid #304FFE' 
                          : '2px solid #e6e9f0',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: selectedStaffForAssignment?.staffId === staff.staffId 
                          ? 'linear-gradient(135deg, #f0f7ff, #e6f1ff)' 
                          : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onClick={() => setSelectedStaffForAssignment(staff)}
                      onMouseEnter={(e) => {
                        if (selectedStaffForAssignment?.staffId !== staff.staffId) {
                          e.target.style.borderColor = '#304FFE';
                          e.target.style.background = '#fafbff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedStaffForAssignment?.staffId !== staff.staffId) {
                          e.target.style.borderColor = '#e6e9f0';
                          e.target.style.background = 'white';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #304FFE, #304FFE)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          {staff.fullName?.charAt(0) || 'N'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#2B3674', fontSize: '16px' }}>
                            {staff.fullName}
                          </div>
                          <div style={{ color: '#707EAE', fontSize: '13px' }}>
                            {staff.specialization || 'Nhân viên'}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStaffForAssignment(staff);
                            // Sửa lỗi: Thêm logic để hiển thị TimeSlotGrid modal
                            setLoadingTimeSlots(true);
                            setShowTimeSlotView(true);
                            
                            // Load staff schedule data
                            const loadData = async () => {
                              try {
                                console.log(`🔧 [STAFF ASSIGN] Loading data for staff ${staff.staffId} on ${selectedUnassignedAppointment.appointmentDate}`);
                                
                                // Fetch staff busy slots and appointments
                                const [busySlots, appointments] = await Promise.all([
                                  fetchStaffBusySlots(staff.staffId, selectedUnassignedAppointment.appointmentDate),
                                  fetchStaffAppointments(staff.staffId, selectedUnassignedAppointment.appointmentDate)
                                ]);
                                
                                console.log(`🔧 [STAFF ASSIGN] Staff ${staff.staffId} busy slots:`, busySlots);
                                console.log(`🔧 [STAFF ASSIGN] Staff ${staff.staffId} appointments:`, appointments);
                                
                                setStaffBusyTimeSlots(busySlots);
                                setStaffAppointments(appointments);
                                
                                // Get service duration for slot generation
                                const serviceDuration = getServiceDuration(selectedUnassignedAppointment.serviceId, services);
                                console.log(`🔧 [STAFF ASSIGN] Service duration: ${serviceDuration} minutes`);
                                
                                // Generate slots using generateEditTimeSlots instead (better logic)
                                const slots = generateEditTimeSlots(
                                  selectedUnassignedAppointment.appointmentDate,
                                  serviceDuration,
                                  [], // no pet busy slots for staff assignment
                                  busySlots, // staff busy slots
                                  null, // no excludeAppointmentId for staff assignment
                                  appointments, // staff appointments for overlap detection
                                  [] // no pet appointments for staff assignment
                                );
                                
                                console.log(`🔧 [STAFF ASSIGN] Generated ${slots.length} slots for staff assignment`);
                                setStaffTimeSlots(slots);
                                
                                console.log(`🔧 [STAFF ASSIGN] Setting loadingTimeSlots to false`);
                                setLoadingTimeSlots(false);
                                
                                // Auto-select current appointment time slot if staff is available
                                const currentAppointmentTime = formatTime(selectedUnassignedAppointment.appointmentDate);
                                const matchingSlot = slots.find(slot => 
                                  slot.startTimeString === currentAppointmentTime || 
                                  slot.startTime === currentAppointmentTime
                                );
                                
                                if (matchingSlot && matchingSlot.available) {
                                  setSelectedTimeSlot({
                                    ...matchingSlot,
                                    isCurrentAppointmentSlot: true
                                  });
                                }
                                
                                console.log('✅ Staff schedule loaded successfully:', {
                                  staffId: staff.staffId,
                                  busySlots: busySlots,
                                  appointments: appointments,
                                  timeSlots: slots.length,
                                  selectedSlot: matchingSlot
                                });
                                
                              } catch (error) {
                                console.error('🔧 [STAFF ASSIGN] Error loading staff schedule:', error);
                                setStaffTimeSlots([]);
                                setStaffBusyTimeSlots([]);
                                setStaffAppointments([]);
                                setToast({
                                  show: true,
                                  message: `Lỗi khi tải lịch nhân viên: ${error.message}`,
                                  type: 'error'
                                });
                              } finally {
                                console.log(`🔧 [STAFF ASSIGN] Finally block - setting loadingTimeSlots to false`);
                                setLoadingTimeSlots(false);
                              }
                            };
                            
                            loadData();
                          }}
                          disabled={loadingTimeSlots}
                          style={{
                            background: 'linear-gradient(135deg, #05CD99, #00B894)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <ScheduleOutlined />
                          {loadingTimeSlots ? 'Đang tải...' : 'Xem khung giờ'}
                        </button>
                        
                        {selectedStaffForAssignment?.staffId === staff.staffId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              assignStaffToAppointment(selectedUnassignedAppointment.appointmentId, staff.staffId);
                            }}
                            disabled={loading}
                            style={{
                              background: 'linear-gradient(135deg, #304FFE, #304FFE)',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <CheckOutlined />
                            Gán nhân viên
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#666',
                  background: '#f9f9f9',
                  borderRadius: '12px'
                }}>
                  <TeamOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: '15px' }} />
                  <p>Không có nhân viên nào khả dụng cho dịch vụ này</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal hiển thị lịch của nhân viên */}
      {staffScheduleModal && staffScheduleData && selectedStaffForAssignment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '25px',
              paddingBottom: '15px',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <h2 style={{
                margin: 0,
                color: '#2B3674',
                fontSize: '24px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <ScheduleOutlined style={{ color: '#304FFE' }} />
                Lịch của {selectedStaffForAssignment.fullName}
              </h2>
              <button
                onClick={() => {
                  setStaffScheduleModal(false);
                  setStaffScheduleData(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '5px'
                }}
              >
                <CloseOutlined />
              </button>
            </div>

            {/* Thông tin ngày */}
            <div style={{
              background: 'linear-gradient(135deg, #f8faff, #f0f7ff)',
              padding: '15px 20px',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <CalendarOutlined style={{ color: '#304FFE', fontSize: '18px' }} />
              <span style={{ fontWeight: '600', color: '#2B3674' }}>
                Ngày: {formatDate(selectedUnassignedAppointment.appointmentDate)}
              </span>
            </div>

            {/* Kiểm tra xung đột thời gian */}
            {(() => {
              const hasConflict = checkTimeConflict(
                selectedUnassignedAppointment.appointmentDate,
                staffScheduleData.appointments,
                getServiceDuration(selectedUnassignedAppointment.serviceId, services)
              );
              
              return (
                <div style={{
                  padding: '15px 20px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  background: hasConflict 
                    ? 'linear-gradient(135deg, #fff5f5, #ffe6e6)' 
                    : 'linear-gradient(135deg, #f0fff4, #e6ffed)',
                  border: hasConflict 
                    ? '1px solid #ff7875' 
                    : '1px solid #52c41a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {hasConflict ? (
                    <>
                      <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
                      <div>
                        <div style={{ fontWeight: '600', color: '#cf1322' }}>
                          Có xung đột thời gian!
                        </div>
                        <div style={{ fontSize: '13px', color: '#a8071a' }}>
                          Nhân viên đã có lịch hẹn vào khung giờ này ({formatTime(selectedUnassignedAppointment.appointmentDate)})
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                      <div>
                        <div style={{ fontWeight: '600', color: '#389e0d' }}>
                          Không có xung đột thời gian
                        </div>
                        <div style={{ fontSize: '13px', color: '#237804' }}>
                          Nhân viên có thể nhận lịch hẹn vào khung giờ này ({formatTime(selectedUnassignedAppointment.appointmentDate)})
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Danh sách lịch hẹn của nhân viên */}
            <div>
              <h3 style={{ margin: '0 0 15px', color: '#2B3674', fontSize: '18px' }}>
                <ClockCircleOutlined style={{ marginRight: '8px', color: '#304FFE' }} />
                Lịch hẹn trong ngày ({staffScheduleData.appointments?.length || 0} lịch hẹn)
              </h3>
              
              {staffScheduleData.appointments && staffScheduleData.appointments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflow: 'auto' }}>
                  {staffScheduleData.appointments.map((appt, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '12px 16px',
                        background: 'white',
                        border: '1px solid #e6e9f0',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: '#2B3674', fontSize: '14px' }}>
                          {formatTime(appt.appointmentDate)} - {formatEndTime(
                            appt.appointmentDate,
                            getServiceDuration(appt.serviceId, services)
                          )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#707EAE' }}>
                          {getServiceName(appt.serviceId)} - {getUserName(appt.userId)}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: appt.status === 'Confirmed' ? '#e6f7ff' : '#f6ffed',
                        color: appt.status === 'Confirmed' ? '#1890ff' : '#52c41a'
                      }}>
                        {statusEnToVi[appt.status] || appt.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '30px',
                  color: '#666',
                  background: '#f9f9f9',
                  borderRadius: '12px'
                }}>
                  <ClockCircleOutlined style={{ fontSize: '36px', color: '#ccc', marginBottom: '10px' }} />
                  <p>Nhân viên không có lịch hẹn nào trong ngày này</p>
                </div>
              )}
            </div>

            {/* Nút hành động */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '25px',
              paddingTop: '20px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <button
                onClick={() => {
                  setStaffScheduleModal(false);
                  setStaffScheduleData(null);
                }}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Đóng
              </button>
              
              {!checkTimeConflict(
                selectedUnassignedAppointment.appointmentDate,
                staffScheduleData.appointments,
                getServiceDuration(selectedUnassignedAppointment.serviceId, services)
              ) && (
                <button
                  onClick={() => {
                    assignStaffToAppointment(selectedUnassignedAppointment.appointmentId, selectedStaffForAssignment.staffId);
                  }}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #304FFE, #304FFE)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {loading ? <SyncOutlined spin /> : <CheckOutlined />}
                  Gán nhân viên này
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={closeToast} 
      />

      {/* Confirm Dialog */}
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        content={confirmDialog.content}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
        setConfirmDialog={setConfirmDialog}
        confirmDialog={confirmDialog}
      />

      {/* Modal hiển thị khung giờ của nhân viên với TimeSlotGrid */}
      {showTimeSlotView && selectedStaffForAssignment && selectedUnassignedAppointment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1002
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '1200px',
            width: '95%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '25px',
              paddingBottom: '15px',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <h2 style={{
                margin: 0,
                color: '#2B3674',
                fontSize: '24px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <ScheduleOutlined style={{ color: '#304FFE' }} />
                Chọn khung giờ cho {selectedStaffForAssignment.fullName}
              </h2>
              <button
                onClick={() => {
                  setShowTimeSlotView(false);
                  setSelectedTimeSlot(null);
                  setStaffTimeSlots([]);
                  setStaffAppointments([]);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '5px'
                }}
              >
                <CloseOutlined />
              </button>
            </div>

            {/* Thông tin lịch hẹn hiện tại */}
            <div style={{
              background: 'linear-gradient(135deg, #fff7e6, #ffecc7)',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '25px',
              border: '1px solid #ffe58f'
            }}>
              <h3 style={{ margin: '0 0 15px', color: '#2B3674', fontSize: '18px' }}>
                <InfoCircleOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                Lịch hẹn hiện tại
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
                <div>
                  <strong>Thời gian hiện tại:</strong> {formatDate(selectedUnassignedAppointment.appointmentDate)} - {formatTime(selectedUnassignedAppointment.appointmentDate)}
                </div>
                <div>
                  <strong>Dịch vụ:</strong> {getServiceName(selectedUnassignedAppointment.serviceId)} ({getServiceDuration(selectedUnassignedAppointment.serviceId, services)} phút)
                </div>
                <div>
                  <strong>Khách hàng:</strong> {getUserName(selectedUnassignedAppointment.userId)}
                </div>
                <div>
                  <strong>Thú cưng:</strong> {getPetName(selectedUnassignedAppointment.petId)}
                </div>
              </div>
              
              {/* ===== HIỂN THỊ LỊCH BẬN CỦA NHÂN VIÊN TRONG MODAL ===== */}
              {selectedStaffForAssignment && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ color: '#2B3674', fontSize: '16px', marginBottom: '12px' }}>
                    👤 Lịch bận của nhân viên {selectedStaffForAssignment.fullName}
                  </h4>
                  <div style={{
                    background: staffBusyTimeSlots && staffBusyTimeSlots.length > 0 
                      ? 'linear-gradient(135deg, #fff5f5, #ffe6e6)' 
                      : 'linear-gradient(135deg, #f0fff4, #e6ffed)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: staffBusyTimeSlots && staffBusyTimeSlots.length > 0 
                      ? '1px solid #ffccc7' 
                      : '1px solid #b7eb8f'
                  }}>
                    {staffBusyTimeSlots && staffBusyTimeSlots.length > 0 ? (
                      <div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                          {staffBusyTimeSlots.map((timeSlot, index) => (
                            <span key={index} style={{
                              background: '#ff4d4f',
                              color: 'white',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}>
                              {timeSlot}
                            </span>
                          ))}
                        </div>
                        {/* Kiểm tra xung đột với lịch hiện tại */}
                        {(() => {
                          const currentTime = formatTime(selectedUnassignedAppointment.appointmentDate);
                          const hasConflict = staffBusyTimeSlots.includes(currentTime);
                          return hasConflict ? (
                            <div style={{ color: '#ff4d4f', fontSize: '12px', fontWeight: '500' }}>
                              ⚠️ XUNG ĐỘT: Nhân viên đã có lịch hẹn vào {currentTime}
                            </div>
                          ) : (
                            <div style={{ color: '#52c41a', fontSize: '12px', fontWeight: '500' }}>
                              ✓ Nhân viên rảnh vào {currentTime}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <span style={{ color: '#52c41a', fontSize: '13px', fontStyle: 'italic' }}>
                        ✓ Nhân viên không có lịch hẹn nào khác trong ngày này
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Thông báo auto-select */}
              <div style={{
                marginTop: '15px',
                padding: '10px 12px',
                background: '#f0f9ff',
                borderRadius: '6px',
                border: '1px solid #bae7ff',
                fontSize: '13px',
                color: '#1890ff'
              }}>
                <InfoCircleOutlined style={{ marginRight: '6px' }} />
                <strong>Lưu ý:</strong> Khung giờ hiện tại sẽ được tự động chọn nếu nhân viên rảnh vào thời điểm đó
              </div>
              
              {/* Hiển thị khung giờ đã chọn */}
              {selectedTimeSlot && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  background: selectedTimeSlot.isCurrentAppointmentSlot ? '#f6ffed' : '#e6f7ff',
                  borderRadius: '8px',
                  border: selectedTimeSlot.isCurrentAppointmentSlot ? '1px solid #b7eb8f' : '1px solid #91d5ff'
                }}>
                  <strong style={{ color: selectedTimeSlot.isCurrentAppointmentSlot ? '#52c41a' : '#1890ff' }}>
                    {selectedTimeSlot.isCurrentAppointmentSlot ? (
                      <>⏰ Khung giờ hiện tại (đã tự động chọn): {selectedTimeSlot.startTimeString} - {dayjs(`2023-01-01T${selectedTimeSlot.startTimeString}`).add(getServiceDuration(selectedUnassignedAppointment.serviceId, services), 'minute').format('HH:mm')}</>
                    ) : (
                      <>⏰ Khung giờ mới đã chọn: {selectedTimeSlot.startTimeString} - {dayjs(`2023-01-01T${selectedTimeSlot.startTimeString}`).add(getServiceDuration(selectedUnassignedAppointment.serviceId, services), 'minute').format('HH:mm')}</>
                    )}
                  </strong>
                  {selectedTimeSlot.isCurrentAppointmentSlot && (
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#52c41a', 
                      marginTop: '5px',
                      fontStyle: 'italic'
                    }}>
                      ✓ Nhân viên này rảnh vào khung giờ hiện tại của lịch hẹn
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TimeSlotGrid component */}
            <div style={{ marginBottom: '20px' }}>
              {loadingTimeSlots ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <SyncOutlined spin style={{ fontSize: '32px', color: '#304FFE' }} />
                  <p style={{ marginTop: '15px', color: '#666' }}>Đang tải khung giờ...</p>
                </div>
              ) : (
                (() => {
                  console.log(`🔧 [TIMESLOT RENDER] Rendering TimeSlotGrid with:`, {
                    staffTimeSlots: staffTimeSlots.length,
                    staffBusyTimeSlots: staffBusyTimeSlots,
                    staffAppointments: staffAppointments.length,
                    selectedStaffId: selectedStaffForAssignment.staffId,
                    serviceDuration: getServiceDuration(selectedUnassignedAppointment.serviceId, services)
                  });
                  
                  return (
                    <TimeSlotGrid
                      availableSlots={staffTimeSlots}
                      selectedSlot={selectedTimeSlot}
                      onSelectTimeSlot={handleTimeSlotSelect}
                      selectedDate={selectedUnassignedAppointment.appointmentDate}
                      selectedService={{
                        name: getServiceName(selectedUnassignedAppointment.serviceId),
                        duration: getServiceDuration(selectedUnassignedAppointment.serviceId, services)
                      }}
                      appointments={staffAppointments}
                      selectedStaffId={selectedStaffForAssignment.staffId}
                      serviceDuration={getServiceDuration(selectedUnassignedAppointment.serviceId, services)}
                      petBusyTimeSlots={[]}
                      petAppointments={[]}
                      staffBusySlots={staffBusyTimeSlots}
                      staffAppointments={staffAppointments}
                      loading={loadingTimeSlots}
                    />
                  );
                })()
              )}
            </div>

            {/* Nút hành động */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginTop: '25px',
              paddingTop: '20px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <div style={{ flex: 1 }}>
                <button
                  onClick={() => {
                    setShowTimeSlotView(false);
                    setSelectedTimeSlot(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Quay lại
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                {/* Nút gán với thời gian hiện tại */}
                <button
                  onClick={() => {
                    assignStaffToAppointment(selectedUnassignedAppointment.appointmentId, selectedStaffForAssignment.staffId);
                  }}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #faad14, #ffc53d)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {loading ? <SyncOutlined spin /> : <CheckOutlined />}
                  Gán nhân viên (giữ nguyên thời gian)
                </button>

                {/* Nút gán với khung giờ mới */}
                {selectedTimeSlot && (
                  <button
                    onClick={() => {
                      assignStaffToAppointment(
                        selectedUnassignedAppointment.appointmentId, 
                        selectedStaffForAssignment.staffId, 
                        selectedTimeSlot.isCurrentAppointmentSlot ? null : selectedTimeSlot
                      );
                    }}
                    disabled={loading}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      background: selectedTimeSlot.isCurrentAppointmentSlot 
                        ? 'linear-gradient(135deg, #52c41a, #73d13d)' 
                        : 'linear-gradient(135deg, #304FFE, #304FFE)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {loading ? <SyncOutlined spin /> : <CheckOutlined />}
                    {selectedTimeSlot.isCurrentAppointmentSlot 
                      ? `✓ Gán nhân viên (${selectedTimeSlot.startTimeString})` 
                      : `Gán + đổi thời gian (${selectedTimeSlot.startTimeString})`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal hiển thị lịch của nhân viên (giữ lại cho backward compatibility) */}
      {staffScheduleModal && staffScheduleData && selectedStaffForAssignment && !showTimeSlotView && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '25px',
              paddingBottom: '15px',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <h2 style={{
                margin: 0,
                color: '#2B3674',
                fontSize: '24px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <ScheduleOutlined style={{ color: '#304FFE' }} />
                Lịch của {selectedStaffForAssignment.fullName}
              </h2>
              <button
                onClick={() => {
                  setStaffScheduleModal(false);
                  setStaffScheduleData(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '5px'
                }}
              >
                <CloseOutlined />
              </button>
            </div>

            {/* Thông tin ngày */}
            <div style={{
              background: 'linear-gradient(135deg, #f8faff, #f0f7ff)',
              padding: '15px 20px',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <CalendarOutlined style={{ color: '#304FFE', fontSize: '18px' }} />
              <span style={{ fontWeight: '600', color: '#2B3674' }}>
                Ngày: {formatDate(selectedUnassignedAppointment.appointmentDate)}
              </span>
            </div>

            {/* Kiểm tra xung đột thời gian */}
            {(() => {
              const hasConflict = checkTimeConflict(
                selectedUnassignedAppointment.appointmentDate,
                staffScheduleData.appointments,
                getServiceDuration(selectedUnassignedAppointment.serviceId, services)
              );
              
              return (
                <div style={{
                  padding: '15px 20px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  background: hasConflict 
                    ? 'linear-gradient(135deg, #fff5f5, #ffe6e6)' 
                    : 'linear-gradient(135deg, #f0fff4, #e6ffed)',
                  border: hasConflict 
                    ? '1px solid #ff7875' 
                    : '1px solid #52c41a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {hasConflict ? (
                    <>
                      <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
                      <div>
                        <div style={{ fontWeight: '600', color: '#cf1322' }}>
                          Có xung đột thời gian!
                        </div>
                        <div style={{ fontSize: '13px', color: '#a8071a' }}>
                          Nhân viên đã có lịch hẹn vào khung giờ này ({formatTime(selectedUnassignedAppointment.appointmentDate)})
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                      <div>
                        <div style={{ fontWeight: '600', color: '#389e0d' }}>
                          Không có xung đột thời gian
                        </div>
                        <div style={{ fontSize: '13px', color: '#237804' }}>
                          Nhân viên có thể nhận lịch hẹn vào khung giờ này ({formatTime(selectedUnassignedAppointment.appointmentDate)})
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Danh sách lịch hẹn của nhân viên */}
            <div>
              <h3 style={{ margin: '0 0 15px', color: '#2B3674', fontSize: '18px' }}>
                <ClockCircleOutlined style={{ marginRight: '8px', color: '#304FFE' }} />
                Lịch hẹn trong ngày ({staffScheduleData.appointments?.length || 0} lịch hẹn)
              </h3>
              
              {staffScheduleData.appointments && staffScheduleData.appointments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflow: 'auto' }}>
                  {staffScheduleData.appointments.map((appt, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '12px 16px',
                        background: 'white',
                        border: '1px solid #e6e9f0',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: '#2B3674', fontSize: '14px' }}>
                          {formatTime(appt.appointmentDate)} - {formatEndTime(
                            appt.appointmentDate,
                            getServiceDuration(appt.serviceId, services)
                          )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#707EAE' }}>
                          {getServiceName(appt.serviceId)} - {getUserName(appt.userId)}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: appt.status === 'Confirmed' ? '#e6f7ff' : '#f6ffed',
                        color: appt.status === 'Confirmed' ? '#1890ff' : '#52c41a'
                      }}>
                        {statusEnToVi[appt.status] || appt.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '30px',
                  color: '#666',
                  background: '#f9f9f9',
                  borderRadius: '12px'
                }}>
                  <ClockCircleOutlined style={{ fontSize: '36px', color: '#ccc', marginBottom: '10px' }} />
                  <p>Nhân viên không có lịch hẹn nào trong ngày này</p>
                </div>
              )}
            </div>

            {/* Nút hành động */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '25px',
              paddingTop: '20px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <button
                onClick={() => {
                  setStaffScheduleModal(false);
                  setStaffScheduleData(null);
                }}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Đóng
              </button>
              
              {!checkTimeConflict(
                selectedUnassignedAppointment.appointmentDate,
                staffScheduleData.appointments,
                getServiceDuration(selectedUnassignedAppointment.serviceId, services)
              ) && (
                <button
                  onClick={() => {
                    assignStaffToAppointment(selectedUnassignedAppointment.appointmentId, selectedStaffForAssignment.staffId);
                  }}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #304FFE, #304FFE)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {loading ? <SyncOutlined spin /> : <CheckOutlined />}
                  Gán nhân viên này
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL TẠO LỊCH HẸN MỚI (SỬ DỤNG APPOINTMENTFORM) ===== */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 1
            }}>
              <h2 style={{ margin: 0, color: '#304FFE' }}>
                <PlusOutlined /> Tạo lịch hẹn cho khách hàng
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateFormData({
                    userId: '',
                    petId: '',
                    serviceId: '',
                    staffId: '',
                    appointmentDate: '',
                    appointmentTime: '',
                    notes: ''
                  });
                  setSelectedCreateTimeSlot(null);
                  setCreateTimeSlots([]);
                  setCreatePetBusySlots([]);
                  setCreatePetAppointments([]);
                  setUserPets([]);
                  setAvailableStaffForCreate([]);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              {!createFormData.userId ? (
                // Bước 1: Chọn khách hàng
                <div>
                  <h3 style={{ marginBottom: '16px', color: '#333' }}>Bước 1: Chọn khách hàng</h3>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      Khách hàng: <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      value={createFormData.userId}
                      onChange={(e) => {
                        const userId = parseInt(e.target.value);
                        console.log('👤 Selected userId:', userId);
                        console.log('🐾 All pets:', pets);
                        console.log('🐾 Pets length:', pets.length);
                        
                        setCreateFormData({
                          ...createFormData,
                          userId: e.target.value,
                          petId: '',
                          serviceId: '',
                          staffId: '',
                          appointmentDate: '',
                          appointmentTime: ''
                        });
                        
                        // Lọc thú cưng của khách hàng này
                        const filteredPets = pets.filter(p => {
                          console.log(`🔍 Checking pet ${p.petId}: userId=${p.userId}, name=${p.name}`);
                          return p.userId === userId;
                        });
                        
                        console.log('✅ Filtered pets for user:', filteredPets);
                        setUserPets(filteredPets);
                        setSelectedCreateTimeSlot(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid #d9d9d9',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">-- Chọn khách hàng --</option>
                      {users.map(user => (
                        <option key={user.userId} value={user.userId}>
                          {user.fullName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ 
                    padding: '16px', 
                    background: '#f0f7ff', 
                    borderRadius: '8px',
                    border: '1px solid #91d5ff'
                  }}>
                    <p style={{ margin: 0, color: '#1890ff', fontSize: '14px' }}>
                      💡 <strong>Hướng dẫn:</strong> Chọn khách hàng để tiếp tục đặt lịch hẹn cho họ
                    </p>
                  </div>
                </div>
              ) : (
                // Bước 2: Dùng AdminCreateAppointment component
                <div>
                  <div style={{ 
                    marginBottom: '16px', 
                    padding: '12px', 
                    background: '#f6ffed', 
                    borderRadius: '8px',
                    border: '1px solid #b7eb8f',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong style={{ color: '#52c41a' }}>
                        ✓ Đang đặt lịch cho: {users.find(u => u.userId === parseInt(createFormData.userId))?.fullName}
                      </strong>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        Email: {users.find(u => u.userId === parseInt(createFormData.userId))?.email}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCreateFormData({
                          userId: '',
                          petId: '',
                          serviceId: '',
                          staffId: '',
                          appointmentDate: '',
                          appointmentTime: '',
                          notes: ''
                        });
                        setUserPets([]);
                        setSelectedCreateTimeSlot(null);
                        setCreateTimeSlots([]);
                      }}
                      style={{
                        padding: '6px 12px',
                        background: 'white',
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Đổi khách hàng
                    </button>
                  </div>

                  {/* Sử dụng AdminCreateAppointment component */}
                  <AdminCreateAppointment 
                    userId={parseInt(createFormData.userId)}
                    onSuccess={(response) => {
                      console.log('✅ Tạo lịch hẹn thành công:', response);
                      // Đóng modal
                      setShowCreateModal(false);
                      // Reset form
                      setCreateFormData({
                        userId: '',
                        petId: '',
                        serviceId: '',
                        staffId: '',
                        appointmentDate: '',
                        appointmentTime: '',
                        notes: ''
                      });
                      // Refresh danh sách appointments
                      fetchAppointments();
                      notification.success({
                        message: 'Thành công',
                        description: 'Đã tạo lịch hẹn cho khách hàng!',
                        placement: 'topRight'
                      });
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppointmentContainer>
  );
};

export default AppointmentManagement;

