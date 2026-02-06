import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/chat_models.dart';
import '../services/firebase_chat_service.dart';
import '../services/user_presence_service.dart';
import 'chat_detail_page.dart';

class ChatListPage extends StatefulWidget {
  final int userId;
  final bool isStaff;

  const ChatListPage({
    super.key,
    required this.userId,
    this.isStaff = false,
  });

  @override
  State<ChatListPage> createState() => _ChatListPageState();
}

class _ChatListPageState extends State<ChatListPage> with TickerProviderStateMixin {
  final FirebaseChatService _chatService = FirebaseChatService();
  final UserPresenceService _presenceService = UserPresenceService();
  late AnimationController _bellAnimationController;
  late Animation<double> _bellAnimation;
  int _previousUnreadCount = 0;

  @override
  void initState() {
    super.initState();
    _bellAnimationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _bellAnimation = Tween<double>(begin: 0, end: 0.1).animate(
      CurvedAnimation(
        parent: _bellAnimationController,
        curve: Curves.elasticIn,
      ),
    );
  }

  @override
  void dispose() {
    _bellAnimationController.dispose();
    super.dispose();
  }

  void _triggerBellAnimation(int currentUnreadCount) {
    if (currentUnreadCount > _previousUnreadCount && currentUnreadCount > 0) {
      _bellAnimationController.forward().then((_) {
        _bellAnimationController.reverse();
      });
    }
    _previousUnreadCount = currentUnreadCount;
  }
  
  // Get unread count based on user role
  int _getUnreadCount(ChatRoom room) {
    if (widget.isStaff) {
      return room.unreadCountStaff;
    } else {
      return room.unreadCountCustomer;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isStaff ? 'Tin nhắn khách hàng' : 'Tin nhắn'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          // Notification Bell with unread count
          StreamBuilder<List<ChatRoom>>(
            stream: widget.isStaff
                ? _chatService.getStaffChatRooms(widget.userId)
                : _chatService.getCustomerChatRooms(widget.userId),
            builder: (context, snapshot) {
              final chatRooms = snapshot.data ?? [];
              final totalUnreadCount = chatRooms.fold<int>(
                0,
                (sum, room) => sum + _getUnreadCount(room),
              );
              
              // Trigger bell animation when unread count increases
              WidgetsBinding.instance.addPostFrameCallback((_) {
                _triggerBellAnimation(totalUnreadCount);
              });
              
              return Stack(
                children: [
                  AnimatedBuilder(
                    animation: _bellAnimation,
                    builder: (context, child) {
                      return Transform.rotate(
                        angle: _bellAnimation.value,
                        child: IconButton(
                          icon: Icon(
                            totalUnreadCount > 0
                                ? Icons.notifications_active
                                : Icons.notifications_outlined,
                          ),
                          onPressed: totalUnreadCount > 0
                              ? () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('Bạn có $totalUnreadCount tin nhắn chưa đọc'),
                                      duration: const Duration(seconds: 2),
                                    ),
                                  );
                                }
                              : null,
                          tooltip: totalUnreadCount > 0
                              ? '$totalUnreadCount tin nhắn chưa đọc'
                              : 'Không có tin nhắn mới',
                        ),
                      );
                    },
                  ),
                  if (totalUnreadCount > 0)
                    Positioned(
                      right: 6,
                      top: 6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 18,
                          minHeight: 18,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: Theme.of(context).colorScheme.primary,
                            width: 1.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.red.withOpacity(0.5),
                              blurRadius: 4,
                              spreadRadius: 1,
                            ),
                          ],
                        ),
                        child: Text(
                          totalUnreadCount > 99 ? '99+' : totalUnreadCount.toString(),
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            height: 1.2,
                          ),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
      body: StreamBuilder<List<ChatRoom>>(
        stream: widget.isStaff
            ? _chatService.getStaffChatRooms(widget.userId)
            : _chatService.getCustomerChatRooms(widget.userId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  Text('Lỗi: ${snapshot.error}'),
                ],
              ),
            );
          }

          final chatRooms = snapshot.data ?? [];

          if (chatRooms.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.chat_bubble_outline,
                    size: 80,
                    color: Colors.grey.shade300,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Chưa có tin nhắn nào',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: chatRooms.length,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final chatRoom = chatRooms[index];
              return _buildChatRoomItem(chatRoom);
            },
          );
        },
      ),
    );
  }

  Widget _buildChatRoomItem(ChatRoom chatRoom) {
    final isCustomer = !widget.isStaff;
    final otherUserName = isCustomer ? chatRoom.staffName : chatRoom.customerName;
    final otherUserAvatar = isCustomer ? chatRoom.staffAvatar : chatRoom.customerAvatar;
    final otherUserId = isCustomer ? chatRoom.staffId : chatRoom.customerId;

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: Stack(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: Colors.grey.shade200,
            backgroundImage: otherUserAvatar.isNotEmpty
                ? NetworkImage(otherUserAvatar)
                : null,
            child: otherUserAvatar.isEmpty
                ? Icon(Icons.person, color: Colors.grey.shade600, size: 28)
                : null,
          ),
          // Online status indicator
          StreamBuilder<bool>(
            stream: _presenceService.getUserOnlineStatus(otherUserId.toString()),
            builder: (context, snapshot) {
              final isOnline = snapshot.data ?? false;
              if (!isOnline) return const SizedBox.shrink();
              
              return Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(
                    color: Colors.green,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.white,
                      width: 2.5,
                    ),
                  ),
                ),
              );
            },
          ),
          // Badge tin nhắn chưa đọc
          if (_getUnreadCount(chatRoom) > 0)
            Positioned(
              right: 0,
              top: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                constraints: const BoxConstraints(
                  minWidth: 20,
                  minHeight: 20,
                ),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: Colors.white,
                    width: 2,
                  ),
                ),
                child: Text(
                  _getUnreadCount(chatRoom) > 99 ? '99+' : _getUnreadCount(chatRoom).toString(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    height: 1.2,
                  ),
                ),
              ),
            ),
        ],
      ),
      title: Text(
        otherUserName,
        style: const TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 16,
        ),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 4),
          Text(
            chatRoom.lastMessage ?? 'Chưa có tin nhắn',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: _getUnreadCount(chatRoom) > 0 
                  ? Colors.black87 
                  : Colors.grey.shade600,
              fontSize: 14,
              fontWeight: _getUnreadCount(chatRoom) > 0 
                  ? FontWeight.w500 
                  : FontWeight.normal,
            ),
          ),
        ],
      ),
      trailing: chatRoom.lastMessageTime != null
          ? Text(
              _formatTime(chatRoom.lastMessageTime!),
              style: TextStyle(
                color: Colors.grey.shade500,
                fontSize: 12,
              ),
            )
          : null,
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ChatDetailPage(
              chatRoomId: chatRoom.id,
              currentUserId: widget.userId.toString(),
              currentUserName: isCustomer ? chatRoom.customerName : chatRoom.staffName,
              currentUserAvatar: isCustomer ? chatRoom.customerAvatar : chatRoom.staffAvatar,
              otherUserId: otherUserId.toString(),
              otherUserName: otherUserName,
              otherUserAvatar: otherUserAvatar,
            ),
          ),
        );
      },
    );
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final difference = now.difference(time);

    if (difference.inDays == 0) {
      return DateFormat('HH:mm').format(time);
    } else if (difference.inDays == 1) {
      return 'Hôm qua';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} ngày trước';
    } else {
      return DateFormat('dd/MM/yyyy').format(time);
    }
  }
}
