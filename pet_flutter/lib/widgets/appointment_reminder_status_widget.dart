import 'dart:async';
import 'package:flutter/material.dart';
import 'package:pet_flutter/models/reminder_status.dart';
import 'package:pet_flutter/services/appointment_reminder_service.dart';

/// Widget hiển thị trạng thái gửi reminder với countdown realtime
class AppointmentReminderStatusWidget extends StatefulWidget {
  final String appointmentId;
  final DateTime appointmentTime;
  final String? petName;
  final String? serviceName;
  final String? userId;

  const AppointmentReminderStatusWidget({
    super.key,
    required this.appointmentId,
    required this.appointmentTime,
    this.petName,
    this.serviceName,
    this.userId,
  });

  @override
  State<AppointmentReminderStatusWidget> createState() => _AppointmentReminderStatusWidgetState();
}

class _AppointmentReminderStatusWidgetState extends State<AppointmentReminderStatusWidget> {
  final _reminderService = AppointmentReminderService();
  Timer? _countdownTimer;
  ReminderStatusModel? _status;
  StreamSubscription? _statusSubscription;

  @override
  void initState() {
    super.initState();
    _initializeReminder();
    _startCountdownTimer();
    _listenToStatusChanges();
  }

  Future<void> _initializeReminder() async {
    // Kiểm tra xem đã có reminder được schedule chưa
    var status = _reminderService.getStatus(widget.appointmentId);
    
    if (status == null) {
      // Nếu chưa có, tự động schedule reminder
      await _reminderService.scheduleReminders(
        appointmentId: widget.appointmentId,
        appointmentTime: widget.appointmentTime,
        petName: widget.petName ?? 'Khách hàng',
        serviceName: widget.serviceName ?? 'Dịch vụ',
        userId: widget.userId,
      );
      
      // Load lại status sau khi schedule
      status = _reminderService.getStatus(widget.appointmentId);
    }
    
    setState(() {
      _status = status;
    });
  }

  void _listenToStatusChanges() {
    _statusSubscription = _reminderService.statusStream.listen((status) {
      if (status.appointmentId == widget.appointmentId) {
        setState(() {
          _status = status;
        });
      }
    });
  }

  void _startCountdownTimer() {
    // Update UI mỗi giây để hiển thị countdown realtime
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {});
      }
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _statusSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_status == null) {
      return const SizedBox.shrink();
    }

    final now = DateTime.now();
    final timeUntil = widget.appointmentTime.difference(now);

    // Nếu lịch hẹn đã qua
    if (timeUntil.isNegative) {
      return _buildCompletedCard();
    }

    return Card(
      margin: const EdgeInsets.all(16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                const Icon(Icons.notifications_active, color: Color(0xFF304FFE)),
                const SizedBox(width: 8),
                const Text(
                  'Trạng thái nhắc nhở',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                _buildProgressBadge(),
              ],
            ),
            const SizedBox(height: 16),

            // Progress bar
            _buildProgressBar(),
            const SizedBox(height: 16),

            // Reminder status list
            _buildReminderItem(
              icon: Icons.access_time,
              title: '1 tiếng trước',
              status: _status!.oneHourStatus,
              sentAt: _status!.oneHourSentAt,
              timeUntil: timeUntil,
              targetMinutes: 60,
            ),
            const SizedBox(height: 12),
            _buildReminderItem(
              icon: Icons.timer,
              title: '30 phút trước',
              status: _status!.thirtyMinuteStatus,
              sentAt: _status!.thirtyMinuteSentAt,
              timeUntil: timeUntil,
              targetMinutes: 30,
            ),
            const SizedBox(height: 12),
            _buildReminderItem(
              icon: Icons.alarm,
              title: '10 phút trước',
              status: _status!.tenMinuteStatus,
              sentAt: _status!.tenMinuteSentAt,
              timeUntil: timeUntil,
              targetMinutes: 10,
            ),
            const SizedBox(height: 12),
            _buildReminderItem(
              icon: Icons.notifications,
              title: 'Đúng giờ',
              status: _status!.onTimeStatus,
              sentAt: _status!.onTimeSentAt,
              timeUntil: timeUntil,
              targetMinutes: 0,
            ),

            // Next reminder info
            if (_status!.getNextReminderText() != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.blue.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.schedule, color: Colors.blue, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _status!.getNextReminderText()!,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Colors.blue,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildProgressBadge() {
    final sentCount = _status!.getSentCount();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: _status!.isCompleted ? Colors.green : Colors.orange,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        '$sentCount/4',
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildProgressBar() {
    final progress = _status!.getProgress();
    return Column(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 8,
            backgroundColor: Colors.grey.shade200,
            valueColor: AlwaysStoppedAnimation<Color>(
              _status!.isCompleted ? Colors.green : const Color(0xFF304FFE),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildReminderItem({
    required IconData icon,
    required String title,
    required ReminderStatus status,
    required DateTime? sentAt,
    required Duration timeUntil,
    required int targetMinutes,
  }) {
    Color statusColor;
    String statusText;
    Widget? trailing;

    switch (status) {
      case ReminderStatus.sent:
        statusColor = Colors.green;
        statusText = 'Đã gửi';
        if (sentAt != null) {
          final timeSinceSent = DateTime.now().difference(sentAt);
          trailing = Text(
            '${timeSinceSent.inMinutes}p trước',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade600,
            ),
          );
        }
        break;
      case ReminderStatus.skipped:
        statusColor = Colors.grey;
        statusText = 'Đã bỏ qua';
        break;
      case ReminderStatus.pending:
        final minutesUntilTarget = timeUntil.inMinutes - targetMinutes;
        if (minutesUntilTarget <= 0) {
          statusColor = Colors.orange;
          statusText = 'Đang gửi...';
        } else {
          statusColor = Colors.blue;
          statusText = 'Chờ gửi';
          trailing = _buildCountdown(minutesUntilTarget);
        }
    }

    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: statusColor, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                statusText,
                style: TextStyle(
                  fontSize: 12,
                  color: statusColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        if (trailing != null) trailing,
      ],
    );
  }

  Widget _buildCountdown(int minutes) {
    if (minutes <= 0) {
      return const SizedBox.shrink();
    }

    String countdownText;
    if (minutes < 60) {
      countdownText = '${minutes}p';
    } else {
      final hours = minutes ~/ 60;
      final remainingMinutes = minutes % 60;
      if (remainingMinutes == 0) {
        countdownText = '${hours}h';
      } else {
        countdownText = '${hours}h ${remainingMinutes}p';
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Text(
        countdownText,
        style: const TextStyle(
          fontSize: 12,
          color: Colors.blue,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildCompletedCard() {
    return Card(
      margin: const EdgeInsets.all(16),
      elevation: 2,
      color: Colors.green.shade50,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green.shade100,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle, color: Colors.green, size: 32),
            ),
            const SizedBox(width: 16),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Lịch hẹn đã hoàn tất',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.green,
                    ),
                  ),
                  SizedBox(height: 4),
                      Text(
                        'Đã gửi đầy đủ 4 thông báo nhắc nhở',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.black54,
                        ),
                      ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
