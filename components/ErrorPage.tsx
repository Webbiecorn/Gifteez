import React, { useEffect } from 'react';
import { NavigateTo } from '../types';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';

interface ErrorPageProps {
  navigateTo: NavigateTo;
  error?: Error;
  resetError?: () => void;
}

/**
 * 500 Error Page / Error Boundary Fallback
 * Shows when application crashes or server error occurs
 * Provides recovery options and error reporting
 */
const ErrorPage: React.FC<ErrorPageProps> = ({ navigateTo, error, resetError }) => {
  useEffect(() => {
    document.title = '500 - Er ging iets mis | Gifteez';
    
    // Log error to console for debugging
    if (error) {
      console.error('Application Error:', error);
    }

    // Track error in analytics (if consent given)
    if (window.dataLayer && error) {
      window.dataLayer.push({
        event: 'application_error',
        error_message: error.message,
        error_stack: error.stack?.substring(0, 500) // Limit stack trace size
      });
    }
  }, [error]);

  const handleReload = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="max-w-2xl w-full">
        <EmptyState
          variant="error"
          title="Er ging iets mis..."
          description="Onze foutdetectie heeft een probleem opgemerkt. We werken eraan! Probeer het later opnieuw of neem contact met ons op."
          action={{
            label: '🔄 Probeer opnieuw',
            onClick: handleReload
          }}
        >
          {/* Recovery Options */}
          <div className="mt-8 flex flex-col gap-3">
            <Button
              variant="primary"
              onClick={() => navigateTo('home')}
              fullWidth
              className="justify-center"
            >
              🏠 Terug naar Home
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigateTo('contact')}
              fullWidth
              className="justify-center"
            >
              📧 Meld dit probleem
            </Button>
          </div>

          {/* Quick Links */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-neutral-200">
            <p className="text-sm text-neutral-600 text-center mb-3">
              Of ga verder met:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => navigateTo('giftFinder')}
                className="text-sm text-primary hover:underline"
              >
                GiftFinder
              </button>
              <span className="text-neutral-300">•</span>
              <button
                onClick={() => navigateTo('deals')}
                className="text-sm text-primary hover:underline"
              >
                Deals
              </button>
              <span className="text-neutral-300">•</span>
              <button
                onClick={() => navigateTo('categories')}
                className="text-sm text-primary hover:underline"
              >
                Categorieën
              </button>
              <span className="text-neutral-300">•</span>
              <button
                onClick={() => navigateTo('blog')}
                className="text-sm text-primary hover:underline"
              >
                Blog
              </button>
            </div>
          </div>

          {/* Error Details (Collapsible) */}
          {error && (
            <details className="mt-6 text-left bg-neutral-100 rounded-lg overflow-hidden">
              <summary className="cursor-pointer p-4 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors">
                🔧 Technische details (voor developers)
              </summary>
              <div className="p-4 pt-0">
                <div className="mt-2 bg-white p-3 rounded border border-neutral-200">
                  <p className="text-xs font-semibold text-neutral-700 mb-2">Error Message:</p>
                  <pre className="text-xs text-error-600 overflow-auto whitespace-pre-wrap break-words">
                    {error.message}
                  </pre>
                </div>
                {error.stack && (
                  <div className="mt-3 bg-white p-3 rounded border border-neutral-200">
                    <p className="text-xs font-semibold text-neutral-700 mb-2">Stack Trace:</p>
                    <pre className="text-xs text-neutral-600 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* SEO-friendly text */}
          <div className="mt-6 text-center text-xs text-neutral-500">
            <p>Foutcode: 500 | Interne serverfout</p>
            <p className="mt-1">
              Als dit probleem zich blijft voordoen, <a href="/contact" className="text-primary hover:underline">neem dan contact met ons op</a>.
            </p>
          </div>
        </EmptyState>
      </div>
    </div>
  );
};

export default ErrorPage;
