import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:ferry_booking_app/config/app_config.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
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
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  // Timer state variables
  Timer? _countdownTimer;
  int _remainingSeconds = 300; // Default 5 menit
  DateTime? _expiryTime;
  bool _isTimerInitialized = false;
  Timer? _statusRefreshTimer;

  // Flag untuk mencegah dialog muncul lebih dari sekali
  bool _isPaymentSuccessDialogShown = false;

  // Simpan referensi ke provider untuk menghindari error lifecycle
  BookingProvider? _bookingProvider;
  String? _currentBookingCode;

  final Map<String, Color> _bankColors = {
    'bca': const Color(0xFF005BAA),
    'bni': const Color(0xFFFF6600),
    'bri': const Color(0xFF00529C),
    'qris': const Color(0xFF4B0082),
    'default': const Color(0xFF2196F3),
  };

  final Map<String, String> _bankIcons = {
    'bca': 'assets/images/payment_methods/bca.png',
    'bni': 'assets/images/payment_methods/bni.png',
    'bri': 'assets/images/payment_methods/bri.png',
    'qris': 'assets/images/payment_methods/qris.png',
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

      // Mulai polling dengan delay untuk mencegah panggilan simultan
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted) {
          _startPolling();
        }
      });

      // PERBAIKAN: Refresh status dengan interval yang lebih lambat (5 detik) untuk mengurangi beban
      _statusRefreshTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
        if (mounted && _bookingCode != null && !_isRefreshing) {
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

    // PERBAIKAN: Tambahkan cek untuk memastikan dialog belum ditampilkan
    if (booking != null &&
        (booking.status == 'CONFIRMED' || booking.status == 'PAID') &&
        !_isPaymentSuccessDialogShown) {
      // Hentikan semua timer untuk mencegah race condition
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
          if (mounted) {
            setState(() {
              _bookingCode = currentBooking.bookingCode;
              _currentBookingCode = _bookingCode;
            });
          }

          _initializeTimer(currentBooking.latestPayment);
        }
      }
    } catch (e) {
      debugPrint('Error loading booking details: $e');
    }
  }

  void _startCountdownTimer() {
    // Hentikan timer yang berjalan jika ada
    _countdownTimer?.cancel();

    // PERBAIKAN: Cek status pembayaran terlebih dahulu dan apakah dialog sudah ditampilkan
    if (_bookingProvider?.currentBooking?.status == 'CONFIRMED' ||
        _bookingProvider?.currentBooking?.status == 'PAID' ||
        (_bookingProvider?.currentBooking?.latestPayment?.status ==
            'SUCCESS') ||
        _isPaymentSuccessDialogShown) {
      return;
    }

    // Mulai timer baru yang memperbarui UI setiap detik
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        if (mounted) {
          setState(() {
            _remainingSeconds--;
          });
        }
      } else {
        timer.cancel();

        // PERBAIKAN: Periksa status pembayaran terbaru sebelum menampilkan dialog expired
        // dan pastikan dialog sukses belum ditampilkan
        if (mounted && !_isPaymentSuccessDialogShown) {
          final bookingProvider = Provider.of<BookingProvider>(
            context,
            listen: false,
          );
          bookingProvider.refreshPaymentStatus(_bookingCode!).then((success) {
            if (!mounted || _isPaymentSuccessDialogShown) return;

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
    // PERBAIKAN: Periksa flag untuk memastikan dialog lain belum muncul
    if (_isPaymentSuccessDialogShown) return;

    // Double-check status pembayaran terbaru dari server
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );
    bookingProvider.refreshPaymentStatus(_bookingCode!).then((success) {
      if (!mounted || _isPaymentSuccessDialogShown) return;

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
          (booking.status == 'CONFIRMED' || booking.status == 'PAID') &&
          !_isPaymentSuccessDialogShown) {
        // PERBAIKAN: Jika status adalah CONFIRMED/PAID, dan dialog belum muncul, tampilkan dialog sukses
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
      // PERBAIKAN: Mulai polling hanya jika belum dibayar
      final currentStatus = bookingProvider.currentBooking?.status;
      if (currentStatus != 'CONFIRMED' && currentStatus != 'PAID') {
        bookingProvider.startPaymentPolling(bookingCode);
      }
    }
  }

  @override
  void dispose() {
    // Hentikan countdown timer
    _countdownTimer?.cancel();

    // PERBAIKAN: Hentikan timer refresh status
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
    if (!mounted) return;

    final bookingProvider =
        _bookingProvider ??
        Provider.of<BookingProvider>(context, listen: false);

    if (mounted) {
      setState(() {
        _isLoading = true;
      });
    }

    try {
      // Pastikan data tidak null
      final paymentMethod = _paymentMethod ?? 'bca';
      final paymentType = _paymentType ?? 'virtual_account';

      // Panggil API untuk mendapatkan instruksi pembayaran
      final instructions = await bookingProvider.getPaymentInstructions(
        paymentMethod,
        paymentType,
      );

      if (mounted) {
        setState(() {
          _paymentInstructions = instructions;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });

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
    if (_isRefreshing || !mounted) return; // Hindari multiple refresh bersamaan

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

      // PERBAIKAN: Cek status setelah refresh dan pastikan dialog belum ditampilkan
      if (success && !_isPaymentSuccessDialogShown) {
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
      if (mounted) {
        setState(() {
          _isRefreshing = false;
        });
      }
    }
  }

  Color _getBankColor() {
    final method = _paymentMethod ?? 'default';
    final bankColors = {
      'bca': const Color(0xFF005BAA),
      'bni': const Color(0xFFFF6600),
      'bri': const Color(0xFF00529C),
      'permata': const Color(0xFF1F1F1F),
      'cimb': const Color(0xFF8C1919),
      'qris': const Color(0xFF4B0082),
      'default': const Color(0xFF2196F3),
    };
    return bankColors[method] ?? bankColors['default']!;
  }

  String? _getBankIcon() {
    final method = _paymentMethod;
    if (method == null) return null;

    final bankIcons = {
      'bca': 'assets/images/payment_methods/bca.png',
      'bni': 'assets/images/payment_methods/bni.png',
      'bri': 'assets/images/payment_methods/bri.png',
      'permata': 'assets/images/payment_methods/permata.png',
      'cimb': 'assets/images/payment_methods/cimb.png',
      'gopay': 'assets/images/payment_methods/gopay.png',
      'shopeepay': 'assets/images/payment_methods/shopeepay.png',
      'qris': 'assets/images/payment_methods/qris.png',
    };

    return bankIcons[method];
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
          // 'mandiri': 'Mandiri Bill Payment',
          'permata': 'Permata Virtual Account',
          'cimb': 'CIMB Virtual Account',
          'gopay': 'GoPay',
          'shopeepay': 'ShopeePay',
          'qris': 'QRIS',
        }[paymentMethod] ??
        'Metode Pembayaran';

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

                          // Tampilkan dialog sederhana sebagai pengganti snackbar
                          showDialog(
                            context: context,
                            barrierDismissible: true,
                            builder: (BuildContext dialogContext) {
                              // Buat dialog yang hilang otomatis setelah 1.5 detik
                              Future.delayed(
                                const Duration(milliseconds: 1500),
                                () {
                                  if (Navigator.canPop(dialogContext)) {
                                    Navigator.of(dialogContext).pop();
                                  }
                                },
                              );

                              return Dialog(
                                elevation: 0,
                                backgroundColor: Colors.transparent,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 20,
                                    vertical: 12,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.green.shade700,
                                    borderRadius: BorderRadius.circular(12),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.2),
                                        blurRadius: 10,
                                        offset: const Offset(0, 5),
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.check_circle_outline,
                                        color: Colors.white,
                                        size: 24,
                                      ),
                                      const SizedBox(width: 12),
                                      const Text(
                                        'Nomor VA disalin ke clipboard',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w500,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
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

              // PERBAIKAN: Handle QR Code berdasarkan payment method
              Center(child: _buildQRCodeWidget(payment, bankColor)),

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
                    children: [
                      Icon(
                        Icons.smartphone_rounded,
                        size: 16,
                        color: bankColor,
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          _getQRCodeInstructionText(),
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: bankColor,
                            letterSpacing: 0.2,
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 2,
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

  Widget _buildQRCodeWidget(dynamic payment, Color bankColor) {
    // PERBAIKAN: Validasi parameter terlebih dahulu
    if (payment == null ||
        payment.qrCodeUrl == null ||
        payment.qrCodeUrl.isEmpty) {
      return _buildFallbackQRCode(bankColor);
    }

    final qrUrl = payment.qrCodeUrl;

    return Container(
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
      child: Column(
        children: [
          // PERBAIKAN: Hapus FutureBuilder untuk menghindari race condition
          Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade200, width: 1),
            ),
            child: Stack(
              children: [
                // Layer 1: Placeholder loading
                Center(child: _buildLoadingQRCode(bankColor)),

                // Layer 2: QR Code dari URL (jika berhasil)
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    qrUrl,
                    width: 200,
                    height: 200,
                    fit: BoxFit.cover,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return const SizedBox.shrink(); // Tetap tampilkan loading di layer 1
                    },
                    errorBuilder: (context, error, stackTrace) {
                      debugPrint('Error loading QR image: $error');
                      // PERBAIKAN: Coba tampilkan QR dari qrString jika tersedia
                      return _buildQRFromString(payment, bankColor);
                    },
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Instruksi scan QR
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: bankColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              'Scan QR Code ini dengan aplikasi QRIS',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: bankColor,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  // Metode baru untuk membuat QR dari string QR
  // TAMBAHAN: Metode baru untuk membuat QR dari string
  Widget _buildQRFromString(dynamic payment, Color bankColor) {
    // Coba dapatkan QR string dari berbagai sumber
    String? qrString;

    // Cek dari property qrString di model payment
    if (payment.qrString != null) {
      qrString = payment.qrString;
    }
    // Cek dari rawData
    else if (payment.rawData != null) {
      try {
        final rawData = payment.rawData;

        // Coba dari qr_string di rawData
        if (rawData.containsKey('qr_string')) {
          qrString = rawData['qr_string'];
        }
        // Coba dari external_reference
        else if (rawData.containsKey('external_reference')) {
          qrString = rawData['external_reference'];
        }
        // Coba dari payload
        else if (rawData.containsKey('payload')) {
          var payload = rawData['payload'];
          if (payload is String) {
            try {
              final payloadData = json.decode(payload);
              if (payloadData.containsKey('qr_string')) {
                qrString = payloadData['qr_string'];
              }
            } catch (e) {
              debugPrint('Error parsing payload string: $e');
            }
          } else if (payload is Map) {
            qrString = payload['qr_string'];
          }
        }
      } catch (e) {
        debugPrint('Error getting QR string from payment data: $e');
      }
    }

    if (qrString != null && qrString.isNotEmpty) {
      try {
        return QrImageView(
          data: qrString,
          version: QrVersions.auto,
          size: 200.0,
          backgroundColor: Colors.white,
          errorStateBuilder: (context, error) {
            debugPrint('Error generating QR from string: $error');
            return _buildFallbackQRCode(bankColor);
          },
        );
      } catch (e) {
        debugPrint('Exception when creating QR from string: $e');
      }
    }

    return _buildFallbackQRCode(bankColor);
  }

  // Metode tambahan untuk cek URL dengan timeout
  Future<bool> _checkImageUrl(String url) async {
    if (url.isEmpty) return false;

    HttpClient? client;
    try {
      client = HttpClient();
      client.connectionTimeout = const Duration(
        seconds: 15,
      ); // Waktu timeout ditambah

      // Tambahkan validasi URL
      final uri = Uri.parse(url);
      if (!uri.isAbsolute) return false;

      final request = await client.getUrl(uri);

      // PERBAIKAN: Tangani timeout dengan lebih baik
      final response = await request.close().timeout(
        const Duration(seconds: 15), // Waktu timeout ditambah
        onTimeout: () {
          client?.close();
          debugPrint('Timeout saat akses URL QR Code: $url');
          return Stream<List<int>>.empty().cast<HttpClientResponse>().first;
        },
      );

      final isSuccess = response.statusCode >= 200 && response.statusCode < 300;
      debugPrint(
        'QR Code URL check: $url => status: ${response.statusCode}, success: $isSuccess',
      );
      return isSuccess;
    } catch (e) {
      // PERBAIKAN: Log error lebih detail
      debugPrint('Error checking QR code URL: $e');
      return false;
    } finally {
      // PERBAIKAN: Pastikan client selalu ditutup
      client?.close();
    }
  }

  // Widget untuk tampilan loading
  Widget _buildLoadingQRCode(Color bankColor) {
    return Container(
      width: 200,
      height: 200,
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(bankColor),
              strokeWidth: 3,
            ),
            const SizedBox(height: 12),
            Text(
              'Memuat QR Code...',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductionQRCode(String qrUrl, Color bankColor) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.network(
        qrUrl,
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
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(
                    value:
                        loadingProgress.expectedTotalBytes != null
                            ? loadingProgress.cumulativeBytesLoaded /
                                loadingProgress.expectedTotalBytes!
                            : null,
                    valueColor: AlwaysStoppedAnimation<Color>(bankColor),
                    strokeWidth: 3,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Memuat QR Code...',
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
          );
        },
        errorBuilder: (context, error, stackTrace) {
          print('Error loading ShopeePay QR code: $error');
          return _buildErrorQRCode(bankColor);
        },
      ),
    );
  }

  // Widget untuk instruksi production
  Widget _buildProductionInstructions() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFEE4D2D).withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFFEE4D2D).withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.smartphone, size: 20, color: const Color(0xFFEE4D2D)),
              const SizedBox(width: 8),
              Text(
                'Cara Pembayaran',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFFEE4D2D),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Buka aplikasi Shopee → Tap "Saya" → Pilih "ShopeePay" → Tap "Scan" → Arahkan kamera ke QR Code di atas',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade700,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  // PERBAIKAN: Metode untuk inisialisasi timer dengan penanganan yang lebih baik
  void _initializeTimer(dynamic payment) {
    if (payment == null || _isTimerInitialized || !mounted) return;

    // PERBAIKAN: Cek status pembayaran terlebih dahulu
    if (_bookingProvider?.currentBooking?.status == 'CONFIRMED' ||
        _bookingProvider?.currentBooking?.status == 'PAID' ||
        payment.status == 'SUCCESS') {
      _isTimerInitialized = true;
      _remainingSeconds = 0;

      // Jika pembayaran sudah berhasil, tampilkan dialog sukses
      if (!_isPaymentSuccessDialogShown) {
        // Gunakan future.delayed untuk mencegah error setState during build
        Future.delayed(Duration.zero, () {
          _showPaymentSuccessDialog();
        });
      }
      return;
    }

    _isTimerInitialized = true;

    // PERBAIKAN: Enhanced expiry time validation dengan parsing yang benar
    if (payment.expiryTime != null) {
      final now = DateTime.now();
      try {
        final expiryTime = payment.expiryTime;
        final difference = expiryTime.difference(now);

        // PERBAIKAN: Validasi range waktu yang masuk akal (1 menit - 10 menit)
        if (difference.inMinutes < 1 || difference.inMinutes > 10) {
          debugPrint('WARNING: Invalid expiry time detected');
          debugPrint('  Current time: $now');
          debugPrint('  Expiry time: $expiryTime');
          debugPrint('  Difference: ${difference.inMinutes} minutes');
          debugPrint('  Using 5 minutes default');

          _expiryTime = now.add(const Duration(minutes: 5));
        } else {
          _expiryTime = expiryTime;
        }
      } catch (e) {
        debugPrint('Error parsing expiry time: $e');
        _expiryTime = now.add(const Duration(minutes: 5));
      }
    } else {
      debugPrint('No expiry time provided, using 5 minutes default');
      _expiryTime = DateTime.now().add(const Duration(minutes: 5));
    }

    // Hitung remaining seconds dan mulai timer
    final now = DateTime.now();
    final remaining = _expiryTime!.difference(now);

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

    debugPrint('Timer initialized: ${_remainingSeconds}s remaining');
  }

  // Widget untuk QR Code normal (GoPay dan lainnya)
  Widget _buildNormalQRCode(String qrUrl, Color bankColor, [dynamic payment]) {
    return Container(
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
      child: Column(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.network(
              qrUrl,
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
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CircularProgressIndicator(
                          value:
                              loadingProgress.expectedTotalBytes != null
                                  ? loadingProgress.cumulativeBytesLoaded /
                                      loadingProgress.expectedTotalBytes!
                                  : null,
                          valueColor: AlwaysStoppedAnimation<Color>(bankColor),
                          strokeWidth: 3,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Memuat QR Code...',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
              errorBuilder: (context, error, stackTrace) {
                print('❌ Error loading QR code: $error');
                // Buat QR Code lokal sebagai fallback
                return _buildFallbackQRCode(bankColor);
              },
            ),
          ),
          const SizedBox(height: 16),
          // Instruksi scan QR
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: bankColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              'Scan QR Code ini dengan aplikasi QRIS',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: bankColor,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  // Tambahkan metode baru untuk QR code fallback
  Widget _buildFallbackQRCode(Color bankColor) {
    return Container(
      width: 200,
      height: 200,
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300, width: 1),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // PERBAIKAN: Ikon lebih relevan
            Icon(Icons.qr_code_scanner, size: 50, color: Colors.grey.shade500),
            const SizedBox(height: 12),
            Text(
              'QR Code tidak tersedia',
              style: TextStyle(
                color: Colors.grey.shade700,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            // PERBAIKAN: Tambah informasi lanjutan
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'Coba refresh atau gunakan metode pembayaran lain',
                style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 16),
            // PERBAIKAN: Tombol refresh lebih visible
            SizedBox(
              height: 36,
              child: ElevatedButton.icon(
                onPressed: () {
                  // PERBAIKAN: Cek apakah refresh sedang berjalan
                  if (!_isRefreshing) _refreshPaymentStatus();
                },
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('Coba Lagi', style: TextStyle(fontSize: 12)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: bankColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
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

  // Widget untuk QR Code error
  Widget _buildErrorQRCode(Color bankColor) {
    return Container(
      width: 200,
      height: 200,
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300, width: 1),
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
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: _refreshPaymentStatus,
              icon: const Icon(Icons.refresh, size: 16),
              label: const Text('Refresh', style: TextStyle(fontSize: 12)),
              style: ElevatedButton.styleFrom(
                backgroundColor: bankColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                minimumSize: Size.zero,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Method untuk mendapatkan instruction text
  String _getQRCodeInstructionText() {
    return 'Scan QR Code ini dengan aplikasi mobile banking atau e-wallet yang mendukung QRIS';
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

      return _buildInstructionsList(steps, bankColor);
    }

    // PERBAIKAN: Handle struktur instruksi yang berbeda untuk e-wallet
    List<String> steps = [];

    try {
      // Cek apakah ada struktur khusus untuk e-wallet (GoPay/ShopeePay)
      if (_paymentInstructions!.containsKey('qr_code_steps') &&
          _paymentInstructions!.containsKey('deeplink_steps')) {
        // Untuk GoPay yang memiliki qr_code_steps dan deeplink_steps
        final qrSteps = _paymentInstructions!['qr_code_steps'];
        final deeplinkSteps = _paymentInstructions!['deeplink_steps'];

        if (qrSteps is List && qrSteps.isNotEmpty) {
          steps = qrSteps.cast<String>();
        } else if (deeplinkSteps is List && deeplinkSteps.isNotEmpty) {
          steps = deeplinkSteps.cast<String>();
        }
      } else if (_paymentInstructions!.containsKey('steps')) {
        // Struktur normal dengan 'steps'
        final stepsData = _paymentInstructions!['steps'];
        if (stepsData is List) {
          steps = stepsData.cast<String>();
        }
      }

      // Fallback jika masih kosong
      if (steps.isEmpty) {
        steps = [
          'Buka aplikasi ${_paymentMethod?.toUpperCase() ?? "pembayaran"}',
          'Scan QR Code yang ditampilkan',
          'Verifikasi jumlah pembayaran',
          'Konfirmasi dan selesaikan pembayaran',
        ];
      }
    } catch (e) {
      print('Error parsing payment instructions: $e');
      // Fallback ke instruksi default
      steps = [
        'Buka aplikasi pembayaran',
        'Scan QR Code atau ikuti instruksi',
        'Verifikasi jumlah pembayaran',
        'Konfirmasi pembayaran',
      ];
    }

    // Convert ke format yang diharapkan
    final List<Map<String, String>> stepsFormatted =
        steps.asMap().entries.map((entry) {
          return {'step': '${entry.key + 1}', 'text': entry.value};
        }).toList();

    return _buildInstructionsList(stepsFormatted, bankColor);
  }

  Widget _buildInstructionsList(
    List<Map<String, String>> steps,
    Color bankColor,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children:
          steps.asMap().entries.map((entry) {
            int idx = entry.key;
            Map<String, String> stepData = entry.value;
            String stepNumber = stepData['step']!;
            String text = stepData['text']!;

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
                            stepNumber,
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
    // Jika dialog sudah ditampilkan sebelumnya, jangan tampilkan lagi
    if (_isPaymentSuccessDialogShown) return;

    // Set flag untuk menandai dialog sudah ditampilkan
    _isPaymentSuccessDialogShown = true;

    // Batalkan semua timer untuk mencegah pemanggilan berulang
    _countdownTimer?.cancel();
    _statusRefreshTimer?.cancel();

    if (!mounted) return;

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

  void _safeSetState(Function setState) {
    if (mounted) {
      setState();
    }
  }
}
