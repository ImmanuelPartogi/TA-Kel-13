<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'payment_id',
        'amount',
        'reason',
        'status',
        'refunded_by',
        'refund_method',
        'transaction_id',
        'bank_account_number',
        'bank_account_name',
        'bank_name',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function refundedBy()
    {
        return $this->belongsTo(Admin::class, 'refunded_by');
    }
}
