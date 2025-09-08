
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
      <section className="bg-gradient-to-r from-light-bg to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">Probeer de GiftFinder</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">Kies voor wie je een cadeau zoekt en onze AI doet de rest. Ontvang direct gepersonaliseerde cadeau-ideeën!</p>

              <div className="space-y-4">
                <select
                  value={previewRecipient}
                  onChange={(e) => setPreviewRecipient(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-gray-800"
                  aria-label="Voor wie zoek je een cadeau?"
                >
                  {recipients.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <Button
                  variant="accent"
                  onClick={() => navigateTo('giftFinder', { recipient: previewRecipient })}
                  className="w-full px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Vind Nu Een Cadeau voor {previewRecipient}
                </Button>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
                  <PlannerIllustration className="w-full h-auto drop-shadow-lg" />
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
        <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 md:p-12 rounded-2xl shadow-2xl overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <TagIcon className="w-10 h-10 text-white"/>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Deals & Top Cadeaus</h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-8">
              Bekijk onze selectie van de beste deals en meest populaire cadeaus, zorgvuldig uitgekozen door onze experts.
            </p>
            <Button
              variant="primary"
              onClick={() => navigateTo('deals')}
              className="px-8 py-4 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Bekijk de Deals
            </Button>
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
              onClick={() => navigateTo('shop')}
              className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Naar de Winkel
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
            <div
              key={post.slug}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden group cursor-pointer opacity-0 animate-fade-in-up transform hover:scale-105 transition-all duration-300 border border-gray-100"
              style={{ animationDelay: `${1200 + index * 200}ms` }}
              onClick={() => navigateTo('blogDetail', { slug: post.slug })}
            >
              <div className="relative overflow-hidden">
                <ImageWithFallback
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
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
