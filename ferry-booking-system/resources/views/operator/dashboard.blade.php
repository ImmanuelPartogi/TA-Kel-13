@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
<div class="max-w-full px-4 py-6 mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div class="bg-blue-500 text-white p-6 rounded-lg shadow">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-3xl font-bold">{{ $totalSchedules }}</h3>
                    <p class="text-sm">Total Jadwal</p>
                </div>
                <i class="fas fa-calendar-alt text-4xl"></i>
            </div>
            <a href="{{ route('operator.schedules.index') }}" class="block mt-4 text-sm underline">Lihat Detail</a>
        </div>

        <div class="bg-green-500 text-white p-6 rounded-lg shadow">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-3xl font-bold">{{ $totalBookings }}</h3>
                    <p class="text-sm">Total Booking</p>
                </div>
                <i class="fas fa-ticket-alt text-4xl"></i>
            </div>
            <a href="{{ route('operator.bookings.index') }}" class="block mt-4 text-sm underline">Lihat Detail</a>
        </div>

        <div class="bg-yellow-400 text-white p-6 rounded-lg shadow">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-3xl font-bold">{{ $bookingsThisMonth }}</h3>
                    <p class="text-sm">Booking Bulan Ini</p>
                </div>
                <i class="fas fa-calendar-check text-4xl"></i>
            </div>
            <a href="{{ route('operator.bookings.index') }}" class="block mt-4 text-sm underline">Lihat Detail</a>
        </div>

        <div class="bg-red-500 text-white p-6 rounded-lg shadow">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-3xl font-bold">Rp {{ number_format($revenueThisMonth, 0, ',', '.') }}</h3>
                    <p class="text-sm">Pendapatan Bulan Ini</p>
                </div>
                <i class="fas fa-money-bill text-4xl"></i>
            </div>
            <a href="{{ route('operator.reports.monthly', ['month' => date('Y-m')]) }}" class="block mt-4 text-sm underline">Lihat Detail</a>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        <div class="lg:col-span-2">
            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h3 class="text-lg font-semibold mb-4">Grafik Booking Seminggu Terakhir</h3>
                <div class="relative">
                    <canvas id="bookingChart" class="w-full h-64"></canvas>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Jadwal Hari Ini</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm text-left border">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="px-4 py-2 border">Rute</th>
                                <th class="px-4 py-2 border">Kapal</th>
                                <th class="px-4 py-2 border">Keberangkatan</th>
                                <th class="px-4 py-2 border">Kedatangan</th>
                                <th class="px-4 py-2 border">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($todaySchedules as $schedule)
                                <tr class="border-t">
                                    <td class="px-4 py-2">{{ $schedule->route->origin }} - {{ $schedule->route->destination }}</td>
                                    <td class="px-4 py-2">{{ $schedule->ferry->name }}</td>
                                    <td class="px-4 py-2">{{ $schedule->departure_time }}</td>
                                    <td class="px-4 py-2">{{ $schedule->arrival_time }}</td>
                                    <td class="px-4 py-2">
                                        <a href="{{ route('operator.reports.daily', ['date' => date('Y-m-d')]) }}"
                                           class="inline-block px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                                            <i class="fas fa-eye"></i> Lihat
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-center px-4 py-4 text-gray-500">Tidak ada jadwal untuk hari ini</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="space-y-6">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Menu Pintasan</h3>
                <div class="grid grid-cols-2 gap-4">
                    <a href="{{ route('operator.bookings.check-in') }}" class="flex flex-col items-center justify-center bg-blue-500 text-white p-4 rounded-lg shadow hover:bg-blue-600 text-center">
                        <i class="fas fa-check-circle text-2xl mb-2"></i>
                        Check-in<br>Penumpang
                    </a>
                    <a href="{{ route('operator.bookings.index') }}" class="flex flex-col items-center justify-center bg-indigo-500 text-white p-4 rounded-lg shadow hover:bg-indigo-600 text-center">
                        <i class="fas fa-list text-2xl mb-2"></i>
                        Daftar<br>Booking
                    </a>
                    <a href="{{ route('operator.schedules.index') }}" class="flex flex-col items-center justify-center bg-green-500 text-white p-4 rounded-lg shadow hover:bg-green-600 text-center">
                        <i class="fas fa-calendar-alt text-2xl mb-2"></i>
                        Kelola<br>Jadwal
                    </a>
                    <a href="{{ route('operator.reports.index') }}" class="flex flex-col items-center justify-center bg-yellow-500 text-white p-4 rounded-lg shadow hover:bg-yellow-600 text-center">
                        <i class="fas fa-chart-bar text-2xl mb-2"></i>
                        Laporan<br>Operasional
                    </a>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Aktivitas Terkini</h3>
                <ul class="space-y-4">
                    @forelse($recentActivities as $activity)
                        <li class="border-b pb-3">
                            <div class="flex justify-between items-center">
                                <span class="font-medium">{{ $activity->activity_type }}</span>
                                @php
                                    $badgeClass = match($activity->status) {
                                        'SUCCESS', 'CONFIRMED' => 'bg-green-500',
                                        'FAILED', 'CANCELLED' => 'bg-red-500',
                                        'WARNING', 'CHANGED' => 'bg-yellow-400',
                                        default => 'bg-blue-400',
                                    };
                                @endphp
                                <span class="text-xs px-2 py-1 rounded {{ $badgeClass }} text-white">
                                    {{ $activity->status }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600">{{ $activity->description }}</p>
                            <small class="text-gray-400">{{ $activity->created_at->diffForHumans() }}</small>
                        </li>
                    @empty
                        <li class="text-center text-gray-500">Belum ada aktivitas terbaru</li>
                    @endforelse
                </ul>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    $(function() {
        var bookingData = @json($bookingChartData);
        var ctx = document.getElementById('bookingChart').getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: bookingData.map(item => item.date),
                datasets: [{
                    label: 'Jumlah Booking',
                    backgroundColor: 'rgba(59,130,246,0.1)',
                    borderColor: 'rgba(59,130,246,1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#3b82f6',
                    data: bookingData.map(item => item.total)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });
</script>
@endsection
