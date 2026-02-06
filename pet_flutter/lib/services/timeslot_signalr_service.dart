import 'dart:async';
import 'package:signalr_core/signalr_core.dart';
import 'package:flutter/foundation.dart';

/// Service để quản lý SignalR connection cho TimeSlot realtime
/// Tương tự signalrService.js trong web project
class TimeSlotSignalRService {
  static final TimeSlotSignalRService _instance = TimeSlotSignalRService._internal();
  factory TimeSlotSignalRService() => _instance;
  TimeSlotSignalRService._internal();

  HubConnection? _connection;
  String? _currentRoomKey;
  bool _isConnected = false;
  
  // Event controllers cho các events từ SignalR
  final _timeSlotSelectedController = StreamController<TimeSlotSelection>.broadcast();
  final _timeSlotClearedController = StreamController<TimeSlotSelection>.broadcast();
  final _connectionStatusController = StreamController<bool>.broadcast();
  
  // Streams public để listen
  Stream<TimeSlotSelection> get onTimeSlotSelected => _timeSlotSelectedController.stream;
  Stream<TimeSlotSelection> get onTimeSlotCleared => _timeSlotClearedController.stream;
  Stream<bool> get onConnectionStatusChanged => _connectionStatusController.stream;
  
  bool get isConnected => _isConnected;
  String? get currentRoomKey => _currentRoomKey;

  /// Initialize SignalR connection
  Future<void> initialize() async {
    if (_connection != null && _connection!.state == HubConnectionState.connected) {
      debugPrint('✅ SignalR already connected');
      return;
    }

    try {
      debugPrint('🔌 Creating SignalR connection to TimeSlotHub...');
      
      // Tạo connection đến TimeSlotHub (giống web)
      _connection = HubConnectionBuilder()
        .withUrl(
          'https://localhost:7164/timeSlotHub',
          HttpConnectionOptions(
            logging: (level, message) => debugPrint('SignalR: $message'),
          ),
        )
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .build();

      // Setup event handlers
      _setupEventHandlers();

      // Start connection
      await _connection!.start();
      _isConnected = true;
      _connectionStatusController.add(true);
      
      debugPrint('✅ SignalR Connected successfully, state: ${_connection!.state}');
    } catch (e) {
      debugPrint('❌ SignalR Connection Error: $e');
      _isConnected = false;
      _connectionStatusController.add(false);
      rethrow;
    }
  }

  /// Setup event handlers cho SignalR
  void _setupEventHandlers() {
    if (_connection == null) return;

    // Connection lifecycle events
    _connection!.onreconnecting((error) {
      debugPrint('🔄 SignalR Reconnecting... Error: $error');
      _isConnected = false;
      _connectionStatusController.add(false);
    });

    _connection!.onreconnected((connectionId) {
      debugPrint('✅ SignalR Reconnected with ID: $connectionId');
      _isConnected = true;
      _connectionStatusController.add(true);
      
      // Rejoin room if exists
      if (_currentRoomKey != null) {
        _joinRoom(_currentRoomKey!);
      }
    });

    _connection!.onclose((error) {
      debugPrint('🔌 SignalR Disconnected. Error: $error');
      _isConnected = false;
      _connectionStatusController.add(false);
    });

    // TimeSlot selection events (NEW - giống web)
    _connection!.on('TimeSlotSelected', (arguments) {
      if (arguments == null || arguments.isEmpty) return;
      
      final data = arguments[0] as Map<String, dynamic>?;
      if (data == null) return;
      
      debugPrint('🔔 [SignalR] TimeSlotSelected received: $data');
      
      final selection = TimeSlotSelection(
        timeSlot: data['timeSlot'] as String,
        userId: data['userId'] as String,
        userName: data['userName'] as String?,
        serviceId: data['serviceId'] as int?,
        staffId: data['staffId'] as int?,
        date: data['date'] as String?,
      );
      
      _timeSlotSelectedController.add(selection);
    });

    _connection!.on('TimeSlotCleared', (arguments) {
      if (arguments == null || arguments.isEmpty) return;
      
      final data = arguments[0] as Map<String, dynamic>?;
      if (data == null) return;
      
      debugPrint('🔔 [SignalR] TimeSlotCleared received: $data');
      
      final selection = TimeSlotSelection(
        timeSlot: data['timeSlot'] as String,
        userId: data['userId'] as String,
        userName: data['userName'] as String?,
        serviceId: data['serviceId'] as int?,
        staffId: data['staffId'] as int?,
        date: data['date'] as String?,
      );
      
      _timeSlotClearedController.add(selection);
    });

    _connection!.on('UserJoinedTimeSlotRoom', (arguments) {
      if (arguments == null || arguments.isEmpty) return;
      final data = arguments[0] as Map<String, dynamic>?;
      debugPrint('👤 [SignalR] UserJoinedTimeSlotRoom: $data');
    });

    _connection!.on('UserLeftTimeSlotRoom', (arguments) {
      if (arguments == null || arguments.isEmpty) return;
      final data = arguments[0] as Map<String, dynamic>?;
      debugPrint('👋 [SignalR] UserLeftTimeSlotRoom: $data');
    });
  }

  /// Join room cho specific service/staff/date
  Future<bool> joinTimeSlotRoom({
    required int serviceId,
    required int staffId,
    required String date,
  }) async {
    if (_connection == null || _connection!.state != HubConnectionState.connected) {
      debugPrint('⚠️ Cannot join room: Not connected');
      return false;
    }

    // Leave current room first
    if (_currentRoomKey != null) {
      await leaveCurrentRoom();
    }

    // Create room key: service_1_staff_2_date_2025-10-16
    final roomKey = 'service_${serviceId}_staff_${staffId}_date_$date';
    
    return await _joinRoom(roomKey);
  }

  Future<bool> _joinRoom(String roomKey) async {
    try {
      debugPrint('📥 Joining room: $roomKey');
      await _connection!.invoke('JoinTimeSlotRoom', args: [roomKey]);
      _currentRoomKey = roomKey;
      debugPrint('✅ Successfully joined room: $roomKey');
      return true;
    } catch (e) {
      debugPrint('❌ Failed to join room: $e');
      return false;
    }
  }

  /// Leave current room
  Future<void> leaveCurrentRoom() async {
    if (_currentRoomKey == null) return;
    if (_connection == null || _connection!.state != HubConnectionState.connected) {
      _currentRoomKey = null;
      return;
    }

    try {
      debugPrint('📤 Leaving room: $_currentRoomKey');
      await _connection!.invoke('LeaveTimeSlotRoom', args: [_currentRoomKey]);
      debugPrint('✅ Successfully left room: $_currentRoomKey');
    } catch (e) {
      debugPrint('⚠️ Failed to leave room: $e');
    } finally {
      _currentRoomKey = null;
    }
  }

  /// Broadcast khi user chọn time slot
  Future<void> selectTimeSlot({
    required String timeSlot,
    required String userId,
    String? userName,
    int? serviceId,
    int? staffId,
    String? date,
  }) async {
    if (_connection == null || _connection!.state != HubConnectionState.connected) {
      debugPrint('⚠️ Cannot select slot: Not connected');
      return;
    }

    if (_currentRoomKey == null) {
      debugPrint('⚠️ Cannot select slot: Not in any room');
      return;
    }

    try {
      debugPrint('📤 Broadcasting TimeSlotSelected: $timeSlot by $userName');
      
      await _connection!.invoke('SelectTimeSlot', args: [
        _currentRoomKey,
        {
          'timeSlot': timeSlot,
          'userId': userId,
          'userName': userName ?? 'Unknown',
          'serviceId': serviceId,
          'staffId': staffId,
          'date': date,
        }
      ]);
      
      debugPrint('✅ Successfully broadcasted TimeSlotSelected');
    } catch (e) {
      debugPrint('❌ Failed to broadcast TimeSlotSelected: $e');
    }
  }

  /// Broadcast khi user clear/deselect time slot
  Future<void> clearTimeSlot({
    required String timeSlot,
    required String userId,
    String? userName,
    int? serviceId,
    int? staffId,
    String? date,
  }) async {
    if (_connection == null || _connection!.state != HubConnectionState.connected) {
      debugPrint('⚠️ Cannot clear slot: Not connected');
      return;
    }

    if (_currentRoomKey == null) {
      debugPrint('⚠️ Cannot clear slot: Not in any room');
      return;
    }

    try {
      debugPrint('📤 Broadcasting TimeSlotCleared: $timeSlot');
      
      await _connection!.invoke('ClearTimeSlot', args: [
        _currentRoomKey,
        {
          'timeSlot': timeSlot,
          'userId': userId,
          'userName': userName ?? 'Unknown',
          'serviceId': serviceId,
          'staffId': staffId,
          'date': date,
        }
      ]);
      
      debugPrint('✅ Successfully broadcasted TimeSlotCleared');
    } catch (e) {
      debugPrint('❌ Failed to broadcast TimeSlotCleared: $e');
    }
  }

  /// Disconnect SignalR
  Future<void> disconnect() async {
    if (_connection == null) return;

    try {
      await leaveCurrentRoom();
      await _connection!.stop();
      _isConnected = false;
      _connectionStatusController.add(false);
      debugPrint('🔌 SignalR Disconnected');
    } catch (e) {
      debugPrint('⚠️ Error disconnecting SignalR: $e');
    }
  }

  /// Dispose all resources
  void dispose() {
    _timeSlotSelectedController.close();
    _timeSlotClearedController.close();
    _connectionStatusController.close();
    disconnect();
  }
}

/// Model cho TimeSlot selection event
class TimeSlotSelection {
  final String timeSlot;
  final String userId;
  final String? userName;
  final int? serviceId;
  final int? staffId;
  final String? date;
  final DateTime timestamp;

  TimeSlotSelection({
    required this.timeSlot,
    required this.userId,
    this.userName,
    this.serviceId,
    this.staffId,
    this.date,
  }) : timestamp = DateTime.now();

  @override
  String toString() {
    return 'TimeSlotSelection(timeSlot: $timeSlot, userId: $userId, userName: $userName)';
  }
}
