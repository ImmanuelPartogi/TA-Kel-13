<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Schedule;
use Carbon\Carbon;

class CheckExpiredSchedules
{
    public function handle($request, Closure $next)
    {
        $now = Carbon::now();

        Schedule::where('status', 'DELAYED')
            ->whereNotNull('status_expiry_date')
            ->where('status_expiry_date', '<', $now)
            ->update([
                'status' => 'ACTIVE',
                'status_reason' => 'Otomatis diaktifkan kembali setelah masa penundaan berakhir',
                'status_updated_at' => $now,
                'status_expiry_date' => null
            ]);

        return $next($request);
    }
}
