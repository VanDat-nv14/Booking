import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { Card, Badge, Empty, Spin } from 'antd';
import styled from 'styled-components';
import dayjs from '../../utils/dayjs';

// Simple styled components
const SlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const TimeSlot = styled.div`
  padding: 12px;
  text-align: center;
  border-radius: 8px;
  border: 2px solid;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  
  /* Enhanced color logic with clearer priority and distinct colors */
  border-color: ${props => 
    props.selected ? '#1890ff' :                          // Blue for selected
    props.beingSelectedByOthers ? '#722ed1' :             // Purple for others selecting
    props.petBusy ? '#ff4d4f' :                          // RED for pet busy (highest priority)
    props.staffBusy && !props.petBusy ? '#fa8c16' :      // ORANGE for staff busy only
    props.past ? '#d9d9d9' :                             // Gray for past
    '#52c41a'                                            // Green for available
  };
  
  background-color: ${props => 
    props.selected ? '#e6f7ff' :                          // Light blue for selected
    props.beingSelectedByOthers ? '#f9f0ff' :             // Light purple for others
    props.petBusy ? '#fff1f0' :                          // Light red for pet busy
    props.staffBusy && !props.petBusy ? '#fff7e6' :      // Light orange for staff busy
    props.past ? '#f5f5f5' :                             // Light gray for past
    '#f6ffed'                                            // Light green for available
  };
  
  color: ${props => 
    props.selected ? '#1890ff' :
    props.beingSelectedByOthers ? '#722ed1' :
    props.petBusy ? '#ff4d4f' :                          // RED text for pet busy
    props.staffBusy && !props.petBusy ? '#fa8c16' :      // ORANGE text for staff busy
    props.past ? '#bfbfbf' : 
    '#52c41a'
  };
  
  &:hover {
    opacity: ${props => props.disabled ? 0.7 : 0.8};
    transform: ${props => props.disabled ? 'none' : 'scale(1.02)'};
  }
  
  /* Pulsing animation for slots being selected by others */
  ${props => props.beingSelectedByOthers && `
    animation: pulse 2s infinite;
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
  `}
  
  /* Special highlighting for busy slots */
  ${props => (props.petBusy || props.staffBusy) && `
    box-shadow: 0 2px 8px rgba(255, 77, 79, 0.15);
    font-weight: 600;
  `}
`;

const OtherUserIndicator = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #722ed1;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const TimeSlotGrid = ({
  selectedDate,
  selectedService,
  selectedSlot,
  petBusyTimeSlots = [],
  petAppointments = [],
  selectedStaffId,
  appointments = [],
  availableSlots = [],
  timeSlots: providedTimeSlots = [],
  onSelectTimeSlot,
  loading = false,
  // SignalR props
  signalRConnection = null,
  currentUserId = null,
  onSlotHover = null,
}) => {
  // State management
  const [otherUsersSelections, setOtherUsersSelections] = useState({});
  const [signalRStatus, setSignalRStatus] = useState('disconnected');
  
  // Refs for cleanup
  const timeoutRefs = useRef({});
  const roomKeyRef = useRef(null);
  const previousSelectedSlotRef = useRef(null);
  
  // Debug mode - only log critical issues in production
  const DEBUG_MODE = process.env.NODE_ENV === 'development';
  
  const debugLog = useCallback((message, data = null) => {
    if (DEBUG_MODE) {
      console.log(message, data);
    }
  }, []);

  // 🔍 DEBUG: Log props for debugging the 19:40 slot issue
  React.useEffect(() => {
    console.log('🚨 [PROPS DEBUG] TimeSlotGrid props:', {
      selectedDate: selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : 'none',
      selectedService: selectedService ? {
        id: selectedService.id || selectedService.serviceId,
        name: selectedService.name,
        duration: selectedService.duration
      } : 'none',
      petBusyTimeSlots: petBusyTimeSlots,
      petAppointments: petAppointments?.map(apt => ({
        appointmentId: apt.appointmentId,
        appointmentDate: apt.appointmentDate,
        startTime: apt.appointmentDate ? dayjs(apt.appointmentDate).format('HH:mm') : 'unknown',
        duration: apt.duration || apt.serviceDuration || apt.service?.duration || 30,
        status: apt.status,
        petId: apt.petId
      })),
      availableSlots: availableSlots?.length || 0,
      availableSlotsWithIsPetBusy: availableSlots?.filter(s => s.isPetBusy)?.length || 0,
      sampleAvailableSlots: availableSlots?.slice(0, 3)?.map(slot => ({
        startTime: slot.startTime || slot.startTimeString,
        isPetBusy: slot.isPetBusy,
        isStaffBusy: slot.isStaffBusy,
        available: slot.available,
        unavailableReason: slot.unavailableReason
      }))
    });
    
    // Special check for 19:40 slot
    const slot1940 = availableSlots?.find(slot => 
      (slot.startTime === '19:40' || slot.startTimeString === '19:40')
    );
    if (slot1940) {
      console.log('🚨 [FOUND 19:40] Slot 19:40 details:', slot1940);
    } else {
      console.log('🚨 [NOT FOUND] Slot 19:40 not found in availableSlots');
    }
  }, [selectedDate, selectedService, petBusyTimeSlots, petAppointments, availableSlots]);

  // Get service duration with better fallback logic
  const serviceDuration = useMemo(() => {
    // Try different ways to get duration
    const duration = selectedService?.duration || 
                    selectedService?.serviceDuration || 
                    selectedService?.Duration || 
                    30; // Only fallback to 30 if no duration found
    
    console.log('🔧 [SERVICE DURATION] Calculated duration:', {
      selectedService: selectedService,
      serviceDuration: duration,
      fromDuration: selectedService?.duration,
      fromServiceDuration: selectedService?.serviceDuration,
      fromCapitalDuration: selectedService?.Duration
    });
    
    return duration;
  }, [selectedService]);

  // Add buffer time constant  
  const BUFFER_TIME_MINUTES = 10;

  // Memoized room key to prevent unnecessary re-renders
  const roomKey = useMemo(() => {
    if (!selectedService || !selectedStaffId || !selectedDate) return null;
    return `service_${selectedService.id || selectedService.serviceId}_staff_${selectedStaffId}_date_${dayjs(selectedDate).format('YYYY-MM-DD')}`;
  }, [selectedService, selectedStaffId, selectedDate]);

  // Cleanup function for timeouts
  const cleanupTimeouts = useCallback(() => {
    Object.values(timeoutRefs.current).forEach(timeoutId => {
      if (timeoutId) clearTimeout(timeoutId);
    });
    timeoutRefs.current = {};
  }, []);

  // SignalR connection setup with proper cleanup
  useEffect(() => {
    if (!signalRConnection || !roomKey || !currentUserId) {
      debugLog('SignalR setup skipped - missing requirements');
      return;
    }

    if (signalRConnection.state !== 'Connected') {
      debugLog('SignalR not connected, current state:', signalRConnection.state);
      return;
    }

    debugLog('Setting up SignalR for room:', roomKey);
    roomKeyRef.current = roomKey;

    // Event handlers
    const handleTimeSlotSelected = (data) => {
      if (!data?.timeSlot || !data?.userId || data.userId === currentUserId) {
        return;
      }

      debugLog('SignalR: Other user selected slot:', data);

      setOtherUsersSelections(prev => ({
        ...prev,
        [data.timeSlot]: {
          userId: data.userId,
          userName: data.userName || 'Unknown User',
          timestamp: new Date()
        }
      }));

      // Auto-clear after 15 seconds with proper cleanup
      if (timeoutRefs.current[data.timeSlot]) {
        clearTimeout(timeoutRefs.current[data.timeSlot]);
      }
      
      timeoutRefs.current[data.timeSlot] = setTimeout(() => {
        setOtherUsersSelections(prev => {
          const newState = { ...prev };
          delete newState[data.timeSlot];
          return newState;
        });
        delete timeoutRefs.current[data.timeSlot];
      }, 15000);
    };

    const handleTimeSlotCleared = (data) => {
      if (!data?.timeSlot || !data?.userId || data.userId === currentUserId) {
        return;
      }

      debugLog('SignalR: Other user cleared slot:', data);

      setOtherUsersSelections(prev => {
        const newState = { ...prev };
        delete newState[data.timeSlot];
        return newState;
      });

      // Clear associated timeout
      if (timeoutRefs.current[data.timeSlot]) {
        clearTimeout(timeoutRefs.current[data.timeSlot]);
        delete timeoutRefs.current[data.timeSlot];
      }
    };

    // Register handlers
    signalRConnection.on('TimeSlotSelected', handleTimeSlotSelected);
    signalRConnection.on('TimeSlotCleared', handleTimeSlotCleared);

    // Join room
    signalRConnection.invoke('JoinTimeSlotRoom', roomKey)
      .then(() => debugLog('Successfully joined room:', roomKey))
      .catch(err => console.error('Failed to join room:', err));

    // Cleanup function
    return () => {
      debugLog('Cleaning up SignalR listeners');
      
      signalRConnection.off('TimeSlotSelected', handleTimeSlotSelected);
      signalRConnection.off('TimeSlotCleared', handleTimeSlotCleared);
      
      if (roomKeyRef.current && signalRConnection.state === 'Connected') {
        signalRConnection.invoke('LeaveTimeSlotRoom', roomKeyRef.current)
          .catch(err => console.error('Failed to leave room:', err));
      }
      
      cleanupTimeouts();
    };
  }, [signalRConnection, roomKey, currentUserId, debugLog, cleanupTimeouts]);

  // Broadcast slot selection
  useEffect(() => {
    const currentSlot = selectedSlot;
    const previousSlot = previousSelectedSlotRef.current;
    
    if (!signalRConnection || !roomKey || signalRConnection.state !== 'Connected') {
      previousSelectedSlotRef.current = currentSlot;
      return;
    }

    // Handle slot selection
    if (currentSlot && currentSlot !== previousSlot) {
      const timeSlot = currentSlot.startTime instanceof Date 
        ? dayjs(currentSlot.startTime).format('HH:mm')
        : currentSlot.startTime || currentSlot.startTimeString;

      if (timeSlot) {
        signalRConnection.invoke('NotifyTimeSlotSelected', {
          roomKey,
          timeSlot,
          userId: currentUserId,
          userName: localStorage.getItem('userName') || 'Anonymous User',
          serviceId: selectedService?.id || selectedService?.serviceId,
          staffId: selectedStaffId,
          date: dayjs(selectedDate).format('YYYY-MM-DD')
        }).catch(err => console.error('Failed to broadcast slot selection:', err));
      }
    }

    // Handle slot deselection
    if (!currentSlot && previousSlot) {
      const timeSlot = previousSlot.startTime instanceof Date 
        ? dayjs(previousSlot.startTime).format('HH:mm')
        : previousSlot.startTime || previousSlot.startTimeString;

      if (timeSlot) {
        signalRConnection.invoke('NotifyTimeSlotCleared', {
          roomKey,
          timeSlot,
          userId: currentUserId,
          userName: localStorage.getItem('userName') || 'Anonymous User',
          serviceId: selectedService?.id || selectedService?.serviceId,
          staffId: selectedStaffId,
          date: dayjs(selectedDate).format('YYYY-MM-DD')
        }).catch(err => console.error('Failed to broadcast slot clear:', err));
      }
    }

    previousSelectedSlotRef.current = currentSlot;
  }, [selectedSlot, signalRConnection, roomKey, currentUserId, selectedService, selectedStaffId, selectedDate]);

  // Monitor SignalR connection status
  useEffect(() => {
    if (!signalRConnection) {
      setSignalRStatus('unavailable');
      return;
    }

    const updateStatus = () => setSignalRStatus(signalRConnection.state.toLowerCase());
    updateStatus();

    const handleReconnected = () => setSignalRStatus('connected');
    const handleReconnecting = () => setSignalRStatus('reconnecting');
    const handleClose = () => setSignalRStatus('disconnected');

    signalRConnection.onreconnected(handleReconnected);
    signalRConnection.onreconnecting(handleReconnecting);
    signalRConnection.onclose(handleClose);

    const statusInterval = setInterval(updateStatus, 5000);

    return () => {
      clearInterval(statusInterval);
      signalRConnection.off('onreconnected', handleReconnected);
      signalRConnection.off('onreconnecting', handleReconnecting);
      signalRConnection.off('onclose', handleClose);
    };
  }, [signalRConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTimeouts();
    };
  }, [cleanupTimeouts]);

  // Memoized time slots processing
  const timeSlots = useMemo(() => {
    console.log('🔧 [TIME SLOTS] Processing slots with serviceDuration:', serviceDuration);
    
    if (availableSlots?.length > 0) {
      console.log('🔧 [TIME SLOTS] Using backend availableSlots:', availableSlots.length);
      return availableSlots.map(slot => ({
        startTime: slot.startTime || slot.startTimeString || '',
        endTime: slot.endTime || '', 
        duration: slot.duration || serviceDuration,
        available: slot.available,
        isPetBusy: slot.isPetBusy,
        isStaffBusy: slot.isStaffBusy,
        busyReason: slot.busyReason,
        isCurrentAppointment: slot.isCurrentAppointment
      }));
    }
    
    // Fallback: generate slots based on service duration + buffer
    console.log('🔧 [TIME SLOTS] Generating fallback slots with duration:', serviceDuration);
    const slots = [];
    const startHour = 8;
    const endHour = 21;
    const slotInterval = serviceDuration + BUFFER_TIME_MINUTES; // Service duration + 10 min buffer
    
    // Generate slots with proper intervals
    let currentTime = dayjs().hour(startHour).minute(0).second(0);
    const endTime = dayjs().hour(endHour).minute(30).second(0); // End at 21:30
    
    while (currentTime.isBefore(endTime)) {
      const startTimeStr = currentTime.format('HH:mm');
      const slotEndTime = currentTime.add(serviceDuration, 'minute');
      const endTimeStr = slotEndTime.format('HH:mm');
      
      // Only add slot if it doesn't exceed closing time
      if (slotEndTime.hour() < endHour || (slotEndTime.hour() === endHour && slotEndTime.minute() <= 30)) {
        slots.push({
          startTime: startTimeStr,
          endTime: endTimeStr,
          duration: serviceDuration,
          available: true,
          isPetBusy: false,
          isStaffBusy: false
        });
        
        console.log('🔧 [TIME SLOTS] Generated slot:', {
          start: startTimeStr,
          end: endTimeStr,
          duration: serviceDuration,
          interval: slotInterval
        });
      }
      
      // Move to next slot (current slot duration + buffer)
      currentTime = currentTime.add(slotInterval, 'minute');
    }
    
    console.log('🔧 [TIME SLOTS] Total generated slots:', slots.length);
    return slots;
  }, [availableSlots, serviceDuration]);

  // Optimized check functions
  const isPastSlot = useCallback((timeStr) => {
    if (!selectedDate) return false;
    const selectedDateStr = dayjs(selectedDate).format('YYYY-MM-DD');
    const todayStr = dayjs().format('YYYY-MM-DD');
    
    if (selectedDateStr < todayStr) return true;
    if (selectedDateStr === todayStr) {
      return dayjs().isAfter(dayjs(`${selectedDateStr}T${timeStr}`));
    }
    return false;
  }, [selectedDate]);

  const isPetBusy = useCallback((timeStr, slot) => {
    // 🔍 DEBUG: Special logging for 19:40 slot
    if (timeStr === '19:40') {
      console.log('🚨 [DEBUG 19:40] Checking isPetBusy for slot 19:40:', {
        timeStr,
        slot: {
          isPetBusy: slot?.isPetBusy,
          unavailableReason: slot?.unavailableReason,
          available: slot?.available,
          isAvailable: slot?.isAvailable,
          startTime: slot?.startTime,
          startTimeString: slot?.startTimeString,
          endTime: slot?.endTime,
          duration: slot?.duration,
          fullSlotObject: slot
        },
        petBusyTimeSlots: petBusyTimeSlots,
        petBusyTimeSlotDetails: {
          isArray: Array.isArray(petBusyTimeSlots),
          length: petBusyTimeSlots?.length,
          includes1940: petBusyTimeSlots?.includes('19:40'),
          items: petBusyTimeSlots
        },
        petAppointments: petAppointments?.map(apt => ({
          appointmentId: apt.appointmentId,
          appointmentDate: apt.appointmentDate,
          startTime: apt.appointmentDate ? dayjs(apt.appointmentDate).format('HH:mm') : 'unknown',
          duration: apt.duration || apt.serviceDuration || apt.service?.duration || 30,
          status: apt.status,
          petId: apt.petId,
          fullAppointment: apt
        })),
        petAppointmentDetails: {
          isArray: Array.isArray(petAppointments),
          length: petAppointments?.length,
          has1940: petAppointments?.some(apt => 
            apt.appointmentDate && dayjs(apt.appointmentDate).format('HH:mm') === '19:40'
          )
        }
      });
    }

    // Priority 1: Use backend slot data
    if (slot?.isPetBusy !== undefined) {
      if (timeStr === '19:40') {
        console.log('🚨 [DEBUG 19:40] Using backend slot data - isPetBusy:', slot.isPetBusy);
      }
      return slot.isPetBusy;
    }
    
    // Priority 2: Check petBusyTimeSlots array
    if (petBusyTimeSlots?.includes(timeStr)) {
      if (timeStr === '19:40') {
        console.log('🚨 [DEBUG 19:40] Found in petBusyTimeSlots - returning TRUE');
      }
      return true;
    }
    
    // Priority 3: Check appointment overlaps
    if (petAppointments?.length > 0) {
      const result = petAppointments.some(apt => {
        if (['Cancelled', 'No-Show', 'Completed'].includes(apt.status)) {
          if (timeStr === '19:40') {
            console.log('🚨 [DEBUG 19:40] Skipping cancelled/completed appointment:', apt.status);
          }
          return false;
        }
        
        const aptStartTime = dayjs(apt.appointmentDate).format('HH:mm');
        const aptDuration = apt.duration || apt.serviceDuration || apt.service?.duration || 30;
        const aptEndTime = dayjs(`2023-01-01T${aptStartTime}`).add(aptDuration, 'minute').format('HH:mm');
        
        const slotTime = dayjs(`2023-01-01T${timeStr}`);
        const aptStart = dayjs(`2023-01-01T${aptStartTime}`);
        const aptEnd = dayjs(`2023-01-01T${aptEndTime}`);
        
        const isOverlap = slotTime.isSameOrAfter(aptStart) && slotTime.isBefore(aptEnd);
        
        if (timeStr === '19:40') {
          console.log('🚨 [DEBUG 19:40] Checking appointment overlap:', {
            aptStartTime,
            aptEndTime,
            aptDuration,
            slotTime: timeStr,
            isOverlap,
            appointmentId: apt.appointmentId,
            status: apt.status
          });
        }
        
        return isOverlap;
      });
      
      if (timeStr === '19:40') {
        console.log('🚨 [DEBUG 19:40] Final appointment overlap result:', result);
      }
      
      return result;
    }
    
    if (timeStr === '19:40') {
      console.log('🚨 [DEBUG 19:40] No petAppointments - returning FALSE');
    }
    
    return false;
  }, [petBusyTimeSlots, petAppointments]);

  const isStaffBusy = useCallback((timeStr, slot) => {
    // 🔍 DEBUG: Special logging for staff busy debugging
    const shouldLog = DEBUG_MODE && (timeStr === '09:00' || timeStr === '13:00' || timeStr === '15:00');
    
    if (shouldLog) {
      console.log(`🚨 [STAFF BUSY DEBUG] Checking slot ${timeStr}:`, {
        timeStr,
        slot: {
          isStaffBusy: slot?.isStaffBusy,
          available: slot?.available,
          unavailableReason: slot?.unavailableReason,
          fullSlot: slot
        },
        selectedStaffId,
        appointmentsLength: appointments?.length || 0,
        appointments: appointments?.map(apt => ({
          staffId: apt.staffId,
          appointmentDate: apt.appointmentDate,
          startTime: apt.appointmentDate ? dayjs(apt.appointmentDate).format('HH:mm') : 'unknown',
          duration: apt.duration || apt.serviceDuration || apt.service?.duration || 30
        }))
      });
    }
    
    // Use slot data from backend first
    if (slot?.isStaffBusy !== undefined) {
      if (shouldLog) {
        console.log(`🚨 [STAFF BUSY DEBUG] Using backend slot data - isStaffBusy: ${slot.isStaffBusy}`);
      }
      return slot.isStaffBusy;
    }
    
    // Fallback: Check appointments
    if (!selectedStaffId || !appointments?.length) {
      if (shouldLog) {
        console.log(`🚨 [STAFF BUSY DEBUG] No staff ID or appointments - returning false`);
      }
      return false;
    }
    
    const result = appointments.some(apt => {
      // Use String comparison to avoid type issues
      if (String(apt.staffId) !== String(selectedStaffId)) {
        return false;
      }
      
      const aptStartTime = dayjs(apt.appointmentDate).format('HH:mm');
      const aptDuration = apt.duration || apt.serviceDuration || apt.service?.duration || 30;
      const aptEndTime = dayjs(`2023-01-01T${aptStartTime}`).add(aptDuration, 'minute').format('HH:mm');
      
      const slotTime = dayjs(`2023-01-01T${timeStr}`);
      const aptStart = dayjs(`2023-01-01T${aptStartTime}`);
      const aptEnd = dayjs(`2023-01-01T${aptEndTime}`);
      
      const isOverlap = slotTime.isSameOrAfter(aptStart) && slotTime.isBefore(aptEnd);
      
      if (shouldLog && isOverlap) {
        console.log(`🚨 [STAFF BUSY DEBUG] Appointment overlap found:`, {
          aptStartTime,
          aptEndTime,
          aptDuration,
          slotTime: timeStr,
          isOverlap
        });
      }
      
      return isOverlap;
    });
    
    if (shouldLog) {
      console.log(`🚨 [STAFF BUSY DEBUG] Final result for ${timeStr}: ${result}`);
    }
    
    return result;
  }, [selectedStaffId, appointments, DEBUG_MODE]);

  // Other user selections
  const isBeingSelectedByOthers = useCallback((timeStr) => {
    return !!otherUsersSelections[timeStr];
  }, [otherUsersSelections]);

  const getOtherUserInfo = useCallback((timeStr) => {
    return otherUsersSelections[timeStr];
  }, [otherUsersSelections]);

  const isSelected = useCallback((timeStr) => {
    if (!selectedSlot) return false;
    const selectedTime = selectedSlot.startTime instanceof Date 
      ? dayjs(selectedSlot.startTime).format('HH:mm')
      : selectedSlot.startTime || selectedSlot.startTimeString;
    return selectedTime === timeStr;
  }, [selectedSlot]);

  // Handle slot click
  const handleSlotClick = useCallback((slot) => {
    const timeStr = slot.startTime || slot.startTimeString || '';
    
    const isPast = isPastSlot(timeStr);
    const petBusy = isPetBusy(timeStr, slot);
    const staffBusy = isStaffBusy(timeStr, slot);
    const beingSelectedByOthers = isBeingSelectedByOthers(timeStr);
    
    // Allow clicking on current appointment slot
    if (slot.isCurrentAppointment) {
      debugLog('Current appointment slot clicked - allowed');
    } else if (isPast || petBusy || staffBusy || beingSelectedByOthers) {
      debugLog('Slot blocked:', { timeStr, isPast, petBusy, staffBusy, beingSelectedByOthers });
      return;
    }
    
    const selectedDateStr = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
    
    const slotData = {
      startTime: timeStr,
      startTimeString: timeStr,
      endTime: slot.endTime || '',
      duration: slot.duration,
      appointmentDate: `${selectedDateStr}T${timeStr}:00`,
      date: selectedDateStr
    };
    
    onSelectTimeSlot?.(slotData);
  }, [isPastSlot, isPetBusy, isStaffBusy, isBeingSelectedByOthers, selectedDate, onSelectTimeSlot, debugLog]);

  // Badge info
  const getBadgeInfo = useCallback((timeStr, slot) => {
    if (isSelected(timeStr)) return { status: 'success', text: 'Đã chọn' };
    if (slot?.isCurrentAppointment) return { status: 'processing', text: 'Lịch hiện tại' };
    if (isBeingSelectedByOthers(timeStr)) {
      const otherUser = getOtherUserInfo(timeStr);
      return { status: 'warning', text: `${otherUser?.userName || 'Ai đó'} đang chọn` };
    }
    if (isPastSlot(timeStr)) return { status: 'default', text: 'Đã qua' };
    if (isPetBusy(timeStr, slot)) {
      const reason = slot?.unavailableReason || 'Thú cưng đã có lịch';
      return { status: 'error', text: `🐕 ${reason}` };
    }
    if (isStaffBusy(timeStr, slot)) {
      const reason = slot?.unavailableReason || 'Nhân viên đã có lịch';
      return { status: 'warning', text: `👤 ${reason}` };
    }
    
    return { status: 'success', text: '✅ Khả dụng' };
  }, [isSelected, isBeingSelectedByOthers, getOtherUserInfo, isPastSlot, isPetBusy, isStaffBusy]);

  // SignalR status display
  const getSignalRStatusDisplay = useCallback(() => {
    if (!signalRConnection || !selectedStaffId || !selectedService) {
      return { color: '#faad14', icon: '🟡', text: !selectedStaffId ? 'Chọn nhân viên để bật' : 'Tắt' };
    }
    
    switch (signalRStatus) {
      case 'connected':
        return { color: '#52c41a', icon: '🟢', text: 'Real-time: Hoạt động' };
      case 'connecting':
      case 'reconnecting':
        return { color: '#1890ff', icon: '🔵', text: 'Real-time: Đang kết nối...' };
      case 'disconnected':
        return { color: '#ff4d4f', icon: '🔴', text: 'Real-time: Mất kết nối' };
      default:
        return { color: '#faad14', icon: '🟡', text: 'Real-time: Không khả dụng' };
    }
  }, [signalRConnection, selectedStaffId, selectedService, signalRStatus]);

  if (loading) {
    return (
      <Card title="Chọn khung giờ">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải khung giờ...</div>
        </div>
      </Card>
    );
  }

  const finalTimeSlots = providedTimeSlots.length > 0 ? providedTimeSlots : timeSlots;
  
  if (!finalTimeSlots || finalTimeSlots.length === 0) {
    return (
      <Card title="Chọn khung giờ">
        <Empty 
          description="Không có khung giờ nào khả dụng"
          style={{ padding: '40px' }}
        />
      </Card>
    );
  }

  return (
    <Card 
      title="Chọn khung giờ"
      extra={
        <div style={{ fontSize: '12px', color: '#666' }}>
          {finalTimeSlots.length} khung giờ
          {Object.keys(otherUsersSelections).length > 0 && (
            <div style={{ color: '#722ed1', marginTop: 4 }}>
              {Object.keys(otherUsersSelections).length} người khác đang chọn
            </div>
          )}
          {(() => {
            const statusInfo = getSignalRStatusDisplay();
            return (
              <div style={{ color: statusInfo.color, marginTop: 4, fontSize: '11px' }}>
                {statusInfo.icon} {statusInfo.text}
              </div>
            );
          })()}
        </div>
      }
    >
      <SlotGrid>
        {finalTimeSlots.map((slot, index) => {
          const timeStr = slot.startTime || slot.startTimeString || '';
          const isPast = isPastSlot(timeStr);
          const petBusy = isPetBusy(timeStr, slot);
          const staffBusy = isStaffBusy(timeStr, slot);
          const selected = isSelected(timeStr);
          const beingSelectedByOthers = isBeingSelectedByOthers(timeStr);
          const otherUserInfo = getOtherUserInfo(timeStr);
          
          const disabled = slot.isCurrentAppointment ? beingSelectedByOthers : (isPast || petBusy || staffBusy || beingSelectedByOthers);
          const badgeInfo = getBadgeInfo(timeStr, slot);
          
          return (
            <TimeSlot
              key={`${timeStr}-${index}`}
              selected={selected}
              petBusy={petBusy}
              staffBusy={staffBusy}
              past={isPast}
              beingSelectedByOthers={beingSelectedByOthers}
              disabled={disabled}
              onClick={() => handleSlotClick(slot)}
              title={
                beingSelectedByOthers 
                  ? `Đang được chọn bởi ${otherUserInfo?.userName || 'ai đó'}` 
                  : petBusy 
                    ? `🐕 Thú cưng đã có lịch vào khung giờ này${slot.unavailableReason ? `: ${slot.unavailableReason}` : ''}` 
                    : staffBusy 
                      ? `👤 Nhân viên đã có lịch vào khung giờ này${slot.unavailableReason ? `: ${slot.unavailableReason}` : ''}` 
                      : isPast 
                        ? 'Khung giờ đã qua' 
                        : 'Nhấp để chọn khung giờ này'
              }
            >
              {/* Other user indicator */}
              {beingSelectedByOthers && (
                <OtherUserIndicator>
                  {otherUserInfo?.userName?.charAt(0).toUpperCase() || '?'}
                </OtherUserIndicator>
              )}
              
              {/* Busy indicator icons */}
              {(petBusy || staffBusy) && (
                <div style={{ 
                  position: 'absolute', 
                  top: '4px', 
                  left: '4px', 
                  fontSize: '12px',
                  background: petBusy ? '#ff4d4f' : '#fa8c16',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {petBusy ? '🐕' : '👤'}
                </div>
              )}
              
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {timeStr}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {slot.endTime ? `${timeStr} - ${slot.endTime}` : timeStr}
              </div>
              <Badge 
                status={badgeInfo.status}
                text={badgeInfo.text}
                style={{ 
                  fontSize: '10px',
                  marginTop: '4px'
                }}
              />
            </TimeSlot>
          );
        })}
      </SlotGrid>
    </Card>
  );
};

export default TimeSlotGrid; 