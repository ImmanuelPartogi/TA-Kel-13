<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_id',
        'ferry_id',
        'departure_time',
        'arrival_time',
        'days',
        'status',
        'status_reason',
        'status_updated_at',
        'status_expiry_date',
        'created_by',
        'last_adjustment_id',
    ];

    protected $casts = [
        'departure_time' => 'datetime',
        'arrival_time' => 'datetime',
        'status_updated_at' => 'datetime',
        'status_expiry_date' => 'datetime',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function ferry()
    {
        return $this->belongsTo(Ferry::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }

    public function scheduleDates()
    {
        return $this->hasMany(ScheduleDate::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
