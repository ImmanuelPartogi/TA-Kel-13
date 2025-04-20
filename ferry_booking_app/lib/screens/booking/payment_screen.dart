import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/services.dart';
import '../../providers/booking_provider.dart';
import '../../widgets/custom_appbar.dart';
import 'package:intl/intl.dart';
import '../../models/payment.dart';

class PaymentScreen extends StatefulWidget {
  final String? paymentMethod;
  final String? paymentType;
  
  const PaymentScreen({Key? key, this.paymentMethod, this.paymentType}) : super(key: key);

  @override
  _PaymentScreenState createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _paymentInstructions;
  String? _paymentMethod;
  String? _paymentType;
  String? _virtualAccountNumber;
  
  @override
  void initState() {
    super.initState();
    // Inisialisasi dari parameter constructor
    _paymentMethod = widget.paymentMethod;
    _paymentType = widget.paymentType;
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initPaymentData();
    });
  }

  void _initPaymentData() async {
    // Jika tidak ada dari constructor, coba ambil dari route arguments
    if (_paymentMethod == null || _paymentType == null) {
      final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
      
      if (args != null) {
        setState(() {
          _paymentMethod = args['paymentMethod'];
          _paymentType = args['paymentType'];
        });
      }
    }
    
    // Jika sudah ada data metode pembayaran, load instruksi
    if (_paymentMethod != null && _paymentType != null) {
      await _loadPaymentInstructions();
    } else {
      setState(() {
        _isLoading = false;
      });
      
      // Tampilkan pesan error
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Data pembayaran tidak ditemukan'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _loadPaymentInstructions() async {
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    
    setState(() {
      _isLoading = true;
    });
    
    try {
      // Panggil API untuk mendapatkan instruksi pembayaran
      final instructions = await bookingProvider.getPaymentInstructions(
        _paymentMethod!, 
        _paymentType!
      );
      
      // Dapatkan virtual account number jika ada
      if (_paymentType == 'virtual_account' && bookingProvider.currentBooking?.latestPayment != null) {
        _virtualAccountNumber = bookingProvider.currentBooking?.latestPayment?.virtualAccountNumber;
      }
      
      setState(() {
        _paymentInstructions = instructions;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal memuat instruksi pembayaran: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final booking = bookingProvider.currentBooking;

    return Scaffold(
      appBar: const CustomAppBar(title: 'Pembayaran'),
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : _buildContent(context, booking),
    );
  }

  Widget _buildContent(BuildContext context, dynamic booking) {
    if (booking == null) {
      return const Center(
        child: Text('Data pemesanan tidak ditemukan'),
      );
    }

    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    
    // Dapatkan informasi pembayaran dari payment terakhir
    final payment = booking.latestPayment;
    final String? virtualAccountNumber = payment?.virtualAccountNumber ?? _virtualAccountNumber;
    final String? activePaymentMethod = payment?.paymentMethod ?? booking.paymentMethod ?? _paymentMethod;
    final String? activePaymentType = payment?.paymentType ?? booking.paymentType ?? _paymentType;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status dan waktu
          _buildStatusCard(context, booking, payment),
          
          const SizedBox(height: 24),
          
          // Informasi pembayaran
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Rincian Pembayaran',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Detail pembayaran
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Pembayaran'),
                      Text(
                        currencyFormat.format(booking.totalAmount),
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Divider(),
                  const SizedBox(height: 8),
                  
                  // Metode pembayaran
                  if (activePaymentMethod != null)
                    Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: Colors.grey[200],
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Image.asset(
                            'assets/images/payment_methods/${activePaymentMethod.toLowerCase()}.png',
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) {
                              return Center(
                                child: Text(
                                  activePaymentMethod.substring(0, 1).toUpperCase(),
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.grey[800],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                activePaymentMethod.toUpperCase(),
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              Text(
                                activePaymentType == 'virtual_account' 
                                    ? 'Virtual Account' 
                                    : 'E-Wallet',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  
                  if (virtualAccountNumber != null)
                    ...[
                      const SizedBox(height: 16),
                      const Text(
                        'Nomor Virtual Account',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              virtualAccountNumber,
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
                              Clipboard.setData(ClipboardData(
                                text: virtualAccountNumber,
                              )).then((_) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Nomor VA disalin ke clipboard'),
                                  ),
                                );
                              });
                            },
                            tooltip: 'Salin nomor',
                          ),
                        ],
                      ),
                    ],
                    
                  // QR Code untuk e-wallet
                  if (payment?.qrCodeUrl != null && activePaymentType == 'e_wallet')
                    ...[
                      const SizedBox(height: 16),
                      const Text(
                        'Scan QR Code',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Center(
                        child: Container(
                          width: 200,
                          height: 200,
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey.shade300),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: Image.network(
                              payment!.qrCodeUrl!,
                              fit: BoxFit.contain,
                              loadingBuilder: (context, child, loadingProgress) {
                                if (loadingProgress == null) return child;
                                return Center(
                                  child: CircularProgressIndicator(
                                    value: loadingProgress.expectedTotalBytes != null
                                        ? loadingProgress.cumulativeBytesLoaded / 
                                            loadingProgress.expectedTotalBytes!
                                        : null,
                                  ),
                                );
                              },
                              errorBuilder: (context, error, stackTrace) {
                                return Center(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.qr_code_2,
                                        size: 48,
                                        color: Colors.grey,
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        'QR Code tidak tersedia',
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                      ),
                      
                      // Deep link button untuk e-wallet
                      if (payment.deepLinkUrl != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 16),
                          child: SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              icon: const Icon(Icons.open_in_new),
                              label: Text('Buka Aplikasi ${activePaymentMethod?.toUpperCase()}'),
                              onPressed: () {
                                // Implementasi buka deep link
                                // Biasanya menggunakan package url_launcher
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Membuka aplikasi ${activePaymentMethod?.toUpperCase()}...'),
                                  ),
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Theme.of(context).primaryColor,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Instruksi pembayaran
          if (_paymentInstructions != null && activePaymentMethod != null)
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Cara Pembayaran ${activePaymentMethod.toUpperCase()}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ..._buildInstructionSteps(_paymentInstructions!['steps']),
                  ],
                ),
              ),
            ),
          
          const SizedBox(height: 32),
          
          // Tombol cek status
          if (booking.status == 'PENDING')
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  // Cek status pembayaran
                  Provider.of<BookingProvider>(context, listen: false)
                      .checkPaymentStatus(booking.bookingCode);
                  
                  // Tampilkan loading dan feedback
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Memeriksa status pembayaran...'),
                      duration: Duration(seconds: 2),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  backgroundColor: Theme.of(context).primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Cek Status Pembayaran',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          
          const SizedBox(height: 16),
          
          // Tombol kembali ke beranda
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {
                // Kembali ke beranda
                Navigator.pushNamedAndRemoveUntil(
                  context, 
                  '/home', 
                  (route) => false,
                );
              },
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                foregroundColor: Theme.of(context).primaryColor,
                side: BorderSide(color: Theme.of(context).primaryColor),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text(
                'Kembali ke Beranda',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusCard(BuildContext context, dynamic booking, Payment? payment) {
    Color statusColor;
    String statusText;
    IconData statusIcon;
    
    // Status pembayaran
    switch (booking.status) {
      case 'PENDING':
        statusColor = Colors.orange;
        statusText = 'Menunggu Pembayaran';
        statusIcon = Icons.timer;
        break;
      case 'PAID':
        statusColor = Colors.green;
        statusText = 'Pembayaran Berhasil';
        statusIcon = Icons.check_circle;
        break;
      case 'CANCELLED':
        statusColor = Colors.red;
        statusText = 'Dibatalkan';
        statusIcon = Icons.cancel;
        break;
      default:
        statusColor = Colors.grey;
        statusText = 'Status Tidak Diketahui';
        statusIcon = Icons.help;
    }
    
    // Dapatkan waktu kedaluwarsa pembayaran
    final DateTime? expiryTime = payment?.expiryTime ?? booking.expiryTime;
    
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(statusIcon, color: statusColor),
                const SizedBox(width: 8),
                Text(
                  statusText,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Kode Booking:',
                  style: TextStyle(
                    color: Colors.grey[700],
                  ),
                ),
                Text(
                  booking.bookingCode,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (payment != null)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Kode Pembayaran:',
                    style: TextStyle(
                      color: Colors.grey[700],
                    ),
                  ),
                  Text(
                    payment.paymentCode,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            if (booking.status == 'PENDING' && expiryTime != null)
              ...[
                const SizedBox(height: 16),
                const Divider(),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.access_time, size: 16, color: Colors.grey[700]),
                    const SizedBox(width: 4),
                    Text(
                      'Batas Waktu Pembayaran:',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[700],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        _getFormattedExpiry(expiryTime),
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: _isNearExpiry(expiryTime) ? Colors.red : Colors.black87,
                        ),
                      ),
                    ),
                    if (_isNearExpiry(expiryTime))
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.red[50],
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: Colors.red),
                        ),
                        child: Text(
                          'Segera Bayar',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.red[700],
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                  ],
                ),
              ],
          ],
        ),
      ),
    );
  }
  
  // Cek apakah waktu pembayaran hampir habis (kurang dari 60 menit)
  bool _isNearExpiry(DateTime expiry) {
    final now = DateTime.now();
    final remaining = expiry.difference(now);
    return remaining.inMinutes < 60 && remaining.inMinutes > 0;
  }

  List<Widget> _buildInstructionSteps(List<dynamic> steps) {
    return steps.asMap().entries.map((entry) {
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
                    fontSize: 14,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                step,
                style: const TextStyle(fontSize: 15),
              ),
            ),
          ],
        ),
      );
    }).toList();
  }

  String _getFormattedExpiry(dynamic expiryTime) {
    // Jika expiry sudah dalam format DateTime, langsung gunakan
    // Jika string, parse dulu
    DateTime expiry;
    if (expiryTime is DateTime) {
      expiry = expiryTime;
    } else if (expiryTime is String) {
      expiry = DateTime.parse(expiryTime);
    } else {
      // Default 24 jam dari sekarang
      expiry = DateTime.now().add(const Duration(hours: 24));
    }
    
    // Format tanggal dan waktu
    final dateFormat = DateFormat('dd MMM yyyy, HH:mm', 'id_ID');
    return dateFormat.format(expiry);
  }
}