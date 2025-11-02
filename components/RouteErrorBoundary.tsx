/**
 * Route-specific Error Boundary with Recovery
 *
 * Features:
 * - Catches React errors in component tree
 * - Fallback UI with recovery options
 * - Error logging and reporting
 * - Route-specific error handling
 * - User-friendly error messages
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { logger } from '../lib/logger'
import Button from './Button'

const hasWindow = typeof window !== 'undefined'
const hasNavigator = typeof navigator !== 'undefined'

const getRoutePath = (): string => {
  if (hasWindow) {
    return window.location.pathname
  }
  return 'unknown-route'
}

const showAlert = (message: string): void => {
  if (hasWindow) {
    window.alert(message)
    return
  }
  logger.warn('Alert skipped (no window available)', { message })
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  routeName?: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
}

class RouteErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorCount: 0,
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const routePath = this.props.routeName ?? getRoutePath()
    logger.error('React Error Boundary caught error', {
      route: routePath,
      error: error.message,
      componentStack: errorInfo.componentStack,
      errorCount: this.state.errorCount + 1,
    })

    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }))

    this.props.onError?.(error, errorInfo)
    logger.flush()
  }

  private handleReset = () => {
    logger.info('Error boundary reset', {
      route: this.props.routeName ?? getRoutePath(),
    })

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  private handleReload = () => {
    logger.info('Page reload triggered from error boundary')
    if (hasWindow) {
      window.location.reload()
      return
    }
    logger.warn('Reload skipped (no window available)')
  }

  private handleGoHome = () => {
    logger.info('Navigating to home from error boundary')
    if (hasWindow) {
      window.location.href = '/'
      return
    }
    logger.warn('Navigation skipped (no window available)')
  }

  private handleCopyError = () => {
    const { error, errorInfo } = this.state
    const routePath = this.props.routeName ?? getRoutePath()
    const errorText = `
Error: ${error?.message}
Route: ${routePath}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
    `.trim()

    if (hasNavigator && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(errorText).then(() => {
        logger.info('Error details copied to clipboard')
        showAlert('Foutdetails gekopieerd naar klembord')
      })
      return
    }

    logger.warn('Clipboard API not available to copy error details')
    showAlert('Clipboard niet beschikbaar in deze omgeving')
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo, errorCount } = this.state
      const { routeName, showDetails } = this.props
      const isDevelopment = import.meta.env.DEV

      return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-100">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold mb-1">Er ging iets mis</h1>
                    <p className="text-red-100">
                      {routeName
                        ? `Fout in ${routeName}`
                        : 'We hebben een onverwachte fout ontdekt'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <p className="text-gray-700 leading-relaxed">
                    Excuses voor het ongemak. Onze foutdetectie heeft deze situatie automatisch
                    gelogd en we kijken er naar. Probeer een van de onderstaande opties:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button variant="primary" onClick={this.handleReset} className="w-full">
                    🔄 Probeer Opnieuw
                  </Button>
                  <Button variant="secondary" onClick={this.handleReload} className="w-full">
                    ↻ Herlaad Pagina
                  </Button>
                  <Button variant="secondary" onClick={this.handleGoHome} className="w-full">
                    🏠 Naar Home
                  </Button>
                </div>

                {(isDevelopment || showDetails) && error && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Technische Details</h3>
                      <button
                        onClick={this.handleCopyError}
                        className="text-sm text-primary hover:text-accent transition-colors"
                      >
                        📋 Kopieer
                      </button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Fout:</span>
                        <p className="text-red-600 font-mono mt-1">{error.message}</p>
                      </div>

                      {errorCount > 1 && (
                        <div className="text-orange-600">
                          ⚠️ Deze fout is {errorCount}x voorgekomen
                        </div>
                      )}

                      {isDevelopment && error.stack && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-gray-700 font-medium hover:text-primary">
                            Stack Trace
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                            {error.stack}
                          </pre>
                        </details>
                      )}

                      {isDevelopment && errorInfo?.componentStack && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-gray-700 font-medium hover:text-primary">
                            Component Stack
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                            {errorInfo.componentStack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    Als het probleem aanhoudt, neem dan contact op via{' '}
                    <a href="mailto:support@gifteez.nl" className="text-primary hover:text-accent">
                      support@gifteez.nl
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {isDevelopment && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Dev Mode:</strong> Dit foutscherm wordt alleen in productie getoond bij
                  crashes.
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default RouteErrorBoundary
