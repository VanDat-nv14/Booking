import React from 'react';
import { Container, Box, Paper, Typography } from '@mui/material';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

const ResetPasswordPage = () => {
  return (
    <Container maxWidth="xs">
      <Box 
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography 
            component="h1" 
            variant="h5"
            sx={{ mb: 2 }}
          >
            Đặt Lại Mật Khẩu
          </Typography>
          
          <ResetPasswordForm />
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;