import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../api/payment_api.dart';
import '../config/app_config.dart';
import '../utils/secure_storage.dart';
import '../models/payment_status.dart';

class PaymentPollingService {
  // Singleton instance
  static final PaymentPollingService _instance =
      PaymentPollingService._internal();
  factory PaymentPollingService() => _instance;
  PaymentPollingService._internal();

  // Dependencies
  final PaymentApi _paymentApi = PaymentApi();
  final SecureStorage _secureStorage = SecureStorage();
  final String _baseUrl = AppConfig.apiBaseUrl;

  // State management
  final Map<String, PollingSession> _activeSessions = {};
  final Map<String, StreamController<PaymentStatusUpdate>> _statusControllers =
      {};

  // Configuration
  final Duration _initialPollingInterval = const Duration(seconds: 5);
  final Duration _maxPollingInterval = const Duration(minutes: 5);
  final int _maxRetries = 20; // Maximum polling attempts per booking

  /// Mulai polling untuk kode booking tertentu
  ///
  /// [bookingCode] adalah kode unik untuk booking yang akan di-polling
  /// [initialDelay] adalah delay sebelum polling pertama dimulai
  /// [manual] menunjukkan apakah polling dimulai secara manual (dari UI)
  Future<void> startPolling(
    String bookingCode, {
    Duration initialDelay = Duration.zero,
    bool manual = false,
  }) async {
    if (_activeSessions.containsKey(bookingCode)) {
      // Jika sudah ada session, aktifkan kembali jika dinonaktifkan
      if (!_activeSessions[bookingCode]!.isActive) {
        _activeSessions[bookingCode]!.isActive = true;
        _schedulePoll(bookingCode);
      }
      return;
    }

    // Siapkan stream controller jika belum ada
    if (!_statusControllers.containsKey(bookingCode)) {
      _statusControllers[bookingCode] =
          StreamController<PaymentStatusUpdate>.broadcast();
    }

    // Buat session polling baru
    final session = PollingSession(
      currentInterval: _initialPollingInterval,
      retryCount: 0,
      lastChecked: null,
      isActive: true,
    );

    _activeSessions[bookingCode] = session;

    try {
      // Periksa status segera jika manual polling
      if (manual) {
        await _checkPaymentStatus(bookingCode);
      } else {
        // Tunggu delay awal sebelum mulai polling
        await Future.delayed(initialDelay);
        _schedulePoll(bookingCode);
      }
    } catch (e) {
      debugPrint('Error starting polling: $e');
    }
  }

  /// Dapatkan stream untuk updates status pembayaran
  Stream<PaymentStatusUpdate> getStatusStream(String bookingCode) {
    if (!_statusControllers.containsKey(bookingCode)) {
      _statusControllers[bookingCode] =
          StreamController<PaymentStatusUpdate>.broadcast();
    }
    return _statusControllers[bookingCode]!.stream;
  }

  /// Hentikan polling untuk kode booking tertentu
  void stopPolling(String bookingCode) {
    final session = _activeSessions[bookingCode];
    if (session != null) {
      session.isActive = false;
      session.timer?.cancel();
      debugPrint('Stopped polling for booking: $bookingCode');
    }
  }

  /// Hentikan semua polling yang aktif
  void stopAllPolling() {
    for (final bookingCode in _activeSessions.keys) {
      stopPolling(bookingCode);
    }
    debugPrint('Stopped all active polling sessions');
  }

  /// Jadwalkan polling selanjutnya dengan exponential backoff
  void _schedulePoll(String bookingCode) {
    final session = _activeSessions[bookingCode];
    if (session == null || !session.isActive) return;

    // Batalkan timer yang sudah ada jika ada
    session.timer?.cancel();

    // Jadwalkan polling selanjutnya
    session.timer = Timer(session.currentInterval, () {
      _checkPaymentStatus(bookingCode);
    });

    debugPrint(
      'Next payment check for $bookingCode in ${session.currentInterval.inSeconds} seconds',
    );
  }

  /// Metode untuk pemeriksaan status pembayaran
  Future<void> _checkPaymentStatus(String bookingCode) async {
    final session = _activeSessions[bookingCode];
    if (session == null || !session.isActive) return;

    try {
      // Catat waktu polling terakhir
      session.lastChecked = DateTime.now();
      session.retryCount++;

      // Get token untuk request
      final token = await _secureStorage.getToken();

      // Panggil endpoint publik untuk refresh status
      final response = await http.get(
        Uri.parse('$_baseUrl/payments/$bookingCode/refresh-status'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      // Jika sukses, ambil data dari response
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        if (data['success'] == true) {
          final responseData = data['data'] ?? {};

          // Buat objek update status
          final update = PaymentStatusUpdate(
            bookingCode: bookingCode,
            paymentStatus: responseData['payment_status'] ?? 'UNKNOWN',
            bookingStatus: responseData['booking_status'] ?? 'UNKNOWN',
            transactionId: responseData['transaction_id'],
            message: data['message'] ?? 'Status pembayaran berhasil diperbarui',
            timestamp: DateTime.now(),
            isError: false,
          );

          // Notify listeners
          if (_statusControllers.containsKey(bookingCode)) {
            _statusControllers[bookingCode]!.add(update);
          }

          // Cek apakah pembayaran sudah selesai atau gagal
          final isCompleted = _isPaymentCompleted(
            update.paymentStatus,
            update.bookingStatus,
          );

          if (isCompleted) {
            // Hentikan polling jika status sudah final
            stopPolling(bookingCode);

            // Delay close controller agar UI dapat menampilkan status terakhir
            Future.delayed(const Duration(seconds: 10), () {
              _cleanupResources(bookingCode);
            });

            return;
          }

          // Jika respon berhasil, kurangi interval (mempercepat polling untuk status success)
          _adjustPollingInterval(session, success: true);
        } else {
          // Jika success: false, notify dengan error
          if (_statusControllers.containsKey(bookingCode)) {
            _statusControllers[bookingCode]!.add(
              PaymentStatusUpdate(
                bookingCode: bookingCode,
                paymentStatus: 'UNKNOWN',
                bookingStatus: 'UNKNOWN',
                message:
                    'Gagal memperbarui status: ${data['message'] ?? 'Unknown error'}',
                timestamp: DateTime.now(),
                isError: true,
              ),
            );
          }

          // Jika respon gagal, tingkatkan interval (exponential backoff)
          _adjustPollingInterval(session, success: false);
        }
      } else {
        // Jika response code bukan 200, notify dengan error
        if (_statusControllers.containsKey(bookingCode)) {
          _statusControllers[bookingCode]!.add(
            PaymentStatusUpdate(
              bookingCode: bookingCode,
              paymentStatus: 'UNKNOWN',
              bookingStatus: 'UNKNOWN',
              message: 'Gagal memperbarui status: ${response.statusCode}',
              timestamp: DateTime.now(),
              isError: true,
            ),
          );
        }

        // Jika respon gagal, tingkatkan interval (exponential backoff)
        _adjustPollingInterval(session, success: false);
      }

      // Cek jika sudah melebihi batas retry
      if (session.retryCount >= _maxRetries) {
        stopPolling(bookingCode);

        // Notify listeners bahwa polling dihentikan karena max retries
        if (_statusControllers.containsKey(bookingCode)) {
          _statusControllers[bookingCode]!.add(
            PaymentStatusUpdate(
              bookingCode: bookingCode,
              paymentStatus: 'UNKNOWN',
              bookingStatus: 'UNKNOWN',
              message: 'Batas maksimum pemeriksaan status tercapai',
              timestamp: DateTime.now(),
              isError: true,
            ),
          );
        }

        return;
      }

      // Jadwalkan polling selanjutnya
      _schedulePoll(bookingCode);
    } catch (e) {
      debugPrint('Error checking payment status: $e');

      // Notify listeners dengan error
      if (_statusControllers.containsKey(bookingCode)) {
        _statusControllers[bookingCode]!.add(
          PaymentStatusUpdate(
            bookingCode: bookingCode,
            paymentStatus: 'UNKNOWN',
            bookingStatus: 'UNKNOWN',
            message: 'Error: ${e.toString()}',
            timestamp: DateTime.now(),
            isError: true,
          ),
        );
      }

      // Tingkatkan interval untuk exponential backoff
      _adjustPollingInterval(session, success: false);

      // Jadwalkan polling selanjutnya jika masih aktif
      if (session.isActive) {
        _schedulePoll(bookingCode);
      }
    }
  }

  /// Sesuaikan interval polling dengan exponential backoff
  void _adjustPollingInterval(PollingSession session, {required bool success}) {
    if (success) {
      // Jika berhasil, kurangi interval polling (max 5 detik)
      session.currentInterval = const Duration(seconds: 5);
    } else {
      // Jika gagal, tingkatkan interval dengan exponential backoff
      // Formula: min(maxInterval, initialInterval * 2^retryCount)
      final backoffFactor = (1 << session.retryCount.clamp(0, 6));
      final nextIntervalSeconds =
          _initialPollingInterval.inSeconds * backoffFactor;
      session.currentInterval = Duration(
        seconds: nextIntervalSeconds.clamp(
          _initialPollingInterval.inSeconds,
          _maxPollingInterval.inSeconds,
        ),
      );
    }
  }

  /// Cek apakah pembayaran sudah selesai atau gagal
  bool _isPaymentCompleted(String paymentStatus, String bookingStatus) {
    // Dianggap selesai jika payment status bukan PENDING
    if (paymentStatus != 'PENDING') {
      return true;
    }

    // Dianggap selesai jika booking status sudah CONFIRMED atau CANCELLED
    if (bookingStatus == 'CONFIRMED' || bookingStatus == 'CANCELLED') {
      return true;
    }

    return false;
  }

  /// Bersihkan resources untuk booking tertentu
  void _cleanupResources(String bookingCode) {
    // Hapus session dari active sessions
    _activeSessions.remove(bookingCode);

    // Tutup stream controller jika tidak ada listeners
    final controller = _statusControllers[bookingCode];
    if (controller != null && !controller.hasListener) {
      controller.close();
      _statusControllers.remove(bookingCode);
    }
  }

  /// Bersihkan semua resources saat aplikasi ditutup
  void dispose() {
    // Hentikan semua timers
    for (final session in _activeSessions.values) {
      session.timer?.cancel();
    }

    // Tutup semua stream controllers
    for (final controller in _statusControllers.values) {
      controller.close();
    }

    // Kosongkan maps
    _activeSessions.clear();
    _statusControllers.clear();
  }

  /// Metode untuk polling manual satu kali
  Future<PaymentStatusUpdate> checkPaymentOnce(String bookingCode) async {
    try {
      final token = await _secureStorage.getToken();

      final response = await http.get(
        Uri.parse('$_baseUrl/payments/$bookingCode/refresh-status'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        if (data['success'] == true) {
          final responseData = data['data'] ?? {};

          return PaymentStatusUpdate(
            bookingCode: bookingCode,
            paymentStatus: responseData['payment_status'] ?? 'UNKNOWN',
            bookingStatus: responseData['booking_status'] ?? 'UNKNOWN',
            transactionId: responseData['transaction_id'],
            message: data['message'] ?? 'Status pembayaran berhasil diperbarui',
            timestamp: DateTime.now(),
            isError: false,
          );
        } else {
          return PaymentStatusUpdate(
            bookingCode: bookingCode,
            paymentStatus: 'UNKNOWN',
            bookingStatus: 'UNKNOWN',
            message:
                'Gagal memperbarui status: ${data['message'] ?? 'Unknown error'}',
            timestamp: DateTime.now(),
            isError: true,
          );
        }
      } else {
        return PaymentStatusUpdate(
          bookingCode: bookingCode,
          paymentStatus: 'UNKNOWN',
          bookingStatus: 'UNKNOWN',
          message: 'Gagal memperbarui status: ${response.statusCode}',
          timestamp: DateTime.now(),
          isError: true,
        );
      }
    } catch (e) {
      return PaymentStatusUpdate(
        bookingCode: bookingCode,
        paymentStatus: 'UNKNOWN',
        bookingStatus: 'UNKNOWN',
        message: 'Error: ${e.toString()}',
        timestamp: DateTime.now(),
        isError: true,
      );
    }
  }
}

/// Class untuk menyimpan informasi session polling
class PollingSession {
  Timer? timer;
  Duration currentInterval;
  int retryCount;
  DateTime? lastChecked;
  bool isActive;

  PollingSession({
    this.timer,
    required this.currentInterval,
    required this.retryCount,
    this.lastChecked,
    required this.isActive,
  });
}

/// Class untuk menyimpan informasi update status pembayaran
class PaymentStatusUpdate {
  final String bookingCode;
  final String paymentStatus;
  final String bookingStatus;
  final String? transactionId;
  final String message;
  final DateTime timestamp;
  final bool isError;

  PaymentStatusUpdate({
    required this.bookingCode,
    required this.paymentStatus,
    required this.bookingStatus,
    this.transactionId,
    required this.message,
    required this.timestamp,
    required this.isError,
  });
}
