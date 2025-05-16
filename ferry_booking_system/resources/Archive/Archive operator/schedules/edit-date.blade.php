@extends('layouts.app')

@section('title', 'Edit Tanggal Jadwal')

@section('content')
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header dengan gradient background -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-8 p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="flex items-center space-x-4">
                <div class="p-3 bg-white bg-opacity-30 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-white">Edit Tanggal Jadwal</h1>
                    <p class="text-blue-100 mt-1">{{ \Carbon\Carbon::parse($scheduleDate->date)->format('d F Y') }}</p>
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
                        <span class="text-sm text-gray-500">Tanggal:</span>
                        <span class="text-sm font-medium text-gray-900">{{ \Carbon\Carbon::parse($scheduleDate->date)->format('d F Y') }}</span>
                    </div>
                    <div class="flex justify-between border-b border-gray-100 pb-2">
                        <span class="text-sm text-gray-500">Keberangkatan:</span>
                        <span class="text-sm font-medium text-gray-900">{{ $schedule->departure_time->format('H:i') }}</span>
                    </div>
                    <div class="flex justify-between border-b border-gray-100 pb-2">
                        <span class="text-sm text-gray-500">Kedatangan:</span>
                        <span class="text-sm font-medium text-gray-900">{{ $schedule->arrival_time->format('H:i') }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-500">Status saat ini:</span>
                        <span class="text-sm font-medium">
                            @if ($scheduleDate->status == 'ACTIVE')
                                <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Tersedia</span>
                            @elseif($scheduleDate->status == 'INACTIVE')
                                <span class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Tidak Tersedia</span>
                            @elseif($scheduleDate->status == 'FULL')
                                <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Penuh</span>
                            @elseif($scheduleDate->status == 'CANCELLED')
                                <span class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Dibatalkan</span>
                            @elseif($scheduleDate->status == 'WEATHER_ISSUE')
                                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Masalah Cuaca</span>
                            @endif
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Form Card -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h2 class="text-lg font-semibold text-gray-800">Edit Tanggal Jadwal</h2>
            </div>
            <div class="p-6">
                <form action="{{ route('operator.schedules.update-date', ['id' => $schedule->id, 'dateId' => $scheduleDate->id]) }}" method="POST" class="space-y-6">
                    @csrf
                    @method('PUT')

                    <div>
                        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                            Status <span class="text-red-600">*</span>
                        </label>
                        <select id="status" name="status"
                            class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 @error('status') border-red-500 @enderror"
                            required>
                            <option value="active" {{ $scheduleDate->status == 'ACTIVE' ? 'selected' : '' }}>Tersedia</option>
                            <option value="inactive" {{ $scheduleDate->status == 'INACTIVE' ? 'selected' : '' }}>Tidak Tersedia</option>
                            <option value="suspended" {{ $scheduleDate->status == 'CANCELLED' ? 'selected' : '' }}>Dibatalkan</option>
                            <option value="full" {{ $scheduleDate->status == 'FULL' ? 'selected' : '' }}>Penuh</option>
                            <option value="weather_issue" {{ $scheduleDate->status == 'WEATHER_ISSUE' ? 'selected' : '' }}>Masalah Cuaca</option>
                        </select>
                        @error('status')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="status_reason" class="block text-sm font-medium text-gray-700 mb-1">
                            Alasan Status (Opsional)
                        </label>
                        <textarea id="status_reason" name="status_reason" rows="3"
                            class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 @error('status_reason') border-red-500 @enderror">{{ old('status_reason', $scheduleDate->status_reason) }}</textarea>
                        @error('status_reason')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                        <p class="mt-1 text-xs text-gray-500">Tambahkan alasan jika status bukan 'Tersedia'</p>
                    </div>

                    <div class="weather-expiry-group" style="display: {{ $scheduleDate->status == 'WEATHER_ISSUE' ? 'block' : 'none' }};">
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
                                value="{{ $scheduleDate->status_expiry_date ? \Carbon\Carbon::parse($scheduleDate->status_expiry_date)->format('Y-m-d') : '' }}"
                                class="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 @error('status_expiry_date') border-red-500 @enderror">
                        </div>
                        @error('status_expiry_date')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                        <p class="mt-1 text-xs text-gray-500">Tanggal saat status cuaca diperkirakan berakhir</p>
                    </div>

                    <!-- Kapasitas Section -->
                    <div class="mt-6">
                        <div class="border-t border-gray-200 pt-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Pengaturan Kapasitas
                            </h3>
                            <p class="mb-4 text-sm text-gray-500">
                                Kapasitas default kapal: {{ $schedule->ferry->capacity_passenger }} penumpang,
                                {{ $schedule->ferry->capacity_motorcycle }} motor,
                                {{ $schedule->ferry->capacity_car }} mobil,
                                {{ $schedule->ferry->capacity_bus }} bus,
                                {{ $schedule->ferry->capacity_truck }} truk
                            </p>
                            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label for="passenger_count" class="block text-sm font-medium text-gray-700 mb-1">
                                        Jumlah Penumpang
                                    </label>
                                    <div class="mt-1 relative rounded-md shadow-sm">
                                        <input type="number" id="passenger_count" name="passenger_count"
                                            value="{{ old('passenger_count', $scheduleDate->passenger_count) }}" min="0"
                                            class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 @error('passenger_count') border-red-500 @enderror">
                                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span class="text-gray-500 sm:text-sm">orang</span>
                                        </div>
                                    </div>
                                    @error('passenger_count')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <div>
                                    <label for="motorcycle_count" class="block text-sm font-medium text-gray-700 mb-1">
                                        Jumlah Motor
                                    </label>
                                    <input type="number" id="motorcycle_count" name="motorcycle_count"
                                        value="{{ old('motorcycle_count', $scheduleDate->motorcycle_count) }}" min="0"
                                        class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 @error('motorcycle_count') border-red-500 @enderror">
                                    @error('motorcycle_count')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <div>
                                    <label for="car_count" class="block text-sm font-medium text-gray-700 mb-1">
                                        Jumlah Mobil
                                    </label>
                                    <input type="number" id="car_count" name="car_count"
                                        value="{{ old('car_count', $scheduleDate->car_count) }}" min="0"
                                        class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 @error('car_count') border-red-500 @enderror">
                                    @error('car_count')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <div>
                                    <label for="bus_count" class="block text-sm font-medium text-gray-700 mb-1">
                                        Jumlah Bus
                                    </label>
                                    <input type="number" id="bus_count" name="bus_count"
                                        value="{{ old('bus_count', $scheduleDate->bus_count) }}" min="0"
                                        class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 @error('bus_count') border-red-500 @enderror">
                                    @error('bus_count')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>

                                <div>
                                    <label for="truck_count" class="block text-sm font-medium text-gray-700 mb-1">
                                        Jumlah Truk
                                    </label>
                                    <input type="number" id="truck_count" name="truck_count"
                                        value="{{ old('truck_count', $scheduleDate->truck_count) }}" min="0"
                                        class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150 @error('truck_count') border-red-500 @enderror">
                                    @error('truck_count')
                                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                                    @enderror
                                </div>
                            </div>
                            <div class="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                                <div class="flex">
                                    <div class="flex-shrink-0">
                                        <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <div class="ml-3">
                                        <p class="text-sm text-yellow-700">
                                            Nilai 0 berarti menggunakan kapasitas default kapal. Jika Anda ingin membatasi kapasitas, masukkan nilai yang lebih rendah dari kapasitas default.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-3 pt-6">
                        <a href="{{ route('operator.schedules.dates', $schedule->id) }}"
                           class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150">
                            Batal
                        </a>
                        <button type="submit"
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
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
