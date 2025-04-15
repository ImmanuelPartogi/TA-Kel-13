@extends('layouts.app')

@section('title', 'Tanggal Jadwal')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            @if(session('success'))
                <div class="alert alert-success alert-dismissible">
                    <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
                    {{ session('success') }}
                </div>
            @endif

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Tanggal Jadwal</h3>
                    <div class="card-tools">
                        <a href="{{ route('operator.schedules.show', $schedule->id) }}" class="btn btn-sm btn-default">
                            <i class="fas fa-arrow-left"></i> Kembali ke Detail Jadwal
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="info-box">
                                <span class="info-box-icon bg-info"><i class="fas fa-ship"></i></span>
                                <div class="info-box-content">
                                    <span class="info-box-text">Jadwal</span>
                                    <span class="info-box-number">{{ $schedule->route->origin }} - {{ $schedule->route->destination }}</span>
                                    <span class="info-box-text">{{ $schedule->departure_time }} - {{ $schedule->arrival_time }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="info-box">
                                <span class="info-box-icon bg-success"><i class="fas fa-calendar-alt"></i></span>
                                <div class="info-box-content">
                                    <span class="info-box-text">Hari Operasi</span>
                                    <span class="info-box-number">
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
                                            $dayLabels = [];
                                            foreach ($days as $day) {
                                                $dayLabels[] = $dayNames[$day] ?? $day;
                                            }
                                            echo implode(', ', $dayLabels);
                                        @endphp
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Status</th>
                                    <th>Alasan Status</th>
                                    <th>Kapasitas Tersisa</th>
                                    <th>Penumpang</th>
                                    <th>Kendaraan</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($scheduleDates as $date)
                                <tr>
                                    <td>{{ \Carbon\Carbon::parse($date->date)->format('d F Y') }}</td>
                                    <td>
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
                                    <td>{{ $date->status_reason ?? '-' }}</td>
                                    <td>
                                        @php
                                            $passengerPercentage = ($schedule->ferry->capacity_passenger > 0)
                                                ? 100 - ($date->passenger_count / $schedule->ferry->capacity_passenger * 100)
                                                : 0;
                                            $motorcyclePercentage = ($schedule->ferry->capacity_motorcycle > 0)
                                                ? 100 - ($date->motorcycle_count / $schedule->ferry->capacity_motorcycle * 100)
                                                : 0;
                                            $carPercentage = ($schedule->ferry->capacity_car > 0)
                                                ? 100 - ($date->car_count / $schedule->ferry->capacity_car * 100)
                                                : 0;
                                            $busPercentage = ($schedule->ferry->capacity_bus > 0)
                                                ? 100 - ($date->bus_count / $schedule->ferry->capacity_bus * 100)
                                                : 0;
                                            $truckPercentage = ($schedule->ferry->capacity_truck > 0)
                                                ? 100 - ($date->truck_count / $schedule->ferry->capacity_truck * 100)
                                                : 0;
                                        @endphp
                                        <div class="progress mb-2">
                                            <div class="progress-bar bg-primary" role="progressbar" style="width: {{ $passengerPercentage }}%" aria-valuenow="{{ $passengerPercentage }}" aria-valuemin="0" aria-valuemax="100"></div>
                                        </div>
                                        <small>{{ $schedule->ferry->capacity_passenger - $date->passenger_count }} dari {{ $schedule->ferry->capacity_passenger }} kursi tersedia</small>
                                    </td>
                                    <td>{{ $date->passenger_count }}</td>
                                    <td>
                                        <ul class="list-unstyled mb-0">
                                            <li>Motor: {{ $date->motorcycle_count }}</li>
                                            <li>Mobil: {{ $date->car_count }}</li>
                                            <li>Bus: {{ $date->bus_count }}</li>
                                            <li>Truk: {{ $date->truck_count }}</li>
                                        </ul>
                                    </td>
                                    <td>
                                        <button type="button" class="btn btn-sm btn-primary" data-toggle="modal" data-target="#updateStatusModal{{ $date->id }}">
                                            <i class="fas fa-edit"></i> Update Status
                                        </button>
                                    </td>
                                </tr>

                                <!-- Update Status Modal -->
                                <div class="modal fade" id="updateStatusModal{{ $date->id }}" tabindex="-1" role="dialog" aria-labelledby="updateStatusModalLabel{{ $date->id }}" aria-hidden="true">
                                    <div class="modal-dialog" role="document">
                                        <div class="modal-content">
                                            <form action="{{ route('operator.schedules.update-date-status', ['id' => $schedule->id, 'dateId' => $date->id]) }}" method="POST">
                                                @csrf
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="updateStatusModalLabel{{ $date->id }}">Update Status Tanggal</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <div class="form-group">
                                                        <label for="status{{ $date->id }}">Status</label>
                                                        <select name="status" id="status{{ $date->id }}" class="form-control" required>
                                                            <option value="AVAILABLE" {{ $date->status == 'AVAILABLE' ? 'selected' : '' }}>Tersedia</option>
                                                            <option value="UNAVAILABLE" {{ $date->status == 'UNAVAILABLE' ? 'selected' : '' }}>Tidak Tersedia</option>
                                                            <option value="FULL" {{ $date->status == 'FULL' ? 'selected' : '' }}>Penuh</option>
                                                            <option value="CANCELLED" {{ $date->status == 'CANCELLED' ? 'selected' : '' }}>Dibatalkan</option>
                                                            <option value="WEATHER_ISSUE" {{ $date->status == 'WEATHER_ISSUE' ? 'selected' : '' }}>Masalah Cuaca</option>
                                                        </select>
                                                    </div>
                                                    <div class="form-group">
                                                        <label for="status_reason{{ $date->id }}">Alasan Status (opsional)</label>
                                                        <textarea name="status_reason" id="status_reason{{ $date->id }}" class="form-control" rows="3">{{ $date->status_reason }}</textarea>
                                                    </div>
                                                    <div class="form-group weather-expiry-group" style="{{ $date->status == 'WEATHER_ISSUE' ? '' : 'display: none' }}">
                                                        <label for="status_expiry_date{{ $date->id }}">Tanggal Berakhir Status Cuaca</label>
                                                        <input type="date" name="status_expiry_date" id="status_expiry_date{{ $date->id }}" class="form-control" value="{{ $date->status_expiry_date ? \Carbon\Carbon::parse($date->status_expiry_date)->format('Y-m-d') : '' }}">
                                                        <small class="form-text text-muted">Tanggal di mana status cuaca akan berakhir dan kembali ke status tersedia.</small>
                                                    </div>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Batal</button>
                                                    <button type="submit" class="btn btn-primary">Simpan</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                @empty
                                <tr>
                                    <td colspan="7" class="text-center">Tidak ada data tanggal jadwal</td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <div class="mt-4">
                        {{ $scheduleDates->links() }}
                    </div>
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
