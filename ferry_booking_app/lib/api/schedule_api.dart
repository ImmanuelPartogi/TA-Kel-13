import 'package:ferry_booking_app/services/api_service.dart';
import 'package:ferry_booking_app/models/schedule.dart';
import 'package:intl/intl.dart';

class ScheduleApi {
  final ApiService _apiService = ApiService();

  // Get schedules for a route and date
  Future<List<Schedule>> getSchedules(int routeId, String date) async {
    try {
      // Memastikan format tanggal konsisten
      DateTime parsedDate = DateTime.parse(date);
      final formattedDate = DateFormat('yyyy-MM-dd').format(parsedDate);

      print(
        'DEBUG: API Request - GET schedules?route_id=$routeId&date=$formattedDate',
      );
      print('DEBUG: Device timezone offset: ${DateTime.now().timeZoneOffset}');

      final response = await _apiService.get(
        'schedules?route_id=$routeId&date=$formattedDate',
      );
      print('DEBUG: API Response - success: ${response['success']}');

      if (response['success']) {
        final data = response['data'] as List;
        print('DEBUG: Received ${data.length} schedule records');

        // Debug log untuk schedule pertama jika ada
        if (data.isNotEmpty) {
          print(
            'DEBUG: First schedule data - ${data[0]['id']}, date status: ${data[0]['schedule_date_status']}',
          );
        }

        return data.map((json) => Schedule.fromJson(json)).toList();
      } else {
        print('ERROR: API returned error - ${response['message']}');
        throw Exception(response['message']);
      }
    } catch (e) {
      print('ERROR: Exception in getSchedules API: $e');
      throw Exception('Gagal mengambil jadwal: $e');
    }
  }

  // Get schedule details
  Future<Schedule> getScheduleDetails(int scheduleId) async {
    final response = await _apiService.get('schedules/$scheduleId');

    if (response['success']) {
      return Schedule.fromJson(response['data']);
    } else {
      throw Exception(response['message']);
    }
  }

  Future<List<Schedule>> getSchedulesByFormattedDate(
    int routeId,
    String formattedDate,
  ) async {
    try {
      print(
        'DEBUG: API Request - GET schedules?route_id=$routeId&date=$formattedDate',
      );

      final response = await _apiService.get(
        'schedules?route_id=$routeId&date=$formattedDate',
      );

      if (response['success']) {
        final data = response['data'] as List;
        print('DEBUG: Received ${data.length} schedule records');

        return data.map((json) => Schedule.fromJson(json)).toList();
      } else {
        throw Exception(response['message']);
      }
    } catch (e) {
      print('ERROR: Exception in getSchedulesByFormattedDate API: $e');
      throw Exception('Gagal mengambil jadwal: $e');
    }
  }
}
