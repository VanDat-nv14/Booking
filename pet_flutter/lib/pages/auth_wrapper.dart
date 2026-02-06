import 'package:flutter/material.dart';
import 'dart:convert';
import '../services/secure_storage.dart';
import '../services/onesignal_service.dart';
import '../services/user_presence_service.dart';
import '../services/firebase_messaging_service.dart';
import 'root_nav.dart';
import 'guest_navigation.dart';
import 'staff_navigation.dart';

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> with WidgetsBindingObserver {
  final SecureStorageService _storage = SecureStorageService();
  final UserPresenceService _presenceService = UserPresenceService();
  bool _isLoading = true;
  bool _isAuthenticated = false;
  String? _currentUserId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _checkAuthStatus();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    // Set offline when app closes
    if (_currentUserId != null) {
      _presenceService.setUserOffline(_currentUserId!);
    }
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_currentUserId == null) return;
    
    switch (state) {
      case AppLifecycleState.resumed:
        // App is in foreground
        _presenceService.setUserOnline(_currentUserId!);
        break;
      case AppLifecycleState.paused:
      case AppLifecycleState.inactive:
      case AppLifecycleState.detached:
        // App is in background or closed
        _presenceService.setUserOffline(_currentUserId!);
        break;
      case AppLifecycleState.hidden:
        break;
    }
  }

  Future<void> _checkAuthStatus() async {
    try {
      final token = await _storage.readToken();
      final user = await _storage.readUser();
      
      // 🔔 Set OneSignal External User ID and Presence if user is logged in
      if (user != null) {
        try {
          final userMap = jsonDecode(user);
          final role = userMap['role']?.toString();
          
          // Dùng staffId cho Staff, userId cho Customer
          String? externalId;
          if (role == 'Staff') {
            externalId = userMap['staffId']?.toString();
          }
          externalId ??= userMap['userId']?.toString();
          
          if (externalId != null) {
            _currentUserId = externalId;
            
            // Set OneSignal External User ID
            await OneSignalService().setExternalUserId(externalId);
            print('🔔 [AuthWrapper] OneSignal External User ID set: $externalId (role: $role)');
            
            // Send FCM token to server
            try {
              await FirebaseMessagingService().sendTokenToServer(externalId);
              print('✅ [AuthWrapper] FCM token sent to server for user: $externalId');
            } catch (e) {
              print('⚠️ [AuthWrapper] Failed to send FCM token: $e');
            }
            
            // Set user online in Firebase
            await _presenceService.setUserOnline(externalId);
            print('✅ [AuthWrapper] User presence set to online: $externalId');
          }
        } catch (e) {
          print('⚠️ [AuthWrapper] Failed to set user status: $e');
        }
      }
      
      setState(() {
        _isAuthenticated = token != null && user != null;
        _isLoading = false;
      });
    } catch (e) {
      print('Error checking auth status: $e');
      setState(() {
        _isAuthenticated = false;
        _isLoading = false;
      });
    }
  }

  Future<bool> _isStaff() async {
    try {
      final role = await _storage.readUserRole();
      return role == 'Staff' || role == 'Admin';
    } catch (e) {
      print('Error checking user role: $e');
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        body: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Theme.of(context).colorScheme.primary,
                Theme.of(context).colorScheme.primary.withOpacity(0.8),
              ],
            ),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // App Logo/Icon
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: const Icon(
                    Icons.pets,
                    size: 60,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 32),
                
                // App Name
                Text(
                  'Pet Care',
                  style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                
                Text(
                  'Chăm sóc thú cưng toàn diện',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.white.withOpacity(0.9),
                  ),
                ),
                const SizedBox(height: 48),
                
                // Loading indicator
                CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
                const SizedBox(height: 16),
                
                Text(
                  'Đang khởi tạo...',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // If authenticated, check role and show appropriate app
    if (_isAuthenticated) {
      return FutureBuilder<bool>(
        future: _isStaff(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            // Show loading while checking role
            return Scaffold(
              body: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Theme.of(context).colorScheme.primary,
                      Theme.of(context).colorScheme.primary.withOpacity(0.8),
                    ],
                  ),
                ),
                child: const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
              ),
            );
          }
          
          final isStaff = snapshot.data ?? false;
          if (isStaff) {
            return const StaffNavigation(); // Staff app
          } else {
            return const RootNav(); // Customer app
          }
        },
      );
    }

    // If not authenticated, show guest navigation
    return const GuestNavigation();
  }
}
