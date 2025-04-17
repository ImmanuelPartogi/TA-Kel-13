@extends('layouts.sidebar')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Edit Rute</h1>
        <a href="{{ route('admin.routes.index') }}" class="d-none d-sm-inline-block btn btn-secondary shadow-sm">
            <i class="fas fa-arrow-left fa-sm text-white-50"></i> Kembali
        </a>
    </div>

    @if($errors->any())
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <ul class="mb-0">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Form Edit Rute</h6>
        </div>
        <div class="card-body">
            <form action="{{ route('admin.routes.update', $route->id) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label for="route_code" class="form-label">Kode Rute <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="route_code" name="route_code" value="{{ old('route_code', $route->route_code) }}" required>
                        <small class="form-text text-muted">Contoh: JKT-SBY001, BDG-SMG002</small>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="origin" class="form-label">Asal <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="origin" name="origin" value="{{ old('origin', $route->origin) }}" required>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="destination" class="form-label">Tujuan <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="destination" name="destination" value="{{ old('destination', $route->destination) }}" required>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="distance" class="form-label">Jarak (km)</label>
                        <input type="number" class="form-control" id="distance" name="distance" value="{{ old('distance', $route->distance) }}" step="0.01" min="0">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="duration" class="form-label">Durasi (menit) <span class="text-danger">*</span></label>
                        <input type="number" class="form-control" id="duration" name="duration" value="{{ old('duration', $route->duration) }}" min="1" required>
                    </div>
                </div>

                <h5 class="mt-4 mb-3">Harga Tiket</h5>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label for="base_price" class="form-label">Harga Dasar Penumpang <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="number" class="form-control" id="base_price" name="base_price" value="{{ old('base_price', $route->base_price) }}" min="0" required>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="motorcycle_price" class="form-label">Harga Motor <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="number" class="form-control" id="motorcycle_price" name="motorcycle_price" value="{{ old('motorcycle_price', $route->motorcycle_price) }}" min="0" required>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label for="car_price" class="form-label">Harga Mobil <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="number" class="form-control" id="car_price" name="car_price" value="{{ old('car_price', $route->car_price) }}" min="0" required>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="bus_price" class="form-label">Harga Bus <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="number" class="form-control" id="bus_price" name="bus_price" value="{{ old('bus_price', $route->bus_price) }}" min="0" required>
                        </div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="truck_price" class="form-label">Harga Truk <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <span class="input-group-text">Rp</span>
                            <input type="number" class="form-control" id="truck_price" name="truck_price" value="{{ old('truck_price', $route->truck_price) }}" min="0" required>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="status" class="form-label">Status <span class="text-danger">*</span></label>
                        <select class="form-control" id="status" name="status" required>
                            <option value="ACTIVE" {{ old('status', $route->status) == 'ACTIVE' ? 'selected' : '' }}>Aktif</option>
                            <option value="INACTIVE" {{ old('status', $route->status) == 'INACTIVE' ? 'selected' : '' }}>Tidak Aktif</option>
                            <option value="WEATHER_ISSUE" {{ old('status', $route->status) == 'WEATHER_ISSUE' ? 'selected' : '' }}>Masalah Cuaca</option>
                        </select>
                    </div>
                    <div class="col-md-6 mb-3" id="reasonContainer" style="{{ old('status', $route->status) == 'ACTIVE' ? 'display: none;' : '' }}">
                        <label for="status_reason" class="form-label">Alasan Status</label>
                        <input type="text" class="form-control" id="status_reason" name="status_reason" value="{{ old('status_reason', $route->status_reason) }}">
                    </div>
                </div>

                <div class="mb-3" id="expiryDateContainer" style="{{ old('status', $route->status) == 'WEATHER_ISSUE' ? '' : 'display: none;' }}">
                    <label for="status_expiry_date" class="form-label">Tanggal Berakhir Status</label>
                    <input type="datetime-local" class="form-control" id="status_expiry_date" name="status_expiry_date" value="{{ old('status_expiry_date', $route->status_expiry_date ? $route->status_expiry_date->format('Y-m-d\TH:i') : '') }}">
                    <small class="form-text text-muted">Isi jika status akan berakhir pada waktu tertentu. Khusus untuk status Masalah Cuaca (WEATHER_ISSUE).</small>
                </div>

                <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const statusSelect = document.getElementById('status');
        const reasonContainer = document.getElementById('reasonContainer');
        const expiryDateContainer = document.getElementById('expiryDateContainer');

        function updateContainers() {
            if (statusSelect.value === 'ACTIVE') {
                reasonContainer.style.display = 'none';
                expiryDateContainer.style.display = 'none';
            } else {
                reasonContainer.style.display = 'block';

                if (statusSelect.value === 'WEATHER_ISSUE') {
                    expiryDateContainer.style.display = 'block';
                } else {
                    expiryDateContainer.style.display = 'none';
                }
            }
        }

        // Initial check
        updateContainers();

        // Add event listener
        statusSelect.addEventListener('change', updateContainers);
    });
</script>
@endsection
