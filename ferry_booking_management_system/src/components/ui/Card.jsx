// src/components/ui/Card.jsx
import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  title,
  footer,
  headerAction,
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 ${className}`}>
      {(title || headerAction) && (
        <div className={`px-6 py-4 border-b border-gray-200 flex justify-between items-center ${headerClassName}`}>
          {title && (
            typeof title === 'string' 
            ? <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            : title
          )}
          {headerAction && (
            <div className="flex items-center space-x-2">
              {headerAction}
            </div>
          )}
        </div>
      )}
      
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`px-6 py-4 border-t border-gray-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;