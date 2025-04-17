@extends('layouts.app')

@section('content')
<div class="bg-white rounded-lg shadow-md p-6">
    <h1 class="text-2xl font-semibold text-gray-800 mb-6">Dashboard Admin</h1>
    
    <p class="text-gray-600 mb-6">Selamat datang, {{ Auth::guard('admin')->user()->name }}!</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Card Total Pengguna -->
        <div class="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-blue-500 text-white mr-4">
                    <i class="fas fa-users"></i>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Total Pengguna</p>
                    <p class="text-2xl font-bold text-gray-700">{{ $users_count ?? 0 }}</p>
                </div>
            </div>
        </div>
        
        <!-- Card Total Kapal -->
        <div class="bg-green-50 rounded-lg p-6 border border-green-100">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-green-500 text-white mr-4">
                    <i class="fas fa-ship"></i>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Total Kapal</p>
                    <p class="text-2xl font-bold text-gray-700">{{ $ferries_count ?? 0 }}</p>
                </div>
            </div>
        </div>
        
        <!-- Card Total Rute -->
        <div class="bg-purple-50 rounded-lg p-6 border border-purple-100">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-purple-500 text-white mr-4">
                    <i class="fas fa-route"></i>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Total Rute</p>
                    <p class="text-2xl font-bold text-gray-700">{{ $routes_count ?? 0 }}</p>
                </div>
            </div>
        </div>
        
        <!-- Card Jadwal Aktif -->
        <div class="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-yellow-500 text-white mr-4">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Jadwal Aktif</p>
                    <p class="text-2xl font-bold text-gray-700">{{ $active_schedules ?? 0 }}</p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="mt-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Booking Bulan Ini</h2>
        <div class="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <div class="text-center">
                <p class="text-3xl font-bold text-indigo-700">{{ $monthly_bookings ?? 0 }}</p>
                <p class="text-gray-500">Pemesanan</p>
            </div>
            
            <div class="mt-6">
                <h3 class="text-gray-800 font-semibold mb-3">Pendapatan Bulan Ini</h3>
                <div class="text-center bg-white rounded-lg p-4 border border-gray-100">
                    <p class="text-2xl font-bold text-green-600">Rp {{ number_format($monthly_income ?? 0, 0, ',', '.') }}</p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="mt-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Booking 7 Hari Terakhir</h2>
        <div class="bg-white rounded-lg border border-gray-200 p-6">
            <!-- Chart akan ditempatkan di sini -->
            <div class="h-60 bg-gray-50 rounded-lg flex items-center justify-center">
                <div class="chart-container w-full h-full" id="weeklyBookingChart"></div>
            </div>
        </div>
    </div>
    
    <div class="mt-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Status Booking</h2>
        <div class="overflow-x-auto rounded-lg border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                                <div class="text-sm text-gray-900">Menunggu Pembayaran</div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ $pending_payment_count ?? 0 }}
                        </td>
                    </tr>
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                                <div class="text-sm text-gray-900">Belum Check-in</div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ $not_checked_in_count ?? 0 }}
                        </td>
                    </tr>
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                                <div class="text-sm text-gray-900">Sudah Check-in</div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ $checked_in_count ?? 0 }}
                        </td>
                    </tr>
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                                <div class="text-sm text-gray-900">Dibatalkan</div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ $cancelled_count ?? 0 }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    // Data untuk contoh chart
    const weeklyData = [
        @foreach($weekly_booking_data ?? [] as $day => $count)
            {{ $count }},
        @endforeach
    ];
    
    const labels = [
        @foreach($weekly_booking_labels ?? [] as $label)
            '{{ $label }}',
        @endforeach
    ];

    document.addEventListener('DOMContentLoaded', function() {
        const ctx = document.getElementById('weeklyBookingChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length > 0 ? labels : ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                datasets: [{
                    label: 'Jumlah Booking',
                    data: weeklyData.length > 0 ? weeklyData : [0, 0, 0, 0, 0, 0, 0],
                    borderColor: 'rgb(79, 70, 229)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    });
</script>
@endsection