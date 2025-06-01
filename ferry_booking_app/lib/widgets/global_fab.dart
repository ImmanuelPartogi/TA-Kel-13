import 'package:flutter/material.dart';
import 'package:ferry_booking_app/screens/chatbot/chatbot_screen.dart';

class GlobalFAB extends StatefulWidget {
  // Callback untuk navigasi ke tambah tiket
  final VoidCallback onAddTicket;

  // Parameter untuk menentukan apakah ini halaman tiket
  final bool isTicketScreen;

  const GlobalFAB({
    Key? key,
    required this.onAddTicket,
    this.isTicketScreen = false, // Default-nya bukan halaman tiket
  }) : super(key: key);

  @override
  GlobalFABState createState() => GlobalFABState();
}

class GlobalFABState extends State<GlobalFAB> {
  // Tidak lagi membutuhkan state _isOpen dan animasi karena tidak ada menu hamburger

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Jika ini halaman tiket, tampilkan tombol "tambah"
    if (widget.isTicketScreen) {
      return Container(
        height: 56,
        width: 56,
        child: FloatingActionButton(
          heroTag: "fab_add_ticket",
          backgroundColor: theme.primaryColor,
          elevation: 6.0,
          child: const Icon(Icons.add_rounded, color: Colors.white, size: 24),
          onPressed: widget.onAddTicket,
        ),
      );
    }
    // Jika bukan halaman tiket, tampilkan tombol "chat"
    else {
      return Container(
        height: 56,
        width: 56,
        child: FloatingActionButton(
          heroTag: "fab_chat",
          backgroundColor: Colors.blue.shade700,
          elevation: 6.0,
          child: const Icon(Icons.chat, color: Colors.white, size: 24),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const ChatbotScreen()),
            );
          },
        ),
      );
    }
  }

  // Metode kosong ini dipertahankan untuk kompatibilitas dengan kode HomeScreen yang memanggil closeMenu()
  void closeMenu() {
    // Tidak melakukan apa-apa karena tidak ada menu yang perlu ditutup
  }
}
