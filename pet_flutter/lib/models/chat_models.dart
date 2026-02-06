class ChatMessage {
  final String id;
  final String chatRoomId;
  final String senderId;
  final String senderName;
  final String senderAvatar;
  final String message;
  final String? imageUrl;
  final DateTime timestamp;
  final bool isRead;
  final MessageType type;

  ChatMessage({
    required this.id,
    required this.chatRoomId,
    required this.senderId,
    required this.senderName,
    required this.senderAvatar,
    required this.message,
    this.imageUrl,
    required this.timestamp,
    this.isRead = false,
    this.type = MessageType.text,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'chatRoomId': chatRoomId,
      'senderId': senderId,
      'senderName': senderName,
      'senderAvatar': senderAvatar,
      'message': message,
      'imageUrl': imageUrl,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'isRead': isRead,
      'type': type.toString(),
    };
  }

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] ?? '',
      chatRoomId: json['chatRoomId'] ?? '',
      senderId: json['senderId'] ?? '',
      senderName: json['senderName'] ?? '',
      senderAvatar: json['senderAvatar'] ?? '',
      message: json['message'] ?? '',
      imageUrl: json['imageUrl'],
      timestamp: DateTime.fromMillisecondsSinceEpoch(json['timestamp'] ?? 0),
      isRead: json['isRead'] ?? false,
      type: _parseMessageType(json['type']),
    );
  }

  static MessageType _parseMessageType(String? type) {
    switch (type) {
      case 'MessageType.text':
        return MessageType.text;
      case 'MessageType.image':
        return MessageType.image;
      default:
        return MessageType.text;
    }
  }
}

enum MessageType {
  text,
  image,
}

class ChatRoom {
  final String id;
  final int customerId;
  final String customerName;
  final String customerAvatar;
  final int staffId;
  final String staffName;
  final String staffAvatar;
  final String? lastMessage;
  final DateTime? lastMessageTime;
  final int unreadCount; // For backward compatibility (staff's unread count)
  final int unreadCountStaff; // Số tin nhắn chưa đọc của staff
  final int unreadCountCustomer; // Số tin nhắn chưa đọc của customer
  final DateTime createdAt;
  final int? appointmentId; // ID appointment liên kết
  final String? appointmentStatus; // Status: Pending, Confirmed, Completed, Cancelled
  final String? serviceName; // Tên dịch vụ để hiển thị
  final bool isActive; // true = có thể chat, false = không thể chat (appointment completed)

  ChatRoom({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.customerAvatar,
    required this.staffId,
    required this.staffName,
    required this.staffAvatar,
    this.lastMessage,
    this.lastMessageTime,
    this.unreadCount = 0,
    this.unreadCountStaff = 0,
    this.unreadCountCustomer = 0,
    required this.createdAt,
    this.appointmentId,
    this.appointmentStatus,
    this.serviceName,
    this.isActive = true,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'customerName': customerName,
      'customerAvatar': customerAvatar,
      'staffId': staffId,
      'staffName': staffName,
      'staffAvatar': staffAvatar,
      'lastMessage': lastMessage,
      'lastMessageTime': lastMessageTime?.millisecondsSinceEpoch,
      'unreadCount': unreadCount,
      'unreadCountStaff': unreadCountStaff,
      'unreadCountCustomer': unreadCountCustomer,
      'createdAt': createdAt.millisecondsSinceEpoch,
      'appointmentId': appointmentId,
      'appointmentStatus': appointmentStatus,
      'serviceName': serviceName,
      'isActive': isActive,
    };
  }

  factory ChatRoom.fromJson(String id, Map<String, dynamic> json) {
    return ChatRoom(
      id: id,
      customerId: json['customerId'] ?? 0,
      customerName: json['customerName'] ?? '',
      customerAvatar: json['customerAvatar'] ?? '',
      staffId: json['staffId'] ?? 0,
      staffName: json['staffName'] ?? '',
      staffAvatar: json['staffAvatar'] ?? '',
      lastMessage: json['lastMessage'],
      lastMessageTime: json['lastMessageTime'] != null
          ? DateTime.fromMillisecondsSinceEpoch(json['lastMessageTime'])
          : null,
      unreadCount: json['unreadCount'] ?? json['unreadCountStaff'] ?? 0,
      unreadCountStaff: json['unreadCountStaff'] ?? json['unreadCount'] ?? 0,
      unreadCountCustomer: json['unreadCountCustomer'] ?? 0,
      createdAt: DateTime.fromMillisecondsSinceEpoch(
        json['createdAt'] ?? DateTime.now().millisecondsSinceEpoch,
      ),
      appointmentId: json['appointmentId'],
      appointmentStatus: json['appointmentStatus'],
      serviceName: json['serviceName'],
      isActive: json['isActive'] ?? true,
    );
  }
}
