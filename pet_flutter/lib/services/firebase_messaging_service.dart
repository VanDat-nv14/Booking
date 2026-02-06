import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/api_config.dart';
import 'secure_storage.dart';

/// Service quản lý Firebase Cloud Messaging
class FirebaseMessagingService {
  static final FirebaseMessagingService _instance = FirebaseMessagingService._internal();
  factory FirebaseMessagingService() => _instance;
  FirebaseMessagingService._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

  String? _fcmToken;
  String? get fcmToken => _fcmToken;

  /// Khởi tạo Firebase Messaging
  Future<void> initialize() async {
    try {
      debugPrint('🔥 [FCM] Initializing Firebase Messaging...');

      // Request permission
      NotificationSettings settings = await _firebaseMessaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        debugPrint('✅ [FCM] User granted permission');
      } else {
        debugPrint('⚠️ [FCM] User declined or has not accepted permission');
        return;
      }

      // Get FCM token
      _fcmToken = await _firebaseMessaging.getToken();
      debugPrint('📱 [FCM] Token: $_fcmToken');

      // Setup local notifications
      await _setupLocalNotifications();

      // Listen to token refresh
      _firebaseMessaging.onTokenRefresh.listen((newToken) {
        debugPrint('🔄 [FCM] Token refreshed: $newToken');
        _fcmToken = newToken;
        // TODO: Send new token to your server
      });

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // Handle background messages
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // Handle notification tap when app is in background
      FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);

      // Check if app was opened from a notification
      RemoteMessage? initialMessage = await _firebaseMessaging.getInitialMessage();
      if (initialMessage != null) {
        _handleMessageOpenedApp(initialMessage);
      }

      debugPrint('✅ [FCM] Initialization complete');
    } catch (e) {
      debugPrint('❌ [FCM] Initialization error: $e');
    }
  }

  /// Setup local notifications để hiển thị notification khi app đang mở
  Future<void> _setupLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    // Create notification channel for Android
    const channel = AndroidNotificationChannel(
      'chat_messages', // id
      'Chat Messages', // name
      description: 'Thông báo tin nhắn chat',
      importance: Importance.high,
      playSound: true,
      enableVibration: true,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);
  }

  /// Xử lý tin nhắn khi app đang mở (foreground)
  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('📨 [FCM] Foreground message received');
    debugPrint('   Title: ${message.notification?.title}');
    debugPrint('   Body: ${message.notification?.body}');
    debugPrint('   Data: ${message.data}');

    // Hiển thị local notification
    _showLocalNotification(message);
  }

  /// Hiển thị local notification
  Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;

    const androidDetails = AndroidNotificationDetails(
      'chat_messages',
      'Chat Messages',
      channelDescription: 'Thông báo tin nhắn chat',
      importance: Importance.high,
      priority: Priority.high,
      playSound: true,
      enableVibration: true,
      icon: '@mipmap/ic_launcher',
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
      details,
      payload: message.data.toString(),
    );
  }

  /// Xử lý khi user tap vào notification
  void _onNotificationTap(NotificationResponse response) {
    debugPrint('🔔 [FCM] Notification tapped: ${response.payload}');
    // TODO: Navigate to chat screen
  }

  /// Xử lý khi app mở từ notification (từ background/terminated)
  void _handleMessageOpenedApp(RemoteMessage message) {
    debugPrint('📬 [FCM] App opened from notification');
    debugPrint('   Data: ${message.data}');
    // TODO: Navigate to chat screen
  }

  /// Subscribe to topic (nhận thông báo theo chủ đề)
  Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
    debugPrint('✅ [FCM] Subscribed to topic: $topic');
  }

  /// Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic) async {
    await _firebaseMessaging.unsubscribeFromTopic(topic);
    debugPrint('❌ [FCM] Unsubscribed from topic: $topic');
  }

  /// Gửi FCM token lên server
  Future<void> sendTokenToServer(String userId) async {
    if (_fcmToken == null) {
      debugPrint('⚠️ [FCM] No token available to send');
      return;
    }
    
    try {
      debugPrint('📤 [FCM] Sending token to server for user: $userId');
      
      final token = await SecureStorageService().readToken();
      if (token == null) {
        debugPrint('⚠️ [FCM] No auth token found');
        return;
      }
      
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/Users/$userId/fcm-token'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'fcmToken': _fcmToken}),
      );
      
      if (response.statusCode == 200 || response.statusCode == 204) {
        debugPrint('✅ [FCM] Token sent successfully');
      } else {
        debugPrint('❌ [FCM] Failed to send token: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      debugPrint('❌ [FCM] Error sending token: $e');
    }
  }
}

/// Background message handler (phải là top-level function)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('🌙 [FCM] Background message received');
  debugPrint('   Title: ${message.notification?.title}');
  debugPrint('   Body: ${message.notification?.body}');
  debugPrint('   Data: ${message.data}');
}
