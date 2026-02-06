import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

const ColorLegend = () => {
  return (
    <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          width: 16, 
          height: 16, 
          borderRadius: 4, 
          backgroundColor: '#f6ffed', 
          border: '2px solid #52c41a', 
          marginRight: 8 
        }} />
        <Text>Khả dụng</Text>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          width: 16, 
          height: 16, 
          borderRadius: 4, 
          backgroundColor: '#1890ff', 
          border: '2px solid #1890ff', 
          marginRight: 8 
        }} />
        <Text>Đã chọn</Text>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          width: 16, 
          height: 16, 
          borderRadius: 4, 
          backgroundColor: '#fff1f0', 
          border: '2px solid #ff4d4f', 
          marginRight: 8 
        }} />
        <Text>Đã đặt</Text>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          width: 16, 
          height: 16, 
          borderRadius: 4, 
          backgroundColor: '#f5f5f5', 
          border: '2px solid #d9d9d9', 
          marginRight: 8 
        }} />
        <Text>Đã qua</Text>
      </div>
    </div>
  );
};

export default ColorLegend; 