<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'address',
        'id_number',
        'id_type',
        'date_of_birthday',
        'gender',
        'profile_picture',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_of_birthday' => 'date',
        'password' => 'hashed',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
