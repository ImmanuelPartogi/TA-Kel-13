import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/booking_provider.dart';
import '../../widgets/custom_appbar.dart';
import 'dart:developer' as developer;

/// Screen untuk memilih metode pembayaran yang sudah diperbaiki
class PaymentMethodScreen extends StatefulWidget {
  const PaymentMethodScreen({Key? key}) : super(key: key);

  @override
  _PaymentMethodScreenState createState() => _PaymentMethodScreenState();
}

class _PaymentMethodScreenState extends State<PaymentMethodScreen> {
  String? _selectedPaymentMethod;
  String? _selectedPaymentType;
  bool _isLoading = false;
  bool _isCreatingBooking = false;
  bool _hasFetchedBooking = false;

  // Data metode pembayaran dengan path yang sesuai dengan struktur asset
  final Map<String, List<Map<String, dynamic>>> _paymentMethods = {
    'Virtual Account': [
      {
        'id': 'bca',
        'name': 'BCA Virtual Account',
        'type': 'virtual_account',
        'iconAsset': 'assets/images/payment_methods/bca.png',
        'description': 'Transfer dari mobile banking atau internet banking',
      },
      {
        'id': 'bni',
        'name': 'BNI Virtual Account',
        'type': 'virtual_account',
        'iconAsset': 'assets/images/payment_methods/bni.png',
        'description': 'Transfer dari mobile banking atau internet banking',
      },
      {
        'id': 'bri',
        'name': 'BRI Virtual Account',
        'type': 'virtual_account',
        'iconAsset': 'assets/images/payment_methods/bri.png',
        'description': 'Transfer dari mobile banking atau internet banking',
      },
      {
        'id': 'mandiri',
        'name': 'Mandiri Bill Payment',
        'type': 'virtual_account',
        'iconAsset': 'assets/images/payment_methods/mandiri.png',
        'description': 'Transfer dari mobile banking atau internet banking',
      },
    ],
    'E-Wallet': [
      {
        'id': 'gopay',
        'name': 'GoPay',
        'type': 'e_wallet',
        'iconAsset': 'assets/images/payment_methods/gopay.png',
        'description': 'Bayar menggunakan aplikasi e-wallet',
      },
      {
        'id': 'shopeepay',
        'name': 'ShopeePay',
        'type': 'e_wallet',
        'iconAsset': 'assets/images/payment_methods/shopeepay.png',
        'description': 'Bayar menggunakan aplikasi e-wallet',
      },
      {
        'id': 'dana',
        'name': 'DANA',
        'type': 'e_wallet',
        'iconAsset': 'assets/images/payment_methods/dana.png',
        'description': 'Bayar menggunakan aplikasi e-wallet',
      },
      {
        'id': 'ovo',
        'name': 'OVO',
        'type': 'e_wallet',
        'iconAsset': 'assets/images/payment_methods/ovo.png',
        'description': 'Bayar menggunakan aplikasi e-wallet',
      },
    ],
  };

  @override
  void initState() {
    super.initState();

    // Jalankan pengecekan booking setelah build pertama
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkBookingData();
    });
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
      const SnackBar(
        content: Text(
          'Data pemesanan tidak ditemukan. Silakan buat pemesanan baru.',
        ),
        backgroundColor: Colors.red,
        duration: Duration(seconds: 3),
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
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);

    return Scaffold(
      appBar: const CustomAppBar(title: 'Pilih Metode Pembayaran'),
      body:
          _isLoading || _isCreatingBooking
              ? const Center(child: CircularProgressIndicator())
              : _buildContent(bookingProvider),
      bottomNavigationBar: _buildBottomBar(bookingProvider),
    );
  }

  Widget _buildContent(BookingProvider bookingProvider) {
    // Tampilkan pesan jika tidak ada booking
    if (!bookingProvider.hasActiveBooking) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
              const SizedBox(height: 16),
              const Text(
                'Data pemesanan tidak ditemukan',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Silahkan lengkapi data pemesanan terlebih dahulu',
                style: TextStyle(fontSize: 16, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Kembali'),
              ),
            ],
          ),
        ),
      );
    }

    // Tampilkan daftar metode pembayaran jika booking tersedia
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
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
                  const SizedBox(height: 8),
                  ...methods
                      .map((method) => _buildPaymentMethodCard(method))
                      .toList(),
                  const SizedBox(height: 24),
                ],
              );
            }).toList(),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Color(0xFF333333),
        ),
      ),
    );
  }

  Widget _buildPaymentMethodCard(Map<String, dynamic> method) {
    final isSelected =
        _selectedPaymentMethod == method['id'] &&
        _selectedPaymentType == method['type'];

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color:
                isSelected
                    ? Theme.of(context).primaryColor.withOpacity(0.3)
                    : Colors.black.withOpacity(0.05),
            blurRadius: isSelected ? 8 : 2,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(
          color:
              isSelected
                  ? Theme.of(context).primaryColor
                  : Colors.grey.withOpacity(0.2),
          width: isSelected ? 2 : 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
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
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Logo/Icon metode pembayaran
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child:
                      method.containsKey('iconAsset')
                          // Gunakan gambar jika tersedia
                          ? ClipRRect(
                            borderRadius: BorderRadius.circular(6),
                            child: Image.asset(
                              method['iconAsset'],
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) {
                                // Fallback jika gambar tidak ditemukan
                                return Center(
                                  child: Text(
                                    method['id']
                                        .toString()
                                        .substring(0, 1)
                                        .toUpperCase(),
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.grey[800],
                                      fontSize: 18,
                                    ),
                                  ),
                                );
                              },
                            ),
                          )
                          // Fallback ke huruf kapital pertama
                          : Center(
                            child: Text(
                              method['id']
                                  .toString()
                                  .substring(0, 1)
                                  .toUpperCase(),
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[800],
                                fontSize: 18,
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
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        method['description'] ?? '',
                        style: TextStyle(color: Colors.grey[600], fontSize: 13),
                      ),
                    ],
                  ),
                ),
                // Indikator terpilih
                AnimatedOpacity(
                  opacity: isSelected ? 1.0 : 0.0,
                  duration: const Duration(milliseconds: 300),
                  child: Icon(
                    Icons.check_circle,
                    color: Theme.of(context).primaryColor,
                    size: 24,
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
    // Jika tidak ada booking, tampilkan pesan
    if (!bookingProvider.hasActiveBooking) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 4,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: const SafeArea(
          child: Text(
            'Data pemesanan tidak ditemukan',
            style: TextStyle(color: Colors.red),
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
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, -2),
          ),
        ],
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
                const Text('Total Pembayaran', style: TextStyle(fontSize: 16)),
                Text(
                  currencyFormat.format(
                    bookingProvider.currentBooking?.totalAmount ?? 0,
                  ),
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // PERUBAHAN: Tombol "Lanjutkan ke Pembayaran" memanggil createBooking
            ElevatedButton(
              onPressed:
                  _selectedPaymentMethod != null
                      ? () => _createBookingAndProceed(context, bookingProvider)
                      : null,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                backgroundColor: Theme.of(context).primaryColor,
                foregroundColor: Colors.white,
                disabledBackgroundColor: Colors.grey[300],
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 0,
              ),
              child: const Text(
                'Lanjutkan ke Pembayaran',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // PERUBAHAN: Metode baru untuk membuat booking setelah memilih metode pembayaran
  Future<void> _createBookingAndProceed(BuildContext context, BookingProvider bookingProvider) async {
    if (_selectedPaymentMethod == null || _selectedPaymentType == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Silakan pilih metode pembayaran')),
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
          // Navigasi ke halaman instruksi pembayaran
          Navigator.pushNamed(
            context,
            '/booking/payment',
            arguments: {
              'bookingCode': bookingCode,
              'paymentMethod': _selectedPaymentMethod,
              'paymentType': _selectedPaymentType,
            },
          );
        } else {
          _showErrorMessage(
            bookingProvider.errorMessage ?? 'Gagal memproses pembayaran'
          );
        }
      } else {
        setState(() {
          _isLoading = false;
        });
        _showErrorMessage(
          bookingProvider.errorMessage ?? 'Gagal membuat pemesanan'
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

  // PERUBAHAN: Metode lama ditinggalkan karena tidak membuat booking
  // void _processPayment(BuildContext context, BookingProvider bookingProvider) { ... }
}