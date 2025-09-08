
import React from 'react';
import { NavigateTo, DealItem, DealCategory } from '../types';
import { dealOfTheWeek, top10Deals, dealCategories } from '../data/dealsData';
import Button from './Button';
import { withAffiliate } from '../services/affiliate';
import { StarIcon, TagIcon, SparklesIcon, GiftIcon, CheckIcon } from './IconComponents';
import AmazonTeaser from './AmazonTeaser';

interface DealsPageProps {
  navigateTo: NavigateTo;
}

const DealCard: React.FC<{ item: DealItem; featured?: boolean }> = ({ item, featured = false }) => (
  <div className={`bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-100 ${featured ? 'ring-2 ring-accent/20' : ''}`}>
    <div className="relative overflow-hidden">
      {featured && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <TagIcon className="w-4 h-4" />
            HOT
          </div>
        </div>
      )}
      <div className="overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <h3 className="font-display text-xl font-bold text-primary flex-grow leading-tight">{item.name}</h3>
      <p className="mt-3 text-gray-600 text-sm leading-relaxed">{item.description}</p>
      <div className="mt-6 flex justify-between items-center">
        <div className="flex flex-col">
          <p className="font-bold text-primary text-xl">{item.price}</p>
          {featured && <p className="text-xs text-blue-600 font-semibold">Beperkte tijd!</p>}
        </div>
        <a href={withAffiliate(item.affiliateLink)} target="_blank" rel="noopener noreferrer sponsored nofollow">
          <Button variant={featured ? "accent" : "primary"} className="py-2 px-6 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Bekijk Deal
          </Button>
        </a>
      </div>
    </div>
  </div>
);const DealsPage: React.FC<DealsPageProps> = ({ navigateTo }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-secondary/20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary via-blue-500 to-indigo-600 text-white overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-1/4 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full opacity-5"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Ongelooflijke
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Deals
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              Ontdek de beste aanbiedingen en meest populaire cadeaus, zorgvuldig geselecteerd voor de hoogste kwaliteit tegen de laagste prijzen!
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <TagIcon className="w-4 h-4" />
                <span>Top Kwaliteit</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <TagIcon className="w-4 h-4" />
                <span>Beperkte Tijd</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <GiftIcon className="w-4 h-4" />
                <span>Gratis Verzending</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Deal of the Week */}
        <section className="mb-20">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden md:flex items-center border border-gray-100">
            <div className="md:w-1/2 overflow-hidden relative">
              <div className="absolute top-6 left-6 z-10">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                  <TagIcon className="w-5 h-5" />
                  DEAL VAN DE WEEK
                </div>
              </div>
              <img
                src={dealOfTheWeek.imageUrl}
                alt={dealOfTheWeek.name}
                className="w-full h-80 md:h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
            <div className="md:w-1/2 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <SparklesIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wide">Exclusieve Aanbieding</h3>
                  <p className="text-xs text-gray-600">Beperkte beschikbaarheid</p>
                </div>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">{dealOfTheWeek.name}</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-8">{dealOfTheWeek.description}</p>
              <div className="flex items-baseline gap-4 mb-8">
                <p className="font-display text-5xl font-bold text-blue-600">{dealOfTheWeek.price}</p>
                <p className="text-lg text-gray-500 line-through">€89,99</p>
                <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                  30% KORTING
                </div>
              </div>
              <a href={withAffiliate(dealOfTheWeek.affiliateLink)} target="_blank" rel="noopener noreferrer sponsored nofollow">
                <Button variant="accent" className="w-full md:w-auto py-4 px-8 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                  <GiftIcon className="w-6 h-6" />
                  Profiteer van de Deal
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Top 10 Popular Gifts */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent text-white rounded-full mb-6">
              <StarIcon className="w-8 h-8" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">Top 10 Populaire Cadeaus</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              De meest geliefde en best beoordeelde cadeaus van dit moment. Altijd een goede keuze voor elke gelegenheid!
            </p>
            <div className="flex justify-center items-center gap-4 mt-6">
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                <CheckIcon className="w-4 h-4" />
                Hoogste Kwaliteit
              </div>
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                <StarIcon className="w-4 h-4" />
                Best Beoordeeld
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {top10Deals.map((item, index) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-100">
                <div className="relative">
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-gradient-to-r from-primary to-accent text-white text-lg font-bold w-12 h-12 flex items-center justify-center rounded-full shadow-lg">
                      #{index+1}
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-display text-lg font-bold text-primary flex-grow leading-tight mb-2">{item.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">(4.9)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-primary text-xl">{item.price}</p>
                    <a href={withAffiliate(item.affiliateLink)} target="_blank" rel="noopener noreferrer sponsored nofollow">
                      <Button variant="primary" className="py-2 px-4 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                        Bekijk
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Amazon Teaser */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 border border-blue-100">
            <div className="text-center mb-8">
              <h3 className="font-display text-3xl font-bold text-primary mb-4">Amazon Aanbiedingen</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ontdek geweldige deals op Amazon met onze affiliate links. Geen extra kosten voor jou!
              </p>
            </div>
            <AmazonTeaser
              items={[
                {
                  title: 'JBL Tune 510BT On‑Ear Koptelefoon',
                  imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center',
                  affiliateUrl: 'https://www.amazon.nl/dp/B08VJDLPG3?tag=gifteez77-21',
                },
                {
                  title: 'LEGO Technic Formula E Porsche 99X',
                  imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop&crop=center',
                  affiliateUrl: 'https://www.amazon.nl/dp/B0BPCPFRRC?tag=gifteez77-21',
                },
                {
                  title: 'Rituals The Ritual of Sakura Gift Set',
                  imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&crop=center',
                  affiliateUrl: 'https://www.amazon.nl/dp/B07W7J5Z5J?tag=gifteez77-21',
                },
                {
                  title: 'Philips Hue White Ambiance E27 (2‑pack)',
                  imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop&crop=center',
                  affiliateUrl: 'https://www.amazon.nl/dp/B07SNRG7V6?tag=gifteez77-21',
                },
              ]}
              note="Amazon‑links werken zonder API. Tag ingesteld: gifteez77-21."
            />
          </div>
        </section>

        {/* Categorized Deals */}
        {dealCategories.map((category, index) => (
          <section key={category.title} className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary to-accent text-white rounded-full mb-4">
                <GiftIcon className="w-7 h-7" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">{category.title}</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                {category.title === 'Tech & Gadgets' && 'De nieuwste technologie en gadgets voor techliefhebbers'}
                {category.title === 'Lifestyle & Wellness' && 'Cadeaus voor gezondheid, ontspanning en persoonlijke verzorging'}
                {category.title === 'Home & Garden' && 'Mooi voor in huis en tuin, van decoratie tot praktische items'}
                {category.title === 'Books & Learning' && 'Boeken, cursussen en educatieve materialen voor levenslang leren'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.items.map(item => (
                <DealCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}

      </div>
    </div>
  );
};

export default DealsPage;
