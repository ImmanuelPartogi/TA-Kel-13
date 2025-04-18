@extends('layouts.app')

@section('content')
<div class="container px-4 py-6 mx-auto">
    <div class="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Laporan</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Laporan Booking -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <h2 class="text-lg font-semibold text-blue-600">Laporan Booking</h2>
            </div>
            <div class="p-6">
                <form action="{{ route('admin.reports.booking') }}" method="GET">
                    <div class="mb-4">
                        <label for="start_date" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai <span class="text-red-500">*</span></label>
                        <input type="date" id="start_date" name="start_date" value="{{ date('Y-m-01') }}" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div class="mb-4">
                        <label for="end_date" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir <span class="text-red-500">*</span></label>
                        <input type="date" id="end_date" name="end_date" value="{{ date('Y-m-t') }}" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div class="mb-4">
                        <label for="route_id" class="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                        <select id="route_id" name="route_id"
                                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">Semua Rute</option>
                            @foreach($routes as $route)
                                <option value="{{ $route->id }}">
                                    {{ $route->origin }} - {{ $route->destination }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-4">
                        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select id="status" name="status"
                                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">Semua Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="REFUNDED">Refunded</option>
                        </select>
                    </div>
                    <div class="space-y-3">
                        <button type="submit" class="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Lihat Laporan
                        </button>
                        <button type="submit" class="w-full inline-flex justify-center items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition-colors" name="export" value="csv">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export CSV
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Laporan Pendapatan -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <h2 class="text-lg font-semibold text-green-600">Laporan Pendapatan</h2>
            </div>
            <div class="p-6">
                <form action="{{ route('admin.reports.revenue') }}" method="GET">
                    <div class="mb-4">
                        <label for="start_date" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai <span class="text-red-500">*</span></label>
                        <input type="date" id="start_date" name="start_date" value="{{ date('Y-m-01') }}" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>
                    <div class="mb-4">
                        <label for="end_date" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir <span class="text-red-500">*</span></label>
                        <input type="date" id="end_date" name="end_date" value="{{ date('Y-m-t') }}" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>
                    <div class="mb-4">
                        <label for="route_id" class="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                        <select id="route_id" name="route_id"
                                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            <option value="">Semua Rute</option>
                            @foreach($routes as $route)
                                <option value="{{ $route->id }}">
                                    {{ $route->origin }} - {{ $route->destination }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-4">
                        <label for="group_by" class="block text-sm font-medium text-gray-700 mb-1">Kelompokkan Berdasarkan <span class="text-red-500">*</span></label>
                        <select id="group_by" name="group_by" required
                                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            <option value="daily">Harian</option>
                            <option value="weekly">Mingguan</option>
                            <option value="monthly" selected>Bulanan</option>
                        </select>
                    </div>
                    <div class="space-y-3">
                        <button type="submit" class="w-full inline-flex justify-center items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Lihat Laporan
                        </button>
                        <button type="submit" class="w-full inline-flex justify-center items-center px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-md shadow-sm transition-colors" name="export" value="csv">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export CSV
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Laporan Jadwal -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <h2 class="text-lg font-semibold text-indigo-600">Laporan Jadwal</h2>
            </div>
            <div class="p-6">
                <form action="{{ route('admin.reports.schedule') }}" method="GET">
                    <div class="mb-4">
                        <label for="start_date" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai <span class="text-red-500">*</span></label>
                        <input type="date" id="start_date" name="start_date" value="{{ date('Y-m-01') }}" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    </div>
                    <div class="mb-4">
                        <label for="end_date" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir <span class="text-red-500">*</span></label>
                        <input type="date" id="end_date" name="end_date" value="{{ date('Y-m-t') }}" required
                               class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    </div>
                    <div class="mb-4">
                        <label for="route_id" class="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                        <select id="route_id" name="route_id"
                                class="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            <option value="">Semua Rute</option>
                            @foreach($routes as $route)
                                <option value="{{ $route->id }}">
                                    {{ $route->origin }} - {{ $route->destination }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="space-y-3">
                        <button type="submit" class="w-full inline-flex justify-center items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Lihat Laporan
                        </button>
                        <button type="submit" class="w-full inline-flex justify-center items-center px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-md shadow-sm transition-colors" name="export" value="csv">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export CSV
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <!-- Statistik Cepat -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <h2 class="text-lg font-semibold text-blue-600">Statistik Cepat</h2>
            </div>
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Booking Bulan Ini -->
                    <div class="bg-white rounded-lg shadow border-l-4 border-blue-500 overflow-hidden">
                        <div class="p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-xs font-semibold text-blue-600 uppercase">Booking Bulan Ini</p>
                                    <p class="mt-2 text-2xl font-bold text-gray-800">{{ $stats['bookings_this_month'] }}</p>
                                </div>
                                <div class="rounded-full bg-blue-100 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Pendapatan Bulan Ini -->
                    <div class="bg-white rounded-lg shadow border-l-4 border-green-500 overflow-hidden">
                        <div class="p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-xs font-semibold text-green-600 uppercase">Pendapatan Bulan Ini</p>
                                    <p class="mt-2 text-2xl font-bold text-gray-800">Rp {{ number_format($stats['revenue_this_month'], 0, ',', '.') }}</p>
                                </div>
                                <div class="rounded-full bg-green-100 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Booking Minggu Ini -->
                    <div class="bg-white rounded-lg shadow border-l-4 border-indigo-500 overflow-hidden">
                        <div class="p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-xs font-semibold text-indigo-600 uppercase">Booking Minggu Ini</p>
                                    <p class="mt-2 text-2xl font-bold text-gray-800">{{ $stats['bookings_this_week'] }}</p>
                                </div>
                                <div class="rounded-full bg-indigo-100 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Booking Hari Ini -->
                    <div class="bg-white rounded-lg shadow border-l-4 border-yellow-500 overflow-hidden">
                        <div class="p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-xs font-semibold text-yellow-600 uppercase">Booking Hari Ini</p>
                                    <p class="mt-2 text-2xl font-bold text-gray-800">{{ $stats['bookings_today'] }}</p>
                                </div>
                                <div class="rounded-full bg-yellow-100 p-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Rute Populer -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <h2 class="text-lg font-semibold text-blue-600">Rute Populer</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Booking</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @if(count($popularRoutes) > 0)
                            @foreach($popularRoutes as $route)
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ $route->origin }} - {{ $route->destination }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ $route->booking_count }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {{ number_format($route->total_revenue, 0, ',', '.') }}</td>
                                </tr>
                            @endforeach
                        @else
                            <tr>
                                <td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data</td>
                            </tr>
                        @endif
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
