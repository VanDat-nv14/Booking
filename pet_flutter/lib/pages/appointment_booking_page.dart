import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import '../models/appointment.dart';
import '../models/time_slot.dart';
import '../services/appointment_service.dart';
import '../services/service_service.dart';
import '../services/appointment_reminder_service.dart';
import '../services/secure_storage.dart';
import '../utils/onesignal_notification_helper.dart';
import 'dart:convert';
import 'appointment_steps.dart';

class AppointmentBookingPage extends StatefulWidget {
  const AppointmentBookingPage({super.key});

  @override
  State<AppointmentBookingPage> createState() => _AppointmentBookingPageState();
}

class _AppointmentBookingPageState extends State<AppointmentBookingPage> {
  final PageController _pageController = PageController();
  final AppointmentService _appointmentService = AppointmentService();
  
  int _currentStep = 0;
  final AppointmentBookingData _bookingData = AppointmentBookingData();

  final List<BookingStep> _steps = [
    BookingStep(
      stepNumber: 1,
      title: 'Chọn dịch vụ',
      description: 'Lựa chọn dịch vụ bạn muốn đặt lịch',
      icon: Icons.medical_services,
    ),
    BookingStep(
      stepNumber: 2,
      title: 'Chọn thú cưng',
      description: 'Chọn thú cưng cần được chăm sóc',
      icon: Icons.pets,
    ),
    BookingStep(
      stepNumber: 3,
      title: 'Chọn ngày và giờ',
      description: 'Lựa chọn thời gian phù hợp',
      icon: Icons.calendar_month,
    ),
    BookingStep(
      stepNumber: 4,
      title: 'Xác nhận đặt lịch',
      description: 'Kiểm tra thông tin và xác nhận',
      icon: Icons.check_circle,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Đặt lịch hẹn'),
        elevation: 0, // elevation: 0 là hàm để tạo bóng cho app bar
        backgroundColor: Theme.of(context).colorScheme.primary, 
        foregroundColor: Colors.white,
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Enhanced Step Indicator
          Container(
            decoration: BoxDecoration(  // BoxDecoration là hàm để tạo border cho container
              gradient: LinearGradient( // LinearGradient là hàm để tạo gradient cho container
                colors: [
                  Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  Theme.of(context).colorScheme.primary.withOpacity(0.05),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                // Progress bar
                Container(
                  height: 4,
                  decoration: BoxDecoration( // BoxDecoration là hàm để tạo border cho container
                    color: Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(2),
                  ),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 500),
                    curve: Curves.easeInOut,
                    width: MediaQuery.of(context).size.width * ((_currentStep + 1) / _steps.length),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Theme.of(context).colorScheme.primary,
                          Theme.of(context).colorScheme.primary.withOpacity(0.8),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                // Step indicators
                Row(
                  children: _steps.asMap().entries.map((entry) {
                    final index = entry.key;
                    final step = entry.value;
                    final isActive = index == _currentStep;
                    final isCompleted = index < _currentStep;
                    
                    return Expanded(
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              children: [
                                AnimatedContainer(
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeInOut,
                                  width: 50,
                                  height: 50,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: isCompleted
                                        ? Colors.green
                                        : isActive
                                            ? Theme.of(context).colorScheme.primary
                                            : Colors.grey.shade300,
                                    boxShadow: isActive ? [
                                      BoxShadow(
                                        color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                                        blurRadius: 8,
                                        spreadRadius: 2,
                                      ),
                                    ] : null,
                                  ),
                                  child: AnimatedScale(
                                    scale: isActive ? 1.1 : 1.0,
                                    duration: const Duration(milliseconds: 200),
                                    child: Icon(
                                      isCompleted ? Icons.check : step.icon,
                                      color: isCompleted || isActive
                                          ? Colors.white
                                          : Colors.grey.shade600,
                                      size: 24,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                AnimatedDefaultTextStyle(
                                  duration: const Duration(milliseconds: 200),
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                                    color: isActive
                                        ? Theme.of(context).colorScheme.primary
                                        : isCompleted
                                            ? Colors.green
                                            : Colors.grey.shade600,
                                  ),
                                  child: Text(
                                    step.title,
                                    textAlign: TextAlign.center,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                AnimatedOpacity(
                                  duration: const Duration(milliseconds: 200),
                                  opacity: isActive ? 1.0 : 0.0,
                                  child: Text(
                                    step.description,
                                    style: TextStyle(
                                      fontSize: 10,
                                      color: Colors.grey.shade600,
                                    ),
                                    textAlign: TextAlign.center,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (index < _steps.length - 1)
                            Container(
                              height: 2,
                              width: 30,
                              margin: const EdgeInsets.symmetric(horizontal: 8),
                              decoration: BoxDecoration(
                                color: isCompleted
                                    ? Colors.green
                                    : Colors.grey.shade300,
                                borderRadius: BorderRadius.circular(1),
                              ),
                            ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
          
          // Enhanced Page Content with Animation
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                ServiceSelectionStep(
                  bookingData: _bookingData,
                  onServiceSelected: _onServiceSelected,
                ),
                PetStep(
                  bookingData: _bookingData,
                  onChanged: _onPetSelected,
                ),
                DateTimeStep(
                  bookingData: _bookingData,
                  onChanged: _onDateTimeSelected,
                ),
                ConfirmationStep(
                  bookingData: _bookingData,
                  appointmentService: _appointmentService,
                  onBookingConfirmed: _onBookingConfirmed,
                ),
              ],
            ),
          ),
          
          // Enhanced Navigation Buttons
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  spreadRadius: 1,
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                if (_currentStep > 0)
                  Expanded(
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      child: OutlinedButton.icon(
                        onPressed: _previousStep,
                        icon: const Icon(Icons.arrow_back_ios, size: 16),
                        label: const Text('Quay lại'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          side: BorderSide(
                            color: Theme.of(context).colorScheme.primary,
                            width: 1.5,
                          ),
                        ),
                      ),
                    ),
                  ),
                if (_currentStep > 0) const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    child: ElevatedButton.icon(
                      onPressed: _canGoNext() ? _nextStep : null,
                      icon: Icon(
                        _currentStep == _steps.length - 1 
                            ? Icons.check_circle 
                            : Icons.arrow_forward_ios,
                        size: 18,
                      ),
                      label: Text(
                        _currentStep == _steps.length - 1 ? 'Xác nhận đặt lịch' : 'Tiếp tục',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _canGoNext() 
                            ? Theme.of(context).colorScheme.primary
                            : Colors.grey.shade300,
                        foregroundColor: _canGoNext() 
                            ? Colors.white
                            : Colors.grey.shade600,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: _canGoNext() ? 2 : 0,
                        shadowColor: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  bool _canGoNext() {
    switch (_currentStep) {
      case 0:
        return _bookingData.isStep1Complete;
      case 1:
        return _bookingData.isStep2Complete;
      case 2:
        return _bookingData.isStep3Complete;
      case 3:
        return _bookingData.isAllStepsComplete;
      default:
        return false;
    }
  }

  void _nextStep() {
    if (_currentStep < _steps.length - 1) {
      setState(() {
        _currentStep++;
      });
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _confirmBooking();
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() {
        _currentStep--;
      });
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _onServiceSelected(Service service) async {
    setState(() {
      _bookingData.selectedService = service;
    });
    
    // Tăng view count khi chọn dịch vụ
    try {
      final serviceService = ServiceService();
      await serviceService.incrementViewCount(service.serviceId);
    } catch (e) {
      // Không hiển thị lỗi cho user vì đây chỉ là thống kê
      print('Failed to increment view count: $e');
    }
  }

  void _onPetSelected(Pet pet) {
    setState(() {
      _bookingData.selectedPet = pet;
    });
  }

  void _onDateTimeSelected(DateTime date, TimeSlot timeSlot, Staff staff) {
    setState(() {
      _bookingData.selectedDate = date;
      _bookingData.selectedTimeSlot = timeSlot;
      _bookingData.selectedStaff = staff;
    });
  }

  void _onBookingConfirmed() {
    _confirmBooking();
  }

  Future<void> _confirmBooking() async {
    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(),
        ),
      );

      final appointment = await _appointmentService.createAppointment(_bookingData.toJson());
      
      Navigator.of(context).pop(); // Close loading dialog
      
      if (appointment != null) {
        // 🔔 Schedule appointment reminders (1 hour, 30 min, 10 min before)
        try {
          final storage = SecureStorageService();
          final userJson = await storage.readUser();
          String? userId;
          if (userJson != null) {
            final user = jsonDecode(userJson);
            userId = user['userId']?.toString(); // Changed from 'id' to 'userId'
          }
          
          await AppointmentReminderService().scheduleReminders(
            appointmentId: appointment.appointmentId.toString(),
            appointmentTime: appointment.appointmentDate,
            petName: _bookingData.selectedPet?.name ?? 'thú cưng',
            serviceName: _bookingData.selectedService?.name ?? 'dịch vụ',
            userId: userId,
          );
          
          debugPrint('✅ [Booking] Reminders scheduled for appointment ${appointment.appointmentId}');
        } catch (e) {
          debugPrint('⚠️ [Booking] Failed to schedule reminders: $e');
        }
        
        // 🎉 Send OneSignal notification for successful booking
        try {
          debugPrint('🔔 [Booking] Attempting to send success notification...');
          final storage = SecureStorageService();
          final userJson = await storage.readUser();
          debugPrint('🔔 [Booking] User JSON: $userJson');
          
          if (userJson != null) {
            final user = jsonDecode(userJson);
            final userId = user['userId']?.toString(); // Changed from 'id' to 'userId'
            debugPrint('🔔 [Booking] User ID from storage: $userId');
            
            if (userId != null) {
              final dateFormat = '${appointment.appointmentDate.day}/${appointment.appointmentDate.month}/${appointment.appointmentDate.year}';
              final timeFormat = '${appointment.appointmentDate.hour}:${appointment.appointmentDate.minute.toString().padLeft(2, '0')}';
              
              debugPrint('🔔 [Booking] Calling sendNotificationToUser...');
              await OneSignalNotificationHelper.sendNotificationToUser(
                userId: userId,
                title: '🎉 Đặt lịch thành công!',
                message: 'Lịch hẹn ${_bookingData.selectedService?.name ?? 'dịch vụ'} cho ${_bookingData.selectedPet?.name ?? 'thú cưng'} vào lúc $timeFormat, ngày $dateFormat đã được tạo.',
                data: {
                  'type': 'booking_success',
                  'appointmentId': appointment.appointmentId.toString(),
                  'timestamp': DateTime.now().toIso8601String(),
                },
              );
              
              debugPrint('✅ [Booking] Success notification sent to user $userId');
            } else {
              debugPrint('⚠️ [Booking] User ID is null!');
            }
          } else {
            debugPrint('⚠️ [Booking] User JSON is null!');
          }
        } catch (e) {
          debugPrint('⚠️ [Booking] Failed to send success notification: $e');
          debugPrint('⚠️ [Booking] Stack trace: ${StackTrace.current}');
        }
        
        _showSuccessDialog();
      } else {
        _showErrorDialog('Không thể tạo lịch hẹn. Vui lòng thử lại.');
      }
    } catch (e) {
      Navigator.of(context).pop(); // Close loading dialog
      _showErrorDialog('Lỗi: ${e.toString()}');
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withOpacity(0.5),
      builder: (dialogContext) {
        // Auto close after animation
        Future.delayed(const Duration(milliseconds: 2500), () {
          if (dialogContext.mounted && Navigator.canPop(dialogContext)) {
            Navigator.of(dialogContext).pop(); // Close dialog
            if (context.mounted && Navigator.canPop(context)) {
              Navigator.of(context).pop(); // Close booking page
            }
          }
        });

        return Dialog(
          backgroundColor: Colors.transparent,
          elevation: 0,
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 20,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Lottie animation
                Lottie.asset(
                  'assets/animations/check_mark_success.json',
                  width: 120,
                  height: 120,
                  fit: BoxFit.contain,
                  repeat: false,
                ),
                const SizedBox(height: 16),
                Text(
                  'Đặt lịch thành công!',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  'Lịch hẹn của bạn đã được tạo thành công.\nChúng tôi sẽ liên hệ với bạn để xác nhận.',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                // Optional: Add button to close immediately
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      if (Navigator.canPop(dialogContext)) {
                        Navigator.of(dialogContext).pop(); // Close dialog
                      }
                      if (context.mounted && Navigator.canPop(context)) {
                        Navigator.of(context).pop(); // Close booking page
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(dialogContext).colorScheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Hoàn tất',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.error, color: Colors.red, size: 48),
        title: const Text('Lỗi'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }
}

// Step 1: Service Selection
class ServiceSelectionStep extends StatefulWidget {
  final AppointmentBookingData bookingData;
  final Function(Service) onServiceSelected;

  const ServiceSelectionStep({
    super.key,
    required this.bookingData,
    required this.onServiceSelected,
  });

  @override
  State<ServiceSelectionStep> createState() => _ServiceSelectionStepState();
}

class _ServiceSelectionStepState extends State<ServiceSelectionStep> {
  List<Service> _services = [];
  bool _isLoading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  Future<void> _loadServices() async {
    setState(() { _isLoading = true; });
    try {
      final svc = ServiceService();
      final data = await svc.getServices();
      setState(() {
        _services = data.map((e) => Service.fromJson(e)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  List<Service> get _filteredServices {
    if (_searchQuery.isEmpty) return _services;
    return _services.where((service) =>
        service.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
        service.category.toLowerCase().contains(_searchQuery.toLowerCase())).toList();
  }

  String _formatCurrency(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}₫';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Enhanced Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  Theme.of(context).colorScheme.primary.withOpacity(0.05),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.medical_services,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Chọn dịch vụ',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Hãy chọn dịch vụ bạn muốn đặt lịch cho thú cưng của mình',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          // Enhanced Search Bar
          Container(
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
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Tìm kiếm dịch vụ...',
                prefixIcon: Icon(
                  Icons.search,
                  color: Theme.of(context).colorScheme.primary,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(
                    color: Theme.of(context).colorScheme.primary,
                    width: 2,
                  ),
                ),
                filled: true,
                fillColor: Colors.grey.shade50,
                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
            ),
          ),
          const SizedBox(height: 20),
          
          // Enhanced Services List
          Expanded(
            child: _isLoading
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Theme.of(context).colorScheme.primary,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Đang tải dịch vụ...',
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  )
                : _filteredServices.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(20),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade100,
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.search_off,
                                  size: 64,
                                  color: Colors.grey.shade400,
                                ),
                              ),
                              const SizedBox(height: 24),
                              Text(
                                'Không tìm thấy dịch vụ nào',
                                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  color: Colors.grey.shade600,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Thử tìm kiếm với từ khóa khác',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey.shade500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                    : ListView.builder(
                        itemCount: _filteredServices.length,
                        itemBuilder: (context, index) {
                          final service = _filteredServices[index];
                          final isSelected = widget.bookingData.selectedService?.serviceId == service.serviceId;
                          
                          return AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            margin: const EdgeInsets.only(bottom: 16),
                            child: Material(
                              elevation: isSelected ? 8 : 2,
                              shadowColor: isSelected 
                                  ? Theme.of(context).colorScheme.primary.withOpacity(0.3)
                                  : Colors.grey.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(16),
                              child: Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: isSelected 
                                        ? Theme.of(context).colorScheme.primary
                                        : Colors.transparent,
                                    width: 2,
                                  ),
                                ),
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(16),
                                  onTap: () => widget.onServiceSelected(service),
                                  child: Padding(
                                    padding: const EdgeInsets.all(20),
                                    child: Row(
                                      children: [
                                        // Enhanced Service Icon
                                        AnimatedContainer(
                                          duration: const Duration(milliseconds: 200),
                                          width: 70,
                                          height: 70,
                                          decoration: BoxDecoration(
                                            gradient: LinearGradient(
                                              colors: isSelected
                                                  ? [
                                                      Theme.of(context).colorScheme.primary,
                                                      Theme.of(context).colorScheme.primary.withOpacity(0.8),
                                                    ]
                                                  : [
                                                      Theme.of(context).colorScheme.primary.withOpacity(0.1),
                                                      Theme.of(context).colorScheme.primary.withOpacity(0.05),
                                                    ],
                                              begin: Alignment.topLeft,
                                              end: Alignment.bottomRight,
                                            ),
                                            borderRadius: BorderRadius.circular(16),
                                            boxShadow: isSelected ? [
                                              BoxShadow(
                                                color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                                                blurRadius: 8,
                                                spreadRadius: 2,
                                              ),
                                            ] : null,
                                          ),
                                          child: Icon(
                                            _getServiceIcon(service.category),
                                            color: isSelected 
                                                ? Colors.white
                                                : Theme.of(context).colorScheme.primary,
                                            size: 32,
                                          ),
                                        ),
                                        const SizedBox(width: 20),
                                        
                                        // Enhanced Service Details
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                service.name,
                                                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                                  fontWeight: FontWeight.bold,
                                                  color: isSelected 
                                                      ? Theme.of(context).colorScheme.primary
                                                      : Colors.black87,
                                                ),
                                              ),
                                              const SizedBox(height: 6),
                                              Text(
                                                service.description,
                                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                                  color: Colors.grey.shade600,
                                                  height: 1.4,
                                                ),
                                                maxLines: 2,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(height: 12),
                                              Wrap(
                                                spacing: 8,
                                                runSpacing: 8,
                                                children: [
                                                  // Thời gian
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                                    decoration: BoxDecoration(
                                                      color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                                                      borderRadius: BorderRadius.circular(12),
                                                    ),
                                                    child: Row(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        Icon(
                                                          Icons.access_time,
                                                          size: 14,
                                                          color: Theme.of(context).colorScheme.primary,
                                                        ),
                                                        const SizedBox(width: 4),
                                                        Text(
                                                          '${service.duration} phút',
                                                          style: TextStyle(
                                                            color: Theme.of(context).colorScheme.primary,
                                                            fontSize: 12,
                                                            fontWeight: FontWeight.w600,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                  // Lượt xem
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                                    decoration: BoxDecoration(
                                                      color: Colors.blue.withOpacity(0.1),
                                                      borderRadius: BorderRadius.circular(12),
                                                    ),
                                                    child: Row(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        Icon(
                                                          Icons.visibility,
                                                          size: 14,
                                                          color: Colors.blue.shade600,
                                                        ),
                                                        const SizedBox(width: 4),
                                                        Text(
                                                          '${service.viewCount ?? 0} lượt xem',
                                                          style: TextStyle(
                                                            color: Colors.blue.shade600,
                                                            fontSize: 12,
                                                            fontWeight: FontWeight.w600,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                  // Lượt đặt
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                                    decoration: BoxDecoration(
                                                      gradient: LinearGradient(
                                                        colors: [
                                                          Colors.orange.shade600,
                                                          Colors.orange.shade500,
                                                        ],
                                                      ),
                                                      borderRadius: BorderRadius.circular(12),
                                                      boxShadow: [
                                                        BoxShadow(
                                                          color: Colors.orange.withOpacity(0.25),
                                                          blurRadius: 4,
                                                          offset: const Offset(0, 2),
                                                        ),
                                                      ],
                                                    ),
                                                    child: Row(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        const Icon(
                                                          Icons.event_available,
                                                          size: 14,
                                                          color: Colors.white,
                                                        ),
                                                        const SizedBox(width: 4),
                                                        Text(
                                                          '${service.bookingCount ?? 0} lượt đặt',
                                                          style: const TextStyle(
                                                            color: Colors.white,
                                                            fontSize: 12,
                                                            fontWeight: FontWeight.bold,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                  // Giá
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                                    decoration: BoxDecoration(
                                                      gradient: LinearGradient(
                                                        colors: [
                                                          Colors.green.shade600,
                                                          Colors.green.shade500,
                                                        ],
                                                      ),
                                                      borderRadius: BorderRadius.circular(12),
                                                      boxShadow: [
                                                        BoxShadow(
                                                          color: Colors.green.withOpacity(0.25),
                                                          blurRadius: 4,
                                                          offset: const Offset(0, 2),
                                                        ),
                                                      ],
                                                    ),
                                                    child: Row(
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        const Icon(
                                                          Icons.attach_money,
                                                          size: 15,
                                                          color: Colors.white,
                                                        ),
                                                        const SizedBox(width: 2),
                                                        Text(
                                                          _formatCurrency(service.price),
                                                          style: const TextStyle(
                                                            color: Colors.white,
                                                            fontWeight: FontWeight.bold,
                                                            fontSize: 14,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                        
                                        // Enhanced Selection Indicator
                                        if (isSelected)
                                          Container(
                                            padding: const EdgeInsets.all(8),
                                            decoration: BoxDecoration(
                                              color: Theme.of(context).colorScheme.primary,
                                              shape: BoxShape.circle,
                                              boxShadow: [
                                                BoxShadow(
                                                  color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                                                  blurRadius: 8,
                                                  spreadRadius: 2,
                                                ),
                                              ],
                                            ),
                                            child: const Icon(
                                              Icons.check,
                                              color: Colors.white,
                                              size: 20,
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  IconData _getServiceIcon(String category) {
    switch (category.toLowerCase()) {
      case 'grooming':
        return Icons.content_cut;
      case 'medical':
        return Icons.medical_services;
      case 'dental':
        return Icons.medical_services;
      default:
        return Icons.pets;
    }
  }
}

// Placeholder for other steps - will be implemented in next todos
class PetSelectionStep extends StatelessWidget {
  final AppointmentBookingData bookingData;
  final Function(Pet) onPetSelected;

  const PetSelectionStep({
    super.key,
    required this.bookingData,
    required this.onPetSelected,
  });

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text('Pet Selection Step - Coming Soon'),
    );
  }
}

class DateTimeSelectionStep extends StatelessWidget {
  final AppointmentBookingData bookingData;
  final AppointmentService appointmentService;
  final Function(DateTime, TimeSlot, Staff) onDateTimeSelected;

  const DateTimeSelectionStep({
    super.key,
    required this.bookingData,
    required this.appointmentService,
    required this.onDateTimeSelected,
  });

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text('Date Time Selection Step - Coming Soon'),
    );
  }
}

class ConfirmationStep extends StatelessWidget {
  final AppointmentBookingData bookingData;
  final AppointmentService appointmentService;
  final VoidCallback onBookingConfirmed;

  const ConfirmationStep({
    super.key,
    required this.bookingData,
    required this.appointmentService,
    required this.onBookingConfirmed,
  });

  @override
  Widget build(BuildContext context) {
    return ConfirmStep(
      bookingData: bookingData,
    );
  }
}