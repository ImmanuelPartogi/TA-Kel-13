import 'package:ferry_booking_app/api/api_service.dart';
import 'package:ferry_booking_app/models/route.dart';

class RouteApi {
  final ApiService _apiService = ApiService();

  // Get all routes
  Future<List<FerryRoute>> getRoutes({String? status}) async {
    final queryParams = status != null ? 'status=$status' : '';
    final response = await _apiService.get('routes${queryParams.isNotEmpty ? '?$queryParams' : ''}');

    if (response['success']) {
      return (response['data'] as List)
          .map((json) => FerryRoute.fromJson(json))
          .toList();
    } else {
      throw Exception(response['message']);
    }
  }

  // Get route details
  Future<FerryRoute> getRouteDetails(int routeId) async {
    final response = await _apiService.get('routes/$routeId');

    if (response['success']) {
      return FerryRoute.fromJson(response['data']);
    } else {
      throw Exception(response['message']);
    }
  }
}