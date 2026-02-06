import React from 'react';
import AppointmentForm from '../appointment/AppointmentForm';

/**
 * Wrapper component cho admin tạo lịch hẹn cho khách hàng
 * Component này wrap AppointmentForm với props admin mode
 */
const AdminCreateAppointment = ({ userId, onSuccess, onCancel }) => {
  return (
    <div style={{ 
      padding: '20px',
      background: 'white',
      borderRadius: '8px'
    }}>
      <AppointmentForm 
        userId={userId}
        isAdminMode={true}
        onSuccess={onSuccess}
      />
    </div>
  );
};

export default AdminCreateAppointment;

