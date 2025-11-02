import React, { useEffect } from 'react'
import { Button } from './ui/Button'
import { EmptyState } from './ui/EmptyState'
import type { NavigateTo } from '../types'

interface NotFoundPageProps {
  navigateTo: NavigateTo
}

/**
 * 404 Not Found Page
 * Shows when user navigates to non-existent route
 * Provides soft navigation back to main sections
 */
const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigateTo }) => {
  useEffect(() => {
    document.title = '404 - Pagina niet gevonden | Gifteez'

    // Track 404 in analytics (if consent given)
    if (window.dataLayer) {
      window.dataLayer.push({
        event: '404_error',
        page_path: window.location.pathname,
      })
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="max-w-2xl w-full">
        <EmptyState
          variant="error"
          title="Oeps! Deze pagina bestaat niet"
          description="De pagina die je zoekt is verplaatst of bestaat niet (meer). Geen zorgen, we helpen je terug op weg!"
          action={
            <Button
              variant="primary"
              onClick={() => navigateTo('home')}
              fullWidth
              className="justify-center"
            >
              🏠 Terug naar Home
            </Button>
          }
        >
          {/* Quick Navigation Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="primary"
              onClick={() => navigateTo('giftFinder')}
              fullWidth
              className="justify-center"
            >
              🎁 Start GiftFinder
            </Button>
            <Button
              variant="accent"
              onClick={() => navigateTo('deals')}
              fullWidth
              className="justify-center"
            >
              🔥 Bekijk Deals
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigateTo('categories')}
              fullWidth
              className="justify-center"
            >
              📂 Categorieën
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigateTo('blog')}
              fullWidth
              className="justify-center"
            >
              📝 Blog
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-6 bg-white rounded-lg border border-neutral-200 text-center">
            <h3 className="font-semibold text-neutral-900 mb-2">Hulp nodig?</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Kun je niet vinden wat je zoekt? We helpen je graag verder!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="ghost" size="sm" onClick={() => navigateTo('contact')}>
                📧 Contact opnemen
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigateTo('about')}>
                ℹ️ Over Gifteez
              </Button>
            </div>
          </div>

          {/* SEO-friendly text */}
          <div className="mt-6 text-center text-xs text-neutral-500">
            <p>Foutcode: 404 | Pagina niet gevonden</p>
            <p className="mt-1">
              URL:{' '}
              <code className="bg-neutral-100 px-2 py-1 rounded">{window.location.pathname}</code>
            </p>
          </div>
        </EmptyState>
      </div>
    </div>
  )
}

export default NotFoundPage
