import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Memuat data...</span>
    </div>
  );
};

export default LoadingSpinner;