import dayjs from 'dayjs';

/**
 * Chuyển đổi đối tượng Date sang chuỗi ISO với múi giờ
 * @param {Date} date - Đối tượng Date cần định dạng
 * @returns {string} - Chuỗi ISO với thông tin múi giờ
 */
export const formatDateTimeWithTimeZoneOffset = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

/**
 * Định dạng chuỗi ngày tháng để hiển thị
 * @param {string} dateString - Chuỗi ngày tháng (ISO format hoặc khác)
 * @returns {string} - Chuỗi ngày tháng đã định dạng
 */
export const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  } catch (error) {
    console.error('Lỗi định dạng ngày:', error);
    return 'Ngày không hợp lệ';
  }
};

/**
 * Định dạng chuỗi thời gian để hiển thị
 * @param {string} dateString - Chuỗi ngày tháng (ISO format hoặc khác)
 * @returns {string} - Chuỗi thời gian (giờ:phút)
 */
export const formatDisplayTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Lỗi định dạng giờ:', error);
    return '';
  }
};

/**
 * Chuyển đổi chuỗi ngày tháng sang định dạng cho input
 * @param {string} dateString - Chuỗi ngày tháng (ISO format hoặc khác)
 * @returns {string} - Chuỗi ngày tháng định dạng YYYY-MM-DD
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

/**
 * Kết hợp chuỗi ngày và thời gian
 * @param {string} date - Chuỗi ngày (YYYY-MM-DD)
 * @param {string} time - Chuỗi thời gian (HH:MM)
 * @returns {string} - Chuỗi ISO datetime
 */
export const combineDateTime = (date, time) => {
  if (!date) return null;
  if (!time) return `${date}T00:00:00`;
  return `${date}T${time}:00`;
};

// =============== BỔ SUNG THÊM CÁC HÀM XỬ LÝ TIME SLOT ===============

// Cấu hình giờ làm việc của cửa hàng
export const BUSINESS_HOURS = {
  start: "08:00",
  end: "21:30"
};

// Thời lượng mặc định cho mỗi slot (phút) - chỉ dùng khi không có thông tin dịch vụ
export const DEFAULT_SLOT_DURATION = 30; // Thay đổi từ 60 về 30 để phù hợp với backend
export const BUFFER_TIME_MINUTES = 10; // Buffer time giống backend

/**
 * Tạo mảng các time slot dựa trên giờ làm việc và thời lượng dịch vụ thực tế
 * @param {string} startTime - Giờ bắt đầu (format: "HH:mm")
 * @param {string} endTime - Giờ kết thúc (format: "HH:mm")
 * @param {number} serviceDuration - Thời lượng dịch vụ thực tế (phút)
 * @param {number} bufferTime - Thời gian buffer giữa các slot (phút)
 * @returns {Array} - Mảng các time slot
 */
export const generateTimeSlots = (
  startTime = BUSINESS_HOURS.start,
  endTime = BUSINESS_HOURS.end,
  serviceDuration = DEFAULT_SLOT_DURATION,
  bufferTime = BUFFER_TIME_MINUTES
) => {
  const slots = [];
  let currentTime = dayjs(`2023-01-01T${startTime}`);
  const end = dayjs(`2023-01-01T${endTime}`);
  
  // Tính interval thực tế: thời lượng dịch vụ + buffer time
  const actualSlotInterval = serviceDuration + bufferTime;

  while (currentTime.isBefore(end)) {
    const slotStart = currentTime.format('HH:mm');
    const slotServiceEnd = currentTime.add(serviceDuration, 'minute');
    const slotBufferEnd = currentTime.add(actualSlotInterval, 'minute');
    
    // Nếu thời điểm kết thúc dịch vụ vượt quá giờ đóng cửa thì dừng
    if (slotServiceEnd.isAfter(end)) break;
    
    const slotEnd = slotServiceEnd.format('HH:mm');
    slots.push({
      start: slotStart,
      end: slotEnd,
      display: `${slotStart} - ${slotEnd}`,
      value: slotStart,
      available: true,  // Mặc định là có sẵn
      duration: serviceDuration,
      bufferTime: bufferTime,
      bufferEndTime: slotBufferEnd.format('HH:mm')
    });
    
    // Chuyển đến slot tiếp theo (sau khi kết thúc + buffer)
    currentTime = slotBufferEnd;
  }

  return slots;
};

/**
 * Kiểm tra xem một time slot có đang được sử dụng bởi lịch hẹn nào khác
 * @param {Object} timeSlot - Time slot cần kiểm tra
 * @param {Array} appointments - Danh sách các lịch hẹn
 * @param {Object} selectedDate - Ngày được chọn (dayjs object)
 * @returns {boolean} - true nếu slot đang bận, false nếu slot khả dụng
 */
export const isSlotOverlapping = (timeSlot, appointments, selectedDate) => {
  // Chuyển đổi ngày được chọn sang string format để so sánh
  const selectedDateStr = selectedDate.format('YYYY-MM-DD');
  
  // Lấy thời điểm bắt đầu và kết thúc của timeSlot
  const slotStartTime = dayjs(`${selectedDateStr}T${timeSlot.start}`);
  const slotEndTime = dayjs(`${selectedDateStr}T${timeSlot.end}`);

  // Kiểm tra xem có lịch hẹn nào chồng lấp với time slot này không
  return appointments.some(appointment => {
    // Chuyển appointment date thành đối tượng dayjs
    const appointmentDate = dayjs(appointment.appointmentDate);
    
    // Lấy ngày của appointment
    const appointmentDateStr = appointmentDate.format('YYYY-MM-DD');
    
    // Nếu không cùng ngày, bỏ qua
    if (appointmentDateStr !== selectedDateStr) return false;
    
    // Lấy thời gian bắt đầu và kết thúc của lịch hẹn
    let appointmentStartTime, appointmentEndTime;
    
    if (appointment.startTime && appointment.endTime) {
      // Nếu có thời gian bắt đầu và kết thúc rõ ràng
      appointmentStartTime = dayjs(`${appointmentDateStr}T${appointment.startTime}`);
      appointmentEndTime = dayjs(`${appointmentDateStr}T${appointment.endTime}`);
    } else if (appointment.appointmentTime) {
      // Nếu chỉ có appointmentTime (thường là thời điểm bắt đầu)
      appointmentStartTime = dayjs(`${appointmentDateStr}T${appointment.appointmentTime}`);
      
      // Tính thời điểm kết thúc dựa trên thời lượng dịch vụ (nếu có)
      const serviceDuration = appointment.service?.duration || DEFAULT_SLOT_DURATION;
      appointmentEndTime = appointmentStartTime.add(serviceDuration, 'minute');
    } else {
      // Nếu không có thông tin thời gian, bỏ qua
      return false;
    }
    
    // Kiểm tra chồng lấp: nếu một trong hai điểm đầu/cuối của slot nằm trong khoảng thời gian của appointment
    return (
      (slotStartTime.isAfter(appointmentStartTime) && slotStartTime.isBefore(appointmentEndTime)) ||
      (slotEndTime.isAfter(appointmentStartTime) && slotEndTime.isBefore(appointmentEndTime)) ||
      (slotStartTime.isSame(appointmentStartTime) || slotEndTime.isSame(appointmentEndTime)) ||
      (slotStartTime.isBefore(appointmentStartTime) && slotEndTime.isAfter(appointmentEndTime))
    );
  });
};

/**
 * Lấy trạng thái khả dụng của tất cả các slots trong một ngày
 * @param {Array} baseSlots - Mảng các time slot cơ bản
 * @param {Array} appointments - Danh sách các lịch hẹn
 * @param {Object} selectedDate - Ngày được chọn (dayjs object)
 * @param {Array} staffSchedules - Danh sách lịch làm việc của nhân viên (optional)
 * @returns {Array} - Mảng các time slot đã được cập nhật trạng thái
 */
export const getAvailableTimeSlots = (baseSlots, appointments, selectedDate, staffSchedules = []) => {
  // Sao chép mảng slots để không làm thay đổi mảng gốc
  const slots = [...baseSlots];
  
  // Cập nhật trạng thái available dựa trên các lịch hẹn đã có
  return slots.map(slot => ({
    ...slot,
    available: !isSlotOverlapping(slot, appointments, selectedDate) && isStaffAvailable(slot, staffSchedules, selectedDate)
  }));
};

/**
 * Kiểm tra xem nhân viên có làm việc trong time slot đã chọn không
 * @param {Object} timeSlot - Time slot cần kiểm tra
 * @param {Array} staffSchedules - Danh sách lịch làm việc của nhân viên
 * @param {Object} selectedDate - Ngày được chọn (dayjs object)
 * @returns {boolean} - true nếu nhân viên khả dụng, false nếu không
 */
export const isStaffAvailable = (timeSlot, staffSchedules, selectedDate) => {
  // Nếu không có thông tin lịch làm việc, mặc định là có sẵn
  if (!staffSchedules || staffSchedules.length === 0) return true;
  
  // Chuyển đổi ngày được chọn sang string format để so sánh
  const selectedDateStr = selectedDate.format('YYYY-MM-DD');
  
  // Lọc lịch làm việc chỉ lấy ngày được chọn
  const schedulesForSelectedDate = staffSchedules.filter(schedule => {
    return dayjs(schedule.date).format('YYYY-MM-DD') === selectedDateStr;
  });
  
  // Nếu không có lịch làm việc cho ngày này, mặc định là không có sẵn
  if (schedulesForSelectedDate.length === 0) return false;
  
  // Kiểm tra slot có nằm trong giờ làm việc của ít nhất một nhân viên hay không
  return schedulesForSelectedDate.some(schedule => {
    // Nếu nhân viên không làm việc ngày này, bỏ qua
    if (!schedule.isWorking) return false;
    
    // Lấy thời gian bắt đầu và kết thúc của ca làm việc
    const scheduleStart = dayjs(`${selectedDateStr}T${schedule.startTime}`);
    const scheduleEnd = dayjs(`${selectedDateStr}T${schedule.endTime}`);
    
    // Lấy thời điểm bắt đầu và kết thúc của timeSlot
    const slotStart = dayjs(`${selectedDateStr}T${timeSlot.start}`);
    const slotEnd = dayjs(`${selectedDateStr}T${timeSlot.end}`);
    
    // Slot khả dụng nếu nằm hoàn toàn trong giờ làm việc
    return slotStart.isAfter(scheduleStart) && slotEnd.isBefore(scheduleEnd) 
      || slotStart.isSame(scheduleStart) || slotEnd.isSame(scheduleEnd);
  });
};

/**
 * Lấy trạng thái của lịch hẹn dựa trên thời gian hiện tại
 * @param {Object} appointment - Thông tin lịch hẹn
 * @returns {string} - Trạng thái lịch hẹn
 */
export const getAppointmentStatus = (appointment) => {
  if (!appointment) return 'unknown';
  
  // Nếu đã có status rõ ràng, sử dụng nó
  if (appointment.status) {
    const status = appointment.status.toLowerCase();
    if (['cancelled', 'completed', 'no-show'].includes(status)) {
      return status;
    }
  }
  
  const now = dayjs();
  const appointmentDate = dayjs(appointment.appointmentDate);
  
  // Nếu lịch hẹn đã qua 1 ngày và vẫn ở trạng thái confirmed hoặc scheduled
  if (appointmentDate.add(1, 'day').isBefore(now) && 
      (appointment.status === 'Confirmed' || appointment.status === 'Scheduled')) {
    return 'no-show'; // Khách không đến
  }
  
  // Nếu chưa tới giờ hẹn
  if (appointmentDate.isAfter(now)) {
    return appointment.status?.toLowerCase() || 'scheduled';
  }
  
  // Nếu đã qua giờ hẹn nhưng chưa cập nhật trạng thái
  return 'pending-completion';
};

/**
 * Định dạng thời gian cho hiển thị
 * @param {string} time - Thời gian format "HH:mm"
 * @returns {string} - Thời gian đã định dạng "h:mm A"
 */
export const formatTimeDisplay = (time) => {
  if (!time) return '';
  return dayjs(`2023-01-01T${time}`).format('h:mm A');
};

/**
 * Chuyển đổi giữa format 24h và 12h
 * @param {string} time24h - Thời gian format "HH:mm" (24h)
 * @returns {string} - Thời gian format "h:mm A" (12h)
 */
export const convert24hTo12h = (time24h) => {
  if (!time24h) return '';
  try {
    return dayjs(`2023-01-01T${time24h}`).format('h:mm A');
  } catch (error) {
    console.error('Lỗi chuyển đổi giờ:', error);
    return time24h;
  }
};

/**
 * Chuyển đổi từ format 12h sang 24h
 * @param {string} time12h - Thời gian format "h:mm A" (12h)
 * @returns {string} - Thời gian format "HH:mm" (24h)
 */
export const convert12hTo24h = (time12h) => {
  if (!time12h) return '';
  try {
    return dayjs(`2023-01-01 ${time12h}`, 'YYYY-MM-DD h:mm A').format('HH:mm');
  } catch (error) {
    console.error('Lỗi chuyển đổi giờ:', error);
    return time12h;
  }
};

/**
 * Lưu thông tin thời gian đã chọn vào localStorage để khôi phục sau này
 * @param {Date} date - Đối tượng Date chứa thời gian đã chọn
 * @param {string} timeStr - Chuỗi thời gian format "HH:mm"
 */
export const saveSelectedTimeToStorage = (date, timeStr) => {
  if (!date) return;
  
  try {
    // Tách giờ và phút từ timeStr nếu có
    let hour, minute;
    if (timeStr) {
      [hour, minute] = timeStr.split(':').map(Number);
    } else {
      // Nếu không có timeStr, lấy từ date
      hour = date.getHours();
      minute = date.getMinutes();
      timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    localStorage.setItem('lastSelectedAppointmentData', JSON.stringify({
      date: date.toISOString(),
      timeStr: timeStr,
      hour: hour,
      minute: minute,
      formattedDate: dayjs(date).format('YYYY-MM-DD')
    }));
    
    console.log(`Time data saved to localStorage: ${timeStr} (${dayjs(date).format('YYYY-MM-DD')})`);
  } catch (e) {
    console.error("Could not save appointment data to localStorage:", e);
  }
};

/**
 * Khôi phục thông tin thời gian đã chọn từ localStorage
 * @returns {Object|null} - Đối tượng chứa thông tin thời gian đã lưu hoặc null nếu không có
 */
export const restoreSelectedTimeFromStorage = () => {
  try {
    const savedData = localStorage.getItem('lastSelectedAppointmentData');
    if (!savedData) return null;
    
    const parsedData = JSON.parse(savedData);
    return {
      date: new Date(parsedData.date),
      timeStr: parsedData.timeStr,
      hour: parsedData.hour,
      minute: parsedData.minute,
      formattedDate: parsedData.formattedDate
    };
  } catch (e) {
    console.error("Error restoring time from localStorage:", e);
    return null;
  }
};

/**
 * Tạo đối tượng Date mới giữ nguyên ngày của baseDate nhưng với giờ và phút cụ thể
 * @param {Date} baseDate - Đối tượng Date gốc (lấy ngày, tháng, năm)
 * @param {number} hours - Giờ cần đặt
 * @param {number} minutes - Phút cần đặt
 * @returns {Date} - Đối tượng Date mới đã được đặt giờ và phút
 */
export const createDateWithTime = (baseDate, hours, minutes) => {
  if (!baseDate) return null;
  
  const newDate = new Date(baseDate);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

/**
 * Kiểm tra xem hai khung giờ có giống nhau không, bất kể định dạng
 * @param {object} slot1 - Khung giờ thứ nhất
 * @param {object} slot2 - Khung giờ thứ hai
 * @returns {boolean} True nếu hai khung giờ giống nhau
 */
export const isSameTimeSlot = (slot1, slot2) => {
  if (!slot1 || !slot2) return false;
  
  // Nếu có id và giống nhau
  if (slot1.id && slot2.id && slot1.id === slot2.id) {
    return true;
  }
  
  // So sánh theo startTimeString
  if (slot1.startTimeString && slot2.startTimeString) {
    return slot1.startTimeString === slot2.startTimeString;
  }
  
  // So sánh theo timeDisplayString
  if (slot1.timeDisplayString && slot2.timeDisplayString) {
    return slot1.timeDisplayString === slot2.timeDisplayString;
  }
  
  // So sánh theo startTime nếu là Date
  if (slot1.startTime instanceof Date && slot2.startTime instanceof Date) {
    return slot1.startTime.getHours() === slot2.startTime.getHours() && 
           slot1.startTime.getMinutes() === slot2.startTime.getMinutes();
  }
  
  // So sánh theo startTime nếu là string
  if (typeof slot1.startTime === 'string' && typeof slot2.startTime === 'string') {
    // Trích xuất phần giờ:phút nếu có định dạng ISO hoặc khác
    const time1 = slot1.startTime.includes('T') 
      ? slot1.startTime.split('T')[1].substring(0, 5)
      : slot1.startTime.includes(':') 
        ? slot1.startTime 
        : null;
        
    const time2 = slot2.startTime.includes('T')
      ? slot2.startTime.split('T')[1].substring(0, 5)
      : slot2.startTime.includes(':')
        ? slot2.startTime
        : null;
        
    if (time1 && time2) {
      return time1 === time2;
    }
  }
  
  return false;
};

/**
 * Tạo chuỗi thời gian chuẩn HH:mm từ khung giờ
 * @param {object} slot - Khung giờ cần lấy thông tin
 * @returns {string} Chuỗi thời gian định dạng HH:mm
 */
export const getTimeStringFromSlot = (slot) => {
  if (!slot) return null;
  
  // Ưu tiên lấy từ startTimeString
  if (slot.startTimeString && slot.startTimeString.includes(':')) {
    return slot.startTimeString;
  }
  
  // Thử lấy từ timeDisplayString
  if (slot.timeDisplayString && slot.timeDisplayString.includes(':')) {
    return slot.timeDisplayString;
  }
  
  // Nếu startTime là Date
  if (slot.startTime instanceof Date) {
    return `${slot.startTime.getHours().toString().padStart(2, '0')}:${slot.startTime.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Nếu startTime là string có định dạng HH:mm
  if (typeof slot.startTime === 'string') {
    if (slot.startTime.includes(':')) {
      // Nếu có dạng ISO, lấy phần giờ:phút
      if (slot.startTime.includes('T')) {
        return slot.startTime.split('T')[1].substring(0, 5);
      }
      return slot.startTime;
    }
    
    // Nếu là timestamp
    try {
      const dateFromTimestamp = new Date(parseInt(slot.startTime));
      if (!isNaN(dateFromTimestamp.getTime())) {
        return `${dateFromTimestamp.getHours().toString().padStart(2, '0')}:${dateFromTimestamp.getMinutes().toString().padStart(2, '0')}`;
      }
    } catch (e) {
      console.error('Error parsing timestamp:', e);
    }
  }
  
  return null;
};

// Cập nhật hàm isPastTimeSlot để tránh áp dụng buffer với các ngày tương lai
export const isPastTimeSlot = (slot, selectedDate) => {
  console.log('⏰ isPastTimeSlot called with:', {
    slot: slot ? {
      startTime: slot.startTime,
      startTimeType: typeof slot.startTime,
      isDate: slot.startTime instanceof Date
    } : null,
    selectedDate
  });
  
  if (!slot || !slot.startTime) {
    console.log('⚠️ isPastTimeSlot: Slot không hợp lệ');
    return false;
  }
  
  const now = new Date();
  // Thêm buffer 30 phút cho việc đặt lịch
  const bufferForBooking = 30; // 30 phút
  const cutoffTime = new Date(now.getTime() + bufferForBooking * 60000);
  
  // Lấy thời gian từ slot
  let slotTime;
  if (slot.startTime instanceof Date) {
    slotTime = new Date(slot.startTime);
  } else if (typeof slot.startTime === 'string') {
    // Nếu là chuỗi HH:mm
    if (slot.startTime.includes(':') && !slot.startTime.includes('T')) {
      // Tạo một đối tượng Date từ ngày được chọn và thời gian từ slot
      const selectedDay = selectedDate ? new Date(selectedDate) : new Date();
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      
      slotTime = new Date(selectedDay);
      slotTime.setHours(hours, minutes, 0, 0);
    } else {
      // Nếu là một chuỗi datetime đầy đủ
      slotTime = new Date(slot.startTime);
    }
  } else {
    console.log('⚠️ isPastTimeSlot: Không thể xác định thời gian từ slot');
    return false;
  }
  
  if (isNaN(slotTime.getTime())) {
    console.log('⚠️ isPastTimeSlot: slotTime không hợp lệ');
    return false;
  }
  
  // THAY ĐỔI QUAN TRỌNG: Kiểm tra ngày đã chọn so với ngày hiện tại
  const selectedDay = selectedDate ? new Date(selectedDate) : new Date();
  selectedDay.setHours(0, 0, 0, 0); // Reset to start of day
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day
  
  // Nếu ngày đã chọn là trong tương lai, KHÔNG áp dụng bất kỳ giới hạn nào
  if (selectedDay > today) {
    console.log(`📆 Slot ${slotTime.getHours()}:${slotTime.getMinutes()} vào ngày ${selectedDay.toLocaleDateString()} là trong tương lai, luôn có thể chọn`);
    return false; // Slot không bị coi là quá khứ nếu là ngày trong tương lai
  }
  
  // Nếu là ngày hiện tại, áp dụng buffer thời gian
  if (selectedDay.getTime() === today.getTime()) {
    const isPast = slotTime < cutoffTime;
    
    // Log chi tiết vì sao nó bị coi là quá khứ hay không
    if (isPast) {
      console.log(`⌛ Slot ${slotTime.getHours()}:${slotTime.getMinutes()} hôm nay là QUÁ KHỨ (hiện tại: ${now.getHours()}:${now.getMinutes()}, cutoff: ${cutoffTime.getHours()}:${cutoffTime.getMinutes()})`);
    } else {
      console.log(`✅ Slot ${slotTime.getHours()}:${slotTime.getMinutes()} hôm nay KHÔNG phải quá khứ (hiện tại: ${now.getHours()}:${now.getMinutes()}, cutoff: ${cutoffTime.getHours()}:${cutoffTime.getMinutes()})`);
    }
    
    return isPast; // Trả về kết quả dựa trên buffer thời gian
  }
  
  // Nếu là ngày trong quá khứ (trước ngày hiện tại)
  console.log(`❌ Slot ${slotTime.getHours()}:${slotTime.getMinutes()} thuộc ngày trong quá khứ ${selectedDay.toLocaleDateString()}`);
  return true; // Slot luôn bị coi là quá khứ nếu ngày đã qua
};