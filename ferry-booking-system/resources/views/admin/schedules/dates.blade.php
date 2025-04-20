@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Kelola Tanggal Jadwal</h1>
        <a href="{{ route('admin.schedules.index') }}" class="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 transition ease-in-out duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
        </a>
    </div>

    @if(session('success'))
        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded" role="alert">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm">{{ session('success') }}</p>
                </div>
                <div class="ml-auto pl-3">
                    <div class="-mx-1.5 -my-1.5">
                        <button type="button" class="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" data-bs-dismiss="alert">
                            <span class="sr-only">Dismiss</span>
                            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    @endif

    <!-- Schedule Information Card -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-white">Informasi Jadwal</h2>
        </div>
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <dl class="grid grid-cols-4 md:grid-cols-3 gap-x-4 gap-y-2">
                        <dt class="col-span-1 text-sm font-medium text-gray-500">Rute:</dt>
                        <dd class="col-span-3 md:col-span-2 text-sm text-gray-900">{{ $schedule->route->origin }} - {{ $schedule->route->destination }}</dd>

                        <dt class="col-span-1 text-sm font-medium text-gray-500">Kapal:</dt>
                        <dd class="col-span-3 md:col-span-2 text-sm text-gray-900">{{ $schedule->ferry->name }}</dd>

                        <dt class="col-span-1 text-sm font-medium text-gray-500">Waktu:</dt>
                        <dd class="col-span-3 md:col-span-2 text-sm text-gray-900">{{ $schedule->departure_time }} - {{ $schedule->arrival_time }}</dd>
                    </dl>
                </div>
                <div>
                    <dl class="grid grid-cols-4 md:grid-cols-3 gap-x-4 gap-y-2">
                        <dt class="col-span-1 text-sm font-medium text-gray-500">Hari Operasi:</dt>
                        <dd class="col-span-3 md:col-span-2 text-sm text-gray-900">
                            @php
                                $days = explode(',', $schedule->days);
                                $dayNames = [
                                    1 => 'Senin',
                                    2 => 'Selasa',
                                    3 => 'Rabu',
                                    4 => 'Kamis',
                                    5 => 'Jumat',
                                    6 => 'Sabtu',
                                    7 => 'Minggu'
                                ];
                                $dayList = [];
                                foreach($days as $day) {
                                    $dayList[] = $dayNames[$day] ?? '';
                                }
                                echo implode(', ', $dayList);
                            @endphp
                        </dd>

                        <dt class="col-span-1 text-sm font-medium text-gray-500">Status:</dt>
                        <dd class="col-span-3 md:col-span-2 text-sm text-gray-900">
                            @if($schedule->status == 'ACTIVE')
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Aktif
                                </span>
                            @elseif($schedule->status == 'CANCELLED')
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    Dibatalkan
                                </span>
                            @elseif($schedule->status == 'DELAYED')
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    Ditunda
                                </span>
                            @elseif($schedule->status == 'FULL')
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Penuh
                                </span>
                            @endif
                        </dd>

                        <dt class="col-span-1 text-sm font-medium text-gray-500">Kapasitas:</dt>
                        <dd class="col-span-3 md:col-span-2 text-sm text-gray-900">
                            <div class="flex flex-col space-y-1">
                                <span>Penumpang: {{ $schedule->ferry->capacity_passenger }}</span>
                                <span>Motor: {{ $schedule->ferry->capacity_vehicle_motorcycle }}</span>
                                <span>Mobil: {{ $schedule->ferry->capacity_vehicle_car }}</span>
                                <span>Bus: {{ $schedule->ferry->capacity_vehicle_bus }}</span>
                                <span>Truk: {{ $schedule->ferry->capacity_vehicle_truck }}</span>
                            </div>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>

    <!-- Schedule Dates Card -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 bg-blue-50 border-b border-gray-200 flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-800">Tanggal Jadwal</h2>
            <button type="button" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" data-bs-toggle="modal" data-bs-target="#addDateModal">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Tanggal
            </button>
        </div>
        <div class="p-6">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penumpang</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kendaraan</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alasan</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terakhir Diperbarui</th>
                            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @forelse($scheduleDates as $date)
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {{ \Carbon\Carbon::parse($date->date)->format('d M Y') }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div class="flex items-center">
                                        <span class="mr-2">{{ $date->passenger_count }} / {{ $schedule->ferry->capacity_passenger }}</span>
                                        @php
                                            $percentage = ($schedule->ferry->capacity_passenger > 0) ?
                                                min(100, round(($date->passenger_count / $schedule->ferry->capacity_passenger) * 100)) : 0;
                                        @endphp
                                        <div class="w-16 bg-gray-200 rounded-full h-2.5">
                                            <div class="bg-blue-600 h-2.5 rounded-full" style="width: {{ $percentage }}%"></div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                    <div class="flex flex-col space-y-1">
                                        <div class="flex items-center justify-between">
                                            <span>Motor:</span>
                                            <span class="font-medium">{{ $date->motorcycle_count }} / {{ $schedule->ferry->capacity_vehicle_motorcycle }}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span>Mobil:</span>
                                            <span class="font-medium">{{ $date->car_count }} / {{ $schedule->ferry->capacity_vehicle_car }}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span>Bus:</span>
                                            <span class="font-medium">{{ $date->bus_count }} / {{ $schedule->ferry->capacity_vehicle_bus }}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span>Truk:</span>
                                            <span class="font-medium">{{ $date->truck_count }} / {{ $schedule->ferry->capacity_vehicle_truck }}</span>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    @if($date->status == 'AVAILABLE')
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Tersedia
                                        </span>
                                    @elseif($date->status == 'UNAVAILABLE')
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            Tidak Tersedia
                                        </span>
                                    @elseif($date->status == 'FULL')
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            Penuh
                                        </span>
                                    @elseif($date->status == 'CANCELLED')
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            Dibatalkan
                                        </span>
                                    @elseif($date->status == 'DEPARTED')
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                            Sudah Berangkat
                                        </span>
                                    @elseif($date->status == 'WEATHER_ISSUE')
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            Masalah Cuaca
                                        </span>
                                        @if($date->status_expiry_date)
                                            <span class="block mt-1 text-xs text-gray-500">
                                                Sampai: {{ \Carbon\Carbon::parse($date->status_expiry_date)->format('d M Y H:i') }}
                                            </span>
                                        @endif
                                    @endif

                                    @if($date->modified_by_schedule)
                                        <span class="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-800 text-white">
                                            Diubah Oleh Jadwal
                                        </span>
                                    @endif
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {{ $date->status_reason ?? '-' }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {{ $date->updated_at->format('d M Y H:i') }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div class="flex space-x-1 justify-end">
                                        <!-- Tombol Edit -->
                                        <button type="button" class="text-white bg-blue-600 hover:bg-blue-700 rounded-full p-1.5 inline-flex items-center justify-center editDateBtn"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editDateModal"
                                            data-id="{{ $date->id }}"
                                            data-date="{{ \Carbon\Carbon::parse($date->date)->format('d M Y') }}"
                                            data-status="{{ $date->status }}"
                                            data-reason="{{ $date->status_reason }}"
                                            data-expiry="{{ $date->status_expiry_date ? \Carbon\Carbon::parse($date->status_expiry_date)->format('Y-m-d\TH:i') : '' }}">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>

                                        <!-- Tombol Hapus -->
                                        <form action="{{ route('admin.schedules.destroy-date', [$schedule->id, $date->id]) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus tanggal jadwal ini?');" class="inline-block">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="text-white bg-red-600 hover:bg-red-700 rounded-full p-1.5 inline-flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
                                    <div class="flex flex-col items-center justify-center py-8">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p>Tidak ada data tanggal</p>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-6">
                {{ $scheduleDates->links() }}
            </div>
        </div>
    </div>
</div>

<!-- Add Date Modal -->
<div class="fixed inset-0 overflow-y-auto hidden" id="addDateModal" aria-labelledby="addDateModalLabel" aria-hidden="true" tabindex="-1">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" data-bs-dismiss="modal"></div>
        <!-- Modal content -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 class="text-lg leading-6 font-medium text-gray-900" id="addDateModalLabel">
                            Tambah Tanggal Jadwal
                        </h3>
                        <div class="mt-4">
                            <form action="{{ route('admin.schedules.store-date', $schedule->id) }}" method="POST">
                                @csrf

                                <!-- Tipe Penambahan Tanggal -->
                                <div class="mb-4">
                                    <label for="date_type" class="block text-sm font-medium text-gray-700 mb-1">
                                        Tipe Penambahan <span class="text-red-500">*</span>
                                    </label>
                                    <select class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="date_type" name="date_type" required>
                                        <option value="single">Tanggal Tunggal</option>
                                        <option value="range">Rentang Tanggal</option>
                                    </select>
                                </div>

                                <!-- Informasi Hari Operasi -->
                                <div class="mb-4 p-3 bg-blue-50 rounded-md">
                                    <p class="text-sm text-blue-700">
                                        <span class="font-semibold">Hari Operasi:</span>
                                        @php
                                            $days = explode(',', $schedule->days);
                                            $dayNames = [
                                                1 => 'Senin',
                                                2 => 'Selasa',
                                                3 => 'Rabu',
                                                4 => 'Kamis',
                                                5 => 'Jumat',
                                                6 => 'Sabtu',
                                                7 => 'Minggu'
                                            ];
                                            $dayList = [];
                                            foreach($days as $day) {
                                                $dayList[] = $dayNames[$day] ?? '';
                                            }
                                            echo implode(', ', $dayList);
                                        @endphp
                                    </p>
                                    <p class="text-xs text-blue-600 mt-1">
                                        <i>Catatan: Jika menggunakan rentang tanggal, hanya tanggal yang sesuai dengan hari operasi yang akan dibuat.</i>
                                    </p>
                                </div>

                                <!-- Tanggal Awal -->
                                <div class="mb-4">
                                    <label for="date" class="block text-sm font-medium text-gray-700 mb-1">
                                        Tanggal <span class="text-red-500">*</span>
                                    </label>
                                    <input type="date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="date" name="date" required min="{{ date('Y-m-d') }}">
                                </div>

                                <!-- Tanggal Akhir (untuk rentang) -->
                                <div class="mb-4 hidden" id="endDateContainer">
                                    <label for="end_date" class="block text-sm font-medium text-gray-700 mb-1">
                                        Tanggal Akhir <span class="text-red-500">*</span>
                                    </label>
                                    <input type="date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="end_date" name="end_date" min="{{ date('Y-m-d') }}">
                                </div>

                                <!-- Status -->
                                <div class="mb-4">
                                    <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                                        Status <span class="text-red-500">*</span>
                                    </label>
                                    <select class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="status" name="status" required>
                                        <option value="AVAILABLE">Tersedia</option>
                                        <option value="UNAVAILABLE">Tidak Tersedia</option>
                                        <option value="CANCELLED">Dibatalkan</option>
                                        <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                                    </select>
                                </div>

                                <!-- Alasan Status -->
                                <div class="mb-4 hidden" id="addReasonContainer">
                                    <label for="status_reason" class="block text-sm font-medium text-gray-700 mb-1">
                                        Alasan Status
                                    </label>
                                    <input type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="status_reason" name="status_reason">
                                </div>

                                <!-- Tanggal Berakhir Status -->
                                <div class="mb-4 hidden" id="addExpiryDateContainer">
                                    <label for="status_expiry_date" class="block text-sm font-medium text-gray-700 mb-1">
                                        Tanggal Berakhir Status
                                    </label>
                                    <input type="datetime-local" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="status_expiry_date" name="status_expiry_date">
                                    <p class="mt-1 text-xs text-gray-500">Isi jika status akan berakhir pada waktu tertentu. Khusus untuk status Masalah Cuaca (WEATHER_ISSUE).</p>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                    Simpan
                                </button>
                                <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" data-bs-dismiss="modal">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Edit Date Modal -->
<div class="fixed inset-0 overflow-y-auto hidden" id="editDateModal" aria-labelledby="editDateModalLabel" aria-hidden="true" tabindex="-1">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" data-bs-dismiss="modal"></div>
        <!-- Modal content -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 class="text-lg leading-6 font-medium text-gray-900" id="editDateModalLabel">
                            Edit Tanggal Jadwal
                        </h3>
                        <div class="mt-4">
                            <form id="editDateForm" action="" method="POST">
                                @csrf
                                @method('PUT')
                                <p class="mb-4 text-gray-700 font-medium" id="editDateText"></p>
                                <div class="mb-4">
                                    <label for="edit_status" class="block text-sm font-medium text-gray-700 mb-1">
                                        Status <span class="text-red-500">*</span>
                                    </label>
                                    <select class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="edit_status" name="status" required>
                                        <option value="AVAILABLE">Tersedia</option>
                                        <option value="UNAVAILABLE">Tidak Tersedia</option>
                                        <option value="FULL">Penuh</option>
                                        <option value="CANCELLED">Dibatalkan</option>
                                        <option value="DEPARTED">Sudah Berangkat</option>
                                        <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                                    </select>
                                </div>
                                <div class="mb-4 hidden" id="editReasonContainer">
                                    <label for="edit_status_reason" class="block text-sm font-medium text-gray-700 mb-1">
                                        Alasan Status
                                    </label>
                                    <input type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="edit_status_reason" name="status_reason">
                                </div>
                                <div class="mb-4 hidden" id="editExpiryDateContainer">
                                    <label for="edit_status_expiry_date" class="block text-sm font-medium text-gray-700 mb-1">
                                        Tanggal Berakhir Status
                                    </label>
                                    <input type="datetime-local" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" id="edit_status_expiry_date" name="status_expiry_date">
                                    <p class="mt-1 text-xs text-gray-500">Isi jika status akan berakhir pada waktu tertentu. Khusus untuk status Masalah Cuaca (WEATHER_ISSUE).</p>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                    Simpan Perubahan
                                </button>
                                <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" data-bs-dismiss="modal">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Inisialisasi semua modal Bootstrap
        var modals = document.querySelectorAll('.modal');
        var modalInstances = {};

        // Fungsi untuk menginisialisasi modal secara manual
        function initializeModalFunctionality() {
            // Menangani modal "Tambah Tanggal"
            const addDateModal = document.getElementById('addDateModal');
            const addDateBtn = document.querySelector('[data-bs-target="#addDateModal"]');
            const addDateCloseBtns = addDateModal.querySelectorAll('[data-bs-dismiss="modal"]');

            // Fungsi untuk menampilkan modal
            function showModal(modal) {
                modal.classList.remove('hidden');
                document.body.classList.add('overflow-hidden');
                setTimeout(() => {
                    modal.querySelector('.inline-block').classList.add('transform-show');
                }, 10);
            }

            // Fungsi untuk menyembunyikan modal
            function hideModal(modal) {
                modal.querySelector('.inline-block').classList.remove('transform-show');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    document.body.classList.remove('overflow-hidden');
                }, 100);
            }

            // Event listener untuk tombol tambah tanggal
            if (addDateBtn && addDateModal) {
                addDateBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    showModal(addDateModal);
                });

                // Event listener untuk tombol close/cancel di modal tambah tanggal
                addDateCloseBtns.forEach(btn => {
                    btn.addEventListener('click', function() {
                        hideModal(addDateModal);
                    });
                });

                // Menutup modal jika klik di luar konten modal
                addDateModal.addEventListener('click', function(e) {
                    if (e.target === addDateModal) {
                        hideModal(addDateModal);
                    }
                });
            }

            // Menangani modal "Edit Tanggal"
            const editDateModal = document.getElementById('editDateModal');
            const editBtns = document.querySelectorAll('.editDateBtn');
            const editDateCloseBtns = editDateModal.querySelectorAll('[data-bs-dismiss="modal"]');

            // Event listener untuk tombol edit tanggal
            if (editBtns.length > 0 && editDateModal) {
                editBtns.forEach(button => {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        const id = this.dataset.id;
                        const date = this.dataset.date;
                        const status = this.dataset.status;
                        const reason = this.dataset.reason;
                        const expiry = this.dataset.expiry;

                        // Set data ke form edit
                        document.getElementById('editDateForm').action = `{{ url('admin/schedules') }}/${{{ $schedule->id }}}/dates/${id}`;
                        document.getElementById('editDateText').textContent = `Tanggal: ${date}`;
                        document.getElementById('edit_status').value = status;
                        document.getElementById('edit_status_reason').value = reason || '';
                        document.getElementById('edit_status_expiry_date').value = expiry || '';

                        // Update containers berdasarkan status terpilih
                        updateEditContainers();

                        // Tampilkan modal
                        showModal(editDateModal);
                    });
                });

                // Event listener untuk tombol close/cancel di modal edit tanggal
                editDateCloseBtns.forEach(btn => {
                    btn.addEventListener('click', function() {
                        hideModal(editDateModal);
                    });
                });

                // Menutup modal jika klik di luar konten modal
                editDateModal.addEventListener('click', function(e) {
                    if (e.target === editDateModal) {
                        hideModal(editDateModal);
                    }
                });
            }
        }

        // Panggil fungsi inisialisasi
        initializeModalFunctionality();

        // Menangani perubahan tipe penambahan tanggal (tunggal/rentang)
        const dateTypeSelect = document.getElementById('date_type');
        const endDateContainer = document.getElementById('endDateContainer');
        const endDateInput = document.getElementById('end_date');
        const startDateInput = document.getElementById('date');

        if (dateTypeSelect) {
            dateTypeSelect.addEventListener('change', function() {
                if (this.value === 'range') {
                    endDateContainer.classList.remove('hidden');
                    endDateInput.setAttribute('required', 'required');

                    // Set tanggal akhir minimal sama dengan tanggal awal
                    if (startDateInput.value) {
                        endDateInput.min = startDateInput.value;

                        // Jika tanggal akhir kosong atau kurang dari tanggal awal, set ke tanggal awal
                        if (!endDateInput.value || endDateInput.value < startDateInput.value) {
                            endDateInput.value = startDateInput.value;
                        }
                    }
                } else {
                    endDateContainer.classList.add('hidden');
                    endDateInput.removeAttribute('required');
                }
            });
        }

        // Update tanggal minimal pada tanggal akhir ketika tanggal awal berubah
        if (startDateInput) {
            startDateInput.addEventListener('change', function() {
                if (endDateInput) {
                    endDateInput.min = this.value;

                    // Jika tanggal akhir diisi dan kurang dari tanggal awal, update ke tanggal awal
                    if (endDateInput.value && endDateInput.value < this.value) {
                        endDateInput.value = this.value;
                    }
                }
            });
        }

        // Add Date Status Change
        const addStatus = document.getElementById('status');
        const addReasonContainer = document.getElementById('addReasonContainer');
        const addExpiryDateContainer = document.getElementById('addExpiryDateContainer');

        function updateAddContainers() {
            if (addStatus.value === 'AVAILABLE') {
                addReasonContainer.classList.add('hidden');
                addExpiryDateContainer.classList.add('hidden');
            } else {
                addReasonContainer.classList.remove('hidden');

                if (addStatus.value === 'WEATHER_ISSUE') {
                    addExpiryDateContainer.classList.remove('hidden');
                } else {
                    addExpiryDateContainer.classList.add('hidden');
                }
            }
        }

        if (addStatus) {
            // Initial check
            updateAddContainers();
            // Add event listener
            addStatus.addEventListener('change', updateAddContainers);
        }

        // Edit Date Status Change
        const editStatus = document.getElementById('edit_status');
        const editReasonContainer = document.getElementById('editReasonContainer');
        const editExpiryDateContainer = document.getElementById('editExpiryDateContainer');

        function updateEditContainers() {
            if (editStatus.value === 'AVAILABLE') {
                editReasonContainer.classList.add('hidden');
                editExpiryDateContainer.classList.add('hidden');
            } else {
                editReasonContainer.classList.remove('hidden');

                if (editStatus.value === 'WEATHER_ISSUE') {
                    editExpiryDateContainer.classList.remove('hidden');
                } else {
                    editExpiryDateContainer.classList.add('hidden');
                }
            }
        }

        if (editStatus) {
            // Add event listener
            editStatus.addEventListener('change', updateEditContainers);
        }
    });
</script>

<style>
    /* CSS untuk animasi modal */
    .modal .inline-block {
        transition: all 0.3s ease-out;
        transform: scale(0.9);
        opacity: 0;
    }

    .modal .transform-show {
        transform: scale(1);
        opacity: 1;
    }

    .modal.hidden {
        display: none;
    }
</style>
@endsection
