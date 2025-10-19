import React from 'react'

declare global {
  function gtag(...args: any[]): void
}

interface ErrorFallbackProps {
  error?: Error
  resetErrorBoundary?: () => void
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleRetry = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-secondary/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-4">
          Oeps, er ging iets mis!
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          We hebben een onverwachte fout ontdekt. Ons team is op de hoogte gebracht en werkt aan een
          oplossing.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            <summary className="cursor-pointer font-semibold text-sm text-gray-700 mb-2">
              Technische details
            </summary>
            <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-32">
              {error.toString()}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Probeer opnieuw
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Ga naar startpagina
          </button>
        </div>

        {/* Support Link */}
        <p className="text-sm text-gray-500 mt-6">
          Blijft het probleem bestaan?{' '}
          <a href="/contact" className="text-primary hover:text-accent font-medium underline">
            Neem contact op
          </a>
        </p>
      </div>
    </div>
  )
}

// Hook-based error handler for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = () => setError(null)

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    console.error('Error caught by useErrorHandler:', error)

    // Log to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
      })
    }
  }, [])

  // Throw error to be caught by nearest error boundary
  if (error) {
    throw error
  }

  return { handleError, resetError }
}

// For now, we'll use a simple wrapper that catches errors
const ErrorBoundary: React.FC<{
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}> = ({ children, fallback: FallbackComponent = ErrorFallback }) => {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<Error | undefined>()

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error)
      setHasError(true)
      setError(event.error)

      // Log to analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'exception', {
          description: event.error.toString(),
          fatal: false,
        })
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      setHasError(true)
      setError(new Error(`Unhandled promise rejection: ${event.reason}`))

      // Log to analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'exception', {
          description: `Unhandled promise rejection: ${event.reason}`,
          fatal: false,
        })
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (hasError) {
    return (
      <FallbackComponent
        error={error}
        resetErrorBoundary={() => {
          setHasError(false)
          setError(undefined)
        }}
      />
    )
  }

  return <>{children}</>
}

export default ErrorBoundary

// Simple async error boundary
export const AsyncErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ErrorBoundary>{children}</ErrorBoundary>
}
