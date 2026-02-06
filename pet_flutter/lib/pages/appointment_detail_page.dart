import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:intl/intl.dart';
import '../models/appointment.dart';
import '../models/review.dart';
import '../models/store.dart';
import '../services/appointment_service.dart';
import '../services/review_service.dart';
import '../services/firebase_chat_service.dart';
import '../services/secure_storage.dart';
import '../widgets/review_dialog.dart';
import '../widgets/review_list.dart';
import '../widgets/time_progress_bar.dart';
import '../widgets/store_map_picker.dart';
import '../widgets/appointment_reminder_status_widget.dart';
import 'staff_detail_page.dart';
import 'chat_detail_page.dart';

class AppointmentDetailPage extends StatefulWidget {
  final Appointment appointment;

  const AppointmentDetailPage({super.key, required this.appointment});

  @override
  State<AppointmentDetailPage> createState() => _AppointmentDetailPageState();
}

class _AppointmentDetailPageState extends State<AppointmentDetailPage> {
  late Appointment appointment;
  bool isLoading = false;
  final ReviewService _reviewService = ReviewService();
  List<Review> _reviews = [];
  bool _isLoadingReviews = false;
  bool _hasReview = false; // Track if this appointment has a review
  Store? _selectedStore; // Cửa hàng được chọn

  @override
  void initState() {
    super.initState();
    appointment = widget.appointment;
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    if (appointment.status.toLowerCase() == 'completed') {
      setState(() {
        _isLoadingReviews = true;
      });

      try {
        final reviews = await _reviewService.getReviewsByAppointmentId(appointment.appointmentId);
        setState(() {
          _reviews = reviews;
          _hasReview = reviews.isNotEmpty;
        });
      } catch (e) {
        // Handle error silently for now
        print('Error loading reviews: $e');
        setState(() {
          _hasReview = false;
        });
      } finally {
        setState(() {
          _isLoadingReviews = false;
        });
      }
    }
  }

  Future<void> _showReviewDialog() async {
    await showDialog(
      context: context,
      builder: (context) => ReviewDialog(
        appointmentId: appointment.appointmentId,
        serviceId: appointment.serviceId,
        serviceName: appointment.serviceName,
        staffName: appointment.staffName,
        onReviewSubmitted: () {
          setState(() {
            _hasReview = true;
          });
          _loadReviews();
        },
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return Colors.blue;
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
        return 'Chờ xác nhận';
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

  Future<void> _openChatRoom() async {
    try {
      // Get user data from secure storage
      final secureStorage = SecureStorageService();
      final userId = await secureStorage.readUserId();
      final username = await secureStorage.readUserName();
      final role = await secureStorage.readUserRole();
      
      if (userId == null || username == null || role == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể mở chat. Vui lòng đăng nhập lại.')),
        );
        return;
      }

      // Ensure staffId is not null
      if (appointment.staffId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Chưa có nhân viên được phân công cho lịch hẹn này.')),
        );
        return;
      }

      // Create or get chat room for this appointment
      print('🔵 [AppointmentDetail] Creating chat for appointment ${appointment.appointmentId}');
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
      
      print('✅ [AppointmentDetail] Chat room created: ${chatRoom.id}');

      // Determine other user info based on current role
      final String otherUserId;
      final String otherUserName;
      final String otherUserAvatar;
      
      if (role == 'Staff') {
        // Staff is chatting with customer
        otherUserId = appointment.userId.toString();
        otherUserName = appointment.userName;
        otherUserAvatar = appointment.user?.avatarUrl ?? '';
      } else {
        // Customer is chatting with staff
        otherUserId = appointment.staffId.toString();
        otherUserName = appointment.staffName;
        otherUserAvatar = appointment.staff?.avatarUrl ?? '';
      }

      // Navigate to chat detail page
      if (!mounted) return;
      
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ChatDetailPage(
            chatRoomId: chatRoom.id,
            currentUserId: userId,
            currentUserName: username,
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
      print('❌ Error opening chat room: $e');
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không thể mở chat. Vui lòng thử lại.')),
      );
    }
  }

  Future<void> _cancelAppointment() async {
    final reason = await _showCancelDialog();
    if (reason != null && reason.isNotEmpty) {
      setState(() {
        isLoading = true;
      });

      try {
        final service = AppointmentService();
        final success = await service.cancelAppointment(appointment.appointmentId, reason);
        
        if (success) {
          setState(() {
            appointment = appointment.copyWith(
              status: 'Cancelled',
              cancellationReason: reason,
            );
          });
          
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã hủy lịch hẹn thành công'),
              backgroundColor: Colors.green,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Không thể hủy lịch hẹn. Vui lòng thử lại.'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: $e'),
            backgroundColor: Colors.red,
          ),
        );
      } finally {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  Future<String?> _showCancelDialog() async {
    final TextEditingController reasonController = TextEditingController();
    
    return showDialog<String>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Hủy lịch hẹn'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Bạn có chắc chắn muốn hủy lịch hẹn này?'),
              const SizedBox(height: 16),
              TextField(
                controller: reasonController,
                decoration: const InputDecoration(
                  labelText: 'Lý do hủy',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Hủy bỏ'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(reasonController.text),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('Xác nhận hủy', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  void _openMap() {
    // Mở màn hình chọn cửa hàng với Google Maps
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => StoreMapPicker(
          onStoreSelected: (store) {
            setState(() {
              _selectedStore = store;
            });
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Đã chọn: ${store.name}'),
                backgroundColor: Colors.green,
                duration: const Duration(seconds: 2),
              ),
            );
          },
        ),
      ),
    ).then((selectedStore) {
      if (selectedStore != null && selectedStore is Store) {
        setState(() {
          _selectedStore = selectedStore;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(appointment.status);
    final statusText = _getStatusText(appointment.status);
    final statusIcon = _getStatusIcon(appointment.status);
    final dateFormat = DateFormat('dd/MM/yyyy');
    final timeFormat = DateFormat('HH:mm');
    final priceFormat = NumberFormat.currency(symbol: '₫');

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Chi tiết lịch hẹn'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView( // SingleChildScrollView là hàm để cuộn nội dung của widget
        padding: const EdgeInsets.all(16), // EdgeInsets.all(16) là hàm để xác định khoảng cách giữa các widget(trên, dưới, trái, phải) của widget
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Card with Progress Bar
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    spreadRadius: 0,
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.15), // withOpacity(0.15) là hàm để đặt độ trong suốt cho container
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: statusColor.withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        FaIcon(statusIcon, size: 20, color: statusColor),
                        const SizedBox(width: 12),
                        Text(
                          statusText,
                          style: TextStyle(
                            color: statusColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    priceFormat.format(appointment.servicePrice), // priceFormat.format(appointment.servicePrice) là hàm để format giá dịch vụ, format là để định dạng giá dịch vụ
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                  
                  // Progress Bar for upcoming appointments
                  if (appointment.status.toLowerCase() != 'completed' && 
                      appointment.status.toLowerCase() != 'cancelled')
                      // toLowerCase() là hàm để chuyển đổi chữ cái thành chữ thường
                    TimeProgressBar(
                      appointmentTime: appointment.appointmentDate,
                      isCompact: false,
                    ),
                ],
              ),
            ),
            
            const SizedBox(height: 20),

            // Reminder Status Widget - only show for future appointments
            if (appointment.status.toLowerCase() != 'completed' && 
                appointment.status.toLowerCase() != 'cancelled' &&
                appointment.appointmentDate.isAfter(DateTime.now()))
              AppointmentReminderStatusWidget( // AppointmentReminderStatusWidget là hàm để hiển thị thông báo lịch hẹn
                appointmentId: appointment.appointmentId.toString(),
                appointmentTime: appointment.appointmentDate,
                petName: appointment.petName,
                serviceName: appointment.serviceName,
                userId: appointment.userId.toString(),
              ),

            // Add spacing if reminder widget is shown
            if (appointment.status.toLowerCase() != 'completed' && 
                appointment.status.toLowerCase() != 'cancelled' &&
                appointment.appointmentDate.isAfter(DateTime.now()))
              const SizedBox(height: 20),

            // Service Info
            _buildInfoCard(
              title: 'Dịch vụ',
              icon: FontAwesomeIcons.scissors,
              iconColor: Theme.of(context).colorScheme.primary,
              children: [
                _buildInfoRow('Tên dịch vụ', appointment.serviceName),
                if (appointment.service?.description != null)
                  _buildInfoRow('Mô tả', appointment.service!.description),
                if (appointment.service?.duration != null)
                  _buildInfoRow('Thời gian', '${appointment.service!.duration} phút'),
                if (appointment.service?.category != null)
                  _buildInfoRow('Danh mục', appointment.service!.category),
              ],
            ),

            const SizedBox(height: 16),

            // Pet Info
            _buildInfoCard(
              title: 'Thông tin thú cưng',
              icon: FontAwesomeIcons.paw,
              iconColor: Colors.orange,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: Colors.orange.withOpacity(0.2),
                      backgroundImage: appointment.pet?.imageUrl != null 
                          ? NetworkImage(appointment.pet!.imageUrl!) 
                          : null,
                      child: appointment.pet?.imageUrl == null 
                          ? FaIcon(FontAwesomeIcons.paw, size: 24, color: Colors.orange.shade700)
                          : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            appointment.petName,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (appointment.pet?.species != null)
                            Text(
                              appointment.pet!.species,
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontSize: 14,
                              ),
                            ),
                          if (appointment.pet?.breed != null)
                            Text(
                              appointment.pet!.breed!,
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontSize: 14,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (appointment.pet?.age != null)
                  _buildInfoRow('Tuổi', '${appointment.pet!.age} tuổi'),
                if (appointment.pet?.weight != null)
                  _buildInfoRow('Cân nặng', '${appointment.pet!.weight} kg'),
                if (appointment.pet?.gender != null)
                  _buildInfoRow('Giới tính', appointment.pet!.gender!),
              ],
            ),

            const SizedBox(height: 16),

            // Staff Info
            if (appointment.staffName.isNotEmpty)
              _buildInfoCard(
                title: 'Bác sĩ / Nhân viên',
                icon: FontAwesomeIcons.userDoctor, // FontAwesomeIcons.userDoctor là tên một icon trong thư viện Font Awesome được dùng để hiển thị icon user doctor
                iconColor: Colors.blue,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 30,
                        backgroundColor: Colors.blue.withOpacity(0.2), // withOpacity(0.2) là hàm để đặt độ trong suốt cho container
                        backgroundImage: appointment.staff?.avatarUrl != null // NetworkImage là hàm để hiển thị ảnh từ một URL
                            ? NetworkImage(appointment.staff!.avatarUrl!) // appointment.staff!.avatarUrl! là URL của ảnh của nhân viên
                            : null, // null là hàm để hiển thị icon mặc định
                        child: appointment.staff?.avatarUrl == null 
                            ? FaIcon(FontAwesomeIcons.userDoctor, size: 24, color: Colors.blue.shade700) // FaIcon là hàm để hiển thị icon trong thư viện Font Awesome
                            : null, // null là hàm để hiển thị icon mặc định
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              appointment.staffName,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (appointment.staff?.specialization != null)
                              Text(
                                appointment.staff!.specialization!,
                                style: TextStyle(
                                  color: Colors.grey.shade600,
                                  fontSize: 14,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (appointment.staff?.email != null)
                    _buildInfoRow('Email', appointment.staff!.email),
                  if (appointment.staff?.phone != null)
                    _buildInfoRow('Điện thoại', appointment.staff!.phone!),
                  
                  // Thêm nút xem chi tiết nhân viên
                  if (appointment.staffId != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 16),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => StaffDetailPage(staffId: appointment.staffId!),
                              ),
                            );
                          },
                          icon: const FaIcon(FontAwesomeIcons.circleInfo, size: 18),
                          label: const Text('Xem chi tiết nhân viên'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),

            const SizedBox(height: 16),

            // Date & Time Info
            _buildInfoCard(
              title: 'Thời gian & Địa điểm',
              icon: FontAwesomeIcons.calendar,
              iconColor: Colors.green,
              children: [
                _buildInfoRow('Ngày', dateFormat.format(appointment.appointmentDate)),
                _buildInfoRow('Giờ', timeFormat.format(appointment.appointmentDate)),
                if (appointment.endTime != null)
                  _buildInfoRow('Kết thúc', timeFormat.format(appointment.endTime!)),
                
                // Hiển thị cửa hàng đã chọn hoặc địa điểm mặc định
                if (_selectedStore != null) ...[
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildInfoRow('Cửa hàng', _selectedStore!.name),
                            _buildInfoRow('Địa chỉ', _selectedStore!.address),
                            if (_selectedStore!.phone != null)
                              _buildInfoRow('Điện thoại', _selectedStore!.phone!),
                            if (_selectedStore!.distance != null)
                              Padding(
                                padding: const EdgeInsets.only(top: 8.0),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: Colors.blue.shade50,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: Colors.blue.shade200),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.directions_walk, size: 16, color: Colors.blue),
                                      const SizedBox(width: 4),
                                      Text(
                                        'Cách ${_selectedStore!.distance!.toStringAsFixed(2)} km',
                                        style: const TextStyle(
                                          color: Colors.blue,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                      Column(
                        children: [
                          IconButton(
                            onPressed: _openMap,
                            icon: const FaIcon(FontAwesomeIcons.mapLocationDot),
                            color: Colors.green,
                            tooltip: 'Đổi cửa hàng',
                          ),
                          const Text(
                            'Đổi',
                            style: TextStyle(fontSize: 10, color: Colors.grey),
                          ),
                        ],
                      ),
                    ],
                  ),
                ] else ...[
                  Row(
                    children: [
                      Expanded(
                        child: _buildInfoRow('Địa điểm', '123 Đường ABC, Quận 1, TP.HCM'),
                      ),
                      IconButton(
                        onPressed: _openMap,
                        icon: const FaIcon(FontAwesomeIcons.mapLocationDot),
                        color: Colors.green,
                        tooltip: 'Chọn cửa hàng',
                      ),
                    ],
                  ),
                ],
              ],
            ),

            const SizedBox(height: 16),

            // Notes
            if (appointment.notes != null && appointment.notes!.isNotEmpty)
              _buildInfoCard(
                title: 'Ghi chú',
                icon: FontAwesomeIcons.noteSticky,
                iconColor: Colors.amber.shade700,
                children: [
                  Text(
                    appointment.notes!,
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),

            const SizedBox(height: 16),

            // Cancellation Reason
            if (appointment.cancellationReason != null && appointment.cancellationReason!.isNotEmpty)
              _buildInfoCard(
                title: 'Lý do hủy',
                icon: FontAwesomeIcons.triangleExclamation,
                iconColor: Colors.red,
                children: [
                  Text(
                    appointment.cancellationReason!,
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),

            const SizedBox(height: 32),

            // Action Buttons
            if (appointment.status.toLowerCase() != 'cancelled' && 
                appointment.status.toLowerCase() != 'completed')
              Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: isLoading ? null : _cancelAppointment,
                      icon: isLoading 
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const FaIcon(FontAwesomeIcons.xmark),
                      label: Text(isLoading ? 'Đang hủy...' : 'Hủy lịch hẹn'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        // TODO: Navigate to reschedule
                      },
                      icon: const FaIcon(FontAwesomeIcons.calendarDays),
                      label: const Text('Đặt lại lịch'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),

            // Quick Review Button for completed appointments (smaller version)
            if (appointment.status.toLowerCase() == 'completed')
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _hasReview ? null : _showReviewDialog,
                        icon: FaIcon(
                          _hasReview ? FontAwesomeIcons.check : FontAwesomeIcons.star,
                          size: 16,
                        ),
                        label: Text(
                          _hasReview ? 'Đã đánh giá' : 'Đánh giá nhanh',
                          style: TextStyle(
                            fontSize: 14,
                            color: _hasReview ? Colors.grey : Colors.amber[700],
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: _hasReview ? Colors.grey : Colors.amber[700],
                          side: BorderSide(
                            color: _hasReview ? Colors.grey : Colors.amber,
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            // Review Button for completed appointments
            if (appointment.status.toLowerCase() == 'completed')
              Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _hasReview ? null : _showReviewDialog,
                      icon: FaIcon(
                        _hasReview ? FontAwesomeIcons.check : FontAwesomeIcons.star,
                      ),
                      label: Text(
                        _hasReview ? 'Đã đánh giá' : 'Đánh giá dịch vụ',
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _hasReview ? Colors.grey : Colors.amber,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder( // RoundedRectangleBorder là hàm để tạo border cho container
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Reviews Section
                  if (_isLoadingReviews)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: CircularProgressIndicator(),
                      ),
                    )
                  else if (_reviews.isNotEmpty)
                    ReviewList(reviews: _reviews)
                  else
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: const Center(
                        child: Column(
                          children: [
                            Icon(
                              Icons.reviews,
                              size: 48,
                              color: Colors.grey,
                            ),
                            SizedBox(height: 12),
                            Text(
                              'Chưa có đánh giá nào',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Hãy là người đầu tiên đánh giá dịch vụ này!',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _openChatRoom,
        backgroundColor: Theme.of(context).colorScheme.primary,
        child: const Icon(
          Icons.chat,
          color: Colors.white,
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required String title,
    required IconData icon,
    required Color iconColor,
    required List<Widget> children,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 0,
            blurRadius: 10,
            offset: const Offset(0, 4),
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
                  color: iconColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: FaIcon(icon, size: 20, color: iconColor),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 14,
              ),
            ),
          ),
          const Text(': '),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

}
