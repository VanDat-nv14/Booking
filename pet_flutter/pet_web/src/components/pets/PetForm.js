import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Select, DatePicker, Button, Upload, 
  Row, Col, Typography, Divider, Card, Space, InputNumber
} from 'antd';
import { 
  UploadOutlined, UserOutlined, HeartOutlined, 
  CalendarOutlined, InfoCircleOutlined, DashboardOutlined,
  BgColorsOutlined, EditOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import locale from 'antd/es/date-picker/locale/vi_VN';
import moment from 'moment';
import 'moment/locale/vi';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Styled components
const StyledForm = styled(Form)`
  .ant-form-item-label > label {
    font-weight: 500;
    color: #2c3e50;
  }

  .ant-input, .ant-select-selector, .ant-picker, .ant-input-number {
    border-radius: 8px;
    border: 1px solid #e8e8e8;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  }

  .ant-input:hover, .ant-select-selector:hover, .ant-picker:hover, .ant-input-number:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 6px rgba(24, 144, 255, 0.15);
  }

  .ant-input:focus, .ant-select-selector:focus, .ant-picker-focused, .ant-input-number-focused {
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2) !important;
  }
  
  .ant-input-number {
    width: 100%;
  }
`;

const FormSection = styled(Card)`
  margin-bottom: 24px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  border: none;

  .ant-card-head {
    background: linear-gradient(to right, #f0f5ff, #e6f7ff);
    border-bottom: none;
  }

  .ant-card-head-title {
    font-weight: 600;
    font-size: 16px;
    color: #1890ff;
  }
`;

const UploadButton = styled(Button)`
  height: auto;
  padding: 18px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
  background-color: #fafafa;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #1890ff;
    background-color: #f0f7ff;
  }

  .anticon {
    font-size: 24px;
    margin-bottom: 8px;
    color: #1890ff;
  }
`;

const SubmitButton = styled(Button)`
  height: 48px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #f0f5ff;
  margin-right: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  color: #1890ff;
`;

const PetForm = ({ onSubmit, initialValues = {}, isEditing = false }) => {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [useAge, setUseAge] = useState(false);
  
  const handleFinish = (values) => {
    const formData = new FormData();
    
    // Map tên trường frontend sang tên trường backend
    const fieldMapping = {
      name: 'Name',
      species: 'Species',
      breed: 'Breed',
      gender: 'Gender',
      birthdate: 'DateOfBirth',
      weight: 'Weight',
      color: 'Color',
      description: 'Description',
      photo: 'Photo'
    };
    
    // Đảm bảo các trường bắt buộc luôn được thêm vào
    const requiredFields = ['Name', 'Species', 'Gender'];
    
    // Xử lý tuổi thành ngày sinh nếu người dùng nhập tuổi
    if (values.age && !values.birthdate) {
      const today = new Date();
      const birthYear = today.getFullYear() - parseInt(values.age);
      const approximateBirthdate = new Date(birthYear, 0, 1); // Ngày 1 tháng 1 của năm sinh
      values.birthdate = moment(approximateBirthdate);
    }
    
    // Đảm bảo có giá trị cho các trường bắt buộc
    if (values.name) {
      formData.append('Name', values.name);
    }
    
    if (values.species) {
      formData.append('Species', values.species);
    }
    
    if (values.gender) {
      formData.append('Gender', values.gender);
    }
    
    // Thêm các trường không bắt buộc nếu có
    if (values.breed) {
      formData.append('Breed', values.breed);
    }
    
    if (values.birthdate) {
      formData.append('DateOfBirth', values.birthdate.format('YYYY-MM-DD'));
    }
    
    if (values.weight) {
      formData.append('Weight', parseFloat(values.weight));
    }
    
    if (values.color) {
      formData.append('Color', values.color);
    }
    
    if (values.description) {
      formData.append('Description', values.description);
    }
    
    // Thêm file ảnh nếu có
    if (imageFile) {
      formData.append('Photo', imageFile);
    }
    
    // Log dữ liệu form để debug
    console.log('FormData contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[0] === 'Photo' ? 'File object' : pair[1]));
    }
    
    // Đảm bảo các trường bắt buộc không bị thiếu
    let missingFields = [];
    
    requiredFields.forEach(field => {
      if (![...formData.keys()].includes(field)) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      console.error('Thiếu các trường bắt buộc:', missingFields);
      alert(`Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`);
      return;
    }
    
    onSubmit(formData);
  };
  
  const handleBeforeUpload = (file) => {
    setImageFile(file);
    return false; // Prevent default upload behavior
  };

  const handleUploadChange = (info) => {
    setImageFile(info.file);
  };
  
  // Convert initial date value to moment object if available
  const birthDateValue = initialValues.dateOfBirth || initialValues.birthdate 
    ? moment(initialValues.dateOfBirth || initialValues.birthdate) 
    : undefined;
  
  const handleAgeChange = (e) => {
    const ageValue = e.target.value;
    
    if (ageValue && !isNaN(ageValue)) {
      // Nếu người dùng nhập tuổi, tự động tính ngày sinh tương ứng
      const today = new Date();
      const birthYear = today.getFullYear() - parseInt(ageValue);
      const approximateBirthdate = new Date(birthYear, 0, 1); // Ngày 1 tháng 1 của năm sinh
      
      form.setFieldsValue({ 
        birthdate: moment(approximateBirthdate) 
      });
      
      setUseAge(true);
    }
  };
  
  const handleBirthdateChange = (date) => {
    if (date) {
      setUseAge(false);
      form.setFieldsValue({ age: '' });
    }
  };
  
  // Use useEffect to set form values when initialValues change
  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      form.setFieldsValue({
        ...initialValues,
        birthdate: initialValues.dateOfBirth || initialValues.birthdate 
          ? moment(initialValues.dateOfBirth || initialValues.birthdate) 
          : undefined
      });
    }
  }, [form, initialValues]);
  
  return (
    <StyledForm
      form={form}
      layout="vertical"
      initialValues={{
        ...initialValues,
        birthdate: birthDateValue
      }}
      onFinish={handleFinish}
      scrollToFirstError
    >
      <FormSection 
        title={
          <Space>
            <IconWrapper>
              <InfoCircleOutlined />
            </IconWrapper>
            <span>Thông tin cơ bản</span>
          </Space>
        }
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Tên thú cưng"
              rules={[
                { required: true, message: 'Vui lòng nhập tên thú cưng' },
                { min: 2, max: 50, message: 'Tên thú cưng phải từ 2-50 ký tự' }
              ]}
              tooltip="Tên mà bạn thường gọi thú cưng của mình"
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                placeholder="Nhập tên thú cưng" 
                size="large"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="species"
              label="Loài"
              rules={[{ required: true, message: 'Vui lòng chọn loài' }]}
            >
              <Select
                placeholder="Chọn loài thú cưng"
                size="large"
              >
                <Option value="Chó">Chó</Option>
                <Option value="Mèo">Mèo</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="breed"
              label="Giống"
            >
              <Input 
                placeholder="Nhập giống thú cưng (nếu biết)" 
                size="large"
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="gender"
              label="Giới tính"
              rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
            >
              <Select
                placeholder="Chọn giới tính"
                size="large"
              >
                <Option value="Đực">
                  <Space>
                    <HeartOutlined style={{ color: '#1890ff' }} />
                    <span>Đực</span>
                  </Space>
                </Option>
                <Option value="Cái">
                  <Space>
                    <HeartOutlined style={{ color: '#eb2f96' }} />
                    <span>Cái</span>
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </FormSection>

      <FormSection 
        title={
          <Space>
            <IconWrapper>
              <CalendarOutlined />
            </IconWrapper>
            <span>Ngày sinh & Thông tin chi tiết</span>
          </Space>
        }
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="birthdate"
              label="Ngày sinh"
            >
              <DatePicker 
                locale={locale}
                placeholder="Chọn ngày sinh" 
                style={{ width: '100%' }}
                size="large"
                format="DD/MM/YYYY"
                onChange={handleBirthdateChange}
                disabled={useAge}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="age"
              label="Tuổi"
              help="Nhập tuổi nếu không biết chính xác ngày sinh"
            >
              <Input 
                placeholder="Nhập tuổi (nếu không biết ngày sinh)" 
                size="large"
                onChange={handleAgeChange}
                disabled={!useAge && form.getFieldValue('birthdate')}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="weight"
              label="Cân nặng (kg)"
            >
              <InputNumber
                placeholder="Nhập cân nặng (kg)"
                size="large"
                min={0.1}
                max={100}
                precision={2}
                step={0.1}
                prefix={<DashboardOutlined style={{ color: '#1890ff' }} />}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="color"
              label="Màu sắc"
            >
              <Input
                prefix={<BgColorsOutlined style={{ color: '#1890ff' }} />}
                placeholder="Nhập màu sắc của thú cưng"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea 
            placeholder="Thêm mô tả, sở thích, tính cách..." 
            rows={4}
            prefix={<EditOutlined />}
          />
        </Form.Item>
      </FormSection>

      <FormSection 
        title={
          <Space>
            <IconWrapper>
              <UploadOutlined />
            </IconWrapper>
            <span>Hình ảnh</span>
          </Space>
        }
      >
        <Form.Item
          name="photo"
          label="Ảnh thú cưng"
        >
          <Upload
            name="photo"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={true}
            beforeUpload={handleBeforeUpload}
            onChange={handleUploadChange}
            accept="image/*"
          >
            <motion.div whileHover={{ scale: 1.02 }}>
              <UploadButton icon={<UploadOutlined />}>
                <div style={{ marginBottom: 8 }}>
                  <UploadOutlined style={{ fontSize: 24 }} />
                </div>
                <Text strong>Tải ảnh lên</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>JPG, PNG, GIF</Text>
              </UploadButton>
            </motion.div>
          </Upload>
        </Form.Item>
      </FormSection>
      
      <Divider />
      
      <Form.Item style={{ textAlign: 'center', marginTop: 24 }}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SubmitButton 
            type="primary" 
            htmlType="submit" 
            size="large"
            block
          >
            {isEditing ? 'Cập nhật thú cưng' : 'Thêm thú cưng'}
          </SubmitButton>
        </motion.div>
      </Form.Item>
    </StyledForm>
  );
};

export default PetForm;