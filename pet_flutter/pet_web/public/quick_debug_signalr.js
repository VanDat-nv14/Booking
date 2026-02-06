// 🚀 Quick Debug Script - Copy vào browser console ngay
console.clear();
console.log('🔍 === QUICK SIGNALR DEBUG ===');

// Bước 1: Kiểm tra SignalR service
console.log('\n📋 1. Checking SignalR Service...');
if (window.signalRService) {
  console.log('✅ SignalR Service: Found');
  console.log('   State:', window.signalRService.connection?.state);
  console.log('   Connected:', window.signalRService.isConnected);
} else {
  console.log('❌ SignalR Service: NOT FOUND');
  console.log('💡 Bạn cần:');
  console.log('   1. Vào trang /appointment');
  console.log('   2. Chọn dịch vụ');
  console.log('   3. Chọn nhân viên CỤ THỂ (không phải "Bất kỳ")');
  console.log('   4. Chọn ngày');
  console.log('   5. Thấy danh sách khung giờ');
}

// Bước 2: Kiểm tra User ID
console.log('\n📋 2. Checking User Identity...');
const userId = sessionStorage.getItem('currentUserId') || localStorage.getItem('userId');
console.log('👤 Current User ID:', userId);
if (!userId) {
  console.log('⚠️ Tạo User ID mới...');
  const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('currentUserId', newUserId);
  console.log('✅ New User ID:', newUserId);
}

// Bước 3: Kiểm tra trang hiện tại
console.log('\n📋 3. Checking Current Page...');
console.log('URL:', window.location.pathname);
console.log('Title:', document.title);

// Bước 4: Kiểm tra React props của TimeSlotGrid
console.log('\n📋 4. Checking TimeSlotGrid...');
console.log('💡 Mở React DevTools → Search "TimeSlotGrid" → Xem Props:');
console.log('   - signalRConnection: phải có và không null');
console.log('   - currentUserId: phải có và unique');
console.log('   - selectedStaffId: phải có và không null');
console.log('   - selectedService: phải có .id');

// Bước 5: Test manual connection
console.log('\n📋 5. Manual Connection Test...');
if (window.signalRService) {
  console.log('🔌 Testing SignalR connection...');
  
  // Test basic connection
  const connection = window.signalRService.connection;
  if (connection) {
    console.log('   Connection ID:', connection.connectionId);
    console.log('   State:', connection.state);
    
    // Test hub invoke
    if (connection.state === 'Connected') {
      console.log('🧪 Testing hub methods...');
      
      // Test join room
      connection.invoke('JoinTimeSlotRoom', 'test_room_debug')
        .then(() => {
          console.log('✅ JoinTimeSlotRoom: SUCCESS');
          
          // Test send message
          return connection.invoke('NotifyTimeSlotSelected', {
            roomKey: 'test_room_debug',
            timeSlot: '10:00',
            userId: userId || 'test_user',
            userName: 'Test User',
            serviceId: 1,
            staffId: 1,
            date: '2025-01-06'
          });
        })
        .then(() => {
          console.log('✅ NotifyTimeSlotSelected: SUCCESS');
          console.log('🎉 SignalR Hub methods work!');
        })
        .catch(err => {
          console.error('❌ Hub method failed:', err);
          console.log('💡 Backend có thể chưa có SignalR Hub hoặc methods');
        });
    } else {
      console.log('⚠️ Not connected, trying to connect...');
      window.signalRService.initialize()
        .then(() => {
          console.log('✅ Connection successful');
        })
        .catch(err => {
          console.error('❌ Connection failed:', err);
          console.log('💡 Check backend is running on https://localhost:7164');
        });
    }
  }
}

// Bước 6: Listen cho messages
console.log('\n📋 6. Setting up message listener...');
if (window.signalRService?.connection) {
  const conn = window.signalRService.connection;
  
  // Remove old listeners
  conn.off('TimeSlotSelected');
  conn.off('TimeSlotCleared');
  
  // Add new listeners
  conn.on('TimeSlotSelected', (data) => {
    console.log('🎯 [RECEIVED] TimeSlotSelected:', data);
    alert(`🎯 Received: ${data.userName} chọn slot ${data.timeSlot}`);
  });
  
  conn.on('TimeSlotCleared', (data) => {
    console.log('🧹 [RECEIVED] TimeSlotCleared:', data);
    alert(`🧹 Received: ${data.userName} bỏ chọn slot ${data.timeSlot}`);
  });
  
  console.log('✅ Message listeners setup');
}

// Test functions
window.testSignalRQuick = {
  // Send test message
  send: (timeSlot = '14:30') => {
    if (!window.signalRService?.connection) {
      console.log('❌ No SignalR connection');
      return;
    }
    
    const testData = {
      roomKey: 'service_1_staff_1_date_2025-01-06',
      timeSlot: timeSlot,
      userId: `test_${Math.random().toString(36).substr(2, 5)}`,
      userName: 'Test User',
      serviceId: 1,
      staffId: 1,
      date: '2025-01-06'
    };
    
    console.log('📤 Sending test message:', testData);
    window.signalRService.connection.invoke('NotifyTimeSlotSelected', testData)
      .then(() => console.log('✅ Test message sent'))
      .catch(err => console.error('❌ Test failed:', err));
  },
  
  // Check current room
  checkRoom: () => {
    console.log('\n🏠 Current Room Info:');
    // Try to extract from React DevTools or component state
    console.log('💡 Cần xem trong React DevTools → TimeSlotGrid → Props');
    console.log('   Tìm: selectedService.id, selectedStaffId, selectedDate');
    console.log('   Room format: service_{serviceId}_staff_{staffId}_date_{YYYY-MM-DD}');
  }
};

console.log('\n🚀 === QUICK COMMANDS ===');
console.log('Gửi test message: window.testSignalRQuick.send("14:30")');
console.log('Kiểm tra room: window.testSignalRQuick.checkRoom()');
console.log('\n💡 === NEXT STEPS ===');
console.log('1. Kiểm tra console có lỗi không');
console.log('2. Nếu SignalR Service not found → chưa đủ điều kiện');
console.log('3. Nếu Hub method failed → backend chưa có methods');
console.log('4. Nếu OK → test với 2 tabs'); 