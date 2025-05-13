// src/pages/operator/reports/ReportIndex.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportIndex = () => {
  const navigate = useNavigate();
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyDate, setMonthlyDate] = useState(new Date().toISOString().slice(0, 7));

  const handleDailyReport = (e) => {
    e.preventDefault();
    navigate(`/operator/reports/daily?date=${dailyDate}`);
  };

  const handleDailyExport = () => {
    navigate(`/operator/reports/daily?date=${dailyDate}&export=csv`);
  };

  const handleMonthlyReport = (e) => {
    e.preventDefault();
    navigate(`/operator/reports/monthly?month=${monthlyDate}`);
  };

  const handleMonthlyExport = () => {
    navigate(`/operator/reports/monthly?month=${monthlyDate}&export=csv`);
  };

  return (
    <div className="max-w-full px-4 py-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Laporan</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Report Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Laporan Harian</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Laporan ini menampilkan data operasional per jadwal untuk tanggal tertentu.
                </p>
                <form onSubmit={handleDailyReport}>
                  <div className="mb-4">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Pilih Tanggal
                    </label>
                    <input
                      type="date"
                      name="date"
                      id="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={dailyDate}
                      onChange={(e) => setDailyDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Lihat Laporan
                    </button>
                    <button
                      type="button"
                      onClick={handleDailyExport}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export CSV
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Monthly Report Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
              <div className="bg-green-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Laporan Bulanan</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Laporan ini menampilkan data bulanan per rute untuk bulan tertentu.
                </p>
                <form onSubmit={handleMonthlyReport}>
                  <div className="mb-4">
                    <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                      Pilih Bulan
                    </label>
                    <input
                      type="month"
                      name="month"
                      id="month"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={monthlyDate}
                      onChange={(e) => setMonthlyDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Lihat Laporan
                    </button>
                    <button
                      type="button"
                      onClick={handleMonthlyExport}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export CSV
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIndex;