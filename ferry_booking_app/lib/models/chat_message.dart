class ChatMessage {
  final int id;
  final bool isFromUser;
  final String message;
  final DateTime createdAt;

  ChatMessage({
    required this.id,
    required this.isFromUser,
    required this.message,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'],
      isFromUser: json['is_from_user'],
      message: json['message'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}