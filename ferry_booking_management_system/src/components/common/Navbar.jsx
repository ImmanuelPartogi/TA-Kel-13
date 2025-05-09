import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { logout, getUser } from '../../services/auth';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = getUser();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <button className="md:hidden mr-4 text-gray-700 hover:text-gray-900">
            <FontAwesomeIcon icon={faBars} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 hidden md:block">Ferry Booking System</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-gray-800 relative">
            <FontAwesomeIcon icon={faBell} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              3
            </span>
          </button>

          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {user?.name || 'Admin'}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <a
                  href="#profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profil
                </a>
                <a
                  href="#settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Pengaturan
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;