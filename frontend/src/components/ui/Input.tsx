import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  helperText,
  fullWidth = true,
  variant = 'outlined',
  size = 'md',
  startIcon,
  endIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-4 text-lg'
  };

  const variantClasses = {
    default: 'border-gray-300 focus:border-primary-500',
    outlined: 'border-gray-300 focus:border-primary-500 bg-white',
    filled: 'border-0 bg-gray-100 focus:bg-white focus:border-primary-500'
  };

  const inputClasses = [
    'form-input',
    sizeClasses[size],
    variantClasses[variant],
    error ? 'error' : '',
    success ? 'border-success-500' : '',
    startIcon ? 'pl-10' : '',
    endIcon ? 'pr-10' : '',
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}

      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {startIcon}
          </div>
        )}

        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />

        {endIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {endIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      {success && (
        <p className="form-success">
          {success}
        </p>
      )}

      {helperText && !error && !success && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};