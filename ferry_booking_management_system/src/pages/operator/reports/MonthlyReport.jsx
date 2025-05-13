// src/pages/operator/reports/MonthlyReport.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { operatorReportService } from '../../../services/operatorReports.service';
import Swal from 'sweetalert2';

const MonthlyReport = () => {
  const [searchParams] = useSearchParams();
  const [month, setMonth] = useState(searchParams.get('month') || new Date().toISOString().slice(0, 7));
  const [routeData, setRouteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPassengers: 0,
    totalVehicles: 0,
    activeRoutes: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchMonthlyReport();
  }, [month]);

  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const response = await operatorReportService.getMonthly({ month });
      const data = response.data.data;
      setRouteData(data);
      
      // Calculate summary
      const summary = {
        totalPassengers: 0,
        totalVehicles: 0,
        activeRoutes: data.length,
        totalRevenue: 0
      };

      data.forEach(route => {
        summary.totalPassengers += route.total_passengers;
        summary.totalVehicles += route.total_vehicles;
        summary.totalRevenue += route.total_amount;
      });

      setSummary(summary);
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat laporan bulanan',
      });
    }
    setLoading(false);
  };

  const handleExport = async () => {
    try {
      const response = await operatorReportService.exportMonthly({ month, export: 'csv' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-bulanan-${month}.csv`;
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

  const formatMonth = (monthString) => {
    const date = new Date(monthString + '-01');
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  return (
    <div className="max-w-full px-4 py-6">
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Laporan Bulanan: {formatMonth(month)}
            </h3>
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
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : routeData.length === 0 ? (
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
                <div className="font-bold">Informasi</div>
                <p>Tidak ada data yang tersedia untuk bulan ini.</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-blue-500 rounded-lg shadow-md overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-600 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-blue-100 truncate">Total Penumpang</dt>
                            <dd className="text-3xl font-semibold text-white">{summary.totalPassengers.toLocaleString('id-ID')}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500 rounded-lg shadow-md overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-600 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-green-100 truncate">Total Kendaraan</dt>
                            <dd className="text-3xl font-semibold text-white">{summary.totalVehicles.toLocaleString('id-ID')}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500 rounded-lg shadow-md overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-yellow-600 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-yellow-100 truncate">Rute Aktif</dt>
                            <dd className="text-3xl font-semibold text-white">{summary.activeRoutes}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500 rounded-lg shadow-md overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-red-600 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-red-100 truncate">Total Pendapatan</dt>
                            <dd className="text-2xl font-semibold text-white">{formatCurrency(summary.totalRevenue)}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Routes Data */}
                {routeData.map((data) => (
                  <div key={data.route_id} className="bg-white border border-gray-200 rounded-lg shadow-md mb-6 overflow-hidden">
                    <div className="bg-blue-600 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white">
                        Rute: {data.route.origin} - {data.route.destination}
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center p-4">
                            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-500">Total Penumpang</div>
                              <div className="text-lg font-semibold text-gray-900">{data.total_passengers.toLocaleString('id-ID')}</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center p-4">
                            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-500">Total Kendaraan</div>
                              <div className="text-lg font-semibold text-gray-900">{data.total_vehicles.toLocaleString('id-ID')}</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center p-4">
                            <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-500">Total Pendapatan</div>
                              <div className="text-lg font-semibold text-gray-900">{formatCurrency(data.total_amount)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Penumpang
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Kendaraan
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Pendapatan
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(data.dates).sort().map(([date, dateData]) => (
                              <tr key={date}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDate(date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {dateData.passengers.toLocaleString('id-ID')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {dateData.vehicles.toLocaleString('id-ID')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatCurrency(dateData.amount)}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Total
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {data.total_passengers.toLocaleString('id-ID')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {data.total_vehicles.toLocaleString('id-ID')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(data.total_amount)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;