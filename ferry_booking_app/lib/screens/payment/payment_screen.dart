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

  // Timer state variables
  Timer? _countdownTimer;
  int _remainingSeconds = 300; // Default 5 menit
  DateTime? _expiryTime;
  bool _isTimerInitialized = false;
  Timer? _statusRefreshTimer;

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

      // TAMBAHAN: Refresh status payment lebih sering (setiap 3 detik)
      _statusRefreshTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
        if (mounted && _bookingCode != null) {
          _refreshPaymentStatus();
        }
      });
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Simpan referensi ke provider
    _bookingProvider = Provider.of<BookingProvider>(context, listen: false);

    // Tambahkan listener untuk status pembayaran
    if (_bookingProvider != null) {
      _bookingProvider!.addListener(_checkPaymentStatus);
    }
  }

  void _checkPaymentStatus() {
    // Cek jika booking sudah ada dan pembayaran sudah sukses
    final booking = _bookingProvider?.currentBooking;
    if (booking != null &&
        (booking.status == 'CONFIRMED' || booking.status == 'PAID')) {
      // PERBAIKAN: Hentikan timer countdown jika pembayaran sukses
      _countdownTimer?.cancel();
      _statusRefreshTimer?.cancel();

      // Jika pembayaran sukses, tampilkan dialog sukses
      _showPaymentSuccessDialog();
    }
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
    if (bookingProvider.currentBooking != null) {
      _initializeTimer(bookingProvider.currentBooking?.latestPayment);
      return;
    }

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

          _initializeTimer(currentBooking.latestPayment);
        }
      }
    } catch (e) {
      debugPrint('Error loading booking details: $e');
    }
  }

  void _initializeTimer(dynamic payment) {
    if (payment == null || _isTimerInitialized) return;

    // TAMBAHAN: Cek status pembayaran terlebih dahulu
    if (_bookingProvider?.currentBooking?.status == 'CONFIRMED' ||
        _bookingProvider?.currentBooking?.status == 'PAID' ||
        payment.status == 'SUCCESS') {
      // Jika pembayaran sudah sukses, tidak perlu timer
      _isTimerInitialized = true;
      _remainingSeconds = 0;
      return;
    }

    _isTimerInitialized = true;

    // Validasi dan set expiry time
    if (payment.expiryTime != null) {
      final now = DateTime.now();
      final difference = payment.expiryTime.difference(now);

      // Validasi waktu expiry
      if (difference.inMinutes > 60 || difference.isNegative) {
        // Gunakan default 5 menit jika tidak valid
        debugPrint(
          'WARNING: Waktu expiry tidak valid, menggunakan 5 menit default',
        );
        _expiryTime = now.add(const Duration(minutes: 5));
      } else {
        _expiryTime = payment.expiryTime;
      }
    } else {
      // Default ke 5 menit jika tidak ada expiry time
      _expiryTime = DateTime.now().add(const Duration(minutes: 5));
    }

    // Hitung remaining seconds
    final now = DateTime.now();
    final remaining = _expiryTime!.difference(now);

    // Set remaining seconds dan mulai timer
    if (remaining.inSeconds > 0) {
      setState(() {
        _remainingSeconds = remaining.inSeconds;
      });
      _startCountdownTimer();
    } else {
      setState(() {
        _remainingSeconds = 0;
      });
    }
  }

  void _startCountdownTimer() {
    // Hentikan timer yang berjalan jika ada
    _countdownTimer?.cancel();

    // TAMBAHAN: Cek status pembayaran terlebih dahulu
    if (_bookingProvider?.currentBooking?.status == 'CONFIRMED' ||
        _bookingProvider?.currentBooking?.status == 'PAID' ||
        (_bookingProvider?.currentBooking?.latestPayment?.status ==
            'SUCCESS')) {
      return;
    }

    // Mulai timer baru yang memperbarui UI setiap detik
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() {
          _remainingSeconds--;
        });
      } else {
        timer.cancel();
        // PENTING: Periksa status pembayaran terbaru sebelum menampilkan dialog expired
        if (mounted) {
          final bookingProvider = Provider.of<BookingProvider>(
            context,
            listen: false,
          );
          bookingProvider.refreshPaymentStatus(_bookingCode!).then((success) {
            if (!mounted) return;

            final booking = bookingProvider.currentBooking;
            if (booking != null &&
                (booking.status == 'CONFIRMED' || booking.status == 'PAID')) {
              // Jika pembayaran berhasil, tampilkan dialog sukses
              _showPaymentSuccessDialog();
            } else {
              // Hanya tampilkan dialog expired jika benar-benar belum dibayar
              _showPaymentExpiredDialog();
            }
          });
        }
      }
    });
  }

  void _showPaymentExpiredDialog() {
    // Double-check status pembayaran terbaru dari server
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );
    bookingProvider.refreshPaymentStatus(_bookingCode!).then((success) {
      if (!mounted) return;

      final booking = bookingProvider.currentBooking;
      // Hanya tampilkan dialog expired jika status bukan CONFIRMED/PAID
      if (booking != null &&
          !(booking.status == 'CONFIRMED' || booking.status == 'PAID')) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (BuildContext context) {
            return WillPopScope(
              onWillPop: () async => false,
              child: AlertDialog(
                // Sama seperti kode dialog original
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                title: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.timer_off_rounded,
                        size: 48,
                        color: Colors.red.shade700,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Pembayaran Kadaluarsa',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Waktu pembayaran Anda telah habis. Pembayaran tidak dapat diproses lagi.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 15,
                        color: Colors.grey.shade800,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Silakan kembali ke beranda untuk melakukan pemesanan ulang.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 15,
                        color: Colors.grey.shade800,
                        fontWeight: FontWeight.w500,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
                actions: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    child: SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.of(
                            context,
                          ).pushNamedAndRemoveUntil('/home', (route) => false);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red.shade700,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        child: const Text(
                          'Kembali ke Beranda',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      } else if (booking != null &&
          (booking.status == 'CONFIRMED' || booking.status == 'PAID')) {
        // Jika status adalah CONFIRMED/PAID, tampilkan dialog sukses sebagai gantinya
        _showPaymentSuccessDialog();
      }
    });
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
    // Hentikan countdown timer
    _countdownTimer?.cancel();

    // TAMBAHAN: Hentikan timer refresh status
    _statusRefreshTimer?.cancel();

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
    if (_isRefreshing) return; // Hindari multiple refresh bersamaan

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

      // TAMBAHAN: Cek status setelah refresh
      if (success) {
        final booking = bookingProvider.currentBooking;
        if (booking != null &&
            (booking.status == 'CONFIRMED' ||
                booking.status == 'PAID' ||
                (booking.latestPayment?.status == 'SUCCESS'))) {
          // Hentikan semua timer dan tampilkan dialog sukses
          _countdownTimer?.cancel();
          _statusRefreshTimer?.cancel();
          _showPaymentSuccessDialog();
          return;
        }
      }

      if (mounted) {
        setState(() {
          _isRefreshing = false;
        });
      }

      // Re-initialize timer after refresh if needed
      if (success && !_isTimerInitialized) {
        _initializeTimer(bookingProvider.currentBooking?.latestPayment);
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

  // Fungsi untuk mendapatkan warna berdasarkan waktu tersisa
  Color _getRemainingTimeColor() {
    if (_remainingSeconds <= 60) {
      return Colors.red;
    } else if (_remainingSeconds <= 120) {
      return Colors.orange;
    } else {
      return Colors.green.shade700;
    }
  }

  // Fungsi untuk memformat waktu tersisa
  String _formatRemainingTime() {
    final minutes = (_remainingSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (_remainingSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  Future<bool> _onWillPop() async {
    // Tampilkan dialog konfirmasi
    bool? shouldNavigateHome = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Konfirmasi'),
            content: const Text(
              'Pembayaran sedang diproses. Apakah Anda ingin kembali ke beranda?',
            ),
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
      Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
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
            automaticallyImplyLeading: false,
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
                  onPressed:
                      () => Navigator.of(
                        context,
                      ).pushNamedAndRemoveUntil('/home', (route) => false),
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

    // Initialize timer if not already done and payment exists
    if (!_isTimerInitialized && payment != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _initializeTimer(payment);
      });
    }

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
            builder:
                (context) => AlertDialog(
                  title: const Text('Konfirmasi'),
                  content: const Text(
                    'Pembayaran sedang diproses. Apakah Anda ingin kembali ke beranda?',
                  ),
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
        backgroundColor: Colors.grey[100],
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: AppBar(
            elevation: 0,
            backgroundColor: bankColor,
            title: const Text(
              'Instruksi Pembayaran',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 18,
                letterSpacing: 0.2,
              ),
            ),
            centerTitle: true,
            automaticallyImplyLeading: false,
            leading: Container(),
            flexibleSpace: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [bankColor, bankColor.withOpacity(0.85)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(4),
              child: Container(
                height: 4,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      bankColor.withOpacity(0.5),
                      bankColor.withOpacity(0.1),
                      Colors.transparent,
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
            ),
            systemOverlayStyle: SystemUiOverlayStyle(
              statusBarColor: Colors.transparent,
              statusBarIconBrightness: Brightness.light,
              statusBarBrightness: Brightness.dark,
            ),
          ),
        ),
        body:
            _isLoading
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
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Ringkasan Booking dengan Timer
                              _buildBookingSummary(booking, payment, bankColor),

                              const SizedBox(height: 20),

                              // Informasi Pembayaran
                              _buildPaymentInfo(payment, bankColor),

                              const SizedBox(height: 20),

                              // Instruksi Pembayaran
                              _buildPaymentInstructionsCard(bankColor),

                              const SizedBox(height: 24),

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
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: bankColor.withOpacity(0.15),
                  blurRadius: 30,
                  spreadRadius: 5,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Center(
              child: SizedBox(
                width: 60,
                height: 60,
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(bankColor),
                  strokeWidth: 3,
                ),
              ),
            ),
          ),
          const SizedBox(height: 40),
          Text(
            'Memuat Data Pembayaran...',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Colors.grey[800],
            ),
          ),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Text(
              'Mohon tunggu sebentar sementara kami mempersiapkan instruksi pembayaran Anda',
              style: TextStyle(
                fontSize: 15,
                color: Colors.grey[600],
                height: 1.5,
                letterSpacing: 0.2,
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
            bankColor,
            bankColor.withOpacity(0.8),
            bankColor.withOpacity(0.4),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(40),
          bottomRight: Radius.circular(40),
        ),
        boxShadow: [
          BoxShadow(
            color: bankColor.withOpacity(0.25),
            blurRadius: 25,
            offset: const Offset(0, 10),
            spreadRadius: 2,
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 40),
      child: Column(
        children: [
          // Payment method logo and name
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 15,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(8),
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
                                    fontSize: 18,
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
                                fontSize: 18,
                              ),
                            ),
                          ),
                ),
                const SizedBox(width: 14),
                Text(
                  displayName,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                    letterSpacing: 0.2,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Amount to pay
          Container(
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                  spreadRadius: 1,
                ),
              ],
            ),
            child: Column(
              children: [
                Text(
                  'Total Pembayaran',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.grey[600],
                    letterSpacing: 0.3,
                  ),
                ),
                const SizedBox(height: 12),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    currencyFormat.format(booking.totalAmount),
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: bankColor,
                      letterSpacing: -0.3,
                      height: 1.2,
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Booking code pill with icon
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: bankColor.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(
                      color: bankColor.withOpacity(0.2),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.confirmation_number_outlined,
                        size: 18,
                        color: bankColor,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Kode Booking: ${booking.bookingCode}',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: bankColor,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingSummary(
    dynamic booking,
    dynamic payment,
    Color bankColor,
  ) {
    // Get expiry time from either timer or payment data
    DateTime expiryDate =
        _expiryTime ?? DateTime.now().add(const Duration(minutes: 5));

    return Card(
      margin: const EdgeInsets.only(top: 8),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(color: Colors.grey.shade200, width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status and timer row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Status badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.blue.shade100.withOpacity(0.5),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.schedule,
                        size: 16,
                        color: Colors.blue.shade700,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        booking.statusDisplay ?? "PENDING",
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.blue.shade700,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ],
                  ),
                ),

                // Timer display with animation and pulse effect
                TweenAnimationBuilder<double>(
                  tween: Tween<double>(begin: 0.95, end: 1.05),
                  duration: const Duration(milliseconds: 1000),
                  curve: Curves.easeInOut,
                  builder: (context, value, child) {
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: _getRemainingTimeColor().withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _getRemainingTimeColor().withOpacity(0.3),
                          width: 1.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: _getRemainingTimeColor().withOpacity(0.2),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.timer,
                            size: 16,
                            color: _getRemainingTimeColor(),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _formatRemainingTime(),
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: _getRemainingTimeColor(),
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Progress bar for time remaining with animated background
            Stack(
              children: [
                // Background with subtle animation
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  height: 8,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),

                // Progress indicator with gradient
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  height: 8,
                  width:
                      MediaQuery.of(context).size.width *
                      (_remainingSeconds / 300) *
                      0.75, // Adjust based on parent padding
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        _getRemainingTimeColor(),
                        _getRemainingTimeColor().withOpacity(0.7),
                      ],
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                    ),
                    borderRadius: BorderRadius.circular(4),
                    boxShadow: [
                      BoxShadow(
                        color: _getRemainingTimeColor().withOpacity(0.3),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Divider with gradient effect
            Container(
              height: 1,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.grey.shade300,
                    Colors.grey.shade200,
                    Colors.grey.shade100,
                  ],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Due date with improved styling
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200, width: 1),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.event_note_rounded,
                      size: 20,
                      color: Colors.grey.shade700,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Batas Waktu Pembayaran',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        DateFormat('dd MMM yyyy, HH:mm').format(expiryDate),
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey.shade800,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
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
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(color: Colors.grey.shade200, width: 1),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Informasi Pembayaran',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade800,
                      letterSpacing: 0.2,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: bankColor.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Icon(
                        Icons.payment_rounded,
                        size: 14,
                        color: bankColor,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 30),

              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.amber.shade100.withOpacity(0.6),
                      blurRadius: 20,
                      spreadRadius: 5,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.info_outline_rounded,
                  size: 40,
                  color: Colors.amber.shade600,
                ),
              ),

              const SizedBox(height: 24),

              Text(
                'Nomor Virtual Account Sedang Disiapkan',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey.shade800,
                  letterSpacing: 0.2,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 12),

              Text(
                'Silakan refresh status pembayaran untuk melihat Virtual Account Anda',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade600,
                  height: 1.5,
                  letterSpacing: 0.2,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 30),

              SizedBox(
                width: 220,
                height: 50,
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
                          : const Icon(Icons.refresh_rounded, size: 20),
                  label: Text(
                    _isRefreshing ? 'Memeriksa...' : 'Refresh Status',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.3,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: bankColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    elevation: 0,
                    shadowColor: bankColor.withOpacity(0.3),
                    padding: const EdgeInsets.symmetric(vertical: 12),
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
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(color: Colors.grey.shade200, width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      'Informasi Pembayaran',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade800,
                        letterSpacing: 0.2,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: bankColor.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Icon(
                          Icons.payment_rounded,
                          size: 14,
                          color: bankColor,
                        ),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: bankColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.credit_card_rounded,
                    size: 22,
                    color: bankColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),

            // VA Number jika tersedia
            if (payment?.virtualAccountNumber != null) ...[
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: bankColor.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.account_balance_rounded,
                      size: 18,
                      color: bankColor,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Nomor Virtual Account:',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade700,
                      fontWeight: FontWeight.w500,
                      letterSpacing: 0.2,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 16,
                ),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200, width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.shade200.withOpacity(0.5),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        payment!.virtualAccountNumber!,
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                          color: bankColor,
                          height: 1.2,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () {
                          Clipboard.setData(
                            ClipboardData(text: payment.virtualAccountNumber!),
                          );
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Text(
                                'Nomor VA disalin ke clipboard',
                              ),
                              backgroundColor: Colors.green.shade700,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              margin: EdgeInsets.only(
                                bottom:
                                    MediaQuery.of(context).size.height - 150,
                                left: 20,
                                right: 20,
                              ),
                              duration: const Duration(seconds: 2),
                              action: SnackBarAction(
                                label: 'OK',
                                textColor: Colors.white,
                                onPressed: () {},
                              ),
                            ),
                          );
                        },
                        borderRadius: BorderRadius.circular(30),
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: bankColor.withOpacity(0.1),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: bankColor.withOpacity(0.3),
                              width: 1.5,
                            ),
                          ),
                          child: Icon(
                            Icons.copy_rounded,
                            color: bankColor,
                            size: 20,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // QR Code jika tersedia
            if (payment?.qrCodeUrl != null) ...[
              const SizedBox(height: 28),
              Center(
                child: Column(
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: bankColor.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.qr_code_rounded,
                            size: 18,
                            color: bankColor,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          'QR Code Pembayaran:',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey.shade700,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              Center(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.06),
                        blurRadius: 20,
                        spreadRadius: 2,
                        offset: const Offset(0, 5),
                      ),
                    ],
                    border: Border.all(color: Colors.grey.shade200, width: 1),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      payment!.qrCodeUrl!,
                      width: 200,
                      height: 200,
                      fit: BoxFit.cover,
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Container(
                          width: 200,
                          height: 200,
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(12),
                          ),
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
                              strokeWidth: 3,
                            ),
                          ),
                        );
                      },
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          width: 200,
                          height: 200,
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: Colors.grey.shade300,
                              width: 1,
                            ),
                          ),
                          child: Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.broken_image_rounded,
                                  size: 50,
                                  color: Colors.grey.shade500,
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  'QR Code tidak tersedia',
                                  style: TextStyle(
                                    color: Colors.grey.shade600,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
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
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: bankColor.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: bankColor.withOpacity(0.2),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.smartphone_rounded,
                        size: 16,
                        color: bankColor,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Scan dengan aplikasi ${_paymentMethod?.toUpperCase() ?? "e-wallet"} Anda',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: bankColor,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
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
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(color: Colors.grey.shade200, width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      'Cara Pembayaran',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade800,
                        letterSpacing: 0.2,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: bankColor.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Icon(
                          Icons.help_outline_rounded,
                          size: 14,
                          color: bankColor,
                        ),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: bankColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.article_rounded,
                    size: 22,
                    color: bankColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

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
                padding: const EdgeInsets.only(bottom: 20),
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
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200, width: 1),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.shade100.withOpacity(0.6),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: bankColor.withOpacity(0.1),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: bankColor.withOpacity(0.3),
                              width: 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: bankColor.withOpacity(0.1),
                                blurRadius: 5,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Center(
                            child: Text(
                              entry.value['step']!,
                              style: TextStyle(
                                color: bankColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(top: 6),
                            child: Text(
                              text,
                              style: TextStyle(
                                fontSize: 15,
                                height: 1.4,
                                color: Colors.grey.shade800,
                                letterSpacing: 0.2,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
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
              padding: const EdgeInsets.only(bottom: 20),
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
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade200, width: 1),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.shade100.withOpacity(0.6),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: bankColor.withOpacity(0.1),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: bankColor.withOpacity(0.3),
                            width: 1.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: bankColor.withOpacity(0.1),
                              blurRadius: 5,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            '${idx + 1}',
                            style: TextStyle(
                              color: bankColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Text(
                            step,
                            style: TextStyle(
                              fontSize: 15,
                              height: 1.4,
                              color: Colors.grey.shade800,
                              letterSpacing: 0.2,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
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
          height: 56,
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
                    : const Icon(Icons.refresh_rounded, size: 20),
            label: Text(
              _isRefreshing
                  ? 'Memeriksa Status...'
                  : 'Periksa Status Pembayaran',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.3,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: bankColor,
              foregroundColor: Colors.white,
              disabledBackgroundColor: Colors.grey.shade400,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 0,
              shadowColor: bankColor.withOpacity(0.4),
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Tombol Kembali
        SizedBox(
          height: 56,
          child: OutlinedButton.icon(
            onPressed: () {
              Navigator.pushNamedAndRemoveUntil(
                context,
                '/home',
                (route) => false,
              );
            },
            icon: const Icon(Icons.home_rounded, size: 20),
            label: const Text(
              'Kembali ke Beranda',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.3,
              ),
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.grey.shade700,
              side: BorderSide(color: Colors.grey.shade300, width: 1.5),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ),

        const SizedBox(height: 32),
      ],
    );
  }

  Future<void> _restartPayment() async {
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );

    setState(() {
      _isLoading = true;
    });

    try {
      // Reset status pembayaran dan proses ulang
      final success = await bookingProvider.processPayment(
        _bookingCode!,
        _paymentMethod!,
        _paymentType!,
      );

      if (success) {
        // Refresh UI dengan pembayaran baru
        setState(() {
          _isLoading = false;
          _isTimerInitialized = false; // Reset timer flag to re-initialize
        });

        // Get updated payment info
        final payment = bookingProvider.currentBooking?.latestPayment;
        if (payment != null) {
          _initializeTimer(payment);
        }

        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Pembayaran berhasil diproses ulang'),
            backgroundColor: Colors.green.shade700,
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else {
        throw Exception(bookingProvider.errorMessage);
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal memproses ulang pembayaran: $e'),
          backgroundColor: Colors.red.shade800,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _showPaymentSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return WillPopScope(
          onWillPop: () async => false,
          child: AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.check_circle_rounded,
                    size: 48,
                    color: Colors.green.shade700,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Pembayaran Berhasil',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Pembayaran Anda telah berhasil dikonfirmasi.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.grey.shade800,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'E-tiket Anda sudah dapat diakses di menu pemesanan.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.grey.shade800,
                    fontWeight: FontWeight.w500,
                    height: 1.5,
                  ),
                ),
              ],
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(
                        context,
                      ).pushNamedAndRemoveUntil('/home', (route) => false);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green.shade700,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Kembali ke Beranda',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
