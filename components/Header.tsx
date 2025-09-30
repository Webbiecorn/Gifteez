
import React, { useState, useEffect, useContext } from 'react';
import { Container } from './layout/Container';
import { Page, NavigateTo } from '../types';
import { GiftIcon, HeartIcon, HeartIconFilled, MenuIcon, XIcon, UserCircleIcon, LogOutIcon, QuestionMarkCircleIcon, ShoppingCartIcon, TagIcon } from './IconComponents';
import Button from './Button';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import Logo from './Logo';

interface HeaderProps {
  navigateTo: NavigateTo;
  currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ navigateTo, currentPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const auth = useContext(AuthContext);
  const cart = useContext(CartContext);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  };

  const isFavoritesPage = currentPage === 'favorites';

  const headerClasses = `sticky top-0 z-50 transition-all duration-500 border-b ${
    isMobileMenuOpen
      ? 'bg-white shadow-2xl border-rose-100'
      : isScrolled
        ? 'bg-white/90 border-white/60 shadow-xl backdrop-blur-lg'
        : 'bg-gradient-to-r from-white/85 via-white/65 to-rose-50/60 border-transparent shadow-md supports-[backdrop-filter]:backdrop-blur-2xl'
  }`;

  const desktopNav = (
    <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/60 bg-white/70 px-2 py-1 shadow-sm backdrop-blur-md">
      {navItems.map((item) => {
        const isActive = currentPage === item.page;
        const isHighlight = item.page === 'quiz' || item.page === 'deals';

        return (
          <button
            key={item.page}
            onClick={() => handleNavClick(item.page)}
            className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 focus-visible:ring-offset-white ${
              isActive
                ? 'text-white shadow-lg shadow-rose-200/40 bg-gradient-to-r from-primary to-accent'
                : 'text-slate-600 hover:text-primary hover:bg-white hover:shadow-sm'
            } ${!isActive && isHighlight ? 'hover:text-accent/90' : ''}`}
          >
            {item.icon && (
              <item.icon
                className={`w-4 h-4 transition-transform duration-300 ${
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                }`}
              />
            )}
            <span>{item.label}</span>
            {isActive && (
              <span className="absolute inset-y-0 right-2 flex items-center">
                <span className="h-1.5 w-6 rounded-full bg-white/80" />
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <header className={headerClasses}>
      <Container size="xl" className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-4 lg:py-3">
          <div className="flex items-center gap-4 flex-shrink-0">
            <div
              className="relative flex items-center cursor-pointer group"
              onClick={() => handleNavClick('home')}
            >
              <Logo
                alt="Gifteez logo"
                className="h-12 w-auto lg:h-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                priority
              />
            </div>
            <div className="hidden xl:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-700 tracking-tight">Slimme cadeau-inspiratie</span>
              <span className="text-xs text-slate-500">AI-curated deals &amp; persoonlijke tips</span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 justify-center">
            {desktopNav}
          </div>

          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {/* Favorites */}
            <button
              onClick={() => handleNavClick(auth?.currentUser ? 'favorites' : 'login')}
              className={`group relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-slate-600 shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/40 focus-visible:ring-offset-white hover:-translate-y-0.5 hover:shadow-lg hover:border-accent/40 hover:text-accent ${
                isFavoritesPage ? 'bg-accent/20 text-accent border-accent/40 shadow-inner' : ''
              }`}
              aria-label="Bekijk favorieten"
            >
              <div className="relative">
                {isFavoritesPage ? <HeartIconFilled className="w-5 h-5" /> : <HeartIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />}
                {auth?.currentUser?.favorites && auth.currentUser.favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
                    {auth.currentUser.favorites.length}
                  </span>
                )}
              </div>
            </button>
            {/* Cart */}
            <button
              onClick={() => handleNavClick('cart')}
              className={`group relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-slate-600 shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/40 focus-visible:ring-offset-white hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/50 hover:text-primary ${
                cart && cart.itemCount > 0 ? 'border-primary/40 text-primary bg-primary/10 shadow-inner' : ''
              }`}
              aria-label="Winkelwagen"
            >
              <ShoppingCartIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              {cart && cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-xs font-bold shadow-lg animate-pulse">
                  {cart.itemCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {auth?.currentUser ? (
              <div className="flex items-center gap-2 pl-3 ml-2 border-l border-white/70">
                <button
                  onClick={() => handleNavClick('account')}
                  className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 focus-visible:ring-offset-white"
                  aria-label="Mijn Account"
                >
                  <UserCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </button>
                <button
                  onClick={() => handleNavClick('admin')}
                  className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/40 focus-visible:ring-offset-white"
                  aria-label="Admin Panel"
                  title="Admin Panel"
                >
                  ⚙️
                </button>
                <button
                  onClick={handleLogout}
                  className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/40 focus-visible:ring-offset-white"
                  aria-label="Uitloggen"
                >
                  <LogOutIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-3 ml-2 border-l border-white/70">
                <button
                  type="button"
                  onClick={() => handleNavClick('login')}
                  className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-accent shadow-sm transition-all duration-300 hover:border-accent/40 hover:bg-accent/10 hover:text-accent/90 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/30 focus-visible:ring-offset-white"
                >
                  Inloggen
                </button>
                <Button
                  variant="accent"
                  onClick={() => handleNavClick('signup')}
                  className="px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  Registreren
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden ml-auto flex items-center space-x-2">
            {/* Mobile favorites and cart */}
            <button
              onClick={() => handleNavClick(auth?.currentUser ? 'favorites' : 'login')}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-slate-600 shadow-sm transition-all duration-300 ${
                isFavoritesPage
                  ? 'border-accent/40 bg-accent/20 text-accent shadow-inner'
                  : 'hover:text-accent hover:border-accent/30 hover:bg-accent/10'
              }`}
              aria-label="Bekijk favorieten"
            >
              {isFavoritesPage ? <HeartIconFilled className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
              {auth?.currentUser?.favorites && auth.currentUser.favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
                  {auth.currentUser.favorites.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleNavClick('cart')}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-slate-600 shadow-sm transition-all duration-300 hover:border-primary/40 hover:text-primary hover:bg-primary/10 ${
                cart && cart.itemCount > 0 ? 'border-primary/40 text-primary bg-primary/10 shadow-inner' : ''
              }`}
              aria-label="Winkelwagen"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {cart && cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
                  {cart.itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-slate-600 shadow-sm transition-all duration-300 hover:border-primary/40 hover:text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/40 focus-visible:ring-offset-white"
              aria-label="Menu openen"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-gradient-to-b from-white/95 via-white/90 to-rose-50/70 shadow-2xl animate-slide-in-left border-r border-white/60 backdrop-blur-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center">
                <Logo
                  alt="Gifteez logo"
                  className="h-12 w-auto"
                  priority
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
              <nav className="p-6 space-y-3">
                {navItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => handleNavClick(item.page)}
                    className={`w-full font-display font-semibold text-lg text-left py-4 px-4 rounded-2xl flex items-center gap-3 transition-all duration-300 border ${
                      currentPage === item.page
                        ? 'text-white bg-gradient-to-r from-primary to-accent shadow-lg border-transparent'
                        : 'text-slate-700 border-white/60 bg-white/70 hover:bg-white hover:-translate-y-0.5 hover:shadow-md'
                    } ${item.page === 'quiz' || item.page === 'deals' ? 'hover:text-accent' : ''}`}
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Mobile Action Buttons */}
              <div className="p-6 border-t border-white/60 space-y-4 bg-white/60">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleNavClick(auth?.currentUser ? 'favorites' : 'login')}
                    className={`flex-1 p-3 rounded-2xl border transition-all duration-300 flex items-center justify-center gap-2 ${
                      isFavoritesPage
                        ? 'bg-accent text-white shadow-lg border-transparent'
                        : 'text-slate-700 border-white/60 bg-white/80 hover:text-accent hover:border-accent/40 hover:bg-accent/10'
                    }`}
                    aria-label="Bekijk favorieten"
                  >
                    {isFavoritesPage ? <HeartIconFilled className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                    <span className="font-medium">Favorieten</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('cart')}
                    className={`relative flex-1 p-3 text-slate-600 rounded-2xl border border-white/60 bg-white/80 transition-all duration-300 flex items-center justify-center gap-2 hover:border-primary/40 hover:text-primary hover:bg-primary/10 ${
                      cart && cart.itemCount > 0 ? 'border-primary/40 text-primary bg-primary/10 shadow-inner' : ''
                    }`}
                    aria-label="Winkelwagen"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    <span className="font-medium">Winkelwagen</span>
                    {cart && cart.itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-xs font-bold shadow-lg">
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
                      className="w-full py-3 font-semibold shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      Mijn Account
                    </Button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-center font-semibold text-slate-600 py-3 rounded-2xl border border-white/60 bg-white/70 hover:bg-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                    >
                      Uitloggen
                    </button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="accent"
                      onClick={() => handleNavClick('login')}
                      className="w-full py-3 font-semibold shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      Inloggen
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleNavClick('signup')}
                      className="w-full py-3 font-semibold shadow-sm hover:shadow-lg transition-all duration-300"
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
