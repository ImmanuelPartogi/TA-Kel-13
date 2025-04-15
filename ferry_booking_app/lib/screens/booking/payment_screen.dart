import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/widgets/custom_appbar.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({Key? key}) : super(key: key);

  @override
  _PaymentScreenState createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  late WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initWebView();
    });
  }

  void _initWebView() {
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    final snapToken = bookingProvider.snapToken;
    
    if (snapToken == null) {
      // If no payment token, go back to booking summary
      Navigator.pushReplacementNamed(context, '/booking/summary');
      return;
    }
    
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onNavigationRequest: (NavigationRequest request) {
            // Handle redirects after payment completion
            if (request.url.contains('/payment/finish')) {
              _onPaymentFinished();
              return NavigationDecision.prevent;
            } else if (request.url.contains('/payment/unfinish') || 
                       request.url.contains('/payment/error')) {
              _onPaymentFailed();
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse('https://app.sandbox.midtrans.com/snap/v2/vtweb/$snapToken'));
  }
  
  Future<void> _onPaymentFinished() async {
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    final booking = bookingProvider.currentBooking;
    
    if (booking != null) {
      // Check payment status with the server
      await bookingProvider.checkPaymentStatus(booking.bookingCode);
      
      if (mounted) {
        // Go to success page
        Navigator.pushReplacementNamed(
          context, 
          '/booking/success',
          arguments: booking.id,
        );
      }
    } else {
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/home');
      }
    }
  }
  
  Future<void> _onPaymentFailed() async {
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    final booking = bookingProvider.currentBooking;
    
    if (booking != null) {
      // Check payment status with the server
      await bookingProvider.checkPaymentStatus(booking.bookingCode);
    }
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pembayaran gagal atau tidak selesai'),
        ),
      );
      
      Navigator.pushReplacementNamed(context, '/booking/summary');
    }
  }
  
  Future<bool> _handleBackPressed() async {
    final shouldPop = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Batalkan Pembayaran?'),
        content: const Text(
          'Jika Anda keluar sekarang, proses pembayaran akan dibatalkan. '
          'Anda dapat melanjutkan pemesanan dari menu riwayat pemesanan.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Lanjutkan Pembayaran'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Batalkan'),
          ),
        ],
      ),
    ) ?? false;
    
    if (shouldPop) {
      Navigator.pushReplacementNamed(context, '/home');
    }
    
    return false;
  }

  @override
  Widget build(BuildContext context) {
    final bookingProvider = Provider.of<BookingProvider>(context);
    
    return WillPopScope(
      onWillPop: _handleBackPressed,
      child: Scaffold(
        appBar: const CustomAppBar(
          title: 'Pembayaran',
          showBackButton: false,
        ),
        body: bookingProvider.snapToken == null
            ? const Center(
                child: Text('Token pembayaran tidak valid'),
              )
            : Stack(
                children: [
                  WebViewWidget(controller: _controller),
                  if (_isLoading)
                    const Center(
                      child: CircularProgressIndicator(),
                    ),
                ],
              ),
      ),
    );
  }
}