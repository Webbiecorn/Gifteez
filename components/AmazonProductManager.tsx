import React, { useEffect, useMemo, useState } from 'react';
import { AmazonProductLibrary, type AmazonProduct, type AmazonProductInput } from '../services/amazonProductLibrary';

interface FormState {
  asin: string;
  name: string;
  affiliateLink: string;
  description: string;
  shortDescription: string;
  image: string;
  price: string;
  originalPrice: string;
  category: string;
  tags: string;
  prime: boolean;
  rating: string;
  reviewCount: string;
  giftScore: string;
}

const defaultFormState: FormState = {
  asin: '',
  name: '',
  affiliateLink: '',
  description: '',
  shortDescription: '',
  image: '',
  price: '',
  originalPrice: '',
  category: '',
  tags: '',
  prime: false,
  rating: '',
  reviewCount: '',
  giftScore: '',
};

const parseNumber = (value: string): number | undefined => {
  if (!value.trim()) return undefined;
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toInputPayload = (form: FormState): AmazonProductInput => ({
  asin: form.asin.trim(),
  name: form.name.trim(),
  affiliateLink: form.affiliateLink.trim(),
  description: form.description.trim() || undefined,
  shortDescription: form.shortDescription.trim() || undefined,
  image: form.image.trim() || undefined,
  price: parseNumber(form.price),
  originalPrice: parseNumber(form.originalPrice),
  category: form.category.trim() || undefined,
  tags: form.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean),
  prime: form.prime,
  rating: parseNumber(form.rating),
  reviewCount: parseNumber(form.reviewCount),
  giftScore: parseNumber(form.giftScore),
});

const AmazonProductManager: React.FC = () => {
  const [products, setProducts] = useState<AmazonProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = AmazonProductLibrary.subscribe((items) => {
      setProducts(items);
      setLoading(false);
    });

    AmazonProductLibrary.loadProducts().catch((error) => {
      console.warn('Kon Amazon producten niet laden:', error);
      setStatus({ type: 'error', message: 'Kon de Amazon-producten niet laden. Probeer het later opnieuw.' });
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const resetForm = () => {
    setForm(defaultFormState);
    setEditingId(null);
  };

  const handleEdit = (product: AmazonProduct) => {
    setEditingId(product.id);
    setForm({
      asin: product.asin,
      name: product.name,
      affiliateLink: product.affiliateLink ?? '',
      description: product.description ?? '',
      shortDescription: product.shortDescription ?? '',
      image: product.imageLarge ?? product.image ?? '',
      price: product.price != null ? String(product.price) : '',
      originalPrice: product.originalPrice != null ? String(product.originalPrice) : '',
      category: product.category ?? '',
      tags: (product.tags ?? []).join(', '),
      prime: Boolean(product.prime),
      rating: product.rating != null ? String(product.rating) : '',
      reviewCount: product.reviewCount != null ? String(product.reviewCount) : '',
      giftScore: product.giftScore != null ? String(product.giftScore) : '',
    });
  };

  const validateForm = (): string | null => {
    if (!form.asin.trim()) return 'Voer de ASIN van het product in';
    if (!form.name.trim()) return 'Voer een productnaam in';
    if (!form.affiliateLink.trim()) return 'Voeg de Amazon affiliate link toe (met SiteStripe)';
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setStatus({ type: 'error', message: validationError });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = toInputPayload(form);
      if (editingId) {
        await AmazonProductLibrary.update(editingId, payload);
        setStatus({ type: 'success', message: 'Amazon-product bijgewerkt!' });
      } else {
        await AmazonProductLibrary.create(payload);
        setStatus({ type: 'success', message: 'Nieuw Amazon-product toegevoegd!' });
      }
      resetForm();
    } catch (error: any) {
      console.error('Kon Amazon product niet opslaan:', error);
      setStatus({ type: 'error', message: error?.message ?? 'Onbekende fout bij opslaan' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Weet je zeker dat je "${name}" wilt verwijderen uit de Amazon bibliotheek?`)) {
      return;
    }

    try {
      await AmazonProductLibrary.remove(id);
      setStatus({ type: 'success', message: 'Product verwijderd.' });
      if (editingId === id) {
        resetForm();
      }
    } catch (error: any) {
      console.error('Kon Amazon product niet verwijderen:', error);
      setStatus({ type: 'error', message: error?.message ?? 'Verwijderen mislukt' });
    }
  };

  const totalPrime = useMemo(() => products.filter((item) => item.prime).length, [products]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Amazon productbibliotheek</h3>
          <p className="text-sm text-gray-500">Beheer handmatige Amazon producten totdat de officiële PA-API beschikbaar is.</p>
        </div>
        <div className="text-sm text-gray-500">
          {products.length} producten • {totalPrime} Prime beschikbaar
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
        <div className="border-r border-gray-100 p-6 space-y-4 max-h-[540px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center gap-3 text-gray-600 text-sm">
              <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              Amazon producten laden...
            </div>
          ) : products.length ? (
            products.map((product) => {
              const image = product.imageLarge ?? product.image ?? '/images/amazon-placeholder.png';
              const priceLabel = product.price ? `€${product.price.toFixed(2)}` : undefined;
              const updated = product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('nl-NL') : 'onbekend';
              return (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 flex gap-4">
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                    <img src={image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</h4>
                        <p className="text-xs text-gray-500">ASIN: {product.asin}</p>
                      </div>
                      {product.prime && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-600">Prime</span>
                      )}
                    </div>
                    {priceLabel && <p className="text-xs text-gray-600">{priceLabel}</p>}
                    {product.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                      <span>Laatst geüpdatet: {updated}</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(product.affiliateLink ?? '')}
                        className="text-rose-500 hover:text-rose-600"
                      >
                        Affiliate link kopiëren
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      Bewerken
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id, product.name)}
                      className="text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      Verwijderen
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-500">
              Nog geen Amazon producten toegevoegd. Gebruik het formulier om je eerste product toe te voegen.
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-gray-900">
              {editingId ? 'Amazon product bewerken' : 'Nieuw Amazon product toevoegen'}
            </h4>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Annuleren
              </button>
            )}
          </div>

          {status && (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                status.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {status.message}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                ASIN
                <input
                  type="text"
                  value={form.asin}
                  onChange={(e) => setForm((prev) => ({ ...prev, asin: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  placeholder="Bijv. B08N5WRWNW"
                  required
                />
              </label>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Productnaam
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  placeholder="Titel zoals op Amazon"
                  required
                />
              </label>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Affiliate link (SiteStripe)
                <input
                  type="url"
                  value={form.affiliateLink}
                  onChange={(e) => setForm((prev) => ({ ...prev, affiliateLink: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  placeholder="https://www.amazon.nl/dp/... ?tag=gifteez77-21"
                  required
                />
              </label>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Afbeelding URL
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  placeholder="https://m.media-amazon.com/images/..."
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Prijs (€)
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    placeholder="59.99"
                  />
                </label>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Adviesprijs (€)
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.originalPrice}
                    onChange={(e) => setForm((prev) => ({ ...prev, originalPrice: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    placeholder="79.99"
                  />
                </label>
              </div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Beschrijving
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  rows={3}
                  placeholder="Korte samenvatting voor blogs"
                />
              </label>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Bullet points / korte intro
                <textarea
                  value={form.shortDescription}
                  onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  rows={2}
                  placeholder="Gebruik voor snelle bullet points"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Categorie
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    placeholder="Bijv. Gadgets, Smart Home"
                  />
                </label>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Tags (comma-separated)
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    placeholder="bijv. smart-home, speaker"
                  />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Review score (1-5)
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.rating}
                    onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  />
                </label>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Reviews
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.reviewCount}
                    onChange={(e) => setForm((prev) => ({ ...prev, reviewCount: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  />
                </label>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Gift score (1-10)
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.giftScore}
                    onChange={(e) => setForm((prev) => ({ ...prev, giftScore: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <input
                  type="checkbox"
                  checked={form.prime}
                  onChange={(e) => setForm((prev) => ({ ...prev, prime: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                />
                Beschikbaar met Prime bezorging
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Opslaan...' : editingId ? 'Wijzigingen opslaan' : 'Product toevoegen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AmazonProductManager;
