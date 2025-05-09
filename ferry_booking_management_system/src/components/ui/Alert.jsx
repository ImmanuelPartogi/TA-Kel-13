import React from 'react';

const Alert = ({ type = 'info', message, onClose }) => {
  const alertStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-700',
      icon: 'fas fa-check-circle text-green-500',
      hover: 'hover:bg-green-100'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-700',
      icon: 'fas fa-exclamation-circle text-red-500',
      hover: 'hover:bg-red-100'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
      icon: 'fas fa-exclamation-triangle text-yellow-500',
      hover: 'hover:bg-yellow-100'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-700',
      icon: 'fas fa-info-circle text-blue-500',
      hover: 'hover:bg-blue-100'
    }
  };

  const style = alertStyles[type] || alertStyles.info;

  return (
    <div className={`${style.bg} border-l-4 ${style.border} p-4 mb-6 rounded-md`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <i className={style.icon}></i>
        </div>
        <div className="ml-3">
          <p className={`text-sm ${style.text}`}>{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex ${style.bg} rounded-md p-1.5 ${style.text} ${style.hover}`}
              >
                <span className="sr-only">Dismiss</span>
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;