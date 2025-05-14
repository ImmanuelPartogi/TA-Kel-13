<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| FERRY BOOKING SYSTEM - API ROUTES
|--------------------------------------------------------------------------
|
| Konfigurasi rute API untuk Ferry Booking System yang melayani:
| 1. Aplikasi Mobile (Flutter)
| 2. Panel Admin (React JS)
| 3. Panel Operator (React JS)
|
*/

/*
|--------------------------------------------------------------------------
| Import Controller - Mobile API
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\PollingController;
use App\Http\Controllers\Api\RefundController;

/*
|--------------------------------------------------------------------------
| Import Controller - Admin Panel
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\AdminApi\DashboardController as AdminDashboardController;
use App\Http\Controllers\AdminApi\AdminController;
use App\Http\Controllers\AdminApi\OperatorController;
use App\Http\Controllers\AdminApi\RouteController as AdminRouteController;
use App\Http\Controllers\AdminApi\FerryController;
use App\Http\Controllers\AdminApi\ScheduleController as AdminScheduleController;
use App\Http\Controllers\AdminApi\BookingController as AdminBookingController;
use App\Http\Controllers\AdminApi\ReportController as AdminReportController;
use App\Http\Controllers\AdminApi\RefundController as AdminRefundController;
use App\Http\Controllers\AdminApi\UserController;

/*
|--------------------------------------------------------------------------
| Import Controller - Operator Panel
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\OperatorApi\DashboardController as OperatorDashboardController;
use App\Http\Controllers\OperatorApi\ScheduleController as OperatorScheduleController;
use App\Http\Controllers\OperatorApi\BookingController as OperatorBookingController;
use App\Http\Controllers\OperatorApi\ReportController as OperatorReportController;
use App\Http\Controllers\AuthApi\BackendLoginController;

/*
|--------------------------------------------------------------------------
| 1. PUBLIC API ROUTES
|--------------------------------------------------------------------------
|
| Rute API yang dapat diakses tanpa autentikasi
|
*/

// Landing page routes
Route::get('/', [WelcomeController::class, 'index'])->name('home');
Route::get('/search', [WelcomeController::class, 'searchSchedule'])->name('search.schedule');
Route::get('/booking/{route_id}', [WelcomeController::class, 'bookingForm'])->name('booking.form');

// Authentication Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Payment Callback Routes - Harus dapat diakses tanpa autentikasi
Route::post('/payments/notification', [PaymentController::class, 'notification']);
Route::post('/polling/payments', [PollingController::class, 'triggerPaymentPolling']);
Route::get('/payments/{bookingCode}/refresh-status', [PaymentController::class, 'refreshStatus']);

// Chatbot Public Routes
Route::prefix('chatbot')->group(function () {
    Route::post('/conversation', [ChatbotController::class, 'getConversation']);
    Route::post('/send', [ChatbotController::class, 'sendMessage']);
    Route::post('/feedback', [ChatbotController::class, 'sendFeedback']);
});

// Test Route
Route::post('/test', function (Request $request) {
    return response()->json([
        'message' => 'Berhasil akses route /test',
        'data_dikirim' => $request->all(),
    ]);
});

/*
|--------------------------------------------------------------------------
| 2. MOBILE API ROUTES (FLUTTER)
|--------------------------------------------------------------------------
|
| Rute API untuk aplikasi mobile, diproteksi dengan auth:sanctum
|
*/

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
    Route::get('/payments/status/{bookingCode}', [PaymentController::class, 'status']);
    Route::post('/payments/{bookingCode}/create', [PaymentController::class, 'create']);
    Route::post('/payments/{bookingCode}/cancel', [PaymentController::class, 'cancel']);
    Route::post('/payments/{bookingCode}/update-method', [PaymentController::class, 'updatePaymentMethod']);
    Route::get('/payments/instructions/{paymentType}/{paymentMethod}', [PaymentController::class, 'getInstructions']);
    Route::get('/payments/{bookingCode}/manual-check', [PaymentController::class, 'manualCheck']);
    Route::get('/payments/debug/{bookingCode}', [PaymentController::class, 'debug']);
    Route::get('/payments/{bookingCode}/check-status', [PaymentController::class, 'manualCheckStatus']);

    // Tickets
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::post('/tickets/{ticketCode}/check-in', [TicketController::class, 'checkIn']);

    // Vehicles
    Route::get('/vehicles', [VehicleController::class, 'index']);
    Route::get('/vehicles/{id}', [VehicleController::class, 'show']);
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::put('/vehicles/{id}', [VehicleController::class, 'update']);
    Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);

    // Chatbot Authenticated Routes
    Route::get('/chatbot/conversations', [ChatbotController::class, 'getUserConversations']);

    // Refund Routes
    Route::post('/refunds/request', [RefundController::class, 'requestRefund']);
    Route::get('/refunds/booking/{bookingId}', [RefundController::class, 'getRefundDetails']);
    Route::post('/refunds/{refundId}/cancel', [RefundController::class, 'cancelRefund']);

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/types', [NotificationController::class, 'getTypes']);
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCount']);
        Route::get('/stats', [NotificationController::class, 'getStats']);
        Route::get('/grouped', [NotificationController::class, 'getGroupedByDate']);
        Route::get('/type/{type}', [NotificationController::class, 'getByType']);
        Route::get('/{id}', [NotificationController::class, 'show']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'delete']);
        Route::delete('/read/all', [NotificationController::class, 'deleteRead']);
    });
});

/*
|--------------------------------------------------------------------------
| 3. ADMIN PANEL API ROUTES (REACT JS)
|--------------------------------------------------------------------------
|
| Rute API untuk panel admin, diproteksi dengan auth:sanctum dan role admin
|
*/
Route::prefix('admin-panel')->middleware(['auth:sanctum'])->group(function () {    // Dashboard    // Dashboard
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'getStats']);
    Route::get('/dashboard/summary', [AdminDashboardController::class, 'getSummary']);

    // Admins Management
    Route::prefix('admins')->group(function () {
        Route::get('/', [AdminController::class, 'index']);
        Route::get('/{id}', [AdminController::class, 'show']);
        Route::post('/', [AdminController::class, 'store']);
        Route::put('/{id}', [AdminController::class, 'update']);
        Route::delete('/{id}', [AdminController::class, 'destroy']);
    });

    // Operators Management
    Route::prefix('operators')->group(function () {
        Route::get('/', [OperatorController::class, 'index']);
        Route::get('/{id}', [OperatorController::class, 'show']);
        Route::post('/', [OperatorController::class, 'store']);
        Route::put('/{id}', [OperatorController::class, 'update']);
        Route::delete('/{id}', [OperatorController::class, 'destroy']);
        Route::post('/check-email', [OperatorController::class, 'checkEmailAvailability']);
    });

    // Routes Management
    Route::prefix('routes')->group(function () {
        Route::get('/', [AdminRouteController::class, 'index']);
        Route::get('/{id}', [AdminRouteController::class, 'show']);
        Route::post('/', [AdminRouteController::class, 'store']);
        Route::put('/{id}', [AdminRouteController::class, 'update']);
        Route::delete('/{id}', [AdminRouteController::class, 'destroy']);
        Route::put('/{id}/status', [AdminRouteController::class, 'updateStatus']);
    });

    // Ferries Management
    Route::prefix('ferries')->group(function () {
        Route::get('/', [FerryController::class, 'index']);
        Route::get('/{id}', [FerryController::class, 'show']);
        Route::post('/', [FerryController::class, 'store']);
        Route::put('/{id}', [FerryController::class, 'update']);
        Route::delete('/{id}', [FerryController::class, 'destroy']);
    });

    // Schedules Management
    Route::prefix('schedules')->group(function () {
        Route::get('/', [AdminScheduleController::class, 'index']);
        Route::get('/{id}', [AdminScheduleController::class, 'show']);
        Route::post('/', [AdminScheduleController::class, 'store']);
        Route::put('/{id}', [AdminScheduleController::class, 'update']);
        Route::delete('/{id}', [AdminScheduleController::class, 'destroy']);

        // Schedule Dates
        Route::get('/{id}/dates', [AdminScheduleController::class, 'dates']);
        Route::post('/{id}/dates', [AdminScheduleController::class, 'storeDate']);
        Route::post('/{id}/dates/add', [AdminScheduleController::class, 'addDates']);
        Route::put('/{schedule}/dates/{dateId}', [AdminScheduleController::class, 'updateDate']);
        Route::delete('/{schedule}/dates/{date}', [AdminScheduleController::class, 'destroyDate']);
        Route::get('/{schedule}/dates/{dateId}', [AdminScheduleController::class, 'showDate']);
    });

    // Bookings Management
    Route::prefix('bookings')->group(function () {
        Route::get('/', [AdminBookingController::class, 'index']);
        Route::get('/create', [AdminBookingController::class, 'create']);
        Route::post('/', [AdminBookingController::class, 'store']);
        Route::get('/get-schedules', [AdminBookingController::class, 'getSchedulesForBooking']); // Tambahkan ini
        Route::get('/search-users', [AdminBookingController::class, 'searchUsers']);
        Route::get('/{id}', [AdminBookingController::class, 'show']);
        Route::put('/{id}/status', [AdminBookingController::class, 'updateStatus']);

        // Reschedule
        Route::get('/{id}/reschedule', [AdminBookingController::class, 'rescheduleForm']);
        Route::post('/get-available-schedules', [AdminBookingController::class, 'getAvailableSchedules']);
        Route::post('/{id}/process-reschedule', [AdminBookingController::class, 'processReschedule']);
    });

    // Users Management
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
    });

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('/', [AdminReportController::class, 'index']);
        Route::get('/booking', [AdminReportController::class, 'bookingReport']);
        Route::get('/revenue', [AdminReportController::class, 'revenueReport']);
        Route::get('/schedule', [AdminReportController::class, 'scheduleReport']);
        Route::get('/booking/export', [AdminReportController::class, 'exportBookingReport']);
        Route::get('/revenue/export', [AdminReportController::class, 'exportRevenueReport']);
    });

    // Refunds
    Route::prefix('refunds')->group(function () {
        Route::get('/', [AdminRefundController::class, 'index']);
        Route::get('/{id}', [AdminRefundController::class, 'show']);
        Route::get('/create/{bookingId}', [AdminRefundController::class, 'create']);
        Route::post('/store/{bookingId}', [AdminRefundController::class, 'store']);
        Route::post('/{id}/approve', [AdminRefundController::class, 'approve']);
        Route::post('/{id}/reject', [AdminRefundController::class, 'reject']);
        Route::post('/{id}/complete', [AdminRefundController::class, 'complete']);
    });
});

/*
|--------------------------------------------------------------------------
| 4. OPERATOR PANEL API ROUTES (REACT JS)
|--------------------------------------------------------------------------
|
| Rute API untuk panel operator, diproteksi dengan auth:sanctum dan role operator
|
*/

Route::prefix('operator-panel')->middleware(['auth:sanctum'])->group(function () {    // Dashboard
    Route::get('/dashboard/stats', [OperatorDashboardController::class, 'getStats']);
    Route::get('/dashboard/summary', [OperatorDashboardController::class, 'getSummary']);

    // Schedules
    Route::prefix('schedules')->group(function () {
        Route::get('/', [OperatorScheduleController::class, 'index']);
        Route::get('/{id}', [OperatorScheduleController::class, 'show']);
        Route::get('/{id}/dates', [OperatorScheduleController::class, 'dates']);
        Route::put('/{id}/dates/{dateId}/status', [OperatorScheduleController::class, 'updateDateStatus']);

        // Schedule Dates
        Route::get('/{id}/dates/create', [OperatorScheduleController::class, 'createDate']);
        Route::post('/{id}/dates', [OperatorScheduleController::class, 'storeDate']);
        Route::get('/{id}/dates/{dateId}/edit', [OperatorScheduleController::class, 'editDate']);
        Route::put('/{id}/dates/{dateId}', [OperatorScheduleController::class, 'updateDate']);
        Route::delete('/{id}/dates/{dateId}', [OperatorScheduleController::class, 'destroyDate']);

        // Check Availability
        Route::post('/check-availability', [OperatorScheduleController::class, 'checkAvailability']);
    });

    // Bookings
    Route::prefix('bookings')->group(function () {
        Route::get('/', [OperatorBookingController::class, 'index']);
        Route::get('/{id}', [OperatorBookingController::class, 'show']);
        Route::put('/{id}/status', [OperatorBookingController::class, 'updateStatus']);
        Route::post('/{id}/check-in', [OperatorBookingController::class, 'checkIn']);
        Route::post('/validate', [OperatorBookingController::class, 'validateBooking']);
        Route::get('/check-in', [OperatorBookingController::class, 'checkInForm']);
        Route::post('/check-in', [OperatorBookingController::class, 'processCheckIn']);
    });

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('/', [OperatorReportController::class, 'index']);
        Route::get('/daily', [OperatorReportController::class, 'dailyReport']);
        Route::get('/monthly', [OperatorReportController::class, 'monthlyReport']);
        Route::get('/daily/export', [OperatorReportController::class, 'exportDailyReport']);
        Route::get('/monthly/export', [OperatorReportController::class, 'exportMonthlyReport']);
    });
});

/*
|--------------------------------------------------------------------------
| 5. AUTHENTICATION API UNTUK PANEL ADMIN & OPERATOR (REACT JS)
|--------------------------------------------------------------------------
|
| API untuk proses autentikasi panel admin dan operator
|
*/

// Login Admin
Route::post('/admin-panel/login', [BackendLoginController::class, 'adminApiLogin']);

// Login Operator
Route::post('/operator-panel/login', [BackendLoginController::class, 'operatorLogin']);

// Logout (Protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/admin-panel/logout', [BackendLoginController::class, 'adminApiLogout']);
    Route::post('/operator-panel/logout', [BackendLoginController::class, 'operatorApiLogout']);
});

/*
|--------------------------------------------------------------------------
| FALLBACK ROUTE
|--------------------------------------------------------------------------
*/

Route::fallback(function () {
    return response()->json([
        'status' => 'error',
        'message' => 'Route tidak ditemukan'
    ], 404);
});
