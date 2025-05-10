import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt, faUserShield, faUserTie } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

const OperatorLogin = () => {
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
      // Menggunakan endpoint yang benar untuk login operator
      const response = await api.post('/operator-panel/login', formData);
      
      // Menyimpan token
      localStorage.setItem('token', response.data.token);
      
      // Menyimpan data user jika tersedia
      if (response.data.user) {
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
      
      // Navigasi ke dashboard operator
      setTimeout(() => {
        navigate('/operator/dashboard');
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
    <div className="w-full max-w-md">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Login header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-operator to-operator-dark opacity-90"></div>
          <div className="relative py-8 px-6 md:px-10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4">
                <FontAwesomeIcon icon={faUserTie} className="text-operator text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-white">Login Operator</h2>
              <p className="text-operator-light mt-1">Masukkan kredensial untuk akses sistem operasional</p>
            </div>
          </div>
        </div>

        {/* Login form */}
        <div className="py-6 px-6 md:px-10">
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:outline-none focus:ring-2 focus:ring-operator focus:border-transparent`}
                  placeholder="email@example.com"
                  required
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 w-full rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:outline-none focus:ring-2 focus:ring-operator focus:border-transparent`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="h-4 w-4 text-operator focus:ring-operator border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Ingat Saya
                </label>
              </div>

              <a className="text-sm text-operator hover:text-operator-dark" href="#">
                Lupa Password?
              </a>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-operator hover:bg-operator-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-operator transition-colors duration-200"
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
                    <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> Masuk
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Login footer */}
        <div className="py-4 px-6 md:px-10 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            <a href="/admin/login" className="text-operator hover:text-operator-dark transition-colors duration-200">
              <FontAwesomeIcon icon={faUserShield} className="mr-1" /> Login sebagai Admin
            </a>
          </p>
        </div>
      </div>

      {/* Additional info */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Butuh bantuan? <a href="#" className="text-operator hover:text-operator-dark transition-colors duration-200">Hubungi Kami</a>
        </p>
      </div>
    </div>
  );
};

export default OperatorLogin;