import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Box, 
  Alert, 
  CircularProgress,
  Typography,
  Link
} from '@mui/material';
import useAuth from '../../hooks/useAuth';

const OtpVerificationForm = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();

  React.useEffect(() => {
    // Lấy email từ URL
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Gọi hàm xác thực OTP từ context
      const response = await verifyOtp(email, otp);
      
      // Hiển thị thông báo thành công từ server
      setSuccess(response.message || 'Xác thực OTP thành công');
      
      // Chuyển hướng đến trang đặt lại mật khẩu với OTP
      setTimeout(() => {
        navigate(`/reset-password-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
      }, 1500);
    } catch (err) {
      // Xử lý lỗi
      const errorMsg = err.response?.data?.message 
        || err.message 
        || 'Không thể xác thực mã OTP';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const { sendOtp } = useAuth();
      await sendOtp(email);
      setSuccess('Đã gửi lại mã OTP mới đến email của bạn');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể gửi lại mã OTP';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ width: '100%' }}
    >
      <Typography variant="h5" component="h1" gutterBottom textAlign="center">
        Xác thực mã OTP
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
        required
        variant="outlined"
        placeholder="example@email.com"
        InputProps={{
          readOnly: !!location.search
        }}
      />

      <TextField
        label="Mã OTP"
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        fullWidth
        margin="normal"
        required
        autoFocus
        variant="outlined"
        placeholder="Nhập mã 6 số từ email"
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        sx={{ mt: 2, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Xác thực OTP'}
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Link 
          component="button" 
          variant="body2"
          onClick={() => navigate('/login')}
          sx={{ cursor: 'pointer' }}
        >
          Quay lại đăng nhập
        </Link>
        
        <Link 
          component="button" 
          variant="body2"
          onClick={handleResendOtp}
          sx={{ cursor: 'pointer' }}
          disabled={loading}
        >
          Gửi lại mã OTP
        </Link>
      </Box>
    </Box>
  );
};

export default OtpVerificationForm;