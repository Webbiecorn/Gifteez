import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padded?: boolean;
}

const maxMap = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  full: 'max-w-full'
};

export const Container: React.FC<ContainerProps> = ({
  size = 'xl',
  padded = true,
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={`mx-auto ${maxMap[size]} ${padded ? 'px-4 sm:px-6 lg:px-8' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Container;
