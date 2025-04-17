@extends('layouts.sidebar')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Tambah Jadwal Baru</h1>
        <a href="{{ route('admin.schedules.index') }}" class="d-none d-sm-inline-block btn btn-secondary shadow-sm">
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
            <h6 class="m-0 font-weight-bold text-primary">Form Jadwal</h6>
        </div>
        <div class="card-body">
            <form action="{{ route('admin.schedules.store') }}" method="POST">
                @csrf
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="route_id" class="form-label">Rute <span class="text-danger">*</span></label>
                        <select class="form-control" id="route_id" name="route_id" required>
                            <option value="">Pilih Rute</option>
                            @foreach($routes as $route)
                                <option value="{{ $route->id }}" {{ old('route_id') == $route->id ? 'selected' : '' }}>
                                    {{ $route->origin }} - {{ $route->destination }} ({{ $route->route_code }})
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="ferry_id" class="form-label">Kapal <span class="text-danger">*</span></label>
                        <select class="form-control" id="ferry_id" name="ferry_id" required>
                            <option value="">Pilih Kapal</option>
                            @foreach($ferries as $ferry)
                                <option value="{{ $ferry->id }}" {{ old('ferry_id') == $ferry->id ? 'selected' : '' }}>
                                    {{ $ferry->name }} ({{ $ferry->registration_number }})
                                </option>
                            @endforeach
                        </select>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="departure_time" class="form-label">Waktu Keberangkatan <span class="text-danger">*</span></label>
                        <input type="time" class="form-control" id="departure_time" name="departure_time" value="{{ old('departure_time') }}" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="arrival_time" class="form-label">Waktu Kedatangan <span class="text-danger">*</span></label>
                        <input type="time" class="form-control" id="arrival_time" name="arrival_time" value="{{ old('arrival_time') }}" required>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Hari Operasi <span class="text-danger">*</span></label>
                    <div class="d-flex flex-wrap">
                        <div class="form-check me-4 mb-2">
                            <input class="form-check-input" type="checkbox" name="days[]" value="1" id="day-1" {{ is_array(old('days')) && in_array('1', old('days')) ? 'checked' : '' }}>
                            <label class="form-check-label" for="day-1">Senin</label>
                        </div>
                        <div class="form-check me-4 mb-2">
                            <input class="form-check-input" type="checkbox" name="days[]" value="2" id="day-2" {{ is_array(old('days')) && in_array('2', old('days')) ? 'checked' : '' }}>
                            <label class="form-check-label" for="day-2">Selasa</label>
                        </div>
                        <div class="form-check me-4 mb-2">
                            <input class="form-check-input" type="checkbox" name="days[]" value="3" id="day-3" {{ is_array(old('days')) && in_array('3', old('days')) ? 'checked' : '' }}>
                            <label class="form-check-label" for="day-3">Rabu</label>
                        </div>
                        <div class="form-check me-4 mb-2">
                            <input class="form-check-input" type="checkbox" name="days[]" value="4" id="day-4" {{ is_array(old('days')) && in_array('4', old('days')) ? 'checked' : '' }}>
                            <label class="form-check-label" for="day-4">Kamis</label>
                        </div>
                        <div class="form-check me-4 mb-2">
                            <input class="form-check-input" type="checkbox" name="days[]" value="5" id="day-5" {{ is_array(old('days')) && in_array('5', old('days')) ? 'checked' : '' }}>
                            <label class="form-check-label" for="day-5">Jumat</label>
                        </div>
                        <div class="form-check me-4 mb-2">
                            <input class="form-check-input" type="checkbox" name="days[]" value="6" id="day-6" {{ is_array(old('days')) && in_array('6', old('days')) ? 'checked' : '' }}>
                            <label class="form-check-label" for="day-6">Sabtu</label>
                        </div>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" name="days[]" value="7" id="day-7" {{ is_array(old('days')) && in_array('7', old('days')) ? 'checked' : '' }}>
                            <label class="form-check-label" for="day-7">Minggu</label>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="status" class="form-label">Status <span class="text-danger">*</span></label>
                        <select class="form-control" id="status" name="status" required>
                            <option value="ACTIVE" {{ old('status') == 'ACTIVE' ? 'selected' : '' }}>Aktif</option>
                            <option value="CANCELLED" {{ old('status') == 'CANCELLED' ? 'selected' : '' }}>Dibatalkan</option>
                            <option value="DELAYED" {{ old('status') == 'DELAYED' ? 'selected' : '' }}>Ditunda</option>
                            <option value="FULL" {{ old('status') == 'FULL' ? 'selected' : '' }}>Penuh</option>
                        </select>
                    </div>
                    <div class="col-md-6 mb-3" id="reasonContainer" style="display: none;">
                        <label for="status_reason" class="form-label">Alasan Status</label>
                        <input type="text" class="form-control" id="status_reason" name="status_reason" value="{{ old('status_reason') }}">
                    </div>
                </div>

                <div class="mb-3" id="expiryDateContainer" style="display: none;">
                    <label for="status_expiry_date" class="form-label">Tanggal Berakhir Status</label>
                    <input type="datetime-local" class="form-control" id="status_expiry_date" name="status_expiry_date" value="{{ old('status_expiry_date') }}">
                    <small class="form-text text-muted">Isi jika status akan berakhir pada waktu tertentu. Khusus untuk status Ditunda (DELAYED).</small>
                </div>

                <button type="submit" class="btn btn-primary">Simpan Jadwal</button>
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

                if (statusSelect.value === 'DELAYED') {
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
