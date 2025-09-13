import React, { useState, useEffect, useContext } from 'react';
import { Page, NavigateTo } from '../types';
import { GiftIcon, HeartIcon, HeartIconFilled, MenuIcon, XIcon, UserCircleIcon, LogOutIcon, QuestionMarkCircleIcon, ShoppingCartIcon, TagIcon } from './IconComponents';
import Button from './Button';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';

interface HeaderProps {
  navigateTo: NavigateTo;
  currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ navigateTo, currentPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const auth = useContext(AuthContext);
  const cart = useContext(CartContext);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
  }, [isMobileMenuOpen]);

  const navItems: { page: Page; label: string, icon?: React.ElementType }[] = [
    { page: 'giftFinder', label: 'GiftFinder' },
    { page: 'deals', label: 'Deals', icon: TagIcon },
    { page: 'quiz', label: 'Cadeau Quiz', icon: QuestionMarkCircleIcon },
    { page: 'blog', label: 'Blog' },
    { page: 'about', label: 'Over Ons' },
    { page: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (page: Page) => {
    navigateTo(page);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    auth?.logout();
    setIsMobileMenuOpen(false);
    navigateTo('home');
  }

  const isFavoritesPage = currentPage === 'favorites';

  const headerClasses = `sticky top-0 z-50 transition-all duration-300 ${
    isMobileMenuOpen
      ? 'bg-white shadow-2xl'
      : 'bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-100/50'
  }`;

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo Section */}
          <div
            className="flex items-center cursor-pointer group flex-shrink-0"
            onClick={() => handleNavClick('home')}
          >
            <img 
              src="/images/gifteez-logo.svg" 
              alt="Gifteez.nl - AI Gift Finder" 
              className="h-14 lg:h-16 w-auto group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 max-w-4xl mx-8">
            <div className="flex items-center space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`relative font-display font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 group whitespace-nowrap ${
                    currentPage === item.page
                      ? 'text-white bg-primary shadow-lg scale-105'
                      : 'text-gray-700 hover:text-primary hover:bg-primary/5 hover:scale-105'
                  } ${item.page === 'quiz' || item.page === 'deals' ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' : ''}`}
                >
                  {item.icon && <item.icon className={`w-4 h-4 transition-transform duration-300 ${currentPage === item.page ? 'scale-110' : 'group-hover:scale-110'}`} />}
                  {item.label}
                  {currentPage === item.page && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-xl -z-10"></div>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => handleNavClick(auth?.currentUser ? 'favorites' : 'login')}
              className={`relative p-3 rounded-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 group ${
                isFavoritesPage
                  ? 'bg-emerald-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 hover:scale-105'
              }`}
              aria-label="Bekijk favorieten"
            >
              <div className="relative">
                {isFavoritesPage ? (
                  <HeartIconFilled className="w-5 h-5" />
                ) : (
                  <HeartIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                )}
                {auth?.currentUser?.favorites && auth.currentUser.favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                    {auth.currentUser.favorites.length}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => handleNavClick('cart')}
              className="relative p-3 text-gray-600 hover:text-primary rounded-xl hover:bg-primary/10 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 group hover:scale-105"
              aria-label="Winkelwagen"
            >
              <ShoppingCartIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              {cart && cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg animate-pulse">
                  {cart.itemCount}
                </span>
              )}
            </button>

            {/* Auth Buttons */}
            {auth?.currentUser ? (
              <div className="flex items-center space-x-2 ml-3 pl-3 border-l border-gray-200">
                <button
                  onClick={() => handleNavClick('account')}
                  className="p-3 text-gray-600 hover:text-primary rounded-xl hover:bg-primary/10 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 group hover:scale-105"
                  aria-label="Mijn Account"
                >
                  <UserCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-3 text-gray-600 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 group hover:scale-105"
                  aria-label="Uitloggen"
                >
                  <LogOutIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-3 pl-3 border-l border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => handleNavClick('login')}
                  className="px-4 py-2 text-sm font-semibold hover:scale-105 transition-transform duration-300"
                >
                  Inloggen
                </Button>
                <Button
                  variant="accent"
                  onClick={() => handleNavClick('signup')}
                  className="px-4 py-2 text-sm font-semibold hover:scale-105 transition-transform duration-300"
                >
                  Registreren
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Action Buttons & Menu Toggle */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => handleNavClick(auth?.currentUser ? 'favorites' : 'login')}
              className={`relative p-2 rounded-lg transition-all duration-300 ${
                isFavoritesPage
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
              aria-label="Bekijk favorieten"
            >
              {isFavoritesPage ? (
                <HeartIconFilled className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              {auth?.currentUser?.favorites && auth.currentUser.favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                  {auth.currentUser.favorites.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('cart')}
              className="relative p-2 text-gray-600 hover:text-primary rounded-lg hover:bg-primary/10 transition-all duration-300"
              aria-label="Winkelwagen"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {cart && cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                  {cart.itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-primary rounded-lg hover:bg-primary/10 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label="Menu openen"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-2xl animate-slide-in-left border-r border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center">
                <img 
                  src="/images/gifteez-logo.svg" 
                  alt="Gifteez.nl - AI Gift Finder" 
                  className="h-12 w-auto"
                />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-primary rounded-lg hover:bg-primary/10 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                aria-label="Sluit menu"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <nav className="p-6 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => handleNavClick(item.page)}
                    className={`w-full font-display font-semibold text-lg text-left py-4 px-4 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                      currentPage === item.page
                        ? 'text-white bg-gradient-to-r from-primary to-accent shadow-lg'
                        : 'text-gray-700 hover:text-primary hover:bg-primary/5'
                    } ${item.page === 'quiz' || item.page === 'deals' ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' : ''}`}
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Mobile Auth Section */}
              <div className="p-6 border-t border-gray-100">
                {auth?.currentUser ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleNavClick('account')}
                      className="w-full flex items-center gap-3 p-4 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-300"
                    >
                      <UserCircleIcon className="w-5 h-5" />
                      Mijn Account
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-4 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                    >
                      <LogOutIcon className="w-5 h-5" />
                      Uitloggen
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => handleNavClick('login')}
                      className="w-full"
                    >
                      Inloggen
                    </Button>
                    <Button
                      variant="accent"
                      onClick={() => handleNavClick('signup')}
                      className="w-full"
                    >
                      Registreren
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
