import axiosClient from '../utils/axiosClient';

// Hàm lấy URL đầy đủ của avatar
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  
  // Lấy phần baseURL từ axiosClient và loại bỏ phần "/api"
  const baseURL = axiosClient.defaults.baseURL;
  const serverBaseURL = baseURL ? baseURL.substring(0, baseURL.lastIndexOf('/api')) : '';
  
  return `${serverBaseURL}${avatarPath}`;
};

export const getUserProfile = async (userId) => {
  try {
    console.log(`Đang tải thông tin người dùng ID: ${userId}`);
    const response = await axiosClient.get(`/Users/${userId}`);
    console.log('Tải thông tin người dùng thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi tải thông tin người dùng:', error.response?.data || error.message);
    
    // Xử lý lỗi chi tiết
    if (error.response && error.response.data) {
      throw new Error(
        typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || 'Không thể tải thông tin người dùng'
      );
    }
    
    throw error;
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    // Chuyển đổi dữ liệu sang FormData
    const formData = userData instanceof FormData 
      ? userData 
      : Object.keys(userData).reduce((data, key) => {
          if (userData[key] !== undefined && userData[key] !== null) {
            data.append(key, userData[key]);
          }
          return data;
        }, new FormData());

    // Thêm một avatar giả nếu không có avatar trong formData
    if (!formData.has('avatar')) {
      // Tạo một blob rỗng làm avatar giả
      const emptyBlob = new Blob([], { type: 'image/png' });
      const emptyFile = new File([emptyBlob], 'empty.png', { type: 'image/png' });
      formData.append('avatar', emptyFile);
    }

    // Thêm role nếu chưa có
    if (!formData.has('role')) {
      // Lấy role từ localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role) {
          formData.append('role', user.role);
        } else {
          formData.append('role', 'User'); // Mặc định là 'User'
        }
      } else {
        formData.append('role', 'User'); // Mặc định là 'User'
      }
    }

    // Log dữ liệu gửi đi
    console.log('Dữ liệu cập nhật:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    const response = await axiosClient.put(`/Users/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    console.log('Phản hồi cập nhật:', response.data);
    
    // Cập nhật localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser && response.data) {
      const user = JSON.parse(storedUser);
      const updatedUser = {
        ...user,
        fullName: response.data.fullName || user.fullName,
        email: response.data.email || user.email,
        phone: response.data.phone || user.phone,
        address: response.data.address || user.address,
        avatar: response.data.avatar || user.avatar
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Phát sự kiện để thông báo cho các component khác
      window.dispatchEvent(new Event('userProfileUpdated'));
      
      console.log('Đã cập nhật thông tin người dùng:', updatedUser);
    }
    
    return response.data;
  } catch (error) {
    console.error('Lỗi cập nhật thông tin:', error.response?.data || error.message);
    
    // Xử lý lỗi chi tiết
    if (error.response && error.response.data) {
      // Xử lý lỗi validation
      if (error.response.data.errors) {
        let errorMessages = '';
        
        // Xử lý object errors
        if (typeof error.response.data.errors === 'object' && !Array.isArray(error.response.data.errors)) {
          const errorArray = [];
          
          for (const field in error.response.data.errors) {
            if (Array.isArray(error.response.data.errors[field])) {
              errorArray.push(...error.response.data.errors[field]);
            } else {
              errorArray.push(error.response.data.errors[field]);
            }
          }
          
          errorMessages = errorArray.join(', ');
        } 
        else if (Array.isArray(error.response.data.errors)) {
          errorMessages = error.response.data.errors.join(', ');
        }
        else {
          errorMessages = error.response.data.errors.toString();
        }
        
        throw new Error(errorMessages || 'Dữ liệu không hợp lệ');
      }
      
      throw new Error(
        typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || 'Không thể cập nhật thông tin'
      );
    }
    
    throw error;
  }
};

export const changePassword = async (userId, passwordData) => {
  try {
    console.log(`Đang đổi mật khẩu cho người dùng ID: ${userId}`);
    
    const response = await axiosClient.post(`/Users/${userId}/change-password`, {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    console.log('Phản hồi đổi mật khẩu:', response.status);
    return true;
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error.response?.data || error.message);
    
    // Xử lý lỗi chi tiết
    if (error.response && error.response.data) {
      throw new Error(
        typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || 'Không thể đổi mật khẩu'
      );
    }
    
    throw error;
  }
};