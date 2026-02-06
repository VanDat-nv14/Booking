import dayjs from 'dayjs';

// Utility functions để test việc đặt lịch
export const testAppointmentUtils = {
  
  // Test case: Đặt lịch cho ngày hôm nay
  testTodayBooking: () => {
    const today = dayjs();
    const timeSlot = {
      exactHour: 14,
      exactMinute: 30
    };
    
    console.log('🧪 Test case: Đặt lịch cho ngày hôm nay');
    console.log('📅 Ngày hôm nay:', today.format('DD/MM/YYYY'));
    console.log('⏰ Thời gian đặt:', `${timeSlot.exactHour}:${timeSlot.exactMinute}`);
    
    // Tạo appointmentDate
    const appointmentDate = today.hour(timeSlot.exactHour).minute(timeSlot.exactMinute).second(0);
    
    console.log('📝 Appointment date result:', appointmentDate.format('DD/MM/YYYY HH:mm:ss'));
    console.log('🔍 ISO string:', appointmentDate.toISOString());
    console.log('🌍 Local string:', appointmentDate.format());
    
    return {
      isValid: appointmentDate.isAfter(dayjs()),
      appointmentDate: appointmentDate.toDate(),
      timeSlot
    };
  },
  
  // Test case: Đặt lịch cho ngày mai
  testTomorrowBooking: () => {
    const tomorrow = dayjs().add(1, 'day');
    const timeSlot = {
      exactHour: 9,
      exactMinute: 0
    };
    
    console.log('🧪 Test case: Đặt lịch cho ngày mai');
    console.log('📅 Ngày mai:', tomorrow.format('DD/MM/YYYY'));
    console.log('⏰ Thời gian đặt:', `${timeSlot.exactHour}:${timeSlot.exactMinute}`);
    
    // Tạo appointmentDate
    const appointmentDate = tomorrow.hour(timeSlot.exactHour).minute(timeSlot.exactMinute).second(0);
    
    console.log('📝 Appointment date result:', appointmentDate.format('DD/MM/YYYY HH:mm:ss'));
    console.log('🔍 ISO string:', appointmentDate.toISOString());
    console.log('🌍 Local string:', appointmentDate.format());
    
    return {
      isValid: appointmentDate.isAfter(dayjs()),
      appointmentDate: appointmentDate.toDate(),
      timeSlot
    };
  },
  
  // Test timezone handling
  testTimezoneHandling: () => {
    const now = new Date();
    const timeZoneOffset = now.getTimezoneOffset();
    const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    console.log('🌍 Timezone test:');
    console.log('  - Timezone offset (minutes):', timeZoneOffset);
    console.log('  - Client timezone:', clientTimeZone);
    console.log('  - Current local time:', dayjs().format('DD/MM/YYYY HH:mm:ss'));
    console.log('  - Current UTC time:', dayjs().utc().format('DD/MM/YYYY HH:mm:ss'));
    
    // Test tạo chuỗi ISO local
    const testDate = dayjs().add(1, 'hour');
    const localISOString = testDate.format('YYYY-MM-DDTHH:mm:ss');
    
    console.log('  - Test local ISO string:', localISOString);
    console.log('  - Parsed back to dayjs:', dayjs(localISOString).format('DD/MM/YYYY HH:mm:ss'));
    
    return {
      timeZoneOffset,
      clientTimeZone,
      localISOString,
      isConsistent: dayjs(localISOString).format('HH:mm') === testDate.format('HH:mm')
    };
  },
  
  // Validate appointment data
  validateAppointmentData: (appointmentData) => {
    const errors = [];
    
    if (!appointmentData.petId) {
      errors.push('Missing petId');
    }
    
    if (!appointmentData.serviceId) {
      errors.push('Missing serviceId');
    }
    
    if (!appointmentData.appointmentDate) {
      errors.push('Missing appointmentDate');
    } else {
      const appointmentDateTime = dayjs(appointmentData.appointmentDate);
      
      if (!appointmentDateTime.isValid()) {
        errors.push('Invalid appointmentDate format');
      }
      
      if (appointmentDateTime.isBefore(dayjs())) {
        errors.push('Appointment date is in the past');
      }
      
      const hour = appointmentDateTime.hour();
      if (hour < 8 || hour > 21) {
        errors.push('Appointment time outside business hours (8:00-21:30)');
      }
    }
    
    console.log('✅ Validation result:', {
      appointmentData,
      errors,
      isValid: errors.length === 0
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  // Run all tests
  runAllTests: () => {
    console.log('🚀 Running all appointment tests...');
    
    const results = {
      todayBooking: testAppointmentUtils.testTodayBooking(),
      tomorrowBooking: testAppointmentUtils.testTomorrowBooking(),
      timezoneHandling: testAppointmentUtils.testTimezoneHandling()
    };
    
    console.log('📊 Test results summary:', results);
    
    return results;
  }
};

export default testAppointmentUtils; 