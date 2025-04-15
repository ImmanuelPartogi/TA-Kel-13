class Payment {
  final int id;
  final int bookingId;
  final double amount;
  final String paymentMethod;
  final String paymentChannel;
  final String? transactionId;
  final String? externalReference;
  final String status;
  final String? paymentDate;
  final String? expiryDate;
  final double? refundAmount;
  final String? refundDate;
  final String? payload;
  final String createdAt;
  final String updatedAt;

  Payment({
    required this.id,
    required this.bookingId,
    required this.amount,
    required this.paymentMethod,
    required this.paymentChannel,
    this.transactionId,
    this.externalReference,
    required this.status,
    this.paymentDate,
    this.expiryDate,
    this.refundAmount,
    this.refundDate,
    this.payload,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'],
      bookingId: json['booking_id'],
      amount: double.parse(json['amount'].toString()),
      paymentMethod: json['payment_method'],
      paymentChannel: json['payment_channel'],
      transactionId: json['transaction_id'],
      externalReference: json['external_reference'],
      status: json['status'],
      paymentDate: json['payment_date'],
      expiryDate: json['expiry_date'],
      refundAmount: json['refund_amount'] != null 
          ? double.parse(json['refund_amount'].toString()) 
          : null,
      refundDate: json['refund_date'],
      payload: json['payload'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }
}