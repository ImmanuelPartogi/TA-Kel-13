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
    return Schedule(
      id: json['id'],
      routeId: json['route_id'],
      ferryId: json['ferry_id'],
      departureTime: json['departure_time'],
      arrivalTime: json['arrival_time'],
      days: json['days'],
      status: json['status'],
      statusReason: json['status_reason'],
      ferry: json['ferry'] != null ? Ferry.fromJson(json['ferry']) : null,
      route: json['route'] != null ? FerryRoute.fromJson(json['route']) : null,
      availablePassenger: json['available_passenger'],
      availableMotorcycle: json['available_motorcycle'],
      availableCar: json['available_car'],
      availableBus: json['available_bus'],
      availableTruck: json['available_truck'],
      scheduleDateStatus: json['schedule_date_status'],
    );
  }
}