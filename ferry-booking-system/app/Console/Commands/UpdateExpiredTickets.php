<?php
// app/Console/Commands/UpdateExpiredTickets.php
namespace App\Console\Commands;

use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdateExpiredTickets extends Command
{
    protected $signature = 'tickets:update-expired';
    protected $description = 'Update status tiket yang telah kedaluwarsa';

    public function handle()
    {
        $startTime = microtime(true);
        $this->info('Memulai pembaruan status tiket: ' . Carbon::now()->format('Y-m-d H:i:s'));

        try {
            // Update tiket dengan tanggal booking sebelum hari ini
            $pastTicketsCount = DB::table('tickets')
                ->join('bookings', 'tickets.booking_id', '=', 'bookings.id')
                ->where('tickets.status', '=', 'ACTIVE')
                ->where('tickets.checked_in', '=', false)
                ->whereDate('bookings.booking_date', '<', Carbon::today())
                ->update(['tickets.status' => 'EXPIRED']);

            $this->info("Tiket tanggal lalu diperbarui: {$pastTicketsCount}");

            // Update tiket hari ini dengan waktu keberangkatan yang sudah lewat
            $todayTicketsCount = 0;

            Ticket::where('status', 'ACTIVE')
                ->where('checked_in', false)
                ->whereHas('booking', function($query) {
                    $query->whereDate('booking_date', Carbon::today());
                })
                ->with(['booking.schedule'])
                ->chunk(100, function($tickets) use (&$todayTicketsCount) {
                    foreach ($tickets as $ticket) {
                        $bookingDate = Carbon::parse($ticket->booking->booking_date);
                        $departureTime = $ticket->booking->schedule->departure_time;

                        // Normalisasi format waktu
                        $departureTimeString = $departureTime instanceof Carbon
                            ? $departureTime->format('H:i:s')
                            : $departureTime;

                        $departureDateTime = Carbon::parse(
                            $bookingDate->format('Y-m-d') . ' ' . $departureTimeString
                        );

                        if ($departureDateTime->isPast()) {
                            $ticket->status = 'EXPIRED';
                            $ticket->save();
                            $todayTicketsCount++;

                            Log::info('Tiket diperbarui menjadi EXPIRED', [
                                'ticket_id' => $ticket->id,
                                'ticket_code' => $ticket->ticket_code,
                                'departure' => $departureDateTime->format('Y-m-d H:i:s')
                            ]);
                        }
                    }
                });

            $executionTime = round(microtime(true) - $startTime, 2);
            $totalUpdated = $pastTicketsCount + $todayTicketsCount;

            $this->info("Tiket hari ini diperbarui: {$todayTicketsCount}");
            $this->info("Total tiket diperbarui: {$totalUpdated} dalam {$executionTime} detik");

            return 0;
        } catch (\Exception $e) {
            $this->error('Pembaruan tiket gagal: ' . $e->getMessage());
            Log::error('Pembaruan tiket gagal', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return 1;
        }
    }
}
