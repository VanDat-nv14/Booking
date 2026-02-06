import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class TimeProgressBar extends StatefulWidget {
  final DateTime appointmentTime;
  final bool isCompact;
  final String? customLabel;

  const TimeProgressBar({
    super.key,
    required this.appointmentTime,
    this.isCompact = false,
    this.customLabel,
  });

  @override
  State<TimeProgressBar> createState() => _TimeProgressBarState();
}

class _TimeProgressBarState extends State<TimeProgressBar> with TickerProviderStateMixin {
  final Set<int> _notifiedMinutes = {}; // Track which minute notifications were sent
  AnimationController? _pulseController;
  Animation<double>? _pulseAnimation;

  @override
  void initState() {
    super.initState();
    // Initialize pulse animation for urgent notifications
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _pulseAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController!,
      curve: Curves.easeInOut,
    ));
    
    // Update every minute for real-time progress
    _startTimer();
  }

  @override
  void dispose() {
    _pulseController?.dispose();
    super.dispose();
  }

  void _startTimer() {
    Future.delayed(const Duration(minutes: 1), () {
      if (mounted) {
        setState(() {
          // Trigger rebuild to update progress
        });
        _checkAndShowNotification();
        _startTimer();
      }
    });
  }

  void _checkAndShowNotification() {
    final now = DateTime.now();
    final appointmentTime = widget.appointmentTime;
    final timeDiff = appointmentTime.difference(now);
    final totalMinutes = timeDiff.inMinutes;
    
    // Only show notifications for upcoming appointments
    if (totalMinutes <= 0) return;
    
    // Show notification at specific intervals
    if (totalMinutes == 30 && !_notifiedMinutes.contains(30)) {
      _notifiedMinutes.add(30);
      _showNotification(
        '⏰ Nhắc nhở lịch hẹn',
        'Lịch hẹn của bạn sẽ bắt đầu sau 30 phút nữa!',
        Colors.orange,
      );
    } else if (totalMinutes == 5 && !_notifiedMinutes.contains(5)) {
      _notifiedMinutes.add(5);
      _showNotification(
        '🚨 Lịch hẹn sắp bắt đầu!',
        'Lịch hẹn của bạn sẽ bắt đầu sau 5 phút nữa!',
        Colors.red,
      );
    } else if (totalMinutes == 1 && !_notifiedMinutes.contains(1)) {
      _notifiedMinutes.add(1);
      _showNotification(
        '🔥 Lịch hẹn bắt đầu ngay!',
        'Lịch hẹn của bạn sẽ bắt đầu sau 1 phút nữa!',
        Colors.red.shade700,
      );
    }
  }

  void _showNotification(String title, String message, Color color) {
    // Show snackbar notification
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(
                Icons.notifications_active,
                color: Colors.white,
                size: 20,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      message,
                      style: const TextStyle(fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          backgroundColor: color,
          duration: const Duration(seconds: 4),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.all(16),
          action: SnackBarAction(
            label: 'Đóng',
            textColor: Colors.white,
            onPressed: () {
              ScaffoldMessenger.of(context).hideCurrentSnackBar();
            },
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final appointmentTime = widget.appointmentTime;
    
    // Calculate time difference
    final timeDiff = appointmentTime.difference(now);
    final totalMinutes = timeDiff.inMinutes;
    
    // If appointment is in the past, show completion status
    if (totalMinutes <= 0) {
      return _buildPastAppointment();
    }
    
    // Calculate progress based on time until appointment
    final hoursUntilAppointment = totalMinutes / 60;
    double progress = 0.0;
    String timeText = '';
    Color progressColor = Theme.of(context).colorScheme.primary;
    
    if (hoursUntilAppointment <= 1) {
      // Within 1 hour - show minutes progress
      progress = (60 - (totalMinutes % 60)) / 60;
      final minutesLeft = totalMinutes % 60;
      
      // Special styling for urgent times
      if (minutesLeft <= 5) {
        timeText = '🚨 Còn $minutesLeft phút - KHẨN CẤP!';
        progressColor = Colors.red;
        // Start pulsing animation for urgent times
        if (_pulseController != null && !_pulseController!.isAnimating) {
          _pulseController!.repeat(reverse: true);
        }
      } else if (minutesLeft <= 30) {
        timeText = '⏰ Còn $minutesLeft phút - Sắp đến giờ!';
        progressColor = Colors.orange;
        // Stop pulsing animation
        if (_pulseController != null && _pulseController!.isAnimating) {
          _pulseController!.stop();
        }
      } else {
        timeText = 'Còn $minutesLeft phút';
        progressColor = Colors.orange;
        // Stop pulsing animation
        if (_pulseController != null && _pulseController!.isAnimating) {
          _pulseController!.stop();
        }
      }
    } else if (hoursUntilAppointment <= 24) {
      // Within 24 hours - show hours progress
      progress = (24 - hoursUntilAppointment) / 24;
      final hoursLeft = hoursUntilAppointment.floor();
      timeText = 'Còn $hoursLeft giờ';
      progressColor = Theme.of(context).colorScheme.primary;
    } else {
      // More than 24 hours - don't show progress
      return const SizedBox.shrink();
    }
    
    if (widget.isCompact) {
      return _buildCompactProgress(timeText, progress, progressColor);
    } else {
      return _buildFullProgress(timeText, progress, progressColor);
    }
  }

  Widget _buildPastAppointment() {
    return Column(
      children: [
        if (!widget.isCompact) const SizedBox(height: 16),
        Row(
          children: [
            FaIcon(
              FontAwesomeIcons.clock,
              size: widget.isCompact ? 12 : 14,
              color: Colors.green,
            ),
            const SizedBox(width: 8),
            Text(
              'Lịch hẹn đã đến giờ',
              style: TextStyle(
                fontSize: widget.isCompact ? 12 : 14,
                fontWeight: FontWeight.w600,
                color: Colors.green.shade700,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCompactProgress(String timeText, double progress, Color progressColor) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              FaIcon(
                FontAwesomeIcons.clock,
                size: 12,
                color: progressColor,
              ),
              const SizedBox(width: 6),
              AnimatedBuilder(
                animation: _pulseAnimation ?? const AlwaysStoppedAnimation(1.0),
                builder: (context, child) {
                  return Transform.scale(
                    scale: (_pulseController != null && _pulseController!.isAnimating) 
                        ? (_pulseAnimation?.value ?? 1.0) 
                        : 1.0,
                    child: Text(
                      timeText,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: progressColor,
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 4),
          Container(
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade200,
              borderRadius: BorderRadius.circular(2),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: progress.clamp(0.0, 1.0),
              child: AnimatedBuilder(
                animation: _pulseAnimation ?? const AlwaysStoppedAnimation(1.0),
                builder: (context, child) {
                  return Transform.scale(
                    scale: (_pulseController != null && _pulseController!.isAnimating) 
                        ? (_pulseAnimation?.value ?? 1.0) 
                        : 1.0,
                    child: Container(
                      decoration: BoxDecoration(
                        color: progressColor,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFullProgress(String timeText, double progress, Color progressColor) {
    return Column(
      children: [
        const SizedBox(height: 16),
        Row(
          children: [
            FaIcon(
              FontAwesomeIcons.clock,
              size: 14,
              color: progressColor,
            ),
            const SizedBox(width: 8),
            AnimatedBuilder(
              animation: _pulseAnimation ?? const AlwaysStoppedAnimation(1.0),
              builder: (context, child) {
                return Transform.scale(
                  scale: (_pulseController != null && _pulseController!.isAnimating) 
                      ? (_pulseAnimation?.value ?? 1.0) 
                      : 1.0,
                  child: Text(
                    timeText,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: progressColor,
                    ),
                  ),
                );
              },
            ),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          height: 6,
          decoration: BoxDecoration(
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.circular(3),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: progress.clamp(0.0, 1.0),
            child: AnimatedBuilder(
              animation: _pulseAnimation ?? const AlwaysStoppedAnimation(1.0),
              builder: (context, child) {
                return Transform.scale(
                  scale: (_pulseController != null && _pulseController!.isAnimating) 
                      ? (_pulseAnimation?.value ?? 1.0) 
                      : 1.0,
                  child: Container(
                    decoration: BoxDecoration(
                      color: progressColor,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          widget.customLabel ?? 'Thời gian đến lịch hẹn',
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }
}
