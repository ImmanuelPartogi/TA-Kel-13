import 'package:flutter/material.dart';

abstract class LifecycleAwareProvider extends ChangeNotifier {
  void onBuildStart(BuildContext context) {}
  void onBuildEnd(BuildContext context) {}
  void onDispose(BuildContext context) {}
}

class LifecycleAwareWidget extends StatefulWidget {
  final Widget child;
  final List<LifecycleAwareProvider> providers;
  
  const LifecycleAwareWidget({
    Key? key,
    required this.child,
    required this.providers,
  }) : super(key: key);
  
  @override
  State<LifecycleAwareWidget> createState() => _LifecycleAwareWidgetState();
}

class _LifecycleAwareWidgetState extends State<LifecycleAwareWidget> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      for (var provider in widget.providers) {
        provider.onBuildStart(context);
      }
    });
  }
  
  @override
  void dispose() {
    for (var provider in widget.providers) {
      provider.onDispose(context);
    }
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      for (var provider in widget.providers) {
        provider.onBuildEnd(context);
      }
    });
    
    return widget.child;
  }
}