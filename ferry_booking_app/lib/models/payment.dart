import 'dart:convert';

import 'package:intl/intl.dart';

class Payment {
  final int id;
  final int bookingId;
  final String? paymentCode;
  final double amount;
  final String status;
  final String paymentMethod;
  final String paymentType;
  final String? virtualAccountNumber;
  final String? deepLinkUrl;
  final String? qrCodeUrl;
  final String? snapToken; // Tambahkan properti ini
  final DateTime? expiryTime;
  final DateTime? paymentTime;
  final String createdAt;
  final String updatedAt;
  final Map<String, dynamic>? rawData;

  Payment({
    required this.id,
    required this.bookingId,
    this.paymentCode,
    required this.amount,
    required this.status,
    required this.paymentMethod,
    required this.paymentType,
    this.virtualAccountNumber,
    this.deepLinkUrl,
    this.qrCodeUrl,
    this.snapToken, // Tambahkan parameter ini
    this.expiryTime,
    this.paymentTime,
    required this.createdAt,
    required this.updatedAt,
    this.rawData,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    // Simpan data mentah untuk debugging
    final rawData = Map<String, dynamic>.from(json);

    // Parse expiry_date dengan menangani format ISO dan non-ISO
    DateTime? parseExpiryDate() {
      if (json['expiry_date'] == null) return null;

      try {
        return DateTime.parse(json['expiry_date'].toString());
      } catch (e) {
        // Fallback untuk format lain jika parsing gagal
        try {
          final dateFormat = DateFormat('yyyy-MM-dd HH:mm:ss');
          return dateFormat.parse(json['expiry_date'].toString());
        } catch (_) {
          print('Error parsing expiry_date: ${json['expiry_date']}');
          return null;
        }
      }
    }

    // Parse payment_date dengan menangani format ISO dan non-ISO
    DateTime? parsePaymentDate() {
      if (json['payment_date'] == null) return null;

      try {
        return DateTime.parse(json['payment_date'].toString());
      } catch (e) {
        // Fallback untuk format lain jika parsing gagal
        try {
          final dateFormat = DateFormat('yyyy-MM-dd HH:mm:ss');
          return dateFormat.parse(json['payment_date'].toString());
        } catch (_) {
          print('Error parsing payment_date: ${json['payment_date']}');
          return null;
        }
      }
    }

    return Payment(
      id: json['id'],
      bookingId: json['booking_id'],
      paymentCode: json['payment_code'] ?? json['transaction_id'] ?? '',
      amount: double.parse(json['amount'].toString()),
      status: json['status'],
      paymentMethod: json['payment_method'] ?? 'VIRTUAL_ACCOUNT',
      paymentType:
          json['payment_type'] ?? json['payment_channel'] ?? 'virtual_account',
      virtualAccountNumber:
          json['virtual_account_number'] ?? json['external_reference'],
      deepLinkUrl: json['deep_link_url'],
      qrCodeUrl: json['qr_code_url'],
      snapToken: json['snap_token'], // Ambil nilai snap_token dari JSON
      expiryTime: parseExpiryDate(),
      paymentTime: parsePaymentDate(),
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
      rawData: rawData,
    );
  }

  // Metode untuk menghasilkan representasi debugging
  Map<String, dynamic> toDebugMap() {
    return {
      'id': id,
      'bookingId': bookingId,
      'paymentCode': paymentCode,
      'amount': amount,
      'status': status,
      'paymentMethod': paymentMethod,
      'paymentType': paymentType,
      'virtualAccountNumber': virtualAccountNumber,
      'deepLinkUrl': deepLinkUrl,
      'qrCodeUrl': qrCodeUrl,
      'expiryTime': expiryTime?.toString(),
      'paymentTime': paymentTime?.toString(),
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'rawData': rawData,
    };
  }

  // Helper untuk mendapatkan status pembayaran yang mudah dibaca
  String get readableStatus {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Menunggu Pembayaran';
      case 'SUCCESS':
        return 'Pembayaran Berhasil';
      case 'FAILED':
        return 'Pembayaran Gagal';
      case 'EXPIRED':
        return 'Pembayaran Kedaluwarsa';
      case 'REFUNDED':
        return 'Dana Dikembalikan';
      default:
        return status;
    }
  }

  // Helper untuk mendapatkan ikon metode pembayaran
  String get paymentMethodIcon {
    final method = paymentMethod.toLowerCase();
    final type = paymentType.toLowerCase();

    if (method.contains('virtual_account') ||
        type.contains('virtual_account')) {
      // Cek bank spesifik dari virtual account
      if (type.contains('bca') ||
          virtualAccountNumber?.toLowerCase().contains('bca') == true) {
        return 'assets/images/payment_methods/bca.png';
      } else if (type.contains('bni') ||
          virtualAccountNumber?.toLowerCase().contains('bni') == true) {
        return 'assets/images/payment_methods/bni.png';
      } else if (type.contains('bri') ||
          virtualAccountNumber?.toLowerCase().contains('bri') == true) {
        return 'assets/images/payment_methods/bri.png';
      } else if (type.contains('mandiri') ||
          virtualAccountNumber?.toLowerCase().contains('mandiri') == true) {
        return 'assets/images/payment_methods/mandiri.png';
      }
      return 'assets/images/payment_methods/bank.png';
    } else if (method.contains('e_wallet') || type.contains('e_wallet')) {
      if (type.contains('gopay')) {
        return 'assets/images/payment_methods/gopay.png';
      } else if (type.contains('shopeepay')) {
        return 'assets/images/payment_methods/shopeepay.png';
      } else if (type.contains('dana')) {
        return 'assets/images/payment_methods/dana.png';
      } else if (type.contains('ovo')) {
        return 'assets/images/payment_methods/ovo.png';
      }
      return 'assets/images/payment_methods/ewallet.png';
    } else if (method.contains('credit_card')) {
      return 'assets/images/payment_methods/credit_card.png';
    }

    // Fallback generic icon
    return 'assets/images/payment_methods/payment.png';
  }

  // Ekstrak VA number dari payload Midtrans
  String? get extractedVirtualAccountNumber {
    // Gunakan VA yang sudah ada jika tersedia
    if (virtualAccountNumber != null && virtualAccountNumber!.isNotEmpty) {
      return virtualAccountNumber;
    }

    // Coba ekstrak dari rawData
    try {
      if (rawData != null) {
        // Cek di transaction_details
        if (rawData!['transaction_details'] != null &&
            rawData!['transaction_details']['va_numbers'] != null) {
          return rawData!['transaction_details']['va_numbers'][0]['va_number'];
        }

        // Cek di payload
        if (rawData!['payload'] != null) {
          var payload = rawData!['payload'];
          if (payload is String) {
            payload = jsonDecode(payload);
          }

          if (payload['va_numbers'] != null) {
            return payload['va_numbers'][0]['va_number'];
          }

          if (payload['permata_va_number'] != null) {
            return payload['permata_va_number'];
          }
        }
      }
    } catch (e) {
      print('Error extracting VA number: $e');
    }

    return null;
  }

  // Ekstrak QR Code URL untuk e-wallet
  String? get extractedQrCodeUrl {
    // Gunakan QR URL yang sudah ada jika tersedia
    if (qrCodeUrl != null && qrCodeUrl!.isNotEmpty) {
      return qrCodeUrl;
    }

    // Coba ekstrak dari rawData
    try {
      if (rawData != null) {
        if (rawData!['actions'] != null) {
          var actions = rawData!['actions'] as List;
          for (var action in actions) {
            if (action['name'] == 'generate-qr-code') {
              return action['url'];
            }
          }
        }

        // Cek di payload
        if (rawData!['payload'] != null) {
          var payload = rawData!['payload'];
          if (payload is String) {
            payload = jsonDecode(payload);
          }

          if (payload['actions'] != null) {
            var actions = payload['actions'] as List;
            for (var action in actions) {
              if (action['name'] == 'generate-qr-code') {
                return action['url'];
              }
            }
          }
        }
      }
    } catch (e) {
      print('Error extracting QR code URL: $e');
    }

    return null;
  }

  // Cek apakah pembayaran sudah kedaluwarsa
  bool get isExpired {
    if (expiryTime == null) return false;
    return DateTime.now().isAfter(expiryTime!);
  }

  // Cek apakah pembayaran hampir kedaluwarsa (kurang dari 1 jam)
  bool get isNearExpiry {
    if (expiryTime == null) return false;
    final difference = expiryTime!.difference(DateTime.now());
    return difference.inHours < 1 && difference.inSeconds > 0;
  }
}
