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
        'original_amount',
        'refund_fee',
        'refund_percentage',
        'amount',
        'reason',
        'status',
        'refunded_by',
        'refund_method',
        'transaction_id',
        'bank_account_number',
        'bank_account_name',
        'bank_name',
        'notes',
        'rejection_reason'
    ];

    protected $casts = [
        'original_amount' => 'decimal:2',
        'refund_fee' => 'decimal:2',
        'refund_percentage' => 'decimal:2',
        'amount' => 'decimal:2'
    ];

    // Bank options
    const BANK_OPTIONS = [
        'BCA' => 'Bank Central Asia',
        'BNI' => 'Bank Negara Indonesia',
        'BRI' => 'Bank Rakyat Indonesia',
        'MANDIRI' => 'Bank Mandiri',
        'CIMB' => 'CIMB Niaga',
        'DANAMON' => 'Bank Danamon',
        'PERMATA' => 'Bank Permata',
        'BTN' => 'Bank Tabungan Negara',
        'OCBC' => 'OCBC NISP',
        'MAYBANK' => 'Maybank Indonesia',
        'PANIN' => 'Bank Panin',
        'BUKOPIN' => 'Bank Bukopin',
        'MEGA' => 'Bank Mega',
        'SINARMAS' => 'Bank Sinarmas',
        'OTHER' => 'Bank Lainnya'
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

    /**
     * Get formatted original amount
     */
    public function getFormattedOriginalAmountAttribute()
    {
        return 'Rp ' . number_format($this->original_amount, 0, ',', '.');
    }

    /**
     * Get formatted refund fee
     */
    public function getFormattedRefundFeeAttribute()
    {
        return 'Rp ' . number_format($this->refund_fee, 0, ',', '.');
    }

    /**
     * Get formatted refund amount
     */
    public function getFormattedAmountAttribute()
    {
        return 'Rp ' . number_format($this->amount, 0, ',', '.');
    }

    /**
     * Get bank name label
     */
    public function getBankNameLabelAttribute()
    {
        return self::BANK_OPTIONS[$this->bank_name] ?? $this->bank_name;
    }

    /**
     * Get status color
     */
    public function getStatusColorAttribute()
    {
        $colors = [
            'PENDING' => 'warning',
            'APPROVED' => 'info',
            'REJECTED' => 'danger',
            'COMPLETED' => 'success',
            'PROCESSING' => 'primary',
            'CANCELLED' => 'secondary'
        ];

        return $colors[$this->status] ?? 'secondary';
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        $labels = [
            'PENDING' => 'Menunggu Persetujuan',
            'APPROVED' => 'Disetujui',
            'REJECTED' => 'Ditolak',
            'COMPLETED' => 'Selesai',
            'PROCESSING' => 'Sedang Diproses',
            'CANCELLED' => 'Dibatalkan'
        ];

        return $labels[$this->status] ?? $this->status;
    }

    /**
     * Scope for pending refunds
     */
    public function scopePending($query)
    {
        return $query->where('status', 'PENDING');
    }

    /**
     * Scope for approved refunds
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'APPROVED');
    }

    /**
     * Scope for completed refunds
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'COMPLETED');
    }
}
