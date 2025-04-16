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
        'status',
        'status_reason',
        'status_expiry_date',
        'created_by',
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

    public function getDepartureDateAttribute()
    {
        return $this->date;
    }
}
