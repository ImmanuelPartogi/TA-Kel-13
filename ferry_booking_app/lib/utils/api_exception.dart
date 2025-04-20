class ApiException implements Exception {
  final int code;
  final String message;

  ApiException({
    required this.code,
    required this.message,
  });

  @override
  String toString() => message;
}