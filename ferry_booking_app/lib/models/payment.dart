import 'dart:convert';
import 'package:intl/intl.dart';

class Payment {
  final int id;
  final int bookingId;
  final String? paymentCode;
  final double amount;
  String status;
  String paymentMethod;
  String paymentType;
  String? virtualAccountNumber;
  String? deepLinkUrl;
  String? qrCodeUrl;
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
    this.expiryTime,
    this.paymentTime,
    required this.createdAt,
    required this.updatedAt,
    this.rawData,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    // Simpan data mentah untuk debugging
    final rawData = Map<String, dynamic>.from(json);

    // Perbaikan: Parse expiry_date dengan menangani format ISO dan non-ISO
    DateTime? parseExpiryDate() {
      if (json['expiry_date'] == null) return null;

      try {
        // Coba parse sebagai string ISO 8601
        DateTime parsedDate = DateTime.parse(json['expiry_date'].toString());

        // Penting: Pastikan tanggal dalam format lokal
        return parsedDate.toLocal();
      } catch (e) {
        // Fallback untuk format lain jika parsing gagal
        try {
          final dateFormat = DateFormat('yyyy-MM-dd HH:mm:ss');
          DateTime parsedDate = dateFormat.parse(
            json['expiry_date'].toString(),
          );

          // Penting: Pastikan tanggal dalam format lokal
          return parsedDate.toLocal();
        } catch (_) {
          print('Error parsing expiry_date: ${json['expiry_date']}');

          // Tambahan: Fallback ke 5 menit dari sekarang jika parsing gagal
          return DateTime.now().add(const Duration(minutes: 5));
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

    // Debugging: Log waktu expiry
    final expiryDate = parseExpiryDate();
    if (expiryDate != null) {
      final now = DateTime.now();
      final diff = expiryDate.difference(now);
      print(
        'Parsed expiry_date: $expiryDate (${diff.inMinutes} minutes from now)',
      );
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
      expiryTime: expiryDate,
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
      // ... VA code ...
      return 'assets/images/payment_methods/bank.png';
    } else if (type.contains('qris')) {
      return 'assets/images/payment_methods/qris.png';
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

  String? get qrStringData {
    // Coba mendapatkan dari rawData jika tersedia
    if (rawData != null) {
      // Coba langsung dari rawData
      if (rawData!.containsKey('qr_string')) {
        return rawData!['qr_string'];
      }

      // Coba dari payload jika ada
      if (rawData!.containsKey('payload')) {
        try {
          var payload = rawData!['payload'];
          if (payload is String) {
            // Coba parse jika payload adalah string JSON
            final Map<String, dynamic> data = json.decode(payload);
            return data['qr_string'];
          } else if (payload is Map) {
            // Jika payload sudah berupa Map
            return payload['qr_string'];
          }
        } catch (e) {
          print('Error parsing payload: $e');
        }
      }
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

  void updatePaymentDetails({
    String? virtualAccountNumber,
    String? deepLinkUrl,
    String? qrCodeUrl,
  }) {
    if (virtualAccountNumber != null) {
      this.virtualAccountNumber = virtualAccountNumber;
    }
    if (deepLinkUrl != null) {
      this.deepLinkUrl = deepLinkUrl;
    }
    if (qrCodeUrl != null) {
      this.qrCodeUrl = qrCodeUrl;
    }
  }

  // SOLUSI: Getter untuk kompatibilitas dengan kode yang menggunakan expiryDate
  DateTime? get expiryDate => expiryTime;

  // Metode debugging untuk melacak masalah waktu
  void debugExpiryTime() {
    if (expiryTime != null) {
      print('Expiry Time: $expiryTime');
      print('Current Time: ${DateTime.now()}');
      print(
        'Difference in minutes: ${expiryTime!.difference(DateTime.now()).inMinutes}',
      );
      print(
        'Difference in seconds: ${expiryTime!.difference(DateTime.now()).inSeconds}',
      );
      print('Is local time: ${!expiryTime!.isUtc ? "Yes" : "No (UTC)"}');
    } else {
      print('Expiry Time is null');
    }
  }
}
