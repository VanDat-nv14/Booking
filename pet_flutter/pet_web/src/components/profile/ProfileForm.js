import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes, css } from 'styled-components';
import { 
  Form, 
  Input, 
  Button, 
  Avatar, 
  Row, 
  Col, 
  Card, 
  Typography, 
  Divider, 
  message, 
  Space,
  theme,
  Upload,
  Tooltip,
  Badge
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined,
  CameraOutlined,
  SaveOutlined,
  LoadingOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  LockOutlined,
  StarOutlined,
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  CloudUploadOutlined,
  CheckOutlined
} from '@ant-design/icons';
import axiosClient from '../../utils/axiosClient';
import { getUserFromToken } from '../../utils/tokenUtils';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { useToken } = theme;

// Enhanced Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(24, 144, 255, 0.2); }
  50% { box-shadow: 0 0 30px rgba(24, 144, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(24, 144, 255, 0.2); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.07); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
`;

const breathe = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const ripple = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.6); }
  70% { box-shadow: 0 0 0 20px rgba(24, 144, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const appear = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spotlight = keyframes`
  0% { background-position: -100% 0; }
  50% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
`;

// Luxury Styled Components
const ProfileContainer = styled(motion.div)`
  position: relative;
  overflow: visible;
`;

const LuxuryCard = styled(Card)`
  border-radius: 8px;
  overflow: visible;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  background: white;
  position: relative;
  
  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
  
  .ant-card-head {
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;
    position: relative;
    overflow: hidden;
    border-radius: 8px 8px 0 0;
  }
  
  .ant-card-body {
    padding: 24px;
  }
`;

const CardTitle = styled(Title)`
  font-weight: 600 !important;
  color: #262626 !important;
  display: inline-block !important;
  margin-bottom: 4px !important;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 30px;
    height: 2px;
    background: ${props => props.theme.colorPrimary};
    border-radius: 1px;
  }
`;

const AnimatedInput = styled(Input)`
  transition: all 0.3s ease;
  border-radius: 4px;
  height: 40px;
  border: 1px solid #d9d9d9;
  background: white;
  
  &:hover {
    border-color: ${props => props.theme.colorPrimary};
  }
  
  &.ant-input-affix-wrapper:focus,
  &.ant-input-affix-wrapper-focused {
    border-color: ${props => props.theme.colorPrimary};
    box-shadow: 0 0 0 2px ${props => props.theme.colorPrimary}20;
  }
  
  .anticon {
    color: rgba(0, 0, 0, 0.45);
    transition: all 0.3s ease;
    font-size: 16px;
  }
  
  &:hover .anticon {
    color: ${props => props.theme.colorPrimary};
  }
  
  input {
    font-size: 14px;
  }
`;

const AnimatedTextArea = styled(TextArea)`
  transition: all 0.3s ease;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: white;
  padding: 10px 12px;
  font-size: 14px;
  resize: none;
  
  &:hover {
    border-color: ${props => props.theme.colorPrimary};
  }
  
  &:focus {
    border-color: ${props => props.theme.colorPrimary};
    box-shadow: 0 0 0 2px ${props => props.theme.colorPrimary}20;
  }
`;

const LuxuryButton = styled(Button)`
  height: 40px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
  position: relative;
  background: ${props => props.theme.colorPrimary};
  box-shadow: 0 2px 5px ${props => props.theme.colorPrimary}30;
  color: white;
  
  &:hover {
    background: ${props => props.theme.colorPrimaryHover};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${props => props.theme.colorPrimary}40;
    color: white;
  }
  
  .anticon {
    font-size: 16px;
    margin-right: 8px;
  }
`;

const FormLabel = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  
  .label-icon {
    margin-right: 8px;
    color: ${props => props.theme.colorPrimary};
    background: ${props => props.theme.colorPrimary}10;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  
  &:hover .label-icon {
    background: ${props => props.theme.colorPrimary};
    color: white;
  }
`;

const FormItem = styled(Form.Item)`
  margin-bottom: 24px;
`;

const AvatarContainer = styled(motion.div)`
  position: relative;
  display: inline-block;
  margin-bottom: 30px;
  cursor: pointer;
  
  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    padding: 3px;
    background: ${props => props.theme.colorPrimary}50;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.8;
  }
  
  &:hover::before {
    opacity: 1;
    background: ${props => props.theme.colorPrimary};
  }
`;

const LuxuryAvatar = styled(Avatar)`
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const AvatarUploadButton = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: ${props => props.theme.colorPrimary};
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
  border: 2px solid white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .anticon {
    font-size: 16px;
  }
`;

const AvatarHint = styled(motion.div)`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  
  ${AvatarContainer}:hover & {
    opacity: 1;
    transform: translateX(-50%) translateY(-2px);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 4px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.75) transparent transparent transparent;
  }
`;

const ProfileNameTitle = styled(Title)`
  margin-top: 16px !important;
  margin-bottom: 4px !important;
  font-weight: 600 !important;
  color: #262626 !important;
  display: inline-block !important;
  position: relative;
`;

const InfoText = styled(Text)`
  background: #f9fafb;
  padding: 12px 16px;
  border-radius: 4px;
  border-left: 2px solid ${props => props.theme.colorInfo};
  font-size: 14px;
  display: block;
  margin: 12px 0 24px;
  transition: all 0.3s ease;
  color: rgba(0, 0, 0, 0.65);
  
  .anticon {
    margin-right: 8px;
    color: ${props => props.theme.colorInfo};
  }
`;

const FormStatus = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  background: ${props => props.success ? props.theme.colorSuccess + '10' : props.theme.colorError + '10'};
  color: ${props => props.success ? props.theme.colorSuccess : props.theme.colorError};
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 20px;
  border-left: 2px solid ${props => props.success ? props.theme.colorSuccess : props.theme.colorError};
  font-weight: 400;
  font-size: 14px;
  
  .status-icon {
    font-size: 16px;
  }
`;

const SectionDivider = styled(Divider)`
  margin: 16px 0 24px !important;
`;

const ProfileForm = ({ userProfile, onSubmit }) => {
  const { token } = useToken();
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const fileInputRef = useRef(null);
  const [formStatus, setFormStatus] = useState(null);

  // Theme variables for styled components
  const themeVariables = {
    colorPrimary: token.colorPrimary,
    colorPrimaryHover: token.colorPrimaryHover,
    colorPrimaryActive: token.colorPrimaryActive,
    colorSuccess: token.colorSuccess,
    colorError: token.colorError,
    colorInfo: token.colorInfo,
    colorBgContainer: token.colorBgTextHover,
    dividerColor: token.colorBorderSecondary,
    headerBg: token.colorBgElevated,
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }
    
    const baseUrl = process.env.REACT_APP_API_URL || 'https://localhost:7164';
    const formattedPath = avatarPath.startsWith('/') ? avatarPath : '/' + avatarPath;
    
    return `${baseUrl}${formattedPath}`;
  };

  useEffect(() => {
    if (userProfile) {
      form.setFieldsValue({
        fullName: userProfile.fullName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || ''
      });
      
      setAvatarPreview(getAvatarUrl(userProfile.avatar));
    }
  }, [userProfile, form]);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setFormStatus(null);
    
    try {
      const data = new FormData();
      
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          data.append(key, values[key]);
        }
      });
      
      if (avatar) {
        data.append('avatar', avatar);
      }
      
      if (userProfile && userProfile.role) {
        data.append('role', userProfile.role);
      }
      
      const updatedUserData = await onSubmit(data) || {};
      
      const userInfo = userProfile || getUserFromToken(token);
      const userToStore = {
        ...userInfo,
        role: userProfile?.role || userInfo.role
      };
      localStorage.setItem('user', JSON.stringify(userToStore));
      
      if (updatedUserData && updatedUserData.avatar) {
        setAvatarPreview(getAvatarUrl(updatedUserData.avatar));
      }
      
      setFormStatus({
        type: 'success',
        message: 'Thông tin cá nhân đã được cập nhật thành công!'
      });
      
      messageApi.success({
        content: (
          <Space>
            <CheckCircleFilled style={{ color: token.colorSuccess }} />
            <span>Cập nhật thông tin thành công</span>
          </Space>
        ),
        duration: 3
      });
      
      setAvatar(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      setFormStatus({
        type: 'error',
        message: error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.'
      });
      
      messageApi.error({
        content: error.message || 'Không thể cập nhật thông tin',
        duration: 3,
        icon: <CloseCircleOutlined style={{ color: token.colorError }} />
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let timer;
    if (formStatus) {
      timer = setTimeout(() => {
        setFormStatus(null);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [formStatus]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <ThemeProvider theme={themeVariables}>
      {contextHolder}
      <ProfileContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <LuxuryCard
          bordered={false}
          title={
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Space direction="vertical" size={4}>
                <CardTitle level={4} theme={themeVariables}>
                  Cập nhật thông tin
                </CardTitle>
                <Text type="secondary" style={{ fontSize: 15 }}>
                  Cập nhật hồ sơ cá nhân của bạn để trải nghiệm dịch vụ tốt hơn
                </Text>
              </Space>
            </motion.div>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="luxury-form"
          >
            <Row gutter={[30, 0]} justify="center">
              <Col xs={24} style={{ textAlign: 'center' }}>
                <AvatarContainer
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                  onClick={handleAvatarClick}
                  theme={themeVariables}
                >
                  <AvatarHint>
                    Nhấn để thay đổi ảnh đại diện
                  </AvatarHint>
                  
                  <Badge
                    count={
                      <Tooltip title="Thay đổi ảnh đại diện">
                        <AvatarUploadButton theme={themeVariables}>
                          <CameraOutlined />
                        </AvatarUploadButton>
                      </Tooltip>
                    }
                  >
                    <LuxuryAvatar
                      size={150}
                      src={avatarPreview}
                      theme={themeVariables}
                      style={{
                        fontSize: 50,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {!avatarPreview && getInitials(userProfile?.fullName || userProfile?.username || '')}
                    </LuxuryAvatar>
                  </Badge>
                </AvatarContainer>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                
                <ProfileNameTitle 
                  level={3} 
                  theme={themeVariables}
                >
                  {userProfile?.fullName || userProfile?.username}
                </ProfileNameTitle>
                
                <Text 
                  type="secondary"
                  style={{ 
                    fontSize: 15,
                    display: 'block',
                    marginBottom: 5
                  }}
                >
                  {userProfile?.email}
                </Text>
                
                {userProfile?.role === 'Admin' && (
                  <Badge 
                    count="Admin" 
                    style={{ 
                      backgroundColor: token.colorPrimary,
                      padding: '0 10px',
                      borderRadius: 10,
                      fontWeight: 600
                    }}
                  />
                )}
                
                <InfoText theme={themeVariables}>
                  <InfoCircleOutlined /> Cập nhật thông tin cá nhân đầy đủ để nhận được dịch vụ tốt nhất từ chúng tôi
                </InfoText>
              </Col>
              
              <Col xs={24}>
                <SectionDivider theme={themeVariables} />
              </Col>
              
              <Col xs={24}>
                <FormItem 
                  name="fullName" 
                  required
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ tên' },
                    { min: 2, message: 'Họ tên phải từ 2 ký tự trở lên' }
                  ]}
                >
                  <div>
                    <FormLabel theme={themeVariables}>
                      <span className="label-icon"><UserOutlined /></span>
                      Họ và tên
                    </FormLabel>
                    <AnimatedInput
                      prefix={<UserOutlined />}
                      placeholder="Nhập họ và tên của bạn"
                      size="large"
                      theme={themeVariables}
                    />
                  </div>
                </FormItem>
              </Col>
              
              <Col xs={24} md={12}>
                <FormItem 
                  name="email" 
                  required
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' }
                  ]}
                >
                  <div>
                    <FormLabel theme={themeVariables}>
                      <span className="label-icon"><MailOutlined /></span>
                      Email
                    </FormLabel>
                    <AnimatedInput
                      prefix={<MailOutlined />}
                      placeholder="example@email.com"
                      size="large"
                      theme={themeVariables}
                    />
                  </div>
                </FormItem>
              </Col>
              
              <Col xs={24} md={12}>
                <FormItem 
                  name="phone"
                  rules={[
                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                  ]}
                >
                  <div>
                    <FormLabel theme={themeVariables}>
                      <span className="label-icon"><PhoneOutlined /></span>
                      Số điện thoại
                    </FormLabel>
                    <AnimatedInput
                      prefix={<PhoneOutlined />}
                      placeholder="Nhập số điện thoại"
                      size="large"
                      theme={themeVariables}
                    />
                  </div>
                </FormItem>
              </Col>
              
              <Col xs={24}>
                <FormItem name="address">
                  <div>
                    <FormLabel theme={themeVariables}>
                      <span className="label-icon"><HomeOutlined /></span>
                      Địa chỉ
                    </FormLabel>
                    <AnimatedTextArea
                      placeholder="Nhập địa chỉ của bạn"
                      autoSize={{ minRows: 3, maxRows: 5 }}
                      theme={themeVariables}
                    />
                  </div>
                </FormItem>
              </Col>
              
              <Col xs={24}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LuxuryButton
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={isSubmitting}
                    icon={isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
                    theme={themeVariables}
                  >
                    {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                  </LuxuryButton>
                </motion.div>
              </Col>
              
              {formStatus && (
                <Col xs={24}>
                  <FormStatus 
                    success={formStatus.type === 'success'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    theme={themeVariables}
                  >
                    <span className="status-icon">
                      {formStatus.type === 'success' ? 
                        <CheckCircleFilled /> : 
                        <CloseCircleOutlined />
                      }
                    </span>
                    {formStatus.message}
                  </FormStatus>
                </Col>
              )}
            </Row>
          </Form>
        </LuxuryCard>
      </ProfileContainer>
    </ThemeProvider>
  );
};

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

export default ProfileForm;