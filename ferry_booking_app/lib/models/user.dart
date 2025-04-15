class User {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String? address;
  final String? idNumber;
  final String? idType;
  final String? dateOfBirthday;
  final String? gender;
  final String? profilePicture;
  final int totalBookings;
  final int loyaltyPoints;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.address,
    this.idNumber,
    this.idType,
    this.dateOfBirthday,
    this.gender,
    this.profilePicture,
    this.totalBookings = 0,
    this.loyaltyPoints = 0,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      address: json['address'],
      idNumber: json['id_number'],
      idType: json['id_type'],
      dateOfBirthday: json['date_of_birthday'],
      gender: json['gender'],
      profilePicture: json['profile_picture'],
      totalBookings: json['total_bookings'] ?? 0,
      loyaltyPoints: json['loyalty_points'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'address': address,
      'id_number': idNumber,
      'id_type': idType,
      'date_of_birthday': dateOfBirthday,
      'gender': gender,
      'profile_picture': profilePicture,
      'total_bookings': totalBookings,
      'loyalty_points': loyaltyPoints,
    };
  }
}