import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavigateTo, DealCategory, DealItem } from '../types';
import Meta from './Meta';
import JsonLd from './JsonLd';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ImageWithFallback from './ImageWithFallback';
import { Container } from './layout/Container';
import { withAffiliate } from '../services/affiliate';
import { DynamicProductService } from '../services/dynamicProductService';
import { DealCategoryConfigService } from '../services/dealCategoryConfigService';
import {
  SparklesIcon,
  TagIcon,
  StarIcon,
  BookmarkFilledIcon,
  BookmarkIcon,
  CheckIcon
} from './IconComponents';

interface DealsPageProps {
  navigateTo: NavigateTo;
}

interface DealsPageState {
  dealOfWeek: DealItem | null;
  topDeals: DealItem[];
  categories: DealCategory[];
}

const DEFAULT_STATE: DealsPageState = {
  dealOfWeek: null,
  topDeals: [],
  categories: []
};

const DealsPage: React.FC<DealsPageProps> = ({ navigateTo }) => {
  const [state, setState] = useState<DealsPageState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [manualConfigUpdatedAt, setManualConfigUpdatedAt] = useState<string | null>(null);

  const formatPrice = useCallback((value: string | undefined) => {
    if (!value) {
      return null;
    }
    return value.startsWith('€') ? value : `€${value}`;
  }, []);

  const formatDate = useCallback((value?: Date | string | null) => {
    if (!value) {
      return null;
    }
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleString('nl-NL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const loadDeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      DealCategoryConfigService.clearCache();
      const [dealOfWeek, topDeals, categories, config] = await Promise.all([
        DynamicProductService.getDealOfTheWeek(),
        DynamicProductService.getTop10Deals(),
        DynamicProductService.getDealCategories(),
        DealCategoryConfigService.load()
      ]);

      const stats = DynamicProductService.getStats();
      setLastUpdated(stats?.lastUpdated ?? null);
      setManualConfigUpdatedAt(config?.updatedAt ?? null);

      setState({
        dealOfWeek,
        topDeals,
        categories: categories.filter((category) => category.items.length > 0)
      });
    } catch (loadError: any) {
      console.error('Kon deals niet laden:', loadError);
      setError(loadError?.message ?? 'Kon deals niet laden. Probeer het later opnieuw.');
      setState(DEFAULT_STATE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDeals();
  }, [loadDeals]);

  const structuredData = useMemo(() => {
    const topList = state.topDeals.map((deal, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: withAffiliate(deal.affiliateLink),
      name: deal.name,
      image: deal.imageUrl,
      description: deal.description,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: deal.price?.replace(/[^0-9,\.]/g, '').replace(',', '.') ?? '',
        url: withAffiliate(deal.affiliateLink)
      }
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Gifteez deals overzicht',
      description: 'Ontdek de scherpste cadeaudeals van deze week, samengesteld uit Coolblue en Amazon.',
      itemListElement: topList
    };
  }, [state.topDeals]);

  const renderDealCard = (deal: DealItem, variant: 'default' | 'compact' = 'default') => {
    const isAmazonImage = /amazon\./i.test(deal.imageUrl);
    const imageClasses = variant === 'compact'
      ? isAmazonImage
        ? 'h-36 w-full object-contain p-3'
        : 'h-36 w-full object-cover'
      : isAmazonImage
        ? 'h-60 w-full object-contain p-4'
        : 'h-56 w-full object-cover';

    return (
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-rose-50 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-center justify-center overflow-hidden bg-white">
          <ImageWithFallback
            src={deal.imageUrl}
            alt={deal.name}
            className={`${imageClasses} transition-transform duration-300 group-hover:scale-105`}
            fit="contain"
          />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="space-y-2">
            <h3 className="font-display text-xl font-semibold text-slate-900 line-clamp-2">{deal.name}</h3>
            <p className="text-sm text-slate-600 line-clamp-3">{deal.description}</p>
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-rose-600">
              <span className="rounded-full bg-rose-50 px-3 py-1">{formatPrice(deal.price) ?? 'Prijs op aanvraag'}</span>
              {deal.originalPrice && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
                  <s>{deal.originalPrice}</s>
                </span>
              )}
              {deal.giftScore && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">
                  <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Score {deal.giftScore}/10
                </span>
              )}
              {deal.isOnSale && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-600">
                  <TagIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Sale
                </span>
              )}
            </div>
            <a
              href={withAffiliate(deal.affiliateLink)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center justify-center rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-600"
            >
              Bekijk deal
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Meta
        title="Deals & cadeaudeals van de week"
        description="Ontdek de scherpste cadeaudeals van Gifteez. We combineren de beste Coolblue aanbiedingen met handmatig geselecteerde toppers."
      />
      <JsonLd data={structuredData} />

      <div className="bg-gradient-to-b from-rose-50/80 via-white to-white">
        <section className="bg-gradient-to-r from-rose-500 via-rose-600 to-purple-600 text-white">
          <Container size="xl" padded className="py-16 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                  Gifteez Deals
                </span>
                <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  Elke week nieuwe cadeaus met extra voordeel
                </h1>
                <p className="max-w-2xl text-base text-white/80 sm:text-lg">
                  We scannen dagelijks de Coolblue productfeed en onze Amazon favorieten. De deals hieronder zijn direct te bestellen en sluiten aan bij populaire cadeaumomenten.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="accent" onClick={() => navigateTo('giftFinder')}>
                    Vind cadeaus op maat
                  </Button>
                  <Button
                    variant="ghost"
                    className="border border-white/40 bg-white/10 text-white hover:bg-white/20"
                    onClick={loadDeals}
                  >
                    Vernieuw deals
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-6 rounded-3xl bg-white/20 blur-2xl" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/10 p-8 shadow-2xl backdrop-blur">
                  <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-white/80">
                    <SparklesIcon className="h-5 w-5" />
                    Live overzicht
                  </div>
                  <ul className="mt-6 space-y-4 text-sm text-white/80">
                    <li className="flex items-center gap-2">
                      <StarIcon className="h-5 w-5 text-amber-200" />
                      Deal van de week rechtstreeks uit de feed
                    </li>
                    <li className="flex items-center gap-2">
                      <TagIcon className="h-5 w-5 text-rose-200" />
                      Top 10 cadeaus met de hoogste cadeauscore
                    </li>
                    <li className="flex items-center gap-2">
                      <BookmarkFilledIcon className="h-5 w-5 text-emerald-200" />
                      Handmatig samengestelde categorieblokken
                    </li>
                  </ul>
                  <div className="mt-6 rounded-2xl border border-white/30 bg-white/10 p-4 text-xs text-white/70">
                    <p>Laatste feed update: {formatDate(lastUpdated) ?? 'Onbekend'}.</p>
                    {manualConfigUpdatedAt && (
                      <p>Handmatige categorieën gepubliceerd op: {formatDate(manualConfigUpdatedAt)}.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <Container size="xl" padded className="space-y-16 pb-24 pt-12">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <LoadingSpinner message="Deals laden…" />
          ) : (
            <>
              {state.dealOfWeek && (
                <section className="animate-fade-in">
                  <div className="grid gap-6 overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-xl lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 p-6 sm:p-10">
                      <ImageWithFallback
                        src={state.dealOfWeek.imageUrl}
                        alt={state.dealOfWeek.name}
                        className="w-full max-w-[380px] object-contain"
                        fit="contain"
                      />
                    </div>
                    <div className="flex flex-col gap-6 p-8 sm:p-12">
                      <div className="inline-flex items-center gap-2 self-start rounded-full bg-rose-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
                        <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                        Deal van de week
                      </div>
                      <div className="space-y-3">
                        <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                          {state.dealOfWeek.name}
                        </h2>
                        <p className="text-base text-slate-600 sm:text-lg leading-relaxed">
                          {state.dealOfWeek.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-base font-semibold text-white">
                          <TagIcon className="h-4 w-4" aria-hidden="true" />
                          {formatPrice(state.dealOfWeek.price) ?? 'Prijs op aanvraag'}
                        </span>
                        {state.dealOfWeek.originalPrice && (
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
                            <s>{state.dealOfWeek.originalPrice}</s>
                          </span>
                        )}
                        {state.dealOfWeek.giftScore && (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-600">
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
                            Cadeauscore {state.dealOfWeek.giftScore}/10
                          </span>
                        )}
                        {state.dealOfWeek.isOnSale && (
                          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-600">
                            <StarIcon className="h-4 w-4" aria-hidden="true" />
                            Extra scherp geprijsd
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href={withAffiliate(state.dealOfWeek.affiliateLink)}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="inline-flex items-center gap-3 rounded-lg bg-rose-500 px-6 py-3 text-base font-semibold text-white shadow transition hover:bg-rose-600"
                        >
                          Profiteer van de deal
                        </a>
                        <Button
                          variant="secondary"
                          className="bg-white text-rose-600 border border-rose-100 hover:border-rose-200 hover:bg-rose-50"
                          onClick={loadDeals}
                        >
                          Toon alternatief
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {state.topDeals.length > 0 && (
                <section className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
                  <div className="mb-10 text-center">
                    <StarIcon className="mx-auto h-12 w-12 text-rose-500" aria-hidden="true" />
                    <h2 className="mt-4 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                      Top 10 cadeaus van deze week
                    </h2>
                    <p className="mt-3 text-base text-slate-600 sm:text-lg">
                      Deze cadeaus scoren hoog op cadeauscore, populariteit en voordeel. De lijst wordt dagelijks bijgewerkt.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
                    {state.topDeals.map((deal, index) => (
                      <div
                        key={deal.id}
                        className="relative flex flex-col rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
                      >
                        <span className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 font-semibold text-white shadow">
                          #{index + 1}
                        </span>
                        <div className="mt-10">
                          {renderDealCard(deal, 'compact')}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {state.categories.length > 0 && (
                <section className="space-y-16">
                  {state.categories.map((category, index) => (
                    <div key={category.title} className="animate-fade-in-up" style={{ animationDelay: `${300 + index * 80}ms` }}>
                      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                          {category.title}
                        </h2>
                        <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
                          <BookmarkIcon className="h-4 w-4" aria-hidden="true" />
                          Curated selectie
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {category.items.map((deal) => (
                          <React.Fragment key={deal.id}>{renderDealCard(deal)}</React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {!state.dealOfWeek && state.topDeals.length === 0 && state.categories.length === 0 && !error && (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
                  <p className="text-lg font-semibold text-slate-700">Nog geen deals beschikbaar</p>
                  <p className="mt-2 text-sm">Controleer later opnieuw – zodra er nieuwe feed-updates zijn verschijnen ze hier automatisch.</p>
                  <div className="mt-4 flex justify-center">
                    <Button variant="primary" onClick={loadDeals}>
                      Vernieuw nu
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Container>
      </div>
    </>
  );
};

export default DealsPage;
