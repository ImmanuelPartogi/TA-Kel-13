@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-12">
            <h1 class="h3 mb-0 text-gray-800">Dashboard Admin</h1>
            <p class="mb-0">Selamat datang, {{ Auth::guard('admin')->user()->name }}!</p>
        </div>
    </div>

    <!-- Stats Cards Row -->
    <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-primary shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                Total Pengguna</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $totalUsers }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-users fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-success shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                Total Kapal</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $totalFerries }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-ship fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-info shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                Total Rute</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $totalRoutes }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-route fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-warning shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                Jadwal Aktif</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $totalActiveSchedules }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-calendar-check fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Booking & Revenue Stats Row -->
    <div class="row mb-4">
        <div class="col-xl-6 col-md-6 mb-4">
            <div class="card border-left-danger shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-danger text-uppercase mb-1">
                                Booking Bulan Ini</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $bookingsThisMonth }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-ticket-alt fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-6 col-md-6 mb-4">
            <div class="card border-left-success shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                Pendapatan Bulan Ini</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">Rp {{ number_format($revenueThisMonth, 0, ',', '.') }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-money-bill-wave fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Content Row -->
    <div class="row">
        <!-- Booking Chart -->
        <div class="col-xl-8 col-lg-7">
            <div class="card shadow mb-4">
                <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 class="m-0 font-weight-bold text-primary">Booking 7 Hari Terakhir</h6>
                </div>
                <div class="card-body">
                    <div class="chart-area">
                        <canvas id="bookingChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Booking Status Chart -->
        <div class="col-xl-4 col-lg-5">
            <div class="card shadow mb-4">
                <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 class="m-0 font-weight-bold text-primary">Status Booking</h6>
                </div>
                <div class="card-body">
                    <div class="chart-pie">
                        <canvas id="bookingStatusChart"></canvas>
                    </div>
                    <div class="mt-4 text-center small">
                        <span class="mr-2">
                            <i class="fas fa-circle text-primary"></i> Pending
                        </span>
                        <span class="mr-2">
                            <i class="fas fa-circle text-success"></i> Confirmed
                        </span>
                        <span class="mr-2">
                            <i class="fas fa-circle text-info"></i> Completed
                        </span>
                        <span class="mr-2">
                            <i class="fas fa-circle text-danger"></i> Cancelled
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Links -->
    <div class="row">
        <div class="col-12">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Akses Cepat</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3 mb-3">
                            <a href="{{ route('admin.routes.index') }}" class="card text-center p-4 h-100 text-decoration-none">
                                <div><i class="fas fa-route fa-3x mb-3 text-primary"></i></div>
                                <h5>Kelola Rute</h5>
                            </a>
                        </div>
                        <div class="col-md-3 mb-3">
                            <a href="{{ route('admin.ferries.index') }}" class="card text-center p-4 h-100 text-decoration-none">
                                <div><i class="fas fa-ship fa-3x mb-3 text-primary"></i></div>
                                <h5>Kelola Kapal</h5>
                            </a>
                        </div>
                        <div class="col-md-3 mb-3">
                            <a href="{{ route('admin.schedules.index') }}" class="card text-center p-4 h-100 text-decoration-none">
                                <div><i class="fas fa-calendar-alt fa-3x mb-3 text-primary"></i></div>
                                <h5>Kelola Jadwal</h5>
                            </a>
                        </div>
                        <div class="col-md-3 mb-3">
                            <a href="{{ route('admin.bookings.index') }}" class="card text-center p-4 h-100 text-decoration-none">
                                <div><i class="fas fa-ticket-alt fa-3x mb-3 text-primary"></i></div>
                                <h5>Lihat Booking</h5>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Booking Line Chart
    var ctxLine = document.getElementById('bookingChart');
    var bookingData = @json($bookingChartData);

    var labels = bookingData.map(function(item) {
        return item.date;
    });

    var data = bookingData.map(function(item) {
        return item.total;
    });

    new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Booking',
                data: data,
                backgroundColor: 'rgba(78, 115, 223, 0.05)',
                borderColor: 'rgba(78, 115, 223, 1)',
                pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Booking Status Pie Chart
    var ctxPie = document.getElementById('bookingStatusChart');
    var statusData = @json($bookingsByStatus);

    var statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    var statusLabels = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    var statusColors = ['#4e73df', '#1cc88a', '#36b9cc', '#e74a3b'];

    var statusValues = statuses.map(function(status) {
        return statusData[status] || 0;
    });

    new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: statusLabels,
            datasets: [{
                data: statusValues,
                backgroundColor: statusColors,
                hoverBackgroundColor: statusColors,
                hoverBorderColor: "rgba(234, 236, 244, 1)",
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            cutout: '70%'
        }
    });
});
</script>
@endsection
