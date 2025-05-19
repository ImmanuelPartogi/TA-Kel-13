import 'package:ferry_booking_app/models/schedule.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/route.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/providers/schedule_provider.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ScheduleSelectionScreen extends StatefulWidget {
  final FerryRoute route;

  const ScheduleSelectionScreen({Key? key, required this.route})
    : super(key: key);

  @override
  _ScheduleSelectionScreenState createState() =>
      _ScheduleSelectionScreenState();
}

class _ScheduleSelectionScreenState extends State<ScheduleSelectionScreen> {
  DateTime _selectedDate = DateTime.now();
  bool _forceRefresh = false;

  @override
  void initState() {
    super.initState();
    initializeDateFormatting('id_ID', null);
    _selectedDate = DateTime.now().toLocal();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      bookingProvider.setSelectedRoute(widget.route);
      _loadSchedules();
    });
  }

  void _showNoSchedulesMessage() {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Tidak ada jadwal tersedia untuk tanggal ini. Silakan pilih tanggal lain.',
          ),
          duration: Duration(seconds: 3),
        ),
      );
    }
  }

  String _formatDateForApi(DateTime date) {
    return DateFormat('yyyy-MM-dd').format(date);
  }

  void _selectSchedule(Schedule schedule) {
    final DateTime now = DateTime.now();
    final bool isToday =
        _selectedDate.year == now.year &&
        _selectedDate.month == now.month &&
        _selectedDate.day == now.day;

    if (isToday) {
      if (schedule.departureTime != null) {
        DateTime departureDateTime;
        if (schedule.departureTime is String) {
          final parts = schedule.departureTime.split(':');
          final hour = int.parse(parts[0]);
          final minute = parts.length > 1 ? int.parse(parts[1]) : 0;
          departureDateTime = DateTime(
            _selectedDate.year,
            _selectedDate.month,
            _selectedDate.day,
            hour,
            minute,
          );
        } else {
          final parts = schedule.departureTime.split(':');
          final hour = int.parse(parts[0]);
          final minute = parts.length > 1 ? int.parse(parts[1]) : 0;
          departureDateTime = DateTime(
            _selectedDate.year,
            _selectedDate.month,
            _selectedDate.day,
            hour,
            minute,
          );
        }

        if (departureDateTime.isBefore(now)) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Jadwal ini sudah lewat waktu keberangkatan'),
            ),
          );
          return;
        }
      }
    }

    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );
    bookingProvider.setSelectedSchedule(schedule);
    bookingProvider.setSelectedDate(_selectedDate);
    Navigator.pushNamed(context, '/booking/passengers');
  }

  Future<void> _loadSchedules() async {
    final scheduleProvider = Provider.of<ScheduleProvider>(
      context,
      listen: false,
    );
    try {
      setState(() {
        _forceRefresh = true;
      });
      
      final formattedDate = _formatDateForApi(_selectedDate);
      print('DEBUG: Loading schedules for date: $formattedDate');

      await scheduleProvider.getSchedulesByFormattedDate(
        widget.route.id,
        formattedDate,
      );

      // Filter jadwal yang sudah lewat jika hari ini
      if (isToday(_selectedDate) && (scheduleProvider.schedules?.isNotEmpty ?? false)) {
        // Jadwal akan difilter pada saat menampilkan, bukan melalui provider
        // Kita tidak perlu mengubah data di provider langsung
        print('DEBUG: Hari ini, jadwal akan difilter saat ditampilkan');
      }

      setState(() {
        _forceRefresh = false;
      });

      if (scheduleProvider.schedules?.isEmpty ?? true) {
        _showNoSchedulesMessage();
      }
    } catch (e) {
      print('ERROR: Failed to load schedules: $e');
      setState(() {
        _forceRefresh = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal memuat jadwal: $e')));
      }
    }
  }

  bool isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      locale: const Locale('id', 'ID'),
    );

    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });

      // Gunakan getSchedulesByFormattedDate untuk konsistensi
      _loadSchedules();
    }
  }

  Future<void> _findNextAvailableDate() async {
    final scheduleProvider = Provider.of<ScheduleProvider>(
      context,
      listen: false,
    );
    DateTime nextDate = _selectedDate.add(const Duration(days: 1));

    setState(() {
      _forceRefresh = true;
    });

    for (int i = 0; i < 7; i++) {
      final formattedDate = _formatDateForApi(nextDate);
      await scheduleProvider.getSchedulesByFormattedDate(widget.route.id, formattedDate);

      if (scheduleProvider.schedules?.isNotEmpty ?? false) {
        setState(() {
          _selectedDate = nextDate;
          _forceRefresh = false;
        });
        return;
      }

      nextDate = nextDate.add(const Duration(days: 1));
    }

    setState(() {
      _forceRefresh = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Tidak ditemukan jadwal dalam 7 hari ke depan'),
      ),
    );
  }

  Widget _buildScheduleCard(Schedule schedule) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _selectSchedule(schedule),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header dengan nama kapal dan status
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      schedule.ferry?.name ?? 'Kapal Ferry',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Colors.black87,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8, 
                        vertical: 2
                      ),
                      decoration: BoxDecoration(
                        color: _getStatusColor(schedule.status).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        _getStatusText(schedule.status),
                        style: TextStyle(
                          color: _getStatusColor(schedule.status),
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                // Waktu keberangkatan dan kedatangan
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Keberangkatan',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _formatISOTime(_selectedDate, schedule.departureTime),
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            widget.route.origin,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    // Panah
                    Icon(
                      Icons.arrow_forward,
                      color: Colors.grey.shade400,
                      size: 16,
                    ),
                    
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Kedatangan',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _formatISOTime(_selectedDate, schedule.arrivalTime),
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            widget.route.destination,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                // Info kapasitas
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildAvailabilityInfo(
                      icon: Icons.person_outline,
                      type: 'Penumpang',
                      count: schedule.availablePassenger ?? 0,
                    ),
                    _buildAvailabilityInfo(
                      icon: Icons.two_wheeler_outlined,
                      type: 'Motor',
                      count: schedule.availableMotorcycle ?? 0,
                    ),
                    _buildAvailabilityInfo(
                      icon: Icons.directions_car_outlined,
                      type: 'Mobil',
                      count: schedule.availableCar ?? 0,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
  
  Widget _buildAvailabilityInfo({
    required IconData icon,
    required String type,
    required int count,
  }) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: Colors.grey.shade600,
        ),
        const SizedBox(width: 4),
        Text(
          count > 0 ? "$count tersedia" : "Penuh",
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: count > 0 ? Colors.green : Colors.red,
          ),
        ),
      ],
    );
  }
  
  String _formatISOTime(DateTime date, String time) {
    if (time.isEmpty) return "00:00";
    
    // Parse waktu dari format HH:MM:SS
    final parts = time.split(':');
    if (parts.length < 2) return time;
    
    // Format dalam bentuk ISO dengan T seperti di gambar
    final formattedDate = DateFormat('yyyy-MM-dd').format(date);
    return "$formattedDate\T${parts[0]}:${parts[1]}";
  }
  
  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return Colors.green;
      case 'DELAYED':
        return Colors.orange;
      case 'CANCELLED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
  
  String _getStatusText(String status) {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'Aktif';
      case 'DELAYED':
        return 'Tertunda';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return 'Tidak Diketahui';
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final scheduleProvider = Provider.of<ScheduleProvider>(context);
    final schedules = scheduleProvider.schedules;
    final isLoading = scheduleProvider.isLoading || _forceRefresh;
    final theme = Theme.of(context);

    return Scaffold(
      body: Container(
        height: double.infinity,
        decoration: BoxDecoration(
          color: Colors.blue.shade50,
        ),
        child: Stack(
          children: [
            // Background elements
            Positioned(
              top: -100,
              right: -50,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.blue.shade100.withOpacity(0.5),
                ),
              ),
            ),
            Positioned(
              bottom: -100,
              left: -50,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.blue.shade100.withOpacity(0.5),
                ),
              ),
            ),
            
            // Main content
            SafeArea(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // App Bar
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: () => Navigator.pop(context),
                          child: const Icon(
                            Icons.chevron_left,
                            size: 28,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Text(
                            '${widget.route.origin} - ${widget.route.destination}',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(width: 28), // Balance the back button
                      ],
                    ),
                  ),
                  
                  // Tanggal Keberangkatan
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Text(
                      'Tanggal Keberangkatan',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: Colors.black87,
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 8),
                  
                  // Date Selector
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Material(
                        color: Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(12),
                          onTap: () => _selectDate(context),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.blue.shade50,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Icon(
                                    Icons.calendar_today_outlined,
                                    color: Colors.blue,
                                    size: 16,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      DateFormat(
                                        'EEEE',
                                        'id_ID',
                                      ).format(_selectedDate).capitalize(),
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey.shade700,
                                      ),
                                    ),
                                    Text(
                                      DateFormat(
                                        'd MMMM yyyy',
                                        'id_ID',
                                      ).format(_selectedDate),
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.black87,
                                      ),
                                    ),
                                  ],
                                ),
                                Spacer(),
                                Icon(
                                  Icons.keyboard_arrow_down,
                                  color: Colors.grey.shade600,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Schedule List
                  Expanded(
                    child: isLoading
                      ? const Center(
                          child: CircularProgressIndicator(),
                        )
                      : schedules == null || schedules.isEmpty
                        ? Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              // Centered icon
                              Center(
                                child: Icon(
                                  Icons.timer_off_outlined,
                                  size: 48,
                                  color: Colors.grey.shade400,
                                ),
                              ),
                              const SizedBox(height: 16),
                              // Text message
                              Center(
                                child: Text(
                                  'Tidak ada jadwal tersedia untuk tanggal ini',
                                  style: TextStyle(
                                    color: Colors.grey.shade700,
                                    fontSize: 14,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                              const SizedBox(height: 24),
                              // Buttons
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Expanded(
                                      child: ElevatedButton(
                                        onPressed: () => _selectDate(context),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.blue,
                                          foregroundColor: Colors.white,
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          padding: const EdgeInsets.symmetric(vertical: 12),
                                        ),
                                        child: Text('Pilih Tanggal Lain'),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: ElevatedButton(
                                        onPressed: () => _findNextAvailableDate(),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.green,
                                          foregroundColor: Colors.white,
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          padding: const EdgeInsets.symmetric(vertical: 12),
                                        ),
                                        child: Text('Cari Jadwal Terdekat'),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          )
                        : ListView.builder(
                            itemCount: schedules.length,
                            itemBuilder: (context, index) {
                              final schedule = schedules[index];
                              
                              // Filter jadwal yang sudah lewat jika hari ini
                              if (isToday(_selectedDate)) {
                                // Parse waktu keberangkatan
                                final parts = schedule.departureTime.split(':');
                                final hour = int.parse(parts[0]);
                                final minute = parts.length > 1 ? int.parse(parts[1]) : 0;
                                
                                // Buat objek datetime untuk perbandingan
                                final departureTime = DateTime(
                                  _selectedDate.year,
                                  _selectedDate.month,
                                  _selectedDate.day,
                                  hour,
                                  minute,
                                );
                                
                                // Jika jadwal sudah lewat, lewati
                                if (departureTime.isBefore(DateTime.now())) {
                                  // Skip jadwal yang sudah lewat
                                  return const SizedBox.shrink(); // Widget kosong
                                }
                              }
                              
                              return _buildScheduleCard(schedule);
                            },
                          ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Extension untuk mengkapitalisasi string (untuk nama hari)
extension StringExtension on String {
  String capitalize() {
    return "${this[0].toUpperCase()}${this.substring(1)}";
  }
}