import React from 'react'

const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[1000] focus:px-4 focus:py-2 focus:bg-white focus:text-primary-600 focus:font-semibold focus:rounded-md focus:shadow-lg focus:ring-2 focus:ring-accent focus:ring-offset-2"
    >
      Skip to main content
    </a>
  )
}

export default SkipToContent
