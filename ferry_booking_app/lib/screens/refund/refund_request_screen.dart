import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/models/booking.dart';
import 'package:ferry_booking_app/providers/refund_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';
import 'package:intl/intl.dart';

class RefundRequestScreen extends StatefulWidget {
  final Booking booking;
  
  const RefundRequestScreen({
    Key? key,
    required this.booking,
  }) : super(key: key);

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
      );
      
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Permintaan refund berhasil disubmit'),
            backgroundColor: Colors.green,
          ),
        );
        
        // Navigate to refund details
        Navigator.pop(context, true);
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal submit refund: ${refundProvider.errorMessage}'),
            backgroundColor: Colors.red,
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
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildInfoRow('Kode Booking', widget.booking.bookingCode),
                        const Divider(),
                        _buildInfoRow(
                          'Total Pembayaran',
                          currencyFormat.format(widget.booking.totalAmount),
                        ),
                        const Divider(),
                        _buildInfoRow(
                          'Tanggal Booking',
                          DateFormat('dd MMMM yyyy', 'id_ID').format(
                            DateTime.parse(widget.booking.bookingDate),
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
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Colors.blue[800],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          '• Refund dapat diproses dalam waktu 3-14 hari kerja',
                          style: TextStyle(height: 1.4),
                        ),
                        const Text(
                          '• Jumlah refund yang diterima mungkin dipotong biaya admin',
                          style: TextStyle(height: 1.4),
                        ),
                        const Text(
                          '• Permintaan refund yang sudah disubmit tidak dapat dibatalkan',
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
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
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
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
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
          Text(
            label,
            style: const TextStyle(
              color: Colors.grey,
              fontSize: 14,
            ),
          ),
          const SizedBox(width: 16),
          Flexible(
            child: Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }
}