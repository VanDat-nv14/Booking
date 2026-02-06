import { useState, useEffect, useCallback, useRef } from 'react';
import signalRService from '../services/signalrService';

export const useSlotReservation = (serviceId, selectedDate, staffId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);
  const currentServiceGroupRef = useRef(null);

  // Initialize SignalR connection
  const initializeConnection = useCallback(async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setError(null);

    try {
      await signalRService.initialize();
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to initialize SignalR:', err);
      setError('Không thể kết nối đến server real-time');
      setIsConnected(false);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing]);

  // Join service group when parameters change
  const joinServiceGroup = useCallback(async (svcId, date, stfId) => {
    if (!isConnected || !svcId || !date) return;

    try {
      // Leave current group first
      await signalRService.leaveServiceGroup();
      
      // Join new group
      const success = await signalRService.joinServiceGroup(svcId, date, stfId);
      if (success) {
        currentServiceGroupRef.current = { serviceId: svcId, date, staffId: stfId };
      }
    } catch (err) {
      console.error('Failed to join service group:', err);
      setError('Không thể tham gia nhóm dịch vụ');
    }
  }, [isConnected]);

  // Reserve a slot
  const reserveSlot = useCallback(async (slotData) => {
    if (!isConnected) {
      await initializeConnection();
    }

    try {
      const success = await signalRService.reserveSlot({
        ...slotData,
        serviceId: serviceId || slotData.serviceId,
        date: selectedDate || slotData.date,
        staffId: staffId || slotData.staffId
      });
      return success;
    } catch (err) {
      console.error('Failed to reserve slot:', err);
      setError('Không thể đặt chỗ khung giờ');
      return false;
    }
  }, [isConnected, serviceId, selectedDate, staffId, initializeConnection]);

  // Release a slot
  const releaseSlot = useCallback(async (slotData) => {
    if (!isConnected) return false;

    try {
      const success = await signalRService.releaseSlot({
        ...slotData,
        serviceId: serviceId || slotData.serviceId,
        date: selectedDate || slotData.date,
        staffId: staffId || slotData.staffId
      });
      return success;
    } catch (err) {
      console.error('Failed to release slot:', err);
      setError('Không thể hủy đặt chỗ');
      return false;
    }
  }, [isConnected, serviceId, selectedDate, staffId]);

  // Extend reservation
  const extendReservation = useCallback(async (slotData) => {
    if (!isConnected) return false;

    try {
      const success = await signalRService.extendReservation({
        serviceId: serviceId || slotData.serviceId,
        startTime: slotData.startTime
      });
      return success;
    } catch (err) {
      console.error('Failed to extend reservation:', err);
      setError('Không thể gia hạn đặt chỗ');
      return false;
    }
  }, [isConnected, serviceId]);

  // Check if slot is reserved
  const isSlotReserved = useCallback((slotStartTime) => {
    return signalRService.isSlotReserved(slotStartTime);
  }, []);

  // Get reservation info for slot
  const getSlotReservation = useCallback((slotStartTime) => {
    return signalRService.getSlotReservation(slotStartTime);
  }, []);

  // Get all reservations
  const getAllReservations = useCallback(() => {
    return signalRService.getAllReservations();
  }, []);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return signalRService.getConnectionStatus();
  }, []);

  // Setup event listeners
  useEffect(() => {
    const handleReservationSuccess = (data) => {
      setReservations(prev => [...prev.filter(r => 
        new Date(r.slotStartTime).getTime() !== new Date(data.slotStartTime).getTime()
      ), { ...data, isOwnReservation: true }]);
    };

    const handleSlotReserved = (data) => {
      setReservations(prev => [...prev.filter(r => 
        new Date(r.slotStartTime).getTime() !== new Date(data.slotStartTime).getTime()
      ), { ...data, isOwnReservation: false }]);
    };

    const handleSlotReleased = (data) => {
      setReservations(prev => prev.filter(r => 
        new Date(r.slotStartTime).getTime() !== new Date(data.slotStartTime).getTime()
      ));
    };

    const handleCurrentReservations = (reservationsData) => {
      setReservations(reservationsData);
    };

    const handleConnected = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    const handleReconnecting = () => {
      setError('Đang kết nối lại...');
    };

    const handleReconnected = () => {
      setError(null);
      setIsConnected(true);
    };

    const handleReservationFailed = (data) => {
      setError(data.message || 'Không thể đặt chỗ');
    };

    // Add event listeners
    signalRService.addEventListener('reservationSuccess', handleReservationSuccess);
    signalRService.addEventListener('slotReserved', handleSlotReserved);
    signalRService.addEventListener('slotReleased', handleSlotReleased);
    signalRService.addEventListener('currentReservations', handleCurrentReservations);
    signalRService.addEventListener('connected', handleConnected);
    signalRService.addEventListener('disconnected', handleDisconnected);
    signalRService.addEventListener('reconnecting', handleReconnecting);
    signalRService.addEventListener('reconnected', handleReconnected);
    signalRService.addEventListener('reservationFailed', handleReservationFailed);

    // Cleanup
    return () => {
      signalRService.removeEventListener('reservationSuccess', handleReservationSuccess);
      signalRService.removeEventListener('slotReserved', handleSlotReserved);
      signalRService.removeEventListener('slotReleased', handleSlotReleased);
      signalRService.removeEventListener('currentReservations', handleCurrentReservations);
      signalRService.removeEventListener('connected', handleConnected);
      signalRService.removeEventListener('disconnected', handleDisconnected);
      signalRService.removeEventListener('reconnecting', handleReconnecting);
      signalRService.removeEventListener('reconnected', handleReconnected);
      signalRService.removeEventListener('reservationFailed', handleReservationFailed);
    };
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    initializeConnection();
  }, [initializeConnection]);

  // Join service group when parameters change
  useEffect(() => {
    if (serviceId && selectedDate && isConnected) {
      const dateStr = selectedDate instanceof Date ? 
        selectedDate.toISOString().split('T')[0] : 
        selectedDate;
      
      joinServiceGroup(serviceId, dateStr, staffId);
    }
  }, [serviceId, selectedDate, staffId, isConnected, joinServiceGroup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentServiceGroupRef.current) {
        signalRService.leaveServiceGroup();
      }
    };
  }, []);

  return {
    // State
    isConnected,
    reservations,
    isInitializing,
    error,
    
    // Actions
    reserveSlot,
    releaseSlot,
    extendReservation,
    initializeConnection,
    
    // Queries
    isSlotReserved,
    getSlotReservation,
    getAllReservations,
    getConnectionStatus,
    
    // Utils
    clearError: () => setError(null)
  };
}; 