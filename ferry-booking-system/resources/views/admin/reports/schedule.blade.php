@extends('layouts.app')

@section('content')
<div class="container px-4 py-6 mx-auto">
    <div class="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Laporan Jadwal</h1>
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
    </div>

    <!-- Informasi Rentang Tanggal -->
    <div class="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
        <div class="p-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            {{ $stat['average_occupancy_rate'] > 80 ? 'text-green-600' :
                              ($stat['average_occupancy_rate'] > 50 ? 'text-blue-600' : 'text-yellow-600') }}">
                            {{ number_format($stat['average_occupancy_rate'], 2) }}%
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
                    'rgba(99, 102, 241, 0.2)',
                    'rgba(16, 185, 129, 0.2)',
                    'rgba(245, 158, 11, 0.2)',
                    'rgba(239, 68, 68, 0.2)',
                    'rgba(76, 29, 149, 0.2)',
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(76, 29, 149, 1)',
                ],
                borderWidth: 1
            }]
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
                }
            }
        }
    });
});
</script>
@endsection
