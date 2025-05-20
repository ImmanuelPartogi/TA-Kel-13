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

class _PaymentScreenState extends State<PaymentScreen>
    with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  bool _isRefreshing = false;
  Map<String, dynamic>? _paymentInstructions;
  String? _paymentMethod;
  String? _paymentType;
  String? _bookingCode;
  Timer? _statusTimer;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  // Simpan referensi ke provider untuk menghindari error lifecycle
  BookingProvider? _bookingProvider;
  String? _currentBookingCode;

  final Map<String, Color> _bankColors = {
    'bca': const Color(0xFF005BAA),
    'bni': const Color(0xFFFF6600),
    'bri': const Color(0xFF00529C),
    'mandiri': const Color(0xFF003366),
    'gopay': const Color(0xFF00AAD2),
    'shopeepay': const Color(0xFFEE4D2D),
    'default': const Color(0xFF2196F3),
  };

  // Ikonografi untuk bank
  final Map<String, String> _bankIcons = {
    'bca': 'assets/images/payment_methods/bca.png',
    'bni': 'assets/images/payment_methods/bni.png',
    'bri': 'assets/images/payment_methods/bri.png',
    'mandiri': 'assets/images/payment_methods/mandiri.png',
    'gopay': 'assets/images/payment_methods/gopay.png',
    'shopeepay': 'assets/images/payment_methods/shopeepay.png',
  };

  @override
  void initState() {
    super.initState();
    // Inisialisasi data
    _paymentMethod = widget.paymentMethod;
    _paymentType = widget.paymentType;
    _bookingCode = widget.bookingCode;
    _currentBookingCode = _bookingCode;

    // Inisialisasi animasi
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    // Penting: pastikan _fadeAnimation diinisialisasi di sini
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutQuad),
    );

    // Start the animation
    _animationController.forward();

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
      final bookingProvider =
          _bookingProvider ??
          Provider.of<BookingProvider>(context, listen: false);
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

    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );

    // Jika booking sudah ada, tidak perlu load lagi
    if (bookingProvider.currentBooking != null) return;

    // Coba dapatkan booking details dari API
    try {
      // Ambil booking ID dari arguments jika ada
      final args =
          ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
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
    final bookingProvider =
        _bookingProvider ??
        Provider.of<BookingProvider>(context, listen: false);
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
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadPaymentInstructions() async {
    final bookingProvider =
        _bookingProvider ??
        Provider.of<BookingProvider>(context, listen: false);

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
            backgroundColor: Colors.red.shade800,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            margin: EdgeInsets.only(
              bottom: MediaQuery.of(context).size.height - 150,
              left: 16,
              right: 16,
            ),
          ),
        );
      }
    }
  }

  Future<void> _refreshPaymentStatus() async {
    setState(() {
      _isRefreshing = true;
    });

    final bookingProvider =
        _bookingProvider ??
        Provider.of<BookingProvider>(context, listen: false);
    final bookingCode =
        _bookingCode ?? bookingProvider.currentBooking?.bookingCode;

    if (bookingCode != null) {
      final success = await bookingProvider.refreshPaymentStatus(bookingCode);

      setState(() {
        _isRefreshing = false;
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
            backgroundColor:
                success ? Colors.green.shade700 : Colors.red.shade800,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            margin: EdgeInsets.only(
              bottom: MediaQuery.of(context).size.height - 150,
              left: 16,
              right: 16,
            ),
          ),
        );
      }
    } else {
      setState(() {
        _isRefreshing = false;
      });
    }
  }

  Color _getBankColor() {
    final method = _paymentMethod ?? 'default';
    return _bankColors[method] ?? _bankColors['default']!;
  }

  String? _getBankIcon() {
    final method = _paymentMethod;
    if (method == null) return null;
    return _bankIcons[method];
  }

  Future<bool> _onWillPop() async {
    // Tampilkan dialog konfirmasi
    bool? shouldNavigateHome = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi'),
        content: const Text('Pembayaran sedang diproses. Apakah Anda ingin kembali ke beranda?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Ya, ke Beranda'),
          ),
        ],
      ),
    );
    
    // Jika user memilih kembali ke beranda
    if (shouldNavigateHome == true) {
      Navigator.pushNamedAndRemoveUntil(
        context,
        '/home',
        (route) => false,
      );
    }
    
    // Selalu return false untuk mencegah back normal
    return false;
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final booking = bookingProvider.currentBooking;
    final primaryColor = Theme.of(context).primaryColor;
    final bankColor = _getBankColor();

    if (booking == null) {
      return PopScope(
        canPop: false,
        onPopInvoked: (didPop) {
          if (!didPop) {
            Navigator.pushNamedAndRemoveUntil(
              context,
              '/home',
              (route) => false,
            );
          }
        },
        child: Scaffold(
          backgroundColor: Colors.grey[50],
          appBar: AppBar(
            title: const Text('Pembayaran'),
            elevation: 0,
            backgroundColor: primaryColor,
            automaticallyImplyLeading: false, // Hilangkan tombol back default
          ),
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline_rounded,
                  size: 72,
                  color: Colors.amber[700],
                ),
                const SizedBox(height: 24),
                const Text(
                  'Data pemesanan tidak ditemukan',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pushNamedAndRemoveUntil(
                    '/home',
                    (route) => false,
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                  ),
                  child: const Text('Kembali ke Beranda'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final payment = booking.latestPayment;
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) async {
        if (!didPop) {
          // Tampilkan dialog konfirmasi
          bool? shouldNavigateHome = await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Konfirmasi'),
              content: const Text('Pembayaran sedang diproses. Apakah Anda ingin kembali ke beranda?'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Batal'),
                ),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Ya, ke Beranda'),
                ),
              ],
            ),
          );
          
          // Jika user memilih kembali ke beranda
          if (shouldNavigateHome == true) {
            Navigator.pushNamedAndRemoveUntil(
              context,
              '/home',
              (route) => false,
            );
          }
        }
      },
      child: Scaffold(
        backgroundColor: Colors.grey[50],
        appBar: AppBar(
          elevation: 0,
          backgroundColor: bankColor,
          title: const Text(
            'Instruksi Pembayaran',
            style: TextStyle(fontWeight: FontWeight.w600, fontSize: 20),
          ),
          centerTitle: true,
          automaticallyImplyLeading: false, // Mencegah back button muncul otomatis
          leading: Container(), // Tetap container kosong
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(8),
            child: Container(
              height: 4,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    bankColor.withOpacity(0.3),
                    bankColor.withOpacity(0.1),
                    Colors.transparent,
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),
        ),
        body: _isLoading
            ? _buildLoadingState(bankColor)
            : RefreshIndicator(
                onRefresh: _refreshPaymentStatus,
                color: bankColor,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: EdgeInsets.zero,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header dengan gradient dan informasi metode pembayaran
                      _buildPaymentHeader(
                        booking,
                        payment,
                        bankColor,
                        currencyFormat,
                      ),

                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Ringkasan Booking
                            _buildBookingSummary(booking, payment),

                            const SizedBox(height: 24),

                            // Informasi Pembayaran
                            _buildPaymentInfo(payment, bankColor),

                            const SizedBox(height: 24),

                            // Instruksi Pembayaran
                            _buildPaymentInstructionsCard(bankColor),

                            const SizedBox(height: 32),

                            // Tombol Refresh Status
                            _buildActionButtons(bankColor),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  Widget _buildLoadingState(Color bankColor) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Logo loading
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: bankColor.withOpacity(0.2),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Center(
              child: SizedBox(
                width: 50,
                height: 50,
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(bankColor),
                  strokeWidth: 3,
                ),
              ),
            ),
          ),
          const SizedBox(height: 30),
          Text(
            'Memuat Data Pembayaran...',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              'Mohon tunggu sebentar sementara kami mempersiapkan instruksi pembayaran Anda',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentHeader(
    dynamic booking,
    dynamic payment,
    Color bankColor,
    NumberFormat currencyFormat,
  ) {
    final paymentMethod = _paymentMethod ?? 'default';
    final bankIcon = _getBankIcon();
    final displayName =
        {
          'bca': 'BCA Virtual Account',
          'bni': 'BNI Virtual Account',
          'bri': 'BRI Virtual Account',
          'mandiri': 'Mandiri Bill Payment',
          'gopay': 'GoPay',
          'shopeepay': 'ShopeePay',
        }[paymentMethod] ??
        'Virtual Account';

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            bankColor.withOpacity(0.9),
            bankColor.withOpacity(0.7),
            bankColor.withOpacity(0.3),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
        boxShadow: [
          BoxShadow(
            color: bankColor.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 30),
      child: Column(
        children: [
          // Payment method logo
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(6),
                child:
                    bankIcon != null
                        ? Image.asset(
                          bankIcon,
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) {
                            return Center(
                              child: Text(
                                paymentMethod.substring(0, 1).toUpperCase(),
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: bankColor,
                                  fontSize: 16,
                                ),
                              ),
                            );
                          },
                        )
                        : Center(
                          child: Text(
                            paymentMethod.substring(0, 1).toUpperCase(),
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: bankColor,
                              fontSize: 16,
                            ),
                          ),
                        ),
              ),
              const SizedBox(width: 12),
              Text(
                displayName,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          // Amount to pay
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(15),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              children: [
                const Text(
                  'Total Pembayaran',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  currencyFormat.format(booking.totalAmount),
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: bankColor,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: bankColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: bankColor.withOpacity(0.3),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    'Kode Booking: ${booking.bookingCode}',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: bankColor,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingSummary(dynamic booking, dynamic payment) {
    final expiryDate =
        payment?.expiryTime ?? DateTime.now().add(const Duration(hours: 24));
    final now = DateTime.now();
    final remaining = expiryDate.difference(now);

    // Format the remaining time
    String remainingTime;
    if (remaining.isNegative) {
      remainingTime = 'Pembayaran kedaluwarsa';
    } else if (remaining.inHours >= 24) {
      remainingTime = '${remaining.inDays} hari ${remaining.inHours % 24} jam';
    } else {
      remainingTime =
          '${remaining.inHours} jam ${remaining.inMinutes % 60} menit';
    }

    // Get color based on remaining time
    Color timeColor;
    if (remaining.isNegative) {
      timeColor = Colors.red;
    } else if (remaining.inHours < 2) {
      timeColor = Colors.orange;
    } else {
      timeColor = Colors.green.shade700;
    }

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200, width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade100,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.schedule,
                        size: 16,
                        color: Colors.blue.shade800,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        booking.statusDisplay,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.blue.shade800,
                        ),
                      ),
                    ],
                  ),
                ),

                // Time remaining
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: timeColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.timelapse, size: 16, color: timeColor),
                      const SizedBox(width: 4),
                      Text(
                        remainingTime,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: timeColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Divider
            Divider(color: Colors.grey.shade200),

            const SizedBox(height: 16),

            // Due date
            Row(
              children: [
                Icon(Icons.event, size: 20, color: Colors.grey.shade600),
                const SizedBox(width: 10),
                Text(
                  'Batas Waktu: ',
                  style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                ),
                Text(
                  DateFormat('dd MMM yyyy, HH:mm').format(expiryDate),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentInfo(dynamic payment, Color bankColor) {
    // Jika tidak ada info pembayaran, tampilkan tombol refresh
    if (payment?.virtualAccountNumber == null && payment?.qrCodeUrl == null) {
      return Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.grey.shade200, width: 1),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                'Informasi Pembayaran',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade800,
                ),
              ),
              const SizedBox(height: 24),
              Icon(Icons.info_outline, size: 48, color: Colors.amber.shade600),
              const SizedBox(height: 16),
              const Text(
                'Nomor Virtual Account sedang disiapkan',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Silakan refresh status pembayaran untuk melihat Virtual Account Anda',
                style: TextStyle(fontSize: 14, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: 200,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: _isRefreshing ? null : _refreshPaymentStatus,
                  icon:
                      _isRefreshing
                          ? SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                              strokeWidth: 2,
                            ),
                          )
                          : const Icon(Icons.refresh),
                  label: Text(
                    _isRefreshing ? 'Refreshing...' : 'Refresh Status',
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: bankColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    elevation: 0,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200, width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Informasi Pembayaran',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade800,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: bankColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.payment, size: 20, color: bankColor),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // VA Number jika tersedia
            if (payment?.virtualAccountNumber != null) ...[
              const Text(
                'Nomor Virtual Account:',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200, width: 1),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        payment!.virtualAccountNumber!,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                          color: bankColor,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () {
                          Clipboard.setData(
                            ClipboardData(text: payment.virtualAccountNumber!),
                          );
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Text('Nomor VA disalin'),
                              backgroundColor: Colors.green.shade700,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              margin: EdgeInsets.only(
                                bottom:
                                    MediaQuery.of(context).size.height - 150,
                                left: 16,
                                right: 16,
                              ),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        },
                        borderRadius: BorderRadius.circular(30),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: bankColor.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(Icons.copy, color: bankColor, size: 20),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // QR Code jika tersedia
            if (payment?.qrCodeUrl != null) ...[
              const SizedBox(height: 24),
              const Center(
                child: Text(
                  'QR Code Pembayaran:',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                    border: Border.all(color: Colors.grey.shade200, width: 1),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      payment!.qrCodeUrl!,
                      width: 200,
                      height: 200,
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return SizedBox(
                          width: 200,
                          height: 200,
                          child: Center(
                            child: CircularProgressIndicator(
                              value:
                                  loadingProgress.expectedTotalBytes != null
                                      ? loadingProgress.cumulativeBytesLoaded /
                                          loadingProgress.expectedTotalBytes!
                                      : null,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                bankColor,
                              ),
                            ),
                          ),
                        );
                      },
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          width: 200,
                          height: 200,
                          color: Colors.grey.shade200,
                          child: Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.broken_image,
                                  size: 48,
                                  color: Colors.grey.shade600,
                                ),
                                const SizedBox(height: 8),
                                const Text(
                                  'QR Code tidak tersedia',
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: Text(
                  'Scan QR Code dengan aplikasi ${_paymentMethod?.toUpperCase() ?? "e-wallet"} Anda',
                  style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentInstructionsCard(Color bankColor) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200, width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Cara Pembayaran',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade800,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: bankColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.help_outline, size: 20, color: bankColor),
                ),
              ],
            ),
            const SizedBox(height: 20),
            // Instruksi pembayaran
            _buildPaymentInstructions(bankColor),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentInstructions(Color bankColor) {
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
        children:
            steps.asMap().entries.map((entry) {
              int idx = int.parse(entry.value['step']!) - 1;
              String text = entry.value['text']!;

              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: TweenAnimationBuilder<double>(
                  tween: Tween<double>(begin: 0.0, end: 1.0),
                  duration: Duration(milliseconds: 300 + (idx * 100)),
                  curve: Curves.easeOutCubic,
                  builder: (context, value, child) {
                    return Transform.translate(
                      offset: Offset(30 * (1 - value), 0),
                      child: Opacity(opacity: value, child: child),
                    );
                  },
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: bankColor.withOpacity(0.1),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: bankColor.withOpacity(0.3),
                            width: 1.5,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            entry.value['step']!,
                            style: TextStyle(
                              color: bankColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(
                            text,
                            style: const TextStyle(fontSize: 15, height: 1.4),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
      );
    }

    // Jika ada instruksi spesifik dari API
    final steps = _paymentInstructions!['steps'] as List;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children:
          steps.asMap().entries.map((entry) {
            int idx = entry.key;
            String step = entry.value.toString();

            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: TweenAnimationBuilder<double>(
                tween: Tween<double>(begin: 0.0, end: 1.0),
                duration: Duration(milliseconds: 300 + (idx * 100)),
                curve: Curves.easeOutCubic,
                builder: (context, value, child) {
                  return Transform.translate(
                    offset: Offset(30 * (1 - value), 0),
                    child: Opacity(opacity: value, child: child),
                  );
                },
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: bankColor.withOpacity(0.1),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: bankColor.withOpacity(0.3),
                          width: 1.5,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          '${idx + 1}',
                          style: TextStyle(
                            color: bankColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          step,
                          style: const TextStyle(fontSize: 15, height: 1.4),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
    );
  }

  Widget _buildActionButtons(Color bankColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Tombol Refresh Status
        SizedBox(
          height: 54,
          child: ElevatedButton.icon(
            onPressed: _isRefreshing ? null : _refreshPaymentStatus,
            icon:
                _isRefreshing
                    ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        strokeWidth: 2,
                      ),
                    )
                    : const Icon(Icons.refresh),
            label: Text(
              _isRefreshing
                  ? 'Memeriksa Status...'
                  : 'Periksa Status Pembayaran',
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: bankColor,
              foregroundColor: Colors.white,
              disabledBackgroundColor: Colors.grey.shade400,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 0,
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Tombol Kembali
        SizedBox(
          height: 54,
          child: OutlinedButton.icon(
            onPressed: () {
              Navigator.pushNamedAndRemoveUntil(
                context,
                '/home',
                (route) => false,
              );
            },
            icon: const Icon(Icons.home),
            label: const Text('Kembali ke Beranda'),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.grey.shade700,
              side: BorderSide(color: Colors.grey.shade300),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ),

        const SizedBox(height: 32),
      ],
    );
  }
}