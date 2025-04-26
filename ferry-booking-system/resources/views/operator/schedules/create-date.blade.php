@extends('layouts.app')

@section('title', 'Tambah Tanggal Jadwal')

@section('content')
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header dengan gradient background -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-8 p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="flex items-center space-x-4">
                <div class="p-3 bg-white bg-opacity-30 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-white">Tambah Tanggal Jadwal</h1>
                    <p class="text-blue-100 mt-1">{{ $schedule->route->origin }} - {{ $schedule->route->destination }}</p>
                </div>
            </div>
            <div class="mt-4 md:mt-0">
                <a href="{{ route('operator.schedules.dates', $schedule->id) }}"
                   class="inline-flex items-center px-4 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali ke Daftar Tanggal
                </a>
            </div>
        </div>
    </div>

    <!-- Alert Messages -->
    @if (session('success'))
    <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm" role="alert" id="successAlert">
        <div class="flex">
            <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium">{{ session('success') }}</p>
            </div>
            <div class="ml-auto pl-3">
                <div class="-mx-1.5 -my-1.5">
                    <button type="button" class="inline-flex bg-green-100 text-green-500 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" onclick="document.getElementById('successAlert').remove()">
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
    @endif

    @if (session('error'))
    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert" id="errorAlert">
        <div class="flex">
            <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium">{{ session('error') }}</p>
            </div>
            <div class="ml-auto pl-3">
                <div class="-mx-1.5 -my-1.5">
                    <button type="button" class="inline-flex bg-red-100 text-red-500 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" onclick="document.getElementById('errorAlert').remove()">
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
    @endif

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Jadwal Info Card -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-lg font-semibold text-gray-800">Informasi Jadwal</h2>
            </div>
            <div class="p-6">
                <div class="space-y-3">
                    <div class="flex justify-between border-b border-gray-100 pb-2">
                        <span class="text-sm text-gray-500">Rute:</span>
                        <span class="text-sm font-medium text-gray-900">{{ $schedule->route->origin }} - {{ $schedule->route->destination }}</span>
                    </div>
                    <div class="flex justify-between border-b border-gray-100 pb-2">
                        <span class="text-sm text-gray-500">Keberangkatan:</span>
                        <span class="text-sm font-medium text-gray-900">{{ $schedule->departure_time->format('H:i') }}</span>
                    </div>
                    <div class="flex justify-between border-b border-gray-100 pb-2">
                        <span class="text-sm text-gray-500">Kedatangan:</span>
                        <span class="text-sm font-medium text-gray-900">{{ $schedule->arrival_time->format('H:i') }}</span>
                    </div>
                    <div class="border-b border-gray-100 pb-2">
                        <span class="text-sm text-gray-500">Hari Operasi:</span>
                        <div class="flex flex-wrap gap-1 mt-1">
                            @php
                                $days = explode(',', $schedule->days);
                                $dayNames = [
                                    '1' => 'Senin',
                                    '2' => 'Selasa',
                                    '3' => 'Rabu',
                                    '4' => 'Kamis',
                                    '5' => 'Jumat',
                                    '6' => 'Sabtu',
                                    '7' => 'Minggu',
                                ];
                            @endphp
                            @foreach($days as $day)
                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {{ $dayNames[$day] ?? $day }}
                                </span>
                            @endforeach
                        </div>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-500">ID Jadwal:</span>
                        <span class="text-sm font-medium text-gray-900">{{ $schedule->id }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Form Card -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 class="text-lg font-semibold text-gray-800">Tambah Tanggal Baru</h2>
            </div>
            <div class="p-6">
                <form action="{{ route('operator.schedules.store-date', $schedule->id) }}" method="POST" class="space-y-6">
                    @csrf

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="date" class="block text-sm font-medium text-gray-700 mb-1">
                                Tanggal <span class="text-red-600">*</span>
                            </label>
                            <div class="relative rounded-md shadow-sm">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input type="date" id="date" name="date"
                                    class="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 @error('date') border-red-500 @enderror"
                                    min="{{ date('Y-m-d') }}" value="{{ old('date') }}" required>
                            </div>
                            @error('date')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                            <p class="mt-1 text-xs text-gray-500">Pilih tanggal sesuai hari operasi kapal</p>
                        </div>

                        <div>
                            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                                Status <span class="text-red-600">*</span>
                            </label>
                            <select id="status" name="status"
                                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 @error('status') border-red-500 @enderror"
                                required>
                                <option value="active" {{ old('status') == 'active' ? 'selected' : '' }}>Tersedia</option>
                                <option value="inactive" {{ old('status') == 'inactive' ? 'selected' : '' }}>Tidak Tersedia</option>
                                <option value="suspended" {{ old('status') == 'suspended' ? 'selected' : '' }}>Dibatalkan</option>
                                <option value="full" {{ old('status') == 'full' ? 'selected' : '' }}>Penuh</option>
                                <option value="weather_issue" {{ old('status') == 'weather_issue' ? 'selected' : '' }}>Masalah Cuaca</option>
                            </select>
                            @error('status')
                                <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>

                    <div>
                        <label for="status_reason" class="block text-sm font-medium text-gray-700 mb-1">
                            Alasan Status (Opsional)
                        </label>
                        <textarea id="status_reason" name="status_reason" rows="3"
                            class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 @error('status_reason') border-red-500 @enderror">{{ old('status_reason') }}</textarea>
                        @error('status_reason')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                        <p class="mt-1 text-xs text-gray-500">Tambahkan alasan jika status bukan 'Tersedia'</p>
                    </div>

                    <div class="weather-expiry-group" style="display: {{ old('status') == 'weather_issue' ? 'block' : 'none' }};">
                        <label for="status_expiry_date" class="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Berakhir Status Cuaca
                        </label>
                        <div class="relative rounded-md shadow-sm">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <input type="date" id="status_expiry_date" name="status_expiry_date"
                                class="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 @error('status_expiry_date') border-red-500 @enderror"
                                min="{{ date('Y-m-d', strtotime('+1 day')) }}" value="{{ old('status_expiry_date') }}">
                        </div>
                        @error('status_expiry_date')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                        <p class="mt-1 text-xs text-gray-500">Tanggal saat status cuaca diperkirakan berakhir</p>
                    </div>

                    <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="ml-3 text-sm text-blue-700">
                                <p>Kapasitas penumpang dan kendaraan akan menggunakan nilai default dari kapal. Anda dapat mengubahnya nanti jika diperlukan.</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-3">
                        <a href="{{ route('operator.schedules.dates', $schedule->id) }}"
                           class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150">
                            Batal
                        </a>
                        <button type="submit"
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Simpan Tanggal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Bantuan -->
    <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mt-6">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 class="text-lg font-semibold text-gray-800">Bantuan</h2>
        </div>
        <div class="p-6">
            <dl class="space-y-6">
                <div>
                    <dt class="text-sm font-medium text-gray-700">Status Tanggal</dt>
                    <dd class="mt-1 text-sm text-gray-600">
                        <ul class="list-disc pl-5 space-y-1">
                            <li><span class="font-medium text-green-600">Tersedia</span> - Jadwal normal, penumpang dapat memesan tiket.</li>
                            <li><span class="font-medium text-red-600">Tidak Tersedia</span> - Jadwal tidak beroperasi, tidak dapat dipesan.</li>
                            <li><span class="font-medium text-red-600">Dibatalkan</span> - Jadwal dibatalkan setelah sebelumnya tersedia.</li>
                            <li><span class="font-medium text-yellow-600">Penuh</span> - Kapasitas penumpang/kendaraan sudah penuh.</li>
                            <li><span class="font-medium text-blue-600">Masalah Cuaca</span> - Jadwal berpotensi berubah karena kondisi cuaca.</li>
                        </ul>
                    </dd>
                </div>
                <div>
                    <dt class="text-sm font-medium text-gray-700">Tanggal Berakhir Status</dt>
                    <dd class="mt-1 text-sm text-gray-600">
                        Hanya berlaku untuk status "Masalah Cuaca". Menentukan kapan status akan otomatis kembali ke "Tersedia" jika kondisi cuaca membaik.
                    </dd>
                </div>
            </dl>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Show/hide weather expiry date field based on selected status
        const statusSelect = document.getElementById('status');
        const expiryGroup = document.querySelector('.weather-expiry-group');

        statusSelect.addEventListener('change', function() {
            if (this.value === 'weather_issue') {
                expiryGroup.style.display = 'block';
            } else {
                expiryGroup.style.display = 'none';
            }
        });

        // Auto-dismiss alerts
        const dismissAlerts = () => {
            const alerts = document.querySelectorAll('[role="alert"]');
            alerts.forEach(alert => {
                setTimeout(() => {
                    if (alert && alert.parentNode) {
                        alert.classList.add('opacity-0', 'transition-opacity', 'duration-500');
                        setTimeout(() => {
                            if (alert && alert.parentNode) {
                                alert.remove();
                            }
                        }, 500);
                    }
                }, 5000);
            });
        };

        dismissAlerts();
    });
</script>
@endsection
