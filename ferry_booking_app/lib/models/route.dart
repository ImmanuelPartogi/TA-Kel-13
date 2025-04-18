class FerryRoute {
  final int id;
  final String origin;
  final String destination;
  final String routeCode;
  final double? distance;
  final int duration;
  final double basePrice;
  final double motorcyclePrice;
  final double carPrice;
  final double busPrice;
  final double truckPrice;
  final String status;
  final String? statusReason;

  FerryRoute({
    required this.id,
    required this.origin,
    required this.destination,
    required this.routeCode,
    this.distance,
    required this.duration,
    required this.basePrice,
    required this.motorcyclePrice,
    required this.carPrice,
    required this.busPrice,
    required this.truckPrice,
    required this.status,
    this.statusReason,
  });

  factory FerryRoute.fromJson(Map<String, dynamic> json) {
    // Hapus token dari json jika ada (ini menghindari konflik dengan proses deserialisasi)
    if (json.containsKey('token')) {
      json.remove('token');
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
      motorcyclePrice: double.parse(json['motorcycle_price'].toString()),
      carPrice: double.parse(json['car_price'].toString()),
      busPrice: double.parse(json['bus_price'].toString()),
      truckPrice: double.parse(json['truck_price'].toString()),
      status: json['status'],
      statusReason: json['status_reason'],
    );
  }
}
