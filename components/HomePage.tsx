
import React, { useState, FormEvent } from 'react';
import { Testimonial, NavigateTo } from '../types';
import Button from './Button';
import TestimonialCard from './TestimonialCard';
import { blogPosts } from '../data/blogData';
import { QuestionMarkCircleIcon, BookOpenIcon, TagIcon } from './IconComponents';
import AmazonTeaser from './AmazonTeaser';

interface HomePageProps {
  navigateTo: NavigateTo;
}

const trendingGuides = [
  { id: 1, title: 'Cadeaus voor Tech-Liefhebbers', img: 'https://picsum.photos/seed/tech/400/300' },
  { id: 2, title: 'Duurzame & Eco-vriendelijke Kado\'s', img: 'https://picsum.photos/seed/eco/400/300' },
  { id: 3, title: 'De Beste Ervaringscadeaus', img: 'https://picsum.photos/seed/exp/400/300' },
];

const curatedCollections = [
  {
    title: 'Top Cadeaus voor Foodies',
    description: 'Verras de thuiskok of fijnproever met deze culinaire toppers.',
    img: 'https://picsum.photos/seed/foodie/400/300'
  },
  {
    title: 'Brievenbuscadeaus',
    description: 'Een kleine verrassing die altijd past. Perfect om iemand zomaar te laten weten dat je aan ze denkt.',
    img: 'https://picsum.photos/seed/mailbox/400/300'
  },
  {
    title: 'Voor de Reiziger',
    description: 'Handige en inspirerende cadeaus voor de avonturier in je leven.',
    img: 'https://picsum.photos/seed/travel/400/300'
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
      <section className="bg-gradient-to-b from-secondary to-light-bg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-primary">
            Vind het perfecte cadeau in 30 seconden met AI 🎁
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Onze AI GiftFinder helpt je voor elk budget en elke gelegenheid. Zeg vaarwel tegen cadeaustress!
          </p>
          <div className="mt-8">
            <Button variant="accent" onClick={() => navigateTo('giftFinder')}>
              Start GiftFinder
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Guides */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h2 className="font-display text-3xl font-bold text-center text-primary mb-8">Trending Cadeaugidsen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trendingGuides.map((guide) => (
            <div key={guide.id} className="bg-white rounded-lg shadow-lg overflow-hidden group cursor-pointer" onClick={() => navigateTo('blog')}>
              <img src={guide.img} alt={guide.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-primary">{guide.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GiftFinder Preview */}
      <section className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-secondary p-8 rounded-lg shadow-md">
            <div className="md:w-1/2">
              <h2 className="font-display text-3xl font-bold text-primary">Probeer de GiftFinder</h2>
              <p className="mt-2 text-gray-700">Kies voor wie je een cadeau zoekt en onze AI doet de rest.</p>
               <select
                value={previewRecipient}
                onChange={(e) => setPreviewRecipient(e.target.value)}
                className="w-full mt-4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                aria-label="Voor wie zoek je een cadeau?"
              >
                {recipients.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="w-full md:w-1/3 text-center">
              <Button variant="accent" onClick={() => navigateTo('giftFinder', { recipient: previewRecipient })} className="w-full">
                Vind Nu Een Cadeau
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quiz CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="bg-primary text-white p-12 rounded-lg shadow-xl text-center">
              <QuestionMarkCircleIcon className="w-16 h-16 mx-auto text-secondary"/>
              <h2 className="font-display text-3xl font-bold mt-4">Vind je het lastig kiezen?</h2>
              <p className="mt-2 text-gray-200 max-w-xl mx-auto">Doe onze leuke Cadeau Quiz en ontdek in een paar klikken welk type cadeaus perfect passen bij jouw vriend(in), partner of familielid!</p>
              <div className="mt-8">
                  <Button variant="accent" onClick={() => navigateTo('quiz')}>Doe de Quiz</Button>
              </div>
          </div>
      </section>

      {/* Deals CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <div className="bg-white p-12 rounded-lg shadow-xl text-center border-2 border-accent">
              <TagIcon className="w-16 h-16 mx-auto text-accent"/>
              <h2 className="font-display text-3xl font-bold text-primary mt-4">Deals & Top Cadeaus</h2>
              <p className="mt-2 text-gray-600 max-w-xl mx-auto">Bekijk onze selectie van de beste deals en meest populaire cadeaus, zorgvuldig uitgekozen door onze experts.</p>
              <div className="mt-8">
                  <Button variant="accent" onClick={() => navigateTo('deals')}>Bekijk de Deals</Button>
              </div>
          </div>
      </section>

      {/* Amazon Teaser Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
        <AmazonTeaser
          items={[
            { title: 'JBL Tune 510BT On‑Ear Koptelefoon', imageUrl: 'https://m.media-amazon.com/images/I/61ZP0edkQwL._AC_SL1500_.jpg', affiliateUrl: 'https://www.amazon.nl/dp/B08VJDLPG3?tag=gifteez77-21' },
            { title: 'LEGO Technic Formula E Porsche 99X', imageUrl: 'https://m.media-amazon.com/images/I/81gLz3J3iVL._AC_SL1500_.jpg', affiliateUrl: 'https://www.amazon.nl/dp/B0BPCPFRRC?tag=gifteez77-21' },
            { title: 'Rituals The Ritual of Sakura Gift Set', imageUrl: 'https://m.media-amazon.com/images/I/71CH1Ejh1cL._AC_SL1500_.jpg', affiliateUrl: 'https://www.amazon.nl/dp/B07W7J5Z5J?tag=gifteez77-21' },
            { title: 'Philips Hue White Ambiance E27 (2‑pack)', imageUrl: 'https://m.media-amazon.com/images/I/61khtjB8ZEL._AC_SL1500_.jpg', affiliateUrl: 'https://www.amazon.nl/dp/B07SNRG7V6?tag=gifteez77-21' },
          ]}
          note="Amazon‑links werken zonder API. Tag ingesteld: gifteez77-21."
        />
      </section>

       {/* Shop CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
          <div className="bg-white p-12 rounded-lg shadow-xl text-center border-2 border-primary">
              <BookOpenIcon className="w-16 h-16 mx-auto text-primary"/>
              <h2 className="font-display text-3xl font-bold text-primary mt-4">Nieuw in de Winkel</h2>
              <p className="mt-2 text-gray-600 max-w-xl mx-auto">Download ons premium e-book: "Het Jaar Rond Perfecte Cadeaus" en word een expert in het geven van geschenken!</p>
              <div className="mt-8">
                  <Button variant="primary" onClick={() => navigateTo('shop')}>Naar de Winkel</Button>
              </div>
          </div>
      </section>

      {/* Latest Blog Posts Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
        <h2 className="font-display text-3xl font-bold text-center text-primary mb-8">Laatste Blogs & Cadeaugidsen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestPosts.map((post) => (
            <div key={post.slug} className="bg-white rounded-lg shadow-lg overflow-hidden group cursor-pointer" onClick={() => navigateTo('blogDetail', { slug: post.slug })}>
              <div className="overflow-hidden">
                <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-primary group-hover:text-accent transition-colors">{post.title}</h3>
                <p className="mt-2 text-gray-600 text-sm line-clamp-3">{post.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lead Magnet Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 opacity-0 animate-fade-in-up" style={{ animationDelay: '1400ms' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-secondary p-8 rounded-lg shadow-md">
            <div className="md:w-1/2">
              <h2 className="font-display text-3xl font-bold text-primary">Download je GRATIS Cadeau Planner</h2>
              <p className="mt-2 text-gray-700">Meld je aan voor onze nieuwsbrief en ontvang direct de 'Ultieme Cadeau Planner'. Mis nooit meer een verjaardag en sta altijd klaar met het perfecte cadeau!</p>
               <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 mt-6">
                  <input 
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Jouw e-mailadres" 
                    className="w-full px-4 py-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    required
                  />
                  <Button type="submit" variant="accent" className="w-full sm:w-auto">
                    Download Nu
                  </Button>
                </form>
            </div>
            <div className="w-full md:w-1/3 text-center">
              <img src="https://picsum.photos/seed/planner/400/400" alt="Cadeau Planner" className="rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '1600ms' }}>
        <h2 className="font-display text-3xl font-bold text-center text-primary mb-8">Wat Gebruikers Zeggen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
