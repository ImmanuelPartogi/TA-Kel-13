import 'package:ferry_booking_app/services/payment_polling_service.dart';
import 'package:flutter/material.dart';
import '../api/booking_api.dart';
import '../api/payment_api.dart';
import '../models/booking.dart';
import '../models/ferry.dart';
import '../models/route.dart';
import '../models/schedule.dart';
import '../models/vehicle.dart';
import '../models/vehicle_category.dart';
import '../models/payment.dart';
import '../services/api_service.dart';
import 'dart:developer' as developer;

class BookingProvider extends ChangeNotifier {
  final BookingApi _bookingApi = BookingApi();
  final PaymentApi _paymentApi = PaymentApi();
  final PaymentPollingService _paymentPollingService = PaymentPollingService();
  final ApiService _apiService = ApiService();

  bool _isLoading = false;
  String? _errorMessage;

  // Selected booking data
  FerryRoute? _selectedRoute;
  Schedule? _selectedSchedule;
  DateTime? _selectedDate;
  List<Map<String, dynamic>> _passengers = [];
  List<Vehicle> _vehicles = [];
  Map<String, int> _passengerCounts = {'adult': 1, 'child': 0, 'infant': 0};
  Map<String, dynamic>? _pendingBookingData;
  Map<String, dynamic>? get pendingBookingData => _pendingBookingData;

  // Booking results
  List<Booking>? _bookings;
  Booking? _currentBooking;

  // Tambahkan property untuk menyimpan kategori kendaraan
  List<VehicleCategory> _vehicleCategories = [];
  List<VehicleCategory> get vehicleCategories => _vehicleCategories;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  FerryRoute? get selectedRoute => _selectedRoute;
  Schedule? get selectedSchedule => _selectedSchedule;
  DateTime? get selectedDate => _selectedDate;
  List<Map<String, dynamic>> get passengers => _passengers;
  List<Vehicle> get vehicles => _vehicles;
  Map<String, int> get passengerCounts => _passengerCounts;

  List<Booking>? get bookings => _bookings;
  Booking? get currentBooking => _currentBooking;

  // Constructor - Fetch kategori kendaraan saat provider dibuat
  BookingProvider() {
    fetchVehicleCategories();
  }

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
    total +=
        (_passengerCounts['child'] ?? 0) * (_selectedRoute!.basePrice * 0.75);
    // Bayi biasanya dengan biaya minimal
    total +=
        (_passengerCounts['infant'] ?? 0) * (_selectedRoute!.basePrice * 0.1);

    return total;
  }

  double get vehicleCost {
    if (_selectedRoute == null || _vehicles.isEmpty) return 0.0;

    double total = 0.0;
    for (var vehicle in _vehicles) {
      // Cara 1: Gunakan vehicle_category_id untuk mendapatkan harga dari kategori
      final category = _vehicleCategories.firstWhere(
        (cat) => cat.id == vehicle.vehicle_category_id,
        orElse:
            () =>
                _vehicleCategories.isNotEmpty
                    ? _vehicleCategories.first
                    : throw Exception('No VehicleCategory found'),
      );

      if (category != null) {
        total += category.basePrice;
        print(
          'Calculating price for vehicle ${vehicle.licensePlate}: ${category.basePrice}',
        );
      } else {
        // Cara 2: Fallback ke getVehiclePriceByType jika kategori tidak ditemukan
        double price = _selectedRoute!.getVehiclePriceByType(vehicle.type);
        total += price;
        print('Fallback price for vehicle ${vehicle.licensePlate}: $price');
      }
    }
    print('Total vehicle cost: $total');
    return total;
  }

  double get totalCost => passengerCost + vehicleCost;

  bool get hasActiveBooking => _currentBooking != null;

  // Metode untuk mengambil data kategori kendaraan dari API
  Future<void> fetchVehicleCategories() async {
    try {
      final response = await _apiService.get('vehicle-categories');

      if (response['success'] == true && response['data'] != null) {
        final List<dynamic> categoriesData = response['data'];
        _vehicleCategories.clear();
        _vehicleCategories.addAll(
          categoriesData.map((data) => VehicleCategory.fromJson(data)).toList(),
        );
        developer.log(
          'Fetched ${_vehicleCategories.length} vehicle categories',
        );
        notifyListeners();
      } else {
        developer.log(
          'Failed to fetch vehicle categories: ${response['message']}',
        );
      }
    } catch (e) {
      developer.log('Error fetching vehicle categories: $e');
    }
  }

  // Metode helper untuk mendapatkan kategori berdasarkan tipe
  VehicleCategory? _getCategoryByType(String type) {
    try {
      // Coba temukan kategori aktif dengan tipe yang sesuai
      return _vehicleCategories.firstWhere(
        (category) => category.vehicleType == type && category.isActive,
      );
    } catch (e) {
      // Jika tidak ditemukan kategori aktif, coba kategori apa saja dengan tipe yang sama
      try {
        return _vehicleCategories.firstWhere(
          (category) => category.vehicleType == type,
        );
      } catch (e) {
        // Jika masih tidak ditemukan, gunakan kategori pertama yang aktif
        try {
          return _vehicleCategories.firstWhere((category) => category.isActive);
        } catch (e) {
          // Jika tidak ada kategori yang aktif, gunakan kategori pertama saja
          return _vehicleCategories.isNotEmpty
              ? _vehicleCategories.first
              : null;
        }
      }
    }
  }

  // Mendapatkan ID kategori kendaraan berdasarkan tipe
  int getVehicleCategoryIdByType(String type) {
    final category = _getCategoryByType(type);
    if (category != null) {
      return category.id;
    }

    // Jika kategori kosong, coba fetch data
    if (_vehicleCategories.isEmpty) {
      fetchVehicleCategories();
    }

    // Default ID (sebaiknya sesuaikan dengan data Anda)
    return 1;
  }

  String _getValidVehicleType(String originalType) {
    final validTypes = {
      'MOTORCYCLE': 'MOTORCYCLE',
      'CAR': 'CAR',
      'BUS': 'BUS',
      'TRUCK': 'TRUCK',
      // Ubah PICKUP menjadi TRUCK karena server tidak menerima PICKUP
      'PICKUP': 'TRUCK',
      'TRONTON': 'TRONTON',
    };
    return validTypes[originalType] ?? 'MOTORCYCLE';
  }

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
        departureDate:
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

    // Load vehicle categories dari rute jika tersedia
    if (route.vehicleCategories != null &&
        route.vehicleCategories!.isNotEmpty) {
      _vehicleCategories = route.vehicleCategories!;
      print(
        'Loaded ${_vehicleCategories.length} vehicle categories from route',
      );
    } else if (_vehicleCategories.isEmpty) {
      // Jika tidak ada, fetch dari API
      fetchVehicleCategories();
    }

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

  // Add vehicle
  void addVehicle(Vehicle vehicle) {
    _vehicles.add(vehicle);
    notifyListeners();
  }

  // Backward compatibility - DIPERBARUI untuk menambahkan vehicle_category_id
  void addVehicleFromMap(Map<String, dynamic> vehicleData) {
    // Tipe default MOTORCYCLE
    final String type = vehicleData['type'] ?? 'MOTORCYCLE';

    // Cari kategori yang sesuai berdasarkan tipe
    final VehicleCategory? category = _getCategoryByType(type);

    // Jika kategori tidak ditemukan dan daftar kategori kosong, fetch data kategori
    if (category == null && _vehicleCategories.isEmpty) {
      fetchVehicleCategories().then((_) {
        // Coba lagi setelah fetch
        addVehicleFromMap(vehicleData);
      });
      return;
    }

    // Gunakan kategori ID dari data, atau dari kategori yang ditemukan, atau default
    final int categoryId =
        vehicleData['vehicle_category_id'] ??
        category?.id ??
        getVehicleCategoryIdByType(type);

    final vehicle = Vehicle(
      id: -1,
      bookingId: -1,
      userId: -1,
      type: type,
      vehicle_category_id: categoryId, // Gunakan ID kategori
      licensePlate: vehicleData['license_plate'] ?? '',
      brand: vehicleData['brand'],
      model: vehicleData['model'],
      weight:
          vehicleData['weight'] != null
              ? double.tryParse(vehicleData['weight'].toString())
              : null,
      createdAt: DateTime.now().toIso8601String(),
      updatedAt: DateTime.now().toIso8601String(),
    );

    _vehicles.add(vehicle);
    notifyListeners();
  }

  // Update vehicle
  void updateVehicle(int index, Vehicle vehicle) {
    if (index >= 0 && index < _vehicles.length) {
      _vehicles[index] = vehicle;
      notifyListeners();
    }
  }

  // Backward compatibility - DIPERBARUI untuk menambahkan vehicle_category_id
  void updateVehicleFromMap(int index, Map<String, dynamic> vehicleData) {
    if (index >= 0 && index < _vehicles.length) {
      final currentVehicle = _vehicles[index];

      // Gunakan type yang baru jika ada, atau yang saat ini jika tidak ada
      final String type = vehicleData['type'] ?? currentVehicle.type;

      // Gunakan category_id dari data jika ada
      // Jika tidak, gunakan yang saat ini, atau dapatkan dari kategori berdasarkan tipe
      final int categoryId =
          vehicleData['vehicle_category_id'] ??
          currentVehicle.vehicle_category_id;

      final updatedVehicle = Vehicle(
        id: currentVehicle.id,
        bookingId: currentVehicle.bookingId,
        userId: currentVehicle.userId,
        type: type,
        vehicle_category_id: categoryId, // Gunakan ID kategori
        licensePlate:
            vehicleData['license_plate'] ?? currentVehicle.licensePlate,
        brand: vehicleData['brand'] ?? currentVehicle.brand,
        model: vehicleData['model'] ?? currentVehicle.model,
        weight:
            vehicleData['weight'] != null
                ? double.tryParse(vehicleData['weight'].toString())
                : currentVehicle.weight,
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
    _passengerCounts = {'adult': 1, 'child': 0, 'infant': 0};
    _currentBooking = null;
    notifyListeners();
  }

  // Metode untuk memulai polling otomatis
  void startPaymentPolling(String bookingCode) {
    _paymentPollingService.startPolling(bookingCode);

    _paymentPollingService.getStatusStream(bookingCode).listen((update) {
      // Update status booking jika ada perubahan
      if (!update.isError &&
          _currentBooking != null &&
          _currentBooking!.bookingCode == bookingCode) {
        // Update status di memory
        _currentBooking!.status = update.bookingStatus;

        // Update payment status jika ada
        if (_currentBooking!.latestPayment != null) {
          _currentBooking!.latestPayment!.status = update.paymentStatus;
        }

        notifyListeners();
      }
    });
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
    if (_isLoading) return;

    _isLoading = true;
    // Jangan panggil notifyListeners() di sini

    try {
      _currentBooking = await _bookingApi.getBookingDetails(bookingId);
      _isLoading = false;
      _errorMessage = null;

      // Gunakan microtask agar notifyListeners() dipanggil setelah build selesai
      Future.microtask(() {
        notifyListeners();
      });
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();

      // Gunakan microtask agar notifyListeners() dipanggil setelah build selesai
      Future.microtask(() {
        notifyListeners();
      });
    }
  }

  // DIUBAH: Create booking tidak digunakan lagi dari BookingSummaryScreen
  // tetapi tetap tersedia untuk backward compatibility
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
      // Konversi vehicles ke Map
      final List<Map<String, dynamic>> vehiclesMap =
          _vehicles
              .map(
                (vehicle) => {
                  'type': vehicle.type,
                  'vehicle_category_id':
                      vehicle
                          .vehicle_category_id, // Tambahkan vehicle_category_id
                  'license_plate': vehicle.licensePlate,
                  'brand': vehicle.brand,
                  'model': vehicle.model,
                  'weight': vehicle.weight,
                },
              )
              .toList();

      // Buat data booking
      final Map<String, dynamic> bookingData = {
        'schedule_id': _selectedSchedule!.id,
        'departure_date': _selectedDate!.toIso8601String().split('T')[0],
        'passenger_count': totalPassengers,
        'vehicle_count': _vehicles.length,
        'passengers': _passengers,
        'passenger_categories': _passengerCounts,
        'vehicles': vehiclesMap,
      };

      developer.log('Memanggil createBooking API');
      final result = await _bookingApi.createBooking(bookingData);

      // Set current booking
      if (result != null && result['booking'] != null) {
        _currentBooking = result['booking'];

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = 'Respons booking tidak valid';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // TAMBAHAN: Metode untuk menyiapkan data booking tanpa mengirim ke API
  Future<bool> prepareBooking() async {
    if (_selectedSchedule == null ||
        _selectedDate == null ||
        totalPassengers == 0) {
      _errorMessage = 'Silakan lengkapi data pemesanan';
      notifyListeners();
      return false;
    }

    try {
      // Konversi vehicles ke Map
      final List<Map<String, dynamic>> vehiclesMap =
          _vehicles
              .map(
                (vehicle) => {
                  'type': _getValidVehicleType(
                    vehicle.type,
                  ), // Gunakan fungsi validasi
                  'vehicle_category_id': vehicle.vehicle_category_id,
                  'license_plate': vehicle.licensePlate,
                  'brand': vehicle.brand,
                  'model': vehicle.model,
                  'weight': vehicle.weight,
                },
              )
              .toList();

      // Simpan data booking sementara tanpa kirim ke API
      _pendingBookingData = {
        'schedule_id': _selectedSchedule!.id,
        'departure_date': _selectedDate!.toIso8601String().split('T')[0],
        'passenger_count': totalPassengers,
        'vehicle_count': _vehicles.length,
        'passengers': _passengers,
        'passenger_categories': _passengerCounts,
        'vehicles': vehiclesMap,
      };

      developer.log('Data booking sementara disiapkan: $_pendingBookingData');

      // Buat objek booking sementara untuk UI
      _currentBooking = Booking(
        id: -1, // ID sementara
        bookingCode: 'TEMP-${DateTime.now().millisecondsSinceEpoch}',
        userId: -1,
        scheduleId: _selectedSchedule!.id,
        departureDate: _selectedDate!.toIso8601String().split('T')[0],
        passengerCount: totalPassengers,
        vehicleCount: _vehicles.length,
        totalAmount: totalCost,
        status: 'DRAFT',
        bookedBy: 'MOBILE',
        createdAt: DateTime.now().toIso8601String(),
        schedule: _selectedSchedule,
      );

      notifyListeners();
      return true;
    } catch (e) {
      developer.log('Error dalam prepareBooking: $e');
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // TAMBAHAN: Metode untuk membuat booking dengan metode pembayaran
  Future<bool> submitBookingWithPayment(
    String paymentMethod,
    String paymentType,
  ) async {
    if (_pendingBookingData == null) {
      _errorMessage = 'Data pemesanan tidak ditemukan';
      notifyListeners();
      return false;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      developer.log(
        'Mengirim booking dengan metode pembayaran: $paymentMethod, $paymentType',
      );

      // Tambahkan info metode pembayaran ke data booking
      final Map<String, dynamic> completeBookingData = {
        ..._pendingBookingData!,
        'payment_method': paymentMethod,
        'payment_type': paymentType,
      };

      // Kirim ke API sekarang
      final result = await _bookingApi.createBooking(completeBookingData);

      // Set current booking
      if (result != null && result['booking'] != null) {
        _currentBooking = result['booking'];
        developer.log('Booking sukses dibuat: ${_currentBooking!.bookingCode}');

        // Clear pending data karena sudah disubmit
        _pendingBookingData = null;

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = 'Respons booking tidak valid';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      developer.log('Error dalam submitBookingWithPayment: $e');
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Request refund untuk booking yang sudah dibayar
  Future<Map<String, dynamic>> requestRefund(
    int bookingId,
    String reason,
    String bankName,
    String bankAccountName,
    String bankAccountNumber,
  ) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final refundData = {
        'reason': reason,
        'bank_name': bankName,
        'bank_account_name': bankAccountName,
        'bank_account_number': bankAccountNumber,
      };

      try {
        // Coba minta refund
        await _bookingApi.requestRefund(bookingId, refundData);

        // Update current booking if it's the refunded one
        if (_currentBooking != null && _currentBooking!.id == bookingId) {
          _currentBooking = await _bookingApi.getBookingDetails(bookingId);
        }

        // Update bookings list if it exists
        if (_bookings != null) {
          await getBookings();
        }

        _isLoading = false;
        notifyListeners();

        // Return Map dengan informasi tambahan
        return {
          'success': true,
          'requires_manual_process':
              true, // Default true untuk memastikan pesan yang tepat
        };
      } catch (e) {
        _isLoading = false;
        _errorMessage = e.toString();
        notifyListeners();
        return {'success': false, 'error': e.toString()};
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return {'success': false, 'error': e.toString()};
    }
  }

  // Get refund details
  Future<Map<String, dynamic>> getRefundDetails(int bookingId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _bookingApi.getRefundDetails(bookingId);
      _isLoading = false;
      notifyListeners();
      return result;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return {};
    }
  }

  // Simpan metode pembayaran yang dipilih ke dalam objek booking
  void updatePaymentMethod(String paymentMethod, String paymentType) {
    try {
      developer.log('Updating payment method to: $paymentMethod, $paymentType');

      if (_currentBooking != null) {
        developer.log(
          'Current booking before update: ${_currentBooking!.bookingCode}',
        );

        // Set nilai dengan null safety
        _currentBooking!.paymentMethod = paymentMethod;
        _currentBooking!.paymentType = paymentType;

        developer.log('Payment method updated successfully');
        notifyListeners();
      } else {
        developer.log(
          'Warning: currentBooking is null when trying to update payment method',
        );

        // Coba buat booking sementara sebagai fallback
        createTemporaryBooking();

        // Coba update lagi jika booking sekarang ada
        if (_currentBooking != null) {
          _currentBooking!.paymentMethod = paymentMethod;
          _currentBooking!.paymentType = paymentType;
          developer.log(
            'Payment method updated after creating temporary booking',
          );
          notifyListeners();
        } else {
          developer.log(
            'Failed to create temporary booking, cannot update payment method',
          );
          _errorMessage =
              'Tidak dapat mengupdate metode pembayaran: Booking tidak ditemukan';
        }
      }
    } catch (e) {
      developer.log('Error in updatePaymentMethod: $e');
      _errorMessage = 'Error saat mengupdate metode pembayaran: $e';
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
      developer.log('Memproses pembayaran untuk booking: $bookingCode');
      developer.log('Metode pembayaran: $paymentMethod, Tipe: $paymentType');

      // Simpan metode pembayaran yang dipilih
      updatePaymentMethod(paymentMethod, paymentType);

      // Panggil API untuk memproses pembayaran langsung
      final result = await _paymentApi.processPayment(
        bookingCode,
        paymentMethod,
        paymentType,
      );

      developer.log('Payment API result: $result');

      // PERBAIKAN: Update payment details dari hasil API
      if (_currentBooking!.latestPayment != null) {
        _currentBooking!.latestPayment!.updateFromApiResponse(result);
      } else {
        // Jika belum ada payment object, buat berdasarkan response
        final payment = Payment(
          id: result['payment_id'] ?? -1,
          bookingId: _currentBooking!.id,
          amount: _currentBooking!.totalAmount,
          status: result['status'] ?? 'PENDING',
          paymentMethod:
              result['payment_method'] ?? paymentMethod.toUpperCase(),
          paymentType: result['payment_channel'] ?? paymentType,
          virtualAccountNumber: result['virtual_account_number'],
          qrCodeUrl: result['qr_code_url'],
          deepLinkUrl: result['deep_link_url'],
          expiryTime:
              result['expiry_date'] != null
                  ? DateTime.tryParse(result['expiry_date']) ??
                      DateTime.now().add(const Duration(minutes: 5))
                  : DateTime.now().add(const Duration(minutes: 5)),
          createdAt: DateTime.now().toIso8601String(),
          updatedAt: DateTime.now().toIso8601String(),
          rawData: result,
        );

        // _currentBooking!.latestPayment = payment;
      }

      // Log payment details untuk debugging
      developer.log('Payment details updated:');
      developer.log(
        '- VA Number: ${_currentBooking!.latestPayment?.virtualAccountNumber}',
      );
      developer.log(
        '- QR Code URL: ${_currentBooking!.latestPayment?.qrCodeUrl}',
      );
      developer.log(
        '- Deep Link URL: ${_currentBooking!.latestPayment?.deepLinkUrl}',
      );
      developer.log(
        '- Expiry Time: ${_currentBooking!.latestPayment?.expiryTime}',
      );

      // PERBAIKAN: Refresh booking data untuk memastikan sinkronisasi
      try {
        await getBookingDetails(_currentBooking!.id);
      } catch (e) {
        developer.log('Warning: Failed to refresh booking details: $e');
        // Tidak perlu throw error, payment sudah berhasil
      }

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      developer.log('Error dalam processPayment: $e');
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

      // PERBAIKAN: Validate dan normalize struktur instruksi
      if (result is Map<String, dynamic>) {
        // Pastikan ada field 'steps' untuk kompatibilitas
        if (!result.containsKey('steps')) {
          // Jika ada qr_code_steps atau deeplink_steps, gunakan yang pertama tersedia
          if (result.containsKey('qr_code_steps') &&
              result['qr_code_steps'] is List) {
            result['steps'] = result['qr_code_steps'];
          } else if (result.containsKey('deeplink_steps') &&
              result['deeplink_steps'] is List) {
            result['steps'] = result['deeplink_steps'];
          } else {
            // Fallback ke steps kosong
            result['steps'] = [];
          }
        }

        return result;
      }

      // Fallback jika response tidak valid
      return _getStaticInstructions(paymentMethod, paymentType);
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();

      // Fallback instructions jika gagal get dari API
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

  // Metode untuk memeriksa status satu kali
  Future<bool> refreshPaymentStatus(String bookingCode) async {
    try {
      developer.log('Refreshing payment status for: $bookingCode');

      // Cek menggunakan polling service untuk mendapatkan update terbaru
      final update = await _paymentPollingService.checkPaymentOnce(bookingCode);

      if (!update.isError &&
          _currentBooking != null &&
          _currentBooking!.bookingCode == bookingCode) {
        // Update status di memory
        final previousStatus = _currentBooking!.status;
        final previousPaymentStatus = _currentBooking!.latestPayment?.status;

        _currentBooking!.status = update.bookingStatus;
        if (_currentBooking!.latestPayment != null) {
          _currentBooking!.latestPayment!.status = update.paymentStatus;
        }

        // Log jika ada perubahan status
        if (previousStatus != update.bookingStatus ||
            previousPaymentStatus != update.paymentStatus) {
          developer.log(
            'Status updated: Booking: $previousStatus -> ${update.bookingStatus}, Payment: $previousPaymentStatus -> ${update.paymentStatus}',
          );
        }

        notifyListeners();
      }

      return !update.isError;
    } catch (e) {
      developer.log('Error refreshing payment status: $e');
      return false;
    }
  }

  void stopPaymentPolling(String bookingCode) {
    _paymentPollingService.stopPolling(bookingCode);
  }

  // Pastikan untuk memanggil dispose saat provider dibersihkan
  @override
  void dispose() {
    _paymentPollingService.dispose();
    super.dispose();
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
