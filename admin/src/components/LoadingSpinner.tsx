import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'green' | 'gray';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'border-primary-500',
    green: 'border-[#065f46]',
    gray: 'border-gray-900'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`} />
      {text && (
        <p className={`mt-2 text-sm font-medium ${
          color === 'green' ? 'text-[#065f46]' : 'text-gray-600'
        }`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;