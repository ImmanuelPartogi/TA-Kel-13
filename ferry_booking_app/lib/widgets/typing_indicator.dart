import 'package:flutter/material.dart';

class TypingIndicator extends StatefulWidget {
  const TypingIndicator({Key? key}) : super(key: key);

  @override
  _TypingIndicatorState createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<TypingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  // Dot widgets dibuat sekali saja
  final List<Widget> _dots = List.generate(
    3,
    (index) => const Text(
      '.',
      style: TextStyle(
        color: Color(0xFF616161), // Menggunakan nilai konstan
        fontSize: 24,
        fontWeight: FontWeight.bold,
      ),
    ),
  );

  @override
  void initState() {
    super.initState();

    // Satu controller untuk semua animasi
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();

    // Satu animasi saja yang digunakan untuk efek muncul/hilang
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeInOut);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(top: 8.0, bottom: 8.0, right: 80.0),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.grey[200],
          borderRadius: BorderRadius.circular(18),
        ),
        // Gunakan AnimatedBuilder hanya sekali
        child: AnimatedBuilder(
          animation: _animation,
          builder: (context, child) {
            return Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Efek fade dan bounce untuk dot pertama
                Transform.translate(
                  offset: Offset(0, -3 * _controller.value),
                  child: Opacity(
                    opacity:
                        _controller.value < 0.3 ? _controller.value * 3 : 1.0,
                    child: _dots[0],
                  ),
                ),
                // Efek fade dan bounce untuk dot kedua dengan delay
                Transform.translate(
                  offset: Offset(
                    0,
                    -3 *
                        (_controller.value > 0.2
                            ? (_controller.value - 0.2) * 1.25
                            : 0),
                  ),
                  child: Opacity(
                    opacity:
                        _controller.value < 0.5 && _controller.value > 0.2
                            ? (_controller.value - 0.2) * 3
                            : (_controller.value > 0.5 ? 1.0 : 0.0),
                    child: _dots[1],
                  ),
                ),
                // Efek fade dan bounce untuk dot ketiga dengan delay lebih lama
                Transform.translate(
                  offset: Offset(
                    0,
                    -3 *
                        (_controller.value > 0.4
                            ? (_controller.value - 0.4) * 1.67
                            : 0),
                  ),
                  child: Opacity(
                    opacity:
                        _controller.value < 0.7 && _controller.value > 0.4
                            ? (_controller.value - 0.4) * 3
                            : (_controller.value > 0.7 ? 1.0 : 0.0),
                    child: _dots[2],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
