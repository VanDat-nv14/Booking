import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../services/secure_storage.dart';
import '../services/signalr_service.dart';
import '../services/staff_service.dart';
import '../services/onesignal_service.dart';
import 'dart:convert';

class StaffProfilePage extends StatefulWidget {
  const StaffProfilePage({super.key});

  @override
  State<StaffProfilePage> createState() => _StaffProfilePageState();
}

class _StaffProfilePageState extends State<StaffProfilePage> {
  final SecureStorageService _storage = SecureStorageService();
  final StaffService _staffService = StaffService();
  
  String? _staffName;
  String? _staffEmail;
  String? _staffPhone;
  String? _staffRole;
  String? _specialization;
  int? _staffId;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStaffInfo();
  }

  Future<void> _loadStaffInfo() async {
    try {
      if (!mounted) return;
      setState(() => _loading = true);
      
      // Lấy thông tin từ storage trước
      final userJson = await _storage.readUser();
      if (userJson != null) {
        final user = json.decode(userJson);
        if (!mounted) return;
        setState(() {
          _staffName = user['fullName'] ?? 'Nhân viên';
          _staffEmail = user['email'] ?? '';
          _staffPhone = user['phone'] ?? '';
          _staffRole = user['role'] ?? 'Staff';
          _specialization = user['specialization'] ?? 'Bác sĩ thú y tổng quát';
        });
      }

      // Sau đó lấy thông tin chi tiết từ API
      try {
        final staffInfo = await _staffService.getCurrentStaffInfo();
        if (!mounted) return;
        setState(() {
          _staffId = staffInfo['staffId'];
          _staffName = staffInfo['fullName'] ?? _staffName;
          _staffEmail = staffInfo['email'] ?? _staffEmail;
          _staffPhone = staffInfo['phone'] ?? _staffPhone;
          _specialization = staffInfo['specialization'] ?? _specialization;
        });
      } catch (e) {
        print('Could not load staff info from API: $e');
        // Tiếp tục với thông tin từ storage
      }
    } catch (e) {
      print('Error loading staff info: $e');
    } finally {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _performLogout() async {
    try {
      // Show loading dialog
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(),
        ),
      );

      // Clear storage and disconnect SignalR
      await _storage.clear();
      
      try {
        final signalRService = SignalRService();
        await signalRService.disconnect();
      } catch (e) {
        print('Error disconnecting SignalR: $e');
      }

      // Close loading dialog
      if (mounted) Navigator.of(context).pop();

      // Navigate to login
      if (mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil(
          '/login',
          (route) => false,
        );
      }
    } catch (e) {
      // Close loading dialog
      if (mounted) Navigator.of(context).pop();
      
      // Show error
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi đăng xuất: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar with Profile Header
          SliverAppBar(
            expandedHeight: 200,
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
                    padding: const EdgeInsets.all(16), // Giảm từ 24 xuống 16
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      mainAxisSize: MainAxisSize.min, // Thêm để tối ưu không gian
                      children: [
                        // Avatar
                        Container(
                          width: 70, // Giảm từ 80 xuống 70
                          height: 70, // Giảm từ 80 xuống 70
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2), // Giảm border từ 3 xuống 2
                          ),
                          child: const Icon(
                            Icons.person,
                            size: 35, // Giảm từ 40 xuống 35
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 12), // Giảm từ 16 xuống 12
                        
                        if (_loading)
                          const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        else ...[
                          Text(
                            _staffName ?? 'Nhân viên',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith( // Đổi từ headlineSmall xuống titleLarge
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                            maxLines: 1, // Giới hạn 1 dòng
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2), // Giảm từ 4 xuống 2
                          Text(
                            _staffRole == 'Admin' ? 'Quản trị viên' : 'Nhân viên',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.white.withOpacity(0.9),
                            ),
                            textAlign: TextAlign.center,
                          ),
                          if (_specialization != null) ...[
                            const SizedBox(height: 2), // Giảm từ 4 xuống 2
                            Text(
                              _specialization!,
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Colors.white.withOpacity(0.8),
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 1, // Giới hạn 1 dòng
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: Column(
              children: [
                const SizedBox(height: 24),
                _buildPersonalInfo(),
                const SizedBox(height: 24),
                _buildWorkInfo(),
                const SizedBox(height: 24),
                _buildQuickActions(),
                const SizedBox(height: 24),
                _buildSettings(),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPersonalInfo() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
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
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: FaIcon(
                  FontAwesomeIcons.user,
                  color: Colors.blue.shade600,
                  size: 16,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Thông tin cá nhân',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          _buildInfoRow(
            FontAwesomeIcons.signature,
            'Họ và tên',
            _staffName ?? 'Chưa cập nhật',
          ),
          _buildInfoRow(
            FontAwesomeIcons.envelope,
            'Email',
            _staffEmail ?? 'Chưa cập nhật',
          ),
          _buildInfoRow(
            FontAwesomeIcons.phone,
            'Số điện thoại',
            _staffPhone ?? 'Chưa cập nhật',
          ),
          _buildInfoRow(
            FontAwesomeIcons.userTag,
            'Vai trò',
            _staffRole == 'Admin' ? 'Quản trị viên' : 'Nhân viên',
          ),
        ],
      ),
    );
  }

  Widget _buildWorkInfo() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
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
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: FaIcon(
                  FontAwesomeIcons.briefcase,
                  color: Colors.green.shade600,
                  size: 16,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Thông tin công việc',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          _buildInfoRow(
            FontAwesomeIcons.stethoscope,
            'Chuyên môn',
            _specialization ?? 'Bác sĩ thú y tổng quát',
          ),
          _buildInfoRow(
            FontAwesomeIcons.calendarWeek,
            'Lịch làm việc',
            'Thứ 2 - Thứ 7',
          ),
          _buildInfoRow(
            FontAwesomeIcons.clock,
            'Giờ làm việc',
            '8:00 - 18:00',
          ),
          _buildInfoRow(
            FontAwesomeIcons.building,
            'Phòng ban',
            'Khoa Khám bệnh',
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      {
        'title': 'Cập nhật thông tin',
        'subtitle': 'Chỉnh sửa thông tin cá nhân',
        'icon': FontAwesomeIcons.userPen,
        'color': Colors.blue,
        'onTap': () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Tính năng đang phát triển')),
          );
        },
      },
      {
        'title': 'Đổi mật khẩu',
        'subtitle': 'Thay đổi mật khẩu đăng nhập',
        'icon': FontAwesomeIcons.lock,
        'color': Colors.orange,
        'onTap': () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Tính năng đang phát triển')),
          );
        },
      },
      {
        'title': 'Thông báo',
        'subtitle': 'Cài đặt thông báo',
        'icon': FontAwesomeIcons.bell,
        'color': Colors.purple,
        'onTap': () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Tính năng đang phát triển')),
          );
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

  Widget _buildSettings() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
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
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: FaIcon(
                  FontAwesomeIcons.gear,
                  color: Colors.grey.shade600,
                  size: 16,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Cài đặt',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          // App version
          _buildInfoRow(
            FontAwesomeIcons.mobileScreen,
            'Phiên bản ứng dụng',
            'v1.0.0 (Staff)',
          ),
          
          // Support
          _buildInfoRow(
            FontAwesomeIcons.headset,
            'Hỗ trợ kỹ thuật',
            'support@petcare.vn',
          ),
          
          const SizedBox(height: 20),
          
          // Logout button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    title: Row(
                      children: [
                        FaIcon(
                          FontAwesomeIcons.rightFromBracket,
                          color: Colors.red,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        const Text('Đăng xuất'),
                      ],
                    ),
                    content: const Text('Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('Hủy'),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          _performLogout();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          foregroundColor: Colors.white,
                        ),
                        child: const Text('Đăng xuất'),
                      ),
                    ],
                  ),
                );
              },
              icon: const FaIcon(FontAwesomeIcons.rightFromBracket, size: 16),
              label: const Text('Đăng xuất'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FaIcon(
            icon,
            color: Colors.grey.shade600,
            size: 16,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade600,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
