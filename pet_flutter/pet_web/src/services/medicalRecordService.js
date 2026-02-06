import axiosClient from '../utils/axiosClient';

const medicalRecordService = {
  // Lấy hồ sơ y tế của một thú cưng
  getPetMedicalRecords: async (petId) => {
    try {
      const response = await axiosClient.get(`/MedicalRecords/Pet/${petId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical records:', error);
      throw error.response?.data || 'Có lỗi xảy ra khi lấy hồ sơ y tế';
    }
  },
  
  // Lấy chi tiết một hồ sơ y tế
  getMedicalRecordById: async (recordId) => {
    try {
      const response = await axiosClient.get(`/MedicalRecords/${recordId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical record:', error);
      throw error.response?.data || 'Có lỗi xảy ra khi lấy chi tiết hồ sơ y tế';
    }
  },
  
  // Lấy lịch sử tiêm chủng của thú cưng
  getPetVaccinations: async (petId) => {
    try {
      const response = await axiosClient.get(`/Vaccinations/Pet/${petId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
      // Trả về mảng rỗng nếu API tiêm chủng không có hoặc lỗi
      return [];
    }
  },
  
  // Lấy nhắc nhở chăm sóc cho thú cưng
  getPetCareReminders: async (petId) => {
    try {
      const response = await axiosClient.get(`/PetCareReminders/Pet/${petId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching care reminders:', error);
      // Trả về mảng rỗng nếu API nhắc nhở không có hoặc lỗi
      return [];
    }
  }
};

export default medicalRecordService;