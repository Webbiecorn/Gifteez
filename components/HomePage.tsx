
import React, { useState, FormEvent, useEffect } from 'react';
import ImageWithFallback from './ImageWithFallback';
import PlannerIllustration from './PlannerIllustration';
import LazyViewport from './LazyViewport';
import PictureImage from './PictureImage';
import { topicImage, Topics } from '../services/images';
import { Testimonial, NavigateTo } from '../types';
import Button from './Button';
import TestimonialCard from './TestimonialCard';
import { blogPosts } from '../data/blogData';
import { QuestionMarkCircleIcon, BookOpenIcon, TagIcon } from './IconComponents';
import AmazonTeaser from './AmazonTeaser';
import QuizIllustration from './QuizIllustration';

interface HomePageProps {
  navigateTo: NavigateTo;
}

const trendingGuides = [
  { id: 1, title: 'Cadeaus voor Tech-Liefhebbers', base: '/images/trending-tech', slug: 'cadeaus-voor-tech-liefhebbers' },
  { id: 2, title: 'Duurzame & Eco-vriendelijke Cadeaus', base: '/images/trending-eco', slug: 'duurzame-eco-vriendelijke-cadeaus' },
  { id: 3, title: 'De Beste Ervaringscadeaus', base: '/images/trending-ervaringen', slug: 'beste-ervaringscadeaus-2025' },
];

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
const latestPosts = blogPosts.slice(0, 3);

const HomePage: React.FC<HomePageProps> = ({ navigateTo }) => {
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
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary via-secondary to-light-bg overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full"></div>
          <div className="absolute top-1/4 right-20 w-24 h-24 bg-blue-500 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-primary rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 bg-blue-500 rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-8 shadow-lg">
              <span className="text-3xl">🎁</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight mb-6">
              Vind het perfecte cadeau in <span className="text-blue-600">30 seconden</span> met AI
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-10">
              Onze AI GiftFinder helpt je voor elk budget en elke gelegenheid. Zeg vaarwel tegen cadeaustress!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="accent"
                onClick={() => navigateTo('giftFinder')}
                className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Start GiftFinder
              </Button>
              <Button
                variant="outline"
                onClick={() => navigateTo('quiz')}
                className="px-8 py-4 text-lg font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                Doe de Quiz
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Guides */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">Trending Cadeaugidsen</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Ontdek onze populairste gidsen voor cadeau-inspiratie</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trendingGuides.map((guide, i) => (
            <LazyViewport key={guide.id}>
              {(visible) => (
                <div
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden group cursor-pointer opacity-0 animate-fade-in-up transform hover:scale-105 transition-all duration-300 border border-gray-100"
                  style={{ animationDelay: `${200 + i * 100}ms` }}
                  onClick={() => guide.slug ? navigateTo('blogDetail', { slug: guide.slug }) : navigateTo('blog')}
                >
                  <div className="relative overflow-hidden">
                    {visible && (
                      <PictureImage
                        alt={guide.title}
                        width={400}
                        height={300}
                        fallback={`${guide.base}.jpg`}
                        sources={[
                          { src: `${guide.base}.avif`, type: 'image/avif' },
                          { src: `${guide.base}.webp`, type: 'image/webp' },
                          { src: `${guide.base}.png`, type: 'image/png' }
                        ]}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-primary group-hover:text-blue-600 transition-colors duration-300">{guide.title}</h3>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        Lees meer →
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </LazyViewport>
          ))}
        </div>
      </section>

      {/* GiftFinder Preview */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-xl">
                <span className="text-3xl">🎯</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Probeer de <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">GiftFinder</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Kies voor wie je een cadeau zoekt en onze AI doet de rest. Ontvang direct gepersonaliseerde cadeau-ideeën!
              </p>
            </div>

            {/* Interactive Form Card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Top gradient bar */}
              <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

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
                          className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 appearance-none"
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
                      className="w-full px-8 py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl"
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
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-lg">🤖</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">AI-Gedreven</h3>
                          <p className="text-sm text-gray-600">Slimme algoritmes voor perfecte matches</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                        <div className="flex-shrink-0 w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-lg">⚡</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Direct Resultaten</h3>
                          <p className="text-sm text-gray-600">Binnen 30 seconden persoonlijke suggesties</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
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
                  <div className="flex flex-wrap justify-center gap-8 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">1000+</div>
                      <div className="text-sm text-gray-500">Cadeau Ideeën</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-indigo-600">30</div>
                      <div className="text-sm text-gray-500">Seconden</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">4.8/5</div>
                      <div className="text-sm text-gray-500">Gebruikers Score</div>
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
                  className="px-12 py-5 text-xl font-bold bg-gradient-to-r from-white to-gray-100 text-blue-600 hover:from-gray-100 hover:to-white shadow-2xl hover:shadow-white/25 transform hover:scale-105 transition-all duration-500 border-2 border-white/20 hover:border-white/40 rounded-2xl"
                >
                  <span className="flex items-center gap-3">
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
          {latestPosts.map((post, index) => (
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
                    <h3 className="font-display text-xl font-bold text-primary group-hover:text-blue-600 transition-colors duration-300 mb-3">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Lees meer</span>
                      <span className="text-blue-600 font-medium text-sm">→</span>
                    </div>
                  </div>
                </div>
              )}
            </LazyViewport>
          ))}
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
