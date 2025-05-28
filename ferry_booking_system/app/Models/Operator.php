<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Operator extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'email',
        'company_name',
        'phone_number',
        'license_number',
        'fleet_size',
        'company_address',
        'password',
        'role',
        'status',
        'assigned_routes',
        'last_login',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'assigned_routes' => 'array',
        'last_login' => 'datetime',
        'password' => 'hashed',
    ];

    // Konstanta untuk status operator
    const STATUS_ACTIVE = 'ACTIVE';
    const STATUS_INACTIVE = 'INACTIVE';
    const STATUS_SUSPENDED = 'SUSPENDED';

    /**
     * Get the routes managed by this operator.
     */
    public function routes()
    {
        return Route::whereIn('id', is_array($this->assigned_routes) ? $this->assigned_routes : [])->get();
    }

    /**
     * Check if operator manages a specific route.
     */
    public function managesRoute($routeId)
    {
        return is_array($this->assigned_routes) && in_array($routeId, $this->assigned_routes);
    }

    /**
     * Check if operator is active.
     */
    public function isActive()
    {
        return $this->status === self::STATUS_ACTIVE;
    }
}
