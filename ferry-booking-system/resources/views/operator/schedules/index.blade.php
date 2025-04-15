@extends('layouts.app')

@section('title', 'Daftar Jadwal')

@section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Daftar Jadwal</h3>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-12">
                            <form action="{{ route('operator.schedules.index') }}" method="GET" class="form-inline">
                                <div class="row">
                                    <div class="col-md-5 mb-2">
                                        <select name="route_id" class="form-control w-100">
                                            <option value="">Semua Rute</option>
                                            @foreach(Auth::guard('operator')->user()->assignedRoutes ?? [] as $routeId => $routeName)
                                                <option value="{{ $routeId }}" {{ request('route_id') == $routeId ? 'selected' : '' }}>
                                                    {{ $routeName }}
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <div class="col-md-5 mb-2">
                                        <select name="status" class="form-control w-100">
                                            <option value="">Semua Status</option>
                                            <option value="ACTIVE" {{ request('status') == 'ACTIVE' ? 'selected' : '' }}>Aktif</option>
                                            <option value="INACTIVE" {{ request('status') == 'INACTIVE' ? 'selected' : '' }}>Tidak Aktif</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2 mb-2">
                                        <button type="submit" class="btn btn-primary w-100">Filter</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Rute</th>
                                    <th>Kapal</th>
                                    <th>Waktu Keberangkatan</th>
                                    <th>Waktu Kedatangan</th>
                                    <th>Hari Operasi</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($schedules as $schedule)
                                <tr>
                                    <td>{{ $schedule->id }}</td>
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
                                            $dayLabels = [];
                                            foreach ($days as $day) {
                                                $dayLabels[] = $dayNames[$day] ?? $day;
                                            }
                                            echo implode(', ', $dayLabels);
                                        @endphp
                                    </td>
                                    <td>
                                        @if($schedule->status == 'ACTIVE')
                                            <span class="badge badge-success">Aktif</span>
                                        @else
                                            <span class="badge badge-danger">Tidak Aktif</span>
                                        @endif
                                    </td>
                                    <td>
                                        <div class="btn-group">
                                            <a href="{{ route('operator.schedules.show', $schedule->id) }}" class="btn btn-sm btn-info">
                                                <i class="fas fa-eye"></i> Detail
                                            </a>
                                            <a href="{{ route('operator.schedules.dates', $schedule->id) }}" class="btn btn-sm btn-primary">
                                                <i class="fas fa-calendar"></i> Tanggal
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="8" class="text-center">Tidak ada data jadwal</td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <div class="mt-4">
                        {{ $schedules->appends(request()->query())->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
