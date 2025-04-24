@extends('layouts.app')

@section('title', 'Tanggal Jadwal')

@section('content')
<div class="container mx-auto px-4 py-6">
    <div class="bg-white rounded-lg shadow-md overflow-hidden">

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
            <a href="{{ route('operator.schedules.show', $schedule->id) }}" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Kembali ke Detail Jadwal
            </a>
        </div>

        {{-- Schedule Info --}}
        <div class="p-6 mb-6">
            <h1 class="text-3xl font-bold text-gray-800 mb-4">Tanggal Jadwal</h1>
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
                        </table>
                    </div>
                </div>
            </div>

            {{-- Dates Table --}}
            <div class="bg-white rounded-lg border border-gray-200 shadow-md p-6 mb-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Tanggal Jadwal yang Tersedia</h3>
                <div class="table-responsive">
                    <table class="table table-bordered table-striped text-sm text-gray-600">
                        <thead>
                            <tr>
                                <th class="py-2 px-4">Tanggal</th>
                                <th class="py-2 px-4">Status</th>
                                <th class="py-2 px-4">Alasan Status</th>
                                <th class="py-2 px-4">Kapasitas Tersisa</th>
                                <th class="py-2 px-4">Penumpang</th>
                                <th class="py-2 px-4">Kendaraan</th>
                                <th class="py-2 px-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($dates as $date)
                            <tr>
                                <td class="py-2 px-4">{{ \Carbon\Carbon::parse($date->date)->format('d F Y') }}</td>
                                <td class="py-2 px-4">
                                    @if($date->status == 'AVAILABLE')
                                        <span class="badge badge-success">Tersedia</span>
                                    @elseif($date->status == 'UNAVAILABLE')
                                        <span class="badge badge-danger">Tidak Tersedia</span>
                                    @elseif($date->status == 'FULL')
                                        <span class="badge badge-warning">Penuh</span>
                                    @elseif($date->status == 'CANCELLED')
                                        <span class="badge badge-danger">Dibatalkan</span>
                                    @elseif($date->status == 'WEATHER_ISSUE')
                                        <span class="badge badge-info">Masalah Cuaca</span>
                                    @endif
                                </td>
                                <td class="py-2 px-4">{{ $date->status_reason ?? '-' }}</td>
                                <td class="py-2 px-4">
                                    @php
                                    $passengerPercentage = ($schedule->ferry->capacity_passenger > 0)
                                        ? 100 - ($date->passenger_count / $schedule->ferry->capacity_passenger * 100)
                                        : 0;
                                    @endphp
                                    <div class="progress mb-2">
                                        <div class="progress-bar bg-primary" role="progressbar" style="width: {{ $passengerPercentage }}%" aria-valuenow="{{ $passengerPercentage }}" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                    <small>{{ $schedule->ferry->capacity_passenger - $date->passenger_count }} dari {{ $schedule->ferry->capacity_passenger }} kursi tersedia</small>
                                </td>
                                <td class="py-2 px-4">{{ $date->passenger_count }}</td>
                                <td class="py-2 px-4">
                                    <ul class="list-unstyled mb-0">
                                        <li>Motor: {{ $date->motorcycle_count }}</li>
                                        <li>Mobil: {{ $date->car_count }}</li>
                                        <li>Bus: {{ $date->bus_count }}</li>
                                        <li>Truk: {{ $date->truck_count }}</li>
                                    </ul>
                                </td>
                                <td class="py-2 px-4">
                                    <button type="button" class="btn btn-sm btn-primary" data-toggle="modal" data-target="#updateStatusModal{{ $date->id }}">
                                        <i class="fas fa-edit"></i> Update Status
                                    </button>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="7" class="text-center py-4">Tidak ada data tanggal jadwal</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                {{-- Pagination --}}
                <div class="mt-4">
                    {{ $dates->links() }}
                </div>
            </div>

        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    $(function() {
        // Show/hide weather expiry date field based on selected status
        $('select[id^="status"]').on('change', function() {
            var id = $(this).attr('id').replace('status', '');
            if ($(this).val() === 'WEATHER_ISSUE') {
                $('.weather-expiry-group').show();
            } else {
                $('.weather-expiry-group').hide();
            }
        });
    });
</script>
@endsection
