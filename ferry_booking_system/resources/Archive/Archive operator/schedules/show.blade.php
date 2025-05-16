@extends('layouts.app')

@section('title', 'Detail Jadwal')

@section('content')
<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header dengan gradient background -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-8 p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="flex items-center space-x-4">
                <div class="p-3 bg-white bg-opacity-30 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-white">Detail Jadwal</h1>
                    <p class="text-blue-100 mt-1">{{ $schedule->route->origin }} - {{ $schedule->route->destination }}</p>
                </div>
            </div>
            <div class="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                <a href="{{ route('operator.schedules.index') }}"
                   class="inline-flex items-center px-4 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali
                </a>
                <a href="{{ route('operator.schedules.dates', $schedule->id) }}"
                   class="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Kelola Tanggal
                </a>
            </div>
        </div>
    </div>

    <!-- Alert Messages -->
    @if(session('success'))
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

    @if(session('error'))
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

    <!-- Jadwal Summary Bar -->
    <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div class="p-4 flex flex-col items-center justify-center">
                <span class="text-sm text-gray-500 mb-1">ID Jadwal</span>
                <span class="text-xl font-bold text-gray-800">{{ $schedule->id }}</span>
            </div>
            <div class="p-4 flex flex-col items-center justify-center">
                <span class="text-sm text-gray-500 mb-1">Status</span>
                @if($schedule->status == 'ACTIVE')
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Aktif
                    </span>
                @else
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Tidak Aktif
                    </span>
                @endif
            </div>
            <div class="p-4 flex flex-col items-center justify-center">
                <span class="text-sm text-gray-500 mb-1">Keberangkatan</span>
                <span class="text-xl font-bold text-gray-800">{{ $schedule->departure_time->format('H:i') }}</span>
            </div>
            <div class="p-4 flex flex-col items-center justify-center">
                <span class="text-sm text-gray-500 mb-1">Kedatangan</span>
                <span class="text-xl font-bold text-gray-800">{{ $schedule->arrival_time->format('H:i') }}</span>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Jadwal Info Card -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-lg font-semibold text-gray-800">Informasi Jadwal</h2>
            </div>
            <div class="p-6">
                <div class="space-y-4">
                    <div class="flex flex-col">
                        <span class="text-sm text-gray-500 mb-1">Hari Operasi</span>
                        <div class="flex flex-wrap gap-2">
                            @php
                            $days = explode(',', $schedule->days);
                            $dayNames = ['1' => 'Senin', '2' => 'Selasa', '3' => 'Rabu', '4' => 'Kamis', '5' => 'Jumat', '6' => 'Sabtu', '7' => 'Minggu'];
                            @endphp
                            @foreach($days as $day)
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {{ $dayNames[$day] ?? $day }}
                                </span>
                            @endforeach
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-gray-50 rounded-lg p-4 flex flex-col">
                            <span class="text-sm text-gray-500 mb-1">Dibuat pada</span>
                            <span class="text-sm font-medium text-gray-800">{{ $schedule->created_at->format('d M Y H:i') }}</span>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4 flex flex-col">
                            <span class="text-sm text-gray-500 mb-1">Diperbarui pada</span>
                            <span class="text-sm font-medium text-gray-800">{{ $schedule->updated_at->format('d M Y H:i') }}</span>
                        </div>
                    </div>

                    <div class="mt-4">
                        <a href="{{ route('operator.schedules.dates', $schedule->id) }}" class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-150">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Lihat dan kelola semua tanggal jadwal
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Rute Info Card -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <h2 class="text-lg font-semibold text-gray-800">Informasi Rute</h2>
            </div>
            <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                    <div class="text-center px-4 py-2 bg-blue-50 rounded-lg">
                        <span class="block text-sm text-gray-500">Asal</span>
                        <span class="block text-lg font-bold text-blue-700">{{ $schedule->route->origin }}</span>
                    </div>

                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>

                    <div class="text-center px-4 py-2 bg-indigo-50 rounded-lg">
                        <span class="block text-sm text-gray-500">Tujuan</span>
                        <span class="block text-lg font-bold text-indigo-700">{{ $schedule->route->destination }}</span>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="bg-gray-50 rounded-lg p-4 flex flex-col">
                        <span class="text-sm text-gray-500 mb-1">ID Rute</span>
                        <span class="text-sm font-medium text-gray-800">{{ $schedule->route->id }}</span>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4 flex flex-col">
                        <span class="text-sm text-gray-500 mb-1">Jarak</span>
                        <span class="text-sm font-medium text-gray-800">{{ $schedule->route->distance }} km</span>
                    </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-4 flex flex-col">
                    <span class="text-sm text-gray-500 mb-1">Durasi Perjalanan</span>
                    <span class="text-sm font-medium text-gray-800">
                        @php
                        $hours = floor($schedule->route->duration / 60);
                        $minutes = $schedule->route->duration % 60;
                        $durationText = [];

                        if ($hours > 0) {
                            $durationText[] = $hours . ' jam';
                        }

                        if ($minutes > 0) {
                            $durationText[] = $minutes . ' menit';
                        }

                        echo implode(' ', $durationText);
                        @endphp
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Ferry Info Card -->
    <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 class="text-lg font-semibold text-gray-800">Informasi Kapal</h2>
        </div>
        <div class="p-6">
            <div class="flex flex-col md:flex-row md:items-start md:space-x-6">
                <div class="md:w-1/3 mb-6 md:mb-0">
                    <div class="bg-gray-50 rounded-xl p-6 text-center">
                        <div class="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800">{{ $schedule->ferry->name }}</h3>
                        <p class="text-sm text-gray-500 mt-1">ID Kapal: {{ $schedule->ferry->id }}</p>
                    </div>
                </div>

                <div class="md:w-2/3">
                    <h3 class="text-lg font-medium text-gray-800 mb-4">Informasi Kapasitas</h3>

                    <div class="bg-blue-50 rounded-lg p-4 mb-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="block text-sm text-gray-500">Kapasitas Penumpang</span>
                                <span class="block text-2xl font-bold text-blue-700">{{ $schedule->ferry->capacity_passenger }}</span>
                                <span class="text-xs text-gray-500">orang</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>

                    <h4 class="text-sm font-medium text-gray-700 mb-2">Kapasitas Kendaraan</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div class="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span class="block text-lg font-bold text-gray-800">{{ $schedule->ferry->capacity_motorcycle }}</span>
                            <span class="text-xs text-gray-500">Motor</span>
                        </div>

                        <div class="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span class="block text-lg font-bold text-gray-800">{{ $schedule->ferry->capacity_car }}</span>
                            <span class="text-xs text-gray-500">Mobil</span>
                        </div>

                        <div class="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span class="block text-lg font-bold text-gray-800">{{ $schedule->ferry->capacity_bus }}</span>
                            <span class="text-xs text-gray-500">Bus</span>
                        </div>

                        <div class="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span class="block text-lg font-bold text-gray-800">{{ $schedule->ferry->capacity_truck }}</span>
                            <span class="text-xs text-gray-500">Truk</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Tanggal Mendatang -->
    <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Tanggal Jadwal Mendatang</h3>

        <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Booking</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @forelse($upcomingDates as $date)
                        <tr class="hover:bg-gray-50 transition-colors duration-150">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{{ \Carbon\Carbon::parse($date->date)->format('d F Y') }}</div>
                                <div class="text-xs text-gray-500">{{ \Carbon\Carbon::parse($date->date)->format('l') }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                @if ($date->status == 'ACTIVE')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Tersedia
                                    </span>
                                @elseif($date->status == 'INACTIVE')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Tidak Tersedia
                                    </span>
                                @elseif($date->status == 'FULL')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Penuh
                                    </span>
                                @elseif($date->status == 'CANCELLED')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Dibatalkan
                                    </span>
                                @elseif($date->status == 'WEATHER_ISSUE')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Masalah Cuaca
                                    </span>
                                @endif
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900 font-medium">{{ $date->booking_count }} booking</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a href="{{ route('operator.bookings.index', ['schedule_id' => $schedule->id, 'date' => $date->date]) }}"
                                   class="text-blue-600 hover:text-blue-900">
                                    Lihat Booking
                                </a>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="4" class="px-6 py-4 text-sm text-center text-gray-500">
                                Tidak ada tanggal jadwal mendatang yang tersedia.
                                <div class="mt-2">
                                    <a href="{{ route('operator.schedules.create-date', $schedule->id) }}"
                                       class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Tambahkan tanggal jadwal
                                    </a>
                                </div>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                <span class="text-sm text-gray-500">Menampilkan {{ count($upcomingDates) }} dari {{ count($upcomingDates) }} tanggal mendatang</span>
                <a href="{{ route('operator.schedules.dates', $schedule->id) }}"
                   class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-150">
                    Lihat semua tanggal
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </a>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    // Auto-dismiss alerts
    document.addEventListener('DOMContentLoaded', function() {
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
