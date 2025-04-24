import 'dart:async';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:provider/provider.dart';
import '../../providers/booking_provider.dart';
import '../../widgets/custom_appbar.dart';

class WebViewScreen extends StatefulWidget {
  final String url;
  final String title;
  final String bookingCode;

  const WebViewScreen({
    Key? key, 
    required this.url, 
    required this.title,
    required this.bookingCode,
  }) : super(key: key);

  @override
  _WebViewScreenState createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late WebViewController _controller;
  bool _isLoading = true;
  Timer? _statusCheckTimer;

  @override
  void initState() {
    super.initState();
    // Inisialisasi controller
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
            
            // Handle jika pengguna diarahkan ke halaman finish/unfinish/error
            if (url.contains('/payment/finish') || 
                url.contains('/payment/unfinish') || 
                url.contains('/payment/error')) {
              // Kembali ke halaman sebelumnya
              Navigator.pop(context);
              
              // Cek status pembayaran
              Provider.of<BookingProvider>(context, listen: false)
                  .checkPaymentStatus(widget.bookingCode);
            }
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onNavigationRequest: (NavigationRequest request) {
            // Jika URL mengandung callback, tangani sesuai kebutuhan
            if (request.url.contains('/payment/finish')) {
              Navigator.pop(context);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
      
    // Mulai polling status setiap 5 detik
    _startStatusPolling();
  }
  
  @override
  void dispose() {
    // Hentikan timer saat screen di-dispose
    _statusCheckTimer?.cancel();
    super.dispose();
  }

  void _startStatusPolling() {
    // Polling setiap 5 detik
    _statusCheckTimer = Timer.periodic(Duration(seconds: 5), (timer) async {
      try {
        // Panggil API cek status
        await Provider.of<BookingProvider>(context, listen: false)
            .checkPaymentStatus(widget.bookingCode);

        // Ambil status terbaru
        final currentBooking = Provider.of<BookingProvider>(
          context, 
          listen: false
        ).currentBooking;

        if (currentBooking != null) {
          final status = currentBooking.status;

          // Cek status pembayaran
          if (status == 'PAID' || status == 'CONFIRMED') {
            timer.cancel();
            // Navigasi ke halaman sukses
            Navigator.pushReplacementNamed(context, '/payment-success');
          } else if (status == 'FAILED' || status == 'CANCELLED') {
            timer.cancel();
            // Navigasi ke halaman gagal
            Navigator.pushReplacementNamed(context, '/payment-failed');
          }
        }
      } catch (e) {
        print('Error checking payment status: $e');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(title: widget.title),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }
}