import 'package:ferry_booking_app/models/vehicle_category.dart';

class FerryRoute {
  final int id;
  final String origin;
  final String destination;
  final String routeCode;
  final double? distance;
  final int duration;
  final double basePrice;
  final String status;
  final String? statusReason;
  final List<VehicleCategory>? vehicleCategories;

  FerryRoute({
    required this.id,
    required this.origin,
    required this.destination,
    required this.routeCode,
    this.distance,
    required this.duration,
    required this.basePrice,
    required this.status,
    this.statusReason,
    this.vehicleCategories,
  });

  factory FerryRoute.fromJson(Map<String, dynamic> json) {
    List<VehicleCategory>? vehicleCategories;
    if (json.containsKey('vehicle_categories')) {
      vehicleCategories =
          (json['vehicle_categories'] as List)
              .map((item) => VehicleCategory.fromJson(item))
              .toList();
    }

    return FerryRoute(
      id: int.parse(json['id'].toString()),
      origin: json['origin'],
      destination: json['destination'],
      routeCode: json['route_code'],
      distance:
          json['distance'] != null
              ? double.parse(json['distance'].toString())
              : null,
      duration: int.parse(json['duration'].toString()),
      basePrice: double.parse(json['base_price'].toString()),
      status: json['status'],
      statusReason: json['status_reason'],
      vehicleCategories: vehicleCategories,
    );
  }

  // Helper method untuk mendapatkan harga kendaraan dari kategori
  double getVehiclePriceByType(String vehicleType) {
    if (vehicleCategories == null) return 0;

    final category = vehicleCategories!.firstWhere(
      (cat) => cat.vehicleType == vehicleType,
      orElse:
          () => VehicleCategory(
            id: 0,
            code: '',
            name: '',
            vehicleType: vehicleType,
            basePrice: 0,
            isActive: false,
          ),
    );

    return category.basePrice;
  }
}