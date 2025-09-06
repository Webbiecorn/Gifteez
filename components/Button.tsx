import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'secondary';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = "font-display font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-primary text-white hover:bg-opacity-90 focus:ring-primary',
    accent: 'bg-accent text-white hover:bg-accent-hover focus:ring-accent',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;