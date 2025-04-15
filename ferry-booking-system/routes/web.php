<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\OperatorController;
use App\Http\Controllers\Admin\RouteController as AdminRouteController;
use App\Http\Controllers\Admin\FerryController;
use App\Http\Controllers\Admin\ScheduleController as AdminScheduleController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AdminLoginController;
use App\Http\Controllers\Operator\DashboardController as OperatorDashboardController;
use App\Http\Controllers\Operator\ScheduleController as OperatorScheduleController;
use App\Http\Controllers\Operator\BookingController as OperatorBookingController;
use App\Http\Controllers\Operator\ReportController as OperatorReportController;
use App\Http\Controllers\Auth\OperatorLoginController;
use App\Http\Controllers\Auth\BackendLoginController;

// Admin Authentication
Route::middleware('guest:admin')->group(function () {
    Route::get('/admin/login', [BackendLoginController::class, 'showAdminLoginForm'])->name('admin.login');
    Route::post('/admin/login', [BackendLoginController::class, 'adminLogin'])->name('admin.login.submit');
});
Route::post('/admin/logout', [BackendLoginController::class, 'adminLogout'])->name('admin.logout')->middleware('auth:admin');

// Admin Panel
Route::prefix('admin')->middleware(['auth:admin'])->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // Admin Management (Super Admin only)
    Route::middleware(['super_admin'])->group(function () {
        Route::resource('admins', AdminController::class, ['as' => 'admin']);
        Route::resource('operators', OperatorController::class, ['as' => 'admin']);
    });

    // Routes
    Route::resource('routes', AdminRouteController::class, ['as' => 'admin']);

    // Ferries
    Route::resource('ferries', FerryController::class, ['as' => 'admin']);

    // Schedules
    Route::resource('schedules', AdminScheduleController::class, ['as' => 'admin']);
    Route::get('/schedules/{id}/dates', [AdminScheduleController::class, 'dates'])->name('admin.schedules.dates');
    Route::put('/schedules/{id}/dates/{dateId}', [AdminScheduleController::class, 'updateDate'])->name('admin.schedules.update-date');

    // Bookings
    Route::resource('bookings', AdminBookingController::class, ['as' => 'admin'])->except(['edit', 'update', 'destroy']);
    Route::put('/bookings/{id}/status', [AdminBookingController::class, 'updateStatus'])->name('admin.bookings.update-status');

    // Users
    Route::resource('users', UserController::class, ['as' => 'admin'])->except(['create', 'store']);

    // Reports
    Route::get('/reports', [AdminReportController::class, 'index'])->name('admin.reports.index');
    Route::get('/reports/booking', [AdminReportController::class, 'bookingReport'])->name('admin.reports.booking');
    Route::get('/reports/revenue', [AdminReportController::class, 'revenueReport'])->name('admin.reports.revenue');
    Route::get('/reports/schedule', [AdminReportController::class, 'scheduleReport'])->name('admin.reports.schedule');
});

// Operator Authentication
Route::middleware('guest:operator')->group(function () {
    Route::get('/operator/login', [BackendLoginController::class, 'showOperatorLoginForm'])->name('operator.login');
    Route::post('/operator/login', [BackendLoginController::class, 'operatorLogin'])->name('operator.login.submit');
});
Route::post('/operator/logout', [BackendLoginController::class, 'operatorLogout'])->name('operator.logout')->middleware('auth:operator');

// Operator Panel
Route::prefix('operator')->middleware(['auth:operator'])->group(function () {
    Route::get('/', [OperatorDashboardController::class, 'index'])->name('operator.dashboard');
    Route::get('/dashboard', [OperatorDashboardController::class, 'index'])->name('operator.dashboard');

    // Schedules
    Route::get('/schedules', [OperatorScheduleController::class, 'index'])->name('operator.schedules.index');
    Route::get('/schedules/{id}', [OperatorScheduleController::class, 'show'])->name('operator.schedules.show');
    Route::get('/schedules/{id}/dates', [OperatorScheduleController::class, 'dates'])->name('operator.schedules.dates');
    Route::put('/schedules/{id}/dates/{dateId}/status', [OperatorScheduleController::class, 'updateDateStatus'])->name('operator.schedules.update-date-status');

    // Bookings
    Route::get('/bookings', [OperatorBookingController::class, 'index'])->name('operator.bookings.index');
    Route::get('/bookings/{id}', [OperatorBookingController::class, 'show'])->name('operator.bookings.show');
    Route::put('/bookings/{id}/status', [OperatorBookingController::class, 'updateStatus'])->name('operator.bookings.update-status');

    // Check-in
    Route::get('/check-in', [OperatorBookingController::class, 'checkIn'])->name('operator.bookings.check-in');
    Route::post('/check-in', [OperatorBookingController::class, 'processCheckIn'])->name('operator.bookings.process-check-in');

    // Reports
    Route::get('/reports', [OperatorReportController::class, 'index'])->name('operator.reports.index');
    Route::get('/reports/daily', [OperatorReportController::class, 'dailyReport'])->name('operator.reports.daily');
    Route::get('/reports/monthly', [OperatorReportController::class, 'monthlyReport'])->name('operator.reports.monthly');
});
