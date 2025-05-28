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

    /**
     * Get the vehicle categories for this route.
     * Ini akan memberikan kategori kendaraan yang aktif
     */
    public function vehicleCategories()
    {
        return VehicleCategory::where('is_active', true)->get();
    }

    /**
     * Helper method untuk mendapatkan harga kendaraan dari kategori
     */
    public function getVehiclePriceByType($vehicleType)
    {
        return VehicleCategory::where('vehicle_type', $vehicleType)
            ->where('is_active', true)
            ->first()
            ->base_price ?? 0;
    }
}
