<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\Auth\BackendLoginController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\OperatorController;
use App\Http\Controllers\Admin\RouteController as AdminRouteController;
use App\Http\Controllers\Admin\FerryController;
use App\Http\Controllers\Admin\ScheduleController as AdminScheduleController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Operator\DashboardController as OperatorDashboardController;
use App\Http\Controllers\Operator\ScheduleController as OperatorScheduleController;
use App\Http\Controllers\Operator\BookingController as OperatorBookingController;
use App\Http\Controllers\Operator\ReportController as OperatorReportController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
|
| These routes are accessible to all users without authentication
|
*/

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
| These routes are accessible only to authenticated admins
|
*/

Route::prefix('admin')->middleware(['auth:admin'])->name('admin.')->group(function () {
    // Dashboard
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Admins Management
    Route::resource('admins', AdminController::class);

    // Operators Management
    Route::resource('operators', OperatorController::class)->except(['create', 'store']);
    Route::get('operators/create', [OperatorController::class, 'create'])->name('operators.create');
    Route::post('operators', [OperatorController::class, 'store'])->name('operators.store');

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
    });
});

/*
|--------------------------------------------------------------------------
| Operator Routes
|--------------------------------------------------------------------------
|
| These routes are accessible only to authenticated operators
|
*/

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
        Route::post('/check-availability', [OperatorScheduleController::class, 'checkAvailability'])->name('check-availability');
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
    });
});
