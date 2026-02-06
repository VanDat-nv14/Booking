import axiosClient from '../utils/axiosClient';

// Chuyển đổi nhãn danh mục từ tiếng Việt sang tiếng Anh
const getCategoryValue = (categoryLabel) => {
  const categories = {
    'Chăm sóc & Làm đẹp': 'Grooming',
    'Y tế & Sức khỏe': 'Healthcare', 
    'Huấn luyện': 'Training',
    'Trông giữ qua đêm': 'Boarding',
    'Trông giữ ban ngày': 'DayCare',
    'Dịch vụ khác': 'Other'
  };
  return categories[categoryLabel] || categoryLabel;
};

const serviceService = {
 // Lấy tất cả dịch vụ đang hoạt động
 getAllServices: async () => {
   try {
     // Sửa đường dẫn API để loại bỏ /api vì đã được thêm trong baseURL
     const response = await axiosClient.get('/Services');
     const servicesWithFullImageUrls = response.data.map(service => ({
       ...service,
       photo: service.photo 
         ? `https://localhost:7164${service.photo.startsWith('/') ? service.photo : '/' + service.photo}`
         : null
     }));
     return servicesWithFullImageUrls;
   } catch (error) {
     console.error('Lỗi lấy danh sách dịch vụ:', error);
     throw error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách dịch vụ';
   }
 },
 
 // Lấy dịch vụ đang hoạt động (alias của getAllServices)
 getActiveServices: async () => {
   try {
     // Sửa đường dẫn API để loại bỏ /api vì đã được thêm trong baseURL
     const response = await axiosClient.get('/Services');
     const servicesWithFullImageUrls = response.data.map(service => ({
       ...service,
       photo: service.photo 
         ? `https://localhost:7164${service.photo.startsWith('/') ? service.photo : '/' + service.photo}`
         : null
     }));
     return servicesWithFullImageUrls;
   } catch (error) {
     console.error('Lỗi lấy danh sách dịch vụ:', error);
     throw error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách dịch vụ';
   }
 },
 
 // Lấy chi tiết dịch vụ theo id
 getServiceById: async (id) => {
   try {
     // Sửa đường dẫn API để loại bỏ /api vì đã được thêm trong baseURL
     const response = await axiosClient.get(`/Services/${id}`);
     const serviceWithFullImageUrl = {
       ...response.data,
       photo: response.data.photo 
         ? `https://localhost:7164${response.data.photo.startsWith('/') ? response.data.photo : '/' + response.data.photo}`
         : null
     };
     return serviceWithFullImageUrl;
   } catch (error) {
     console.error('Lỗi lấy thông tin dịch vụ:', error);
     throw error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin dịch vụ';
   }
 },
 
 // Lấy dịch vụ theo danh mục
 getServicesByCategory: async (category) => {
   try {
     // Sửa đường dẫn API để loại bỏ /api vì đã được thêm trong baseURL
     const response = await axiosClient.get(`/Services/category/${category}`);
     const servicesWithFullImageUrls = response.data.map(service => ({
       ...service,
       photo: service.photo 
         ? `https://localhost:7164${service.photo.startsWith('/') ? service.photo : '/' + service.photo}`
         : null
     }));
     return servicesWithFullImageUrls;
   } catch (error) {
     console.error('Lỗi lấy danh sách dịch vụ theo danh mục:', error);
     throw error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách dịch vụ theo danh mục';
   }
 },
 
 // Tạo dịch vụ mới (multipart/form-data)
 createService: async (serviceData) => {
   // Tạo FormData để gửi
   const formData = new FormData();
   
   // Chuyển đổi category sang tiếng Anh
   const processedCategory = getCategoryValue(serviceData.category);
   
   // Thêm các trường dữ liệu vào FormData
   formData.append('name', serviceData.name);
   formData.append('description', serviceData.description);
   formData.append('category', processedCategory);
   formData.append('price', serviceData.price.toString());
   formData.append('duration', serviceData.duration.toString());
   
   // Thêm ảnh nếu có
   if (serviceData.photo) {
     formData.append('photo', serviceData.photo);
   }
   
   try {
     console.log('Dữ liệu gửi đi:', Object.fromEntries(formData));
     // Sửa đường dẫn API để loại bỏ /api vì đã được thêm trong baseURL
     const response = await axiosClient.post('/Services', formData, {
       headers: { 'Content-Type': 'multipart/form-data' }
     });
     console.log('Phản hồi tạo dịch vụ:', response.data);
     return response.data;
   } catch (error) {
     console.error('Lỗi tạo dịch vụ:', error.response?.data || error.message);
     
     // Log chi tiết lỗi
     if (error.response) {
       console.error('Chi tiết lỗi từ server:', error.response.data);
       console.error('Trạng thái lỗi:', error.response.status);
     }
     
     throw error.response?.data?.message || 'Có lỗi xảy ra khi tạo dịch vụ';
   }
 },
 
 // Cập nhật dịch vụ 
 updateService: async (id, serviceData) => {
   // Tạo FormData để gửi
   const formData = new FormData();
   
   // Chuyển đổi category sang tiếng Anh
   const processedCategory = getCategoryValue(serviceData.category);
   
   // Thêm các trường dữ liệu vào FormData
   formData.append('name', serviceData.name);
   formData.append('description', serviceData.description);
   formData.append('category', processedCategory);
   formData.append('price', serviceData.price.toString());
   formData.append('duration', serviceData.duration.toString());
   
   // Thêm ảnh nếu có
   if (serviceData.photo) {
     formData.append('photo', serviceData.photo);
   }
   
   try {
     console.log('Dữ liệu cập nhật:', Object.fromEntries(formData));
     // Sửa đường dẫn API để loại bỏ /api vì đã được thêm trong baseURL
     const response = await axiosClient.put(`/Services/${id}`, formData, {
       headers: { 'Content-Type': 'multipart/form-data' }
     });
     console.log('Phản hồi cập nhật dịch vụ:', response.data);
     return response.data;
   } catch (error) {
     console.error('Lỗi cập nhật dịch vụ:', error.response?.data || error.message);
     
     // Log chi tiết lỗi
     if (error.response) {
       console.error('Chi tiết lỗi từ server:', error.response.data);
       console.error('Trạng thái lỗi:', error.response.status);
     }
     
     throw error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dịch vụ';
   }
 },
 
 // Xóa dịch vụ 
 deleteService: async (id) => {
   try {
     // Sửa đường dẫn API để loại bỏ /api vì đã được thêm trong baseURL
     const response = await axiosClient.delete(`/Services/${id}`);
     return response.data;
   } catch (error) {
     console.error('Lỗi xóa dịch vụ:', error.response?.data || error.message);
     throw error.response?.data?.message || 'Có lỗi xảy ra khi xóa dịch vụ';
   }
 }
};

export default serviceService;