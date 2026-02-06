import 'package:flutter/material.dart';
import 'appointment.dart';

class TimeSlot {
  final String id;
  final DateTime startTime;
  final DateTime endTime;
  bool isAvailable;
  bool isPetBusy;
  bool isStaffBusy;
  final String? unavailableReason;
  final int? appointmentId;
  final String? petName;
  final String? staffName;

  TimeSlot({
    required this.id,
    required this.startTime,
    required this.endTime,
    this.isAvailable = true,
    this.isPetBusy = false,
    this.isStaffBusy = false,
    this.unavailableReason,
    this.appointmentId,
    this.petName,
    this.staffName,
  });

  factory TimeSlot.fromJson(Map<String, dynamic> json) {
    return TimeSlot(
      id: json['id'] ?? '${json['startTime']}_${json['endTime']}',
      startTime: DateTime.parse(json['startTime']),
      endTime: DateTime.parse(json['endTime']),
      isAvailable: json['isAvailable'] ?? true,
      isPetBusy: json['isPetBusy'] ?? false,
      isStaffBusy: json['isStaffBusy'] ?? false,
      unavailableReason: json['unavailableReason'],
      appointmentId: json['appointmentId'],
      petName: json['petName'],
      staffName: json['staffName'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime.toIso8601String(),
      'isAvailable': isAvailable,
      'isPetBusy': isPetBusy,
      'isStaffBusy': isStaffBusy,
      'unavailableReason': unavailableReason,
      'appointmentId': appointmentId,
      'petName': petName,
      'staffName': staffName,
    };
  }

  String get formattedTime {
    return '${_formatTime(startTime)} - ${_formatTime(endTime)}';
  }

  String _formatTime(DateTime time) {
    String hour = time.hour.toString().padLeft(2, '0');
    String minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  Color get statusColor {
    if (!isAvailable) {
      if (isPetBusy) return Colors.orange;
      if (isStaffBusy) return Colors.red;
      return Colors.grey;
    }
    return Colors.green;
  }

  String get statusText {
    if (!isAvailable) {
      if (isPetBusy) return 'Thú cưng bận';
      if (isStaffBusy) return 'Nhân viên bận';
      return 'Không khả dụng';
    }
    return 'Có thể đặt';
  }

  TimeSlot copyWith({
    String? id,
    DateTime? startTime,
    DateTime? endTime,
    bool? isAvailable,
    bool? isPetBusy,
    bool? isStaffBusy,
    String? unavailableReason,
    int? appointmentId,
    String? petName,
    String? staffName,
  }) {
    return TimeSlot(
      id: id ?? this.id,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      isAvailable: isAvailable ?? this.isAvailable,
      isPetBusy: isPetBusy ?? this.isPetBusy,
      isStaffBusy: isStaffBusy ?? this.isStaffBusy,
      unavailableReason: unavailableReason ?? this.unavailableReason,
      appointmentId: appointmentId ?? this.appointmentId,
      petName: petName ?? this.petName,
      staffName: staffName ?? this.staffName,
    );
  }
}

class BookingStep {
  final int stepNumber;
  final String title;
  final String description;
  final IconData icon;
  final bool isCompleted;
  final bool isActive;

  BookingStep({
    required this.stepNumber,
    required this.title,
    required this.description,
    required this.icon,
    this.isCompleted = false,
    this.isActive = false,
  });

  BookingStep copyWith({
    int? stepNumber,
    String? title,
    String? description,
    IconData? icon,
    bool? isCompleted,
    bool? isActive,
  }) {
    return BookingStep(
      stepNumber: stepNumber ?? this.stepNumber,
      title: title ?? this.title,
      description: description ?? this.description,
      icon: icon ?? this.icon,
      isCompleted: isCompleted ?? this.isCompleted,
      isActive: isActive ?? this.isActive,
    );
  }
}

enum AppointmentStatus {
  pending,
  confirmed,
  inProgress,
  completed,
  cancelled,
  noShow,
}

extension AppointmentStatusExtension on AppointmentStatus {
  String get displayName {
    switch (this) {
      case AppointmentStatus.pending:
        return 'Chờ xác nhận';
      case AppointmentStatus.confirmed:
        return 'Đã xác nhận';
      case AppointmentStatus.inProgress:
        return 'Đang thực hiện';
      case AppointmentStatus.completed:
        return 'Hoàn thành';
      case AppointmentStatus.cancelled:
        return 'Đã hủy';
      case AppointmentStatus.noShow:
        return 'Không đến';
    }
  }

  Color get color {
    switch (this) {
      case AppointmentStatus.pending:
        return Colors.orange;
      case AppointmentStatus.confirmed:
        return Colors.blue;
      case AppointmentStatus.inProgress:
        return Colors.purple;
      case AppointmentStatus.completed:
        return Colors.green;
      case AppointmentStatus.cancelled:
        return Colors.red;
      case AppointmentStatus.noShow:
        return Colors.grey;
    }
  }

  String get apiValue {
    switch (this) {
      case AppointmentStatus.pending:
        return 'Pending';
      case AppointmentStatus.confirmed:
        return 'Confirmed';
      case AppointmentStatus.inProgress:
        return 'InProgress';
      case AppointmentStatus.completed:
        return 'Completed';
      case AppointmentStatus.cancelled:
        return 'Cancelled';
      case AppointmentStatus.noShow:
        return 'NoShow';
    }
  }

  static AppointmentStatus fromString(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return AppointmentStatus.pending;
      case 'confirmed':
        return AppointmentStatus.confirmed;
      case 'inprogress':
        return AppointmentStatus.inProgress;
      case 'completed':
        return AppointmentStatus.completed;
      case 'cancelled':
        return AppointmentStatus.cancelled;
      case 'noshow':
        return AppointmentStatus.noShow;
      default:
        return AppointmentStatus.pending;
    }
  }
}

class AppointmentBookingData {
  Service? selectedService;
  Pet? selectedPet;
  Staff? selectedStaff;
  DateTime? selectedDate;
  TimeSlot? selectedTimeSlot;
  String? notes;
  String? paymentMethod;

  AppointmentBookingData({
    this.selectedService,
    this.selectedPet,
    this.selectedStaff,
    this.selectedDate,
    this.selectedTimeSlot,
    this.notes,
    this.paymentMethod,
  });

  bool get isStep1Complete => selectedService != null;
  bool get isStep2Complete => selectedPet != null;
  bool get isStep3Complete => 
      selectedDate != null && selectedTimeSlot != null && selectedStaff != null;
  bool get isAllStepsComplete => 
      isStep1Complete && isStep2Complete && isStep3Complete;

  double get totalAmount => selectedService?.price ?? 0.0;

  Map<String, dynamic> toJson() {
    return {
      'petId': selectedPet?.petId,
      'serviceId': selectedService?.serviceId,
      'staffId': selectedStaff?.staffId,
      'appointmentDate': selectedTimeSlot?.startTime.toIso8601String(),
      'notes': (notes != null && notes!.isNotEmpty) ? notes : '', // Gửi empty string thay vì null
      'totalAmount': totalAmount,
      'paymentMethod': paymentMethod,
      'status': 'Pending',
    };
  }

  void reset() {
    selectedService = null;
    selectedPet = null;
    selectedStaff = null;
    selectedDate = null;
    selectedTimeSlot = null;
    notes = null;
    paymentMethod = null;
  }

  AppointmentBookingData copyWith({
    Service? selectedService,
    Pet? selectedPet,
    Staff? selectedStaff,
    DateTime? selectedDate,
    TimeSlot? selectedTimeSlot,
    String? notes,
    String? paymentMethod,
  }) {
    return AppointmentBookingData(
      selectedService: selectedService ?? this.selectedService,
      selectedPet: selectedPet ?? this.selectedPet,
      selectedStaff: selectedStaff ?? this.selectedStaff,
      selectedDate: selectedDate ?? this.selectedDate,
      selectedTimeSlot: selectedTimeSlot ?? this.selectedTimeSlot,
      notes: notes ?? this.notes,
      paymentMethod: paymentMethod ?? this.paymentMethod,
    );
  }
}