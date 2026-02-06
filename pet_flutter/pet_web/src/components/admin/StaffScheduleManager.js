import React, { useState, useEffect } from 'react';
import { Calendar, Select, Button, Form, Switch, TimePicker, Card, message, Spin, Row, Col, Tabs, Input } from 'antd';
import staffService from '../../services/staffService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;

const StaffScheduleManager = () => {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState({});
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [form] = Form.useForm();

  // Khi component được tạo, tải danh sách nhân viên
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        console.log('Bắt đầu gọi API lấy danh sách nhân viên...');
        
        // Kiểm tra token trước
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Không tìm thấy token, không thể lấy danh sách nhân viên');
          message.error('Bạn cần đăng nhập để quản lý ca làm việc');
          return;
        }
        
        // Gọi API để lấy danh sách nhân viên
        const response = await staffService.getAllStaff();
        console.log("API Staff Response:", response);
        
        // Kiểm tra response có dữ liệu hay không
        if (!response) {
          console.error('Response rỗng hoặc không xác định');
          message.error('Không thể tải danh sách nhân viên');
          return;
        }
        
        // Kiểm tra xem response có phải là mảng hay không
        if (Array.isArray(response)) {
          console.log('Response là một mảng dữ liệu với độ dài:', response.length);
          
          // Debug: Hiển thị cấu trúc của item đầu tiên
          if (response.length > 0) {
            console.log('Cấu trúc item mẫu:', JSON.stringify(response[0]));
            
            // Chuẩn hóa dữ liệu nhân viên
            const normalizedStaff = response.map(staff => ({
              staffId: staff.staffId || staff.StaffId,
              fullName: staff.fullName || staff.FullName || staff.name || staff.Name || 'Unknown Name'
            }));
            
            setStaff(normalizedStaff);
            console.log('Dữ liệu nhân viên đã chuẩn hóa:', normalizedStaff);
            
            if (normalizedStaff.length > 0) {
              console.log('Đã tìm thấy nhân viên, chọn nhân viên đầu tiên:', normalizedStaff[0]);
              setSelectedStaff(normalizedStaff[0].staffId);
            } else {
              console.log('Danh sách nhân viên trống');
              message.info('Không tìm thấy nhân viên nào');
            }
          } else {
            console.log('Mảng dữ liệu trống');
            message.info('Không tìm thấy nhân viên nào');
          }
        } else {
          console.error('Response không phải là mảng, là:', typeof response);
          message.error('API trả về dữ liệu không hợp lệ');
          
          // Thử gọi trực tiếp để debug
          console.log('Thử gọi API trực tiếp...');
          try {
            const directResponse = await fetch('https://localhost:7164/api/Staff', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            });
            
            // Log thông tin response
            console.log('Direct response status:', directResponse.status);
            console.log('Direct response headers:', directResponse.headers);
            
            const contentType = directResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await directResponse.json();
              console.log('Direct response data:', data);
              
              if (Array.isArray(data)) {
                const normalizedStaff = data.map(staff => ({
                  staffId: staff.staffId || staff.StaffId,
                  fullName: staff.fullName || staff.FullName || staff.name || staff.Name || 'Unknown Name'
                }));
                
                setStaff(normalizedStaff);
                
                if (normalizedStaff.length > 0) {
                  setSelectedStaff(normalizedStaff[0].staffId);
                }
              }
            } else {
              const text = await directResponse.text();
              console.log('Direct response text:', text);
            }
          } catch (directError) {
            console.error('Lỗi khi gọi API trực tiếp:', directError);
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách nhân viên:', error);
        message.error('Không thể tải danh sách nhân viên. Hãy kiểm tra kết nối mạng và thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Lấy lịch làm việc khi chọn nhân viên khác
  useEffect(() => {
    if (selectedStaff) {
      fetchStaffSchedule(selectedStaff, selectedDate.month() + 1, selectedDate.year());
    }
  }, [selectedStaff, selectedDate]);

  // Lấy lịch làm việc của nhân viên trong tháng
  const fetchStaffSchedule = async (staffId, month, year) => {
    try {
      setLoading(true);
      console.log(`Lấy lịch làm việc cho nhân viên ID: ${staffId}, tháng: ${month}, năm: ${year}`);
      
      const response = await staffService.getStaffSchedule(staffId, month, year);
      console.log('Kết quả lịch làm việc:', response);
      
      // Chuyển đổi dữ liệu để dễ tìm kiếm theo ngày
      const scheduleMap = {};
      if (Array.isArray(response)) {
        response.forEach(schedule => {
          const date = dayjs(schedule.date).format('YYYY-MM-DD');
          scheduleMap[date] = schedule;
        });
        
        setSchedules(scheduleMap);
      } else {
        console.error('API trả về dữ liệu lịch làm việc không hợp lệ');
        setSchedules({});
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      message.error('Không thể tải lịch làm việc');
    } finally {
      setLoading(false);
    }
  };

  // Lưu lịch làm việc
  const saveSchedule = async (values) => {
    try {
      setLoading(true);
      
      const startTime = values.workingHours[0].format('HH:mm');
      const endTime = values.workingHours[1].format('HH:mm');
      
      console.log('Đang lưu lịch làm việc với dữ liệu:', {
        staffId: selectedStaff,
        date: selectedDate.format('YYYY-MM-DD'),
        isWorking: values.isWorking,
        startTime,
        endTime,
        notes: values.notes || ''
      });
      
      const scheduleData = {
        staffId: selectedStaff,
        date: selectedDate.format('YYYY-MM-DD'),
        isWorking: values.isWorking,
        startTime: startTime,
        endTime: endTime,
        notes: values.notes || ''
      };
      
      await staffService.setStaffSchedule(scheduleData);
      
      message.success('Lịch làm việc đã được cập nhật');
      
      // Cập nhật lại danh sách lịch
      fetchStaffSchedule(selectedStaff, selectedDate.month() + 1, selectedDate.year());
    } catch (error) {
      console.error('Error saving schedule:', error);
      message.error('Không thể lưu lịch làm việc');
    } finally {
      setLoading(false);
    }
  };

  // Khi chọn ngày trên lịch
  const onDateSelect = (date) => {
    setSelectedDate(date);
    
    // Tìm thông tin lịch làm việc cho ngày được chọn
    const dateString = date.format('YYYY-MM-DD');
    const scheduleForDate = schedules[dateString];
    
    // Thiết lập form với dữ liệu có sẵn hoặc giá trị mặc định
    form.setFieldsValue({
      isWorking: scheduleForDate?.isWorking ?? true,
      workingHours: scheduleForDate ? [
        dayjs(scheduleForDate.startTime, 'HH:mm'),
        dayjs(scheduleForDate.endTime, 'HH:mm')
      ] : [
        dayjs('08:00', 'HH:mm'), 
        dayjs('21:30', 'HH:mm')
      ],
      notes: scheduleForDate?.notes || ''
    });
  };

  // Render nội dung ngày trong lịch
  const dateCellRender = (date) => {
    const dateString = date.format('YYYY-MM-DD');
    const schedule = schedules[dateString];
    
    if (schedule) {
      return (
        <div style={{ 
          height: '100%', 
          backgroundColor: schedule.isWorking ? '#e6f7ff' : '#fff1f0',
          padding: '2px' 
        }}>
          {schedule.isWorking ? (
            <div style={{ fontSize: '10px' }}>
              {dayjs(schedule.startTime, 'HH:mm').format('HH:mm')} - 
              {dayjs(schedule.endTime, 'HH:mm').format('HH:mm')}
            </div>
          ) : (
            <div style={{ fontSize: '10px', color: '#f5222d' }}>
              Nghỉ
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h2>Quản lý ca làm việc nhân viên</h2>
      
      <Tabs defaultActiveKey="individual">
        <TabPane tab="Lịch làm việc cá nhân" key="individual">
          <Row gutter={16}>
            <Col span={16}>
              <Card title="Lịch làm việc" loading={loading}>
                <Select
                  style={{ width: '100%', marginBottom: '16px' }}
                  placeholder="Chọn nhân viên"
                  value={selectedStaff}
                  onChange={(value) => {
                    console.log('Đã chọn nhân viên với ID:', value);
                    setSelectedStaff(value);
                  }}
                  loading={loading}
                  showSearch
                  optionFilterProp="children"
                >
                  {console.log('Rendering select với staff:', staff)}
                  {staff.length > 0 ? (
                    staff.map((s) => (
                      <Option key={s.staffId} value={s.staffId}>
                        {s.fullName}
                      </Option>
                    ))
                  ) : (
                    <Option value="no-staff" disabled>Không có nhân viên</Option>
                  )}
                </Select>
                
                <Calendar 
                  onSelect={onDateSelect}
                  dateCellRender={dateCellRender}
                  value={selectedDate}
                />
              </Card>
            </Col>
            
            <Col span={8}>
              <Card 
                title={`Cài đặt cho ngày ${selectedDate.format('DD/MM/YYYY')}`}
                loading={loading}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={saveSchedule}
                  initialValues={{
                    isWorking: true,
                    workingHours: [
                      dayjs('08:00', 'HH:mm'), 
                      dayjs('21:30', 'HH:mm')
                    ],
                    notes: ''
                  }}
                >
                  <Form.Item
                    name="isWorking"
                    label="Làm việc"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => 
                      prevValues.isWorking !== currentValues.isWorking
                    }
                  >
                    {({ getFieldValue }) => 
                      getFieldValue('isWorking') ? (
                        <Form.Item
                          name="workingHours"
                          label="Giờ làm việc"
                          rules={[{ required: true, message: 'Vui lòng chọn giờ làm việc' }]}
                        >
                          <TimePicker.RangePicker 
                            format="HH:mm"
                            style={{ width: '100%' }} 
                          />
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>
                  
                  <Form.Item
                    name="notes"
                    label="Ghi chú"
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                      Lưu cài đặt
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Thiết lập hàng loạt" key="batch">
          <Card title="Thiết lập ca làm việc hàng loạt">
            <p>Chức năng đang phát triển...</p>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default StaffScheduleManager;
