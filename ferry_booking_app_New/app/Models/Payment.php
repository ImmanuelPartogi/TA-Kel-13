<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'amount',
        'payment_method',
        'payment_channel',
        'transaction_id',
        'external_reference',
        'status',
        'payment_date',
        'expiry_date',
        'refund_amount',
        'refund_date',
        'payload',
    ];

    protected $casts = [
        'payment_date' => 'datetime',
        'expiry_date' => 'datetime',
        'refund_date' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function refund()
    {
        return $this->hasOne(Refund::class);
    }
}
