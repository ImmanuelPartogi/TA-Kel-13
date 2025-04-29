import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';
import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/rendering.dart';
import 'package:universal_html/html.dart' as html;

class TicketDetailScreen extends StatefulWidget {
  final int bookingId;

  const TicketDetailScreen({Key? key, required this.bookingId})
    : super(key: key);

  @override
  _TicketDetailScreenState createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen>
    with SingleTickerProviderStateMixin {
  bool _isLoading = false;
  bool _isDownloading = false;
  int _selectedTicketIndex = 0;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  bool _showTicketDetails = false;

  // QR Code key references for capturing QR images
  final List<GlobalKey> _qrKeys = [];

  @override
  void initState() {
    super.initState();
    _loadTicketDetails();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );

    // Delay showing ticket details for smoother animation
    Future.delayed(const Duration(milliseconds: 100), () {
      setState(() {
        _showTicketDetails = true;
      });
      _animationController.forward();
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadTicketDetails() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      await bookingProvider.getBookingDetails(widget.bookingId);

      // Setup QR keys
      final booking = bookingProvider.currentBooking;
      if (booking != null && booking.tickets != null) {
        _qrKeys.clear();
        for (int i = 0; i < booking.tickets!.length; i++) {
          _qrKeys.add(GlobalKey());
        }
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _cancelBooking() async {
    final result =
        await showDialog<bool>(
          context: context,
          builder:
              (context) => AlertDialog(
                title: const Text('Batalkan Pemesanan?'),
                content: const Text(
                  'Apakah Anda yakin ingin membatalkan pemesanan ini? '
                  'Proses ini tidak dapat dibatalkan.',
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: const Text('Tidak'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context, true),
                    child: const Text('Ya, Batalkan'),
                  ),
                ],
              ),
        ) ??
        false;

    if (result) {
      setState(() {
        _isLoading = true;
      });

      try {
        final bookingProvider = Provider.of<BookingProvider>(
          context,
          listen: false,
        );
        final success = await bookingProvider.cancelBooking(widget.bookingId);

        if (success && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Pemesanan berhasil dibatalkan')),
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }

  // Capture a widget as an image
  Future<Uint8List?> _captureWidget(GlobalKey key) async {
    try {
      final RenderRepaintBoundary boundary =
          key.currentContext!.findRenderObject() as RenderRepaintBoundary;
      final ui.Image image = await boundary.toImage(pixelRatio: 3.0);
      final ByteData? byteData = await image.toByteData(
        format: ui.ImageByteFormat.png,
      );

      if (byteData != null) {
        return byteData.buffer.asUint8List();
      }
    } catch (e) {
      print('Error capturing QR code: $e');
    }
    return null;
  }

  // Create a base64 encoded data URL from image bytes
  String _imageToDataUrl(Uint8List bytes) {
    final base64 = base64Encode(bytes);
    return 'data:image/png;base64,$base64';
  }

  // Improved download ticket function for Web with actual QR codes
  Future<void> _downloadTicket(BuildContext context, booking) async {
    setState(() {
      _isDownloading = true;
    });

    try {
      final tickets = booking.tickets ?? [];
      if (tickets.isEmpty) {
        _showSnackBar('Tidak ada tiket untuk diunduh');
        return;
      }

      // Capture all QR codes first if they exist
      final List<String> qrDataUrls = [];

      // Only try to capture if we have QR keys and we're on web
      if (_qrKeys.isNotEmpty && kIsWeb) {
        // Short delay to ensure QR codes are rendered
        await Future.delayed(const Duration(milliseconds: 500));

        for (int i = 0; i < _qrKeys.length && i < tickets.length; i++) {
          final bytes = await _captureWidget(_qrKeys[i]);
          if (bytes != null) {
            qrDataUrls.add(_imageToDataUrl(bytes));
          } else {
            // Fallback if we couldn't capture
            qrDataUrls.add('');
          }
        }
      }

      // Format date
      final dateFormat = DateFormat('EEEE, d MMMM yyyy', 'id_ID');
      final bookingDate = DateTime.parse(booking.bookingDate);

      // Create PDF-like HTML page
      if (kIsWeb) {
        // Create HTML content with embedded JavaScript QR code generator
        String htmlContent = '''
        <!DOCTYPE html>
        <html>
        <head>
          <title>E-Ticket #${booking.bookingCode}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js"></script>
          <style>
            @media print {
              body { font-size: 12pt; }
              .container { border: none; }
              .no-print { display: none; }
              button { display: none; }
            }
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
            .container { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; }
            .header { text-align: center; border-bottom: 2px solid #f5f5f5; padding-bottom: 20px; margin-bottom: 20px; }
            .ticket-title { font-size: 24px; font-weight: bold; color: #2d3748; margin: 10px 0; }
            .booking-id { font-size: 16px; color: #4a5568; margin-bottom: 20px; }
            .route-info { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .ticket-section { margin-bottom: 30px; }
            .ticket-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
            .ticket-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
            .ticket-type { background-color: #ebf4ff; color: #4299e1; padding: 5px 10px; border-radius: 15px; font-size: 12px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .info-label { color: #718096; font-size: 14px; }
            .info-value { font-weight: bold; }
            .qr-container { height: 200px; width: 200px; margin: 0 auto; text-align: center; }
            .footer { text-align: center; font-size: 12px; color: #718096; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
            .payment-info { background-color: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            button { background-color: #4299e1; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px; }
            .btn-container { text-align: center; margin-top: 20px; }
            @page { size: A4; margin: 0.5cm; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="ticket-title">E-TICKET</div>
              <div class="booking-id">Booking #${booking.bookingCode}</div>
              
              <div class="route-info">
                <div style="font-size: 18px; font-weight: bold; text-align: center;">
                  ${booking.schedule?.route?.origin ?? ''} → ${booking.schedule?.route?.destination ?? ''}
                </div>
                <div style="text-align: center; margin-top: 10px;">
                  ${dateFormat.format(bookingDate)} - ${booking.schedule?.departureTime ?? ''}
                </div>
              </div>
            </div>
            
            <div class="ticket-section">
              <h3>Informasi Perjalanan</h3>
              <div class="info-row">
                <span class="info-label">Kapal:</span>
                <span class="info-value">${booking.schedule?.ferry?.name ?? '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tanggal:</span>
                <span class="info-value">${dateFormat.format(bookingDate)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Waktu:</span>
                <span class="info-value">${booking.schedule?.departureTime ?? ''}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Penumpang:</span>
                <span class="info-value">${booking.passengerCount} orang</span>
              </div>
              ${booking.vehicleCount > 0 ? '<div class="info-row"><span class="info-label">Kendaraan:</span><span class="info-value">${booking.vehicleCount} unit</span></div>' : ''}
            </div>
            
            <div class="ticket-section">
              <h3>Tiket (${tickets.length})</h3>
        ''';

        // Add each ticket with QR code
        for (int i = 0; i < tickets.length; i++) {
          final ticket = tickets[i];
          final qrCodeId = 'qrcode-${i}';

          // Get QR data URL if we captured it
          String qrHtml = '';
          if (i < qrDataUrls.length &&
              qrDataUrls[i] != null &&
              qrDataUrls[i] != '' &&
              qrDataUrls[i] != false) {
            // Use captured QR image if available
            qrHtml =
                '<img src="${qrDataUrls[i]}" width="200" height="200" alt="QR Code" />';
          } else {
            // Otherwise use JavaScript-generated QR code
            qrHtml =
                '<canvas id="${qrCodeId}" width="200" height="200"></canvas>';
          }

          htmlContent += '''
              <div class="ticket-card">
                <div class="ticket-header">
                  <h4>Tiket #${i + 1} (${ticket.ticketCode})</h4>
                  <span class="ticket-type">${_getTicketTypeText(ticket.ticketType)}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">Tipe:</span>
                  <span class="info-value">${_getTicketTypeText(ticket.ticketType)}</span>
                </div>
                
                ${ticket.vehicleId != null ? '<div class="info-row"><span class="info-label">Kendaraan:</span><span class="info-value">Termasuk kendaraan</span></div>' : ''}
                
                <div class="info-row">
                  <span class="info-label">Status Check-in:</span>
                  <span class="info-value" style="color: ${ticket.checkedIn ? 'green' : 'orange'};">
                    ${ticket.checkedIn ? 'Sudah Check-In' : 'Belum Check-In'}
                  </span>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                  <div class="qr-container">
                    ${qrHtml}
                    <p style="font-size: 12px; margin-top: 10px;">Tunjukkan QR Code ini saat check-in</p>
                    <p style="font-size: 12px;">Kode: ${ticket.ticketCode}</p>
                  </div>
                </div>
              </div>
          ''';
        }

        // Add payment info and footer
        htmlContent += '''
            </div>
            
            <div class="payment-info">
              <h3>Informasi Pembayaran</h3>
              <div class="info-row">
                <span class="info-label">Kode Booking:</span>
                <span class="info-value">${booking.bookingCode}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status Pembayaran:</span>
                <span class="info-value">${_getPaymentStatus(booking)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Pembayaran:</span>
                <span class="info-value">${_formatCurrency(booking.totalAmount)}</span>
              </div>
              ${booking.status == 'CANCELLED' ? '<div class="info-row"><span class="info-label">Alasan Pembatalan:</span><span class="info-value">${booking.cancellationReason ?? '-'}</span></div>' : ''}
            </div>
            
            <div class="footer">
              <p>Tiket ini diterbitkan oleh sistem Ferry Booking App</p>
              <p>Dicetak pada: ${DateFormat('dd MMMM yyyy, HH:mm:ss', 'id_ID').format(DateTime.now())}</p>
            </div>
            
            <div class="btn-container no-print">
              <button onclick="window.print()">Cetak Tiket</button>
              <button onclick="saveAsPDF()">Simpan sebagai PDF</button>
            </div>
          </div>
          
          <script>
            // Generate QR codes using QRious library
            window.onload = function() {
        ''';

        // Add JavaScript to generate QR codes
        for (int i = 0; i < tickets.length; i++) {
          if (i >= qrDataUrls.length || qrDataUrls[i].isEmpty) {
            final ticket = tickets[i];
            htmlContent += '''
              if (document.getElementById('qrcode-${i}')) {
                new QRious({
                  element: document.getElementById('qrcode-${i}'),
                  value: '${ticket.qrCode}',
                  size: 200,
                  backgroundAlpha: 1,
                  foreground: '#000000',
                  background: '#ffffff',
                  level: 'H'
                });
              }
            ''';
          }
        }

        // Close JavaScript and HTML
        htmlContent += '''
            }
            
            // Function to save as PDF using browser's print functionality
            function saveAsPDF() {
              window.print();
            }
          </script>
        </body>
        </html>
        ''';

        // Convert to blob and trigger download or open in new tab
        final bytes = Uint8List.fromList(htmlContent.codeUnits);
        final blob = html.Blob([bytes], 'text/html');
        final url = html.Url.createObjectUrlFromBlob(blob);

        // Open in new tab for better printing experience
        html.window.open(url, '_blank');

        // Clean up
        Future.delayed(const Duration(seconds: 5), () {
          html.Url.revokeObjectUrl(url);
        });

        _showSnackBar(
          'Tiket telah dibuka di tab baru. Anda bisa mencetak atau menyimpannya sebagai PDF.',
        );
      } else {
        // For non-web platforms, show message that this feature needs native implementation
        _showSnackBar(
          'Fitur unduh tiket tersedia di versi mobile. Silahkan gunakan browser untuk mencetak tiket.',
        );
      }
    } catch (e) {
      print('Error saat mengunduh tiket: $e');
      _showSnackBar('Gagal mengunduh tiket: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isDownloading = false;
        });
      }
    }
  }

  void _showSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
      );
    }
  }

  // void _showShareOptions() {
  //   showModalBottomSheet(
  //     context: context,
  //     builder: (context) => Padding(
  //       padding: const EdgeInsets.symmetric(vertical: 20.0),
  //       child: Column(
  //         mainAxisSize: MainAxisSize.min,
  //         children: [
  //           const Text(
  //             'Bagikan Tiket',
  //             style: TextStyle(
  //               fontWeight: FontWeight.bold,
  //               fontSize: 18,
  //             ),
  //           ),
  //           const SizedBox(height: 20),
  //           Row(
  //             mainAxisAlignment: MainAxisAlignment.spaceEvenly,
  //             children: [
  //               _buildShareOption(Icons.email, 'Email', Colors.red),
  //               _buildShareOption(Icons.print, 'Cetak', Colors.blue),
  //               if (!kIsWeb) _buildShareOption(Icons.share, 'Bagikan', Colors.green),
  //             ],
  //           ),
  //           const SizedBox(height: 20),
  //         ],
  //       ),
  //     ),
  //   );
  // }

  Widget _buildShareOption(IconData icon, String label, Color color) {
    return InkWell(
      // onTap: () {
      //   Navigator.pop(context);
      //   final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
      //   final booking = bookingProvider.currentBooking;

      //   if (booking != null) {
      //     if (label == 'Cetak') {
      //       // For print option, we'll download and open in a new tab for printing
      //       _downloadTicket(context, booking);
      //     } else {
      //       _showSnackBar('Fitur berbagi melalui $label akan segera tersedia');
      //     }
      //   }
      // },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(
            radius: 25,
            backgroundColor: color.withOpacity(0.2),
            child: Icon(icon, color: color, size: 25),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final booking = bookingProvider.currentBooking;

    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (booking == null) {
      return Scaffold(
        appBar: const CustomAppBar(title: 'Detail Tiket', showBackButton: true),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(
                'Tiket tidak ditemukan',
                style: TextStyle(color: Colors.grey[600], fontSize: 16),
              ),
            ],
          ),
        ),
      );
    }

    // Format date
    final dateFormat = DateFormat('EEEE, d MMMM yyyy', 'id_ID');
    final bookingDate = DateTime.parse(booking.departureDate);

    // Check if can be cancelled
    final now = DateTime.now();
    final isWithin24Hours = bookingDate.difference(now).inHours <= 24;
    final canCancel = booking.status == 'PENDING' && !isWithin24Hours;
    final canRefund = booking.status == 'CONFIRMED' && !isWithin24Hours;

    // Get all tickets
    final tickets = booking.tickets ?? [];
    final hasMultipleTickets = tickets.length > 1;

    // Get selected ticket
    final selectedTicket =
        tickets.isNotEmpty && _selectedTicketIndex < tickets.length
            ? tickets[_selectedTicketIndex]
            : null;

    return Scaffold(
      appBar: AppBar(
        title: Text('Tiket #${booking.bookingCode}'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          // Print Button instead of Share for Web
          // IconButton(
          //   icon: Icon(kIsWeb ? Icons.print : Icons.share),
          //   tooltip: kIsWeb ? 'Cetak Tiket' : 'Bagikan Tiket',
          //   onPressed: kIsWeb
          //       ? () => _downloadTicket(context, booking)
          //       : _showShareOptions,
          // ),
          // Download Button
          _isDownloading
              ? const Padding(
                padding: EdgeInsets.all(16.0),
                child: SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
              )
              : IconButton(
                icon: const Icon(Icons.download),
                tooltip: 'Unduh Tiket',
                onPressed: () => _downloadTicket(context, booking),
              ),
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
            onPressed: _loadTicketDetails,
          ),
        ],
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: _loadTicketDetails,
        child: CustomScrollView(
          slivers: [
            // Header with status
            SliverToBoxAdapter(
              child: Container(
                color: _getStatusColor(booking.status),
                padding: const EdgeInsets.symmetric(
                  vertical: 16.0,
                  horizontal: 24.0,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          _getStatusIcon(booking.status),
                          color: Colors.white,
                          size: 32,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _getStatusText(booking.status),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                              Text(
                                _getStatusDescription(booking.status),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Journey summary
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  booking.schedule?.route?.origin ?? '',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  'Keberangkatan',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.8),
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            child: const Icon(
                              Icons.arrow_forward,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  booking.schedule?.route?.destination ?? '',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  'Tujuan',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.8),
                                    fontSize: 12,
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
              ),
            ),

            // Content
            SliverToBoxAdapter(
              child: AnimatedBuilder(
                animation: _fadeAnimation,
                builder: (context, child) {
                  return Opacity(
                    opacity: _showTicketDetails ? _fadeAnimation.value : 0,
                    child: child,
                  );
                },
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Journey Info Card
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
                              Row(
                                children: [
                                  Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: Theme.of(
                                        context,
                                      ).primaryColor.withOpacity(0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      Icons.directions_boat,
                                      color: Theme.of(context).primaryColor,
                                      size: 20,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Informasi Perjalanan',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                          color: Theme.of(context).primaryColor,
                                        ),
                                      ),
                                      Text(
                                        booking.schedule?.ferry?.name ?? '-',
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),

                              const Divider(),

                              // Date & Time
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 8.0,
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Row(
                                        children: [
                                          Icon(
                                            Icons.calendar_today,
                                            size: 18,
                                            color: Colors.grey[600],
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                const Text(
                                                  'Tanggal',
                                                  style: TextStyle(
                                                    color: Colors.grey,
                                                    fontSize: 12,
                                                  ),
                                                ),
                                                Text(
                                                  dateFormat.format(
                                                    bookingDate,
                                                  ),
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 14,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Expanded(
                                      child: Row(
                                        children: [
                                          Icon(
                                            Icons.access_time,
                                            size: 18,
                                            color: Colors.grey[600],
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                const Text(
                                                  'Waktu',
                                                  style: TextStyle(
                                                    color: Colors.grey,
                                                    fontSize: 12,
                                                  ),
                                                ),
                                                Text(
                                                  '${booking.schedule?.departureTime ?? ''}',
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 14,
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
                              ),

                              const Divider(),

                              // Passenger & Vehicle
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 8.0,
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Row(
                                        children: [
                                          Icon(
                                            Icons.people,
                                            size: 18,
                                            color: Colors.grey[600],
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                const Text(
                                                  'Penumpang',
                                                  style: TextStyle(
                                                    color: Colors.grey,
                                                    fontSize: 12,
                                                  ),
                                                ),
                                                Text(
                                                  '${booking.passengerCount} orang',
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 14,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    if (booking.vehicleCount > 0)
                                      Expanded(
                                        child: Row(
                                          children: [
                                            Icon(
                                              Icons.directions_car,
                                              size: 18,
                                              color: Colors.grey[600],
                                            ),
                                            const SizedBox(width: 8),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  const Text(
                                                    'Kendaraan',
                                                    style: TextStyle(
                                                      color: Colors.grey,
                                                      fontSize: 12,
                                                    ),
                                                  ),
                                                  Text(
                                                    '${booking.vehicleCount} unit',
                                                    style: const TextStyle(
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      fontSize: 14,
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
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Multiple Tickets Selector
                      if (hasMultipleTickets) ...[
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Tiket (${tickets.length})',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                            // Download all tickets button for small screens
                            // ElevatedButton.icon(
                            //   icon: const Icon(Icons.download, size: 16),
                            //   label: const Text('Unduh Semua'),
                            //   onPressed: () => _downloadTicket(context, booking),
                            //   style: ElevatedButton.styleFrom(
                            //     visualDensity: VisualDensity.compact,
                            //     padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            //   ),
                            // ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          height: 48,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: tickets.length,
                            itemBuilder: (context, index) {
                              final isSelected = index == _selectedTicketIndex;

                              return Padding(
                                padding: const EdgeInsets.only(right: 8.0),
                                child: GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _selectedTicketIndex = index;
                                    });
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16.0,
                                      vertical: 8.0,
                                    ),
                                    decoration: BoxDecoration(
                                      color:
                                          isSelected
                                              ? Theme.of(context).primaryColor
                                              : Colors.grey[200],
                                      borderRadius: BorderRadius.circular(24),
                                      boxShadow:
                                          isSelected
                                              ? [
                                                BoxShadow(
                                                  color: Theme.of(context)
                                                      .primaryColor
                                                      .withOpacity(0.3),
                                                  blurRadius: 8,
                                                  offset: const Offset(0, 2),
                                                ),
                                              ]
                                              : null,
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(
                                          tickets[index].vehicleId != null
                                              ? Icons.directions_car
                                              : Icons.person,
                                          size: 16,
                                          color:
                                              isSelected
                                                  ? Colors.white
                                                  : Colors.grey[700],
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          'Tiket ${index + 1}',
                                          style: TextStyle(
                                            color:
                                                isSelected
                                                    ? Colors.white
                                                    : Colors.black87,
                                            fontWeight:
                                                isSelected
                                                    ? FontWeight.bold
                                                    : FontWeight.normal,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],

                      // Selected Ticket QR Code
                      if (selectedTicket != null) ...[
                        const SizedBox(height: 24),
                        Card(
                          elevation: 3,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(20.0),
                            child: Column(
                              children: [
                                // Ticket Header with Type Badge
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      hasMultipleTickets
                                          ? 'Tiket #${_selectedTicketIndex + 1}'
                                          : 'Tiket',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 18,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12.0,
                                        vertical: 6.0,
                                      ),
                                      decoration: BoxDecoration(
                                        color: Theme.of(
                                          context,
                                        ).primaryColor.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(
                                          color: Theme.of(
                                            context,
                                          ).primaryColor.withOpacity(0.3),
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(
                                            selectedTicket.vehicleId != null
                                                ? Icons.directions_car
                                                : Icons.person,
                                            size: 16,
                                            color:
                                                Theme.of(context).primaryColor,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            _getTicketTypeText(
                                              selectedTicket.ticketType,
                                            ),
                                            style: TextStyle(
                                              color:
                                                  Theme.of(
                                                    context,
                                                  ).primaryColor,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),

                                const SizedBox(height: 20),

                                // QR Code - Use RepaintBoundary to capture for downloading
                                Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.grey.withOpacity(0.2),
                                        blurRadius: 8,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: Column(
                                    children: [
                                      RepaintBoundary(
                                        key:
                                            _selectedTicketIndex <
                                                    _qrKeys.length
                                                ? _qrKeys[_selectedTicketIndex]
                                                : GlobalKey(),
                                        child: SizedBox(
                                          width: 200,
                                          height: 200,
                                          child: QrImageView(
                                            data: selectedTicket.qrCode,
                                            version: QrVersions.auto,
                                            backgroundColor: Colors.white,
                                            foregroundColor: Colors.black,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 16),
                                      Text(
                                        'Kode: ${selectedTicket.ticketCode}',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Theme.of(context).primaryColor,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        'Tunjukkan QR Code ini saat check-in',
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),

                                const SizedBox(height: 20),

                                // Boarding Info
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Colors.grey[100],
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Status Boarding',
                                            style: TextStyle(
                                              color: Colors.grey[600],
                                              fontSize: 12,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            selectedTicket.boardingStatus,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ],
                                      ),
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.all(8),
                                            decoration: BoxDecoration(
                                              color:
                                                  selectedTicket.checkedIn
                                                      ? Colors.green
                                                          .withOpacity(0.2)
                                                      : Colors.orange
                                                          .withOpacity(0.2),
                                              shape: BoxShape.circle,
                                            ),
                                            child: Icon(
                                              selectedTicket.checkedIn
                                                  ? Icons.check
                                                  : Icons.pending,
                                              color:
                                                  selectedTicket.checkedIn
                                                      ? Colors.green
                                                      : Colors.orange,
                                              size: 18,
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            selectedTicket.checkedIn
                                                ? 'Sudah Check-In'
                                                : 'Belum Check-In',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              color:
                                                  selectedTicket.checkedIn
                                                      ? Colors.green
                                                      : Colors.orange,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),

                                // Ticket Actions
                                const SizedBox(height: 16),
                                Row(
                                  children: [
                                    // Expanded(
                                    //   child: OutlinedButton.icon(
                                    //     icon: const Icon(Icons.download),
                                    //     label: const Text('Unduh'),
                                    //     onPressed: () => _downloadTicket(context, booking),
                                    //     style: OutlinedButton.styleFrom(
                                    //       padding: const EdgeInsets.symmetric(vertical: 12),
                                    //     ),
                                    //   ),
                                    // ),
                                    const SizedBox(width: 8),
                                    // Expanded(
                                    //   child: ElevatedButton.icon(
                                    //     icon: Icon(kIsWeb ? Icons.print : Icons.share),
                                    //     label: Text(kIsWeb ? 'Cetak' : 'Bagikan'),
                                    //     onPressed: kIsWeb
                                    //         ? () => _downloadTicket(context, booking)
                                    //         : _showShareOptions,
                                    //     style: ElevatedButton.styleFrom(
                                    //       padding: const EdgeInsets.symmetric(vertical: 12),
                                    //     ),
                                    //   ),
                                    // ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],

                      // Booking Information (unchanged)
                      const SizedBox(height: 24),
                      const Text(
                        'Informasi Pembayaran',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            children: [
                              _buildInfoRow(
                                'Kode Booking',
                                booking.bookingCode,
                              ),
                              const Divider(height: 24),
                              _buildInfoRow(
                                'Status Pembayaran',
                                _getPaymentStatus(booking),
                              ),
                              const Divider(height: 24),
                              _buildInfoRow(
                                'Total Pembayaran',
                                _formatCurrency(booking.totalAmount),
                              ),
                              if (booking.status == 'CANCELLED') ...[
                                const Divider(height: 24),
                                _buildInfoRow(
                                  'Alasan Pembatalan',
                                  booking.cancellationReason ?? '-',
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),

                      // Daftar Seluruh Tiket dalam bentuk card expandable (unchanged)
                      if (hasMultipleTickets) ...[
                        const SizedBox(height: 24),
                        const Text(
                          'Daftar Tiket',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Card(
                          elevation: 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: ExpansionTile(
                            title: const Text(
                              'Semua Tiket',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            leading: Icon(
                              Icons.confirmation_number,
                              color: Theme.of(context).primaryColor,
                            ),
                            children: [
                              ListView.separated(
                                physics: const NeverScrollableScrollPhysics(),
                                shrinkWrap: true,
                                itemCount: tickets.length,
                                separatorBuilder:
                                    (context, index) =>
                                        const Divider(height: 1),
                                itemBuilder: (context, index) {
                                  final ticket = tickets[index];
                                  final isSelected =
                                      index == _selectedTicketIndex;

                                  return ListTile(
                                    selected: isSelected,
                                    selectedTileColor: Theme.of(
                                      context,
                                    ).primaryColor.withOpacity(0.1),
                                    leading: CircleAvatar(
                                      backgroundColor:
                                          isSelected
                                              ? Theme.of(context).primaryColor
                                              : Colors.grey[300],
                                      child: Text(
                                        '${index + 1}',
                                        style: TextStyle(
                                          color:
                                              isSelected
                                                  ? Colors.white
                                                  : Colors.black,
                                        ),
                                      ),
                                    ),
                                    title: Text('Tiket #${ticket.ticketCode}'),
                                    subtitle: Text(
                                      _getTicketTypeDescription(ticket),
                                      style: TextStyle(color: Colors.grey[600]),
                                    ),
                                    trailing: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(
                                          ticket.checkedIn
                                              ? Icons.check_circle
                                              : Icons.qr_code,
                                          color:
                                              ticket.checkedIn
                                                  ? Colors.green
                                                  : Theme.of(
                                                    context,
                                                  ).primaryColor,
                                        ),
                                        const SizedBox(width: 8),
                                        Icon(
                                          Icons.arrow_forward_ios,
                                          size: 14,
                                          color: Colors.grey[400],
                                        ),
                                      ],
                                    ),
                                    onTap: () {
                                      setState(() {
                                        _selectedTicketIndex = index;
                                      });
                                    },
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 32),

                      // Cancel Button (if applicable) (unchanged)
                      if (canCancel)
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.cancel),
                            label: const Text('Batalkan Pemesanan'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.red,
                              side: const BorderSide(color: Colors.red),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            onPressed: _cancelBooking,
                          ),
                        ),

                      // Tombol refund (untuk CONFIRMED)
                      if (canRefund)
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.money),
                            label: const Text('Minta Refund'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.orange,
                              side: const BorderSide(color: Colors.orange),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            onPressed: _showRefundDialog,
                          ),
                        ),

                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showRefundDialog() async {
    TextEditingController reasonController = TextEditingController();
    TextEditingController bankNameController = TextEditingController();
    TextEditingController accountNameController = TextEditingController();
    TextEditingController accountNumberController = TextEditingController();

    final result =
        await showDialog<bool>(
          context: context,
          builder:
              (context) => AlertDialog(
                title: const Text('Minta Refund'),
                content: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Permintaan refund akan diproses dalam waktu 3-5 hari kerja. '
                        'Dana akan dikembalikan sesuai dengan kebijakan refund yang berlaku.\n',
                      ),
                      const SizedBox(height: 16),

                      const Text('Alasan Refund:'),
                      TextField(
                        controller: reasonController,
                        decoration: const InputDecoration(
                          hintText: 'Masukkan alasan refund',
                          border: OutlineInputBorder(),
                        ),
                        maxLines: 2,
                      ),

                      const SizedBox(height: 16),
                      const Text('Informasi Rekening:'),

                      const SizedBox(height: 8),
                      TextField(
                        controller: bankNameController,
                        decoration: const InputDecoration(
                          labelText: 'Nama Bank',
                          border: OutlineInputBorder(),
                        ),
                      ),

                      const SizedBox(height: 8),
                      TextField(
                        controller: accountNameController,
                        decoration: const InputDecoration(
                          labelText: 'Nama Pemilik Rekening',
                          border: OutlineInputBorder(),
                        ),
                      ),

                      const SizedBox(height: 8),
                      TextField(
                        controller: accountNumberController,
                        decoration: const InputDecoration(
                          labelText: 'Nomor Rekening',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                    ],
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: const Text('Batal'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      // Validasi
                      if (reasonController.text.isEmpty ||
                          bankNameController.text.isEmpty ||
                          accountNameController.text.isEmpty ||
                          accountNumberController.text.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Semua field harus diisi'),
                          ),
                        );
                        return;
                      }
                      Navigator.pop(context, true);
                    },
                    style: ElevatedButton.styleFrom(
                      foregroundColor: Colors.white,
                      backgroundColor: Colors.orange,
                    ),
                    child: const Text('Ajukan Refund'),
                  ),
                ],
              ),
        ) ??
        false;

    if (result) {
      setState(() {
        _isLoading = true;
      });

      try {
        final bookingProvider = Provider.of<BookingProvider>(
          context,
          listen: false,
        );

        // Panggil requestRefund dan simpan hasilnya - pastikan tipe data sesuai dengan hasil
        final Map<String, dynamic> response = await bookingProvider
            .requestRefund(
              widget.bookingId,
              reasonController.text,
              bankNameController.text,
              accountNameController.text,
              accountNumberController.text,
            );

        if (mounted) {
          // Akses properti dalam Map
          final bool success = response['success'] ?? false;
          final bool isManualProcess =
              response['requires_manual_process'] ?? true;

          if (success) {
            final String message =
                isManualProcess
                    ? 'Permintaan refund berhasil dikirim dan akan diproses secara manual oleh tim kami dalam 3-7 hari kerja. Dana akan dikembalikan ke rekening yang Anda berikan.'
                    : 'Permintaan refund berhasil dikirim dan sedang diproses. Status refund akan diperbarui secara otomatis.';

            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(message), duration: Duration(seconds: 6)),
            );

            // Refresh detail booking untuk menampilkan status baru
            _loadTicketDetails();
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  'Gagal mengajukan refund. Silakan coba lagi nanti.',
                ),
                backgroundColor: Colors.red,
              ),
            );
          }
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Gagal mengajukan refund: ${e.toString()}. Silakan hubungi customer service kami.',
              ),
              backgroundColor: Colors.red,
            ),
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'CONFIRMED':
        return Colors.green;
      case 'COMPLETED':
        return Colors.blue;
      case 'CANCELLED':
      case 'REFUNDED':
        return Colors.red;
      case 'PENDING':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'CONFIRMED':
        return Icons.check_circle;
      case 'COMPLETED':
        return Icons.done_all;
      case 'CANCELLED':
      case 'REFUNDED':
        return Icons.cancel;
      case 'PENDING':
        return Icons.pending;
      default:
        return Icons.info;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'CONFIRMED':
        return 'Terkonfirmasi';
      case 'COMPLETED':
        return 'Selesai';
      case 'CANCELLED':
        return 'Dibatalkan';
      case 'REFUNDED':
        return 'Refund';
      case 'PENDING':
        return 'Menunggu Pembayaran';
      default:
        return status;
    }
  }

  String _getStatusDescription(String status) {
    switch (status) {
      case 'CONFIRMED':
        return 'Tiket Anda telah dikonfirmasi dan siap digunakan';
      case 'COMPLETED':
        return 'Perjalanan Anda telah selesai';
      case 'CANCELLED':
        return 'Tiket ini telah dibatalkan';
      case 'REFUNDED':
        return 'Pembayaran telah dikembalikan';
      case 'PENDING':
        return 'Menunggu pembayaran dari Anda';
      default:
        return '';
    }
  }

  String _getPaymentStatus(booking) {
    final payments = booking.payments;
    if (payments == null || payments.isEmpty) {
      return 'Belum dibayar';
    }

    final latestPayment = payments.first;
    switch (latestPayment.status) {
      case 'SUCCESS':
        return 'Berhasil';
      case 'PENDING':
        return 'Menunggu Pembayaran';
      case 'FAILED':
        return 'Gagal';
      case 'EXPIRED':
        return 'Kedaluwarsa';
      case 'REFUNDED':
        return 'Dikembalikan';
      default:
        return latestPayment.status;
    }
  }

  String _formatCurrency(double amount) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return currencyFormat.format(amount);
  }

  String _getTicketTypeText(String type) {
    switch (type.toUpperCase()) {
      case 'PASSENGER':
        return 'Penumpang';
      case 'VEHICLE':
        return 'Kendaraan';
      case 'PASSENGER_VEHICLE':
        return 'Penumpang & Kendaraan';
      default:
        return type;
    }
  }

  String _getTicketTypeDescription(ticket) {
    if (ticket.vehicleId != null) {
      return 'Tiket Kendaraan';
    } else if (ticket.ticketType.toUpperCase().contains('PASSENGER')) {
      return 'Tiket Penumpang';
    } else {
      return 'Tiket ${ticket.ticketType}';
    }
  }
}
