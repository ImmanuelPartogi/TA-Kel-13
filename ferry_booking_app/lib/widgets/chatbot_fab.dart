import 'package:flutter/material.dart';
import 'package:ferry_booking_app/screens/chatbot/chatbot_screen.dart';

class ChatbotFAB extends StatelessWidget {
  const ChatbotFAB({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const ChatbotScreen()),
        );
      },
      child: const Icon(Icons.chat),
      tooltip: 'Bantuan',
    );
  }
}