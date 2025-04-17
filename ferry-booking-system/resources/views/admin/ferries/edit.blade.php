@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Edit Kapal</h1>
        <a href="{{ route('admin.ferries.index') }}" class="d-none d-sm-inline-block btn btn-secondary shadow-sm">
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
            <h6 class="m-0 font-weight-bold text-primary">Form Edit Kapal</h6>
        </div>
        <div class="card-body">
            <form action="{{ route('admin.ferries.update', $ferry->id) }}" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PUT')

                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="name" class="form-label">Nama Kapal <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="name" name="name" value="{{ old('name', $ferry->name) }}" required>
                        </div>
                        <div class="mb-3">
                            <label for="registration_number" class="form-label">Nomor Registrasi <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="registration_number" name="registration_number" value="{{ old('registration_number', $ferry->registration_number) }}" required>
                        </div>
                        <div class="mb-3">
                            <label for="year_built" class="form-label">Tahun Pembuatan</label>
                            <input type="number" class="form-control" id="year_built" name="year_built" value="{{ old('year_built', $ferry->year_built) }}" min="1900" max="{{ date('Y') }}">
                        </div>
                        <div class="mb-3">
                            <label for="last_maintenance_date" class="form-label">Tanggal Perawatan Terakhir</label>
                            <input type="date" class="form-control" id="last_maintenance_date" name="last_maintenance_date" value="{{ old('last_maintenance_date', $ferry->last_maintenance_date ? $ferry->last_maintenance_date->format('Y-m-d') : '') }}">
                        </div>
                        <div class="mb-3">
                            <label for="status" class="form-label">Status <span class="text-danger">*</span></label>
                            <select class="form-control" id="status" name="status" required>
                                <option value="ACTIVE" {{ old('status', $ferry->status) == 'ACTIVE' ? 'selected' : '' }}>Aktif</option>
                                <option value="MAINTENANCE" {{ old('status', $ferry->status) == 'MAINTENANCE' ? 'selected' : '' }}>Perawatan</option>
                                <option value="INACTIVE" {{ old('status', $ferry->status) == 'INACTIVE' ? 'selected' : '' }}>Tidak Aktif</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="capacity_passenger" class="form-label">Kapasitas Penumpang <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" id="capacity_passenger" name="capacity_passenger" value="{{ old('capacity_passenger', $ferry->capacity_passenger) }}" min="1" required>
                        </div>
                        <div class="mb-3">
                            <label for="capacity_vehicle_motorcycle" class="form-label">Kapasitas Motor <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" id="capacity_vehicle_motorcycle" name="capacity_vehicle_motorcycle" value="{{ old('capacity_vehicle_motorcycle', $ferry->capacity_vehicle_motorcycle) }}" min="0" required>
                        </div>
                        <div class="mb-3">
                            <label for="capacity_vehicle_car" class="form-label">Kapasitas Mobil <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" id="capacity_vehicle_car" name="capacity_vehicle_car" value="{{ old('capacity_vehicle_car', $ferry->capacity_vehicle_car) }}" min="0" required>
                        </div>
                        <div class="mb-3">
                            <label for="capacity_vehicle_bus" class="form-label">Kapasitas Bus <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" id="capacity_vehicle_bus" name="capacity_vehicle_bus" value="{{ old('capacity_vehicle_bus', $ferry->capacity_vehicle_bus) }}" min="0" required>
                        </div>
                        <div class="mb-3">
                            <label for="capacity_vehicle_truck" class="form-label">Kapasitas Truk <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" id="capacity_vehicle_truck" name="capacity_vehicle_truck" value="{{ old('capacity_vehicle_truck', $ferry->capacity_vehicle_truck) }}" min="0" required>
                        </div>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="image" class="form-label">Foto Kapal</label>
                    @if($ferry->image)
                        <div class="mb-2">
                            <img src="{{ asset('storage/' . $ferry->image) }}" alt="{{ $ferry->name }}" class="img-thumbnail" style="max-height: 200px;">
                        </div>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" name="remove_image" id="remove_image">
                            <label class="form-check-label" for="remove_image">
                                Hapus foto saat ini
                            </label>
                        </div>
                    @endif
                    <input type="file" class="form-control" id="image" name="image" accept="image/*">
                    <small class="form-text text-muted">Unggah foto baru kapal (opsional). Ukuran maksimum 2MB. Format: JPG, PNG.</small>
                </div>

                <div class="mb-3">
                    <label for="description" class="form-label">Deskripsi</label>
                    <textarea class="form-control" id="description" name="description" rows="4">{{ old('description', $ferry->description) }}</textarea>
                </div>

                <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
            </form>
        </div>
    </div>
</div>
@endsection
