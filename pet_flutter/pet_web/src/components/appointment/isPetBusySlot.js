// Fixed version of isPetBusySlot function
import dayjs from 'dayjs';

/**
 * Kiểm tra xem thời gian cụ thể có phải là khung giờ bận của thú cưng không
 * @param {string} timeStr - Thời gian cần kiểm tra (format: "HH:mm")
 * @param {Array} petBusyTimeSlots - Danh sách khung giờ bận (format: ["08:00", "09:00", ...])
 * @param {Array} petAppointments - Danh sách lịch hẹn của thú cưng
 * @param {number} slotDuration - Thời lượng dịch vụ thực tế (phút)
 * @param {number} excludeAppointmentId - ID cuộc hẹn cần loại trừ (khi chỉnh sửa)
 * @returns {boolean} - true nếu thú cưng bận, false nếu rảnh
 */
export const isPetBusySlot = (timeStr, petBusyTimeSlots, petAppointments, slotDuration = 30, excludeAppointmentId = null) => {
  if (!timeStr) return false;
  
  const bufferTime = 10; // Buffer time cố định 10 phút như backend
  
  // 1. Kiểm tra trong danh sách busy time slots trước
  if (petBusyTimeSlots && Array.isArray(petBusyTimeSlots) && petBusyTimeSlots.includes(timeStr)) {
    return true;
  }
  
  // 2. Kiểm tra với danh sách lịch hẹn chi tiết
  if (!petAppointments || !Array.isArray(petAppointments) || petAppointments.length === 0) {
    return false;
  }
  
  // Chuyển đổi timeStr thành phút từ đầu ngày
  const [hours, minutes] = timeStr.split(':').map(Number);
  const slotStartMinutes = hours * 60 + minutes;
  const slotEndMinutes = slotStartMinutes + slotDuration;
  const slotBufferEndMinutes = slotEndMinutes + bufferTime;
  
  // Kiểm tra từng cuộc hẹn
  return petAppointments.some(appointment => {
    // Loại trừ cuộc hẹn hiện tại khi chỉnh sửa
    if (excludeAppointmentId && appointment.appointmentId === excludeAppointmentId) {
      return false;
    }
    
    // Bỏ qua các cuộc hẹn đã hủy hoặc hoàn thành
    if (['Cancelled', 'Completed'].includes(appointment.status)) {
      return false;
    }
    
    // Lấy thời gian bắt đầu của cuộc hẹn
    let appointmentStartMinutes = 0;
    let appointmentDuration = slotDuration; // Default duration
    
    if (appointment.appointmentDate) {
      const appointmentDate = new Date(appointment.appointmentDate);
      appointmentStartMinutes = appointmentDate.getHours() * 60 + appointmentDate.getMinutes();
      
      // Ưu tiên lấy duration từ service, sau đó từ appointment
      appointmentDuration = appointment.service?.duration || 
                           appointment.serviceDuration || 
                           appointment.duration || 
                           slotDuration;
    } else if (appointment.startTime) {
      const [aptHours, aptMinutes] = appointment.startTime.split(':').map(Number);
      appointmentStartMinutes = aptHours * 60 + aptMinutes;
      appointmentDuration = appointment.duration || appointment.serviceDuration || slotDuration;
    } else {
      return false; // Không có thông tin thời gian
    }
    
    // Tính thời gian kết thúc của cuộc hẹn (bao gồm buffer)
    const appointmentEndMinutes = appointmentStartMinutes + appointmentDuration;
    const appointmentBufferEndMinutes = appointmentEndMinutes + bufferTime;
    
    // Kiểm tra overlap: slot overlaps với appointment + buffer
    // Logic chính xác: slot start < appointment buffer end && slot buffer end > appointment start
    return slotStartMinutes < appointmentBufferEndMinutes && slotBufferEndMinutes > appointmentStartMinutes;
  });
}; 