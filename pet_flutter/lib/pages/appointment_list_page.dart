import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:intl/intl.dart';
import '../models/appointment.dart';
import '../services/appointment_service.dart';
import '../services/review_service.dart';
import '../services/firebase_chat_service.dart';
import '../services/secure_storage.dart';
import '../widgets/review_dialog.dart';
import '../widgets/time_progress_bar.dart';
import 'appointment_detail_page.dart';
import 'appointment_booking_page.dart';
import 'chat_detail_page.dart';
import 'notifications_page.dart';

class AppointmentListPage extends StatefulWidget {
  const AppointmentListPage({super.key});

  @override
  State<AppointmentListPage> createState() => _AppointmentListPageState();
}

class _AppointmentListPageState extends State<AppointmentListPage> with TickerProviderStateMixin {
  List<Appointment> appointments = [];
  List<Appointment> filteredAppointments = [];
  bool isLoading = true;
  String? error;
  String selectedStatus = 'Tất cả';
  String selectedDateFilter = 'Tất cả';
  String searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  
  // Review related
  final ReviewService _reviewService = ReviewService();
  final Map<int, bool> _hasReview = {}; // Track which appointments have reviews
  final Map<int, bool> _isLoadingReview = {}; // Track loading state for each appointment
  
  // Chat related
  final FirebaseChatService _chatService = FirebaseChatService();
  Map<int, int> _unreadCounts = {}; // Track unread count for each appointment
  late AnimationController _bellAnimationController;
  late Animation<double> _bellAnimation;
  int _previousTotalUnread = 0;

  final List<String> statusOptions = [
    'Tất cả',
    'Scheduled',
    'Confirmed',
    'InProgress',
    'Completed',
    'Cancelled',
  ];

  final List<String> dateFilterOptions = [
    'Tất cả',
    'Hôm nay',
    'Tuần này',
    'Tháng này',
  ];

  @override
  void initState() {
    super.initState();
    
    // Initialize bell animation controller
    _bellAnimationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    
    _bellAnimation = Tween<double>(begin: -0.1, end: 0.1).animate(
      CurvedAnimation(
        parent: _bellAnimationController,
        curve: Curves.elasticIn,
      ),
    );
    
    _fetchAppointments();
    _loadUnreadCounts();
  }
  
  // Trigger bell animation when unread count increases
  void _triggerBellAnimation(int totalUnread) {
    if (totalUnread > _previousTotalUnread) {
      _bellAnimationController.forward(from: 0.0).then((_) {
        _bellAnimationController.reverse();
      });
    }
    _previousTotalUnread = totalUnread;
  }
  
  Future<void> _loadUnreadCounts() async {
    try {
      final storage = SecureStorageService();
      final userId = await storage.readUserId();
      
      if (userId == null) return;
      
      print('🔵 [AppointmentList] Loading unread counts for customer: $userId');
      
      // Get all chat rooms for this customer
      final chatRoomsStream = _chatService.getCustomerChatRooms(int.parse(userId));
      
      chatRoomsStream.listen((chatRooms) {
        final newUnreadCounts = <int, int>{};
        
        print('🔵 [AppointmentList] Got ${chatRooms.length} chat rooms');
        
        for (final room in chatRooms) {
          // Use unreadCountCustomer for customer view
          final unreadCount = room.unreadCountCustomer;
          print('🔵 [AppointmentList] Room ${room.id}, appointment: ${room.appointmentId}, unreadCustomer: $unreadCount');
          
          if (room.appointmentId != null && unreadCount > 0) {
            newUnreadCounts[room.appointmentId!] = unreadCount;
            print('✅ [AppointmentList] Added badge for appointment ${room.appointmentId}: $unreadCount');
          }
        }
        
        // Calculate total unread count and trigger animation if increased
        final totalUnread = newUnreadCounts.values.fold(0, (sum, count) => sum + count);
        
        if (mounted) {
          setState(() {
            _unreadCounts = newUnreadCounts;
          });
          print('✅ [AppointmentList] Updated _unreadCounts: $_unreadCounts, total: $totalUnread');
          
          // Trigger bell animation if count increased
          _triggerBellAnimation(totalUnread);
        }
      });
    } catch (e) {
      print('❌ [AppointmentList] Error loading unread counts: $e');
    }
  }

  Future<void> _checkReviewsForCompletedAppointments() async {
    final completedAppointments = appointments.where((apt) => 
      apt.status.toLowerCase() == 'completed'
    ).toList();

    for (final appointment in completedAppointments) {
      if (!_hasReview.containsKey(appointment.appointmentId)) {
        setState(() {
          _isLoadingReview[appointment.appointmentId] = true;
        });

        try {
          final reviews = await _reviewService.getReviewsByAppointmentId(appointment.appointmentId); // getReviewsByAppointmentId là hàm để lấy đánh giá của lịch hẹn
          setState(() {
            _hasReview[appointment.appointmentId] = reviews.isNotEmpty;
            _isLoadingReview[appointment.appointmentId] = false;
          });
        } catch (e) {
          setState(() {
            _hasReview[appointment.appointmentId] = false;
            _isLoadingReview[appointment.appointmentId] = false;
          });
        }
      }
    }
  }

  Future<void> _showReviewDialog(Appointment appointment) async {
    await showDialog(
      context: context,
      builder: (context) => ReviewDialog(
        appointmentId: appointment.appointmentId,
        serviceId: appointment.serviceId,
        serviceName: appointment.serviceName,
        staffName: appointment.staffName,
        onReviewSubmitted: () {
          // Mark this appointment as having a review
          setState(() {
            _hasReview[appointment.appointmentId] = true;
          });
        },
      ),
    );
  }

  @override
  void dispose() {
    _bellAnimationController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchAppointments() async {
    setState(() { 
      isLoading = true;
      error = null;
    });
    try {
      final service = AppointmentService();
      appointments = await service.getUserAppointments();
      _applyFilters();
      
      // Check reviews for completed appointments
      _checkReviewsForCompletedAppointments();
    } catch (e) {
      setState(() {
      error = e.toString();
      });
    } finally {
      setState(() { 
        isLoading = false;
      });
    }
  }

  void _applyFilters() {
    setState(() {
      filteredAppointments = appointments.where((appointment) {
        final matchesStatus = selectedStatus == 'Tất cả' || appointment.status == selectedStatus;
        final matchesSearch = searchQuery.isEmpty || 
            appointment.serviceName.toLowerCase().contains(searchQuery.toLowerCase()) ||
            appointment.petName.toLowerCase().contains(searchQuery.toLowerCase()) ||
            appointment.staffName.toLowerCase().contains(searchQuery.toLowerCase());
        final matchesDate = _matchesDateFilter(appointment.appointmentDate);
        return matchesStatus && matchesSearch && matchesDate;
      }).toList();
      
      // Sắp xếp theo thời gian gần nhất
      filteredAppointments.sort((a, b) => b.appointmentDate.compareTo(a.appointmentDate));
    });
  }

  bool _matchesDateFilter(DateTime appointmentDate) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final appointmentDay = DateTime(appointmentDate.year, appointmentDate.month, appointmentDate.day);
    
    switch (selectedDateFilter) {
      case 'Hôm nay':
        return appointmentDay.isAtSameMomentAs(today);
      case 'Tuần này':
        final startOfWeek = today.subtract(Duration(days: today.weekday - 1));
        final endOfWeek = startOfWeek.add(const Duration(days: 6));
        return appointmentDay.isAfter(startOfWeek.subtract(const Duration(days: 1))) &&
               appointmentDay.isBefore(endOfWeek.add(const Duration(days: 1)));
      case 'Tháng này':
        return appointmentDate.year == now.year && appointmentDate.month == now.month;
      default:
        return true;
    }
  }

  void _onSearchChanged(String query) {
    setState(() {
      searchQuery = query;
    });
    _applyFilters();
  }

  void _onStatusChanged(String? status) {
    setState(() {
      selectedStatus = status ?? 'Tất cả';
    });
    _applyFilters();
  }

  void _onDateFilterChanged(String? dateFilter) {
    setState(() {
      selectedDateFilter = dateFilter ?? 'Tất cả';
    });
    _applyFilters();
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return Theme.of(context).colorScheme.primary;
      case 'confirmed':
        return Colors.green;
      case 'inprogress':
        return Colors.orange;
      case 'completed':
        return Colors.green.shade700;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'Đã đặt lịch';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'inprogress':
        return 'Đang thực hiện';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return FontAwesomeIcons.calendar;
      case 'confirmed':
        return FontAwesomeIcons.checkCircle;
      case 'inprogress':
        return FontAwesomeIcons.clock;
      case 'completed':
        return FontAwesomeIcons.checkDouble;
      case 'cancelled':
        return FontAwesomeIcons.timesCircle;
      default:
        return FontAwesomeIcons.questionCircle;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Lịch hẹn của tôi'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          // Animated notification bell with badge
          AnimatedBuilder( //
            animation: _bellAnimation, // _bellAnimation là biến để hiển thị icon notification bell
            builder: (context, child) {
              final totalUnread = _unreadCounts.values.fold(0, (sum, count) => sum + count);
              
              return Transform.rotate(
                angle: _bellAnimation.value,
                child: Stack(
                  children: [
                    IconButton(
                      icon: const FaIcon(FontAwesomeIcons.bell),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const NotificationsPage(),
                          ),
                        );
                      },
                    ),
                    if (totalUnread > 0)
                      Positioned(
                        right: 8,
                        top: 8,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: Colors.white,
                              width: 1.5,
                            ),
                          ),
                          constraints: const BoxConstraints(
                            minWidth: 18,
                            minHeight: 18,
                          ),
                          child: Center(
                            child: Text(
                              totalUnread > 99 ? '99+' : '$totalUnread',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              );
            },
          ),
          IconButton(
            icon: const FaIcon(FontAwesomeIcons.arrowsRotate),
            onPressed: _fetchAppointments,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search và Filter
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.08),
                  spreadRadius: 0,
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                // Search bar - simplified
                TextField(
                  controller: _searchController,
                  onChanged: _onSearchChanged,
                  decoration: InputDecoration(
                    hintText: 'Tìm kiếm lịch hẹn...',
                    hintStyle: TextStyle(
                      color: Colors.grey.shade500,
                      fontSize: 14,
                    ),
                    prefixIcon: FaIcon(
                      FontAwesomeIcons.magnifyingGlass, 
                      size: 16,
                      color: Colors.grey.shade600,
                    ),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: FaIcon(
                              FontAwesomeIcons.xmark,
                              size: 14,
                              color: Colors.grey.shade500,
                            ),
                            onPressed: () {
                              _searchController.clear();
                              _onSearchChanged('');
                            },
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: Theme.of(context).colorScheme.primary,
                        width: 1.5,
                      ),
                    ),
                    filled: true,
                    fillColor: Colors.grey.shade50,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                // Filters row - simplified
                Row(
                  children: [
                    // Status filter
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: selectedStatus,
                        onChanged: _onStatusChanged,
                        decoration: InputDecoration(
                          labelText: 'Trạng thái',
                          labelStyle: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(color: Colors.grey.shade300),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(color: Colors.grey.shade300),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(
                              color: Theme.of(context).colorScheme.primary,
                              width: 1.5,
                            ),
                          ),
                          filled: true,
                          fillColor: Colors.grey.shade50,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                        ),
                        dropdownColor: Colors.white,
                        style: TextStyle(
                          color: Colors.grey.shade800,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                        items: statusOptions.map((String status) {
                          return DropdownMenuItem<String>(
                            value: status,
                            child: Text(
                              status == 'Tất cả' ? 'Tất cả' : _getStatusText(status),
                              style: const TextStyle(fontSize: 13),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Date filter
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: selectedDateFilter,
                        onChanged: _onDateFilterChanged,
                        decoration: InputDecoration(
                          labelText: 'Thời gian',
                          labelStyle: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(color: Colors.grey.shade300),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(color: Colors.grey.shade300),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(
                              color: Theme.of(context).colorScheme.primary,
                              width: 1.5,
                            ),
                          ),
                          filled: true,
                          fillColor: Colors.grey.shade50,
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                        ),
                        dropdownColor: Colors.white,
                        style: TextStyle(
                          color: Colors.grey.shade800,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                        items: dateFilterOptions.map((String dateFilter) {
                          return DropdownMenuItem<String>(
                            value: dateFilter,
                            child: Text(
                              dateFilter,
                              style: const TextStyle(fontSize: 13),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          // Content
          Expanded(
            child: isLoading
          ? _buildLoadingWidget()
          : error != null
                    ? _buildErrorWidget()
                    : filteredAppointments.isEmpty
                        ? _buildEmptyWidget()
                        : _buildAppointmentsList(),
          ),
        ],
      ),
      floatingActionButton: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
              spreadRadius: 0,
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: FloatingActionButton.extended(
          heroTag: "appointments_fab",
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const AppointmentBookingPage(),
              ),
            ).then((_) => _fetchAppointments()); // Refresh sau khi đặt lịch
          },
          backgroundColor: Theme.of(context).colorScheme.primary,
          foregroundColor: Colors.white,
          icon: const FaIcon(FontAwesomeIcons.plus, size: 18),
          label: const Text(
            'Đặt lịch mới',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Theme.of(context).colorScheme.primary),
              strokeWidth: 3,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Đang tải lịch hẹn...',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Colors.grey.shade600,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.red.shade200,
                  width: 2,
                ),
              ),
              child: FaIcon(
                FontAwesomeIcons.triangleExclamation,
                size: 48,
                color: Colors.red.shade400,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Có lỗi xảy ra',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: Colors.red.shade700,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error!,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _fetchAppointments,
              icon: const FaIcon(FontAwesomeIcons.arrowsRotate, size: 16),
              label: const Text('Thử lại'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyWidget() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Theme.of(context).colorScheme.primary.withOpacity(0.1),
                    Theme.of(context).colorScheme.primary.withOpacity(0.05),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
                border: Border.all(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                  width: 2,
                ),
              ),
              child: FaIcon(
                FontAwesomeIcons.calendarXmark,
                size: 48,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Chưa có lịch hẹn nào',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: Colors.grey.shade800,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Hãy đặt lịch hẹn đầu tiên của bạn\nđể bắt đầu chăm sóc thú cưng',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.grey.shade600,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const AppointmentBookingPage(),
                  ),
                ).then((_) => _fetchAppointments());
              },
              icon: const FaIcon(FontAwesomeIcons.plus, size: 16),
              label: const Text('Đặt lịch hẹn'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppointmentsList() {
    return RefreshIndicator(
      onRefresh: _fetchAppointments,
      color: Theme.of(context).colorScheme.primary,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: filteredAppointments.length,
        itemBuilder: (context, index) {
          final appointment = filteredAppointments[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: _buildAppointmentCard(appointment),
          );
        },
      ),
    );
  }

  Widget _buildAppointmentCard(Appointment appointment) {
    final statusColor = _getStatusColor(appointment.status);
    final statusText = _getStatusText(appointment.status);
    final statusIcon = _getStatusIcon(appointment.status);
    final dateFormat = DateFormat('dd/MM/yyyy');
    final timeFormat = DateFormat('HH:mm');
    final priceFormat = NumberFormat.currency(symbol: '₫');

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.08),
            spreadRadius: 0,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            _navigateToAppointmentDetail(appointment);
          },
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header với status và giá - simplified
                Row(
                  children: [
                    // Status badge - simplified
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: statusColor.withOpacity(0.2),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          FaIcon(statusIcon, size: 12, color: statusColor),
                          const SizedBox(width: 6),
                          Text(
                            statusText,
                            style: TextStyle(
                              color: statusColor,
                              fontWeight: FontWeight.w600,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    // Price - simplified
                    Text(
                      priceFormat.format(appointment.servicePrice),
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Service name - simplified
                Row(
                  children: [
                    FaIcon(
                      FontAwesomeIcons.scissors,
                      size: 16,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        appointment.serviceName,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Pet info - simplified
                Row(
                  children: [
                    FaIcon(
                      FontAwesomeIcons.paw,
                      size: 14,
                      color: Colors.orange,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      appointment.petName,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ),
                    ),
                    if (appointment.pet?.species != null) ...[
                      const SizedBox(width: 8),
                      Text(
                        '• ${appointment.pet!.species}',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 12),
                // Staff info - simplified
                if (appointment.staffName.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Row(
                      children: [
                        FaIcon(
                          FontAwesomeIcons.userDoctor,
                          size: 14,
                          color: Colors.blue,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          appointment.staffName,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Colors.blue.shade700,
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 12),
                // Date & Time info with progress - simplified
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          FaIcon(
                            FontAwesomeIcons.calendar,
                            size: 14,
                            color: Colors.green,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '${dateFormat.format(appointment.appointmentDate)} - ${timeFormat.format(appointment.appointmentDate)}',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: Colors.green.shade700,
                            ),
                          ),
                        ],
                      ),
                      // Progress bar for upcoming appointments
                      if (appointment.status.toLowerCase() != 'completed' && 
                          appointment.status.toLowerCase() != 'cancelled')
                        TimeProgressBar(
                          appointmentTime: appointment.appointmentDate,
                          isCompact: true,
                        ),
                    ],
                  ),
                ),
                // Notes - simplified
                if (appointment.notes != null && appointment.notes!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      FaIcon(
                        FontAwesomeIcons.noteSticky,
                        size: 14,
                        color: Colors.amber,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          appointment.notes!,
                          style: TextStyle(
                            color: Colors.amber.shade700,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
                // Cancellation reason - simplified
                if (appointment.cancellationReason != null && appointment.cancellationReason!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      FaIcon(
                        FontAwesomeIcons.triangleExclamation,
                        size: 14,
                        color: Colors.red,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Lý do hủy: ${appointment.cancellationReason!}',
                          style: TextStyle(
                            color: Colors.red.shade700,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
                // Action buttons - simplified
                const SizedBox(height: 16),
                Row(
                  children: [
                    // Chat button (show if staff is assigned)
                    if (appointment.staffId != null && appointment.staffName.isNotEmpty) ...[
                      Expanded(
                        child: SizedBox(
                          height: 44,
                          child: Stack(
                            clipBehavior: Clip.none,
                            children: [
                              SizedBox(
                                width: double.infinity,
                                child: OutlinedButton.icon(
                                  onPressed: () => _openChat(appointment),
                                  icon: const FaIcon(
                                    FontAwesomeIcons.comments,
                                    size: 16,
                                  ),
                                  label: const Text(
                                    'Chat',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14,
                                    ),
                                  ),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: Colors.green,
                                    side: BorderSide(
                                      color: Colors.green.withOpacity(0.5),
                                      width: 1.5,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    padding: const EdgeInsets.symmetric(horizontal: 16),
                                  ),
                                ),
                              ),
                              // Badge for unread messages
                              if (_unreadCounts[appointment.appointmentId] != null && 
                                  _unreadCounts[appointment.appointmentId]! > 0)
                                Positioned(
                                  right: 4,
                                  top: 4,
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    constraints: const BoxConstraints(
                                      minWidth: 18,
                                      minHeight: 18,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.red,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: Colors.white,
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
                                    child: Center(
                                      child: Text(
                                        _unreadCounts[appointment.appointmentId]! > 99
                                            ? '99+'
                                            : _unreadCounts[appointment.appointmentId].toString(),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          height: 1.0,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                    ],
                    
                    // Review button (only for completed appointments)
                    if (appointment.status.toLowerCase() == 'completed') ...[
                      Expanded(
                        child: SizedBox(
                          height: 44,
                          child: _isLoadingReview[appointment.appointmentId] == true
                              ? OutlinedButton(
                                  onPressed: null,
                                  style: OutlinedButton.styleFrom(
                                    side: BorderSide(
                                      color: Colors.grey.withOpacity(0.3),
                                      width: 1.5,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  child: const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  ),
                                )
                              : OutlinedButton.icon(
                                  onPressed: _hasReview[appointment.appointmentId] == true 
                                      ? null 
                                      : () => _showReviewDialog(appointment),
                                  icon: FaIcon(
                                    _hasReview[appointment.appointmentId] == true 
                                        ? FontAwesomeIcons.check 
                                        : FontAwesomeIcons.star,
                                    size: 16,
                                  ),
                                  label: Text(
                                    _hasReview[appointment.appointmentId] == true 
                                        ? 'Đã đánh giá' 
                                        : 'Đánh giá',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14,
                                    ),
                                  ),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: _hasReview[appointment.appointmentId] == true 
                                        ? Colors.grey 
                                        : Colors.amber[700],
                                    side: BorderSide(
                                      color: (_hasReview[appointment.appointmentId] == true 
                                          ? Colors.grey 
                                          : Colors.amber).withOpacity(0.5),
                                      width: 1.5,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    padding: const EdgeInsets.symmetric(horizontal: 16),
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(width: 12),
                    ],
                    
                    // Details button
                    Expanded(
                      child: SizedBox(
                        height: 44,
                        child: OutlinedButton.icon(
                          onPressed: () => _navigateToAppointmentDetail(appointment),
                          icon: const FaIcon(
                            FontAwesomeIcons.eye, 
                            size: 16,
                          ),
                          label: const Text(
                            'Chi tiết',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Color(0xFF6B4CE6),
                            side: BorderSide(
                              color: Color(0xFF6B4CE6).withOpacity(0.5),
                              width: 1.5,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _navigateToAppointmentDetail(Appointment appointment) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AppointmentDetailPage(appointment: appointment),
      ),
    );
  }

  Future<void> _openChat(Appointment appointment) async {
    if (appointment.staffId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Chưa có nhân viên được phân công')),
      );
      return;
    }

    try {
      // Lấy thông tin user hiện tại
      final storage = SecureStorageService();
      final userId = await storage.readUserId();
      final userName = await storage.readUserName();
      final role = await storage.readUserRole();

      if (userId == null || userName == null || role == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Vui lòng đăng nhập lại')),
        );
        return;
      }

      // Tạo hoặc lấy chat room theo appointmentId (Grab style)
      print('🔵 [AppointmentList] Creating chat for appointment ${appointment.appointmentId}');
      final chatService = FirebaseChatService();
      final chatRoom = await chatService.createChatRoomFromAppointment(
        appointmentId: appointment.appointmentId,
        customerId: appointment.userId,
        customerName: appointment.userName,
        customerAvatar: appointment.user?.avatarUrl ?? '',
        staffId: appointment.staffId!,
        staffName: appointment.staffName,
        staffAvatar: appointment.staff?.avatarUrl ?? '',
        appointmentStatus: appointment.status,
        serviceName: appointment.serviceName, // Thêm tên dịch vụ
      );
      
      print('✅ [AppointmentList] Chat room created: ${chatRoom.id}');

      // Xác định thông tin người chat kia dựa trên vai trò
      final String otherUserId;
      final String otherUserName;
      final String otherUserAvatar;
      
      if (role == 'Staff') {
        // Staff chat với customer
        otherUserId = appointment.userId.toString();
        otherUserName = appointment.userName;
        otherUserAvatar = appointment.user?.avatarUrl ?? '';
      } else {
        // Customer chat với staff
        otherUserId = appointment.staffId.toString();
        otherUserName = appointment.staffName;
        otherUserAvatar = appointment.staff?.avatarUrl ?? '';
      }

      // Mở trang chat
      if (!mounted) return;
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ChatDetailPage(
            chatRoomId: chatRoom.id,
            currentUserId: userId,
            currentUserName: userName,
            currentUserAvatar: role == 'Staff' 
                ? (appointment.staff?.avatarUrl ?? '') 
                : (appointment.user?.avatarUrl ?? ''),
            otherUserId: otherUserId,
            otherUserName: otherUserName,
            otherUserAvatar: otherUserAvatar,
          ),
        ),
      );
    } catch (e) {
      print('❌ [AppointmentList] Error opening chat: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không thể mở chat. Vui lòng thử lại.')),
      );
    }
  }

}
