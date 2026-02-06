import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/appointment.dart';
import '../models/staff_statistics.dart';
import '../network/http_client.dart';
import '../services/secure_storage.dart';

class StaffService {
  final http.Client _client;
  final String _baseUrl;

  StaffService({http.Client? client, String? baseUrl})
      : _client = client ?? HttpClientFactory.create(),
        _baseUrl = baseUrl ?? ApiConfig.baseUrl;

  // Header với authentication
  Future<Map<String, String>> getAuthHeaders() async {
    final token = await SecureStorageService().readToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Lấy thông tin staff hiện tại
  Future<Map<String, dynamic>> getCurrentStaffInfo() async {
    try {
      final headers = await getAuthHeaders();
      final response = await _client.get(
        Uri.parse('$_baseUrl/api/Staff/CurrentUser'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load staff info: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching current staff info: $e');
      throw Exception('Không thể tải thông tin nhân viên: $e');
    }
  }

  // Lấy lịch hẹn của staff
  Future<List<Appointment>> getStaffAppointments() async {
    try {
      final headers = await getAuthHeaders();
      final response = await _client.get(
        Uri.parse('$_baseUrl/api/Appointments/Staff'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Appointment.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load staff appointments: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching staff appointments: $e');
      throw Exception('Không thể tải lịch hẹn: $e');
    }
  }

  // Lấy lịch làm việc của staff theo tháng/năm
  Future<List<Map<String, dynamic>>> getStaffSchedule(int staffId, int month, int year) async {
    try {
      final headers = await getAuthHeaders();
      final response = await _client.get(
        Uri.parse('$_baseUrl/api/staff/$staffId/schedule?month=$month&year=$year'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception('Failed to load staff schedule: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching staff schedule: $e');
      // Return empty list if API fails, will use mock data
      return [];
    }
  }

  // Cập nhật lịch làm việc của staff
  Future<void> setStaffSchedule(int staffId, Map<String, dynamic> scheduleData) async {
    try {
      final headers = await getAuthHeaders();
      final response = await _client.post(
        Uri.parse('$_baseUrl/api/staff/$staffId/schedule'),
        headers: headers,
        body: json.encode({
          'staffId': staffId,
          ...scheduleData,
        }),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to update staff schedule: ${response.statusCode}');
      }
    } catch (e) {
      print('Error updating staff schedule: $e');
      throw Exception('Không thể cập nhật lịch làm việc: $e');
    }
  }

  // Kiểm tra tính khả dụng của staff
  Future<Map<String, dynamic>> checkStaffAvailability(int staffId, DateTime date) async {
    try {
      final headers = await getAuthHeaders();
      final formattedDate = date.toIso8601String().split('T')[0];
      final response = await _client.get(
        Uri.parse('$_baseUrl/api/Appointments/staff-availability?staffId=$staffId&date=$formattedDate'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to check staff availability: ${response.statusCode}');
      }
    } catch (e) {
      print('Error checking staff availability: $e');
      return {'available': true}; // Default to available if API fails
    }
  }

  // Lấy lịch làm việc của staff cho một ngày cụ thể
  Future<Map<String, dynamic>> getStaffScheduleForDate(int staffId, DateTime date) async {
    try {
      final headers = await getAuthHeaders();
      final formattedDate = date.toIso8601String().split('T')[0];
      final response = await _client.get(
        Uri.parse('$_baseUrl/api/Appointments/staff-schedule?staffId=$staffId&date=$formattedDate'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load staff schedule for date: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching staff schedule for date: $e');
      return {}; // Return empty if API fails
    }
  }

  // Lấy thống kê dashboard cho staff
  Future<Map<String, dynamic>> getStaffDashboardStats() async {
    try {
      final appointments = await getStaffAppointments();
      final today = DateTime.now();
      
      // Tính toán thống kê từ dữ liệu appointments
      final todayAppointments = appointments.where((apt) => 
        apt.appointmentDate.year == today.year &&
        apt.appointmentDate.month == today.month &&
        apt.appointmentDate.day == today.day
      ).toList();

      final pendingAppointments = appointments.where((apt) => 
        apt.status == 'Pending' || apt.status == 'Confirmed'
      ).toList();

      final completedToday = todayAppointments.where((apt) => 
        apt.status == 'Completed'
      ).toList();

      final upcomingAppointments = appointments.where((apt) => 
        apt.appointmentDate.isAfter(DateTime.now()) &&
        (apt.status == 'Pending' || apt.status == 'Confirmed')
      ).take(5).toList();

      return {
        'todayAppointments': todayAppointments.length,
        'pendingAppointments': pendingAppointments.length,
        'completedToday': completedToday.length,
        'upcomingAppointments': upcomingAppointments,
        'allAppointments': appointments,
      };
    } catch (e) {
      print('Error calculating dashboard stats: $e');
      return {
        'todayAppointments': 0,
        'pendingAppointments': 0,
        'completedToday': 0,
        'upcomingAppointments': <Appointment>[],
        'allAppointments': <Appointment>[],
      };
    }
  }

  // Cập nhật trạng thái lịch hẹn (sử dụng AppointmentService)
  Future<void> updateAppointmentStatus(int appointmentId, String newStatus) async {
    try {
      final headers = await getAuthHeaders();
      final response = await _client.put(
        Uri.parse('$_baseUrl/api/Appointments/$appointmentId/status'),
        headers: headers,
        body: json.encode({'status': newStatus}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to update appointment status: ${response.statusCode}');
      }
    } catch (e) {
      print('Error updating appointment status: $e');
      throw Exception('Không thể cập nhật trạng thái lịch hẹn: $e');
    }
  }

  // Lấy busy slots của staff
  Future<List<String>> getStaffBusySlots(int staffId, DateTime date) async {
    try {
      final headers = await getAuthHeaders();
      final formattedDate = date.toIso8601String().split('T')[0];
      final response = await _client.get(
        Uri.parse('$_baseUrl/api/Staff/$staffId/busy-slots?date=$formattedDate'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((slot) => slot.toString()).toList();
      } else {
        throw Exception('Failed to load staff busy slots: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching staff busy slots: $e');
      return []; // Return empty list if API fails
    }
  }

  // Lấy thống kê của nhân viên
  Future<StaffStatistics?> getStaffStatistics(int staffId) async {
    try {
      final headers = await getAuthHeaders();
      final response = await _client.get(
        Uri.parse('$_baseUrl/api/Staff/$staffId/statistics'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return StaffStatistics.fromJson(data);
      } else {
        throw Exception('Failed to load staff statistics: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching staff statistics: $e');
      return null;
    }
  }
}
