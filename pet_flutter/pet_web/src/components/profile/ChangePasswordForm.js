import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Divider, 
  message, 
  notification,
  Progress,
  Space,
  Alert,
  Row,
  Col,
  theme
} from 'antd';
import { 
  LockOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined, 
  KeyOutlined,
  SafetyOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
  SecurityScanOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
  CheckOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  SafetyCertificateOutlined,
  LockFilled
} from '@ant-design/icons';
import { changePassword } from '../../services/userService';

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

// Animations
const glow = keyframes`
  0% { box-shadow: 0 0 10px rgba(24, 144, 255, 0.3); }
  50% { box-shadow: 0 0 20px rgba(24, 144, 255, 0.6); }
  100% { box-shadow: 0 0 10px rgba(24, 144, 255, 0.3); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fadeInUp = keyframes`
  from { 
    opacity: 0;
    transform: translateY(10px); 
  }
  to { 
    opacity: 1;
    transform: translateY(0); 
  }
`;

// Styled Components
const FormContainer = styled.div`
  position: relative;
`;

const StyledCard = styled(Card)`
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
  background: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  
  .ant-card-head {
    background: ${props => props.theme.headerBg};
    border-bottom: 1px solid ${props => props.theme.dividerColor};
    padding: 16px 24px;
  }
  
  .ant-card-body {
    padding: 0;
  }
`;

const CardHeader = styled.div`
  position: relative;
  padding: 28px 32px;
  background: linear-gradient(135deg, ${props => props.theme.primaryLight || '#e6f7ff'}, ${props => props.theme.primary || '#1890ff'} 95%);
  color: white;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.2;
  }
`;

const ShieldGlow = styled.div`
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  
  &::after {
    content: '';
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
  }
`;

const StyledInput = styled(Input.Password)`
  border-radius: 8px;
  height: 50px;
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
  background: #f9fafb;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
    border-color: ${props => props.theme.primary || '#1890ff'};
  }
  
  &.ant-input-affix-wrapper-focused {
    box-shadow: 0 3px 15px rgba(24, 144, 255, 0.15);
    transform: translateY(-2px);
    background: white;
    border-color: ${props => props.theme.primary || '#1890ff'};
  }
  
  .anticon {
    color: ${props => props.theme.iconColor || 'rgba(0, 0, 0, 0.45)'};
    transition: all 0.3s ease;
    font-size: 16px;
  }
  
  &:hover .anticon {
    color: ${props => props.theme.primary || '#1890ff'};
  }
  
  .ant-input {
    font-size: 15px;
    background: transparent;
  }
`;

const SubmitButton = styled(Button)`
  height: 50px;
  border-radius: 10px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
  background: ${props => props.theme.primary || '#1890ff'};
  border: none;
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.25);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(24, 144, 255, 0.35);
    background: ${props => `${props.theme.primary}f0` || '#1890ffe0'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.2), 
      transparent
    );
    transform: rotate(45deg);
    transition: all 0.5s ease-in-out;
  }
  
  &:hover::before {
    animation: ${shimmer} 1.5s infinite;
  }
`;

const PasswordStrengthContainer = styled.div`
  margin-top: 15px;
  margin-bottom: 24px;
  animation: ${fadeInUp} 0.5s ease-out;
`;

const PasswordStrengthLabel = styled(Text)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  
  .strength-text {
    color: ${props => props.colorCode || '#1890ff'};
    font-weight: 600;
    transition: color 0.3s ease;
  }
  
  .strength-icon {
    animation: ${float} 2s infinite ease-in-out;
  }
`;

const StyledProgress = styled(Progress)`
  .ant-progress-inner {
    background-color: #f0f0f0;
    overflow: hidden;
  }
  
  .ant-progress-bg {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
`;

const CriteriaList = styled.div`
  margin-top: 12px;
  padding: 15px;
  background-color: #f9fafb;
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  
  &:hover {
    background-color: #f0f7ff;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
`;

const PasswordCriteria = styled.div`
  display: flex;
  align-items: center;
  margin: 6px 0;
  
  .criteria-icon {
    margin-right: 10px;
    color: ${props => props.isMet ? props.theme.success || '#52c41a' : props.theme.textSecondary || 'rgba(0, 0, 0, 0.45)'};
    transition: all 0.3s ease;
    font-size: 16px;
  }
  
  .criteria-text {
    color: ${props => props.isMet ? props.theme.textPrimary || 'rgba(0, 0, 0, 0.85)' : props.theme.textSecondary || 'rgba(0, 0, 0, 0.45)'};
    font-size: 14px;
    transition: all 0.3s ease;
  }
  
  &:hover .criteria-icon {
    transform: scale(1.2);
  }
`;

const StyledDivider = styled(Divider)`
  position: relative;
  margin: 24px 0;
  opacity: 0.8;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    width: 40px;
    height: 3px;
    background: ${props => props.theme.primary || '#1890ff'};
    border-radius: 3px;
    bottom: -1px;
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 80px;
  }
`;

const FormItem = styled(Form.Item)`
  margin-bottom: 24px;
  
  .ant-form-item-label {
    padding-bottom: 8px;
  }
  
  .ant-form-item-label > label {
    font-weight: 500;
    font-size: 15px;
    color: ${props => props.theme.labelColor || 'rgba(0, 0, 0, 0.85)'};
  }
  
  .ant-form-item-explain {
    margin-top: 6px;
    font-size: 13px;
  }
`;

const StyledAlert = styled(Alert)`
  margin-bottom: 24px;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  animation: ${pulse} 2s infinite ease-in-out;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: none;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: ${shimmer} 2s infinite;
  }
  
  .ant-alert-message {
    font-weight: 500;
  }
`;

const RotatingIcon = styled.span`
  display: inline-block;
  animation: ${rotate} 2s linear infinite;
`;

const ShieldIcon = styled(SecurityScanOutlined)`
  font-size: 32px;
  margin-right: 16px;
  color: white;
  animation: ${float} 3s infinite ease-in-out;
`;

const HeaderTitle = styled(Title)`
  margin-bottom: 4px !important;
  color: white !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  font-weight: 600 !important;
  font-size: 24px !important;
  
  .title-icon {
    margin-right: 8px;
    display: inline-flex;
    align-items: center;
  }
`;

const FormCard = styled.div`
  padding: 32px;
  background: white;
`;

const ChangePasswordForm = ({ userId, onSuccess }) => {
  const { token } = useToken();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [showCriteria, setShowCriteria] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [submitStatus, setSubmitStatus] = useState({ error: '', success: '' });

  // Theme variables for styled components
  const themeVariables = {
    primary: token.colorPrimary,
    primaryLight: token.colorPrimaryBg,
    success: token.colorSuccess,
    error: token.colorError,
    warning: token.colorWarning,
    dividerColor: token.colorBorderSecondary,
    textPrimary: token.colorText,
    textSecondary: token.colorTextSecondary,
    labelColor: token.colorTextLabel,
    headerBg: token.colorBgElevated,
    cardBg: token.colorBgContainer,
    iconColor: token.colorTextTertiary,
  };

  // Effect to focus on the first field on mount
  useEffect(() => {
    setTimeout(() => {
      const firstInput = document.querySelector('.current-password input');
      if (firstInput) {
        firstInput.focus();
      }
    }, 500);
  }, []);

  // Password strength evaluation
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: 'Chưa nhập', color: token.colorTextSecondary };
    
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    const criteriaList = [
      { met: hasLowerCase, text: 'Chữ cái thường (a-z)' },
      { met: hasUpperCase, text: 'Chữ cái hoa (A-Z)' },
      { met: hasDigit, text: 'Số (0-9)' },
      { met: hasSpecial, text: 'Ký tự đặc biệt (@#$...)' },
      { met: password.length >= 8, text: 'Ít nhất 8 ký tự' }
    ];
    
    const metCount = criteriaList.filter(c => c.met).length;
    
    // Calculate strength
    if (password.length < 6) {
      return { 
        strength: 1, 
        text: 'Yếu', 
        color: token.colorError,
        percent: 20,
        criteriaList
      };
    }
    
    if (password.length < 8 || metCount < 3) {
      return { 
        strength: 2, 
        text: 'Trung bình', 
        color: token.colorWarning,
        percent: 50,
        criteriaList
      };
    }
    
    if (metCount >= 4) {
      return { 
        strength: 4, 
        text: 'Mạnh', 
        color: token.colorSuccess,
        percent: 100,
        criteriaList
      };
    }
    
    return { 
      strength: 3, 
      text: 'Khá', 
      color: token.colorInfo,
      percent: 75,
      criteriaList
    };
  };

  const passwordStrength = getPasswordStrength(passwordValue);

  // Validation rules
  const currentPasswordRules = [
    { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }
  ];
  
  const newPasswordRules = [
    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
  ];
  
  const confirmPasswordRules = [
    { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue('newPassword') === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
      },
    }),
  ];

  // Handle password change for strength meter
  const handlePasswordChange = (e) => {
    setPasswordValue(e.target.value);
    setShowCriteria(e.target.value.length > 0);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setSubmitStatus({ error: '', success: '' });
    
    try {
      const success = await changePassword(userId, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      
      if (success) {
        setSubmitStatus({ error: '', success: 'Đổi mật khẩu thành công!' });
        
        // Reset form
        form.resetFields();
        setPasswordValue('');
        setShowCriteria(false);
        
        // Show success notification
        notification.success({
          message: 'Đổi mật khẩu thành công',
          description: 'Mật khẩu của bạn đã được cập nhật. Bạn sẽ sử dụng mật khẩu mới trong lần đăng nhập tiếp theo.',
          icon: <CheckCircleFilled style={{ color: token.colorSuccess }} />,
          placement: 'bottomRight',
          duration: 5
        });
        
        if (onSuccess) onSuccess(true);
        
        // Show floating message
        messageApi.success({
          content: (
            <Space>
              <CheckCircleFilled style={{ color: token.colorSuccess }} />
              <span>Đổi mật khẩu thành công!</span>
            </Space>
          ),
          duration: 3
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setSubmitStatus({ 
        error: error.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.', 
        success: '' 
      });
      
      // Show error notification
      notification.error({
        message: 'Đổi mật khẩu thất bại',
        description: error.message || 'Vui lòng kiểm tra lại mật khẩu hiện tại và thử lại.',
        icon: <CloseCircleOutlined style={{ color: token.colorError }} />,
        placement: 'bottomRight',
        duration: 5
      });
      
      if (onSuccess) onSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const criteriaVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <ThemeProvider theme={themeVariables}>
      {contextHolder}
      <FormContainer>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          <StyledCard
            bordered={false}
            bodyStyle={{ padding: 0 }}
          >
            {/* Card Header */}
            <CardHeader>
              <ShieldGlow>
                <LockFilled style={{ fontSize: 36, color: 'rgba(255, 255, 255, 0.5)' }} />
              </ShieldGlow>
              <Row align="middle">
                <Col>
                  <ShieldIcon />
                </Col>
                <Col flex="1">
                  <HeaderTitle level={4}>
                    Đổi mật khẩu
                  </HeaderTitle>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: 8, display: 'block', fontSize: 15 }}>
                    Tăng cường bảo mật cho tài khoản của bạn với mật khẩu mạnh
                  </Text>
                </Col>
              </Row>
            </CardHeader>

            {/* Card Body */}
            <FormCard>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
              >
                {/* Hiển thị thông báo lỗi hoặc thành công */}
                <AnimatePresence mode="wait">
                  {submitStatus.error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <StyledAlert
                        type="error"
                        message={submitStatus.error}
                        icon={<ExclamationCircleOutlined />}
                        showIcon
                      />
                    </motion.div>
                  )}
                  
                  {submitStatus.success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <StyledAlert
                        type="success"
                        message={submitStatus.success}
                        icon={<CheckCircleFilled />}
                        showIcon
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mật khẩu hiện tại */}
                <motion.div variants={itemVariants}>
                  <FormItem
                    label="Mật khẩu hiện tại"
                    name="currentPassword"
                    rules={currentPasswordRules}
                  >
                    <StyledInput
                      className="current-password"
                      prefix={<KeyOutlined />}
                      placeholder="Nhập mật khẩu hiện tại của bạn"
                      iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                      size="large"
                    />
                  </FormItem>
                </motion.div>

                <StyledDivider />

                {/* Mật khẩu mới */}
                <motion.div variants={itemVariants}>
                  <FormItem
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={newPasswordRules}
                    help={passwordValue ? null : null}
                  >
                    <StyledInput
                      prefix={<LockOutlined />}
                      placeholder="Tạo mật khẩu mới"
                      iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                      onChange={handlePasswordChange}
                      size="large"
                    />
                  </FormItem>
                </motion.div>

                {/* Hiển thị độ mạnh mật khẩu */}
                <AnimatePresence>
                  {passwordValue && (
                    <motion.div
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <PasswordStrengthContainer>
                        <PasswordStrengthLabel colorCode={passwordStrength.color}>
                          <span>Độ mạnh mật khẩu</span>
                          <span className="strength-text">
                            {passwordStrength.text}
                            <SafetyOutlined className="strength-icon" style={{ marginLeft: 5 }} />
                          </span>
                        </PasswordStrengthLabel>
                        <StyledProgress 
                          percent={passwordStrength.percent} 
                          showInfo={false}
                          strokeColor={passwordStrength.color}
                          size="small"
                          style={{ marginBottom: 15 }}
                        />
                        
                        {/* Criteria list */}
                        <AnimatePresence>
                          {showCriteria && (
                            <motion.div
                              variants={criteriaVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              <CriteriaList>
                                {passwordStrength.criteriaList.map((criteria, index) => (
                                  <PasswordCriteria key={index} isMet={criteria.met} theme={themeVariables}>
                                    <span className="criteria-icon">
                                      {criteria.met ? 
                                        <CheckCircleFilled style={{ color: themeVariables.success }} /> : 
                                        <InfoCircleOutlined />
                                      }
                                    </span>
                                    <Text className="criteria-text">{criteria.text}</Text>
                                  </PasswordCriteria>
                                ))}
                              </CriteriaList>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </PasswordStrengthContainer>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Xác nhận mật khẩu mới */}
                <motion.div variants={itemVariants}>
                  <FormItem
                    label="Xác nhận mật khẩu mới"
                    name="confirmPassword"
                    rules={confirmPasswordRules}
                    dependencies={['newPassword']}
                  >
                    <StyledInput
                      prefix={<SafetyOutlined />}
                      placeholder="Nhập lại mật khẩu mới"
                      iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                      size="large"
                    />
                  </FormItem>
                </motion.div>

                {/* Button Submit */}
                <motion.div 
                  variants={itemVariants}
                  style={{ marginTop: 40 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SubmitButton
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={isSubmitting}
                    icon={
                      isSubmitting ? 
                        <RotatingIcon><SyncOutlined /></RotatingIcon> : 
                        <SafetyCertificateOutlined />
                    }
                  >
                    {isSubmitting ? 'Đang cập nhật mật khẩu...' : 'Đổi mật khẩu'}
                  </SubmitButton>
                </motion.div>
              </Form>
            </FormCard>
          </StyledCard>
        </motion.div>
      </FormContainer>
    </ThemeProvider>
  );
};

// ThemeProvider component để làm việc với styled-components
const ThemeProvider = ({ theme, children }) => {
  return (
    <div className="theme-provider" data-theme={JSON.stringify(theme)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { theme });
        }
        return child;
      })}
    </div>
  );
};

export default ChangePasswordForm;