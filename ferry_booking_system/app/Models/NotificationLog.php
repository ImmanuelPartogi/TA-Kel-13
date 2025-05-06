<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'notification_id',
        'type',
        'scheduled_at',
        'sent_at',
        'is_sent',
        'status',
        'error_message',
    ];

    protected $casts = [
        'is_sent' => 'boolean',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    /**
     * Relasi ke model Booking
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Relasi ke model Notification
     */
    public function notification()
    {
        return $this->belongsTo(Notification::class);
    }
}
