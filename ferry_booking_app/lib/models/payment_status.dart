class PaymentStatus {
  static const String pending = 'PENDING';
  static const String success = 'SUCCESS';
  static const String failed = 'FAILED';
  static const String expired = 'EXPIRED';
  static const String cancelled = 'CANCELLED';
  static const String refunded = 'REFUNDED';
  static const String unknown = 'UNKNOWN';
  
  // Method untuk mengecek apakah status adalah status final
  static bool isFinalStatus(String status) {
    final upperStatus = status.toUpperCase();
    return upperStatus == success || 
           upperStatus == failed || 
           upperStatus == expired ||
           upperStatus == cancelled ||
           upperStatus == refunded;
  }
}