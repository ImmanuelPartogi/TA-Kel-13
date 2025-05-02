<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use Carbon\Carbon;

class UpdateExpiredScheduleStatuses extends Command
{
    protected $signature = 'schedules:update-expired';
    protected $description = 'Update status jadwal yang sudah melewati tanggal kedaluwarsa';

    public function handle()
    {
        $now = Carbon::now();

        // Update jadwal yang status INACTIVE-nya sudah kedaluwarsa
        $expiredSchedules = Schedule::where('status', 'INACTIVE')
            ->whereNotNull('status_expiry_date')
            ->where('status_expiry_date', '<', $now)
            ->get();

        $count = 0;

        foreach ($expiredSchedules as $schedule) {
            $oldStatus = $schedule->status;

            $schedule->status = 'ACTIVE';
            $schedule->status_reason = 'Otomatis diaktifkan setelah masa tidak aktif berakhir';
            $schedule->status_updated_at = $now;
            $schedule->status_expiry_date = null;
            $schedule->save();

            // Update juga status tanggal jadwal terkait
            ScheduleDate::where('schedule_id', $schedule->id)
                ->where('date', '>=', Carbon::today()->format('Y-m-d'))
                ->where('modified_by_schedule', true)
                ->where('status', 'INACTIVE')
                ->update([
                    'status' => 'ACTIVE',
                    'status_reason' => 'Otomatis diaktifkan karena jadwal telah aktif kembali',
                ]);

            $count++;

            $this->info("Jadwal ID: {$schedule->id} status berubah dari {$oldStatus} ke ACTIVE");
        }

        $this->info("Total {$count} jadwal telah diperbarui statusnya.");

        // Update jadwal dengan status WEATHER_ISSUE yang sudah kedaluwarsa
        $weatherIssueUpdated = ScheduleDate::where('status', 'WEATHER_ISSUE')
            ->whereNotNull('status_expiry_date')
            ->where('status_expiry_date', '<', $now)
            ->update([
                'status' => 'ACTIVE',
                'status_reason' => 'Otomatis diaktifkan setelah masa masalah cuaca berakhir',
                'status_expiry_date' => null
            ]);

        $this->info("Total {$weatherIssueUpdated} tanggal jadwal dengan masalah cuaca telah diperbarui statusnya.");
    }
}
