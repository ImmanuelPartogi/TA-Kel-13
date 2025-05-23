import 'package:intl/intl.dart';

class Refund {
  final int id;
  final int bookingId;
  final int paymentId;
  final double originalAmount;
  final double refundFee;
  final double refundPercentage;
  final double amount;
  final String reason;
  final String status;
  final String refundMethod;
  final String? transactionId;
  final String bankAccountNumber;
  final String bankAccountName;
  final String bankName;
  final String? notes;
  final String? rejectionReason;
  final DateTime createdAt;
  final DateTime updatedAt;

  Refund({
    required this.id,
    required this.bookingId,
    required this.paymentId,
    required this.originalAmount,
    required this.refundFee,
    required this.refundPercentage,
    required this.amount,
    required this.reason,
    required this.status,
    required this.refundMethod,
    this.transactionId,
    required this.bankAccountNumber,
    required this.bankAccountName,
    required this.bankName,
    this.notes,
    this.rejectionReason,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Refund.fromJson(Map<String, dynamic> json) {
    return Refund(
      id: json['id'],
      bookingId: json['booking_id'],
      paymentId: json['payment_id'],
      originalAmount: double.parse(json['original_amount'].toString()),
      refundFee: double.parse(json['refund_fee'].toString()),
      refundPercentage: double.parse(json['refund_percentage'].toString()),
      amount: double.parse(json['amount'].toString()),
      reason: json['reason'],
      status: json['status'],
      refundMethod: json['refund_method'],
      transactionId: json['transaction_id'],
      bankAccountNumber: json['bank_account_number'] ?? '',
      bankAccountName: json['bank_account_name'] ?? '',
      bankName: json['bank_name'] ?? '',
      notes: json['notes'],
      rejectionReason: json['rejection_reason'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'booking_id': bookingId,
      'payment_id': paymentId,
      'original_amount': originalAmount,
      'refund_fee': refundFee,
      'refund_percentage': refundPercentage,
      'amount': amount,
      'reason': reason,
      'status': status,
      'refund_method': refundMethod,
      'transaction_id': transactionId,
      'bank_account_number': bankAccountNumber,
      'bank_account_name': bankAccountName,
      'bank_name': bankName,
      'notes': notes,
      'rejection_reason': rejectionReason,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  // Helper methods
  String get readableStatus {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Menunggu Persetujuan';
      case 'APPROVED':
        return 'Disetujui';
      case 'REJECTED':
        return 'Ditolak';
      case 'COMPLETED':
        return 'Selesai';
      case 'PROCESSING':
        return 'Sedang Diproses';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return status;
    }
  }

  String get formattedAmount {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }

  String get formattedOriginalAmount {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return formatter.format(originalAmount);
  }

  String get formattedRefundFee {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return formatter.format(refundFee);
  }

  String get formattedCreatedDate {
    return DateFormat('dd MMMM yyyy HH:mm', 'id_ID').format(createdAt);
  }

  int getStatusColor() {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 0xFFFFA726; // Orange
      case 'APPROVED':
        return 0xFF2196F3; // Blue
      case 'REJECTED':
        return 0xFFEF5350; // Red
      case 'COMPLETED':
        return 0xFF66BB6A; // Green
      case 'PROCESSING':
        return 0xFF5C6BC0; // Indigo
      case 'CANCELLED':
        return 0xFF9E9E9E; // Grey
      default:
        return 0xFF9E9E9E;
    }
  }

  String getStatusDescription() {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Permintaan refund sedang menunggu persetujuan admin';
      case 'APPROVED':
        return 'Refund telah disetujui dan menunggu proses transfer';
      case 'REJECTED':
        return rejectionReason ?? 'Permintaan refund ditolak oleh admin';
      case 'COMPLETED':
        return 'Refund telah berhasil diproses dan dana telah dikembalikan';
      case 'PROCESSING':
        return 'Refund sedang dalam proses pengembalian dana';
      case 'CANCELLED':
        return 'Permintaan refund telah dibatalkan';
      default:
        return '';
    }
  }

  // Bank name mapping
  static const Map<String, String> bankOptions = {
    'BCA': 'Bank Central Asia',
    'BNI': 'Bank Negara Indonesia',
    'BRI': 'Bank Rakyat Indonesia',
    'MANDIRI': 'Bank Mandiri',
    'CIMB': 'CIMB Niaga',
    'DANAMON': 'Bank Danamon',
    'PERMATA': 'Bank Permata',
    'BTN': 'Bank Tabungan Negara',
    'OCBC': 'OCBC NISP',
    'MAYBANK': 'Maybank Indonesia',
    'PANIN': 'Bank Panin',
    'BUKOPIN': 'Bank Bukopin',
    'MEGA': 'Bank Mega',
    'SINARMAS': 'Bank Sinarmas',
    'OTHER': 'Bank Lainnya'
  };

  String get bankNameLabel {
    return bankOptions[bankName] ?? bankName;
  }
}