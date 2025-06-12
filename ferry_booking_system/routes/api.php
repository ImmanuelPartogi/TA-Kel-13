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
| Import Controller - User API
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\Api\User\AuthController;
use App\Http\Controllers\Api\User\RouteController;
use App\Http\Controllers\Api\User\ScheduleController;
use App\Http\Controllers\Api\User\BookingController;
use App\Http\Controllers\Api\User\PaymentController;
use App\Http\Controllers\Api\User\TicketController;
use App\Http\Controllers\Api\User\NotificationController;
use App\Http\Controllers\Api\User\VehicleController;
use App\Http\Controllers\Api\User\ChatbotController;
use App\Http\Controllers\Api\User\PollingController;
use App\Http\Controllers\Api\User\RefundController;
use App\Http\Controllers\Api\User\VehicleCategoryController;

/*
|--------------------------------------------------------------------------
| Import Controller - Admin Panel
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminController;
use App\Http\Controllers\Api\Admin\OperatorController;
use App\Http\Controllers\Api\Admin\RouteController as AdminRouteController;
use App\Http\Controllers\Api\Admin\FerryController;
use App\Http\Controllers\Api\Admin\ScheduleController as AdminScheduleController;
use App\Http\Controllers\Api\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Api\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Api\Admin\RefundController as AdminRefundController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\VehicleCategoryController as AdminVehicleCategoryController;

/*
|--------------------------------------------------------------------------
| Import Controller - Operator Panel
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\Api\WelcomeController;
use App\Http\Controllers\Api\Operator\DashboardController as OperatorDashboardController;
use App\Http\Controllers\Api\Operator\ScheduleController as OperatorScheduleController;
use App\Http\Controllers\Api\Operator\BookingController as OperatorBookingController;
use App\Http\Controllers\Api\Operator\ReportController as OperatorReportController;
use App\Http\Controllers\Api\Auth\BackendLoginController;
use App\Http\Controllers\Api\Operator\CheckInController;

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
Route::get('/public/routes', [WelcomeController::class, 'getRoutes']);

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

    // User Refund Routes
    Route::prefix('refunds')->group(function () {
        Route::get('/eligibility/{bookingId}', [RefundController::class, 'checkRefundEligibility']);
        Route::post('/request', [RefundController::class, 'requestRefund']);
        Route::get('/booking/{bookingId}', [RefundController::class, 'getRefundDetailsByBookingId']);
        Route::post('/{refundId}/cancel', [RefundController::class, 'cancelRefund']);
    });

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

    Route::get('/vehicle-categories', [VehicleCategoryController::class, 'index']);
    Route::get('/vehicle-categories/type/{type}', [VehicleCategoryController::class, 'getByType']);
});

/*
|--------------------------------------------------------------------------
| 3. ADMIN PANEL API ROUTES (REACT JS)
|--------------------------------------------------------------------------
|
| Rute API untuk panel admin, diproteksi dengan auth:sanctum dan role admin
|
*/
Route::prefix('admin-panel')->middleware(['auth:sanctum'])->group(function () {
    // Dashboard
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
        Route::get('/routes', [OperatorController::class, 'getRoutes']);
        Route::get('/{id}', [OperatorController::class, 'show']);
        Route::post('/', [OperatorController::class, 'store']);
        Route::put('/{id}', [OperatorController::class, 'update']);
        Route::delete('/{id}', [OperatorController::class, 'destroy']);
        Route::post('/check-email', [OperatorController::class, 'checkEmailAvailability']);
        Route::put('/{id}/status', [OperatorController::class, 'toggleStatus']);
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
        Route::get('/get-schedules', [AdminBookingController::class, 'getSchedulesForBooking']);
        Route::get('/search-users', [AdminBookingController::class, 'searchUsers']);
        Route::get('/{id}', [AdminBookingController::class, 'show']);
        Route::put('/{id}/status', [AdminBookingController::class, 'updateStatus']);

        // Reschedule
        Route::get('/{id}/reschedule', [AdminBookingController::class, 'rescheduleForm']);
        Route::post('/get-available-schedules', [AdminBookingController::class, 'getAvailableSchedules']);
        Route::post('/{id}/process-reschedule', [AdminBookingController::class, 'processReschedule']);

        // Refund Creation Routes (these should be here to avoid conflicts)
        Route::get('/{bookingId}/refund/create', [AdminRefundController::class, 'create']);
        Route::post('/{bookingId}/refund', [AdminRefundController::class, 'store']);
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

    // FIXED: Refunds Management
    Route::prefix('refunds')->group(function () {
        // IMPORTANT: Specific routes MUST come before parameterized routes
        Route::get('/policy/settings', [AdminRefundController::class, 'getPolicySettings']);
        Route::post('/policy/update', [AdminRefundController::class, 'updatePolicySettings']);

        // List & Basic Operations
        Route::get('/', [AdminRefundController::class, 'index']);
        Route::get('/{id}', [AdminRefundController::class, 'show']);
        Route::post('/{id}/approve', [AdminRefundController::class, 'approve']);
        Route::post('/{id}/reject', [AdminRefundController::class, 'reject']);
        Route::post('/{id}/complete', [AdminRefundController::class, 'complete']);
    });

    Route::prefix('vehicle-categories')->group(function () {
        Route::get('/', [AdminVehicleCategoryController::class, 'index']);
        Route::post('/', [AdminVehicleCategoryController::class, 'store']);
        Route::get('/{vehicleCategory}', [AdminVehicleCategoryController::class, 'show']);
        Route::put('/{vehicleCategory}', [AdminVehicleCategoryController::class, 'update']);
        Route::delete('/{vehicleCategory}', [AdminVehicleCategoryController::class, 'destroy']);
        Route::put('/{vehicleCategory}/status', [AdminVehicleCategoryController::class, 'toggleStatus']);
        Route::get('/by-type', [AdminVehicleCategoryController::class, 'getCategoriesByType']);
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

Route::prefix('operator-panel')->middleware(['auth:sanctum'])->group(function () {
    // Dashboard
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

        // Check-in routes
        Route::prefix('check-in')->group(function () {
            Route::post('/validate', [CheckInController::class, 'validate']);
            Route::post('/process', [CheckInController::class, 'process']);
        });
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
