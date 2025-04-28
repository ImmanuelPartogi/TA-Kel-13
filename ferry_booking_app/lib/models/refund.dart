import 'package:intl/intl.dart';

class Refund {
  final int id;
  final int bookingId;
  final int paymentId;
  final double amount;
  final String reason;
  String status; // Tidak final karena bisa berubah
  final String? refundedBy;
  final String refundMethod;
  final String? transactionId;
  final String bankAccountNumber;
  final String bankAccountName;
  final String bankName;
  final String createdAt;
  final String updatedAt;

  Refund({
    required this.id,
    required this.bookingId,
    required this.paymentId,
    required this.amount,
    required this.reason,
    required this.status,
    this.refundedBy,
    required this.refundMethod,
    this.transactionId,
    required this.bankAccountNumber,
    required this.bankAccountName,
    required this.bankName,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Refund.fromJson(Map<String, dynamic> json) {
    return Refund(
      id: json['id'],
      bookingId: json['booking_id'],
      paymentId: json['payment_id'],
      amount: double.parse(json['amount'].toString()),
      reason: json['reason'],
      status: json['status'],
      refundedBy: json['refunded_by'],
      refundMethod: json['refund_method'],
      transactionId: json['transaction_id'],
      bankAccountNumber: json['bank_account_number'],
      bankAccountName: json['bank_account_name'],
      bankName: json['bank_name'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }

  // Helper untuk mendapatkan status refund yang mudah dibaca
  String get readableStatus {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Sedang Diproses';
      case 'SUCCESS':
        return 'Berhasil';
      case 'FAILED':
        return 'Gagal';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return status;
    }
  }

  // Helper untuk mendapatkan warna status
  int getStatusColor() {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        return 0xFF4CAF50; // Colors.green
      case 'PENDING':
        return 0xFFFFA726; // Colors.orange
      case 'FAILED':
        return 0xFFE53935; // Colors.red
      case 'CANCELLED':
        return 0xFF9E9E9E; // Colors.grey
      default:
        return 0xFF9E9E9E; // Colors.grey
    }
  }

  // Format uang
  String get formattedAmount {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return currencyFormat.format(amount);
  }

  // Format tanggal dibuat
  String get formattedCreatedDate {
    try {
      final dateFormat = DateFormat('dd MMMM yyyy, HH:mm', 'id_ID');
      final dateTime = DateTime.parse(createdAt);
      return dateFormat.format(dateTime);
    } catch (e) {
      return createdAt;
    }
  }
}