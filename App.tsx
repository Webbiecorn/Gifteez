
import React, { useState, useCallback, useEffect, useContext } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import GiftFinderPage from './components/GiftFinderPage';
import CategoriesPage from './components/CategoriesPage';
import BlogPage from './components/BlogPage';
import FavoritesPage from './components/FavoritesPage';
import Toast from './components/Toast';
import SharedFavoritesPage from './components/SharedFavoritesPage';
import BlogDetailPage from './components/BlogDetailPage';
import ContactPage from './components/ContactPage';
import AboutPage from './components/AboutPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import AccountPage from './components/AccountPage';
import QuizPage from './components/QuizPage';
import DownloadPage from './components/DownloadPage';
import ShopPage from './components/ShopPage';
import CartPage from './components/CartPage';
import CheckoutSuccessPage from './components/CheckoutSuccessPage';
import DealsPage from './components/DealsPage';
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

  const navigateTo = useCallback((page: Page, data?: any) => {
    setInitialGiftFinderData({});
    setCurrentPostSlug(null);

    if (page === 'giftFinder' && data) {
        setInitialGiftFinderData(data);
    } else if (page === 'blogDetail' && data?.slug) {
        setCurrentPostSlug(data.slug);
    }
    setCurrentPage(page);
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
        {renderPage()}
      </main>
      <Footer navigateTo={navigateTo} />
      <Toast message={toastMessage} />
    </div>
  );
};

export default App;
