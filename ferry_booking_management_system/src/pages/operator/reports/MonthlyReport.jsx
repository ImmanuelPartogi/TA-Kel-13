import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const MonthlyReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const monthParam = searchParams.get('month') || format(new Date(), 'yyyy-MM');
  
  const [month, setMonth] = useState(monthParam);
  const [routeData, setRouteData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useDocumentTitle(`Laporan Bulanan: ${format(new Date(month + '-01'), 'MMMM yyyy', { locale: id })}`);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/operator-panel/reports/monthly?month=${month}`);
      setRouteData(response.data.routeData || {});
      setLoading(false);
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data laporan.');
      setLoading(false);
      console.error('Error fetching report data:', err);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [month]);

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setMonth(newMonth);
    navigate(`/operator/reports/monthly?month=${newMonth}`, { replace: true });
  };

  const handleExportCSV = () => {
    window.location.href = `/api/operator-panel/reports/monthly/export?month=${month}`;
  };

  const calculateTotalPassengers = () => {
    return Object.values(routeData).reduce((total, route) => total + route.total_passengers, 0);
  };

  const calculateTotalVehicles = () => {
    return Object.values(routeData).reduce((total, route) => total + route.total_vehicles, 0);
  };

  const calculateTotalAmount = () => {
    return Object.values(routeData).reduce((total, route) => total + route.total_amount, 0);
  };

  return (
    <div className="max-w-full px-4 py-6">
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Laporan Bulanan: {format(new Date(month + '-01'), 'MMMM yyyy', { locale: id })}
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
          
          {/* Month selector */}
          <div className="px-6 pt-4 pb-2">
            <div className="mb-4 max-w-xs">
              <label htmlFor="month-selector" className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Bulan
              </label>
              <input
                type="month"
                id="month-selector"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={month}
                onChange={handleMonthChange}
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
            ) : Object.keys(routeData).length === 0 ? (
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
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-blue-100 truncate">Total Penumpang</dt>
                            <dd className="text-3xl font-semibold text-white">{calculateTotalPassengers()}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500 rounded-lg shadow-md overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-600 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-green-100 truncate">Total Kendaraan</dt>
                            <dd className="text-3xl font-semibold text-white">{calculateTotalVehicles()}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500 rounded-lg shadow-md overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-yellow-600 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-yellow-100 truncate">Rute Aktif</dt>
                            <dd className="text-3xl font-semibold text-white">{Object.keys(routeData).length}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500 rounded-lg shadow-md overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-red-600 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-red-100 truncate">Total Pendapatan</dt>
                            <dd className="text-3xl font-semibold text-white">
                              Rp {calculateTotalAmount().toLocaleString('id-ID')}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Routes Data */}
                {Object.entries(routeData).map(([routeId, data]) => (
                  <div key={routeId} className="bg-white border border-gray-200 rounded-lg shadow-md mb-6 overflow-hidden">
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
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-500">Total Penumpang</div>
                              <div className="text-lg font-semibold text-gray-900">{data.total_passengers}</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center p-4">
                            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-500">Total Kendaraan</div>
                              <div className="text-lg font-semibold text-gray-900">{data.total_vehicles}</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center p-4">
                            <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-500">Total Pendapatan</div>
                              <div className="text-lg font-semibold text-gray-900">
                                Rp {data.total_amount.toLocaleString('id-ID')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Penumpang</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Kendaraan</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pendapatan</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(data.dates)
                              .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                              .map(([date, dateData]) => (
                                <tr key={date}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {format(new Date(date), 'dd MMMM yyyy', { locale: id })}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {dateData.passengers}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {dateData.vehicles}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    Rp {dateData.amount.toLocaleString('id-ID')}
                                  </td>
                                </tr>
                              ))}
                            <tr className="bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {data.total_passengers}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {data.total_vehicles}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Rp {data.total_amount.toLocaleString('id-ID')}
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