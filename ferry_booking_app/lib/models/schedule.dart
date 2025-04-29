import 'ferry.dart';
import 'route.dart';

class Schedule {  
  final int id;
  final int routeId;
  final int ferryId;
  final String departureTime;
  final String arrivalTime;
  final String days;
  final String status;
  final String? statusReason;
  final Ferry? ferry;
  final FerryRoute? route;
  final int? availablePassenger;
  final int? availableMotorcycle;
  final int? availableCar;
  final int? availableBus;
  final int? availableTruck;
  final String? scheduleDateStatus;

  Schedule({
    required this.id,
    required this.routeId,
    required this.ferryId,
    required this.departureTime,
    required this.arrivalTime,
    required this.days,
    required this.status,
    this.statusReason,
    this.ferry,
    this.route,
    this.availablePassenger,
    this.availableMotorcycle,
    this.availableCar,
    this.availableBus,
    this.availableTruck,
    this.scheduleDateStatus,
  });

  factory Schedule.fromJson(Map<String, dynamic> json) {
    try {
      return Schedule(
        id: json['id'] ?? 0,
        routeId: json['route_id'] ?? 0,
        ferryId: json['ferry_id'] ?? 0,
        departureTime: json['departure_time'] ?? "00:00:00",
        arrivalTime: json['arrival_time'] ?? "00:00:00",
        days: json['days'] ?? "",
        status: json['status'] ?? "UNKNOWN",
        statusReason: json['status_reason'],
        ferry: json['ferry'] != null ? Ferry.fromJson(json['ferry']) : null,
        route:
            json['route'] != null ? FerryRoute.fromJson(json['route']) : null,
        // Pastikan nilai numerik tidak null
        availablePassenger: json['available_passenger'] ?? 0,
        availableMotorcycle: json['available_motorcycle'] ?? 0,
        availableCar: json['available_car'] ?? 0,
        availableBus: json['available_bus'] ?? 0,
        availableTruck: json['available_truck'] ?? 0,
        scheduleDateStatus: json['schedule_date_status'],
      );
    } catch (e) {
      print('ERROR: Gagal parsing Schedule dari JSON: $e');
      // Fallback dengan nilai default jika parsing gagal
      return Schedule(
        id: 0,
        routeId: 0,
        ferryId: 0,
        departureTime: "00:00:00",
        arrivalTime: "00:00:00",
        days: "",
        status: "ERROR",
        availablePassenger: 0,
        availableMotorcycle: 0,
        availableCar: 0,
        availableBus: 0,
        availableTruck: 0,
      );
    }
  }
}
