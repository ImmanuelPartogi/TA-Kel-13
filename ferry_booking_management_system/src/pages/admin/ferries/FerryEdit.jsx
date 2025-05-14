import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import adminFerryService from '../../../services/adminFerry.service';

const FerryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingFerry, setFetchingFerry] = useState(true);
  const [ferry, setFerry] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
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

  useEffect(() => {
    fetchFerry();
  }, [id]);

  const fetchFerry = async () => {
    try {
      const response = await adminFerryService.getFerryDetail(id);
      
      if (response.status === 'success' && response.data) {
        const ferryData = response.data;
        setFerry(ferryData);
        
        // Set form data
        setFormData({
          name: ferryData.name || '',
          registration_number: ferryData.registration_number || '',
          year_built: ferryData.year_built || '',
          last_maintenance_date: ferryData.last_maintenance_date ? ferryData.last_maintenance_date.split('T')[0] : '',
          status: ferryData.status || 'ACTIVE',
          capacity_passenger: ferryData.capacity_passenger || 1,
          capacity_vehicle_motorcycle: ferryData.capacity_vehicle_motorcycle || 0,
          capacity_vehicle_car: ferryData.capacity_vehicle_car || 0,
          capacity_vehicle_bus: ferryData.capacity_vehicle_bus || 0,
          capacity_vehicle_truck: ferryData.capacity_vehicle_truck || 0,
          description: ferryData.description || '',
          image: null
        });
        
        // Set preview if ferry has existing image
        if (ferryData.image) {
          setPreviewImage(adminFerryService.getImageUrl(ferryData.image));
        }
      }
    } catch (error) {
      console.error('Error fetching ferry:', error);
      setErrors({ general: 'Gagal memuat data kapal' });
    } finally {
      setFetchingFerry(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setFormData({ ...formData, [name]: file });
        setRemoveImage(false);
        
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
    
    if (removeImage) {
      data.append('remove_image', '1');
    }

    try {
      const response = await adminFerryService.updateFerry(id, data);
      
      if (response.status === 'success' || response.success) {
        navigate('/admin/ferries');
      } else {
        setErrors({ general: response.message || 'Terjadi kesalahan saat menyimpan data' });
      }
    } catch (error) {
      console.error('Error updating ferry:', error);
      
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

  if (fetchingFerry) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!ferry) {
    return (
      <div className="container px-4 py-6 mx-auto">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p className="font-bold">Error!</p>
          <p>Kapal tidak ditemukan.</p>
          <Link to="/admin/ferries" className="mt-2 inline-block text-red-700 underline">
            Kembali ke daftar kapal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Kapal</h1>
        <Link to="/admin/ferries" className="mt-3 md:mt-0 flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </Link>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
          <div className="font-bold">Terjadi kesalahan:</div>
          <p>{errors.general}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <h2 className="text-lg font-semibold text-blue-600">Form Edit Kapal</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom Kiri */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Kapal <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full rounded-md border ${errors.name ? 'border-red-300' : 'border-gray-300'} shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Registrasi <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="registration_number" 
                    name="registration_number" 
                    value={formData.registration_number}
                    onChange={handleChange}
                    required
                    className={`w-full rounded-md border ${errors.registration_number ? 'border-red-300' : 'border-gray-300'} shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.registration_number && <p className="mt-1 text-sm text-red-600">{errors.registration_number}</p>}
                </div>

                <div>
                  <label htmlFor="year_built" className="block text-sm font-medium text-gray-700 mb-1">
                    Tahun Pembuatan
                  </label>
                  <input 
                    type="number" 
                    id="year_built" 
                    name="year_built" 
                    value={formData.year_built}
                    onChange={handleChange}
                    min="1900" 
                    max={new Date().getFullYear()}
                    className={`w-full rounded-md border ${errors.year_built ? 'border-red-300' : 'border-gray-300'} shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.year_built && <p className="mt-1 text-sm text-red-600">{errors.year_built}</p>}
                </div>

                <div>
                  <label htmlFor="last_maintenance_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Perawatan Terakhir
                  </label>
                  <input 
                    type="date" 
                    id="last_maintenance_date" 
                    name="last_maintenance_date" 
                    value={formData.last_maintenance_date}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="status" 
                    name="status" 
                    value={formData.status}
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
                  <label htmlFor="capacity_passenger" className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasitas Penumpang <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    id="capacity_passenger" 
                    name="capacity_passenger" 
                    value={formData.capacity_passenger}
                    onChange={handleChange}
                    min="1" 
                    required
                    className={`w-full rounded-md border ${errors.capacity_passenger ? 'border-red-300' : 'border-gray-300'} shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.capacity_passenger && <p className="mt-1 text-sm text-red-600">{errors.capacity_passenger}</p>}
                </div>

                <div>
                  <label htmlFor="capacity_vehicle_motorcycle" className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasitas Motor <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    id="capacity_vehicle_motorcycle" 
                    name="capacity_vehicle_motorcycle" 
                    value={formData.capacity_vehicle_motorcycle}
                    onChange={handleChange}
                    min="0" 
                    required
                    className={`w-full rounded-md border ${errors.capacity_vehicle_motorcycle ? 'border-red-300' : 'border-gray-300'} shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.capacity_vehicle_motorcycle && <p className="mt-1 text-sm text-red-600">{errors.capacity_vehicle_motorcycle}</p>}
                </div>

                <div>
                  <label htmlFor="capacity_vehicle_car" className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasitas Mobil <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    id="capacity_vehicle_car" 
                    name="capacity_vehicle_car" 
                    value={formData.capacity_vehicle_car}
                    onChange={handleChange}
                    min="0" 
                    required
                    className={`w-full rounded-md border ${errors.capacity_vehicle_car ? 'border-red-300' : 'border-gray-300'} shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.capacity_vehicle_car && <p className="mt-1 text-sm text-red-600">{errors.capacity_vehicle_car}</p>}
                </div>

                <div>
                  <label htmlFor="capacity_vehicle_bus" className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasitas Bus <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    id="capacity_vehicle_bus" 
                    name="capacity_vehicle_bus" 
                    value={formData.capacity_vehicle_bus}
                    onChange={handleChange}
                    min="0" 
                    required
                    className={`w-full rounded-md border ${errors.capacity_vehicle_bus ? 'border-red-300' : 'border-gray-300'} shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.capacity_vehicle_bus && <p className="mt-1 text-sm text-red-600">{errors.capacity_vehicle_bus}</p>}
                </div>

                <div>
                  <label htmlFor="capacity_vehicle_truck" className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasitas Truk <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    id="capacity_vehicle_truck" 
                    name="capacity_vehicle_truck" 
                    value={formData.capacity_vehicle_truck}
                    onChange={handleChange}
                    min="0" 
                    required
                    className={`w-full rounded-md border ${errors.capacity_vehicle_truck ? 'border-red-300' : 'border-gray-300'} shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.capacity_vehicle_truck && <p className="mt-1 text-sm text-red-600">{errors.capacity_vehicle_truck}</p>}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Foto Kapal</label>
              
              {/* Current/Preview Image */}
              {previewImage && !removeImage && (
                <div className="mb-3">
                  <img src={previewImage} alt={ferry.name} className="h-40 object-cover rounded-md shadow-sm" />
                  {ferry.image && (
                    <div className="mt-2 flex items-center">
                      <input 
                        type="checkbox" 
                        id="remove_image" 
                        checked={removeImage}
                        onChange={(e) => setRemoveImage(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remove_image" className="ml-2 block text-sm text-gray-700">
                        Hapus foto saat ini
                      </label>
                    </div>
                  )}
                </div>
              )}
              
              <input 
                type="file" 
                id="image" 
                name="image" 
                onChange={handleChange}
                accept="image/*"
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500">Unggah foto baru kapal (opsional). Ukuran maksimum 2MB. Format: JPG, PNG.</p>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea 
                id="description" 
                name="description" 
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mt-8">
              <button 
                type="submit" 
                disabled={loading}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FerryEdit;