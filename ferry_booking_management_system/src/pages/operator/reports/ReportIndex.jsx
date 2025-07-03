import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const ReportIndex = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyDate, setMonthlyDate] = useState(new Date().toISOString().slice(0, 7));
  const [isLoading, setIsLoading] = useState(false);

  // Simulasi loading saat ekspor
  const simulateLoading = (callback) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      callback();
    }, 600);
  };

  const handleDailyReport = (e) => {
    e.preventDefault();
    navigate(`/operator/reports/daily?date=${dailyDate}`);
  };

  const handleDailyExport = () => {
    simulateLoading(() => {
      navigate(`/operator/reports/daily?date=${dailyDate}&export=csv`);
    });
  };

  const handleMonthlyReport = (e) => {
    e.preventDefault();
    navigate(`/operator/reports/monthly?month=${monthlyDate}`);
  };

  const handleMonthlyExport = () => {
    simulateLoading(() => {
      navigate(`/operator/reports/monthly?month=${monthlyDate}&export=csv`);
    });
  };

  return (
    <div className="max-w-full px-6 py-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
        <div className="px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Dashboard Laporan
          </h3>
          <p className="text-blue-100 mt-1">Akses dan ekspor data laporan operasional</p>
        </div>

        {/* Warning Alert - hanya muncul jika pengguna tidak memiliki rute yang ditugaskan */}
        {(!user?.assigned_routes ||
          typeof user?.assigned_routes !== 'object' ||
          Object.keys(user?.assigned_routes).length === 0) && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-5 mx-8 mt-6 mb-2 rounded-xl shadow-lg animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-yellow-800">Perhatian</h3>
                  <p className="mt-1 text-sm text-yellow-700">Anda belum memiliki rute yang ditugaskan. Silakan hubungi administrator untuk mengatur rute yang dapat Anda akses.</p>
                </div>
              </div>
            </div>
          )}

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Daily Report Card */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-200 transform hover:-translate-y-1">
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
                   </div>
                </form>
              </div>
            </div>

            {/* Monthly Report Card */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-green-200 transform hover:-translate-y-1">
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
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Footer with additional info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Data laporan diperbarui setiap hari pukul 00:00 WIB. Untuk pertanyaan lebih lanjut hubungi tim IT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIndex;