<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ferry extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'registration_number',
        'capacity_passenger',
        'capacity_vehicle_motorcycle',
        'capacity_vehicle_car',
        'capacity_vehicle_bus',
        'capacity_vehicle_truck',
        'status',
        'description',
        'image',
        'year_built',
        'last_maintenance_date',
    ];

    protected $casts = [
        'last_maintenance_date' => 'date',
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
