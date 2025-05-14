// src/pages/operator/reports/DailyReport.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { operatorReportsService } from '../../../services/operatorReports.service';
import Swal from 'sweetalert2';

const DailyReport = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [filter, setFilter] = useState({
    date: new Date().toISOString().split('T')[0]
  });

  // Check if operator has routes
  const hasRoutes = () => {
    return user?.assigned_routes && Object.keys(user.assigned_routes).length > 0;
  };

  useEffect(() => {
    if (hasRoutes()) {
      fetchReport();
    } else {
      setLoading(false);
    }
  }, [filter.date]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await operatorReportsService.getDaily({ date: filter.date });
      console.log('Daily report response:', response);

      if (response.data && response.data.status === 'success') {
        // Handle berbagai format response
        if (Array.isArray(response.data.data)) {
          setReportData(response.data.data);
        } else if (response.data.data && Array.isArray(response.data.data.bookings)) {
          setReportData(response.data.data.bookings);
        } else if (response.data.data && response.data.data.report) {
          setReportData(Array.isArray(response.data.data.report) ? response.data.data.report : []);
        } else {
          setReportData([]);
        }
      } else {
        setReportData([]);
      }
    } catch (err) {
      console.error('Error fetching daily report:', err);
      setError('Gagal memuat laporan harian');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await operatorReportsService.exportDaily({ 
        date: filter.date, 
        export: 'csv' 
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-harian-${filter.date}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengunduh laporan',
      });
    }
  };

  // Jika operator tidak memiliki rute
  if (!hasRoutes()) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Laporan Harian</h1>
            
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
              <p className="font-bold">Perhatian</p>
              <p>Anda belum ditugaskan ke rute manapun. Silakan hubungi administrator untuk mendapatkan akses ke rute.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Laporan Harian
            </h1>
            <div className="flex space-x-2">
              <Link
                to="/operator/reports"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali
              </Link>
              {/* Export button hanya muncul jika ada data */}
              {reportData.length > 0 && (
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
            <input
              type="date"
              value={filter.date}
              onChange={(e) => setFilter({ date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
              <p className="font-bold">Informasi</p>
              <p>Tidak ada data untuk tanggal ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode Booking
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Penumpang
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rute
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((booking) => (
                    <tr key={booking.id || booking.booking_code}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.booking_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.user?.name || booking.user_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.route || booking.route_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Rp {(booking.total_amount || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyReport;