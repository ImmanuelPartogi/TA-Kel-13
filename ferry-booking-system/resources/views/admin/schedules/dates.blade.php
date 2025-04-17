@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Kelola Tanggal Jadwal</h1>
        <a href="{{ route('admin.schedules.index') }}" class="d-none d-sm-inline-block btn btn-secondary shadow-sm">
            <i class="fas fa-arrow-left fa-sm text-white-50"></i> Kembali
        </a>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Informasi Jadwal</h6>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <dl class="row">
                        <dt class="col-sm-4">Rute:</dt>
                        <dd class="col-sm-8">{{ $schedule->route->origin }} - {{ $schedule->route->destination }}</dd>

                        <dt class="col-sm-4">Kapal:</dt>
                        <dd class="col-sm-8">{{ $schedule->ferry->name }}</dd>

                        <dt class="col-sm-4">Waktu:</dt>
                        <dd class="col-sm-8">{{ $schedule->departure_time }} - {{ $schedule->arrival_time }}</dd>
                    </dl>
                </div>
                <div class="col-md-6">
                    <dl class="row">
                        <dt class="col-sm-4">Hari Operasi:</dt>
                        <dd class="col-sm-8">
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
                        </dd>

                        <dt class="col-sm-4">Status:</dt>
                        <dd class="col-sm-8">
                            @if($schedule->status == 'ACTIVE')
                                <span class="badge bg-success">Aktif</span>
                            @elseif($schedule->status == 'CANCELLED')
                                <span class="badge bg-danger">Dibatalkan</span>
                            @elseif($schedule->status == 'DELAYED')
                                <span class="badge bg-warning text-dark">Ditunda</span>
                            @elseif($schedule->status == 'FULL')
                                <span class="badge bg-info">Penuh</span>
                            @endif
                        </dd>

                        <dt class="col-sm-4">Kapasitas:</dt>
                        <dd class="col-sm-8">
                            Penumpang: {{ $schedule->ferry->capacity_passenger }},
                            Motor: {{ $schedule->ferry->capacity_vehicle_motorcycle }},
                            Mobil: {{ $schedule->ferry->capacity_vehicle_car }},
                            Bus: {{ $schedule->ferry->capacity_vehicle_bus }},
                            Truk: {{ $schedule->ferry->capacity_vehicle_truck }}
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    </div>

    <div class="card shadow mb-4">
        <div class="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 class="m-0 font-weight-bold text-primary">Tanggal Jadwal</h6>
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addDateModal">
                <i class="fas fa-plus fa-sm"></i> Tambah Tanggal
            </button>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" width="100%" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Penumpang</th>
                            <th>Kendaraan</th>
                            <th>Status</th>
                            <th>Alasan</th>
                            <th>Terakhir Diperbarui</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($scheduleDates as $date)
                            <tr>
                                <td>{{ \Carbon\Carbon::parse($date->date)->format('d M Y') }}</td>
                                <td>{{ $date->passenger_count }} / {{ $schedule->ferry->capacity_passenger }}</td>
                                <td>
                                    <small>
                                        Motor: {{ $date->motorcycle_count }} / {{ $schedule->ferry->capacity_vehicle_motorcycle }}<br>
                                        Mobil: {{ $date->car_count }} / {{ $schedule->ferry->capacity_vehicle_car }}<br>
                                        Bus: {{ $date->bus_count }} / {{ $schedule->ferry->capacity_vehicle_bus }}<br>
                                        Truk: {{ $date->truck_count }} / {{ $schedule->ferry->capacity_vehicle_truck }}
                                    </small>
                                </td>
                                <td>
                                    @if($date->status == 'AVAILABLE')
                                        <span class="badge bg-success">Tersedia</span>
                                    @elseif($date->status == 'UNAVAILABLE')
                                        <span class="badge bg-secondary">Tidak Tersedia</span>
                                    @elseif($date->status == 'FULL')
                                        <span class="badge bg-info">Penuh</span>
                                    @elseif($date->status == 'CANCELLED')
                                        <span class="badge bg-danger">Dibatalkan</span>
                                    @elseif($date->status == 'DEPARTED')
                                        <span class="badge bg-primary">Sudah Berangkat</span>
                                    @elseif($date->status == 'WEATHER_ISSUE')
                                        <span class="badge bg-warning text-dark">Masalah Cuaca</span>
                                        @if($date->status_expiry_date)
                                            <small class="d-block">
                                                Sampai: {{ \Carbon\Carbon::parse($date->status_expiry_date)->format('d M Y H:i') }}
                                            </small>
                                        @endif
                                    @endif

                                    @if($date->modified_by_schedule)
                                        <span class="badge bg-dark">Diubah Oleh Jadwal</span>
                                    @endif
                                </td>
                                <td>{{ $date->status_reason ?? '-' }}</td>
                                <td>{{ $date->updated_at->format('d M Y H:i') }}</td>
                                <td>
                                    <button type="button" class="btn btn-primary btn-sm editDateBtn" data-bs-toggle="modal" data-bs-target="#editDateModal"
                                            data-id="{{ $date->id }}"
                                            data-date="{{ \Carbon\Carbon::parse($date->date)->format('d M Y') }}"
                                            data-status="{{ $date->status }}"
                                            data-reason="{{ $date->status_reason }}"
                                            data-expiry="{{ $date->status_expiry_date ? \Carbon\Carbon::parse($date->status_expiry_date)->format('Y-m-d\TH:i') : '' }}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center">Tidak ada data tanggal</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="mt-3">
                {{ $scheduleDates->links() }}
            </div>
        </div>
    </div>
</div>

<!-- Add Date Modal -->
<div class="modal fade" id="addDateModal" tabindex="-1" aria-labelledby="addDateModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addDateModalLabel">Tambah Tanggal Jadwal</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="{{ route('admin.schedules.store-date', $schedule->id) }}" method="POST">
                @csrf
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="date" class="form-label">Tanggal <span class="text-danger">*</span></label>
                        <input type="date" class="form-control" id="date" name="date" required min="{{ date('Y-m-d') }}">
                    </div>
                    <div class="mb-3">
                        <label for="status" class="form-label">Status <span class="text-danger">*</span></label>
                        <select class="form-control" id="status" name="status" required>
                            <option value="AVAILABLE">Tersedia</option>
                            <option value="UNAVAILABLE">Tidak Tersedia</option>
                            <option value="CANCELLED">Dibatalkan</option>
                            <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                        </select>
                    </div>
                    <div class="mb-3" id="addReasonContainer" style="display: none;">
                        <label for="status_reason" class="form-label">Alasan Status</label>
                        <input type="text" class="form-control" id="status_reason" name="status_reason">
                    </div>
                    <div class="mb-3" id="addExpiryDateContainer" style="display: none;">
                        <label for="status_expiry_date" class="form-label">Tanggal Berakhir Status</label>
                        <input type="datetime-local" class="form-control" id="status_expiry_date" name="status_expiry_date">
                        <small class="form-text text-muted">Isi jika status akan berakhir pada waktu tertentu. Khusus untuk status Masalah Cuaca (WEATHER_ISSUE).</small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">Simpan</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Edit Date Modal -->
<div class="modal fade" id="editDateModal" tabindex="-1" aria-labelledby="editDateModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="editDateModalLabel">Edit Tanggal Jadwal</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form id="editDateForm" action="" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-body">
                    <p class="mb-3" id="editDateText"></p>
                    <div class="mb-3">
                        <label for="edit_status" class="form-label">Status <span class="text-danger">*</span></label>
                        <select class="form-control" id="edit_status" name="status" required>
                            <option value="AVAILABLE">Tersedia</option>
                            <option value="UNAVAILABLE">Tidak Tersedia</option>
                            <option value="FULL">Penuh</option>
                            <option value="CANCELLED">Dibatalkan</option>
                            <option value="DEPARTED">Sudah Berangkat</option>
                            <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                        </select>
                    </div>
                    <div class="mb-3" id="editReasonContainer" style="display: none;">
                        <label for="edit_status_reason" class="form-label">Alasan Status</label>
                        <input type="text" class="form-control" id="edit_status_reason" name="status_reason">
                    </div>
                    <div class="mb-3" id="editExpiryDateContainer" style="display: none;">
                        <label for="edit_status_expiry_date" class="form-label">Tanggal Berakhir Status</label>
                        <input type="datetime-local" class="form-control" id="edit_status_expiry_date" name="status_expiry_date">
                        <small class="form-text text-muted">Isi jika status akan berakhir pada waktu tertentu. Khusus untuk status Masalah Cuaca (WEATHER_ISSUE).</small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Add Date Status Change
        const addStatus = document.getElementById('status');
        const addReasonContainer = document.getElementById('addReasonContainer');
        const addExpiryDateContainer = document.getElementById('addExpiryDateContainer');

        function updateAddContainers() {
            if (addStatus.value === 'AVAILABLE') {
                addReasonContainer.style.display = 'none';
                addExpiryDateContainer.style.display = 'none';
            } else {
                addReasonContainer.style.display = 'block';

                if (addStatus.value === 'WEATHER_ISSUE') {
                    addExpiryDateContainer.style.display = 'block';
                } else {
                    addExpiryDateContainer.style.display = 'none';
                }
            }
        }

        if (addStatus) {
            // Initial check
            updateAddContainers();
            // Add event listener
            addStatus.addEventListener('change', updateAddContainers);
        }

        // Edit Date Status Change
        const editStatus = document.getElementById('edit_status');
        const editReasonContainer = document.getElementById('editReasonContainer');
        const editExpiryDateContainer = document.getElementById('editExpiryDateContainer');

        function updateEditContainers() {
            if (editStatus.value === 'AVAILABLE') {
                editReasonContainer.style.display = 'none';
                editExpiryDateContainer.style.display = 'none';
            } else {
                editReasonContainer.style.display = 'block';

                if (editStatus.value === 'WEATHER_ISSUE') {
                    editExpiryDateContainer.style.display = 'block';
                } else {
                    editExpiryDateContainer.style.display = 'none';
                }
            }
        }

        if (editStatus) {
            // Add event listener
            editStatus.addEventListener('change', updateEditContainers);
        }

        // Edit Date Modal
        const editButtons = document.querySelectorAll('.editDateBtn');
        const editDateForm = document.getElementById('editDateForm');
        const editDateText = document.getElementById('editDateText');
        const editStatusReason = document.getElementById('edit_status_reason');
        const editStatusExpiryDate = document.getElementById('edit_status_expiry_date');

        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                const date = this.dataset.date;
                const status = this.dataset.status;
                const reason = this.dataset.reason;
                const expiry = this.dataset.expiry;

                editDateForm.action = `{{ url('admin/schedules') }}/${{{ $schedule->id }}}/dates/${id}`;
                editDateText.textContent = `Tanggal: ${date}`;
                editStatus.value = status;
                editStatusReason.value = reason || '';
                editStatusExpiryDate.value = expiry || '';

                // Update containers based on selected status
                updateEditContainers();
            });
        });
    });
</script>
@endsection
