// 🔧 Debug SignalR Real-time Functionality
window.debugSignalRRealtime = {
  
  // 1. Kiểm tra trạng thái SignalR
  checkStatus: () => {
    console.log('\n🔍 === CHECKING SIGNALR STATUS ===');
    
    if (window.signalRConnection) {
      console.log('✅ SignalR Connection:', window.signalRConnection.state);
      console.log('   - Connection ID:', window.signalRConnection.connectionId);
    } else {
      console.log('❌ No SignalR connection found');
    }
    
    // Kiểm tra localStorage để xem currentUserId
    const userId = localStorage.getItem('currentUserId') || 
                   localStorage.getItem('userId') || 
                   sessionStorage.getItem('currentUserId') ||
                   'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    console.log('👤 Current User ID:', userId);
    console.log('👤 LocalStorage keys:', Object.keys(localStorage).filter(k => k.includes('user') || k.includes('User')));
    
    return { connection: window.signalRConnection, userId };
  },
  
  // 2. Test gửi message thủ công
  testSendMessage: (timeSlot = '10:00') => {
    console.log('\n📤 === TESTING MANUAL MESSAGE SEND ===');
    
    if (!window.signalRConnection || window.signalRConnection.state !== 'Connected') {
      console.log('❌ SignalR not connected');
      return;
    }
    
    const roomKey = `service_2_staff_1_date_2025-06-12`; // Test room
    const testData = {
      roomKey,
      timeSlot,
      userId: 'test_user_' + Math.random().toString(36).substr(2, 9),
      userName: 'Test User',
      serviceId: 2,
      staffId: 1,
      date: '2025-06-12'
    };
    
    console.log('📤 Sending test message:', testData);
    
    window.signalRConnection.invoke('NotifyTimeSlotSelected', testData)
      .then(() => {
        console.log('✅ Test message sent successfully');
      })
      .catch(err => {
        console.error('❌ Failed to send test message:', err);
      });
  },
  
  // 3. Test join room thủ công
  testJoinRoom: (serviceId = 2, staffId = 1, date = '2025-06-12') => {
    console.log('\n🏠 === TESTING MANUAL ROOM JOIN ===');
    
    if (!window.signalRConnection || window.signalRConnection.state !== 'Connected') {
      console.log('❌ SignalR not connected');
      return;
    }
    
    const roomKey = `service_${serviceId}_staff_${staffId}_date_${date}`;
    console.log('🏠 Joining room:', roomKey);
    
    window.signalRConnection.invoke('JoinTimeSlotRoom', roomKey)
      .then(() => {
        console.log('✅ Successfully joined room:', roomKey);
      })
      .catch(err => {
        console.error('❌ Failed to join room:', err);
      });
  },
  
  // 4. Kiểm tra event listeners
  checkListeners: () => {
    console.log('\n👂 === CHECKING EVENT LISTENERS ===');
    
    if (window.signalRConnection) {
      // Thêm temporary listeners để test
      const testListener = (data) => {
        console.log('🎯 [TEST] Received TimeSlotSelected:', data);
      };
      
      window.signalRConnection.on('TimeSlotSelected', testListener);
      console.log('✅ Added test listener for TimeSlotSelected');
      
      // Remove sau 30 giây
      setTimeout(() => {
        window.signalRConnection.off('TimeSlotSelected', testListener);
        console.log('🧹 Removed test listener');
      }, 30000);
    }
  },
  
  // 5. Simulate user selection
  simulateUserSelection: (timeSlot = '09:00', userName = 'Test User') => {
    console.log('\n🎭 === SIMULATING USER SELECTION ===');
    
    const event = new CustomEvent('timeSlotSelected', {
      detail: {
        timeSlot,
        userId: 'simulated_user_' + Math.random().toString(36).substr(2, 9),
        userName
      }
    });
    
    window.dispatchEvent(event);
    console.log('🎭 Simulated user selection:', { timeSlot, userName });
  },
  
  // 6. Full test
  runFullTest: () => {
    console.log('\n🧪 === RUNNING FULL SIGNALR TEST ===');
    
    // Bước 1: Check status
    const status = window.debugSignalRRealtime.checkStatus();
    
    if (!status.connection || status.connection.state !== 'Connected') {
      console.log('❌ Cannot run full test - SignalR not connected');
      return;
    }
    
    // Bước 2: Join room
    setTimeout(() => {
      window.debugSignalRRealtime.testJoinRoom();
    }, 1000);
    
    // Bước 3: Add listeners
    setTimeout(() => {
      window.debugSignalRRealtime.checkListeners();
    }, 2000);
    
    // Bước 4: Send test message
    setTimeout(() => {
      window.debugSignalRRealtime.testSendMessage('11:30');
    }, 3000);
    
    console.log('🧪 Full test initiated - check logs over the next 5 seconds');
  }
};

// Auto-attach to window
console.log('🔧 SignalR Real-time Debug Tools loaded');
console.log('📋 Available commands:');
console.log('   window.debugSignalRRealtime.checkStatus()');
console.log('   window.debugSignalRRealtime.testSendMessage("10:00")');
console.log('   window.debugSignalRRealtime.testJoinRoom()');
console.log('   window.debugSignalRRealtime.runFullTest()');

// Auto-run basic check
setTimeout(() => {
  window.debugSignalRRealtime.checkStatus();
}, 2000); 