import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:pet_flutter/utils/onesignal_notification_helper.dart';
import 'package:pet_flutter/models/reminder_status.dart';

class AppointmentReminderService {
  static final AppointmentReminderService _instance = AppointmentReminderService._internal();
  factory AppointmentReminderService() => _instance;
  AppointmentReminderService._internal();

  final Map<String, List<Timer>> _activeTimers = {};
  final Map<String, ReminderStatusModel> _reminderStatuses = {};
  
  // Stream controller để broadcast status changes
  final _statusController = StreamController<ReminderStatusModel>.broadcast();
  Stream<ReminderStatusModel> get statusStream => _statusController.stream;

  /// Lấy status hiện tại của appointment
  ReminderStatusModel? getStatus(String appointmentId) {
    return _reminderStatuses[appointmentId];
  }

  /// Update reminder status
  void _updateReminderStatus(String appointmentId, int minutesUntil, {bool skipped = false}) {
    final status = _reminderStatuses[appointmentId];
    if (status == null) return;

    ReminderStatusModel updatedStatus;
    final now = DateTime.now();

    if (minutesUntil == 60) {
      updatedStatus = status.copyWith(
        oneHourStatus: skipped ? ReminderStatus.skipped : ReminderStatus.sent,
        oneHourSentAt: skipped ? null : now,
      );
    } else if (minutesUntil == 30) {
      updatedStatus = status.copyWith(
        thirtyMinuteStatus: skipped ? ReminderStatus.skipped : ReminderStatus.sent,
        thirtyMinuteSentAt: skipped ? null : now,
      );
    } else if (minutesUntil == 10) {
      updatedStatus = status.copyWith(
        tenMinuteStatus: skipped ? ReminderStatus.skipped : ReminderStatus.sent,
        tenMinuteSentAt: skipped ? null : now,
      );
    } else {
      // on-time (0 minute)
      updatedStatus = status.copyWith(
        onTimeStatus: skipped ? ReminderStatus.skipped : ReminderStatus.sent,
        onTimeSentAt: skipped ? null : now,
      );
    }

    _reminderStatuses[appointmentId] = updatedStatus;
    _statusController.add(updatedStatus);

    debugPrint('📊 [Reminder] Status updated for $appointmentId: ${updatedStatus.getSentCount()}/4 sent');
  }

  /// Thiết lập nhắc nhở cho một lịch hẹn
  Future<void> scheduleReminders({
    required String appointmentId,
    required DateTime appointmentTime,
    required String petName,
    required String serviceName,
    String? userId,
  }) async {
    // Hủy các reminder cũ nếu có
    cancelReminders(appointmentId);

    final now = DateTime.now();
    final timers = <Timer>[];

    // Tạo status model ban đầu
    final statusModel = ReminderStatusModel(
      appointmentId: appointmentId,
      appointmentTime: appointmentTime,
    );
    _reminderStatuses[appointmentId] = statusModel;
    _statusController.add(statusModel);

    // Tính thời gian còn lại
    final timeUntilAppointment = appointmentTime.difference(now);

    debugPrint('📅 [Reminder] Scheduling reminders for appointment: $appointmentId');
    debugPrint('   Time until appointment: ${timeUntilAppointment.inMinutes} minutes');

    // Reminder 1: 1 tiếng trước
    final oneHourBefore = timeUntilAppointment - const Duration(hours: 1);
    if (oneHourBefore.isNegative == false && oneHourBefore.inSeconds > 0) {
      debugPrint('⏰ [Reminder] Scheduling 1-hour reminder in ${oneHourBefore.inMinutes} minutes');
      timers.add(Timer(oneHourBefore, () {
        _sendReminder(
          appointmentId: appointmentId,
          petName: petName,
          serviceName: serviceName,
          minutesUntil: 60,
          userId: userId,
        );
        _updateReminderStatus(appointmentId, 60);
      }));
    } else {
      debugPrint('⚠️ [Reminder] 1-hour reminder skipped');
      _updateReminderStatus(appointmentId, 60, skipped: true);
    }

    // Reminder 2: 30 phút trước
    final thirtyMinutesBefore = timeUntilAppointment - const Duration(minutes: 30);
    if (thirtyMinutesBefore.isNegative == false && thirtyMinutesBefore.inSeconds > 0) {
      debugPrint('⏰ [Reminder] Scheduling 30-minute reminder in ${thirtyMinutesBefore.inMinutes} minutes');
      timers.add(Timer(thirtyMinutesBefore, () {
        _sendReminder(
          appointmentId: appointmentId,
          petName: petName,
          serviceName: serviceName,
          minutesUntil: 30,
          userId: userId,
        );
        _updateReminderStatus(appointmentId, 30);
      }));
    } else {
      debugPrint('⚠️ [Reminder] 30-minute reminder skipped');
      _updateReminderStatus(appointmentId, 30, skipped: true);
    }

    // Reminder 3: 10 phút trước
    final tenMinutesBefore = timeUntilAppointment - const Duration(minutes: 10);
    if (tenMinutesBefore.isNegative == false && tenMinutesBefore.inSeconds > 0) {
      debugPrint('⏰ [Reminder] Scheduling 10-minute reminder in ${tenMinutesBefore.inMinutes} minutes');
      timers.add(Timer(tenMinutesBefore, () {
        _sendReminder(
          appointmentId: appointmentId,
          petName: petName,
          serviceName: serviceName,
          minutesUntil: 10,
          userId: userId,
        );
        _updateReminderStatus(appointmentId, 10);
      }));
    } else {
      debugPrint('⚠️ [Reminder] 10-minute reminder skipped');
      _updateReminderStatus(appointmentId, 10, skipped: true);
    }

    // Reminder 4: On-time (at appointment start)
    final atAppointment = timeUntilAppointment;
    if (atAppointment.isNegative == false && atAppointment.inSeconds > 0) {
      debugPrint('⏰ [Reminder] Scheduling on-time reminder in ${atAppointment.inMinutes} minutes');
      timers.add(Timer(atAppointment, () {
        _sendReminder(
          appointmentId: appointmentId,
          petName: petName,
          serviceName: serviceName,
          minutesUntil: 0,
          userId: userId,
        );
        _updateReminderStatus(appointmentId, 0);
      }));
    } else {
      debugPrint('⚠️ [Reminder] On-time reminder skipped');
      _updateReminderStatus(appointmentId, 0, skipped: true);
    }

    // Lưu timers
    if (timers.isNotEmpty) {
      _activeTimers[appointmentId] = timers;
      debugPrint('✅ [Reminder] Scheduled ${timers.length} reminders');
    }
  }

  /// Gửi thông báo nhắc nhở
  Future<void> _sendReminder({
    required String appointmentId,
    required String petName,
    required String serviceName,
    required int minutesUntil,
    String? userId,
  }) async {
    debugPrint('🔔 [Reminder] Sending reminder: $minutesUntil minutes');

    String title;
    String message;

    if (minutesUntil == 60) {
      title = '⏰ Nhắc lịch hẹn - Còn 1 tiếng!';
      message = 'Lịch hẹn "$serviceName" cho $petName sẽ bắt đầu trong 1 tiếng. Hãy chuẩn bị nhé!';
    } else if (minutesUntil == 30) {
      title = '⏳ Nhắc lịch hẹn - Còn 30 phút!';
      message = 'Lịch hẹn "$serviceName" cho $petName sẽ bắt đầu trong 30 phút. Đừng quên nhé!';
    } else if (minutesUntil == 10) {
      title = '🚨 Nhắc lịch hẹn - Còn 10 phút!';
      message = 'Lịch hẹn "$serviceName" cho $petName sắp bắt đầu! Hãy đến đúng giờ nhé!';
    } else {
      // on-time
      title = '🔔 Lịch hẹn bắt đầu ngay bây giờ!';
      message = 'Lịch hẹn "$serviceName" cho $petName đang bắt đầu. Vui lòng tới đúng giờ.';
    }

    try {
      if (userId != null) {
        await OneSignalNotificationHelper.sendNotificationToUser(
          userId: userId,
          title: title,
          message: message,
          data: {
            'type': 'appointment_reminder',
            'appointment_id': appointmentId,
            'minutes_until': minutesUntil.toString(),
          },
        );
      } else {
        await OneSignalNotificationHelper.sendNotificationToAll(
          title: title,
          message: message,
          data: {
            'type': 'appointment_reminder',
            'appointment_id': appointmentId,
            'minutes_until': minutesUntil.toString(),
          },
        );
      }
      debugPrint('✅ [Reminder] Notification sent');
    } catch (e) {
      debugPrint('❌ [Reminder] Failed: $e');
    }
  }

  void cancelReminders(String appointmentId) {
    final timers = _activeTimers[appointmentId];
    if (timers != null) {
      for (var timer in timers) {
        timer.cancel();
      }
      _activeTimers.remove(appointmentId);
      _reminderStatuses.remove(appointmentId);
    }
  }

  void cancelAllReminders() {
    for (var timers in _activeTimers.values) {
      for (var timer in timers) {
        timer.cancel();
      }
    }
    _activeTimers.clear();
    _reminderStatuses.clear();
  }

  int get activeReminderCount => _activeTimers.length;

  bool hasActiveReminders(String appointmentId) {
    return _activeTimers.containsKey(appointmentId);
  }
  
  void dispose() {
    _statusController.close();
  }
}
