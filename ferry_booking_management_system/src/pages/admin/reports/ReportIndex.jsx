import React, { useState, useEffect } from 'react';
import adminReportService from '../../../services/adminReport.service';

const ReportIndex = () => {
  const [routes, setRoutes] = useState([]);
  const [stats, setStats] = useState({
    bookings_this_month: 0,
    revenue_this_month: 0,
    bookings_this_week: 0,
    bookings_today: 0
  });
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [formData, setFormData] = useState({
    booking: {
      start_date: new Date().toISOString().slice(0, 8) + '01',
      end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
      route_id: '',
      status: ''
    },
    revenue: {
      start_date: new Date().toISOString().slice(0, 8) + '01',
      end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
      route_id: '',
      group_by: 'monthly'
    },
    schedule: {
      start_date: new Date().toISOString().slice(0, 8) + '01',
      end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
      route_id: ''
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch dashboard data which includes routes, stats, and popular routes
      const dashboardData = await adminReportService.getDashboardData();
      
      if (dashboardData && dashboardData.data) {
        const data = dashboardData.data;
        setRoutes(data.routes || []);
        setStats(data.stats || {
          bookings_this_month: 0,
          revenue_this_month: 0,
          bookings_this_week: 0,
          bookings_today: 0
        });
        setPopularRoutes(data.popularRoutes || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set default values on error
      setStats({
        bookings_this_month: 0,
        revenue_this_month: 0,
        bookings_this_week: 0,
        bookings_today: 0
      });
      setPopularRoutes([]);
      setRoutes([]);
    }
  };

  const handleFormChange = (reportType, field, value) => {
    setFormData(prev => ({
      ...prev,
      [reportType]: {
        ...prev[reportType],
        [field]: value
      }
    }));
  };

  const handleSubmit = (reportType, exportType = null) => {
    const params = new URLSearchParams(formData[reportType]);
    if (exportType === 'csv') {
      params.append('export', 'csv');
    }
    window.location.href = `/admin/reports/${reportType}?${params.toString()}`;
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Laporan Booking */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-blue-600">Laporan Booking</h2>
          </div>
          <div className="p-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('booking'); }}>
              <div className="mb-4">
                <label htmlFor="booking_start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="booking_start_date"
                  value={formData.booking.start_date}
                  onChange={(e) => handleFormChange('booking', 'start_date', e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="booking_end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Akhir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="booking_end_date"
                  value={formData.booking.end_date}
                  onChange={(e) => handleFormChange('booking', 'end_date', e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="booking_route_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Rute
                </label>
                <select
                  id="booking_route_id"
                  value={formData.booking.route_id}
                  onChange={(e) => handleFormChange('booking', 'route_id', e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Rute</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.origin} - {route.destination}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="booking_status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="booking_status"
                  value={formData.booking.status}
                  onChange={(e) => handleFormChange('booking', 'status', e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Lihat Laporan
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('booking', 'csv')}
                  className="w-full inline-flex justify-center items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Laporan Pendapatan */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-green-600">Laporan Pendapatan</h2>
          </div>
          <div className="p-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('revenue'); }}>
              <div className="mb-4">
                <label htmlFor="revenue_start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="revenue_start_date"
                  value={formData.revenue.start_date}
                  onChange={(e) => handleFormChange('revenue', 'start_date', e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="revenue_end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Akhir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="revenue_end_date"
                  value={formData.revenue.end_date}
                  onChange={(e) => handleFormChange('revenue', 'end_date', e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="revenue_route_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Rute
                </label>
                <select
                  id="revenue_route_id"
                  value={formData.revenue.route_id}
                  onChange={(e) => handleFormChange('revenue', 'route_id', e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Semua Rute</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.origin} - {route.destination}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="revenue_group_by" className="block text-sm font-medium text-gray-700 mb-1">
                  Kelompokkan Berdasarkan <span className="text-red-500">*</span>
                </label>
                <select
                  id="revenue_group_by"
                  value={formData.revenue.group_by}
                  onChange={(e) => handleFormChange('revenue', 'group_by', e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                </select>
              </div>
              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Lihat Laporan
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('revenue', 'csv')}
                  className="w-full inline-flex justify-center items-center px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-md shadow-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Laporan Jadwal */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-indigo-600">Laporan Jadwal</h2>
          </div>
          <div className="p-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('schedule'); }}>
              <div className="mb-4">
                <label htmlFor="schedule_start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="schedule_start_date"
                  value={formData.schedule.start_date}
                  onChange={(e) => handleFormChange('schedule', 'start_date', e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="schedule_end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Akhir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="schedule_end_date"
                  value={formData.schedule.end_date}
                  onChange={(e) => handleFormChange('schedule', 'end_date', e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="schedule_route_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Rute
                </label>
                <select
                  id="schedule_route_id"
                  value={formData.schedule.route_id}
                  onChange={(e) => handleFormChange('schedule', 'route_id', e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Semua Rute</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.origin} - {route.destination}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Lihat Laporan
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('schedule', 'csv')}
                  className="w-full inline-flex justify-center items-center px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-md shadow-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Statistik Cepat */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-blue-600">Statistik Cepat</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Booking Bulan Ini */}
              <div className="bg-white rounded-lg shadow border-l-4 border-blue-500 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-600 uppercase">Booking Bulan Ini</p>
                      <p className="mt-2 text-2xl font-bold text-gray-800">{stats.bookings_this_month || 0}</p>
                    </div>
                    <div className="rounded-full bg-blue-100 p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pendapatan Bulan Ini */}
              <div className="bg-white rounded-lg shadow border-l-4 border-green-500 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-green-600 uppercase">Pendapatan Bulan Ini</p>
                      <p className="mt-2 text-2xl font-bold text-gray-800">
                        Rp {new Intl.NumberFormat('id-ID').format(stats.revenue_this_month || 0)}
                      </p>
                    </div>
                    <div className="rounded-full bg-green-100 p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Minggu Ini */}
              <div className="bg-white rounded-lg shadow border-l-4 border-indigo-500 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-indigo-600 uppercase">Booking Minggu Ini</p>
                      <p className="mt-2 text-2xl font-bold text-gray-800">{stats.bookings_this_week || 0}</p>
                    </div>
                    <div className="rounded-full bg-indigo-100 p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Hari Ini */}
              <div className="bg-white rounded-lg shadow border-l-4 border-yellow-500 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-yellow-600 uppercase">Booking Hari Ini</p>
                      <p className="mt-2 text-2xl font-bold text-gray-800">{stats.bookings_today || 0}</p>
                    </div>
                    <div className="rounded-full bg-yellow-100 p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rute Populer */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-blue-600">Rute Populer</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Booking</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendapatan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {popularRoutes.length > 0 ? (
                  popularRoutes.map((route, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {route.origin} - {route.destination}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.booking_count || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Rp {new Intl.NumberFormat('id-ID').format(route.total_revenue || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">Tidak ada data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIndex;