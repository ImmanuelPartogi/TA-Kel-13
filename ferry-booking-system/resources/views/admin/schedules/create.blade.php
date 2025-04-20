@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header -->
    <div class="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
        <div class="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6 text-white relative">
            <div class="absolute inset-0 overflow-hidden">
                <svg class="absolute right-0 bottom-0 opacity-10 h-64 w-64" viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg">
                    <path fill="white"
                        d="M46.5,-75.3C58.9,-68.9,67.3,-53.9,74.4,-38.7C81.6,-23.5,87.6,-8.1,85.8,6.3C84,20.7,74.2,34,63,44.4C51.8,54.8,39.2,62.3,25.2,68.2C11.1,74,-4.4,78.2,-19.6,76.1C-34.8,74,-49.6,65.7,-59.5,53.6C-69.4,41.5,-74.3,25.5,-77.6,8.5C-80.9,-8.5,-82.5,-26.5,-75.8,-40C-69.1,-53.5,-54.1,-62.4,-39.3,-67.4C-24.6,-72.5,-10.1,-73.7,4.4,-80.8C18.9,-87.9,34.1,-81.8,46.5,-75.3Z"
                        transform="translate(100 100)" />
                </svg>
            </div>
            <div class="flex justify-between items-center relative z-10">
                <h1 class="text-2xl font-bold flex items-center">
                    <i class="fas fa-plus-circle mr-3 text-blue-200"></i> Tambah Jadwal Baru
                </h1>
                <a href="{{ route('admin.schedules.index') }}" class="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 transition ease-in-out duration-150">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali
                </a>
            </div>
        </div>

        <div class="p-6">
            <!-- Alerts -->
            @if (session('error'))
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm" role="alert">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-circle text-red-500 mt-1"></i>
                        </div>
                        <div class="ml-3">
                            <p>{{ session('error') }}</p>
                        </div>
                    </div>
                </div>
            @endif

            @if (session('success'))
                <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg shadow-sm"
                    role="alert">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-check-circle text-green-500 mt-1"></i>
                        </div>
                        <div class="ml-3">
                            <p>{{ session('success') }}</p>
                        </div>
                    </div>
                </div>
            @endif

            @if($errors->any())
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm" role="alert">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-circle text-red-500 mt-1"></i>
                        </div>
                        <div class="ml-3">
                            <p class="font-medium">Ada beberapa kesalahan:</p>
                            <ul class="mt-1 list-disc list-inside text-sm">
                                @foreach($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>
            @endif

            <!-- Progress Steps -->
            <div class="mb-8">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div class="flex-1 mb-4 md:mb-0">
                        <div class="flex items-center">
                            <div
                                class="bg-blue-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold shadow-md">
                                1</div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-gray-900">Informasi Dasar</p>
                                <p class="text-xs text-gray-500">Detail jadwal utama</p>
                            </div>
                        </div>
                    </div>
                    <div class="w-full mx-4 h-2 bg-gray-200 rounded-full hidden md:block">
                        <div class="h-2 bg-blue-500 rounded-full" style="width: 50%"></div>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center">
                            <div
                                class="bg-gray-300 text-gray-700 rounded-full h-10 w-10 flex items-center justify-center font-bold shadow-sm">
                                2</div>
                            <div class="ml-3">
                                <p class="text-sm font-medium text-gray-700">Hari Operasional</p>
                                <p class="text-xs text-gray-500">Jadwal mingguan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Form -->
            <form action="{{ route('admin.schedules.store') }}" method="POST" novalidate class="space-y-6" id="scheduleForm">
                @csrf

                <!-- Basic Info Section -->
                <div class="basic-info-section bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 class="text-lg font-semibold mb-4 text-gray-800 flex items-center border-b pb-3">
                        <i class="fas fa-info-circle mr-2 text-blue-500"></i> Informasi Dasar Jadwal
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="route_id" class="block text-sm font-medium text-gray-700 mb-1">
                                Rute <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-map-marked-alt text-gray-400"></i>
                                </div>
                                <select class="pl-10 bg-white border @error('route_id') border-red-300 @else border-gray-300 @enderror rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm" id="route_id" name="route_id" required>
                                    <option value="">-- Pilih Rute --</option>
                                    @foreach($routes as $route)
                                        <option value="{{ $route->id }}"
                                            {{ old('route_id') == $route->id ? 'selected' : '' }}
                                            data-duration="{{ $route->duration }}">
                                            {{ $route->origin }} - {{ $route->destination }}
                                            ({{ $route->route_code }})
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            @error('route_id')
                                <p id="route_id-error" class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                            <p class="text-xs text-gray-500 mt-1">Pilih rute yang akan dijadwalkan</p>
                        </div>

                        <div>
                            <label for="ferry_id" class="block text-sm font-medium text-gray-700 mb-1">
                                Kapal <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-ship text-gray-400"></i>
                                </div>
                                <select class="pl-10 bg-white border @error('ferry_id') border-red-300 @else border-gray-300 @enderror rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm" id="ferry_id" name="ferry_id" required>
                                    <option value="">-- Pilih Kapal --</option>
                                    @foreach($ferries as $ferry)
                                        <option value="{{ $ferry->id }}"
                                            {{ old('ferry_id') == $ferry->id ? 'selected' : '' }}>
                                            {{ $ferry->name }} ({{ $ferry->registration_number }})
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            @error('ferry_id')
                                <p id="ferry_id-error" class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                            <p class="text-xs text-gray-500 mt-1">Kapal yang akan beroperasi pada jadwal ini</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label for="departure_time" class="block text-sm font-medium text-gray-700 mb-1">
                                Waktu Keberangkatan <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-clock text-gray-400"></i>
                                </div>
                                <input type="time"
                                    class="pl-10 bg-white border @error('departure_time') border-red-300 @else border-gray-300 @enderror rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                                    id="departure_time"
                                    name="departure_time"
                                    value="{{ old('departure_time') }}"
                                    required>
                            </div>
                            @error('departure_time')
                                <p id="departure_time-error" class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                            <p class="text-xs text-gray-500 mt-1">Waktu keberangkatan kapal (format 24 jam)</p>
                        </div>

                        <div>
                            <label for="arrival_time" class="block text-sm font-medium text-gray-700 mb-1">
                                Waktu Kedatangan <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-clock text-gray-400"></i>
                                </div>
                                <input type="time"
                                    class="pl-10 bg-white border @error('arrival_time') border-red-300 @else border-gray-300 @enderror rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                                    id="arrival_time"
                                    name="arrival_time"
                                    value="{{ old('arrival_time') }}"
                                    required>
                            </div>
                            @error('arrival_time')
                                <p id="arrival_time-error" class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                            <p class="text-xs text-gray-500 mt-1">Perkiraan waktu kedatangan (format 24 jam)</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                                Status <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-toggle-on text-gray-400"></i>
                                </div>
                                <select class="pl-10 bg-white border @error('status') border-red-300 @else border-gray-300 @enderror rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm" id="status" name="status" required>
                                    <option value="ACTIVE" {{ old('status', 'ACTIVE') == 'ACTIVE' ? 'selected' : '' }}>Aktif</option>
                                    <option value="DELAYED" {{ old('status') == 'DELAYED' ? 'selected' : '' }}>Tertunda</option>
                                    <option value="CANCELLED" {{ old('status') == 'CANCELLED' ? 'selected' : '' }}>Dibatalkan</option>
                                    <option value="FULL" {{ old('status') == 'FULL' ? 'selected' : '' }}>Penuh</option>
                                </select>
                            </div>
                            @error('status')
                                <p id="status-error" class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                            <p class="text-xs text-gray-500 mt-1">Status keaktifan jadwal</p>
                        </div>

                        <div id="reasonContainer" class="hidden">
                            <label for="status_reason" class="block text-sm font-medium text-gray-700 mb-1">
                                Alasan Status
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-comment-alt text-gray-400"></i>
                                </div>
                                <input type="text"
                                    class="pl-10 bg-white border @error('status_reason') border-red-300 @else border-gray-300 @enderror rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                                    id="status_reason"
                                    name="status_reason"
                                    value="{{ old('status_reason') }}"
                                    placeholder="Mis. Cuaca buruk, Pemeliharaan kapal">
                            </div>
                            @error('status_reason')
                                <p id="status_reason-error" class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                            <p class="text-xs text-gray-500 mt-1">Alasan jika status tidak aktif</p>
                        </div>
                    </div>

                    <div id="expiryDateContainer" class="mt-6 hidden">
                        <label for="status_expiry_date" class="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Berakhir Status
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-calendar-alt text-gray-400"></i>
                            </div>
                            <input type="datetime-local"
                                class="pl-10 bg-white border @error('status_expiry_date') border-red-300 @else border-gray-300 @enderror rounded-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm"
                                id="status_expiry_date"
                                name="status_expiry_date"
                                value="{{ old('status_expiry_date') }}">
                        </div>
                        <p class="mt-1 text-xs text-gray-500">Isi jika status akan berakhir pada waktu tertentu. Khusus untuk status Ditunda (DELAYED).</p>
                    </div>
                </div>

                <!-- Operating Days Section -->
                <div id="operatingDaysSection" class="operating-days-section bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm" style="display:none;">
                    <h2 class="text-lg font-semibold mb-4 text-gray-800 flex items-center border-b pb-3">
                        <i class="fas fa-calendar-alt mr-2 text-blue-500"></i> Hari Operasional
                    </h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="md:col-span-2">
                            <p class="mb-3 text-sm text-gray-700">Pilih hari-hari di mana jadwal ini beroperasi:</p>
                            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 days-selection">
                                <div class="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
                                    <input type="checkbox" id="day_1" name="days[]" value="1"
                                        {{ is_array(old('days')) && in_array('1', old('days')) ? 'checked' : '' }}
                                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
                                    <label for="day_1" class="ml-2 text-sm font-medium text-gray-900 cursor-pointer select-none">Senin</label>
                                </div>
                                <div class="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
                                    <input type="checkbox" id="day_2" name="days[]" value="2"
                                        {{ is_array(old('days')) && in_array('2', old('days')) ? 'checked' : '' }}
                                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
                                    <label for="day_2" class="ml-2 text-sm font-medium text-gray-900 cursor-pointer select-none">Selasa</label>
                                </div>
                                <div class="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
                                    <input type="checkbox" id="day_3" name="days[]" value="3"
                                        {{ is_array(old('days')) && in_array('3', old('days')) ? 'checked' : '' }}
                                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
                                    <label for="day_3" class="ml-2 text-sm font-medium text-gray-900 cursor-pointer select-none">Rabu</label>
                                </div>
                                <div class="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
                                    <input type="checkbox" id="day_4" name="days[]" value="4"
                                        {{ is_array(old('days')) && in_array('4', old('days')) ? 'checked' : '' }}
                                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
                                    <label for="day_4" class="ml-2 text-sm font-medium text-gray-900 cursor-pointer select-none">Kamis</label>
                                </div>
                                <div class="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
                                    <input type="checkbox" id="day_5" name="days[]" value="5"
                                        {{ is_array(old('days')) && in_array('5', old('days')) ? 'checked' : '' }}
                                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
                                    <label for="day_5" class="ml-2 text-sm font-medium text-gray-900 cursor-pointer select-none">Jumat</label>
                                </div>
                                <div class="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
                                    <input type="checkbox" id="day_6" name="days[]" value="6"
                                        {{ is_array(old('days')) && in_array('6', old('days')) ? 'checked' : '' }}
                                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
                                    <label for="day_6" class="ml-2 text-sm font-medium text-gray-900 cursor-pointer select-none">Sabtu</label>
                                </div>
                                <div class="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
                                    <input type="checkbox" id="day_7" name="days[]" value="7"
                                        {{ is_array(old('days')) && in_array('7', old('days')) ? 'checked' : '' }}
                                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
                                    <label for="day_7" class="ml-2 text-sm font-medium text-gray-900 cursor-pointer select-none">Minggu</label>
                                </div>
                            </div>
                            @error('days')
                                <p id="days-error" class="mt-1 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                            <p class="text-xs text-gray-500 mt-2">Jadwal ini akan beroperasi setiap hari yang dipilih</p>
                        </div>
                    </div>

                    <!-- Schedule Summary Card -->
                    <div class="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                        <h3 class="text-md font-semibold text-gray-800 mb-3 flex items-center">
                            <i class="fas fa-clipboard-list mr-2 text-blue-500"></i> Ringkasan Jadwal
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Rute:</p>
                                <p class="font-medium text-gray-900 flex items-center" id="summary_route">
                                    <i class="fas fa-route mr-2 text-blue-500"></i>
                                    <span id="summary_route_text">-</span>
                                </p>
                            </div>
                            <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Kapal:</p>
                                <p class="font-medium text-gray-900 flex items-center" id="summary_ferry">
                                    <i class="fas fa-ship mr-2 text-blue-500"></i>
                                    <span id="summary_ferry_text">-</span>
                                </p>
                            </div>
                            <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Waktu:</p>
                                <p class="font-medium text-gray-900 flex items-center" id="summary_time">
                                    <i class="fas fa-clock mr-2 text-blue-500"></i>
                                    <span id="summary_time_text">-</span>
                                </p>
                            </div>
                            <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Hari Operasional:</p>
                                <p class="font-medium text-gray-900 flex items-center" id="summary_days">
                                    <i class="fas fa-calendar-day mr-2 text-blue-500"></i>
                                    <span id="summary_days_text">-</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form Actions -->
                <div class="flex justify-between mt-6">
                    <button type="button" id="prevBtn"
                        class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center"
                        style="display: none;">
                        <i class="fas fa-arrow-left mr-2"></i> Kembali
                    </button>

                    <div class="flex space-x-3">
                        <a href="{{ route('admin.schedules.index') }}"
                            class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center">
                            <i class="fas fa-times mr-2"></i> Batal
                        </a>
                        <button type="button" id="nextBtn"
                            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center">
                            <span>Lanjut</span> <i class="fas fa-arrow-right ml-2"></i>
                        </button>
                        <button type="submit" id="submitBtn"
                            class="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm flex items-center"
                            style="display: none;">
                            <i class="fas fa-save mr-2"></i> Simpan
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, initializing schedule form JS');

        // 1. Definisikan elemen-elemen menggunakan class yang lebih spesifik
        // Gunakan querySelector yang lebih spesifik
        const basicInfoSection = document.querySelector('.basic-info-section');
        const operatingDaysSection = document.querySelector('.operating-days-section');
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const submitBtn = document.getElementById('submitBtn');
        const progressBar = document.querySelector('.bg-blue-500');
        const statusSelect = document.getElementById('status');
        const reasonContainer = document.getElementById('reasonContainer');
        const expiryDateContainer = document.getElementById('expiryDateContainer');

        // Log untuk debugging
        console.log('Form elements found:', {
            basicInfoSection: !!basicInfoSection,
            operatingDaysSection: !!operatingDaysSection,
            nextBtn: !!nextBtn,
            prevBtn: !!prevBtn,
            submitBtn: !!submitBtn
        });

        // Day name mapping
        const dayNames = {
            1: 'Senin',
            2: 'Selasa',
            3: 'Rabu',
            4: 'Kamis',
            5: 'Jumat',
            6: 'Sabtu',
            7: 'Minggu'
        };

        // Validasi - jika elemen-elemen kritis tidak ditemukan, tampilkan pesan error dan keluar
        if (!basicInfoSection || !nextBtn) {
            console.error('Elemen form utama tidak ditemukan. Pastikan template Blade sudah benar.');
            if (document.querySelector('form')) {
                // Tampilkan pesan error ke user
                const errorAlert = document.createElement('div');
                errorAlert.className =
                    'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm';
                errorAlert.innerHTML = `
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-circle text-red-500 mt-1"></i>
                    </div>
                    <div class="ml-3">
                        <p>Terjadi kesalahan saat memuat form. Mohon refresh halaman atau hubungi administrator.</p>
                    </div>
                </div>
            `;
                document.querySelector('form').prepend(errorAlert);
            }
            return;
        }

        // Format time function
        function formatTime(timeStr) {
            if (!timeStr) return '';
            const [hours, minutes] = timeStr.split(':');
            return `${hours}:${minutes}`;
        }

        // Multi-step form handling
        let currentStep = 1;

        // Next button handler
        nextBtn.addEventListener('click', function() {
            try {
                console.log('Next button clicked, validating form...');

                // Validate current step
                if (currentStep === 1) {
                    const requiredInputs = basicInfoSection.querySelectorAll(
                        'input[required], select[required]');
                    let isValid = true;

                    requiredInputs.forEach(input => {
                        if (!input.value.trim()) {
                            const name = input.getAttribute('name');
                            let errorElement = document.getElementById(`${name}-error`);

                            if (!errorElement) {
                                errorElement = document.createElement('p');
                                errorElement.id = `${name}-error`;
                                errorElement.className = 'mt-1 text-sm text-red-600';
                                input.parentNode.appendChild(errorElement);
                            }

                            errorElement.textContent = 'Bidang ini harus diisi';
                            input.classList.add('border-red-300');
                            input.classList.remove('border-gray-300');
                            isValid = false;
                        }
                    });

                    if (!isValid) {
                        console.log('Form validation failed');
                        // Scroll to the first error
                        const firstError = document.querySelector('.text-red-600');
                        if (firstError) {
                            firstError.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                        }
                        return;
                    }

                    console.log('Form validation passed, moving to step 2');

                    // Move to next step
                    if (progressBar) progressBar.style.width = '100%';

                    // Update progress steps visual
                    const progressSteps = document.querySelectorAll('.rounded-full');
                    if (progressSteps && progressSteps.length > 1) {
                        progressSteps[1].classList.remove('bg-gray-300', 'text-gray-700');
                        progressSteps[1].classList.add('bg-blue-500', 'text-white');

                        const progressTexts = document.querySelectorAll('.font-medium');
                        if (progressTexts && progressTexts.length > 1) {
                            progressTexts[3].classList.remove('text-gray-700');
                            progressTexts[3].classList.add('text-gray-900');
                        }
                    }

                    // Hide basic info, show operating days
                    basicInfoSection.style.display = 'none';
                    if (operatingDaysSection) {
                        operatingDaysSection.style.display = 'block';
                    }

                    // Show prev button, hide next button, show submit button
                    if (prevBtn) prevBtn.style.display = 'flex';
                    nextBtn.style.display = 'none';
                    if (submitBtn) submitBtn.style.display = 'flex';

                    currentStep = 2;

                    // Update summary
                    updateSummary();

                    // Scroll to top of form
                    const form = document.querySelector('form');
                    if (form) {
                        window.scrollTo({
                            top: form.offsetTop,
                            behavior: 'smooth'
                        });
                    }

                    console.log('Step 2 shown successfully');
                }
            } catch (error) {
                console.error('Error in nextBtn handler:', error);
                alert('Terjadi kesalahan saat memproses form. Silakan refresh halaman dan coba lagi.');
            }
        });

        // Prev button handler
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                try {
                    console.log('Previous button clicked');
                    if (currentStep === 2) {
                        // Move back to first step
                        if (progressBar) progressBar.style.width = '50%';

                        const progressSteps = document.querySelectorAll('.rounded-full');
                        if (progressSteps && progressSteps.length > 1) {
                            progressSteps[1].classList.remove('bg-blue-500', 'text-white');
                            progressSteps[1].classList.add('bg-gray-300', 'text-gray-700');

                            const progressTexts = document.querySelectorAll('.font-medium');
                            if (progressTexts && progressTexts.length > 1) {
                                progressTexts[3].classList.remove('text-gray-900');
                                progressTexts[3].classList.add('text-gray-700');
                            }
                        }

                        // Show basic info, hide operating days
                        basicInfoSection.style.display = 'block';
                        if (operatingDaysSection) {
                            operatingDaysSection.style.display = 'none';
                        }

                        // Hide prev button, show next button, hide submit button
                        prevBtn.style.display = 'none';
                        nextBtn.style.display = 'flex';
                        if (submitBtn) submitBtn.style.display = 'none';

                        currentStep = 1;

                        // Scroll to top of form
                        const form = document.querySelector('form');
                        if (form) {
                            window.scrollTo({
                                top: form.offsetTop,
                                behavior: 'smooth'
                            });
                        }

                        console.log('Returned to step 1');
                    }
                } catch (error) {
                    console.error('Error in prevBtn handler:', error);
                }
            });
        }

        // Update summary
        function updateSummary() {
            try {
                console.log('Updating summary information');
                // Get selected route
                const routeSelect = document.getElementById('route_id');
                const summaryRouteText = document.getElementById('summary_route_text');

                if (routeSelect && summaryRouteText) {
                    const selectedIndex = routeSelect.selectedIndex;
                    if (selectedIndex >= 0) {
                        const routeText = routeSelect.options[selectedIndex].text || '-';
                        summaryRouteText.textContent = routeText;
                    }
                }

                // Get selected ferry
                const ferrySelect = document.getElementById('ferry_id');
                const summaryFerryText = document.getElementById('summary_ferry_text');

                if (ferrySelect && summaryFerryText) {
                    const selectedIndex = ferrySelect.selectedIndex;
                    if (selectedIndex >= 0) {
                        const ferryText = ferrySelect.options[selectedIndex].text || '-';
                        summaryFerryText.textContent = ferryText;
                    }
                }

                // Get time
                const departureTime = document.getElementById('departure_time')?.value;
                const arrivalTime = document.getElementById('arrival_time')?.value;
                const summaryTimeText = document.getElementById('summary_time_text');

                if (summaryTimeText) {
                    let timeText = '-';
                    if (departureTime && arrivalTime) {
                        timeText = `${formatTime(departureTime)} - ${formatTime(arrivalTime)}`;
                    }
                    summaryTimeText.textContent = timeText;
                }

                // Get days
                const selectedDays = [];
                const checkboxes = document.querySelectorAll('input[name="days[]"]:checked');

                checkboxes.forEach(checkbox => {
                    const value = checkbox.value;
                    if (dayNames[value]) {
                        selectedDays.push(dayNames[value]);
                    }
                });

                const summaryDaysText = document.getElementById('summary_days_text');
                if (summaryDaysText) {
                    summaryDaysText.textContent = selectedDays.length > 0 ? selectedDays.join(', ') : '-';
                }

                console.log('Summary updated successfully');
            } catch (error) {
                console.error('Error updating summary:', error);
            }
        }

        // Listen for changes to update summary
        const routeId = document.getElementById('route_id');
        const ferryId = document.getElementById('ferry_id');
        const departureTime = document.getElementById('departure_time');
        const arrivalTime = document.getElementById('arrival_time');

        if (routeId) routeId.addEventListener('change', updateSummary);
        if (ferryId) ferryId.addEventListener('change', updateSummary);
        if (departureTime) {
            departureTime.addEventListener('change', function() {
                calculateArrivalTime();
                updateSummary();
            });
        }
        if (arrivalTime) arrivalTime.addEventListener('change', updateSummary);

        document.querySelectorAll('input[name="days[]"]').forEach(checkbox => {
            checkbox.addEventListener('change', updateSummary);
        });

        // Auto-calculate arrival time based on departure time and route duration
        function calculateArrivalTime() {
            try {
                console.log('Calculating arrival time');
                const departureTimeInput = document.getElementById('departure_time');
                const arrivalTimeInput = document.getElementById('arrival_time');
                const routeSelect = document.getElementById('route_id');

                if (!departureTimeInput || !arrivalTimeInput || !routeSelect) {
                    console.warn('Missing elements for arrival time calculation');
                    return;
                }

                const selectedIndex = routeSelect.selectedIndex;
                if (selectedIndex < 0) {
                    console.warn('No route selected for duration calculation');
                    return;
                }

                const selectedOption = routeSelect.options[selectedIndex];
                const duration = selectedOption.getAttribute('data-duration');

                if (departureTimeInput.value && duration) {
                    console.log(
                        `Calculating arrival time using departure: ${departureTimeInput.value}, duration: ${duration} mins`
                        );

                    // Parse departure time
                    const [hours, minutes] = departureTimeInput.value.split(':').map(Number);

                    // Calculate arrival time
                    let totalMinutes = hours * 60 + minutes + parseInt(duration);
                    const arrivalHours = Math.floor(totalMinutes / 60) % 24;
                    const arrivalMinutes = totalMinutes % 60;

                    // Format arrival time
                    const formattedHours = arrivalHours.toString().padStart(2, '0');
                    const formattedMinutes = arrivalMinutes.toString().padStart(2, '0');
                    arrivalTimeInput.value = `${formattedHours}:${formattedMinutes}`;

                    console.log(`Arrival time calculated: ${formattedHours}:${formattedMinutes}`);
                }
            } catch (error) {
                console.error('Error calculating arrival time:', error);
            }
        }

        // Form validation
        const form = document.querySelector('form#scheduleForm');
        if (form) {
            form.addEventListener('submit', function(event) {
                try {
                    console.log('Form submission attempted, validating...');
                    let hasError = false;

                    // Validate required inputs
                    const requiredInputs = form.querySelectorAll('input[required], select[required]');
                    requiredInputs.forEach(input => {
                        if (!input.value.trim()) {
                            const name = input.getAttribute('name') || 'field';
                            let errorElement = document.getElementById(`${name}-error`);

                            if (!errorElement) {
                                errorElement = document.createElement('p');
                                errorElement.id = `${name}-error`;
                                errorElement.className = 'mt-1 text-sm text-red-600';
                                if (input.parentNode) {
                                    input.parentNode.appendChild(errorElement);
                                }
                            }

                            errorElement.textContent = 'Bidang ini harus diisi';
                            input.classList.add('border-red-300');
                            input.classList.remove('border-gray-300');
                            hasError = true;
                        }
                    });

                    // Check if at least one day is selected
                    const daysCheckboxes = document.querySelectorAll('input[name="days[]"]:checked');
                    if (daysCheckboxes.length === 0) {
                        const daysContainer = document.querySelector('.days-selection');
                        if (daysContainer && daysContainer.parentNode) {
                            const errorElement = document.getElementById('days-error') || document
                                .createElement('p');
                            errorElement.id = 'days-error';
                            errorElement.className = 'mt-1 text-sm text-red-600';
                            errorElement.textContent = 'Pilih minimal satu hari operasional';
                            daysContainer.parentNode.appendChild(errorElement);
                            hasError = true;
                        }
                    }

                    if (hasError) {
                        console.log('Form validation failed, preventing submission');
                        event.preventDefault();

                        // Show the first step if there are errors in it
                        if (currentStep === 2) {
                            // Check if there are errors in the basic info section
                            const basicInfoErrors = Array.from(basicInfoSection.querySelectorAll(
                                    '.text-red-600'))
                                .filter(el => el.textContent.trim() !== '');

                            if (basicInfoErrors.length > 0) {
                                console.log('Errors found in step 1, returning to basic info');
                                if (prevBtn) prevBtn.click();
                            }
                        }

                        // Scroll to the first error
                        const firstError = document.querySelector('.text-red-600');
                        if (firstError) {
                            firstError.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                        }
                    } else {
                        console.log('Form validation passed, submitting');
                    }
                } catch (error) {
                    console.error('Error in form submit handler:', error);
                    event.preventDefault();
                    alert('Terjadi kesalahan saat memproses form. Silakan coba lagi.');
                }
            });

            // Clear validation errors on input
            const requiredInputs = form.querySelectorAll('input[required], select[required]');
            requiredInputs.forEach(input => {
                input.addEventListener('input', function() {
                    try {
                        if (this.value.trim()) {
                            this.classList.remove('border-red-300');
                            this.classList.add('border-gray-300');

                            const name = this.getAttribute('name');
                            if (name) {
                                const errorElement = document.getElementById(`${name}-error`);
                                if (errorElement) {
                                    errorElement.textContent = '';
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error in input handler:', error);
                    }
                });
            });

            // Clear days error when a day is checked
            document.querySelectorAll('input[name="days[]"]').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    try {
                        if (document.querySelectorAll('input[name="days[]"]:checked').length > 0) {
                            const errorElement = document.getElementById('days-error');
                            if (errorElement) {
                                errorElement.textContent = '';
                            }
                        }
                    } catch (error) {
                        console.error('Error in checkbox handler:', error);
                    }
                });
            });
        }

        // Handle status changes
        function updateStatusContainers() {
            if (statusSelect.value === 'ACTIVE') {
                reasonContainer.classList.add('hidden');
                expiryDateContainer.classList.add('hidden');
            } else {
                reasonContainer.classList.remove('hidden');

                if (statusSelect.value === 'DELAYED') {
                    expiryDateContainer.classList.remove('hidden');
                } else {
                    expiryDateContainer.classList.add('hidden');
                }
            }
        }

        // Initial check for status containers
        updateStatusContainers();

        // Add event listener for status changes
        statusSelect.addEventListener('change', updateStatusContainers);

        console.log('Form JS initialization complete');
    });
</script>
@endsection
