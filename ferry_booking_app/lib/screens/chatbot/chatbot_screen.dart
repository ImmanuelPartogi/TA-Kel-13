import 'package:ferry_booking_app/widgets/suggested_questions.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:ferry_booking_app/providers/chatbot_provider.dart';
import 'package:ferry_booking_app/providers/auth_provider.dart';
import 'package:ferry_booking_app/models/chat_message.dart';
import 'package:flutter_chat_bubble/bubble_type.dart';
import 'package:flutter_chat_bubble/chat_bubble.dart';
import 'package:flutter_chat_bubble/clippers/chat_bubble_clipper_6.dart';
import 'package:ferry_booking_app/widgets/typing_indicator.dart'; // Widget kustom untuk typing indicator

class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({Key? key}) : super(key: key);

  @override
  _ChatbotScreenState createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late ChatbotProvider _chatbotProvider;
  late AuthProvider _authProvider;
  bool _isInitialized = false;
  bool _showScrollButton = false;
  late AnimationController _animationController;
  late Animation<double> _animation;
  
  @override
  void initState() {
    super.initState();
    _chatbotProvider = Provider.of<ChatbotProvider>(context, listen: false);
    _authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    // Inisialisasi controller animasi untuk button scroll
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    
    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
    
    // Set token dari auth provider jika user login
    if (_authProvider.isLoggedIn) {
      _chatbotProvider.setToken(_authProvider.token);
    }
    
    // Setup listener untuk scroll
    _scrollController.addListener(_scrollListener);
    
    // Gunakan addPostFrameCallback untuk memuat percakapan setelah build selesai
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeChat();
    });
  }
  
  // Listener untuk scroll position
  void _scrollListener() {
    if (_scrollController.hasClients) {
      final maxScroll = _scrollController.position.maxScrollExtent;
      final currentScroll = _scrollController.position.pixels;
      
      // Jika scroll position tidak di bawah (dengan toleransi 50 pixel)
      if (currentScroll < maxScroll - 50 && !_showScrollButton) {
        setState(() {
          _showScrollButton = true;
        });
        _animationController.forward();
      } else if (currentScroll >= maxScroll - 50 && _showScrollButton) {
        setState(() {
          _showScrollButton = false;
        });
        _animationController.reverse();
      }
    }
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
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              isHelpful
                  ? 'Kami senang dapat membantu Anda.'
                  : 'Mohon bantu kami meningkatkan layanan chatbot.',
              style: TextStyle(color: Colors.grey[700]),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: feedbackController,
              decoration: InputDecoration(
                hintText: isHelpful
                    ? 'Berikan saran tambahan (opsional)'
                    : 'Mohon beri tahu kami bagaimana kami dapat membantu',
                border: const OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
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
                const SnackBar(
                  content: Text('Terima kasih atas feedback Anda!'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
            child: const Text('Kirim'),
          ),
        ],
      ),
    );
  }
  
  // Tampilkan menu opsi
  void _showOptionsMenu() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 8),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Pengaturan Chatbot',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              _buildOptionItem(
                icon: Icons.restart_alt,
                title: 'Mulai Percakapan Baru',
                subtitle: 'Hapus semua pesan dan mulai ulang',
                onTap: () {
                  Navigator.pop(context);
                  _showResetConfirmation();
                },
              ),
              const Divider(),
              _buildOptionItem(
                icon: Icons.help_outline,
                title: 'Pertanyaan Populer',
                subtitle: 'Lihat pertanyaan yang sering ditanyakan',
                onTap: () {
                  Navigator.pop(context);
                  // TODO: Implementasi tampilkan pertanyaan populer
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Fitur akan segera tersedia!')),
                  );
                },
              ),
              if (_authProvider.isLoggedIn) ...[
                const Divider(),
                _buildOptionItem(
                  icon: Icons.history,
                  title: 'Riwayat Percakapan',
                  subtitle: 'Lihat percakapan sebelumnya',
                  onTap: () {
                    Navigator.pop(context);
                    // TODO: Implementasi tampilkan riwayat percakapan
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Fitur akan segera tersedia!')),
                    );
                  },
                ),
              ],
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }
  
  // Konfirmasi reset percakapan
  void _showResetConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Mulai Percakapan Baru?'),
        content: const Text(
          'Semua pesan di percakapan ini akan dihapus dan tidak dapat dipulihkan. Lanjutkan?'
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            onPressed: () {
              Navigator.pop(context);
              _chatbotProvider.clearConversation();
            },
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
  }
  
  // Widget untuk item opsi
  Widget _buildOptionItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).primaryColor),
      title: Text(title),
      subtitle: Text(subtitle),
      onTap: onTap,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Chatbot Ferry Booking'),
            Text(
              '24/7 Layanan Pelanggan',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.normal,
              ),
            ),
          ],
        ),
        elevation: 1,
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: _showOptionsMenu,
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
              // Banner offline jika tidak ada koneksi
              if (provider.isOffline)
                Container(
                  color: Colors.orange[100],
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                  child: Row(
                    children: const [
                      Icon(Icons.wifi_off, color: Colors.orange),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Anda sedang offline. Pesan akan dikirim saat koneksi tersedia.',
                          style: TextStyle(color: Colors.orange, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
                
              // Daftar pesan
              Expanded(
                child: provider.messages.isEmpty
                    ? _buildEmptyState()
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
                                return const TypingIndicator();
                              }
                            },
                          ),
                          
                          // Tombol scroll ke bawah dengan animasi fade in/out
                          AnimatedBuilder(
                            animation: _animation,
                            builder: (context, child) {
                              return Positioned(
                                right: 16,
                                bottom: 16,
                                child: Opacity(
                                  opacity: _animation.value,
                                  child: Transform.scale(
                                    scale: 0.8 + (_animation.value * 0.2),
                                    child: FloatingActionButton(
                                      mini: true,
                                      backgroundColor: Theme.of(context).primaryColor.withOpacity(0.8),
                                      child: const Icon(Icons.keyboard_arrow_down),
                                      onPressed: _scrollToBottom,
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
              ),
              
              // Saran pertanyaan
              if (provider.suggestedQuestions.isNotEmpty)
                SuggestedQuestions(
                  questions: provider.suggestedQuestions,
                  onTap: (question) {
                    provider.sendSuggestedQuestion(question);
                  },
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
                    // Tombol tambahan (misalnya untuk voice input)
                    IconButton(
                      icon: Icon(
                        Icons.mic,
                        color: Theme.of(context).primaryColor.withOpacity(0.6),
                      ),
                      onPressed: () {
                        // TODO: Implementasi voice input
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Input suara akan segera tersedia!')),
                        );
                      },
                    ),
                    // Text field
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
                        maxLines: null,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _sendMessage(),
                        enabled: !provider.isSending && !provider.isOffline,
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Tombol kirim
                    Container(
                      decoration: BoxDecoration(
                        color: provider.isSending || provider.isOffline
                            ? Colors.grey
                            : Theme.of(context).primaryColor,
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        onPressed: provider.isSending || provider.isOffline ? null : _sendMessage,
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
  
  // Widget untuk status kosong
  Widget _buildEmptyState() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.chat_bubble_outline,
          size: 80,
          color: Colors.grey[300],
        ),
        const SizedBox(height: 16),
        Text(
          'Selamat datang di Chatbot Ferry Booking',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.grey[700],
          ),
        ),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Text(
            'Tanyakan informasi tentang jadwal, pemesanan tiket, atau bantuan lainnya.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.grey[600],
            ),
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }
  
  // Widget untuk item pesan
  Widget _buildMessageItem(ChatMessage message) {
    final isFailedMessage = message.messageStatus == 'failed';
    final isPendingMessage = message.messageStatus == 'pending';
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: message.isFromUser
            ? CrossAxisAlignment.end
            : CrossAxisAlignment.start,
        children: [
          // Jika ada indikator status untuk pesan yang gagal atau pending
          if (isFailedMessage || isPendingMessage)
            Padding(
              padding: const EdgeInsets.only(bottom: 4.0, left: 8.0, right: 8.0),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: message.isFromUser 
                    ? MainAxisAlignment.end 
                    : MainAxisAlignment.start,
                children: [
                  Icon(
                    isFailedMessage ? Icons.error_outline : Icons.access_time,
                    size: 12,
                    color: isFailedMessage ? Colors.red : Colors.orange,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    isFailedMessage ? 'Gagal terkirim' : 'Menunggu koneksi',
                    style: TextStyle(
                      fontSize: 10,
                      color: isFailedMessage ? Colors.red : Colors.orange,
                    ),
                  ),
                ],
              ),
            ),
          
          // Bubble chat
          ChatBubble(
            clipper: ChatBubbleClipper6(
              type: message.isFromUser 
                ? BubbleType.sendBubble
                : BubbleType.receiverBubble,
              radius: 16,
            ),
            alignment: message.isFromUser 
                ? Alignment.topRight
                : Alignment.topLeft,
            margin: const EdgeInsets.only(top: 6),
            backGroundColor: isFailedMessage
                ? Colors.red[100]
                : isPendingMessage
                    ? Colors.orange[100]
                    : message.isFromUser
                        ? Theme.of(context).primaryColor
                        : Colors.grey[200],
            child: Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.7,
              ),
              child: _buildMessageContent(message),
            ),
          ),
          
          // Info waktu
          Padding(
            padding: const EdgeInsets.only(top: 2.0, left: 8.0, right: 8.0),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: message.isFromUser 
                  ? MainAxisAlignment.end 
                  : MainAxisAlignment.start,
              children: [
                Text(
                  _formatTime(message.createdAt),
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.grey[600],
                  ),
                ),
                // Status pesan berupa icon centang
                if (message.isFromUser && !isFailedMessage && !isPendingMessage) ...[
                  const SizedBox(width: 4),
                  Icon(
                    Icons.check,
                    size: 12,
                    color: Colors.grey[600],
                  ),
                ],
              ],
            ),
          ),
          
          // Tombol retry untuk pesan yang gagal
          if (isFailedMessage)
            Padding(
              padding: const EdgeInsets.only(top: 4, right: 8.0),
              child: GestureDetector(
                onTap: () => _chatbotProvider.resendMessage(message.message),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Icon(
                      Icons.refresh,
                      size: 14,
                      color: Theme.of(context).primaryColor,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Coba lagi',
                      style: TextStyle(
                        color: Theme.of(context).primaryColor,
                        fontSize: 12,
                      ),
                    ),
                  ],
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
  
  // Widget untuk konten pesan yang mendukung format rich text
  Widget _buildMessageContent(ChatMessage message) {
    // Untuk saat ini, hanya tampilkan teks sederhana
    // Bisa dikembangkan untuk mendukung HTML, Markdown, dsb
    return Text(
      message.message,
      style: TextStyle(
        color: message.isFromUser ? Colors.white : Colors.black,
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
  
  @override
  void dispose() {
    _scrollController.removeListener(_scrollListener);
    _scrollController.dispose();
    _messageController.dispose();
    _animationController.dispose();
    super.dispose();
  }
}