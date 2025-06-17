import 'package:flutter/material.dart';
import 'package:ferry_booking_app/api/refund_api.dart';
import 'package:ferry_booking_app/models/refund.dart';

class RefundProvider extends ChangeNotifier {
  final RefundApi _refundApi = RefundApi();

  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;
  Refund? _currentRefund;
  List<Refund> _refundHistory = [];
  Map<String, dynamic>? _eligibilityData;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String? get successMessage => _successMessage;
  Refund? get currentRefund => _currentRefund;
  List<Refund> get refundHistory => _refundHistory;
  Map<String, dynamic>? get eligibilityData => _eligibilityData;

  // Metode baru untuk mendapatkan semua riwayat refund
  Future<void> getRefundHistoryByBookingId(
    int bookingId, {
    required bool Function() isMounted,
  }) async {
    _isLoading = true;
    if (isMounted()) notifyListeners();

    try {
      final response = await _refundApi.getAllRefundHistoryByBookingId(
        bookingId,
      );

      if (response['success'] == true && response['data'] != null) {
        _refundHistory =
            (response['data'] as List)
                .map((item) => Refund.fromJson(item))
                .toList();

        // Urutkan berdasarkan tanggal terbaru
        _refundHistory.sort((a, b) => b.createdAt.compareTo(a.createdAt));

        // Set current refund ke refund yang paling relevan (pending/approved/completed)
        _currentRefund = _getMostRelevantRefund(_refundHistory);
      } else {
        _refundHistory = [];
        _currentRefund = null;
      }

      _isLoading = false;
      if (isMounted()) notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = _parseErrorMessage(e.toString());
      if (isMounted()) notifyListeners();
    }
  }

  // Perbaikan untuk metode getRefundDetailsByBookingId
  Future<void> getRefundDetailsByBookingId(
    int bookingId, {
    required bool Function() isMounted,
  }) async {
    _isLoading = true;
    _errorMessage = null;

    if (isMounted()) notifyListeners();

    try {
      // Ambil riwayat refund terlebih dahulu
      await getRefundHistoryByBookingId(bookingId, isMounted: isMounted);

      // Jika tidak ada riwayat yang ditemukan, coba dapatkan refund terbaru saja
      if (_refundHistory.isEmpty) {
        final response = await _refundApi.getRefundDetailsByBookingId(
          bookingId,
        );

        if (response['success'] == true && response['data'] != null) {
          _currentRefund = Refund.fromJson(response['data']);
          _refundHistory = [_currentRefund!];
        } else {
          _currentRefund = null;
          _refundHistory = [];
        }
      }

      _isLoading = false;
      if (isMounted()) notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = _parseErrorMessage(e.toString());
      if (isMounted()) notifyListeners();
    }
  }

  // Helper untuk mendapatkan refund yang paling relevan
  Refund? _getMostRelevantRefund(List<Refund> refunds) {
    if (refunds.isEmpty) return null;

    // Prioritas: PENDING > APPROVED > PROCESSING > COMPLETED > REJECTED > CANCELLED
    final priorityOrder = {
      'PENDING': 0,
      'APPROVED': 1,
      'PROCESSING': 2,
      'COMPLETED': 3,
      'REJECTED': 4,
      'CANCELLED': 5,
    };

    // Urutkan berdasarkan prioritas status, lalu berdasarkan waktu (terbaru)
    refunds.sort((a, b) {
      final priorityA = priorityOrder[a.status.toUpperCase()] ?? 999;
      final priorityB = priorityOrder[b.status.toUpperCase()] ?? 999;

      if (priorityA == priorityB) {
        // Jika status sama, prioritaskan yang terbaru
        return b.createdAt.compareTo(a.createdAt);
      }

      return priorityA.compareTo(priorityB);
    });

    return refunds.first;
  }

  // Clear messages
  void clearMessages() {
    _errorMessage = null;
    _successMessage = null;
  }

  // Check refund eligibility
  Future<Map<String, dynamic>?> checkRefundEligibility(
    int bookingId, {
    required bool Function() isMounted,
  }) async {
    // Set nilai tanpa memanggil notifyListeners() di awal
    _isLoading = true;
    _errorMessage = null;

    // Gunakan Future.microtask untuk notify listeners diluar cycle build
    Future.microtask(() {
      if (isMounted()) notifyListeners();
    });

    try {
      _eligibilityData = await _refundApi.checkRefundEligibility(bookingId);

      _isLoading = false;

      // Gunakan Future.microtask untuk notify listeners diluar cycle build
      Future.microtask(() {
        if (isMounted()) notifyListeners();
      });

      return _eligibilityData;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();

      // Gunakan Future.microtask untuk notify listeners diluar cycle build
      Future.microtask(() {
        if (isMounted()) notifyListeners();
      });

      throw e;
    }
  }

  // Request refund dengan pesan yang lebih informatif
  Future<bool> requestRefund({
    required int bookingId,
    required String reason,
    required String bankAccountNumber,
    required String bankAccountName,
    required String bankName,
    required bool Function() isMounted,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    _successMessage = null;

    if (isMounted()) notifyListeners();

    try {
      final response = await _refundApi.requestRefund({
        'booking_id': bookingId,
        'reason': reason,
        'bank_account_number': bankAccountNumber,
        'bank_account_name': bankAccountName,
        'bank_name': bankName,
      });

      if (response['success'] == true) {
        _currentRefund = Refund.fromJson(response['data']);
        _successMessage =
            response['message'] ?? 'Permintaan refund berhasil disubmit';

        _isLoading = false;
        if (isMounted()) notifyListeners();
        return true;
      } else {
        _errorMessage = response['message'] ?? 'Gagal mengajukan refund';
        _isLoading = false;
        if (isMounted()) notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = _parseErrorMessage(e.toString());
      if (isMounted()) notifyListeners();
      return false;
    }
  }

  // Cancel refund
  Future<bool> cancelRefund(
    int refundId, {
    required bool Function() isMounted,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    _successMessage = null;

    if (isMounted()) notifyListeners();

    try {
      final response = await _refundApi.cancelRefund(refundId);

      if (response['success'] == true) {
        _currentRefund = Refund.fromJson(response['data']);
        _successMessage = response['message'] ?? 'Refund berhasil dibatalkan';

        _isLoading = false;
        if (isMounted()) notifyListeners();
        return true;
      } else {
        _errorMessage = response['message'] ?? 'Gagal membatalkan refund';
        _isLoading = false;
        if (isMounted()) notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = _parseErrorMessage(e.toString());
      if (isMounted()) notifyListeners();
      return false;
    }
  }

  // Refresh current refund
  Future<void> refreshCurrentRefund({
    required bool Function() isMounted,
  }) async {
    if (_currentRefund == null) return;

    await getRefundDetailsByBookingId(
      _currentRefund!.bookingId,
      isMounted: isMounted,
    );
  }

  // Clear refund data
  void clearRefund() {
    _currentRefund = null;
    _errorMessage = null;
    _successMessage = null;
    _eligibilityData = null;
    notifyListeners();
  }

  // Parse error message to be more user-friendly
  String _parseErrorMessage(String error) {
    // Handle common error patterns
    if (error.contains('400')) {
      if (error.contains('tidak mendukung refund otomatis')) {
        return 'Metode pembayaran Anda memerlukan proses refund manual. Tim kami akan memproses permintaan Anda dalam 3-14 hari kerja.';
      } else if (error.contains('periode refund')) {
        return 'Periode refund untuk transaksi ini telah berakhir';
      } else if (error.contains('sudah ada')) {
        return 'Sudah ada permintaan refund untuk booking ini';
      }
    } else if (error.contains('404')) {
      return 'Data booking atau pembayaran tidak ditemukan';
    } else if (error.contains('403')) {
      return 'Anda tidak memiliki akses untuk melakukan refund pada booking ini';
    } else if (error.contains('422')) {
      return 'Data yang dimasukkan tidak valid. Periksa kembali informasi Anda';
    } else if (error.contains('500')) {
      return 'Terjadi kesalahan pada server. Silakan coba lagi nanti';
    } else if (error.contains('network') || error.contains('connection')) {
      return 'Koneksi internet bermasalah. Periksa koneksi Anda dan coba lagi';
    }

    // Return the original error if we can't parse it
    return error.replaceAll('Exception: ', '');
  }
}
