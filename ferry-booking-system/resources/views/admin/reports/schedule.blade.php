@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Laporan Jadwal</h1>
        <form action="{{ route('admin.reports.schedule') }}" method="GET" class="d-inline">
            <input type="hidden" name="start_date" value="{{ $startDate->format('Y-m-d') }}">
            <input type="hidden" name="end_date" value="{{ $endDate->format('Y-m-d') }}">
            @if(request('route_id'))
                <input type="hidden" name="route_id" value="{{ request('route_id') }}">
            @endif
            <button type="submit" class="d-none d-sm-inline-block btn btn-sm btn-success shadow-sm" name="export" value="csv">
                <i class="fas fa-download fa-sm text-white-50"></i> Export CSV
            </button>
        </form>
    </div>

    <div class="row">
        <!-- Date range info -->
        <div class="col-md-12 mb-4">
            <div class="card shadow">
                <div class="card-body">
                    <h5>Periode: {{ $startDate->format('d F Y') }} - {{ $endDate->format('d F Y') }}</h5>
                    @if(request('route_id'))
                        @php
                            $route = \App\Models\Route::find(request('route_id'));
                        @endphp
                        @if($route)
                            <h5>Rute: {{ $route->origin }} - {{ $route->destination }}</h5>
                        @endif
                    @endif
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Filter Form -->
        <div class="col-md-12 mb-4">
            <div class="card shadow">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Filter Laporan</h6>
                </div>
                <div class="card-body">
                    <form action="{{ route('admin.reports.schedule') }}" method="GET" class="row">
                        <div class="col-md-4 mb-3">
                            <label for="start_date">Tanggal Mulai</label>
                            <input type="date" class="form-control" id="start_date" name="start_date" value="{{ $startDate->format('Y-m-d') }}" required>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="end_date">Tanggal Akhir</label>
                            <input type="date" class="form-control" id="end_date" name="end_date" value="{{ $endDate->format('Y-m-d') }}" required>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="route_id">Rute</label>
                            <select class="form-control" id="route_id" name="route_id">
                                <option value="">Semua Rute</option>
                                @foreach(\App\Models\Route::where('status', 'ACTIVE')->get() as $route)
                                    <option value="{{ $route->id }}" {{ request('route_id') == $route->id ? 'selected' : '' }}>
                                        {{ $route->origin }} - {{ $route->destination }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-12">
                            <button type="submit" class="btn btn-primary">Filter</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Summary Charts -->
    <div class="row">
        <div class="col-xl-6 col-lg-6">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Distribusi Penumpang per Jadwal</h6>
                </div>
                <div class="card-body">
                    <div class="chart-pie">
                        <canvas id="passengerDistributionChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-6 col-lg-6">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Distribusi Jenis Kendaraan</h6>
                </div>
                <div class="card-body">
                    <div class="chart-pie">
                        <canvas id="vehicleDistributionChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Schedule Stats Table -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Detail Statistik Jadwal</h6>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>ID Jadwal</th>
                            <th>Rute</th>
                            <th>Kapal</th>
                            <th>Waktu</th>
                            <th>Hari</th>
                            <th>Jml Tanggal</th>
                            <th>Penumpang</th>
                            <th>Motor</th>
                            <th>Mobil</th>
                            <th>Bus</th>
                            <th>Truk</th>
                            <th>Okupansi(%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($scheduleStats as $stat)
                        <tr>
                            <td>{{ $stat['schedule_id'] }}</td>
                            <td>{{ $stat['route'] }}</td>
                            <td>{{ $stat['ferry'] }}</td>
                            <td>{{ $stat['time'] }}</td>
                            <td>{{ $stat['days'] }}</td>
                            <td>{{ $stat['dates_count'] }}</td>
                            <td>{{ $stat['passenger_count'] }}</td>
                            <td>{{ $stat['motorcycle_count'] }}</td>
                            <td>{{ $stat['car_count'] }}</td>
                            <td>{{ $stat['bus_count'] }}</td>
                            <td>{{ $stat['truck_count'] }}</td>
                            <td>{{ number_format($stat['average_occupancy_rate'], 2) }}%</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
$(document).ready(function() {
    $('#dataTable').DataTable();

    // Prepare data for passenger distribution chart
    const scheduleLabels = {!! json_encode(collect($scheduleStats)->pluck('time')->toArray()) !!};
    const passengerCounts = {!! json_encode(collect($scheduleStats)->pluck('passenger_count')->toArray()) !!};

    // Prepare data for vehicle distribution chart
    let totalMotorcycles = 0;
    let totalCars = 0;
    let totalBuses = 0;
    let totalTrucks = 0;

    @foreach($scheduleStats as $stat)
        totalMotorcycles += {{ $stat['motorcycle_count'] }};
        totalCars += {{ $stat['car_count'] }};
        totalBuses += {{ $stat['bus_count'] }};
        totalTrucks += {{ $stat['truck_count'] }};
    @endforeach

    // Passenger Distribution Chart
    const passengerCtx = document.getElementById('passengerDistributionChart').getContext('2d');
    const passengerChart = new Chart(passengerCtx, {
        type: 'bar',
        data: {
            labels: scheduleLabels,
            datasets: [{
                label: 'Jumlah Penumpang',
                data: passengerCounts,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Vehicle Distribution Chart
    const vehicleCtx = document.getElementById('vehicleDistributionChart').getContext('2d');
    const vehicleChart = new Chart(vehicleCtx, {
        type: 'pie',
        data: {
            labels: ['Motor', 'Mobil', 'Bus', 'Truk'],
            datasets: [{
                data: [totalMotorcycles, totalCars, totalBuses, totalTrucks],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Distribusi Kendaraan'
                }
            }
        }
    });
});
</script>
@endsection
