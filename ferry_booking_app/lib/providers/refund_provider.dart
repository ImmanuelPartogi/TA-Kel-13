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
  
  // Request a refund
  Future<bool> requestRefund({
    required int bookingId,
    required String reason,
    required String bankAccountNumber,
    required String bankAccountName,
    required String bankName,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
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
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
  
  // Get refund details for a booking
  Future<void> getRefundDetailsByBookingId(int bookingId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      _currentRefund = await _refundApi.getRefundDetailsByBookingId(bookingId);
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }
  
  // Cancel a refund
  Future<bool> cancelRefund(int refundId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      _currentRefund = await _refundApi.cancelRefund(refundId);
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
  
  // Refresh current refund details
  Future<void> refreshCurrentRefund() async {
    if (_currentRefund == null) return;
    
    await getRefundDetailsByBookingId(_currentRefund!.bookingId);
  }
  
  void clearRefund() {
    _currentRefund = null;
    _errorMessage = null;
    notifyListeners();
  }
}