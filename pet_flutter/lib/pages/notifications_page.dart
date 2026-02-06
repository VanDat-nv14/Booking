import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:intl/intl.dart';
import '../models/chat_models.dart';
import '../services/firebase_chat_service.dart';
import '../services/secure_storage.dart' show SecureStorageService;

import 'chat_detail_page.dart';

/// Trang thông báo - Hiển thị tất cả tin nhắn chưa đọc
class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  final FirebaseChatService _chatService = FirebaseChatService();
  
  String? _currentUserId;
  bool _isLoading = true;
  List<ChatRoom> _unreadRooms = [];

  @override
  void initState() {
    super.initState();
    _loadCurrentUser();
  }

  Future<void> _loadCurrentUser() async {
    try {
      final storage = SecureStorageService();
      final userId = await storage.readUserId();
      
      if (userId != null && mounted) {
        setState(() {
          _currentUserId = userId;
        });
        _loadUnreadChats();
      }
    } catch (e) {
      print('❌ Error loading user: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _loadUnreadChats() async {
    if (_currentUserId == null) return;

    try {
      setState(() {
        _isLoading = true;
      });

      // Get all chat rooms for this customer
      final chatRoomsStream = _chatService.getCustomerChatRooms(int.parse(_currentUserId!));
      
      chatRoomsStream.listen((chatRooms) {
        if (mounted) {
          // Filter only rooms with unread messages
          final unreadRooms = chatRooms
              .where((room) => room.unreadCountCustomer > 0)
              .toList();
          
          // Sort by last message time (newest first)
          unreadRooms.sort((a, b) {
            final aTime = a.lastMessageTime ?? DateTime(2000);
            final bTime = b.lastMessageTime ?? DateTime(2000);
            return bTime.compareTo(aTime);
          });
          
          setState(() {
            _unreadRooms = unreadRooms;
            _isLoading = false;
          });
        }
      });
    } catch (e) {
      print('❌ Error loading unread chats: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inMinutes < 1) {
      return 'Vừa xong';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes} phút trước';
    } else if (difference.inDays < 1) {
      return '${difference.inHours} giờ trước';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} ngày trước';
    } else {
      return DateFormat('dd/MM/yyyy').format(timestamp);
    }
  }

  void _navigateToChat(ChatRoom room) async {
    final storage = SecureStorageService();
    final userId = await storage.readUserId();
    final userName = await storage.readUserName();
    
    if (userId == null) return;
    
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ChatDetailPage(
          chatRoomId: room.id,
          currentUserId: userId,
          currentUserName: userName ?? 'Khách hàng',
          currentUserAvatar: '',
          otherUserId: room.staffId.toString(),
          otherUserName: room.staffName,
          otherUserAvatar: '',
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          FaIcon(
            FontAwesomeIcons.bellSlash,
            size: 80,
            color: Colors.grey.shade300,
          ),
          const SizedBox(height: 20),
          Text(
            'Không có thông báo mới',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tất cả tin nhắn đã được đọc',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUnreadChatItem(ChatRoom room) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () => _navigateToChat(room),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar
              CircleAvatar(
                radius: 28,
                backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                child: FaIcon(
                  FontAwesomeIcons.userDoctor,
                  color: Theme.of(context).colorScheme.primary,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              
              // Chat info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            room.staffName,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        if (room.lastMessageTime != null)
                          Text(
                            _formatTimestamp(room.lastMessageTime!),
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    
                    // Appointment info
                    if (room.appointmentId != null)
                      Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            FaIcon(
                              FontAwesomeIcons.calendar,
                              size: 12,
                              color: Colors.blue.shade700,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Lịch hẹn #${room.appointmentId}',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.blue.shade700,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    
                    // Last message
                    Text(
                      room.lastMessage ?? 'Không có tin nhắn',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade700,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              
              // Unread badge
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
                constraints: const BoxConstraints(
                  minWidth: 28,
                  minHeight: 28,
                ),
                child: Center(
                  child: Text(
                    room.unreadCountCustomer > 99 
                        ? '99+' 
                        : '${room.unreadCountCustomer}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Thông báo'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          if (_unreadRooms.isNotEmpty)
            TextButton.icon(
              onPressed: () async {
                // Mark all as read
                for (final room in _unreadRooms) {
                  await _chatService.markMessagesAsRead(
                    _currentUserId!,
                    room.staffId.toString(),
                  );
                }
                
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('✅ Đã đánh dấu tất cả là đã đọc'),
                      backgroundColor: Colors.green,
                      duration: Duration(seconds: 2),
                    ),
                  );
                }
              },
              icon: const FaIcon(
                FontAwesomeIcons.checkDouble,
                size: 16,
                color: Colors.white,
              ),
              label: const Text(
                'Đọc tất cả',
                style: TextStyle(color: Colors.white),
              ),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(),
            )
          : _unreadRooms.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  onRefresh: _loadUnreadChats,
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: _unreadRooms.length,
                    itemBuilder: (context, index) {
                      return _buildUnreadChatItem(_unreadRooms[index]);
                    },
                  ),
                ),
    );
  }
}
