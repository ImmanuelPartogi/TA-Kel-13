@extends('layouts.sidebar')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Manajemen Jadwal</h1>
        <a href="{{ route('admin.schedules.create') }}" class="d-none d-sm-inline-block btn btn-primary shadow-sm">
            <i class="fas fa-plus fa-sm text-white-50"></i> Tambah Jadwal
        </a>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            {{ session('error') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <!-- Search Form -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Filter Jadwal</h6>
        </div>
        <div class="card-body">
            <form action="{{ route('admin.schedules.index') }}" method="GET">
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label for="route_id">Rute</label>
                        <select class="form-control" id="route_id" name="route_id">
                            <option value="">Semua Rute</option>
                            @foreach($routes as $route)
                                <option value="{{ $route->id }}" {{ request('route_id') == $route->id ? 'selected' : '' }}>
                                    {{ $route->origin }} - {{ $route->destination }} ({{ $route->route_code }})
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="ferry_id">Kapal</label>
                        <select class="form-control" id="ferry_id" name="ferry_id">
                            <option value="">Semua Kapal</option>
                            @foreach($ferries as $ferry)
                                <option value="{{ $ferry->id }}" {{ request('ferry_id') == $ferry->id ? 'selected' : '' }}>
                                    {{ $ferry->name }} ({{ $ferry->registration_number }})
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="status">Status</label>
                        <select class="form-control" id="status" name="status">
                            <option value="">Semua Status</option>
                            <option value="ACTIVE" {{ request('status') == 'ACTIVE' ? 'selected' : '' }}>Aktif</option>
                            <option value="CANCELLED" {{ request('status') == 'CANCELLED' ? 'selected' : '' }}>Dibatalkan</option>
                            <option value="DELAYED" {{ request('status') == 'DELAYED' ? 'selected' : '' }}>Ditunda</option>
                            <option value="FULL" {{ request('status') == 'FULL' ? 'selected' : '' }}>Penuh</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <button type="submit" class="btn btn-primary me-2">
                            <i class="fas fa-search fa-sm"></i> Cari
                        </button>
                        <a href="{{ route('admin.schedules.index') }}" class="btn btn-secondary">
                            <i class="fas fa-sync-alt fa-sm"></i> Reset
                        </a>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Schedule List -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Daftar Jadwal</h6>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Rute</th>
                            <th>Kapal</th>
                            <th>Keberangkatan</th>
                            <th>Kedatangan</th>
                            <th>Hari Operasi</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($schedules as $schedule)
                            <tr>
                                <td>{{ $schedule->route->origin }} - {{ $schedule->route->destination }}</td>
                                <td>{{ $schedule->ferry->name }}</td>
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
                                    @if($schedule->status == 'ACTIVE')
                                        <span class="badge bg-success">Aktif</span>
                                    @elseif($schedule->status == 'CANCELLED')
                                        <span class="badge bg-danger">Dibatalkan</span>
                                    @elseif($schedule->status == 'DELAYED')
                                        <span class="badge bg-warning text-dark">Ditunda</span>
                                    @elseif($schedule->status == 'FULL')
                                        <span class="badge bg-info">Penuh</span>
                                    @endif
                                </td>
                                <td>
                                    <div class="d-flex">
                                        <a href="{{ route('admin.schedules.dates', $schedule->id) }}" class="btn btn-info btn-sm me-1" title="Kelola Tanggal">
                                            <i class="fas fa-calendar-alt"></i>
                                        </a>
                                        <a href="{{ route('admin.schedules.edit', $schedule->id) }}" class="btn btn-primary btn-sm me-1" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <form action="{{ route('admin.schedules.destroy', $schedule->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus jadwal ini?');">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger btn-sm" title="Hapus">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center">Tidak ada data jadwal</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-3">
                {{ $schedules->appends(request()->except('page'))->links() }}
            </div>
        </div>
    </div>
</div>
@endsection
