<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\ChatbotController;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Chatbot routes yang dapat diakses publik
Route::prefix('chatbot')->group(function () {
    Route::post('/conversation', [ChatbotController::class, 'getConversation']);
    Route::post('/send', [ChatbotController::class, 'sendMessage']);
    Route::post('/feedback', [ChatbotController::class, 'sendFeedback']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    // Routes
    Route::get('/routes', [RouteController::class, 'index']);
    Route::get('/routes/{id}', [RouteController::class, 'show']);

    // Schedules
    Route::get('/schedules', [ScheduleController::class, 'index']);
    Route::get('/schedules/{id}', [ScheduleController::class, 'show']);

    // Bookings
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);

    // Payments
    // PERBAIKAN: Ganti endpoint yang hilang
    Route::get('/payments/status/{bookingCode}', [PaymentController::class, 'status']);
    Route::post('/payments/{bookingCode}/create', [PaymentController::class, 'create']);
    Route::post('/payments/{bookingCode}/cancel', [PaymentController::class, 'cancel']);

    // TAMBAHAN: Endpoint untuk memperbarui metode pembayaran
    Route::post('/payments/{bookingCode}/update-method', [PaymentController::class, 'updatePaymentMethod']);

    // Instruksi pembayaran
    Route::get('/payments/instructions/{paymentType}/{paymentMethod}', [PaymentController::class, 'getInstructions']);

    // TAMBAHAN: Endpoint untuk debugging
    Route::get('/payments/debug/{bookingCode}', [PaymentController::class, 'debug']);

    // Tickets
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::post('/tickets/{ticketCode}/check-in', [TicketController::class, 'checkIn']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/{id}', [NotificationController::class, 'show']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

    // Vehicles
    Route::get('/vehicles', [VehicleController::class, 'index']);
    Route::get('/vehicles/{id}', [VehicleController::class, 'show']);
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::put('/vehicles/{id}', [VehicleController::class, 'update']);
    Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);

    // Chatbot routes yang memerlukan autentikasi
    Route::get('/chatbot/conversations', [ChatbotController::class, 'getUserConversations']);
});

Route::post('/test', function (Request $request) {
    return response()->json([
        'message' => 'Berhasil akses route /test',
        'data_dikirim' => $request->all(),
    ]);
});

// Route untuk callback Midtrans - Harus dapat diakses tanpa autentikasi
Route::post('/payments/notification', [PaymentController::class, 'notification']);
