<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

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
     * FIXED: Perbaikan perhitungan hari dan logika penerapan kebijakan
     */
    public static function getApplicablePolicy($departureDate)
    {
        // PERBAIKAN: Menggunakan Carbon untuk menghitung selisih hari
        $departureDateTime = Carbon::parse($departureDate)->startOfDay();
        $currentDateTime = Carbon::now()->startOfDay();

        // Menghitung selisih hari dengan benar (inklusif pada hari keberangkatan)
        $daysBeforeDeparture = $departureDateTime->diffInDays($currentDateTime);


        // Tambahan validasi: Refund tidak dapat diajukan kurang dari 2 hari
        if ($daysBeforeDeparture < 2) {
            return false; // Mengembalikan false untuk menandakan refund tidak diizinkan
        }

        // PERBAIKAN: Memastikan query mengambil kebijakan yang sesuai
        return self::where('is_active', true)
            ->where('days_before_departure', '<=', $daysBeforeDeparture)
            ->orderBy('days_before_departure', 'desc')
            ->first();
    }

    /**
     * Calculate refund amount based on policy
     * FIXED: Memastikan konsistensi perhitungan dan catatan
     */
    public function calculateRefundAmount($originalAmount, $forceFullRefund = false)
    {
        // Jika forceFullRefund = true, maka tidak ada potongan
        if ($forceFullRefund) {
            return [
                'original_amount' => $originalAmount,
                'refund_percentage' => 100,
                'refund_fee' => 0,
                'refund_amount' => $originalAmount,
                'description' => 'Refund penuh tanpa potongan'
            ];
        }

        // PERBAIKAN: Memastikan perhitungan jumlah refund yang konsisten
        $refundPercentage = $this->refund_percentage;
        $refundAmount = $originalAmount * ($refundPercentage / 100);

        // Apply min/max fee constraints
        if ($this->min_fee && $refundAmount < $this->min_fee) {
            $refundAmount = $this->min_fee;
        }

        if ($this->max_fee && $refundAmount > $this->max_fee) {
            $refundAmount = $this->max_fee;
        }

        $fee = $originalAmount - $refundAmount;

        // PERBAIKAN: Membuat catatan yang sesuai dengan persentase refund yang sebenarnya
        $description = "Potongan biaya kepada penumpang yang melakukan refund sebesar " .
            (100 - $refundPercentage) . "%";

        return [
            'original_amount' => $originalAmount,
            'refund_percentage' => $refundPercentage,
            'refund_fee' => $fee,
            'refund_amount' => $refundAmount,
            'description' => $description
        ];
    }

    /**
     * Get default full refund calculation
     * NEW: Static method for default full refund (no policy)
     */
    public static function getDefaultFullRefund($originalAmount)
    {
        return [
            'original_amount' => $originalAmount,
            'refund_percentage' => 100,
            'refund_fee' => 0,
            'refund_amount' => $originalAmount,
            'is_default_policy' => true
        ];
    }
}
