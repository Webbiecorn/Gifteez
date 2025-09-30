
import React, { useState, useEffect, useMemo } from 'react';
import { Container } from './layout/Container';
import { NavigateTo, DealItem, DealCategory } from '../types';
import Meta from './Meta';
import JsonLd from './JsonLd';
import { DynamicProductService } from '../services/dynamicProductService';
import Button from './Button';
import { withAffiliate } from '../services/affiliate';
import { StarIcon, TagIcon, SparklesIcon, GiftIcon, CheckIcon, ShoppingCartIcon } from './IconComponents';
import AmazonTeaser from './AmazonTeaser';

interface DealsPageProps {
  navigateTo: NavigateTo;
}

// Reusable deal card with theme styling & accessibility improvements
const DealCard: React.FC<{ item: DealItem; featured?: boolean }> = ({ item, featured = false }) => (
  <div
    className={`bg-white rounded-2xl shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100/70 focus-within:ring-2 focus-within:ring-accent/40 ${featured ? 'ring-2 ring-accent/30' : ''}`}
  >
    <div className="relative overflow-hidden">
      {featured && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-gradient-to-r from-primary to-accent text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
            <TagIcon className="w-4 h-4" />
            HOT
          </div>
        </div>
      )}
      {item.isOnSale && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-rose-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
            <TagIcon className="w-4 h-4" />
            SALE
          </div>
        </div>
      )}
      <div className="overflow-hidden bg-white flex items-center justify-center">
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          className="w-full h-56 object-contain group-hover:scale-110 transition-transform duration-500 will-change-transform"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <h3 className="font-display text-lg font-bold text-slate-900 flex-grow leading-snug tracking-tight">{item.name}</h3>
      <p className="mt-2 text-gray-600 text-sm leading-relaxed line-clamp-4">{item.description}</p>
      {item.giftScore && item.giftScore >= 7 && (
        <div className="mt-3 flex items-center gap-1" aria-label={`Cadeau score ${item.giftScore} van 10`}>
          <GiftIcon className="w-4 h-4 text-amber-500" />
          <span className="text-[11px] text-amber-600 font-medium">
            Score: {item.giftScore}/10
          </span>
        </div>
      )}
      <div className="mt-5 flex justify-between items-end gap-4">
        <div className="flex flex-col min-w-[40%]">
          <p className="font-semibold text-slate-900 text-base leading-none">{item.price}</p>
          {item.originalPrice && (
            <p className="text-xs text-gray-500 line-through mt-1">{item.originalPrice}</p>
          )}
          {featured && <p className="text-[10px] text-accent font-semibold mt-1">Beperkte tijd</p>}
        </div>
        <a
          href={withAffiliate(item.affiliateLink)}
          target="_blank"
          rel="noopener noreferrer sponsored nofollow"
          aria-label={`Bekijk deal voor ${item.name}`}
          className="focus:outline-none"
        >
          <Button
            variant={featured ? 'accent' : 'primary'}
            className="py-2 px-5 text-xs font-semibold shadow hover:shadow-md transform hover:scale-[1.03] active:scale-95 transition-all duration-300"
          >
            Bekijk
          </Button>
        </a>
      </div>
    </div>
  </div>
);

const DealsPage: React.FC<DealsPageProps> = ({ navigateTo }) => {
  const [dealOfTheWeek, setDealOfTheWeek] = useState<DealItem | null>(null);
  const [top10Deals, setTop10Deals] = useState<DealItem[]>([]);
  const [dealCategories, setDealCategories] = useState<DealCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build ItemList structured data for Top 10 + featured
  const itemListSchema = useMemo(() => {
    const items: DealItem[] = [];
    if (dealOfTheWeek) items.push(dealOfTheWeek);
    items.push(...top10Deals);
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: items.map((d, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: d.name,
        url: `https://gifteez.nl/deals#${d.id}`
      }))
    };
  }, [dealOfTheWeek, top10Deals]);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load all data concurrently
        const [weeklyDeal, topDeals, categories] = await Promise.all([
          DynamicProductService.getDealOfTheWeek(),
          DynamicProductService.getTop10Deals(),
          DynamicProductService.getDealCategories()
        ]);

        // Pad the Top 10 list with only Coolblue products if fewer than 10 were returned
        // Ensures the section always shows 10 items from Coolblue where possible.
        let filledTopDeals = topDeals;
        if (filledTopDeals.length < 10) {
          const needed = 10 - filledTopDeals.length;
            const extra = DynamicProductService.getAdditionalCoolblueDeals(
              filledTopDeals.map(d => d.id),
              needed
            );
          if (extra.length) {
            filledTopDeals = [...filledTopDeals, ...extra].slice(0, 10);
          }
        }

        setDealOfTheWeek(weeklyDeal);
        setTop10Deals(filledTopDeals);
        setDealCategories(categories);

        // Log stats for debugging
        const stats = DynamicProductService.getStats();
        console.log('📊 Product feed stats:', stats);

      } catch (err) {
        console.error('❌ Failed to load deals:', err);
        setError('Er is een fout opgetreden bij het laden van de deals. Probeer het later opnieuw.');
        
        // Load fallback data
        try {
          const { dealOfTheWeek: fallbackWeekly, top10Deals: fallbackTop10, dealCategories: fallbackCategories } = await import('../data/dealsData');
          setDealOfTheWeek(fallbackWeekly);
          setTop10Deals(fallbackTop10);
          setDealCategories(fallbackCategories);
        } catch (fallbackErr) {
          console.error('❌ Failed to load fallback data:', fallbackErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDeals();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-muted-rose/60 flex items-center justify-center">
        <div className="text-center animate-pulse">
            <div className="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-accent/30 border-t-accent animate-spin" aria-hidden="true"></div>
            <p className="text-slate-600 text-base font-medium">Bezig met laden van de beste deals…</p>
            <p className="text-xs text-slate-400 mt-2">Live productfeed ophalen</p>
        </div>
      </div>
    );
  }

  // Error state with fallback
  if (error && !dealOfTheWeek) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-muted-rose/60 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oeps!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="primary">
            Probeer opnieuw
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-secondary/10">
      <Meta
        title="Beste Cadeau Deals & Aanbiedingen | Gifteez"
        description="Ontdek dagelijks geüpdatete cadeau deals: top 10 populaire cadeaus, weekdeal en categorie selectie. Altijd inspiratie met voordeel."
        canonical="https://gifteez.nl/deals"
        ogImage="https://gifteez.nl/images/og-deals.png"
      />
      <JsonLd data={itemListSchema} id="jsonld-deals-itemlist" />
  {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary via-accent to-accent-hover text-white overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_30%_40%,#ffffff,transparent_60%),radial-gradient(circle_at_70%_60%,#ffffff,transparent_55%)]"></div>

  <Container size="xl" className="py-16 xs:py-18 sm:py-20 md:py-24 lg:py-28 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="typo-h1 mb-6 tracking-tight text-white">
              Beste <span className="bg-gradient-to-r from-accent to-highlight bg-clip-text text-transparent">Cadeau Deals</span>
            </h1>
            <p className="typo-lead text-white/90 max-w-3xl mx-auto mb-8">
              Ontdek de beste aanbiedingen en meest populaire cadeaus, zorgvuldig geselecteerd voor de hoogste kwaliteit tegen de laagste prijzen!
            </p>
            <ul className="flex flex-wrap justify-center gap-3 text-[13px]" aria-label="Voordelen lijst">
              <li className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 font-medium">
                <TagIcon className="w-4 h-4" />
                <span>Top kwaliteit</span>
              </li>
              <li className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 font-medium">
                <TagIcon className="w-4 h-4" />
                <span>Beperkte tijd</span>
              </li>
              <li className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 font-medium">
                <GiftIcon className="w-4 h-4" />
                <span>Populaire cadeaus</span>
              </li>
            </ul>
          </div>
        </Container>
      </section>

      <Container size="xl" className="py-16">
        {/* Deal of the Week */}
        {dealOfTheWeek && (
          <section className="mb-20">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden md:flex items-center border border-gray-100/70">
              <div className="md:w-1/2 overflow-hidden relative bg-white flex items-center justify-center">
                <div className="absolute top-6 left-6 z-10">
                  <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 shadow">
                    <TagIcon className="w-5 h-5" />
                    DEAL VAN DE WEEK
                  </div>
                </div>
                {dealOfTheWeek.isOnSale && (
                  <div className="absolute top-6 right-6 z-10">
                    <div className="bg-gradient-to-r from-accent to-accent-hover text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 shadow">
                      <CheckIcon className="w-5 h-5" />
                      SALE
                    </div>
                  </div>
                )}
                <img
                  src={dealOfTheWeek.imageUrl}
                  alt={dealOfTheWeek.name}
                  loading="lazy"
                  className="w-full h-80 md:h-full object-contain transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              <div className="md:w-1/2 p-8 md:p-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <SparklesIcon className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-accent uppercase tracking-wide">Exclusieve Aanbieding</h3>
                    <p className="text-xs text-gray-600">Automatisch geselecteerd uit Coolblue feed</p>
                  </div>
                </div>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-primary mb-6 leading-tight tracking-tight">{dealOfTheWeek.name}</h2>
                <p className="text-gray-600 leading-relaxed md:text-lg text-base mb-8 max-w-prose">{dealOfTheWeek.description}</p>
                
                {/* Gift Score Badge */}
                {dealOfTheWeek.giftScore && dealOfTheWeek.giftScore >= 8 && (
                  <div className="mb-6 inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-xs md:text-sm font-semibold">
                    <GiftIcon className="w-4 h-4" />
                    Cadeau score: {dealOfTheWeek.giftScore}/10
                  </div>
                )}
                
                <div className="flex items-baseline gap-4 mb-8">
                  <p className="font-display text-5xl font-bold text-accent">{dealOfTheWeek.price}</p>
                  {dealOfTheWeek.originalPrice && (
                    <>
                      <p className="text-lg text-gray-500 line-through">{dealOfTheWeek.originalPrice}</p>
                      <div className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                        KORTING
                      </div>
                    </>
                  )}
                </div>
                <a href={withAffiliate(dealOfTheWeek.affiliateLink)} target="_blank" rel="noopener noreferrer sponsored nofollow">
                  <Button variant="accent" className="w-full md:w-auto py-4 px-8 text-base md:text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2">
                    <ShoppingCartIcon className="w-6 h-6" />
                    Profiteer van de Deal
                  </Button>
                </a>
                
                {/* Data source info */}
                <p className="text-xs text-gray-500 mt-4">
                  🔄 Automatisch bijgewerkt vanuit Coolblue productfeed • Laatste update: vandaag
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Top 10 Popular Gifts */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent text-white rounded-full mb-6 shadow">
              <StarIcon className="w-8 h-8" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4 tracking-tight">Top 10 Populaire Cadeaus</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              De meest geliefde en hoog beoordeelde cadeaus van dit moment. Altijd een veilige keuze voor uiteenlopende gelegenheden.
            </p>
            <div className="flex justify-center items-center gap-4 mt-6">
              <div className="flex items-center gap-2 bg-muted-rose text-accent px-4 py-2 rounded-full text-sm font-semibold">
                <CheckIcon className="w-4 h-4" />
                Hoogste Kwaliteit
              </div>
              <div className="flex items-center gap-2 bg-highlight/10 text-highlight px-4 py-2 rounded-full text-sm font-semibold">
                <StarIcon className="w-4 h-4" />
                Best Beoordeeld
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {top10Deals.map((item, index) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-100">
                <div className="relative">
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-gradient-to-r from-primary to-accent text-white text-base font-bold w-12 h-12 flex items-center justify-center rounded-full shadow">
                      #{index+1}
                    </div>
                  </div>
                  <div className="overflow-hidden bg-white flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-40 object-contain group-hover:scale-110 transition-transform duration-500"
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
        <section className="mb-20" aria-labelledby="amazon-deals-heading">
          <div className="bg-gradient-to-r from-secondary to-muted-rose rounded-3xl p-8 md:p-12 border border-muted-rose/60">
            <div className="text-center mb-8">
              <h3 id="amazon-deals-heading" className="font-display text-3xl font-bold text-primary mb-4 tracking-tight">Amazon Aanbiedingen</h3>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">Ontdek interessante Amazon deals via onze affiliate links (geen extra kosten voor jou – helpt ons platform ❤️).</p>
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
        {dealCategories.map((category) => (
          <section key={category.title} className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary to-accent text-white rounded-full mb-4">
                <GiftIcon className="w-7 h-7" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">{category.title}</h2>
              <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base">
                {category.title === 'Top Tech Gadgets' && 'Top technologie & audio / smart picks geselecteerd op prijs-kwaliteit.'}
                {category.title === 'Beste Keukenaccessoires' && 'Functionele en tijdsbesparende keukenhelpers voor dagelijks gebruik.'}
                {category.title === 'Populaire Duurzame Keuzes' && 'Duurzame en herbruikbare favorieten voor een groenere lifestyle.'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {category.items.map(item => (
                <DealCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}

        {/* Affiliate disclaimer */}
        <section className="mt-24 text-center text-xs text-gray-500 max-w-3xl mx-auto">
          Sommige links zijn affiliate links. Jij betaalt niets extra, maar wij kunnen een kleine commissie ontvangen ter ondersteuning van het platform.
        </section>

  </Container>
    </div>
  );
};

export default DealsPage;
