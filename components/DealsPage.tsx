
import React from 'react';
import { NavigateTo, DealItem, DealCategory } from '../types';
import { dealOfTheWeek, top10Deals, dealCategories } from '../data/dealsData';
import Button from './Button';
import { withAffiliate } from '../services/affiliate';
import { StarIcon, TagIcon } from './IconComponents';
import AmazonTeaser from './AmazonTeaser';

interface DealsPageProps {
  navigateTo: NavigateTo;
}

const DealCard: React.FC<{ item: DealItem }> = ({ item }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transition-transform duration-300 hover:-translate-y-1">
        <div className="overflow-hidden">
            <img src={item.imageUrl} alt={item.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <h3 className="font-display text-xl font-bold text-primary flex-grow">{item.name}</h3>
            <p className="mt-2 text-gray-600 text-sm">{item.description}</p>
            <div className="mt-6 flex justify-between items-center">
                <p className="font-bold text-primary text-lg">{item.price}</p>
                <a href={withAffiliate(item.affiliateLink)} target="_blank" rel="noopener noreferrer sponsored nofollow">
                    <Button variant="primary" className="py-2 px-4 text-sm">Bekijk</Button>
                </a>
            </div>
        </div>
    </div>
);

const DealsPage: React.FC<DealsPageProps> = ({ navigateTo }) => {
  return (
    <div className="bg-light-bg">
      <section className="bg-gradient-to-r from-primary to-blue-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold">Deals & Top Cadeaus</h1>
          <p className="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">Onze selectie van de beste aanbiedingen en meest populaire cadeaus, zorgvuldig uitgekozen door experts.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Deal of the Week */}
        <section className="animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden md:flex items-center">
            <div className="md:w-1/2 overflow-hidden">
                <img src={dealOfTheWeek.imageUrl} alt={dealOfTheWeek.name} className="w-full h-64 md:h-full object-cover transition-transform duration-300 hover:scale-105"/>
            </div>
            <div className="md:w-1/2 p-8 md:p-12">
                <div className="flex items-center gap-2 text-accent font-bold">
                    <TagIcon className="w-6 h-6"/>
                    <span className="text-xl">DEAL VAN DE WEEK</span>
                </div>
                <h2 className="font-display text-4xl font-bold text-primary mt-4">{dealOfTheWeek.name}</h2>
                <p className="mt-4 text-gray-600 leading-relaxed">{dealOfTheWeek.description}</p>
                <p className="font-display text-4xl font-bold text-accent mt-6">{dealOfTheWeek.price}</p>
                <a href={withAffiliate(dealOfTheWeek.affiliateLink)} target="_blank" rel="noopener noreferrer sponsored nofollow" className="mt-6 block">
                    <Button variant="accent" className="w-full md:w-auto">Profiteer van de deal</Button>
                </a>
            </div>
          </div>
        </section>

        {/* Top 10 Popular Gifts */}
        <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="text-center mb-12">
                <StarIcon className="w-12 h-12 text-primary mx-auto"/>
                <h2 className="font-display text-3xl font-bold text-primary mt-4">Top 10 Populaire Cadeaus</h2>
                <p className="mt-2 text-gray-600 max-w-xl mx-auto">De meest geliefde en best beoordeelde cadeaus van dit moment. Altijd een goede keuze!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {top10Deals.map((item, index) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transition-transform duration-300 hover:-translate-y-1">
                        <div className="relative">
                            <span className="absolute top-2 left-2 bg-primary text-white text-lg font-bold w-10 h-10 flex items-center justify-center rounded-full z-10">#{index+1}</span>
                            <div className="overflow-hidden">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="font-display text-md font-bold text-primary flex-grow">{item.name}</h3>
                            <div className="mt-4 flex justify-between items-center">
                                <p className="font-bold text-primary text-md">{item.price}</p>
                                <a href={withAffiliate(item.affiliateLink)} target="_blank" rel="noopener noreferrer sponsored nofollow">
                                    <Button variant="primary" className="py-1 px-3 text-xs">Bekijk</Button>
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

                {/* Amazon teaser (affiliatelinks, geen API nodig) */}
                <AmazonTeaser
                    items={[
                        {
                            title: 'JBL Tune 510BT On‑Ear Koptelefoon',
                            imageUrl: 'https://m.media-amazon.com/images/I/61ZP0edkQwL._AC_SL1500_.jpg',
                              affiliateUrl: 'https://www.amazon.nl/dp/B08VJDLPG3?tag=gifteez77-21',
                        },
                        {
                            title: 'LEGO Technic Formula E Porsche 99X',
                            imageUrl: 'https://m.media-amazon.com/images/I/81gLz3J3iVL._AC_SL1500_.jpg',
                              affiliateUrl: 'https://www.amazon.nl/dp/B0BPCPFRRC?tag=gifteez77-21',
                        },
                        {
                            title: 'Rituals The Ritual of Sakura Gift Set',
                            imageUrl: 'https://m.media-amazon.com/images/I/71CH1Ejh1cL._AC_SL1500_.jpg',
                              affiliateUrl: 'https://www.amazon.nl/dp/B07W7J5Z5J?tag=gifteez77-21',
                        },
                        {
                            title: 'Philips Hue White Ambiance E27 (2‑pack)',
                            imageUrl: 'https://m.media-amazon.com/images/I/61khtjB8ZEL._AC_SL1500_.jpg',
                              affiliateUrl: 'https://www.amazon.nl/dp/B07SNRG7V6?tag=gifteez77-21',
                        },
                    ]}
                      note="Amazon‑links werken zonder API. Tag ingesteld: gifteez77-21."
                />

        {/* Categorized Deals */}
        {dealCategories.map((category, index) => (
            <section key={category.title} className="animate-fade-in-up" style={{ animationDelay: `${400 + index * 100}ms` }}>
                <h2 className="font-display text-3xl font-bold text-primary mb-8">{category.title}</h2>
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
