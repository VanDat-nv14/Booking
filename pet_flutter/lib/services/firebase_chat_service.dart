import 'package:firebase_database/firebase_database.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'dart:io';
import '../models/chat_models.dart';
import 'chat_api_service.dart';

class FirebaseChatService {
  final DatabaseReference _database = FirebaseDatabase.instance.ref();
  final FirebaseStorage _storage = FirebaseStorage.instance;
  final ChatApiService _chatApiService = ChatApiService();

  // Tạo chat room từ appointment (Grab style - mỗi appointment 1 chat riêng)
  Future<ChatRoom> createChatRoomFromAppointment({
    required int appointmentId,
    required int customerId,
    required String customerName,
    required String customerAvatar,
    required int staffId,
    required String staffName,
    required String staffAvatar,
    required String appointmentStatus,
    String? serviceName, // Thêm tên dịch vụ
  }) async {
    final chatRoomId = 'chat_appointment_$appointmentId';
    
    // Kiểm tra đã tồn tại chưa
    final snapshot = await _database.child('chatRooms/$chatRoomId').get();
    
    if (snapshot.exists) {
      return ChatRoom.fromJson(
        chatRoomId,
        Map<String, dynamic>.from(snapshot.value as Map),
      );
    }
    
    // Tạo chat room mới
    final newChatRoom = ChatRoom(
      id: chatRoomId,
      customerId: customerId,
      customerName: customerName,
      customerAvatar: customerAvatar,
      staffId: staffId,
      staffName: staffName,
      staffAvatar: staffAvatar,
      createdAt: DateTime.now(),
      appointmentId: appointmentId,
      appointmentStatus: appointmentStatus,
      serviceName: serviceName, // Lưu tên dịch vụ
      isActive: appointmentStatus != 'Completed' && appointmentStatus != 'Cancelled',
    );
    
    await _database.child('chatRooms/$chatRoomId').set(newChatRoom.toJson());
    print('✅ Created chat room for appointment $appointmentId: $chatRoomId');
    return newChatRoom;
  }

  // Cập nhật status chat room khi appointment thay đổi
  Future<void> updateChatRoomStatus({
    required int appointmentId,
    required String appointmentStatus,
  }) async {
    final chatRoomId = 'chat_appointment_$appointmentId';
    final isActive = appointmentStatus != 'Completed' && appointmentStatus != 'Cancelled';
    
    await _database.child('chatRooms/$chatRoomId').update({
      'appointmentStatus': appointmentStatus,
      'isActive': isActive,
    });
    
    print('✅ Updated chat room $chatRoomId: status=$appointmentStatus, isActive=$isActive');
  }

  // Tạo hoặc lấy chat room giữa khách hàng và nhân viên (legacy - giữ lại cho tương thích)
  Future<ChatRoom> getOrCreateChatRoom({
    required int customerId,
    required String customerName,
    required String customerAvatar,
    required int staffId,
    required String staffName,
    required String staffAvatar,
  }) async {
    final chatRoomId = 'chat_${customerId}_$staffId';
    
    final snapshot = await _database.child('chatRooms/$chatRoomId').get();
    
    if (snapshot.exists) {
      return ChatRoom.fromJson(
        chatRoomId,
        Map<String, dynamic>.from(snapshot.value as Map),
      );
    } else {
      final newChatRoom = ChatRoom(
        id: chatRoomId,
        customerId: customerId,
        customerName: customerName,
        customerAvatar: customerAvatar,
        staffId: staffId,
        staffName: staffName,
        staffAvatar: staffAvatar,
        createdAt: DateTime.now(),
      );
      
      await _database.child('chatRooms/$chatRoomId').set(newChatRoom.toJson());
      return newChatRoom;
    }
  }

  // Gửi tin nhắn
  Future<void> sendMessage({
    required String chatRoomId,
    required String senderId,
    required String senderName,
    required String senderAvatar,
    required String message,
    String? imageUrl,
    MessageType type = MessageType.text,
    String? recipientId, // ID của người nhận để gửi notification
  }) async {
    print('📤 [FirebaseChat] Starting sendMessage...');
    final messageId = _database.child('messages/$chatRoomId').push().key!;
    
    final chatMessage = ChatMessage(
      id: messageId,
      chatRoomId: chatRoomId,
      senderId: senderId,
      senderName: senderName,
      senderAvatar: senderAvatar,
      message: message,
      imageUrl: imageUrl,
      timestamp: DateTime.now(),
      type: type,
    );

    // Lưu message
    print('💾 [FirebaseChat] Saving message to Firebase...');
    await _database
        .child('messages/$chatRoomId/$messageId')
        .set(chatMessage.toJson());
    print('✅ [FirebaseChat] Message saved to Firebase');

    // Cập nhật last message trong chat room và tăng unread count
    print('🔄 [FirebaseChat] Updating chat room...');
    
    // Lấy thông tin chat room hiện tại
    final roomSnapshot = await _database.child('chatRooms/$chatRoomId').get();
    int unreadCountStaff = 0;
    int unreadCountCustomer = 0;
    
    if (roomSnapshot.exists) {
      final roomData = Map<String, dynamic>.from(roomSnapshot.value as Map);
      final staffId = roomData['staffId'].toString();
      final customerId = roomData['customerId'].toString();
      
      // Lấy unread count hiện tại
      unreadCountStaff = (roomData['unreadCountStaff'] ?? 0) as int;
      unreadCountCustomer = (roomData['unreadCountCustomer'] ?? 0) as int;
      
      // Tăng unreadCount cho người NHẬN
      if (senderId == staffId) {
        // Staff gửi → tăng unreadCount cho customer
        unreadCountCustomer++;
        print('📊 [FirebaseChat] Staff sent message → unreadCountCustomer: $unreadCountCustomer');
      } else if (senderId == customerId) {
        // Customer gửi → tăng unreadCount cho staff
        unreadCountStaff++;
        print('📊 [FirebaseChat] Customer sent message → unreadCountStaff: $unreadCountStaff');
      }
    }
    
    await _database.child('chatRooms/$chatRoomId').update({
      'lastMessage': type == MessageType.image ? '📷 Hình ảnh' : message,
      'lastMessageTime': DateTime.now().millisecondsSinceEpoch,
      'unreadCountStaff': unreadCountStaff,
      'unreadCountCustomer': unreadCountCustomer,
      // Keep old field for backward compatibility
      'unreadCount': unreadCountStaff,
    });
    print('✅ [FirebaseChat] Chat room updated - Staff: $unreadCountStaff, Customer: $unreadCountCustomer');

    // Gửi notification đến người nhận (nếu có recipientId)
    // Chạy async không cần await để không block UI
    if (recipientId != null && recipientId.isNotEmpty) {
      print('🔔 [FirebaseChat] Sending notification to recipient: $recipientId (async)');
      // Fire and forget - không await
      _chatApiService.sendChatNotification(
        recipientUserId: recipientId,
        senderName: senderName,
        messageContent: type == MessageType.image ? '📷 Đã gửi một hình ảnh' : message,
        chatRoomId: chatRoomId,
        senderAvatar: senderAvatar,
      ).then((_) {
        print('✅ [FirebaseChat] Notification sent successfully');
      }).catchError((e) {
        print('⚠️ [FirebaseChat] Failed to send notification: $e');
      });
    }
    
    print('✅ [FirebaseChat] sendMessage completed');
  }

  // Lấy danh sách tin nhắn
  Stream<List<ChatMessage>> getMessages(String chatRoomId) {
    return _database
        .child('messages/$chatRoomId')
        .orderByChild('timestamp')
        .onValue
        .map((event) {
      final messages = <ChatMessage>[];
      if (event.snapshot.value != null) {
        final data = Map<String, dynamic>.from(event.snapshot.value as Map);
        data.forEach((key, value) {
          messages.add(ChatMessage.fromJson(Map<String, dynamic>.from(value)));
        });
      }
      messages.sort((a, b) => b.timestamp.compareTo(a.timestamp));
      return messages;
    });
  }

  // Lấy danh sách chat rooms của khách hàng
  Stream<List<ChatRoom>> getCustomerChatRooms(int customerId) {
    return _database
        .child('chatRooms')
        .orderByChild('customerId')
        .equalTo(customerId)
        .onValue
        .map((event) {
      final chatRooms = <ChatRoom>[];
      if (event.snapshot.value != null) {
        final data = Map<String, dynamic>.from(event.snapshot.value as Map);
        data.forEach((key, value) {
          chatRooms.add(
            ChatRoom.fromJson(key, Map<String, dynamic>.from(value)),
          );
        });
      }
      chatRooms.sort((a, b) {
        if (a.lastMessageTime == null) return 1;
        if (b.lastMessageTime == null) return -1;
        return b.lastMessageTime!.compareTo(a.lastMessageTime!);
      });
      return chatRooms;
    });
  }

  // Lấy danh sách chat rooms của nhân viên
  Stream<List<ChatRoom>> getStaffChatRooms(int staffId) {
    print('🔵 [Firebase] Getting staff chat rooms for staffId: $staffId');
    return _database
        .child('chatRooms')
        .onValue
        .map((event) {
      final chatRooms = <ChatRoom>[];
      print('🔵 [Firebase] Event snapshot exists: ${event.snapshot.exists}');
      print('🔵 [Firebase] Event snapshot value: ${event.snapshot.value}');
      
      if (event.snapshot.value != null) {
        final data = Map<String, dynamic>.from(event.snapshot.value as Map);
        print('🔵 [Firebase] Total chat rooms in DB: ${data.length}');
        
        data.forEach((key, value) {
          final room = ChatRoom.fromJson(key, Map<String, dynamic>.from(value));
          print('🔵 [Firebase] Room: $key, staffId: ${room.staffId}, target: $staffId');
          
          // Filter by staffId client-side
          if (room.staffId == staffId) {
            print('✅ [Firebase] Match! Adding room: $key');
            chatRooms.add(room);
          }
        });
      }
      
      print('🔵 [Firebase] Filtered chat rooms count: ${chatRooms.length}');
      
      chatRooms.sort((a, b) {
        if (a.lastMessageTime == null) return 1;
        if (b.lastMessageTime == null) return -1;
        return b.lastMessageTime!.compareTo(a.lastMessageTime!);
      });
      return chatRooms;
    });
  }

  // Upload ảnh
  Future<String?> uploadImage(File imageFile, String chatRoomId) async {
    try {
      final fileName = '${DateTime.now().millisecondsSinceEpoch}.jpg';
      final ref = _storage.ref().child('chat_images/$chatRoomId/$fileName');
      
      await ref.putFile(imageFile);
      final downloadUrl = await ref.getDownloadURL();
      
      return downloadUrl;
    } catch (e) {
      print('Error uploading image: $e');
      return null;
    }
  }

  // Đánh dấu tin nhắn đã đọc
  Future<void> markMessagesAsRead(String chatRoomId, String userId) async {
    print('👁️ [FirebaseChat] Marking messages as read for chatRoom: $chatRoomId, user: $userId');
    
    final snapshot = await _database.child('messages/$chatRoomId').get();
    
    if (snapshot.exists) {
      final data = Map<String, dynamic>.from(snapshot.value as Map);
      int markedCount = 0;
      
      data.forEach((key, value) async {
        final message = Map<String, dynamic>.from(value);
        if (message['senderId'] != userId && !(message['isRead'] ?? false)) {
          await _database
              .child('messages/$chatRoomId/$key')
              .update({'isRead': true});
          markedCount++;
        }
      });
      
      print('✅ [FirebaseChat] Marked $markedCount messages as read');
      
      // Reset unreadCount về 0 khi đã đọc - cần xác định ai đang đọc
      if (markedCount > 0) {
        final roomSnapshot = await _database.child('chatRooms/$chatRoomId').get();
        if (roomSnapshot.exists) {
          final roomData = Map<String, dynamic>.from(roomSnapshot.value as Map);
          final staffId = roomData['staffId'].toString();
          
          // Reset đúng field dựa vào ai đang đọc
          if (userId == staffId) {
            // Staff đang đọc → reset unreadCountStaff
            await _database.child('chatRooms/$chatRoomId').update({
              'unreadCountStaff': 0,
              'unreadCount': 0, // backward compatibility
            });
            print('✅ [FirebaseChat] Reset unreadCountStaff to 0');
          } else {
            // Customer đang đọc → reset unreadCountCustomer
            await _database.child('chatRooms/$chatRoomId').update({
              'unreadCountCustomer': 0,
            });
            print('✅ [FirebaseChat] Reset unreadCountCustomer to 0');
          }
        }
      }
    }
  }
  
  // Reset unread count cho staff khi vào chat room
  Future<void> resetUnreadCountForStaff(String chatRoomId) async {
    print('🔄 [FirebaseChat] Resetting staff unread count for chatRoom: $chatRoomId');
    await _database.child('chatRooms/$chatRoomId').update({
      'unreadCountStaff': 0,
      'unreadCount': 0, // backward compatibility
    });
    print('✅ [FirebaseChat] Staff unread count reset successfully');
  }
}
