
import React, { useState, FormEvent, useEffect, useMemo } from 'react';
import { animated, useSpring, to as springTo } from '@react-spring/web';
import { Container } from './layout/Container';
import ImageWithFallback from './ImageWithFallback';
import LazyViewport from './LazyViewport';
import { Testimonial, NavigateTo } from '../types';
import Button from './Button';
import TestimonialCard from './TestimonialCard';
import { QuestionMarkCircleIcon, BookOpenIcon, TagIcon, CalendarIcon } from './IconComponents';
import { useBlogContext } from '../contexts/BlogContext';
import { BlogPostSkeleton } from './HomePageSkeletons';

interface HomePageProps {
  navigateTo: NavigateTo;
}

const testimonials: Testimonial[] = [
  { quote: "Super handige tool, vond in 1 minuut iets voor mijn zus. Een echte aanrader!", author: "Linda de Vries" },
  { quote: "De AI GiftFinder is geniaal. Nooit meer keuzestress voor verjaardagen.", author: "Mark Jansen" },
  { quote: "Eindelijk een site die begrijpt wat ik zoek. Binnen 30 seconden had ik 5 perfecte ideeën!", author: "Sophie van Dijk" },
  { quote: "De deals sectie heeft me zoveel geld bespaard. Echt geweldige prijzen!", author: "Thomas Bakker" },
  { quote: "Ik gebruik Gifteez nu voor alle cadeaus. De quiz is super leuk en accuraat!", author: "Emma Peters" },
  { quote: "Als je niet weet wat te geven, moet je hier zijn. Simpel, snel en effectief.", author: "Ruben Visser" },
];

const recipients = ["Partner", "Man", "Vrouw", "Vriend(in)", "Familielid", "Collega", "Kind"];

const getReadingTimeMinutes = (text: string): number => {
  const words = text ? text.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 200));
};


const HomePage: React.FC<HomePageProps> = ({ navigateTo }) => {
  const { posts: blogPosts, loading: blogLoading } = useBlogContext();

  const [previewRecipient, setPreviewRecipient] = useState<string>(recipients[0]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  const [heroImageSpring, heroImageApi] = useSpring(() => ({
    opacity: prefersReducedMotion ? 1 : 0,
    y: prefersReducedMotion ? 0 : 32,
    scale: 1
  }));
  const [ctaSpring, ctaApi] = useSpring(() => ({
    opacity: prefersReducedMotion ? 1 : 0,
    y: prefersReducedMotion ? 0 : 20,
    scale: 1
  }));

  // Trending: Most recent posts (simulates popularity - could track views in future)
  const trendingPosts = useMemo(() => {
    // Sort by published date descending and take top 3 most recent
    return [...blogPosts]
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
      .slice(0, 3);
  }, [blogPosts]);

  // Latest: Same as trending for now, but separated for future differentiation
  const latestPosts = useMemo(() => {
    return [...blogPosts]
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
      .slice(0, 3);
  }, [blogPosts]);

  useEffect(() => {
    document.title = 'Gifteez.nl — Vind binnen 30 seconden het perfecte cadeau met AI';

    const ensure = (selector: string, create: () => HTMLElement) => {
      let el = document.head.querySelector(selector) as HTMLElement | null;
      if (!el) {
        el = create();
        document.head.appendChild(el);
      }
      return el;
    };

    const description = 'Gebruik de AI GiftFinder om razendsnel een persoonlijk cadeau-idee te vinden voor elke gelegenheid en elk budget.';
    const metaDesc = ensure('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }));
    metaDesc.setAttribute('content', description);

    const canonical = ensure('link[rel="canonical"]', () => {
      const link = document.createElement('link');
      link.rel = 'canonical';
      return link;
    });
    canonical.setAttribute('href', window.location.origin + '/');

    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      const selector = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`;
      const element = ensure(selector, () => {
        const meta = document.createElement('meta');
        meta.setAttribute(attr, key);
        return meta;
      });
      element.setAttribute('content', content);
    };

    setMeta('property', 'og:title', 'Gifteez.nl — Vind binnen 30 seconden het perfecte cadeau met AI');
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', window.location.origin + '/');
    setMeta('property', 'og:image', window.location.origin + '/og-image.png');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', 'Gifteez.nl — Vind binnen 30 seconden het perfecte cadeau met AI');
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', window.location.origin + '/og-image.png');
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      heroImageApi.start({ opacity: 1, y: 0, scale: 1, immediate: true });
      return;
    }

    heroImageApi.start({
      to: async (next) => {
        await next({ opacity: 1, y: 0, scale: 1.04, config: { tension: 220, friction: 20 } });
        await next({ y: -4, scale: 1, config: { tension: 200, friction: 18 } });
        await next({ y: 0, config: { tension: 180, friction: 20 } });
      },
      delay: 120
    });
  }, [heroImageApi, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      ctaApi.start({ opacity: 1, y: 0, scale: 1, immediate: true });
      return;
    }

    ctaApi.start({
      to: async (next) => {
        await next({ opacity: 1, y: 0, scale: 1.05, config: { tension: 240, friction: 18 } });
        await next({ scale: 1, config: { tension: 250, friction: 22 } });
      },
      delay: 180
    });
  }, [ctaApi, prefersReducedMotion]);

  const handleNewsletterSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (newsletterEmail && /\S+@\S+\.\S+/.test(newsletterEmail)) {
      console.log('Subscribing email:', newsletterEmail);
      navigateTo('download');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fdf2ff] via-[#f3efff] to-[#eef7ff]">
        <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-pink-200/30 blur-3xl hidden md:block"></div>
        <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl hidden md:block"></div>
        
        {/* Decorative floor with confetti pattern */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-64 overflow-hidden">
          <style>{`
            .confetti-floor {
              background-image: 
                radial-gradient(circle, rgba(244, 114, 182, 0.4) 1.5px, transparent 1.5px),
                radial-gradient(circle, rgba(147, 51, 234, 0.4) 1.5px, transparent 1.5px),
                radial-gradient(circle, rgba(251, 191, 36, 0.4) 1.5px, transparent 1.5px),
                radial-gradient(circle, rgba(251, 113, 133, 0.4) 1.5px, transparent 1.5px),
                radial-gradient(circle, rgba(125, 211, 252, 0.4) 1.5px, transparent 1.5px);
              background-size: 
                80px 80px,
                80px 80px,
                80px 80px,
                80px 80px,
                80px 80px;
              background-position: 
                0 0,
                20px 20px,
                40px 10px,
                60px 30px,
                10px 40px;
              transform: perspective(500px) rotateX(60deg);
              transform-origin: bottom;
              opacity: 0;
              animation: fadeInFloor 1s ease-out forwards;
            }
            @keyframes fadeInFloor {
              to { opacity: 1; }
            }
          `}</style>
          <div className="confetti-floor absolute inset-0"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#fdf2ff]"></div>
        </div>

        <Container size="xl" className="relative z-10 py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-6 py-2.5 text-sm font-semibold text-green-600 shadow-md backdrop-blur-lg border border-white/50">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400/80"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                AI-Powered Gift Discovery
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight">
                <span className="text-slate-900 block">Vind het</span>
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent block">perfecte cadeau</span>
                <span className="text-slate-900 block">in 30 seconden</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Laat onze AI 1000+ cadeaus scannen en ontvang direct een persoonlijke shortlist inclusief kooplinks en expert tips.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 text-left">
                <div className="rounded-2xl bg-white/80 p-4 shadow-lg border border-white/60 backdrop-blur-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                      <QuestionMarkCircleIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Slimme vragen</h3>
                      <p className="text-xs text-slate-600">AI leest tussen de regels en begrijpt jouw ontvanger.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 shadow-lg border border-white/60 backdrop-blur-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                      <TagIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Live deals</h3>
                      <p className="text-xs text-slate-600">Automatisch de beste prijzen en exclusieve kortingen.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 shadow-lg border border-white/60 backdrop-blur-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Altijd actueel</h3>
                      <p className="text-xs text-slate-600">Dagelijks aangevuld met seizoensfavorieten.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 shadow-lg border border-white/60 backdrop-blur-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                      <BookOpenIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Direct inspiratie</h3>
                      <p className="text-xs text-slate-600">Voor elke gelegenheid en elk type ontvanger.</p>
                    </div>
                  </div>
                </div>
              </div>

              <animated.div
                className="flex flex-col sm:flex-row items-center lg:items-start gap-4 pt-2 lg:pt-4"
                style={{
                  opacity: ctaSpring.opacity,
                  transform: springTo([ctaSpring.y, ctaSpring.scale], (y, scale) => `translate3d(0, ${y}px, 0) scale(${scale})`),
                  willChange: 'transform, opacity'
                }}
              >
                <Button
                  variant="accent"
                  onClick={() => navigateTo('giftFinder')}
                  className="text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'linear-gradient(135deg, #f43f5e, #9333ea)',
                    boxShadow: '0 25px 55px -18px rgba(147, 51, 234, 0.45)'
                  }}
                >
                  🎁 Start Gratis
                </Button>
                <button
                  type="button"
                  onClick={() => navigateTo('quiz')}
                  className="flex items-center gap-2 rounded-2xl border border-purple-200 bg-white/80 px-6 py-3.5 text-base font-semibold text-purple-700 shadow-lg transition hover:border-purple-300 hover:shadow-xl backdrop-blur-lg"
                >
                  🎯 Doe de Quiz
                </button>
              </animated.div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Gratis te gebruiken</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Beveiligd & veilig</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium">50.000+ tevreden gebruikers</span>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <animated.div
                className="relative w-full max-w-[500px] sm:max-w-[560px] lg:max-w-[620px] xl:max-w-[680px]"
                style={{
                  opacity: heroImageSpring.opacity,
                  transform: springTo([heroImageSpring.y, heroImageSpring.scale], (y, scale) => `translate3d(0, ${y}px, 0) scale(${scale})`),
                  willChange: 'transform, opacity'
                }}
              >
                {/* Animated glow effects - hidden on mobile for performance */}
                <div className="pointer-events-none absolute -inset-12 rounded-full bg-gradient-to-br from-rose-300/60 via-purple-300/50 to-amber-300/40 blur-3xl animate-pulse hidden md:block"></div>
                <div className="pointer-events-none absolute -inset-8 rounded-full bg-gradient-to-tr from-pink-200/50 via-purple-200/40 to-sky-200/30 blur-2xl hidden md:block"></div>
                
                {/* Mascotte image with float animation */}
                <div className="relative z-10 animate-float">
                  <style>{`
                    @keyframes float {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-15px); }
                    }
                    .animate-float {
                      animation: float 3s ease-in-out infinite;
                    }
                  `}</style>
                  <ImageWithFallback
                    src="/images/mascotte-hero-final2.png"
                    alt="Gifteez mascotte - vrolijk cadeau karakter"
                    className="w-full drop-shadow-2xl"
                    width={800}
                    height={800}
                    fit="contain"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
              </animated.div>
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
          {blogLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <BlogPostSkeleton key={`trending-skeleton-${index}`} />
            ))
          ) : trendingPosts.length > 0 ? (
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
                        {/* Pinterest Share Button */}
                        <div className="pt-3 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = `${window.location.origin}/blog/${post.slug}`;
                              const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(window.location.origin + post.imageUrl)}&description=${encodeURIComponent(post.title)}`;
                              window.open(pinterestUrl, '_blank', 'width=750,height=550');
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#E60023] hover:bg-[#c5001d] text-white text-xs font-semibold rounded-lg transition-colors duration-200"
                            aria-label={`Deel ${post.title} op Pinterest`}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                            </svg>
                            Pin op Pinterest
                          </button>
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

      {/* Interactive Quiz CTA - Modern Redesign */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-24 opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        {/* Decorative blur elements - hidden on mobile for performance */}
        <div className="absolute inset-0 overflow-hidden hidden md:block">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />
          <div className="absolute top-1/3 left-1/3 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-indigo-500/5 to-blue-500/5 blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Two-column layout */}
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left side - Text content */}
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2.5 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm">
                  <QuestionMarkCircleIcon className="h-4 w-4" />
                  Twijfel je nog?
                </div>
                
                <h2 className="typo-h1 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Vind je het lastig kiezen?
                </h2>
                
                <p className="typo-body mt-6 text-gray-700">
                  Doe onze interactieve Cadeau Quiz en ontdek in slechts een paar minuten welk type cadeaus 
                  perfect passen bij jouw vriend(in), partner of familielid. Geen eindeloos scrollen meer – 
                  direct de juiste richting!
                </p>

                {/* Features list */}
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Snel & Leuk</span>
                      <p className="text-sm text-gray-600">Binnen 2 minuten weet je welke cadeaus passen</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Gepersonaliseerde Tips</span>
                      <p className="text-sm text-gray-600">Aanbevelingen op maat van de ontvanger</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Direct Resultaten</span>
                      <p className="text-sm text-gray-600">Krijg meteen concrete cadeau-ideeën</p>
                    </div>
                  </li>
                </ul>

                {/* CTA Button */}
                <div className="mt-10">
                  <Button
                    variant="primary"
                    onClick={() => navigateTo('quiz')}
                    className="group px-10 py-5 text-lg font-semibold shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                  >
                    <QuestionMarkCircleIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
                    Start de Quiz
                  </Button>
                  
                  <p className="mt-4 text-sm text-gray-600">
                    Gratis & zonder account • Duurt 2 minuten
                  </p>
                </div>
              </div>

              {/* Right side - Quiz mascot image */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-900/5">
                  {/* Decorative gradient border effect */}
                  <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 opacity-20 blur" />
                  
                  <div className="relative">
                    <img 
                      src="/images/kwis-afbeelding.png" 
                      alt="Quiz Mascot - Happy gift box character" 
                      className="w-full h-auto drop-shadow-2xl transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                </div>

                {/* Floating stat badge */}
                <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-gray-900/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                      <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">5.000+</div>
                      <div className="text-xs text-gray-600">Mensen deden de quiz</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deals CTA Section - Modern Redesign */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-24 opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
        {/* Decorative blur elements - hidden on mobile for performance */}
        <div className="absolute inset-0 overflow-hidden hidden md:block">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-primary/10 to-rose-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-pink-500/5 to-orange-500/5 blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Header section */}
            <div className="mb-16 text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2.5 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm">
                <TagIcon className="h-4 w-4" />
                Dagelijks bijgewerkt
              </div>
              
              <h2 className="typo-h1 bg-gradient-to-r from-primary via-rose-600 to-orange-600 bg-clip-text text-transparent">
                Deals & Top Cadeaus
              </h2>
              
              <p className="typo-lead mx-auto mt-6 max-w-3xl text-gray-700">
                Ontdek onze zorgvuldig geselecteerde collectie van de beste deals en populairste cadeaus. 
                Handmatig gekozen door onze experts voor maximale waarde.
              </p>
            </div>

            {/* Feature cards grid */}
            <div className="mb-12 grid gap-6 md:grid-cols-3">
              {/* Card 1 - Beste Prijzen */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 blur-2xl transition-opacity group-hover:opacity-70 hidden md:block" />
                
                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg transition-transform group-hover:scale-110">
                    <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Beste Prijzen</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    Onverslaanbare deals op kwaliteitscadeaus. Bespaar tot 50% op topmerken en bestsellers.
                  </p>
                </div>
              </div>

              {/* Card 2 - Top Kwaliteit */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/10 to-yellow-500/10 blur-2xl transition-opacity group-hover:opacity-70 hidden md:block" />
                
                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg transition-transform group-hover:scale-110">
                    <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Top Kwaliteit</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    Alleen het beste van het beste. Producten met uitstekende reviews en hoge tevredenheidscores.
                  </p>
                </div>
              </div>

              {/* Card 3 - Expert Selectie */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 blur-2xl transition-opacity group-hover:opacity-70 hidden md:block" />
                
                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg transition-transform group-hover:scale-110">
                    <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Expert Selectie</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    Handmatig geselecteerd door ons team. Elk cadeau getest op originaliteit en presentatie.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="mb-12 overflow-hidden rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div className="text-center">
                  <div className="mb-1 text-3xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-gray-600">Actieve deals</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-gray-600">Categorieën</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-3xl font-bold text-primary">20+</div>
                  <div className="text-sm text-gray-600">Webshops</div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-3xl font-bold text-primary">Dagelijks</div>
                  <div className="text-sm text-gray-600">Vernieuwd</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button
                variant="primary"
                onClick={() => navigateTo('deals')}
                className="group px-10 py-5 text-lg font-semibold shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
              >
                <TagIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
                Ontdek alle Deals
              </Button>
              
              <p className="mt-4 text-sm text-gray-600">
                Nieuw aanbod elke dag • Gratis verzending bij veel producten
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">Laatste Blogs & Cadeaugidsen</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Blijf op de hoogte van de nieuwste cadeau-trends en tips</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogLoading ? (
            // Show skeleton loaders while blog posts are loading
            <>
              <BlogPostSkeleton />
              <BlogPostSkeleton />
              <BlogPostSkeleton />
            </>
          ) : latestPosts.length > 0 ? latestPosts.map((post, index) => (
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
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">Lees meer</span>
                      <span className="text-accent font-medium text-sm">→</span>
                    </div>
                    {/* Pinterest Share Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = `${window.location.origin}/blog/${post.slug}`;
                        const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(window.location.origin + post.imageUrl)}&description=${encodeURIComponent(post.title)}`;
                        window.open(pinterestUrl, '_blank', 'width=750,height=550');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#E60023] hover:bg-[#c5001d] text-white text-xs font-semibold rounded-lg transition-colors duration-200"
                      aria-label={`Deel ${post.title} op Pinterest`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                      </svg>
                      Pin op Pinterest
                    </button>
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

      {/* Testimonials - Enhanced with 6 testimonials */}
      <section className="bg-gradient-to-b from-white to-light-bg pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '1600ms' }}>
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">Wat Gebruikers Zeggen</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Ontdek waarom duizenden mensen Gifteez gebruiken voor hun cadeau-ideeën</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-gray-100 opacity-0 animate-fade-in-up transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${1600 + index * 100}ms` }}
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
