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
  final String? bankAccountName;
  final String? bankName;
  final String? bankAccountNumber;
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
    this.bankAccountName,
    this.bankName,
    this.bankAccountNumber,
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
      bankAccountName: json['bank_account_name'],
      bankName: json['bank_name'],
      bankAccountNumber: json['bank_account_number'],
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
      'bank_account_name': bankAccountName, 
      'bank_name': bankName, 
      'bank_account_number': bankAccountNumber, 
      'total_bookings': totalBookings,
      'loyalty_points': loyaltyPoints,
    };
  }
}
