import axiosClient from '../utils/axiosClient';

export const loginApi = async (usernameOrEmail, password) => {
  return await axiosClient.post('/Auth/login', { usernameOrEmail, password });
};

export const registerApi = async (userData) => {
  return await axiosClient.post('/Auth/register', userData);
};

export const forgotPasswordApi = async (email) => {
  return await axiosClient.post('/password/forgot-password', { email });
};

export const resetPasswordApi = async (resetData) => {
  return await axiosClient.post('/password/reset-password', resetData);
};