// src/components/ui/Button.jsx
import React from 'react';

const buttonVariants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
  secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500',
  success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500',
  info: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
  light: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-gray-500',
};

const buttonSizes = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  xl: 'px-6 py-3 text-base',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  children,
  icon,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center rounded-md font-medium 
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-colors duration-150 ease-in-out
        ${buttonVariants[variant]} 
        ${buttonSizes[size]} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;  