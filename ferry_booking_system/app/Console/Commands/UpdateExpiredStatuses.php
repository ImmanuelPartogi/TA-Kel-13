<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use Carbon\Carbon;

class UpdateExpiredStatuses extends Command
{
    protected $signature = 'schedules:update-expired-statuses';
    protected $description = 'Update status tanggal jadwal yang kedaluwarsa';

    public function handle()
    {
        $now = Carbon::now();
        $this->info("Memulai pemeriksaan status kedaluwarsa pada: " . $now->format('Y-m-d H:i:s'));

        // Tidak perlu lagi mengupdate jadwal dengan status DELAYED
        // Hanya perlu update tanggal jadwal dengan status WEATHER_ISSUE
        $expiredDates = ScheduleDate::where('status', 'WEATHER_ISSUE')
            ->whereNotNull('status_expiry_date')
            ->where('status_expiry_date', '<', $now)
            ->get();

        foreach ($expiredDates as $date) {
            $oldStatus = $date->status;

            $date->status = 'ACTIVE';
            $date->status_reason = 'Otomatis diaktifkan setelah masa masalah cuaca berakhir';
            $date->status_expiry_date = null;
            $date->save();

            $this->info("Tanggal Jadwal ID: {$date->id} (Jadwal ID: {$date->schedule_id}) - Status berubah dari {$oldStatus} ke ACTIVE");
        }

        $this->info("Total {$expiredDates->count()} tanggal jadwal diperbarui.");
    }
}
