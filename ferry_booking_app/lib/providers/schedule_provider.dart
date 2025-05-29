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

  // Method untuk set loading status secara manual
  void setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Get all routes
  Future<void> getRoutes() async {
    if (_isLoading) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _routeApi.getRoutes();
      _routes = result;
    } catch (e) {
      print('Error fetching routes: $e');
      _errorMessage = 'Gagal memuat data rute: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Metode utama untuk mendapatkan jadwal - Konsolidasikan metode yang ada
  Future<void> getSchedulesByRoute(
    int routeId, 
    String formattedDate, 
    {bool forceRefresh = false}
  ) async {
    if (_isLoading && !forceRefresh) return;

    _isLoading = true;
    _errorMessage = null;
    
    // Jika forceRefresh, reset data jadwal
    if (forceRefresh) {
      _schedules = null;
    }
    
    notifyListeners();

    try {
      print('DEBUG: Fetching schedules - Route ID: $routeId, Date: $formattedDate, Force Refresh: $forceRefresh');
      
      // Tambahkan cache buster untuk memaksa server memberikan data baru
      final cacheBuster = DateTime.now().millisecondsSinceEpoch.toString();
      final schedules = await _scheduleApi.getSchedulesByFormattedDate(
        routeId,
        formattedDate,
        queryParams: {
          '_': cacheBuster,
          'refresh': forceRefresh ? 'true' : 'false',
        },
      );

      print('DEBUG: Received ${schedules.length} schedules from API');
      
      // Log detail jadwal untuk debugging
      if (schedules.isNotEmpty) {
        for (var i = 0; i < schedules.length; i++) {
          final s = schedules[i];
          print('DEBUG: Schedule[$i] - ID: ${s.id}, Departure: ${s.departureTime}, '
              'Status: ${s.status}, ScheduleDateStatus: ${s.scheduleDateStatus}');
        }
      } else {
        print('DEBUG: No schedules returned from API');
      }

      // Filter jadwal yang valid - Perbaiki validasi status
      _schedules = schedules.where((schedule) {
        // Terima semua jadwal dengan status ACTIVE/AVAILABLE
        // dan juga jadwal yang memiliki scheduleDateStatus valid
        return schedule.status == 'ACTIVE' || 
               ['ACTIVE', 'AVAILABLE'].contains(schedule.scheduleDateStatus);
      }).toList();
      
      // Urutkan jadwal berdasarkan waktu keberangkatan
      _schedules?.sort((a, b) {
        try {
          final timeA = _parseTimeString(a.departureTime);
          final timeB = _parseTimeString(b.departureTime);
          return timeA.compareTo(timeB);
        } catch (e) {
          print('Error sorting schedules: $e');
          return 0;
        }
      });
      
      print('DEBUG: After filtering and sorting: ${_schedules?.length ?? 0} schedules');
    } catch (e) {
      print('ERROR: Fetching schedules failed: $e');
      _errorMessage = 'Gagal memuat jadwal: ${e.toString()}';
      // Jangan set _schedules ke array kosong jika ini bukan forceRefresh
      if (forceRefresh || _schedules == null) {
        _schedules = [];
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Helper untuk parse string waktu ke DateTime untuk sorting
  DateTime _parseTimeString(String timeString) {
    try {
      // Format ISO 8601
      if (timeString.contains('T')) {
        return DateTime.parse(timeString);
      }
      
      // Format HH:MM:SS atau HH:MM
      if (timeString.contains(':')) {
        final parts = timeString.split(':');
        final hour = int.tryParse(parts[0]) ?? 0;
        final minute = parts.length > 1 ? int.tryParse(parts[1]) ?? 0 : 0;
        return DateTime(2000, 1, 1, hour, minute);
      }
      
      return DateTime(2000, 1, 1);
    } catch (e) {
      print('Error parsing time: $e');
      return DateTime(2000, 1, 1);
    }
  }

  // Get route details
  Future<FerryRoute?> getRouteDetails(int routeId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final route = await _routeApi.getRouteDetails(routeId);
      return route;
    } catch (e) {
      print('Error fetching route details: $e');
      _errorMessage = 'Gagal memuat detail rute: ${e.toString()}';
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get schedule details
  Future<Schedule?> getScheduleDetails(int scheduleId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final schedule = await _scheduleApi.getScheduleDetails(scheduleId);
      return schedule;
    } catch (e) {
      print('Error fetching schedule details: $e');
      _errorMessage = 'Gagal memuat detail jadwal: ${e.toString()}';
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
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
      await _routeApi.getRoutes();
      return true;
    } catch (e) {
      print('Connection check failed: $e');
      return false;
    }
  }

  // Metode ini dipertahankan untuk kompatibilitas, tetapi harus diganti ke getSchedulesByRoute
  @Deprecated('Use getSchedulesByRoute instead')
  Future<void> getSchedules(int routeId, DateTime date) async {
    final formattedDate = DateFormat('yyyy-MM-dd').format(date);
    return getSchedulesByRoute(routeId, formattedDate);
  }

  // Metode ini dipertahankan untuk kompatibilitas, tetapi harus diganti ke getSchedulesByRoute
  @Deprecated('Use getSchedulesByRoute instead')
  Future<void> getSchedulesByFormattedDate(int routeId, String formattedDate) async {
    return getSchedulesByRoute(routeId, formattedDate);
  }
}