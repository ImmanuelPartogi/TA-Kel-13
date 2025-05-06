<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduleDate extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'date',
        'passenger_count',
        'motorcycle_count',
        'car_count',
        'bus_count',
        'truck_count',
        'status', // ACTIVE, INACTIVE, FULL, CANCELLED, DEPARTED, WEATHER_ISSUE
        'status_reason',
        'status_expiry_date',
        'created_by',
        'operator_id', // Tambahkan operator_id
        'modified_by_schedule',
        'adjustment_id',
    ];

    protected $casts = [
        'date' => 'date',
        'status_expiry_date' => 'datetime',
        'modified_by_schedule' => 'boolean',
    ];

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(Admin::class, 'created_by');
    }

    public function operator()
    {
        return $this->belongsTo(Operator::class, 'operator_id');
    }

    public function getDepartureDateAttribute()
    {
        return $this->date;
    }
}
