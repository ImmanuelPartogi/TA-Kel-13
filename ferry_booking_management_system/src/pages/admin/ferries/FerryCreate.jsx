import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminFerryService from '../../../services/adminFerry.service';

const FerryCreate = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    registration_number: '',
    year_built: '',
    last_maintenance_date: '',
    status: 'ACTIVE',
    capacity_passenger: 1,
    capacity_vehicle_motorcycle: 0,
    capacity_vehicle_car: 0,
    capacity_vehicle_bus: 0,
    capacity_vehicle_truck: 0,
    description: '',
    image: null
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setFormData({ ...formData, [name]: file });
        
        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate form
    const validation = adminFerryService.validateFerryForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await adminFerryService.createFerry(data);
      
      if (response.status === 'success' || response.success) {
        navigate('/admin/ferries');
      } else {
        setErrors({ general: response.message || 'Terjadi kesalahan saat menyimpan data' });
      }
    } catch (error) {
      console.error('Error creating ferry:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Terjadi kesalahan saat menyimpan data' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Mengubah objek errors ke array untuk tampilan yang konsisten dengan RouteCreate
  const errorMessages = errors.general 
    ? [errors.general] 
    : Object.values(errors).filter(error => error !== undefined);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header Section - Selaras dengan RouteCreate */}
      <div className="page-header p-6 text-white relative bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <i className="fas fa-plus-circle mr-3 text-blue-200"></i> Tambah Kapal Baru
            </h1>
            <p className="mt-1 text-blue-100">Lengkapi form berikut untuk menambahkan kapal baru</p>
          </div>
          <div>
            <Link to="/admin/ferries"
              className="bg-white hover:bg-blue-700 hover:text-white text-blue-700 font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-md">
              <i className="fas fa-arrow-left mr-2"></i> Kembali ke Daftar
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Error Messages */}
        {errorMessages.length > 0 && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
            <div className="font-bold">Terjadi kesalahan:</div>
            <ul className="list-disc ml-6">
              {errorMessages.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Informasi Dasar Kapal */}
          <div className="mb-6 p-5 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Informasi Dasar Kapal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kapal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-ship text-gray-400"></i>
                  </div>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan nama kapal"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Registrasi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-id-card text-gray-400"></i>
                  </div>
                  <input 
                    type="text" 
                    id="registration_number" 
                    name="registration_number" 
                    value={formData.registration_number}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan nomor registrasi"
                  />
                </div>
                {errors.registration_number && <p className="mt-1 text-xs text-red-600">{errors.registration_number}</p>}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-check-circle text-gray-400"></i>
                  </div>
                  <select 
                    id="status" 
                    name="status" 
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="MAINTENANCE">Perawatan</option>
                    <option value="INACTIVE">Tidak Aktif</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="year_built" className="block text-sm font-medium text-gray-700 mb-1">
                  Tahun Pembuatan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-calendar text-gray-400"></i>
                  </div>
                  <input 
                    type="number" 
                    id="year_built" 
                    name="year_built" 
                    value={formData.year_built}
                    onChange={handleChange}
                    min="1900" 
                    max={new Date().getFullYear()}
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan tahun pembuatan"
                  />
                </div>
                {errors.year_built && <p className="mt-1 text-xs text-red-600">{errors.year_built}</p>}
              </div>

              <div>
                <label htmlFor="last_maintenance_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Perawatan Terakhir
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-tools text-gray-400"></i>
                  </div>
                  <input 
                    type="date" 
                    id="last_maintenance_date" 
                    name="last_maintenance_date" 
                    value={formData.last_maintenance_date}
                    onChange={handleChange}
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kapasitas Kapal */}
          <div className="mb-6 p-5 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Kapasitas Kapal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="capacity_passenger" className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasitas Penumpang <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-users text-gray-400"></i>
                  </div>
                  <input 
                    type="number" 
                    id="capacity_passenger" 
                    name="capacity_passenger" 
                    value={formData.capacity_passenger}
                    onChange={handleChange}
                    min="1" 
                    required
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan kapasitas penumpang"
                  />
                </div>
                {errors.capacity_passenger && <p className="mt-1 text-xs text-red-600">{errors.capacity_passenger}</p>}
              </div>

              <div>
                <label htmlFor="capacity_vehicle_motorcycle" className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasitas Motor <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-motorcycle text-gray-400"></i>
                  </div>
                  <input 
                    type="number" 
                    id="capacity_vehicle_motorcycle" 
                    name="capacity_vehicle_motorcycle" 
                    value={formData.capacity_vehicle_motorcycle}
                    onChange={handleChange}
                    min="0" 
                    required
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan kapasitas motor"
                  />
                </div>
                {errors.capacity_vehicle_motorcycle && <p className="mt-1 text-xs text-red-600">{errors.capacity_vehicle_motorcycle}</p>}
              </div>

              <div>
                <label htmlFor="capacity_vehicle_car" className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasitas Mobil <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-car text-gray-400"></i>
                  </div>
                  <input 
                    type="number" 
                    id="capacity_vehicle_car" 
                    name="capacity_vehicle_car" 
                    value={formData.capacity_vehicle_car}
                    onChange={handleChange}
                    min="0" 
                    required
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan kapasitas mobil"
                  />
                </div>
                {errors.capacity_vehicle_car && <p className="mt-1 text-xs text-red-600">{errors.capacity_vehicle_car}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="capacity_vehicle_bus" className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasitas Bus <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-bus text-gray-400"></i>
                  </div>
                  <input 
                    type="number" 
                    id="capacity_vehicle_bus" 
                    name="capacity_vehicle_bus" 
                    value={formData.capacity_vehicle_bus}
                    onChange={handleChange}
                    min="0" 
                    required
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan kapasitas bus"
                  />
                </div>
                {errors.capacity_vehicle_bus && <p className="mt-1 text-xs text-red-600">{errors.capacity_vehicle_bus}</p>}
              </div>

              <div>
                <label htmlFor="capacity_vehicle_truck" className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasitas Truk <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-truck text-gray-400"></i>
                  </div>
                  <input 
                    type="number" 
                    id="capacity_vehicle_truck" 
                    name="capacity_vehicle_truck" 
                    value={formData.capacity_vehicle_truck}
                    onChange={handleChange}
                    min="0" 
                    required
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan kapasitas truk"
                  />
                </div>
                {errors.capacity_vehicle_truck && <p className="mt-1 text-xs text-red-600">{errors.capacity_vehicle_truck}</p>}
              </div>
            </div>
          </div>

          {/* Deskripsi & Foto Kapal */}
          <div className="mb-6 p-5 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Deskripsi & Foto Kapal</h2>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-info-circle text-gray-400"></i>
                </div>
                <textarea 
                  id="description" 
                  name="description" 
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Deskripsi kapal (opsional)"
                />
              </div>
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">Foto Kapal</label>
              
              {/* Image preview */}
              {previewImage && (
                <div className="mb-4">
                  <div className="relative group">
                    <img src={previewImage} alt="Preview" className="h-56 w-full object-cover rounded-lg shadow-md" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center rounded-lg">
                      <button 
                        type="button" 
                        onClick={() => setPreviewImage(null)}
                        className="bg-red-600 text-white rounded-full p-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* File upload modern */}
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition duration-200">
                <div className="space-y-1 text-center">
                  <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-2"></i>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="image" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none transition duration-200">
                      <span>Upload foto</span>
                      <input 
                        id="image" 
                        name="image" 
                        type="file" 
                        className="sr-only"
                        onChange={handleChange}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">atau drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons - Diselaraskan dengan style RouteCreate */}
          <div className="flex justify-end mt-8 space-x-4">
            <Link 
              to="/admin/ferries"
              className="px-6 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <i className="fas fa-times mr-2"></i> Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Menyimpan...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i> Simpan Kapal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FerryCreate;