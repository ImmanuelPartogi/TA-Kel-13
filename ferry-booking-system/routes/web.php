<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\OperatorController;
use App\Http\Controllers\Admin\RouteController as AdminRouteController;
use App\Http\Controllers\Admin\FerryController;
use App\Http\Controllers\Admin\ScheduleController as AdminScheduleController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\BackendLoginController;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Operator\DashboardController as OperatorDashboardController;
use App\Http\Controllers\Operator\ScheduleController as OperatorScheduleController;
use App\Http\Controllers\Operator\BookingController as OperatorBookingController;
use App\Http\Controllers\Operator\ReportController as OperatorReportController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application.
|
*/

// Landing page routes
Route::get('/', [WelcomeController::class, 'index'])->name('home');
Route::get('/search', [WelcomeController::class, 'searchSchedule'])->name('search.schedule');
Route::get('/booking/{route_id}', [WelcomeController::class, 'bookingForm'])->name('booking.form');

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


    Route::resource('admins', AdminController::class, ['as' => 'admin']);

    Route::get('operators/create', [OperatorController::class, 'create'])->name('admin.operators.create');
    Route::post('operators', [OperatorController::class, 'store'])->name('admin.operators.store');

    // Operators Management (Semua Admin bisa melakukan operasi selain create/store)
    Route::get('operators', [OperatorController::class, 'index'])->name('admin.operators.index');
    Route::get('operators/{operator}', [OperatorController::class, 'show'])->name('admin.operators.show');
    Route::get('operators/{operator}/edit', [OperatorController::class, 'edit'])->name('admin.operators.edit');
    Route::put('operators/{operator}', [OperatorController::class, 'update'])->name('admin.operators.update');
    Route::delete('operators/{operator}', [OperatorController::class, 'destroy'])->name('admin.operators.destroy');

    // Routes Management
    Route::resource('routes', AdminRouteController::class, ['as' => 'admin']);
    Route::put('/routes/{id}/status', [AdminRouteController::class, 'updateStatus'])->name('admin.routes.update-status');

    // Ferries Management
    Route::resource('ferries', FerryController::class, ['as' => 'admin']);

    // Schedules Management
    Route::resource('schedules', AdminScheduleController::class, ['as' => 'admin']);
    Route::get('/schedules/{id}/dates', [AdminScheduleController::class, 'dates'])->name('admin.schedules.dates');
    Route::put('/schedules/{id}/dates/{dateId}', [AdminScheduleController::class, 'updateDate'])->name('admin.schedules.update-date');
    Route::post('/schedules/{id}/dates', [AdminScheduleController::class, 'addDates'])->name('admin.schedules.add-dates');
    Route::post('/admin/schedules/{id}/dates', [AdminScheduleController::class, 'storeDate'])->name('admin.schedules.store-date');
    Route::put('/admin/schedules/{schedule}/dates/{dateId}', [AdminScheduleController::class, 'updateDate'])->name('admin.schedules.update-date');
    Route::delete('/admin/schedules/{schedule}/dates/{date}', [AdminScheduleController::class, 'destroyDate'])->name('admin.schedules.destroy-date');
    
    // Bookings Management
    Route::resource('bookings', AdminBookingController::class, ['as' => 'admin'])->except(['edit', 'update', 'destroy']);
    Route::put('/bookings/{id}/status', [AdminBookingController::class, 'updateStatus'])->name('admin.bookings.update-status');

    // Users Management
    Route::resource('users', UserController::class, ['as' => 'admin'])->except(['create', 'store']);

    // Reports
    Route::get('/reports', [AdminReportController::class, 'index'])->name('admin.reports.index');
    Route::get('/reports/booking', [AdminReportController::class, 'bookingReport'])->name('admin.reports.booking');
    Route::get('/reports/revenue', [AdminReportController::class, 'revenueReport'])->name('admin.reports.revenue');
    Route::get('/reports/schedule', [AdminReportController::class, 'scheduleReport'])->name('admin.reports.schedule');
});

/*|--------------------------------------------------------------------------
| Operator Routes
|--------------------------------------------------------------------------
|
| Here is where you can register operator routes for your application.
|
| These routes are protected by the 'auth:operator' middleware.
| Only authenticated operators can access these routes.
|--------------------------------------------------------------------------|*/

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
    Route::post('/schedules/check-availability', [OperatorScheduleController::class, 'checkAvailability'])->name('operator.schedules.check-availability');

    // Bookings
    Route::get('/bookings', [OperatorBookingController::class, 'index'])->name('operator.bookings.index');
    Route::get('/bookings/{id}', [OperatorBookingController::class, 'show'])->name('operator.bookings.show');
    Route::put('/bookings/{id}/status', [OperatorBookingController::class, 'updateStatus'])->name('operator.bookings.update-status');

    // Check-in
    Route::get('/check-in', [OperatorBookingController::class, 'checkInForm'])->name('operator.bookings.check-in');
    Route::post('/check-in', [OperatorBookingController::class, 'processCheckIn'])->name('operator.bookings.process-check-in');
    Route::post('/bookings/{id}/check-in', [OperatorBookingController::class, 'checkIn'])->name('operator.bookings.perform-check-in');

    // Reports
    Route::get('/reports', [OperatorReportController::class, 'index'])->name('operator.reports.index');
    Route::get('/reports/daily', [OperatorReportController::class, 'dailyReport'])->name('operator.reports.daily');
    Route::get('/reports/monthly', [OperatorReportController::class, 'monthlyReport'])->name('operator.reports.monthly');
});
