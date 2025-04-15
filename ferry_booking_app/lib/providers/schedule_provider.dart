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
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      _routes = await _routeApi.getRoutes();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }
  
  // Get schedules for a specific route and date
  Future<void> getSchedules(int routeId, DateTime date) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      _schedules = await _scheduleApi.getSchedules(
        routeId, 
        date.toIso8601String().split('T')[0]
      );
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
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
      _isLoading = false;
      _errorMessage = e.toString();
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
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }
  
  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}