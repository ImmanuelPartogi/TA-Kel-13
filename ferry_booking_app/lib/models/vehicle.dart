class Vehicle {
  final int id;
  final int bookingId;
  final int userId;
  final String type;
  final int vehicle_category_id; // Tambahkan field ini
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
    required this.vehicle_category_id, // Tambahkan parameter wajib
    required this.licensePlate,
    this.brand,
    this.model,
    this.weight,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    String validateVehicleType(String type) {
      final validTypes = ['MOTORCYCLE', 'CAR', 'BUS', 'TRUCK'];
      if (validTypes.contains(type)) return type;

      // Map tipe yang tidak valid
      if (type == 'PICKUP' || type == 'TRONTON') return 'TRUCK';

      // Default fallback
      return 'CAR';
    }

    return Vehicle(
      id: json['id'],
      bookingId: json['booking_id'],
      userId: json['user_id'],
      type: validateVehicleType(json['type']),
      vehicle_category_id: json['vehicle_category_id'], // Parse dari JSON
      licensePlate: json['license_plate'],
      brand: json['brand'],
      model: json['model'],
      weight:
          json['weight'] != null
              ? double.parse(json['weight'].toString())
              : null,
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }

  // Fungsi untuk memastikan tipe yang dikirim valid
  String get validServerType {
    final validTypes = ['MOTORCYCLE', 'CAR', 'BUS', 'TRUCK'];
    if (validTypes.contains(type)) return type;

    if (type == 'PICKUP' || type == 'TRONTON') return 'TRUCK';
    return 'CAR';
  }

  // Opsional: Tambahkan toJson() untuk memudahkan ketika mengirim data ke API
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'booking_id': bookingId,
      'user_id': userId,
      'type': type,
      'vehicle_category_id': vehicle_category_id,
      'license_plate': licensePlate,
      'brand': brand,
      'model': model,
      'weight': weight,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}
