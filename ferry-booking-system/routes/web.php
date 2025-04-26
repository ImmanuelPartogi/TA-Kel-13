<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
|
| These routes are accessible to all users without authentication
|
*/

// Import public controllers
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\Auth\BackendLoginController;

// Landing page routes
Route::get('/', [WelcomeController::class, 'index'])->name('home');
Route::get('/search', [WelcomeController::class, 'searchSchedule'])->name('search.schedule');
Route::get('/booking/{route_id}', [WelcomeController::class, 'bookingForm'])->name('booking.form');

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
|
| Routes for admin and operator authentication
|
*/

// Admin Authentication
Route::middleware('guest:admin')->group(function () {
    Route::get('/admin/login', [BackendLoginController::class, 'showAdminLoginForm'])->name('admin.login');
    Route::post('/admin/login', [BackendLoginController::class, 'adminLogin'])->name('admin.login.submit');
});
Route::post('/admin/logout', [BackendLoginController::class, 'adminLogout'])
    ->name('admin.logout')
    ->middleware('auth:admin');

// Operator Authentication
Route::middleware('guest:operator')->group(function () {
    Route::get('/operator/login', [BackendLoginController::class, 'showOperatorLoginForm'])->name('operator.login');
    Route::post('/operator/login', [BackendLoginController::class, 'operatorLogin'])->name('operator.login.submit');
});
Route::post('/operator/logout', [BackendLoginController::class, 'operatorLogout'])
    ->name('operator.logout')
    ->middleware('auth:operator');

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Import admin controllers
|
*/
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\OperatorController;
use App\Http\Controllers\Admin\RouteController as AdminRouteController;
use App\Http\Controllers\Admin\FerryController;
use App\Http\Controllers\Admin\ScheduleController as AdminScheduleController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\UserController;

// Admin routes with authentication
Route::prefix('admin')->middleware(['auth:admin'])->name('admin.')->group(function () {
    // Dashboard
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Admins Management
    Route::resource('admins', AdminController::class);

    // Operators Management
    Route::resource('operators', OperatorController::class);

    // Routes Management
    Route::resource('routes', AdminRouteController::class);
    Route::put('/routes/{id}/status', [AdminRouteController::class, 'updateStatus'])->name('routes.update-status');

    // Ferries Management
    Route::resource('ferries', FerryController::class);

    // Schedules Management
    Route::resource('schedules', AdminScheduleController::class);
    Route::prefix('schedules')->name('schedules.')->group(function () {
        Route::get('/{id}/dates', [AdminScheduleController::class, 'dates'])->name('dates');
        Route::post('/{id}/dates', [AdminScheduleController::class, 'storeDate'])->name('store-date');
        Route::post('/{id}/dates/add', [AdminScheduleController::class, 'addDates'])->name('add-dates');
        Route::put('/{schedule}/dates/{dateId}', [AdminScheduleController::class, 'updateDate'])->name('update-date');
        Route::delete('/{schedule}/dates/{date}', [AdminScheduleController::class, 'destroyDate'])->name('destroy-date');
    });

    // Bookings Management
    Route::resource('bookings', AdminBookingController::class)->except(['edit', 'update', 'destroy']);
    Route::put('/bookings/{id}/status', [AdminBookingController::class, 'updateStatus'])->name('bookings.update-status');

    // Users Management
    Route::resource('users', UserController::class)->except(['create', 'store']);

    // Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [AdminReportController::class, 'index'])->name('index');
        Route::get('/booking', [AdminReportController::class, 'bookingReport'])->name('booking');
        Route::get('/revenue', [AdminReportController::class, 'revenueReport'])->name('revenue');
        Route::get('/schedule', [AdminReportController::class, 'scheduleReport'])->name('schedule');

        // Exported reports
        Route::get('/booking/export', [AdminReportController::class, 'exportBookingReport'])->name('booking.export');
        Route::get('/revenue/export', [AdminReportController::class, 'exportRevenueReport'])->name('revenue.export');
    });
});

/*
|--------------------------------------------------------------------------
| Operator Routes
|--------------------------------------------------------------------------
|
| Import operator controllers
|
*/
use App\Http\Controllers\Operator\DashboardController as OperatorDashboardController;
use App\Http\Controllers\Operator\ScheduleController as OperatorScheduleController;
use App\Http\Controllers\Operator\BookingController as OperatorBookingController;
use App\Http\Controllers\Operator\ReportController as OperatorReportController;

// Operator routes with authentication
Route::prefix('operator')->middleware(['auth:operator'])->name('operator.')->group(function () {
    // Dashboard
    Route::get('/', [OperatorDashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [OperatorDashboardController::class, 'index'])->name('dashboard');

    // Schedules
    Route::prefix('schedules')->name('schedules.')->group(function () {
        Route::get('/', [OperatorScheduleController::class, 'index'])->name('index');
        Route::get('/{id}', [OperatorScheduleController::class, 'show'])->name('show');
        Route::get('/{id}/dates', [OperatorScheduleController::class, 'dates'])->name('dates');
        Route::put('/{id}/dates/{dateId}/status', [OperatorScheduleController::class, 'updateDateStatus'])->name('update-date-status');

        // Schedule dates
        Route::get('/{id}/dates/create', [OperatorScheduleController::class, 'createDate'])->name('create-date');
        Route::post('/{id}/dates', [OperatorScheduleController::class, 'storeDate'])->name('store-date');
        Route::get('/{id}/dates/{dateId}/edit', [OperatorScheduleController::class, 'editDate'])->name('edit-date');
        Route::put('/{id}/dates/{dateId}', [OperatorScheduleController::class, 'updateDate'])->name('update-date');
        Route::delete('/{id}/dates/{dateId}', [OperatorScheduleController::class, 'destroyDate'])->name('destroy-date');
    });

    // Bookings
    Route::prefix('bookings')->name('bookings.')->group(function () {
        Route::get('/', [OperatorBookingController::class, 'index'])->name('index');
        Route::get('/{id}', [OperatorBookingController::class, 'show'])->name('show');
        Route::put('/{id}/status', [OperatorBookingController::class, 'updateStatus'])->name('update-status');
        Route::post('/{id}/check-in', [OperatorBookingController::class, 'checkIn'])->name('perform-check-in');
    });

    // Check-in
    Route::get('/check-in', [OperatorBookingController::class, 'checkInForm'])->name('bookings.check-in');
    Route::post('/check-in', [OperatorBookingController::class, 'processCheckIn'])->name('bookings.process-check-in');

    // Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [OperatorReportController::class, 'index'])->name('index');
        Route::get('/daily', [OperatorReportController::class, 'dailyReport'])->name('daily');
        Route::get('/monthly', [OperatorReportController::class, 'monthlyReport'])->name('monthly');

        // Exported reports
        Route::get('/daily/export', [OperatorReportController::class, 'exportDailyReport'])->name('daily.export');
        Route::get('/monthly/export', [OperatorReportController::class, 'exportMonthlyReport'])->name('monthly.export');
    });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Routes for AJAX and API functions - with rate limiting
|
*/

// API untuk operator
Route::prefix('api/operator')->middleware(['auth:operator', 'throttle:60,1'])->name('api.operator.')->group(function() {
    // Check kapasitas dan ketersediaan jadwal
    Route::post('/schedules/check-availability', [OperatorScheduleController::class, 'checkAvailability'])
        ->name('schedules.check-availability');

    // Validasi booking sebelum check-in
    Route::post('/bookings/validate', [OperatorBookingController::class, 'validateBooking'])
        ->name('bookings.validate');
});

// API untuk admin
Route::prefix('api/admin')->middleware(['auth:admin', 'throttle:60,1'])->name('api.admin.')->group(function() {
    // Dashboard stats
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'getStats'])
        ->name('dashboard.stats');

    // Check email operator tersedia
    Route::post('/operators/check-email', [OperatorController::class, 'checkEmailAvailability'])
        ->name('operators.check-email');
});

// Error dan Fallback routes
Route::fallback(function() {
    return response()->view('errors.404', [], 404);
});
