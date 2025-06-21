import 'package:flutter/material.dart';

class NavigationService {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  
  static BuildContext? get currentContext => navigatorKey.currentContext;
  
  static Future<T?> navigateTo<T>(String routeName, {Object? arguments}) {
    return navigatorKey.currentState!.pushNamed(routeName, arguments: arguments);
  }
  
  static Future<T?> navigateToReplacement<T>(String routeName, {Object? arguments}) {
    return navigatorKey.currentState!.pushReplacementNamed(routeName, arguments: arguments);
  }
  
  static void goBack<T>([T? result]) {
    return navigatorKey.currentState!.pop(result);
  }
  
  static Future<T?> navigateToAndRemoveUntil<T>(String routeName, {Object? arguments}) {
    return navigatorKey.currentState!.pushNamedAndRemoveUntil(
      routeName,
      (route) => false,
      arguments: arguments
    );
  }
  
  static void showAppDialog(Widget dialog) {
    if (currentContext != null) {
      showDialog(
        context: currentContext!,
        barrierDismissible: false,
        builder: (BuildContext dialogContext) => dialog,
      );
    }
  }
}