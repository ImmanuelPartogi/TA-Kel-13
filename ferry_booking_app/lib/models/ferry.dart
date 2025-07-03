class Ferry {
  final int id;
  final String name;
  final String registrationNumber;
  final int capacityPassenger;
  final int capacityVehicleMotorcycle;
  final int capacityVehicleCar;
  final int capacityVehicleBus;
  final int capacityVehicleTruck;
  final String status;
  final String? description;
  final String? image;
  final int? yearBuilt;

  Ferry({
    required this.id,
    required this.name,
    required this.registrationNumber,
    required this.capacityPassenger,
    required this.capacityVehicleMotorcycle,
    required this.capacityVehicleCar,
    required this.capacityVehicleBus,
    required this.capacityVehicleTruck,
    required this.status,
    this.description,
    this.image,
    this.yearBuilt,
  });

  factory Ferry.fromJson(Map<String, dynamic> json) {
    try {
      return Ferry(
        id: json['id'] ?? 0,
        name: json['name'] ?? 'UNKNOWN',
        registrationNumber: json['registration_number'] ?? 'UNKNOWN',
        capacityPassenger: json['capacity_passenger'] ?? 0,
        capacityVehicleMotorcycle: json['capacity_vehicle_motorcycle'] ?? 0,
        capacityVehicleCar: json['capacity_vehicle_car'] ?? 0,
        capacityVehicleBus: json['capacity_vehicle_bus'] ?? 0,
        capacityVehicleTruck: json['capacity_vehicle_truck'] ?? 0,
        status: json['status'] ?? 'UNKNOWN',
        description: json['description'],
        image: json['image'],
        yearBuilt: json['year_built'],
      );
    } catch (e) {
      print('ERROR: Gagal parsing Ferry dari JSON: $e');
      // Fallback dengan nilai default jika parsing gagal
      return Ferry(
        id: 0,
        name: 'ERROR',
        registrationNumber: 'ERROR',
        capacityPassenger: 0,
        capacityVehicleMotorcycle: 0,
        capacityVehicleCar: 0,
        capacityVehicleBus: 0,
        capacityVehicleTruck: 0,
        status: 'ERROR',
      );
    }
  }
}
