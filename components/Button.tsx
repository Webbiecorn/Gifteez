import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = "font-display font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary to-accent text-white hover:from-primary/95 hover:to-accent-hover focus:ring-accent',
    accent: 'bg-accent text-white hover:bg-accent-hover focus:ring-accent',
    secondary: 'bg-white text-purple-700 border border-accent/40 hover:border-accent focus:ring-accent/40',
    ghost: 'bg-transparent text-white border border-white/40 hover:bg-white/10 focus:ring-white/40'
  } as const;

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;