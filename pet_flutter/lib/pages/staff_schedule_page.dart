import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../services/secure_storage.dart';
import '../services/staff_service.dart';
import 'dart:convert';

class StaffSchedulePage extends StatefulWidget {
  const StaffSchedulePage({super.key});

  @override
  State<StaffSchedulePage> createState() => _StaffSchedulePageState();
}

class _StaffSchedulePageState extends State<StaffSchedulePage> {
  final SecureStorageService _storage = SecureStorageService();
  final StaffService _staffService = StaffService();
  
  String? _staffName;
  int? _staffId;
  DateTime _selectedDate = DateTime.now();
  bool _loading = false;

  // Mock schedule data - in real app, this would come from API
  final Map<String, List<ScheduleItem>> _weeklySchedule = {
    'Monday': [
      ScheduleItem('08:00', '12:00', 'Ca sáng', 'Khám tổng quát', true),
      ScheduleItem('14:00', '18:00', 'Ca chiều', 'Phẫu thuật', true),
    ],
    'Tuesday': [
      ScheduleItem('08:00', '12:00', 'Ca sáng', 'Khám chuyên khoa', true),
      ScheduleItem('14:00', '18:00', 'Ca chiều', 'Điều trị', true),
    ],
    'Wednesday': [
      ScheduleItem('08:00', '12:00', 'Ca sáng', 'Khám tổng quát', true),
      ScheduleItem('19:00', '21:00', 'Ca tối', 'Cấp cứu', false),
    ],
    'Thursday': [
      ScheduleItem('08:00', '12:00', 'Ca sáng', 'Khám chuyên khoa', true),
      ScheduleItem('14:00', '18:00', 'Ca chiều', 'Phẫu thuật', true),
    ],
    'Friday': [
      ScheduleItem('08:00', '12:00', 'Ca sáng', 'Khám tổng quát', true),
      ScheduleItem('14:00', '18:00', 'Ca chiều', 'Điều trị', true),
    ],
    'Saturday': [
      ScheduleItem('08:00', '12:00', 'Ca sáng', 'Khám tổng quát', true),
    ],
    'Sunday': [], // Day off
  };

  @override
  void initState() {
    super.initState();
    _loadStaffInfo();
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
        
        // Load schedule data từ API nếu có staffId
        if (_staffId != null) {
          await _loadScheduleFromAPI();
        }
      } catch (e) {
        print('Could not load staff info from API: $e');
        // Tiếp tục với mock data
      }
    } catch (e) {
      print('Error loading staff info: $e');
    }
  }

  Future<void> _loadScheduleFromAPI() async {
    if (_staffId == null) return;
    
    try {
      setState(() => _loading = true);
      
      final now = DateTime.now();
      final scheduleData = await _staffService.getStaffSchedule(_staffId!, now.month, now.year);
      
      // Process API data and update _weeklySchedule if needed
      // For now, we'll keep using mock data as fallback
      print('Loaded schedule data from API: $scheduleData');
      
    } catch (e) {
      print('Error loading schedule from API: $e');
      // Continue with mock data
    } finally {
      setState(() => _loading = false);
    }
  }

  String _getDayName(DateTime date) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[date.weekday - 1];
  }

  String _getDayNameVietnamese(DateTime date) {
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    return days[date.weekday - 1];
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
                                FontAwesomeIcons.calendar,
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
                                    'Lịch làm việc',
                                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    'Xem lịch làm việc của ${_staffName ?? 'bạn'}',
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: Colors.white.withOpacity(0.9),
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
                ),
              ),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: Column(
              children: [
                const SizedBox(height: 16),
                _buildDateSelector(),
                const SizedBox(height: 24),
                _buildTodaySchedule(),
                const SizedBox(height: 24),
                _buildWeeklyOverview(),
                const SizedBox(height: 24),
                _buildScheduleStats(),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateSelector() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Chọn ngày',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () {
                  setState(() {
                    _selectedDate = DateTime.now();
                  });
                },
                child: const Text('Hôm nay'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 80,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: 14, // Show 2 weeks
              itemBuilder: (context, index) {
                final date = DateTime.now().add(Duration(days: index - 7));
                final isSelected = date.day == _selectedDate.day &&
                    date.month == _selectedDate.month &&
                    date.year == _selectedDate.year;
                final isToday = date.day == DateTime.now().day &&
                    date.month == DateTime.now().month &&
                    date.year == DateTime.now().year;

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedDate = date;
                    });
                  },
                  child: Container(
                    width: 60,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? Theme.of(context).colorScheme.primary
                          : isToday
                              ? Theme.of(context).colorScheme.primary.withOpacity(0.1)
                              : Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected
                            ? Theme.of(context).colorScheme.primary
                            : isToday
                                ? Theme.of(context).colorScheme.primary
                                : Colors.grey.shade200,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          _getDayNameVietnamese(date).substring(0, 2),
                          style: TextStyle(
                            color: isSelected
                                ? Colors.white
                                : isToday
                                    ? Theme.of(context).colorScheme.primary
                                    : Colors.grey.shade600,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          date.day.toString(),
                          style: TextStyle(
                            color: isSelected
                                ? Colors.white
                                : isToday
                                    ? Theme.of(context).colorScheme.primary
                                    : Colors.black87,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
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

  Widget _buildTodaySchedule() {
    final dayName = _getDayName(_selectedDate);
    final schedule = _weeklySchedule[dayName] ?? [];
    final isToday = _selectedDate.day == DateTime.now().day &&
        _selectedDate.month == DateTime.now().month &&
        _selectedDate.year == DateTime.now().year;

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
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: FaIcon(
                  FontAwesomeIcons.calendarDay,
                  color: Theme.of(context).colorScheme.primary,
                  size: 16,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isToday ? 'Lịch làm việc hôm nay' : 'Lịch làm việc',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '${_getDayNameVietnamese(_selectedDate)}, ${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          if (schedule.isEmpty)
            Center(
              child: Column(
                children: [
                  FaIcon(
                    FontAwesomeIcons.calendarXmark,
                    color: Colors.grey.shade400,
                    size: 32,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Không có lịch làm việc',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.grey.shade600,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  Text(
                    'Hôm nay bạn được nghỉ',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey.shade500,
                    ),
                  ),
                ],
              ),
            )
          else
            ...schedule.map((item) => _buildScheduleItem(item, isToday)),
        ],
      ),
    );
  }

  Widget _buildScheduleItem(ScheduleItem item, bool isToday) {
    final now = DateTime.now();
    final startTime = DateTime(now.year, now.month, now.day, 
        int.parse(item.startTime.split(':')[0]), 
        int.parse(item.startTime.split(':')[1]));
    final endTime = DateTime(now.year, now.month, now.day, 
        int.parse(item.endTime.split(':')[0]), 
        int.parse(item.endTime.split(':')[1]));
    
    final isCurrentShift = isToday && now.isAfter(startTime) && now.isBefore(endTime);
    final isPastShift = isToday && now.isAfter(endTime);

    Color statusColor = Colors.grey;
    String statusText = 'Chưa bắt đầu';
    
    if (isPastShift) {
      statusColor = Colors.green;
      statusText = 'Đã hoàn thành';
    } else if (isCurrentShift) {
      statusColor = Colors.blue;
      statusText = 'Đang diễn ra';
    } else if (item.isActive) {
      statusColor = Colors.orange;
      statusText = 'Sắp diễn ra';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isCurrentShift 
            ? Colors.blue.shade50 
            : isPastShift 
                ? Colors.green.shade50 
                : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCurrentShift 
              ? Colors.blue.shade200 
              : isPastShift 
                  ? Colors.green.shade200 
                  : Colors.grey.shade200,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 40,
            decoration: BoxDecoration(
              color: statusColor,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${item.startTime} - ${item.endTime}',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: isCurrentShift ? Colors.blue.shade700 : null,
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
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  item.shift,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: isCurrentShift ? Colors.blue.shade600 : Colors.grey.shade700,
                  ),
                ),
                Text(
                  item.type,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWeeklyOverview() {
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
          Text(
            'Tổng quan tuần này',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          
          ...['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
              .asMap()
              .entries
              .map((entry) {
            final index = entry.key;
            final day = entry.value;
            final schedule = _weeklySchedule[day] ?? [];
            final dayNameVi = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'][index];
            
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: schedule.isEmpty ? Colors.red.shade50 : Colors.green.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: schedule.isEmpty ? Colors.red.shade200 : Colors.green.shade200,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: schedule.isEmpty ? Colors.red : Colors.green,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      dayNameVi,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  Text(
                    schedule.isEmpty 
                        ? 'Nghỉ' 
                        : '${schedule.length} ca làm việc',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: schedule.isEmpty ? Colors.red.shade700 : Colors.green.shade700,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildScheduleStats() {
    // Calculate weekly stats
    int totalShifts = 0;
    int totalHours = 0;
    int workingDays = 0;
    
    _weeklySchedule.forEach((day, schedule) {
      if (schedule.isNotEmpty) {
        workingDays++;
        totalShifts += schedule.length;
        for (final shift in schedule) {
          final start = int.parse(shift.startTime.split(':')[0]);
          final end = int.parse(shift.endTime.split(':')[0]);
          totalHours += (end - start);
        }
      }
    });

    final stats = [
      {
        'title': 'Ngày làm việc',
        'value': '$workingDays/7',
        'subtitle': 'Tuần này',
        'icon': FontAwesomeIcons.calendarWeek,
        'color': Colors.blue,
      },
      {
        'title': 'Tổng ca làm',
        'value': totalShifts.toString(),
        'subtitle': 'Ca/tuần',
        'icon': FontAwesomeIcons.clock,
        'color': Colors.green,
      },
      {
        'title': 'Tổng giờ làm',
        'value': '$totalHours giờ',
        'subtitle': 'Giờ/tuần',
        'icon': FontAwesomeIcons.hourglass,
        'color': Colors.orange,
      },
      {
        'title': 'Hiệu suất',
        'value': '${((workingDays / 7) * 100).round()}%',
        'subtitle': 'Tuần này',
        'icon': FontAwesomeIcons.chartLine,
        'color': Colors.purple,
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Thống kê lịch làm việc',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 16),
        Padding(
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
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
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
        ),
      ],
    );
  }
}

class ScheduleItem {
  final String startTime;
  final String endTime;
  final String shift;
  final String type;
  final bool isActive;

  ScheduleItem(this.startTime, this.endTime, this.shift, this.type, this.isActive);
}
