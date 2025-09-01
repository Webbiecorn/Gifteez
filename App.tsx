
import React, { useState, useCallback, useEffect, useContext } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ReactLazy = React.lazy;
const HomePage = ReactLazy(() => import('./components/HomePage'));
const GiftFinderPage = ReactLazy(() => import('./components/GiftFinderPage'));
const CategoriesPage = ReactLazy(() => import('./components/CategoriesPage'));
const BlogPage = ReactLazy(() => import('./components/BlogPage'));
const FavoritesPage = ReactLazy(() => import('./components/FavoritesPage'));
import Toast from './components/Toast';
const SharedFavoritesPage = ReactLazy(() => import('./components/SharedFavoritesPage'));
const BlogDetailPage = ReactLazy(() => import('./components/BlogDetailPage'));
const ContactPage = ReactLazy(() => import('./components/ContactPage'));
const AboutPage = ReactLazy(() => import('./components/AboutPage'));
const LoginPage = ReactLazy(() => import('./components/LoginPage'));
const SignUpPage = ReactLazy(() => import('./components/SignUpPage'));
const AccountPage = ReactLazy(() => import('./components/AccountPage'));
const QuizPage = ReactLazy(() => import('./components/QuizPage'));
const DownloadPage = ReactLazy(() => import('./components/DownloadPage'));
const ShopPage = ReactLazy(() => import('./components/ShopPage'));
const CartPage = ReactLazy(() => import('./components/CartPage'));
const CheckoutSuccessPage = ReactLazy(() => import('./components/CheckoutSuccessPage'));
const DealsPage = ReactLazy(() => import('./components/DealsPage'));
import { Page, InitialGiftFinderData, Gift } from './types';
import { blogPosts } from './data/blogData';
import { AuthContext } from './contexts/AuthContext';
import { SpinnerIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [sharedGifts, setSharedGifts] = useState<Gift[] | null>(null);
  const auth = useContext(AuthContext);
  
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const favoritesParam = urlParams.get('favorites');
      if (favoritesParam && favoritesParam.length > 10) {
        window.history.replaceState({}, document.title, window.location.pathname);
        const decodedJson = decodeURIComponent(atob(favoritesParam));
        const gifts: Gift[] = JSON.parse(decodedJson);
        if (Array.isArray(gifts) && gifts.length > 0) {
          setSharedGifts(gifts);
        }
      }
    } catch (e) {
      console.error("Failed to parse shared favorites from URL", e);
    }
  }, []);

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentPostSlug, setCurrentPostSlug] = useState<string | null>(null);
  const [initialGiftFinderData, setInitialGiftFinderData] = useState<InitialGiftFinderData>({});
  const [toastMessage, setToastMessage] = useState('');

  const pathFor = (page: Page, data?: any) => {
    switch (page) {
      case 'home': return '/';
      case 'giftFinder': return '/giftfinder';
      case 'categories': return '/categories';
      case 'blog': return '/blog';
      case 'blogDetail': return `/blog/${data?.slug ?? currentPostSlug ?? ''}`;
      case 'favorites': return '/favorites';
      case 'contact': return '/contact';
      case 'about': return '/about';
      case 'login': return '/login';
      case 'signup': return '/signup';
      case 'account': return '/account';
      case 'quiz': return '/quiz';
      case 'download': return '/download';
      case 'shop': return '/shop';
      case 'cart': return '/cart';
      case 'checkoutSuccess': return '/checkout-success';
      case 'deals': return '/deals';
      default: return '/';
    }
  };

  const applyRoute = useCallback(() => {
    const { pathname } = window.location;
    const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    if (parts.length === 0) { setCurrentPage('home'); setCurrentPostSlug(null); return; }
    const [first, second] = parts;
    switch (first) {
      case 'giftfinder': setCurrentPage('giftFinder'); break;
      case 'categories': setCurrentPage('categories'); break;
      case 'blog':
        if (second) { setCurrentPage('blogDetail'); setCurrentPostSlug(second); }
        else { setCurrentPage('blog'); setCurrentPostSlug(null); }
        break;
      case 'favorites': setCurrentPage('favorites'); break;
      case 'contact': setCurrentPage('contact'); break;
      case 'about': setCurrentPage('about'); break;
      case 'login': setCurrentPage('login'); break;
      case 'signup': setCurrentPage('signup'); break;
      case 'account': setCurrentPage('account'); break;
      case 'quiz': setCurrentPage('quiz'); break;
      case 'download': setCurrentPage('download'); break;
      case 'shop': setCurrentPage('shop'); break;
      case 'cart': setCurrentPage('cart'); break;
      case 'checkout-success': setCurrentPage('checkoutSuccess'); break;
      case 'deals': setCurrentPage('deals'); break;
      default: setCurrentPage('home'); setCurrentPostSlug(null); break;
    }
  }, []);

  useEffect(() => {
    applyRoute();
    const onPop = () => applyRoute();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [applyRoute]);

  const navigateTo = useCallback((page: Page, data?: any) => {
    setInitialGiftFinderData({});
    setCurrentPostSlug(null);

    if (page === 'giftFinder' && data) {
        setInitialGiftFinderData(data);
    } else if (page === 'blogDetail' && data?.slug) {
        setCurrentPostSlug(data.slug);
    }
    setCurrentPage(page);
    const newPath = pathFor(page, data);
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    window.scrollTo(0, 0);
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  if (auth?.loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-light-bg">
            <SpinnerIcon className="w-16 h-16 text-primary animate-spin" />
        </div>
    );
  }

  if (sharedGifts) {
    return <SharedFavoritesPage gifts={sharedGifts} navigateToHome={() => setSharedGifts(null)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigateTo={navigateTo} />;
      case 'giftFinder':
        return <GiftFinderPage initialData={initialGiftFinderData} showToast={showToast} />;
      case 'categories':
        return <CategoriesPage navigateTo={navigateTo} />;
      case 'blog':
        return <BlogPage navigateTo={navigateTo} />;
      case 'blogDetail':
        const post = blogPosts.find(p => p.slug === currentPostSlug);
        if (post) {
            return <BlogDetailPage post={post} navigateTo={navigateTo} showToast={showToast} />;
        }
        // Fallback to blog overview if slug not found
        return <BlogPage navigateTo={navigateTo} />;
      case 'favorites':
        return <FavoritesPage navigateTo={navigateTo} showToast={showToast} />;
      case 'contact':
        return <ContactPage showToast={showToast} />;
      case 'about':
        return <AboutPage navigateTo={navigateTo} />;
      case 'login':
        return <LoginPage navigateTo={navigateTo} showToast={showToast} />;
      case 'signup':
        return <SignUpPage navigateTo={navigateTo} showToast={showToast} />;
      case 'account':
        return <AccountPage navigateTo={navigateTo} showToast={showToast} />;
      case 'quiz':
        return <QuizPage navigateTo={navigateTo} />;
      case 'download':
        return <DownloadPage navigateTo={navigateTo} />;
      case 'shop':
        return <ShopPage navigateTo={navigateTo} showToast={showToast} />;
      case 'cart':
        return <CartPage navigateTo={navigateTo} showToast={showToast} />;
      case 'checkoutSuccess':
        return <CheckoutSuccessPage navigateTo={navigateTo} />;
      case 'deals':
        return <DealsPage navigateTo={navigateTo} />;
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="bg-light-bg font-sans text-gray-800 min-h-screen flex flex-col">
      <Header navigateTo={navigateTo} currentPage={currentPage} />
      <main key={`${currentPage}-${currentPostSlug}`} className="flex-grow animate-fade-in">
        <React.Suspense fallback={<div className="flex items-center justify-center py-24 text-gray-500">Laden…</div>}>
          {renderPage()}
        </React.Suspense>
      </main>
      <Footer navigateTo={navigateTo} />
      <Toast message={toastMessage} />
    </div>
  );
};

export default App;
