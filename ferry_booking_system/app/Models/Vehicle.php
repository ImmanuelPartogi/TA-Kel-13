<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'user_id',
        'type',
        'vehicle_category_id',
        'license_plate',
        'brand',
        'model',
        'weight',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'weight' => 'decimal:2',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ticket()
    {
        return $this->hasOne(Ticket::class);
    }

    /**
     * Get the category of this vehicle.
     */
    public function category()
    {
        return $this->belongsTo(VehicleCategory::class, 'vehicle_category_id');
    }

    /**
     * Get the price for this vehicle based on its category.
     */
    public function getPrice()
    {
        return $this->category->base_price ?? 0;
    }

    /**
     * Get the formatted price attribute.
     */
    public function getFormattedPriceAttribute()
    {
        return 'Rp ' . number_format($this->getPrice(), 0, ',', '.');
    }

    /**
     * Get the vehicle's type name.
     */
    public function getVehicleTypeNameAttribute()
    {
        $types = [
            'MOTORCYCLE' => 'Sepeda Motor',
            'CAR' => 'Mobil',
            'BUS' => 'Bus',
            'TRUCK' => 'Truk',
            'PICKUP' => 'Pickup',
            'TRONTON' => 'Tronton'
        ];

        return $types[$this->type] ?? $this->type;
    }
}
