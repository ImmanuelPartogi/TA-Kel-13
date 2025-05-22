import 'package:flutter/material.dart';
import 'package:ferry_booking_app/api/refund_api.dart';
import 'package:ferry_booking_app/models/refund.dart';

class RefundProvider extends ChangeNotifier {
  final RefundApi _refundApi = RefundApi();
  
  bool _isLoading = false;
  String? _errorMessage;
  Refund? _currentRefund;
  
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  Refund? get currentRefund => _currentRefund;
  
  // Perbaikan: tambahkan parameter mounted untuk mencegah update UI setelah widget dibuang
  Future<bool> requestRefund({
    required int bookingId,
    required String reason,
    required String bankAccountNumber,
    required String bankAccountName,
    required String bankName,
    required bool Function() isMounted, // Tambahkan callback untuk cek mounted state
  }) async {
    _isLoading = true;
    _errorMessage = null;
    
    // Pastikan widget masih mounted sebelum update UI
    if (isMounted()) notifyListeners();
    
    try {
      final refundData = {
        'booking_id': bookingId,
        'reason': reason,
        'bank_account_number': bankAccountNumber,
        'bank_account_name': bankAccountName,
        'bank_name': bankName,
      };
      
      _currentRefund = await _refundApi.requestRefund(refundData);
      
      _isLoading = false;
      
      // Periksa mounted state lagi setelah operasi async
      if (isMounted()) notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      
      // Periksa mounted state lagi
      if (isMounted()) notifyListeners();
      return false;
    }
  }
  
  // Perbaikan yang sama untuk metode lainnya
  Future<void> getRefundDetailsByBookingId(int bookingId, {required bool Function() isMounted}) async {
    _isLoading = true;
    _errorMessage = null;
    if (isMounted()) notifyListeners();
    
    try {
      _currentRefund = await _refundApi.getRefundDetailsByBookingId(bookingId);
      
      _isLoading = false;
      if (isMounted()) notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      if (isMounted()) notifyListeners();
    }
  }
  
  // Perbaikan untuk cancelRefund juga
  Future<bool> cancelRefund(int refundId, {required bool Function() isMounted}) async {
    _isLoading = true;
    _errorMessage = null;
    if (isMounted()) notifyListeners();
    
    try {
      _currentRefund = await _refundApi.cancelRefund(refundId);
      
      _isLoading = false;
      if (isMounted()) notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      if (isMounted()) notifyListeners();
      return false;
    }
  }
  
  // Metode lain
  Future<void> refreshCurrentRefund({required bool Function() isMounted}) async {
    if (_currentRefund == null) return;
    
    await getRefundDetailsByBookingId(_currentRefund!.bookingId, isMounted: isMounted);
  }
  
  void clearRefund() {
    _currentRefund = null;
    _errorMessage = null;
    notifyListeners();
  }
}