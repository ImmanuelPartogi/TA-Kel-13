<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RefundPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'days_before_departure',
        'refund_percentage',
        'min_fee',
        'max_fee',
        'is_active',
        'description'
    ];

    protected $casts = [
        'days_before_departure' => 'integer',
        'refund_percentage' => 'decimal:2',
        'min_fee' => 'decimal:2',
        'max_fee' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    /**
     * Get active policy for given days before departure
     */
    public static function getApplicablePolicy($daysBeforeDeparture)
    {
        return self::where('is_active', true)
            ->where('days_before_departure', '<=', $daysBeforeDeparture)
            ->orderBy('days_before_departure', 'desc')
            ->first();
    }

    /**
     * Calculate refund amount based on policy
     */
    public function calculateRefundAmount($originalAmount)
    {
        $refundableAmount = $originalAmount * ($this->refund_percentage / 100);

        // Apply min/max fee constraints
        if ($this->min_fee && $refundableAmount < $this->min_fee) {
            $refundableAmount = $this->min_fee;
        }

        if ($this->max_fee && $refundableAmount > $this->max_fee) {
            $refundableAmount = $this->max_fee;
        }

        $fee = $originalAmount - $refundableAmount;

        return [
            'original_amount' => $originalAmount,
            'refund_percentage' => $this->refund_percentage,
            'refund_fee' => $fee,
            'refund_amount' => $refundableAmount
        ];
    }
}
