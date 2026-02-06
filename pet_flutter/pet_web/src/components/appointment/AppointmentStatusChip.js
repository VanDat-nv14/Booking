import React from 'react';
import { Tag, Badge, Tooltip } from 'antd';
import { 
  ClockCircleOutlined,
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(24, 144, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); }
`;

const shine = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
`;

const AnimatedTag = styled(Tag)`
  border-radius: 16px;
  padding: ${props => props.size === 'small' ? '0 8px' : '2px 12px'};
  font-weight: ${props => props.size === 'small' ? 500 : 600};
  font-size: ${props => props.size === 'small' ? '12px' : '14px'};
  line-height: ${props => props.size === 'small' ? '20px' : '24px'};
  display: inline-flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.scheduled {
    background: linear-gradient(120deg, #e6f7ff, #bae7ff, #e6f7ff);
    border: 1px solid #91d5ff;
    color: #0050b3;
    background-size: 200% 100%;
    animation: ${shine} 3s infinite linear;
  }
  
  &.confirmed {
    background: linear-gradient(120deg, #e6fffb, #b5f5ec, #e6fffb);
    border: 1px solid #87e8de;
    color: #006d75;
    background-size: 200% 100%;
    animation: ${shine} 3s infinite linear;
  }
  
  &.completed {
    background: linear-gradient(120deg, #f6ffed, #d9f7be, #f6ffed);
    border: 1px solid #b7eb8f;
    color: #389e0d;
    background-size: 200% 100%;
    animation: ${shine} 3s infinite linear;
  }
  
  &.cancelled {
    background: linear-gradient(120deg, #fff2f0, #ffccc7, #fff2f0);
    border: 1px solid #ffa39e;
    color: #cf1322;
    background-size: 200% 100%;
    animation: ${shine} 3s infinite linear;
  }
  
  &.noshow {
    background: linear-gradient(120deg, #fff7e6, #ffe7ba, #fff7e6);
    border: 1px solid #ffd591;
    color: #d46b08;
    background-size: 200% 100%;
    animation: ${shine} 3s infinite linear;
  }
  
  .anticon {
    margin-right: 6px;
    font-size: ${props => props.size === 'small' ? '12px' : '14px'};
  }
  
  &.scheduled .anticon {
    animation: ${pulse} 2s infinite;
  }
`;

const PulsingDot = styled(Badge)`
  margin-right: 4px;
  
  .ant-badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    box-shadow: 0 0 0 rgba(24, 144, 255, 0.4);
    animation: ${pulse} 2s infinite;
  }
`;

const AppointmentStatusChip = ({ status, size = 'default' }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'Scheduled': return 'scheduled';
      case 'Confirmed': return 'confirmed';
      case 'Completed': return 'completed';
      case 'Cancelled': return 'cancelled';
      case 'No-Show': return 'noshow';
      default: return '';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Scheduled':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case 'Confirmed':
        return <CheckCircleOutlined style={{ color: '#13c2c2' }} />;
      case 'Completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'Cancelled':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case 'No-Show':
        return <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return '#1890ff';
      case 'Confirmed': return '#13c2c2';
      case 'Completed': return '#52c41a';
      case 'Cancelled': return '#f5222d';
      case 'No-Show': return '#fa8c16';
      default: return '#d9d9d9';
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
  
  const statusClass = getStatusClass(status);
  const statusIcon = getStatusIcon(status);
  const statusText = getStatusText(status);
  const statusColor = getStatusColor(status);
  
  return (
    <Tooltip title={`Trạng thái: ${statusText}`}>
      <AnimatedTag 
        className={statusClass}
        size={size}
        icon={statusIcon}
      >
        <PulsingDot dot status={status === 'Scheduled'} color={statusColor} />
        {statusText}
      </AnimatedTag>
    </Tooltip>
  );
};

export default AppointmentStatusChip;