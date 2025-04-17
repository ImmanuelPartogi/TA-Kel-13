import 'dart:convert';
import 'package:ferry_booking_app/models/route.dart';
import '../services/api_service.dart';

class RouteApi {
  final ApiService _apiService = ApiService();
  
  // Get all routes
  Future<List<FerryRoute>> getRoutes() async {
    try {
      final jsonData = await _apiService.get('routes');
      
      print('Route API response: $jsonData');
      
      if (jsonData['success'] == true && jsonData['data'] != null) {
        final List routesJson = jsonData['data'];
        return routesJson
            .map((routeJson) => FerryRoute.fromJson(routeJson))
            .toList();
      } else {
        print('API success but no data: ${jsonData['message']}');
        throw Exception(jsonData['message'] ?? 'Tidak ada data rute tersedia');
      }
    } catch (e) {
      print('Exception in getRoutes: $e');
      rethrow;
    }
  }
  
  // Get route details
  Future<FerryRoute> getRouteDetails(int routeId) async {
    try {
      final jsonData = await _apiService.get('routes/$routeId');
      
      if (jsonData['success'] == true && jsonData['data'] != null) {
        return FerryRoute.fromJson(jsonData['data']);
      } else {
        throw Exception(jsonData['message'] ?? 'Data rute tidak ditemukan');
      }
    } catch (e) {
      print('Exception in getRouteDetails: $e');
      rethrow;
    }
  }
  
  // Create new route (admin only)
  Future<FerryRoute> createRoute(Map<String, dynamic> routeData) async {
    try {
      final jsonData = await _apiService.post('routes', routeData);
      
      if (jsonData['success'] == true && jsonData['data'] != null) {
        return FerryRoute.fromJson(jsonData['data']);
      } else {
        throw Exception(jsonData['message'] ?? 'Gagal membuat rute baru');
      }
    } catch (e) {
      print('Exception in createRoute: $e');
      rethrow;
    }
  }
  
  // Update route (admin only)
  Future<FerryRoute> updateRoute(int routeId, Map<String, dynamic> routeData) async {
    try {
      final jsonData = await _apiService.put('routes/$routeId', routeData);
      
      if (jsonData['success'] == true && jsonData['data'] != null) {
        return FerryRoute.fromJson(jsonData['data']);
      } else {
        throw Exception(jsonData['message'] ?? 'Gagal memperbarui rute');
      }
    } catch (e) {
      print('Exception in updateRoute: $e');
      rethrow;
    }
  }
  
  // Update route status (activate/deactivate)
  Future<bool> updateRouteStatus(int routeId, String status, {String? reason}) async {
    try {
      final Map<String, dynamic> body = {
        'status': status,
        if (reason != null) 'status_reason': reason
      };
      
      final jsonData = await _apiService.put('routes/$routeId/status', body);
      
      return jsonData['success'] == true;
    } catch (e) {
      print('Exception in updateRouteStatus: $e');
      rethrow;
    }
  }
}