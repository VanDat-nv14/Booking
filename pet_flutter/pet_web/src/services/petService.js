import axiosClient from '../utils/axiosClient';

// Helper function để xử lý lỗi API
const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    const errorData = error.response.data;
    if (typeof errorData === 'object') {
      return errorData.message || JSON.stringify(errorData);
    }
    return errorData;
  }
  return error.message || 'Đã xảy ra lỗi không xác định';
};

// Kiểm tra và xử lý file trước khi upload
const validateFile = (file) => {
  if (!file) return null;
  
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
  
  if (file.size > MAX_SIZE) {
    throw new Error('Kích thước file không được quá 5MB');
  }
  
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    throw new Error('Chỉ hỗ trợ định dạng JPG, JPEG, PNG và GIF');
  }
  
  return file;
};

const petService = {
  // Lấy tất cả thú cưng
  getAllPets: async () => {
    try {
      const response = await axiosClient.get('/Pets');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Lấy thú cưng của người dùng đang đăng nhập
  getUserPets: async () => {
    try {
      const response = await axiosClient.get('/Pets/User');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Lấy thú cưng theo userId (dùng cho admin)
  getPetsByUserId: async (userId) => {
    try {
      console.log(`🔍 Fetching pets for userId: ${userId}`);
      const response = await axiosClient.get(`/Pets/User/${userId}`);
      console.log(`✅ Pets fetched for user ${userId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching pets for userId ${userId}:`, error);
      throw handleApiError(error);
    }
  },
  
  // Lấy thông tin chi tiết của một thú cưng
  getPetById: async (id) => {
    try {
      console.log(`Fetching pet details for id: ${id}`);
      const response = await axiosClient.get(`/Pets/${id}`);
      
      console.log('Response from server:', response.data);
      
      // Map backend field names to frontend field names if they exist
      const petData = response.data;
      const fieldMapping = {
        Name: 'name',
        Species: 'species',
        Breed: 'breed',
        Gender: 'gender',
        DateOfBirth: 'dateOfBirth',
        Weight: 'weight',
        Color: 'color',
        Description: 'description',
        Photo: 'photo'
      };
      
      // Create a processed data object with both original and mapped properties
      const processedData = { ...petData };
      
      // Add mapped frontend field names while preserving original backend field names
      Object.keys(fieldMapping).forEach(backendField => {
        if (petData[backendField] !== undefined) {
          processedData[fieldMapping[backendField]] = petData[backendField];
        }
      });
      
      // Process photo URL if available
      if (processedData.photo || processedData.Photo) {
        const photoPath = processedData.photo || processedData.Photo;
        
        if (!photoPath.startsWith('http')) {
          if (photoPath.startsWith('/uploads/pets/')) {
            processedData.photoUrl = `https://localhost:7164${photoPath}`;
          } else {
            processedData.photoUrl = `https://localhost:7164/uploads/pets/${photoPath.replace(/^\//, '')}`;
          }
        }
      }
      
      console.log('Processed pet data:', processedData);
      return processedData;
    } catch (error) {
      console.error(`Error fetching pet with ID ${id}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw handleApiError(error);
    }
  },
  
  // Tạo thú cưng mới
  createPet: async (petData) => {
    try {
      // Log dữ liệu để kiểm tra trước khi gửi
      console.log('Creating new pet with data:', petData);
      
      // Kiểm tra xem petData có là FormData không
      const isFormData = petData instanceof FormData;
      
      // Nếu không phải FormData, chuyển đổi thành FormData
      const formData = isFormData ? petData : new FormData();
      
      if (!isFormData) {
        // Xử lý file trước khi thêm vào formData
        let photoFile = null;
        if (petData.photo) {
          try {
            photoFile = validateFile(petData.photo);
            console.log('Photo validated successfully:', photoFile.name, photoFile.type, photoFile.size);
          } catch (err) {
            console.error('File validation error:', err);
            throw err.message;
          }
        }
        
        // Map các trường từ frontend camelCase sang backend PascalCase
        const fieldMapping = {
          name: 'Name',
          species: 'Species',
          breed: 'Breed',
          gender: 'Gender',
          dateOfBirth: 'DateOfBirth',
          birthdate: 'DateOfBirth',
          weight: 'Weight',
          color: 'Color',
          description: 'Description'
        };
        
        // Thêm các trường vào formData
        Object.entries(petData).forEach(([key, value]) => {
          if (key === 'photo' || key === 'Photo') return; // Bỏ qua file, xử lý riêng
          
          const backendField = fieldMapping[key] || key;
          
          if (value !== undefined && value !== null) {
            formData.append(backendField, value);
          }
        });
        
        // Thêm file ảnh nếu có
        if (photoFile) {
          formData.append('Photo', photoFile);
        }
      }
      
      // Log form data trước khi gửi
      console.log('FormData being sent to server:');
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[0] === 'Photo' ? 'File object' : pair[1]}`);
      }
      
      // Gửi request với timeout dài hơn để xử lý upload file
      const response = await axiosClient.post('/Pets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 giây
      });
      
      // Xử lý response
      const responseData = response.data;
      
      // Chuẩn hóa đường dẫn hình ảnh
      if (responseData && responseData.photo) {
        if (!responseData.photo.startsWith('http')) {
          if (responseData.photo.startsWith('/uploads/pets/')) {
            responseData.photo = `https://localhost:7164${responseData.photo}`;
          } else if (!responseData.photo.includes('/uploads/pets/')) {
            responseData.photo = `https://localhost:7164/uploads/pets/${responseData.photo.replace(/^\//, '')}`;
          }
        }
        responseData.photoUrl = responseData.photo;
      }
      
      // Thêm các trường camelCase từ PascalCase
      ['Name', 'Species', 'Breed', 'Gender', 'DateOfBirth', 'Weight', 'Color', 'Description'].forEach(field => {
        const camelCaseField = field.charAt(0).toLowerCase() + field.slice(1);
        if (responseData[field] !== undefined) {
          responseData[camelCaseField] = responseData[field];
        }
      });
      
      console.log('Pet created successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error creating pet:', error);
      if (error.response && error.response.data) {
        console.error('Server response:', JSON.stringify(error.response.data));
      }
      throw handleApiError(error);
    }
  },
  
  // Cập nhật thông tin thú cưng
  updatePet: async (id, petData) => {
    try {
      // Log dữ liệu để kiểm tra trước khi gửi
      console.log(`Updating pet id ${id} with data:`, petData);
      
      // Kiểm tra xem petData có là FormData không
      const isFormData = petData instanceof FormData;
      
      // Nếu không phải FormData, chuyển đổi thành FormData
      const formData = isFormData ? petData : new FormData();
      
      if (!isFormData) {
        // Xử lý file trước khi thêm vào formData
        let photoFile = null;
        if (petData.photo) {
          try {
            photoFile = validateFile(petData.photo);
            console.log('Photo validated for update:', photoFile.name, photoFile.type, photoFile.size);
          } catch (err) {
            console.error('File validation error during update:', err);
            throw err.message;
          }
        }
        
        // Map các trường từ frontend camelCase sang backend PascalCase
        const fieldMapping = {
          name: 'Name',
          species: 'Species',
          breed: 'Breed',
          gender: 'Gender',
          dateOfBirth: 'DateOfBirth',
          birthdate: 'DateOfBirth',
          weight: 'Weight',
          color: 'Color',
          description: 'Description'
        };
        
        // Thêm các trường vào formData
        Object.entries(petData).forEach(([key, value]) => {
          if (key === 'photo' || key === 'Photo') return; // Bỏ qua file, xử lý riêng
          
          const backendField = fieldMapping[key] || key;
          
          if (value !== undefined && value !== null) {
            formData.append(backendField, value);
          }
        });
        
        // Thêm file ảnh nếu có
        if (photoFile) {
          formData.append('Photo', photoFile);
        }
      }
      
      // Log form data trước khi gửi
      console.log('FormData being sent to server:');
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[0] === 'Photo' ? 'File object' : pair[1]}`);
      }
      
      // Gửi request với timeout dài hơn để xử lý upload file
      const response = await axiosClient.put(`/Pets/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 giây
      });
      
      // Xử lý response
      const responseData = response.data;
      
      // Chuẩn hóa đường dẫn hình ảnh
      if (responseData && responseData.photo) {
        if (!responseData.photo.startsWith('http')) {
          if (responseData.photo.startsWith('/uploads/pets/')) {
            responseData.photo = `https://localhost:7164${responseData.photo}`;
          } else if (!responseData.photo.includes('/uploads/pets/')) {
            responseData.photo = `https://localhost:7164/uploads/pets/${responseData.photo.replace(/^\//, '')}`;
          }
        }
        responseData.photoUrl = responseData.photo;
      }
      
      // Thêm các trường camelCase từ PascalCase
      ['Name', 'Species', 'Breed', 'Gender', 'DateOfBirth', 'Weight', 'Color', 'Description'].forEach(field => {
        const camelCaseField = field.charAt(0).toLowerCase() + field.slice(1);
        if (responseData[field] !== undefined) {
          responseData[camelCaseField] = responseData[field];
        }
      });
      
      console.log('Pet updated successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error updating pet:', error);
      if (error.response && error.response.data) {
        console.error('Server response:', JSON.stringify(error.response.data));
      }
      throw handleApiError(error);
    }
  },
  
  // Xóa thú cưng
  deletePet: async (id) => {
    try {
      await axiosClient.delete(`/Pets/${id}`);
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default petService;