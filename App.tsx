import React, { useState, useCallback, useEffect, useContext } from 'react'
const ReactLazy = React.lazy
const Header = ReactLazy(() => import('./components/Header'))
const Footer = ReactLazy(() => import('./components/Footer'))
const HomePage = ReactLazy(() => import('./components/HomePage'))
const GiftFinderPage = ReactLazy(() => import('./components/GiftFinderPage'))
const CategoriesPage = ReactLazy(() => import('./components/CategoriesPage'))
const BlogPage = ReactLazy(() => import('./components/BlogPage'))
const FavoritesPage = ReactLazy(() => import('./components/FavoritesPage'))
const SharedFavoritesPage = ReactLazy(() => import('./components/SharedFavoritesPage'))
const BlogDetailPage = ReactLazy(() => import('./components/BlogDetailPage'))
const ContactPage = ReactLazy(() => import('./components/ContactPage'))
const AboutPage = ReactLazy(() => import('./components/AboutPage'))
const LoginPage = ReactLazy(() => import('./components/LoginPage'))
const SignUpPage = ReactLazy(() => import('./components/SignUpPage'))
const AccountPage = ReactLazy(() => import('./components/AccountPage'))
const QuizPage = ReactLazy(() => import('./components/QuizPage'))
const DownloadPage = ReactLazy(() => import('./components/DownloadPage'))
// const ShopPage = ReactLazy(() => import('./components/ShopPage')); // Temporarily disabled
const CartPage = ReactLazy(() => import('./components/CartPage'))
const CheckoutSuccessPage = ReactLazy(() => import('./components/CheckoutSuccessPage'))
const DealsPage = ReactLazy(() => import('./components/DealsPage'))
const CategoryDetailPage = ReactLazy(() => import('./components/CategoryDetailPage'))
const ProductLandingPage = ReactLazy(() => import('./components/ProductLandingPage'))
const ComparisonPage = ReactLazy(() => import('./components/ComparisonPage'))
const DisclaimerPage = ReactLazy(() => import('./components/DisclaimerPage'))
const PrivacyPage = ReactLazy(() => import('./components/PrivacyPage'))
const AffiliateDisclosurePage = ReactLazy(() => import('./components/AffiliateDisclosurePage'))
const NotFoundPage = ReactLazy(() => import('./components/NotFoundPage'))
const ErrorPage = ReactLazy(() => import('./components/ErrorPage'))
const AdminPage = ReactLazy(() => import('./components/AdminPage'))
const AdminDealsPreviewPage = ReactLazy(() => import('./components/AdminDealsPreviewPage'))
const CookieBanner = ReactLazy(() => import('./components/CookieBanner'))
const FloatingCTA = ReactLazy(() => import('./components/FloatingCTA'))
const FloatingCadeauCoachButton = ReactLazy(() => import('./components/FloatingCadeauCoachButton'))
import ErrorBoundary from './components/ErrorBoundary'
import { SpinnerIcon } from './components/IconComponents'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import { TextSkeleton } from './components/SkeletonLoader'
import Toast from './components/Toast'
import { AuthContext } from './contexts/AuthContext'
import { BlogProvider } from './contexts/BlogContext'
import { useCookieConsent } from './hooks/useCookieConsent'
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor'
import { BlogNotificationService } from './services/blogNotificationService'
import { PerformanceInsightsService } from './services/performanceInsightsService'
import { wecantrackService } from './services/wecantrackService'
import type { Page, InitialGiftFinderData, Gift, DealItem } from './types'

const App: React.FC = () => {
  const [sharedGifts, setSharedGifts] = useState<Gift[] | null>(null)
  const auth = useContext(AuthContext)
  const { showBanner, acceptCookies, declineCookies } = useCookieConsent()
  const { logMetrics } = usePerformanceMonitor()

  // Initialize performance tracking
  useEffect(() => {
    PerformanceInsightsService.init()
  }, [])

  // Initialize AWIN MasterTag tracking (wecantrack, adMission, TRENDii)
  useEffect(() => {
    wecantrackService.initialize()
  }, [])

  useEffect(() => {
    // Log performance metrics after initial load
    const timer = setTimeout(() => {
      logMetrics()
    }, 1000)

    return () => clearTimeout(timer)
  }, [logMetrics])

  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [currentPostSlug, setCurrentPostSlug] = useState<string | null>(null)
  const [initialGiftFinderData, setInitialGiftFinderData] = useState<InitialGiftFinderData>({})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categoryDetailData, setCategoryDetailData] = useState<any>(null)
  const [productLandingData, setProductLandingData] = useState<{
    productId: string
    product: DealItem
  } | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [toastMessage, setToastMessage] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathFor = (page: Page, data?: any) => {
    switch (page) {
      case 'home':
        return '/'
      case 'giftFinder':
        return '/giftfinder'
      case 'categories':
        return '/categories'
      case 'blog':
        return '/blog'
      case 'blogDetail':
        return `/blog/${data?.slug ?? currentPostSlug ?? ''}`
      case 'favorites':
        return '/favorites'
      case 'contact':
        return '/contact'
      case 'about':
        return '/about'
      case 'login':
        return '/login'
      case 'signup':
        return '/signup'
      case 'account':
        return '/account'
      case 'quiz':
        return '/quiz'
      case 'download':
        return '/download'
      // case 'shop': return '/shop'; // Temporarily disabled
      case 'cart':
        return '/cart'
      case 'checkoutSuccess':
        return '/checkout-success'
      case 'deals':
        return '/deals'
      case 'categoryDetail':
        return `/deals/category/${data?.categoryId ?? ''}`
      case 'productLanding':
        return `/product/${data?.productId ?? ''}`
      case 'comparison':
        return `/compare/${data?.categoryId ?? ''}`
      case 'disclaimer':
        return '/disclaimer'
      case 'privacy':
        return '/privacy'
      case 'affiliateDisclosure':
        return '/affiliate-disclosure'
      case 'notFound':
        return '/404'
      case 'error':
        return '/500'
      case 'admin':
        return '/admin'
      case 'adminDealsPreview':
        return '/admin/deals-preview'
      default:
        return '/'
    }
  }

  const applyRoute = useCallback(() => {
    const { pathname } = window.location
    const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean)
    if (parts.length === 0) {
      setCurrentPage('home')
      setCurrentPostSlug(null)
      return
    }
    const [first, second, third] = parts
    switch (first) {
      case 'giftfinder':
        setCurrentPage('giftFinder')
        break
      case 'categories':
        setCurrentPage('categories')
        break
      case 'blog':
        if (second) {
          setCurrentPage('blogDetail')
          setCurrentPostSlug(second)
        } else {
          setCurrentPage('blog')
          setCurrentPostSlug(null)
        }
        break
      case 'favorites':
        setCurrentPage('favorites')
        break
      case 'contact':
        setCurrentPage('contact')
        break
      case 'about':
        setCurrentPage('about')
        break
      case 'admin':
        if (second === 'deals-preview') {
          setCurrentPage('adminDealsPreview')
        } else {
          setCurrentPage('admin')
        }
        break
      case 'admin-deals-preview':
        setCurrentPage('adminDealsPreview')
        break
      case 'login':
        setCurrentPage('login')
        break
      case 'signup':
        setCurrentPage('signup')
        break
      case 'account':
        setCurrentPage('account')
        break
      case 'quiz':
        setCurrentPage('quiz')
        break
      case 'download':
        setCurrentPage('download')
        break
      // case 'shop': setCurrentPage('shop'); break; // Temporarily disabled
      case 'cart':
        setCurrentPage('cart')
        break
      case 'checkout-success':
        setCurrentPage('checkoutSuccess')
        break
      case 'deals':
        if (second === 'category' && third) {
          setCurrentPage('categoryDetail')
          // Category data will be fetched by CategoryDetailPage component
        } else {
          setCurrentPage('deals')
        }
        break
      case 'product':
        if (second) {
          setCurrentPage('productLanding')
          // Product data will be passed via navigation or fetched
        } else {
          setCurrentPage('notFound')
        }
        break
      case 'compare':
        if (second) {
          setCurrentPage('comparison')
          // Comparison data will be passed via navigation
        } else {
          setCurrentPage('notFound')
        }
        break
      case 'disclaimer':
        setCurrentPage('disclaimer')
        break
      case 'privacy':
        setCurrentPage('privacy')
        break
      case 'affiliate-disclosure':
        setCurrentPage('affiliateDisclosure')
        break
      case '404':
        setCurrentPage('notFound')
        break
      case '500':
        setCurrentPage('error')
        break
      default:
        setCurrentPage('notFound')
        setCurrentPostSlug(null)
        break
    }
  }, [])

  useEffect(() => {
    applyRoute()
    const onPop = () => applyRoute()
    window.addEventListener('popstate', onPop)

    // Initialize email notification scheduling
    BlogNotificationService.scheduleNotifications()

    return () => {
      window.removeEventListener('popstate', onPop)
      BlogNotificationService.clearSchedules()
    }
  }, [applyRoute])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigateTo = useCallback((page: Page, data?: any) => {
    setInitialGiftFinderData({})
    setCurrentPostSlug(null)
    setCategoryDetailData(null)
    setProductLandingData(null)
    setComparisonData(null)

    if (page === 'giftFinder' && data) {
      setInitialGiftFinderData(data)
    } else if (page === 'blogDetail' && data?.slug) {
      setCurrentPostSlug(data.slug)
    } else if (page === 'categoryDetail' && data) {
      setCategoryDetailData(data)
    } else if (page === 'productLanding' && data) {
      setProductLandingData(data)
    } else if (page === 'comparison' && data) {
      setComparisonData(data)
    }
    setCurrentPage(page)
    const newPath = pathFor(page, data)
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath)
    }
    window.scrollTo(0, 0)
    // Basic per-route meta (skip blog pages which manage their own inside components)
    if (!['blog', 'blogDetail'].includes(page)) {
      const ensure = (selector: string, create: () => HTMLElement) => {
        let el = document.head.querySelector(selector) as HTMLElement | null
        if (!el) {
          el = create()
          document.head.appendChild(el)
        }
        return el
      }
      const canonical = ensure('link[rel="canonical"]', () => {
        const l = document.createElement('link')
        l.rel = 'canonical'
        return l
      })
      const path = pathFor(page, data)
      canonical.setAttribute('href', window.location.origin + path)
      const baseTitle = 'Gifteez.nl'
      const pageTitles: Record<string, string> = {
        home: 'Trending Gifts & Expert Gift Guides voor Elk Moment',
        giftFinder: 'AI GiftFinder — Persoonlijke cadeau-ideeën',
        categories: "Cadeaucategorieën — Ontdek ideeënpagina's",
        favorites: 'Favoriete cadeaus — Deel & bewaar',
        contact: 'Contact — Neem contact op met Gifteez',
        about: 'Over Gifteez — Onze missie',
        login: 'Inloggen',
        signup: 'Account aanmaken',
        account: 'Mijn account',
        quiz: 'Cadeau Quiz',
        download: 'Download — Gratis cadeaugids',
        shop: 'Shop — Producten & Cadeaus',
        cart: 'Winkelwagen',
        checkoutSuccess: 'Bestelling geslaagd',
        deals: 'Handgepickte Collecties',
        categoryDetail: data?.categoryTitle
          ? `${data.categoryTitle} — Collectie`
          : 'Categorie — Collectie',
        productLanding: data?.product?.name
          ? `${data.product.name} — Beste Deal`
          : 'Product — Beste Deal',
        comparison: data?.categoryTitle
          ? `Top 5 ${data.categoryTitle} — Vergelijking`
          : 'Vergelijking — Top 5',
        adminDealsPreview: 'Admin deals preview',
        disclaimer: 'Disclaimer — Gifteez.nl',
        privacy: 'Privacybeleid — Gifteez.nl',
        affiliateDisclosure: 'Affiliate Disclosure — Transparantie over partnerships',
      }
      const title = pageTitles[page] ? `${pageTitles[page]} — ${baseTitle}` : baseTitle
      document.title = title
      const descriptions: Record<string, string> = {
        giftFinder:
          'Gebruik de AI GiftFinder en ontvang direct een gepersonaliseerde lijst cadeautips.',
        categories:
          'Blader door tientallen cadeaucategorieën voor inspiratie voor elke gelegenheid.',
        favorites: 'Bekijk en deel je bewaarde favoriete cadeau-ideeën.',
        contact: 'Neem contact op met het Gifteez team voor vragen of samenwerkingen.',
        about: 'Lees over de missie achter Gifteez: cadeaustress voorgoed verminderen.',
        affiliateDisclosure:
          'Lees hoe Gifteez.nl werkt via affiliate partnerships. Volledige transparantie over commissies en hoe we producten selecteren.',
        quiz: 'Doe de cadeau quiz en ontdek welk type cadeau het beste past.',
        download: 'Download gratis onze jaar rond cadeaugids vol ideeën.',
        shop: 'Ontdek geselecteerde cadeaus en producten in de Gifteez shop.',
        deals: 'Zorgvuldig samengestelde cadeau collecties voor elke gelegenheid.',
        categoryDetail: data?.categoryDescription || 'Bekijk alle producten in deze collectie.',
        adminDealsPreview: 'Controleer als admin de live deals-selectie van Gifteez.',
      }
      const metaDesc = ensure('meta[name="description"]', () =>
        Object.assign(document.createElement('meta'), { name: 'description' })
      )
      metaDesc.setAttribute(
        'content',
        descriptions[page] ||
          'Vind snel het perfecte cadeau met de AI GiftFinder, inspiratie, gidsen en handgepickte collecties.'
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(''), 3000)
  }, [])

  if (auth?.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg">
        <SpinnerIcon className="w-16 h-16 text-primary animate-spin" />
      </div>
    )
  }

  if (sharedGifts) {
    return <SharedFavoritesPage gifts={sharedGifts} navigateToHome={() => setSharedGifts(null)} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigateTo={navigateTo} />
      case 'giftFinder':
        return <GiftFinderPage initialData={initialGiftFinderData} showToast={showToast} />
      case 'categories':
        return <CategoriesPage navigateTo={navigateTo} />
      case 'blog':
        return <BlogPage navigateTo={navigateTo} />
      case 'blogDetail':
        if (!currentPostSlug) {
          return <BlogPage navigateTo={navigateTo} />
        }
        return (
          <BlogDetailPage slug={currentPostSlug} navigateTo={navigateTo} showToast={showToast} />
        )
      case 'favorites':
        return <FavoritesPage navigateTo={navigateTo} showToast={showToast} />
      case 'contact':
        return <ContactPage showToast={showToast} />
      case 'about':
        return <AboutPage navigateTo={navigateTo} />
      case 'login':
        return <LoginPage navigateTo={navigateTo} showToast={showToast} />
      case 'signup':
        return <SignUpPage navigateTo={navigateTo} showToast={showToast} />
      case 'account':
        return <AccountPage navigateTo={navigateTo} showToast={showToast} />
      case 'quiz':
        return <QuizPage navigateTo={navigateTo} />
      case 'download':
        return <DownloadPage navigateTo={navigateTo} />
      // case 'shop':
      //   return <ShopPage navigateTo={navigateTo} showToast={showToast} />; // Temporarily disabled
      case 'cart':
        return <CartPage navigateTo={navigateTo} showToast={showToast} />
      case 'admin':
        return <AdminPage navigateTo={navigateTo} />
      case 'adminDealsPreview':
        return <AdminDealsPreviewPage navigateTo={navigateTo} />
      case 'checkoutSuccess':
        return <CheckoutSuccessPage navigateTo={navigateTo} />
      case 'deals':
        return <DealsPage navigateTo={navigateTo} />
      case 'categoryDetail':
        return (
          <CategoryDetailPage
            navigateTo={navigateTo}
            categoryId={categoryDetailData?.categoryId ?? ''}
            categoryTitle={categoryDetailData?.categoryTitle ?? ''}
            categoryDescription={categoryDetailData?.categoryDescription ?? ''}
            products={categoryDetailData?.products ?? []}
            renderProductCard={(product) => (
              // Simple product card renderer - will use the same design as deals page
              <div key={product.id} className="h-full">
                {/* Placeholder for product card - the actual component will be imported */}
                <div className="bg-white rounded-lg shadow-sm p-4 h-full flex flex-col">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-accent font-bold mt-2">{product.price}</p>
                  <a
                    href={product.affiliateLink}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className="mt-auto inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-center"
                  >
                    Bekijk deal
                  </a>
                </div>
              </div>
            )}
          />
        )
      case 'productLanding':
        if (!productLandingData?.product) {
          return <NotFoundPage navigateTo={navigateTo} />
        }
        return (
          <ProductLandingPage
            navigateTo={navigateTo}
            product={productLandingData.product}
            relatedProducts={[]}
          />
        )
      case 'comparison':
        if (!comparisonData) {
          return <NotFoundPage navigateTo={navigateTo} />
        }
        return (
          <ComparisonPage
            navigateTo={navigateTo}
            categoryId={comparisonData.categoryId ?? ''}
            categoryTitle={comparisonData.categoryTitle ?? ''}
            products={comparisonData.products ?? []}
          />
        )
      case 'disclaimer':
        return <DisclaimerPage navigateTo={navigateTo} />
      case 'privacy':
        return <PrivacyPage navigateTo={navigateTo} />
      case 'affiliateDisclosure':
        return <AffiliateDisclosurePage navigateTo={navigateTo} />
      case 'notFound':
        return <NotFoundPage navigateTo={navigateTo} />
      case 'error':
        return <ErrorPage navigateTo={navigateTo} />
      default:
        return <NotFoundPage navigateTo={navigateTo} />
    }
  }

  return (
    <BlogProvider>
      <ErrorBoundary
        onError={(error) => {
          // Log error to analytics
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (typeof window !== 'undefined' && (window as any).gtag) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).gtag('event', 'exception', {
              description: `React Error: ${error.toString()}`,
              fatal: false,
            })
          }
        }}
      >
        <div className="bg-light-bg font-sans text-gray-800 min-h-screen flex flex-col">
          <React.Suspense
            fallback={
              <div className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8">
                <TextSkeleton lines={1} />
                <div className="flex gap-4">
                  <TextSkeleton lines={1} />
                  <TextSkeleton lines={1} />
                </div>
              </div>
            }
          >
            <Header navigateTo={navigateTo} currentPage={currentPage} />
          </React.Suspense>
          <Layout>
            <div key={`${currentPage}-${currentPostSlug}`} className="flex-grow animate-fade-in">
              <React.Suspense
                fallback={
                  <div className="flex items-center justify-center py-24">
                    <LoadingSpinner size="lg" message="Pagina laden…" />
                  </div>
                }
              >
                {renderPage()}
              </React.Suspense>
            </div>
          </Layout>
          <React.Suspense
            fallback={
              <div className="h-32 bg-white border-t border-gray-100 flex items-center justify-center px-4">
                <TextSkeleton lines={2} />
              </div>
            }
          >
            <Footer navigateTo={navigateTo} showToast={showToast} />
          </React.Suspense>

          {/* FloatingCTA - Show on content pages, hide on giftFinder/checkout/admin */}
          {![
            'giftFinder',
            'cart',
            'checkoutSuccess',
            'admin',
            'adminDealsPreview',
            'login',
            'signup',
          ].includes(currentPage) && (
            <React.Suspense fallback={null}>
              <FloatingCTA navigateTo={navigateTo} />
            </React.Suspense>
          )}

          {/* FloatingCadeauCoachButton - Cadeau-Coach toegang */}
          {![
            'giftFinder',
            'cart',
            'checkoutSuccess',
            'admin',
            'adminDealsPreview',
            'login',
            'signup',
          ].includes(currentPage) && (
            <React.Suspense fallback={null}>
              <FloatingCadeauCoachButton navigateTo={navigateTo} />
            </React.Suspense>
          )}

          <Toast message={toastMessage} />
          {showBanner && (
            <React.Suspense fallback={null}>
              <CookieBanner onAccept={acceptCookies} onDecline={declineCookies} />
            </React.Suspense>
          )}
        </div>
      </ErrorBoundary>
    </BlogProvider>
  )
}

export default App
