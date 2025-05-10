import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faShip, faRoute, faCalendarAlt, 
  faArrowRight, faArrowUp, faArrowDown, faTicketAlt 
} from '@fortawesome/free-solid-svg-icons';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import api from '../../services/api';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    users_count: 0,
    ferries_count: 0,
    routes_count: 0,
    active_schedules: 0,
    monthly_bookings: 0,
    monthly_income: 0,
    userGrowth: 0,
    bookingGrowth: 0
  });
  
  const [statusCounts, setStatusCounts] = useState({
    pending_payment_count: 0,
    not_checked_in_count: 0,
    checked_in_count: 0,
    cancelled_count: 0
  });
  
  const [latestBookings, setLatestBookings] = useState([]);
  
  const [chartView, setChartView] = useState('weekly');
  const [chartData, setChartData] = useState({
    weekly_booking_labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    weekly_booking_data: [0, 0, 0, 0, 0, 0, 0],
    monthly_booking_labels: [],
    monthly_booking_data: []
  });
  
  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/operator-panel/dashboard');
        const data = response.data;
        
        setStatsData({
          users_count: data.users_count || 0,
          ferries_count: data.ferries_count || 0,
          routes_count: data.routes_count || 0,
          active_schedules: data.active_schedules || 0,
          monthly_bookings: data.monthly_bookings || 0,
          monthly_income: data.monthly_income || 0,
          userGrowth: data.userGrowth || 0,
          bookingGrowth: data.bookingGrowth || 0
        });
        
        setStatusCounts({
          pending_payment_count: data.pending_payment_count || 0,
          not_checked_in_count: data.not_checked_in_count || 0,
          checked_in_count: data.checked_in_count || 0,
          cancelled_count: data.cancelled_count || 0
        });
        
        setLatestBookings(data.latest_bookings || []);
        
        setChartData({
          weekly_booking_labels: data.weekly_booking_labels || ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
          weekly_booking_data: data.weekly_booking_data || [0, 0, 0, 0, 0, 0, 0],
          monthly_booking_labels: data.monthly_booking_labels || [],
          monthly_booking_data: data.monthly_booking_data || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Chart data configuration
  const lineChartData = {
    labels: chartView === 'weekly' ? chartData.weekly_booking_labels : chartData.monthly_booking_labels,
    datasets: [{
      label: 'Jumlah Booking',
      data: chartView === 'weekly' ? chartData.weekly_booking_data : chartData.monthly_booking_data,
      borderColor: 'rgb(79, 70, 229)',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.3,
      fill: true,
      borderWidth: 2,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: 'rgb(79, 70, 229)',
      pointBorderWidth: 2,
      pointRadius: 4
    }]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(243, 244, 246, 1)',
          borderDash: [5, 5]
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };
  
  // Format number to Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Operator</h1>
        <p className="mt-2 text-gray-600">
          Selamat datang, <span className="font-medium">Operator</span>!
          <span className="text-sm ml-2 text-gray-500">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* User Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-blue-500 bg-opacity-10">
                <FontAwesomeIcon icon={faUsers} className="text-xl text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Pengguna</p>
                <div className="flex items-end">
                  <p className="text-2xl font-bold text-gray-800">{statsData.users_count}</p>
                  {statsData.userGrowth !== 0 && (
                    <p className={`ml-2 text-xs ${statsData.userGrowth > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                      <FontAwesomeIcon icon={statsData.userGrowth > 0 ? faArrowUp : faArrowDown} className="mr-1" />
                      {Math.abs(statsData.userGrowth)}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-2">
            <Link to="/operator/users" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              Lihat detail <FontAwesomeIcon icon={faArrowRight} className="ml-1 text-xs" />
            </Link>
          </div>
        </div>

        {/* Ferry Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-green-500 bg-opacity-10">
                <FontAwesomeIcon icon={faShip} className="text-xl text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Kapal</p>
                <div className="flex items-end">
                  <p className="text-2xl font-bold text-gray-800">{statsData.ferries_count}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-2">
            <Link to="/operator/ferries" className="text-sm text-green-600 hover:text-green-800 flex items-center">
              Lihat detail <FontAwesomeIcon icon={faArrowRight} className="ml-1 text-xs" />
            </Link>
          </div>
        </div>

        {/* Routes Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-purple-500 bg-opacity-10">
                <FontAwesomeIcon icon={faRoute} className="text-xl text-purple-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Rute</p>
                <div className="flex items-end">
                  <p className="text-2xl font-bold text-gray-800">{statsData.routes_count}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-2">
            <Link to="/operator/routes" className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
              Lihat detail <FontAwesomeIcon icon={faArrowRight} className="ml-1 text-xs" />
            </Link>
          </div>
        </div>

        {/* Active Schedules Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-amber-500 bg-opacity-10">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-xl text-amber-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Jadwal Aktif</p>
                <div className="flex items-end">
                  <p className="text-2xl font-bold text-gray-800">{statsData.active_schedules}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-2">
            <Link to="/operator/schedules" className="text-sm text-amber-600 hover:text-amber-800 flex items-center">
              Lihat detail <FontAwesomeIcon icon={faArrowRight} className="ml-1 text-xs" />
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue and Booking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Bookings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Booking Bulan Ini</h2>
          </div>
          <div className="px-6 py-8 flex flex-col items-center justify-center">
            <div className="text-center mb-2">
              <span className="text-4xl font-bold text-indigo-700">{statsData.monthly_bookings}</span>
            </div>
            <p className="text-gray-500 mb-6">Total pemesanan</p>

            <div className="w-full p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Pendapatan Bulan Ini</h3>
              <div className="text-center">
                <span className="text-2xl font-bold text-green-600">
                  {formatRupiah(statsData.monthly_income)}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs text-gray-500">Dibandingkan bulan lalu</span>
            {typeof statsData.bookingGrowth !== 'undefined' ? (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statsData.bookingGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <FontAwesomeIcon icon={statsData.bookingGrowth >= 0 ? faArrowUp : faArrowDown} className="text-xs mr-1" />
                {Math.abs(statsData.bookingGrowth)}%
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                -
              </span>
            )}
          </div>
        </div>

        {/* Weekly Booking Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden lg:col-span-2">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Booking 7 Hari Terakhir</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setChartView('weekly')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  chartView === 'weekly' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Minggu Ini
              </button>
              <button 
                onClick={() => setChartView('monthly')}
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  chartView === 'monthly' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Bulan Ini
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="h-72">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Status and Latest Bookings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Status Booking</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Waiting for Payment */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500 mr-3"></div>
                  <span className="text-sm text-gray-700">Menunggu Pembayaran</span>
                </div>
                <span className="font-semibold text-gray-800">{statusCounts.pending_payment_count}</span>
              </div>

              {/* Not Checked In */}
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-yellow-500 mr-3"></div>
                  <span className="text-sm text-gray-700">Belum Check-in</span>
                </div>
                <span className="font-semibold text-gray-800">{statusCounts.not_checked_in_count}</span>
              </div>

              {/* Checked In */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                  <span className="text-sm text-gray-700">Sudah Check-in</span>
                </div>
                <span className="font-semibold text-gray-800">{statusCounts.checked_in_count}</span>
              </div>

              {/* Cancelled */}
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-red-500 mr-3"></div>
                  <span className="text-sm text-gray-700">Dibatalkan</span>
                </div>
                <span className="font-semibold text-gray-800">{statusCounts.cancelled_count}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
            <Link to="/operator/bookings" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
              Lihat semua booking <FontAwesomeIcon icon={faArrowRight} className="ml-1 text-xs" />
            </Link>
          </div>
        </div>

        {/* Latest Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden lg:col-span-2">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Booking Terbaru</h2>
            <Link to="/operator/bookings" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
              Lihat Semua
            </Link>
          </div>
          <div className="p-3">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengguna
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {latestBookings.length > 0 ? (
                    latestBookings.map((booking, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-indigo-600">
                          {booking.booking_code}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {booking.user?.name || 'Pengguna'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatDate(booking.booking_date)}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-700">
                          {formatRupiah(booking.total_amount)}
                        </td>
                        <td className="py-3 px-4">
                          {(() => {
                            const status = booking.status || 'PENDING';
                            const statusClassMap = {
                              'PENDING': 'bg-blue-100 text-blue-800',
                              'CONFIRMED': 'bg-green-100 text-green-800',
                              'CANCELLED': 'bg-red-100 text-red-800',
                              'COMPLETED': 'bg-gray-100 text-gray-800',
                            };
                            const statusClass = statusClassMap[status] || 'bg-gray-100 text-gray-800';
                            
                            return (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass}`}>
                                {status}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <FontAwesomeIcon icon={faTicketAlt} className="text-2xl text-gray-300 mb-2" />
                          <p>Belum ada data booking terbaru</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;