// src/components/ui/Badge.jsx
import React from 'react';

const badgeStyles = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-secondary-100 text-secondary-800',
  gray: 'bg-gray-100 text-gray-800',
};

const Badge = ({ type = 'gray', children, className, ...props }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeStyles[type]} ${className || ''}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;