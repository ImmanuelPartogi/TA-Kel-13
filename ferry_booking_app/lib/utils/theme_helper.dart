import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeHelper {
  static const String _themePreferenceKey = 'theme_preference';
  static const String _themeSystemMode = 'system';
  static const String _themeLightMode = 'light';
  static const String _themeDarkMode = 'dark';
  
  static final List<Function> _listeners = [];
  
  // Mendeteksi apakah mode gelap diaktifkan
  static bool isDarkMode(BuildContext context) {
    var brightness = MediaQuery.of(context).platformBrightness;
    
    // Cek preferensi yang disimpan
    final themeMode = Theme.of(context).brightness;
    
    if (themeMode == Brightness.light || themeMode == Brightness.dark) {
      return themeMode == Brightness.dark;
    }
    
    return brightness == Brightness.dark;
  }
  
  // Mendapatkan preferensi tema yang disimpan
  static Future<String> getThemePreference() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_themePreferenceKey) ?? _themeSystemMode;
  }
  
  // Menyimpan preferensi tema
  static Future<void> _saveThemePreference(String mode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themePreferenceKey, mode);
    
    // Panggil semua listener
    for (var listener in _listeners) {
      listener();
    }
  }
  
  // Mengatur mode sistem (auto)
  static Future<void> setSystemMode(BuildContext context) async {
    await _saveThemePreference(_themeSystemMode);
    
    // Refresh tema UI
    final brightness = SchedulerBinding.instance.window.platformBrightness;
    final themeMode = brightness == Brightness.dark ? ThemeMode.dark : ThemeMode.light;
    
    // Idealnya gunakan provider untuk set theme secara global
    // Contoh: Provider.of<ThemeProvider>(context, listen: false).setThemeMode(themeMode);
  }
  
  // Mengatur mode terang
  static Future<void> setLightMode(BuildContext context) async {
    await _saveThemePreference(_themeLightMode);
    
    // Idealnya gunakan provider untuk set theme secara global
    // Contoh: Provider.of<ThemeProvider>(context, listen: false).setThemeMode(ThemeMode.light);
  }
  
  // Mengatur mode gelap
  static Future<void> setDarkMode(BuildContext context) async {
    await _saveThemePreference(_themeDarkMode);
    
    // Idealnya gunakan provider untuk set theme secara global
    // Contoh: Provider.of<ThemeProvider>(context, listen: false).setThemeMode(ThemeMode.dark);
  }
  
  // Mendaftarkan listener untuk perubahan tema
  static void addListener(Function listener) {
    if (!_listeners.contains(listener)) {
      _listeners.add(listener);
    }
  }
  
  // Menghapus listener
  static void removeListener(Function listener) {
    _listeners.remove(listener);
  }
}