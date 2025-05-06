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
        'virtual_account_number',
        'qr_code_url',
        'deep_link_url',
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
        'payload' => 'array',
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
     * Getter untuk virtual account number yang memadukan kolom dan external_reference
     */
    public function getVirtualAccountNumberAttribute($value)
    {
        // Jika nilai langsung ada, gunakan nilai tersebut
        if (!empty($value)) {
            return $value;
        }

        // Jika tidak ada, coba ekstrak dari external_reference
        if ($this->external_reference) {
            $parts = explode(' ', $this->external_reference);
            if (count($parts) > 1) {
                return $parts[1]; // Ambil bagian kedua (nomor)
            }
        }

        return null;
    }

    /**
     * Relasi ke model Booking
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Relasi ke model Refund
     */
    public function refund()
    {
        return $this->hasOne(Refund::class);
    }

    /**
     * Cek apakah pembayaran masih dalam status pending
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Cek apakah pembayaran berhasil
     */
    public function isSuccess()
    {
        return $this->status === self::STATUS_SUCCESS;
    }

    /**
     * Cek apakah pembayaran gagal
     */
    public function isFailed()
    {
        return $this->status === self::STATUS_FAILED;
    }

    /**
     * Cek apakah pembayaran sudah direfund
     */
    public function isRefunded()
    {
        return $this->status === self::STATUS_REFUNDED;
    }

    /**
     * Cek apakah pembayaran dalam status challenge (fraud)
     */
    public function isChallenge()
    {
        return $this->status === self::STATUS_CHALLENGE;
    }

    /**
     * Cek apakah pembayaran sudah kedaluwarsa
     */
    public function isExpired()
    {
        return $this->expiry_date && now()->isAfter($this->expiry_date);
    }
}
