import axios from 'axios';

const API_BASE_URL = 'https://localhost:7164/api';

// Tạo axios instance với config mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const categoryService = {
  // Lấy tất cả categories
  getAllCategories: async (includeInactive = false) => {
    try {
      const response = await apiClient.get(`/Categories?includeInactive=${includeInactive}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Lấy categories đang hoạt động (cho user)
  getActiveCategories: async () => {
    try {
      const response = await apiClient.get('/Categories/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active categories:', error);
      throw error;
    }
  },

  // Lấy category theo ID
  getCategoryById: async (id) => {
    try {
      const response = await apiClient.get(`/Categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw error;
    }
  },

  // Tạo category mới (Admin only)
  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post('/Categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Cập nhật category (Admin only)
  updateCategory: async (id, categoryData) => {
    try {
      const response = await apiClient.put(`/Categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Xóa category (soft delete - Admin only)
  deleteCategory: async (id) => {
    try {
      const response = await apiClient.delete(`/Categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Xóa category hoàn toàn (hard delete - Admin only)
  hardDeleteCategory: async (id) => {
    try {
      const response = await apiClient.delete(`/Categories/${id}/permanent`);
      return response.data;
    } catch (error) {
      console.error('Error hard deleting category:', error);
      throw error;
    }
  },

  // Kiểm tra category có tồn tại không
  categoryExists: async (id) => {
    try {
      await apiClient.get(`/Categories/${id}`);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }
};

export default categoryService; 