// src/components/appointment/CompleteAppointmentForm.js
import React, { useState } from 'react';
import { Modal, Form, DatePicker, Input, Alert, Button, message } from 'antd';
import dayjs from 'dayjs';
// Thêm import axiosClient
import axiosClient from '../../utils/axiosClient';
import appointmentService from '../../services/appointmentService';

const CompleteAppointmentForm = ({ visible, appointment, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tính toán thời gian hiện tại và thời gian kết thúc gốc
  const now = new Date();
  const originalEndTime = appointment ? new Date(appointment.endTime) : null;
  const appointmentTime = appointment ? new Date(appointment.appointmentDate) : null;
  
  // Thêm hàm formatDateTime trực tiếp trong component
  const formatDateTime = (date) => {
    if (!date) return null;
    return new Date(date).toISOString();
  };
  
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      // Hiển thị log để debug
      console.log("Form values:", values);
      console.log("Appointment:", appointment);
      
      // Format ngày đúng cách
      const completionData = {
        actualCompletionTime: formatDateTime(values.completionTime.toDate()),
        notes: values.notes || ''
      };

      console.log("Sending to API:", completionData);
      console.log("Appointment ID:", appointment.appointmentId);

      // Thử nhiều đường dẫn API khác nhau theo thứ tự ưu tiên
      let apiSuccess = false;
      let errorResponse = null;

      // === PHƯƠNG ÁN 1: Sử dụng phương thức từ appointmentService ===
      try {
        const response = await appointmentService.updateCompletionTime(
          appointment.appointmentId, 
          completionData
        );
        console.log("appointmentService successful:", response);
        apiSuccess = true;
        message.success('Đã cập nhật thời gian hoàn thành dịch vụ');
        onSuccess();
      } catch (err) {
        console.log("appointmentService method failed:", err);
        errorResponse = err;
        
        // === PHƯƠNG ÁN 2: Thử endpoint chính xác nhất từ Swagger ===
        try {
          const response = await axiosClient.patch(
            `/Appointments/${appointment.appointmentId}/complete`, 
            completionData
          );
          console.log("Direct endpoint successful:", response);
          apiSuccess = true;
          message.success('Đã cập nhật thời gian hoàn thành dịch vụ');
          onSuccess();
        } catch (err2) {
          console.log("Direct endpoint failed:", err2);
          
          // === PHƯƠNG ÁN 3: Thử với chữ thường ===
          try {
            const response = await axiosClient.patch(
              `/appointments/${appointment.appointmentId}/complete`, 
              completionData
            );
            console.log("Lowercase endpoint successful:", response);
            apiSuccess = true;
            message.success('Đã cập nhật thời gian hoàn thành dịch vụ');
            onSuccess();
          } catch (err3) {
            console.log("Lowercase endpoint failed:", err3);
            
            // === PHƯƠNG ÁN 4: Thử cập nhật qua API Status ===
            try {
              const response = await axiosClient.patch(
                `/Appointments/${appointment.appointmentId}/Status`, 
                { 
                  status: "Completed", 
                  notes: values.notes || '' 
                }
              );
              console.log("Status update successful:", response);
              apiSuccess = true;
              message.success('Đã cập nhật trạng thái thành hoàn thành');
              onSuccess();
            } catch (err4) {
              console.log("Status update failed:", err4);
              
              // === PHƯƠNG ÁN 5: Thử phương thức PUT thay vì PATCH ===
              try {
                const response = await axiosClient.put(
                  `/Appointments/${appointment.appointmentId}`, 
                  {
                    ...appointment,
                    status: "Completed",
                    endTime: completionData.actualCompletionTime,
                    notes: appointment.notes ? 
                      `${appointment.notes}\n${completionData.notes}` : 
                      completionData.notes
                  }
                );
                console.log("Full update successful:", response);
                apiSuccess = true;
                message.success('Đã cập nhật lịch hẹn thành hoàn thành');
                onSuccess();
              } catch (err5) {
                console.log("All API attempts failed");
                errorResponse = err5;
              }
            }
          }
        }
      }

      if (!apiSuccess) {
        throw errorResponse || new Error("Không thể cập nhật thời gian hoàn thành");
      }
    } catch (err) {
      console.error('Error completing appointment:', err);
      setError(err.response?.data?.message || err.message || 'Không thể cập nhật thời gian hoàn thành. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      title="Cập nhật thời gian hoàn thành"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          completionTime: dayjs(now),
          notes: ''
        }}
      >
        <Form.Item
          name="completionTime"
          label="Thời gian hoàn thành thực tế"
          rules={[
            { required: true, message: 'Vui lòng chọn thời gian hoàn thành' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                
                const completionTime = value.toDate();
                
                if (completionTime < appointmentTime) {
                  return Promise.reject('Thời gian hoàn thành không thể sớm hơn thời gian bắt đầu');
                }
                
                if (completionTime > originalEndTime) {
                  return Promise.reject('Thời gian hoàn thành không thể muộn hơn thời gian kết thúc dự kiến');
                }
                
                return Promise.resolve();
              }
            }
          ]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="DD/MM/YYYY HH:mm"
            style={{ width: '100%' }}
            disabledDate={(current) => {
              if (!appointmentTime || !originalEndTime) return true;
              const currentDate = current.startOf('day').toDate();
              const apptDate = new Date(appointmentTime).setHours(0,0,0,0);
              return currentDate.getTime() !== apptDate;
            }}
            showNow={false}
          />
        </Form.Item>
        
        <Form.Item
          name="notes"
          label="Ghi chú"
        >
          <Input.TextArea rows={4} placeholder="Nhập ghi chú về việc hoàn thành dịch vụ (tùy chọn)" />
        </Form.Item>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Xác nhận
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CompleteAppointmentForm;