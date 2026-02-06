import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { 
  Form, 
  Input, 
  Button, 
  Alert, 
  Typography, 
  Space,
  Divider,
  Row,
  Col,
  Progress,
  Steps,
  Tooltip,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  EyeTwoTone, 
  EyeInvisibleOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  SafetyOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  StarOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

// Styled components
const FormContainer = styled(motion.div)`
  width: 100%;
  position: relative;
`;

const StyledFormItem = styled(Form.Item)`
  margin-bottom: 24px;
  
  .ant-form-item-label {
    font-weight: 500;
    margin-bottom: 6px;
    
    label {
      opacity: 0.85;
      font-size: 14px;
      
      &:hover {
        opacity: 1;
      }
    }
  }
  
  .ant-form-item-explain-error {
    font-size: 13px;
    margin-top: 6px;
    display: flex;
    align-items: center;
    
    &:before {
      content: "⚠️";
      margin-right: 6px;
      font-size: 12px;
    }
  }

  .ant-input-affix-wrapper {
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid #e8e8e8;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    
    &:hover, &:focus, &-focused {
      border-color: #1890ff;
      box-shadow: 0 3px 10px rgba(24, 144, 255, 0.1);
      transform: translateY(-2px);
    }
  }
  
  .ant-input-prefix {
    margin-right: 12px;
    color: #bfbfbf;
    font-size: 18px;
    transition: color 0.3s ease;
  }
  
  &:hover .ant-input-prefix {
    color: #1890ff;
  }
  
  &.success-field {
    .ant-input-affix-wrapper {
      border-color: #52c41a;
      background-color: rgba(82, 196, 26, 0.05);
    }
    
    .ant-input-prefix {
      color: #52c41a;
    }
  }
`;

const RegisterButton = styled(Button)`
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(90deg, #1890ff 0%, #52c41a 100%);
  border: none;
  box-shadow: 0 8px 16px rgba(24, 144, 255, 0.2);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  z-index: 1;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.6s ease;
    z-index: -1;
  }
  
  &:hover {
    background: linear-gradient(90deg, #40a9ff 0%, #73d13d 100%);
    box-shadow: 0 10px 20px rgba(24, 144, 255, 0.3);
    transform: translateY(-3px);
    
    &:before {
      left: 100%;
    }
  }
  
  &:active {
    background: linear-gradient(90deg, #096dd9 0%, #389e0d 100%);
    transform: translateY(0);
  }
  
  .anticon {
    font-size: 18px;
    margin-right: 8px;
    vertical-align: -1px;
  }
`;

const StyledAlert = styled(Alert)`
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.2);
  
  .ant-alert-message {
    font-weight: 600;
  }
`;

const StyledDivider = styled(Divider)`
  margin: 32px 0 28px;
  position: relative;
  
  .ant-divider-inner-text {
    position: relative;
    font-size: 15px;
    color: #1890ff;
    font-weight: 600;
    background: white;
    padding: 0 16px;
    
    &:before {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 50%;
      width: 30px;
      height: 3px;
      background: linear-gradient(90deg, #1890ff, #52c41a);
      transform: translateX(-50%);
      border-radius: 3px;
    }
  }
`;

const FormEffect = styled(motion.div)`
  position: absolute;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(24, 144, 255, 0.08) 0%, rgba(24, 144, 255, 0) 70%);
  z-index: -1;
  pointer-events: none;
`;

const PasswordStrengthBar = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
`;

const PasswordTips = styled.div`
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f8f8f8;
  border-radius: 8px;
  font-size: 13px;
`;

const SuccessBadge = styled(motion.div)`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(82, 196, 26, 0.15);
  border: 1px solid rgba(82, 196, 26, 0.3);
  color: #52c41a;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(82, 196, 26, 0.15);
`;

const FormSectionTitle = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  
  .anticon {
    margin-right: 8px;
  }
`;

const StepsContainer = styled.div`
  margin-bottom: 32px;
  
  .ant-steps-item-active .ant-steps-item-icon {
    background-color: #1890ff;
    border-color: #1890ff;
  }
  
  .ant-steps-item-finish .ant-steps-item-icon {
    background-color: #52c41a;
    border-color: #52c41a;
  }
  
  .ant-steps-item-title {
    font-weight: 500;
  }
`;

const FormFieldContainer = styled.div`
  position: relative;
`;

const RegisterForm = () => {
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [completedFields, setCompletedFields] = useState({});
  const [effectPosition, setEffectPosition] = useState({ x: 0, y: 0 });
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  // Theo dõi sự thay đổi của form để cập nhật hiệu ứng - đã sửa lỗi vòng lặp vô hạn
  useEffect(() => {
    const newCompletedFields = {};
    
    Object.keys(formValues).forEach(field => {
      if (formValues[field] && field !== 'confirm') {
        newCompletedFields[field] = true;
      }
    });
    
    setCompletedFields(newCompletedFields);
    
    // Tính toán bước hiện tại dựa trên số trường đã hoàn thành
    const completedCount = Object.keys(newCompletedFields).length;
    
    if (completedCount >= 5) {
      setCurrentStep(2);
    } else if (completedCount >= 2) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
  }, [formValues]);

  const handleSubmit = async (values) => {
    setError('');
    setLoading(true);

    try {
      await register(values);
      
      // Hiển thị hiệu ứng thành công
      setSuccess(true);
      
      // Chờ hiệu ứng thành công trước khi chuyển hướng
      setTimeout(() => {
        form.resetFields();
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.response?.data || 'Đăng ký không thành công');
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Độ dài
    if (password.length >= 8) strength += 25;
    
    // Chữ thường + chữ hoa
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    
    // Số
    if (/[0-9]/.test(password)) strength += 25;
    
    // Ký tự đặc biệt
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return null;
    if (passwordStrength <= 25) return 'Yếu';
    if (passwordStrength <= 50) return 'Trung bình';
    if (passwordStrength <= 75) return 'Khá mạnh';
    return 'Mạnh';
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return '#ff4d4f';
    if (passwordStrength <= 50) return '#faad14';
    if (passwordStrength <= 75) return '#1890ff';
    return '#52c41a';
  };

  const handleFormMouseMove = (e) => {
    if (!loading && !success) {
      const rect = e.currentTarget.getBoundingClientRect();
      setEffectPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { delay: 0.6, type: "spring", stiffness: 200, damping: 15 }
    },
    hover: { 
      scale: 1.03,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.97 }
  };

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const successIconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: [1, 1.2, 1], 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const effectVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { 
      opacity: 0.8, 
      scale: 1,
      transition: { duration: 0.5 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <FormContainer
      initial="hidden"
      animate="visible"
      variants={formVariants}
      onMouseMove={handleFormMouseMove}
    >
      <AnimatePresence>
        {!loading && !success && (
          <FormEffect
            key="form-effect"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={effectVariants}
            style={{ 
              left: effectPosition.x - 125, 
              top: effectPosition.y - 125
            }}
          />
        )}
      </AnimatePresence>

      {success ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={successVariants}
          style={{ 
            textAlign: 'center', 
            padding: '40px 0',
            color: '#52c41a'
          }}
        >
          <motion.div variants={successIconVariants}>
            <CheckCircleOutlined style={{ fontSize: 70, marginBottom: 24 }} />
          </motion.div>
          <Title level={3} style={{ color: '#52c41a', marginBottom: 16 }}>
            Đăng ký thành công!
          </Title>
          <Paragraph style={{ fontSize: 16 }}>
            Chúc mừng bạn đã tạo tài khoản thành công.
            <br />
            Đang chuyển hướng đến trang đăng nhập...
          </Paragraph>
          <LoadingOutlined style={{ fontSize: 24, marginTop: 16 }} />
        </motion.div>
      ) : (
        <>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StyledAlert 
                message="Lỗi đăng ký" 
                description={error} 
                type="error" 
                showIcon 
                icon={<ExclamationCircleOutlined />}
              />
            </motion.div>
          )}
          
          <StepsContainer>
            <Steps current={currentStep} size="small">
              <Step title="Tài khoản" description="Thông tin cơ bản" />
              <Step title="Bảo mật" description="Mật khẩu" />
              <Step title="Cá nhân" description="Chi tiết" />
            </Steps>
          </StepsContainer>
          
          <Form
            form={form}
            name="register"
            layout="vertical"
            requiredMark={false}
            onFinish={handleSubmit}
            scrollToFirstError
            onFieldsChange={() => {
              // Cập nhật formValues thay vì completedFields trực tiếp
              setFormValues(form.getFieldsValue());
            }}
          >
            <motion.div variants={itemVariants}>
              <FormSectionTitle>
                <UserOutlined /> Thông tin tài khoản
              </FormSectionTitle>
            </motion.div>
            
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <motion.div variants={itemVariants}>
                  <FormFieldContainer>
                    <StyledFormItem
                      name="username"
                      label="Tên đăng nhập"
                      className={completedFields.username ? 'success-field' : ''}
                      rules={[
                        { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                        { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
                      ]}
                    >
                      <Input 
                        prefix={<UserOutlined />}
                        placeholder="Nhập tên đăng nhập"
                        size="large"
                        autoFocus
                      />
                    </StyledFormItem>
                    {completedFields.username && (
                      <SuccessBadge
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CheckCircleOutlined style={{ fontSize: 12 }} />
                      </SuccessBadge>
                    )}
                  </FormFieldContainer>
                </motion.div>
              </Col>
              
              <Col xs={24} sm={12}>
                <motion.div variants={itemVariants}>
                  <FormFieldContainer>
                    <StyledFormItem
                      name="email"
                      label="Email"
                      className={completedFields.email ? 'success-field' : ''}
                      rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                      ]}
                    >
                      <Input 
                        prefix={<MailOutlined />}
                        placeholder="example@email.com"
                        size="large"
                      />
                    </StyledFormItem>
                    {completedFields.email && (
                      <SuccessBadge
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CheckCircleOutlined style={{ fontSize: 12 }} />
                      </SuccessBadge>
                    )}
                  </FormFieldContainer>
                </motion.div>
              </Col>
            </Row>
            
            <motion.div variants={itemVariants}>
              <FormSectionTitle style={{ marginTop: 16 }}>
                <SafetyCertificateOutlined /> Bảo mật tài khoản
              </FormSectionTitle>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <FormFieldContainer>
                <StyledFormItem
                  name="password"
                  label="Mật khẩu"
                  className={completedFields.password ? 'success-field' : ''}
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu"
                    size="large"
                    iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    onChange={handlePasswordChange}
                  />
                </StyledFormItem>
                {completedFields.password && (
                  <SuccessBadge
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircleOutlined style={{ fontSize: 12 }} />
                  </SuccessBadge>
                )}
              </FormFieldContainer>
            </motion.div>
            
            {passwordStrength > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <PasswordStrengthBar>
                  <Space align="center" style={{ marginBottom: 4 }}>
                    <Text style={{ fontSize: 13 }}>Độ mạnh mật khẩu:</Text>
                    <Tag color={getPasswordStrengthColor()}>
                      {getPasswordStrengthText()}
                    </Tag>
                  </Space>
                  <Progress 
                    percent={passwordStrength} 
                    showInfo={false}
                    strokeColor={getPasswordStrengthColor()}
                    size="small"
                  />
                  
                  {passwordStrength <= 75 && (
                    <PasswordTips>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        <li>Sử dụng ít nhất 8 ký tự</li>
                        <li>Kết hợp chữ hoa và chữ thường</li>
                        <li>Thêm số và ký tự đặc biệt (!, @, #, $, ...)</li>
                      </ul>
                    </PasswordTips>
                  )}
                </PasswordStrengthBar>
              </motion.div>
            )}
            
            <motion.div variants={itemVariants}>
              <FormFieldContainer>
                <StyledFormItem
                  name="confirm"
                  label="Xác nhận mật khẩu"
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Xác nhận mật khẩu"
                    size="large"
                    iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </StyledFormItem>
              </FormFieldContainer>
            </motion.div>
            
            <StyledDivider orientation="center">Thông tin cá nhân</StyledDivider>
            
            <motion.div variants={itemVariants}>
              <FormFieldContainer>
                <StyledFormItem
                  name="fullName"
                  label="Họ và tên"
                  className={completedFields.fullName ? 'success-field' : ''}
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                  <Input 
                    prefix={<IdcardOutlined />}
                    placeholder="Nguyễn Văn A"
                    size="large"
                  />
                </StyledFormItem>
                {completedFields.fullName && (
                  <SuccessBadge
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircleOutlined style={{ fontSize: 12 }} />
                  </SuccessBadge>
                )}
              </FormFieldContainer>
            </motion.div>
            
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <motion.div variants={itemVariants}>
                  <FormFieldContainer>
                    <StyledFormItem
                      name="phone"
                      label="Số điện thoại"
                      className={completedFields.phone ? 'success-field' : ''}
                      rules={[
                        { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                      ]}
                    >
                      <Input 
                        prefix={<PhoneOutlined />}
                        placeholder="0912345678"
                        size="large"
                      />
                    </StyledFormItem>
                    {completedFields.phone && (
                      <SuccessBadge
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CheckCircleOutlined style={{ fontSize: 12 }} />
                      </SuccessBadge>
                    )}
                  </FormFieldContainer>
                </motion.div>
              </Col>
              
              <Col xs={24} sm={12}>
                <motion.div variants={itemVariants}>
                  <FormFieldContainer>
                    <StyledFormItem
                      name="address"
                      label="Địa chỉ"
                      className={completedFields.address ? 'success-field' : ''}
                    >
                      <Input 
                        prefix={<HomeOutlined />}
                        placeholder="Địa chỉ của bạn"
                        size="large"
                      />
                    </StyledFormItem>
                    {completedFields.address && (
                      <SuccessBadge
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CheckCircleOutlined style={{ fontSize: 12 }} />
                      </SuccessBadge>
                    )}
                  </FormFieldContainer>
                </motion.div>
              </Col>
            </Row>
            
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              style={{ marginTop: 40 }}
            >
              <Form.Item>
                <RegisterButton
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  icon={loading ? <LoadingOutlined /> : <RocketOutlined />}
                >
                  {loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
                </RegisterButton>
              </Form.Item>
            </motion.div>
          </Form>
          
          <motion.div
            variants={itemVariants}
            style={{ textAlign: 'center', marginTop: 24 }}
          >
            <Text type="secondary">
              Đã có tài khoản? <Link to="/login" style={{ fontWeight: 600 }}>Đăng nhập ngay</Link>
            </Text>
          </motion.div>
        </>
      )}
    </FormContainer>
  );
};

export default RegisterForm;