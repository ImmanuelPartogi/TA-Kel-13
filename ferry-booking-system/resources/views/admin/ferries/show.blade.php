@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Detail Kapal</h1>
        <div>
            <a href="{{ route('admin.ferries.edit', $ferry->id) }}" class="btn btn-primary shadow-sm">
                <i class="fas fa-edit fa-sm text-white-50"></i> Edit
            </a>
            <a href="{{ route('admin.ferries.index') }}" class="btn btn-secondary shadow-sm">
                <i class="fas fa-arrow-left fa-sm text-white-50"></i> Kembali
            </a>
        </div>
    </div>

    <div class="row">
        <div class="col-md-4">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Foto Kapal</h6>
                </div>
                <div class="card-body text-center">
                    @if($ferry->image)
                        <img src="{{ asset('storage/' . $ferry->image) }}" alt="{{ $ferry->name }}" class="img-fluid rounded mb-3" style="max-height: 300px;">
                    @else
                        <div class="p-5">
                            <i class="fas fa-ship fa-5x text-gray-300 mb-3"></i>
                            <p class="text-muted">Tidak ada foto</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <div class="col-md-8">
            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Informasi Utama</h6>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Nama Kapal:</div>
                        <div class="col-md-8">{{ $ferry->name }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Nomor Registrasi:</div>
                        <div class="col-md-8">{{ $ferry->registration_number }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Status:</div>
                        <div class="col-md-8">
                            @if($ferry->status == 'ACTIVE')
                                <span class="badge bg-success">Aktif</span>
                            @elseif($ferry->status == 'MAINTENANCE')
                                <span class="badge bg-warning text-dark">Perawatan</span>
                            @elseif($ferry->status == 'INACTIVE')
                                <span class="badge bg-danger">Tidak Aktif</span>
                            @endif
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Tahun Pembuatan:</div>
                        <div class="col-md-8">{{ $ferry->year_built ?? 'N/A' }}</div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4 fw-bold">Tanggal Perawatan Terakhir:</div>
                        <div class="col-md-8">{{ $ferry->last_maintenance_date ? $ferry->last_maintenance_date->format('d M Y') : 'N/A' }}</div>
                    </div>
                </div>
            </div>

            <div class="card shadow mb-4">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Kapasitas</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="card border-left-primary shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                                Penumpang</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $ferry->capacity_passenger }} orang</div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-users fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6 mb-3">
                            <div class="card border-left-success shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                                Motor</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $ferry->capacity_vehicle_motorcycle }} unit</div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-motorcycle fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6 mb-3">
                            <div class="card border-left-info shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                                Mobil</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $ferry->capacity_vehicle_car }} unit</div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-car fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6 mb-3">
                            <div class="card border-left-warning shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                                Bus</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $ferry->capacity_vehicle_bus }} unit</div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-bus fa-2x text-gray-300"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6 mb-3">
                            <div class="card border-left-danger shadow h-100 py-2">
                                <div class="card-body">
                                    <div class="row no-gutters align-items-center">
                                        <div class="col mr-2">
                                            <div class="text-xs font-weight-bold text-danger text-uppercase mb-1">
                                                Truk</div>
                                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $ferry->capacity_vehicle_truck }} unit</div>
                                        </div>
                                        <div class="col-auto">
                                            <i class="fas fa-truck fa-2x text-gray-300"></i>
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

    @if($ferry->description)
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Deskripsi</h6>
        </div>
        <div class="card-body">
            {{ $ferry->description }}
        </div>
    </div>
    @endif

    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Jadwal Aktif</h6>
        </div>
        <div class="card-body">
            @if($ferry->schedules->isEmpty())
                <p class="text-center">Tidak ada jadwal aktif untuk kapal ini</p>
            @else
                <div class="table-responsive">
                    <table class="table table-bordered" width="100%" cellspacing="0">
                        <thead>
                            <tr>
                                <th>Rute</th>
                                <th>Waktu Keberangkatan</th>
                                <th>Waktu Kedatangan</th>
                                <th>Hari Operasi</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($ferry->schedules as $schedule)
                                <tr>
                                    <td>{{ $schedule->route->origin }} - {{ $schedule->route->destination }}</td>
                                    <td>{{ $schedule->departure_time }}</td>
                                    <td>{{ $schedule->arrival_time }}</td>
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
                                            $dayList = [];
                                            foreach($days as $day) {
                                                $dayList[] = $dayNames[$day] ?? '';
                                            }
                                            echo implode(', ', $dayList);
                                        @endphp
                                    </td>
                                    <td>
                                        <a href="{{ route('admin.schedules.show', $schedule->id) }}" class="btn btn-info btn-sm">
                                            <i class="fas fa-eye"></i> Detail
                                        </a>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
