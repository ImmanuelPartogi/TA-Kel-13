<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    use HasFactory;

    protected $fillable = [
        'origin',
        'destination',
        'route_code',
        'distance',
        'duration',
        'base_price',
        'motorcycle_price',
        'car_price',
        'bus_price',
        'truck_price',
        'status',
        'status_reason',
        'status_updated_at',
        'status_expiry_date',
    ];

    protected $casts = [
        'status_updated_at' => 'datetime',
        'status_expiry_date' => 'datetime',
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
