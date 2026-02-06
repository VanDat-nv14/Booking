import axiosClient from '../utils/axiosClient';

// Phương thức lấy tất cả nhân viên
const getAllStaff = async () => {
  try {
    console.log('Đang gửi request đến /Staff...');
    const token = localStorage.getItem('token');
    console.log('Token hiện tại:', token ? token.substring(0, 20) + '...' : 'Không có token');
    
    const response = await axiosClient.get('/Staff');
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    // Kiểm tra chi tiết dữ liệu nhận được
    if (response.data) {
      if (Array.isArray(response.data)) {
        console.log('Dữ liệu là mảng với độ dài:', response.data.length);
        return response.data;
      } else if (response.data.staff && Array.isArray(response.data.staff)) {
        console.log('Dữ liệu là object có thuộc tính staff, độ dài:', response.data.staff.length);
        return response.data.staff;
      } else {
        console.log('Dữ liệu không phải mảng hoặc không có thuộc tính staff dạng mảng:', typeof response.data);
        console.log('Cấu trúc dữ liệu:', JSON.stringify(response.data).substring(0, 200) + '...');
        
        // Thử trích xuất dữ liệu từ các cấu trúc phổ biến khác
        if (typeof response.data === 'object') {
          const potentialArrays = Object.values(response.data).filter(val => Array.isArray(val));
          if (potentialArrays.length > 0) {
            console.log('Tìm thấy mảng trong response.data, độ dài:', potentialArrays[0].length);
            return potentialArrays[0];
          }
        }
      }
    }
    return [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên:', error);
    console.error('Chi tiết lỗi:', error.response ? {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    } : 'Không có response');
    return [];
  }
};

// Phương thức lấy nhân viên theo dịch vụ - Sửa đường dẫn API theo StaffController
const getStaffByService = async (serviceId) => {
  try {
    console.log(`Bắt đầu gọi API lấy nhân viên theo dịch vụ ${serviceId}...`);
    
    // Log token để kiểm tra xác thực
    const token = localStorage.getItem('token');
    console.log('Token hiện tại:', token ? token.substring(0, 20) + '...' : 'Không có token');
    
    // Sửa đường dẫn đúng endpoint, bỏ tiền tố /api vì axiosClient đã có baseURL
    const response = await axiosClient.get(`/Staff/Service/${serviceId}`);
    console.log('Kết quả API nhân viên theo dịch vụ:', response);
    
    if (!response || !response.data) {
      console.error('Response không hợp lệ hoặc không có dữ liệu');
      return [];
    }
    
    // Phân tích cấu trúc dữ liệu
    if (Array.isArray(response.data)) {
      console.log('Dữ liệu nhân viên:', response.data);
      return response.data;
    } else {
      console.warn('Dữ liệu không phải là mảng:', response.data);
      
      // Thử tìm mảng trong đối tượng
      if (typeof response.data === 'object') {
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            console.log(`Tìm thấy mảng trong response.data.${key}:`, response.data[key]);
            return response.data[key];
          }
        }
      }
      
      // Nếu không tìm thấy mảng nào, trả về mảng rỗng
      return [];
    }
  } catch (error) {
    console.error(`Error fetching staff for service ${serviceId}:`, error);
    console.error('Chi tiết lỗi:', error.response ? {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    } : 'Không có response');
    
    return []; // Trả về mảng rỗng thay vì throw lỗi
  }
};

const getStaffById = async (staffId) => {
  try {
    const response = await axiosClient.get(`/Staff/${staffId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching staff by id:', error);
    return null;
  }
};

const getStaffSchedule = async (staffId, month, year) => {
  try {
    const response = await axiosClient.get(`/staff/${staffId}/schedule`, {
      params: { month, year }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return [];
  }
};

const setStaffSchedule = async (scheduleData) => {
  try {
    const response = await axiosClient.post(`/staff/${scheduleData.staffId}/schedule`, scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error saving schedule:', error);
    throw error;
  }
};

// Tạo tài khoản nhân viên mới (User + Staff)
const createUserStaff = async (staffData) => {
  try {
    console.log('=== STAFF SERVICE: BẮT ĐẦU TẠO NHÂN VIÊN ===');
    console.log('Dữ liệu nhận được từ component:', staffData);
    
    // Kiểm tra dữ liệu bắt buộc
    if (!staffData.username) {
      throw new Error('Username là bắt buộc');
    }
    if (!staffData.email) {
      throw new Error('Email là bắt buộc');
    }
    if (!staffData.password) {
      throw new Error('Password là bắt buộc');
    }
    if (!staffData.fullName) {
      throw new Error('FullName là bắt buộc');
    }
    if (!staffData.specialization) {
      throw new Error('Specialization là bắt buộc');
    }
    
    const formData = new FormData();
    
    // Thông tin User - Sử dụng Pascal case để khớp với backend DTO
    console.log('=== THÊM DỮ LIỆU VÀO FORM DATA ===');
    formData.append('Username', staffData.username);
    console.log('✓ Username:', staffData.username);
    
    formData.append('Email', staffData.email);
    console.log('✓ Email:', staffData.email);
    
    formData.append('Password', staffData.password);
    console.log('✓ Password: [HIDDEN]');
    
    formData.append('FullName', staffData.fullName);
    console.log('✓ FullName:', staffData.fullName);
    
    if (staffData.phone) {
      formData.append('Phone', staffData.phone);
      console.log('✓ Phone:', staffData.phone);
    } else {
      console.log('⚠ Phone: empty');
    }
    
    if (staffData.address) {
      formData.append('Address', staffData.address);
      console.log('✓ Address:', staffData.address);
    } else {
      console.log('⚠ Address: empty');
    }
    
    // Thông tin Staff - Sử dụng Pascal case để khớp với backend DTO
    formData.append('Specialization', staffData.specialization);
    console.log('✓ Specialization:', staffData.specialization);
    
    if (staffData.bio) {
      formData.append('Bio', staffData.bio);
      console.log('✓ Bio:', staffData.bio);
    } else {
      console.log('⚠ Bio: empty');
    }
    
    if (staffData.experience) {
      formData.append('Experience', staffData.experience.toString());
      console.log('✓ Experience:', staffData.experience);
    } else {
      formData.append('Experience', '0');
      console.log('✓ Experience: 0 (default)');
    }
    
    // Avatar
    if (staffData.avatar) {
      formData.append('Avatar', staffData.avatar);
      console.log('✓ Avatar file:', staffData.avatar.name, '(' + staffData.avatar.size + ' bytes)');
    } else {
      console.log('⚠ Avatar: empty');
    }
    
    // Debug log để kiểm tra FormData
    console.log('=== TẤT CẢ DỮ LIỆU TRONG FORM DATA ===');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [FILE] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    
    console.log('=== GỌI API TẠO NHÂN VIÊN ===');
    console.log('URL: /Staff/create-user-staff');
    console.log('Method: POST');
    console.log('Content-Type: multipart/form-data');
    
    const response = await axiosClient.post('/Staff/create-user-staff', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    console.log('=== API THÀNH CÔNG ===');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== LỖI TẠO NHÂN VIÊN ===');
    console.error('Error object:', error);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('HTTP Status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
      
      // Phân tích chi tiết lỗi từ server
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          console.error('Server error message:', error.response.data);
        } else if (error.response.data.message) {
          console.error('Server error message:', error.response.data.message);
        } else if (error.response.data.errors) {
          console.error('Validation errors:', error.response.data.errors);
        }
      }
    } else {
      console.error('Network or other error - no response from server');
    }
    
    // Re-throw error để component có thể handle
    throw error;
  }
};

// Gán dịch vụ cho nhân viên
const assignServiceToStaff = async (staffId, serviceId) => {
  try {
    const response = await axiosClient.post(`/Staff/${staffId}/Services/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi gán dịch vụ cho nhân viên:', error);
    throw error.response?.data?.message || 'Có lỗi xảy ra khi gán dịch vụ cho nhân viên';
  }
};

// Hủy gán dịch vụ khỏi nhân viên
const removeServiceFromStaff = async (staffId, serviceId) => {
  try {
    const response = await axiosClient.delete(`/Staff/${staffId}/Services/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi hủy gán dịch vụ khỏi nhân viên:', error);
    throw error.response?.data?.message || 'Có lỗi xảy ra khi hủy gán dịch vụ khỏi nhân viên';
  }
};

// Xuất tất cả các phương thức
const staffService = {
  getAllStaff,
  getStaffByService,
  getStaffById,
  getStaffSchedule,
  setStaffSchedule,
  createUserStaff,
  assignServiceToStaff,
  removeServiceFromStaff
};

export default staffService;