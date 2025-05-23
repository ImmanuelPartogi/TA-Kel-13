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
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [activeTab, setActiveTab] = useState('booking');

  useEffect(() => {
    fetchData();
    
    // Auto-hide alert after 5 seconds
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({...alert, show: false});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const fetchData = async () => {
    try {
      setLoading(true);
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
      setAlert({
        show: true, 
        type: 'error',
        message: 'Terjadi kesalahan saat memuat data laporan'
      });
    } finally {
      setLoading(false);
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Modern Header */}
      <div className="bg-gradient-to-br from-blue-800 via-blue-600 to-blue-500 p-8 text-white relative">
        <div className="absolute inset-0 opacity-20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" className="w-full h-full">
            <path d="M472.3 724.1c-142.9 52.5-285.8-46.9-404.6-124.4 104.1 31.6 255-30.3 307.6-130.9 52.5-100.6-17.3-178.1-96.4-193.9 207.6 26.6 285.8 337.7 193.4 449.2z" 
                  fill="#fff" opacity="0.2" />
            <path d="M472.3 724.1c-142.9 52.5-285.8-46.9-404.6-124.4 104.1 31.6 255-30.3 307.6-130.9 52.5-100.6-17.3-178.1-96.4-193.9 207.6 26.6 285.8 337.7 193.4 449.2z" 
                  fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeDasharray="10 20" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-4">
                <i className="fas fa-chart-line text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Laporan & Statistik</h1>
                <p className="mt-1 text-blue-100">Kelola dan analisis seluruh data pelayaran dalam sistem</p>
              </div>
            </div>
            
            <div>
              <button
                onClick={() => setAlert({ show: true, type: 'success', message: 'Fitur ekspor semua laporan dalam pengembangan' })}
                className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm">
                <i className="fas fa-file-export mr-2"></i> Ekspor Semua Laporan
              </button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Booking Bulan Ini</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-calendar-alt mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{stats.bookings_this_month}</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Pendapatan Bulan Ini</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-money-bill-wave mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{formatCurrency(stats.revenue_this_month).replace('Rp', '')}</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Booking Minggu Ini</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-calendar-week mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{stats.bookings_this_week}</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Booking Hari Ini</p>
              <div className="flex items-center mt-1">
                <i className="fas fa-calendar-day mr-2 text-blue-100"></i>
                <span className="text-2xl font-bold">{stats.bookings_today}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Alert Messages with modern styling */}
        {alert.show && (
          <div className={`mb-6 rounded-lg shadow-lg overflow-hidden animate-slideIn`}>
            <div className={`${alert.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} px-4 py-2 text-white flex items-center justify-between`}>
              <div className="flex items-center">
                <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                <span className="font-medium">{alert.type === 'success' ? 'Sukses' : 'Error'}</span>
              </div>
              <button onClick={() => setAlert({...alert, show: false})} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={`${alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'} px-4 py-3 border-t`}>
              {alert.message}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-8 text-center">
            <div className="inline-block relative">
              <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="mt-4 text-gray-600">Memuat data laporan...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Report Tabs */}
            <div className="mb-6">
              <div className="flex border-b border-gray-200">
                <button 
                  onClick={() => setActiveTab('booking')}
                  className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'booking' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <i className="fas fa-ticket-alt mr-2"></i> Laporan Booking
                </button>
                <button 
                  onClick={() => setActiveTab('revenue')}
                  className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'revenue' 
                    ? 'text-green-600 border-b-2 border-green-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <i className="fas fa-money-bill-wave mr-2"></i> Laporan Pendapatan
                </button>
                <button 
                  onClick={() => setActiveTab('schedule')}
                  className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'schedule' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <i className="fas fa-calendar-alt mr-2"></i> Laporan Jadwal
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Report Form */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h2 className={`text-lg font-semibold flex items-center ${
                    activeTab === 'booking' ? 'text-blue-600' : 
                    activeTab === 'revenue' ? 'text-green-600' : 'text-indigo-600'
                  }`}>
                    <i className={`fas ${
                      activeTab === 'booking' ? 'fa-ticket-alt' : 
                      activeTab === 'revenue' ? 'fa-money-bill-wave' : 'fa-calendar-alt'
                    } mr-2`}></i>
                    {activeTab === 'booking' ? 'Filter Laporan Booking' : 
                     activeTab === 'revenue' ? 'Filter Laporan Pendapatan' : 'Filter Laporan Jadwal'}
                  </h2>
                </div>
                
                <div className="p-6 bg-white">
                  {/* Booking Report Form */}
                  {activeTab === 'booking' && (
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit('booking'); }}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="booking_start_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai <span className="text-red-500">*</span></label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-calendar text-gray-400"></i>
                            </div>
                            <input
                              type="date"
                              id="booking_start_date"
                              value={formData.booking.start_date}
                              onChange={(e) => handleFormChange('booking', 'start_date', e.target.value)}
                              required
                              className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="booking_end_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir <span className="text-red-500">*</span></label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-calendar text-gray-400"></i>
                            </div>
                            <input
                              type="date"
                              id="booking_end_date"
                              value={formData.booking.end_date}
                              onChange={(e) => handleFormChange('booking', 'end_date', e.target.value)}
                              required
                              className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="booking_route_id" className="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-route text-gray-400"></i>
                            </div>
                            <select
                              id="booking_route_id"
                              value={formData.booking.route_id}
                              onChange={(e) => handleFormChange('booking', 'route_id', e.target.value)}
                              className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                              <option value="">Semua Rute</option>
                              {routes.map(route => (
                                <option key={route.id} value={route.id}>
                                  {route.origin} - {route.destination}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="booking_status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-tag text-gray-400"></i>
                            </div>
                            <select
                              id="booking_status"
                              value={formData.booking.status}
                              onChange={(e) => handleFormChange('booking', 'status', e.target.value)}
                              className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                              <option value="">Semua Status</option>
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="CANCELLED">Cancelled</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="REFUNDED">Refunded</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                          <button
                            type="submit"
                            className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
                          >
                            <i className="fas fa-eye mr-2"></i> Lihat Laporan
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmit('booking', 'csv')}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-colors"
                          >
                            <i className="fas fa-file-csv mr-2"></i> Export CSV
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Revenue Report Form */}
                  {activeTab === 'revenue' && (
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit('revenue'); }}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="revenue_start_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai <span className="text-red-500">*</span></label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-calendar text-gray-400"></i>
                            </div>
                            <input
                              type="date"
                              id="revenue_start_date"
                              value={formData.revenue.start_date}
                              onChange={(e) => handleFormChange('revenue', 'start_date', e.target.value)}
                              required
                              className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="revenue_end_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir <span className="text-red-500">*</span></label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-calendar text-gray-400"></i>
                            </div>
                            <input
                              type="date"
                              id="revenue_end_date"
                              value={formData.revenue.end_date}
                              onChange={(e) => handleFormChange('revenue', 'end_date', e.target.value)}
                              required
                              className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="revenue_route_id" className="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-route text-gray-400"></i>
                            </div>
                            <select
                              id="revenue_route_id"
                              value={formData.revenue.route_id}
                              onChange={(e) => handleFormChange('revenue', 'route_id', e.target.value)}
                              className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                              <option value="">Semua Rute</option>
                              {routes.map(route => (
                                <option key={route.id} value={route.id}>
                                  {route.origin} - {route.destination}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="revenue_group_by" className="block text-sm font-medium text-gray-700 mb-1">Kelompokkan Berdasarkan <span className="text-red-500">*</span></label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-layer-group text-gray-400"></i>
                            </div>
                            <select
                              id="revenue_group_by"
                              value={formData.revenue.group_by}
                              onChange={(e) => handleFormChange('revenue', 'group_by', e.target.value)}
                              required
                              className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                              <option value="daily">Harian</option>
                              <option value="weekly">Mingguan</option>
                              <option value="monthly">Bulanan</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                          <button
                            type="submit"
                            className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-colors"
                          >
                            <i className="fas fa-eye mr-2"></i> Lihat Laporan
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmit('revenue', 'csv')}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-lg shadow-sm transition-colors"
                          >
                            <i className="fas fa-file-csv mr-2"></i> Export CSV
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Schedule Report Form */}
                  {activeTab === 'schedule' && (
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit('schedule'); }}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="schedule_start_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai <span className="text-red-500">*</span></label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-calendar text-gray-400"></i>
                            </div>
                            <input
                              type="date"
                              id="schedule_start_date"
                              value={formData.schedule.start_date}
                              onChange={(e) => handleFormChange('schedule', 'start_date', e.target.value)}
                              required
                              className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="schedule_end_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir <span className="text-red-500">*</span></label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-calendar text-gray-400"></i>
                            </div>
                            <input
                              type="date"
                              id="schedule_end_date"
                              value={formData.schedule.end_date}
                              onChange={(e) => handleFormChange('schedule', 'end_date', e.target.value)}
                              required
                              className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="schedule_route_id" className="block text-sm font-medium text-gray-700 mb-1">Rute</label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-route text-gray-400"></i>
                            </div>
                            <select
                              id="schedule_route_id"
                              value={formData.schedule.route_id}
                              onChange={(e) => handleFormChange('schedule', 'route_id', e.target.value)}
                              className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                              <option value="">Semua Rute</option>
                              {routes.map(route => (
                                <option key={route.id} value={route.id}>
                                  {route.origin} - {route.destination}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                          <button
                            type="submit"
                            className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors"
                          >
                            <i className="fas fa-eye mr-2"></i> Lihat Laporan
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmit('schedule', 'csv')}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg shadow-sm transition-colors"
                          >
                            <i className="fas fa-file-csv mr-2"></i> Export CSV
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Popular Routes Table */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-blue-600 flex items-center">
                    <i className="fas fa-star mr-2"></i> Rute Populer
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Booking</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {popularRoutes.length > 0 ? (
                        popularRoutes.map((route, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                  <i className="fas fa-route"></i>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{route.origin} - {route.destination}</div>
                                  {route.route_code && (
                                    <div className="text-xs text-gray-500">{route.route_code}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 flex items-center">
                                <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">
                                  <i className="fas fa-ticket-alt mr-1"></i> {route.booking_count || 0} Booking
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-medium">
                                <i className="fas fa-money-bill-wave mr-1"></i> {formatCurrency(route.total_revenue || 0)}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <i className="fas fa-route text-gray-400 text-xl"></i>
                              </div>
                              <p className="text-gray-500 text-sm">Belum ada data rute populer tersedia</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Revenue Chart Preview Card */}
            <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-blue-600 flex items-center">
                  <i className="fas fa-chart-area mr-2"></i> Grafik Pendapatan
                </h2>
              </div>
              <div className="p-6 text-center">
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-chart-bar text-gray-400 text-3xl"></i>
                  </div>
                  <p className="text-gray-600 mb-4">Silakan pilih kriteria laporan dan klik "Lihat Laporan" untuk melihat grafik pendapatan</p>
                  <button 
                    onClick={() => setActiveTab('revenue')}
                    className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                  >
                    <i className="fas fa-chart-line mr-2"></i>
                    Buat Laporan Pendapatan
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`        
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ReportIndex;