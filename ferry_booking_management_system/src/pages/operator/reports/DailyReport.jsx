import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const DailyReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const dateParam = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
  
  const [date, setDate] = useState(dateParam);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useDocumentTitle(`Laporan Harian: ${format(new Date(date), 'dd MMMM yyyy', { locale: id })}`);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/operator-panel/reports/daily?date=${date}`);
      setReportData(response.data.reportData || []);
      setLoading(false);
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data laporan.');
      setLoading(false);
      console.error('Error fetching report data:', err);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [date]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    navigate(`/operator/reports/daily?date=${newDate}`, { replace: true });
  };

  const handleExportCSV = () => {
    window.location.href = `/api/operator-panel/reports/daily/export?date=${date}`;
  };

  return (
    <div className="max-w-full px-4 py-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Laporan Harian: {format(new Date(date), 'dd MMMM yyyy', { locale: id })}
          </h3>
          <div className="flex space-x-2">
            <Link 
              to="/operator/reports" 
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Kembali
            </Link>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Export CSV
            </button>
          </div>
        </div>
        
        {/* Date selector */}
        <div className="px-6 pt-4 pb-2">
          <div className="mb-4 max-w-xs">
            <label htmlFor="date-selector" className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Tanggal
            </label>
            <input
              type="date"
              id="date-selector"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={date}
              onChange={handleDateChange}
            />
          </div>
        </div>
        
        <div className="px-6 py-4">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <div className="font-bold">Error</div>
              <p>{error}</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
              <div className="font-bold">Informasi</div>
              <p>Tidak ada data jadwal yang tersedia untuk tanggal ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jadwal</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Penumpang</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penumpang Check-in</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Kendaraan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail Kendaraan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Okupansi (%)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Booking</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail Booking</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((data, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.schedule.route.origin} - {data.schedule.route.destination}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.schedule.ferry.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.schedule.departure_time} - {data.schedule.arrival_time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.passengers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.checked_in_passengers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.vehicles}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <ul className="list-none">
                          <li>Motor: {data.motorcycle_count}</li>
                          <li>Mobil: {data.car_count}</li>
                          <li>Bus: {data.bus_count}</li>
                          <li>Truk: {data.truck_count}</li>
                        </ul>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parseFloat(data.occupancy_rate).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.total_bookings}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <ul className="list-none">
                          <li>Confirmed: {data.confirmed_bookings}</li>
                          <li>Completed: {data.completed_bookings}</li>
                          <li>Cancelled: {data.cancelled_bookings}</li>
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detail bookings for each schedule */}
          {!loading && !error && reportData.length > 0 && reportData.map((data, index) => (
            data.bookings && data.bookings.length > 0 && (
              <div className="mt-8" key={`bookings-${index}`}>
                <h5 className="text-lg font-medium text-gray-800 mb-3">
                  Detail Booking: {data.schedule.route.origin} - {data.schedule.route.destination} ({data.schedule.departure_time})
                </h5>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Booking</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penumpang</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kendaraan</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.booking_code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(booking.departure_time), 'dd MMM yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.passenger_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.vehicles.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Rp {booking.total_amount.toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {booking.status === 'PENDING' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Menunggu</span>
                            )}
                            {booking.status === 'CONFIRMED' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Dikonfirmasi</span>
                            )}
                            {booking.status === 'COMPLETED' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Selesai</span>
                            )}
                            {booking.status === 'CANCELLED' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Dibatalkan</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link 
                              to={`/operator/bookings/${booking.id}`} 
                              className="inline-flex items-center px-3 py-1 border border-transparent rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                              </svg>
                              Detail
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyReport;