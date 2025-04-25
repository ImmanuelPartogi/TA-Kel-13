<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;

class User extends Authenticatable implements CanResetPasswordContract
{
    use HasApiTokens, HasFactory, Notifiable, CanResetPassword;

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

    /**
     * Mendapatkan semua percakapan pengguna
     */
    public function conversations()
    {
        return $this->hasMany(ChatConversation::class, 'user_id');
    }

    /**
     * Mengaitkan percakapan tamu ke akun pengguna setelah login
     */
    public function linkGuestConversation($sessionId)
    {
        $guestConversation = ChatConversation::where('session_id', $sessionId)
            ->whereNull('user_id')
            ->first();

        if ($guestConversation) {
            $guestConversation->update(['user_id' => $this->id]);
            return $guestConversation;
        }

        return null;
    }
}
