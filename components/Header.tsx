
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
    { page: 'shop', label: 'Winkel' },
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

  const desktopNav = (
    <nav className="hidden md:flex items-center space-x-1">
      {navItems.map((item) => (
        <button
          key={item.page}
          onClick={() => handleNavClick(item.page)}
          className={`relative font-display font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 group ${
            currentPage === item.page
              ? 'text-white bg-primary shadow-lg'
              : 'text-gray-700 hover:text-primary hover:bg-primary/5'
          } ${item.page === 'quiz' || item.page === 'deals' ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' : ''}`}
        >
          {item.icon && <item.icon className={`w-4 h-4 transition-transform duration-300 ${currentPage === item.page ? 'scale-110' : 'group-hover:scale-110'}`} />}
          {item.label}
          {currentPage === item.page && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-lg -z-10"></div>
          )}
        </button>
      ))}
    </nav>
  );

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-primary to-accent p-2 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <GiftIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold text-primary group-hover:text-blue-600 transition-colors duration-300">
                Gifteez.nl
              </span>
              <span className="text-xs text-gray-500 font-medium">AI Gift Finder</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {desktopNav}

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 ml-4 pl-4 border-l border-gray-200">
              <button
                onClick={() => handleNavClick(auth?.currentUser ? 'favorites' : 'login')}
                className={`relative p-3 rounded-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 group ${
                  isFavoritesPage
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
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
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                      {auth.currentUser.favorites.length}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleNavClick('cart')}
                className="relative p-3 text-gray-600 hover:text-primary rounded-xl hover:bg-primary/10 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 group"
                aria-label="Winkelwagen"
              >
                <ShoppingCartIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                {cart && cart.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg animate-pulse">
                    {cart.itemCount}
                  </span>
                )}
              </button>

              {/* Auth Buttons */}
              {auth?.currentUser ? (
                <>
                  <button
                    onClick={() => handleNavClick('account')}
                    className="p-3 text-gray-600 hover:text-primary rounded-xl hover:bg-primary/10 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 group"
                    aria-label="Mijn Account"
                  >
                    <UserCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="hidden lg:flex items-center gap-2 font-semibold text-sm text-gray-600 hover:text-primary px-4 py-2 rounded-xl hover:bg-primary/10 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    aria-label="Uitloggen"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    Uitloggen
                  </button>
                </>
              ) : (
                <div className="hidden lg:flex items-center space-x-2 ml-2">
                  <Button
                    variant="outline"
                    onClick={() => handleNavClick('login')}
                    className="py-2 px-4 text-sm font-semibold border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Inloggen
                  </Button>
                  <Button
                    variant="accent"
                    onClick={() => handleNavClick('signup')}
                    className="py-2 px-4 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Registreren
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-3 text-gray-600 hover:text-primary rounded-xl hover:bg-primary/10 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label="Open menu"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-2xl animate-slide-in-left border-r border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg shadow-lg">
                  <GiftIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-xl font-bold text-primary">Gifteez.nl</span>
                  <span className="text-xs text-gray-500 font-medium">AI Gift Finder</span>
                </div>
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

              {/* Mobile Action Buttons */}
              <div className="p-6 border-t border-gray-100 space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleNavClick(auth?.currentUser ? 'favorites' : 'login')}
                    className={`flex-1 p-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                      isFavoritesPage
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200'
                    }`}
                    aria-label="Bekijk favorieten"
                  >
                    {isFavoritesPage ? <HeartIconFilled className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                    <span className="font-medium">Favorieten</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('cart')}
                    className="relative flex-1 p-3 text-gray-600 hover:text-primary rounded-xl hover:bg-primary/10 border border-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                    aria-label="Winkelwagen"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    <span className="font-medium">Winkelwagen</span>
                    {cart && cart.itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg">
                        {cart.itemCount}
                      </span>
                    )}
                  </button>
                </div>

                {auth?.currentUser ? (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => handleNavClick('account')}
                      className="w-full py-3 font-semibold"
                    >
                      Mijn Account
                    </Button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-center font-semibold text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300"
                    >
                      Uitloggen
                    </button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="accent"
                      onClick={() => handleNavClick('login')}
                      className="w-full py-3 font-semibold"
                    >
                      Inloggen
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleNavClick('signup')}
                      className="w-full py-3 font-semibold"
                    >
                      Registreren
                    </Button>
                  </>
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
