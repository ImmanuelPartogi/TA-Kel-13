class Conversation {
  final int id;
  final int? userId;
  final String sessionId;

  Conversation({
    required this.id,
    this.userId,
    required this.sessionId,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'],
      userId: json['user_id'],
      sessionId: json['session_id'],
    );
  }
}