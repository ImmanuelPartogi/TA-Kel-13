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
        'status',
        'transaction_id',
        'virtual_account_number',
        'qr_code_url',
        'deep_link_url',
        'expiry_date',
        'payment_date',
        'refund_amount',
        'refund_date',
        'channel_response_code',
        'channel_response_message',
        'external_reference',
        'payload',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'expiry_date' => 'datetime',
        'payment_date' => 'datetime',
        'refund_date' => 'datetime',
    ];

    // Status constants
    const STATUS_PENDING = 'PENDING';
    const STATUS_SUCCESS = 'SUCCESS';
    const STATUS_FAILED = 'FAILED';
    const STATUS_REFUNDED = 'REFUNDED';
    const STATUS_PARTIAL_REFUND = 'PARTIAL_REFUND';

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }

    /**
     * Get latest refund
     */
    public function latestRefund()
    {
        return $this->hasOne(Refund::class)->latest();
    }

    /**
     * Check if payment can be refunded
     */
    public function canBeRefunded()
    {
        return $this->status === self::STATUS_SUCCESS &&
            !$this->refunds()->whereIn('status', ['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED'])->exists();
    }

    /**
     * Get formatted amount
     */
    public function getFormattedAmountAttribute()
    {
        return 'Rp ' . number_format($this->amount, 0, ',', '.');
    }

    /**
     * Get formatted refund amount
     */
    public function getFormattedRefundAmountAttribute()
    {
        return $this->refund_amount ? 'Rp ' . number_format($this->refund_amount, 0, ',', '.') : null;
    }

    /**
     * Get status in Indonesian
     */
    public function getStatusIndonesianAttribute()
    {
        $statuses = [
            self::STATUS_PENDING => 'Menunggu Pembayaran',
            self::STATUS_SUCCESS => 'Berhasil',
            self::STATUS_FAILED => 'Gagal',
            self::STATUS_REFUNDED => 'Sudah Direfund',
            self::STATUS_PARTIAL_REFUND => 'Refund Sebagian',
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    /**
     * Check if payment is expired
     */
    public function getIsExpiredAttribute()
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    /**
     * Scope for successful payments
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', self::STATUS_SUCCESS);
    }

    /**
     * Scope for refunded payments
     */
    public function scopeRefunded($query)
    {
        return $query->whereIn('status', [self::STATUS_REFUNDED, self::STATUS_PARTIAL_REFUND]);
    }

    /**
     * Get QR String untuk QRIS
     */
    public function getQrStringAttribute()
    {
        // Cek apakah QR string tersimpan di external_reference
        if (
            $this->payment_method === 'E_WALLET' &&
            $this->payment_channel === 'qris' &&
            $this->external_reference
        ) {
            return $this->external_reference;
        }

        // Coba ambil dari payload
        if ($this->payload) {
            try {
                $payload = json_decode($this->payload, true);
                if (isset($payload['qr_string'])) {
                    return $payload['qr_string'];
                }
            } catch (\Exception $e) {
                return null;
            }
        }

        return null;
    }
}
