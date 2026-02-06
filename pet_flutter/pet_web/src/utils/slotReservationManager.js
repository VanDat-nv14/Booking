// Quản lý các khung giờ đang được giữ chỗ tạm thời
class SlotReservationManager {
  constructor() {
    this.reservations = new Map(); // Key: slotId, Value: reservation info
    this.sessionId = this.generateSessionId();
    this.reservationTimeout = 5 * 60 * 1000; // 5 phút
    
    // Cleanup expired reservations mỗi 30 giây
    setInterval(() => {
      this.cleanupExpiredReservations();
    }, 30000);
  }
  
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Tạo unique key cho slot
  createSlotKey(date, serviceId, staffId, startTime) {
    return `${date}_${serviceId}_${staffId || 'any'}_${startTime}`;
  }
  
  // Giữ chỗ tạm thời một slot
  reserveSlot(slotInfo) {
    const {
      date,
      serviceId, 
      staffId,
      startTime,
      endTime,
      userName = 'Khách hàng',
      duration
    } = slotInfo;
    
    const slotKey = this.createSlotKey(date, serviceId, staffId, startTime);
    const now = Date.now();
    
    const reservation = {
      sessionId: this.sessionId,
      date,
      serviceId,
      staffId,
      startTime,
      endTime,
      userName,
      duration,
      reservedAt: now,
      expiresAt: now + this.reservationTimeout,
      isOwnReservation: true
    };
    
    this.reservations.set(slotKey, reservation);
    
    // Lưu vào localStorage để persist qua page refresh
    this.saveToLocalStorage();
    
    console.log(`🔒 Reserved slot: ${startTime} for ${userName}`);
    
    return reservation;
  }
  
  // Hủy giữ chỗ
  releaseSlot(date, serviceId, staffId, startTime) {
    const slotKey = this.createSlotKey(date, serviceId, staffId, startTime);
    const reservation = this.reservations.get(slotKey);
    
    if (reservation && reservation.sessionId === this.sessionId) {
      this.reservations.delete(slotKey);
      this.saveToLocalStorage();
      console.log(`🔓 Released slot: ${startTime}`);
      return true;
    }
    
    return false;
  }
  
  // Kiểm tra slot có đang được giữ chỗ không
  isSlotReserved(date, serviceId, staffId, startTime) {
    const slotKey = this.createSlotKey(date, serviceId, staffId, startTime);
    const reservation = this.reservations.get(slotKey);
    
    if (!reservation) return null;
    
    // Kiểm tra đã hết hạn chưa
    if (Date.now() > reservation.expiresAt) {
      this.reservations.delete(slotKey);
      this.saveToLocalStorage();
      return null;
    }
    
    return reservation;
  }
  
  // Lấy tất cả reservations cho một ngày/dịch vụ
  getReservationsForService(date, serviceId, staffId = null) {
    const results = [];
    
    for (const [key, reservation] of this.reservations) {
      if (reservation.date === date && 
          reservation.serviceId === serviceId &&
          (staffId === null || reservation.staffId === staffId)) {
        
        // Kiểm tra hết hạn
        if (Date.now() <= reservation.expiresAt) {
          results.push(reservation);
        }
      }
    }
    
    return results;
  }
  
  // Cleanup expired reservations
  cleanupExpiredReservations() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, reservation] of this.reservations) {
      if (now > reservation.expiresAt) {
        this.reservations.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.saveToLocalStorage();
      console.log(`🧹 Cleaned up ${cleaned} expired reservations`);
    }
  }
  
  // Lưu vào localStorage
  saveToLocalStorage() {
    try {
      const data = {
        sessionId: this.sessionId,
        reservations: Array.from(this.reservations.entries())
      };
      localStorage.setItem('petcare_slot_reservations', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save reservations to localStorage:', error);
    }
  }
  
  // Load từ localStorage
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('petcare_slot_reservations');
      if (data) {
        const parsed = JSON.parse(data);
        
        // Chỉ load reservations của session hiện tại và chưa hết hạn
        const now = Date.now();
        
        for (const [key, reservation] of parsed.reservations) {
          if (reservation.sessionId === this.sessionId && 
              reservation.expiresAt > now) {
            this.reservations.set(key, reservation);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load reservations from localStorage:', error);
    }
  }
  
  // Extend reservation time (khi user vẫn đang tương tác)
  extendReservation(date, serviceId, staffId, startTime) {
    const slotKey = this.createSlotKey(date, serviceId, staffId, startTime);
    const reservation = this.reservations.get(slotKey);
    
    if (reservation && reservation.sessionId === this.sessionId) {
      reservation.expiresAt = Date.now() + this.reservationTimeout;
      this.saveToLocalStorage();
      return true;
    }
    
    return false;
  }
  
  // Lấy thông tin reservation của chính mình
  getOwnReservations() {
    const results = [];
    
    for (const [key, reservation] of this.reservations) {
      if (reservation.sessionId === this.sessionId && 
          Date.now() <= reservation.expiresAt) {
        results.push(reservation);
      }
    }
    
    return results;
  }
  
  // Clear tất cả reservations của session hiện tại
  clearOwnReservations() {
    const toDelete = [];
    
    for (const [key, reservation] of this.reservations) {
      if (reservation.sessionId === this.sessionId) {
        toDelete.push(key);
      }
    }
    
    toDelete.forEach(key => this.reservations.delete(key));
    this.saveToLocalStorage();
    
    console.log(`🧹 Cleared ${toDelete.length} own reservations`);
  }
}

// Singleton instance
const slotReservationManager = new SlotReservationManager();

// Load existing data khi khởi tạo
slotReservationManager.loadFromLocalStorage();

export default slotReservationManager; 