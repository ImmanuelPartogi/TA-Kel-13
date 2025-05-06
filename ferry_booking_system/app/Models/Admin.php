<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'permissions',
        'last_login',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'permissions' => 'array',
        'last_login' => 'datetime',
        'password' => 'hashed',
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'created_by');
    }

    public function scheduleDates()
    {
        return $this->hasMany(ScheduleDate::class, 'created_by');
    }
}
