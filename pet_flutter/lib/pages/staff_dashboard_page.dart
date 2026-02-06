import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../services/secure_storage.dart';
import '../services/staff_service.dart';
import '../models/appointment.dart';
import 'dart:convert';

class StaffDashboardPage extends StatefulWidget {
  const StaffDashboardPage({super.key});

  @override
  State<StaffDashboardPage> createState() => _StaffDashboardPageState();
}

class _StaffDashboardPageState extends State<StaffDashboardPage> {
  final SecureStorageService _storage = SecureStorageService();
  final StaffService _staffService = StaffService();
  
  String? _staffName;
  String? _staffRole;
  int? _staffId;
  bool _loading = true;
  
  // Dashboard stats
  int _todayAppointments = 0;
  int _pendingAppointments = 0;
  int _completedToday = 0;
  List<Appointment> _upcomingAppointments = [];

  @override
  void initState() {
    super.initState();
    _loadStaffInfo();
    _loadDashboardData();
  }

  Future<void> _loadStaffInfo() async {
    try {
      // Lấy thông tin từ storage trước
      final userJson = await _storage.readUser();
      if (userJson != null) {
        final user = json.decode(userJson);
        if (!mounted) return;
        setState(() {
          _staffName = user['fullName'] ?? 'Nhân viên';
          _staffRole = user['role'] ?? 'Staff';
        });
      }

      // Sau đó lấy thông tin chi tiết từ API
      try {
        final staffInfo = await _staffService.getCurrentStaffInfo();
        if (!mounted) return;
        setState(() {
          _staffName = staffInfo['fullName'] ?? _staffName;
          _staffId = staffInfo['staffId'];
        });
      } catch (e) {
        print('Could not load staff info from API: $e');
        // Tiếp tục với thông tin từ storage
      }
    } catch (e) {
      print('Error loading staff info: $e');
    }
  }

  Future<void> _loadDashboardData() async {
    try {
      if (!mounted) return;
      setState(() => _loading = true);
      
      // Sử dụng StaffService để lấy thống kê dashboard
      final stats = await _staffService.getStaffDashboardStats();
      
      if (!mounted) return;
      setState(() {
        _todayAppointments = stats['todayAppointments'] ?? 0;
        _pendingAppointments = stats['pendingAppointments'] ?? 0;
        _completedToday = stats['completedToday'] ?? 0;
        _upcomingAppointments = stats['upcomingAppointments'] ?? <Appointment>[];
        _loading = false;
      });
    } catch (e) {
      print('Error loading dashboard data: $e');
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            expandedHeight: 120,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
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
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const FaIcon(
                                FontAwesomeIcons.userDoctor,
                                color: Colors.white,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Xin chào, ${_staffName ?? 'Nhân viên'}!',
                                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    _staffRole == 'Admin' ? 'Quản trị viên' : 'Nhân viên',
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: Colors.white.withOpacity(0.9),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            // Notification icon
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const FaIcon(
                                FontAwesomeIcons.bell,
                                color: Colors.white,
                                size: 20,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: _loading
                ? const Padding(
                    padding: EdgeInsets.all(50),
                    child: Center(child: CircularProgressIndicator()),
                  )
                : Column(
                    children: [
                      const SizedBox(height: 16),
                      _buildStatsCards(),
                      const SizedBox(height: 24),
                      _buildQuickActions(),
                      const SizedBox(height: 24),
                      _buildUpcomingAppointments(),
                      const SizedBox(height: 24),
                      _buildTodaySchedule(),
                      const SizedBox(height: 32),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCards() {
    final stats = [
      {
        'title': 'Hôm nay',
        'value': _todayAppointments.toString(),
        'subtitle': 'Lịch hẹn',
        'icon': FontAwesomeIcons.calendarDay,
        'color': Colors.blue,
      },
      {
        'title': 'Chờ xử lý',
        'value': _pendingAppointments.toString(),
        'subtitle': 'Lịch hẹn',
        'icon': FontAwesomeIcons.clock,
        'color': Colors.orange,
      },
      {
        'title': 'Hoàn thành',
        'value': _completedToday.toString(),
        'subtitle': 'Hôm nay',
        'icon': FontAwesomeIcons.checkCircle,
        'color': Colors.green,
      },
      {
        'title': 'Sắp tới',
        'value': _upcomingAppointments.length.toString(),
        'subtitle': 'Lịch hẹn',
        'icon': FontAwesomeIcons.arrowRight,
        'color': Colors.purple,
      },
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 1.1, // Giảm từ 1.3 xuống 1.1 để có thêm chiều cao
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: stats.length,
        itemBuilder: (context, index) {
          final stat = stats[index];
          return Container(
            padding: const EdgeInsets.all(12), // Giảm từ 16 xuống 12
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  spreadRadius: 1,
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min, // Thêm để tối ưu không gian
              children: [
                Container(
                  padding: const EdgeInsets.all(6), // Giảm từ 8 xuống 6
                  decoration: BoxDecoration(
                    color: (stat['color'] as Color).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: FaIcon(
                    stat['icon'] as IconData,
                    color: stat['color'] as Color,
                    size: 14, // Giảm từ 16 xuống 14
                  ),
                ),
                const SizedBox(height: 8), // Giảm từ 12 xuống 8
                Flexible( // Thêm Flexible để tránh overflow
                  child: Text(
                    stat['value'] as String,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith( // Đổi từ headlineMedium xuống headlineSmall
                      fontWeight: FontWeight.bold,
                      color: stat['color'] as Color,
                    ),
                  ),
                ),
                const SizedBox(height: 2), // Giảm từ 4 xuống 2
                Text(
                  stat['title'] as String,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith( // Đổi từ bodyMedium xuống bodySmall
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1, // Giới hạn 1 dòng
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  stat['subtitle'] as String,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade600,
                    fontSize: 11, // Giảm font size
                  ),
                  maxLines: 1, // Giới hạn 1 dòng
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      {
        'title': 'Xem lịch hẹn',
        'subtitle': 'Quản lý lịch hẹn hôm nay',
        'icon': FontAwesomeIcons.calendarCheck,
        'color': Colors.blue,
        'onTap': () {
          // Navigate to appointments page
          DefaultTabController.of(context).animateTo(1);
        },
      },
      {
        'title': 'Lịch làm việc',
        'subtitle': 'Xem lịch làm việc của bạn',
        'icon': FontAwesomeIcons.calendar,
        'color': Colors.green,
        'onTap': () {
          // Navigate to schedule page
          DefaultTabController.of(context).animateTo(2);
        },
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Thao tác nhanh',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 16),
        ...actions.map((action) => Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                spreadRadius: 1,
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: action['onTap'] as VoidCallback,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: (action['color'] as Color).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: FaIcon(
                        action['icon'] as IconData,
                        color: action['color'] as Color,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            action['title'] as String,
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            action['subtitle'] as String,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    FaIcon(
                      FontAwesomeIcons.chevronRight,
                      color: Colors.grey.shade400,
                      size: 16,
                    ),
                  ],
                ),
              ),
            ),
          ),
        )),
      ],
    );
  }

  Widget _buildUpcomingAppointments() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Lịch hẹn sắp tới',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () {
                  // Navigate to appointments page
                  DefaultTabController.of(context).animateTo(1);
                },
                child: const Text('Xem tất cả'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        if (_upcomingAppointments.isEmpty)
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Column(
                children: [
                  FaIcon(
                    FontAwesomeIcons.calendarXmark,
                    color: Colors.grey.shade400,
                    size: 32,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Không có lịch hẹn sắp tới',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _upcomingAppointments.length,
            itemBuilder: (context, index) {
              final appointment = _upcomingAppointments[index];
              return _buildAppointmentCard(appointment);
            },
          ),
      ],
    );
  }

  Widget _buildAppointmentCard(Appointment appointment) {
    final timeStr = '${appointment.appointmentDate!.hour.toString().padLeft(2, '0')}:${appointment.appointmentDate!.minute.toString().padLeft(2, '0')}';
    
    final dateStr = '${appointment.appointmentDate!.day}/${appointment.appointmentDate!.month}/${appointment.appointmentDate!.year}';

    Color statusColor = Colors.grey;
    String statusText = appointment.status ?? 'Unknown';
    
    switch (appointment.status) {
      case 'Pending':
        statusColor = Colors.orange;
        statusText = 'Chờ xác nhận';
        break;
      case 'Confirmed':
        statusColor = Colors.blue;
        statusText = 'Đã xác nhận';
        break;
      case 'Completed':
        statusColor = Colors.green;
        statusText = 'Hoàn thành';
        break;
      case 'Cancelled':
        statusColor = Colors.red;
        statusText = 'Đã hủy';
        break;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  appointment.service?.name ?? 'Dịch vụ không xác định',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              FaIcon(
                FontAwesomeIcons.user,
                color: Colors.grey.shade600,
                size: 14,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  appointment.user?.fullName ?? 'Khách hàng không xác định',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey.shade700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              FaIcon(
                FontAwesomeIcons.clock,
                color: Colors.grey.shade600,
                size: 14,
              ),
              const SizedBox(width: 8),
              Text(
                '$timeStr - $dateStr',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey.shade700,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTodaySchedule() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.blue.shade50,
            Colors.indigo.shade50,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.blue.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: FaIcon(
                  FontAwesomeIcons.calendarDay,
                  color: Colors.blue.shade700,
                  size: 16,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Lịch làm việc hôm nay',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.blue.shade700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildScheduleItem('08:00 - 12:00', 'Ca sáng', 'Khám tổng quát', true),
          _buildScheduleItem('14:00 - 18:00', 'Ca chiều', 'Phẫu thuật', true),
          _buildScheduleItem('19:00 - 21:00', 'Ca tối', 'Cấp cứu', false),
        ],
      ),
    );
  }

  Widget _buildScheduleItem(String time, String shift, String type, bool isActive) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: isActive ? Colors.green : Colors.grey.shade400,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$shift ($time)',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: isActive ? Colors.blue.shade700 : Colors.grey.shade600,
                  ),
                ),
                Text(
                  type,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
          if (isActive)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.green.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Đang hoạt động',
                style: TextStyle(
                  color: Colors.green.shade700,
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
