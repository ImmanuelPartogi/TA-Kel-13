import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../../providers/booking_provider.dart';
import '../../widgets/custom_appbar.dart';

class PaymentScreen extends StatefulWidget {
  final String? bookingCode;
  final String? paymentMethod;
  final String? paymentType;

  const PaymentScreen({
    Key? key,
    this.bookingCode,
    this.paymentMethod,
    this.paymentType,
  }) : super(key: key);

  @override
  _PaymentScreenState createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _paymentInstructions;
  String? _paymentMethod;
  String? _paymentType;
  String? _bookingCode;
  Timer? _statusTimer;

  @override
  void initState() {
    super.initState();
    _paymentMethod = widget.paymentMethod;
    _paymentType = widget.paymentType;
    _bookingCode = widget.bookingCode;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initPaymentData();
      _startPolling(); // Mulai polling saat halaman dibuka
    });
  }

  void _initPaymentData() async {
    // Jika tidak ada dari constructor, coba ambil dari route arguments
    if (_paymentMethod == null ||
        _paymentType == null ||
        _bookingCode == null) {
      final args =
          ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;

      if (args != null) {
        setState(() {
          _paymentMethod = args['paymentMethod'];
          _paymentType = args['paymentType'];
          _bookingCode = args['bookingCode'];
        });
      }
    }

    // Pastikan nilai default jika masih null
    if (_paymentMethod == null) _paymentMethod = 'bca';
    if (_paymentType == null) _paymentType = 'virtual_account';
    if (_bookingCode == null) {
      // Jika masih null, coba ambil dari currentBooking
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      _bookingCode = bookingProvider.currentBooking?.bookingCode;
    }

    await _loadPaymentInstructions();
  }

  void _startPolling() {
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );
    final bookingCode =
        _bookingCode ?? bookingProvider.currentBooking?.bookingCode;

    if (bookingCode != null) {
      bookingProvider.startPaymentPolling(bookingCode);
    }
  }

  @override
  void dispose() {
    // Hentikan polling saat screen di-dispose
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );
    final bookingCode =
        _bookingCode ?? bookingProvider.currentBooking?.bookingCode;

    if (bookingCode != null) {
      bookingProvider.stopPaymentPolling(bookingCode);
    }

    super.dispose();
  }

  Future<void> _loadPaymentInstructions() async {
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );

    setState(() {
      _isLoading = true;
    });

    try {
      // Pastikan data tidak null
      final paymentMethod = _paymentMethod ?? 'bca';
      final paymentType = _paymentType ?? 'virtual_account';

      // Panggil API untuk mendapatkan instruksi pembayaran
      final instructions = await bookingProvider.getPaymentInstructions(
        paymentMethod,
        paymentType,
      );

      setState(() {
        _paymentInstructions = instructions;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal memuat instruksi pembayaran: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Widget _buildStatusCheckButton() {
    return ElevatedButton(
      onPressed: () async {
        setState(() {
          _isLoading = true;
        });

        final bookingProvider = Provider.of<BookingProvider>(
          context,
          listen: false,
        );
        final bookingCode =
            _bookingCode ?? bookingProvider.currentBooking?.bookingCode;

        if (bookingCode != null) {
          final success = await bookingProvider.refreshPaymentStatus(
            bookingCode,
          );

          setState(() {
            _isLoading = false;
          });

          // Tampilkan snackbar hasil
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  success
                      ? 'Status pembayaran berhasil diperbarui'
                      : 'Gagal memperbarui status pembayaran',
                ),
                backgroundColor: success ? Colors.green : Colors.red,
              ),
            );
          }
        } else {
          setState(() {
            _isLoading = false;
          });
        }
      },
      style: ElevatedButton.styleFrom(
        minimumSize: const Size(double.infinity, 48),
      ),
      child: const Text('Periksa Status Pembayaran'),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final booking = bookingProvider.currentBooking;

    if (booking == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Pembayaran')),
        body: const Center(child: Text('Data pemesanan tidak ditemukan')),
      );
    }

    final payment = booking.latestPayment;
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Scaffold(
      appBar: AppBar(title: const Text('Instruksi Pembayaran')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Ringkasan Pembayaran
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Total Pembayaran',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      currencyFormat.format(booking.totalAmount),
                      style: Theme.of(
                        context,
                      ).textTheme.headlineMedium?.copyWith(
                        color: Colors.blue,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text('Kode Booking: ${booking.bookingCode}'),
                    Text('Status: ${booking.statusDisplay}'),
                    Text(
                      'Batas Waktu: ${DateFormat('dd MMM yyyy, HH:mm').format(payment?.expiryTime ?? DateTime.now().add(const Duration(hours: 24)))}',
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Informasi Pembayaran
            if (payment != null) ...[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Informasi Pembayaran',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 16),

                      // VA Number
                      if (payment.virtualAccountNumber != null) ...[
                        const Text('Nomor Virtual Account:'),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  payment.virtualAccountNumber!,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.copy),
                                onPressed: () {
                                  Clipboard.setData(
                                    ClipboardData(
                                      text: payment.virtualAccountNumber!,
                                    ),
                                  );
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Nomor VA disalin'),
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      ],

                      // QR Code
                      if (payment.qrCodeUrl != null) ...[
                        const SizedBox(height: 16),
                        const Text('QR Code Pembayaran:'),
                        const SizedBox(height: 8),
                        Center(
                          child: Image.network(
                            payment.qrCodeUrl!,
                            width: 200,
                            height: 200,
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return const Center(
                                child: CircularProgressIndicator(),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) {
                              return const Text('QR Code tidak tersedia');
                            },
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],

            const SizedBox(height: 16),

            // Instruksi Pembayaran
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Cara Pembayaran',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 16),
                    // Tambahkan instruksi pembayaran sesuai metode yang dipilih
                    // Ini bisa diambil dari database atau hardcoded
                    _buildPaymentInstructions(),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Tombol Bantuan
            ElevatedButton.icon(
              onPressed: () {
                // Tampilkan dialog bantuan atau navigasi ke halaman bantuan
              },
              icon: const Icon(Icons.help_outline),
              label: const Text('Bantuan Pembayaran'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
              ),
            ),

            const SizedBox(height: 12),

            // Tombol Kembali
            OutlinedButton(
              onPressed: () {
                Navigator.pushNamedAndRemoveUntil(
                  context,
                  '/home',
                  (route) => false,
                );
              },
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
              ),
              child: const Text('Kembali ke Beranda'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentInstructions() {
    final List<Map<String, String>> steps = [
      {'step': '1', 'text': 'Buka aplikasi mobile banking Anda'},
      {'step': '2', 'text': 'Pilih menu Transfer atau Pembayaran'},
      {'step': '3', 'text': 'Pilih Virtual Account atau Pembayaran Tagihan'},
      {
        'step': '4',
        'text': 'Masukkan nomor Virtual Account yang tertera di atas',
      },
      {'step': '5', 'text': 'Pastikan detail pembayaran sudah benar'},
      {'step': '6', 'text': 'Masukkan PIN atau password Anda'},
      {'step': '7', 'text': 'Pembayaran Anda akan diproses secara otomatis'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children:
          steps.map((step) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: Colors.blue,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        step['step']!,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: Text(step['text']!)),
                ],
              ),
            );
          }).toList(),
    );
  }

  Widget _buildPaymentInfoCard(BuildContext context, dynamic booking) {
    if (booking == null) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Text('Data pembayaran tidak ditemukan'),
        ),
      );
    }

    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Selesaikan Pembayaran',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Kode Booking:'),
                Text(
                  booking.bookingCode,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Status:'),
                _buildStatusChip(booking.status),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Total Pembayaran:'),
                Text(
                  currencyFormat.format(booking.totalAmount),
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (booking.latestPayment?.expiryTime != null) ...[
              const Divider(),
              const SizedBox(height: 8),
              Text(
                'Bayar sebelum: ${DateFormat('dd MMM yyyy, HH:mm', 'id_ID').format(booking.latestPayment!.expiryTime!)}',
                style: TextStyle(
                  color:
                      _isNearExpiry(booking.latestPayment!.expiryTime!)
                          ? Colors.red
                          : Colors.black,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildVirtualAccountCard(BuildContext context, dynamic booking) {
    final payment = booking.latestPayment;
    final vaNumber = payment?.virtualAccountNumber;

    if (vaNumber == null) return const SizedBox.shrink();

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${_paymentMethod?.toUpperCase() ?? 'Virtual Account'}',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            const Text('Nomor Virtual Account:'),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      vaNumber,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.copy),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: vaNumber)).then((
                        _,
                      ) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Nomor VA disalin ke clipboard'),
                          ),
                        );
                      });
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInstructionsCard(BuildContext context) {
    final steps = _paymentInstructions!['steps'] as List;

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _paymentInstructions!['title'] ?? 'Cara Pembayaran',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            ...steps.asMap().entries.map((entry) {
              int idx = entry.key;
              String step = entry.value;

              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          '${idx + 1}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(child: Text(step)),
                  ],
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    String label;

    switch (status) {
      case 'PENDING':
        color = Colors.orange;
        label = 'Menunggu Pembayaran';
        break;
      case 'CONFIRMED':
        color = Colors.green;
        label = 'Pembayaran Berhasil';
        break;
      case 'CANCELLED':
        color = Colors.red;
        label = 'Dibatalkan';
        break;
      default:
        color = Colors.grey;
        label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontWeight: FontWeight.bold),
      ),
    );
  }

  bool _isNearExpiry(DateTime expiry) {
    final now = DateTime.now();
    final remaining = expiry.difference(now);
    return remaining.inMinutes < 60 && remaining.inMinutes > 0;
  }
}
