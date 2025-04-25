@extends('layouts.app')

@section('title', 'Detail Booking')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="space-y-4">
        @if(session('success'))
            <div class="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded relative">
                <span class="block sm:inline">{{ session('success') }}</span>
                <button type="button" class="absolute top-0 right-0 mt-2 mr-2" onclick="this.parentElement.remove()">
                    <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
        @endif

        @if($errors->any())
            <div class="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded relative">
                <div class="font-medium">Error!</div>
                <ul class="mt-1.5 list-disc list-inside text-sm">
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
                <button type="button" class="absolute top-0 right-0 mt-2 mr-2" onclick="this.parentElement.remove()">
                    <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
        @endif

        <div class="bg-white shadow-md rounded-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-800">Detail Booking</h3>
                <a href="{{ route('operator.bookings.index') }}" class="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Kembali
                </a>
            </div>
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <table class="w-full border border-gray-200 rounded-lg overflow-hidden">
                            <tr class="border-b border-gray-200">
                                <th class="px-4 py-2 bg-gray-50 text-left font-semibold text-gray-700 w-1/3">Kode Booking</th>
                                <td class="px-4 py-2">{{ $booking->booking_code }}</td>
                            </tr>
                            <tr class="border-b border-gray-200">
                                <th class="px-4 py-2 bg-gray-50 text-left font-semibold text-gray-700">Status</th>
                                <td class="px-4 py-2">
                                    @if($booking->status == 'PENDING')
                                        <span class="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>
                                    @elseif($booking->status == 'CONFIRMED')
                                        <span class="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Dikonfirmasi</span>
                                    @elseif($booking->status == 'COMPLETED')
                                        <span class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">Selesai</span>
                                    @elseif($booking->status == 'CANCELLED')
                                        <span class="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Dibatalkan</span>
                                    @endif
                                </td>
                            </tr>
                            <tr class="border-b border-gray-200">
                                <th class="px-4 py-2 bg-gray-50 text-left font-semibold text-gray-700">Tanggal Booking</th>
                                <td class="px-4 py-2">{{ \Carbon\Carbon::parse($booking->booking_date)->format('d F Y') }}</td>
                            </tr>
                            <tr class="border-b border-gray-200">
                                <th class="px-4 py-2 bg-gray-50 text-left font-semibold text-gray-700">Total Pembayaran</th>
                                <td class="px-4 py-2">Rp {{ number_format($booking->total_amount, 0, ',', '.') }}</td>
                            </tr>
                            <tr>
                                <th class="px-4 py-2 bg-gray-50 text-left font-semibold text-gray-700">Dibuat pada</th>
                                <td class="px-4 py-2">{{ $booking->created_at->format('d M Y H:i') }}</td>
                            </tr>
                        </table>
                    </div>
                    <div>
                        <table class="w-full border border-gray-200 rounded-lg overflow-hidden">
                            <tr class="border-b border-gray-200">
                                <th class="px-4 py-2 bg-gray-50 text-left font-semibold text-gray-700 w-1/3">Pengguna</th>
                                <td class="px-4 py-2">{{ $booking->user->name }}</td>
                            </tr>
                            <tr class="border-b border-gray-200">
                                <th class="px-4 py-2 bg-gray-50 text-left font-semibold text-gray-700">Email</th>
                                <td class="px-4 py-2">{{ $booking->user->email }}</td>
                            </tr>
                            <tr class="border-b border-gray-200">
                                <th class="px-4 py-2 bg-gray-50 text-left font-semibold text-gray-700">Telepon</th>
                                <td class="px-4 py-2">{{ $booking->user->phone ?? '-' }}</td>
                            </tr>
                            <tr class="border-b border-gray-200">
                                <th class="px-4 py-2 bg-gray-50 text-left font-semibold text-gray-700">Rute</th>
                                <td class="px-4 py-2">{{ $booking->schedule->route->origin }} - {{ $booking->schedule->route->destination }}</td>
                            </tr>
                            <tr>
                                <th class="px-4 py-2 bg-gray-50 text-left font-semibold text-gray-700">Jadwal</th>
                                <td class="px-4 py-2">{{ $booking->schedule->departure_time }} - {{ $booking->schedule->arrival_time }}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Update Status Form -->
                @if(in_array($booking->status, ['PENDING', 'CONFIRMED']))
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div class="bg-white shadow-md rounded-lg overflow-hidden border-t-4 border-blue-600">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-800">Update Status Booking</h3>
                        </div>
                        <form action="{{ route('operator.bookings.update-status', $booking->id) }}" method="POST">
                            @csrf
                            <div class="p-6 space-y-4">
                                <div>
                                    <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status Baru</label>
                                    <select name="status" id="status" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                        <option value="">Pilih Status</option>
                                        @if($booking->status == 'PENDING')
                                            <option value="CONFIRMED">Konfirmasi</option>
                                            <option value="CANCELLED">Batalkan</option>
                                        @elseif($booking->status == 'CONFIRMED')
                                            <option value="COMPLETED">Selesai</option>
                                            <option value="CANCELLED">Batalkan</option>
                                        @endif
                                    </select>
                                </div>
                                <div id="cancellationReasonGroup" class="hidden">
                                    <label for="cancellation_reason" class="block text-sm font-medium text-gray-700 mb-1">Alasan Pembatalan</label>
                                    <textarea name="cancellation_reason" id="cancellation_reason" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
                                </div>
                                <div>
                                    <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                                    <textarea name="notes" id="notes" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="2"></textarea>
                                </div>
                            </div>
                            <div class="px-6 py-4 border-t border-gray-200">
                                <button type="submit" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">Update Status</button>
                            </div>
                        </form>
                    </div>
                </div>
                @endif

                <!-- Passenger Details -->
                <div class="mt-6">
                    <div class="bg-white shadow-md rounded-lg overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-800">Data Penumpang ({{ $booking->tickets->count() }})</h3>
                        </div>
                        <div class="p-6">
                            <div class="overflow-x-auto">
                                <table class="w-full border-collapse">
                                    <thead class="bg-gray-50">
                                        <tr class="text-left text-sm font-semibold text-gray-700">
                                            <th class="px-4 py-2 border border-gray-200">No</th>
                                            <th class="px-4 py-2 border border-gray-200">Kode Tiket</th>
                                            <th class="px-4 py-2 border border-gray-200">Nama</th>
                                            <th class="px-4 py-2 border border-gray-200">No. ID</th>
                                            <th class="px-4 py-2 border border-gray-200">Tipe ID</th>
                                            <th class="px-4 py-2 border border-gray-200">Status</th>
                                            <th class="px-4 py-2 border border-gray-200">Check-in</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100 bg-white text-sm">
                                        @forelse($booking->tickets as $index => $ticket)
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-4 py-2 border border-gray-200">{{ $index + 1 }}</td>
                                            <td class="px-4 py-2 border border-gray-200">{{ $ticket->ticket_code }}</td>
                                            <td class="px-4 py-2 border border-gray-200">{{ $ticket->passenger_name }}</td>
                                            <td class="px-4 py-2 border border-gray-200">{{ $ticket->passenger_id_number }}</td>
                                            <td class="px-4 py-2 border border-gray-200">{{ $ticket->passenger_id_type }}</td>
                                            <td class="px-4 py-2 border border-gray-200">
                                                @if($ticket->status == 'ACTIVE')
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Aktif</span>
                                                @elseif($ticket->status == 'USED')
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">Digunakan</span>
                                                @elseif($ticket->status == 'CANCELLED')
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Dibatalkan</span>
                                                @endif
                                            </td>
                                            <td class="px-4 py-2 border border-gray-200">
                                                @if($ticket->checked_in)
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        <svg class="inline-block w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                                        Sudah Check-in
                                                        <br>{{ $ticket->boarding_time->format('d/m/Y H:i') }}
                                                    </span>
                                                @else
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">Belum Check-in</span>
                                                @endif
                                            </td>
                                        </tr>
                                        @empty
                                        <tr>
                                            <td colspan="7" class="text-center px-4 py-6 text-gray-500 border border-gray-200">Tidak ada data penumpang</td>
                                        </tr>
                                        @endforelse
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Vehicle Details -->
                @if($booking->vehicles->count() > 0)
                <div class="mt-6">
                    <div class="bg-white shadow-md rounded-lg overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-800">Data Kendaraan ({{ $booking->vehicles->count() }})</h3>
                        </div>
                        <div class="p-6">
                            <div class="overflow-x-auto">
                                <table class="w-full border-collapse">
                                    <thead class="bg-gray-50">
                                        <tr class="text-left text-sm font-semibold text-gray-700">
                                            <th class="px-4 py-2 border border-gray-200">No</th>
                                            <th class="px-4 py-2 border border-gray-200">Tipe Kendaraan</th>
                                            <th class="px-4 py-2 border border-gray-200">Nama Pemilik</th>
                                            <th class="px-4 py-2 border border-gray-200">Nomor Plat</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100 bg-white text-sm">
                                        @foreach($booking->vehicles as $index => $vehicle)
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-4 py-2 border border-gray-200">{{ $index + 1 }}</td>
                                            <td class="px-4 py-2 border border-gray-200">
                                                @if($vehicle->type == 'MOTORCYCLE')
                                                    Motor
                                                @elseif($vehicle->type == 'CAR')
                                                    Mobil
                                                @elseif($vehicle->type == 'BUS')
                                                    Bus
                                                @elseif($vehicle->type == 'TRUCK')
                                                    Truk
                                                @endif
                                            </td>
                                            <td class="px-4 py-2 border border-gray-200">{{ $vehicle->owner_name }}</td>
                                            <td class="px-4 py-2 border border-gray-200">{{ $vehicle->license_plate }}</td>
                                        </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                @endif

                <!-- Payment Details -->
                <div class="mt-6">
                    <div class="bg-white shadow-md rounded-lg overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-800">Data Pembayaran</h3>
                        </div>
                        <div class="p-6">
                            <div class="overflow-x-auto">
                                <table class="w-full border-collapse">
                                    <thead class="bg-gray-50">
                                        <tr class="text-left text-sm font-semibold text-gray-700">
                                            <th class="px-4 py-2 border border-gray-200">ID Pembayaran</th>
                                            <th class="px-4 py-2 border border-gray-200">Jumlah</th>
                                            <th class="px-4 py-2 border border-gray-200">Metode</th>
                                            <th class="px-4 py-2 border border-gray-200">Status</th>
                                            <th class="px-4 py-2 border border-gray-200">Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100 bg-white text-sm">
                                        @forelse($booking->payments as $payment)
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-4 py-2 border border-gray-200">{{ $payment->payment_code }}</td>
                                            <td class="px-4 py-2 border border-gray-200">Rp {{ number_format($payment->amount, 0, ',', '.') }}</td>
                                            <td class="px-4 py-2 border border-gray-200">{{ $payment->payment_method }}</td>
                                            <td class="px-4 py-2 border border-gray-200">
                                                @if($payment->status == 'PENDING')
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>
                                                @elseif($payment->status == 'SUCCESS')
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Sukses</span>
                                                @elseif($payment->status == 'FAILED')
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Gagal</span>
                                                @endif
                                            </td>
                                            <td class="px-4 py-2 border border-gray-200">
                                                @if($payment->payment_date)
                                                    {{ $payment->payment_date->format('d M Y H:i') }}
                                                @else
                                                    -
                                                @endif
                                            </td>
                                        </tr>
                                        @empty
                                        <tr>
                                            <td colspan="5" class="text-center px-4 py-6 text-gray-500 border border-gray-200">Tidak ada data pembayaran</td>
                                        </tr>
                                        @endforelse
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Booking Logs -->
                <div class="mt-6">
                    <div class="bg-white shadow-md rounded-lg overflow-hidden">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-800">Riwayat Booking</h3>
                        </div>
                        <div class="p-6">
                            <div class="overflow-x-auto">
                                <table class="w-full border-collapse">
                                    <thead class="bg-gray-50">
                                        <tr class="text-left text-sm font-semibold text-gray-700">
                                            <th class="px-4 py-2 border border-gray-200">Waktu</th>
                                            <th class="px-4 py-2 border border-gray-200">Status Sebelumnya</th>
                                            <th class="px-4 py-2 border border-gray-200">Status Baru</th>
                                            <th class="px-4 py-2 border border-gray-200">Diubah Oleh</th>
                                            <th class="px-4 py-2 border border-gray-200">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100 bg-white text-sm">
                                        @forelse($booking->bookingLogs as $log)
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-4 py-2 border border-gray-200">{{ $log->created_at->format('d M Y H:i') }}</td>
                                            <td class="px-4 py-2 border border-gray-200">
                                                @if($log->previous_status == 'PENDING')
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>
                                                @elseif($log->previous_status == 'CONFIRMED')
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Dikonfirmasi</span>
                                                @elseif($log->previous_status == 'COMPLETED')
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">Selesai</span>
                                                @elseif($log->previous_status == 'CANCELLED')
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Dibatalkan</span>
                                                @endif
                                            </td>
                                            <td class="px-4 py-2 border border-gray-200">
                                                @if($log->new_status == 'PENDING')
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>
                                                @elseif($log->new_status == 'CONFIRMED')
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Dikonfirmasi</span>
                                                @elseif($log->new_status == 'COMPLETED')
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">Selesai</span>
                                                @elseif($log->new_status == 'CANCELLED')
                                                    <span class="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Dibatalkan</span>
                                                @endif
                                            </td>
                                            <td class="px-4 py-2 border border-gray-200">
                                                @if($log->changed_by_type == 'USER')
                                                    Pengguna
                                                @elseif($log->changed_by_type == 'ADMIN')
                                                    Admin
                                                @elseif($log->changed_by_type == 'OPERATOR')
                                                    Operator
                                                @else
                                                    Sistem
                                                @endif
                                            </td>
                                            <td class="px-4 py-2 border border-gray-200">{{ $log->notes }}</td>
                                        </tr>
                                        @empty
                                        <tr>
                                            <td colspan="5" class="text-center px-4 py-6 text-gray-500 border border-gray-200">Tidak ada riwayat booking</td>
                                        </tr>
                                        @endforelse
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Show cancellation reason field when cancel is selected
        const statusSelect = document.getElementById('status');
        const cancellationReasonGroup = document.getElementById('cancellationReasonGroup');
        const cancellationReason = document.getElementById('cancellation_reason');

        if (statusSelect) {
            statusSelect.addEventListener('change', function() {
                if (this.value === 'CANCELLED') {
                    cancellationReasonGroup.classList.remove('hidden');
                    cancellationReason.setAttribute('required', 'required');
                } else {
                    cancellationReasonGroup.classList.add('hidden');
                    cancellationReason.removeAttribute('required');
                }
            });
        }
    });
</script>
@endsection
