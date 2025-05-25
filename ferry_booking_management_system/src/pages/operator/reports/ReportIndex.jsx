// src/pages/operator/reports/ReportIndex.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { operatorReportsService } from '../../../services/operatorReports.service';
import Swal from 'sweetalert2';

const ReportIndex = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyDate, setMonthlyDate] = useState(new Date().toISOString().slice(0, 7));
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [summaryStats, setSummaryStats] = useState({
    totalPassengers: 0,
    totalVehicles: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // Cek apakah operator memiliki rute
  const hasRoutes = user?.assigned_routes && Object.keys(user.assigned_routes).length > 0;

  // Simulasi loading saat ekspor
  const simulateLoading = (callback) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      callback();
    }, 600);
  };

  // Format mata uang
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format tanggal
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Format bulan
  const formatMonth = (monthString) => {
    const date = new Date(monthString + '-01');
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  // Fetch summary data
  const fetchSummaryData = useCallback(async () => {
    if (!hasRoutes) {
      setDataLoading(false);
      return;
    }

    try {
      // Ini adalah panggilan API simulasi, ganti dengan panggilan operatorReportsService yang sebenarnya
      // const response = await operatorReportsService.getSummary();
      
      // Untuk contoh, kita gunakan data dummy
      const dummyData = {
        totalPassengers: 1248,
        totalVehicles: 376,
        totalBookings: 1452,
        totalRevenue: 87450000
      };
      
      setSummaryStats(dummyData);
      
      // Simulasi recent reports (biasanya dari localStorage atau API)
      const dummyRecentReports = [
        { id: 1, type: 'daily', date: '2025-05-24', viewedAt: '2025-05-25T08:30:15' },
        { id: 2, type: 'monthly', date: '2025-05', viewedAt: '2025-05-24T14:22:05' },
        { id: 3, type: 'daily', date: '2025-05-22', viewedAt: '2025-05-23T10:15:32' }
      ];
      
      setRecentReports(dummyRecentReports);
      
      // Simulasi recent searches (biasanya dari localStorage)
      const dummyRecentSearches = [
        { id: 1, term: 'BDG001', timestamp: '2025-05-24T09:12:32' },
        { id: 2, term: 'JKT-BDG', timestamp: '2025-05-23T16:45:10' }
      ];
      
      setRecentSearches(dummyRecentSearches);
    } catch (error) {
      console.error('Error fetching summary data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat data ringkasan',
      });
    } finally {
      setDataLoading(false);
    }
  }, [hasRoutes]);

  useEffect(() => {
    fetchSummaryData();
    
    // Load recent reports from localStorage
    const savedReports = localStorage.getItem('recentReports');
    if (savedReports) {
      try {
        setRecentReports(JSON.parse(savedReports));
      } catch (e) {
        console.error('Error parsing saved reports', e);
      }
    }
    
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error('Error parsing saved searches', e);
      }
    }
  }, [fetchSummaryData]);

  const handleDailyReport = (e) => {
    e.preventDefault();
    
    // Save to recent reports
    const newReport = { 
      id: Date.now(), 
      type: 'daily', 
      date: dailyDate, 
      viewedAt: new Date().toISOString() 
    };
    
    const updatedReports = [newReport, ...recentReports.filter(r => 
      !(r.type === 'daily' && r.date === dailyDate)
    )].slice(0, 5);
    
    setRecentReports(updatedReports);
    localStorage.setItem('recentReports', JSON.stringify(updatedReports));
    
    navigate(`/operator/reports/daily?date=${dailyDate}`);
  };

  const handleDailyExport = () => {
    simulateLoading(() => {
      Swal.fire({
        icon: 'success',
        title: 'Ekspor Berhasil',
        text: `Laporan harian tanggal ${formatDate(dailyDate)} berhasil diekspor`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      navigate(`/operator/reports/daily?date=${dailyDate}&export=csv`);
    });
  };

  const handleMonthlyReport = (e) => {
    e.preventDefault();
    
    // Save to recent reports
    const newReport = { 
      id: Date.now(), 
      type: 'monthly', 
      date: monthlyDate, 
      viewedAt: new Date().toISOString() 
    };
    
    const updatedReports = [newReport, ...recentReports.filter(r => 
      !(r.type === 'monthly' && r.date === monthlyDate)
    )].slice(0, 5);
    
    setRecentReports(updatedReports);
    localStorage.setItem('recentReports', JSON.stringify(updatedReports));
    
    navigate(`/operator/reports/monthly?month=${monthlyDate}`);
  };

  const handleMonthlyExport = () => {
    simulateLoading(() => {
      Swal.fire({
        icon: 'success',
        title: 'Ekspor Berhasil',
        text: `Laporan bulanan ${formatMonth(monthlyDate)} berhasil diekspor`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      navigate(`/operator/reports/monthly?month=${monthlyDate}&export=csv`);
    });
  };

  const handleRefreshData = async () => {
    setDataLoading(true);
    await fetchSummaryData();
    Swal.fire({
      icon: 'success',
      title: 'Data Diperbarui',
      text: 'Data ringkasan berhasil diperbarui',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    
    if (!searchTerm.trim()) return;
    
    // Save search term
    const newSearch = {
      id: Date.now(),
      term: searchTerm,
      timestamp: new Date().toISOString()
    };
    
    const updatedSearches = [newSearch, ...recentSearches.filter(s => 
      s.term !== searchTerm
    )].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    // For demo, show info that would navigate to search results
    Swal.fire({
      icon: 'info',
      title: 'Pencarian',
      text: `Mencari laporan dengan kata kunci: "${searchTerm}"`,
      timer: 2000,
      showConfirmButton: false
    });
    
    // In real implementation, would navigate to search results
    // navigate(`/operator/reports/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const navigateToReport = (report) => {
    if (report.type === 'daily') {
      navigate(`/operator/reports/daily?date=${report.date}`);
    } else if (report.type === 'monthly') {
      navigate(`/operator/reports/monthly?month=${report.date}`);
    }
  };

  const applySearchTerm = (term) => {
    // In real implementation, would navigate to search results
    Swal.fire({
      icon: 'info',
      title: 'Pencarian',
      text: `Mencari laporan dengan kata kunci: "${term}"`,
      timer: 2000,
      showConfirmButton: false
    });
    // navigate(`/operator/reports/search?q=${encodeURIComponent(term)}`);
  };

  // Jika operator tidak memiliki rute
  if (!hasRoutes) {
    return (
      <div className="max-w-full px-6 py-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
          <div className="px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Dashboard Laporan
            </h3>
          </div>
          <div className="p-8">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-5 rounded-lg" role="alert">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <p className="font-bold text-lg">Perhatian</p>
              </div>
              <p className="mt-2">Anda belum ditugaskan ke rute manapun. Silakan hubungi administrator untuk mendapatkan akses ke rute.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full px-6 py-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
        <div className="px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Dashboard Laporan
              </h3>
              <p className="text-blue-100 mt-1">Akses dan ekspor data laporan operasional</p>
            </div>
            
            {/* Search Bar */}
            <div className="mt-4 md:mt-0 w-full md:w-auto md:max-w-xs">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Cari laporan..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {/* Summary Stats */}
          {dataLoading ? (
            <div className="flex justify-center items-center h-24 mb-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md overflow-hidden">
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
                        <dd className="text-2xl font-bold text-white">{summaryStats.totalPassengers.toLocaleString('id-ID')}</dd>
                        <dd className="text-xs text-blue-100 mt-1">30 hari terakhir</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md overflow-hidden">
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
                        <dd className="text-2xl font-bold text-white">{summaryStats.totalVehicles.toLocaleString('id-ID')}</dd>
                        <dd className="text-xs text-green-100 mt-1">30 hari terakhir</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-600 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-purple-100 truncate">Total Booking</dt>
                        <dd className="text-2xl font-bold text-white">{summaryStats.totalBookings.toLocaleString('id-ID')}</dd>
                        <dd className="text-xs text-purple-100 mt-1">30 hari terakhir</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md overflow-hidden">
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
                        <dd className="text-2xl font-bold text-white">{formatCurrency(summaryStats.totalRevenue)}</dd>
                        <dd className="text-xs text-red-100 mt-1">30 hari terakhir</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Links & Actions */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Aksi Cepat
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => navigate(`/operator/reports/daily?date=${new Date().toISOString().split('T')[0]}`)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Laporan Hari Ini
                </button>
                <button 
                  onClick={() => navigate(`/operator/reports/daily?date=${new Date(Date.now() - 86400000).toISOString().split('T')[0]}`)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Laporan Kemarin
                </button>
                <button 
                  onClick={handleRefreshData}
                  disabled={dataLoading}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {dataLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Daily Report Card */}
            <div className="md:col-span-1 bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-200 transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Laporan Harian
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-5 flex items-start">
                  <svg className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Laporan ini menampilkan data operasional per jadwal untuk tanggal tertentu dengan informasi detail mengenai aktivitas operasional.</span>
                </p>
                <form onSubmit={handleDailyReport}>
                  <div className="mb-5">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Tanggal
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <input
                        type="date"
                        name="date"
                        id="date"
                        className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        value={dailyDate}
                        onChange={(e) => setDailyDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Lihat Laporan
                    </button>
                    <button
                      type="button"
                      onClick={handleDailyExport}
                      disabled={isLoading}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      )}
                      Export CSV
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Monthly Report Card */}
            <div className="md:col-span-1 bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-green-200 transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-5">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  Laporan Bulanan
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-5 flex items-start">
                  <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Laporan ini menampilkan data bulanan per rute untuk bulan tertentu dengan analisis tren performa operasional.</span>
                </p>
                <form onSubmit={handleMonthlyReport}>
                  <div className="mb-5">
                    <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Bulan
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <input
                        type="month"
                        name="month"
                        id="month"
                        className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        value={monthlyDate}
                        onChange={(e) => setMonthlyDate(e.target.value)}
                        max={new Date().toISOString().slice(0, 7)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Lihat Laporan
                    </button>
                    <button
                      type="button"
                      onClick={handleMonthlyExport}
                      disabled={isLoading}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      )}
                      Export CSV
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Recent Activities */}
            <div className="md:col-span-1 bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-5">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Aktivitas Terbaru
                </h3>
              </div>
              <div className="p-6">
                {recentReports.length === 0 && recentSearches.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="mt-2">Belum ada aktivitas terbaru</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReports.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Laporan Terbaru</h4>
                        <ul className="divide-y divide-gray-200">
                          {recentReports.map(report => (
                            <li key={report.id} className="py-2">
                              <button 
                                onClick={() => navigateToReport(report)}
                                className="w-full text-left hover:bg-gray-50 rounded px-2 py-1 transition-colors duration-150"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-sm text-blue-600">
                                    {report.type === 'daily' ? 'Laporan Harian' : 'Laporan Bulanan'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(report.viewedAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">
                                  {report.type === 'daily' ? formatDate(report.date) : formatMonth(report.date)}
                                </p>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {recentSearches.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Pencarian Terbaru</h4>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map(search => (
                            <button
                              key={search.id}
                              onClick={() => applySearchTerm(search.term)}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-150"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                              </svg>
                              {search.term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Footer with additional info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <p className="text-sm text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Data laporan diperbarui setiap hari pukul 00:00 WIB. Untuk pertanyaan lebih lanjut hubungi tim IT.
              </p>
              
              <div className="mt-4 md:mt-0 flex space-x-4">
                <Link to="/help/reports" className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-150">
                  Bantuan
                </Link>
                <Link to="/operator/reports/settings" className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-150">
                  Pengaturan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIndex;