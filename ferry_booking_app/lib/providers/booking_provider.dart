import 'package:flutter/material.dart';
import '../api/booking_api.dart';
import '../api/payment_api.dart';
import '../models/booking.dart';
import '../models/ferry.dart';
import '../models/route.dart';
import '../models/schedule.dart';
import '../models/vehicle.dart'; // Import model Vehicle

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
  
  // PERUBAHAN: Ubah tipe data dari Map ke model Vehicle
  List<Vehicle> _vehicles = [];
  
  // Map untuk menyimpan jumlah penumpang per kategori
  Map<String, int> _passengerCounts = {
    'adult': 1,
    'child': 0,
    'infant': 0
  };

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
  
  // PERUBAHAN: Getter untuk vehicles
  List<Vehicle> get vehicles => _vehicles;
  
  // Getter untuk passengerCounts
  Map<String, int> get passengerCounts => _passengerCounts;

  List<Booking>? get bookings => _bookings;
  Booking? get currentBooking => _currentBooking;
  String? get snapToken => _snapToken;

  // Menghitung total penumpang dari semua kategori
  int get totalPassengers {
    return (_passengerCounts['adult'] ?? 0) + 
           (_passengerCounts['child'] ?? 0) + 
           (_passengerCounts['infant'] ?? 0);
  }

  // Getters for booking summary
  double get passengerCost {
    if (_selectedRoute == null) return 0.0;
    
    // Versi baru dengan diferensiasi harga per kategori
    double total = 0.0;
    // Biaya untuk dewasa (harga penuh)
    total += (_passengerCounts['adult'] ?? 0) * _selectedRoute!.basePrice;
    // Biaya untuk anak-anak (75% dari harga penuh)
    total += (_passengerCounts['child'] ?? 0) * (_selectedRoute!.basePrice * 0.75);
    // Bayi biasanya dengan biaya minimal
    total += (_passengerCounts['infant'] ?? 0) * (_selectedRoute!.basePrice * 0.1);
    
    return total;
  }

  // PERUBAHAN: Ubah perhitungan biaya kendaraan untuk model Vehicle
  double get vehicleCost {
    if (_selectedRoute == null || _vehicles.isEmpty) return 0.0;

    double total = 0.0;
    for (var vehicle in _vehicles) {
      switch (vehicle.type) {
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

  bool get hasActiveBooking => _currentBooking != null;

  void createTemporaryBooking() {
    if (_currentBooking == null &&
        _selectedRoute != null &&
        _selectedSchedule != null) {
      // Buat objek Booking sementara dengan data yang sudah dipilih
      final tempBooking = Booking(
        id: -1, // ID sementara
        bookingCode: 'TEMP-${DateTime.now().millisecondsSinceEpoch}',
        userId: -1,
        scheduleId: _selectedSchedule!.id,
        bookingDate:
            _selectedDate?.toIso8601String().split('T')[0] ??
            DateTime.now().toIso8601String().split('T')[0],
        passengerCount: totalPassengers, // Gunakan total dari semua kategori
        vehicleCount: _vehicles.length,
        totalAmount: totalCost,
        status: 'DRAFT',
        bookedBy: 'MOBILE',
        createdAt: DateTime.now().toIso8601String(),
        schedule: _selectedSchedule,
      );

      _currentBooking = tempBooking;
      notifyListeners();
    }
  }

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

  // Metode untuk memperbarui jumlah penumpang per kategori
  void updatePassengerCounts(Map<String, int> counts) {
    _passengerCounts = counts;
    
    // Konversi jumlah penumpang kategori ke format yang kompatibel dengan sistem lama
    _convertPassengerCountsToPassengers();
    
    notifyListeners();
  }
  
  // Mengkonversi data jumlah per kategori ke list passengers
  void _convertPassengerCountsToPassengers() {
    _passengers = [];
    
    // Tambahkan penumpang dewasa
    for (int i = 0; i < (_passengerCounts['adult'] ?? 0); i++) {
      _passengers.add({
        'name': 'Dewasa ${i + 1}',
        'id_type': 'KTP',
        'id_number': '',
      });
    }
    
    // Tambahkan penumpang anak-anak
    for (int i = 0; i < (_passengerCounts['child'] ?? 0); i++) {
      _passengers.add({
        'name': 'Anak ${i + 1}',
        'id_type': 'KTP',
        'id_number': '',
      });
    }
    
    // Tambahkan penumpang bayi
    for (int i = 0; i < (_passengerCounts['infant'] ?? 0); i++) {
      _passengers.add({
        'name': 'Bayi ${i + 1}',
        'id_type': 'KTP',
        'id_number': '',
      });
    }
  }

  // PERUBAHAN: Ubah metode addVehicle untuk menerima objek Vehicle
  void addVehicle(Vehicle vehicle) {
    _vehicles.add(vehicle);
    notifyListeners();
  }

  // PERUBAHAN: Buat metode compatibility untuk menerima Map
  void addVehicleFromMap(Map<String, dynamic> vehicleData) {
    // Buat objek Vehicle dari Map
    final vehicle = Vehicle(
      id: -1, // ID sementara
      bookingId: -1, // ID sementara
      userId: -1, // ID sementara
      type: vehicleData['type'] ?? 'MOTORCYCLE',
      licensePlate: vehicleData['license_plate'] ?? '',
      brand: vehicleData['brand'],
      model: vehicleData['model'],
      weight: vehicleData['weight'] != null ? 
          double.tryParse(vehicleData['weight'].toString()) : null,
      createdAt: DateTime.now().toIso8601String(),
      updatedAt: DateTime.now().toIso8601String(),
    );
    
    _vehicles.add(vehicle);
    notifyListeners();
  }

  // PERUBAHAN: Ubah metode updateVehicle untuk menerima objek Vehicle
  void updateVehicle(int index, Vehicle vehicle) {
    if (index >= 0 && index < _vehicles.length) {
      _vehicles[index] = vehicle;
      notifyListeners();
    }
  }

  // PERUBAHAN: Buat metode compatibility untuk update dari Map
  void updateVehicleFromMap(int index, Map<String, dynamic> vehicleData) {
    if (index >= 0 && index < _vehicles.length) {
      // Buat vehicle baru dengan data yang sudah diupdate
      final currentVehicle = _vehicles[index];
      final updatedVehicle = Vehicle(
        id: currentVehicle.id,
        bookingId: currentVehicle.bookingId,
        userId: currentVehicle.userId,
        type: vehicleData['type'] ?? currentVehicle.type,
        licensePlate: vehicleData['license_plate'] ?? currentVehicle.licensePlate,
        brand: vehicleData['brand'],
        model: vehicleData['model'],
        weight: vehicleData['weight'] != null ? 
            double.tryParse(vehicleData['weight'].toString()) : currentVehicle.weight,
        createdAt: currentVehicle.createdAt,
        updatedAt: DateTime.now().toIso8601String(),
      );
      
      _vehicles[index] = updatedVehicle;
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
    _passengerCounts = {'adult': 1, 'child': 0, 'infant': 0}; // Reset passenger counts
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

  // PERUBAHAN: Ubah createBooking untuk mendukung model Vehicle
  Future<bool> createBooking() async {
    if (_selectedSchedule == null ||
        _selectedDate == null ||
        totalPassengers == 0) {
      _errorMessage = 'Silakan lengkapi data pemesanan';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Konversi vehicles dari model class ke Map sesuai format API
      final List<Map<String, dynamic>> vehiclesMap = _vehicles.map((vehicle) => {
        'type': vehicle.type,
        'license_plate': vehicle.licensePlate,
        'brand': vehicle.brand,
        'model': vehicle.model,
        'weight': vehicle.weight,
      }).toList();

      // Buat data booking
      final Map<String, dynamic> bookingData = {
        'schedule_id': _selectedSchedule!.id,
        'booking_date': _selectedDate!.toIso8601String().split('T')[0],
        'passenger_count': totalPassengers,
        'vehicle_count': _vehicles.length,
        'passengers': _passengers,
        'passenger_categories': _passengerCounts,
        'vehicles': vehiclesMap,
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

  // Simpan metode pembayaran yang dipilih ke dalam objek booking
  void updatePaymentMethod(String paymentMethod, String paymentType) {
    if (_currentBooking != null) {
      _currentBooking!.paymentMethod = paymentMethod;
      _currentBooking!.paymentType = paymentType;
      notifyListeners();
    }
  }

  // Proses pembayaran dengan metode yang dipilih
  Future<bool> processPayment(
    String bookingCode,
    String paymentMethod,
    String paymentType,
  ) async {
    if (_currentBooking == null) {
      _errorMessage = 'Data pemesanan tidak ditemukan';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Simpan metode pembayaran yang dipilih
      updatePaymentMethod(paymentMethod, paymentType);

      // PERBAIKAN: Jika booking sementara, langsung return true
      if (_currentBooking!.id < 0) {
        _isLoading = false;
        notifyListeners();
        return true;
      }

      // Panggil API untuk memproses pembayaran
      final result = await _paymentApi.processPayment(
        bookingCode,
        paymentMethod,
        paymentType,
      );

      // Update booking setelah pembayaran diproses
      if (result.containsKey('booking_id') &&
          result['booking_id'] == _currentBooking!.id) {
        await getBookingDetails(_currentBooking!.id);
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

  // Dapatkan instruksi pembayaran
  Future<Map<String, dynamic>> getPaymentInstructions(
    String paymentMethod,
    String paymentType,
  ) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _paymentApi.getPaymentInstructions(
        paymentMethod,
        paymentType,
      );
      _isLoading = false;
      notifyListeners();
      return result;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();

      // PERBAIKAN: Return fallback instructions jika gagal get dari API
      return _getStaticInstructions(paymentMethod, paymentType);
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
      if (_currentBooking != null &&
          _currentBooking!.bookingCode == bookingCode) {
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

  // Instruksi pembayaran statis sebagai fallback
  Map<String, dynamic> _getStaticInstructions(String method, String type) {
    if (type == 'virtual_account') {
      switch (method.toLowerCase()) {
        case 'bca':
          return {
            'title': 'BCA Virtual Account',
            'steps': [
              'Buka aplikasi BCA Mobile atau m-BCA',
              'Pilih menu "m-Transfer" atau "Transfer"',
              'Pilih "BCA Virtual Account"',
              'Masukkan nomor Virtual Account',
              'Pastikan nama dan jumlah pembayaran sudah sesuai',
              'Masukkan PIN m-BCA atau password',
              'Transaksi selesai',
            ],
          };
        case 'bni':
          return {
            'title': 'BNI Virtual Account',
            'steps': [
              'Buka aplikasi BNI Mobile Banking',
              'Pilih menu "Transfer"',
              'Pilih "Virtual Account Billing"',
              'Masukkan nomor Virtual Account',
              'Pastikan nama dan jumlah pembayaran sudah sesuai',
              'Masukkan password transaksi',
              'Transaksi selesai',
            ],
          };
        // Tambahkan case untuk bank lain
        default:
          return {
            'title': 'Virtual Account',
            'steps': [
              'Buka aplikasi Mobile Banking',
              'Pilih menu Transfer/Pembayaran',
              'Pilih Virtual Account',
              'Masukkan nomor Virtual Account',
              'Konfirmasi detail pembayaran',
              'Masukkan PIN',
              'Transaksi selesai',
            ],
          };
      }
    } else if (type == 'e_wallet') {
      switch (method.toLowerCase()) {
        case 'gopay':
          return {
            'title': 'GoPay',
            'steps': [
              'Buka aplikasi Gojek',
              'Tap tombol "Scan QR"',
              'Scan QR Code yang ditampilkan di halaman pembayaran',
              'Pastikan nominal pembayaran sudah sesuai',
              'Tap tombol "Bayar"',
              'Masukkan PIN GoPay',
              'Transaksi selesai',
            ],
          };
        // Tambahkan case untuk e-wallet lain
        default:
          return {
            'title': 'E-wallet',
            'steps': [
              'Buka aplikasi E-wallet',
              'Pilih menu "Scan QR"',
              'Scan QR code yang ditampilkan',
              'Konfirmasi detail pembayaran',
              'Masukkan PIN',
              'Transaksi selesai',
            ],
          };
      }
    }

    return {
      'title': 'Instruksi Pembayaran',
      'steps': ['Mohon maaf, instruksi pembayaran tidak tersedia'],
    };
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}