import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../utils/axiosClient';
import staffService from '../../services/staffService';
import serviceService from '../../services/serviceService';
import { 
  UserAddOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined, 
  SafetyOutlined,
  CheckOutlined,
  CloseOutlined,
  LoadingOutlined,
  PlusOutlined,
  EditOutlined,
  InfoCircleOutlined,
  CameraOutlined,
  TeamOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CustomerServiceOutlined
} from '@ant-design/icons';

// ============ Animation Keyframes ============
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(67, 24, 255, 0.3); }
  50% { box-shadow: 0 0 20px rgba(67, 24, 255, 0.6); }
  100% { box-shadow: 0 0 5px rgba(67, 24, 255, 0.3); }
`;

// ============ Styled Components ============
const Container = styled.div`
  width: 100%;
  max-width: 100%;
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  animation: ${fadeIn} 0.5s ease;
  overflow: hidden;
  position: relative;
  margin-bottom: 20px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #304FFE, #304FFE);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
  padding-bottom: 15px;
  border-bottom: 1px solid #e6e9f0;

  h1 {
    font-size: 28px;
    font-weight: 600;
    color: #2B3674;
    margin: 0;
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;

    .anticon {
      font-size: 24px;
      color: #304FFE;
      background: linear-gradient(135deg, #304FFE, #304FFE);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: ${pulse} 2s infinite ease-in-out;
    }
  }
`;

const FormContainer = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 0;
  width: 100%;
  position: relative;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  ${props => props.active && `
    background: linear-gradient(135deg, #304FFE, #304FFE);
    color: white;
    box-shadow: 0 4px 15px rgba(67, 24, 255, 0.3);
  `}
  
  ${props => !props.active && `
    background: #e6e9f0;
    color: #707EAE;
  `}
  
  .anticon {
    font-size: 16px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  position: relative;

  &.full-width {
    grid-column: 1 / -1;
  }

  label {
    display: block;
    margin-bottom: 10px;
    font-weight: 500;
    color: #2B3674;
    font-size: 15px;
    display: flex;
    align-items: center;
    gap: 8px;

    .anticon {
      color: #304FFE;
      font-size: 16px;
    }
    
    .required {
      color: #FF5252;
    }
  }

  input, select, textarea {
    width: 100%;
    padding: 14px 15px;
    border: 2px solid #e6e9f0;
    border-radius: 12px;
    font-size: 15px;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    background: white;
    color: #2B3674;

    &:focus {
      outline: none;
      border-color: #304FFE;
      box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.15);
    }

    &::placeholder {
      color: #A3AED0;
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  
  input {
    padding-right: 45px;
  }
  
  .password-toggle {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #707EAE;
    cursor: pointer;
    font-size: 16px;
    
    &:hover {
      color: #304FFE;
    }
  }
`;

const AvatarUpload = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 2px dashed #e6e9f0;
  border-radius: 12px;
  background: #f8fafc;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #304FFE;
    background: #f1f9ff;
  }

  .avatar-preview {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #304FFE;
  }

  .upload-placeholder {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #e6e9f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #707EAE;
    font-size: 24px;
  }

  input[type="file"] {
    display: none;
  }

  .upload-text {
    text-align: center;
    color: #707EAE;
    
    p {
      margin: 0;
      font-size: 14px;
    }
    
    .main-text {
      color: #2B3674;
      font-weight: 500;
    }
  }
`;

const ServiceSelection = styled.div`
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-top: 15px;
  }
`;

const ServiceCard = styled.div`
  padding: 15px;
  border: 2px solid ${props => props.selected ? '#304FFE' : '#e6e9f0'};
  border-radius: 12px;
  background: ${props => props.selected ? '#f1f9ff' : 'white'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #304FFE;
    background: #f1f9ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(67, 24, 255, 0.15);
  }
  
  .service-name {
    font-weight: 500;
    color: #2B3674;
    margin-bottom: 5px;
  }
  
  .service-category {
    font-size: 13px;
    color: #707EAE;
    background: #f8fafc;
    padding: 4px 8px;
    border-radius: 6px;
    display: inline-block;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e6e9f0;
`;

const Button = styled.button`
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .anticon {
    font-size: 18px;
  }

  &.primary {
    background: linear-gradient(135deg, #304FFE, #304FFE);
    color: white;
    box-shadow: 0 6px 15px rgba(67, 24, 255, 0.3);

    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(67, 24, 255, 0.4);
    }
  }

  &.secondary {
    background: #f8fafc;
    color: #707EAE;

    &:hover:not(:disabled) {
      background: #e6e9f0;
      transform: translateY(-2px);
    }
  }
`;

const Toast = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

  &.success {
    background: linear-gradient(135deg, #05CD99, #1FA7A7);
  }

  &.error {
    background: linear-gradient(135deg, #FF5252, #FF6B6B);
  }

  &.info {
    background: linear-gradient(135deg, #304FFE, #304FFE);
  }
`;

const LoadingOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const LoadingCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
  
  .spinner {
    font-size: 32px;
    color: #304FFE;
    animation: ${rotate} 1s linear infinite;
    margin-bottom: 20px;
  }
  
  p {
    margin: 0;
    color: #2B3674;
    font-weight: 500;
  }
`;

const StaffAccountCreation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  const [formData, setFormData] = useState({
    // Thông tin User
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
    
    // Thông tin Staff
    specialization: '',
    bio: '',
    experience: 0,
    avatar: null
  });

  const [errors, setErrors] = useState({});



  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const validateStep = (step) => {
    console.log('=== VALIDATE STEP', step, '===');
    console.log('Form data for validation:', formData);
    
    const newErrors = {};

    if (step === 1) {
      console.log('Validating step 1...');
      
      if (!formData.username?.trim()) {
        newErrors.username = 'Tên đăng nhập là bắt buộc';
        console.log('❌ Username missing');
      }
      if (!formData.email?.trim()) {
        newErrors.email = 'Email là bắt buộc';
        console.log('❌ Email missing');
      }
      if (!formData.password?.trim()) {
        newErrors.password = 'Mật khẩu là bắt buộc';
        console.log('❌ Password missing');
      }
      if (!formData.fullName?.trim()) {
        newErrors.fullName = 'Họ và tên là bắt buộc';
        console.log('❌ FullName missing');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
        console.log('❌ Email format invalid');
      }
      
      // Validate password length
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        console.log('❌ Password too short');
      }
    }

    if (step === 2) {
      console.log('Validating step 2...');
      
      if (!formData.specialization?.trim()) {
        newErrors.specialization = 'Chuyên môn là bắt buộc';
        console.log('❌ Specialization missing');
      }
    }

    console.log('Validation errors:', newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Is valid:', isValid);
    
    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
    }
  };



  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    console.log('=== BẮT ĐẦU SUBMIT ===');
    console.log('Current step:', currentStep);
    console.log('Form data hiện tại:', formData);
    
    // Validate step
    const isValid = validateStep(currentStep);
    console.log('Validation result:', isValid);
    if (!isValid) {
      console.log('Validation failed, stopping submit');
      return;
    }

    setLoading(true);
    try {
      console.log('=== CHUẨN BỊ GỬI DỮ LIỆU ===');
      console.log('Form data trước khi submit:', formData);
      
      // Kiểm tra dữ liệu cơ bản
      console.log('Username:', formData.username);
      console.log('Email:', formData.email);
      console.log('Password length:', formData.password?.length);
      console.log('FullName:', formData.fullName);
      console.log('Specialization:', formData.specialization);
      
      // Tạo nhân viên (không có ServiceIds)
      console.log('=== GỌI API TẠO NHÂN VIÊN ===');
      const createdStaff = await staffService.createUserStaff(formData);
      console.log('=== API THÀNH CÔNG ===');
      console.log('Nhân viên đã tạo:', createdStaff);
      
      showToast('Tạo tài khoản nhân viên thành công! Bạn có thể gán dịch vụ thông qua trang "Quản lý người dùng".', 'success');
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: '',
        address: '',
        specialization: '',
        bio: '',
        experience: 0,
        avatar: null
      });
      setCurrentStep(1);
      
    } catch (error) {
      console.error('=== LỖI TẠO TẀI KHOẢN ===');
      console.error('Full error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      let errorMessage = 'Có lỗi xảy ra khi tạo tài khoản nhân viên';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          // Validation errors
          const validationErrors = Object.values(error.response.data.errors).flat();
          errorMessage = validationErrors.join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Final error message:', errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
      console.log('=== KẾT THÚC SUBMIT ===');
    }
  };



  return (
    <Container>
      <Header>
        <h1>
          <UserAddOutlined />
          Tạo tài khoản nhân viên
        </h1>
      </Header>

      <FormContainer>
        <StepIndicator>
          <Step active={currentStep === 1}>
            <UserOutlined />
            Thông tin tài khoản
          </Step>
          <Step active={currentStep === 2}>
            <TeamOutlined />
            Thông tin nhân viên & Hoàn tất
          </Step>
        </StepIndicator>

        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FormGrid>
              <FormGroup>
                <label>
                  <UserOutlined /> Tên đăng nhập <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nhập tên đăng nhập"
                />
                {errors.username && <span style={{color: '#FF5252', fontSize: '13px'}}>{errors.username}</span>}
              </FormGroup>

              <FormGroup>
                <label>
                  <MailOutlined /> Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ email"
                />
                {errors.email && <span style={{color: '#FF5252', fontSize: '13px'}}>{errors.email}</span>}
              </FormGroup>

              <FormGroup>
                <label>
                  <SafetyOutlined /> Mật khẩu <span className="required">*</span>
                </label>
                <PasswordInputWrapper>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeTwoTone />}
                  </button>
                </PasswordInputWrapper>
                {errors.password && <span style={{color: '#FF5252', fontSize: '13px'}}>{errors.password}</span>}
              </FormGroup>

              <FormGroup>
                <label>
                  <UserOutlined /> Họ và tên <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                />
                {errors.fullName && <span style={{color: '#FF5252', fontSize: '13px'}}>{errors.fullName}</span>}
              </FormGroup>

              <FormGroup>
                <label>
                  <PhoneOutlined /> Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                />
              </FormGroup>

              <FormGroup className="full-width">
                <label>
                  <HomeOutlined /> Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ"
                />
              </FormGroup>
            </FormGrid>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FormGrid>
              <FormGroup>
                <label>
                  <EditOutlined /> Chuyên môn <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="VD: Chăm sóc thú cưng, Bác sĩ thú y, ..."
                />
                {errors.specialization && <span style={{color: '#FF5252', fontSize: '13px'}}>{errors.specialization}</span>}
              </FormGroup>

              <FormGroup>
                <label>
                  <InfoCircleOutlined /> Kinh nghiệm (năm)
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="Nhập số năm kinh nghiệm"
                  min="0"
                />
              </FormGroup>

              <FormGroup className="full-width">
                <label>
                  <EditOutlined /> Giới thiệu bản thân
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Mô tả ngắn về bản thân, kinh nghiệm, kỹ năng..."
                />
              </FormGroup>

              <FormGroup className="full-width">
                <label>
                  <CameraOutlined /> Ảnh đại diện
                </label>
                <AvatarUpload onClick={() => document.getElementById('avatar-input').click()}>
                  {formData.avatar ? (
                    <img 
                      src={URL.createObjectURL(formData.avatar)} 
                      alt="Avatar preview" 
                      className="avatar-preview"
                    />
                  ) : (
                    <div className="upload-placeholder">
                      <CameraOutlined />
                    </div>
                  )}
                  <div className="upload-text">
                    <p className="main-text">Nhấn để chọn ảnh</p>
                    <p>PNG, JPG tối đa 5MB</p>
                  </div>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </AvatarUpload>
              </FormGroup>
            </FormGrid>

            <div style={{
              textAlign: 'center',
              padding: '30px 20px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e6e9f0'
            }}>
              <InfoCircleOutlined style={{ fontSize: '32px', color: '#304FFE', marginBottom: '15px' }} />
              <h3 style={{ color: '#2B3674', marginBottom: '10px' }}>Gán dịch vụ sau khi tạo tài khoản</h3>
              <p style={{ color: '#707EAE', margin: '0', fontSize: '15px' }}>
                Tài khoản nhân viên sẽ được tạo trước. Bạn có thể gán dịch vụ cho nhân viên sau đó thông qua trang "Quản lý người dùng".
              </p>
            </div>
          </motion.div>
        )}



        <FormActions>
          {currentStep > 1 && (
            <Button type="button" className="secondary" onClick={prevStep}>
              <CloseOutlined />
              Quay lại
            </Button>
          )}
          
          {currentStep < 2 ? (
            <Button type="button" className="primary" onClick={nextStep}>
              Tiếp tục
              <PlusOutlined />
            </Button>
          ) : (
            <>
              <Button 
                type="button" 
                className="secondary" 
                onClick={() => {
                  console.log('=== DEBUG INFO ===');
                  console.log('Current step:', currentStep);
                  console.log('Form data:', formData);
                  console.log('Errors:', errors);
                  
                  // Test validation
                  const isValid = validateStep(currentStep);
                  console.log('Validation result:', isValid);
                }}
                style={{ marginRight: '10px' }}
              >
                🔍 Debug
              </Button>
              <Button 
                type="button" 
                className="primary" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <LoadingOutlined /> : <CheckOutlined />}
                {loading ? 'Đang tạo...' : 'Tạo tài khoản nhân viên'}
              </Button>
            </>
          )}
        </FormActions>
      </FormContainer>

      <AnimatePresence>
        {loading && (
          <LoadingOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingCard>
              <div className="spinner">
                <LoadingOutlined />
              </div>
              <p>Đang tạo tài khoản nhân viên...</p>
            </LoadingCard>
          </LoadingOverlay>
        )}

        {toast.show && (
          <Toast
            className={toast.type}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div>{toast.message}</div>
          </Toast>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default StaffAccountCreation; 
