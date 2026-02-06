import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Alert, 
  Typography, 
  Tabs, 
  Space,
  Spin,
  message,
  Upload,
  Card,
  Row,
  Col,
  Radio
} from 'antd';
import { 
  MailOutlined, 
  SendOutlined, 
  KeyOutlined, 
  RollbackOutlined,
  SafetyOutlined,
  LoadingOutlined,
  EditOutlined,
  CheckCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import useAuth from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Styled components
const FormContainer = styled(motion.div)`
  width: 100%;
  position: relative;
  max-width: 450px;
  margin: 0 auto;
`;

const StyledFormItem = styled(Form.Item)`
  margin-bottom: 24px;
  
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
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
      transform: translateY(-2px);
    }
  }
  
  .ant-input-prefix {
    margin-right: 12px;
    color: #bfbfbf;
    font-size: 18px;
  }
`;

const ResetButton = styled(Button)`
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

const BackButton = styled(Button)`
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  padding-bottom: 2px;
  font-weight: 500;
  border: none;
  box-shadow: none;
  
  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 1px;
    bottom: 0;
    left: 0;
    background-color: #1890ff;
    transition: width 0.3s ease;
  }
  
  &:hover {
    color: #1890ff;
    background: transparent;
    
    &:after {
      width: 100%;
    }
  }
`;

const StyledAlert = styled(Alert)`
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 24px;
  }
  
  .ant-tabs-tab {
    padding: 12px 16px;
    font-size: 15px;
    transition: all 0.3s ease;
    
    &:hover {
      color: #1890ff;
    }
  }
  
  .ant-tabs-tab-active {
    font-weight: 600;
  }
  
  .ant-tabs-ink-bar {
    height: 3px;
    background: linear-gradient(90deg, #1890ff, #52c41a);
  }
`;

const TabDescription = styled(Text)`
  display: block;
  text-align: center;
  margin-bottom: 24px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
`;

const SpinnerIcon = styled(LoadingOutlined)`
  font-size: 24px;
`;

const HeaderContainer = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const LogoContainer = styled(motion.div)`
  background: linear-gradient(135deg, #1890ff 0%, #52c41a 100%);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 20px rgba(24, 144, 255, 0.3);
  color: white;
  font-size: 32px;
`;

const FormEffect = styled(motion.div)`
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0) 70%);
  z-index: -1;
  pointer-events: none;
`;

const UploadPreviewContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

const Progress = styled.div`
  width: 100%;
  height: 10px;
  background-color: #e8e8e8;
  border-radius: 5px;
  overflow: hidden;
  margin-left: 12px;
  
  & > div {
    height: 100%;
    background-color: ${({ percent }) => {
      if (percent < 30) return '#1890ff';
      if (percent < 70) return '#52c41a';
      return '#ff4d4f';
    }};
    transition: width 0.3s ease;
  }
`;

const ForgotPasswordForm = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMethod, setResetMethod] = useState('email');
  const [effectPosition, setEffectPosition] = useState({ x: 0, y: 0 });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchText, setSearchText] = useState('');

  const navigate = useNavigate();
  const { forgotPassword, sendOtp } = useAuth();

  const handleSubmit = async (values) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (resetMethod === 'email') {
        const response = await forgotPassword(values.email);
        setSuccess(response.message || 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const response = await sendOtp(values.email);
        setSuccess(response.message || 'Mã OTP đã được gửi đến email của bạn');
        
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(values.email)}`);
        }, 1500);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message 
        || err.message 
        || 'Không thể gửi yêu cầu đặt lại mật khẩu';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setResetMethod(key);
    setError('');
    setSuccess('');
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

  const handleFileChange = info => {
    const { status } = info.file;
    
    if (status === 'uploading') {
      setUploadProgress(70);
      setFileList(info.fileList);
      return;
    }
    
    if (status === 'done') {
      setUploadProgress(100);
      message.success(`${info.file.name} được tải lên thành công!`);
      setFileList(info.fileList);
    } else if (status === 'error') {
      setUploadProgress(0);
      message.error(`${info.file.name} tải lên thất bại.`);
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    })
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
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
  
  const alertVariants = {
    hidden: { opacity: 0, y: -20, height: 0 },
    visible: { 
      opacity: 1, 
      y: 0, 
      height: 'auto',
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      height: 0,
      transition: { duration: 0.2 }
    }
  };

  const filteredPets = fileList.filter(pet => {
    const matchesType = filterType === 'all' || 
                        (filterType === 'dog' && pet.originFileObj && pet.originFileObj.type === 'image/jpeg') ||
                        (filterType === 'cat' && pet.originFileObj && pet.originFileObj.type === 'image/png');
                        
    const matchesSearch = !searchText || 
                          pet.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          pet.breed.toLowerCase().includes(searchText.toLowerCase());
                          
    return matchesType && matchesSearch;
  });

  return (
    <FormContainer
      initial="hidden"
      animate="visible"
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
              left: effectPosition.x - 100, 
              top: effectPosition.y - 100
            }}
          />
        )}
      </AnimatePresence>
      
      <HeaderContainer>
        <LogoContainer
          variants={logoVariants}
          initial="hidden"
          animate="visible"
        >
          <SafetyOutlined />
        </LogoContainer>
        <motion.div custom={1} variants={formVariants}>
          <Title level={2} style={{ marginBottom: 8 }}>Đặt Lại Mật Khẩu</Title>
        </motion.div>
        <motion.div custom={2} variants={formVariants}>
          <Text type="secondary">
            Hãy nhập email của bạn để khôi phục tài khoản
          </Text>
        </motion.div>
      </HeaderContainer>
      
      <motion.div custom={3} variants={formVariants}>
        <StyledTabs 
          activeKey={resetMethod} 
          onChange={handleTabChange}
          centered
        >
          <TabPane 
            tab={
              <span>
                <MailOutlined /> Qua Email
              </span>
            } 
            key="email"
          >
            <TabDescription>
              Chúng tôi sẽ gửi email với liên kết đặt lại mật khẩu cho bạn
            </TabDescription>
          </TabPane>
          
        </StyledTabs>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            key="error-alert"
            variants={alertVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <StyledAlert 
              message="Lỗi" 
              description={error} 
              type="error" 
              showIcon 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div
            key="success-alert"
            variants={alertVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <StyledAlert 
              message="Thành công" 
              description={success} 
              type="success" 
              showIcon 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Form
        name="forgot-password-form"
        onFinish={handleSubmit}
        layout="vertical"
        requiredMark={false}
        size="large"
      >
        <motion.div custom={4} variants={formVariants}>
          <StyledFormItem
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email của bạn!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Nhập email của bạn"
              disabled={loading}
              autoComplete="email"
            />
          </StyledFormItem>
        </motion.div>

        <motion.div custom={5} variants={formVariants} style={{ marginTop: 32 }}>
          <Form.Item>
            <ResetButton
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={loading ? <LoadingOutlined /> : (resetMethod === 'email' ? <SendOutlined /> : <KeyOutlined />)}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (resetMethod === 'email' ? 'Gửi Liên Kết Đặt Lại' : 'Gửi Mã OTP')}
            </ResetButton>
          </Form.Item>
        </motion.div>
      </Form>

      <motion.div custom={6} variants={formVariants} style={{ textAlign: 'center', marginTop: 24 }}>
        <BackButton 
          type="link" 
          icon={<RollbackOutlined />} 
          onClick={() => navigate('/login')}
        >
          Quay lại đăng nhập
        </BackButton>
      </motion.div>
    </FormContainer>
  );
};

export default ForgotPasswordForm;