/**
 * Appointment Synchronization Utility
 * Quản lý đồng bộ dữ liệu lịch hẹn giữa user và admin interfaces
 */

class AppointmentSyncManager {
  constructor() {
    this.listeners = new Map();
    this.isPolling = false;
    this.pollingInterval = null;
    this.pollingIntervalMs = 2000; // 30 seconds
  }

  /**
   * Bắt đầu polling để check cập nhật
   */
  startPolling() {
    if (this.isPolling) {
      console.log('🔄 Polling already active');
      return;
    }

    console.log('🔄 Starting appointment polling...');
    this.isPolling = true;
    
    this.pollingInterval = setInterval(() => {
      this.broadcastRefresh('polling');
    }, this.pollingIntervalMs);
  }

  /**
   * Dừng polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.isPolling = false;
      console.log('🛑 Stopped appointment polling');
    }
  }

  /**
   * Broadcast refresh event to all components
   */
  broadcastRefresh(reason = 'manual') {
    console.log(`📡 Broadcasting refresh event: ${reason}`);
    
    // Dispatch multiple events for different components
    window.dispatchEvent(new CustomEvent('refresh-all-timeslots', {
      detail: { reason, timestamp: Date.now() }
    }));
    
    window.dispatchEvent(new CustomEvent('refresh-appointments', {
      detail: { reason, timestamp: Date.now() }
    }));
    
    window.dispatchEvent(new CustomEvent('recheck-all-busy-slots', {
      detail: { reason, timestamp: Date.now() }
    }));
  }

  /**
   * Notify về việc appointment được cập nhật
   */
  notifyAppointmentUpdated(appointmentData) {
    console.log('📅 Notifying appointment updated:', appointmentData);
    
    window.dispatchEvent(new CustomEvent('appointment-updated', {
      detail: {
        appointment: appointmentData,
        timestamp: Date.now()
      }
    }));
    
    // Trigger refresh sau khi update
    setTimeout(() => {
      this.broadcastRefresh('appointment-updated');
    }, 500);
  }

  /**
   * Notify về việc pet busy slots được cập nhật
   */
  notifyPetBusySlotsUpdated(petId, date, busySlots = null) {
    console.log(`🐕 Notifying pet busy slots updated for pet ${petId} on ${date}`);
    
    window.dispatchEvent(new CustomEvent('pet-busy-slots-updated', {
      detail: {
        petId,
        date,
        busySlots,
        timestamp: Date.now()
      }
    }));
  }

  /**
   * Register a component listener
   */
  registerListener(componentName, callback) {
    this.listeners.set(componentName, callback);
    console.log(`📝 Registered listener for ${componentName}`);
  }

  /**
   * Unregister a component listener
   */
  unregisterListener(componentName) {
    this.listeners.delete(componentName);
    console.log(`🗑️ Unregistered listener for ${componentName}`);
  }

  /**
   * Force refresh tất cả components đã đăng ký
   */
  forceRefreshAll() {
    console.log('🔄 Force refreshing all registered components');
    
    this.listeners.forEach((callback, componentName) => {
      try {
        callback();
        console.log(`✅ Refreshed ${componentName}`);
      } catch (error) {
        console.error(`❌ Error refreshing ${componentName}:`, error);
      }
    });
    
    // Cũng broadcast events
    this.broadcastRefresh('force-refresh');
  }
}

// Create singleton instance
const appointmentSyncManager = new AppointmentSyncManager();

// Auto-start polling khi import
if (typeof window !== 'undefined') {
  // Start polling after a short delay để đảm bảo components đã mount
  setTimeout(() => {
    appointmentSyncManager.startPolling();
  }, 2000);
  
  // Stop polling khi page unload
  window.addEventListener('beforeunload', () => {
    appointmentSyncManager.stopPolling();
  });
}

export default appointmentSyncManager; 