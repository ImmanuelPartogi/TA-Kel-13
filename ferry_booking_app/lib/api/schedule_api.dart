import 'package:ferry_booking_app/services/api_service.dart';
import 'package:ferry_booking_app/models/schedule.dart';

class ScheduleApi {
  final ApiService _apiService = ApiService();

  // Get schedules for a route and date
  Future<List<Schedule>> getSchedules(int routeId, String date) async {
    final response = await _apiService.get('schedules?route_id=$routeId&date=$date');

    if (response['success']) {
      return (response['data'] as List)
          .map((json) => Schedule.fromJson(json))
          .toList();
    } else {
      throw Exception(response['message']);
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
}