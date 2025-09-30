
import React, { useState, FormEvent, useEffect, useMemo } from 'react';
import { Container } from './layout/Container';
import ImageWithFallback from './ImageWithFallback';
import PlannerIllustration from './PlannerIllustration';
import LazyViewport from './LazyViewport';
import { topicImage, Topics } from '../services/images';
import { Testimonial, NavigateTo } from '../types';
import Button from './Button';
import TestimonialCard from './TestimonialCard';
import { QuestionMarkCircleIcon, BookOpenIcon, TagIcon, CalendarIcon } from './IconComponents';
import AmazonTeaser from './AmazonTeaser';
import QuizIllustration from './QuizIllustration';
import { gaPageView } from '../services/googleAnalytics';
import { pinterestPageVisit } from '../services/pinterestTracking';
import { useBlogContext } from '../contexts/BlogContext';

interface HomePageProps {
  navigateTo: NavigateTo;
}

const HERO_MASCOT_VERSION = 'v20250928-new';

const curatedCollections = [
  {
    title: 'Top Cadeaus voor Foodies',
    description: 'Verras de thuiskok of fijnproever met deze culinaire toppers.',
    img: '/images/collection-foodie.jpg'
  },
  {
    title: 'Brievenbuscadeaus',
    description: 'Een kleine verrassing die altijd past. Perfect om iemand zomaar te laten weten dat je aan ze denkt.',
    img: '/images/collection-mailbox.jpg'
  },
  {
    title: 'Voor de Reiziger',
    description: 'Handige en inspirerende cadeaus voor de avonturier in je leven.',
    img: '/images/collection-travel.jpg'
  }
];

const testimonials: Testimonial[] = [
  { quote: "Super handige tool, vond in 1 minuut iets voor mijn zus. Een echte aanrader!", author: "Linda de Vries" },
  { quote: "De AI GiftFinder is geniaal. Nooit meer keuzestress voor verjaardagen.", author: "Mark Jansen" },
];

const recipients = ["Partner", "Vriend(in)", "Familielid", "Collega", "Kind"];
const HomePage: React.FC<HomePageProps> = ({ navigateTo }) => {
  const { posts: blogPosts } = useBlogContext();

  const trendingPosts = useMemo(() => blogPosts.slice(0, 3), [blogPosts]);

  const latestPosts = useMemo(() => {
    const trendingSlugs = new Set(trendingPosts.map((post) => post.slug));
    const remaining = blogPosts.filter((post) => !trendingSlugs.has(post.slug));
    return remaining.slice(0, 3);
  }, [blogPosts, trendingPosts]);

  const getReadingTimeMinutes = (text: string) => {
    if (!text) return 1;
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };
  // Pinterest PageVisit tracking for homepage
  useEffect(() => {
    pinterestPageVisit('homepage', `home_${Date.now()}`);
    // Google Analytics pageview tracking
    gaPageView('/', 'Gifteez.nl - AI Gift Finder');
  }, []);
  const [previewRecipient, setPreviewRecipient] = useState<string>(recipients[0]);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Basic SEO meta for home page
  useEffect(() => {
    document.title = 'Gifteez.nl — Vind binnen 30 seconden het perfecte cadeau met AI';
    const ensure = (selector: string, create: () => HTMLElement) => {
      let el = document.head.querySelector(selector) as HTMLElement | null;
      if (!el) { el = create(); document.head.appendChild(el); }
      return el;
    };
    const description = 'Gebruik de AI GiftFinder om razendsnel een persoonlijk cadeau-idee te vinden voor elke gelegenheid en elk budget.';
    const metaDesc = ensure('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }));
    metaDesc.setAttribute('content', description);
    const canonical = ensure('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel='canonical'; return l; });
    canonical.setAttribute('href', window.location.origin + '/');
    const setMeta = (attr: 'name'|'property', key: string, content: string) => {
      const sel = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`;
      const el = ensure(sel, () => { const m = document.createElement('meta'); m.setAttribute(attr, key); return m; });
      el.setAttribute('content', content);
    };
    setMeta('property','og:title','Gifteez.nl — Vind binnen 30 seconden het perfecte cadeau met AI');
    setMeta('property','og:description', description);
    setMeta('property','og:type','website');
    setMeta('property','og:url', window.location.origin + '/');
    setMeta('property','og:image', window.location.origin + '/og-image.png');
    setMeta('name','twitter:card','summary_large_image');
    setMeta('name','twitter:title','Gifteez.nl — Vind binnen 30 seconden het perfecte cadeau met AI');
    setMeta('name','twitter:description', description);
    setMeta('name','twitter:image', window.location.origin + '/og-image.png');
  }, []);

  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newsletterEmail && /\S+@\S+\.\S+/.test(newsletterEmail)) {
      // In a real app, you'd send this to your backend
      console.log("Subscribing email:", newsletterEmail);
      navigateTo('download');
    }
  };

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-24 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-32 right-1/3 h-96 w-96 rounded-full bg-pink-200/20 blur-3xl" aria-hidden="true" />
          <div className="absolute top-16 right-12 h-72 w-72 rounded-full bg-red-200/40 blur-3xl" aria-hidden="true" />
        </div>
        <Container size="xl" className="relative z-10 py-24 lg:py-32">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="space-y-8 text-center lg:text-left">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-red-600 shadow-sm shadow-red-100 lg:mx-0">
                <span className="text-lg">🎁</span>
                AI GiftFinder met persoonlijke touch
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight">
                Vind het perfecte cadeau, <span className="text-red-500">moeiteloos</span>.
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Elke dag nieuwe inspiratie, afgestemd op jouw ontvanger. Laat onze slimme Cadeauzoeker het voorwerk doen terwijl jij geniet van het verrassingseffect.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
                <Button
                  variant="accent"
                  onClick={() => navigateTo('giftFinder')}
                  className="bg-red-500 hover:bg-red-600 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white text-white px-10 sm:px-12 py-4 sm:py-5 rounded-2xl font-semibold text-lg md:text-xl shadow-lg shadow-red-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Start de Cadeauzoeker
                </Button>
                <button
                  type="button"
                  onClick={() => navigateTo('quiz')}
                  className="flex items-center gap-2 rounded-2xl border border-red-200 bg-white/90 px-5 py-3 text-sm font-semibold text-red-600 shadow-sm transition hover:border-red-300 hover:bg-white hover:shadow-md"
                >
                  🎯 Doe de Cadeau Quiz
                </button>
              </div>
              <div className="hidden flex-wrap items-center justify-center gap-6 text-left lg:justify-start sm:flex">
                <div className="rounded-2xl bg-white/90 px-5 py-4 shadow-sm shadow-red-100">
                  <div className="text-3xl font-black text-red-500">1000+</div>
                  <div className="text-sm font-semibold text-gray-500">Cadeau ideeën</div>
                </div>
                <div className="rounded-2xl bg-white/90 px-5 py-4 shadow-sm shadow-red-100">
                  <div className="text-3xl font-black text-red-500">30</div>
                  <div className="text-sm font-semibold text-gray-500">Seconden tot match</div>
                </div>
                <div className="rounded-2xl bg-white/90 px-5 py-4 shadow-sm shadow-red-100">
                  <div className="flex items-center gap-2 text-3xl font-black text-red-500">
                    4.8
                    <span className="text-base">⭐</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-500">Gebruikersscore</div>
                </div>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-center">
              <div className="relative w-full max-w-[480px] -ml-4 lg:-ml-8">
                {/* Floating decorative elements */}
                <div className="hero-floating hero-floating--sparkle absolute -top-2 right-8 text-2xl" aria-hidden="true">✨</div>
                <div className="hero-floating hero-floating--heart absolute top-6 right-10 text-xl" aria-hidden="true">❤️</div>
                <div className="hero-floating hero-floating--star absolute bottom-16 -left-2 text-2xl" aria-hidden="true">🌟</div>
                
                <div className="hero-gift-container relative flex items-center justify-center">
                  <div className="hero-aura absolute inset-0" aria-hidden="true"></div>
                  <ImageWithFallback
                    src={`/images/gifteez-mascotte-wavin.png?${HERO_MASCOT_VERSION}`}
                    alt="Vrolijke Gifteez cadeaumascotte met rode strik"
                    width={520}
                    height={520}
                    fit="contain"
                    className="hero-gift-wave relative z-10 w-full max-w-[380px] drop-shadow-[0_25px_30px_rgba(229,57,53,0.25)] hover:scale-105 transition-transform duration-500 cursor-pointer"
                    showSkeleton
                  />
                </div>
                
                {/* Animated shadow/podium */}
                <div className="hero-podium relative flex w-full items-center justify-center">
                  <div className="h-3 w-40 rounded-full bg-gradient-to-r from-rose-200 via-rose-100 to-amber-100 opacity-80 hero-shadow-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trending Guides */}
      <Container size="xl" className="opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="text-center mb-12">
          <h2 className="typo-h2 mb-4">Trending Cadeaugidsen</h2>
          <p className="typo-body text-slate-600 max-w-2xl mx-auto">Ontdek onze populairste gidsen voor cadeau-inspiratie</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trendingPosts.length > 0 ? (
            trendingPosts.map((post, i) => {
              const formattedDate = new Date(post.publishedDate).toLocaleDateString('nl-NL', {
                month: 'short',
                day: 'numeric'
              });

              return (
                <LazyViewport key={post.slug}>
                  {(visible) => (
                    <div
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden group cursor-pointer opacity-0 animate-fade-in-up transform hover:scale-105 transition-all duration-300 border border-gray-100"
                      style={{ animationDelay: `${200 + i * 100}ms` }}
                      onClick={() => navigateTo('blogDetail', { slug: post.slug })}
                    >
                      <div className="relative overflow-hidden">
                        {visible && (
                          <ImageWithFallback
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-primary text-xs font-semibold">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 space-y-3">
                        <h3 className="font-display text-xl font-bold text-primary group-hover:text-accent transition-colors duration-300">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="inline-flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            {formattedDate}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <BookOpenIcon className="w-4 h-4" />
                            {getReadingTimeMinutes(post.excerpt)} min
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </LazyViewport>
              );
            })
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white/70 p-10 text-center shadow-inner">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpenIcon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary">Nog geen cadeaugidsen</h3>
              <p className="mt-2 text-sm text-gray-600">Publiceer je eerste blogpost om deze sectie te vullen.</p>
            </div>
          )}
        </div>
  </Container>

      {/* GiftFinder Preview */}
  <section className="bg-gradient-to-br from-rose-50 via-white to-orange-50/40 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-accent rounded-2xl mb-6 shadow-xl ring-4 ring-accent/25">
                <span className="text-3xl">🎯</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight">
                Probeer de <span className="text-accent">GiftFinder</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Kies voor wie je een cadeau zoekt en onze AI doet de rest. Ontvang direct gepersonaliseerde cadeau-ideeën!
              </p>
            </div>

            {/* Interactive Form Card */}
            <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100/70 overflow-hidden transition-shadow">
              {/* Top gradient bar */}
              <div className="h-2 bg-gradient-to-r from-primary via-accent to-highlight"></div>

              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Form Section */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Voor wie zoek je een cadeau?
                      </label>
                      <div className="relative">
                        <select
                          value={previewRecipient}
                          onChange={(e) => setPreviewRecipient(e.target.value)}
                          className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-highlight/40 focus:border-accent bg-white shadow-sm transition-all duration-200 appearance-none"
                          aria-label="Voor wie zoek je een cadeau?"
                        >
                          {recipients.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="accent"
                      onClick={() => navigateTo('giftFinder', { recipient: previewRecipient })}
                      className="w-full px-8 py-4 text-lg font-bold bg-accent hover:bg-accent-hover text-white shadow-lg hover:shadow-accent/40 transform hover:-translate-y-0.5 transition-all duration-300 rounded-xl"
                    >
                      <span className="flex items-center justify-center gap-3">
                        <span>🔍</span>
                        Vind Nu Cadeau Ideeën
                        <span>✨</span>
                      </span>
                    </Button>
                  </div>

                  {/* Features Section */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-rose-50 to-orange-50/60 rounded-xl border border-muted-rose">
                        <div className="flex-shrink-0 w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                          <span className="text-white text-lg">🤖</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">AI-Gedreven</h3>
                          <p className="text-sm text-gray-600">Slimme algoritmes voor perfecte matches</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-rose-50 to-white rounded-xl border border-muted-rose/70">
                        <div className="flex-shrink-0 w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                          <span className="text-white text-lg">⚡</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Direct Resultaten</h3>
                          <p className="text-sm text-gray-600">Binnen 30 seconden persoonlijke suggesties</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-rose-50 to-orange-50/40 rounded-xl border border-muted-rose">
                        <div className="flex-shrink-0 w-10 h-10 bg-highlight rounded-lg flex items-center justify-center text-primary">
                          <span className="text-white text-lg">🎯</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">100% Gepersonaliseerd</h3>
                          <p className="text-sm text-gray-600">Op basis van interesses en relatie</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom stats */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="hidden flex-wrap justify-center gap-10 text-center sm:flex">
                    <div>
                      <div className="text-2xl font-bold text-accent">1000+</div>
                      <div className="text-sm text-primary/60">Cadeau Ideeën</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">30</div>
                      <div className="text-sm text-primary/60">Seconden</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">4.8/5</div>
                      <div className="text-sm text-primary/60">Gebruikers Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quiz CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <div className="relative bg-gradient-to-br from-primary via-primary to-red-700 text-white p-8 md:p-12 rounded-2xl shadow-2xl overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
            <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-white rounded-full translate-y-10"></div>
            <div className="absolute bottom-0 right-1/3 w-16 h-16 bg-white rounded-full translate-y-8"></div>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-full mb-6 mx-auto lg:mx-0 shadow-lg">
                  <QuestionMarkCircleIcon className="w-10 h-10 text-primary"/>
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  Vind je het lastig kiezen?
                </h2>
                <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8">
                  Doe onze leuke Cadeau Quiz en ontdek in een paar klikken welk type cadeaus perfect passen bij jouw vriend(in), partner of familielid!
                </p>
                <div className="flex justify-center lg:justify-start">
                  <Button
                    variant="accent"
                    onClick={() => navigateTo('quiz')}
                    className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Doe de Quiz
                  </Button>
                </div>
              </div>

              <div className="flex-1 max-w-md w-full">
                <div className="relative">
                  <div className="absolute -inset-4 bg-white/10 rounded-2xl blur-lg"></div>
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <QuizIllustration className="w-full h-auto drop-shadow-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deals CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
        <div className="relative overflow-hidden">
          {/* Animated background with multiple gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/20 via-transparent to-pink-500/20 rounded-3xl"></div>

          {/* Floating geometric shapes */}
          <div className="absolute top-8 left-8 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-16 right-16 w-16 h-16 bg-white/5 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-12 left-12 w-12 h-12 bg-white/8 rounded-full blur-md animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-8 right-8 w-24 h-24 bg-white/6 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="relative z-10 p-8 md:p-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                {/* Enhanced icon with glow effect */}
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl mb-8 shadow-2xl border border-white/20 group hover:bg-white/30 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <TagIcon className="w-12 h-12 text-white relative z-10 group-hover:scale-110 transition-transform duration-300"/>
                </div>

                {/* Enhanced title with gradient text */}
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent leading-tight">
                  Deals & Top Cadeaus
                </h2>

                {/* Enhanced description */}
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-4 font-light">
                  Ontdek onze zorgvuldig geselecteerde collectie van de
                  <span className="font-semibold text-yellow-300"> beste deals </span>
                  en
                  <span className="font-semibold text-yellow-300"> populairste cadeaus</span>
                </p>
                <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                  Uitgekozen door onze experts voor maximale kwaliteit en waarde
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Beste Prijzen</h3>
                  <p className="text-white/80 text-sm">Onverslaanbare deals</p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Top Kwaliteit</h3>
                  <p className="text-white/80 text-sm">Alleen het beste</p>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Expert Selectie</h3>
                  <p className="text-white/80 text-sm">Professioneel gekozen</p>
                </div>
              </div>

              {/* Enhanced CTA button */}
              <div className="text-center">
                <Button
                  variant="primary"
                  onClick={() => navigateTo('deals')}
                  className="px-12 py-5 text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-900 text-white hover:from-blue-900 hover:to-blue-800 shadow-2xl hover:shadow-blue-900/50 transform hover:scale-105 transition-all duration-500 border-4 border-blue-700 rounded-2xl backdrop-blur-sm"
                >
                  <span className="flex items-center gap-3 font-extrabold">
                    Ontdek de Deals
                    <span className="text-2xl animate-bounce">🚀</span>
                  </span>
                </Button>

                {/* Subtle hint */}
                <p className="text-white/60 text-sm mt-4 font-light">
                  Meer dan 100+ cadeaus om uit te kiezen • Dagelijks bijgewerkt
                </p>
              </div>
            </div>
          </div>

          {/* Bottom wave effect */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" className="w-full h-12 text-light-bg">
              <path fill="currentColor" d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
              <path fill="currentColor" d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
              <path fill="currentColor" d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Amazon Teaser Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
        <AmazonTeaser
          items={[
            { title: 'JBL Tune 510BT On‑Ear Koptelefoon', imageUrl: 'https://m.media-amazon.com/images/I/61FUX7QmifS._AC_SX522_.jpg', affiliateUrl: 'https://www.amazon.nl/JBL-Tune-510BT-ear-Purebas-geluid/dp/B08WM1V5P1?tag=gifteez77-21' },
            { title: 'LEGO Technic Formula E Porsche 99X (Pull-Back)', imageUrl: 'https://m.media-amazon.com/images/I/91XlsfEr61L._AC_SX679_.jpg', affiliateUrl: 'https://www.amazon.nl/LEGO-Electric-Pull-back-Speelgoed-42137/dp/B09BNXCN3R?tag=gifteez77-21' },
            { title: 'Rituals Sakura Cadeauset', imageUrl: 'https://m.media-amazon.com/images/I/51alCigMozL._AC_SX679_.jpg', affiliateUrl: 'https://www.amazon.nl/Cadeauset-kersenbloesem-huidverzorgende-vernieuwende-eigenschappen/dp/B0B88MY4FJ?tag=gifteez77-21' },
            { title: 'Philips Hue White Ambiance E27 (2‑Pack)', imageUrl: 'https://m.media-amazon.com/images/I/71efTkPojQL._AC_SX522_.jpg', affiliateUrl: 'https://www.amazon.nl/Philips-Hue-Standaard-Lamp-2-Pack/dp/B099NP74QF?tag=gifteez77-21' },
          ]}
          note="Amazon‑links geüpdatet. Tag: gifteez77-21."
        />
      </section>

       {/* Shop CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
        <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-8 md:p-12 rounded-2xl shadow-2xl text-center overflow-hidden relative">
          {/* Background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute top-8 right-8 w-12 h-12 bg-white rounded-full"></div>
            <div className="absolute bottom-6 left-1/4 w-8 h-8 bg-white rounded-full"></div>
            <div className="absolute bottom-4 right-1/3 w-10 h-10 bg-white rounded-full"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <BookOpenIcon className="w-10 h-10 text-white"/>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Nieuw in de Winkel</h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-8">
              Download ons premium e-book: "Het Jaar Rond Perfecte Cadeaus" en word een expert in het geven van geschenken!
            </p>
            <Button
              variant="accent"
              onClick={() => navigateTo('download')} // Temporarily redirect to download instead of shop
              className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Download E-book
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">Laatste Blogs & Cadeaugidsen</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Blijf op de hoogte van de nieuwste cadeau-trends en tips</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestPosts.length > 0 ? latestPosts.map((post, index) => (
            <LazyViewport key={post.slug}>
              {(visible) => (
                <div
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden group cursor-pointer opacity-0 animate-fade-in-up transform hover:scale-105 transition-all duration-300 border border-gray-100"
                  style={{ animationDelay: `${1200 + index * 200}ms` }}
                  onClick={() => navigateTo('blogDetail', { slug: post.slug })}
                >
                  <div className="relative overflow-hidden">
                    {visible && (
                      <ImageWithFallback
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-primary text-sm font-medium">
                        Blog
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-primary group-hover:text-accent transition-colors duration-300 mb-3">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Lees meer</span>
                      <span className="text-accent font-medium text-sm">→</span>
                    </div>
                  </div>
                </div>
              )}
            </LazyViewport>
          )) : (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white/70 p-10 text-center shadow-inner">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpenIcon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary">Nog geen extra guides</h3>
              <p className="mt-2 text-sm text-gray-600">Zodra er meerdere artikelen beschikbaar zijn, tonen we hier de nieuwste cadeaugidsen.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lead Magnet Section */}
      <section className="bg-gradient-to-r from-light-bg to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 opacity-0 animate-fade-in-up" style={{ animationDelay: '1400ms' }}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-6">
                <span className="text-2xl">📅</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
                Download je GRATIS Cadeau Planner
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Meld je aan voor onze nieuwsbrief en ontvang direct de 'Ultieme Cadeau Planner'.
                Mis nooit meer een verjaardag en sta altijd klaar met het perfecte cadeau!
              </p>

              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Jouw e-mailadres"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-gray-800"
                    required
                  />
                  <Button
                    type="submit"
                    variant="accent"
                    className="px-8 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
                  >
                    Download Nu
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Geen spam, alleen waardevolle cadeau-tips. Je kunt je altijd uitschrijven.
                </p>
              </form>
            </div>

            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-primary/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-secondary to-light-bg rounded-2xl p-8 shadow-2xl border border-gray-100">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🎁</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-primary mb-2">Ultieme Cadeau Planner</h3>
                    <p className="text-gray-600 text-sm">PDF gids met 365 cadeau-ideeën</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section className="bg-gradient-to-b from-white to-light-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 opacity-0 animate-fade-in-up" style={{ animationDelay: '1600ms' }}>
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">Wat Gebruikers Zeggen</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Ontdek waarom duizenden mensen Gifteez gebruiken voor hun cadeau-ideeën</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 border border-gray-100 opacity-0 animate-fade-in-up transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${1600 + index * 200}ms` }}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
