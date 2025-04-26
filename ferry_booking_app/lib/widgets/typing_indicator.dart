import 'package:flutter/material.dart';
import 'dart:async';

/// Widget kustom untuk menampilkan indikator mengetik
/// sebagai alternatif animated_text_kit yang mungkin bermasalah
class TypingIndicator extends StatefulWidget {
  const TypingIndicator({Key? key}) : super(key: key);

  @override
  _TypingIndicatorState createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<TypingIndicator> with SingleTickerProviderStateMixin {
  int _dotCount = 0;
  Timer? _timer;
  late AnimationController _bounceController;
  late List<Animation<double>> _dotAnimations;

  @override
  void initState() {
    super.initState();
    
    // Setup animasi bounce
    _bounceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
    
    // Buat animasi untuk setiap titik
    _dotAnimations = List.generate(3, (index) {
      return Tween<double>(begin: 0, end: 1).animate(
        CurvedAnimation(
          parent: _bounceController,
          curve: Interval(
            index * 0.2, // mulai animasi dengan delay
            0.6 + index * 0.2, // akhir animasi
            curve: Curves.easeInOut,
          ),
        ),
      );
    });
    
    // Timer untuk update titik-titik
    _timer = Timer.periodic(const Duration(milliseconds: 500), (timer) {
      setState(() {
        _dotCount = (_dotCount + 1) % 4; // 0-3 titik
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _bounceController.dispose();
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
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Animasi titik-titik
            AnimatedBuilder(
              animation: _bounceController,
              builder: (context, child) {
                return Row(
                  children: List.generate(3, (index) {
                    return Opacity(
                      opacity: index < _dotCount ? 1.0 : 0.0,
                      child: Transform.translate(
                        offset: Offset(0, -3 * _dotAnimations[index].value),
                        child: Text(
                          '.',
                          style: TextStyle(
                            color: Colors.grey[700],
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    );
                  }),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}