import 'package:ferry_booking_app/services/api_service.dart';
import 'package:ferry_booking_app/models/schedule.dart';
import 'package:intl/intl.dart';

class ScheduleApi {
  final ApiService _apiService = ApiService();

  // Metode utama untuk mendapatkan jadwal dengan dukungan parameter tambahan
  Future<List<Schedule>> getSchedulesByRoute(
    int routeId, 
    String formattedDate, 
    {Map<String, String>? queryParams}
  ) async {
    try {
      // Bangun parameter query dasar
      Map<String, String> params = {
        'route_id': routeId.toString(),
        'date': formattedDate,
      };
      
      // Tambahkan parameter tambahan jika disediakan
      if (queryParams != null) {
        params.addAll(queryParams);
      }
      
      // Bangun string query
      String queryString = params.entries
          .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
          .join('&');
      
      print('DEBUG: API Request - GET schedules?$queryString');
      
      final response = await _apiService.get('schedules?$queryString');
      
      print('DEBUG: API Response - success: ${response['success']}, message: ${response['message']}');
      
      if (response['success']) {
        final data = response['data'] as List;
        print('DEBUG: Received ${data.length} schedule records');
        
        // Log lebih detail untuk debugging
        if (data.isNotEmpty) {
          for (var i = 0; i < data.length; i++) {
            final item = data[i];
            print('DEBUG: Schedule[$i] - ID: ${item['id']}, '
                'Departure: ${item['departure_time']}, '
                'Status: ${item['status']}, '
                'ScheduleDateStatus: ${item['schedule_date_status']}');
          }
        }
        
        return data.map((json) => Schedule.fromJson(json)).toList();
      } else {
        print('ERROR: API returned error - ${response['message']}');
        throw Exception(response['message']);
      }
    } catch (e) {
      print('ERROR: Exception in getSchedulesByRoute API: $e');
      throw Exception('Gagal mengambil jadwal: $e');
    }
  }

  // Metode untuk mendapatkan jadwal (versi lama - menggunakan metode baru)
  Future<List<Schedule>> getSchedules(int routeId, String date) async {
    try {
      // Pastikan format tanggal konsisten
      DateTime parsedDate = DateTime.parse(date);
      final formattedDate = DateFormat('yyyy-MM-dd').format(parsedDate);
      
      return getSchedulesByRoute(routeId, formattedDate);
    } catch (e) {
      print('ERROR: Exception in getSchedules API: $e');
      throw Exception('Gagal mengambil jadwal: $e');
    }
  }

  // Metode untuk mendapatkan jadwal dengan tanggal yang sudah diformat (versi lama - menggunakan metode baru)
  Future<List<Schedule>> getSchedulesByFormattedDate(
    int routeId,
    String formattedDate,
    {Map<String, String>? queryParams}
  ) async {
    return getSchedulesByRoute(routeId, formattedDate, queryParams: queryParams);
  }

  // Get schedule details
  Future<Schedule> getScheduleDetails(int scheduleId) async {
    try {
      final response = await _apiService.get('schedules/$scheduleId');
      
      print('DEBUG: API Response for schedule details - success: ${response['success']}');
      
      if (response['success']) {
        return Schedule.fromJson(response['data']);
      } else {
        throw Exception(response['message']);
      }
    } catch (e) {
      print('ERROR: Exception in getScheduleDetails API: $e');
      throw Exception('Gagal mengambil detail jadwal: $e');
    }
  }
}