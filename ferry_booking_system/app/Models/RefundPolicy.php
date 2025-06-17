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
     * UPDATED: Menerapkan kebijakan menurun tanpa celah dengan pendekatan kebijakan terdekat
     */
    public static function getApplicablePolicy($daysBeforeDeparture)
    {
        // Cari kebijakan berdasarkan days_before_departure yang aktif
        $policy = self::where('is_active', 1)
            ->where('days_before_departure', '<=', $daysBeforeDeparture)
            ->orderBy('days_before_departure', 'desc')
            ->first();

        // Jika tidak ada kebijakan yang berlaku, cari kebijakan terdekat
        if (!$policy) {
            $policy = self::where('is_active', 1)
                ->where('days_before_departure', '>', $daysBeforeDeparture)
                ->orderBy('days_before_departure', 'asc')  // Ambil yang terdekat (paling kecil)
                ->first();
        }

        return $policy;
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

        // PERBAIKAN YANG BENAR: Perhitungan refund yang konsisten
        $refundPercentage = $this->refund_percentage;

        // Hitung fee (jumlah yang TIDAK direfund)
        $fee = $originalAmount * ((100 - $refundPercentage) / 100);

        // Pastikan fee memenuhi batas minimum dan maksimum jika ada
        if ($this->min_fee && $this->min_fee > 0 && $fee < $this->min_fee) {
            $fee = $this->min_fee;
        }

        if ($this->max_fee && $this->max_fee > 0 && $fee > $this->max_fee) {
            $fee = $this->max_fee;
        }

        // Hitung jumlah refund setelah fee
        $refundAmount = $originalAmount - $fee;

        // Pastikan refund amount tidak negatif
        if ($refundAmount < 0) {
            $refundAmount = 0;
            $fee = $originalAmount;
        }

        // Persentase refund yang sebenarnya (mungkin berubah karena min/max fee)
        $actualRefundPercentage = ($refundAmount / $originalAmount) * 100;

        // PERBAIKAN: Membuat catatan yang sesuai
        $description = "Potongan biaya kepada penumpang yang melakukan refund sebesar " .
            number_format(100 - $actualRefundPercentage, 0) . "%";

        return [
            'original_amount' => $originalAmount,
            'refund_percentage' => $actualRefundPercentage,
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
