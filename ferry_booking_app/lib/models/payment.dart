class Payment {
  final int id;
  final int bookingId;
  final String paymentCode;
  final double amount;
  final String status;
  final String paymentMethod;
  final String paymentType;
  final String? virtualAccountNumber;
  final String? deepLinkUrl;
  final String? qrCodeUrl;
  final DateTime? expiryTime;
  final DateTime? paymentTime;
  final String createdAt;
  final String updatedAt;

  Payment({
    required this.id,
    required this.bookingId,
    required this.paymentCode,
    required this.amount,
    required this.status,
    required this.paymentMethod,
    required this.paymentType,
    this.virtualAccountNumber,
    this.deepLinkUrl,
    this.qrCodeUrl,
    this.expiryTime,
    this.paymentTime,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'],
      bookingId: json['booking_id'],
      paymentCode: json['payment_code'],
      amount: double.parse(json['amount'].toString()),
      status: json['status'],
      paymentMethod: json['payment_method'],
      paymentType: json['payment_type'],
      virtualAccountNumber: json['virtual_account_number'],
      deepLinkUrl: json['deep_link_url'],
      qrCodeUrl: json['qr_code_url'],
      expiryTime: json['expiry_time'] != null ? DateTime.parse(json['expiry_time']) : null,
      paymentTime: json['payment_time'] != null ? DateTime.parse(json['payment_time']) : null,
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }
}