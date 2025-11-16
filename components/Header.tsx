import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import Button from './Button'
import {
  GiftIcon,
  HeartIcon,
  HeartIconFilled,
  MenuIcon,
  XIcon,
  UserCircleIcon,
  LogOutIcon,
  TagIcon,
  BookOpenIcon,
  ChevronDownIcon,
  SearchIcon,
} from './IconComponents'
import { Container } from './layout/Container'
import Logo from './Logo'
import type { Page, NavigateTo } from '../types'

interface HeaderProps {
  navigateTo: NavigateTo
  currentPage: Page
}

// Submenu item type
interface SubMenuLink {
  page: Page
  label: string
  description?: string
  scrollTo?: string // ID om naar toe te scrollen
}

interface SubMenuDivider {
  type: 'divider'
  label: string
}

type SubMenuItem = SubMenuLink | SubMenuDivider

// Navigation items configuration with dropdown support
interface NavItem {
  page: Page
  label: string
  icon?: React.ElementType
  submenu?: SubMenuItem[]
  tone?: 'primary' | 'helper'
}

const Header: React.FC<HeaderProps> = ({ navigateTo, currentPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(null)
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const auth = useContext(AuthContext)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset'
  }, [isMobileMenuOpen])

  const navItems: NavItem[] = [
    {
      page: 'cadeausHub',
      label: 'Cadeaugidsen',
      icon: BookOpenIcon,
      tone: 'primary',
    },
    {
      page: 'deals',
      label: 'Cadeau deals',
      icon: TagIcon,
      submenu: [
        {
          page: 'deals',
          label: '🎁 Alle Collecties',
          description: 'Browse door ons complete aanbod',
        },
        {
          page: 'deals',
          label: '🏆 Top 20 Bestsellers',
          description: 'Meest gekochte cadeaus van nu',
          scrollTo: 'budget-filters',
        },
        {
          page: 'deals',
          label: '🌱 Duurzame Cadeaus',
          description: 'Bewuste en ecologische geschenken',
          scrollTo: 'category-duurzame-cadeaus-slygad',
        },
        {
          page: 'deals',
          label: '🎉 Feest & Party',
          description: 'Alles voor onvergetelijke feesten',
          scrollTo: 'category-feest-party-partypro',
        },
      ],
    },
    {
      page: 'blog',
      label: 'Inspiratie',
      icon: BookOpenIcon,
      submenu: [
        {
          page: 'blog',
          label: '📰 Alle Artikelen',
          description: "Inspiratie, tips en how-to's",
        },
      ],
    },
    {
      page: 'giftFinder',
      label: 'Cadeaucoach (AI)',
      icon: GiftIcon,
      tone: 'helper',
    },
    { page: 'about', label: 'Over Ons', icon: BookOpenIcon },
    { page: 'contact', label: 'Contact', icon: BookOpenIcon },
  ]

  const handleNavClick = (page: Page, scrollTo?: string) => {
    navigateTo(page)
    setIsMobileMenuOpen(false)
    setOpenDropdown(null)

    // Scroll naar specifiek element als scrollTo is opgegeven
    if (scrollTo) {
      // Wacht tot de pagina is geladen, probeer dan te scrollen
      const attemptScroll = (attempts = 0, maxAttempts = 20) => {
        const element = document.getElementById(scrollTo)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else if (attempts < maxAttempts) {
          // Probeer opnieuw na 100ms als element nog niet bestaat
          setTimeout(() => attemptScroll(attempts + 1, maxAttempts), 100)
        }
      }

      // Start met kleine delay voor page transition
      setTimeout(() => attemptScroll(), 150)
    }
  }

  const handleLogout = () => {
    auth?.logout()
    setIsMobileMenuOpen(false)
    setOpenDropdown(null)
    navigateTo('home')
  }

  const isFavoritesPage = currentPage === 'favorites'

  const headerClasses = `sticky top-0 z-50 transition-all duration-300 ${
    isMobileMenuOpen
      ? 'bg-white shadow-xl border-b border-gray-100'
      : isScrolled
        ? 'bg-white/95 border-b border-gray-100 shadow-lg backdrop-blur-xl'
        : 'bg-white border-b border-gray-100 shadow-sm'
  }`

  const desktopNav = (
    <nav className="hidden lg:flex items-center gap-1" aria-label="Hoofdnavigatie">
      {navItems.map((item) => {
        const isActive = currentPage === item.page
        const hasSubmenu = item.submenu && item.submenu.length > 0
        const isDropdownOpen = openDropdown === item.label
        const toneIdleClasses = (() => {
          if (item.tone === 'primary') {
            return 'text-primary border-primary/30 bg-white/90 shadow-sm hover:bg-primary/5 hover:text-primary'
          }
          if (item.tone === 'helper') {
            return 'text-gray-500 hover:text-primary/80 hover:bg-gray-50 border-gray-100'
          }
          return 'text-gray-700 hover:text-primary hover:bg-gray-50 border-transparent'
        })()

        const handleMouseEnter = () => {
          if (hasSubmenu) {
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current)
              closeTimeoutRef.current = null
            }
            setOpenDropdown(item.label)
          }
        }

        const handleMouseLeave = () => {
          if (hasSubmenu) {
            closeTimeoutRef.current = setTimeout(() => {
              setOpenDropdown(null)
            }, 150) // 150ms delay before closing
          }
        }

        return (
          <div
            key={item.page}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              data-testid={`nav-${item.page}`}
              onClick={() => handleNavClick(item.page)}
              aria-label={`Ga naar ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
              aria-expanded={hasSubmenu ? isDropdownOpen : undefined}
              className={`relative flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 ${
                isActive
                  ? 'text-white bg-gradient-to-r from-primary to-rose-600 shadow-lg shadow-primary/20 border-transparent'
                  : toneIdleClasses
              }`}
            >
              {item.icon && (
                <item.icon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isActive ? '' : 'group-hover:scale-110'
                  }`}
                  aria-hidden="true"
                />
              )}
              <span>{item.label}</span>
              {hasSubmenu && (
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              )}
            </button>

            {/* Dropdown Menu */}
            {hasSubmenu && isDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in"
                onMouseEnter={() => {
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current)
                    closeTimeoutRef.current = null
                  }
                  setOpenDropdown(item.label)
                }}
                onMouseLeave={() => {
                  closeTimeoutRef.current = setTimeout(() => {
                    setOpenDropdown(null)
                  }, 150)
                }}
              >
                {item.submenu!.map((subItem, index) => {
                  // Render divider
                  if ('type' in subItem && subItem.type === 'divider') {
                    return (
                      <div
                        key={`divider-${index}`}
                        className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-t border-gray-100 mt-1 pt-3"
                      >
                        {subItem.label}
                      </div>
                    )
                  }

                  // TypeScript now knows this is SubMenuLink
                  const linkItem = subItem as SubMenuLink

                  // Render regular link
                  return (
                    <button
                      key={`${linkItem.page}-${index}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (closeTimeoutRef.current) {
                          clearTimeout(closeTimeoutRef.current)
                        }
                        setOpenDropdown(null)
                        handleNavClick(linkItem.page, linkItem.scrollTo)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 group"
                    >
                      <div className="font-semibold text-sm text-gray-900 group-hover:text-primary transition-colors">
                        {linkItem.label}
                      </div>
                      {linkItem.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{linkItem.description}</div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Search Icon */}
      <button
        onClick={() => {
          // TODO: Implement search functionality
        }}
        aria-label="Zoeken"
        className="relative flex items-center justify-center rounded-lg w-10 h-10 text-gray-700 hover:text-primary hover:bg-gray-50 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
      >
        <SearchIcon
          className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
          aria-hidden="true"
        />
      </button>
    </nav>
  )

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:shadow-lg focus:font-semibold"
      >
        Spring naar hoofdinhoud
      </a>

      <header className={headerClasses}>
        <Container size="xl" className="px-4 sm:px-6 lg:px-8">
          {/* Grid Layout: 3 equal columns for perfect centering */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 py-3.5 lg:grid-cols-[minmax(200px,1fr)_auto_minmax(200px,1fr)]">
            {/* Left: Logo */}
            <div className="flex items-center">
              <div className="relative cursor-pointer group" onClick={() => handleNavClick('home')}>
                <Logo
                  alt="Gifteez.nl - Cadeaugidsen & Cadeaucoach"
                  className="h-11 w-auto transition-transform duration-200 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Center: Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">{desktopNav}</div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-1.5 justify-end">
              {/* Favorites - Only show when logged in */}
              {auth?.currentUser && (
                <button
                  onClick={() => handleNavClick('favorites')}
                  className={`hidden md:flex group relative h-10 w-10 items-center justify-center rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 ${
                    isFavoritesPage
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  aria-label="Bekijk favorieten"
                >
                  <div className="relative">
                    {isFavoritesPage ? (
                      <HeartIconFilled className="w-5 h-5" />
                    ) : (
                      <HeartIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    )}
                    {auth.currentUser.favorites && auth.currentUser.favorites.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-bold ring-2 ring-white">
                        {auth.currentUser.favorites.length}
                      </span>
                    )}
                  </div>
                </button>
              )}

              {/* Auth Section - Hidden on mobile, shown from lg */}
              {auth?.currentUser ? (
                <div className="hidden lg:flex items-center gap-2 pl-2 ml-2 border-l border-gray-200">
                  <button
                    onClick={() => handleNavClick('account')}
                    className="group relative h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-200 hover:border-primary/30 hover:text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50"
                    aria-label="Mijn Account"
                  >
                    <UserCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  </button>
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="group relative h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                    aria-label="Admin Panel"
                    title="Admin Panel"
                  >
                    <span className="text-base">⚙️</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="group relative h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500"
                    aria-label="Uitloggen"
                  >
                    <LogOutIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  </button>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2 pl-2 ml-2 border-l border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleNavClick('login')}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50"
                  >
                    Inloggen
                  </button>
                  <Button
                    variant="primary"
                    onClick={() => handleNavClick('signup')}
                    className="px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Registreren
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-200 hover:border-primary/30 hover:text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50"
                aria-label="Menu openen"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </Container>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Mobiel menu"
          >
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl animate-slide-in-right flex flex-col">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <Logo
                  alt="Gifteez.nl - Cadeaugidsen & Cadeaucoach"
                  className="h-10 w-auto"
                  priority
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 transition-all duration-200"
                  aria-label="Sluit menu"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-2" aria-label="Mobiele navigatie">
                  {navItems.map((item) => {
                    const isActive = currentPage === item.page
                    const hasSubmenu = item.submenu && item.submenu.length > 0
                    const isExpanded = mobileExpandedMenu === item.label
                    const mobileToneClasses = (() => {
                      if (item.tone === 'primary') {
                        return 'text-primary border border-primary/30 bg-primary/5'
                      }
                      if (item.tone === 'helper') {
                        return 'text-gray-500 border border-gray-100'
                      }
                      return 'text-gray-700 border border-transparent'
                    })()

                    return (
                      <div key={item.page}>
                        <button
                          data-testid={`nav-${item.page}`}
                          onClick={() => {
                            if (hasSubmenu) {
                              setMobileExpandedMenu(isExpanded ? null : item.label)
                            } else {
                              handleNavClick(item.page)
                            }
                          }}
                          aria-label={`Ga naar ${item.label}`}
                          aria-current={isActive ? 'page' : undefined}
                          aria-expanded={hasSubmenu ? isExpanded : undefined}
                          className={`w-full text-left py-3 px-4 rounded-lg flex items-center gap-3 font-semibold transition-all duration-200 ${
                            isActive
                              ? 'text-white bg-gradient-to-r from-primary to-rose-600 shadow-md border border-transparent'
                              : `${mobileToneClasses} hover:bg-gray-50`
                          }`}
                        >
                          {item.icon && <item.icon className="w-5 h-5" aria-hidden="true" />}
                          <span className="flex-1">{item.label}</span>
                          {hasSubmenu && (
                            <ChevronDownIcon
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                              aria-hidden="true"
                            />
                          )}
                        </button>

                        {/* Submenu Accordion */}
                        {hasSubmenu && isExpanded && (
                          <div className="mt-1 ml-4 space-y-1 animate-fade-in">
                            {item.submenu!.map((subItem, index) => {
                              // Render divider
                              if ('type' in subItem && subItem.type === 'divider') {
                                return (
                                  <div
                                    key={`divider-${index}`}
                                    className="py-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider border-t border-gray-100 mt-2 pt-3"
                                  >
                                    {subItem.label}
                                  </div>
                                )
                              }

                              // TypeScript now knows this is SubMenuLink
                              const linkItem = subItem as SubMenuLink

                              return (
                                <button
                                  key={`${linkItem.page}-${index}`}
                                  onClick={() => {
                                    setMobileExpandedMenu(null)
                                    handleNavClick(linkItem.page, linkItem.scrollTo)
                                  }}
                                  className="w-full text-left py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors duration-150"
                                >
                                  <div className="font-medium text-gray-900">{linkItem.label}</div>
                                  {linkItem.description && (
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {linkItem.description}
                                    </div>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </nav>

                {/* Mobile Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <button
                    onClick={() => handleNavClick(auth?.currentUser ? 'favorites' : 'login')}
                    className={`w-full p-3 rounded-lg border flex items-center justify-center gap-2 font-medium transition-all duration-200 ${
                      isFavoritesPage
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-rose-300 hover:bg-rose-50'
                    }`}
                  >
                    {isFavoritesPage ? (
                      <HeartIconFilled className="w-5 h-5" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    <span>Favorieten</span>
                    {auth?.currentUser?.favorites && auth.currentUser.favorites.length > 0 && (
                      <span className="ml-auto bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {auth.currentUser.favorites.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Auth Section */}
              <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50">
                {auth?.currentUser ? (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => handleNavClick('account')}
                      className="w-full py-3 font-semibold"
                    >
                      <UserCircleIcon className="w-5 h-5" />
                      Mijn Account
                    </Button>
                    <button
                      onClick={handleLogout}
                      className="w-full py-3 px-4 text-center font-semibold text-gray-700 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200"
                    >
                      <LogOutIcon className="inline-block w-5 h-5 mr-2" />
                      Uitloggen
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavClick('login')}
                      className="w-full py-3 px-4 text-center font-semibold text-gray-700 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200"
                    >
                      Inloggen
                    </button>
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
        )}
      </header>
    </>
  )
}

export default Header
