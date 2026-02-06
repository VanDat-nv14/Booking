import 'dart:async';
import 'package:flutter/foundation.dart';
import '../services/timeslot_signalr_service.dart';

/// Provider để quản lý state của realtime timeslot selections
/// Tương tự useSlotReservation hook trong web
class TimeSlotReservationProvider extends ChangeNotifier {
  final TimeSlotSignalRService _signalRService = TimeSlotSignalRService();
  
  // State
  bool _isConnected = false;
  bool _isInitializing = false;
  String? _error;
  
  // Map để track selections của other users
  // Key: timeSlot (e.g., "19:40"), Value: TimeSlotSelection
  final Map<String, TimeSlotSelection> _otherUsersSelections = {};
  
  // Subscriptions
  StreamSubscription<TimeSlotSelection>? _selectedSubscription;
  StreamSubscription<TimeSlotSelection>? _clearedSubscription;
  StreamSubscription<bool>? _connectionSubscription;
  
  // Timers to auto-clear selections after timeout
  final Map<String, Timer> _clearTimers = {};
  
  // Current user info
  String? _currentUserId;
  String? _currentUserName;
  
  // Current room context
  int? _currentServiceId;
  int? _currentStaffId;
  String? _currentDate;

  // Getters
  bool get isConnected => _isConnected;
  bool get isInitializing => _isInitializing;
  String? get error => _error;
  Map<String, TimeSlotSelection> get otherUsersSelections => Map.unmodifiable(_otherUsersSelections);
  
  TimeSlotReservationProvider() {
    _setupEventListeners();
  }

  /// Setup event listeners for SignalR events
  void _setupEventListeners() {
    // Listen to TimeSlotSelected events
    _selectedSubscription = _signalRService.onTimeSlotSelected.listen((selection) {
      // Ignore our own selections
      if (selection.userId == _currentUserId) {
        debugPrint('🔕 Ignoring own selection: ${selection.timeSlot}');
        return;
      }
      
      debugPrint('🔔 Other user selected slot: ${selection.timeSlot} by ${selection.userName}');
      
      // Add to map
      _otherUsersSelections[selection.timeSlot] = selection;
      
      // Auto-clear after 15 seconds
      _clearTimers[selection.timeSlot]?.cancel();
      _clearTimers[selection.timeSlot] = Timer(const Duration(seconds: 15), () {
        _otherUsersSelections.remove(selection.timeSlot);
        _clearTimers.remove(selection.timeSlot);
        notifyListeners();
      });
      
      notifyListeners();
    });

    // Listen to TimeSlotCleared events
    _clearedSubscription = _signalRService.onTimeSlotCleared.listen((selection) {
      // Ignore our own clears
      if (selection.userId == _currentUserId) {
        debugPrint('🔕 Ignoring own clear: ${selection.timeSlot}');
        return;
      }
      
      debugPrint('🔔 Other user cleared slot: ${selection.timeSlot}');
      
      // Remove from map
      _otherUsersSelections.remove(selection.timeSlot);
      _clearTimers[selection.timeSlot]?.cancel();
      _clearTimers.remove(selection.timeSlot);
      
      notifyListeners();
    });

    // Listen to connection status changes
    _connectionSubscription = _signalRService.onConnectionStatusChanged.listen((connected) {
      _isConnected = connected;
      if (connected) {
        _error = null;
      }
      notifyListeners();
    });
  }

  /// Initialize SignalR connection
  Future<void> initialize({
    required String userId,
    String? userName,
  }) async {
    if (_isInitializing) return;
    
    _isInitializing = true;
    _error = null;
    _currentUserId = userId;
    _currentUserName = userName;
    notifyListeners();

    try {
      await _signalRService.initialize();
      _isConnected = true;
      _error = null;
      debugPrint('✅ TimeSlot reservation provider initialized');
    } catch (e) {
      debugPrint('❌ Failed to initialize: $e');
      _error = 'Không thể kết nối đến server real-time';
      _isConnected = false;
    } finally {
      _isInitializing = false;
      notifyListeners();
    }
  }

  /// Join room for specific service/staff/date
  /// Tương tự như joinServiceGroup trong web
  Future<bool> joinTimeSlotRoom({
    required int serviceId,
    required int staffId,
    required String date,
  }) async {
    if (!_isConnected) {
      debugPrint('⚠️ Cannot join room: Not connected');
      return false;
    }

    // Leave current room and clear selections
    await leaveCurrentRoom();
    
    // Save current context
    _currentServiceId = serviceId;
    _currentStaffId = staffId;
    _currentDate = date;

    final success = await _signalRService.joinTimeSlotRoom(
      serviceId: serviceId,
      staffId: staffId,
      date: date,
    );

    if (success) {
      debugPrint('✅ Joined room: service=$serviceId, staff=$staffId, date=$date');
    }

    return success;
  }

  /// Leave current room and clear all selections
  Future<void> leaveCurrentRoom() async {
    // Clear all other users' selections
    _otherUsersSelections.clear();
    
    // Cancel all timers
    for (var timer in _clearTimers.values) {
      timer.cancel();
    }
    _clearTimers.clear();
    
    // Leave SignalR room
    await _signalRService.leaveCurrentRoom();
    
    // Clear context
    _currentServiceId = null;
    _currentStaffId = null;
    _currentDate = null;
    
    notifyListeners();
  }

  /// Broadcast when user selects a time slot
  Future<void> selectTimeSlot(String timeSlot) async {
    if (!_isConnected || _currentUserId == null) {
      debugPrint('⚠️ Cannot select slot: Not connected or no user ID');
      return;
    }

    await _signalRService.selectTimeSlot(
      timeSlot: timeSlot,
      userId: _currentUserId!,
      userName: _currentUserName,
      serviceId: _currentServiceId,
      staffId: _currentStaffId,
      date: _currentDate,
    );
    
    debugPrint('📤 Broadcasted slot selection: $timeSlot');
  }

  /// Broadcast when user clears/deselects a time slot
  Future<void> clearTimeSlot(String timeSlot) async {
    if (!_isConnected || _currentUserId == null) {
      debugPrint('⚠️ Cannot clear slot: Not connected or no user ID');
      return;
    }

    await _signalRService.clearTimeSlot(
      timeSlot: timeSlot,
      userId: _currentUserId!,
      userName: _currentUserName,
      serviceId: _currentServiceId,
      staffId: _currentStaffId,
      date: _currentDate,
    );
    
    debugPrint('📤 Broadcasted slot clear: $timeSlot');
  }

  /// Check if a specific time slot is being selected by others
  bool isSlotSelectedByOthers(String timeSlot) {
    return _otherUsersSelections.containsKey(timeSlot);
  }

  /// Get selection info for a specific time slot
  TimeSlotSelection? getSlotSelection(String timeSlot) {
    return _otherUsersSelections[timeSlot];
  }

  /// Disconnect from SignalR
  Future<void> disconnect() async {
    await leaveCurrentRoom();
    await _signalRService.disconnect();
    _isConnected = false;
    notifyListeners();
  }

  @override
  void dispose() {
    // Cancel all subscriptions
    _selectedSubscription?.cancel();
    _clearedSubscription?.cancel();
    _connectionSubscription?.cancel();
    
    // Cancel all timers
    for (var timer in _clearTimers.values) {
      timer.cancel();
    }
    _clearTimers.clear();
    
    // Disconnect SignalR
    _signalRService.disconnect();
    
    super.dispose();
  }
}
