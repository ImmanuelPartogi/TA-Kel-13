import 'package:flutter/material.dart';

class SafeAsync {
  static Future<T?> call<T>(
    BuildContext context,
    Future<T> Function() asyncFunction, {
    Function(T result)? onSuccess,
    Function(dynamic error)? onError,
  }) async {
    if (!context.mounted) return null;
    
    try {
      final result = await asyncFunction();
      
      if (!context.mounted) return null;
      
      if (onSuccess != null) {
        onSuccess(result);
      }
      
      return result;
    } catch (e) {
      if (!context.mounted) return null;
      
      if (onError != null) {
        onError(e);
      }
      
      return null;
    }
  }
}