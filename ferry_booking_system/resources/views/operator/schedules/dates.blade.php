@extends('layouts.app')

@section('title', 'Tanggal Jadwal')

@section('content')
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header dengan gradient background -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg mb-8 p-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                <div class="flex items-center space-x-4">
                    <div class="p-3 bg-white bg-opacity-30 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-white">Tanggal Jadwal</h1>
                        <p class="text-blue-100 mt-1">{{ $schedule->route->origin }} - {{ $schedule->route->destination }} •
                            {{ $schedule->departure_time->format('H:i') }}</p>
                    </div>
                </div>
                <div class="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                    <a href="{{ route('operator.schedules.show', $schedule->id) }}"
                        class="inline-flex items-center px-4 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Detail Jadwal
                    </a>
                    <a href="{{ route('operator.schedules.create-date', $schedule->id) }}"
                        class="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Tambah Tanggal
                    </a>
                </div>
            </div>
        </div>

        <!-- Alert Messages -->
        @if (session('success'))
            <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm"
                role="alert" id="successAlert">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium">{{ session('success') }}</p>
                    </div>
                    <div class="ml-auto pl-3">
                        <div class="-mx-1.5 -my-1.5">
                            <button type="button"
                                class="inline-flex bg-green-100 text-green-500 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                onclick="document.getElementById('successAlert').remove()">
                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        @endif

        @if (session('error'))
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert"
                id="errorAlert">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium">{{ session('error') }}</p>
                    </div>
                    <div class="ml-auto pl-3">
                        <div class="-mx-1.5 -my-1.5">
                            <button type="button"
                                class="inline-flex bg-red-100 text-red-500 rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                onclick="document.getElementById('errorAlert').remove()">
                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        @endif

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <!-- Jadwal Info Card -->
            <div class="lg:col-span-3 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 class="text-lg font-semibold text-gray-800">Informasi Jadwal</h2>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <p class="text-xs text-gray-500 mb-1">ID Jadwal</p>
                            <p class="text-lg font-semibold text-gray-800">{{ $schedule->id }}</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <p class="text-xs text-gray-500 mb-1">Status</p>
                            @if ($schedule->status == 'ACTIVE')
                                <p
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Aktif
                                </p>
                            @else
                                <p
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Tidak Aktif
                                </p>
                            @endif
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <p class="text-xs text-gray-500 mb-1">Waktu Keberangkatan</p>
                            <p class="text-lg font-semibold text-gray-800">{{ $schedule->departure_time->format('H:i') }}
                            </p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <p class="text-xs text-gray-500 mb-1">Waktu Kedatangan</p>
                            <p class="text-lg font-semibold text-gray-800">{{ $schedule->arrival_time->format('H:i') }}</p>
                        </div>
                    </div>

                    <div class="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p class="text-xs text-gray-500 mb-1">Hari Operasi</p>
                        <div class="flex flex-wrap gap-2 mt-1">
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
                            @foreach ($days as $day)
                                <span
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {{ $dayNames[$day] ?? $day }}
                                </span>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tanggal Jadwal Table -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h2 class="text-lg font-semibold text-gray-800">Tanggal Jadwal yang Tersedia</h2>
                </div>
                <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Total: {{ $dates->total() }} tanggal
                </span>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal</th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status</th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Alasan Status</th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kapasitas Tersisa</th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Penumpang</th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kendaraan</th>
                            <th scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @forelse($dates as $date)
                            <tr class="hover:bg-gray-50 transition-colors duration-150">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="text-sm font-medium text-gray-900">
                                            {{ \Carbon\Carbon::parse($date->date)->format('d F Y') }}</div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    @if ($date->status == 'ACTIVE')
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Tersedia
                                        </span>
                                    @elseif($date->status == 'INACTIVE')
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Tidak Tersedia
                                        </span>
                                    @elseif($date->status == 'FULL')
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Penuh
                                        </span>
                                    @elseif($date->status == 'CANCELLED')
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            Dibatalkan
                                        </span>
                                    @elseif($date->status == 'WEATHER_ISSUE')
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Masalah Cuaca
                                        </span>
                                    @endif
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-500">{{ $date->status_reason ?? '-' }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    @php
                                        $passengerPercentage =
                                            $schedule->ferry->capacity_passenger > 0
                                                ? 100 -
                                                    ($date->passenger_count / $schedule->ferry->capacity_passenger) *
                                                        100
                                                : 0;
                                    @endphp
                                    <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                        <div class="bg-blue-600 h-2.5 rounded-full"
                                            style="width: {{ $passengerPercentage }}%"></div>
                                    </div>
                                    <div class="text-xs text-gray-500">
                                        {{ $schedule->ferry->capacity_passenger - $date->passenger_count }} dari
                                        {{ $schedule->ferry->capacity_passenger }} kursi tersedia
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-center">
                                    <span
                                        class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-semibold">
                                        {{ $date->passenger_count }}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-xs text-gray-500 space-y-1">
                                        <div class="flex items-center justify-between">
                                            <span>Motor:</span>
                                            <span class="font-semibold">{{ $date->motorcycle_count }}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span>Mobil:</span>
                                            <span class="font-semibold">{{ $date->car_count }}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span>Bus:</span>
                                            <span class="font-semibold">{{ $date->bus_count }}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span>Truk:</span>
                                            <span class="font-semibold">{{ $date->truck_count }}</span>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-2">
                                    <button type="button" onclick="openUpdateStatusModal('{{ $date->id }}')"
                                        class="flex w-full items-center justify-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Update Status
                                    </button>

                                    <button type="button"
                                        onclick="openDeleteModal('{{ $date->id }}', '{{ \Carbon\Carbon::parse($date->date)->format('d F Y') }}')"
                                        class="flex w-full items-center justify-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="px-6 py-4 text-sm text-gray-500 text-center">Tidak ada data
                                    tanggal jadwal</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            <div class="bg-white px-6 py-4 border-t border-gray-200">
                {{ $dates->links() }}
            </div>
        </div>

        <!-- Modal Update Status -->
        @foreach ($dates as $date)
            <div id="updateStatusModal{{ $date->id }}"
                class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
                <div class="bg-white rounded-xl max-w-lg w-full mx-4 shadow-2xl transform transition-all">
                    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 class="text-lg font-medium text-gray-900">
                            Update Status Tanggal: {{ \Carbon\Carbon::parse($date->date)->format('d F Y') }}
                        </h3>
                        <button type="button" class="text-gray-400 hover:text-gray-500"
                            onclick="closeModal('updateStatusModal{{ $date->id }}')">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <form action="{{ route('operator.schedules.update-date-status', ['id' => $schedule->id, 'dateId' => $date->id]) }}"
                        method="POST"
                        id="updateStatusForm{{ $date->id }}">
                        @csrf
                        @method('PUT')
                        <div class="px-6 py-4">
                            <div class="mb-4">
                                <label for="status{{ $date->id }}"
                                    class="block text-sm font-medium text-gray-700 mb-1">Status:</label>
                                <select
                                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                    id="status{{ $date->id }}" name="status" required>
                                    <option value="ACTIVE" {{ $date->status == 'ACTIVE' ? 'selected' : '' }}>Tersedia</option>
                                    <option value="INACTIVE" {{ $date->status == 'INACTIVE' ? 'selected' : '' }}>Tidak Tersedia</option>
                                    <option value="CANCELLED" {{ $date->status == 'CANCELLED' ? 'selected' : '' }}>Dibatalkan</option>
                                    <option value="FULL" {{ $date->status == 'FULL' ? 'selected' : '' }}>Penuh</option>
                                    <option value="WEATHER_ISSUE" {{ $date->status == 'WEATHER_ISSUE' ? 'selected' : '' }}>Masalah Cuaca</option>
                                </select>
                            </div>
                            <div class="mb-4">
                                <label for="statusReason{{ $date->id }}"
                                    class="block text-sm font-medium text-gray-700 mb-1">Alasan Status (Opsional):</label>
                                <textarea
                                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                    id="statusReason{{ $date->id }}" name="status_reason" rows="3">{{ $date->status_reason }}</textarea>
                            </div>

                            <div class="mb-4 weather-expiry-group-{{ $date->id }}"
                                style="display: {{ $date->status == 'WEATHER_ISSUE' ? 'block' : 'none' }};">
                                <label for="statusExpiryDate{{ $date->id }}"
                                    class="block text-sm font-medium text-gray-700 mb-1">Tanggal & Waktu Berakhir Status:</label>
                                <input type="datetime-local"
                                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                    id="statusExpiryDate{{ $date->id }}"
                                    name="status_expiry_date"
                                    value="{{ $date->status_expiry_date ? \Carbon\Carbon::parse($date->status_expiry_date)->format('Y-m-d\TH:i') : '' }}">
                                <p class="text-xs text-gray-500 mt-1">Format: Tanggal dan Waktu (yyyy-mm-dd HH:MM)</p>
                            </div>
                        </div>
                        <div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                            <button type="button"
                                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150"
                                onclick="closeModal('updateStatusModal{{ $date->id }}')">
                                Batal
                            </button>
                            <button type="submit"
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150">
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal Delete -->
            <div id="deleteModal{{ $date->id }}"
                class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
                <div class="bg-white rounded-xl max-w-md w-full mx-4 shadow-2xl transform transition-all">
                    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 class="text-lg font-medium text-gray-900">Konfirmasi Hapus</h3>
                        <button type="button" class="text-gray-400 hover:text-gray-500"
                            onclick="closeModal('deleteModal{{ $date->id }}')">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="px-6 py-4">
                        <div class="text-sm text-gray-600">
                            Apakah Anda yakin ingin menghapus tanggal jadwal:
                            <div class="font-semibold text-gray-900 mt-1">
                                {{ \Carbon\Carbon::parse($date->date)->format('d F Y') }}</div>
                        </div>
                        <div class="mt-3 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                            <div class="font-semibold">Perhatian:</div>
                            <div>Tindakan ini tidak dapat dibatalkan dan seluruh data terkait dengan tanggal ini akan
                                dihapus.</div>
                        </div>
                    </div>
                    <div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                        <button type="button"
                            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150"
                            onclick="closeModal('deleteModal{{ $date->id }}')">
                            Batal
                        </button>
                        <form
                            action="{{ route('operator.schedules.destroy-date', ['id' => $schedule->id, 'dateId' => $date->id]) }}"
                            method="POST">
                            @csrf
                            @method('DELETE')
                            <button type="submit"
                                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150">
                                Hapus
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
@endsection

@section('scripts')
    <script>
        document.addEventListener('DOMContentLoaded', function() {
    // Kode event listener untuk status
    const statusSelects = document.querySelectorAll('select[id^="status"]');
    statusSelects.forEach(select => {
        select.addEventListener('change', function() {
            const id = this.id.replace('status', '');
            const expiryGroup = document.querySelector(`.weather-expiry-group-${id}`);
            const expiryInput = document.getElementById(`statusExpiryDate${id}`);

            console.log('Status changed to:', this.value);
            console.log('ID:', id);
            console.log('expiryGroup:', expiryGroup);

            if (this.value === 'WEATHER_ISSUE') {
                expiryGroup.style.display = 'block';
                if (expiryInput) expiryInput.setAttribute('required', 'required');
            } else {
                expiryGroup.style.display = 'none';
                if (expiryInput) expiryInput.removeAttribute('required');
            }
        });
    });

    // Tambahkan event listener untuk form submission
    const updateForms = document.querySelectorAll('form[id^="updateStatusForm"]');
    updateForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Kode debugging
            console.log('Form submitted:', this.id);
            const statusSelect = this.querySelector('select[name="status"]');
            console.log('Selected status:', statusSelect ? statusSelect.value : 'not found');

            // Jika status WEATHER_ISSUE, pastikan expiry date diisi
            if (statusSelect && statusSelect.value === 'WEATHER_ISSUE') {
                const expiryDateInput = this.querySelector('input[name="status_expiry_date"]');
                if (expiryDateInput && !expiryDateInput.value) {
                    e.preventDefault();
                    alert('Tanggal & Waktu Berakhir Status harus diisi untuk status Masalah Cuaca.');
                    return false;
                }
            }
        });
    });
});

        // Modal functions
        function openUpdateStatusModal(id) {
            document.getElementById(`updateStatusModal${id}`).classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function openDeleteModal(id, date) {
            document.getElementById(`deleteModal${id}`).classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeModal(id) {
            document.getElementById(id).classList.add('hidden');
            document.body.style.overflow = 'auto';
        }

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

        document.addEventListener('DOMContentLoaded', dismissAlerts);
    </script>
@endsection
