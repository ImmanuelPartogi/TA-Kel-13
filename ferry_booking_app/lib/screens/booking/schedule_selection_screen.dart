import 'package:ferry_booking_app/models/schedule.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:ferry_booking_app/models/route.dart';
import 'package:ferry_booking_app/providers/booking_provider.dart';
import 'package:ferry_booking_app/providers/schedule_provider.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:ferry_booking_app/utils/date_time_helper.dart';

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
      try {
        final String formattedDate = _formatDateForApi(_selectedDate);
        // Gunakan DateTimeHelper untuk mendapatkan waktu keberangkatan
        final departureDateTime = DateTimeHelper.combineDateAndTime(
          formattedDate,
          schedule.departureTime,
        );

        // Cek apakah jadwal sudah lewat
        if (departureDateTime != null && departureDateTime.isBefore(now)) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Jadwal ini sudah lewat waktu keberangkatan'),
            ),
          );
          return;
        }
      } catch (e) {
        print('ERROR: Gagal memproses waktu keberangkatan: $e');
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
        return;
      }
    }

    try {
      final bookingProvider = Provider.of<BookingProvider>(
        context,
        listen: false,
      );
      bookingProvider.setSelectedSchedule(schedule);
      bookingProvider.setSelectedDate(_selectedDate);

      print('DEBUG: Navigasi ke halaman penumpang');
      Navigator.pushNamed(context, '/booking/passengers');
    } catch (e) {
      print('ERROR: Gagal navigasi ke halaman penumpang: $e');
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Gagal proses booking: $e')));
    }
  }

  Future<void> _loadSchedules({bool forceRefresh = true}) async {
    final scheduleProvider = Provider.of<ScheduleProvider>(
      context,
      listen: false,
    );
    try {
      // Format tanggal yang konsisten untuk API
      final formattedDate = DateFormat('yyyy-MM-dd').format(_selectedDate);
      print(
        'DEBUG: Loading schedules for date: $formattedDate with forceRefresh: $forceRefresh',
      );

      // Gunakan metode baru
      await scheduleProvider.getSchedulesByRoute(
        widget.route.id,
        formattedDate,
        forceRefresh: forceRefresh,
      );

      // Log untuk debugging
      print(
        'DEBUG: Loaded ${scheduleProvider.schedules?.length ?? 0} schedules',
      );

    } catch (e) {
      print('ERROR: Failed to load schedules: $e');
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Gagal memuat jadwal: $e')));
      }
    }
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

      // Gunakan metode loading yang konsisten
      await _loadSchedules(forceRefresh: true);
    }
  }

  Future<void> _findNextAvailableDate() async {
    final scheduleProvider = Provider.of<ScheduleProvider>(
      context,
      listen: false,
    );
    DateTime nextDate = _selectedDate.add(const Duration(days: 1));

    for (int i = 0; i < 7; i++) {
      await scheduleProvider.getSchedules(widget.route.id, nextDate);

      if (scheduleProvider.schedules?.isNotEmpty ?? false) {
        setState(() {
          _selectedDate = nextDate;
        });
        return;
      }

      nextDate = nextDate.add(const Duration(days: 1));
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Tidak ditemukan jadwal dalam 7 hari ke depan'),
      ),
    );
  }

  Widget _buildScheduleCard(Schedule schedule) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    // Calculate travel time
    Duration? travelDuration;
    int durationMinutes = 0;
    try {
      durationMinutes = DateTimeHelper.calculateDurationMinutes(
        schedule.departureTime,
        schedule.arrivalTime,
      );
      travelDuration = Duration(minutes: durationMinutes);
    } catch (e) {
      print('ERROR: Gagal menghitung durasi: $e');
    }

    final travelTime =
        durationMinutes > 0
            ? DateTimeHelper.formatDuration(durationMinutes)
            : '${widget.route.duration ?? 0} menit';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
            spreadRadius: 0,
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _selectSchedule(schedule),
          splashColor: Theme.of(context).primaryColor.withOpacity(0.1),
          highlightColor: Colors.transparent,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with status and ferry name
              _buildCardHeader(schedule),

              // Main content with time and availability info
              _buildCardContent(schedule, travelTime),

              // Footer with price and action
              _buildCardFooter(schedule, currencyFormat),
            ],
          ),
        ),
      ),
    );
  }

  // Card header with ferry name and status
  Widget _buildCardHeader(Schedule schedule) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Theme.of(context).primaryColor.withOpacity(0.05),
            Theme.of(context).primaryColor.withOpacity(0.02),
          ],
        ),
        border: Border(
          bottom: BorderSide(color: Colors.grey.shade100, width: 1),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.directions_ferry_rounded,
              color: Theme.of(context).primaryColor,
              size: 18,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  schedule.ferry?.name ?? 'Kapal Ferry',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Colors.black87,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  'Ferry ID: ${schedule.ferry?.registrationNumber ?? '-'}',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: _getStatusColor(schedule.status).withOpacity(0.08),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: _getStatusColor(schedule.status),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  _getStatusText(schedule.status),
                  style: TextStyle(
                    color: _getStatusColor(schedule.status),
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Card main content with time and route info
  Widget _buildCardContent(Schedule schedule, String travelTime) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Time information with origin & destination
          Row(
            children: [
              // Time and locations
              Expanded(
                child: Row(
                  children: [
                    // Vertical timeline with dots
                    Column(
                      children: [
                        Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            color: Theme.of(context).primaryColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                        Container(
                          width: 1,
                          height: 30,
                          color: Colors.grey.shade300,
                        ),
                        Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            color: Colors.red.shade400,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 12),

                    // Departure and arrival details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Departure
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _formatTime(schedule.departureTime),
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black87,
                                ),
                              ),
                              Text(
                                widget.route.origin,
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey.shade700,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                          const SizedBox(height: 18),
                          // Arrival
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _formatTime(schedule.arrivalTime),
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black87,
                                ),
                              ),
                              Text(
                                widget.route.destination,
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey.shade700,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Vertical divider
              Container(
                height: 60,
                width: 1,
                margin: const EdgeInsets.symmetric(horizontal: 20),
                color: Colors.grey.shade200,
              ),

              // Duration info
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Durasi',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(
                        Icons.access_time_rounded,
                        size: 16,
                        color: Theme.of(context).primaryColor,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        travelTime,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Availability information
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade200, width: 1),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Ketersediaan',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey.shade700,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildAvailabilityItem(
                      icon: Icons.person,
                      label: 'Penumpang',
                      available: schedule.availablePassenger ?? 0,
                      total: schedule.ferry?.capacityPassenger ?? 0,
                    ),
                    _buildAvailabilityItem(
                      icon: Icons.two_wheeler,
                      label: 'Motor',
                      available: schedule.availableMotorcycle ?? 0,
                      total: schedule.ferry?.capacityVehicleMotorcycle ?? 0,
                    ),
                    _buildAvailabilityItem(
                      icon: Icons.directions_car,
                      label: 'Mobil',
                      available: schedule.availableCar ?? 0,
                      total: schedule.ferry?.capacityVehicleCar ?? 0,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Card footer with price and action button
  Widget _buildCardFooter(Schedule schedule, NumberFormat currencyFormat) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        border: Border(top: BorderSide(color: Colors.grey.shade200, width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Price information
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Mulai dari',
                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              ),
              Text(
                currencyFormat.format(widget.route.basePrice ?? 0),
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).primaryColor,
                ),
              ),
            ],
          ),

          // Action button
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Theme.of(context).primaryColor,
                  Color.fromARGB(255, 36, 107, 253),
                ],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: BorderRadius.circular(30),
              boxShadow: [
                BoxShadow(
                  color: Theme.of(context).primaryColor.withOpacity(0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => _selectSchedule(schedule),
                borderRadius: BorderRadius.circular(30),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 10,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Pilih',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        Icons.arrow_forward_rounded,
                        color: Colors.white,
                        size: 16,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvailabilityItem({
    required IconData icon,
    required String label,
    required int available,
    required int total,
  }) {
    final double percentage = total > 0 ? available / total : 0;
    final bool isEmpty = available <= 0;

    Color statusColor;
    if (isEmpty) {
      statusColor = Colors.red;
    } else if (percentage < 0.3) {
      statusColor = Colors.orange;
    } else {
      statusColor = Colors.green;
    }

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.08),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 20, color: statusColor),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '$available',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: statusColor,
              ),
            ),
            Text(
              '/$total',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCapacityBadge({
    required String label,
    required int available,
    required int total,
    required IconData icon,
  }) {
    final bool isAvailable = available > 0;
    final double percentage = total > 0 ? available / total : 0;

    Color color;
    if (percentage > 0.5) {
      color = Colors.green;
    } else if (percentage > 0.2) {
      color = Colors.orange;
    } else if (percentage > 0) {
      color = Colors.deepOrange;
    } else {
      color = Colors.red;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: isAvailable ? color.withOpacity(0.1) : Colors.red.shade50,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: isAvailable ? color : Colors.red),
          const SizedBox(width: 4),
          Text(
            '$available',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isAvailable ? color : Colors.red,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvailabilityIndicator({
    required bool isAvailable,
    required int count,
    required IconData icon,
    required Color color,
    required int total,
  }) {
    final double percentage = total > 0 ? count / total : 0;
    final Color displayColor = isAvailable ? color : Colors.red.shade300;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: displayColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: displayColor.withOpacity(0.3), width: 1),
      ),
      child: Row(
        children: [
          Icon(icon, size: 14, color: displayColor),
          const SizedBox(width: 4),
          Text(
            '$count',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: displayColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCapacityInfo({
    required IconData icon,
    required String label,
    required int available,
  }) {
    return Column(
      children: [
        Icon(
          icon,
          color:
              available > 0
                  ? Theme.of(context).primaryColor
                  : Colors.grey.shade400,
          size: 22,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
        ),
        const SizedBox(height: 2),
        Text(
          available > 0 ? '$available tersedia' : 'Penuh',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: available > 0 ? Colors.green : Colors.red,
          ),
        ),
      ],
    );
  }

  String _formatTime(String time) {
    return DateTimeHelper.formatTime(time);
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
      case 'AVAILABLE':
        return 'Tersedia';
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
    final bookingProvider = Provider.of<BookingProvider>(
      context,
      listen: false,
    );
    final schedules = scheduleProvider.schedules;
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Container(
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
            colors: [
              Colors.white,
              Colors.blue.shade50,
              Colors.blue.shade100.withOpacity(0.4),
            ],
          ),
        ),
        child: Stack(
          children: [
            // Elemen background
            Positioned(
              top: -50,
              right: -50,
              child: Container(
                width: 180,
                height: 180,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.primaryColor.withOpacity(0.1),
                ),
              ),
            ),
            Positioned(
              bottom: -80,
              left: -80,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.primaryColor.withOpacity(0.1),
                ),
              ),
            ),

            // Ikon perahu kecil di background
            Positioned(
              top: size.height * 0.15,
              left: size.width * 0.1,
              child: Icon(
                Icons.sailing_outlined,
                size: 20,
                color: theme.primaryColor.withOpacity(0.2),
              ),
            ),
            Positioned(
              top: size.height * 0.3,
              right: size.width * 0.15,
              child: Icon(
                Icons.directions_boat_outlined,
                size: 25,
                color: theme.primaryColor.withOpacity(0.15),
              ),
            ),
            Positioned(
              bottom: size.height * 0.25,
              left: size.width * 0.2,
              child: Icon(
                Icons.directions_boat_filled_outlined,
                size: 22,
                color: theme.primaryColor.withOpacity(0.1),
              ),
            ),

            // Konten utama
            SafeArea(
              child: Column(
                children: [
                  // Custom App Bar
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.arrow_back_ios_rounded),
                          onPressed: () => Navigator.pop(context),
                          color: Colors.black87,
                        ),
                        Expanded(
                          child: Text(
                            '${widget.route.origin} - ${widget.route.destination}',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(width: 48), // Balance the back button
                      ],
                    ),
                  ),

                  // Date Selector
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Tanggal Keberangkatan',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.03),
                                blurRadius: 10,
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            borderRadius: BorderRadius.circular(16),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () => _selectDate(context),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                  vertical: 16,
                                ),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                            color: theme.primaryColor
                                                .withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(
                                              10,
                                            ),
                                          ),
                                          child: Icon(
                                            Icons.calendar_today_rounded,
                                            color: theme.primaryColor,
                                            size: 20,
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              DateFormat(
                                                'EEEE',
                                                'id_ID',
                                              ).format(_selectedDate),
                                              style: TextStyle(
                                                fontSize: 14,
                                                color: Colors.grey.shade600,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              DateFormat(
                                                'd MMMM yyyy',
                                                'id_ID',
                                              ).format(_selectedDate),
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.black87,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    Icon(
                                      Icons.arrow_drop_down,
                                      color: theme.primaryColor,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Schedules List
                  Expanded(
                    child: RefreshIndicator(
                      onRefresh: () => _loadSchedules(forceRefresh: true),
                      color: theme.primaryColor,
                      child:
                          scheduleProvider.isLoading
                              ? Center(
                                child: CircularProgressIndicator(
                                  color: theme.primaryColor,
                                ),
                              )
                              : schedules == null || schedules.isEmpty
                              ? ListView(
                                // Ganti Center dengan ListView untuk support pull-to-refresh
                                physics: const AlwaysScrollableScrollPhysics(),
                                children: [
                                  SizedBox(height: size.height * 0.2),
                                  Center(
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          Icons.timer_off,
                                          size: 64,
                                          color: Colors.grey[400],
                                        ),
                                        const SizedBox(height: 16),
                                        Text(
                                          'Tidak ada jadwal tersedia untuk tanggal ini',
                                          style: TextStyle(
                                            color: Colors.grey[600],
                                            fontSize: 16,
                                          ),
                                        ),
                                        const SizedBox(height: 16),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            ElevatedButton(
                                              onPressed:
                                                  () => _selectDate(context),
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor:
                                                    theme.primaryColor,
                                                foregroundColor: Colors.white,
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      horizontal: 16,
                                                      vertical: 12,
                                                    ),
                                                shape: RoundedRectangleBorder(
                                                  borderRadius:
                                                      BorderRadius.circular(16),
                                                ),
                                              ),
                                              child: const Text(
                                                'Pilih Tanggal Lain',
                                              ),
                                            ),
                                            const SizedBox(width: 12),
                                            ElevatedButton(
                                              onPressed:
                                                  () =>
                                                      _findNextAvailableDate(),
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: Colors.green,
                                                foregroundColor: Colors.white,
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      horizontal: 16,
                                                      vertical: 12,
                                                    ),
                                                shape: RoundedRectangleBorder(
                                                  borderRadius:
                                                      BorderRadius.circular(16),
                                                ),
                                              ),
                                              child: const Text(
                                                'Cari Jadwal Terdekat',
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              )
                              : ListView.builder(
                                padding: const EdgeInsets.all(24.0),
                                itemCount: schedules.length,
                                itemBuilder: (context, index) {
                                  final schedule = schedules[index];
                                  return _buildScheduleCard(schedule);
                                },
                              ),
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
