// src/pages/operator/bookings/CheckIn.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { checkIn } from '../../../services/api';
import Alert from '../../../components/ui/Alert';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

const CheckIn = () => {
    const [ticketCode, setTicketCode] = useState('');
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const location = useLocation();

    // Get ticket_code from URL if exists
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const codeFromUrl = params.get('ticket_code');
        if (codeFromUrl) {
            setTicketCode(codeFromUrl);
            handleSubmit(null, codeFromUrl);
        }
    }, [location]);

    const handleSubmit = async (e, code = null) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await checkIn(code || ticketCode);
            setTicket(response.ticket);
            if (response.ticket.checked_in) {
                setSuccess('Penumpang ini sudah melakukan check-in sebelumnya.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan saat memproses check-in.');
            setTicket(null);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessCheckIn = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await checkIn(ticketCode);
            setSuccess('Check-in berhasil diproses.');
            // Reload ticket data after check-in
            setTimeout(() => {
                handleSubmit(null, ticketCode);
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan saat memproses check-in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Flash Messages */}
                {success && (
                    <Alert type="success" onDismiss={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                {error && (
                    <Alert type="error" onDismiss={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Main Card */}
                <Card
                    title={
                        <div className="flex items-center">
                            <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Check-in Penumpang
                        </div>
                    }
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                    {/* Search Form */}
                    <div className="px-6 py-6 border-b border-gray-200">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="ticket_code" className="block text-sm font-medium text-gray-700">Kode Tiket / Kode Booking</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        name="ticket_code"
                                        id="ticket_code"
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-32 sm:text-sm border-gray-300 rounded-md py-3"
                                        placeholder="Masukkan kode tiket atau booking"
                                        value={ticketCode}
                                        onChange={(e) => setTicketCode(e.target.value)}
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="h-full rounded-l-none"
                                            disabled={loading}
                                        >
                                            <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            Cari
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex mt-2 space-x-2 text-sm text-gray-500">
                                    <span className="inline-flex items-center">
                                        <svg className="h-4 w-4 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Format: TKT-XXXXX (tiket) atau FBS-XXXXX (booking)</span>
                                    </span>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Ticket Details */}
                    {ticket && (
                        <div className="px-6 py-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                                Detail Tiket
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-700">Informasi Tiket</h4>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        <div className="px-4 py-3 grid grid-cols-3">
                                            <div className="col-span-1 text-sm font-medium text-gray-500">Kode Tiket</div>
                                            <div className="col-span-2 text-sm text-gray-900 font-mono">{ticket.ticket_code}</div>
                                        </div>
                                        <div className="px-4 py-3 grid grid-cols-3">
                                            <div className="col-span-1 text-sm font-medium text-gray-500">Kode Booking</div>
                                            <div className="col-span-2 text-sm text-gray-900 font-mono">{ticket.booking.booking_code}</div>
                                        </div>
                                        <div className="px-4 py-3 grid grid-cols-3">
                                            <div className="col-span-1 text-sm font-medium text-gray-500">Status Tiket</div>
                                            <div className="col-span-2">
                                                {ticket.status === 'ACTIVE' && <Badge type="success">Aktif</Badge>}
                                                {ticket.status === 'USED' && <Badge type="info">Digunakan</Badge>}
                                                {ticket.status === 'CANCELLED' && <Badge type="error">Dibatalkan</Badge>}
                                            </div>
                                        </div>
                                        <div className="px-4 py-3 grid grid-cols-3">
                                            <div className="col-span-1 text-sm font-medium text-gray-500">Check-in</div>
                                            <div className="col-span-2">
                                                {ticket.checked_in ? (
                                                    <span className="inline-flex items-center text-sm">
                                                        <svg className="h-4 w-4 mr-1 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-gray-900">Sudah Check-in ({new Date(ticket.boarding_time).toLocaleString()})</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-sm">
                                                        <svg className="h-4 w-4 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-gray-500">Belum Check-in</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-700">Informasi Penumpang</h4>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        <div className="px-4 py-3 grid grid-cols-3">
                                            <div className="col-span-1 text-sm font-medium text-gray-500">Nama Penumpang</div>
                                            <div className="col-span-2 text-sm text-gray-900">{ticket.passenger_name}</div>
                                        </div>
                                        <div className="px-4 py-3 grid grid-cols-3">
                                            <div className="col-span-1 text-sm font-medium text-gray-500">No. ID</div>
                                            <div className="col-span-2 text-sm text-gray-900">{ticket.passenger_id_number} ({ticket.passenger_id_type})</div>
                                        </div>
                                        <div className="px-4 py-3 grid grid-cols-3">
                                            <div className="col-span-1 text-sm font-medium text-gray-500">Tanggal</div>
                                            <div className="col-span-2 text-sm text-gray-900">
                                                {new Date(ticket.booking.departure_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="px-4 py-3 grid grid-cols-3">
                                            <div className="col-span-1 text-sm font-medium text-gray-500">Rute</div>
                                            <div className="col-span-2 text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <span>{ticket.booking.schedule.route.origin}</span>
                                                    <svg className="mx-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          // Lanjutan src/pages/operator/bookings/CheckIn.jsx
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                    <span>{ticket.booking.schedule.route.destination}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Info (if exists) */}
                            {ticket.vehicle && (
                                <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 001-1v-3.05a2.5 2.5 0 010-4.9V4a1 1 0 00-1-1H3z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <h3 className="text-sm font-medium text-blue-800">Informasi Kendaraan</h3>
                                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <div className="flex items-center">
                                                    <span className="text-xs font-medium text-blue-700 mr-2">Tipe:</span>
                                                    <span className="text-xs text-blue-800">
                                                        {ticket.vehicle.type === 'MOTORCYCLE' && 'Motor'}
                                                        {ticket.vehicle.type === 'CAR' && 'Mobil'}
                                                        {ticket.vehicle.type === 'BUS' && 'Bus'}
                                                        {ticket.vehicle.type === 'TRUCK' && 'Truk'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="text-xs font-medium text-blue-700 mr-2">Nomor Plat:</span>
                                                    <span className="text-xs text-blue-800 font-mono">{ticket.vehicle.license_plate}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="text-xs font-medium text-blue-700 mr-2">Pemilik:</span>
                                                    <span className="text-xs text-blue-800">{ticket.vehicle.owner_name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-6 flex justify-center">
                                {!ticket.checked_in && ticket.status === 'ACTIVE' && ticket.booking.status === 'CONFIRMED' ? (
                                    <Button
                                        variant="success"
                                        size="lg"
                                        className="inline-flex items-center px-6 py-3"
                                        disabled={loading}
                                        onClick={handleProcessCheckIn}
                                    >
                                        <svg className="mr-2 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Proses Check-in
                                    </Button>
                                ) : ticket.checked_in ? (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-green-800">Penumpang ini sudah melakukan check-in</h3>
                                                <div className="mt-2 text-sm text-green-700">
                                                    <p>Check-in pada: {new Date(ticket.boarding_time).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : ticket.status === 'CANCELLED' ? (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">Tiket telah dibatalkan</h3>
                                                <div className="mt-2 text-sm text-red-700">
                                                    <p>Tiket ini tidak dapat digunakan karena sudah dibatalkan.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.924-1.36 3.35 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">Booking belum dikonfirmasi</h3>
                                                <div className="mt-2 text-sm text-yellow-700">
                                                    <p>Status booking saat ini: {ticket.booking.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default CheckIn;