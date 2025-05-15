@extends('layouts.app')

@section('content')
    <div class="container mx-auto px-4 py-6">
        <!-- Dashboard Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
            <p class="mt-2 text-gray-600">
                Selamat datang, <span class="font-medium">{{ Auth::guard('admin')->user()->name ?? 'Admin' }}</span>!
                <span class="text-sm ml-2 text-gray-500">{{ now()->format('l, d F Y') }}</span>
            </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- User Stats Card -->
            <div
                class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 p-3 rounded-lg bg-blue-500 bg-opacity-10">
                            <i class="fas fa-users text-xl text-blue-600"></i>
                        </div>
                        <div class="ml-5">
                            <p class="text-sm font-medium text-gray-500">Total Pengguna</p>
                            <div class="flex items-end">
                                <p class="text-2xl font-bold text-gray-800">{{ $users_count ?? 0 }}</p>
                                @if (isset($userGrowth) && $userGrowth != 0)
                                    <p
                                        class="ml-2 text-xs {{ $userGrowth > 0 ? 'text-green-500' : 'text-red-500' }} flex items-center">
                                        <i class="fas fa-arrow-{{ $userGrowth > 0 ? 'up' : 'down' }} mr-1"></i>
                                        {{ abs($userGrowth) }}%
                                    </p>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-5 py-2">
                    <a href="{{ route('admin.users.index') }}"
                        class="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                        Lihat detail <i class="fas fa-arrow-right ml-1 text-xs"></i>
                    </a>
                </div>
            </div>

            <!-- Ferry Stats Card -->
            <div
                class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 p-3 rounded-lg bg-green-500 bg-opacity-10">
                            <i class="fas fa-ship text-xl text-green-600"></i>
                        </div>
                        <div class="ml-5">
                            <p class="text-sm font-medium text-gray-500">Total Kapal</p>
                            <div class="flex items-end">
                                <p class="text-2xl font-bold text-gray-800">{{ $ferries_count ?? 0 }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-5 py-2">
                    <a href="{{ route('admin.ferries.index') }}"
                        class="text-sm text-green-600 hover:text-green-800 flex items-center">
                        Lihat detail <i class="fas fa-arrow-right ml-1 text-xs"></i>
                    </a>
                </div>
            </div>

            <!-- Routes Stats Card -->
            <div
                class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 p-3 rounded-lg bg-purple-500 bg-opacity-10">
                            <i class="fas fa-route text-xl text-purple-600"></i>
                        </div>
                        <div class="ml-5">
                            <p class="text-sm font-medium text-gray-500">Total Rute</p>
                            <div class="flex items-end">
                                <p class="text-2xl font-bold text-gray-800">{{ $routes_count ?? 0 }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-5 py-2">
                    <a href="{{ route('admin.routes.index') }}"
                        class="text-sm text-purple-600 hover:text-purple-800 flex items-center">
                        Lihat detail <i class="fas fa-arrow-right ml-1 text-xs"></i>
                    </a>
                </div>
            </div>

            <!-- Active Schedules Stats Card -->
            <div
                class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 p-3 rounded-lg bg-amber-500 bg-opacity-10">
                            <i class="fas fa-calendar-alt text-xl text-amber-600"></i>
                        </div>
                        <div class="ml-5">
                            <p class="text-sm font-medium text-gray-500">Jadwal Aktif</p>
                            <div class="flex items-end">
                                <p class="text-2xl font-bold text-gray-800">{{ $active_schedules ?? 0 }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-5 py-2">
                    <a href="{{ route('admin.schedules.index') }}"
                        class="text-sm text-amber-600 hover:text-amber-800 flex items-center">
                        Lihat detail <i class="fas fa-arrow-right ml-1 text-xs"></i>
                    </a>
                </div>
            </div>
        </div>

        <!-- Revenue and Booking Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <!-- Monthly Bookings Card -->
            <div
                class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
                <div class="px-6 py-5 border-b border-gray-100">
                    <h2 class="font-semibold text-gray-800">Booking Bulan Ini</h2>
                </div>
                <div class="px-6 py-8 flex flex-col items-center justify-center">
                    <div class="text-center mb-2">
                        <span class="text-4xl font-bold text-indigo-700">{{ $monthly_bookings ?? 0 }}</span>
                    </div>
                    <p class="text-gray-500 mb-6">Total pemesanan</p>

                    <div class="w-full p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <h3 class="text-sm font-medium text-gray-600 mb-2">Pendapatan Bulan Ini</h3>
                        <div class="text-center">
                            <span class="text-2xl font-bold text-green-600">Rp
                                {{ number_format($monthly_income ?? 0, 0, ',', '.') }}</span>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-5 py-3 flex items-center justify-between border-t border-gray-100">
                    <span class="text-xs text-gray-500">Dibandingkan bulan lalu</span>
                    @if (isset($bookingGrowth))
                        <span
                            class="text-xs font-medium px-2 py-1 rounded-full {{ $bookingGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }}">
                            <i
                                class="fas fa-arrow-{{ $bookingGrowth >= 0 ? 'up' : 'down' }} text-xs mr-1"></i>{{ abs($bookingGrowth) }}%
                        </span>
                    @else
                        <span class="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                            -
                        </span>
                    @endif
                </div>
            </div>

            <!-- Weekly Booking Chart -->
            <div
                class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden lg:col-span-2">
                <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 class="font-semibold text-gray-800">Booking 7 Hari Terakhir</h2>
                    <div class="flex space-x-2">
                        <button id="weeklyChartBtn"
                            class="px-3 py-1 text-xs font-medium rounded-md bg-indigo-50 text-indigo-600">Minggu
                            Ini</button>
                        <button id="monthlyChartBtn"
                            class="px-3 py-1 text-xs font-medium rounded-md text-gray-500 hover:bg-gray-100">Bulan
                            Ini</button>
                    </div>
                </div>
                <div class="p-6">
                    <div class="h-72">
                        <canvas id="weeklyBookingChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Status and Latest Bookings Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Booking Status Card -->
            <div
                class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
                <div class="px-6 py-5 border-b border-gray-100">
                    <h2 class="font-semibold text-gray-800">Status Booking</h2>
                </div>
                <div class="p-6">
                    <div class="space-y-4">
                        <!-- Waiting for Payment -->
                        <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div class="flex items-center">
                                <div class="h-3 w-3 rounded-full bg-blue-500 mr-3"></div>
                                <span class="text-sm text-gray-700">Menunggu Pembayaran</span>
                            </div>
                            <span class="font-semibold text-gray-800">{{ $pending_payment_count ?? 0 }}</span>
                        </div>

                        <!-- Not Checked In -->
                        <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <div class="flex items-center">
                                <div class="h-3 w-3 rounded-full bg-yellow-500 mr-3"></div>
                                <span class="text-sm text-gray-700">Belum Check-in</span>
                            </div>
                            <span class="font-semibold text-gray-800">{{ $not_checked_in_count ?? 0 }}</span>
                        </div>

                        <!-- Checked In -->
                        <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div class="flex items-center">
                                <div class="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                                <span class="text-sm text-gray-700">Sudah Check-in</span>
                            </div>
                            <span class="font-semibold text-gray-800">{{ $checked_in_count ?? 0 }}</span>
                        </div>

                        <!-- Cancelled -->
                        <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div class="flex items-center">
                                <div class="h-3 w-3 rounded-full bg-red-500 mr-3"></div>
                                <span class="text-sm text-gray-700">Dibatalkan</span>
                            </div>
                            <span class="font-semibold text-gray-800">{{ $cancelled_count ?? 0 }}</span>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-5 py-3 border-t border-gray-100">
                    <a href="{{ route('admin.bookings.index') }}"
                        class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                        Lihat semua booking <i class="fas fa-arrow-right ml-1 text-xs"></i>
                    </a>
                </div>
            </div>

            <!-- Latest Bookings Table -->
            <div
                class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden lg:col-span-2">
                <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 class="font-semibold text-gray-800">Booking Terbaru</h2>
                    <a href="{{ route('admin.bookings.index') }}"
                        class="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                        Lihat Semua
                    </a>
                </div>
                <div class="p-3">
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead>
                                <tr class="bg-gray-50">
                                    <th
                                        class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kode</th>
                                    <th
                                        class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pengguna</th>
                                    <th
                                        class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal</th>
                                    <th
                                        class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total</th>
                                    <th
                                        class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @forelse($latest_bookings ?? [] as $booking)
                                    <tr class="hover:bg-gray-50">
                                        <td class="py-3 px-4 text-sm font-medium text-indigo-600">
                                            {{ $booking->booking_code ?? 'BK-' . rand(1000, 9999) }}
                                        </td>
                                        <td class="py-3 px-4 text-sm text-gray-700">
                                            {{ $booking->user->name ?? 'Pengguna' }}
                                        </td>
                                        <td class="py-3 px-4 text-sm text-gray-500">
                                            {{ isset($booking->booking_date) ? \Carbon\Carbon::parse($booking->booking_date)->format('d M Y') : now()->format('d M Y') }}
                                        </td>
                                        <td class="py-3 px-4 text-sm font-medium text-gray-700">
                                            Rp {{ number_format($booking->total_amount ?? 0, 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 px-4">
                                            @php
                                                $status = $booking->status ?? 'PENDING';
                                                $statusClass =
                                                    [
                                                        'PENDING' => 'bg-blue-100 text-blue-800',
                                                        'CONFIRMED' => 'bg-green-100 text-green-800',
                                                        'CANCELLED' => 'bg-red-100 text-red-800',
                                                        'COMPLETED' => 'bg-gray-100 text-gray-800',
                                                    ][$status] ?? 'bg-gray-100 text-gray-800';
                                            @endphp
                                            <span class="px-2 py-1 text-xs font-medium rounded-full {{ $statusClass }}">
                                                {{ $status }}
                                            </span>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" class="py-6 text-center text-gray-500">
                                            <div class="flex flex-col items-center justify-center">
                                                <i class="fas fa-ticket-alt text-2xl text-gray-300 mb-2"></i>
                                                <p>Belum ada data booking terbaru</p>
                                            </div>
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
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
        const ctx = document.getElementById('weeklyBookingChart').getContext('2d');

        // Data untuk tampilan mingguan
        const weeklyLabels = {!! json_encode($weekly_booking_labels ?? ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']) !!};
        const weeklyData = {!! json_encode($weekly_booking_data ?? [0, 0, 0, 0, 0, 0, 0]) !!};

        // Data untuk tampilan bulanan
        const monthlyLabels = {!! json_encode($monthly_booking_labels ?? []) !!};
        const monthlyData = {!! json_encode($monthly_booking_data ?? []) !!};

        // Inisialisasi chart dengan data mingguan terlebih dahulu
        let currentData = {
            labels: weeklyLabels,
            datasets: [{
                label: 'Jumlah Booking',
                data: weeklyData,
                borderColor: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 2,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: 'rgb(79, 70, 229)',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(243, 244, 246, 1)',
                        borderDash: [5, 5]
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        };

        const bookingChart = new Chart(ctx, {
            type: 'line',
            data: currentData,
            options: chartOptions
        });

        // Tombol filter
        const weeklyBtn = document.getElementById('weeklyChartBtn');
        const monthlyBtn = document.getElementById('monthlyChartBtn');

        weeklyBtn.addEventListener('click', function() {
            // Aktifkan tombol ini dan nonaktifkan yang lain
            weeklyBtn.classList.remove('text-gray-500');
            weeklyBtn.classList.remove('hover:bg-gray-100');
            weeklyBtn.classList.add('bg-indigo-50', 'text-indigo-600');

            monthlyBtn.classList.remove('bg-indigo-50', 'text-indigo-600');
            monthlyBtn.classList.add('text-gray-500', 'hover:bg-gray-100');

            // Update chart dengan data mingguan
            bookingChart.data.labels = weeklyLabels;
            bookingChart.data.datasets[0].data = weeklyData;
            bookingChart.update();
        });

        monthlyBtn.addEventListener('click', function() {
            // Aktifkan tombol ini dan nonaktifkan yang lain
            monthlyBtn.classList.remove('text-gray-500');
            monthlyBtn.classList.remove('hover:bg-gray-100');
            monthlyBtn.classList.add('bg-indigo-50', 'text-indigo-600');

            weeklyBtn.classList.remove('bg-indigo-50', 'text-indigo-600');
            weeklyBtn.classList.add('text-gray-500', 'hover:bg-gray-100');

            // Update chart dengan data bulanan
            bookingChart.data.labels = monthlyLabels;
            bookingChart.data.datasets[0].data = monthlyData;
            bookingChart.update();
        });
    });
</script>
@endsection
