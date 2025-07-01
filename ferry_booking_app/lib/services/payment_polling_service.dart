import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../api/payment_api.dart';
import '../config/app_config.dart';
import '../utils/secure_storage.dart';
import '../models/payment_status.dart';

class PaymentPollingService {
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

  // PERBAIKAN: Konfigurasi polling yang lebih efisien
  final Duration _initialPollingInterval = const Duration(
    seconds: 10,
  ); // Diperlambat dari 3 detik
  final Duration _maxPollingInterval = const Duration(
    seconds: 60,
  ); // Diperlambat dari 30 detik
  final int _maxRetries = 18; // 18 x 10 detik = 3 menit maksimal

  /// Mulai polling untuk kode booking tertentu
  Future<void> startPolling(
    String bookingCode, {
    Duration initialDelay = Duration.zero,
    bool manual = false,
  }) async {
    if (_activeSessions.containsKey(bookingCode)) {
      if (!_activeSessions[bookingCode]!.isActive) {
        _activeSessions[bookingCode]!.isActive = true;
        _schedulePoll(bookingCode);
      }
      return;
    }

    if (!_statusControllers.containsKey(bookingCode)) {
      _statusControllers[bookingCode] =
          StreamController<PaymentStatusUpdate>.broadcast();
    }

    final session = PollingSession(
      currentInterval: _initialPollingInterval,
      retryCount: 0,
      lastChecked: null,
      isActive: true,
    );

    _activeSessions[bookingCode] = session;

    try {
      if (manual) {
        await _checkPaymentStatus(bookingCode);
      } else {
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

  /// PERBAIKAN: Jadwalkan polling dengan interval yang lebih wajar
  void _schedulePoll(String bookingCode) {
    final session = _activeSessions[bookingCode];
    if (session == null || !session.isActive) return;

    session.timer?.cancel();

    session.timer = Timer(session.currentInterval, () {
      _checkPaymentStatus(bookingCode);
    });

    debugPrint(
      'Next payment check for $bookingCode in ${session.currentInterval.inSeconds} seconds',
    );
  }

  /// PERBAIKAN: Pemeriksaan status dengan rate limiting
  Future<void> _checkPaymentStatus(String bookingCode) async {
    final session = _activeSessions[bookingCode];
    if (session == null || !session.isActive) return;

    // PERBAIKAN: Rate limiting - jangan polling terlalu sering
    if (session.lastChecked != null) {
      final timeSinceLastCheck = DateTime.now().difference(
        session.lastChecked!,
      );
      if (timeSinceLastCheck.inSeconds < 5) {
        debugPrint(
          'Skipping check for $bookingCode - too soon since last check',
        );
        _schedulePoll(bookingCode);
        return;
      }
    }

    try {
      session.lastChecked = DateTime.now();
      session.retryCount++;

      final token = await _secureStorage.getToken();

      // PERBAIKAN: Tambahkan penanganan error DNS lookup
      http.Response? response;
      try {
        response = await http
            .get(
              Uri.parse('$_baseUrl/payments/$bookingCode/refresh-status'),
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                if (token != null) 'Authorization': 'Bearer $token',
              },
            )
            .timeout(
              const Duration(seconds: 15),
              onTimeout: () {
                throw TimeoutException(
                  'Request timeout',
                  const Duration(seconds: 15),
                );
              },
            );
      } catch (requestError) {
        // Tangani error khusus DNS lookup
        if (requestError.toString().contains('lookup') ||
            requestError.toString().contains('SocketException')) {
          debugPrint('DNS lookup error untuk $bookingCode: $requestError');

          // Notifikasi UI dengan error yang lebih informatif
          if (_statusControllers.containsKey(bookingCode)) {
            _statusControllers[bookingCode]!.add(
              PaymentStatusUpdate(
                bookingCode: bookingCode,
                paymentStatus: 'UNKNOWN',
                bookingStatus: 'UNKNOWN',
                message:
                    'Koneksi internet terputus. Pastikan Anda terhubung ke internet.',
                timestamp: DateTime.now(),
                isError: true,
              ),
            );
          }

          // Sesuaikan interval polling - tunggu lebih lama untuk koneksi internet
          _adjustPollingInterval(
            session,
            success: false,
            isConnectionError: true,
          );

          if (session.isActive) {
            _schedulePoll(bookingCode);
          }
          return;
        }

        rethrow;
      }
      // PERBAIKAN: Check max retries dengan lebih flexible
      if (session.retryCount >= _maxRetries) {
        debugPrint('Max retries reached for $bookingCode, stopping polling');
        _notifyMaxRetriesReached(bookingCode);
        stopPolling(bookingCode);
        return;
      }

      // Jadwalkan polling selanjutnya
      if (session.isActive) {
        _schedulePoll(bookingCode);
      }
    } on TimeoutException catch (e) {
      debugPrint('Timeout checking payment status for $bookingCode: $e');
      _handleErrorResponse(bookingCode, session, 'Request timeout');

      if (session.isActive && session.retryCount < _maxRetries) {
        _schedulePoll(bookingCode);
      }
    } catch (e) {
      debugPrint('Error checking payment status for $bookingCode: $e');
      _handleErrorResponse(bookingCode, session, e.toString());

      if (session.isActive && session.retryCount < _maxRetries) {
        _schedulePoll(bookingCode);
      }
    }
  }

  /// PERBAIKAN: Handle error response dengan lebih baik
  void _handleErrorResponse(
    String bookingCode,
    PollingSession session,
    String errorMessage,
  ) {
    if (_statusControllers.containsKey(bookingCode)) {
      _statusControllers[bookingCode]!.add(
        PaymentStatusUpdate(
          bookingCode: bookingCode,
          paymentStatus: 'UNKNOWN',
          bookingStatus: 'UNKNOWN',
          message: 'Gagal memperbarui status: $errorMessage',
          timestamp: DateTime.now(),
          isError: true,
        ),
      );
    }

    _adjustPollingInterval(session, success: false);
  }

  /// PERBAIKAN: Notify ketika max retries tercapai
  void _notifyMaxRetriesReached(String bookingCode) {
    if (_statusControllers.containsKey(bookingCode)) {
      _statusControllers[bookingCode]!.add(
        PaymentStatusUpdate(
          bookingCode: bookingCode,
          paymentStatus: 'UNKNOWN',
          bookingStatus: 'UNKNOWN',
          message:
              'Pemeriksaan status dihentikan. Silakan refresh manual jika diperlukan.',
          timestamp: DateTime.now(),
          isError: true,
        ),
      );
    }
  }

  /// PERBAIKAN: Sesuaikan interval dengan lebih smart
  void _adjustPollingInterval(
    PollingSession session, {
    required bool success,
    String? status,
    bool isRateLimit = false,
    bool isConnectionError = false, // Parameter baru
  }) {
    if (success) {
      // Jika sukses, sesuaikan interval berdasarkan status
      if (status == 'PENDING') {
        // Untuk status pending, polling setiap 15 detik
        session.currentInterval = const Duration(seconds: 15);
      } else {
        // Untuk status lain, polling setiap 10 detik
        session.currentInterval = const Duration(seconds: 10);
      }
    } else {
      // Jika gagal atau rate limited, gunakan exponential backoff
      if (isRateLimit) {
        // Untuk rate limit, tunggu lebih lama
        session.currentInterval = Duration(
          seconds: ((session.currentInterval.inSeconds * 1.5).clamp(20, 90)).toInt(),
        );
      } else {
        // Untuk error lain, backoff normal
        final backoffFactor = (1 << (session.retryCount ~/ 3).clamp(0, 4));
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

    debugPrint(
      'Adjusted polling interval for ${session.currentInterval.inSeconds}s (success: $success, rate_limit: $isRateLimit)',
    );
  }

  /// Cek apakah pembayaran sudah selesai
  bool _isPaymentCompleted(String paymentStatus, String bookingStatus) {
    // PERBAIKAN: Daftar status yang lebih lengkap
    const completedPaymentStatuses = [
      'SUCCESS',
      'FAILED',
      'EXPIRED',
      'REFUNDED',
      'CANCELLED',
    ];
    const completedBookingStatuses = ['CONFIRMED', 'CANCELLED', 'COMPLETED'];

    return completedPaymentStatuses.contains(paymentStatus.toUpperCase()) ||
        completedBookingStatuses.contains(bookingStatus.toUpperCase());
  }

  /// Bersihkan resources untuk booking tertentu
  void _cleanupResources(String bookingCode) {
    // PERBAIKAN: Cleanup dengan delay untuk memastikan UI update
    Future.delayed(const Duration(seconds: 5), () {
      _activeSessions.remove(bookingCode);

      final controller = _statusControllers[bookingCode];
      if (controller != null && !controller.hasListener) {
        controller.close();
        _statusControllers.remove(bookingCode);
      }
    });
  }

  /// Metode untuk polling manual satu kali
  Future<PaymentStatusUpdate> checkPaymentOnce(String bookingCode) async {
    try {
      final token = await _secureStorage.getToken();

      final response = await http
          .get(
            Uri.parse('$_baseUrl/payments/$bookingCode/refresh-status'),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              if (token != null) 'Authorization': 'Bearer $token',
            },
          )
          .timeout(const Duration(seconds: 10));

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
        }
      }

      return PaymentStatusUpdate(
        bookingCode: bookingCode,
        paymentStatus: 'UNKNOWN',
        bookingStatus: 'UNKNOWN',
        message: 'Gagal memperbarui status: ${response.statusCode}',
        timestamp: DateTime.now(),
        isError: true,
      );
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

  /// Bersihkan semua resources saat aplikasi ditutup
  void dispose() {
    for (final session in _activeSessions.values) {
      session.timer?.cancel();
    }

    for (final controller in _statusControllers.values) {
      controller.close();
    }

    _activeSessions.clear();
    _statusControllers.clear();
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
