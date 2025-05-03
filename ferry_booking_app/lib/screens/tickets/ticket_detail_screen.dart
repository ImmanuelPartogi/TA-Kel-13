import 'dart:async';
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
import 'package:flutter/services.dart';

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
  Timer? _paymentStatusTimer;
  bool _isCheckingStatus = false;

  // QR Code key references for capturing QR images
  final List<GlobalKey> _qrKeys = [];

  @override
  void initState() {
    super.initState();
    _loadTicketDetails();

    // Start auto-refresh untuk status pembayaran jika pending
    _startPaymentStatusTimer();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );

    // Delay showing ticket details for smoother animation
    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) {
        setState(() {
          _showTicketDetails = true;
        });
        _animationController.forward();
      }
    });
  }

  @override
  void dispose() {
    _paymentStatusTimer?.cancel();
    _animationController.dispose();
    super.dispose();
  }

  void _startPaymentStatusTimer() {
    // Cek status booking setiap 30 detik jika masih pending
    _paymentStatusTimer = Timer.periodic(const Duration(seconds: 30), (
      timer,
    ) async {
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      final booking = bookingProvider.currentBooking;

      if (booking != null && booking.status == 'PENDING') {
        // Lakukan refresh tanpa loading indicator
        await bookingProvider.refreshPaymentStatus(booking.bookingCode);
      } else {
        // Stop timer jika booking sudah tidak pending
        timer.cancel();
      }
    });
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
    } catch (e) {
      _showSnackBar('Gagal memuat detail tiket: $e');
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
                  'Apakah Anda yakin ingin membatalkan pemesanan ini? Proses ini tidak dapat dibatalkan.',
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: const Text('Tidak'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context, true),
                    style: TextButton.styleFrom(foregroundColor: Colors.red),
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
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; background-color: #f8f9fa; }
            .container { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 16px; background-color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #f5f5f5; padding-bottom: 20px; margin-bottom: 20px; }
            .ticket-title { font-size: 28px; font-weight: bold; color: #1a73e8; margin: 10px 0; }
            .booking-id { font-size: 16px; color: #4a5568; margin-bottom: 20px; background-color: #e8f0fe; display: inline-block; padding: 4px 12px; border-radius: 16px; }
            .route-info { background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
            .ticket-section { margin-bottom: 30px; }
            .ticket-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.3s ease; }
            .ticket-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
            .ticket-header { display: flex; justify-content: space-between; margin-bottom: 15px; align-items: center; }
            .ticket-type { background-color: #e8f0fe; color: #1a73e8; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: bold; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
            .info-label { color: #718096; font-size: 14px; }
            .info-value { font-weight: bold; }
            .qr-container { height: 200px; width: 200px; margin: 0 auto; text-align: center; background-color: white; padding: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .footer { text-align: center; font-size: 12px; color: #718096; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
            .payment-info { background-color: #f7fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #1a73e8; }
            .section-title { font-size: 18px; font-weight: bold; color: #2d3748; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #f7fafc; }
            button { background-color: #1a73e8; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-right: 10px; font-weight: bold; transition: background-color 0.3s ease; }
            button:hover { background-color: #1765cc; }
            .btn-container { text-align: center; margin-top: 25px; }
            @page { size: A4; margin: 0.5cm; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="ticket-title">E-TICKET</div>
              <div class="booking-id">Booking #${booking.bookingCode}</div>
              
              <div class="route-info">
                <div style="font-size: 22px; font-weight: bold; text-align: center;">
                  ${booking.schedule?.route?.origin ?? ''} → ${booking.schedule?.route?.destination ?? ''}
                </div>
                <div style="text-align: center; margin-top: 10px; color: #4a5568;">
                  ${dateFormat.format(bookingDate)} • ${booking.schedule?.departureTime ?? ''}
                </div>
              </div>
            </div>
            
            <div class="ticket-section">
              <div class="section-title">Informasi Perjalanan</div>
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
              <div class="section-title">Tiket (${tickets.length})</div>
        ''';

        // Add each ticket with QR code
        for (int i = 0; i < tickets.length; i++) {
          final ticket = tickets[i];
          final qrCodeId = 'qrcode-${i}';

          // Get QR data URL if we captured it
          String qrHtml = '';
          if (i < qrDataUrls.length && qrDataUrls[i].isNotEmpty) {
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
                  <h4 style="margin: 0;">Tiket #${i + 1} (${ticket.ticketCode})</h4>
                  <span class="ticket-type">${_getTicketTypeText(ticket.ticketType)}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">Tipe:</span>
                  <span class="info-value">${_getTicketTypeText(ticket.ticketType)}</span>
                </div>
                
                ${ticket.vehicleId != null ? '<div class="info-row"><span class="info-label">Kendaraan:</span><span class="info-value">Termasuk kendaraan</span></div>' : ''}
                
                <div class="info-row">
                  <span class="info-label">Status Check-in:</span>
                  <span class="info-value" style="color: ${ticket.checkedIn ? '#34a853' : '#fbbc05'}; font-weight: bold;">
                    ${ticket.checkedIn ? 'Sudah Check-In' : 'Belum Check-In'}
                  </span>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                  <div class="qr-container">
                    ${qrHtml}
                    <p style="font-size: 12px; margin-top: 10px; color: #718096;">Tunjukkan QR Code ini saat check-in</p>
                    <p style="font-size: 14px; margin-top: 5px; font-weight: bold;">Kode: ${ticket.ticketCode}</p>
                  </div>
                </div>
              </div>
          ''';
        }

        // Add payment info and footer
        htmlContent += '''
            </div>
            
            <div class="payment-info">
              <div class="section-title">Informasi Pembayaran</div>
              <div class="info-row">
                <span class="info-label">Kode Booking:</span>
                <span class="info-value">${booking.bookingCode}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status Pembayaran:</span>
                <span class="info-value" style="color: ${_getPaymentStatusColor(booking)};">${_getPaymentStatus(booking)}</span>
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
              <button onclick="saveAsPDF()" style="background-color: #34a853;">Simpan sebagai PDF</button>
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
        SnackBar(
          content: Text(message),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          margin: const EdgeInsets.all(8),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    final booking = bookingProvider.currentBooking;

    if (_isLoading) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              Text(
                'Memuat detail tiket...',
                style: TextStyle(color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      );
    }

    if (booking == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Detail Tiket'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.pop(context),
          ),
        ),
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
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _loadTicketDetails,
                icon: const Icon(Icons.refresh),
                label: const Text('Coba Lagi'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                ),
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

    // Cek apakah booking masih dalam status PENDING
    final isPending = booking.status == 'PENDING';

    return Scaffold(
      appBar: AppBar(
        title: Text('Tiket #${booking.bookingCode}'),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          // Hanya tampilkan tombol download jika tidak pending
          if (!isPending)
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
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Header with status
            SliverToBoxAdapter(
              child: Container(
                color: _getStatusColor(booking.status),
                padding: const EdgeInsets.symmetric(
                  vertical: 20.0,
                  horizontal: 24.0,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            _getStatusIcon(booking.status),
                            color: Colors.white,
                            size: 28,
                          ),
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
                                  fontSize: 20,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _getStatusDescription(booking.status),
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.9),
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    // Journey summary
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.all(16),
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
                                    fontSize: 16,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Keberangkatan',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.9),
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            child: Column(
                              children: [
                                const Icon(
                                  Icons.arrow_forward,
                                  color: Colors.white,
                                  size: 20,
                                ),
                                const Text(
                                  'Perjalanan',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
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
                                    fontSize: 16,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Tujuan',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.9),
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
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 48,
                                    height: 48,
                                    decoration: BoxDecoration(
                                      color: Theme.of(
                                        context,
                                      ).primaryColor.withOpacity(0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      Icons.directions_boat_rounded,
                                      color: Theme.of(context).primaryColor,
                                      size: 24,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Informasi Perjalanan',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 18,
                                            color:
                                                Theme.of(context).primaryColor,
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
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),

                              const Divider(),

                              // Date & Time
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 12.0,
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Icon(
                                            Icons.calendar_today_rounded,
                                            size: 20,
                                            color:
                                                Theme.of(context).primaryColor,
                                          ),
                                          const SizedBox(width: 10),
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
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Icon(
                                            Icons.access_time_rounded,
                                            size: 20,
                                            color:
                                                Theme.of(context).primaryColor,
                                          ),
                                          const SizedBox(width: 10),
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
                                  vertical: 12.0,
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Icon(
                                            Icons.people_alt_rounded,
                                            size: 20,
                                            color:
                                                Theme.of(context).primaryColor,
                                          ),
                                          const SizedBox(width: 10),
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
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Icon(
                                              Icons.directions_car_rounded,
                                              size: 20,
                                              color:
                                                  Theme.of(
                                                    context,
                                                  ).primaryColor,
                                            ),
                                            const SizedBox(width: 10),
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

                      // BAGIAN INFORMASI PEMBAYARAN
                      // Selalu tampilkan bagian ini terlepas dari status booking
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          Icon(
                            Icons.payment_rounded,
                            color: Theme.of(context).primaryColor,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'Informasi Pembayaran',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            children: [
                              _buildInfoRow(
                                'Kode Booking',
                                booking.bookingCode,
                                Icons.confirmation_number_rounded,
                              ),
                              const Divider(height: 24),
                              _buildInfoRow(
                                'Status Pembayaran',
                                _getPaymentStatus(booking),
                                Icons.payment_rounded,
                                valueColor: _getPaymentStatusColor(booking),
                              ),
                              const Divider(height: 24),
                              _buildInfoRow(
                                'Total Pembayaran',
                                _formatCurrency(booking.totalAmount),
                                Icons.monetization_on_rounded,
                                valueColor: Theme.of(context).primaryColor,
                              ),
                              if (booking.status == 'CANCELLED') ...[
                                const Divider(height: 24),
                                _buildInfoRow(
                                  'Alasan Pembatalan',
                                  booking.cancellationReason ?? '-',
                                  Icons.info_outline_rounded,
                                  valueColor: Colors.red,
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),

                      // TAMPILKAN BAGIAN INSTRUKSI KHUSUS PEMBAYARAN JIKA STATUS PENDING
                      if (isPending) ...[
                        const SizedBox(height: 24),
                        _buildPaymentInstructionsCard(booking),
                      ],

                      // TAMPILKAN BAGIAN TIKET HANYA JIKA STATUS BUKAN PENDING
                      if (!isPending) ...[
                        // Multiple Tickets Selector
                        if (hasMultipleTickets) ...[
                          const SizedBox(height: 24),
                          Row(
                            children: [
                              Icon(
                                Icons.confirmation_number_rounded,
                                color: Theme.of(context).primaryColor,
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Tiket (${tickets.length})',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            height: 48,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: tickets.length,
                              itemBuilder: (context, index) {
                                final isSelected =
                                    index == _selectedTicketIndex;

                                return Padding(
                                  padding: const EdgeInsets.only(right: 8.0),
                                  child: GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        _selectedTicketIndex = index;
                                      });
                                    },
                                    child: AnimatedContainer(
                                      duration: const Duration(
                                        milliseconds: 300,
                                      ),
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
                                                ? Icons.directions_car_rounded
                                                : Icons.person_rounded,
                                            size: 18,
                                            color:
                                                isSelected
                                                    ? Colors.white
                                                    : Colors.grey[700],
                                          ),
                                          const SizedBox(width: 8),
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
                                          borderRadius: BorderRadius.circular(
                                            16,
                                          ),
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
                                                  ? Icons.directions_car_rounded
                                                  : Icons.person_rounded,
                                              size: 16,
                                              color:
                                                  Theme.of(
                                                    context,
                                                  ).primaryColor,
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

                                  const SizedBox(height: 24),

                                  // QR Code
                                  Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.grey.withOpacity(0.2),
                                          blurRadius: 12,
                                          offset: const Offset(0, 4),
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
                                              errorCorrectionLevel:
                                                  QrErrorCorrectLevel.H,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(height: 16),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Icon(
                                              Icons.qr_code_rounded,
                                              size: 18,
                                              color:
                                                  Theme.of(
                                                    context,
                                                  ).primaryColor,
                                            ),
                                            const SizedBox(width: 8),
                                            Text(
                                              'Kode: ${selectedTicket.ticketCode}',
                                              style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                color:
                                                    Theme.of(
                                                      context,
                                                    ).primaryColor,
                                                fontSize: 16,
                                              ),
                                            ),
                                          ],
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

                                  const SizedBox(height: 24),

                                  // Boarding Info
                                  Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: Colors.grey[50],
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: Colors.grey[200]!,
                                        width: 1,
                                      ),
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
                                                    ? Icons.check_rounded
                                                    : Icons.pending_rounded,
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
                                ],
                              ),
                            ),
                          ),
                        ],

                        // Daftar Seluruh Tiket dalam bentuk card expandable
                        if (hasMultipleTickets) ...[
                          const SizedBox(height: 24),
                          Row(
                            children: [
                              Icon(
                                Icons.list_alt_rounded,
                                color: Theme.of(context).primaryColor,
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              const Text(
                                'Daftar Tiket',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Card(
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Theme(
                              data: Theme.of(
                                context,
                              ).copyWith(dividerColor: Colors.transparent),
                              child: ExpansionTile(
                                tilePadding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                ),
                                childrenPadding: EdgeInsets.zero,
                                title: const Text(
                                  'Semua Tiket',
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                                leading: Icon(
                                  Icons.confirmation_number_rounded,
                                  color: Theme.of(context).primaryColor,
                                ),
                                children: [
                                  const Divider(height: 1),
                                  ListView.separated(
                                    physics:
                                        const NeverScrollableScrollPhysics(),
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
                                                  ? Theme.of(
                                                    context,
                                                  ).primaryColor
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
                                        title: Text(
                                          'Tiket #${ticket.ticketCode}',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                        subtitle: Text(
                                          _getTicketTypeDescription(ticket),
                                          style: TextStyle(
                                            color: Colors.grey[600],
                                          ),
                                        ),
                                        trailing: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 8,
                                                    vertical: 4,
                                                  ),
                                              decoration: BoxDecoration(
                                                color:
                                                    ticket.checkedIn
                                                        ? Colors.green
                                                            .withOpacity(0.1)
                                                        : Theme.of(context)
                                                            .primaryColor
                                                            .withOpacity(0.1),
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                              ),
                                              child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  Icon(
                                                    ticket.checkedIn
                                                        ? Icons
                                                            .check_circle_rounded
                                                        : Icons.qr_code_rounded,
                                                    color:
                                                        ticket.checkedIn
                                                            ? Colors.green
                                                            : Theme.of(
                                                              context,
                                                            ).primaryColor,
                                                    size: 16,
                                                  ),
                                                  const SizedBox(width: 4),
                                                  Text(
                                                    ticket.checkedIn
                                                        ? 'Checked-in'
                                                        : 'Belum Check-in',
                                                    style: TextStyle(
                                                      fontSize: 12,
                                                      fontWeight:
                                                          FontWeight.w500,
                                                      color:
                                                          ticket.checkedIn
                                                              ? Colors.green
                                                              : Theme.of(
                                                                context,
                                                              ).primaryColor,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            const SizedBox(width: 8),
                                            Icon(
                                              Icons.arrow_forward_ios_rounded,
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
                          ),
                        ],
                      ],

                      const SizedBox(height: 32),

                      // Action Buttons
                      if (canCancel || canRefund) ...[
                        const Divider(),
                        const SizedBox(height: 16),
                        Text(
                          'Aksi',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: Colors.grey[700],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Tombol refund (untuk CONFIRMED)
                        if (canRefund)
                          Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              icon: const Icon(Icons.monetization_on_rounded),
                              label: const Text('Minta Refund'),
                              style: ElevatedButton.styleFrom(
                                foregroundColor: Colors.white,
                                backgroundColor: Colors.orange[700],
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  vertical: 14,
                                ),
                              ),
                              onPressed: _showRefundDialog,
                            ),
                          ),

                        // Cancel Button (if applicable)
                        if (canCancel)
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton.icon(
                              icon: const Icon(Icons.cancel_rounded),
                              label: const Text('Batalkan Pemesanan'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.red,
                                side: const BorderSide(color: Colors.red),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  vertical: 14,
                                ),
                              ),
                              onPressed: _cancelBooking,
                            ),
                          ),
                      ],

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

  // Tambahkan method untuk menampilkan instruksi pembayaran
  Widget _buildPaymentInstructionsCard(booking) {
    // Dapatkan data pembayaran dari booking
    final payment =
        booking.payments?.isNotEmpty == true ? booking.payments?.first : null;

    // Jika tidak ada data pembayaran, tampilkan pesan
    if (payment == null) {
      return Card(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            children: [
              const Icon(Icons.payment_rounded, size: 48, color: Colors.orange),
              const SizedBox(height: 16),
              const Text(
                'Mohon lakukan pembayaran untuk melihat tiket Anda',
                textAlign: TextAlign.center,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 12),
              const Text(
                'Pilih metode pembayaran yang tersedia untuk melanjutkan',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 14),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                icon: const Icon(Icons.payments_rounded),
                label: const Text('Pilih Metode Pembayaran'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  padding: const EdgeInsets.symmetric(
                    vertical: 14,
                    horizontal: 24,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: () {
                  // Navigasi ke halaman pembayaran di sini
                },
              ),
            ],
          ),
        ),
      );
    }

    // Jika ada data pembayaran, tampilkan detailnya
    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.payments_rounded,
                    color: Colors.orange,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Menunggu Pembayaran',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: Colors.orange,
                        ),
                      ),
                      if (payment.expiryTime != null)
                        Row(
                          children: [
                            const Icon(
                              Icons.timer_rounded,
                              size: 14,
                              color: Colors.grey,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Bayar sebelum ${DateFormat('dd MMM yyyy, HH:mm', 'id_ID').format(payment.expiryTime!)}',
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Divider(),

            // Metode Pembayaran
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.account_balance_rounded,
                        size: 18,
                        color: Colors.grey[600],
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Metode Pembayaran',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      _getReadablePaymentMethod(
                        payment.paymentMethod,
                        payment.paymentType,
                      ),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Nomor Virtual Account
            if (payment.virtualAccountNumber != null &&
                payment.virtualAccountNumber!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.numbers_rounded,
                          size: 18,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Nomor Virtual Account',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () {
                          Clipboard.setData(
                            ClipboardData(text: payment.virtualAccountNumber!),
                          );
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Nomor Virtual Account telah disalin',
                              ),
                              behavior: SnackBarBehavior.floating,
                              duration: Duration(seconds: 2),
                            ),
                          );
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Ink(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.grey[50],
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: Colors.blue.withOpacity(0.3),
                              width: 1,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                payment.virtualAccountNumber!,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                  letterSpacing: 1.2,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.blue.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Row(
                                  children: [
                                    Icon(
                                      Icons.copy_rounded,
                                      color: Colors.blue,
                                      size: 16,
                                    ),
                                    SizedBox(width: 4),
                                    Text(
                                      'Salin',
                                      style: TextStyle(
                                        color: Colors.blue,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            // QR Code URL
            if (payment.qrCodeUrl != null && payment.qrCodeUrl!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.qr_code_rounded,
                          size: 18,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'QR Code Pembayaran',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Center(
                      child: Container(
                        width: 220,
                        height: 220,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withOpacity(0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                          border: Border.all(color: Colors.grey[200]!),
                        ),
                        padding: const EdgeInsets.all(10),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            payment.qrCodeUrl!,
                            fit: BoxFit.contain,
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return const Center(
                                child: CircularProgressIndicator(),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) {
                              return Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.error_outline_rounded,
                                    color: Colors.red[300],
                                    size: 48,
                                  ),
                                  const SizedBox(height: 12),
                                  const Text(
                                    'Tidak dapat memuat QR Code',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(color: Colors.grey),
                                  ),
                                  const SizedBox(height: 8),
                                  TextButton.icon(
                                    onPressed: () {
                                      setState(() {}); // Refresh
                                    },
                                    icon: const Icon(Icons.refresh_rounded),
                                    label: const Text('Coba Lagi'),
                                  ),
                                ],
                              );
                            },
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Center(
                      child: Text(
                        'Scan QR Code di atas menggunakan aplikasi e-wallet atau mobile banking Anda',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 24),
            const Divider(),
            const SizedBox(height: 16),

            // Tombol Instruksi dan Deep Link
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    icon: const Icon(Icons.help_outline_rounded, size: 18),
                    label: const Text('Cara Pembayaran'),
                    onPressed: () {
                      _showPaymentInstructions(context, payment);
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      backgroundColor: Theme.of(context).primaryColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                if (payment.deepLinkUrl != null &&
                    payment.deepLinkUrl!.isNotEmpty) ...[
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.open_in_new_rounded, size: 18),
                      label: const Text('Buka Aplikasi'),
                      onPressed: () {
                        // Buka deep link
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),

            const SizedBox(height: 16),

            // Tombol Periksa Status Pembayaran dengan loading indicator
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                icon:
                    _isCheckingStatus
                        ? SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Theme.of(context).primaryColor,
                            ),
                          ),
                        )
                        : const Icon(Icons.refresh_rounded),
                label: Text(
                  _isCheckingStatus
                      ? 'Memeriksa...'
                      : 'Periksa Status Pembayaran',
                ),
                onPressed:
                    _isCheckingStatus
                        ? null
                        : () {
                          setState(() {
                            _isCheckingStatus = true;
                          });
                          _refreshPaymentStatus(booking.bookingCode).then((_) {
                            if (mounted) {
                              setState(() {
                                _isCheckingStatus = false;
                              });
                            }
                          });
                        },
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  foregroundColor: Theme.of(context).primaryColor,
                  side: BorderSide(color: Theme.of(context).primaryColor),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Method untuk menampilkan metode pembayaran yang dapat dibaca
  String _getReadablePaymentMethod(String method, String type) {
    final methodLower = method.toLowerCase();
    final typeLower = type.toLowerCase();

    if (methodLower.contains('virtual_account')) {
      if (typeLower.contains('bca')) return 'BCA Virtual Account';
      if (typeLower.contains('bni')) return 'BNI Virtual Account';
      if (typeLower.contains('bri')) return 'BRI Virtual Account';
      if (typeLower.contains('mandiri')) return 'Mandiri Virtual Account';
      return 'Virtual Account';
    } else if (methodLower.contains('e_wallet')) {
      if (typeLower.contains('gopay')) return 'GoPay';
      if (typeLower.contains('shopeepay')) return 'ShopeePay';
      if (typeLower.contains('dana')) return 'DANA';
      if (typeLower.contains('ovo')) return 'OVO';
      return 'E-Wallet';
    } else if (methodLower.contains('credit_card')) {
      return 'Kartu Kredit';
    }

    return method;
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
                title: Row(
                  children: [
                    Icon(
                      Icons.monetization_on_rounded,
                      color: Colors.orange[700],
                    ),
                    const SizedBox(width: 8),
                    const Text('Minta Refund'),
                  ],
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                content: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.blue[50],
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.blue[100]!),
                        ),
                        child: const Row(
                          children: [
                            Icon(
                              Icons.info_outline_rounded,
                              color: Colors.blue,
                              size: 18,
                            ),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Permintaan refund akan diproses dalam waktu 3-5 hari kerja. Dana akan dikembalikan sesuai kebijakan refund.',
                                style: TextStyle(fontSize: 12),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      const Text(
                        'Alasan Refund:',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      TextField(
                        controller: reasonController,
                        decoration: InputDecoration(
                          hintText: 'Masukkan alasan refund',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          contentPadding: const EdgeInsets.all(12),
                        ),
                        maxLines: 2,
                      ),

                      const SizedBox(height: 20),
                      const Text(
                        'Informasi Rekening:',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),

                      const SizedBox(height: 8),
                      TextField(
                        controller: bankNameController,
                        decoration: InputDecoration(
                          labelText: 'Nama Bank',
                          prefixIcon: const Icon(
                            Icons.account_balance_rounded,
                            size: 18,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: const EdgeInsets.all(12),
                        ),
                      ),

                      const SizedBox(height: 8),
                      TextField(
                        controller: accountNameController,
                        decoration: InputDecoration(
                          labelText: 'Nama Pemilik Rekening',
                          prefixIcon: const Icon(
                            Icons.person_rounded,
                            size: 18,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: const EdgeInsets.all(12),
                        ),
                      ),

                      const SizedBox(height: 8),
                      TextField(
                        controller: accountNumberController,
                        decoration: InputDecoration(
                          labelText: 'Nomor Rekening',
                          prefixIcon: const Icon(
                            Icons.numbers_rounded,
                            size: 18,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: const EdgeInsets.all(12),
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
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                        return;
                      }
                      Navigator.pop(context, true);
                    },
                    style: ElevatedButton.styleFrom(
                      foregroundColor: Colors.white,
                      backgroundColor: Colors.orange[700],
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
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

        // Panggil requestRefund dan simpan hasilnya
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
              SnackBar(
                content: Text(message),
                duration: const Duration(seconds: 6),
                behavior: SnackBarBehavior.floating,
              ),
            );

            // Refresh detail booking untuk menampilkan status baru
            _loadTicketDetails();
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  'Gagal mengajukan refund. ${response['error'] ?? 'Silakan coba lagi nanti.'}',
                ),
                backgroundColor: Colors.red,
                behavior: SnackBarBehavior.floating,
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
              behavior: SnackBarBehavior.floating,
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

  // Fungsi untuk menampilkan instruksi pembayaran
  Future<void> _showPaymentInstructions(
    BuildContext context,
    dynamic payment,
  ) async {
    setState(() {
      _isLoading = true;
    });

    try {
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      final String paymentMethod = payment.paymentMethod;
      final String paymentType = payment.paymentType;

      // Dapatkan instruksi pembayaran dari API
      final instructions = await bookingProvider.getPaymentInstructions(
        paymentMethod,
        paymentType,
      );

      if (mounted) {
        setState(() {
          _isLoading = false;
        });

        // Tampilkan instruksi dalam bottom sheet
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          builder:
              (context) => DraggableScrollableSheet(
                initialChildSize: 0.6,
                minChildSize: 0.4,
                maxChildSize: 0.9,
                expand: false,
                builder:
                    (context, scrollController) => SingleChildScrollView(
                      controller: scrollController,
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Center(
                              child: Container(
                                width: 50,
                                height: 5,
                                decoration: BoxDecoration(
                                  color: Colors.grey[300],
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                            ),
                            const SizedBox(height: 24),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: Theme.of(
                                      context,
                                    ).primaryColor.withOpacity(0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    Icons.help_outline_rounded,
                                    color: Theme.of(context).primaryColor,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Text(
                                    instructions['title'] ?? 'Cara Pembayaran',
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            const Divider(),
                            const SizedBox(height: 16),

                            // Tampilkan langkah-langkah
                            Column(
                              children: List.generate(
                                (instructions['steps'] as List<dynamic>).length,
                                (index) => Padding(
                                  padding: const EdgeInsets.only(bottom: 16.0),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        width: 28,
                                        height: 28,
                                        decoration: BoxDecoration(
                                          color: Theme.of(
                                            context,
                                          ).primaryColor.withOpacity(0.1),
                                          shape: BoxShape.circle,
                                        ),
                                        child: Center(
                                          child: Text(
                                            '${index + 1}',
                                            style: TextStyle(
                                              color:
                                                  Theme.of(
                                                    context,
                                                  ).primaryColor,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 16),
                                      Expanded(
                                        child: Text(
                                          instructions['steps'][index],
                                          style: const TextStyle(fontSize: 15),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 24),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                child: const Text('Tutup'),
                                onPressed: () => Navigator.pop(context),
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 14,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                          ],
                        ),
                      ),
                    ),
              ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        _showSnackBar('Gagal memuat instruksi pembayaran: $e');
      }
    }
  }

  // Fungsi untuk memeriksa status pembayaran
  Future<void> _refreshPaymentStatus(String bookingCode) async {
    try {
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      final success = await bookingProvider.refreshPaymentStatus(bookingCode);

      if (mounted) {
        if (success) {
          // Jika sukses, reload detail booking untuk mendapatkan data terbaru
          await _loadTicketDetails();
          _showSnackBar('Status pembayaran berhasil diperbarui');
        } else {
          _showSnackBar('Gagal memperbarui status pembayaran');
        }
      }
    } catch (e) {
      if (mounted) {
        _showSnackBar('Error: $e');
      }
    }
  }

  Widget _buildInfoRow(
    String label,
    String value,
    IconData icon, {
    Color? valueColor,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: Colors.grey[600]),
              const SizedBox(width: 8),
              Text(label, style: const TextStyle(color: Colors.grey)),
            ],
          ),
          Text(
            value,
            style: TextStyle(fontWeight: FontWeight.bold, color: valueColor),
          ),
        ],
      ),
    );
  }

  Color _getPaymentStatusColor(booking) {
    final status = _getPaymentStatus(booking);
    switch (status) {
      case 'Berhasil':
        return Colors.green[700]!; // Green
      case 'Menunggu Pembayaran':
        return Colors.orange[700]!; // Yellow
      case 'Gagal':
      case 'Kedaluwarsa':
        return Colors.red[700]!; // Red
      case 'Dikembalikan':
        return Colors.blue[700]!; // Blue
      default:
        return Colors.grey[700]!; // Grey
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'CONFIRMED':
        return Colors.green[700]!;
      case 'COMPLETED':
        return Colors.blue[700]!;
      case 'CANCELLED':
      case 'REFUNDED':
        return Colors.red[700]!;
      case 'PENDING':
        return Colors.orange[700]!;
      default:
        return Colors.grey[700]!;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'CONFIRMED':
        return Icons.check_circle_rounded;
      case 'COMPLETED':
        return Icons.done_all_rounded;
      case 'CANCELLED':
      case 'REFUNDED':
        return Icons.cancel_rounded;
      case 'PENDING':
        return Icons.pending_rounded;
      default:
        return Icons.info_outline_rounded;
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
