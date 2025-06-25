import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/models/booking.dart';
import 'package:ferry_booking_app/models/refund.dart';
import 'package:ferry_booking_app/providers/refund_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';
import 'package:intl/intl.dart';

class RefundRequestScreen extends StatefulWidget {
  final Booking booking;

  const RefundRequestScreen({Key? key, required this.booking})
    : super(key: key);

  @override
  _RefundRequestScreenState createState() => _RefundRequestScreenState();
}

class _RefundRequestScreenState extends State<RefundRequestScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _reasonController;
  late TextEditingController _accountNumberController;
  late TextEditingController _accountNameController;

  String _selectedBankName = 'BCA'; // Default bank
  bool _isSubmitting = false;
  bool _isLoadingEligibility = false;
  Map<String, dynamic>? _eligibilityData;

  @override
  void initState() {
    super.initState();
    _reasonController = TextEditingController();
    _accountNumberController = TextEditingController();
    _accountNameController = TextEditingController();

    // Gunakan WidgetsBinding untuk menunda pemanggilan hingga setelah build selesai
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _checkRefundEligibility();
      }
    });
  }

  @override
  void dispose() {
    _reasonController.dispose();
    _accountNumberController.dispose();
    _accountNameController.dispose();
    super.dispose();
  }

  Future<void> _checkRefundEligibility() async {
    setState(() {
      _isLoadingEligibility = true;
    });

    final refundProvider = Provider.of<RefundProvider>(context, listen: false);

    try {
      final eligibility = await refundProvider.checkRefundEligibility(
        widget.booking.id,
        isMounted: () => mounted,
      );

      if (mounted) {
        setState(() {
          _eligibilityData = eligibility;
          _isLoadingEligibility = false;
        });

        // PERBAIKAN: Mengatasi masalah null safety dengan benar
        if (_eligibilityData != null &&
            !(_eligibilityData!['eligible'] ?? false) &&
            _eligibilityData!['days_before_departure'] != null &&
            (_eligibilityData!['days_before_departure'] as num) < 2) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Refund hanya dapat dilakukan minimal 2 hari sebelum keberangkatan',
              ),
              backgroundColor: Colors.red.shade700,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              margin: const EdgeInsets.all(12),
              duration: const Duration(seconds: 5),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingEligibility = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal memeriksa kelayakan refund: $e'),
            backgroundColor: Colors.red.shade700,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            margin: const EdgeInsets.all(12),
          ),
        );
      }
    }
  }

  void _submitRefundRequest() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!mounted) return;

    // Extract data untuk dialog konfirmasi
    final refundPolicy = _eligibilityData?['refund_policy'] ?? {};

    // Pastikan daysBeforeDeparture adalah integer, bukan floating point
    final daysBeforeDepRaw = _eligibilityData?['days_before_departure'] ?? 0;
    final daysBeforeDeparture =
        daysBeforeDepRaw is int
            ? daysBeforeDepRaw
            : (daysBeforeDepRaw is num ? daysBeforeDepRaw.toInt() : 0);

    // Menentukan minimum price berdasarkan hari sebelum keberangkatan
    String minPrice = "5.000";
    if (daysBeforeDeparture >= 14) {
      minPrice = "5.000";
    } else if (daysBeforeDeparture >= 7) {
      minPrice = "10.000";
    } else if (daysBeforeDeparture >= 5) {
      minPrice = "15.000";
    } else if (daysBeforeDeparture >= 3) {
      minPrice = "20.000";
    } else if (daysBeforeDeparture >= 2) {
      minPrice = "25.000";
    }

    // Format jumlah refund untuk dialog
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: '',
      decimalDigits: 0,
    );

    final originalAmount =
        refundPolicy['original_amount'] != null
            ? (refundPolicy['original_amount'] is num)
                ? (refundPolicy['original_amount'] as num).toDouble()
                : double.tryParse(refundPolicy['original_amount'].toString()) ??
                    widget.booking.totalAmount
            : widget.booking.totalAmount;

    final refundPercentage =
        refundPolicy['percentage'] != null
            ? (refundPolicy['percentage'] is num)
                ? (refundPolicy['percentage'] as num).toDouble()
                : double.tryParse(refundPolicy['percentage'].toString()) ??
                    100.0
            : 100.0;

    final refundAmount =
        refundPolicy['refund_amount'] != null
            ? (refundPolicy['refund_amount'] is num)
                ? (refundPolicy['refund_amount'] as num).toDouble()
                : double.tryParse(refundPolicy['refund_amount'].toString()) ??
                    (originalAmount * refundPercentage / 100)
            : (originalAmount * refundPercentage / 100);

    final formattedRefundAmount = currencyFormat.format(refundAmount);

    // Tampilkan dialog konfirmasi
    final confirmed = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          contentPadding: const EdgeInsets.fromLTRB(24, 20, 24, 16),
          title: Column(
            children: [
              Icon(
                Icons.info_outline,
                color: const Color(0xFF1A73E8),
                size: 28,
              ),
              const SizedBox(height: 12),
              const Text(
                'Konfirmasi Refund',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Apakah Anda yakin ingin membatalkan tiket? Anda akan menerima refund sebesar Rp$formattedRefundAmount untuk pembatalan $daysBeforeDeparture hari sebelum keberangkatan. Perhitungan dilakukan dari harga minimal Rp$minPrice.',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[800],
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.amber.shade200),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.warning_amber_rounded,
                      color: Colors.amber.shade800,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Proses refund tidak dapat dibatalkan setelah diajukan',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.amber.shade900,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              style: TextButton.styleFrom(foregroundColor: Colors.grey[700]),
              child: const Text('Batal', style: TextStyle(fontSize: 14)),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(true),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1A73E8),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
              ),
              child: const Text(
                'Ya, Ajukan Refund',
                style: TextStyle(fontSize: 14),
              ),
            ),
          ],
          actionsPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 12,
          ),
        );
      },
    );

    // Jika pengguna membatalkan, keluar dari fungsi
    if (confirmed != true) return;

    setState(() {
      _isSubmitting = true;
    });

    // Lanjutkan dengan proses refund seperti biasa...
    final refundProvider = Provider.of<RefundProvider>(context, listen: false);

    try {
      final success = await refundProvider.requestRefund(
        bookingId: widget.booking.id,
        reason: _reasonController.text,
        bankAccountNumber: _accountNumberController.text,
        bankAccountName: _accountNameController.text,
        bankName: _selectedBankName,
        isMounted: () => mounted,
      );

      if (success && mounted) {
        final message =
            refundProvider.successMessage ??
            'Permintaan refund berhasil disubmit';

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            backgroundColor: Colors.green.shade700,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            margin: const EdgeInsets.all(12),
            duration: const Duration(seconds: 3),
          ),
        );

        Navigator.pop(context, true);
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(refundProvider.errorMessage ?? 'Gagal submit refund'),
            backgroundColor: Colors.red.shade700,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            margin: const EdgeInsets.all(12),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Terjadi kesalahan: ${e.toString()}'),
            backgroundColor: Colors.red.shade700,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            margin: const EdgeInsets.all(12),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Validasi hari sebelum keberangkatan untuk memastikan konsistensi dengan backend
    final departureDate = DateTime.parse(widget.booking.departureDate);
    final daysBeforeDeparture = departureDate.difference(DateTime.now()).inDays;

    // Redirect ke halaman sebelumnya jika kurang dari 2 hari
    if (daysBeforeDeparture < 2) {
      // Gunakan Future.microtask untuk menghindari build error
      Future.microtask(() {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
              'Refund hanya dapat dilakukan minimal 2 hari sebelum keberangkatan',
            ),
            backgroundColor: Colors.red.shade700,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            margin: const EdgeInsets.all(12),
          ),
        );
      });
    }

    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    if (_isLoadingEligibility) {
      return Scaffold(
        appBar: const CustomAppBar(
          title: 'Permintaan Refund',
          showBackButton: true,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF1A73E8)),
              ),
              const SizedBox(height: 20),
              Text(
                'Memuat informasi refund...',
                style: TextStyle(color: Colors.grey[700], fontSize: 16),
              ),
            ],
          ),
        ),
      );
    }

    // Jika tidak eligible untuk refund
    if (_eligibilityData != null && !(_eligibilityData!['eligible'] ?? false)) {
      return Scaffold(
        appBar: const CustomAppBar(
          title: 'Permintaan Refund',
          showBackButton: true,
        ),
        body: Container(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.info_outline,
                  size: 40,
                  color: Colors.orange.shade800,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Tidak Dapat Melakukan Refund',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  children: [
                    Text(
                      _eligibilityData!['message'] ??
                          'Booking ini tidak memenuhi syarat untuk refund',
                      style: TextStyle(fontSize: 16, color: Colors.grey[800]),
                      textAlign: TextAlign.center,
                    ),
                    if (_eligibilityData!['days_before_departure'] != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          vertical: 8,
                          horizontal: 16,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.orange.shade50,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'Sisa waktu: ${_eligibilityData!['days_before_departure']} hari sebelum keberangkatan',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Colors.orange.shade800,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1A73E8),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Kembali',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Extract refund policy data
    final refundPolicy = _eligibilityData?['refund_policy'] ?? {};

    // Konversi nilai string ke double dengan aman
    final originalAmount =
        refundPolicy['original_amount'] != null
            ? (refundPolicy['original_amount'] is num)
                ? (refundPolicy['original_amount'] as num).toDouble()
                : double.tryParse(refundPolicy['original_amount'].toString()) ??
                    widget.booking.totalAmount
            : widget.booking.totalAmount;

    // Gunakan persentase refund dari API
    final refundPercentage =
        refundPolicy['percentage'] != null
            ? (refundPolicy['percentage'] is num)
                ? (refundPolicy['percentage'] as num).toDouble()
                : double.tryParse(refundPolicy['percentage'].toString()) ??
                    100.0
            : 100.0;

    // Gunakan jumlah refund dari API
    final refundAmount =
        refundPolicy['refund_amount'] != null
            ? (refundPolicy['refund_amount'] is num)
                ? (refundPolicy['refund_amount'] as num).toDouble()
                : double.tryParse(refundPolicy['refund_amount'].toString()) ??
                    (originalAmount * refundPercentage / 100)
            : (originalAmount * refundPercentage / 100);

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: const CustomAppBar(
        title: 'Permintaan Refund',
        showBackButton: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Status Bar
                Container(
                  padding: const EdgeInsets.symmetric(
                    vertical: 12,
                    horizontal: 16,
                  ),
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A73E8).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: const Color(0xFF1A73E8).withOpacity(0.2),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        size: 20,
                        color: const Color(0xFF1A73E8),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Permintaan refund akan diproses dalam ${_eligibilityData?['sla_period'] ?? '3-14 hari kerja'} setelah disetujui',
                          style: TextStyle(
                            fontSize: 14,
                            color: const Color(0xFF1A73E8),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Booking Info Card
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.grey.shade200),
                  ),
                  color: Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.confirmation_number_outlined,
                              size: 20,
                              color: Colors.grey[700],
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Informasi Booking',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[800],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        _buildInfoRow(
                          'Kode Booking',
                          widget.booking.bookingCode,
                          boldValue: true,
                        ),
                        const Divider(height: 24),
                        _buildInfoRow(
                          'Total Pembayaran',
                          currencyFormat.format(originalAmount),
                          boldValue: true,
                        ),
                        const Divider(height: 24),
                        // Tambahkan Tanggal Pembelian dari eligibilityData
                        if (_eligibilityData != null &&
                            _eligibilityData!['payment_date'] != null) ...[
                          _buildInfoRow(
                            'Tanggal Pembelian',
                            DateFormat('dd MMMM yyyy', 'id_ID').format(
                              DateTime.parse(
                                _eligibilityData!['payment_date'].toString(),
                              ),
                            ),
                          ),
                          const Divider(height: 24),
                        ],
                        _buildInfoRow(
                          'Tanggal Keberangkatan',
                          DateFormat('dd MMMM yyyy', 'id_ID').format(
                            DateTime.parse(widget.booking.departureDate),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // Refund Calculation Card
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.blue.shade100),
                  ),
                  color: Colors.blue.shade50,
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.calculate,
                              color: const Color(0xFF1A73E8),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Perhitungan Refund',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: const Color(0xFF1A73E8),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            children: [
                              _buildCalculationRow(
                                'Total Pembayaran',
                                currencyFormat.format(originalAmount),
                              ),
                              const SizedBox(height: 12),
                              _buildCalculationRow(
                                'Persentase Refund',
                                '${refundPercentage.toStringAsFixed(0)}%',
                                valueColor: const Color(0xFF1A73E8),
                              ),
                              const Divider(thickness: 1, height: 24),
                              _buildCalculationRow(
                                'Jumlah Refund',
                                currencyFormat.format(refundAmount),
                                isBold: true,
                                isLarge: true,
                                valueColor: const Color(0xFF1A73E8),
                              ),
                            ],
                          ),
                        ),

                        // Tambahkan penjelasan refund yang lebih jelas
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade100.withOpacity(0.5),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.blue.shade100),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.info_outline,
                                size: 16,
                                color: Colors.blue.shade700,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  refundPolicy['description'] ??
                                      "Pengembalian dana sebesar ${refundPercentage.toStringAsFixed(0)}% dari total pembayaran sesuai kebijakan untuk ${_eligibilityData?['days_before_departure']} hari sebelum keberangkatan",
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.blue.shade700,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // Refund Policy & Method Info
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.grey.shade200),
                  ),
                  color: Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.policy_outlined,
                              color: Colors.grey[800],
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Informasi Refund',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[800],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        if (_eligibilityData != null) ...[
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color:
                                  _eligibilityData!['can_auto_refund'] == true
                                      ? Colors.green.shade50
                                      : Colors.orange.shade50,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Icon(
                                  _eligibilityData!['can_auto_refund'] == true
                                      ? Icons.check_circle_outline
                                      : Icons.warning_amber_outlined,
                                  color:
                                      _eligibilityData!['can_auto_refund'] ==
                                              true
                                          ? Colors.green.shade700
                                          : Colors.orange.shade700,
                                  size: 20,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        _eligibilityData!['can_auto_refund'] ==
                                                true
                                            ? 'Metode pembayaran Anda mendukung refund otomatis'
                                            : 'Metode pembayaran Anda memerlukan proses refund manual',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color:
                                              _eligibilityData!['can_auto_refund'] ==
                                                      true
                                                  ? Colors.green.shade700
                                                  : Colors.orange.shade700,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      // if (!(_eligibilityData!['can_auto_refund'] ?? false))
                                      //   Text(
                                      //     'Metode pembayaran: ${_eligibilityData!['payment_method'] ?? 'Unknown'}',
                                      //     style: TextStyle(color: Colors.grey[700]),
                                      //   ),
                                      // const SizedBox(height: 4),
                                      Text(
                                        'Estimasi pengembalian dana: ${_eligibilityData!['sla_period'] ?? '3-14 hari kerja'}',
                                        style: TextStyle(
                                          color: Colors.grey[700],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Informasi tambahan dalam format yang lebih menarik
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildInfoItem(
                              'Dana akan dikembalikan ke rekening bank yang Anda masukkan',
                            ),
                            _buildInfoItem(
                              'Pastikan data rekening bank sudah benar untuk menghindari keterlambatan',
                            ),
                            _buildInfoItem(
                              'Pengembalian dana dilakukan sesuai kebijakan refund',
                            ),
                            _buildInfoItem(
                              'Jika dana yang ingin dikembalikan tidak sesuai dengan ketentuan kebijakan maka refund akan dilakukan dengan persentase 0%',
                            ),
                            _buildInfoItem(
                              'Kesalahan dalam pengisian data rekening bank diluar tanggung jawab kami',
                            ),
                          ],
                        ),

                        const SizedBox(height: 20),

                        Text(
                          'Kebijakan Refund',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: Colors.grey[800],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          margin: const EdgeInsets.only(top: 8),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey.shade300),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Persentase pengembalian dana berdasarkan waktu pembatalan:',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.grey[800],
                                ),
                              ),
                              const SizedBox(height: 12),
                              _buildPolicyItem(
                                '≥ 14 hari',
                                '95%',
                                'min Rp5.000',
                              ),
                              _buildPolicyItem(
                                '7–13 hari',
                                '85%',
                                'min Rp10.000',
                              ),
                              _buildPolicyItem(
                                '5–6 hari',
                                '75%',
                                'min Rp15.000',
                              ),
                              _buildPolicyItem(
                                '3–4 hari',
                                '65%',
                                'min Rp20.000',
                              ),
                              _buildPolicyItem('2 hari', '50%', 'min Rp25.000'),
                              _buildPolicyItem(
                                '< 2 hari',
                                '0%',
                                'Tidak dapat refund',
                                isHighlighted: true,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Refund Form
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.grey.shade200),
                  ),
                  color: Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Detail Permintaan Refund',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[800],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Reason Field
                        Text(
                          'Alasan Refund',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Colors.grey[700],
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _reasonController,
                          decoration: InputDecoration(
                            hintText: 'Contoh: Perubahan jadwal perjalanan',
                            hintStyle: TextStyle(
                              color: Colors.grey[400],
                              fontSize: 14,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: Colors.grey.shade300,
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: Colors.grey.shade300,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: const Color(0xFF1A73E8),
                              ),
                            ),
                            errorBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: Colors.red.shade300,
                              ),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Alasan refund wajib diisi';
                            }
                            if (value.length < 10) {
                              return 'Alasan refund minimal 10 karakter';
                            }
                            return null;
                          },
                          maxLines: 3,
                          style: const TextStyle(fontSize: 14),
                        ),

                        const SizedBox(height: 24),

                        // Bank Info
                        Text(
                          'Informasi Rekening',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[800],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Masukkan detail rekening bank untuk menerima pengembalian dana',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Bank Name Dropdown
                        Text(
                          'Nama Bank',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Colors.grey[700],
                          ),
                        ),
                        const SizedBox(height: 8),
                        DropdownButtonFormField<String>(
                          value: _selectedBankName,
                          decoration: InputDecoration(
                            prefixIcon: Icon(
                              Icons.account_balance,
                              color: Colors.grey[600],
                              size: 20,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: Colors.grey.shade300,
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: Colors.grey.shade300,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: const Color(0xFF1A73E8),
                              ),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 0,
                            ),
                          ),
                          items:
                              Refund.bankOptions.entries.map((entry) {
                                return DropdownMenuItem<String>(
                                  value: entry.key,
                                  child: Text(
                                    entry.value,
                                    style: const TextStyle(fontSize: 14),
                                  ),
                                );
                              }).toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedBankName = value!;
                            });
                          },
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Nama bank wajib dipilih';
                            }
                            return null;
                          },
                          icon: Icon(
                            Icons.keyboard_arrow_down,
                            color: Colors.grey[600],
                          ),
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.black87,
                          ),
                          dropdownColor: Colors.white,
                        ),

                        const SizedBox(height: 20),

                        // Account Number
                        Text(
                          'Nomor Rekening',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Colors.grey[700],
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _accountNumberController,
                          decoration: InputDecoration(
                            hintText: 'Masukkan nomor rekening',
                            hintStyle: TextStyle(
                              color: Colors.grey[400],
                              fontSize: 14,
                            ),
                            prefixIcon: Icon(
                              Icons.credit_card,
                              color: Colors.grey[600],
                              size: 20,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: Colors.grey.shade300,
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: Colors.grey.shade300,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: const Color(0xFF1A73E8),
                              ),
                            ),
                            errorBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: Colors.red.shade300,
                              ),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 0,
                            ),
                          ),
                          keyboardType: TextInputType.number,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Nomor rekening wajib diisi';
                            }
                            if (value.length < 8) {
                              return 'Nomor rekening minimal 8 digit';
                            }
                            return null;
                          },
                          style: const TextStyle(fontSize: 14),
                        ),

                        const SizedBox(height: 20),

                        // Account Name
                        Text(
                          'Nama Pemilik Rekening',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Colors.grey[700],
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _accountNameController,
                          decoration: InputDecoration(
                            hintText: 'Masukkan nama pemilik rekening',
                            hintStyle: TextStyle(
                              color: Colors.grey[400],
                              fontSize: 14,
                            ),
                            prefixIcon: Icon(
                              Icons.person,
                              color: Colors.grey[600],
                              size: 20,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: Colors.grey.shade300,
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: Colors.grey.shade300,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: const Color(0xFF1A73E8),
                              ),
                            ),
                            errorBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: Colors.red.shade300,
                              ),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 0,
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Nama pemilik rekening wajib diisi';
                            }
                            if (value.length < 3) {
                              return 'Nama pemilik rekening minimal 3 karakter';
                            }
                            return null;
                          },
                          style: const TextStyle(fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitRefundRequest,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1A73E8),
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: Colors.grey.shade300,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child:
                        _isSubmitting
                            ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.white,
                                ),
                              ),
                            )
                            : const Text(
                              'Ajukan Refund',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                  ),
                ),

                const SizedBox(height: 16),

                // Cancel Button
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: OutlinedButton(
                    onPressed:
                        _isSubmitting ? null : () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: const Color(0xFF1A73E8)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      foregroundColor: const Color(0xFF1A73E8),
                    ),
                    child: const Text(
                      'Batal',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool boldValue = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 14)),
          const SizedBox(width: 16),
          Flexible(
            child: Text(
              value,
              style: TextStyle(
                fontWeight: boldValue ? FontWeight.bold : FontWeight.w500,
                fontSize: 14,
                color: Colors.grey[800],
              ),
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
    Color? valueColor,
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
            color: valueColor ?? Colors.grey[800],
          ),
        ),
      ],
    );
  }

  Widget _buildInfoItem(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.check_circle, size: 16, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[700],
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPolicyItem(
    String days,
    String percentage,
    String fees, {
    bool isHighlighted = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
      decoration: BoxDecoration(
        color: isHighlighted ? Colors.red.shade50 : Colors.transparent,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        children: [
          Container(
            width: 80,
            child: Text(
              days,
              style: TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 13,
                color: isHighlighted ? Colors.red.shade700 : Colors.grey[800],
              ),
            ),
          ),
          Container(
            width: 60,
            child: Text(
              percentage,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 13,
                color:
                    isHighlighted
                        ? Colors.red.shade700
                        : const Color(0xFF1A73E8),
              ),
            ),
          ),
          Expanded(
            child: Text(
              fees,
              style: TextStyle(
                fontSize: 13,
                color: isHighlighted ? Colors.red.shade700 : Colors.grey[700],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
