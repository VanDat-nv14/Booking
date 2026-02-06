import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { 
  Form, 
  Input, 
  Button, 
  Alert, 
  Typography, 
  Space,
  Checkbox,
  Spin,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  EyeTwoTone, 
  EyeInvisibleOutlined,
  LoginOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  LoadingOutlined,
  GoogleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axiosClient from '../../utils/axiosClient';

const { Title, Text } = Typography;

// Styled components
const FormContainer = styled(motion.div)`
  width: 100%;
  position: relative;
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

const LoginButton = styled(Button)`
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

const ForgotPasswordLink = styled(Text)`
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  padding-bottom: 2px;
  font-weight: 500;
  
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
    
    &:after {
      width: 100%;
    }
  }
`;

const StyledAlert = styled(Alert)`
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.2);
`;

const StyledCheckbox = styled(Checkbox)`
  .ant-checkbox-inner {
    border-radius: 4px;
    border-color: #d9d9d9;
    transition: all 0.3s;
    
    &:hover {
      border-color: #1890ff;
    }
  }
  
  .ant-checkbox-checked .ant-checkbox-inner {
    background-color: #1890ff;
    border-color: #1890ff;
  }
`;

const SpinnerIcon = styled(LoadingOutlined)`
  font-size: 24px;
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

// Thêm style mới cho phần đăng nhập Google
const GoogleContainer = styled.div`
  margin-top: 20px;
  text-align: center;
  
  .google-button-container {
    margin-top: 15px;
    display: flex;
    justify-content: center;
  }
`;

const LoginForm = () => {
  const { login, externalLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [effectPosition, setEffectPosition] = useState({ x: 0, y: 0 });
  
  const handleSubmit = async (values) => {
    setError('');
    setLoading(true);
    
    try {
      console.log('Attempting login with username/email:', values.username);
      
      const result = await login(values.username, values.password);
      
      // Hiển thị hiệu ứng thành công trước khi chuyển hướng
      setSuccess(true);
      
      // Log chi tiết kết quả đăng nhập
      console.log('Login successful!');
      console.log('User data:', result.user);
      console.log('User role:', result.user?.role);
      console.log('Token exists:', !!result.token);

      // Đặt thời gian chờ ngắn để hiển thị hiệu ứng thành công
      setTimeout(() => {
        // Lấy trang đích từ state (được truyền từ ProtectedRoute)
        const from = location.state?.from?.pathname || '/';
        
        // Kiểm tra vai trò người dùng và chuyển hướng tương ứng
        if (result.user && result.user.role === 'Admin') {
          console.log('User is Admin, redirecting to /admin');
          navigate('/admin');
        } else {
          console.log('User is not Admin, redirecting to:', from);
          navigate(from, { replace: true });
        }
      }, 800);
      
    } catch (err) {
      console.error('Login failed:', err);
      let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.';
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        errorMessage = err.response.data?.message || err.response.data || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Thêm hàm xử lý đăng nhập Google
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      
      // Giải mã token để lấy thông tin
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Google user info:", decoded);
      
      // Gọi API đăng nhập bên ngoài
      const response = await axiosClient.post('/Auth/external-login', {
        provider: 'Google',
        idToken: credentialResponse.credential,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      });
      
      // Hoặc dùng hook externalLogin nếu đã cập nhật
      // const result = await externalLogin({
      //   provider: 'Google',
      //   idToken: credentialResponse.credential,
      //   email: decoded.email,
      //   name: decoded.name,
      //   picture: decoded.picture
      // });
      
      // Lưu token và thông tin người dùng
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Hiển thị thành công
      setSuccess(true);
      
      // Điều hướng dựa vào vai trò
      setTimeout(() => {
        // Lấy trang đích từ state (được truyền từ ProtectedRoute)
        const from = location.state?.from?.pathname || '/';
        
        if (response.data.user && response.data.user.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate(from, { replace: true });
        }
      }, 800);
      
    } catch (err) {
      console.error('Google login failed:', err);
      let errorMessage = 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.';
      
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.data || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
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

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.03,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.97 },
    success: {
      backgroundColor: "#52c41a",
      transition: { duration: 0.3 }
    }
  };

  const successVariants = {
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

  const errorVariants = {
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
      
      <AnimatePresence>
        {error && (
          <motion.div
            key="error-alert"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <StyledAlert 
              message="Lỗi đăng nhập" 
              description={error} 
              type="error" 
              showIcon 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {success ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={successVariants}
          style={{ 
            textAlign: 'center', 
            padding: '20px 0',
            color: '#52c41a'
          }}
        >
          <SafetyOutlined style={{ fontSize: 60, marginBottom: 16 }} />
          <Title level={4} style={{ color: '#52c41a' }}>Đăng nhập thành công!</Title>
          <Text>Đang chuyển hướng đến trang chủ...</Text>
          <Spin 
            indicator={<SpinnerIcon />} 
            style={{ marginTop: 20 }}
          />
        </motion.div>
      ) : (
        <>
          <Form
            form={form}
            name="login"
            initialValues={{ remember: true }}
            onFinish={handleSubmit}
            layout="vertical"
            requiredMark={false}
            size="large"
          >
            <motion.div custom={1} variants={formVariants}>
              <StyledFormItem
                name="username"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập hoặc email!' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  placeholder="Tên đăng nhập hoặc Email"
                  autoFocus
                  disabled={loading}
                  autoComplete="username email"
                />
              </StyledFormItem>
            </motion.div>
            
            <motion.div custom={2} variants={formVariants}>
              <StyledFormItem
                name="password"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu"
                  iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  disabled={loading}
                  autoComplete="current-password"
                />
              </StyledFormItem>
            </motion.div>
            
            <motion.div custom={3} variants={formVariants}>
              <Form.Item style={{ marginBottom: '16px' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <StyledCheckbox name="remember">Ghi nhớ đăng nhập</StyledCheckbox>
                  <ForgotPasswordLink onClick={handleForgotPassword}>
                    Quên mật khẩu?
                  </ForgotPasswordLink>
                </Space>
              </Form.Item>
            </motion.div>
            
            <motion.div 
              custom={4} 
              variants={formVariants}
              style={{ marginTop: '28px' }}
            >
              <Form.Item>
                <motion.div
                  variants={buttonVariants}
                  initial="rest"
                  whileHover={!loading ? "hover" : "rest"}
                  whileTap={!loading ? "tap" : "rest"}
                  animate={loading ? "rest" : "rest"}
                >
                  <LoginButton
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    icon={loading ? <ThunderboltOutlined spin /> : <LoginOutlined />}
                    disabled={loading}
                  >
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                  </LoginButton>
                </motion.div>
              </Form.Item>
            </motion.div>
          </Form>
          
          <motion.div custom={5} variants={formVariants}>
            <GoogleContainer>
              <Divider>Hoặc đăng nhập với</Divider>
              <div className="google-button-container">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="filled_blue"
                  shape="circle"
                  text="signin_with"
                  locale="vi"
                />
              </div>
            </GoogleContainer>
          </motion.div>
        </>
      )}
    </FormContainer>
  );
};

export default LoginForm;