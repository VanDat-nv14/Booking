import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import '../models/chat_models.dart';
import '../services/firebase_chat_service.dart';
import '../services/secure_storage.dart';
import '../services/user_presence_service.dart';
import 'chat_detail_page.dart';

enum ChatFilter { all, unread, read }
enum ChatSort { newest, oldest, unreadFirst, customerName }

class StaffChatPage extends StatefulWidget {
  const StaffChatPage({super.key});

  @override
  State<StaffChatPage> createState() => _StaffChatPageState();
}

class _StaffChatPageState extends State<StaffChatPage> with TickerProviderStateMixin {
  final FirebaseChatService _chatService = FirebaseChatService();
  final UserPresenceService _presenceService = UserPresenceService();
  final TextEditingController _searchController = TextEditingController();
  late AnimationController _bellAnimationController;
  late Animation<double> _bellAnimation;
  int? _staffId;
  bool _isLoading = true;
  String _searchQuery = '';
  ChatFilter _currentFilter = ChatFilter.all;
  ChatSort _currentSort = ChatSort.newest;
  final Set<String> _pinnedRoomIds = {};
  final Map<String, bool> _animatingRooms = {};
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
    _loadStaffInfo();
    _setupNewMessageListener();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _bellAnimationController.dispose();
    super.dispose();
  }
  
  void _setupNewMessageListener() {
    // Listen for new messages and trigger animation
    // This would typically listen to Firebase changes
    // For now, we'll trigger animation when entering chat rooms
  }
  
  void _triggerBellAnimation(int currentUnreadCount) {
    // Only animate if unread count increased
    if (currentUnreadCount > _previousUnreadCount && currentUnreadCount > 0) {
      _bellAnimationController.forward().then((_) {
        _bellAnimationController.reverse();
      });
    }
    _previousUnreadCount = currentUnreadCount;
  }
  
  void _scrollToFirstUnread(List<ChatRoom> chatRooms) {
    final firstUnread = chatRooms.indexWhere((room) => room.unreadCount > 0);
    if (firstUnread != -1) {
      // Show filter to unread messages
      setState(() {
        _currentFilter = ChatFilter.unread;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Đang hiển thị ${chatRooms.where((r) => r.unreadCount > 0).length} tin nhắn chưa đọc'),
          duration: const Duration(seconds: 2),
          action: SnackBarAction(
            label: 'Tất cả',
            onPressed: () {
              setState(() {
                _currentFilter = ChatFilter.all;
              });
            },
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎉 Tuyệt vời! Không có tin nhắn chưa đọc'),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _loadStaffInfo() async {
    try {
      final storage = SecureStorageService();
      
      // Lấy staffId thay vì userId
      final staffId = await storage.readStaffId();
      
      if (staffId != null) {
        if (!mounted) return;
        setState(() {
          _staffId = int.parse(staffId);
          _isLoading = false;
        });
        print('🔵 [StaffChat] Staff ID loaded: $_staffId');
      } else {
        if (!mounted) return;
        setState(() {
          _isLoading = false;
        });
        print('⚠️ [StaffChat] No staff ID found');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });
      print('Error loading staff info: $e');
    }
  }

  List<ChatRoom> _filterChatRooms(List<ChatRoom> chatRooms) {
    // Apply filter
    List<ChatRoom> filtered = chatRooms;
    
    switch (_currentFilter) {
      case ChatFilter.unread:
        filtered = chatRooms.where((room) => room.unreadCount > 0).toList();
        break;
      case ChatFilter.read:
        filtered = chatRooms.where((room) => room.unreadCount == 0).toList();
        break;
      case ChatFilter.all:
        filtered = chatRooms;
    }
    
    // Apply search
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((room) {
        final customerName = room.customerName.toLowerCase();
        final lastMessage = (room.lastMessage ?? '').toLowerCase();
        final serviceName = (room.serviceName ?? '').toLowerCase();
        final appointmentId = room.appointmentId?.toString() ?? '';
        final query = _searchQuery.toLowerCase();
        
        return customerName.contains(query) ||
               lastMessage.contains(query) ||
               serviceName.contains(query) ||
               appointmentId.contains(query);
      }).toList();
    }
    
    // Apply sort
    switch (_currentSort) {
      case ChatSort.newest:
        filtered.sort((a, b) {
          if (a.lastMessageTime == null && b.lastMessageTime == null) return 0;
          if (a.lastMessageTime == null) return 1;
          if (b.lastMessageTime == null) return -1;
          return b.lastMessageTime!.compareTo(a.lastMessageTime!);
        });
        break;
      case ChatSort.oldest:
        filtered.sort((a, b) {
          if (a.lastMessageTime == null && b.lastMessageTime == null) return 0;
          if (a.lastMessageTime == null) return 1;
          if (b.lastMessageTime == null) return -1;
          return a.lastMessageTime!.compareTo(b.lastMessageTime!);
        });
        break;
      case ChatSort.unreadFirst:
        filtered.sort((a, b) {
          if (a.unreadCount != b.unreadCount) {
            return b.unreadCount.compareTo(a.unreadCount);
          }
          if (a.lastMessageTime == null && b.lastMessageTime == null) return 0;
          if (a.lastMessageTime == null) return 1;
          if (b.lastMessageTime == null) return -1;
          return b.lastMessageTime!.compareTo(a.lastMessageTime!);
        });
        break;
      case ChatSort.customerName:
        filtered.sort((a, b) => a.customerName.compareTo(b.customerName));
        break;
    }
    
    // Put pinned items at the top
    final pinned = filtered.where((room) => _pinnedRoomIds.contains(room.id)).toList();
    final unpinned = filtered.where((room) => !_pinnedRoomIds.contains(room.id)).toList();
    
    return [...pinned, ...unpinned];
  }
  
  void _togglePin(String roomId) {
    setState(() {
      if (_pinnedRoomIds.contains(roomId)) {
        _pinnedRoomIds.remove(roomId);
      } else {
        _pinnedRoomIds.add(roomId);
      }
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_pinnedRoomIds.contains(roomId) ? 'Đã ghim hội thoại' : 'Đã bỏ ghim'),
        duration: const Duration(seconds: 1),
      ),
    );
  }
  
  void _markAsRead(String roomId) {
    // This would typically call Firebase to mark as read
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã đánh dấu là đã đọc'),
        duration: Duration(seconds: 1),
      ),
    );
  }
  
  void _deleteChat(String roomId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa cuộc trò chuyện'),
        content: const Text('Bạn có chắc muốn xóa cuộc trò chuyện này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Đã xóa cuộc trò chuyện'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
            child: const Text('Xóa', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
  
  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Lọc và Sắp xếp',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Text(
                'Lọc theo:',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                children: [
                  FilterChip(
                    label: const Text('Tất cả'),
                    selected: _currentFilter == ChatFilter.all,
                    onSelected: (selected) {
                      setModalState(() => _currentFilter = ChatFilter.all);
                      setState(() => _currentFilter = ChatFilter.all);
                    },
                  ),
                  FilterChip(
                    label: const Text('Chưa đọc'),
                    selected: _currentFilter == ChatFilter.unread,
                    onSelected: (selected) {
                      setModalState(() => _currentFilter = ChatFilter.unread);
                      setState(() => _currentFilter = ChatFilter.unread);
                    },
                  ),
                  FilterChip(
                    label: const Text('Đã đọc'),
                    selected: _currentFilter == ChatFilter.read,
                    onSelected: (selected) {
                      setModalState(() => _currentFilter = ChatFilter.read);
                      setState(() => _currentFilter = ChatFilter.read);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Text(
                'Sắp xếp theo:',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                children: [
                  ChoiceChip(
                    label: const Text('Mới nhất'),
                    selected: _currentSort == ChatSort.newest,
                    onSelected: (selected) {
                      setModalState(() => _currentSort = ChatSort.newest);
                      setState(() => _currentSort = ChatSort.newest);
                    },
                  ),
                  ChoiceChip(
                    label: const Text('Cũ nhất'),
                    selected: _currentSort == ChatSort.oldest,
                    onSelected: (selected) {
                      setModalState(() => _currentSort = ChatSort.oldest);
                      setState(() => _currentSort = ChatSort.oldest);
                    },
                  ),
                  ChoiceChip(
                    label: const Text('Chưa đọc trước'),
                    selected: _currentSort == ChatSort.unreadFirst,
                    onSelected: (selected) {
                      setModalState(() => _currentSort = ChatSort.unreadFirst);
                      setState(() => _currentSort = ChatSort.unreadFirst);
                    },
                  ),
                  ChoiceChip(
                    label: const Text('Tên khách hàng'),
                    selected: _currentSort == ChatSort.customerName,
                    onSelected: (selected) {
                      setModalState(() => _currentSort = ChatSort.customerName);
                      setState(() => _currentSort = ChatSort.customerName);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final hasActiveFilters = _currentFilter != ChatFilter.all || _currentSort != ChatSort.newest;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tin nhắn khách hàng'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          // Notification Bell with unread count
          StreamBuilder<List<ChatRoom>>(
            stream: _chatService.getStaffChatRooms(_staffId ?? 0),
            builder: (context, snapshot) {
              final chatRooms = snapshot.data ?? [];
              final totalUnreadCount = chatRooms.fold<int>(
                0,
                (sum, room) => sum + room.unreadCount,
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
                              ? () => _scrollToFirstUnread(chatRooms)
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
          // Filter button
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.filter_list),
                onPressed: _showFilterBottomSheet,
                tooltip: 'Lọc và sắp xếp',
              ),
              if (hasActiveFilters)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.orange,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _staffId == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.error_outline,
                        size: 64,
                        color: Colors.grey.shade400,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Không thể tải thông tin nhân viên',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    // Search Bar
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: TextField(
                        controller: _searchController,
                        onChanged: (value) {
                          setState(() {
                            _searchQuery = value;
                          });
                        },
                        decoration: InputDecoration(
                          hintText: 'Tìm kiếm khách hàng, dịch vụ...',
                          prefixIcon: Icon(Icons.search, color: Colors.grey.shade600),
                          suffixIcon: _searchQuery.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.clear),
                                  onPressed: () {
                                    _searchController.clear();
                                    setState(() {
                                      _searchQuery = '';
                                    });
                                  },
                                )
                              : null,
                          filled: true,
                          fillColor: Colors.grey.shade100,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                        ),
                      ),
                    ),
                    // Chat List
                    Expanded(
                      child: StreamBuilder<List<ChatRoom>>(
                        stream: _chatService.getStaffChatRooms(_staffId!),
                        builder: (context, snapshot) {
                          print('🔵 [StaffChat] StreamBuilder state: ${snapshot.connectionState}');
                          print('🔵 [StaffChat] Has data: ${snapshot.hasData}');
                          print('🔵 [StaffChat] Data: ${snapshot.data}');
                          print('🔵 [StaffChat] Error: ${snapshot.error}');
                          
                          if (snapshot.connectionState == ConnectionState.waiting) {
                            return const Center(child: CircularProgressIndicator());
                          }

                    if (snapshot.hasError) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.error_outline,
                              size: 64,
                              color: Colors.red,
                            ),
                            const SizedBox(height: 16),
                            Text('Lỗi: ${snapshot.error}'),
                          ],
                        ),
                      );
                    }

                    final allChatRooms = snapshot.data ?? [];
                    final chatRooms = _filterChatRooms(allChatRooms);
                    print('🔵 [StaffChat] Chat rooms count: ${chatRooms.length}');

                    if (allChatRooms.isEmpty) {
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
                              'Chưa có tin nhắn từ khách hàng',
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.grey.shade600,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Tin nhắn từ khách hàng sẽ xuất hiện ở đây',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey.shade500,
                              ),
                            ),
                          ],
                        ),
                      );
                    }

                    if (chatRooms.isEmpty && _searchQuery.isNotEmpty) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.search_off,
                              size: 80,
                              color: Colors.grey.shade300,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Không tìm thấy kết quả',
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.grey.shade600,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Thử tìm kiếm với từ khóa khác',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey.shade500,
                              ),
                            ),
                          ],
                        ),
                      );
                    }

                    return RefreshIndicator(
                      onRefresh: () async {
                        // Trigger reload by rebuilding StreamBuilder
                        setState(() {});
                        await Future.delayed(const Duration(milliseconds: 500));
                      },
                      child: ListView.separated(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        itemCount: chatRooms.length,
                        separatorBuilder: (context, index) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final chatRoom = chatRooms[index];
                          return _buildChatRoomItem(chatRoom);
                        },
                      ),
                    );
                  },
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildChatRoomItem(ChatRoom chatRoom) {
    final isPinned = _pinnedRoomIds.contains(chatRoom.id);
    final isAnimating = _animatingRooms[chatRoom.id] ?? false;
    
    return TweenAnimationBuilder<double>(
      duration: const Duration(milliseconds: 300),
      tween: Tween(begin: isAnimating ? 1.05 : 1.0, end: 1.0),
      curve: Curves.easeOutBack,
      onEnd: () {
        if (isAnimating) {
          setState(() {
            _animatingRooms[chatRoom.id] = false;
          });
        }
      },
      builder: (context, scale, child) {
        return Transform.scale(
          scale: scale,
          child: child,
        );
      },
      child: Slidable(
        key: Key(chatRoom.id),
        endActionPane: ActionPane(
          motion: const DrawerMotion(),
          extentRatio: 0.6,
          children: [
            SlidableAction(
              onPressed: (context) => _togglePin(chatRoom.id),
              backgroundColor: isPinned ? Colors.grey : Colors.blue,
              foregroundColor: Colors.white,
              icon: isPinned ? Icons.push_pin_outlined : Icons.push_pin,
              label: isPinned ? 'Bỏ ghim' : 'Ghim',
            ),
            if (chatRoom.unreadCount > 0)
              SlidableAction(
                onPressed: (context) => _markAsRead(chatRoom.id),
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                icon: Icons.done_all,
                label: 'Đã đọc',
              ),
            SlidableAction(
              onPressed: (context) => _deleteChat(chatRoom.id),
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              icon: Icons.delete,
              label: 'Xóa',
            ),
          ],
        ),
        child: Container(
          decoration: BoxDecoration(
            color: isPinned ? Colors.blue.withOpacity(0.05) : null,
            border: Border(
              left: isPinned 
                  ? BorderSide(color: Theme.of(context).colorScheme.primary, width: 4)
                  : BorderSide.none,
            ),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: Stack(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: Colors.grey.shade200,
            backgroundImage: chatRoom.customerAvatar.isNotEmpty
                ? NetworkImage(chatRoom.customerAvatar)
                : null,
            child: chatRoom.customerAvatar.isEmpty
                ? Icon(Icons.person, color: Colors.grey.shade600, size: 28)
                : null,
          ),
          // Dấu chấm xanh online ở góc dưới bên phải
          StreamBuilder<bool>(
            stream: _presenceService.getUserOnlineStatus(chatRoom.customerId.toString()),
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
          // Badge tin nhắn chưa đọc ở góc trên bên phải
          if (chatRoom.unreadCount > 0)
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
                  chatRoom.unreadCount > 99 ? '99+' : chatRoom.unreadCount.toString(),
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
      title: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  chatRoom.customerName,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                if (chatRoom.serviceName != null || chatRoom.appointmentId != null)
                  Text(
                    chatRoom.serviceName != null && chatRoom.appointmentId != null
                        ? '${chatRoom.serviceName} (#${chatRoom.appointmentId})'
                        : chatRoom.serviceName ?? '#${chatRoom.appointmentId}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                      fontWeight: FontWeight.w500,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),
          if (chatRoom.lastMessageTime != null)
            Text(
              _formatTime(chatRoom.lastMessageTime!),
              style: TextStyle(
                color: Colors.grey.shade500,
                fontSize: 12,
              ),
            ),
        ],
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
              color: chatRoom.unreadCount > 0 
                  ? Colors.black87 
                  : Colors.grey.shade600,
              fontSize: 14,
              fontWeight: chatRoom.unreadCount > 0 
                  ? FontWeight.w500 
                  : FontWeight.normal,
            ),
          ),
        ],
      ),
      onTap: () async {
        // Trigger animation for new message
        setState(() {
          _animatingRooms[chatRoom.id] = true;
        });
        
        // Small delay for animation
        await Future.delayed(const Duration(milliseconds: 50));
        
        // Lấy thông tin staff hiện tại để truyền vào chat
        final storage = SecureStorageService();
        final staffName = await storage.readUserName();
        
        if (!mounted) return;
        
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ChatDetailPage(
              chatRoomId: chatRoom.id,
              currentUserId: _staffId.toString(),
              currentUserName: staffName ?? chatRoom.staffName,
              currentUserAvatar: chatRoom.staffAvatar,
              otherUserId: chatRoom.customerId.toString(),
              otherUserName: chatRoom.customerName,
              otherUserAvatar: chatRoom.customerAvatar,
            ),
          ),
        );
      },
          ),
        ),
      ),
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
