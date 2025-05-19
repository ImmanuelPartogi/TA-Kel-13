import 'package:flutter/material.dart';
import 'package:ferry_booking_app/screens/chatbot/chatbot_screen.dart';

class GlobalFAB extends StatefulWidget {
  // Callback untuk navigasi ke tambah tiket
  final VoidCallback onAddTicket;

  const GlobalFAB({Key? key, required this.onAddTicket}) : super(key: key);

  @override
  GlobalFABState createState() => GlobalFABState();
}

class GlobalFABState extends State<GlobalFAB>
    with SingleTickerProviderStateMixin {
  bool _isOpen = false;
  late AnimationController _animController;
  late Animation<double> _rotateAnimation;
  late Animation<double> _option1Animation;
  late Animation<double> _option2Animation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );

    _rotateAnimation = Tween<double>(begin: 0, end: 0.5).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );

    _option1Animation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animController,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOutCubic),
      ),
    );

    _option2Animation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animController,
        curve: const Interval(0.1, 0.8, curve: Curves.easeOutCubic),
      ),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _toggleMenu() {
    setState(() {
      _isOpen = !_isOpen;
      if (_isOpen) {
        _animController.forward();
      } else {
        _animController.reverse();
      }
    });
  }

  // Metode publik untuk menutup menu
  void closeMenu() {
    if (_isOpen) {
      setState(() {
        _isOpen = false;
        _animController.reverse();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;

    return Stack(
      children: [
        // Backdrop untuk tap when menu is open
        if (_isOpen)
          Positioned(
            width: size.width,
            height: size.height,
            child: GestureDetector(
              behavior:
                  HitTestBehavior
                      .translucent, // Penting: gunakan translucent, bukan opaque
              onTap: closeMenu,
              // Gunakan Stack untuk membuat area di sekitar FAB tidak menangkap tap
              child: Stack(
                children: [
                  // Container transparan untuk seluruh layar
                  Container(color: Colors.transparent),

                  // Posisi "lubang" di mana kita tidak ingin menangkap tap (di area FAB)
                  Positioned(
                    right: 0,
                    bottom: 0,
                    width: 90, // Sesuaikan dengan lebar area FAB
                    height: 250, // Sesuaikan dengan tinggi area FAB
                    child: Container(
                      color: Colors.transparent,
                      // Atur IgnorePointer agar tap di area ini diteruskan ke FAB di bawahnya
                      child: IgnorePointer(ignoring: true),
                    ),
                  ),
                ],
              ),
            ),
          ),

        // Widget FAB yang sebenarnya
        Container(
          height: 250,
          width: 90,
          child: Stack(
            alignment: Alignment.bottomRight,
            children: [
              // Opsi Chatbot - opsi pertama
              AnimatedBuilder(
                animation: _option1Animation,
                builder: (context, child) {
                  return Positioned(
                    bottom: 60 * _option1Animation.value + 16,
                    right: 16,
                    child: Opacity(
                      opacity: _option1Animation.value,
                      child: Transform.scale(
                        scale: _option1Animation.value,
                        child: FloatingActionButton(
                          heroTag: "fab_chat",
                          backgroundColor: Colors.blue.shade700,
                          mini: false,
                          elevation: 6.0,
                          child: const Icon(
                            Icons.chat,
                            color: Colors.white,
                            size: 24,
                          ),
                          onPressed: () {
                            closeMenu();
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const ChatbotScreen(),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  );
                },
              ),

              // Opsi Tambah Tiket - opsi kedua
              AnimatedBuilder(
                animation: _option2Animation,
                builder: (context, child) {
                  return Positioned(
                    bottom: 120 * _option2Animation.value + 16,
                    right: 16,
                    child: Opacity(
                      opacity: _option2Animation.value,
                      child: Transform.scale(
                        scale: _option2Animation.value,
                        child: FloatingActionButton(
                          heroTag: "fab_add_ticket",
                          backgroundColor: theme.primaryColor,
                          mini: false,
                          elevation: 6.0,
                          child: const Icon(
                            Icons.add_rounded,
                            color: Colors.white,
                            size: 24,
                          ),
                          onPressed: () {
                            closeMenu();
                            widget.onAddTicket();
                          },
                        ),
                      ),
                    ),
                  );
                },
              ),

              // FAB Utama dengan ikon hamburger menu
              Positioned(
                bottom: 16,
                right: 16,
                child: AnimatedBuilder(
                  animation: _animController,
                  builder: (context, child) {
                    return FloatingActionButton(
                      heroTag: "fab_main_hamburger",
                      backgroundColor:
                          _isOpen ? Colors.grey.shade800 : theme.primaryColor,
                      elevation: 6.0,
                      child: AnimatedBuilder(
                        animation: _rotateAnimation,
                        builder: (context, child) {
                          return Transform.rotate(
                            angle: _rotateAnimation.value * 2 * 3.14159,
                            child: Icon(
                              _isOpen ? Icons.close : Icons.menu,
                              color: Colors.white,
                              size: 24,
                            ),
                          );
                        },
                      ),
                      onPressed: _toggleMenu,
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
