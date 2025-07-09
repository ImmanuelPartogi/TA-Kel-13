<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_code',
        'user_id',
        'schedule_id',
        'departure_date',
        'passenger_count',
        'vehicle_count',
        'total_amount',
        'status',
        'cancellation_reason',
        'booked_by',
        'booking_channel',
        'notes',
    ];

    protected $casts = [
        'departure_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    // Status constants
    const STATUS_PENDING = 'PENDING';
    const STATUS_CONFIRMED = 'CONFIRMED';
    const STATUS_CANCELLED = 'CANCELLED';
    const STATUS_COMPLETED = 'COMPLETED';
    const STATUS_REFUND_PENDING = 'REFUND_PENDING';
    const STATUS_REFUNDED = 'REFUNDED';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function bookingLogs()
    {
        return $this->hasMany(BookingLog::class);
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }

    /**
     * Get the latest refund for this booking
     */
    public function latestRefund()
    {
        return $this->hasOne(Refund::class)->latest();
    }

    /**
     * Get active refund (not cancelled or failed)
     */
    public function activeRefund()
    {
        return $this->hasOne(Refund::class)
            ->whereIn('status', ['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED']);
    }

    /**
     * Check if booking can be refunded
     */
    public function canBeRefunded()
    {
        return in_array($this->status, [self::STATUS_CONFIRMED, self::STATUS_COMPLETED])
            && !$this->activeRefund()->exists();
    }

    /**
     * Check if booking can be cancelled
     */
    public function canBeCancelled()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Get status in Indonesian
     */
    public function getStatusIndonesianAttribute()
    {
        $statuses = [
            self::STATUS_PENDING => 'Menunggu Pembayaran',
            self::STATUS_CONFIRMED => 'Dikonfirmasi',
            self::STATUS_CANCELLED => 'Dibatalkan',
            self::STATUS_COMPLETED => 'Selesai',
            self::STATUS_REFUND_PENDING => 'Menunggu Refund',
            self::STATUS_REFUNDED => 'Sudah Direfund',
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute()
    {
        $colors = [
            self::STATUS_PENDING => 'warning',
            self::STATUS_CONFIRMED => 'success',
            self::STATUS_CANCELLED => 'danger',
            self::STATUS_COMPLETED => 'info',
            self::STATUS_REFUND_PENDING => 'warning',
            self::STATUS_REFUNDED => 'secondary',
        ];

        return $colors[$this->status] ?? 'secondary';
    }

    /**
     * Format total amount
     */
    public function getFormattedTotalAmountAttribute()
    {
        return 'Rp ' . number_format($this->total_amount, 0, ',', '.');
    }

    /**
     * Get days before departure
     */
    public function getDaysBeforeDepartureAttribute()
    {
        return now()->diffInDays($this->departure_date, false);
    }

    /**
     * Scope for bookings with refunds
     */
    public function scopeWithRefunds($query)
    {
        return $query->whereHas('refunds');
    }

    /**
     * Scope for bookings by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for bookings in date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('departure_date', [$startDate, $endDate]);
    }

    /**
     * Scope for bookings that can be refunded
     */
    public function scopeRefundable($query)
    {
        return $query->whereIn('status', [self::STATUS_CONFIRMED, self::STATUS_COMPLETED])
            ->whereDoesntHave('refunds', function ($q) {
                $q->whereIn('status', ['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED']);
            });
    }

    /**
     * Get the admin that created this booking (for counter bookings)
     */
    public function admin()
    {
        return $this->belongsTo(Admin::class, 'user_id');
    }

    /**
     * Check if this booking is a counter booking
     */
    public function isCounterBooking()
    {
        return $this->booking_channel === 'ADMIN' && $this->booked_by === 'COUNTER';
    }
}
