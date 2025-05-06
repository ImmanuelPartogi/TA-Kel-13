<?php

namespace App\Helpers;

use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DateHelper
{
    /**
     * Parsing tanggal dengan format yang konsisten
     *
     * @param string|null $dateString
     * @return Carbon|null
     */
    public static function parseDate($dateString)
    {
        if (empty($dateString)) {
            return Carbon::today('Asia/Jakarta');
        }

        try {
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateString)) {
                return Carbon::createFromFormat('Y-m-d', $dateString, 'Asia/Jakarta')->startOfDay();
            } else {
                return Carbon::parse($dateString)->setTimezone('Asia/Jakarta')->startOfDay();
            }
        } catch (\Exception $e) {
            Log::error('Error parsing date', [
                'input' => $dateString,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Format tanggal menjadi Y-m-d
     *
     * @param Carbon $date
     * @return string
     */
    public static function formatDate(Carbon $date)
    {
        return $date->format('Y-m-d');
    }
}
