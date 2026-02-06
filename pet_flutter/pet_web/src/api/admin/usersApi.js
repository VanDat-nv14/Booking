import { axiosClient } from '../../utils/axiosClient';

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const response = await axiosClient.get('/api/users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user by ID (admin only)
export const getUserById = async (userId) => {
  try {
    const response = await axiosClient.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user (admin only)
export const updateUser = async (userId, userData) => {
  try {
    const response = await axiosClient.put(`/api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user status (active/inactive) (admin only)
export const updateUserStatus = async (userId, isActive) => {
  try {
    const response = await axiosClient.patch(`/api/users/${userId}/status`, { isActive });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete user (admin only)
export const deleteUser = async (userId) => {
  try {
    const response = await axiosClient.delete(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};