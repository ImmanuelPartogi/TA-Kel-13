import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../utils/secure_storage.dart';
import '../utils/api_exception.dart';

class PaymentApi {
  final String baseUrl = AppConfig.apiBaseUrl;
  final SecureStorage _secureStorage = SecureStorage();

  // Mendapatkan status pembayaran
  Future<Map<String, dynamic>> getPaymentStatus(String bookingCode) async {
    try {
      final token = await _secureStorage.getToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/api/payments/status/$bookingCode'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      } else {
        throw ApiException(
          code: response.statusCode,
          message: json.decode(response.body)['message'] ?? 'Gagal mendapatkan status pembayaran',
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        code: 500,
        message: 'Terjadi kesalahan saat memeriksa status pembayaran: ${e.toString()}',
      );
    }
  }

  // Memproses pembayaran dengan metode yang dipilih
  Future<Map<String, dynamic>> processPayment(
    String bookingCode, 
    String paymentMethod, 
    String paymentType
  ) async {
    try {
      final token = await _secureStorage.getToken();
      
      final response = await http.post(
        Uri.parse('$baseUrl/api/payments/process'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'booking_code': bookingCode,
          'payment_method': paymentMethod,
          'payment_type': paymentType,
        }),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      } else {
        throw ApiException(
          code: response.statusCode,
          message: json.decode(response.body)['message'] ?? 'Gagal memproses pembayaran',
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        code: 500,
        message: 'Terjadi kesalahan saat memproses pembayaran: ${e.toString()}',
      );
    }
  }

  // Mendapatkan instruksi pembayaran berdasarkan metode
  Future<Map<String, dynamic>> getPaymentInstructions(
    String paymentMethod, 
    String paymentType
  ) async {
    try {
      final token = await _secureStorage.getToken();

      final response = await http.get(
        Uri.parse('$baseUrl/api/payments/instructions/$paymentType/$paymentMethod'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      } else {
        // Fallback ke instruksi statis jika API tidak tersedia
        return _getStaticInstructions(paymentMethod, paymentType);
      }
    } catch (e) {
      // Fallback ke instruksi statis jika terjadi error
      return _getStaticInstructions(paymentMethod, paymentType);
    }
  }
  
  // Instruksi pembayaran statis sebagai fallback
  Map<String, dynamic> _getStaticInstructions(String method, String type) {
    if (type == 'virtual_account') {
      switch (method.toLowerCase()) {
        case 'bca':
          return {
            'title': 'BCA Virtual Account',
            'steps': [
              'Buka aplikasi BCA Mobile atau m-BCA',
              'Pilih menu "m-Transfer" atau "Transfer"',
              'Pilih "BCA Virtual Account"',
              'Masukkan nomor Virtual Account',
              'Pastikan nama dan jumlah pembayaran sudah sesuai',
              'Masukkan PIN m-BCA atau password',
              'Transaksi selesai'
            ]
          };
        case 'bni':
          return {
            'title': 'BNI Virtual Account',
            'steps': [
              'Buka aplikasi BNI Mobile Banking',
              'Pilih menu "Transfer"',
              'Pilih "Virtual Account Billing"',
              'Masukkan nomor Virtual Account',
              'Pastikan nama dan jumlah pembayaran sudah sesuai',
              'Masukkan password transaksi',
              'Transaksi selesai'
            ]
          };
        case 'bri':
          return {
            'title': 'BRI Virtual Account',
            'steps': [
              'Buka aplikasi BRImo',
              'Pilih menu "Pembayaran"',
              'Pilih "BRIVA"',
              'Masukkan nomor Virtual Account',
              'Pastikan nama dan jumlah pembayaran sudah sesuai',
              'Masukkan PIN BRImo',
              'Transaksi selesai'
            ]
          };
        case 'mandiri':
          return {
            'title': 'Mandiri Bill Payment',
            'steps': [
              'Buka aplikasi Livin by Mandiri',
              'Pilih menu "Pembayaran"',
              'Pilih "Multi Payment"',
              'Cari dan pilih nama perusahaan',
              'Masukkan nomor pembayaran',
              'Pastikan nama dan jumlah pembayaran sudah sesuai',
              'Masukkan PIN Livin',
              'Transaksi selesai'
            ]
          };
        default:
          return {
            'title': 'Virtual Account',
            'steps': [
              'Buka aplikasi Mobile Banking',
              'Pilih menu Transfer/Pembayaran',
              'Pilih Virtual Account',
              'Masukkan nomor Virtual Account',
              'Konfirmasi detail pembayaran',
              'Masukkan PIN',
              'Transaksi selesai'
            ]
          };
      }
    } else if (type == 'e_wallet') {
      switch (method.toLowerCase()) {
        case 'gopay':
          return {
            'title': 'GoPay',
            'steps': [
              'Buka aplikasi Gojek',
              'Tap tombol "Scan QR"',
              'Scan QR Code yang ditampilkan di halaman pembayaran',
              'Pastikan nominal pembayaran sudah sesuai',
              'Tap tombol "Bayar"',
              'Masukkan PIN GoPay',
              'Transaksi selesai'
            ]
          };
        case 'shopeepay':
          return {
            'title': 'ShopeePay',
            'steps': [
              'Buka aplikasi Shopee',
              'Tap tombol "Scan" pada menu bawah',
              'Scan QR Code yang ditampilkan di halaman pembayaran',
              'Pastikan nominal pembayaran sudah sesuai',
              'Tap tombol "Bayar"',
              'Masukkan PIN ShopeePay',
              'Transaksi selesai'
            ]
          };
        case 'dana':
          return {
            'title': 'DANA',
            'steps': [
              'Buka aplikasi DANA',
              'Tap tombol "Scan QR"',
              'Scan QR Code yang ditampilkan di halaman pembayaran',
              'Pastikan nominal pembayaran sudah sesuai',
              'Tap tombol "Bayar"',
              'Masukkan PIN DANA',
              'Transaksi selesai'
            ]
          };
        case 'ovo':
          return {
            'title': 'OVO',
            'steps': [
              'Buka aplikasi OVO',
              'Tap tombol "Scan"',
              'Scan QR Code yang ditampilkan di halaman pembayaran',
              'Pastikan nominal pembayaran sudah sesuai',
              'Tap tombol "Bayar"',
              'Masukkan PIN OVO',
              'Transaksi selesai'
            ]
          };
        default:
          return {
            'title': 'E-wallet',
            'steps': [
              'Buka aplikasi E-wallet',
              'Pilih menu "Scan QR"',
              'Scan QR code yang ditampilkan',
              'Konfirmasi detail pembayaran',
              'Masukkan PIN',
              'Transaksi selesai'
            ]
          };
      }
    }
    
    return {
      'title': 'Instruksi Pembayaran',
      'steps': ['Mohon maaf, instruksi pembayaran tidak tersedia']
    };
  }
}