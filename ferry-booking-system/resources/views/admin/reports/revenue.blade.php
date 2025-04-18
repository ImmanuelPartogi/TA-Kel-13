@extends('layouts.app')

@section('content')
<div class="container px-4 py-6 mx-auto">
    <div class="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Laporan Pendapatan</h1>
        <form action="{{ route('admin.reports.revenue') }}" method="GET" class="mt-3 md:mt-0">
            <input type="hidden" name="start_date" value="{{ $startDate->format('Y-m-d') }}">
            <input type="hidden" name="end_date" value="{{ $endDate->format('Y-m-d') }}">
            <input type="hidden" name="group_by" value="{{ $request->group_by }}">
            @if($request->route_id)
                <input type="hidden" name="route_id" value="{{ $request->route_id }}">
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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="font-medium">Periode: <span class="text-gray-700">{{ $startDate->format('d F Y') }} - {{ $endDate->format('d F Y') }}</span></span>
                </div>
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    <span class="font-medium">Pengelompokan:
                        <span class="text-gray-700">
                            @if($request->group_by == 'daily')
                                Harian
                            @elseif($request->group_by == 'weekly')
                                Mingguan
                            @elseif($request->group_by == 'monthly')
                                Bulanan
                            @endif
                        </span>
                    </span>
                </div>
                @if($request->route_id)
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span class="font-medium">Rute: <span class="text-gray-700">{{ \App\Models\Route::find($request->route_id)->origin ?? '' }} - {{ \App\Models\Route::find($request->route_id)->destination ?? '' }}</span></span>
                </div>
                @endif
            </div>
        </div>
    </div>

    <!-- Kartu Ringkasan -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Total Pendapatan -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-green-500">
            <div class="p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold text-green-600 uppercase">Total Pendapatan</p>
                        <p class="mt-2 text-3xl font-bold text-gray-800">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</p>
                    </div>
                    <div class="rounded-full bg-green-100 p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Total Transaksi -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-blue-500">
            <div class="p-5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold text-blue-600 uppercase">Total Transaksi</p>
                        <p class="mt-2 text-3xl font-bold text-gray-800">{{ $totalTransactions }}</p>
                    </div>
                    <div class="rounded-full bg-blue-100 p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Grafik Pendapatan -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <h2 class="text-lg font-semibold text-green-600">Grafik Pendapatan</h2>
            </div>
            <div class="p-6">
                <div class="w-full h-80">
                    <canvas id="revenueChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Form Filter -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <h2 class="text-lg font-semibold text-green-600">Filter Laporan</h2>
            </div>
            <div class="p-6">
                <form action="{{ route('admin.reports.revenue') }}" method="GET">
                    <div class="mb-4">
                        <label for="start_date" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                        <input type="date" id="start_date" name="start_date" value="{{ $startDate->format('Y-m-d') }}" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>
                    <div class="mb-4">
                        <label for="end_date" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                        <input type="date" id="end_date" name="end_date" value="{{ $endDate->format('Y-m-d') }}" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>
                    <div class="mb-4">
                        <label for="route_id" class="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                        <select id="route_id" name="route_id"
                                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            <option value="">Semua Rute</option>
                            @foreach(\App\Models\Route::where('status', 'ACTIVE')->get() as $route)
                                <option value="{{ $route->id }}" {{ $request->route_id == $route->id ? 'selected' : '' }}>
                                    {{ $route->origin }} - {{ $route->destination }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-4">
                        <label for="group_by" class="block text-sm font-medium text-gray-700 mb-1">Kelompokkan Berdasarkan</label>
                        <select id="group_by" name="group_by" required
                                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            <option value="daily" {{ $request->group_by == 'daily' ? 'selected' : '' }}>Harian</option>
                            <option value="weekly" {{ $request->group_by == 'weekly' ? 'selected' : '' }}>Mingguan</option>
                            <option value="monthly" {{ $request->group_by == 'monthly' ? 'selected' : '' }}>Bulanan</option>
                        </select>
                    </div>
                    <button type="submit" class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition-colors w-full justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter
                    </button>
                </form>
            </div>
        </div>
    </div>

    <!-- Tabel Detail Pendapatan -->
    <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 class="text-lg font-semibold text-green-600">Detail Pendapatan</h2>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200" id="dataTable">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            @if($request->group_by == 'daily')
                                Tanggal
                            @elseif($request->group_by == 'weekly')
                                Minggu
                            @elseif($request->group_by == 'monthly')
                                Bulan
                            @endif
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Transaksi</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pendapatan</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rata-rata per Transaksi</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    @foreach($revenues as $revenue)
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ $revenue->period }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $revenue->transaction_count }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {{ number_format($revenue->total_amount, 0, ',', '.') }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {{ number_format($revenue->transaction_count > 0 ? $revenue->total_amount / $revenue->transaction_count : 0, 0, ',', '.') }}</td>
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

    // Prepare chart data
    const labels = {!! json_encode($revenues->pluck('period')->toArray()) !!};
    const amounts = {!! json_encode($revenues->pluck('total_amount')->toArray()) !!};
    const transactions = {!! json_encode($revenues->pluck('transaction_count')->toArray()) !!};

    // Revenue Chart
    const ctx = document.getElementById('revenueChart').getContext('2d');
    const revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pendapatan (Rp)',
                    data: amounts,
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Jumlah Transaksi',
                    data: transactions,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Pendapatan (Rp)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Jumlah Transaksi'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
});
</script>
@endsection
