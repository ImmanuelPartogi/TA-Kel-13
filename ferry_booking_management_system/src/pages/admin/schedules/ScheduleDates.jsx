import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminScheduleService as scheduleService } from '../../../services/api'; 
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ScheduleDates = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [scheduleDates, setScheduleDates] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    total: 0,
    perPage: 10,
    lastPage: 1 
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dateToEdit, setDateToEdit] = useState(null);

  // Add date form data
  const [addFormData, setAddFormData] = useState({
    date_type: 'single',
    date: '',
    end_date: '',
    status: 'ACTIVE',
    status_reason: '',
    status_expiry_date: ''
  });

  // Edit date form data
  const [editFormData, setEditFormData] = useState({
    id: '',
    status: 'ACTIVE',
    status_reason: '',
    status_expiry_date: ''
  });

  // Fetch data when component mounts
  useEffect(() => {
    fetchData();
  }, [pagination.currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch schedule details
      const scheduleResponse = await scheduleService.getSchedule(id);
      setSchedule(scheduleResponse.data.data);

      // Fetch schedule dates with pagination
      const scheduleDatesResponse = await scheduleService.getScheduleDates(id, {
        page: pagination.currentPage
      });
      
      setScheduleDates(scheduleDatesResponse.data.data);
      setPagination({
        currentPage: scheduleDatesResponse.data.current_page,
        total: scheduleDatesResponse.data.total,
        perPage: scheduleDatesResponse.data.per_page,
        lastPage: scheduleDatesResponse.data.last_page
      });
    } catch (err) {
      console.error('Error fetching schedule data:', err);
      toast.error('Gagal memuat data jadwal');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change for pagination
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  // Handle add date form change
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If date_type changes, handle visibility of end date
    if (name === 'date_type' && value === 'single') {
      setAddFormData(prev => ({
        ...prev,
        end_date: ''
      }));
    }

    // If status changes, handle visibility of reason and expiry date
    if (name === 'status') {
      if (value === 'ACTIVE') {
        setAddFormData(prev => ({
          ...prev,
          status_reason: '',
          status_expiry_date: ''
        }));
      }
    }
  };

  // Handle edit date form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add date form submit
  const handleAddDateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (addFormData.date_type === 'single') {
        // Add single date
        await scheduleService.addScheduleDate(id, {
          date: addFormData.date,
          status: addFormData.status,
          status_reason: addFormData.status_reason,
          status_expiry_date: addFormData.status_expiry_date
        });
      } else {
        // Add date range
        await scheduleService.addScheduleDateRange(id, {
          start_date: addFormData.date,
          end_date: addFormData.end_date,
          status: addFormData.status,
          status_reason: addFormData.status_reason,
          status_expiry_date: addFormData.status_expiry_date
        });
      }
      
      toast.success('Tanggal jadwal berhasil ditambahkan');
      setShowAddModal(false);
      fetchData();
      
      // Reset form data
      setAddFormData({
        date_type: 'single',
        date: '',
        end_date: '',
        status: 'ACTIVE',
        status_reason: '',
        status_expiry_date: ''
      });
    } catch (err) {
      console.error('Error adding schedule date:', err);
      toast.error('Gagal menambahkan tanggal jadwal');
    }
  };

  // Handle edit date form submit
  const handleEditDateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await scheduleService.updateScheduleDate(id, dateToEdit.id, {
        status: editFormData.status,
        status_reason: editFormData.status_reason,
        status_expiry_date: editFormData.status_expiry_date
      });
      
      toast.success('Status tanggal jadwal berhasil diperbarui');
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      console.error('Error updating schedule date:', err);
      toast.error('Gagal memperbarui tanggal jadwal');
    }
  };

  // Handle delete date
  const handleDeleteDate = async (dateId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tanggal jadwal ini?')) {
      try {
        await scheduleService.deleteScheduleDate(id, dateId);
        toast.success('Tanggal jadwal berhasil dihapus');
        fetchData();
      } catch (err) {
        console.error('Error deleting schedule date:', err);
        toast.error('Gagal menghapus tanggal jadwal');
      }
    }
  };

  // Open edit modal with date data
  const openEditModal = (date) => {
    setDateToEdit(date);
    setEditFormData({
      id: date.id,
      status: date.status,
      status_reason: date.status_reason || '',
      status_expiry_date: date.status_expiry_date ? formatDateTimeForInput(date.status_expiry_date) : ''
    });
    setShowEditModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'd MMM yyyy', { locale: id });
    } catch {
      return dateString;
    }
  };

  // Format date and time for input
  const formatDateTimeForInput = (dateTimeString) => {
    try {
      return format(new Date(dateTimeString), "yyyy-MM-dd'T'HH:mm");
    } catch {
      return '';
    }
  };

  // Get day names from days string
  const getDayNames = (daysString) => {
    if (!daysString) return '';
    
    const days = daysString.split(',');
    const dayNames = {
      1: 'Senin',
      2: 'Selasa',
      3: 'Rabu',
      4: 'Kamis',
      5: 'Jumat',
      6: 'Sabtu',
      7: 'Minggu'
    };
    
    return days.map(day => dayNames[day] || '').join(', ');
  };

  // Calculate percentage for progress bar
  const calculatePercentage = (count, capacity) => {
    if (!capacity || capacity <= 0) return 0;
    return Math.min(100, Math.round((count / capacity) * 100));
  };

  if (loading && !schedule) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Kelola Tanggal Jadwal</h1>
        <Link
          to="/admin/schedules"
          className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 transition ease-in-out duration-150"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali
        </Link>
      </div>

      {/* Schedule Information Card */}
      {schedule && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-white">Informasi Jadwal</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dl className="grid grid-cols-4 md:grid-cols-3 gap-x-4 gap-y-2">
                  <dt className="col-span-1 text-sm font-medium text-gray-500">Rute:</dt>
                  <dd className="col-span-3 md:col-span-2 text-sm text-gray-900">
                    {schedule.route.origin} - {schedule.route.destination}
                  </dd>

                  <dt className="col-span-1 text-sm font-medium text-gray-500">Kapal:</dt>
                  <dd className="col-span-3 md:col-span-2 text-sm text-gray-900">
                    {schedule.ferry.name}
                  </dd>

                  <dt className="col-span-1 text-sm font-medium text-gray-500">Waktu:</dt>
                  <dd className="col-span-3 md:col-span-2 text-sm text-gray-900">
                    {schedule.departure_time} - {schedule.arrival_time}
                  </dd>
                </dl>
              </div>
              <div>
                <dl className="grid grid-cols-4 md:grid-cols-3 gap-x-4 gap-y-2">
                  <dt className="col-span-1 text-sm font-medium text-gray-500">Hari Operasi:</dt>
                  <dd className="col-span-3 md:col-span-2 text-sm text-gray-900">
                    {getDayNames(schedule.days)}
                  </dd>

                  <dt className="col-span-1 text-sm font-medium text-gray-500">Status:</dt>
                  <dd className="col-span-3 md:col-span-2 text-sm text-gray-900">
                    {schedule.status === 'ACTIVE' && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Aktif
                      </span>
                    )}
                    {schedule.status === 'CANCELLED' && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Dibatalkan
                      </span>
                    )}
                    {schedule.status === 'DELAYED' && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Ditunda
                      </span>
                    )}
                    {schedule.status === 'FULL' && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Penuh
                      </span>
                    )}
                    {schedule.status === 'INACTIVE' && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Tidak Aktif
                      </span>
                    )}
                  </dd>

                  <dt className="col-span-1 text-sm font-medium text-gray-500">Kapasitas:</dt>
                  <dd className="col-span-3 md:col-span-2 text-sm text-gray-900">
                    <div className="flex flex-col space-y-1">
                      <span>Penumpang: {schedule.ferry.capacity_passenger}</span>
                      <span>Motor: {schedule.ferry.capacity_vehicle_motorcycle}</span>
                      <span>Mobil: {schedule.ferry.capacity_vehicle_car}</span>
                      <span>Bus: {schedule.ferry.capacity_vehicle_bus}</span>
                      <span>Truk: {schedule.ferry.capacity_vehicle_truck}</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Dates Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-blue-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Tanggal Jadwal</h2>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setShowAddModal(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tambah Tanggal
          </button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Penumpang
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kendaraan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alasan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Terakhir Diperbarui
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scheduleDates.length > 0 ? (
                    scheduleDates.map((date) => (
                      <tr key={date.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(date.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="mr-2">
                              {date.passenger_count} / {schedule.ferry.capacity_passenger}
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${calculatePercentage(date.passenger_count, schedule.ferry.capacity_passenger)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center justify-between">
                              <span>Motor:</span>
                              <span className="font-medium">
                                {date.motorcycle_count} / {schedule.ferry.capacity_vehicle_motorcycle}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Mobil:</span>
                              <span className="font-medium">
                                {date.car_count} / {schedule.ferry.capacity_vehicle_car}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Bus:</span>
                              <span className="font-medium">
                                {date.bus_count} / {schedule.ferry.capacity_vehicle_bus}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Truk:</span>
                              <span className="font-medium">
                                {date.truck_count} / {schedule.ferry.capacity_vehicle_truck}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {date.status === 'ACTIVE' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Tersedia
                            </span>
                          )}
                          {date.status === 'INACTIVE' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Tidak Tersedia
                            </span>
                          )}
                          {date.status === 'FULL' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Penuh
                            </span>
                          )}
                          {date.status === 'CANCELLED' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Dibatalkan
                            </span>
                          )}
                          {date.status === 'DEPARTED' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                              Sudah Berangkat
                            </span>
                          )}
                          {date.status === 'WEATHER_ISSUE' && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Masalah Cuaca
                            </span>
                          )}

                          {date.modified_by_schedule && (
                            <span className="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-800 text-white">
                              Diubah Oleh Jadwal
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {date.status_reason || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {date.updated_at ? formatDate(date.updated_at) + ' ' + format(new Date(date.updated_at), 'HH:mm') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-1 justify-end">
                            {/* Edit Button */}
                            <button
                              type="button"
                              className="text-white bg-blue-600 hover:bg-blue-700 rounded-full p-1.5 inline-flex items-center justify-center"
                              onClick={() => openEditModal(date)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              className="text-white bg-red-600 hover:bg-red-700 rounded-full p-1.5 inline-flex items-center justify-center"
                              onClick={() => handleDeleteDate(date.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center justify-center py-8">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p>Tidak ada data tanggal</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {scheduleDates.length > 0 && (
            <div className="mt-6 flex justify-center">
              <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
                {pagination.currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                
                {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pagination.currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                {pagination.currentPage < pagination.lastPage && (
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Add Date Modal */}
      {showAddModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white rounded-lg max-w-lg w-full p-6 mx-4 shadow-xl transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Tambah Tanggal Jadwal</h3>
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowAddModal(false)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddDateSubmit}>
              {/* Tipe Penambahan Tanggal */}
              <div className="mb-4">
                <label htmlFor="date_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Penambahan <span className="text-red-500">*</span>
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  id="date_type"
                  name="date_type"
                  value={addFormData.date_type}
                  onChange={handleAddFormChange}
                  required
                >
                  <option value="single">Tanggal Tunggal</option>
                  <option value="range">Rentang Tanggal</option>
                </select>
              </div>

              {/* Informasi Hari Operasi */}
              {schedule && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Hari Operasi:</span> {getDayNames(schedule.days)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    <i>Catatan: Jika menggunakan rentang tanggal, hanya tanggal yang sesuai dengan hari operasi yang akan dibuat.</i>
                  </p>
                </div>
              )}

              {/* Tanggal Awal */}
              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  id="date"
                  name="date"
                  value={addFormData.date}
                  onChange={handleAddFormChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Tanggal Akhir (untuk rentang) */}
              {addFormData.date_type === 'range' && (
                <div className="mb-4">
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Akhir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    id="end_date"
                    name="end_date"
                    value={addFormData.end_date}
                    onChange={handleAddFormChange}
                    required={addFormData.date_type === 'range'}
                    min={addFormData.date || new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}

              {/* Status */}
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  id="status"
                  name="status"
                  value={addFormData.status}
                  onChange={handleAddFormChange}
                  required
                >
                  <option value="ACTIVE">Tersedia</option>
                  <option value="INACTIVE">Tidak Tersedia</option>
                  <option value="CANCELLED">Dibatalkan</option>
                  <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                </select>
              </div>

              {/* Alasan Status */}
              {addFormData.status !== 'ACTIVE' && (
                <div className="mb-4">
                  <label htmlFor="status_reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan Status
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    id="status_reason"
                    name="status_reason"
                    value={addFormData.status_reason}
                    onChange={handleAddFormChange}
                  />
                </div>
              )}

              {/* Tanggal Berakhir Status */}
              {addFormData.status === 'WEATHER_ISSUE' && (
                <div className="mb-4">
                  <label htmlFor="status_expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Berakhir Status
                  </label>
                  <input
                    type="datetime-local"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    id="status_expiry_date"
                    name="status_expiry_date"
                    value={addFormData.status_expiry_date}
                    onChange={handleAddFormChange}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Isi jika status akan berakhir pada waktu tertentu. Khusus untuk status Masalah Cuaca (WEATHER_ISSUE).
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Date Modal */}
      {showEditModal && dateToEdit && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-white rounded-lg max-w-lg w-full p-6 mx-4 shadow-xl transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Tanggal Jadwal</h3>
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowEditModal(false)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditDateSubmit}>
              <p className="mb-4 text-gray-700 font-medium">
                Tanggal: {formatDate(dateToEdit.date)}
              </p>
              
              <div className="mb-4">
                <label htmlFor="edit_status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  id="edit_status"
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditFormChange}
                  required
                >
                  <option value="ACTIVE">Tersedia</option>
                  <option value="INACTIVE">Tidak Tersedia</option>
                  <option value="FULL">Penuh</option>
                  <option value="CANCELLED">Dibatalkan</option>
                  <option value="DEPARTED">Sudah Berangkat</option>
                  <option value="WEATHER_ISSUE">Masalah Cuaca</option>
                </select>
              </div>
              
              {editFormData.status !== 'ACTIVE' && (
                <div className="mb-4">
                  <label htmlFor="edit_status_reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan Status
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    id="edit_status_reason"
                    name="status_reason"
                    value={editFormData.status_reason}
                    onChange={handleEditFormChange}
                  />
                </div>
              )}
              
              {editFormData.status === 'WEATHER_ISSUE' && (
                <div className="mb-4">
                  <label htmlFor="edit_status_expiry_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Berakhir Status
                  </label>
                  <input
                    type="datetime-local"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    id="edit_status_expiry_date"
                    name="status_expiry_date"
                    value={editFormData.status_expiry_date}
                    onChange={handleEditFormChange}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Isi jika status akan berakhir pada waktu tertentu. Khusus untuk status Masalah Cuaca (WEATHER_ISSUE).
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleDates;