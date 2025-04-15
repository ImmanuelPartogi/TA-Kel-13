@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Manajemen Kapal</h1>
        <a href="{{ route('admin.ferries.create') }}" class="d-none d-sm-inline-block btn btn-primary shadow-sm">
            <i class="fas fa-plus fa-sm text-white-50"></i> Tambah Kapal
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
            <h6 class="m-0 font-weight-bold text-primary">Filter Kapal</h6>
        </div>
        <div class="card-body">
            <form action="{{ route('admin.ferries.index') }}" method="GET">
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label for="name">Nama Kapal</label>
                        <input type="text" class="form-control" id="name" name="name" value="{{ request('name') }}">
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="registration_number">Nomor Registrasi</label>
                        <input type="text" class="form-control" id="registration_number" name="registration_number" value="{{ request('registration_number') }}">
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="status">Status</label>
                        <select class="form-control" id="status" name="status">
                            <option value="">Semua Status</option>
                            <option value="ACTIVE" {{ request('status') == 'ACTIVE' ? 'selected' : '' }}>Aktif</option>
                            <option value="MAINTENANCE" {{ request('status') == 'MAINTENANCE' ? 'selected' : '' }}>Perawatan</option>
                            <option value="INACTIVE" {{ request('status') == 'INACTIVE' ? 'selected' : '' }}>Tidak Aktif</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <button type="submit" class="btn btn-primary me-2">
                            <i class="fas fa-search fa-sm"></i> Cari
                        </button>
                        <a href="{{ route('admin.ferries.index') }}" class="btn btn-secondary">
                            <i class="fas fa-sync-alt fa-sm"></i> Reset
                        </a>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Ferry List -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Daftar Kapal</h6>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Foto</th>
                            <th>Nama</th>
                            <th>No. Registrasi</th>
                            <th>Kapasitas Penumpang</th>
                            <th>Kapasitas Kendaraan</th>
                            <th>Status</th>
                            <th>Tahun Pembuatan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($ferries as $ferry)
                            <tr>
                                <td class="text-center">
                                    @if($ferry->image)
                                        <img src="{{ asset('storage/' . $ferry->image) }}" alt="{{ $ferry->name }}" class="img-thumbnail" style="max-height: 50px;">
                                    @else
                                        <i class="fas fa-ship fa-2x text-gray-300"></i>
                                    @endif
                                </td>
                                <td>{{ $ferry->name }}</td>
                                <td>{{ $ferry->registration_number }}</td>
                                <td>{{ $ferry->capacity_passenger }} orang</td>
                                <td>
                                    <small>
                                        Motor: {{ $ferry->capacity_vehicle_motorcycle }},
                                        Mobil: {{ $ferry->capacity_vehicle_car }},
                                        Bus: {{ $ferry->capacity_vehicle_bus }},
                                        Truk: {{ $ferry->capacity_vehicle_truck }}
                                    </small>
                                </td>
                                <td>
                                    @if($ferry->status == 'ACTIVE')
                                        <span class="badge bg-success">Aktif</span>
                                    @elseif($ferry->status == 'MAINTENANCE')
                                        <span class="badge bg-warning text-dark">Perawatan</span>
                                    @elseif($ferry->status == 'INACTIVE')
                                        <span class="badge bg-danger">Tidak Aktif</span>
                                    @endif
                                </td>
                                <td>{{ $ferry->year_built ?? 'N/A' }}</td>
                                <td>
                                    <div class="d-flex">
                                        <a href="{{ route('admin.ferries.show', $ferry->id) }}" class="btn btn-info btn-sm me-1" title="Detail">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="{{ route('admin.ferries.edit', $ferry->id) }}" class="btn btn-primary btn-sm me-1" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <form action="{{ route('admin.ferries.destroy', $ferry->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus kapal ini?');">
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
                                <td colspan="8" class="text-center">Tidak ada data kapal</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-3">
                {{ $ferries->appends(request()->except('page'))->links() }}
            </div>
        </div>
    </div>
</div>
@endsection
