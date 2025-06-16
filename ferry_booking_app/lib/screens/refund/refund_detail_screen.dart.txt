import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/models/refund.dart';
import 'package:ferry_booking_app/models/booking.dart';
import 'package:ferry_booking_app/providers/refund_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';
import 'package:intl/intl.dart';

class RefundDetailScreen extends StatefulWidget {
  final Booking booking;
  final Refund refund;

  const RefundDetailScreen({
    Key? key,
    required this.booking,
    required this.refund,
  }) : super(key: key);

  @override
  _RefundDetailScreenState createState() => _RefundDetailScreenState();
}

class _RefundDetailScreenState extends State<RefundDetailScreen> {
  @override
  void initState() {
    super.initState();
    _loadRefundDetails();
  }

  Future<void> _loadRefundDetails() async {
    if (!mounted) return;

    final refundProvider = Provider.of<RefundProvider>(context, listen: false);
    await refundProvider.getRefundDetailsByBookingId(
      widget.booking.id,
      isMounted: () => mounted,
    );
  }

  Future<void> _refreshRefundDetails() async {
    if (!mounted) return;

    final refundProvider = Provider.of<RefundProvider>(context, listen: false);
    await refundProvider.refreshCurrentRefund(isMounted: () => mounted);
  }

  Future<void> _cancelRefund() async {
    if (!mounted) return;

    final result =
        await showDialog<bool>(
          context: context,
          builder:
              (context) => AlertDialog(
                title: const Text('Batalkan Refund?'),
                content: const Text(
                  'Apakah Anda yakin ingin membatalkan permintaan refund ini?',
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: const Text('Tidak'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context, true),
                    child: const Text('Ya, Batalkan'),
                  ),
                ],
              ),
        ) ??
        false;
    if (result && mounted) {
      final refundProvider = Provider.of<RefundProvider>(
        context,
        listen: false,
      );

      final success = await refundProvider.cancelRefund(
        widget.refund.id,
        isMounted: () => mounted,
      );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Refund berhasil dibatalkan'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final refundProvider = Provider.of<RefundProvider>(context);
    final refund = refundProvider.currentRefund ?? widget.refund;
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Scaffold(
      appBar: const CustomAppBar(title: 'Detail Refund', showBackButton: true),
      body: RefreshIndicator(
        onRefresh: _refreshRefundDetails,
        child:
            refundProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Status Card
                        Card(
                          color: Color(refund.getStatusColor()),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  backgroundColor: Colors.white,
                                  child: Icon(
                                    _getStatusIcon(refund.status),
                                    color: Color(refund.getStatusColor()),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Status Refund',
                                        style: TextStyle(
                                          color: Colors.white.withOpacity(0.9),
                                          fontSize: 14,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        refund.readableStatus,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 20,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        refund.getStatusDescription(),
                                        style: TextStyle(
                                          color: Colors.white.withOpacity(0.9),
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Refund Calculation Card
                        Card(
                          color: Colors.amber[50],
                          elevation: 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.calculate, color: Colors.amber),
                                    const SizedBox(width: 8),
                                    Text(
                                      'Perhitungan Refund',
                                      style: Theme.of(context).textTheme.titleMedium
                                          ?.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.amber[800],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                _buildCalculationRow(
                                  'Total Pembayaran',
                                  currencyFormat.format(refund.originalAmount),
                                ),
                                const SizedBox(height: 8),
                                _buildCalculationRow(
                                  'Persentase Refund',
                                  '${refund.refundPercentage.toStringAsFixed(0)}%',
                                  isPercentage: true,
                                ),
                                const SizedBox(height: 8),
                                _buildCalculationRow(
                                  'Biaya Administrasi',
                                  '- ${currencyFormat.format(refund.refundFee)}',
                                  isNegative: true,
                                ),
                                const Divider(thickness: 2, height: 24),
                                _buildCalculationRow(
                                  'Jumlah Refund',
                                  currencyFormat.format(refund.amount),
                                  isBold: true,
                                  isLarge: true,
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Refund Details
                        Card(
                          elevation: 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Detail Refund',
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 12),
                                _buildInfoRow('ID Refund', '#${refund.id}'),
                                const Divider(),
                                _buildInfoRow(
                                  'Kode Booking',
                                  widget.booking.bookingCode,
                                ),
                                const Divider(),
                                _buildInfoRow(
                                  'Tanggal Permintaan',
                                  refund.formattedCreatedDate,
                                ),
                                if (refund.transactionId != null) ...[
                                  const Divider(),
                                  _buildInfoRow(
                                    'ID Transaksi',
                                    refund.transactionId!,
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Reason Card
                        Card(
                          elevation: 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Alasan Refund',
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  refund.reason,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    height: 1.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Bank Info
                        Card(
                          elevation: 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Rekening Tujuan',
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 12),
                                _buildInfoRow('Bank', refund.bankNameLabel),
                                const Divider(),
                                _buildInfoRow(
                                  'Nomor Rekening',
                                  refund.bankAccountNumber,
                                ),
                                const Divider(),
                                _buildInfoRow(
                                  'Nama Pemilik',
                                  refund.bankAccountName,
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Admin Notes (if any)
                        if (refund.notes != null && refund.notes!.isNotEmpty) ...[
                          const SizedBox(height: 24),
                          Card(
                            color: Colors.blue[50],
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Icon(Icons.note, color: Colors.blue[700]),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Catatan Admin',
                                        style: Theme.of(context)
                                            .textTheme
                                            .titleMedium
                                            ?.copyWith(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.blue[700],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    refund.notes!,
                                    style: TextStyle(
                                      fontSize: 14,
                                      height: 1.5,
                                      color: Colors.blue[900],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],

                        // Rejection Reason (if rejected)
                        if (refund.status == 'REJECTED' && 
                            refund.rejectionReason != null && 
                            refund.rejectionReason!.isNotEmpty) ...[
                          const SizedBox(height: 24),
                          Card(
                            color: Colors.red[50],
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Icon(Icons.cancel, color: Colors.red[700]),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Alasan Penolakan',
                                        style: Theme.of(context)
                                            .textTheme
                                            .titleMedium
                                            ?.copyWith(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.red[700],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    refund.rejectionReason!,
                                    style: TextStyle(
                                      fontSize: 14,
                                      height: 1.5,
                                      color: Colors.red[900],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],

                        // Cancel button jika masih pending
                        if (refund.status.toUpperCase() == 'PENDING') ...[
                          const SizedBox(height: 32),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton(
                              onPressed: _cancelRefund,
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 16,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                side: const BorderSide(color: Colors.red),
                                foregroundColor: Colors.red,
                              ),
                              child: const Text(
                                'Batalkan Refund',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ],

                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
      ),
    );
  }

  IconData _getStatusIcon(String status) {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return Icons.check_circle;
      case 'PENDING':
        return Icons.access_time;
      case 'APPROVED':
        return Icons.check;
      case 'PROCESSING':
        return Icons.sync;
      case 'FAILED':
      case 'REJECTED':
        return Icons.cancel;
      case 'CANCELLED':
        return Icons.block;
      default:
        return Icons.help;
    }
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 14)),
          const SizedBox(width: 16),
          Flexible(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCalculationRow(
    String label, 
    String value, {
    bool isPercentage = false,
    bool isNegative = false,
    bool isBold = false,
    bool isLarge = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isLarge ? 16 : 14,
            color: Colors.grey[700],
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isLarge ? 18 : 14,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
            color: isNegative ? Colors.red : (isPercentage ? Colors.blue : Colors.black),
          ),
        ),
      ],
    );
  }
}