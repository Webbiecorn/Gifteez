
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

  // 'shop' is temporarily hidden
  const navItems: { page: Page; label: string, icon?: React.ElementType }[] = [
    { page: 'home', label: 'Home' },
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

  const headerClasses = `sticky top-0 z-50 shadow-sm transition-colors duration-300 ${
    isMobileMenuOpen ? 'bg-white' : 'bg-white/80 backdrop-blur-md'
  }`;

  const desktopNav = (
    <nav className="hidden md:flex items-center space-x-6">
      {navItems.map((item) => (
        <button
          key={item.page}
          onClick={() => handleNavClick(item.page)}
          className={`font-display font-bold text-md transition-colors duration-200 flex items-center gap-1.5 ${
            currentPage === item.page
              ? 'text-primary'
              : 'text-gray-600 hover:text-primary'
          } ${item.page === 'quiz' || item.page === 'deals' ? 'text-accent hover:text-accent-hover' : ''}`}
        >
          {item.icon && <item.icon className="w-5 h-5" />}
          {item.label}
        </button>
      ))}
    </nav>
  );

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleNavClick('home')}
          >
            <GiftIcon className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-bold text-primary">Gifteez.nl</span>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            {desktopNav}
            <div className="flex items-center space-x-2">
        <button 
          onClick={() => handleNavClick(auth?.currentUser ? 'favorites' : 'login')}
                    className={`p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                        isFavoritesPage 
                        ? 'bg-secondary text-accent' 
                        : 'text-gray-600 hover:text-accent hover:bg-secondary'
                    }`}
                    aria-label="Bekijk favorieten"
                >
                    {isFavoritesPage ? <HeartIconFilled className="w-6 h-6" /> : <HeartIcon className="w-6 h-6" />}
                </button>
                <button
                    onClick={() => handleNavClick('cart')}
                    className="relative p-2 text-gray-600 hover:text-primary rounded-full hover:bg-secondary transition-colors"
                    aria-label="Winkelwagen"
                >
                    <ShoppingCartIcon className="w-6 h-6" />
                    {cart && cart.itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
                            {cart.itemCount}
                        </span>
                    )}
                </button>
                {auth?.currentUser ? (
                    <>
                        <button onClick={() => handleNavClick('account')} className="p-2 text-gray-600 hover:text-primary rounded-full hover:bg-secondary" aria-label="Mijn Account">
                            <UserCircleIcon className="w-6 h-6" />
                        </button>
                        <button onClick={handleLogout} className="hidden md:flex items-center gap-2 font-bold text-sm text-gray-600 hover:text-primary" aria-label="Uitloggen">
                           <LogOutIcon className="w-5 h-5"/> Uitloggen
                        </button>
                    </>
                ) : (
                    <div className="hidden md:flex items-center space-x-2">
                        <Button variant="primary" onClick={() => handleNavClick('login')} className="py-2 px-4 text-sm">Inloggen</Button>
                        <Button variant="accent" onClick={() => handleNavClick('signup')} className="py-2 px-4 text-sm">Registreren</Button>
                    </div>
                )}
            </div>
            <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:text-primary" aria-label="Open menu">
                    <MenuIcon className="w-6 h-6" />
                </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
              <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white p-6 shadow-2xl animate-slide-in-left">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-2">
                        <GiftIcon className="h-8 w-8 text-primary" />
                        <span className="font-display text-2xl font-bold text-primary">Gifteez.nl</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-600 hover:text-primary" aria-label="Sluit menu">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <nav className="flex flex-col space-y-4">
                     {navItems.map((item) => (
                        <button
                          key={item.page}
                          onClick={() => handleNavClick(item.page)}
                          className={`font-display font-bold text-xl text-left py-2 flex items-center gap-2 ${
                            currentPage === item.page
                              ? 'text-accent'
                              : 'text-gray-700 hover:text-primary'
                          } ${item.page === 'quiz' || item.page === 'deals' ? 'text-accent hover:text-accent-hover' : ''}`}
                        >
                          {item.icon && <item.icon className="w-6 h-6" />}
                          {item.label}
                        </button>
                    ))}
                </nav>
                <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
                     {auth?.currentUser ? (
                        <>
                            <Button variant="primary" onClick={() => handleNavClick('account')} className="w-full">
                                Mijn Account
                            </Button>
                            <button onClick={handleLogout} className="w-full text-center font-bold text-gray-600 py-2">
                                Uitloggen
                            </button>
                        </>
                     ) : (
                        <>
                            <Button variant="accent" onClick={() => handleNavClick('login')} className="w-full">
                                Inloggen
                            </Button>
                            <Button variant="primary" onClick={() => handleNavClick('signup')} className="w-full">
                                Registreren
                            </Button>
                        </>
                     )}
                </div>
              </div>
          </div>
      )}
    </header>
  );
};

export default Header;
