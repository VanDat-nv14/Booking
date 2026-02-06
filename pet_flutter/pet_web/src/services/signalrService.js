import * as signalR from '@microsoft/signalr';
import { notification } from 'antd';

class SignalRService {
  constructor() {
    this.connection = null;
    this.currentServiceGroup = null;
    this.reservations = new Map(); // Track temporary reservations
    this.isConnected = false;
    this.listeners = new Map(); // Event listeners
  }

  // Initialize connection
  async initialize() {
    if (this.connection && this.connection.state === 'Connected') {
      console.log('SignalR already connected');
      return this.connection;
    }

    // Always create fresh connection to avoid state issues
    await this.disconnect();
    this.connection = null;

    try {
      console.log('🔌 Creating fresh SignalR connection...');
      
      // Create connection to TimeSlotSharingHub for real-time slot sharing
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7164/timeSlotHub", {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.LongPolling | signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      console.log('🔌 Starting SignalR connection...');
      await this.connection.start();
      this.isConnected = true;
      console.log('✅ SignalR Connected successfully, state:', this.connection.state);
      
      // Notify listeners about connection
      this.notifyListeners('connected', true);
      
      return this.connection;
    } catch (err) {
      console.error('❌ SignalR Connection Error:', err);
      this.isConnected = false;
      
      // Reset connection on error
      this.connection = null;
      
      throw err;
    }
  }



  // Setup event handlers
  setupEventHandlers() {
    if (!this.connection) return;

    // Connection events
    this.connection.onreconnecting(() => {
      this.isConnected = false;
      console.log('SignalR Reconnecting...');
      this.notifyListeners('reconnecting', true);
    });

    this.connection.onreconnected(() => {
      this.isConnected = true;
      console.log('SignalR Reconnected');
      this.notifyListeners('reconnected', true);
      
      // Rejoin current group if any
      if (this.currentServiceGroup) {
        this.joinServiceGroup(
          this.currentServiceGroup.serviceId, 
          this.currentServiceGroup.date, 
          this.currentServiceGroup.staffId
        );
      }
    });

    this.connection.onclose(() => {
      this.isConnected = false;
      console.log('SignalR Disconnected');
      this.notifyListeners('disconnected', true);
    });

    // ===== TIME SLOT SELECTION SHARING EVENTS (NEW) =====
    this.connection.on('TimeSlotSelected', (data) => {
      console.log('🔔 [SignalR] TimeSlotSelected received:', data);
      this.notifyListeners('timeSlotSelected', data);
    });

    this.connection.on('TimeSlotCleared', (data) => {
      console.log('🔔 [SignalR] TimeSlotCleared received:', data);
      this.notifyListeners('timeSlotCleared', data);
    });

    this.connection.on('UserJoinedTimeSlotRoom', (data) => {
      console.log('🔔 [SignalR] UserJoinedTimeSlotRoom:', data);
      this.notifyListeners('userJoinedTimeSlotRoom', data);
    });

    this.connection.on('UserLeftTimeSlotRoom', (data) => {
      console.log('🔔 [SignalR] UserLeftTimeSlotRoom:', data);
      this.notifyListeners('userLeftTimeSlotRoom', data);
    });

    // ===== SLOT RESERVATION EVENTS (EXISTING) =====
    this.connection.on('ReservationSuccess', (data) => {
      console.log('Reservation Success:', data);
      
      // Store our own reservation
      this.reservations.set(this.createSlotKey(data.slotStartTime), {
        ...data,
        isOwnReservation: true
      });

      this.notifyListeners('reservationSuccess', data);
      
      notification.success({
        message: 'Đặt chỗ thành công',
        description: `Bạn đã giữ chỗ khung giờ ${new Date(data.slotStartTime).toLocaleTimeString('vi-VN')}`,
        duration: 3
      });
    });

    this.connection.on('ReservationFailed', (data) => {
      console.log('Reservation Failed:', data);
      this.notifyListeners('reservationFailed', data);
      
      notification.error({
        message: 'Không thể đặt chỗ',
        description: data.message,
        duration: 4
      });
    });

    this.connection.on('SlotReserved', (data) => {
      console.log('Slot Reserved by others:', data);
      
      // Store other's reservation
      this.reservations.set(this.createSlotKey(data.slotStartTime), {
        ...data,
        isOwnReservation: false
      });

      this.notifyListeners('slotReserved', data);
      
      notification.info({
        message: 'Khung giờ đã được đặt',
        description: `${data.reservedBy} đã chọn khung giờ ${new Date(data.slotStartTime).toLocaleTimeString('vi-VN')}`,
        duration: 3
      });
    });

    this.connection.on('SlotReleased', (data) => {
      console.log('Slot Released:', data);
      
      // Remove reservation
      this.reservations.delete(this.createSlotKey(data.slotStartTime));

      this.notifyListeners('slotReleased', data);
      
      if (data.reason === 'expired') {
        notification.warning({
          message: 'Khung giờ đã được giải phóng',
          description: `Khung giờ ${new Date(data.slotStartTime).toLocaleTimeString('vi-VN')} đã hết thời gian giữ chỗ`,
          duration: 3
        });
      }
    });

    this.connection.on('CurrentReservations', (reservations) => {
      console.log('Current Reservations:', reservations);
      
      // Update reservations map
      this.reservations.clear();
      reservations.forEach(reservation => {
        this.reservations.set(
          this.createSlotKey(reservation.slotStartTime), 
          reservation
        );
      });

      this.notifyListeners('currentReservations', reservations);
    });

    this.connection.on('ReservationExtended', (data) => {
      console.log('Reservation Extended:', data);
      
      // Update reservation expiry
      const key = this.createSlotKey(data.slotStartTime);
      const reservation = this.reservations.get(key);
      if (reservation) {
        reservation.expiresAt = data.newExpiresAt;
      }

      this.notifyListeners('reservationExtended', data);
      
      notification.success({
        message: 'Gia hạn thành công',
        description: `Đã gia hạn khung giờ ${new Date(data.slotStartTime).toLocaleTimeString('vi-VN')}`,
        duration: 3
      });
    });
  }

  // Helper to create unique slot key
  createSlotKey(slotStartTime) {
    return new Date(slotStartTime).getTime().toString();
  }

  // Join service group to receive updates
  async joinServiceGroup(serviceId, date, staffId = 'any') {
    if (!this.isConnected || !this.connection) {
      console.error('SignalR not connected');
      return false;
    }

    try {
      await this.connection.invoke('JoinServiceGroup', 
        serviceId.toString(), 
        date, 
        staffId?.toString() || 'any'
      );
      
      this.currentServiceGroup = { serviceId, date, staffId };
      console.log(`Joined service group: ${serviceId}_${date}_${staffId || 'any'}`);
      return true;
    } catch (err) {
      console.error('Error joining service group:', err);
      return false;
    }
  }

  // Leave service group
  async leaveServiceGroup() {
    if (!this.isConnected || !this.connection || !this.currentServiceGroup) {
      return false;
    }

    try {
      const { serviceId, date, staffId } = this.currentServiceGroup;
      await this.connection.invoke('LeaveServiceGroup', 
        serviceId.toString(), 
        date, 
        staffId?.toString() || 'any'
      );
      
      this.currentServiceGroup = null;
      this.reservations.clear();
      console.log('Left service group');
      return true;
    } catch (err) {
      console.error('Error leaving service group:', err);
      return false;
    }
  }

  // Reserve a slot
  async reserveSlot(slotData) {
    if (!this.isConnected || !this.connection) {
      console.error('SignalR not connected');
      return false;
    }

    try {
      await this.connection.invoke('ReserveSlot', {
        serviceId: slotData.serviceId,
        staffId: slotData.staffId,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        date: slotData.date,
        userName: slotData.userName || 'Khách hàng'
      });
      return true;
    } catch (err) {
      console.error('Error reserving slot:', err);
      return false;
    }
  }

  // Release a slot
  async releaseSlot(slotData) {
    if (!this.isConnected || !this.connection) {
      console.error('SignalR not connected');
      return false;
    }

    try {
      await this.connection.invoke('ReleaseSlot', {
        serviceId: slotData.serviceId,
        staffId: slotData.staffId,
        startTime: slotData.startTime,
        date: slotData.date
      });
      return true;
    } catch (err) {
      console.error('Error releasing slot:', err);
      return false;
    }
  }

  // Extend reservation
  async extendReservation(slotData) {
    if (!this.isConnected || !this.connection) {
      console.error('SignalR not connected');
      return false;
    }

    try {
      await this.connection.invoke('ExtendReservation', {
        serviceId: slotData.serviceId,
        startTime: slotData.startTime
      });
      return true;
    } catch (err) {
      console.error('Error extending reservation:', err);
      return false;
    }
  }

  // Check if slot is reserved
  isSlotReserved(slotStartTime) {
    const key = this.createSlotKey(slotStartTime);
    return this.reservations.has(key);
  }

  // Get reservation info for slot
  getSlotReservation(slotStartTime) {
    const key = this.createSlotKey(slotStartTime);
    return this.reservations.get(key);
  }

  // Get all current reservations
  getAllReservations() {
    return Array.from(this.reservations.values());
  }

  // Add event listener
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  // Remove event listener
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  // Notify listeners
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error('Error in event listener:', err);
        }
      });
    }
  }

  // Disconnect
  async disconnect() {
    if (this.connection) {
      try {
        await this.leaveServiceGroup();
        await this.connection.stop();
      } catch (err) {
        console.error('Error disconnecting:', err);
      } finally {
        this.connection = null;
        this.isConnected = false;
        this.currentServiceGroup = null;
        this.reservations.clear();
        this.listeners.clear();
      }
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      currentGroup: this.currentServiceGroup,
      reservationsCount: this.reservations.size
    };
  }

  // ===== TIME SLOT SELECTION SHARING METHODS (NEW) =====
  
  // Join time slot room for real-time selection sharing
  async joinTimeSlotRoom(roomKey) {
    if (!this.isConnected || !this.connection) {
      console.error('SignalR not connected');
      return false;
    }

    try {
      await this.connection.invoke('JoinTimeSlotRoom', roomKey);
      console.log(`✅ [SignalR] Joined time slot room: ${roomKey}`);
      return true;
    } catch (err) {
      console.error('❌ [SignalR] Error joining time slot room:', err);
      return false;
    }
  }

  // Leave time slot room
  async leaveTimeSlotRoom(roomKey) {
    if (!this.isConnected || !this.connection) {
      return false;
    }

    try {
      await this.connection.invoke('LeaveTimeSlotRoom', roomKey);
      console.log(`✅ [SignalR] Left time slot room: ${roomKey}`);
      return true;
    } catch (err) {
      console.error('❌ [SignalR] Error leaving time slot room:', err);
      return false;
    }
  }

  // Notify when user selects a time slot
  async notifyTimeSlotSelected(data) {
    if (!this.isConnected || !this.connection) {
      console.error('SignalR not connected');
      return false;
    }

    try {
      await this.connection.invoke('NotifyTimeSlotSelected', data);
      console.log(`📤 [SignalR] Notified time slot selected:`, data);
      return true;
    } catch (err) {
      console.error('❌ [SignalR] Error notifying time slot selected:', err);
      return false;
    }
  }

  // Notify when user clears/deselects a time slot
  async notifyTimeSlotCleared(data) {
    if (!this.isConnected || !this.connection) {
      console.error('SignalR not connected');
      return false;
    }

    try {
      await this.connection.invoke('NotifyTimeSlotCleared', data);
      console.log(`📤 [SignalR] Notified time slot cleared:`, data);
      return true;
    } catch (err) {
      console.error('❌ [SignalR] Error notifying time slot cleared:', err);
      return false;
    }
  }

  // Get current connection for direct use in components
  getConnection() {
    return this.connection;
  }

  // Check if connected
  isConnectionReady() {
    return this.isConnected && this.connection;
  }
}

// Export singleton instance
export default new SignalRService(); 