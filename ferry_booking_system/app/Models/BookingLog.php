<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'previous_status',
        'new_status',
        'changed_by_type',
        'changed_by_id',
        'notes',
        'ip_address',
        'user_agent',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function changedBy()
    {
        return $this->morphTo();
    }

    /**
     * Get the user who made the change (polymorphic)
     */
    public function getChangedByUserAttribute()
    {
        if ($this->changed_by_type === 'ADMIN') {
            return Admin::find($this->changed_by_id);
        } elseif ($this->changed_by_type === 'USER') {
            return User::find($this->changed_by_id);
        }
        return null;
    }
}
