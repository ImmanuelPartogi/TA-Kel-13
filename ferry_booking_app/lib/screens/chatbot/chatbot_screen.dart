import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/chatbot_provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:ferry_booking_app/models/chat_message.dart';
import 'package:flutter_chat_bubble/bubble_type.dart';
import 'package:flutter_chat_bubble/chat_bubble.dart';
import 'package:flutter_chat_bubble/clippers/chat_bubble_clipper_6.dart';

class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({Key? key}) : super(key: key);

  @override
  _ChatbotScreenState createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late ChatbotProvider _chatbotProvider;
  late AuthProvider _authProvider;
  bool _isInitialized = false;
  
  @override
  void initState() {
    super.initState();
    _chatbotProvider = Provider.of<ChatbotProvider>(context, listen: false);
    _authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    // Set token dari auth provider jika user login
    if (_authProvider.isLoggedIn) {
      _chatbotProvider.setToken(_authProvider.token);
    }
    
    // Gunakan addPostFrameCallback untuk memuat percakapan setelah build selesai
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeChat();
    });
  }

  Future<void> _initializeChat() async {
    if (!_isInitialized) {
      await _chatbotProvider.loadConversation();
      _isInitialized = true;
      _scrollToBottom();
    }
  }
  
  // Scroll ke bawah untuk melihat pesan terbaru
  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      });
    }
  }
  
  // Kirim pesan
  Future<void> _sendMessage() async {
    final message = _messageController.text.trim();
    if (message.isEmpty) return;
    
    _messageController.clear();
    await _chatbotProvider.sendMessage(message);
    _scrollToBottom();
  }
  
  // Tampilkan dialog feedback
  void _showFeedbackDialog(int messageId, bool isHelpful) {
    final feedbackController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(isHelpful ? 'Terima kasih!' : 'Maaf kamu tidak terbantu'),
        content: TextField(
          controller: feedbackController,
          decoration: InputDecoration(
            hintText: isHelpful
                ? 'Berikan saran tambahan (opsional)'
                : 'Mohon beri tahu kami bagaimana kami dapat membantu',
            border: const OutlineInputBorder(),
          ),
          maxLines: 3,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              _chatbotProvider.sendFeedback(
                messageId,
                isHelpful,
                feedbackText: feedbackController.text.trim().isNotEmpty
                    ? feedbackController.text.trim()
                    : null,
              );
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Terima kasih atas feedback Anda!')),
              );
            },
            child: const Text('Kirim'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bantuan Layanan'),
        elevation: 1,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              _chatbotProvider.loadConversation();
            },
          ),
        ],
      ),
      body: Consumer<ChatbotProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading && provider.messages.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }
          
          // Jadwalkan scroll setelah build selesai jika ada pesan
          if (provider.messages.isNotEmpty) {
            WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
          }
          
          return Column(
            children: [
              // Daftar pesan
              Expanded(
                child: provider.messages.isEmpty
                    ? const Center(child: Text('Belum ada pesan'))
                    : Stack(
                        children: [
                          ListView.builder(
                            controller: _scrollController,
                            padding: const EdgeInsets.all(16),
                            itemCount: provider.messages.length + (provider.isTyping ? 1 : 0),
                            itemBuilder: (context, index) {
                              if (index < provider.messages.length) {
                                return _buildMessageItem(provider.messages[index]);
                              } else {
                                // Efek mengetik
                                return const Align(
                                  alignment: Alignment.centerLeft,
                                  child: Padding(
                                    padding: EdgeInsets.only(top: 8.0, bottom: 8.0),
                                    child: Text(
                                      "Mengetik...",
                                      style: TextStyle(
                                        color: Colors.grey,
                                        fontStyle: FontStyle.italic,
                                      ),
                                    ),
                                  ),
                                );
                              }
                            },
                          ),
                          
                          // Tombol scroll ke bawah
                          if (provider.messages.length > 5)
                            Positioned(
                              right: 16,
                              bottom: 16,
                              child: FloatingActionButton(
                                mini: true,
                                backgroundColor: Theme.of(context).primaryColor.withOpacity(0.8),
                                child: const Icon(Icons.keyboard_arrow_down),
                                onPressed: _scrollToBottom,
                              ),
                            ),
                        ],
                      ),
              ),
              
              // Input pesan
              Container(
                padding: const EdgeInsets.all(8.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      spreadRadius: 1,
                      blurRadius: 3,
                      offset: const Offset(0, -1),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _messageController,
                        decoration: InputDecoration(
                          hintText: 'Tulis pesan Anda...',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(24),
                            borderSide: BorderSide.none,
                          ),
                          filled: true,
                          fillColor: Colors.grey[100],
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                        ),
                        onSubmitted: (_) => _sendMessage(),
                        enabled: !provider.isSending,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor,
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        onPressed: provider.isSending ? null : _sendMessage,
                        icon: provider.isSending
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(
                                Icons.send,
                                color: Colors.white,
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
  
  // Widget untuk item pesan
  Widget _buildMessageItem(ChatMessage message) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: message.isFromUser
            ? CrossAxisAlignment.end
            : CrossAxisAlignment.start,
        children: [
          ChatBubble(
            clipper: ChatBubbleClipper6(
              type: message.isFromUser 
                ? BubbleType.sendBubble
                : BubbleType.receiverBubble,
            ),
            alignment: message.isFromUser 
                ? Alignment.topRight
                : Alignment.topLeft,
            margin: const EdgeInsets.only(top: 6),
            backGroundColor: message.isFromUser
                ? Theme.of(context).primaryColor
                : Colors.grey[200],
            child: Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.7,
              ),
              child: Text(
                message.message,
                style: TextStyle(
                  color: message.isFromUser ? Colors.white : Colors.black,
                ),
              ),
            ),
          ),
          
          // Info waktu
          Padding(
            padding: const EdgeInsets.only(top: 2.0, left: 8.0, right: 8.0),
            child: Text(
              _formatTime(message.createdAt),
              style: TextStyle(
                fontSize: 10,
                color: Colors.grey[600],
              ),
            ),
          ),
          
          // Tombol feedback jika pesan dari chatbot
          if (!message.isFromUser && message.id > 0)
            Padding(
              padding: const EdgeInsets.only(top: 4, left: 8.0),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  InkWell(
                    onTap: () => _showFeedbackDialog(message.id, true),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Theme.of(context).primaryColor,
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.thumb_up,
                            size: 14,
                            color: Theme.of(context).primaryColor,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Membantu',
                            style: TextStyle(
                              color: Theme.of(context).primaryColor,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: () => _showFeedbackDialog(message.id, false),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.red,
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.thumb_down,
                            size: 14,
                            color: Colors.red,
                          ),
                          const SizedBox(width: 4),
                          const Text(
                            'Tidak Membantu',
                            style: TextStyle(
                              color: Colors.red,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
  
  // Format waktu pesan
  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final messageDate = DateTime(time.year, time.month, time.day);
    
    if (messageDate == today) {
      // Format jam:menit untuk hari ini
      return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    } else if (messageDate == yesterday) {
      // "Kemarin" untuk pesan kemarin
      return 'Kemarin, ${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    } else {
      // Format tanggal lengkap untuk pesan lama
      return '${time.day}/${time.month}/${time.year}, ${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    }
  }
}