import 'dart:convert';
import 'package:intl/intl.dart';

class Payment {
  final int id;
  final int bookingId;
  final String? paymentCode;
  final double amount;
  String status; // Hapus keyword 'final' di sini
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
    // PERBAIKAN: Parse expiry_date dengan handling yang lebih robust
    DateTime? parseExpiryDate() {
      if (json['expiry_date'] == null) return null;

      try {
        final expiryString = json['expiry_date'].toString().trim();

        // Handle berbagai format yang mungkin
        if (expiryString.isEmpty) return null;

        print('🔍 Parsing expiry_date: $expiryString');

        // Format 1: ISO 8601 dengan timezone (2025-06-18T03:40:10.000000Z)
        if (expiryString.contains('T') && expiryString.contains('Z')) {
          final parsed = DateTime.parse(expiryString).toLocal();
          print('✅ Parsed ISO Z format: $parsed');
          return parsed;
        }

        // Format 2: ISO 8601 dengan offset (+07:00, etc.)
        if (expiryString.contains('T') &&
            (expiryString.contains('+') || expiryString.contains('-'))) {
          final parsed = DateTime.parse(expiryString).toLocal();
          print('✅ Parsed ISO offset format: $parsed');
          return parsed;
        }

        // Format 3: MySQL datetime format "2025-06-18 10:40:10" (WIB/UTC+7)
        if (RegExp(
          r'^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$',
        ).hasMatch(expiryString)) {
          // PENTING: Parse sebagai UTC+7 (WIB) karena server menggunakan WIB
          DateTime parsedUTC = DateTime.parse(
            expiryString.replaceFirst(' ', 'T'),
          );

          // Konversi dari WIB (UTC+7) ke local time
          DateTime wibTime = parsedUTC.subtract(const Duration(hours: 7));
          DateTime localTime = wibTime.toLocal();

          print('✅ Parsed MySQL format as WIB: $expiryString -> $localTime');
          return localTime;
        }

        // Format 4: Coba parse langsung
        DateTime parsedDate = DateTime.parse(expiryString);

        // VALIDASI: Cek apakah waktu masuk akal (5-60 menit dari sekarang)
        final now = DateTime.now();
        final difference = parsedDate.difference(now);

        // Jika lebih dari 2 jam atau sudah lewat lebih dari 1 jam, kemungkinan timezone issue
        if (difference.inHours > 2 || difference.inHours < -1) {
          print(
            '⚠️ Possible timezone issue detected: ${difference.inMinutes} minutes from now',
          );

          // Coba adjust timezone (asumsi server WIB, client local)
          DateTime adjusted =
              parsedDate.subtract(const Duration(hours: 7)).toLocal();
          final adjustedDiff = adjusted.difference(now);

          if (adjustedDiff.inMinutes > 0 && adjustedDiff.inMinutes <= 60) {
            print(
              '✅ Timezone adjusted: $adjusted (${adjustedDiff.inMinutes} minutes)',
            );
            return adjusted;
          }

          // Fallback: set 5 menit dari sekarang
          print('🔄 Using 5 minutes fallback');
          return now.add(const Duration(minutes: 5));
        }

        return parsedDate.toLocal();
      } catch (e) {
        print('❌ Error parsing expiry_date: ${json['expiry_date']}, error: $e');

        // FALLBACK: Set ke 5 menit dari sekarang jika parsing gagal
        return DateTime.now().add(const Duration(minutes: 5));
      }
    }

    // Parse payment_date dengan menangani format ISO dan non-ISO
    DateTime? parsePaymentDate() {
      if (json['payment_date'] == null) return null;

      try {
        final paymentString = json['payment_date'].toString().trim();

        if (paymentString.isEmpty) return null;

        // Handle format ISO
        if (paymentString.contains('T')) {
          return DateTime.parse(paymentString).toLocal();
        }

        // Handle format MySQL datetime
        if (RegExp(
          r'^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$',
        ).hasMatch(paymentString)) {
          return DateTime.parse(paymentString.replaceFirst(' ', 'T')).toLocal();
        }

        return DateTime.parse(paymentString).toLocal();
      } catch (e) {
        print('Error parsing payment_date: ${json['payment_date']}, error: $e');
        return null;
      }
    }

    // Parse expiry date
    final expiryDate = parseExpiryDate();

    // Debugging log untuk expiry date
    if (expiryDate != null) {
      final now = DateTime.now();
      final diff = expiryDate.difference(now);
      print(
        '📅 Final expiry_date: $expiryDate (${diff.inMinutes} minutes from now)',
      );

      // Additional validation warning
      if (diff.inMinutes > 60) {
        print('⚠️ WARNING: Expiry date is more than 60 minutes from now');
      } else if (diff.inMinutes < 0) {
        print('⚠️ WARNING: Expiry date is in the past');
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
      expiryTime: expiryDate,
      paymentTime: parsePaymentDate(),
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
      rawData: rawData,
    );
  }

  void updateFromApiResponse(Map<String, dynamic> response) {
    try {
      print('🔄 Updating payment from API response: ${response.keys}');

      // Update virtual account number
      if (response['virtual_account_number'] != null) {
        virtualAccountNumber = response['virtual_account_number'];
        print('✅ Updated VA number: $virtualAccountNumber');
      }

      // Update QR code URL
      if (response['qr_code_url'] != null) {
        qrCodeUrl = response['qr_code_url'];
        print('✅ Updated QR code URL: $qrCodeUrl');
      }

      // Update deep link URL
      if (response['deep_link_url'] != null) {
        deepLinkUrl = response['deep_link_url'];
        print('✅ Updated deep link URL: $deepLinkUrl');
      }

      // Update status
      if (response['status'] != null) {
        status = response['status'];
        print('✅ Updated status: $status');
      }

      // Update payment method and type
      if (response['payment_method'] != null) {
        paymentMethod = response['payment_method'];
      }

      if (response['payment_channel'] != null) {
        paymentType = response['payment_channel'];
      }

      print('✅ Payment details updated from API response');
    } catch (e) {
      print('❌ Error updating payment from API response: $e');
    }
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

  // Cek apakah pembayaran sudah kedaluwarsa
  bool get isExpired {
    if (expiryTime == null) return false;
    return DateTime.now().isAfter(expiryTime!);
  }

  // Cek apakah pembayaran hampir kedaluwarsa (kurang dari 1 menit)
  bool get isNearExpiry {
    if (expiryTime == null) return false;
    final difference = expiryTime!.difference(DateTime.now());
    return difference.inMinutes < 1 && difference.inSeconds > 0;
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
      final now = DateTime.now();
      final diff = expiryTime!.difference(now);

      print('🔍 Payment Debug Info:');
      print('  Expiry Time: $expiryTime');
      print('  Current Time: $now');
      print(
        '  Difference: ${diff.inMinutes} minutes (${diff.inSeconds} seconds)',
      );
      print('  Is Local: ${!expiryTime!.isUtc ? "Yes" : "No (UTC)"}');
      print('  Is Expired: $isExpired');
      print('  Is Near Expiry: $isNearExpiry');
    } else {
      print('🔍 Payment Debug: Expiry Time is null');
    }
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
      } else if (type.contains('permata') ||
          virtualAccountNumber?.toLowerCase().contains('permata') == true) {
        return 'assets/images/payment_methods/permata.png';
      } else if (type.contains('cimb') ||
          virtualAccountNumber?.toLowerCase().contains('cimb') == true) {
        return 'assets/images/payment_methods/cimb.png';
      }
      return 'assets/images/payment_methods/bank.png';
    } else if (method.contains('e_wallet') || type.contains('e_wallet')) {
      if (type.contains('gopay')) {
        return 'assets/images/payment_methods/gopay.png';
      } else if (type.contains('shopeepay')) {
        return 'assets/images/payment_methods/shopeepay.png';
      }
      return 'assets/images/payment_methods/ewallet.png';
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
}
