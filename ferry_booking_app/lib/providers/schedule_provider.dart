import 'package:flutter/material.dart';
import 'package:ferry_booking_app/api/route_api.dart';
import 'package:ferry_booking_app/api/schedule_api.dart';
import 'package:ferry_booking_app/models/route.dart';
import 'package:ferry_booking_app/models/schedule.dart';
import 'package:intl/intl.dart';

class ScheduleProvider extends ChangeNotifier {
  final RouteApi _routeApi = RouteApi();
  final ScheduleApi _scheduleApi = ScheduleApi();

  bool _isLoading = false;
  String? _errorMessage;

  List<FerryRoute>? _routes;
  List<Schedule>? _schedules;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<FerryRoute>? get routes => _routes;
  List<Schedule>? get schedules => _schedules;

  // Get all routes
  Future<void> getRoutes() async {
    if (_isLoading) return; // Prevent multiple simultaneous calls

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _routeApi.getRoutes();

      // Ensure we're in a valid state before updating
      _routes = result;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      print('Error fetching routes: $e');
      _isLoading = false;
      _errorMessage = 'Gagal memuat data rute: ${e.toString()}';
      notifyListeners();
    }
  }

  // Get schedules for a specific route and date
  Future<void> getSchedules(int routeId, DateTime date) async {
    if (_isLoading) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Standardize date format - IMPORTANT FIX
      final dateString = DateFormat('yyyy-MM-dd').format(date);
      print(
        'DEBUG: Fetching schedules for route: $routeId, standardized date: $dateString',
      );
      print('DEBUG: Device timezone offset: ${DateTime.now().timeZoneOffset}');
      print('DEBUG: Original date object: ${date.toString()}');

      final schedules = await _scheduleApi.getSchedules(routeId, dateString);
      print('DEBUG: Received ${schedules.length} schedules');

      // Debug log untuk schedule pertama jika ada
      if (schedules.isNotEmpty) {
        print(
          'DEBUG: First schedule: ID=${schedules[0].id}, Status=${schedules[0].scheduleDateStatus}',
        );
      } else {
        print('DEBUG: No schedules returned from API');
      }

      _schedules = schedules;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      print('ERROR: Fetching schedules failed: $e');
      _isLoading = false;
      _errorMessage = 'Gagal memuat jadwal: ${e.toString()}';
      _schedules = []; // Set ke array kosong, bukan null
      notifyListeners();
    }
  }

  // Get route details
  Future<FerryRoute?> getRouteDetails(int routeId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final route = await _routeApi.getRouteDetails(routeId);
      _isLoading = false;
      notifyListeners();
      return route;
    } catch (e) {
      print('Error fetching route details: $e');
      _isLoading = false;
      _errorMessage = 'Gagal memuat detail rute: ${e.toString()}';
      notifyListeners();
      return null;
    }
  }

  // Get schedule details
  Future<Schedule?> getScheduleDetails(int scheduleId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final schedule = await _scheduleApi.getScheduleDetails(scheduleId);
      _isLoading = false;
      notifyListeners();
      return schedule;
    } catch (e) {
      print('Error fetching schedule details: $e');
      _isLoading = false;
      _errorMessage = 'Gagal memuat detail jadwal: ${e.toString()}';
      notifyListeners();
      return null;
    }
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Method to check if there's a connection or API issue
  Future<bool> checkConnection() async {
    try {
      // Try to get routes as a simple connection test
      await _routeApi.getRoutes();
      return true;
    } catch (e) {
      print('Connection check failed: $e');
      return false;
    }
  }

  // Tambahkan method baru di ScheduleProvider
  Future<void> getSchedulesByFormattedDate(
    int routeId,
    String formattedDate,
  ) async {
    if (_isLoading) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      print('DEBUG: Fetching schedules with formatted date: $formattedDate');

      final schedules = await _scheduleApi.getSchedulesByFormattedDate(
        routeId,
        formattedDate,
      );

      // Validasi tambahan untuk memastikan jadwal sesuai dengan tanggal
      _schedules =
          schedules.where((schedule) {
            return schedule.scheduleDateStatus == 'AVAILABLE';
          }).toList();

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      print('ERROR: Fetching schedules failed: $e');
      _isLoading = false;
      _errorMessage = 'Gagal memuat jadwal: ${e.toString()}';
      _schedules = []; // Set ke array kosong, bukan null
      notifyListeners();
    }
  }
}
