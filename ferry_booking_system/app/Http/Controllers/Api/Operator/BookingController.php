<?php

namespace App\Http\Controllers\Api\Operator;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingLog;
use App\Models\Payment;
use App\Models\ScheduleDate;
use App\Models\Ticket;
use App\Models\Route;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    /**
     * Mendapatkan daftar booking
     */
    public function index(Request $request)
    {
        $operator = Auth::user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        // Log untuk debugging
        Log::info("Operator ID: " . $operator->id . " assigned routes: " . json_encode($assignedRouteIds));

        // Jika operator tidak memiliki rute yang ditugaskan
        if (empty($assignedRouteIds)) {
            return response()->json([
                'status' => 'success',
                'data' => [
                    'bookings' => [
                        'data' => [],
                        'current_page' => 1,
                        'last_page' => 1,
                        'per_page' => 10,
                        'total' => 0
                    ],
                    'routes' => []
                ],
                'message' => 'Operator tidak memiliki rute yang ditugaskan'
            ], 200);
        }

        $query = Booking::query();

        // Filter berdasarkan assigned routes
        $query->whereHas('schedule', function ($q) use ($assignedRouteIds) {
            $q->whereIn('route_id', $assignedRouteIds);
        });

        // Load relasi yang dibutuhkan
        $query->with(['user', 'schedule.route', 'schedule.ferry', 'payments', 'tickets', 'vehicles']);

        // Filter berdasarkan kode booking
        if ($request->has('booking_code') && $request->booking_code) {
            $query->where('booking_code', 'like', '%' . $request->booking_code . '%');
        }

        // Filter berdasarkan nama pengguna
        if ($request->has('user_name') && $request->user_name) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->user_name . '%');
            });
        }

        // Filter berdasarkan rute
        if ($request->has('route_id') && $request->route_id) {
            $query->whereHas('schedule', function ($q) use ($request) {
                $q->where('route_id', $request->route_id);
            });
        }

        // Filter berdasarkan status booking
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan tanggal keberangkatan (bukan booking date)
        if ($request->has('departure_date_from') && $request->departure_date_from) {
            $query->where('departure_date', '>=', $request->departure_date_from);
        }

        if ($request->has('departure_date_to') && $request->departure_date_to) {
            $query->where('departure_date', '<=', $request->departure_date_to);
        }

        // Urutkan dan paginate hasil
        $bookings = $query->orderBy('created_at', 'desc')->paginate(10);

        // Get data rute untuk filter dropdown
        $routes = [];
        if (!empty($assignedRouteIds)) {
            $routes = Route::whereIn('id', $assignedRouteIds)
                ->get(['id', 'origin', 'destination'])
                ->mapWithKeys(function ($item) {
                    return [$item->id => $item->origin . ' - ' . $item->destination];
                })
                ->toArray();
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'bookings' => $bookings,
                'routes' => $routes
            ]
        ]);
    }

    /**
     * Mendapatkan detail booking
     */
    public function show($id)
    {
        $operator = Auth::user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        if (empty($assignedRouteIds)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke booking ini karena belum ada rute yang ditugaskan'
            ], 403);
        }

        try {
            // Filter berdasarkan rute
            $booking = Booking::whereHas('schedule', function ($q) use ($assignedRouteIds) {
                $q->whereIn('route_id', $assignedRouteIds);
            })
                ->where('id', $id)
                ->with([
                    'user',
                    'schedule.route',
                    'schedule.ferry',
                    'payments',
                    'tickets',
                    'vehicles',
                    'bookingLogs', // Hapus relasi changedBy
                ])
                ->firstOrFail();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'data' => $booking
                ]
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error("Booking tidak ditemukan atau operator tidak memiliki akses: " . $id);
            return response()->json([
                'status' => 'error',
                'message' => 'Booking tidak ditemukan atau Anda tidak memiliki akses ke booking ini'
            ], 404);
        }
    }

    /**
     * Mengubah status booking
     */
    public function updateStatus(Request $request, $id)
    {
        $operator = Auth::user();
        $assignedRouteIds = $operator->assigned_routes ?? [];

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:CONFIRMED,CANCELLED,COMPLETED',
            'cancellation_reason' => 'required_if:status,CANCELLED',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $booking = Booking::whereHas('schedule', function ($q) use ($assignedRouteIds) {
                $q->whereIn('route_id', $assignedRouteIds);
            })
                ->where('id', $id)
                ->firstOrFail();

            $previousStatus = $booking->status;

            // Validate status transition
            $allowedTransitions = [
                'PENDING' => ['CONFIRMED', 'CANCELLED'],
                'CONFIRMED' => ['COMPLETED', 'CANCELLED'],
            ];

            if (!isset($allowedTransitions[$booking->status]) || !in_array($request->status, $allowedTransitions[$booking->status])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Perubahan status tidak diizinkan'
                ], 400);
            }

            try {
                DB::beginTransaction();

                $booking->status = $request->status;

                if ($request->status === 'CANCELLED') {
                    $booking->cancellation_reason = $request->cancellation_reason;

                    // Update ticket status
                    Ticket::where('booking_id', $booking->id)
                        ->update(['status' => 'CANCELLED']);

                    // Free up space in schedule date
                    $scheduleDate = ScheduleDate::where('schedule_id', $booking->schedule_id)
                        ->where('date', $booking->departure_date)
                        ->first();

                    if ($scheduleDate) {
                        $scheduleDate->passenger_count -= $booking->passenger_count;

                        // Count vehicles by type
                        $vehicleCounts = [
                            'MOTORCYCLE' => 0,
                            'CAR' => 0,
                            'BUS' => 0,
                            'TRUCK' => 0
                        ];

                        foreach ($booking->vehicles as $vehicle) {
                            $vehicleCounts[$vehicle->type]++;
                        }

                        $scheduleDate->motorcycle_count -= $vehicleCounts['MOTORCYCLE'];
                        $scheduleDate->car_count -= $vehicleCounts['CAR'];
                        $scheduleDate->bus_count -= $vehicleCounts['BUS'];
                        $scheduleDate->truck_count -= $vehicleCounts['TRUCK'];

                        $scheduleDate->save();
                    }
                } elseif ($request->status === 'COMPLETED') {
                    // Update ticket status
                    Ticket::where('booking_id', $booking->id)
                        ->update(['status' => 'USED']);
                }

                $booking->save();

                // Create booking log
                $bookingLog = new BookingLog([
                    'booking_id' => $booking->id,
                    'previous_status' => $previousStatus,
                    'new_status' => $booking->status,
                    'changed_by_type' => 'OPERATOR',
                    'changed_by_id' => Auth::id(),
                    'notes' => $request->notes ?? 'Status diubah oleh operator',
                    'ip_address' => $request->ip(),
                ]);

                $bookingLog->save();

                // Update payment status if needed
                if ($request->status === 'CONFIRMED' && $previousStatus === 'PENDING') {
                    $payment = Payment::where('booking_id', $booking->id)
                        ->where('status', 'PENDING')
                        ->first();

                    if ($payment) {
                        $payment->status = 'SUCCESS';
                        $payment->payment_date = now();
                        $payment->save();
                    }
                } elseif ($request->status === 'CANCELLED') {
                    $payment = Payment::where('booking_id', $booking->id)
                        ->where('status', 'PENDING')
                        ->first();

                    if ($payment) {
                        $payment->status = 'FAILED';
                        $payment->save();
                    }
                }

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Status booking berhasil diperbarui',
                    'data' => $booking
                ]);
            } catch (\Exception $e) {
                DB::rollBack();

                return response()->json([
                    'status' => 'error',
                    'message' => 'Terjadi kesalahan saat mengubah status booking: ' . $e->getMessage()
                ], 500);
            }
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Booking tidak ditemukan atau Anda tidak memiliki akses ke booking ini'
            ], 404);
        }
    }
}
