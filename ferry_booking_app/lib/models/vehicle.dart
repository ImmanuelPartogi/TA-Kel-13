class Vehicle {
  final int id;
  final int bookingId;
  final int userId;
  final String type;
  final String licensePlate;
  final String? brand;
  final String? model;
  final double? weight;
  final String createdAt;
  final String updatedAt;

  Vehicle({
    required this.id,
    required this.bookingId,
    required this.userId,
    required this.type,
    required this.licensePlate,
    this.brand,
    this.model,
    this.weight,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'],
      bookingId: json['booking_id'],
      userId: json['user_id'],
      type: json['type'],
      licensePlate: json['license_plate'],
      brand: json['brand'],
      model: json['model'],
      weight: json['weight'] != null 
          ? double.parse(json['weight'].toString()) 
          : null,
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }
}