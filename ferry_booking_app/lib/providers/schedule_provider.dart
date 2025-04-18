import 'package:flutter/material.dart';
import 'package:ferry_booking_app/api/route_api.dart';
import 'package:ferry_booking_app/api/schedule_api.dart';
import 'package:ferry_booking_app/models/route.dart';
import 'package:ferry_booking_app/models/schedule.dart';

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
  if (_isLoading) return; // Prevent multiple simultaneous calls
  
  _isLoading = true;
  _errorMessage = null;
  notifyListeners();
  
  try {
    final dateString = date.toIso8601String().split('T')[0];
    print('Fetching schedules for route: $routeId, date: $dateString');
    
    final schedules = await _scheduleApi.getSchedules(routeId, dateString);
    
    // Pastikan widget masih mounted sebelum update state
    _schedules = schedules;
    _isLoading = false;
    notifyListeners();
  } catch (e) {
    print('Error fetching schedules: $e');
    _isLoading = false;
    _errorMessage = 'Gagal memuat jadwal: ${e.toString()}';
    _schedules = [];
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
}