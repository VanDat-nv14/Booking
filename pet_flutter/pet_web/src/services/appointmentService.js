import axiosClient from '../utils/axiosClient';
import dayjs from 'dayjs';

// Định nghĩa và xuất appointmentService
const appointmentService = {
  // Lấy tất cả lịch hẹn (cho admin)
  getAllAppointments: async () => {
    try {
      const response = await axiosClient.get('/Appointments');
      return response.data;
    } catch (error) {
      console.error("Error fetching all appointments:", error);
      return [];
    }
  },
  
  // Lấy lịch hẹn của người dùng hiện tại
  getUserAppointments: async () => {
    try {
      const response = await axiosClient.get('/Appointments/user');
      
      // Không cần xử lý dữ liệu thời gian từ server nữa
      // Đơn giản là trả về dữ liệu gốc từ server
      return response.data;
    } catch (error) {
      console.error("Error fetching user appointments:", error);
      return [];
    }
  },
  
  // Lấy lịch hẹn của nhân viên hiện tại
  getStaffAppointments: async () => {
    try {
      const response = await axiosClient.get('/Appointments/staff');
      return response.data;
    } catch (error) {
      console.error("Error fetching staff appointments:", error);
      return [];
    }
  },
  
  // Lấy chi tiết lịch hẹn theo id
  getAppointmentById: async (id) => {
    try {
      const response = await axiosClient.get(`/Appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      return null;
    }
  },
  
  // Lấy lịch hẹn theo ngày
  getAppointmentsByDate: async (date) => {
    try {
      const formattedDate = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const response = await axiosClient.get(`/Appointments/date/${formattedDate}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for date ${date}:`, error);
      return [];
    }
  },
  
  // Lấy lịch hẹn trong khoảng thời gian
  getAppointmentsByDateRange: async (startDate, endDate) => {
    try {
      const response = await axiosClient.get('/Appointments/daterange', {
        params: {
          startDate: startDate instanceof Date ? startDate.toISOString() : startDate,
          endDate: endDate instanceof Date ? endDate.toISOString() : endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching appointments by date range:", error);
      return [];
    }
  },
  
  // Lấy lịch hẹn của nhân viên trong khoảng thời gian
  getStaffAppointmentsByDateRange: async (staffId, startDate, endDate) => {
    try {
      console.log(`Fetching staff ${staffId} appointments from ${startDate} to ${endDate}`);
      
      // Đảm bảo ngày được định dạng đúng
      const formattedStartDate = startDate instanceof Date ? 
        startDate.toISOString().split('T')[0] : 
        dayjs(startDate).format('YYYY-MM-DD');
        
      const formattedEndDate = endDate instanceof Date ? 
        endDate.toISOString().split('T')[0] : 
        dayjs(endDate).format('YYYY-MM-DD');
      
      // Gọi API với params đúng
      const response = await axiosClient.get('/Appointments/staff/daterange', {
        params: {
          staffId,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });
      
      console.log(`Received ${response.data ? response.data.length : 0} appointments for staff ${staffId}`);
      
      // Kiểm tra và gửi sự kiện cập nhật lịch của nhân viên cho UI
      if (response.data && Array.isArray(response.data)) {
        const staffAppointments = response.data;
        
        // Broadcast sự kiện để các component khác biết
        try {
          window.dispatchEvent(new CustomEvent('staff-appointments-updated', {
            detail: {
              staffId: staffId,
              appointments: staffAppointments,
              date: formattedStartDate // Ngày đang xem
            }
          }));
          console.log(`Broadcasted ${staffAppointments.length} appointments for staff ${staffId}`);
        } catch (eventError) {
          console.error('Error broadcasting staff appointments event:', eventError);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching staff appointments by date range:", error);
      return [];
    }
  },
  
  // Lấy lịch hẹn theo trạng thái
  getAppointmentsByStatus: async (status) => {
    try {
      const response = await axiosClient.get(`/Appointments/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments with status ${status}:`, error);
      return [];
    }
  },
  
  // Tạo lịch hẹn mới
  createAppointment: async (appointmentData) => {
    try {
      console.log('🚀 Bắt đầu tạo lịch hẹn với dữ liệu:', JSON.stringify(appointmentData, null, 2));
      
      // Xử lý appointmentDate một cách rõ ràng và nhất quán
      if (appointmentData.appointmentDate) {
        let finalAppointmentDate;
        
        // Trường hợp 1: Đối tượng Date
        if (appointmentData.appointmentDate instanceof Date) {
          console.log('📅 Xử lý Date object:', appointmentData.appointmentDate);
          
          // Lấy thông tin ngày giờ từ Date object (múi giờ địa phương)
          const year = appointmentData.appointmentDate.getFullYear();
          const month = String(appointmentData.appointmentDate.getMonth() + 1).padStart(2, '0');
          const day = String(appointmentData.appointmentDate.getDate()).padStart(2, '0');
          
          // Sử dụng giờ phút chính xác từ exactHour/exactMinute nếu có
          let hours, minutes;
          if (appointmentData.exactHour !== undefined && appointmentData.exactMinute !== undefined) {
            hours = String(appointmentData.exactHour).padStart(2, '0');
            minutes = String(appointmentData.exactMinute).padStart(2, '0');
            console.log(`⏰ Sử dụng giờ chính xác: ${hours}:${minutes}`);
          } else {
            // Lấy giờ phút từ Date object
            hours = String(appointmentData.appointmentDate.getHours()).padStart(2, '0');
            minutes = String(appointmentData.appointmentDate.getMinutes()).padStart(2, '0');
            console.log(`⏰ Sử dụng giờ từ Date object: ${hours}:${minutes}`);
          }
          
          // Tạo chuỗi ISO local (không có Z để giữ múi giờ địa phương)
          finalAppointmentDate = `${year}-${month}-${day}T${hours}:${minutes}:00`;
        } 
        // Trường hợp 2: Chuỗi ISO hoặc chuỗi thời gian
        else if (typeof appointmentData.appointmentDate === 'string') {
          console.log('📝 Xử lý chuỗi thời gian:', appointmentData.appointmentDate);
          
          if (appointmentData.appointmentDate.includes('T')) {
            // Chuỗi ISO - tách ngày và giờ
            const [datePart, timePart] = appointmentData.appointmentDate.split('T');
            let finalTimePart;
            
            // Ưu tiên sử dụng exactHour/exactMinute
            if (appointmentData.exactHour !== undefined && appointmentData.exactMinute !== undefined) {
              finalTimePart = `${String(appointmentData.exactHour).padStart(2, '0')}:${String(appointmentData.exactMinute).padStart(2, '0')}:00`;
              console.log(`⏰ Thay thế thời gian bằng giờ chính xác: ${finalTimePart}`);
            } else {
              // Sử dụng thời gian từ chuỗi ISO (loại bỏ milliseconds và Z)
              finalTimePart = timePart.split('.')[0];
              if (!finalTimePart.includes(':')) {
                finalTimePart = '00:00:00';
              }
              console.log(`⏰ Sử dụng thời gian từ ISO: ${finalTimePart}`);
            }
            
            finalAppointmentDate = `${datePart}T${finalTimePart}`;
          } else {
            // Chỉ có ngày (YYYY-MM-DD) - thêm thời gian
            const datePart = appointmentData.appointmentDate;
            let timePart = "00:00:00";
            
            if (appointmentData.exactHour !== undefined && appointmentData.exactMinute !== undefined) {
              timePart = `${String(appointmentData.exactHour).padStart(2, '0')}:${String(appointmentData.exactMinute).padStart(2, '0')}:00`;
              console.log(`⏰ Thêm giờ chính xác vào ngày: ${timePart}`);
            }
            
            finalAppointmentDate = `${datePart}T${timePart}`;
          }
          
          // Loại bỏ Z ở cuối để tránh chuyển đổi múi giờ
          finalAppointmentDate = finalAppointmentDate.replace(/\.000Z$/, '').replace(/Z$/, '');
        }
        // Trường hợp 3: Có fullDateObject
        else if (appointmentData.fullDateObject) {
          console.log('📆 Xử lý fullDateObject:', appointmentData.fullDateObject);
          
          const exactDate = new Date(appointmentData.fullDateObject);
          const formattedDate = [
            exactDate.getFullYear(),
            (exactDate.getMonth() + 1).toString().padStart(2, '0'),
            exactDate.getDate().toString().padStart(2, '0')
          ].join('-');
          
          const formattedTime = [
            exactDate.getHours().toString().padStart(2, '0'),
            exactDate.getMinutes().toString().padStart(2, '0'),
            '00'
          ].join(':');
          
          finalAppointmentDate = `${formattedDate}T${formattedTime}`;
        }
        
        // Cập nhật appointmentDate với giá trị đã xử lý
        appointmentData.appointmentDate = finalAppointmentDate;
        console.log('✅ Ngày giờ cuối cùng (local time):', finalAppointmentDate);
      }
      
      // Thêm thông tin múi giờ để backend xử lý
      appointmentData.timeZoneOffset = new Date().getTimezoneOffset();
      appointmentData.clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      console.log('📤 Dữ liệu cuối cùng gửi lên server:', JSON.stringify(appointmentData, null, 2));
      
      const response = await axiosClient.post('/Appointments', appointmentData);
      console.log('✅ Kết quả tạo lịch hẹn từ server:', response.data);
      
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi khi tạo lịch hẹn:", error);
      console.error("📋 Chi tiết lỗi:", error.response?.data || error.message);
      throw error;
    }
  },
  
  // Cập nhật lịch hẹn
  updateAppointment: async (appointmentId, appointmentData) => {
    try {
      console.log('Updating appointment:', appointmentId, appointmentData);
      
      // Lưu thông tin appointment cũ trước khi cập nhật
      let oldAppointmentData = null;
      try {
        const existingAppointments = await appointmentService.getAllAppointments();
        oldAppointmentData = existingAppointments.find(apt => apt.appointmentId === appointmentId);
      } catch (e) {
        console.warn('Could not fetch old appointment data:', e);
      }
      
      const response = await axiosClient.put(`/Appointments/${appointmentId}`, appointmentData);
      console.log('Update appointment response:', response.data);
      
      // ===== THÊM ĐỒNG BỘ REAL-TIME =====
      if (response.data && oldAppointmentData) {
        const newAppointmentData = response.data;
        
        try {
          // Kiểm tra các thay đổi quan trọng
          const staffChanged = oldAppointmentData.staffId !== newAppointmentData.staffId;
          const timeChanged = dayjs(oldAppointmentData.appointmentDate).format('HH:mm') !== 
                             dayjs(newAppointmentData.appointmentDate).format('HH:mm');
          const dateChanged = dayjs(oldAppointmentData.appointmentDate).format('YYYY-MM-DD') !== 
                             dayjs(newAppointmentData.appointmentDate).format('YYYY-MM-DD');
          
          console.log('🔄 Appointment changes detected:', { staffChanged, timeChanged, dateChanged });
          
          // 1. Broadcast appointment update event
          window.dispatchEvent(new CustomEvent('appointment-updated', {
            detail: {
              appointmentId: appointmentId,
              oldData: oldAppointmentData,
              newData: newAppointmentData,
              staffChanged,
              timeChanged,
              dateChanged
            }
          }));
          
          // 2. Cập nhật lịch bận thú cưng
          if (newAppointmentData.petId) {
            window.dispatchEvent(new CustomEvent('pet-busy-slots-updated', {
              detail: {
                petId: newAppointmentData.petId,
                date: dayjs(newAppointmentData.appointmentDate).format('YYYY-MM-DD'),
                action: 'update',
                oldAppointment: oldAppointmentData,
                newAppointment: newAppointmentData
              }
            }));
            
            // Nếu ngày thay đổi, cũng cập nhật ngày cũ
            if (dateChanged && oldAppointmentData.petId) {
              window.dispatchEvent(new CustomEvent('pet-busy-slots-updated', {
                detail: {
                  petId: oldAppointmentData.petId,
                  date: dayjs(oldAppointmentData.appointmentDate).format('YYYY-MM-DD'),
                  action: 'remove',
                  appointmentId: appointmentId
                }
              }));
            }
          }
          
          // 3. Cập nhật lịch bận nhân viên cũ
          if (oldAppointmentData.staffId && (staffChanged || timeChanged || dateChanged)) {
            window.dispatchEvent(new CustomEvent('staff-appointments-updated', {
              detail: {
                staffId: oldAppointmentData.staffId,
                date: dayjs(oldAppointmentData.appointmentDate).format('YYYY-MM-DD'),
                action: 'remove',
                appointmentId: appointmentId
              }
            }));
          }
          
          // 4. Cập nhật lịch bận nhân viên mới
          if (newAppointmentData.staffId) {
            window.dispatchEvent(new CustomEvent('staff-appointments-updated', {
              detail: {
                staffId: newAppointmentData.staffId,
                date: dayjs(newAppointmentData.appointmentDate).format('YYYY-MM-DD'),
                action: 'add',
                appointment: newAppointmentData
              }
            }));
          }
          
          // 5. Xóa cache liên quan
          const cacheKeys = [
            `petBusySlots_${oldAppointmentData.petId}_${dayjs(oldAppointmentData.appointmentDate).format('YYYY-MM-DD')}`,
            `petBusySlots_${newAppointmentData.petId}_${dayjs(newAppointmentData.appointmentDate).format('YYYY-MM-DD')}`,
            `staffBusySlots_${oldAppointmentData.staffId}_${dayjs(oldAppointmentData.appointmentDate).format('YYYY-MM-DD')}`,
            `staffBusySlots_${newAppointmentData.staffId}_${dayjs(newAppointmentData.appointmentDate).format('YYYY-MM-DD')}`
          ];
          
          cacheKeys.forEach(key => {
            if (key.includes('undefined') || key.includes('null')) return;
            try {
              localStorage.removeItem(key);
              console.log(`🗑️ Removed cache: ${key}`);
            } catch (e) {
              console.warn('Error removing cache:', e);
            }
          });
          
          // 6. Trigger global refresh sau một khoảng thời gian ngắn
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refresh-all-timeslots', {
              detail: {
                reason: 'appointment-updated-via-service',
                appointmentId: appointmentId
              }
            }));
          }, 1000);
          
        } catch (eventError) {
          console.error('Error dispatching appointment update events:', eventError);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating appointment:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật lịch hẹn';
    }
  },
  
  // Cập nhật trạng thái lịch hẹn
  updateAppointmentStatus: async (id, status, notes = null) => {
    try {
      const response = await axiosClient.patch(`/Appointments/${id}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment ${id} status:`, error);
      throw error;
    }
  },
  
  // Hủy lịch hẹn
  cancelAppointment: async (appointmentId, reason = '') => {
    try {
      console.log(`Cancelling appointment ${appointmentId} with reason: ${reason}`);
      
      // Đảm bảo reason không bị null
      const cancelReason = reason || 'Người dùng hủy lịch';
      
      // Thử endpoint DELETE chính với lý do trong body
      try {
        console.log('Gọi endpoint DELETE chính với lý do:', cancelReason);
        const response = await axiosClient.delete(`/Appointments/${appointmentId}`, {
          data: { reason: cancelReason }
        });
        console.log('Kết quả hủy lịch:', response.data);
        return response.data;
      } catch (deleteError) {
        console.error('Endpoint DELETE chính trả về lỗi:', deleteError);
        
        // Kiểm tra nếu lỗi là do vượt quá số lần hủy cho phép
        if (deleteError.response?.data?.message && 
            deleteError.response.data.message.includes('maximum number of cancellations')) {
          console.error('Lỗi giới hạn hủy lịch:', deleteError.response.data.message);
          throw deleteError;
        }
        
        // Thử endpoint DELETE với reason trong path
        console.log('Thử endpoint DELETE với reason:', cancelReason);
        try {
          const response = await axiosClient.delete(`/Appointments/${appointmentId}/reason`, {
            data: { reason: cancelReason }
          });
          console.log('Kết quả hủy lịch (endpoint thay thế):', response.data);
          return response.data;
        } catch (alternativeError) {
          console.error('Endpoint DELETE thay thế cũng lỗi:', alternativeError);
          throw alternativeError;
        }
      }
    } catch (error) {
      console.error('Lỗi hủy lịch hẹn:', error);
      console.error('Chi tiết lỗi:', error.response?.data || error.message || error);
      throw error;
    }
  },
  
  // Cập nhật phương thức checkTimeSlotAvailability để ổn định hơn
  checkTimeSlotAvailability: async (date, serviceId, staffId = null, petId = null) => {
    try {
      if (!date || !serviceId) {
        console.log('Missing required parameters for checkTimeSlotAvailability');
        return { 
          isAvailable: true, 
          message: "Thiếu thông tin cần thiết. Hiển thị trạng thái mặc định." 
        };
      }
      
      // Format date thành YYYY-MM-DD
      const formattedDate = date instanceof Date ? 
        date.toISOString().split('T')[0] : 
        dayjs(date).format('YYYY-MM-DD');
      
      // Tạo key cho cache
      const cacheKey = `timeSlotAvailability_${formattedDate}_${serviceId}_${staffId || '0'}_${petId || '0'}`;
      
      // Kiểm tra cache trước
      try {
        const cachedResult = localStorage.getItem(cacheKey);
        if (cachedResult) {
          const parsedResult = JSON.parse(cachedResult);
          console.log(`Using cached availability data for ${formattedDate}`);
          return parsedResult;
        }
      } catch (e) {
        console.warn('Error reading availability from cache:', e);
      }
      
      // Sử dụng các tham số mới dateStr và petIdStr theo API mới
      const queryParams = new URLSearchParams();
      queryParams.append('dateStr', formattedDate); // Đổi từ date thành dateStr
      queryParams.append('serviceId', serviceId);
      if (staffId) queryParams.append('staffId', staffId);
      if (petId) {
        queryParams.append('petIdStr', petId.toString()); // Đổi từ petId thành petIdStr và chuyển thành string
      }
      
      // Log đầy đủ để debug
      console.log(`Checking availability with params: ${queryParams.toString()}`);
      
      try {
        const response = await axiosClient.get(`/Appointments/check-availability?${queryParams.toString()}`);
        console.log('Availability response:', response.data);
        
        // Lưu kết quả vào cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify(response.data));
        } catch (e) {
          console.warn('Error caching availability data:', e);
        }
        
        return response.data;
      } catch (apiError) {
        console.error("API error checking time slot availability:", apiError.message);
        console.error("Request details:", `/Appointments/check-availability?${queryParams.toString()}`);
        
        if (apiError.response) {
          console.error("Response status:", apiError.response.status);
          console.error("Response data:", apiError.response.data);
        }
        
        // Tạo kết quả fallback dựa trên thông tin có sẵn
        const fallbackResult = { 
          isAvailable: true, 
          message: "Không thể kiểm tra với server. Hiển thị trạng thái mặc định."
        };
        
        // Lưu kết quả fallback vào cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify(fallbackResult));
        } catch (e) {
          console.warn('Error caching fallback availability data:', e);
        }
        
        return fallbackResult;
      }
    } catch (error) {
      console.error("Error checking time slot availability:", error);
      // Return a default response instead of throwing
      return { 
        isAvailable: true, 
        message: "Lỗi không xác định. Hiển thị trạng thái mặc định." 
      };
    }
  },

  // Cập nhật thời gian hoàn thành
  updateCompletionTime: async (appointmentId, completionData) => {
    try {
      console.log('Calling updateCompletionTime with:', appointmentId, completionData);
      
      // Thử gọi các endpoint khác nhau theo thứ tự
      let response = null;
      let error = null;
      
      try {
        // Thử đường dẫn chính
        response = await axiosClient.patch(
          `/Appointments/${appointmentId}/complete`, 
          completionData
        );
        return response.data;
      } catch (err) {
        error = err;
        console.log('First attempt failed, trying alternative...');
        
        try {
          // Thử không phân biệt hoa/thường
          response = await axiosClient.patch(
            `/appointments/${appointmentId}/complete`, 
            completionData
          );
          return response.data;
        } catch (err2) {
          console.log('Second attempt failed, trying status update...');
          
          // Thử cập nhật trạng thái
          response = await axiosClient.patch(
            `/Appointments/${appointmentId}/Status`, 
            { 
              status: "Completed", 
              notes: completionData.notes 
            }
          );
          return response.data;
        }
      }
    } catch (error) {
      console.error('Error in updateCompletionTime:', error);
      throw error.response?.data?.message || error.message || 'Không thể cập nhật thời gian hoàn thành';
    }
  },

  // Tạo phương thức tạm để cho phép gọi getUserAppointments trong getPetBusyTimeSlots
  getUserAppointmentsTemp: async () => {
    try {
      const response = await appointmentService.getUserAppointments();
      return response;
    } catch (error) {
      console.error("Error fetching user appointments:", error);
      return [];
    }
  },

  // Lưu tham chiếu đến phương thức getAvailableTimeSlots gốc
  originalGetAvailableTimeSlots: async (date, serviceId, staffId = null, petId = null) => {
    try {
      if (!date || !serviceId) {
        console.log('Missing required parameters for getAvailableTimeSlots');
        return [];
      }
      
      // Format date thành YYYY-MM-DD mà không bị ảnh hưởng bởi múi giờ
      let formattedDate;
      
      // Nếu date là đối tượng Date, lấy giá trị trực tiếp từ các thành phần
      if (date instanceof Date) {
        formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else if (typeof date === 'string') {
        // Nếu date là chuỗi ISO, tách phần ngày
        if (date.includes('T')) {
          formattedDate = date.split('T')[0];
        } else {
          // Nếu không, giữ nguyên (giả định đã là YYYY-MM-DD)
          formattedDate = date;
        }
      } else {
        // Fallback: dùng dayjs để format
        formattedDate = dayjs(date).format('YYYY-MM-DD');
      }
      
      // LẤY DANH SÁCH BUSY SLOTS CỦA THÚ CƯNG TRƯỚC
      let petBusySlots = [];
      if (petId && !isNaN(parseInt(petId))) {
        try {
          console.log(`🔍 Fetching busy slots for pet ID ${petId} before processing time slots`);
          // Gọi phương thức getPetBusyTimeSlots
          petBusySlots = await appointmentService.getPetBusyTimeSlots(petId, formattedDate);
          
          if (petBusySlots && Array.isArray(petBusySlots)) {
            console.log(`📌 Found ${petBusySlots.length} busy slots for pet ${petId}:`, petBusySlots);
          }
        } catch (error) {
          console.error(`Error fetching pet busy slots for pet ${petId}:`, error);
          
          // Thử đọc từ localStorage nếu API lỗi
          try {
            const storageKey = `petBusySlots_${petId}_${formattedDate}`;
            const savedSlots = localStorage.getItem(storageKey);
            if (savedSlots) {
              petBusySlots = JSON.parse(savedSlots);
              console.log(`Using ${petBusySlots.length} saved busy slots from localStorage for pet ${petId}`);
            }
          } catch (storageError) {
            console.error('Error reading pet busy slots from localStorage:', storageError);
          }
        }
      }
      
      // Gọi API để lấy các slot khả dụng
      try {
        console.log(`Requesting available time slots for date ${formattedDate}, service ${serviceId}, staff ${staffId || 'any'}, pet ${petId || 'none'}`);
        
        // Tạo query params
        const queryParams = new URLSearchParams();
        queryParams.append('date', formattedDate);
        queryParams.append('serviceId', serviceId);
          // Thêm các tham số mới
        if (staffId) queryParams.append('staffIdParam', staffId);
        if (petId && !isNaN(parseInt(petId))) {
          queryParams.append('petId', parseInt(petId));
          console.log(`Including petId=${petId} in query params`);
        }
        queryParams.append('includeUnavailable', 'true'); // Luôn lấy cả các slot không khả dụng
        
        // Gọi API với tên endpoint chính xác
        const endpoint = `/Appointments/available-slots?${queryParams.toString()}`;
        console.log(`Calling endpoint: ${endpoint}`);
        
        const response = await axiosClient.get(endpoint);
        console.log('Available slots response:', response.data);
        
        let resultSlots = [];
        
        // Kiểm tra cấu trúc dữ liệu mới (có metadata và slots)
        if (response.data && response.data.slots && Array.isArray(response.data.slots)) {
          const slots = response.data.slots;
          const metadata = response.data.metadata || {};
          
          console.log('Response metadata:', metadata);
          
          // Chuẩn hóa dữ liệu trả về
          resultSlots = slots.map(slot => {
            // Tạo đối tượng date từ formattedDate và startTime để đảm bảo múi giờ chính xác
            let startTime;
            let timeStr;
            
            if (slot.startTime instanceof Date) {
              startTime = new Date(slot.startTime);
              timeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
            } else if (typeof slot.startTime === 'string') {
              if (slot.startTime.includes('T')) {
                // Nếu startTime là chuỗi ISO, tách lấy phần giờ
                timeStr = slot.startTime.split('T')[1].substring(0, 5);
              } else {
                // Nếu startTime là chuỗi HH:MM, sử dụng trực tiếp
                timeStr = slot.startTime;
              }
              
              // Tạo đối tượng Date mới với ngày và giờ chính xác
              const [year, month, day] = formattedDate.split('-').map(Number);
              const [hour, minute] = timeStr.split(':').map(Number);
              
              startTime = new Date(year, month - 1, day, hour, minute);
            } else if (slot.StartTime) {
              // Trường hợp chuẩn hóa tên trường từ backend
              if (typeof slot.StartTime === 'string') {
                if (slot.StartTime.includes('T')) {
                  timeStr = slot.StartTime.split('T')[1].substring(0, 5);
                } else {
                  timeStr = slot.StartTime;
                }
              } else {
                const tempDate = new Date(slot.StartTime);
                timeStr = `${tempDate.getHours().toString().padStart(2, '0')}:${tempDate.getMinutes().toString().padStart(2, '0')}`;
              }
              
              const [year, month, day] = formattedDate.split('-').map(Number);
              const [hour, minute] = timeStr.split(':').map(Number);
              
              startTime = new Date(year, month - 1, day, hour, minute);
            } else {
              // Fallback nếu không có thông tin startTime
              startTime = new Date(formattedDate);
              timeStr = '00:00';
            }
            
            // ✅ FIXED: Ưu tiên dữ liệu từ backend API thay vì local petBusySlots
            // Kiểm tra xem slot này có trùng với lịch của thú cưng không
            const isPetBusyFromLocal = petBusySlots.includes(timeStr);
            
            // ✅ NEW: Ưu tiên isPetBusy từ backend, fallback về local check
            const finalIsPetBusy = slot.isPetBusy !== undefined ? slot.isPetBusy : isPetBusyFromLocal;
            const finalIsStaffBusy = slot.isStaffBusy !== undefined ? slot.isStaffBusy : false;
            
            if (finalIsPetBusy) {
              console.log(`🐕 [API Service] Slot at ${timeStr} is pet busy:`, {
                fromBackend: slot.isPetBusy,
                fromLocal: isPetBusyFromLocal,
                final: finalIsPetBusy
              });
            }
            
            if (finalIsStaffBusy) {
              console.log(`👤 [API Service] Slot at ${timeStr} is staff busy:`, {
                fromBackend: slot.isStaffBusy,
                final: finalIsStaffBusy,
                reason: slot.unavailableReason
              });
            }
            
            return {
              id: slot.id || `slot-${startTime.getTime()}`,
              startTime: startTime,
              endTime: new Date(slot.endTime || slot.EndTime || (function() {
                // Tính endTime dựa trên startTime và duration
                const duration = slot.duration || metadata.ServiceDuration || 30;
                const endTime = new Date(startTime);
                endTime.setMinutes(endTime.getMinutes() + duration);
                return endTime;
              })()),
              staffId: slot.staffId || slot.StaffId,
              staffName: slot.staffName || slot.StaffName || 'Nhân viên',
              // ✅ FIXED: Ưu tiên dữ liệu từ backend để tính available
              available: finalIsPetBusy || finalIsStaffBusy ? false : (slot.available !== undefined ? slot.available : (slot.isAvailable !== undefined ? slot.isAvailable : true)),
              isAvailable: finalIsPetBusy || finalIsStaffBusy ? false : (slot.available !== undefined ? slot.available : (slot.isAvailable !== undefined ? slot.isAvailable : true)),
              duration: slot.duration || metadata.ServiceDuration || 0,
              // ✅ FIXED: Sử dụng giá trị final đã xử lý
              isPetBusy: finalIsPetBusy,
              isStaffBusy: finalIsStaffBusy,
              isBusy: finalIsPetBusy || finalIsStaffBusy || !slot.available || !slot.isAvailable,
              isPast: slot.isPast || false,
              isWithinWorkingHours: slot.isWithinWorkingHours !== false,
              unavailableReason: finalIsPetBusy ? 'Thú cưng đã có lịch hẹn vào khung giờ này' : 
                                 (finalIsStaffBusy ? 'Nhân viên đã có lịch hẹn vào khung giờ này' : (slot.unavailableReason || '')),
              // Đảm bảo availableStaff luôn là một mảng
              availableStaff: Array.isArray(slot.availableStaff) ? slot.availableStaff : 
                           (slot.staffId ? [{ staffId: slot.staffId, staffName: slot.staffName || 'Nhân viên' }] : []),
              // Lưu thêm định dạng string của thời gian để dễ sử dụng
              startTimeString: timeStr,
              // Lưu ngày đã chọn
              selectedDate: formattedDate,
              // Thêm thông tin chi tiết về ngày giờ
              exactHour: startTime.getHours(),
              exactMinute: startTime.getMinutes(),
              selectedDay: startTime.getDate(),
              selectedMonth: startTime.getMonth() + 1,
              selectedYear: startTime.getFullYear(),
              // Thêm chuỗi ISO tự tạo để tránh vấn đề múi giờ
              formattedISOString: `${formattedDate}T${timeStr}:00.000Z`
            };
          });
        } else if (Array.isArray(response.data)) {
          // Xử lý cấu trúc cũ (chỉ có mảng slots)
          resultSlots = response.data.map(slot => {
            // Tương tự như trên, xử lý startTime
            let startTime;
            let timeStr;
            
            if (slot.startTime instanceof Date) {
              startTime = new Date(slot.startTime);
              timeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
            } else if (typeof slot.startTime === 'string') {
              if (slot.startTime.includes('T')) {
                timeStr = slot.startTime.split('T')[1].substring(0, 5);
              } else {
                timeStr = slot.startTime;
              }
              
              const [year, month, day] = formattedDate.split('-').map(Number);
              const [hour, minute] = timeStr.split(':').map(Number);
              
              startTime = new Date(year, month - 1, day, hour, minute);
            } else if (slot.StartTime) {
              if (typeof slot.StartTime === 'string') {
                if (slot.StartTime.includes('T')) {
                  timeStr = slot.StartTime.split('T')[1].substring(0, 5);
                } else {
                  timeStr = slot.StartTime;
                }
              } else {
                const tempDate = new Date(slot.StartTime);
                timeStr = `${tempDate.getHours().toString().padStart(2, '0')}:${tempDate.getMinutes().toString().padStart(2, '0')}`;
              }
              
              const [year, month, day] = formattedDate.split('-').map(Number);
              const [hour, minute] = timeStr.split(':').map(Number);
              
              startTime = new Date(year, month - 1, day, hour, minute);
            } else {
              startTime = new Date(formattedDate);
              timeStr = '00:00';
            }
            
            // ✅ FIXED: Tương tự cho trường hợp cấu trúc cũ
            // Kiểm tra xem slot này có trùng với lịch của thú cưng không
            const isPetBusyFromLocal = petBusySlots.includes(timeStr);
            
            // ✅ NEW: Ưu tiên isPetBusy từ backend, fallback về local check
            const finalIsPetBusy = slot.isPetBusy !== undefined ? slot.isPetBusy : isPetBusyFromLocal;
            const finalIsStaffBusy = slot.isStaffBusy !== undefined ? slot.isStaffBusy : false;
            
            if (finalIsPetBusy) {
              console.log(`🐕 [API Service Legacy] Slot at ${timeStr} is pet busy`);
            }
            
            if (finalIsStaffBusy) {
              console.log(`👤 [API Service Legacy] Slot at ${timeStr} is staff busy`);
            }
            
            return {
              id: slot.id || `slot-${startTime.getTime()}`,
              startTime: startTime,
              endTime: new Date(slot.endTime || slot.EndTime || (function() {
                const duration = slot.duration || 30;
                const endTime = new Date(startTime);
                endTime.setMinutes(endTime.getMinutes() + duration);
                return endTime;
              })()),
              staffId: slot.staffId || slot.StaffId,
              staffName: slot.staffName || slot.StaffName || 'Nhân viên',
              available: finalIsPetBusy || finalIsStaffBusy ? false : (slot.available !== undefined ? slot.available : (slot.isAvailable !== undefined ? slot.isAvailable : true)),
              isAvailable: finalIsPetBusy || finalIsStaffBusy ? false : (slot.available !== undefined ? slot.available : (slot.isAvailable !== undefined ? slot.isAvailable : true)),
              duration: slot.duration || 0,
              // ✅ FIXED: Sử dụng giá trị final đã xử lý
              isPetBusy: finalIsPetBusy,
              isStaffBusy: finalIsStaffBusy,
              unavailableReason: finalIsPetBusy ? 'Thú cưng đã có lịch hẹn vào khung giờ này' : 
                                 (finalIsStaffBusy ? 'Nhân viên đã có lịch hẹn vào khung giờ này' : (slot.unavailableReason || ''))
            };
          });
        }
        
        return resultSlots;
      } catch (error) {
        console.error("Error fetching available time slots:", error);
        return [];
      }
    } catch (error) {
      console.error("Error in originalGetAvailableTimeSlots:", error);
      return [];
    }
  },
  
  // Tạo một phương thức mới kết hợp getAvailableTimeSlots với thông tin bận của thú cưng  
  enhancedGetAvailableTimeSlots: async (date, serviceId, staffId = null, petId = null) => {
    try {
      // LẤY DANH SÁCH BUSY SLOTS CỦA THÚ CƯNG TRƯỚC
      let petBusySlots = [];
      if (petId) {
        try {
          // Format date để tránh vấn đề múi giờ
          let formattedDate;
          
          if (date instanceof Date) {
            formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          } else if (typeof date === 'string') {
            if (date.includes('T')) {
              formattedDate = date.split('T')[0];
            } else {
              formattedDate = date;
            }
          } else {
            formattedDate = dayjs(date).format('YYYY-MM-DD');
          }
          
          console.log(`Lấy danh sách khung giờ bận của thú cưng ${petId} ngày ${formattedDate} trước khi xử lý`);
          petBusySlots = await appointmentService.getPetBusyTimeSlots(petId, formattedDate);
          console.log(`Đã lấy được ${petBusySlots.length} khung giờ bận của thú cưng ${petId}:`, petBusySlots);
        } catch (error) {
          console.error("Error fetching pet busy slots:", error);
          petBusySlots = [];
        }
      }
      
      // Gọi lại hàm gốc và truyền petBusySlots 
      const result = await appointmentService.getAvailableTimeSlots(date, serviceId, staffId, petId);
      
      // Thêm thông tin busy slots vào kết quả
      if (result && Array.isArray(result) && petBusySlots && Array.isArray(petBusySlots)) {
        console.log(`Đang kiểm tra ${result.length} khung giờ với ${petBusySlots.length} khung giờ bận của thú cưng`);
        
        return result.map(slot => {
          // Kiểm tra slot có trùng với busy slot không
          const timeStr = slot.startTimeString || 
                         (slot.startTime instanceof Date ? 
                          dayjs(slot.startTime).format('HH:mm') : 
                          (typeof slot.startTime === 'string' ? slot.startTime : ''));
                          
          const isPetBusy = petBusySlots.includes(timeStr);
          
          // Nếu trùng, đánh dấu là busy
          if (isPetBusy) {
            console.log(`Đánh dấu slot ${timeStr} là bận vì trùng với lịch của thú cưng ${petId}`);
            return {
              ...slot,
              isPetBusy: true,
              available: false,
              isAvailable: false,
              isBusy: true,
              unavailableReason: 'Thú cưng đã có lịch hẹn vào khung giờ này'
            };
          }
          
          return slot;
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error in enhanced getAvailableTimeSlots:", error);
      // Fallback: gọi hàm gốc nếu có lỗi
      return appointmentService.getAvailableTimeSlots(date, serviceId, staffId, petId);
    }
  },
  
  // Cập nhật phương thức getPetBusyTimeSlots với xử lý múi giờ tốt hơn
  getPetBusyTimeSlots: async (petId, date) => {
    try {
      // Kiểm tra xem có petId và date không
      if (!petId || !date) {
        console.error("Missing petId or date in getPetBusyTimeSlots");
        return [];
      }
      
      // Chuẩn hóa format ngày tháng
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      console.log(`🔍 [getPetBusyTimeSlots] Lấy lịch bận của thú cưng ${petId} vào ngày ${formattedDate}`);
      
      // ===== LUÔN GỌI API MỚI NHẤT, KHÔNG DÙNG CACHE =====
      console.log(`📡 [getPetBusyTimeSlots] Bỏ qua cache, gọi API mới nhất cho ngày ${formattedDate}`);
      
      // Ưu tiên dùng API endpoint chuyên biệt nếu có
      try {
        // Tạo queryParams để truyền lên API
        const queryParams = new URLSearchParams();
        queryParams.append('date', formattedDate);
        
        // Thử gọi API chuyên biệt
        const response = await axiosClient.get(`/Appointments/Pet/${petId}/busy-slots?${queryParams}`);
        console.log(`✅ [getPetBusyTimeSlots] Kết quả lấy lịch bận từ API chuyên biệt cho ngày ${formattedDate}:`, response.data);
        
        // Nếu API trả về kết quả hợp lệ, sử dụng luôn
        if (response.data && Array.isArray(response.data)) {
          console.log(`📋 [getPetBusyTimeSlots] API chuyên biệt trả về ${response.data.length} busy slots cho ngày ${formattedDate}`);
          return response.data;
        }
      } catch (apiError) {
        console.warn(`⚠️ [getPetBusyTimeSlots] Không thể gọi API chuyên biệt cho ngày ${formattedDate}, chuyển sang phương thức dự phòng:`, apiError.message);
      }
      
      // Phương thức dự phòng: lấy tất cả các cuộc hẹn của người dùng
      console.log(`🔄 [getPetBusyTimeSlots] Sử dụng phương thức dự phòng - lấy tất cả appointments của user`);
      const userAppointments = await appointmentService.getUserAppointments();
      
      console.log(`📊 [getPetBusyTimeSlots] Tổng cộng ${userAppointments?.length || 0} appointments của user`);
      
      // Debug: Log tất cả appointments với ngày giờ chi tiết
      if (userAppointments && userAppointments.length > 0) {
        console.log(`🔍 [getPetBusyTimeSlots] Debug tất cả appointments của user:`);
        userAppointments.forEach((apt, index) => {
          const aptDate = dayjs(apt.appointmentDate).format('YYYY-MM-DD');
          const aptTime = dayjs(apt.appointmentDate).format('HH:mm');
          console.log(`  📅 [${index + 1}] Pet ${apt.petId}, Date: ${aptDate}, Time: ${aptTime}, Status: ${apt.status}, Target: ${formattedDate}, Match: ${aptDate === formattedDate && String(apt.petId) === String(petId)}`);
        });
      }
      
      // Lọc ra các cuộc hẹn của thú cưng đã chọn trong ngày đã chọn
      const petAppointments = userAppointments.filter(apt => {
        // Chỉ lấy các cuộc hẹn của thú cưng đã chọn
        if (!apt.petId || String(apt.petId) !== String(petId)) {
          return false;
        }
        
        // Chỉ lấy các cuộc hẹn trong ngày đã chọn - xử lý múi giờ cẩn thận
        const appointmentDate = dayjs(apt.appointmentDate).format('YYYY-MM-DD');
        if (appointmentDate !== formattedDate) {
          return false;
        }
        
        // Bỏ qua các cuộc hẹn đã hủy hoặc đã hoàn thành, nhưng KHÔNG bỏ qua "Không đến"
        if (['Cancelled', 'Completed'].includes(apt.status)) {
          return false;
        }
        
        return true;
      });
      
      // Tạo danh sách các khung giờ bận từ các cuộc hẹn
      if (petAppointments.length > 0) {
        console.log(`Thú cưng ${petId} có ${petAppointments.length} cuộc hẹn vào ngày ${formattedDate}`);
        
        const busySlots = petAppointments.map(apt => {
          // Lấy thời gian bắt đầu của cuộc hẹn với xử lý định dạng nhất quán
          const timeStr = dayjs(apt.appointmentDate).format('HH:mm');
          console.log(`Cuộc hẹn vào lúc ${timeStr} (${apt.service?.name || 'Không xác định dịch vụ'}) - Trạng thái: ${apt.status || 'Không xác định'}`);
          return timeStr;
        });
        
        // Lưu cache kết quả để sử dụng sau này
        try {
          const cacheKey = `petBusySlots_${petId}_${formattedDate}`;
          localStorage.setItem(cacheKey, JSON.stringify(busySlots));
          console.log(`Đã lưu ${busySlots.length} khung giờ bận vào cache với key ${cacheKey}`);
        } catch (cacheError) {
          console.warn('Không thể lưu cache:', cacheError);
        }
        
        return busySlots;
      }
      
      return [];
    } catch (error) {
      console.error("Error in getPetBusyTimeSlots:", error);
      return [];
    }
  },
  
  // Thêm phương thức mới để lấy danh sách đầy đủ các cuộc hẹn của thú cưng
  getPetAppointments: async (petId, date) => {
    try {
      // Kiểm tra xem có petId và date không
      if (!petId || !date) {
        console.error("Missing petId or date in getPetAppointments");
        return [];
      }
      
      // Lấy tất cả các cuộc hẹn của người dùng
      const userAppointments = await appointmentService.getUserAppointments();
      
      // Lọc ra các cuộc hẹn của thú cưng đã chọn trong ngày đã chọn
      const petAppointments = userAppointments.filter(apt => {
        // Chỉ lấy các cuộc hẹn của thú cưng đã chọn
        if (!apt.petId || String(apt.petId) !== String(petId)) {
          return false;
        }
        
        // Chỉ lấy các cuộc hẹn trong ngày đã chọn
        const appointmentDate = dayjs(apt.appointmentDate).format('YYYY-MM-DD');
        if (appointmentDate !== dayjs(date).format('YYYY-MM-DD')) {
          return false;
        }
        
        // Bỏ qua các cuộc hẹn đã hủy, nhưng KHÔNG bỏ qua "Không đến" và "Đã hoàn thành" để chắc chắn
        if (['Cancelled'].includes(apt.status)) {
          return false;
        }
        
        // Đặc biệt lưu ý các cuộc hẹn có trạng thái "Không đến" để đánh dấu là bận
        if (apt.status === 'No-Show') {
          console.log(`Giữ lại cuộc hẹn trạng thái "Không đến" cho thú cưng ${petId} vào lúc ${dayjs(apt.appointmentDate).format('HH:mm')}`);
          return true;
        }
        
        return true;
      });
      
      if (petAppointments.length > 0) {
        console.log(`Thú cưng ${petId} có ${petAppointments.length} cuộc hẹn đầy đủ vào ngày ${dayjs(date).format('YYYY-MM-DD')}`);
        
        // In chi tiết các cuộc hẹn và trạng thái để debug
        petAppointments.forEach(apt => {
          const timeStr = dayjs(apt.appointmentDate).format('HH:mm');
          console.log(`- Cuộc hẹn vào lúc ${timeStr} (${apt.service?.name || 'Không xác định dịch vụ'}) - Trạng thái: ${apt.status || 'Không xác định'}`);
        });
        
        // Thêm thông tin thời lượng mặc định nếu không có
        const appointmentsWithDuration = petAppointments.map(apt => {
          if (!apt.duration) {
            // Nếu có dịch vụ và dịch vụ có thời lượng
            if (apt.service && apt.service.duration) {
              return {
                ...apt,
                duration: apt.service.duration
              };
            }
            // Mặc định 90 phút nếu không có thông tin
            return {
              ...apt,
              duration: 90
            };
          }
          return apt;
        });
        
        return appointmentsWithDuration;
      }
      
      return [];
    } catch (error) {
      console.error("Error in getPetAppointments:", error);
      return [];
    }
  },
  
  // Thêm phương thức mới để lấy các khung giờ bận của thú cưng trong khoảng thời gian
  getPetBusyTimeSlotsRange: async (petId, startDate, endDate = null) => {
    try {
      // Format dates thành ISO string
      const formattedStartDate = startDate instanceof Date ? 
        startDate.toISOString().split('T')[0] : 
        new Date(startDate).toISOString().split('T')[0];
      
      let queryParams = `startDate=${formattedStartDate}`;
      
      if (endDate) {
        const formattedEndDate = endDate instanceof Date ? 
          endDate.toISOString().split('T')[0] : 
          new Date(endDate).toISOString().split('T')[0];
        
        queryParams += `&endDate=${formattedEndDate}`;
      }
      
      console.log(`Fetching busy slots range for pet ${petId} with params: ${queryParams}`);
      
      const response = await axiosClient.get(`/Appointments/Pet/${petId}/busy-slots/range?${queryParams}`);
      console.log('Pet busy slots range response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error("Error fetching pet busy time slots range:", error);
      return [];
    }
  },
  
  // Thêm phương thức để lấy các khung giờ bận của nhân viên
  getStaffBusyTimeSlots: async (staffId, date) => {
    try {
      // Format date để tránh vấn đề múi giờ
      let formattedDate;
      
      if (date instanceof Date) {
        formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else if (typeof date === 'string') {
        if (date.includes('T')) {
          formattedDate = date.split('T')[0];
        } else {
          formattedDate = date;
        }
      } else {
        formattedDate = dayjs(date).format('YYYY-MM-DD');
      }

      console.log(`Fetching busy slots for staff ${staffId} on ${formattedDate}`);
      
      // Thử gọi API chuyên dụng trước
      try {
        const response = await axiosClient.get(`/Staff/${staffId}/busy-slots/${formattedDate}`);
        console.log(`Staff ${staffId} busy slots response:`, response.data);
        
        if (Array.isArray(response.data)) {
          return response.data;
        }
      } catch (apiError) {
        console.log(`Direct API failed for staff busy slots, falling back to schedule check:`, apiError.message);
      }
      
      // Fallback: lấy từ lịch làm việc của nhân viên
      try {
        const scheduleData = await appointmentService.checkStaffSchedule(staffId, formattedDate);
        
        if (scheduleData && scheduleData.appointments && Array.isArray(scheduleData.appointments)) {
          console.log(`Staff ${staffId} has ${scheduleData.appointments.length} appointments on ${formattedDate}`);
          
          // Lọc ra các lịch hẹn không bị hủy hoặc hoàn thành
          const activeAppointments = scheduleData.appointments.filter(apt => 
            !['Cancelled', 'Completed'].includes(apt.status)
          );
          
          // Tạo danh sách các khung giờ bận từ các cuộc hẹn
          const busySlots = activeAppointments.map(apt => {
            // Lấy thời gian bắt đầu của cuộc hẹn
            let timeStr;
            if (apt.appointmentDate) {
              timeStr = dayjs(apt.appointmentDate).format('HH:mm');
            } else if (apt.startTime) {
              timeStr = typeof apt.startTime === 'string' ? apt.startTime : dayjs(apt.startTime).format('HH:mm');
            } else if (apt.start) {
              timeStr = typeof apt.start === 'string' ? apt.start : dayjs(apt.start).format('HH:mm');
            } else {
              console.warn('Staff appointment missing time information:', apt);
              return null;
            }
            
            console.log(`Staff ${staffId} busy at ${timeStr} (${apt.service?.name || 'Unknown service'}) - Status: ${apt.status || 'Unknown'}`);
            return timeStr;
          }).filter(slot => slot !== null);
          
          // Lưu cache kết quả
          try {
            const cacheKey = `staffBusySlots_${staffId}_${formattedDate}`;
            localStorage.setItem(cacheKey, JSON.stringify(busySlots));
            console.log(`Cached ${busySlots.length} busy slots for staff ${staffId} with key ${cacheKey}`);
          } catch (cacheError) {
            console.warn('Cannot cache staff busy slots:', cacheError);
          }
          
          return busySlots;
        }
      } catch (scheduleError) {
        console.error(`Error fetching staff schedule for busy slots:`, scheduleError);
      }
      
      // Nếu tất cả đều thất bại, thử đọc từ cache
      try {
        const cacheKey = `staffBusySlots_${staffId}_${formattedDate}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const cachedSlots = JSON.parse(cachedData);
          console.log(`Using ${cachedSlots.length} cached busy slots for staff ${staffId}`);
          return cachedSlots;
        }
      } catch (cacheError) {
        console.error('Error reading staff busy slots from cache:', cacheError);
      }
      
      console.log(`No busy slots found for staff ${staffId} on ${formattedDate}`);
      return [];
    } catch (error) {
      console.error("Error fetching staff busy time slots:", error);
      return [];
    }
  },

  // Thêm phương thức để lấy lịch bận của nhân viên trong khoảng thời gian
  getStaffBusyTimeSlotsRange: async (staffId, startDate, endDate = null) => {
    try {
      // Format dates thành ISO string
      const formattedStartDate = startDate instanceof Date ? 
        startDate.toISOString().split('T')[0] : 
        new Date(startDate).toISOString().split('T')[0];
      
      let queryParams = `startDate=${formattedStartDate}`;
      
      if (endDate) {
        const formattedEndDate = endDate instanceof Date ? 
          endDate.toISOString().split('T')[0] : 
          new Date(endDate).toISOString().split('T')[0];
        
        queryParams += `&endDate=${formattedEndDate}`;
      }
      
      console.log(`Fetching busy slots range for staff ${staffId} with params: ${queryParams}`);
      
      try {
        const response = await axiosClient.get(`/Staff/${staffId}/busy-slots/range?${queryParams}`);
        console.log('Staff busy slots range response:', response.data);
        return response.data;
      } catch (apiError) {
        console.log(`Direct API failed for staff busy slots range, falling back to appointments:`, apiError.message);
        
        // Fallback: lấy từ appointments của nhân viên
        const staffAppointments = await appointmentService.getStaffAppointmentsByDateRange(
          staffId, 
          formattedStartDate, 
          endDate ? (endDate instanceof Date ? endDate.toISOString().split('T')[0] : new Date(endDate).toISOString().split('T')[0]) : formattedStartDate
        );
        
        // Chuyển đổi thành busy slots
        const busySlots = staffAppointments
          .filter(apt => !['Cancelled', 'Completed'].includes(apt.status))
          .map(apt => ({
            date: dayjs(apt.appointmentDate).format('YYYY-MM-DD'),
            time: dayjs(apt.appointmentDate).format('HH:mm'),
            duration: apt.duration || apt.serviceDuration || 60,
            appointmentId: apt.appointmentId,
            service: apt.service?.name || 'Unknown'
          }));
        
        return busySlots;
      }
    } catch (error) {
      console.error("Error fetching staff busy time slots range:", error);
      return [];
    }
  },
  
  // Thêm phương thức mới để kiểm tra lịch làm việc của nhân viên
  checkStaffSchedule: async (staffId, date) => {
    try {
      if (!staffId) {
        console.error('Missing staffId in checkStaffSchedule');
        return { 
          isWorking: true, 
          staffName: "Unknown",
          workingHours: [],
          appointments: []
        };
      }
      
      // Format date thành ISO string hoặc YYYY-MM-DD tùy theo yêu cầu API
      let formattedDate;
      
      if (typeof date === 'string') {
        // Kiểm tra xem date có phải chuỗi ISO không
        if (date.includes('T')) {
          formattedDate = date.split('T')[0]; // Lấy phần ngày từ chuỗi ISO
        } else {
          formattedDate = date; // Giữ nguyên nếu đã là dạng YYYY-MM-DD
        }
      } else if (date instanceof Date) {
        // Chuyển đổi Date thành chuỗi YYYY-MM-DD
        formattedDate = dayjs(date).format('YYYY-MM-DD');
      } else {
        // Nếu không phải chuỗi hoặc Date, thử chuyển đổi bằng dayjs
        formattedDate = dayjs(date).format('YYYY-MM-DD');
      }
      
      console.log(`Checking staff ${staffId} schedule on ${formattedDate}`);
      
      // Tạo cache key để tránh gọi API nhiều lần cho cùng một dữ liệu
      const cacheKey = `staffSchedule_${staffId}_${formattedDate}`;
      let cachedData = null;
      
      try {
        const cachedSchedule = localStorage.getItem(cacheKey);
        if (cachedSchedule) {
          cachedData = JSON.parse(cachedSchedule);
          console.log(`Using cached schedule for staff ${staffId}`);
        }
      } catch (cacheError) {
        console.warn('Error reading cache:', cacheError);
      }
      
      // Nếu có dữ liệu trong cache và chưa quá 5 phút, sử dụng cache
      if (cachedData && cachedData.timestamp) {
        const now = Date.now();
        const cacheAge = now - cachedData.timestamp;
        
        // Cache hợp lệ trong 5 phút (300000 ms)
        if (cacheAge < 300000) {
          // Kiểm tra xem có cần broadcast sự kiện staff-appointments-updated
          if (cachedData.data && Array.isArray(cachedData.data.appointments) && cachedData.data.appointments.length > 0) {
            try {
              window.dispatchEvent(new CustomEvent('staff-appointments-updated', {
                detail: {
                  staffId: staffId,
                  appointments: cachedData.data.appointments,
                  date: formattedDate
                }
              }));
              console.log(`Broadcasted ${cachedData.data.appointments.length} cached appointments for staff ${staffId}`);
            } catch (eventError) {
              console.error('Error broadcasting cached staff appointments event:', eventError);
            }
          }
          
          return cachedData.data;
        }
      }
      
      // Gọi API sử dụng axiosClient với URL đúng
      const response = await axiosClient.get(`/Appointments/staff-schedule`, {
        params: {
          staffId,
          date: formattedDate
        }
      });
      
      console.log('Staff schedule response:', response.data);
      
      // Kiểm tra và chuẩn hóa dữ liệu trả về
      const data = response.data;
      
      // Nếu API trả về mảng appointments, đảm bảo mỗi appointment có startTime và endTime
      if (data && Array.isArray(data.appointments)) {
        data.appointments = data.appointments.map(apt => {
          // Nếu appointment chỉ có appointmentDate thay vì startTime
          if (apt.appointmentDate && !apt.startTime) {
            return {
              ...apt,
              startTime: dayjs(apt.appointmentDate).format('HH:mm'), // Thêm startTime
              duration: apt.duration || apt.serviceDuration || 60 // Đảm bảo có duration
            };
          }
          return apt;
        });
        
        // Broadcast sự kiện để các component khác biết
        try {
          window.dispatchEvent(new CustomEvent('staff-appointments-updated', {
            detail: {
              staffId: staffId,
              appointments: data.appointments,
              date: formattedDate
            }
          }));
          console.log(`Broadcasted ${data.appointments.length} appointments for staff ${staffId}`);
        } catch (eventError) {
          console.error('Error broadcasting staff appointments event:', eventError);
        }
      }
      
      // Lưu vào cache
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: data
        }));
      } catch (cacheError) {
        console.warn('Error caching staff schedule:', cacheError);
      }
      
      return data;
    } catch (error) {
      console.error("Error checking staff schedule:", error);
      // Trả về mặc định để tránh crash
      return { 
        isWorking: true, 
        staffName: "Error",
        workingHours: [],
        appointments: []
      };
    }
  },
  
  // Thêm phương thức mới để lấy danh sách nhân viên khả dụng trong ngày
  getAvailableStaff: async (date, serviceId) => {
    try {
      // Format date thành ISO string
      const formattedDate = date instanceof Date ? 
        date.toISOString() : 
        new Date(date).toISOString();
      
      console.log(`Fetching available staff for service ${serviceId} on ${formattedDate}`);
      
      const response = await axiosClient.get(`/Appointments/available-staff?date=${formattedDate}&serviceId=${serviceId}`);
      console.log('Available staff response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error("Error fetching available staff:", error);
      return [];
    }
  },
  
  // Thêm phương thức để kiểm tra xung đột lịch hẹn
  checkAppointmentConflicts: async (checkData) => {
    try {
      console.log('Checking appointment conflicts:', checkData);
      
      const response = await axiosClient.post('/Appointments/check-conflicts', checkData);
      console.log('Conflict check response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error("Error checking appointment conflicts:", error);
      return { hasConflicts: true, conflicts: [], error: error.message };
    }
  },

  // Thêm phương thức để lấy lịch sử chỉnh sửa lịch hẹn
  getAppointmentEditHistory: async (appointmentId) => {
    try {
      console.log(`Đang lấy lịch sử chỉnh sửa cho lịch hẹn ${appointmentId}`);
      const response = await axiosClient.get(`/Appointments/${appointmentId}/history`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment edit history for ID ${appointmentId}:`, error);
      // Trả về mảng rỗng nếu có lỗi để không ảnh hưởng đến luồng xử lý
      return [];
    }
  },

  // ===== THÊM FUNCTION GETAVAILABLETIMESLOTS THIẾU =====
  getAvailableTimeSlots: async (date, serviceId, staffId = null, petId = null) => {
    try {
      if (!date || !serviceId) {
        console.log('Missing required parameters for getAvailableTimeSlots');
        return [];
      }
      
      // Format date thành YYYY-MM-DD
      let formattedDate;
      if (date instanceof Date) {
        formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else if (typeof date === 'string') {
        if (date.includes('T')) {
          formattedDate = date.split('T')[0];
        } else {
          formattedDate = date;
        }
      } else {
        formattedDate = dayjs(date).format('YYYY-MM-DD');
      }
      
      console.log(`🔍 getAvailableTimeSlots for date ${formattedDate}, service ${serviceId}, staff ${staffId || 'any'}, pet ${petId || 'none'}`);
        // Tạo query params
      const queryParams = new URLSearchParams();
      queryParams.append('date', formattedDate);
      queryParams.append('serviceId', serviceId);
      
      if (staffId) queryParams.append('staffIdParam', staffId);
      if (petId && !isNaN(parseInt(petId))) {
        queryParams.append('petId', parseInt(petId));
      }
      queryParams.append('includeUnavailable', 'true');
      
      // Gọi API
      const endpoint = `/Appointments/available-slots?${queryParams.toString()}`;
      console.log(`📡 Calling endpoint: ${endpoint}`);
      
      const response = await axiosClient.get(endpoint);
      console.log('✅ Available slots response:', response.data);
      
      let resultSlots = [];
      
      // Xử lý response data
      if (response.data && response.data.slots && Array.isArray(response.data.slots)) {
        resultSlots = response.data.slots;
      } else if (Array.isArray(response.data)) {
        resultSlots = response.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        return [];
      }
      
      // Chuẩn hóa dữ liệu
      const normalizedSlots = resultSlots.map(slot => {
        let startTime, timeStr;
        
        if (slot.startTime instanceof Date) {
          startTime = new Date(slot.startTime);
          timeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
        } else if (typeof slot.startTime === 'string') {
          if (slot.startTime.includes('T')) {
            timeStr = slot.startTime.split('T')[1].substring(0, 5);
          } else {
            timeStr = slot.startTime;
          }
          
          const [year, month, day] = formattedDate.split('-').map(Number);
          const [hour, minute] = timeStr.split(':').map(Number);
          startTime = new Date(year, month - 1, day, hour, minute);
        } else {
          startTime = new Date(formattedDate);
          timeStr = '00:00';
        }
        
        // Calculate endTime string
        const endTime = slot.endTime instanceof Date ? slot.endTime : 
                       typeof slot.endTime === 'string' && slot.endTime.includes('T') ? new Date(slot.endTime) :
                       new Date(startTime.getTime() + (slot.duration || 30) * 60000);
        
        const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
        
        return {
          id: slot.id || `slot-${startTime.getTime()}`,
          startTime: timeStr, // ✅ RETURN STRING INSTEAD OF DATE
          startTimeString: timeStr,
          endTime: endTimeStr, // ✅ RETURN STRING INSTEAD OF DATE
          staffId: slot.staffId,
          staffName: slot.staffName || 'Nhân viên',
          available: slot.available !== undefined ? slot.available : true,
          isAvailable: slot.isAvailable !== undefined ? slot.isAvailable : true,
          duration: slot.duration || 30,
          isPast: slot.isPast || false,
          // ✅ THÊM CÁC TRƯỜNG CẦN THIẾT
          isPetBusy: slot.isPetBusy || false,
          isStaffBusy: slot.isStaffBusy || false,
          unavailableReason: slot.unavailableReason || ''
        };
      });
      
      console.log(`📋 Processed ${normalizedSlots.length} time slots`);
      return normalizedSlots;
      
    } catch (error) {
      console.error("❌ Error in getAvailableTimeSlots:", error);
      return [];
    }
  },
};

// Tạo phương thức tạm để cho phép gọi getUserAppointments trong getPetBusyTimeSlots
const getUserAppointmentsTemp = appointmentService.getUserAppointments;

export default appointmentService;