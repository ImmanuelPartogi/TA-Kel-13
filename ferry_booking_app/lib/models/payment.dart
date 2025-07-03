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
    Map<String, dynamic>? rawData;
    try {
      rawData = Map<String, dynamic>.from(json);

      // Khusus tangani field payload yang bermasalah
      if (json.containsKey('payload')) {
        try {
          var payload = json['payload'];
          if (payload is String) {
            // Hanya simpan payload sebagai string tanpa berusaha mem-parse
            rawData['payload'] = payload;
          }
        } catch (e) {
          print('Error handling payload: $e');
        }
      }
    } catch (e) {
      print('Error creating raw data: $e');
      rawData = {};
    }

    // Fungsi helper yang aman untuk mengambil nilai
    T? safeGet<T>(String key, {T? defaultValue}) {
      try {
        if (!json.containsKey(key) || json[key] == null) {
          return defaultValue;
        }

        if (json[key] is T) {
          return json[key] as T;
        }

        // Konversi tipe jika diperlukan
        if (T == int && json[key] is String) {
          try {
            return int.parse(json[key] as String) as T;
          } catch (_) {
            return defaultValue;
          }
        }

        if (T == double && json[key] is String) {
          try {
            return double.parse(json[key] as String) as T;
          } catch (_) {
            return defaultValue;
          }
        }

        if (T == String) {
          return json[key].toString() as T;
        }

        return defaultValue;
      } catch (_) {
        return defaultValue;
      }
    }

    // Perbaikan: Parse expiry_date dengan penanganan yang lebih robust
    DateTime? parseExpiryDate() {
      if (!json.containsKey('expiry_date') || json['expiry_date'] == null) {
        return null;
      }

      try {
        final value = json['expiry_date'].toString();

        // Coba parse sebagai ISO format
        try {
          return DateTime.parse(value).toLocal();
        } catch (_) {
          // Coba format lainnya
          try {
            final dateFormat = DateFormat('yyyy-MM-dd HH:mm:ss');
            return dateFormat.parse(value).toLocal();
          } catch (_) {
            print('Error parsing expiry_date: $value');
            return DateTime.now().add(const Duration(minutes: 5));
          }
        }
      } catch (e) {
        print('General error handling expiry_date: $e');
        return null;
      }
    }

    // Parse payment_date dengan cara yang sama
    DateTime? parsePaymentDate() {
      if (!json.containsKey('payment_date') || json['payment_date'] == null) {
        return null;
      }

      try {
        final value = json['payment_date'].toString();

        try {
          return DateTime.parse(value).toLocal();
        } catch (_) {
          try {
            final dateFormat = DateFormat('yyyy-MM-dd HH:mm:ss');
            return dateFormat.parse(value).toLocal();
          } catch (_) {
            print('Error parsing payment_date: $value');
            return null;
          }
        }
      } catch (e) {
        print('General error handling payment_date: $e');
        return null;
      }
    }

    // Debugging
    final expiryDate = parseExpiryDate();
    if (expiryDate != null) {
      final now = DateTime.now();
      final diff = expiryDate.difference(now);
      // print(
      //   'Parsed expiry_date: $expiryDate (${diff.inMinutes} minutes from now)',
      // );
    }

    // Buat objek dengan error handling yang lebih baik
    try {
      return Payment(
        id: safeGet<int>('id', defaultValue: -1)!,
        bookingId: safeGet<int>('booking_id', defaultValue: -1)!,
        paymentCode:
            safeGet<String>('payment_code') ??
            safeGet<String>('transaction_id') ??
            '',
        amount: double.parse(
          safeGet<dynamic>('amount', defaultValue: 0).toString(),
        ),
        status: safeGet<String>('status', defaultValue: 'UNKNOWN')!,
        paymentMethod:
            safeGet<String>('payment_method', defaultValue: 'VIRTUAL_ACCOUNT')!,
        paymentType:
            safeGet<String>('payment_type') ??
            safeGet<String>('payment_channel') ??
            'virtual_account',
        virtualAccountNumber:
            safeGet<String>('virtual_account_number') ??
            safeGet<String>('external_reference'),
        deepLinkUrl: safeGet<String>('deep_link_url'),
        qrCodeUrl: safeGet<String>('qr_code_url'),
        expiryTime: expiryDate,
        paymentTime: parsePaymentDate(),
        createdAt:
            safeGet<String>(
              'created_at',
              defaultValue: DateTime.now().toIso8601String(),
            )!,
        updatedAt:
            safeGet<String>(
              'updated_at',
              defaultValue: DateTime.now().toIso8601String(),
            )!,
        rawData: rawData,
      );
    } catch (e) {
      print('Critical error creating Payment object: $e');
      // Fallback ke objek minimal
      return Payment(
        id: -1,
        bookingId: -1,
        amount: 0,
        status: 'ERROR',
        paymentMethod: 'UNKNOWN',
        paymentType: 'unknown',
        createdAt: DateTime.now().toIso8601String(),
        updatedAt: DateTime.now().toIso8601String(),
      );
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
