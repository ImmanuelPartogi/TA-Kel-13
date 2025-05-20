<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Schedule;
use App\Models\ScheduleDate;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ManageScheduleStatuses extends Command
{
    protected $signature = 'schedules:manage-statuses';
    protected $description = 'Command terpadu untuk mengelola semua aspek status jadwal';

    public function handle()
    {
        $startTime = microtime(true);
        $this->info('Memulai pengelolaan status jadwal: ' . now()->format('Y-m-d H:i:s'));

        try {
            // 1. Update status jadwal yang sudah melewati masa inactive
            $this->updateExpiredScheduleStatuses();

            // 2. Update status tanggal jadwal dengan masalah cuaca
            $this->updateExpiredWeatherIssues();

            $executionTime = round(microtime(true) - $startTime, 2);
            $this->info("Pengelolaan status jadwal selesai dalam {$executionTime} detik");

            return 0;
        } catch (\Exception $e) {
            $this->error('Pengelolaan status jadwal gagal: ' . $e->getMessage());
            Log::error('Error dalam pengelolaan status jadwal', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return 1;
        }
    }

    /**
     * Update status jadwal yang sudah melewati masa inactive
     */
    private function updateExpiredScheduleStatuses()
    {
        $this->info('1. Mengupdate status jadwal yang sudah melewati masa tidak aktif...');

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

            Log::info('Status jadwal berubah dari INACTIVE ke ACTIVE', [
                'schedule_id' => $schedule->id,
                'expiry_date' => $schedule->status_expiry_date
            ]);
        }

        $this->info("   - {$count} jadwal telah diaktifkan kembali setelah masa tidak aktif");
    }

    /**
     * Update status tanggal jadwal dengan masalah cuaca
     */
    private function updateExpiredWeatherIssues()
    {
        $this->info('2. Mengupdate status tanggal jadwal dengan masalah cuaca...');

        $now = Carbon::now();

        // Update tanggal jadwal dengan status WEATHER_ISSUE yang sudah kedaluwarsa
        $expiredDates = ScheduleDate::where('status', 'WEATHER_ISSUE')
            ->whereNotNull('status_expiry_date')
            ->where('status_expiry_date', '<', $now)
            ->get();

        $count = 0;

        foreach ($expiredDates as $date) {
            $oldStatus = $date->status;

            $date->status = 'ACTIVE';
            $date->status_reason = 'Otomatis diaktifkan setelah masa masalah cuaca berakhir';
            $date->status_expiry_date = null;
            $date->save();

            $count++;

            Log::info('Status tanggal jadwal berubah dari WEATHER_ISSUE ke ACTIVE', [
                'schedule_date_id' => $date->id,
                'schedule_id' => $date->schedule_id,
                'date' => $date->date
            ]);
        }

        $this->info("   - {$count} tanggal jadwal telah diaktifkan kembali setelah masalah cuaca");
    }
}
