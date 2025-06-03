<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use App\Models\Ticket;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ManageTicketStatuses extends Command
{
    protected $signature = 'tickets:manage-statuses';
    protected $description = 'Command terpadu untuk mengelola semua status tiket dan booking';

    // Definisikan enum values yang valid
    protected $validBoardingStatuses = [
        'NOT_BOARDED',
        'BOARDED',
        'MISSED'
        // Jika ada nilai enum lain, tambahkan di sini
    ];

    public function handle()
    {
        $startTime = microtime(true);
        $this->info('Memulai pengelolaan status tiket: ' . now()->format('Y-m-d H:i:s'));

        try {
            // 1. Update tiket yang sudah expired berdasarkan tanggal & waktu
            $this->updateExpiredTickets();

            // 2. Update booking PENDING yang sudah melewati jadwal menjadi EXPIRED
            $this->updateExpiredPendingBookings();

            // 3. Sinkronisasi status tiket berdasarkan status booking
            $this->syncTicketsWithBookings();

            // 4. Update status boarding tiket
            $this->updateBoardingStatuses();

            // 5. Update status booking berdasarkan status check-in tiket
            $this->updateBookingStatusesBasedOnTickets();

            $executionTime = round(microtime(true) - $startTime, 2);
            $this->info("Pengelolaan status tiket selesai dalam {$executionTime} detik");

            return 0;
        } catch (\Exception $e) {
            $this->error('Pengelolaan status tiket gagal: ' . $e->getMessage());
            Log::error('Error dalam pengelolaan status tiket', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return 1;
        }
    }

    /**
     * Update status tiket yang sudah melewati jadwal keberangkatan
     */
    private function updateExpiredTickets()
    {
        // Kode yang sudah ada
        $this->info('1. Mengupdate tiket yang sudah expired...');

        // 1a. Update tiket dengan tanggal booking yang sudah lewat
        $pastTicketsCount = DB::table('tickets')
            ->join('bookings', 'tickets.booking_id', '=', 'bookings.id')
            ->where('tickets.status', '=', 'ACTIVE')
            ->whereDate('bookings.departure_date', '<', Carbon::today())
            ->update([
                'tickets.status' => 'EXPIRED',
                'tickets.boarding_status' => 'MISSED'
            ]);

        $this->info("   - {$pastTicketsCount} tiket tanggal sebelumnya diupdate menjadi EXPIRED");

        // 1b. Update tiket hari ini yang sudah lewat waktu keberangkatan
        $todayTicketsCount = 0;

        Ticket::where('status', 'ACTIVE')
            ->whereHas('booking', function ($query) {
                $query->whereDate('departure_date', Carbon::today());
            })
            ->with(['booking.schedule'])
            ->chunk(100, function ($tickets) use (&$todayTicketsCount) {
                foreach ($tickets as $ticket) {
                    $departureDate = Carbon::parse($ticket->booking->departure_date);
                    $departureTime = $ticket->booking->schedule->departure_time;

                    // Normalisasi format waktu
                    if ($departureTime instanceof Carbon) {
                        $departureTimeString = $departureTime->format('H:i:s');
                    } else {
                        $departureTimeString = $departureTime;
                    }

                    $departureDateTime = Carbon::parse(
                        $departureDate->format('Y-m-d') . ' ' . $departureTimeString
                    );

                    if ($departureDateTime->isPast()) {
                        $ticket->status = 'EXPIRED';
                        $ticket->boarding_status = 'MISSED';
                        $ticket->save();
                        $todayTicketsCount++;

                        Log::info('Tiket hari ini diupdate menjadi EXPIRED', [
                            'ticket_id' => $ticket->id,
                            'ticket_code' => $ticket->ticket_code,
                            'departure' => $departureDateTime->format('Y-m-d H:i:s'),
                            'current_time' => now()->format('Y-m-d H:i:s')
                        ]);
                    }
                }
            });

        $this->info("   - {$todayTicketsCount} tiket hari ini diupdate menjadi EXPIRED");
        $this->info("   Total " . ($pastTicketsCount + $todayTicketsCount) . " tiket diupdate menjadi EXPIRED");
    }

    /**
     * Update status booking PENDING yang sudah melewati jadwal menjadi EXPIRED
     */
    private function updateExpiredPendingBookings()
    {
        // Kode yang sudah ada
        $this->info('2. Mengupdate booking PENDING yang sudah expired...');

        $now = Carbon::now();
        $expiredBookingsCount = 0;

        // Cari booking dengan status PENDING yang sudah melewati jadwal
        Booking::where('status', 'PENDING')
            ->whereDate('departure_date', '<=', $now)
            ->with(['schedule', 'tickets'])
            ->chunk(100, function ($bookings) use (&$expiredBookingsCount, $now) {
                foreach ($bookings as $booking) {
                    // Bandingkan dengan waktu keberangkatan
                    $departureDate = Carbon::parse($booking->departure_date);
                    $departureTime = $booking->schedule->departure_time ?? '00:00:00';

                    // Normalisasi format waktu
                    if ($departureTime instanceof Carbon) {
                        $departureTimeString = $departureTime->format('H:i:s');
                    } else {
                        $departureTimeString = $departureTime;
                    }

                    $departureDateTime = Carbon::parse(
                        $departureDate->format('Y-m-d') . ' ' . $departureTimeString
                    );

                    // Jika sudah lewat waktu keberangkatan
                    if ($departureDateTime->isPast()) {
                        // Update status booking dan tambahkan cancellation_reason
                        $booking->status = 'EXPIRED';
                        $booking->cancellation_reason = 'Jadwal keberangkatan telah terlewati. Pemesanan dibatalkan secara otomatis oleh sistem.';
                        $booking->save();

                        // Update status semua tiket terkait
                        Ticket::where('booking_id', $booking->id)
                            ->update([
                                'status' => 'EXPIRED',
                                'boarding_status' => 'MISSED'
                            ]);

                        $expiredBookingsCount++;

                        Log::info('Booking PENDING diupdate menjadi EXPIRED', [
                            'booking_id' => $booking->id,
                            'booking_code' => $booking->booking_code,
                            'departure' => $departureDateTime->format('Y-m-d H:i:s'),
                            'current_time' => now()->format('Y-m-d H:i:s'),
                            'cancellation_reason' => $booking->cancellation_reason
                        ]);
                    }
                }
            });

        $this->info("   Total {$expiredBookingsCount} booking PENDING diupdate menjadi EXPIRED");

        // Update berdasarkan payment expiry date
        $paymentExpiredCount = DB::table('bookings')
            ->join('payments', 'bookings.id', '=', 'payments.booking_id')
            ->where('bookings.status', '=', 'PENDING')
            ->where('payments.status', '=', 'PENDING')
            ->where('payments.expiry_date', '<', $now)
            ->update([
                'bookings.status' => 'EXPIRED',
                'payments.status' => 'EXPIRED'
            ]);

        $this->info("   Total {$paymentExpiredCount} booking dengan payment expired diupdate menjadi EXPIRED");

        // Update tiket untuk booking yang baru saja diupdate karena payment expired
        $expiredTicketsCount = DB::table('tickets')
            ->join('bookings', 'tickets.booking_id', '=', 'bookings.id')
            ->where('bookings.status', '=', 'EXPIRED')
            ->where('tickets.status', '!=', 'EXPIRED')
            ->update([
                'tickets.status' => 'EXPIRED',
                'tickets.boarding_status' => 'MISSED'
            ]);

        $this->info("   Total {$expiredTicketsCount} tiket diupdate menjadi EXPIRED karena booking expired");
    }

    /**
     * Sinkronisasi status tiket berdasarkan status booking
     */
    private function syncTicketsWithBookings()
    {
        $this->info('3. Sinkronisasi status tiket dengan booking...');

        // PERUBAHAN: Perbaikan untuk error truncation - gunakan MISSED untuk boarding_status
        
        // Untuk booking dengan status CANCELLED
        $cancelledCount = DB::table('tickets')
            ->join('bookings', 'tickets.booking_id', '=', 'bookings.id')
            ->where('bookings.status', '=', 'CANCELLED')
            ->where('tickets.status', '!=', 'CANCELLED')
            ->update([
                'tickets.status' => 'CANCELLED',
                'tickets.boarding_status' => 'MISSED' // Menggunakan MISSED sebagai nilai yang valid
            ]);

        $this->info("   - {$cancelledCount} tiket diupdate menjadi CANCELLED dengan boarding_status MISSED");

        // Untuk booking dengan status COMPLETED
        $completedCount = DB::table('tickets')
            ->join('bookings', 'tickets.booking_id', '=', 'bookings.id')
            ->where('bookings.status', '=', 'COMPLETED')
            ->where('tickets.status', '!=', 'USED')
            ->update([
                'tickets.status' => 'USED'
            ]);

        $this->info("   - {$completedCount} tiket diupdate menjadi USED");

        // Untuk booking dengan status REFUNDED
        $refundedCount = DB::table('tickets')
            ->join('bookings', 'tickets.booking_id', '=', 'bookings.id')
            ->where('bookings.status', '=', 'REFUNDED')
            ->where('tickets.status', '!=', 'CANCELLED')
            ->update([
                'tickets.status' => 'CANCELLED',
                'tickets.boarding_status' => 'MISSED' // Menggunakan MISSED sebagai nilai yang valid
            ]);

        $this->info("   - {$refundedCount} tiket diupdate menjadi CANCELLED karena refund");
    }

    /**
     * Update status boarding tiket
     */
    private function updateBoardingStatuses()
    {
        $this->info('4. Memperbarui status boarding tiket...');

        // Update boarding status untuk tiket yang expired
        $boardingExpiredCount = DB::table('tickets')
            ->where('status', 'EXPIRED')
            ->where('boarding_status', 'NOT_BOARDED')
            ->update(['boarding_status' => 'MISSED']);

        $this->info("   - {$boardingExpiredCount} tiket diupdate boarding status menjadi MISSED");

        // Update boarding status untuk tiket yang masih ACTIVE tapi jadwalnya sudah lewat
        $missedBoardingCount = DB::table('tickets')
            ->join('bookings', 'tickets.booking_id', '=', 'bookings.id')
            ->join('schedules', 'bookings.schedule_id', '=', 'schedules.id')
            ->where('tickets.status', 'ACTIVE')
            ->where('tickets.boarding_status', 'NOT_BOARDED')
            ->where('tickets.checked_in', false)
            ->whereRaw("CONCAT(bookings.departure_date, ' ', schedules.departure_time) < ?", [now()->format('Y-m-d H:i:s')])
            ->update([
                'tickets.boarding_status' => 'MISSED',
                'tickets.status' => 'EXPIRED'
            ]);

        $this->info("   - {$missedBoardingCount} tiket diupdate boarding status menjadi MISSED");
    }

    /**
     * Update status booking berdasarkan status check-in, boarding tiket, dan tanggal keberangkatan
     */
    private function updateBookingStatusesBasedOnTickets()
    {
        $this->info('5. Memeriksa konsistensi status booking berdasarkan tiket dan tanggal...');

        $updatedCompletedCount = 0;
        $updatedExpiredCount = 0;
        $now = Carbon::now();

        // Cari booking dengan status CONFIRMED
        Booking::where('status', 'CONFIRMED')
            ->with('tickets')
            ->chunk(100, function ($bookings) use (&$updatedCompletedCount, &$updatedExpiredCount, $now) {
                foreach ($bookings as $booking) {
                    // Pengecekan 1: Semua tiket sudah di-boarding (untuk update ke COMPLETED)
                    $allTicketsBoarded = $booking->tickets->isNotEmpty() &&
                        $booking->tickets->every(function ($ticket) {
                            return $ticket->boarding_status == 'BOARDED';
                        });

                    // Pengecekan 2: Semua tiket sudah expired (untuk update ke EXPIRED)
                    $allTicketsExpired = $booking->tickets->isNotEmpty() &&
                        $booking->tickets->every(function ($ticket) {
                            return $ticket->status == 'EXPIRED';
                        });

                    // Pengecekan 3: Tanggal keberangkatan sudah lewat (untuk update ke EXPIRED)
                    $departureDate = Carbon::parse($booking->departure_date);
                    $isDatePassed = $departureDate->endOfDay()->isPast();

                    // Cek apakah booking seharusnya COMPLETED
                    if ($allTicketsBoarded) {
                        $booking->status = 'COMPLETED';
                        $booking->save();
                        $updatedCompletedCount++;

                        Log::info('Booking diupdate menjadi COMPLETED karena semua tiket sudah di-boarding', [
                            'booking_id' => $booking->id,
                            'booking_code' => $booking->booking_code
                        ]);
                    }
                    // Cek apakah booking seharusnya EXPIRED
                    else if (($allTicketsExpired || $isDatePassed) && $booking->status != 'COMPLETED') {
                        $booking->status = 'EXPIRED';
                        
                        // PERUBAHAN: Tambahkan alasan pembatalan yang profesional
                        $booking->cancellation_reason = 'Jadwal keberangkatan telah terlewati. Pemesanan dibatalkan secara otomatis oleh sistem.';
                        
                        $booking->save();
                        $updatedExpiredCount++;

                        Log::info('Booking diupdate menjadi EXPIRED', [
                            'booking_id' => $booking->id,
                            'booking_code' => $booking->booking_code,
                            'reason' => $allTicketsExpired ? 'semua tiket expired' : 'tanggal keberangkatan sudah lewat',
                            'cancellation_reason' => $booking->cancellation_reason
                        ]);
                    }
                }
            });

        $this->info("   - {$updatedCompletedCount} booking diupdate menjadi COMPLETED");
        $this->info("   - {$updatedExpiredCount} booking diupdate menjadi EXPIRED");
        
        // PERUBAHAN: Tambahkan pencarian booking dengan tiket EXPIRED tapi status booking belum diupdate
        $this->info("   - Mencari booking tambahan yang perlu diupdate karena tiket EXPIRED...");
        
        $additionalExpiredCount = 0;
        
        // Temukan booking yang memiliki tiket EXPIRED tapi status booking belum EXPIRED
        $bookingsToUpdate = DB::table('bookings')
            ->whereIn('bookings.status', ['CONFIRMED', 'PENDING'])
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('tickets')
                    ->whereRaw('tickets.booking_id = bookings.id')
                    ->where('tickets.status', 'EXPIRED');
            })
            ->select('bookings.id', 'bookings.booking_code')
            ->get();
            
        if ($bookingsToUpdate->isNotEmpty()) {
            foreach ($bookingsToUpdate as $bookingInfo) {
                $booking = Booking::find($bookingInfo->id);
                if ($booking) {
                    $booking->status = 'EXPIRED';
                    $booking->cancellation_reason = 'Jadwal keberangkatan telah terlewati. Pemesanan dibatalkan secara otomatis oleh sistem.';
                    $booking->save();
                    
                    $additionalExpiredCount++;
                    
                    Log::info('Booking tambahan diupdate menjadi EXPIRED', [
                        'booking_id' => $booking->id,
                        'booking_code' => $booking->booking_code,
                        'cancellation_reason' => $booking->cancellation_reason
                    ]);
                }
            }
        }
        
        if ($additionalExpiredCount > 0) {
            $this->info("   - {$additionalExpiredCount} booking tambahan diupdate menjadi EXPIRED");
        } else {
            $this->info("   - Tidak ada booking tambahan yang perlu diupdate");
        }
        
        $this->info("   Total " . ($updatedExpiredCount + $additionalExpiredCount) . " booking diupdate menjadi EXPIRED");

        // PERUBAHAN: Tambahkan pencarian booking dengan tanggal keberangkatan yang telah lewat
        $this->info("   - Mencari booking dengan tanggal keberangkatan yang telah lewat...");
        
        $pastDateBookingsCount = 0;
        
        // Temukan semua booking dengan tanggal keberangkatan yang sudah lewat tapi belum EXPIRED atau COMPLETED
        $pastDateBookings = Booking::whereIn('status', ['CONFIRMED', 'PENDING'])
            ->where('departure_date', '<', Carbon::today())
            ->get();
            
        foreach ($pastDateBookings as $booking) {
            $booking->status = 'EXPIRED';
            $booking->cancellation_reason = 'Jadwal keberangkatan telah terlewati. Pemesanan dibatalkan secara otomatis oleh sistem.';
            $booking->save();
            
            // Update tiket terkait
            Ticket::where('booking_id', $booking->id)
                ->update([
                    'status' => 'EXPIRED',
                    'boarding_status' => 'MISSED'
                ]);
                
            $pastDateBookingsCount++;
            
            Log::info('Booking dengan tanggal lampau diupdate menjadi EXPIRED', [
                'booking_id' => $booking->id,
                'booking_code' => $booking->booking_code,
                'departure_date' => $booking->departure_date,
                'cancellation_reason' => $booking->cancellation_reason
            ]);
        }
        
        if ($pastDateBookingsCount > 0) {
            $this->info("   - {$pastDateBookingsCount} booking dengan tanggal lampau diupdate menjadi EXPIRED");
        } else {
            $this->info("   - Tidak ada booking dengan tanggal lampau yang perlu diupdate");
        }
        
        $this->info("   Total booking diupdate menjadi EXPIRED: " . 
            ($updatedExpiredCount + $additionalExpiredCount + $pastDateBookingsCount));
    }
}