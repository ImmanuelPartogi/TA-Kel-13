import 'package:flutter/material.dart';
import 'package:ferry_booking_app/api/booking_api.dart';
import 'package:ferry_booking_app/api/payment_api.dart';
import 'package:ferry_booking_app/models/booking.dart';
import 'package:ferry_booking_app/models/ferry.dart';
import 'package:ferry_booking_app/models/route.dart';
import 'package:ferry_booking_app/models/schedule.dart';
import 'package:ferry_booking_app/models/ticket.dart';
import 'package:ferry_booking_app/models/vehicle.dart';

class BookingProvider extends ChangeNotifier {
  final BookingApi _bookingApi = BookingApi();
  final PaymentApi _paymentApi = PaymentApi();
  
  bool _isLoading = false;
  String? _errorMessage;
  
  // Selected booking data
  FerryRoute? _selectedRoute;
  Schedule? _selectedSchedule;
  DateTime? _selectedDate;
  List<Map<String, dynamic>> _passengers = [];
  List<Map<String, dynamic>> _vehicles = [];
  
  // Booking results
  List<Booking>? _bookings;
  Booking? _currentBooking;
  String? _snapToken;
  
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  
  FerryRoute? get selectedRoute => _selectedRoute;
  Schedule? get selectedSchedule => _selectedSchedule;
  DateTime? get selectedDate => _selectedDate;
  List<Map<String, dynamic>> get passengers => _passengers;
  List<Map<String, dynamic>> get vehicles => _vehicles;
  
  List<Booking>? get bookings => _bookings;
  Booking? get currentBooking => _currentBooking;
  String? get snapToken => _snapToken;
  
  // Getters for booking summary
  double get passengerCost => _selectedRoute != null && _passengers.isNotEmpty 
      ? _selectedRoute!.basePrice * _passengers.length : 0.0;
      
  double get vehicleCost {
    if (_selectedRoute == null || _vehicles.isEmpty) return 0.0;
    
    double total = 0.0;
    for (var vehicle in _vehicles) {
      switch (vehicle['type']) {
        case 'MOTORCYCLE':
          total += _selectedRoute!.motorcyclePrice;
          break;
        case 'CAR':
          total += _selectedRoute!.carPrice;
          break;
        case 'BUS':
          total += _selectedRoute!.busPrice;
          break;
        case 'TRUCK':
          total += _selectedRoute!.truckPrice;
          break;
      }
    }
    return total;
  }
  
  double get totalCost => passengerCost + vehicleCost;
  
  // Set selected route
  void setSelectedRoute(FerryRoute route) {
    _selectedRoute = route;
    notifyListeners();
  }
  
  // Set selected schedule
  void setSelectedSchedule(Schedule schedule) {
    _selectedSchedule = schedule;
    notifyListeners();
  }
  
  // Set selected date
  void setSelectedDate(DateTime date) {
    _selectedDate = date;
    notifyListeners();
  }
  
  // Add passenger
  void addPassenger(Map<String, dynamic> passenger) {
    _passengers.add(passenger);
    notifyListeners();
  }
  
  // Update passenger
  void updatePassenger(int index, Map<String, dynamic> passenger) {
    if (index >= 0 && index < _passengers.length) {
      _passengers[index] = passenger;
      notifyListeners();
    }
  }
  
  // Remove passenger
  void removePassenger(int index) {
    if (index >= 0 && index < _passengers.length) {
      _passengers.removeAt(index);
      notifyListeners();
    }
  }
  
  // Add vehicle
  void addVehicle(Map<String, dynamic> vehicle) {
    _vehicles.add(vehicle);
    notifyListeners();
  }
  
  // Update vehicle
  void updateVehicle(int index, Map<String, dynamic> vehicle) {
    if (index >= 0 && index < _vehicles.length) {
      _vehicles[index] = vehicle;
      notifyListeners();
    }
  }
  
  // Remove vehicle
  void removeVehicle(int index) {
    if (index >= 0 && index < _vehicles.length) {
      _vehicles.removeAt(index);
      notifyListeners();
    }
  }
  
  // Reset booking data
  void resetBookingData() {
    _selectedRoute = null;
    _selectedSchedule = null;
    _selectedDate = null;
    _passengers = [];
    _vehicles = [];
    _currentBooking = null;
    _snapToken = null;
    notifyListeners();
  }
  
  // Get all bookings
  Future<void> getBookings() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      _bookings = await _bookingApi.getBookings();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }
  
  // Get booking details
  Future<void> getBookingDetails(int bookingId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      _currentBooking = await _bookingApi.getBookingDetails(bookingId);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }
  
  // Create booking
  Future<bool> createBooking() async {
    if (_selectedSchedule == null || _selectedDate == null || _passengers.isEmpty) {
      _errorMessage = 'Silakan lengkapi data pemesanan';
      notifyListeners();
      return false;
    }
    
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      final bookingData = {
        'schedule_id': _selectedSchedule!.id,
        'booking_date': _selectedDate!.toIso8601String().split('T')[0],
        'passenger_count': _passengers.length,
        'vehicle_count': _vehicles.length,
        'passengers': _passengers,
        'vehicles': _vehicles.isNotEmpty ? _vehicles : null,
      };
      
      final result = await _bookingApi.createBooking(bookingData);
      _currentBooking = result['booking'];
      _snapToken = result['payment']['snap_token'];
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
  
  // Cancel booking
  Future<bool> cancelBooking(int bookingId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      await _bookingApi.cancelBooking(bookingId);
      
      // Update current booking if it's the cancelled one
      if (_currentBooking != null && _currentBooking!.id == bookingId) {
        _currentBooking = await _bookingApi.getBookingDetails(bookingId);
      }
      
      // Update bookings list if it exists
      if (_bookings != null) {
        await getBookings();
      }
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
  
  // Check payment status
  Future<void> checkPaymentStatus(String bookingCode) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    
    try {
      final result = await _paymentApi.getPaymentStatus(bookingCode);
      
      // Update current booking after payment
      if (_currentBooking != null && _currentBooking!.bookingCode == bookingCode) {
        await getBookingDetails(_currentBooking!.id);
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }
  
  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}