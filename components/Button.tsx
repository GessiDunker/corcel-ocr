import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex justify-center items-center shadow-sm";
  
  let variantStyles = "";
  switch (variant) {
    case 'primary':
      variantStyles = "bg-ufrgs-blue text-white hover:bg-blue-900 active:bg-blue-950";
      break;
    case 'secondary':
      variantStyles = "bg-white text-ufrgs-blue border-2 border-ufrgs-blue hover:bg-blue-50";
      break;
    case 'danger':
      variantStyles = "bg-ufrgs-red text-white hover:bg-red-700";
      break;
  }

  const opacity = (disabled || isLoading) ? "opacity-50 cursor-not-allowed" : "hover:shadow-md";

  return (
    <button 
      className={`${baseStyles} ${variantStyles} ${opacity} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};