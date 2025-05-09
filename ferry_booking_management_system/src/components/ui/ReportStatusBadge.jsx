import React from 'react';

const StatusBadge = ({ status }) => {
  const getColorClass = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      case 'RESCHEDULED':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getColorClass()}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
};

export default StatusBadge;