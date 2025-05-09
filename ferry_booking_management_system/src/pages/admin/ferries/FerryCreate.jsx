import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import Swal from 'sweetalert2';

const FerryCreate = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const [ferry, setFerry] = useState({
    name: '',
    registration_number: '',
    year_built: '',
    last_maintenance_date: '',
    status: 'ACTIVE',
    capacity_passenger: 0,
    capacity_vehicle_motorcycle: 0,
    capacity_vehicle_car: 0,
    capacity_vehicle_bus: 0,
    capacity_vehicle_truck: 0,
    description: ''
  });
  
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFerry(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    
    // Append ferry data to FormData
    Object.keys(ferry).forEach(key => {
      formData.append(key, ferry[key]);
    });
    
    // Append image if exists
    if (image) {
      formData.append('image', image);
    }
    
    try {
      await api.post('/admin-panel/ferries', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Kapal baru berhasil ditambahkan.'
      }).then(() => {
        navigate('/admin/ferries');
      });
    } catch (error) {
      console.error('Error adding ferry:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Terjadi kesalahan saat menambahkan kapal baru.'
        });
      }
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tambah Kapal Baru</h1>
        <Link to="/admin/ferries" className="mt-3 md:mt-0 flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </Link>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
          <div className="font-bold">Terjadi kesalahan:</div>
          <ul className="list-disc ml-6">
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h2 className="text-lg font-semibold text-blue-600">Form Kapal</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom Kiri */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Kapal <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={ferry.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 mb-1">Nomor Registrasi <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="registration_number"
                    name="registration_number"
                    value={ferry.registration_number}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="year_built" className="block text-sm font-medium text-gray-700 mb-1">Tahun Pembuatan</label>
                  <input
                    type="number"
                    id="year_built"
                    name="year_built"
                    value={ferry.year_built}
                    onChange={handleChange}
                    min="1900"
                    max={currentYear}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="last_maintenance_date" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Perawatan Terakhir</label>
                  <input
                    type="date"
                    id="last_maintenance_date"
                    name="last_maintenance_date"
                    value={ferry.last_maintenance_date}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                  <select
                    id="status"
                    name="status"
                    value={ferry.status}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="MAINTENANCE">Perawatan</option>
                    <option value="INACTIVE">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="capacity_passenger" className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Penumpang <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    id="capacity_passenger"
                    name="capacity_passenger"
                    value={ferry.capacity_passenger}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="capacity_vehicle_motorcycle" className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Motor <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    id="capacity_vehicle_motorcycle"
                    name="capacity_vehicle_motorcycle"
                    value={ferry.capacity_vehicle_motorcycle}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="capacity_vehicle_car" className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Mobil <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    id="capacity_vehicle_car"
                    name="capacity_vehicle_car"
                    value={ferry.capacity_vehicle_car}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="capacity_vehicle_bus" className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Bus <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    id="capacity_vehicle_bus"
                    name="capacity_vehicle_bus"
                    value={ferry.capacity_vehicle_bus}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="capacity_vehicle_truck" className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Truk <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    id="capacity_vehicle_truck"
                    name="capacity_vehicle_truck"
                    value={ferry.capacity_vehicle_truck}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Foto Kapal</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500">Unggah foto kapal (opsional). Ukuran maksimum 2MB. Format: JPG, PNG.</p>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={ferry.description}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-base font-medium rounded-md text-white ${
                  isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                } transition-colors duration-200`}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Kapal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FerryCreate;