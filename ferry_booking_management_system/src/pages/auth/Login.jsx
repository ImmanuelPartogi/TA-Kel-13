import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faShip as faSolidShip } from '@fortawesome/free-solid-svg-icons';

const AuthLayout = () => {
  useEffect(() => {
    // Auto-focus input email saat komponen dimuat
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.focus();
    }
  }, []);

  return (
    <div className="font-sans auth-background min-h-screen flex flex-col">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Logo and App Name */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 w-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full mx-auto shadow-lg">
              <FontAwesomeIcon icon={faSolidShip} className="text-white text-2xl wave-animation" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Ferry Ticket System</h1>
          <p className="text-gray-500">Sistem Pemesanan Tiket Kapal Ferry</p>
        </div>

        {/* Content Container */}
        <div className="w-full max-w-md">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Ferry Ticket System. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-background {
          background-color: #f9fafb;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .wave-animation {
          animation: wave 8s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;