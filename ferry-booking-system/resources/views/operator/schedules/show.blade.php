@extends('layouts.app')

@section('title', 'Detail Jadwal')

@section('content')
<div class="container mx-auto px-4 py-6">
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
            {{-- Header --}}
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800 mb-2">Detail Jadwal</h1>
                <p class="text-gray-600">Informasi lengkap tentang jadwal kapal ini</p>
            </div>

            {{-- Success/Error Message --}}
            @if(session('success'))
            <div class="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                <p class="font-semibold">Sukses!</p>
                <p>{{ session('success') }}</p>
            </div>
            @endif

            @if(session('error'))
            <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p class="font-semibold">Error!</p>
                <p>{{ session('error') }}</p>
            </div>
            @endif

            {{-- Navigation Buttons --}}
            <div class="flex justify-between mb-6">
                <a href="{{ route('operator.schedules.index') }}" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Kembali
                </a>
                <a href="{{ route('operator.schedules.dates', $schedule->id) }}" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                    </svg>
                    Lihat Tanggal
                </a>
            </div>

            {{-- Jadwal Details --}}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-white rounded-lg border border-gray-200 shadow-md">
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">Informasi Jadwal</h3>
                        <table class="table-auto w-full text-sm text-gray-600">
                            <tr>
                                <th class="text-left py-2 px-4">ID Jadwal</th>
                                <td class="py-2 px-4">{{ $schedule->id }}</td>
                            </tr>
                            <tr>
                                <th class="text-left py-2 px-4">Status</th>
                                <td class="py-2 px-4">
                                    @if($schedule->status == 'ACTIVE')
                                        <span class="text-green-600 font-semibold">Aktif</span>
                                    @else
                                        <span class="text-red-600 font-semibold">Tidak Aktif</span>
                                    @endif
                                </td>
                            </tr>
                            <tr>
                                <th class="text-left py-2 px-4">Keberangkatan</th>
                                <td class="py-2 px-4">{{ $schedule->departure_time->format('H:i') }}</td>
                            </tr>
                            <tr>
                                <th class="text-left py-2 px-4">Kedatangan</th>
                                <td class="py-2 px-4">{{ $schedule->arrival_time->format('H:i') }}</td>
                            </tr>
                            <tr>
                                <th class="text-left py-2 px-4">Hari Operasi</th>
                                <td class="py-2 px-4">
                                    @php
                                    $days = explode(',', $schedule->days);
                                    $dayNames = ['1' => 'Senin', '2' => 'Selasa', '3' => 'Rabu', '4' => 'Kamis', '5' => 'Jumat', '6' => 'Sabtu', '7' => 'Minggu'];
                                    $dayLabels = [];
                                    foreach ($days as $day) {
                                        $dayLabels[] = $dayNames[$day] ?? $day;
                                    }
                                    echo implode(', ', $dayLabels);
                                    @endphp
                                </td>
                            </tr>
                            <tr>
                                <th class="text-left py-2 px-4">Dibuat pada</th>
                                <td class="py-2 px-4">{{ $schedule->created_at->format('d M Y H:i') }}</td>
                            </tr>
                            <tr>
                                <th class="text-left py-2 px-4">Diperbarui pada</th>
                                <td class="py-2 px-4">{{ $schedule->updated_at->format('d M Y H:i') }}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <div class="bg-white rounded-lg border border-gray-200 shadow-md">
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">Informasi Rute</h3>
                        <table class="table-auto w-full text-sm text-gray-600">
                            <tr>
                                <th class="text-left py-2 px-4">ID Rute</th>
                                <td class="py-2 px-4">{{ $schedule->route->id }}</td>
                            </tr>
                            <tr>
                                <th class="text-left py-2 px-4">Asal</th>
                                <td class="py-2 px-4">{{ $schedule->route->origin }}</td>
                            </tr>
                            <tr>
                                <th class="text-left py-2 px-4">Tujuan</th>
                                <td class="py-2 px-4">{{ $schedule->route->destination }}</td>
                            </tr>
                            <tr>
                                <th class="text-left py-2 px-4">Jarak</th>
                                <td class="py-2 px-4">{{ $schedule->route->distance }} km</td>
                            </tr>
                            <tr>
                                <th class="text-left py-2 px-4">Durasi</th>
                                <td class="py-2 px-4">{{ $schedule->route->duration }} menit</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>

            {{-- Ferry Details --}}
            <div class="bg-white rounded-lg border border-gray-200 shadow-md">
                <div class="p-6">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">Informasi Kapal</h3>
                    <table class="table-auto w-full text-sm text-gray-600">
                        <tr>
                            <th class="text-left py-2 px-4">ID Kapal</th>
                            <td class="py-2 px-4">{{ $schedule->ferry->id }}</td>
                        </tr>
                        <tr>
                            <th class="text-left py-2 px-4">Nama Kapal</th>
                            <td class="py-2 px-4">{{ $schedule->ferry->name }}</td>
                        </tr>
                        <tr>
                            <th class="text-left py-2 px-4">Kapasitas Penumpang</th>
                            <td class="py-2 px-4">{{ $schedule->ferry->capacity_passenger }} orang</td>
                        </tr>
                        <tr>
                            <th class="text-left py-2 px-4">Kapasitas Kendaraan</th>
                            <td class="py-2 px-4">
                                <ul class="list-disc ml-6">
                                    <li>Motor: {{ $schedule->ferry->capacity_motorcycle }}</li>
                                    <li>Mobil: {{ $schedule->ferry->capacity_car }}</li>
                                    <li>Bus: {{ $schedule->ferry->capacity_bus }}</li>
                                    <li>Truk: {{ $schedule->ferry->capacity_truck }}</li>
                                </ul>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
