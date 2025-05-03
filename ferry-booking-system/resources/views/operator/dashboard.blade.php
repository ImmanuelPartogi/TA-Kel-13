@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
    <div class="max-w-full px-4 py-6 mx-auto">

        @if ($noRoutesAssigned)
            <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
                <p class="font-semibold">Perhatian</p>
                <p>Anda belum memiliki rute yang ditugaskan. Semua data yang ditampilkan di dashboard akan kosong.
                    Silakan hubungi administrator untuk mengatur rute yang dapat Anda akses.</p>
            </div>
        @endif

        @if (!$noRoutesAssigned)
            <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
                <p class="font-semibold">Rute Yang Ditugaskan</p>
                <ul class="list-disc ml-5 mt-2">
                    @foreach ($routes as $route)
                        <li>{{ $route->origin }} - {{ $route->destination }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

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
                <a href="{{ route('operator.reports.monthly', ['month' => date('Y-m')]) }}"
                    class="block mt-4 text-sm underline">Lihat Detail</a>
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
                                        <td class="px-4 py-2">{{ $schedule->route->origin }} -
                                            {{ $schedule->route->destination }}</td>
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
                                        <td colspan="5" class="text-center px-4 py-4 text-gray-500">Tidak ada jadwal
                                            untuk hari ini</td>
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
                        <a href="{{ route('operator.bookings.check-in') }}"
                            class="flex flex-col items-center justify-center bg-blue-500 text-white p-4 rounded-lg shadow hover:bg-blue-600 text-center">
                            <i class="fas fa-check-circle text-2xl mb-2"></i>
                            Check-in<br>Penumpang
                        </a>
                        <a href="{{ route('operator.bookings.index') }}"
                            class="flex flex-col items-center justify-center bg-indigo-500 text-white p-4 rounded-lg shadow hover:bg-indigo-600 text-center">
                            <i class="fas fa-list text-2xl mb-2"></i>
                            Daftar<br>Booking
                        </a>
                        <a href="{{ route('operator.schedules.index') }}"
                            class="flex flex-col items-center justify-center bg-green-500 text-white p-4 rounded-lg shadow hover:bg-green-600 text-center">
                            <i class="fas fa-calendar-alt text-2xl mb-2"></i>
                            Kelola<br>Jadwal
                        </a>
                        <a href="{{ route('operator.reports.index') }}"
                            class="flex flex-col items-center justify-center bg-yellow-500 text-white p-4 rounded-lg shadow hover:bg-yellow-600 text-center">
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
                                        $badgeClass = match ($activity->status) {
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
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
    <script>
        $(function() {
            // Ambil data booking dari controller
            var bookingData = @json($bookingChartData);

            // Ekstrak tanggal dan jumlah booking
            var labels = bookingData.map(item => item.date);
            var data = bookingData.map(item => item.total);

            // Cari nilai maksimum untuk set skala Y
            var maxValue = Math.max(...data);
            var yMax = Math.max(5, Math.ceil(maxValue * 1.2)); // Minimal 5, atau 20% lebih besar dari nilai maksimum

            // Buat chart
            var ctx = document.getElementById('bookingChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Jumlah Booking',
                        data: data,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: 'rgba(54, 162, 235, 1)',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                font: {
                                    size: 14
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            titleColor: '#333',
                            bodyColor: '#333',
                            titleFont: {
                                size: 16,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 14
                            },
                            padding: 10,
                            borderColor: 'rgba(54, 162, 235, 0.8)',
                            borderWidth: 1,
                            usePointStyle: true,
                            displayColors: false,
                            callbacks: {
                                title: function(tooltipItems) {
                                    return tooltipItems[0].label;
                                },
                                label: function(context) {
                                    return 'Booking: ' + context.parsed.y;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 12
                                }
                            }
                        },
                        y: {
                            min: 0,
                            max: yMax,
                            ticks: {
                                stepSize: 1,
                                precision: 0,
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        }
                    }
                }
            });
        });
    </script>
@endsection
