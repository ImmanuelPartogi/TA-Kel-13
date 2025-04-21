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
        'snap_token', // Ditambahkan untuk menyimpan snap token
    ];

    protected $casts = [
        'payment_date' => 'datetime',
        'expiry_date' => 'datetime',
        'refund_date' => 'datetime',
        'payload' => 'array', // Cast payload ke array
    ];

    // Status pembayaran yang tersedia
    const STATUS_PENDING = 'PENDING';
    const STATUS_SUCCESS = 'SUCCESS';
    const STATUS_FAILED = 'FAILED';
    const STATUS_REFUNDED = 'REFUNDED';
    const STATUS_CHALLENGE = 'CHALLENGE';

    // Metode pembayaran yang tersedia
    const METHOD_VIRTUAL_ACCOUNT = 'VIRTUAL_ACCOUNT';
    const METHOD_CREDIT_CARD = 'CREDIT_CARD';
    const METHOD_E_WALLET = 'E_WALLET';
    const METHOD_CASH = 'CASH';
    const METHOD_DIRECT_DEBIT = 'DIRECT_DEBIT';
    const METHOD_CREDIT = 'CREDIT';

    /**
     * Relasi ke model Booking
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Relasi ke model Refund
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function refund()
    {
        return $this->hasOne(Refund::class);
    }

    /**
     * Cek apakah pembayaran masih dalam status pending
     *
     * @return bool
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Cek apakah pembayaran berhasil
     *
     * @return bool
     */
    public function isSuccess()
    {
        return $this->status === self::STATUS_SUCCESS;
    }

    /**
     * Cek apakah pembayaran gagal
     *
     * @return bool
     */
    public function isFailed()
    {
        return $this->status === self::STATUS_FAILED;
    }

    /**
     * Cek apakah pembayaran sudah direfund
     *
     * @return bool
     */
    public function isRefunded()
    {
        return $this->status === self::STATUS_REFUNDED;
    }

    /**
     * Cek apakah pembayaran dalam status challenge (fraud)
     *
     * @return bool
     */
    public function isChallenge()
    {
        return $this->status === self::STATUS_CHALLENGE;
    }

    /**
     * Cek apakah pembayaran sudah kedaluwarsa
     *
     * @return bool
     */
    public function isExpired()
    {
        return $this->expiry_date && now()->isAfter($this->expiry_date);
    }
}
