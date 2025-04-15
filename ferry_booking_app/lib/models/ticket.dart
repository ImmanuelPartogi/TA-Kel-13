class Ticket {
  final int id;
  final String ticketCode;
  final int bookingId;
  final int? passengerId;
  final int? vehicleId;
  final String qrCode;
  final String? seatNumber;
  final String boardingStatus;
  final String? boardingTime;
  final String status;
  final bool checkedIn;
  final String? watermarkData;
  final String? boardingGate;
  final String ticketType;
  final String createdAt;
  final String updatedAt;

  Ticket({
    required this.id,
    required this.ticketCode,
    required this.bookingId,
    this.passengerId,
    this.vehicleId,
    required this.qrCode,
    this.seatNumber,
    required this.boardingStatus,
    this.boardingTime,
    required this.status,
    required this.checkedIn,
    this.watermarkData,
    this.boardingGate,
    required this.ticketType,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Ticket.fromJson(Map<String, dynamic> json) {
    return Ticket(
      id: json['id'],
      ticketCode: json['ticket_code'],
      bookingId: json['booking_id'],
      passengerId: json['passenger_id'],
      vehicleId: json['vehicle_id'],
      qrCode: json['qr_code'],
      seatNumber: json['seat_number'],
      boardingStatus: json['boarding_status'],
      boardingTime: json['boarding_time'],
      status: json['status'],
      checkedIn: json['checked_in'] == 1 || json['checked_in'] == true,
      watermarkData: json['watermark_data'],
      boardingGate: json['boarding_gate'],
      ticketType: json['ticket_type'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }
}