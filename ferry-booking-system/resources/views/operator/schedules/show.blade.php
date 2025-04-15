@extends('layouts.app')

@section('title', 'Detail Jadwal')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Detail Jadwal</h3>
                    <div class="card-tools">
                        <a href="{{ route('operator.schedules.index') }}" class="btn btn-sm btn-default">
                            <i class="fas fa-arrow-left"></i> Kembali
                        </a>
                        <a href="{{ route('operator.schedules.dates', $schedule->id) }}" class="btn btn-sm btn-primary">
                            <i class="fas fa-calendar"></i> Lihat Tanggal
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card card-primary">
                                <div class="card-header">
                                    <h3 class="card-title">Informasi Jadwal</h3>
                                </div>
                                <div class="card-body">
                                    <table class="table table-bordered">
                                        <tr>
                                            <th style="width: 30%">ID Jadwal</th>
                                            <td>{{ $schedule->id }}</td>
                                        </tr>
                                        <tr>
                                            <th>Status</th>
                                            <td>
                                                @if($schedule->status == 'ACTIVE')
                                                    <span class="badge badge-success">Aktif</span>
                                                @else
                                                    <span class="badge badge-danger">Tidak Aktif</span>
                                                @endif
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Waktu Keberangkatan</th>
                                            <td>{{ $schedule->departure_time }}</td>
                                        </tr>
                                        <tr>
                                            <th>Waktu Kedatangan</th>
                                            <td>{{ $schedule->arrival_time }}</td>
                                        </tr>
                                        <tr>
                                            <th>Hari Operasi</th>
                                            <td>
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
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Dibuat pada</th>
                                            <td>{{ $schedule->created_at->format('d M Y H:i') }}</td>
                                        </tr>
                                        <tr>
                                            <th>Diperbarui pada</th>
                                            <td>{{ $schedule->updated_at->format('d M Y H:i') }}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="row">
                                <div class="col-12">
                                    <div class="card card-success">
                                        <div class="card-header">
                                            <h3 class="card-title">Informasi Rute</h3>
                                        </div>
                                        <div class="card-body">
                                            <table class="table table-bordered">
                                                <tr>
                                                    <th style="width: 30%">ID Rute</th>
                                                    <td>{{ $schedule->route->id }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Asal</th>
                                                    <td>{{ $schedule->route->origin }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Tujuan</th>
                                                    <td>{{ $schedule->route->destination }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Jarak</th>
                                                    <td>{{ $schedule->route->distance }} km</td>
                                                </tr>
                                                <tr>
                                                    <th>Durasi</th>
                                                    <td>{{ $schedule->route->duration }} menit</td>
                                                </tr>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 mt-4">
                                    <div class="card card-info">
                                        <div class="card-header">
                                            <h3 class="card-title">Informasi Kapal</h3>
                                        </div>
                                        <div class="card-body">
                                            <table class="table table-bordered">
                                                <tr>
                                                    <th style="width: 30%">ID Kapal</th>
                                                    <td>{{ $schedule->ferry->id }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Nama Kapal</th>
                                                    <td>{{ $schedule->ferry->name }}</td>
                                                </tr>
                                                <tr>
                                                    <th>Kapasitas Penumpang</th>
                                                    <td>{{ $schedule->ferry->capacity_passenger }} orang</td>
                                                </tr>
                                                <tr>
                                                    <th>Kapasitas Kendaraan</th>
                                                    <td>
                                                        <ul class="list-unstyled mb-0">
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
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
