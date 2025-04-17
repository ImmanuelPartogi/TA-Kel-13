<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_code',
        'booking_id',
        'passenger_id',
        'vehicle_id',
        'qr_code',
        'seat_number',
        'boarding_status',
        'boarding_time',
        'status',
        'checked_in',
        'watermark_data',
        'boarding_gate',
        'ticket_type',
    ];

    protected $casts = [
        'boarding_time' => 'datetime',
        'checked_in' => 'boolean',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function passenger()
    {
        return $this->belongsTo(User::class, 'passenger_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
