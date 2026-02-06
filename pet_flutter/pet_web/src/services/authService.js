import { 
  loginApi, 
  registerApi, 
  forgotPasswordApi, 
  resetPasswordApi 
} from '../api/authApi'; 
import { getUserFromToken } from '../utils/tokenUtils';  
import axiosClient from '../utils/axiosClient';

const authService = {
  login: async (usernameOrEmail, password) => {
    try {
      const response = await loginApi(usernameOrEmail, password);
      const { token, user } = response.data;
      
      console.log('Login Response:', response.data);
      
      if (token) {
        localStorage.setItem('token', token);
        
        const userInfo = user || getUserFromToken(token);
        
        const userToStore = {
          ...userInfo,
          role: user?.role || userInfo.role
        };
        
        localStorage.setItem('user', JSON.stringify(userToStore));
        
        console.log('User Info:', userToStore);
        console.log('Token saved to localStorage');
        
        return {
          user: userToStore,
          token
        };
      }
      
      throw new Error('Token không hợp lệ');
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await registerApi(userData);
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        
        const userInfo = user || getUserFromToken(token);
        const userToStore = {
          ...userInfo,
          role: user?.role || userInfo.role
        };
        
        localStorage.setItem('user', JSON.stringify(userToStore));
        
        return {
          user: userToStore,
          token
        };
      }
      
      throw new Error('Đăng ký thất bại');
    } catch (error) {
      console.error('Register Error:', error);
      throw error;
    }
  },

  logout: () => {
    console.log('Logging out user...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('User logged out, localStorage cleared');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, returning null user');
      return null;
    }
    
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('Current User from localStorage:', parsedUser);
        return parsedUser;
      }
      
      const user = getUserFromToken(token);
      console.log('Current User from token:', user);
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await forgotPasswordApi(email);
      
      console.log('Forgot Password Response:', response.data);
      
      // Chỉ trả về thông báo, KHÔNG xử lý token
      return response.data;
    } catch (error) {
      console.error('Forgot Password Error:', error);
      throw error;
    }
  },

  resetPassword: async (resetData) => {
    try {
      const response = await resetPasswordApi(resetData);
      
      console.log('Reset Password Response:', response.data);
      
      // Chỉ trả về thông báo, KHÔNG xử lý token
      return response.data;
    } catch (error) {
      console.error('Reset Password Error:', error);
      throw error;
    }
  },

  isAdmin: () => {
    const user = authService.getCurrentUser();
    console.log('Is Admin Check - User:', user);
    return user && user.role === 'Admin';
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  externalLogin: async (externalAuthData) => {
    try {
      const response = await axiosClient.post('/Auth/external-login', externalAuthData);
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return {
          user,
          token
        };
      }
      
      throw new Error('Token không hợp lệ');
    } catch (error) {
      console.error('External Login Error:', error);
      throw error;
    }
  }
};

export default authService;