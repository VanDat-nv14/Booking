import 'package:firebase_database/firebase_database.dart';

class UserPresenceService {
  final DatabaseReference _database = FirebaseDatabase.instance.ref();

  // Set user online
  Future<void> setUserOnline(String userId) async {
    try {
      await _database.child('presence/$userId').set({
        'online': true,
        'lastSeen': ServerValue.timestamp,
      });

      // Set offline when disconnect
      await _database.child('presence/$userId').onDisconnect().set({
        'online': false,
        'lastSeen': ServerValue.timestamp,
      });

      print('✅ [Presence] User $userId set online');
    } catch (e) {
      print('❌ [Presence] Error setting user online: $e');
    }
  }

  // Set user offline
  Future<void> setUserOffline(String userId) async {
    try {
      await _database.child('presence/$userId').set({
        'online': false,
        'lastSeen': ServerValue.timestamp,
      });
      print('✅ [Presence] User $userId set offline');
    } catch (e) {
      print('❌ [Presence] Error setting user offline: $e');
    }
  }

  // Get user online status stream
  Stream<bool> getUserOnlineStatus(String userId) {
    return _database
        .child('presence/$userId/online')
        .onValue
        .map((event) {
      if (event.snapshot.value == null) return false;
      return event.snapshot.value as bool? ?? false;
    });
  }

  // Get last seen time
  Future<DateTime?> getLastSeen(String userId) async {
    try {
      final snapshot = await _database.child('presence/$userId/lastSeen').get();
      if (snapshot.exists && snapshot.value != null) {
        return DateTime.fromMillisecondsSinceEpoch(snapshot.value as int);
      }
    } catch (e) {
      print('❌ [Presence] Error getting last seen: $e');
    }
    return null;
  }

  // Format last seen text
  String formatLastSeen(DateTime? lastSeen) {
    if (lastSeen == null) return 'Không hoạt động';
    
    final now = DateTime.now();
    final difference = now.difference(lastSeen);

    if (difference.inMinutes < 1) {
      return 'Vừa xong';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} phút trước';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} giờ trước';
    } else {
      return '${difference.inDays} ngày trước';
    }
  }
}
