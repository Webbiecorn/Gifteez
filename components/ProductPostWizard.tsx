import React, { useEffect, useMemo, useState } from 'react'
import { AmazonProductLibrary } from '../services/amazonProductLibrary'
import CoolblueFeedService from '../services/coolblueFeedService'
import Button from './Button'
import ImageWithFallback from './ImageWithFallback'
import type { AmazonProduct } from '../services/amazonProductLibrary'
import type { BlogPostData } from '../services/blogService'
import type { CoolblueFeedMeta, CoolblueProduct } from '../services/coolblueFeedService'

interface ProductPostWizardProps {
  isOpen: boolean
  onCancel: () => void
  // eslint-disable-next-line no-unused-vars
  onGenerate: (postTemplate: BlogPostData) => void
}

// Template types voor verschillende soorten posts
type TemplateType = 'quick' | 'detailed' | 'comparison'

interface TemplateOption {
  type: TemplateType
  label: string
  description: string
  icon: string
  recommended: boolean
}

const templateOptions: TemplateOption[] = [
  {
    type: 'detailed',
    label: 'Uitgebreid (Aanbevolen)',
    description:
      'Volledige productbeschrijvingen met specs, highlights en vergelijkingen. Beste voor SEO en conversie.',
    icon: '📝',
    recommended: true,
  },
  {
    type: 'quick',
    label: 'Kort & Krachtig',
    description: 'Snelle opsomming met kernpunten. Ideaal voor lijstartikelen en quick guides.',
    icon: '⚡',
    recommended: false,
  },
  {
    type: 'comparison',
    label: 'Vergelijkend',
    description: 'Side-by-side vergelijking van producten. Perfect voor "X vs Y" artikelen.',
    icon: '⚖️',
    recommended: false,
  },
]

// Unified product interface voor zowel Amazon als Coolblue
interface UnifiedProduct extends CoolblueProduct {
  source: 'amazon' | 'coolblue'
  originalProduct?: AmazonProduct
}

interface WizardState {
  products: UnifiedProduct[]
  coolblueMeta: CoolblueFeedMeta
  loading: boolean
  error?: string
}

const ProductPostWizard: React.FC<ProductPostWizardProps> = ({ isOpen, onCancel, onGenerate }) => {
  const [state, setState] = useState<WizardState>({
    products: [],
    coolblueMeta: CoolblueFeedService.getMeta(),
    loading: true,
  })
  const [search, setSearch] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<UnifiedProduct[]>([])
  const [focusedProductId, setFocusedProductId] = useState<string | null>(null)
  const [selectionWarning, setSelectionWarning] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('detailed')
  const [showPreview, setShowPreview] = useState(false)
  const [generatedPreview, setGeneratedPreview] = useState<BlogPostData | null>(null)
  const MAX_SELECTION = 5
  const focusedProduct = useMemo(() => {
    if (!selectedProducts.length) {
      return null
    }
    if (focusedProductId) {
      const match = selectedProducts.find((item) => item.id === focusedProductId)
      if (match) {
        return match
      }
    }
    return selectedProducts[0] ?? null
  }, [selectedProducts, focusedProductId])

  // Helper functie om Amazon product te converteren naar UnifiedProduct
  const convertAmazonToUnified = (amazonProduct: AmazonProduct): UnifiedProduct => {
    return {
      id: amazonProduct.id,
      name: amazonProduct.name,
      price: amazonProduct.price,
      image: amazonProduct.image || amazonProduct.imageLarge || '',
      imageUrl: amazonProduct.image || amazonProduct.imageLarge || '',
      description: amazonProduct.description || '',
      shortDescription: amazonProduct.description?.slice(0, 150) || '',
      category: amazonProduct.category || 'Overig',
      affiliateLink: amazonProduct.affiliateLink,
      isOnSale: false,
      lastUpdated: new Date().toISOString(),
      tags: [],
      giftScore: 0,
      source: 'amazon',
      originalProduct: amazonProduct,
    }
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: undefined }))

    // Laad zowel Coolblue als Amazon producten
    Promise.all([CoolblueFeedService.loadProducts(), AmazonProductLibrary.loadProducts()])
      .then(([coolblueProducts, amazonProducts]) => {
        if (cancelled) return

        // Converteer Coolblue producten naar UnifiedProduct
        const unifiedCoolblue: UnifiedProduct[] = coolblueProducts.map((product) => ({
          ...product,
          source: 'coolblue' as const,
        }))

        // Converteer Amazon producten naar UnifiedProduct
        const unifiedAmazon: UnifiedProduct[] = amazonProducts.map(convertAmazonToUnified)

        // Combineer beide arrays
        const allProducts = [...unifiedCoolblue, ...unifiedAmazon]

        setState({
          products: allProducts,
          coolblueMeta: CoolblueFeedService.getMeta(),
          loading: false,
        })
        setSelectedProducts([])
        setFocusedProductId(null)
        setSearch('')
        setSelectionWarning(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const errorMessage = error instanceof Error ? error.message : 'Onbekende fout'
        console.error('Kon producten niet laden:', errorMessage)
        setState({
          products: [],
          coolblueMeta: CoolblueFeedService.getMeta(),
          loading: false,
          error: 'De producten konden niet geladen worden. Probeer het later opnieuw.',
        })
        setSelectedProducts([])
        setFocusedProductId(null)
        setSelectionWarning(null)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen])

  useEffect(() => {
    if (!selectedProducts.length) {
      setFocusedProductId(null)
      return
    }

    setFocusedProductId((current) => {
      if (!current || !selectedProducts.some((item) => item.id === current)) {
        return selectedProducts[0].id
      }
      return current
    })
  }, [selectedProducts])

  const filteredProducts = useMemo(() => {
    if (!state.products.length) {
      return []
    }
    const term = search.trim().toLowerCase()
    if (!term) {
      return state.products.slice(0, 40)
    }

    return state.products
      .filter((product) => {
        const haystack =
          `${product.name} ${product.description ?? ''} ${product.category ?? ''} ${(product.tags ?? []).join(' ')}`.toLowerCase()
        return haystack.includes(term)
      })
      .slice(0, 60)
  }, [state.products, search])

  const handleGenerate = () => {
    if (!selectedProducts.length) {
      setSelectionWarning('Selecteer minstens één product om een concept te genereren.')
      return
    }

    try {
      // Converteer UnifiedProduct terug naar CoolblueProduct voor de template generator
      const productsForTemplate: CoolblueProduct[] = selectedProducts.map((product) => {
        // Als het een Amazon product is, gebruik de originalProduct data
        if (product.source === 'amazon' && product.originalProduct) {
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            imageUrl: product.imageUrl,
            description: product.description,
            shortDescription: product.shortDescription,
            category: product.category,
            affiliateLink: product.affiliateLink,
            isOnSale: product.isOnSale,
            lastUpdated: product.lastUpdated,
            tags: product.tags,
            giftScore: product.giftScore,
          }
        }
        // Voor Coolblue producten, return as-is (verwijder source en originalProduct)
        // eslint-disable-next-line no-unused-vars
        const { source: _source, originalProduct: _originalProduct, ...coolblueProduct } = product
        return coolblueProduct
      })

      const template = CoolblueFeedService.generateMultiProductTemplate(productsForTemplate)

      // Toon preview in plaats van direct genereren
      setGeneratedPreview(template)
      setShowPreview(true)
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Genereren mislukt. Probeer het opnieuw.'
      console.error('Kon productpost niet genereren:', errorMessage)
      setSelectionWarning(errorMessage)
    }
  }

  const handleConfirmGenerate = () => {
    if (generatedPreview) {
      onGenerate(generatedPreview)
      setShowPreview(false)
      setGeneratedPreview(null)
    }
  }

  const toggleProduct = (product: UnifiedProduct) => {
    setSelectedProducts((prev) => {
      const exists = prev.some((item) => item.id === product.id)
      if (exists) {
        const next = prev.filter((item) => item.id !== product.id)
        setSelectionWarning(null)
        setFocusedProductId((current) => {
          if (current === product.id) {
            return next[0]?.id ?? null
          }
          return current
        })
        return next
      }

      if (prev.length >= MAX_SELECTION) {
        setSelectionWarning(
          `Je kunt maximaal ${MAX_SELECTION} producten selecteren voor één artikel.`
        )
        return prev
      }

      setSelectionWarning(null)
      setFocusedProductId(product.id)
      return [...prev, product]
    })
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-6">
      <div className="relative flex w-full max-w-5xl flex-col rounded-3xl bg-white shadow-2xl md:max-h-[90vh] md:overflow-hidden">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Productpost bouwen vanuit productfeed
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Kies producten uit Amazon of Coolblue om automatisch een concept blogpost te
                genereren.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {state.coolblueMeta.total} Coolblue producten ·{' '}
                {state.products.filter((p) => p.source === 'amazon').length} Amazon producten ·
                Totaal: {state.products.length} beschikbaar
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-2xl text-gray-400 transition hover:text-gray-600"
              aria-label="Sluiten"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid flex-1 grid-cols-1 gap-0 md:grid-cols-[2fr_3fr]">
            <div className="border-r p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Zoek in feed</label>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Zoek op productnaam, categorie of tags..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              <div
                className="space-y-3 overflow-y-auto pr-2"
                style={{ maxHeight: 'calc(90vh - 200px)' }}
              >
                {state.loading && (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-12 text-gray-500">
                    <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                    <p className="text-sm">Producten laden...</p>
                  </div>
                )}

                {state.error && !state.loading && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {state.error}
                  </div>
                )}

                {!state.loading && !state.error && filteredProducts.length === 0 && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                    Geen producten gevonden voor deze zoekopdracht.
                  </div>
                )}

                {!state.loading &&
                  !state.error &&
                  filteredProducts.map((product) => {
                    const isSelected = selectedProducts.some((item) => item.id === product.id)
                    const rank = isSelected
                      ? selectedProducts.findIndex((item) => item.id === product.id) + 1
                      : null
                    const disabled = !isSelected && selectedProducts.length >= MAX_SELECTION
                    return (
                      <button
                        type="button"
                        key={product.id}
                        onClick={() => toggleProduct(product)}
                        disabled={disabled}
                        className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50/80 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50/50'
                        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <ImageWithFallback
                            src={
                              product.imageUrl || product.image || '/images/amazon-placeholder.png'
                            }
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                          {isSelected && (
                            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white shadow-md">
                              {rank}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                                    product.source === 'amazon'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {product.source === 'amazon' ? '🔶 Amazon' : '🔷 Coolblue'}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                                {product.name}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                {product.description}
                              </p>
                            </div>
                            <div className="text-right text-xs font-semibold text-rose-500">
                              €{product.price.toFixed(2)}
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-gray-400">
                            {product.category && (
                              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-600">
                                {product.category}
                              </span>
                            )}
                            {(product.tags ?? []).slice(0, 3).map((tag) => (
                              <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5">
                                {tag}
                              </span>
                            ))}
                          </div>
                          {!isSelected && disabled && (
                            <p className="mt-2 text-[11px] font-medium text-amber-600">
                              Maximum van {MAX_SELECTION} items bereikt. Deselecteer eerst een
                              product.
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
              </div>
            </div>

            <div className="flex flex-col p-6">
              <div className="mb-4 flex flex-col gap-1 border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Geselecteerde producten ({selectedProducts.length}/{MAX_SELECTION})
                  </h3>
                  {selectedProducts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProducts([])
                        setFocusedProductId(null)
                        setSelectionWarning(null)
                      }}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                    >
                      Reset selectie
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Hero-afbeelding wordt bewust niet ingevuld; voeg in de editor zelf een pakkende
                visual toe.
              </p>
            </div>

            {selectionWarning && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                {selectionWarning}
              </div>
            )}

            {!selectedProducts.length ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center text-gray-500">
                <div className="text-4xl">🛍️</div>
                <p className="mt-4 text-sm font-medium">
                  Selecteer links tot {MAX_SELECTION} producten om een lijstartikel te bouwen.
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Na genereren kun je de intro, hero-afbeelding en SEO volledig aanpassen.
                </p>
              </div>
            ) : (
              <>
                <ol className="mb-4 space-y-2">
                  {selectedProducts.map((product, index) => {
                    const isFocused = focusedProduct?.id === product.id
                    return (
                      <li
                        key={product.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white/80 px-3 py-2"
                      >
                        <button
                          type="button"
                          onClick={() => setFocusedProductId(product.id)}
                          className={`flex flex-1 items-center gap-3 text-left transition ${
                            isFocused ? 'text-rose-600' : 'text-gray-700 hover:text-rose-500'
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                              isFocused ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="flex-1 text-sm font-medium line-clamp-1">
                            {product.name}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleProduct(product)}
                          className="text-xs font-semibold text-gray-400 hover:text-red-500"
                        >
                          Verwijder
                        </button>
                      </li>
                    )
                  })}
                </ol>

                {focusedProduct && (
                  <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/60 p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                        <ImageWithFallback
                          src={
                            focusedProduct.imageUrl ||
                            focusedProduct.image ||
                            '/images/amazon-placeholder.png'
                          }
                          alt={focusedProduct.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="mb-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                              focusedProduct.source === 'amazon'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {focusedProduct.source === 'amazon' ? '🔶 Amazon' : '🔷 Coolblue'}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-gray-900">
                          {focusedProduct.name}
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          {focusedProduct.description ?? 'Geen productbeschrijving beschikbaar.'}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-gray-400">
                          {focusedProduct.category && (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-600">
                              {focusedProduct.category}
                            </span>
                          )}
                          {(focusedProduct.tags ?? []).map((tag) => (
                            <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                      <h5 className="mb-2 font-semibold text-gray-900">Kernpunten</h5>
                      <ul className="list-disc pl-5">
                        {(focusedProduct.shortDescription?.split('.') ?? [])
                          .map((snippet) => snippet.trim())
                          .filter(Boolean)
                          .slice(0, 5)
                          .map((snippet, index) => (
                            <li key={index} className="mb-1">
                              {snippet}
                            </li>
                          ))}
                        {!focusedProduct.shortDescription && (
                          <li>Voeg later eigen bulletpoints toe in de editor.</li>
                        )}
                      </ul>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="rounded-xl border border-gray-200 p-3">
                        <p className="text-xs uppercase text-gray-400">Prijs</p>
                        <p className="text-base font-semibold text-gray-900">
                          €{focusedProduct.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-200 p-3">
                        <p className="text-xs uppercase text-gray-400">Affiliate link</p>
                        {focusedProduct.affiliateLink ? (
                          <a
                            href={focusedProduct.affiliateLink}
                            className="break-all text-xs text-rose-500"
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                          >
                            {focusedProduct.affiliateLink}
                          </a>
                        ) : (
                          <p className="text-xs text-gray-400">Geen link gevonden</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Template type selector */}
            {selectedProducts.length > 0 && (
              <div className="mt-6 rounded-xl border border-gray-200 bg-gradient-to-br from-rose-50 to-white p-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">
                  📝 Kies je artikel stijl
                </h4>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  {templateOptions.map((option) => (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => setSelectedTemplate(option.type)}
                      className={`relative rounded-lg border-2 p-3 text-left transition ${
                        selectedTemplate === option.type
                          ? 'border-rose-500 bg-rose-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-rose-200'
                      }`}
                    >
                      {option.recommended && (
                        <span className="absolute -top-2 -right-2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                          BEST
                        </span>
                      )}
                      <div className="mb-1 text-xl">{option.icon}</div>
                      <div className="text-xs font-semibold text-gray-900">{option.label}</div>
                      <div className="mt-1 text-[11px] leading-tight text-gray-600">
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-xs text-gray-400">
                {selectedProducts.length > 1
                  ? `We vullen automatisch een top ${selectedProducts.length} artikel met tussenkoppen en productsections.`
                  : 'De gegenereerde post opent in de editor zodat je tekst en SEO kunt bijwerken.'}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProducts([])
                    setFocusedProductId(null)
                    setSelectionWarning(null)
                  }}
                  disabled={!selectedProducts.length}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Selectie wissen
                </button>
                <Button
                  variant="accent"
                  onClick={handleGenerate}
                  disabled={!selectedProducts.length}
                  className="px-6"
                >
                  {selectedProducts.length > 1
                    ? `Genereer top ${selectedProducts.length}`
                    : 'Genereer blogpost'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && generatedPreview && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-6">
          <div className="relative flex w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl md:max-h-[90vh]">
            <div className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">📋 Preview: Jouw artikel</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Check de content voordat je naar de editor gaat
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPreview(false)
                    setGeneratedPreview(null)
                  }}
                  className="text-2xl text-gray-400 transition hover:text-gray-600"
                  aria-label="Sluiten"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Preview content */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                <div className="mb-4 border-b pb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{generatedPreview.title}</h1>
                  <p className="mt-2 text-sm text-gray-600">{generatedPreview.excerpt}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                      {generatedPreview.category}
                    </span>
                    {generatedPreview.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content preview (first 500 chars) */}
                <div className="prose prose-sm max-w-none">
                  <div className="text-sm text-gray-700">
                    {generatedPreview.content.slice(0, 800)}...
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Dit is een preview van de eerste paragrafen
                      </p>
                      <p className="mt-1 text-xs text-blue-700">
                        Het volledige artikel bevat {selectedProducts.length} producten met alle
                        details, specs en affiliate links. Je kunt alles aanpassen in de editor.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SEO preview */}
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">🔍 SEO Preview</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Meta Title</p>
                      <p className="text-sm text-blue-600">
                        {generatedPreview.seo?.metaTitle || generatedPreview.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Meta Description</p>
                      <p className="text-xs text-gray-700">
                        {generatedPreview.seo?.metaDescription || generatedPreview.excerpt}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">URL Slug</p>
                      <p className="text-xs font-mono text-gray-600">
                        /blog/{generatedPreview.slug}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowPreview(false)
                    setGeneratedPreview(null)
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
                >
                  ← Terug naar selectie
                </button>
                <div className="flex gap-3">
                  <Button variant="accent" onClick={handleConfirmGenerate} className="px-6">
                    ✓ Akkoord, naar editor
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductPostWizard
