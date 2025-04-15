<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_code',
        'user_id',
        'schedule_id',
        'booking_date',
        'passenger_count',
        'vehicle_count',
        'total_amount',
        'status',
        'cancellation_reason',
        'booked_by',
        'booking_channel',
        'notes',
    ];

    protected $casts = [
        'booking_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function bookingLogs()
    {
        return $this->hasMany(BookingLog::class);
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }
}
