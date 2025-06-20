import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../utils/secure_storage.dart';
import '../utils/api_exception.dart';
import 'dart:io' show Platform;

class PaymentApi {
  final String baseUrl = AppConfig.apiBaseUrl;
  final SecureStorage _secureStorage = SecureStorage();

  // Mendapatkan status pembayaran
  Future<Map<String, dynamic>> getPaymentStatus(String bookingCode) async {
    try {
      final token = await _getTokenWithFallback();

      final response = await http.get(
        Uri.parse('$baseUrl/payments/status/$bookingCode'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('Status response: ${response.statusCode}');
      print('Status body: ${response.body}');

      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      } else {
        throw ApiException(
          code: response.statusCode,
          message:
              _getErrorMessage(response) ??
              'Gagal mendapatkan status pembayaran',
        );
      }
    } catch (e) {
      print('Error in getPaymentStatus: $e');
      throw ApiException(
        code: e is ApiException ? e.code : 500,
        message:
            'Terjadi kesalahan saat memeriksa status pembayaran: ${e.toString()}',
      );
    }
  }

  // Memproses pembayaran langsung
  Future<Map<String, dynamic>> processPayment(
    String bookingCode,
    String paymentMethod,
    String paymentType,
  ) async {
    try {
      final token = await _getTokenWithFallback();

      // Deteksi platform
      final platform =
          Platform.isAndroid
              ? 'android'
              : Platform.isIOS
              ? 'ios'
              : 'web';

      // TAMBAHKAN: Konversi semua e_wallet ke qris
      if (paymentType == 'e_wallet') {
        paymentMethod = 'qris';
        paymentType = 'qris';
      }

      print('Memproses pembayaran untuk booking: $bookingCode');
      print('Method: $paymentMethod, Type: $paymentType');

      final response = await http.post(
        Uri.parse('$baseUrl/payments/$bookingCode/create'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer $token',
          'X-Platform': platform,
        },
        body: json.encode({
          'payment_method': paymentMethod,
          'payment_type': paymentType,
          'platform': platform,
        }),
      );

      print('Process payment response status: ${response.statusCode}');
      print('Process payment response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = json.decode(response.body)['data'];

        // TAMBAHKAN: Penanganan QR string yang panjang
        if (paymentMethod == 'qris' && responseData.containsKey('qr_string')) {
          // Buat struktur respons yang tidak akan menyebabkan masalah dengan external_reference
          return {
            'transaction_id': responseData['transaction_id'],
            'qr_code_url':
                responseData['actions']?[0]?['url'] ??
                responseData['qr_code_url'],
            // Simpan QR string di payload sebagai JSON, bukan di external_reference
            'payload': json.encode({'qr_string': responseData['qr_string']}),
          };
        }

        return responseData;
      } else {
        throw ApiException(
          code: response.statusCode,
          message: _getErrorMessage(response) ?? 'Gagal memproses pembayaran',
        );
      }
    } catch (e) {
      print('Error dalam processPayment: $e');
      throw ApiException(
        code: e is ApiException ? e.code : 500,
        message: 'Terjadi kesalahan saat memproses pembayaran: ${e.toString()}',
      );
    }
  }

  // Get token dengan multiple fallback
  Future<String> _getTokenWithFallback() async {
    final tokenFromStorage = await _secureStorage.getToken();
    if (tokenFromStorage != null && tokenFromStorage.isNotEmpty) {
      return tokenFromStorage;
    }

    throw ApiException(
      code: 401,
      message: 'Token autentikasi tidak tersedia. Silakan login kembali.',
    );
  }

  // Mendapatkan instruksi pembayaran
  Future<Map<String, dynamic>> getPaymentInstructions(
    String paymentMethod,
    String paymentType,
  ) async {
    try {
      // TAMBAHKAN: Konversi semua e_wallet ke qris
      if (paymentType == 'e_wallet') {
        paymentMethod = 'qris';
        paymentType = 'qris';
      }

      final token = await _getTokenWithFallback();

      final response = await http.get(
        Uri.parse('$baseUrl/payments/instructions/$paymentType/$paymentMethod'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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

  // Helper untuk error message
  String? _getErrorMessage(http.Response response) {
    try {
      final data = json.decode(response.body);
      return data['message'];
    } catch (e) {
      return null;
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
              'Transaksi selesai',
            ],
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
              'Transaksi selesai',
            ],
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
              'Transaksi selesai',
            ],
          };
        case 'permata':
          return {
            'title': 'Permata Virtual Account',
            'steps': [
              'Buka aplikasi PermataMobile X',
              'Pilih menu "Pembayaran"',
              'Pilih "Virtual Account"',
              'Masukkan nomor Virtual Account',
              'Pastikan nama dan jumlah pembayaran sudah sesuai',
              'Masukkan password transaksi',
              'Transaksi selesai',
            ],
          };
        case 'cimb':
          return {
            'title': 'CIMB Virtual Account',
            'steps': [
              'Buka aplikasi OCTO Mobile',
              'Pilih menu "Transfer"',
              'Pilih "Virtual Account"',
              'Masukkan nomor Virtual Account',
              'Pastikan nama dan jumlah pembayaran sudah sesuai',
              'Masukkan password transaksi',
              'Transaksi selesai',
            ],
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
              'Transaksi selesai',
            ],
          };
      }
    } else if (type == 'qris' || type == 'e_wallet') {
      return {
        'title': 'QRIS',
        'steps': [
          'Buka aplikasi e-wallet atau mobile banking yang mendukung QRIS',
          'Pilih menu "Scan QR"',
          'Scan QR Code yang ditampilkan di halaman pembayaran',
          'Pastikan nama merchant dan nominal pembayaran sudah sesuai',
          'Konfirmasi pembayaran',
          'Masukkan PIN atau password',
          'Transaksi selesai',
        ],
      };
    }

    return {
      'title': 'Instruksi Pembayaran',
      'steps': ['Mohon maaf, instruksi pembayaran tidak tersedia'],
    };
  }
}
