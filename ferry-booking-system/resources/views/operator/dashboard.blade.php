@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-lg-3 col-6">
            <div class="small-box bg-info">
                <div class="inner">
                    <h3>{{ $totalSchedules }}</h3>
                    <p>Total Jadwal</p>
                </div>
                <div class="icon">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <a href="{{ route('operator.schedules.index') }}" class="small-box-footer">
                    Lihat Detail <i class="fas fa-arrow-circle-right"></i>
                </a>
            </div>
        </div>

        <div class="col-lg-3 col-6">
            <div class="small-box bg-success">
                <div class="inner">
                    <h3>{{ $totalBookings }}</h3>
                    <p>Total Booking</p>
                </div>
                <div class="icon">
                    <i class="fas fa-ticket-alt"></i>
                </div>
                <a href="{{ route('operator.bookings.index') }}" class="small-box-footer">
                    Lihat Detail <i class="fas fa-arrow-circle-right"></i>
                </a>
            </div>
        </div>

        <div class="col-lg-3 col-6">
            <div class="small-box bg-warning">
                <div class="inner">
                    <h3>{{ $bookingsThisMonth }}</h3>
                    <p>Booking Bulan Ini</p>
                </div>
                <div class="icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <a href="{{ route('operator.bookings.index') }}" class="small-box-footer">
                    Lihat Detail <i class="fas fa-arrow-circle-right"></i>
                </a>
            </div>
        </div>

        <div class="col-lg-3 col-6">
            <div class="small-box bg-danger">
                <div class="inner">
                    <h3>Rp {{ number_format($revenueThisMonth, 0, ',', '.') }}</h3>
                    <p>Pendapatan Bulan Ini</p>
                </div>
                <div class="icon">
                    <i class="fas fa-money-bill"></i>
                </div>
                <a href="{{ route('operator.reports.monthly', ['month' => date('Y-m')]) }}" class="small-box-footer">
                    Lihat Detail <i class="fas fa-arrow-circle-right"></i>
                </a>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Grafik Booking Seminggu Terakhir</h3>
                </div>
                <div class="card-body">
                    <div class="chart">
                        <canvas id="bookingChart" style="min-height: 250px; height: 250px; max-height: 250px; max-width: 100%;"></canvas>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Jadwal Hari Ini</h3>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Rute</th>
                                    <th>Kapal</th>
                                    <th>Keberangkatan</th>
                                    <th>Kedatangan</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($todaySchedules as $schedule)
                                <tr>
                                    <td>{{ $schedule->route->origin }} - {{ $schedule->route->destination }}</td>
                                    <td>{{ $schedule->ferry->name }}</td>
                                    <td>{{ $schedule->departure_time }}</td>
                                    <td>{{ $schedule->arrival_time }}</td>
                                    <td>
                                        <a href="{{ route('operator.reports.daily', ['date' => date('Y-m-d')]) }}" class="btn btn-sm btn-info">
                                            <i class="fas fa-eye"></i> Lihat Laporan
                                        </a>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="5" class="text-center">Tidak ada jadwal untuk hari ini</td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Menu Pintasan</h3>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-6">
                            <a href="{{ route('operator.bookings.check-in') }}" class="btn btn-block btn-primary btn-lg mb-3">
                                <i class="fas fa-check-circle"></i><br>
                                Check-in<br>Penumpang
                            </a>
                        </div>
                        <div class="col-6">
                            <a href="{{ route('operator.bookings.index') }}" class="btn btn-block btn-info btn-lg mb-3">
                                <i class="fas fa-list"></i><br>
                                Daftar<br>Booking
                            </a>
                        </div>
                        <div class="col-6">
                            <a href="{{ route('operator.schedules.index') }}" class="btn btn-block btn-success btn-lg mb-3">
                                <i class="fas fa-calendar-alt"></i><br>
                                Kelola<br>Jadwal
                            </a>
                        </div>
                        <div class="col-6">
                            <a href="{{ route('operator.reports.index') }}" class="btn btn-block btn-warning btn-lg mb-3">
                                <i class="fas fa-chart-bar"></i><br>
                                Laporan<br>Operasional
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Aktivitas Terkini</h3>
                </div>
                <div class="card-body p-0">
                    <div id="recentActivities">
                        <!-- Recent activities would be loaded here via AJAX if needed -->
                        <ul class="products-list product-list-in-card pl-2 pr-2">
                            <li class="item">
                                <div class="product-info">
                                    <a href="javascript:void(0)" class="product-title">
                                        Check-in Penumpang
                                        <span class="badge badge-success float-right">Sukses</span>
                                    </a>
                                    <span class="product-description">
                                        Proses check-in tiket #TKT123456 berhasil dilakukan
                                    </span>
                                    <small class="text-muted">5 menit yang lalu</small>
                                </div>
                            </li>
                            <li class="item">
                                <div class="product-info">
                                    <a href="javascript:void(0)" class="product-title">
                                        Update Status Booking
                                        <span class="badge badge-info float-right">Konfirmasi</span>
                                    </a>
                                    <span class="product-description">
                                        Booking #BK987654 dikonfirmasi
                                    </span>
                                    <small class="text-muted">15 menit yang lalu</small>
                                </div>
                            </li>
                            <li class="item">
                                <div class="product-info">
                                    <a href="javascript:void(0)" class="product-title">
                                        Update Status Jadwal
                                        <span class="badge badge-warning float-right">Perubahan</span>
                                    </a>
                                    <span class="product-description">
                                        Status jadwal tanggal 25/04/2025 diubah menjadi WEATHER_ISSUE
                                    </span>
                                    <small class="text-muted">30 menit yang lalu</small>
                                </div>
                            </li>
                        </ul>
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
    $(function() {
        // Booking chart data
        var bookingData = @json($bookingChartData);

        // Get context with jQuery - using jQuery's .get() method.
        var bookingChartCanvas = $('#bookingChart').get(0).getContext('2d');

        var bookingChartData = {
            labels: bookingData.map(item => item.date),
            datasets: [
                {
                    label: 'Jumlah Booking',
                    backgroundColor: 'rgba(60,141,188,0.9)',
                    borderColor: 'rgba(60,141,188,0.8)',
                    pointRadius: 3,
                    pointColor: '#3b8bba',
                    pointStrokeColor: 'rgba(60,141,188,1)',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(60,141,188,1)',
                    data: bookingData.map(item => item.total)
                }
            ]
        };

        var bookingChartOptions = {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };

        // This will get the first returned node in the jQuery collection.
        new Chart(bookingChartCanvas, {
            type: 'line',
            data: bookingChartData,
            options: bookingChartOptions
        });
    });
</script>
@endsection
