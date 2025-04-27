import 'package:flutter/material.dart';

class ConnectionStatusBanner extends StatelessWidget {
  final bool isDarkMode;
  final String message;
  final Color? backgroundColor;
  final Color? textColor;
  final IconData? icon;
  final VoidCallback? onRetry;

  const ConnectionStatusBanner({
    Key? key,
    required this.isDarkMode,
    required this.message,
    this.backgroundColor,
    this.textColor,
    this.icon,
    this.onRetry,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: backgroundColor ?? (isDarkMode ? Colors.orange[900] : Colors.orange[100]),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            spreadRadius: 0,
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
          child: Row(
            children: [
              Icon(
                icon ?? Icons.wifi_off,
                color: textColor ?? (isDarkMode ? Colors.orange[300] : Colors.orange[800]),
                size: 18,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: TextStyle(
                    color: textColor ?? (isDarkMode ? Colors.orange[300] : Colors.orange[800]),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              if (onRetry != null)
                TextButton(
                  onPressed: onRetry,
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    minimumSize: const Size(60, 30),
                    backgroundColor: isDarkMode ? Colors.orange[800] : Colors.orange[50],
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    'Coba Lagi',
                    style: TextStyle(
                      color: isDarkMode ? Colors.white : Colors.orange[800],
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}