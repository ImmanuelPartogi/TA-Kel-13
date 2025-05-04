@extends('layouts.app')

@section('title', 'Check-in Penumpang')

@section('content')
<div class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Flash Messages -->
        @if(session('success'))
        <div class="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-sm">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-green-700">{{ session('success') }}</p>
                </div>
                <div class="ml-auto pl-3">
                    <div class="-mx-1.5 -my-1.5">
                        <button type="button" class="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none">
                            <span class="sr-only">Dismiss</span>
                            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        @endif

        @if($errors->any())
        <div class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Terdapat kesalahan:</h3>
                    <div class="mt-1">
                        <ul class="list-disc pl-5 space-y-1 text-sm text-red-700">
                            @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                </div>
                <div class="ml-auto pl-3">
                    <div class="-mx-1.5 -my-1.5">
                        <button type="button" class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none">
                            <span class="sr-only">Dismiss</span>
                            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        @endif

        <!-- Main Card -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="bg-blue-600 px-6 py-4">
                <h2 class="text-xl font-bold text-white flex items-center">
                    <svg class="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Check-in Penumpang
                </h2>
            </div>

            <!-- Search Form -->
            <div class="px-6 py-6 border-b border-gray-200">
                <form action="{{ route('operator.bookings.process-check-in') }}" method="POST" class="space-y-4">
                    @csrf
                    <div>
                        <label for="ticket_code" class="block text-sm font-medium text-gray-700">Kode Tiket / Kode Booking</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                            <input type="text" name="ticket_code" id="ticket_code"
                                class="focus:ring-blue-500 focus:border-blue-500 block w-full pr-32 sm:text-sm border-gray-300 rounded-md py-3"
                                placeholder="Masukkan kode tiket atau booking"
                                value="{{ old('ticket_code', request('ticket_code')) }}" required>
                            <div class="absolute inset-y-0 right-0 flex items-center">
                                <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-full">
                                    <svg class="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Cari
                                </button>
                            </div>
                        </div>
                        <div class="flex mt-2 space-x-2 text-sm text-gray-500">
                            <span class="inline-flex items-center">
                                <svg class="h-4 w-4 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Format: TKT-XXXXX (tiket) atau FBS-XXXXX (booking)</span>
                            </span>
                        </div>
                    </div>
                </form>
            </div>

            @if($ticket)
            <!-- Ticket Details -->
            <div class="px-6 py-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    Detail Tiket
                </h3>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Left Column -->
                    <div class="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                        <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                            <h4 class="text-sm font-medium text-gray-700">Informasi Tiket</h4>
                        </div>
                        <div class="divide-y divide-gray-200">
                            <div class="px-4 py-3 grid grid-cols-3">
                                <div class="col-span-1 text-sm font-medium text-gray-500">Kode Tiket</div>
                                <div class="col-span-2 text-sm text-gray-900 font-mono">{{ $ticket->ticket_code }}</div>
                            </div>
                            <div class="px-4 py-3 grid grid-cols-3">
                                <div class="col-span-1 text-sm font-medium text-gray-500">Kode Booking</div>
                                <div class="col-span-2 text-sm text-gray-900 font-mono">{{ $ticket->booking->booking_code }}</div>
                            </div>
                            <div class="px-4 py-3 grid grid-cols-3">
                                <div class="col-span-1 text-sm font-medium text-gray-500">Status Tiket</div>
                                <div class="col-span-2">
                                    @if($ticket->status == 'ACTIVE')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Aktif
                                    </span>
                                    @elseif($ticket->status == 'USED')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Digunakan
                                    </span>
                                    @elseif($ticket->status == 'CANCELLED')
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Dibatalkan
                                    </span>
                                    @endif
                                </div>
                            </div>
                            <div class="px-4 py-3 grid grid-cols-3">
                                <div class="col-span-1 text-sm font-medium text-gray-500">Check-in</div>
                                <div class="col-span-2">
                                    @if($ticket->checked_in)
                                    <span class="inline-flex items-center text-sm">
                                        <svg class="h-4 w-4 mr-1 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                        <span class="text-gray-900">Sudah Check-in ({{ $ticket->boarding_time->format('d/m/Y H:i') }})</span>
                                    </span>
                                    @else
                                    <span class="inline-flex items-center text-sm">
                                        <svg class="h-4 w-4 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                        </svg>
                                        <span class="text-gray-500">Belum Check-in</span>
                                    </span>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column -->
                    <div class="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                        <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                            <h4 class="text-sm font-medium text-gray-700">Informasi Penumpang</h4>
                        </div>
                        <div class="divide-y divide-gray-200">
                            <div class="px-4 py-3 grid grid-cols-3">
                                <div class="col-span-1 text-sm font-medium text-gray-500">Nama Penumpang</div>
                                <div class="col-span-2 text-sm text-gray-900">{{ $ticket->passenger_name }}</div>
                            </div>
                            <div class="px-4 py-3 grid grid-cols-3">
                                <div class="col-span-1 text-sm font-medium text-gray-500">No. ID</div>
                                <div class="col-span-2 text-sm text-gray-900">{{ $ticket->passenger_id_number }} ({{ $ticket->passenger_id_type }})</div>
                            </div>
                            <div class="px-4 py-3 grid grid-cols-3">
                                <div class="col-span-1 text-sm font-medium text-gray-500">Tanggal</div>
                                <div class="col-span-2 text-sm text-gray-900">{{ \Carbon\Carbon::parse($ticket->booking->departure_date)->format('d F Y') }}</div>
                            </div>
                            <div class="px-4 py-3 grid grid-cols-3">
                                <div class="col-span-1 text-sm font-medium text-gray-500">Rute</div>
                                <div class="col-span-2 text-sm text-gray-900">
                                    <div class="flex items-center">
                                        <span>{{ $ticket->booking->schedule->route->origin }}</span>
                                        <svg class="mx-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                        <span>{{ $ticket->booking->schedule->route->destination }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Vehicle Info (if exists) -->
                @if($ticket->vehicle)
                <div class="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 001-1v-3.05a2.5 2.5 0 010-4.9V4a1 1 0 00-1-1H3z" />
                            </svg>
                        </div>
                        <div class="ml-3 flex-1">
                            <h3 class="text-sm font-medium text-blue-800">Informasi Kendaraan</h3>
                            <div class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div class="flex items-center">
                                    <span class="text-xs font-medium text-blue-700 mr-2">Tipe:</span>
                                    <span class="text-xs text-blue-800">
                                        @if($ticket->vehicle->type == 'MOTORCYCLE')
                                            Motor
                                        @elseif($ticket->vehicle->type == 'CAR')
                                            Mobil
                                        @elseif($ticket->vehicle->type == 'BUS')
                                            Bus
                                        @elseif($ticket->vehicle->type == 'TRUCK')
                                            Truk
                                        @endif
                                    </span>
                                </div>
                                <div class="flex items-center">
                                    <span class="text-xs font-medium text-blue-700 mr-2">Nomor Plat:</span>
                                    <span class="text-xs text-blue-800 font-mono">{{ $ticket->vehicle->license_plate }}</span>
                                </div>
                                <div class="flex items-center">
                                    <span class="text-xs font-medium text-blue-700 mr-2">Pemilik:</span>
                                    <span class="text-xs text-blue-800">{{ $ticket->vehicle->owner_name }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                @endif

                <!-- Action Buttons -->
                <div class="mt-6 flex justify-center">
                    @if(!$ticket->checked_in && $ticket->status == 'ACTIVE' && $ticket->booking->status == 'CONFIRMED')
                    <form action="{{ route('operator.bookings.process-check-in') }}" method="POST">
                        @csrf
                        <input type="hidden" name="ticket_code" value="{{ $ticket->ticket_code }}">
                        <button type="submit" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            <svg class="mr-2 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Proses Check-in
                        </button>
                    </form>
                    @elseif($ticket->checked_in)
                    <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-green-800">Penumpang ini sudah melakukan check-in</h3>
                                <div class="mt-2 text-sm text-green-700">
                                    <p>Check-in pada: {{ $ticket->boarding_time->format('d/m/Y H:i') }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    @elseif($ticket->status == 'CANCELLED')
                    <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-red-800">Tiket telah dibatalkan</h3>
                                <div class="mt-2 text-sm text-red-700">
                                    <p>Tiket ini tidak dapat digunakan karena sudah dibatalkan.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    @elseif($ticket->booking->status != 'CONFIRMED')
                    <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-yellow-800">Booking belum dikonfirmasi</h3>
                                <div class="mt-2 text-sm text-yellow-700">
                                    <p>Status booking saat ini: {{ $ticket->booking->status }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    @endif
                </div>
            </div>
            @endif
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    $(function() {
        $('#ticket_code').focus();
    });
</script>
@endsection
