import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// AdminRoute chỉ làm nhiệm vụ xác thực và bảo vệ routes
const AdminRoute = ({ children }) => {
  const auth = useAuth();
  const user = auth?.user;
  const loading = auth?.loading;

  useEffect(() => {
    console.log('AdminRoute - User:', user);
    console.log('AdminRoute - Loading:', loading);
    console.log('AdminRoute - Is Admin:', user?.role === 'Admin');
  }, [user, loading]);

  if (loading) {
    console.log('AdminRoute - Still loading, showing loading indicator');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    console.log('AdminRoute - No user found, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (user.role !== 'Admin') {
    console.log('AdminRoute - User is not an Admin, redirecting to home');
    return <Navigate to="/" />;
  }

  console.log('AdminRoute - User is Admin, rendering admin content');
  // Nếu là Admin, hiển thị component con
  return children;
};

export default AdminRoute;
