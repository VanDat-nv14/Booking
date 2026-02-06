/// Trạng thái của từng reminder
enum ReminderStatus {
  pending,   // Chưa đến giờ gửi
  sent,      // Đã gửi
  skipped,   // Bỏ qua (quá muộn)
}

/// Model theo dõi trạng thái gửi reminder
class ReminderStatusModel {
  final String appointmentId;
  final DateTime appointmentTime;
  
  ReminderStatus oneHourStatus;
  DateTime? oneHourSentAt;
  
  ReminderStatus thirtyMinuteStatus;
  DateTime? thirtyMinuteSentAt;
  
  ReminderStatus tenMinuteStatus;
  DateTime? tenMinuteSentAt;
  
  ReminderStatus onTimeStatus;
  DateTime? onTimeSentAt;

  ReminderStatusModel({
    required this.appointmentId,
    required this.appointmentTime,
    this.oneHourStatus = ReminderStatus.pending,
    this.oneHourSentAt,
    this.thirtyMinuteStatus = ReminderStatus.pending,
    this.thirtyMinuteSentAt,
    this.tenMinuteStatus = ReminderStatus.pending,
    this.tenMinuteSentAt,
    this.onTimeStatus = ReminderStatus.pending,
    this.onTimeSentAt,
  });

  /// Kiểm tra xem reminder nào sẽ được gửi tiếp theo
  String? getNextReminderText() {
    final now = DateTime.now();
    final timeUntil = appointmentTime.difference(now);

    if (timeUntil.isNegative) {
      return 'Lịch hẹn đã qua';
    }

    // Chưa gửi 1 giờ
    if (oneHourStatus == ReminderStatus.pending) {
      if (timeUntil.inMinutes >= 60) {
        return 'Sẽ nhắc sau ${timeUntil.inMinutes - 60} phút';
      } else {
        return 'Chuẩn bị gửi nhắc 1 giờ...';
      }
    }

    // Đã gửi 1 giờ, chờ 30 phút
    if (oneHourStatus == ReminderStatus.sent && 
        thirtyMinuteStatus == ReminderStatus.pending) {
      if (timeUntil.inMinutes >= 30) {
        return 'Tiếp theo: Nhắc 30 phút (còn ${timeUntil.inMinutes - 30} phút)';
      } else {
        return 'Chuẩn bị gửi nhắc 30 phút...';
      }
    }

    // Đã gửi 30 phút, chờ 10 phút
    if (thirtyMinuteStatus == ReminderStatus.sent && 
        tenMinuteStatus == ReminderStatus.pending) {
      if (timeUntil.inMinutes >= 10) {
        return 'Tiếp theo: Nhắc 10 phút (còn ${timeUntil.inMinutes - 10} phút)';
      } else {
        return 'Chuẩn bị gửi nhắc 10 phút...';
      }
    }

    // Đã gửi 10 phút, chờ đúng giờ
    if (tenMinuteStatus == ReminderStatus.sent &&
        onTimeStatus == ReminderStatus.pending) {
      if (timeUntil.inMinutes >= 0) {
        return 'Tiếp theo: Nhắc đúng giờ (còn ${timeUntil.inMinutes} phút)';
      } else {
        return 'Chuẩn bị gửi nhắc đúng giờ...';
      }
    }

    // Đã gửi hết
    if (onTimeStatus == ReminderStatus.sent) {
      return 'Đã gửi đầy đủ 4 thông báo ✅';
    }

    return null;
  }

  /// Lấy progress (0.0 - 1.0)
  double getProgress() {
    int completed = 0;
    if (oneHourStatus == ReminderStatus.sent) completed++;
    if (thirtyMinuteStatus == ReminderStatus.sent) completed++;
    if (tenMinuteStatus == ReminderStatus.sent) completed++;
    if (onTimeStatus == ReminderStatus.sent) completed++;
    return completed / 4.0;
  }

  /// Lấy số lượng đã gửi
  int getSentCount() {
    int count = 0;
    if (oneHourStatus == ReminderStatus.sent) count++;
    if (thirtyMinuteStatus == ReminderStatus.sent) count++;
    if (tenMinuteStatus == ReminderStatus.sent) count++;
    if (onTimeStatus == ReminderStatus.sent) count++;
    return count;
  }

  /// Kiểm tra đã gửi hết chưa
  bool get isCompleted => getSentCount() == 4;

  /// Copy with
  ReminderStatusModel copyWith({
    ReminderStatus? oneHourStatus,
    DateTime? oneHourSentAt,
    ReminderStatus? thirtyMinuteStatus,
    DateTime? thirtyMinuteSentAt,
    ReminderStatus? tenMinuteStatus,
    DateTime? tenMinuteSentAt,
    ReminderStatus? onTimeStatus,
    DateTime? onTimeSentAt,
  }) {
    return ReminderStatusModel(
      appointmentId: appointmentId,
      appointmentTime: appointmentTime,
      oneHourStatus: oneHourStatus ?? this.oneHourStatus,
      oneHourSentAt: oneHourSentAt ?? this.oneHourSentAt,
      thirtyMinuteStatus: thirtyMinuteStatus ?? this.thirtyMinuteStatus,
      thirtyMinuteSentAt: thirtyMinuteSentAt ?? this.thirtyMinuteSentAt,
      tenMinuteStatus: tenMinuteStatus ?? this.tenMinuteStatus,
      tenMinuteSentAt: tenMinuteSentAt ?? this.tenMinuteSentAt,
      onTimeStatus: onTimeStatus ?? this.onTimeStatus,
      onTimeSentAt: onTimeSentAt ?? this.onTimeSentAt,
    );
  }
}
