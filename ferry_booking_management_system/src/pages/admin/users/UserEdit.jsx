import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import adminUserService from '../../../services/adminUser.service';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birthday: '',
    id_type: '',
    id_number: '',
    address: '',
    password: '',
    password_confirmation: '',
    bank_account_name: '',
    bank_name: '',
    bank_account_number: ''
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await adminUserService.getUserDetail(id);
      setFormData({
        ...response.data,
        password: '',
        password_confirmation: '',
        date_of_birthday: response.data.date_of_birthday ? response.data.date_of_birthday.split('T')[0] : ''
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Gagal memuat data pengguna'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrors({});

      const response = await adminUserService.updateUser(id, formData);
      if (response.status === 'success') {
        setAlert({
          show: true,
          type: 'success',
          message: 'Data pengguna berhasil diperbarui'
        });
        setTimeout(() => {
          navigate(`/admin/users/${id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Gagal memperbarui data pengguna'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await adminUserService.deleteUser(id);
      if (response.status === 'success') {
        setAlert({
          show: true,
          type: 'success',
          message: 'Pengguna berhasil dihapus. Anda akan diarahkan ke halaman daftar.'
        });
        setTimeout(() => {
          navigate('/admin/users');
        }, 2000);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Terjadi kesalahan saat menghapus pengguna'
      });
    }
    setShowDeleteModal(false);
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500";
    return errors[fieldName]
      ? `${baseClass} border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500`
      : `${baseClass} border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-blue-800 via-blue-600 to-blue-500 p-8 text-white">
          <div className="flex items-start">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mr-4">
              <i className="fas fa-user-edit text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Edit Pengguna</h1>
              <p className="mt-1 text-amber-100">Perbarui informasi pengguna sistem</p>
            </div>
          </div>
        </div>

        <div className="p-8 text-center">
          <div className="inline-block relative">
            <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-amber-500 animate-spin"></div>
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-amber-200 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

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
                <i className="fas fa-user-edit text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Edit Pengguna</h1>
                <p className="mt-1 text-amber-100">Perbarui informasi pengguna sistem</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Link
                to={`/admin/users/${id}`}
                className="inline-flex items-center px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm"
              >
                <i className="fas fa-eye mr-2"></i> Lihat Detail
              </Link>
              <Link
                to="/admin/users"
                className="inline-flex items-center px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all duration-300 border border-white/20 shadow-sm"
              >
                <i className="fas fa-arrow-left mr-2"></i> Kembali
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Alert Messages */}
        {alert.show && (
          <div className={`mb-6 rounded-lg shadow-lg overflow-hidden animate-slideIn`}>
            <div className={`${alert.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} px-4 py-2 text-white flex items-center justify-between`}>
              <div className="flex items-center">
                <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                <span className="font-medium">{alert.type === 'success' ? 'Sukses' : 'Error'}</span>
              </div>
              <button onClick={() => setAlert({ ...alert, show: false })} className="text-white/80 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={`${alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'} px-4 py-3 border-t`}>
              {alert.message}
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Terdapat kesalahan pada form:</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {Object.values(errors).flat().map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                <i className="fas fa-user text-blue-500 mr-2"></i>
                Informasi Personal
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-user text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`${getInputClassName('name')} pl-10`}
                      placeholder="Masukkan nama lengkap..."
                      required
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.name[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-envelope text-gray-400"></i>
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`${getInputClassName('email')} pl-10`}
                      placeholder="nama@email.com"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.email[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-phone text-gray-400"></i>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`${getInputClassName('phone')} pl-10`}
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.phone[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kelamin
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-venus-mars text-gray-400"></i>
                    </div>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                      className={`${getInputClassName('gender')} pl-10`}
                    >
                      <option value="">-- Pilih Jenis Kelamin --</option>
                      <option value="MALE">Laki-laki</option>
                      <option value="FEMALE">Perempuan</option>
                    </select>
                  </div>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.gender[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="date_of_birthday" className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Lahir
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-calendar-alt text-gray-400"></i>
                    </div>
                    <input
                      type="date"
                      id="date_of_birthday"
                      name="date_of_birthday"
                      value={formData.date_of_birthday || ''}
                      onChange={handleInputChange}
                      className={`${getInputClassName('date_of_birthday')} pl-10`}
                    />
                  </div>
                  {errors.date_of_birthday && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.date_of_birthday[0]}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <i className="fas fa-map-marker-alt text-gray-400"></i>
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className={`${getInputClassName('address')} pl-10 resize-none`}
                      placeholder="Masukkan alamat lengkap..."
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.address[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Identity Information Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
              <h2 className="text-lg font-semibold text-purple-800 flex items-center">
                <i className="fas fa-id-card text-purple-500 mr-2"></i>
                Informasi Identitas
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="id_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Identitas
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-address-card text-gray-400"></i>
                    </div>
                    <select
                      id="id_type"
                      name="id_type"
                      value={formData.id_type || ''}
                      onChange={handleInputChange}
                      className={`${getInputClassName('id_type')} pl-10`}
                    >
                      <option value="">-- Pilih Jenis Identitas --</option>
                      <option value="KTP">KTP</option>
                      <option value="SIM">SIM</option>
                      <option value="PASPOR">Paspor</option>
                    </select>
                  </div>
                  {errors.id_type && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.id_type[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="id_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Identitas
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-hashtag text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="id_number"
                      name="id_number"
                      value={formData.id_number || ''}
                      onChange={handleInputChange}
                      className={`${getInputClassName('id_number')} pl-10 font-mono`}
                      placeholder="Masukkan nomor identitas..."
                    />
                  </div>
                  {errors.id_number && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.id_number[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bank Account Information Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
              <h2 className="text-lg font-semibold text-indigo-800 flex items-center">
                <i className="fas fa-university text-indigo-500 mr-2"></i>
                Informasi Rekening Bank
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bank_account_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Pemilik Rekening <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-user text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="bank_account_name"
                      name="bank_account_name"
                      value={formData.bank_account_name || ''}
                      onChange={handleInputChange}
                      className={`${getInputClassName('bank_account_name')} pl-10`}
                      placeholder="Masukkan nama pemilik rekening..."
                      required
                    />
                  </div>
                  {errors.bank_account_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.bank_account_name[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Bank <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-university text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="bank_name"
                      name="bank_name"
                      value={formData.bank_name || ''}
                      onChange={handleInputChange}
                      className={`${getInputClassName('bank_name')} pl-10`}
                      placeholder="Masukkan nama bank..."
                      required
                    />
                  </div>
                  {errors.bank_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.bank_name[0]}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Rekening <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-credit-card text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      id="bank_account_number"
                      name="bank_account_number"
                      value={formData.bank_account_number || ''}
                      onChange={handleInputChange}
                      className={`${getInputClassName('bank_account_number')} pl-10 font-mono`}
                      placeholder="Masukkan nomor rekening bank..."
                      required
                    />
                  </div>
                  {errors.bank_account_number && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.bank_account_number[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
              <h2 className="text-lg font-semibold text-emerald-800 flex items-center">
                <i className="fas fa-key text-emerald-500 mr-2"></i>
                Ubah Password
              </h2>
              <p className="text-sm text-emerald-600 mt-1">
                Biarkan kosong jika tidak ingin mengubah password
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-lock text-gray-400"></i>
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`${getInputClassName('password')} pl-10`}
                      placeholder="Masukkan password baru..."
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.password[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-lock text-gray-400"></i>
                    </div>
                    <input
                      type="password"
                      id="password_confirmation"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                      className={`${getInputClassName('password_confirmation')} pl-10`}
                      placeholder="Konfirmasi password baru..."
                    />
                  </div>
                  {errors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {errors.password_confirmation[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <i className="fas fa-cogs text-gray-500 mr-2"></i>
                Tindakan
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  <p>Pastikan semua informasi sudah benar sebelum menyimpan perubahan.</p>
                </div>

                <div className="flex space-x-3">
                  <Link
                    to={`/admin/users/${id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Batal
                  </Link>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg shadow-sm transition-all duration-200 disabled:cursor-not-allowed hover:shadow-md transform hover:scale-105 disabled:transform-none"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-8 bg-white rounded-xl shadow-md border border-red-200 overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-100">
            <h2 className="text-lg font-semibold text-red-800 flex items-center">
              <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
              Zona Berbahaya
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Hapus Pengguna</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Penghapusan pengguna bersifat permanen dan tidak dapat dibatalkan.
                  Semua data terkait pengguna akan dihapus termasuk riwayat booking dan kendaraan.
                </p>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <i className="fas fa-info-circle text-red-500"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        <strong>Peringatan:</strong> Tindakan ini akan menghapus semua data yang berkaitan dengan pengguna ini.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md transform hover:scale-105"
              >
                <i className="fas fa-trash mr-2"></i>
                Hapus Pengguna
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-modal-in">
            <div className="p-6">
              <div className="text-center mb-5">
                <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Konfirmasi Hapus</h3>
                <p className="text-gray-600 mt-2">Apakah Anda yakin ingin menghapus pengguna:</p>
                <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
                  <div className="flex items-center justify-center mb-2">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                      <span className="text-lg font-bold text-amber-600">
                        {formData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-gray-800">{formData.name}</p>
                      <p className="text-gray-600 text-sm">{formData.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">
                      <strong>Peringatan:</strong> Menghapus pengguna akan menghapus semua data terkait.
                      Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full py-3 px-4 bg-red-500 rounded-lg text-white font-medium hover:bg-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i> Hapus Pengguna
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style>{`
        @keyframes modal-in {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-modal-in {
          animation: modal-in 0.3s ease-out forwards;
        }
        
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

        /* Enhanced form styles */
        input:focus,
        select:focus,
        textarea:focus {
          transform: scale(1.01);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        /* Button hover animations */
        button:not(:disabled):hover {
          filter: brightness(1.05);
        }

        /* Error field animations */
        .border-red-300 {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default UserEdit;