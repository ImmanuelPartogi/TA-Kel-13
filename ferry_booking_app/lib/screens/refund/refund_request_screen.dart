import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/models/booking.dart';
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
  late TextEditingController _bankNameController;
  late TextEditingController _accountNumberController;
  late TextEditingController _accountNameController;

  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _reasonController = TextEditingController();
    _bankNameController = TextEditingController();
    _accountNumberController = TextEditingController();
    _accountNameController = TextEditingController();
  }

  @override
  void dispose() {
    _reasonController.dispose();
    _bankNameController.dispose();
    _accountNumberController.dispose();
    _accountNameController.dispose();
    super.dispose();
  }

  void _submitRefundRequest() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    // Jika tidak mounted, jangan lanjutkan
    if (!mounted) return;

    setState(() {
      _isSubmitting = true;
    });

    final refundProvider = Provider.of<RefundProvider>(context, listen: false);

    try {
      final success = await refundProvider.requestRefund(
        bookingId: widget.booking.id,
        reason: _reasonController.text,
        bankAccountNumber: _accountNumberController.text,
        bankAccountName: _accountNameController.text,
        bankName: _bankNameController.text,
        isMounted: () => mounted, // Berikan callback sebagai parameter
      );

      // Tetap cek mounted sebelum menunjukkan snackbar atau navigasi
      if (success && mounted) {
        // Tangani success
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Permintaan refund berhasil disubmit'),
            backgroundColor: Colors.green,
          ),
        );

        // Navigasi kembali ke halaman sebelumnya dengan hasil
        Navigator.pop(context, true);
      } else if (mounted) {
        // Tangani error
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Gagal submit refund: ${refundProvider.errorMessage}',
            ),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      // Tangani exception
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Terjadi kesalahan: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      // Pastikan mounted sebelum mengupdate state
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Scaffold(
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
                // Booking Info Card
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
                          'Informasi Booking',
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 12),
                        _buildInfoRow(
                          'Kode Booking',
                          widget.booking.bookingCode,
                        ),
                        const Divider(),
                        _buildInfoRow(
                          'Total Pembayaran',
                          currencyFormat.format(widget.booking.totalAmount),
                        ),
                        const Divider(),
                        _buildInfoRow(
                          'Tanggal Booking',
                          DateFormat('dd MMMM yyyy', 'id_ID').format(
                            DateTime.parse(widget.booking.departureDate),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Refund Policy
                Card(
                  color: Colors.blue[50],
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
                            const Icon(Icons.info_outline, color: Colors.blue),
                            const SizedBox(width: 8),
                            Text(
                              'Kebijakan Refund',
                              style: Theme.of(
                                context,
                              ).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Colors.blue[800],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          '• Refund otomatis hanya tersedia untuk pembayaran kartu kredit, e-wallet (GoPay/ShopeePay), QRIS, dan Kredivo/Akulaku',
                          style: TextStyle(height: 1.4),
                        ),
                        const Text(
                          '• Bank transfer (Virtual Account) dan pembayaran counter tidak dapat di-refund otomatis',
                          style: TextStyle(height: 1.4),
                        ),
                        const Text(
                          '• Periode refund bervariasi: Kartu kredit (max 6 bulan), GoPay (max 45 hari), ShopeePay (max 365 hari)',
                          style: TextStyle(height: 1.4),
                        ),
                        const Text(
                          '• Waktu pengembalian dana bervariasi: Kartu kredit (7-14 hari), e-wallet (1-20 hari)',
                          style: TextStyle(height: 1.4),
                        ),
                        const Text(
                          '• Permintaan refund yang sudah disubmit mungkin masih dapat dibatalkan jika status masih PENDING',
                          style: TextStyle(height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Refund Form
                Text(
                  'Informasi Refund',
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),

                // Reason Field
                TextFormField(
                  controller: _reasonController,
                  decoration: const InputDecoration(
                    labelText: 'Alasan Refund',
                    border: OutlineInputBorder(),
                    hintText: 'Contoh: Perubahan jadwal perjalanan',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Alasan refund wajib diisi';
                    }
                    return null;
                  },
                  maxLines: 3,
                ),

                const SizedBox(height: 16),

                // Bank Info
                Text(
                  'Informasi Rekening',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Masukkan detail rekening bank untuk menerima pengembalian dana',
                ),
                const SizedBox(height: 16),

                // Bank Name
                TextFormField(
                  controller: _bankNameController,
                  decoration: const InputDecoration(
                    labelText: 'Nama Bank',
                    border: OutlineInputBorder(),
                    hintText: 'Contoh: BCA, BNI, Mandiri',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Nama bank wajib diisi';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 16),

                // Account Number
                TextFormField(
                  controller: _accountNumberController,
                  decoration: const InputDecoration(
                    labelText: 'Nomor Rekening',
                    border: OutlineInputBorder(),
                    hintText: 'Masukkan nomor rekening',
                  ),
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Nomor rekening wajib diisi';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 16),

                // Account Name
                TextFormField(
                  controller: _accountNameController,
                  decoration: const InputDecoration(
                    labelText: 'Nama Pemilik Rekening',
                    border: OutlineInputBorder(),
                    hintText: 'Masukkan nama pemilik rekening',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Nama pemilik rekening wajib diisi';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 32),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitRefundRequest,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
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
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                  ),
                ),

                const SizedBox(height: 16),

                // Cancel Button
                SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Batal'),
                  ),
                ),

                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
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
}
