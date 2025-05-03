@extends('layouts.app')

@section('content')
<div class="container px-4 py-6 mx-auto">
    <div class="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Laporan Jadwal</h1>
        <div class="flex space-x-2">
            <form action="{{ route('admin.reports.schedule') }}" method="GET" class="mt-3 md:mt-0">
                <input type="hidden" name="start_date" value="{{ $startDate->format('Y-m-d') }}">
                <input type="hidden" name="end_date" value="{{ $endDate->format('Y-m-d') }}">
                @if(request('route_id'))
                    <input type="hidden" name="route_id" value="{{ request('route_id') }}">
                @endif
                <button type="submit" class="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md" name="export" value="csv">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                </button>
            </form>
            <button id="printReport" class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md mt-3 md:mt-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
            </button>
        </div>
    </div>

    <!-- Informasi Rentang Tanggal -->
    <div class="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
        <div class="p-5">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="font-medium">Periode: <span class="text-gray-700">{{ $startDate->format('d F Y') }} - {{ $endDate->format('d F Y') }}</span></span>
                </div>
                @if(request('route_id'))
                    @php
                        $route = \App\Models\Route::find(request('route_id'));
                    @endphp
                    @if($route)
                    <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span class="font-medium">Rute: <span class="text-gray-700">{{ $route->origin }} - {{ $route->destination }}</span></span>
                    </div>
                    @endif
                @endif
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-medium">Data Terakhir: <span class="text-gray-700">{{ \Carbon\Carbon::now()->format('d F Y H:i:s') }}</span></span>
                </div>
            </div>
        </div>
    </div>

    <!-- Kartu Ringkasan -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Total Penumpang -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-indigo-500">
            <div class="p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold text-indigo-600 uppercase">Total Penumpang</p>
                        <p class="mt-2 text-3xl font-bold text-gray-800">{{ number_format($totalPassengers, 0, ',', '.') }}</p>
                    </div>
                    <div class="rounded-full bg-indigo-100 p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Total Kendaraan -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-yellow-500">
            <div class="p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold text-yellow-600 uppercase">Total Kendaraan</p>
                        <p class="mt-2 text-3xl font-bold text-gray-800">{{ number_format($totalVehicles, 0, ',', '.') }}</p>
                    </div>
                    <div class="rounded-full bg-yellow-100 p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Okupansi Rata-rata -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-blue-500">
            <div class="p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold text-blue-600 uppercase">Okupansi Rata-rata</p>
                        <p class="mt-2 text-3xl font-bold text-gray-800">{{ number_format($overallOccupancyRate, 2) }}%</p>
                    </div>
                    <div class="rounded-full bg-blue-100 p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tanggal Terbanyak -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-green-500">
            <div class="p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold text-green-600 uppercase">Jumlah Jadwal</p>
                        <p class="mt-2 text-3xl font-bold text-gray-800">{{ $scheduleStats->count() }}</p>
                    </div>
                    <div class="rounded-full bg-green-100 p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Form Filter -->
    <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 class="text-lg font-semibold text-indigo-600">Filter Laporan</h2>
        </div>
        <div class="p-6">
            <form action="{{ route('admin.reports.schedule') }}" method="GET">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                        <label for="start_date" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                        <input type="date" id="start_date" name="start_date" value="{{ $startDate->format('Y-m-d') }}" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    </div>
                    <div>
                        <label for="end_date" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                        <input type="date" id="end_date" name="end_date" value="{{ $endDate->format('Y-m-d') }}" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    </div>
                    <div>
                        <label for="route_id" class="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                        <select id="route_id" name="route_id"
                                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            <option value="">Semua Rute</option>
                            @foreach(\App\Models\Route::where('status', 'ACTIVE')->get() as $route)
                                <option value="{{ $route->id }}" {{ request('route_id') == $route->id ? 'selected' : '' }}>
                                    {{ $route->origin }} - {{ $route->destination }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                </div>
                <div>
                    <button type="submit" class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Chart Summary -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Distribusi Penumpang -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <h2 class="text-lg font-semibold text-indigo-600">Distribusi Penumpang per Jadwal</h2>
            </div>
            <div class="p-6">
                <div class="w-full h-64">
                    <canvas id="passengerDistributionChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Distribusi Kendaraan -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <h2 class="text-lg font-semibold text-indigo-600">Distribusi Jenis Kendaraan</h2>
            </div>
            <div class="p-6">
                <div class="w-full h-64">
                    <canvas id="vehicleDistributionChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- Grafik Okupansi Harian -->
    <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 class="text-lg font-semibold text-indigo-600">Trend Okupansi Jadwal Teratas</h2>
        </div>
        <div class="p-6">
            <div class="w-full h-80">
                <canvas id="occupancyTrendChart"></canvas>
            </div>
        </div>
    </div>

    <!-- Tabel Statistik Jadwal -->
    <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 class="text-lg font-semibold text-indigo-600">Detail Statistik Jadwal</h2>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200" id="dataTable">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Jadwal</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapal</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jml Tanggal</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penumpang</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motor</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobil</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truk</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Okupansi(%)</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    @foreach($scheduleStats as $stat)
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ $stat['schedule_id'] }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $stat['route'] }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $stat['ferry'] }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $stat['time'] }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $stat['days'] }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $stat['dates_count'] }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $stat['passenger_count'] }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $stat['motorcycle_count'] }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $stat['car_count'] }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $stat['bus_count'] }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $stat['truck_count'] }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium
                            {{ $stat['passenger_occupancy_rate'] > 80 ? 'text-green-600' :
                              ($stat['passenger_occupancy_rate'] > 50 ? 'text-blue-600' : 'text-yellow-600') }}">
                            {{ number_format($stat['passenger_occupancy_rate'], 2) }}%
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
$(document).ready(function() {
    // DataTable dengan penambahan opsi
    $('#dataTable').DataTable({
        responsive: true,
        pageLength: 25,
        order: [[11, 'desc']], // Urutkan berdasarkan okupansi (descending)
        language: {
            search: "Cari:",
            lengthMenu: "Tampilkan _MENU_ entri",
            info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ entri",
            infoEmpty: "Menampilkan 0 sampai 0 dari 0 entri",
            infoFiltered: "(disaring dari _MAX_ total entri)",
            paginate: {
                first: "Pertama",
                last: "Terakhir",
                next: "Selanjutnya",
                previous: "Sebelumnya"
            }
        }
    });

    // Prepare data for passenger distribution chart
    const routeLabels = {!! json_encode(collect($scheduleStats)->pluck('route')->toArray()) !!};
    const scheduleLabels = {!! json_encode(collect($scheduleStats)->map(function($stat) {
        return $stat['route'] . ' (' . $stat['time'] . ')';
    })->toArray()) !!};
    const passengerCounts = {!! json_encode(collect($scheduleStats)->pluck('passenger_count')->toArray()) !!};
    const capacityPassengers = {!! json_encode(collect($scheduleStats)->pluck('max_passenger_capacity')->toArray()) !!};
    const occupancyRates = {!! json_encode(collect($scheduleStats)->pluck('passenger_occupancy_rate')->toArray()) !!};

    // Passenger Distribution Chart
    const passengerCtx = document.getElementById('passengerDistributionChart').getContext('2d');
    const passengerChart = new Chart(passengerCtx, {
        type: 'bar',
        data: {
            labels: scheduleLabels,
            datasets: [
                {
                    label: 'Jumlah Penumpang',
                    data: passengerCounts,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Kapasitas Maksimum',
                    data: capacityPassengers,
                    backgroundColor: 'rgba(209, 213, 219, 0.3)',
                    borderColor: 'rgba(209, 213, 219, 1)',
                    borderWidth: 1,
                    type: 'line'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Jumlah Penumpang'
                    }
                },
                x: {
                    ticks: {
                        display: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return scheduleLabels[context[0].dataIndex];
                        }
                    }
                },
                legend: {
                    position: 'top',
                }
            }
        }
    });

    // Prepare data for vehicle distribution chart
    const vehicleLabels = ['Motor', 'Mobil', 'Bus', 'Truk'];
    const vehicleCounts = [
        {{ collect($scheduleStats)->sum('motorcycle_count') }},
        {{ collect($scheduleStats)->sum('car_count') }},
        {{ collect($scheduleStats)->sum('bus_count') }},
        {{ collect($scheduleStats)->sum('truck_count') }}
    ];

    const percentages = [
        {{ $motorcyclePercentage }},
        {{ $carPercentage }},
        {{ $busPercentage }},
        {{ $truckPercentage }}
    ];

    // Vehicle Distribution Chart
    const vehicleCtx = document.getElementById('vehicleDistributionChart').getContext('2d');
    const vehicleChart = new Chart(vehicleCtx, {
        type: 'pie',
        data: {
            labels: vehicleLabels,
            datasets: [{
                data: vehicleCounts,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = percentages[context.dataIndex];
                            return `${label}: ${value} (${percentage.toFixed(1)}%)`;
                        }
                    }
                }
            }
        }
    });

    // Get top 5 schedules by occupancy rate
    const topSchedules = {!! json_encode(collect($scheduleStats)->sortByDesc('passenger_occupancy_rate')->take(5)->values()->toArray()) !!};

    // Create occupancy trend chart if daily occupancy data is available
    if (topSchedules.length > 0 && topSchedules[0].daily_occupancy) {
        const occupancyCtx = document.getElementById('occupancyTrendChart').getContext('2d');

        // Create datasets for each top schedule
        const datasets = topSchedules.map((schedule, index) => {
            const colors = [
                'rgba(99, 102, 241, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(239, 68, 68, 1)',
                'rgba(76, 29, 149, 1)'
            ];

            const backgroundColors = [
                'rgba(99, 102, 241, 0.2)',
                'rgba(16, 185, 129, 0.2)',
                'rgba(245, 158, 11, 0.2)',
                'rgba(239, 68, 68, 0.2)',
                'rgba(76, 29, 149, 0.2)'
            ];

            // Get dates and occupancy rates for this schedule
            const dates = schedule.daily_occupancy.map(day => day.date);
            const rates = schedule.daily_occupancy.map(day => day.occupancy_rate);

            return {
                label: `${schedule.route} (${schedule.time})`,
                data: rates,
                backgroundColor: backgroundColors[index],
                borderColor: colors[index],
                borderWidth: 2,
                fill: false,
                tension: 0.3
            };
        });

        // Get unique dates across all schedules
        const allDates = [...new Set(topSchedules.flatMap(schedule =>
            schedule.daily_occupancy.map(day => day.date)
        ))].sort();

        new Chart(occupancyCtx, {
            type: 'line',
            data: {
                labels: allDates,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tingkat Okupansi (%)'
                        },
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value.toFixed(1)}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Print functionality
    $('#printReport').on('click', function() {
        window.print();
    });
});
</script>
@endsection
