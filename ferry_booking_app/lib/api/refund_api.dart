import 'dart:convert';
import 'package:ferry_booking_app/models/refund.dart';
import 'package:ferry_booking_app/services/api_service.dart';

class RefundApi {
  final ApiService _apiService = ApiService();

  // Check refund eligibility
  Future<Map<String, dynamic>> checkRefundEligibility(int bookingId) async {
    try {
      final response = await _apiService.get('refunds/eligibility/$bookingId');
      return response;
    } catch (e) {
      print('Error checking refund eligibility: $e');
      throw Exception(
        'Terjadi kesalahan saat memeriksa kelayakan refund: ${e.toString()}',
      );
    }
  }

  // Request refund dengan persentase refund yang benar
  Future<Map<String, dynamic>> requestRefund(
    Map<String, dynamic> refundData,
  ) async {
    try {
      // Pastikan data refund policy ikut dikirim jika tersedia
      if (refundData['refund_policy'] == null && 
          refundData['refund_percentage'] != null) {
        // Tambahkan informasi refund policy ke data yang dikirim
        refundData['refund_policy'] = {
          'percentage': refundData['refund_percentage']
        };
      }

      // Tambahkan flag untuk backend agar tidak menghitung ulang persentase
      refundData['use_frontend_percentage'] = true;
      
      final response = await _apiService.post('refunds/request', refundData);
      return response;
    } catch (e) {
      print('Error requesting refund: $e');
      // Re-throw the original exception untuk mempertahankan error message yang tepat
      rethrow;
    }
  }

  // Tambahkan metode baru untuk mendapatkan semua riwayat refund untuk suatu booking
  Future<Map<String, dynamic>> getAllRefundHistoryByBookingId(
    int bookingId,
  ) async {
    try {
      final response = await _apiService.get(
        'refunds/booking/$bookingId/history',
      );
      return response;
    } catch (e) {
      print('Error getting refund history: $e');

      if (e.toString().contains('not found') || e.toString().contains('404')) {
        return {
          'success': false,
          'message': 'Riwayat refund tidak ditemukan',
          'data': [],
        };
      }

      throw Exception(
        'Terjadi kesalahan saat mengambil riwayat refund: ${e.toString()}',
      );
    }
  }

  // Perbaiki metode getRefundDetailsByBookingId untuk meminta refund terbaru
  Future<Map<String, dynamic>> getRefundDetailsByBookingId(
    int bookingId,
  ) async {
    try {
      // Tambahkan parameter latest=true untuk memastikan backend mengembalikan refund terbaru
      final response = await _apiService.get(
        'refunds/booking/$bookingId?latest=true',
      );
      return response;
    } catch (e) {
      print('Error getting refund details: $e');

      if (e.toString().contains('not found') || e.toString().contains('404')) {
        return {
          'success': false,
          'message': 'Data refund tidak ditemukan',
          'data': null,
        };
      }

      throw Exception(
        'Terjadi kesalahan saat mengambil detail refund: ${e.toString()}',
      );
    }
  }

  // Cancel refund
  Future<Map<String, dynamic>> cancelRefund(int refundId) async {
    try {
      final response = await _apiService.post('refunds/$refundId/cancel', {});
      return response;
    } catch (e) {
      print('Error cancelling refund: $e');
      throw Exception(
        'Terjadi kesalahan saat membatalkan refund: ${e.toString()}',
      );
    }
  }
}