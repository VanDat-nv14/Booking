import React from 'react';
import { Container, Box, Paper, Typography } from '@mui/material';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const ForgotPasswordPage = () => {
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
            Quên Mật Khẩu
          </Typography>
          
          <ForgotPasswordForm />
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;