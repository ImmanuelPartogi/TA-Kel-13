import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Mail, Lock, Eye, EyeOff, LogIn, HeadphonesIcon, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BaseLogin = ({ 
  title = "Login", 
  subtitle = "Masukkan kredensial untuk akses dashboard",
  role = "admin",
  endpoint = "/admin-panel/login",
  redirectPath = "/admin/dashboard",
  alternateLoginLink = null,
  primaryColor = "indigo" // or "cyan" for operator
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post(endpoint, { email, password });
      
      if (response.data.status === 'success') {
        const { token, user } = response.data;
        
        // Login menggunakan AuthContext
        login(user, token);
        
        if (remember) {
          localStorage.setItem('remember', 'true');
        }
        
        // Navigate setelah state ter-update
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 100);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  const colorClasses = {
    indigo: {
      gradient: "from-indigo-600 to-indigo-800",
      button: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
      link: "text-indigo-600 hover:text-indigo-800",
      checkbox: "text-indigo-600 focus:ring-indigo-500",
      opacity: "text-indigo-200"
    },
    cyan: {
      gradient: "from-cyan-600 to-cyan-800",
      button: "bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500",
      link: "text-cyan-600 hover:text-cyan-800",
      checkbox: "text-cyan-600 focus:ring-cyan-500",
      opacity: "text-cyan-200"
    }
  };

  const colors = colorClasses[primaryColor];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Login header */}
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-90`}></div>
            <div className="relative py-8 px-6 md:px-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-white shadow-md">
                  {role === 'admin' ? (
                    <Shield className={`h-8 w-8 text-${primaryColor}-600`} />
                  ) : (
                    <User className={`h-8 w-8 text-${primaryColor}-600`} />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <p className={`${colors.opacity} mt-2`}>{subtitle}</p>
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
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-12 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-${primaryColor}-500 focus:border-transparent transition-shadow`}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-gray-700 text-sm font-medium">Password</label>
                  <a href="#" className={`text-xs ${colors.link} transition-colors`}>
                    Lupa Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-12 block w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-700 focus:outline-none focus:ring-2 focus:ring-${primaryColor}-500 focus:border-transparent transition-shadow`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center mb-6">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className={`h-4 w-4 ${colors.checkbox} border-gray-300 rounded`}
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Ingat Saya
                </label>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-all duration-200 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : colors.button
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Masuk
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Login footer */}
          {alternateLoginLink && (
            <div className="py-4 px-6 md:px-10 bg-gray-50 border-t border-gray-100 text-center">
              {alternateLoginLink}
            </div>
          )}
        </div>

        {/* Help & Security */}
        <div className="mt-8 flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-6 md:justify-between">
          <div className="flex items-center justify-center md:justify-start text-sm text-gray-600">
            <HeadphonesIcon className="w-5 h-5 text-gray-400 mr-2" />
            <span>Butuh bantuan? <a href="#" className={`${colors.link} transition-colors font-medium`}>Hubungi Tim Support</a></span>
          </div>
          <div className="flex items-center justify-center md:justify-end text-sm text-gray-600">
            <ShieldCheck className="w-5 h-5 text-gray-400 mr-2" />
            <span>Koneksi aman terenkripsi</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseLogin;