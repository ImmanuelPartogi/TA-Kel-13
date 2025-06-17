import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/booking_provider.dart';
import '../../widgets/custom_appbar.dart';
import 'dart:developer' as developer;

/// Screen untuk memilih metode pembayaran dengan desain modern
class PaymentMethodScreen extends StatefulWidget {
  const PaymentMethodScreen({Key? key}) : super(key: key);

  @override
  _PaymentMethodScreenState createState() => _PaymentMethodScreenState();
}

class _PaymentMethodScreenState extends State<PaymentMethodScreen>
    with SingleTickerProviderStateMixin {
  String? _selectedPaymentMethod;
  String? _selectedPaymentType;
  bool _isLoading = false;
  bool _isCreatingBooking = false;
  bool _hasFetchedBooking = false;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  // Data metode pembayaran dengan path yang sesuai dengan struktur asset
  final Map<String, List<Map<String, dynamic>>> _paymentMethods = {
    'Virtual Account': [
      {
        'id': 'bca',
        'name': 'BCA Virtual Account',
        'type': 'virtual_account',
        'iconAsset': 'assets/images/payment_methods/bca.png',
        'description': 'Transfer dari mobile banking atau internet banking',
        'color': const Color(0xFF005BAA),
      },
      {
        'id': 'bni',
        'name': 'BNI Virtual Account',
        'type': 'virtual_account',
        'iconAsset': 'assets/images/payment_methods/bni.png',
        'description': 'Transfer dari mobile banking atau internet banking',
        'color': const Color(0xFFFF6600),
      },
      {
        'id': 'bri',
        'name': 'BRI Virtual Account',
        'type': 'virtual_account',
        'iconAsset': 'assets/images/payment_methods/bri.png',
        'description': 'Transfer dari mobile banking atau internet banking',
        'color': const Color(0xFF00529C),
      },
      // {
      //   'id': 'mandiri',
      //   'name': 'Mandiri Bill Payment',
      //   'type': 'virtual_account',
      //   'iconAsset': 'assets/images/payment_methods/mandiri.png',
      //   'description': 'Transfer dari mobile banking atau internet banking',
      //   'color': const Color(0xFF003366),
      // },
      {
        'id': 'permata',
        'name': 'Permata Virtual Account',
        'type': 'virtual_account',
        'iconAsset': 'assets/images/payment_methods/permata.png',
        'description': 'Transfer dari mobile banking atau internet banking',
        'color': const Color(0xFF1F1F1F),
      },
      {
        'id': 'cimb',
        'name': 'CIMB Virtual Account',
        'type': 'virtual_account',
        'iconAsset': 'assets/images/payment_methods/cimb.png',
        'description': 'Transfer dari mobile banking atau internet banking',
        'color': const Color(0xFF8C1919),
      },
    ],
    'E-Wallet': [
      {
        'id': 'gopay',
        'name': 'GoPay',
        'type': 'e_wallet',
        'iconAsset': 'assets/images/payment_methods/gopay.png',
        'description': 'Bayar menggunakan aplikasi e-wallet',
        'color': const Color(0xFF00AAD2),
      },
      {
        'id': 'shopeepay',
        'name': 'ShopeePay',
        'type': 'e_wallet',
        'iconAsset': 'assets/images/payment_methods/shopeepay.png',
        'description': 'Bayar menggunakan aplikasi e-wallet',
        'color': const Color(0xFFEE4D2D),
      },
    ],
    'QRIS': [
      {
        'id': 'qris',
        'name': 'QRIS',
        'type': 'qris',
        'iconAsset': 'assets/images/payment_methods/qris.png',
        'description':
            'Bayar dengan scan QRIS di aplikasi mobile banking/e-wallet',
        'color': const Color(0xFF4B0082),
      },
    ],
  };

  @override
  void initState() {
    super.initState();

    // Setup animasi untuk fade-in effect
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );
    _animationController.forward();

    // Jalankan pengecekan booking setelah build pertama
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkBookingData();
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  // Cek dan persiapkan data booking dengan penanganan error yang lebih baik
  void _checkBookingData() {
    if (_hasFetchedBooking) return; // Hindari multiple fetch

    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );

    setState(() {
      _isCreatingBooking = true;
      _hasFetchedBooking = true;
    });

    // Log untuk debugging
    developer.log('Checking booking data...');
    developer.log('Has active booking: ${bookingProvider.hasActiveBooking}');
    if (bookingProvider.currentBooking != null) {
      developer.log(
        'Current booking code: ${bookingProvider.currentBooking?.bookingCode}',
      );

      // Debug payment data
      if (bookingProvider.currentBooking?.payments != null) {
        final payments = bookingProvider.currentBooking?.payments;
        developer.log('Payments count: ${payments?.length}');
        if (payments != null && payments.isNotEmpty) {
          final latestPayment = payments.first;
          developer.log(
            'Latest payment data: paymentMethod=${latestPayment.paymentMethod}, paymentType=${latestPayment.paymentType}',
          );
        }
      }
    }

    try {
      // Cek jika sudah ada metode pembayaran yang tersimpan
      if (bookingProvider.currentBooking?.paymentMethod != null) {
        setState(() {
          _selectedPaymentMethod =
              bookingProvider.currentBooking?.paymentMethod;
          // Gunakan payment_channel sebagai paymentType
          _selectedPaymentType = bookingProvider.currentBooking?.paymentType;
        });
        developer.log(
          'Payment method loaded: $_selectedPaymentMethod, $_selectedPaymentType',
        );
      } else if (bookingProvider.currentBooking?.latestPayment != null) {
        // Jika tidak ada payment method di booking, coba ambil dari latestPayment
        final latestPayment = bookingProvider.currentBooking?.latestPayment;
        setState(() {
          _selectedPaymentMethod = latestPayment?.paymentMethod;
          _selectedPaymentType = latestPayment?.paymentType;
        });
        developer.log(
          'Payment method loaded from latest payment: $_selectedPaymentMethod, $_selectedPaymentType',
        );
      }

      // Jika booking belum ada, coba buat booking sementara
      if (!bookingProvider.hasActiveBooking) {
        developer.log('No active booking, creating temporary booking...');

        // Coba buat booking sementara jika ada data rute dan jadwal
        bookingProvider.createTemporaryBooking();

        developer.log(
          'After createTemporaryBooking: ${bookingProvider.hasActiveBooking}',
        );

        // Jika masih tidak ada booking, cek booking terbaru dari history
        if (!bookingProvider.hasActiveBooking) {
          _checkRecentBooking(bookingProvider);
        }
      }
    } catch (e) {
      developer.log('Error in _checkBookingData: $e');
      _showErrorMessage(
        'Terjadi kesalahan saat mempersiapkan data pembayaran: $e',
      );
    } finally {
      if (mounted) {
        setState(() {
          _isCreatingBooking = false;
        });
      }
    }
  }

  // Metode untuk cek booking terbaru sebagai fallback
  Future<void> _checkRecentBooking(BookingProvider bookingProvider) async {
    try {
      developer.log('Checking recent bookings...');
      await bookingProvider.getBookings();

      if (bookingProvider.bookings != null &&
          bookingProvider.bookings!.isNotEmpty) {
        developer.log(
          'Found ${bookingProvider.bookings!.length} bookings in history',
        );

        // Filter booking dengan status PENDING
        final pendingBookings =
            bookingProvider.bookings!
                .where((booking) => booking.status == 'PENDING')
                .toList();

        if (pendingBookings.isNotEmpty) {
          developer.log(
            'Found pending booking with code: ${pendingBookings.first.bookingCode}',
          );
          await bookingProvider.getBookingDetails(pendingBookings.first.id);

          // Update UI jika berhasil mendapatkan booking
          if (bookingProvider.hasActiveBooking) {
            setState(() {}); // Refresh UI
            return;
          }
        }
      }

      // Jika tidak ditemukan booking yang sesuai
      developer.log('No suitable booking found in history');
      if (mounted) {
        _showNoBookingMessage();
      }
    } catch (e) {
      developer.log('Error checking recent booking: $e');
    }
  }

  void _showNoBookingMessage() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text(
          'Data pemesanan tidak ditemukan. Silakan buat pemesanan baru.',
        ),
        backgroundColor: Colors.red.shade800,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: EdgeInsets.only(
          bottom: MediaQuery.of(context).size.height - 150,
          left: 16,
          right: 16,
        ),
        duration: const Duration(seconds: 3),
      ),
    );

    // Kembali ke halaman sebelumnya setelah delay
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) Navigator.of(context).pop();
    });
  }

  void _showErrorMessage(String message) {
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red.shade800,
        behavior: SnackBarBehavior.floating, // Ubah behavior menjadi floating
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: EdgeInsets.only(
          bottom: MediaQuery.of(context).size.height - 150,
          left: 16,
          right: 16,
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final primaryColor = Theme.of(context).primaryColor;
    final accentColor = Theme.of(context).colorScheme.secondary;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        elevation: 0,
        backgroundColor: primaryColor,
        title: const Text(
          'Pilih Metode Pembayaran',
          style: TextStyle(fontWeight: FontWeight.w600, fontSize: 20),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, size: 22),
          onPressed: () => Navigator.of(context).pop(),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(8),
          child: Container(
            height: 4,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  primaryColor.withOpacity(0.3),
                  primaryColor.withOpacity(0.1),
                  Colors.transparent,
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
        ),
      ),
      body:
          _isLoading || _isCreatingBooking
              ? _buildLoadingState()
              : _buildContent(bookingProvider),
      bottomNavigationBar: _buildBottomBar(bookingProvider),
    );
  }

  Widget _buildLoadingState() {
    final primaryColor = Theme.of(context).primaryColor;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 56,
            height: 56,
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
              strokeWidth: 3,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Memuat Data Pembayaran...',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[700],
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(BookingProvider bookingProvider) {
    // Tampilkan pesan jika tidak ada booking
    if (!bookingProvider.hasActiveBooking) {
      return FadeTransition(
        opacity: _fadeAnimation,
        child: Center(
          child: Container(
            margin: const EdgeInsets.all(24),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline_rounded,
                  size: 72,
                  color: Colors.amber[700],
                ),
                const SizedBox(height: 24),
                const Text(
                  'Data Pemesanan Tidak Ditemukan',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    letterSpacing: -0.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Text(
                  'Silakan lengkapi data pemesanan terlebih dahulu untuk melanjutkan proses pembayaran',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      vertical: 15,
                      horizontal: 32,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Kembali ke Pemesanan',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Tampilkan daftar metode pembayaran jika booking tersedia
    return FadeTransition(
      opacity: _fadeAnimation,
      child: Stack(
        children: [
          // Background Decoration
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              height: 150,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Theme.of(context).primaryColor.withOpacity(0.2),
                    Colors.transparent,
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),

          // Progress Indicator
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _buildStepCircle(1, true, "Booking"),
                      _buildStepLine(true),
                      _buildStepCircle(2, true, "Pembayaran"),
                      _buildStepLine(false),
                      _buildStepCircle(3, false, "Selesai"),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
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
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.info_outline,
                          color: Colors.blue,
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Pilih metode pembayaran untuk menyelesaikan transaksi Anda',
                            style: TextStyle(
                              color: Colors.grey[700],
                              fontSize: 14,
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

          // Main Payment Methods List
          Padding(
            padding: const EdgeInsets.only(
              top: 140,
            ), // Make room for the stepper
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children:
                    _paymentMethods.entries.map((entry) {
                      final sectionTitle = entry.key;
                      final methods = entry.value;

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildSectionHeader(sectionTitle),
                          const SizedBox(height: 12),
                          ...List.generate(
                            methods.length,
                            (index) => TweenAnimationBuilder<double>(
                              tween: Tween<double>(begin: 0.0, end: 1.0),
                              duration: Duration(
                                milliseconds: 400 + (index * 100),
                              ),
                              curve: Curves.easeOutCubic,
                              builder: (context, value, child) {
                                return Transform.translate(
                                  offset: Offset(0, 30 * (1 - value)),
                                  child: Opacity(opacity: value, child: child),
                                );
                              },
                              child: _buildPaymentMethodCard(methods[index]),
                            ),
                          ),
                          const SizedBox(height: 24),
                        ],
                      );
                    }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepCircle(int step, bool isActive, String label) {
    final primaryColor = Theme.of(context).primaryColor;

    return Expanded(
      child: Column(
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: isActive ? primaryColor : Colors.grey[300],
              shape: BoxShape.circle,
              boxShadow:
                  isActive
                      ? [
                        BoxShadow(
                          color: primaryColor.withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ]
                      : null,
            ),
            child: Center(
              child: Text(
                '$step',
                style: TextStyle(
                  color: isActive ? Colors.white : Colors.grey[600],
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
              color: isActive ? primaryColor : Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepLine(bool isActive) {
    final primaryColor = Theme.of(context).primaryColor;

    return Container(
      width: 30,
      height: 2,
      color: isActive ? primaryColor : Colors.grey[300],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 16, bottom: 8, left: 4),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 20,
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodCard(Map<String, dynamic> method) {
    final isSelected =
        _selectedPaymentMethod == method['id'] &&
        _selectedPaymentType == method['type'];
    final primaryColor = Theme.of(context).primaryColor;
    final Color methodColor = method['color'] ?? primaryColor;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color:
                isSelected
                    ? methodColor.withOpacity(0.25)
                    : Colors.black.withOpacity(0.05),
            blurRadius: isSelected ? 16 : 5,
            offset: const Offset(0, 3),
            spreadRadius: isSelected ? 1 : 0,
          ),
        ],
        border: Border.all(
          color: isSelected ? methodColor : Colors.grey.withOpacity(0.15),
          width: isSelected ? 2 : 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: () {
            setState(() {
              _selectedPaymentMethod = method['id'];
              _selectedPaymentType = method['type'];
            });

            // Opsional: Simpan ke provider untuk digunakan nanti
            final bookingProvider = Provider.of<BookingProvider>(
              context,
              listen: false,
            );
            if (bookingProvider.currentBooking != null) {
              try {
                bookingProvider.updatePaymentMethod(
                  _selectedPaymentMethod!,
                  _selectedPaymentType!,
                );
              } catch (e) {
                developer.log('Error updating payment method: $e');
              }
            }
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Logo/Icon metode pembayaran
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                    border: Border.all(
                      color: Colors.grey.withOpacity(0.1),
                      width: 1,
                    ),
                  ),
                  child:
                      method.containsKey('iconAsset')
                          // Gunakan gambar jika tersedia
                          ? ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.asset(
                              method['iconAsset'],
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) {
                                // Fallback jika gambar tidak ditemukan
                                return Center(
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: methodColor.withOpacity(0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    padding: const EdgeInsets.all(8),
                                    child: Text(
                                      method['id']
                                          .toString()
                                          .substring(0, 1)
                                          .toUpperCase(),
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: methodColor,
                                        fontSize: 20,
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          )
                          // Fallback ke huruf kapital pertama
                          : Center(
                            child: Container(
                              decoration: BoxDecoration(
                                color: methodColor.withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              padding: const EdgeInsets.all(8),
                              child: Text(
                                method['id']
                                    .toString()
                                    .substring(0, 1)
                                    .toUpperCase(),
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: methodColor,
                                  fontSize: 20,
                                ),
                              ),
                            ),
                          ),
                ),
                const SizedBox(width: 16),
                // Informasi metode pembayaran
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        method['name'],
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        method['description'] ?? '',
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 13,
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
                // Indikator terpilih
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isSelected ? methodColor : Colors.grey[200],
                    border: Border.all(
                      color: isSelected ? methodColor : Colors.grey[300]!,
                      width: 2,
                    ),
                  ),
                  child: AnimatedOpacity(
                    opacity: isSelected ? 1.0 : 0.0,
                    duration: const Duration(milliseconds: 200),
                    child: const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 18,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBottomBar(BookingProvider bookingProvider) {
    final primaryColor = Theme.of(context).primaryColor;

    // Jika tidak ada booking, tampilkan pesan
    if (!bookingProvider.hasActiveBooking) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -3),
            ),
          ],
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
        ),
        child: const SafeArea(
          child: Text(
            'Data pemesanan tidak ditemukan',
            style: TextStyle(color: Colors.red, fontWeight: FontWeight.w500),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    // Format currency
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -3),
            spreadRadius: 1,
          ),
        ],
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Detail pembayaran
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Total Pembayaran',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      currencyFormat.format(
                        bookingProvider.currentBooking?.totalAmount ?? 0,
                      ),
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: primaryColor,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ],
                ),
                // Booking code badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(color: Colors.grey[300]!, width: 1),
                  ),
                  child: Text(
                    'ID: ${bookingProvider.currentBooking?.bookingCode ?? ""}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[800],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            // Tombol "Lanjutkan ke Pembayaran" memanggil createBooking
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              height: 54,
              child: ElevatedButton(
                onPressed:
                    _selectedPaymentMethod != null
                        ? () =>
                            _createBookingAndProceed(context, bookingProvider)
                        : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: Colors.grey[300],
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: _selectedPaymentMethod != null ? 2 : 0,
                  shadowColor:
                      _selectedPaymentMethod != null
                          ? primaryColor.withOpacity(0.3)
                          : Colors.transparent,
                ),
                child:
                    _isLoading
                        ? SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.white,
                            ),
                            strokeWidth: 2,
                          ),
                        )
                        : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Lanjutkan ke Pembayaran',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 0.2,
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Icon(Icons.arrow_forward, size: 18),
                          ],
                        ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Metode untuk membuat booking setelah memilih metode pembayaran
  Future<void> _createBookingAndProceed(
    BuildContext context,
    BookingProvider bookingProvider,
  ) async {
    if (_selectedPaymentMethod == null || _selectedPaymentType == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Silakan pilih metode pembayaran'),
          backgroundColor: Colors.amber[700],
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
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      developer.log('Memanggil submitBookingWithPayment');

      // Kirim data booking dengan metode pembayaran yang dipilih ke server
      final success = await bookingProvider.submitBookingWithPayment(
        _selectedPaymentMethod!,
        _selectedPaymentType!,
      );

      if (success) {
        developer.log('Submit booking berhasil');

        // Jika sukses, dapatkan booking code untuk diproses
        final bookingCode = bookingProvider.currentBooking!.bookingCode;

        // Proses pembayaran dengan metode yang dipilih
        final paymentSuccess = await bookingProvider.processPayment(
          bookingCode,
          _selectedPaymentMethod!,
          _selectedPaymentType!,
        );

        setState(() {
          _isLoading = false;
        });

        if (paymentSuccess) {
          // Navigasi ke halaman instruksi pembayaran dengan animasi
          Navigator.of(context).pushNamed(
            '/booking/payment',
            arguments: {
              'bookingCode': bookingCode,
              'paymentMethod': _selectedPaymentMethod,
              'paymentType': _selectedPaymentType,
            },
          );
        } else {
          _showErrorMessage(
            bookingProvider.errorMessage ?? 'Gagal memproses pembayaran',
          );
        }
      } else {
        setState(() {
          _isLoading = false;
        });
        _showErrorMessage(
          bookingProvider.errorMessage ?? 'Gagal membuat pemesanan',
        );
      }
    } catch (e) {
      developer.log('Error dalam _createBookingAndProceed: $e');
      setState(() {
        _isLoading = false;
      });
      _showErrorMessage('Terjadi kesalahan: $e');
    }
  }
}
