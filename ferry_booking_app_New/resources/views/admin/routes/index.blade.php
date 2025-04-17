@extends('layouts.sidebar')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Manajemen Rute</h1>
        <a href="{{ route('admin.routes.create') }}" class="d-none d-sm-inline-block btn btn-primary shadow-sm">
            <i class="fas fa-plus fa-sm text-white-50"></i> Tambah Rute
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
            <h6 class="m-0 font-weight-bold text-primary">Filter Rute</h6>
        </div>
        <div class="card-body">
            <form action="{{ route('admin.routes.index') }}" method="GET">
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label for="origin">Asal</label>
                        <input type="text" class="form-control" id="origin" name="origin" value="{{ request('origin') }}">
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="destination">Tujuan</label>
                        <input type="text" class="form-control" id="destination" name="destination" value="{{ request('destination') }}">
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="status">Status</label>
                        <select class="form-control" id="status" name="status">
                            <option value="">Semua Status</option>
                            <option value="ACTIVE" {{ request('status') == 'ACTIVE' ? 'selected' : '' }}>Aktif</option>
                            <option value="INACTIVE" {{ request('status') == 'INACTIVE' ? 'selected' : '' }}>Tidak Aktif</option>
                            <option value="WEATHER_ISSUE" {{ request('status') == 'WEATHER_ISSUE' ? 'selected' : '' }}>Masalah Cuaca</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <button type="submit" class="btn btn-primary me-2">
                            <i class="fas fa-search fa-sm"></i> Cari
                        </button>
                        <a href="{{ route('admin.routes.index') }}" class="btn btn-secondary">
                            <i class="fas fa-sync-alt fa-sm"></i> Reset
                        </a>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Route List -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Daftar Rute</h6>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Kode Rute</th>
                            <th>Asal</th>
                            <th>Tujuan</th>
                            <th>Jarak</th>
                            <th>Durasi</th>
                            <th>Harga Dasar</th>
                            <th>Harga Kendaraan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($routes as $route)
                            <tr>
                                <td>{{ $route->route_code }}</td>
                                <td>{{ $route->origin }}</td>
                                <td>{{ $route->destination }}</td>
                                <td>{{ $route->distance ? $route->distance . ' km' : 'N/A' }}</td>
                                <td>{{ $route->duration }} menit</td>
                                <td>Rp {{ number_format($route->base_price, 0, ',', '.') }}</td>
                                <td>
                                    <small>
                                        Motor: Rp {{ number_format($route->motorcycle_price, 0, ',', '.') }}<br>
                                        Mobil: Rp {{ number_format($route->car_price, 0, ',', '.') }}<br>
                                        Bus: Rp {{ number_format($route->bus_price, 0, ',', '.') }}<br>
                                        Truk: Rp {{ number_format($route->truck_price, 0, ',', '.') }}
                                    </small>
                                </td>
                                <td>
                                    @if($route->status == 'ACTIVE')
                                        <span class="badge bg-success">Aktif</span>
                                    @elseif($route->status == 'INACTIVE')
                                        <span class="badge bg-danger">Tidak Aktif</span>
                                    @elseif($route->status == 'WEATHER_ISSUE')
                                        <span class="badge bg-warning text-dark">Masalah Cuaca</span>
                                        @if($route->status_expiry_date)
                                            <small class="d-block">
                                                Sampai: {{ \Carbon\Carbon::parse($route->status_expiry_date)->format('d M Y H:i') }}
                                            </small>
                                        @endif
                                    @endif
                                </td>
                                <td>
                                    <div class="d-flex">
                                        <a href="{{ route('admin.routes.edit', $route->id) }}" class="btn btn-primary btn-sm me-1" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <form action="{{ route('admin.routes.destroy', $route->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus rute ini?');">
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
                                <td colspan="9" class="text-center">Tidak ada data rute</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-3">
                {{ $routes->appends(request()->except('page'))->links() }}
            </div>
        </div>
    </div>
</div>
@endsection
