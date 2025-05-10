import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt, faUserShield } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    try {
      // Menggunakan endpoint yang benar untuk login admin
      const response = await api.post('/admin-panel/login', formData);
      
      // Menyimpan token
      localStorage.setItem('token', response.data.token);
      
      // Menyimpan data user jika tersedia
      if (response.data.user) {
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
      
      // Navigasi ke dashboard admin
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response && error.response.data.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi.' });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Login header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-800 opacity-90"></div>
          <div className="relative py-8 px-6 md:px-10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-white shadow-md">
                <FontAwesomeIcon icon={faUserShield} className="text-indigo-600 text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-white">Login Admin</h2>
              <p className="text-indigo-200 mt-2">Masukkan kredensial untuk akses dashboard admin</p>
            </div>
          </div>

          {/* Decorative Wave */}
          <svg className="absolute bottom-0 w-full text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100">
            <path fill="currentColor" fillOpacity="1" d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,75C1120,75,1280,53,1360,42.7L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>

        {/* Login form */}
        <div className="py-8 px-6 md:px-10">
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-700">
                  <FontAwesomeIcon icon="exclamation-circle" className="mr-1" />
                  {errors.general}
                </p>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                </div>
                <input 
                  id="email" 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-12 block w-full rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow`}
                  required
                  autoComplete="email"
                  autoFocus
                  placeholder="email@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  <FontAwesomeIcon icon="exclamation-circle" className="mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-gray-700 text-sm font-medium">Password</label>
                <a className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors" href="#">
                  Lupa Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                </div>
                <input 
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-12 block w-full rounded-lg border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow`}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  <FontAwesomeIcon icon="exclamation-circle" className="mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center mb-6">
              <input 
                id="remember"
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Ingat Saya
              </label>
            </div>

            <div className="mb-6">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                    Masuk
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Login footer */}
        <div className="py-4 px-6 md:px-10 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Masuk sebagai operator?
            <a href="/operator/login" className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors ml-1">
              <FontAwesomeIcon icon={faUserShield} className="mr-1" />
              Login Operator
            </a>
          </p>
        </div>
      </div>

      {/* Help & Security */}
      <div className="mt-8 flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-6 md:justify-between">
        <div className="flex items-center justify-center md:justify-start text-sm text-gray-600">
          <FontAwesomeIcon icon="headset" className="text-gray-400 mr-2" />
          <span>Butuh bantuan? <a href="#" className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium">Hubungi Tim Support</a></span>
        </div>
        <div className="flex items-center justify-center md:justify-end text-sm text-gray-600">
          <FontAwesomeIcon icon="shield-alt" className="text-gray-400 mr-2" />
          <span>Koneksi aman terenkripsi</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;