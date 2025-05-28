class VehicleCategory {
  final int id;
  final String code;
  final String name;
  final String vehicleType;
  final double basePrice;
  final bool isActive;
  final String? description;

  VehicleCategory({
    required this.id,
    required this.code,
    required this.name,
    required this.vehicleType,
    required this.basePrice,
    required this.isActive,
    this.description,
  });

  factory VehicleCategory.fromJson(Map<String, dynamic> json) {
    return VehicleCategory(
      id: int.parse(json['id'].toString()),
      code: json['code'],
      name: json['name'],
      vehicleType: json['vehicle_type'],
      basePrice: double.parse(json['base_price'].toString()),
      isActive: json['is_active'] == true || json['is_active'] == 1,
      description: json['description'],
    );
  }
}