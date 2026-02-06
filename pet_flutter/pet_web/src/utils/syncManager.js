/**
 * SyncManager - Quản lý đồng bộ real-time cho toàn bộ ứng dụng
 * Sử dụng Custom Events để đồng bộ dữ liệu giữa các component
 */

class SyncManager {
  constructor() {
    this.listeners = new Map();
    this.init();
  }

  init() {
    console.log('🔄 SyncManager initialized');
    this.setupGlobalListeners();
  }

  setupGlobalListeners() {
    // Listener cho việc cập nhật lịch hẹn
    this.addEventListener('appointment-updated', this.handleAppointmentUpdate.bind(this));
    
    // Listener cho việc cập nhật trạng thái lịch hẹn
    this.addEventListener('appointment-status-updated', this.handleAppointmentStatusUpdate.bind(this));
    
    // Listener cho việc gán nhân viên
    this.addEventListener('staff-assigned', this.handleStaffAssigned.bind(this));
    
    // Listener cho việc refresh toàn bộ
    this.addEventListener('refresh-all-timeslots', this.handleRefreshAll.bind(this));
  }

  addEventListener(eventName, handler) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(handler);
    window.addEventListener(eventName, handler);
  }

  removeEventListener(eventName, handler) {
    if (this.listeners.has(eventName)) {
      const handlers = this.listeners.get(eventName);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
    window.removeEventListener(eventName, handler);
  }

  // Xử lý cập nhật lịch hẹn
  handleAppointmentUpdate(event) {
    const { appointmentId, oldData, newData, staffChanged, timeChanged, dateChanged } = event.detail;
    
    console.log('🔄 SyncManager: Processing appointment update', {
      appointmentId,
      staffChanged,
      timeChanged,
      dateChanged
    });

    // Broadcast các events cần thiết
    if (staffChanged || timeChanged || dateChanged) {
      this.broadcastTimeSlotUpdates(oldData, newData);
    }
  }

  // Xử lý cập nhật trạng thái lịch hẹn
  handleAppointmentStatusUpdate(event) {
    const { appointmentId, oldStatus, newStatus, appointmentData } = event.detail;
    
    console.log('🔄 SyncManager: Processing status update', {
      appointmentId,
      oldStatus,
      newStatus
    });

    // Nếu hủy hoặc hoàn thành, cần cập nhật time slots
    if (['Cancelled', 'Completed'].includes(newStatus)) {
      this.broadcastSlotAvailable(appointmentData);
    }
  }

  // Xử lý gán nhân viên
  handleStaffAssigned(event) {
    const { appointmentId, staffId, timeSlot } = event.detail;
    
    console.log('🔄 SyncManager: Processing staff assignment', {
      appointmentId,
      staffId,
      timeSlot
    });

    // Broadcast cập nhật lịch nhân viên
    this.broadcastStaffBusySlot(staffId, timeSlot);
  }

  // Xử lý refresh toàn bộ
  handleRefreshAll(event) {
    const { reason } = event.detail;
    
    console.log('🔄 SyncManager: Processing global refresh', { reason });

    // Xóa tất cả cache
    this.clearAllCache();
    
    // Kích hoạt refresh UI
    setTimeout(() => {
      this.broadcastUIRefresh();
    }, 100);
  }

  // Broadcast cập nhật time slots
  broadcastTimeSlotUpdates(oldData, newData) {
    // Cập nhật lịch thú cưng
    if (newData.petId) {
      this.dispatchEvent('pet-busy-slots-updated', {
        petId: newData.petId,
        date: new Date(newData.appointmentDate).toISOString().split('T')[0],
        action: 'update',
        oldAppointment: oldData,
        newAppointment: newData
      });
    }

    // Cập nhật lịch nhân viên cũ
    if (oldData.staffId && oldData.staffId !== newData.staffId) {
      this.dispatchEvent('staff-appointments-updated', {
        staffId: oldData.staffId,
        date: new Date(oldData.appointmentDate).toISOString().split('T')[0],
        action: 'remove',
        appointmentId: oldData.appointmentId
      });
    }

    // Cập nhật lịch nhân viên mới
    if (newData.staffId) {
      this.dispatchEvent('staff-appointments-updated', {
        staffId: newData.staffId,
        date: new Date(newData.appointmentDate).toISOString().split('T')[0],
        action: 'add',
        appointment: newData
      });
    }
  }

  // Broadcast slot available
  broadcastSlotAvailable(appointmentData) {
    // Thông báo slot trở thành available
    this.dispatchEvent('slot-available', {
      date: new Date(appointmentData.appointmentDate).toISOString().split('T')[0],
      time: new Date(appointmentData.appointmentDate).toTimeString().slice(0, 5),
      staffId: appointmentData.staffId,
      petId: appointmentData.petId
    });
  }

  // Broadcast staff busy slot
  broadcastStaffBusySlot(staffId, timeSlot) {
    this.dispatchEvent('staff-appointments-updated', {
      staffId: staffId,
      date: timeSlot.date,
      action: 'add',
      appointment: {
        staffId: staffId,
        appointmentDate: `${timeSlot.date}T${timeSlot.time}:00`,
        status: 'Confirmed'
      }
    });
  }

  // Broadcast UI refresh
  broadcastUIRefresh() {
    this.dispatchEvent('ui-refresh-requested', {
      timestamp: Date.now(),
      components: ['TimeSlotGrid', 'AppointmentForm', 'AppointmentManagement']
    });
  }

  // Xóa tất cả cache
  clearAllCache() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => 
        key.startsWith('petBusySlots_') || 
        key.startsWith('staffBusySlots_') ||
        key.startsWith('debugPetBusyTimeSlots_') ||
        key.includes('staffSchedule_')
      );

      console.log(`🗑️ SyncManager: Clearing ${cacheKeys.length} cache entries`);
      
      cacheKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Dispatch custom event
  dispatchEvent(eventName, detail) {
    try {
      const event = new CustomEvent(eventName, { detail });
      window.dispatchEvent(event);
      console.log(`📡 SyncManager: Dispatched ${eventName}`, detail);
    } catch (error) {
      console.error(`Error dispatching ${eventName}:`, error);
    }
  }

  // Cleanup
  destroy() {
    console.log('🔄 SyncManager: Cleaning up');
    
    // Remove all listeners
    for (const [eventName, handlers] of this.listeners) {
      handlers.forEach(handler => {
        window.removeEventListener(eventName, handler);
      });
    }
    
    this.listeners.clear();
  }
}

// Tạo instance global
const syncManager = new SyncManager();

// Export để sử dụng trong các component khác
export default syncManager;

// Export các helper functions
export const broadcastAppointmentUpdate = (appointmentId, oldData, newData) => {
  syncManager.dispatchEvent('appointment-updated', {
    appointmentId,
    oldData,
    newData,
    staffChanged: oldData?.staffId !== newData?.staffId,
    timeChanged: oldData?.appointmentDate !== newData?.appointmentDate
  });
};

export const broadcastStatusUpdate = (appointmentId, oldStatus, newStatus, appointmentData) => {
  syncManager.dispatchEvent('appointment-status-updated', {
    appointmentId,
    oldStatus,
    newStatus,
    appointmentData
  });
};

export const broadcastStaffAssignment = (appointmentId, staffId, timeSlot) => {
  syncManager.dispatchEvent('staff-assigned', {
    appointmentId,
    staffId,
    timeSlot
  });
};

export const requestGlobalRefresh = (reason = 'manual') => {
  syncManager.dispatchEvent('refresh-all-timeslots', {
    reason,
    timestamp: Date.now()
  });
}; 