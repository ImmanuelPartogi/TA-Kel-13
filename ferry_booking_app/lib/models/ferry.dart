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
    return Ferry(
      id: json['id'],
      name: json['name'],
      registrationNumber: json['registration_number'],
      capacityPassenger: json['capacity_passenger'],
      capacityVehicleMotorcycle: json['capacity_vehicle_motorcycle'],
      capacityVehicleCar: json['capacity_vehicle_car'],
      capacityVehicleBus: json['capacity_vehicle_bus'],
      capacityVehicleTruck: json['capacity_vehicle_truck'],
      status: json['status'],
      description: json['description'],
      image: json['image'],
      yearBuilt: json['year_built'],
    );
  }
}