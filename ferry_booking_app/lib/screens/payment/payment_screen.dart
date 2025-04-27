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
  
  // Simpan referensi ke provider untuk menghindari error lifecycle
  BookingProvider? _bookingProvider;
  String? _currentBookingCode;

  @override
  void initState() {
    super.initState();
    _paymentMethod = widget.paymentMethod;
    _paymentType = widget.paymentType;
    _bookingCode = widget.bookingCode;
    _currentBookingCode = _bookingCode;

    // Gunakan addPostFrameCallback untuk operasi yang mempengaruhi state
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initPaymentData();
      _startPolling(); // Mulai polling saat halaman dibuka
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Simpan referensi ke provider
    _bookingProvider = Provider.of<BookingProvider>(context, listen: false);
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
          _currentBookingCode = _bookingCode;
        });
      }
    }

    // Pastikan nilai default jika masih null
    if (_paymentMethod == null) _paymentMethod = 'bca';
    if (_paymentType == null) _paymentType = 'virtual_account';
    if (_bookingCode == null) {
      // Jika masih null, coba ambil dari currentBooking
      final bookingProvider = _bookingProvider ?? Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      _bookingCode = bookingProvider.currentBooking?.bookingCode;
      _currentBookingCode = _bookingCode;
    }

    // Coba load booking details jika perlu
    await _loadBookingDetails();
    await _loadPaymentInstructions();
  }

  // Metode untuk memuat detail booking dengan aman
  Future<void> _loadBookingDetails() async {
    if (!mounted) return;
    
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    
    // Jika booking sudah ada, tidak perlu load lagi
    if (bookingProvider.currentBooking != null) return;
    
    // Coba dapatkan booking details dari API
    try {
      // Ambil booking ID dari arguments jika ada
      final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
      final bookingId = args?['bookingId'] as int?;
      
      if (bookingId != null) {
        // Gunakan notify: false untuk menghindari error setState during build
        await bookingProvider.getBookingDetails(bookingId);
        
        // Update current booking code jika berhasil
        final currentBooking = bookingProvider.currentBooking;
        if (currentBooking != null) {
          setState(() {
            _bookingCode = currentBooking.bookingCode;
            _currentBookingCode = _bookingCode;
          });
        }
      }
    } catch (e) {
      print('Error loading booking details: $e');
    }
  }

  void _startPolling() {
    final bookingProvider = _bookingProvider ?? Provider.of<BookingProvider>(
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
    final bookingCode = widget.bookingCode ?? _currentBookingCode;
    if (bookingCode != null && _bookingProvider != null) {
      _bookingProvider!.stopPaymentPolling(bookingCode);
    }
    super.dispose();
  }

  Future<void> _loadPaymentInstructions() async {
    final bookingProvider = _bookingProvider ?? Provider.of<BookingProvider>(
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

  Future<void> _refreshPaymentStatus() async {
    setState(() {
      _isLoading = true;
    });

    final bookingProvider = _bookingProvider ?? Provider.of<BookingProvider>(
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
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _refreshPaymentStatus,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
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

                    // Informasi Pembayaran - Perbaikan untuk menangani null VA
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

                            // Jika tidak ada info pembayaran, tampilkan tombol refresh
                            if (payment?.virtualAccountNumber == null && 
                                payment?.qrCodeUrl == null) ...[
                              Center(
                                child: Column(
                                  children: [
                                    Icon(Icons.info_outline, 
                                         size: 48, 
                                         color: Colors.amber),
                                    const SizedBox(height: 12),
                                    const Text(
                                      'Nomor Virtual Account sedang disiapkan.\nSilakan refresh status pembayaran.',
                                      textAlign: TextAlign.center,
                                    ),
                                    const SizedBox(height: 16),
                                    ElevatedButton.icon(
                                      onPressed: _refreshPaymentStatus,
                                      icon: const Icon(Icons.refresh),
                                      label: const Text('Refresh Status'),
                                      style: ElevatedButton.styleFrom(
                                        minimumSize: const Size(200, 44),
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            ],

                            // VA Number jika tersedia
                            if (payment?.virtualAccountNumber != null) ...[
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
                                        payment!.virtualAccountNumber!,
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

                            // QR Code jika tersedia
                            if (payment?.qrCodeUrl != null) ...[
                              const SizedBox(height: 16),
                              const Text('QR Code Pembayaran:'),
                              const SizedBox(height: 8),
                              Center(
                                child: Image.network(
                                  payment!.qrCodeUrl!,
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
                            _buildPaymentInstructions(),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Tombol Refresh Status
                    ElevatedButton.icon(
                      onPressed: _refreshPaymentStatus,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Periksa Status Pembayaran'),
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
            ),
    );
  }

  Widget _buildPaymentInstructions() {
    if (_paymentInstructions == null) {
      // Instruksi default jika tidak ada yang spesifik
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
        children: steps.map((step) {
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

    // Jika ada instruksi spesifik dari API
    final steps = _paymentInstructions!['steps'] as List;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: steps.asMap().entries.map((entry) {
        int idx = entry.key;
        String step = entry.value.toString();

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
    );
  }
}