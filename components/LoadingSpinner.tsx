import React from 'react'
import { SpinnerIcon } from './IconComponents'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', message = 'Laden…' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
      <SpinnerIcon className={`${sizeClasses[size]} animate-spin mb-2`} />
      <span className="text-sm">{message}</span>
    </div>
  )
}

export default LoadingSpinner
