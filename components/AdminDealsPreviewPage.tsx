import React, { useCallback, useEffect, useState } from 'react';
import { NavigateTo, DealCategory, DealItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { DynamicProductService } from '../services/dynamicProductService';
import { DealCategoryConfigService } from '../services/dealCategoryConfigService';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import DealsPreviewSections from './DealsPreviewSections';
import { Container } from './layout/Container';
import Meta from './Meta';
import {
  SparklesIcon,
  TagIcon,
  BookmarkFilledIcon,
  SpinnerIcon,
  LinkIcon
} from './IconComponents';

interface AdminDealsPreviewPageProps {
  navigateTo: NavigateTo;
}

const ADMIN_EMAILS = [
  'admin@gifteez.nl',
  'kevin@gifteez.nl',
  'beheer@gifteez.nl',
  'test@gifteez.nl',
];

const AdminDealsPreviewPage: React.FC<AdminDealsPreviewPageProps> = ({ navigateTo }) => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dealOfWeek, setDealOfWeek] = useState<DealItem | null>(null);
  const [topDeals, setTopDeals] = useState<DealItem[]>([]);
  const [categories, setCategories] = useState<DealCategory[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [manualConfigUpdatedAt, setManualConfigUpdatedAt] = useState<string | null>(null);

  const isAuthorized = auth?.currentUser?.email
    ? ADMIN_EMAILS.includes(auth.currentUser.email.toLowerCase())
    : false;

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [weekly, top, categoryData, manualConfig] = await Promise.all([
        DynamicProductService.getDealOfTheWeek(),
        DynamicProductService.getTop10Deals(),
        DynamicProductService.getDealCategories(),
        DealCategoryConfigService.load()
      ]);

      setDealOfWeek(weekly);
      setTopDeals(top);
      setCategories(categoryData);
      setLastUpdated(DynamicProductService.getStats()?.lastUpdated ?? null);
      setManualConfigUpdatedAt(manualConfig?.updatedAt ?? null);
    } catch (previewError: any) {
      console.error('Kon preview niet laden:', previewError);
      setError(previewError?.message ?? 'Kon preview niet laden. Probeer het opnieuw.');
      setDealOfWeek(null);
      setTopDeals([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  if (!auth || auth.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" message="Authenticatie controleren…" />
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center space-y-6">
          <SparklesIcon className="mx-auto h-12 w-12 text-rose-500" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin login vereist</h1>
            <p className="mt-2 text-gray-600">Log in met je admin account om de deals-preview te bekijken.</p>
          </div>
          <Button onClick={() => navigateTo('login')} className="w-full">
            Ga naar login
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white shadow-lg rounded-2xl p-10 text-center space-y-4">
          <BookmarkFilledIcon className="mx-auto h-12 w-12 text-rose-500" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900">Geen toegang</h1>
          <p className="text-gray-600">
            Je account heeft geen toegang tot de deals-preview. Neem contact op met het team als je denkt dat dit een vergissing is.
          </p>
          <Button variant="secondary" onClick={() => navigateTo('home')} className="w-full">
            Terug naar homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Meta
        title="Admin deals preview"
        description="Bekijk een preview van de Gifteez deals zoals bezoekers die zien."
      />
      <div className="bg-gradient-to-b from-slate-50 via-white to-white min-h-screen pb-24">
        <div className="border-b border-rose-100 bg-gradient-to-r from-rose-500 via-rose-600 to-purple-600 text-white">
          <Container size="xl" padded className="py-16">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                  Deals preview
                </span>
                <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
                  Controleer de deals zoals bezoekers ze zien
                </h1>
                <p className="max-w-2xl text-base text-white/85 sm:text-lg">
                  Deze pagina toont dezelfde selectie als de publieke deals-pagina, zodat je snel kunt zien welke producten live staan en wanneer de laatste update plaatsvond.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="accent" onClick={() => navigateTo('admin')}>
                    Terug naar admin
                  </Button>
                  <Button
                    variant="ghost"
                    className="border border-white/40 bg-white/10 text-white hover:bg-white/20"
                    onClick={loadPreview}
                  >
                    Ververs data
                  </Button>
                </div>
              </div>
              <div className="relative rounded-3xl border border-white/30 bg-white/10 p-8 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-white/80">
                  <TagIcon className="h-5 w-5" aria-hidden="true" />
                  Live status
                </div>
                <dl className="mt-6 space-y-3 text-sm text-white/80">
                  <div className="flex items-center justify-between">
                    <dt>Laatste feed update</dt>
                    <dd>{lastUpdated ? lastUpdated.toLocaleString('nl-NL') : 'Onbekend'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Handmatige categorieën</dt>
                    <dd>{manualConfigUpdatedAt ? new Date(manualConfigUpdatedAt).toLocaleString('nl-NL') : 'Automatisch'}</dd>
                  </div>
                </dl>
                <div className="mt-6 rounded-xl border border-white/30 bg-white/10 p-4 text-xs text-white/70">
                  Voor conceptblokken met niet-opgeslagen wijzigingen blijft de in-app preview in het admin panel beschikbaar.
                </div>
              </div>
            </div>
          </Container>
        </div>

        <Container size="xl" padded className="pt-12">
          {error && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <LoadingSpinner message="Preview laden…" />
          ) : (
            <div className="space-y-10 pb-16">
              <div className="rounded-2xl border border-rose-100 bg-white p-6 text-sm text-slate-600 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
                    <BookmarkFilledIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Gepubliceerde selectie
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <LinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Live op /deals
                  </span>
                  <button
                    type="button"
                    onClick={loadPreview}
                    className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-600"
                  >
                    <SpinnerIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Vernieuw data
                  </button>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-slate-500">
                  Deze preview gebruikt opgeslagen categorieblokken. Conceptwijzigingen die nog niet zijn gepubliceerd zijn alleen zichtbaar in het admin dashboard.
                </p>
              </div>

              <DealsPreviewSections
                dealOfWeek={dealOfWeek}
                topDeals={topDeals}
                categories={categories}
              />
            </div>
          )}
        </Container>
      </div>
    </>
  );
};

export default AdminDealsPreviewPage;
