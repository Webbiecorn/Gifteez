import React, { useEffect, useMemo, useRef, useState } from 'react'
import { amazonGetItem } from '../services/amazonClient'
import {
  AmazonProductLibrary,
  parseAmazonAffiliateLink,
  type AmazonProduct,
  type AmazonProductInput,
} from '../services/amazonProductLibrary'
import {
  DealCategoryConfigService,
  type DealCategoryConfig,
} from '../services/dealCategoryConfigService'
import Button from './Button'
import {
  ShoppingCartIcon,
  CheckIcon,
  XIcon,
  SparklesIcon,
  StarIcon,
  ChevronRightIcon,
  SpinnerIcon,
} from './IconComponents'

interface QuickFormState {
  affiliateLink: string
  imageUrl: string
  name: string
  price: string
  prime: boolean
  description: string
  shortDescription: string
  rating: string
  reviewCount: string
}

const defaultQuickForm: QuickFormState = {
  affiliateLink: '',
  imageUrl: '',
  name: '',
  price: '',
  prime: true,
  description: '',
  shortDescription: '',
  rating: '',
  reviewCount: '',
}

const parsePrice = (value: string): number | undefined => {
  if (!value) return undefined
  const normalised = value.replace(/[^0-9.,]/g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalised)
  return Number.isFinite(parsed) ? parsed : undefined
}

const formatPrice = (value?: number | null): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'Prijs onbekend'
  }
  return `€${value.toFixed(2)}`
}

const AmazonProductManager: React.FC = () => {
  const [products, setProducts] = useState<AmazonProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)
  const [form, setForm] = useState<QuickFormState>(defaultQuickForm)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoFillState, setAutoFillState] = useState<
    { status: 'idle' } | { status: 'loading' | 'success' | 'error'; asin: string; message: string }
  >({ status: 'idle' })
  const lastFetchedAsinRef = useRef<string | null>(null)
  const inFlightAsinRef = useRef<string | null>(null)
  const [categoryConfig, setCategoryConfig] = useState<DealCategoryConfig | null>(null)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categorySelections, setCategorySelections] = useState<Record<string, string>>({})
  const [categoryOperation, setCategoryOperation] = useState<{
    productId: string
    categoryId: string
    type: 'add' | 'remove'
  } | null>(null)

  useEffect(() => {
    const unsubscribe = AmazonProductLibrary.subscribe((items) => {
      setProducts(items)
      setLoading(false)
    })

    AmazonProductLibrary.loadProducts().catch((error) => {
      console.warn('Kon Amazon producten niet laden:', error)
      setStatus({
        type: 'error',
        message: 'Kon de Amazon-producten niet laden. Probeer het later opnieuw.',
      })
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const config = await DealCategoryConfigService.load()
        if (!cancelled) {
          setCategoryConfig(config ?? { categories: [] })
        }
      } catch (error) {
        console.warn('Kon categorieblokken niet laden:', error)
        if (!cancelled) {
          setCategoryConfig({ categories: [] })
          setStatus({
            type: 'error',
            message: 'Kon de categorieblokken niet laden. Probeer het later opnieuw.',
          })
          if (typeof window !== 'undefined') {
            window.setTimeout(() => setStatus(null), 3500)
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCategories(false)
        }
      }
    }

    void loadCategories()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!categoryConfig?.categories?.length) {
      setCategorySelections({})
      return
    }

    setCategorySelections((current) => {
      const allowed = new Set(categoryConfig.categories.map((category) => category.id))
      const next: Record<string, string> = {}
      Object.keys(current).forEach((productId) => {
        const categoryId = current[productId]
        if (allowed.has(categoryId)) {
          next[productId] = categoryId
        }
      })
      return next
    })
  }, [categoryConfig])

  const categoryOptions = categoryConfig?.categories ?? []

  const productCategoryMap = useMemo(() => {
    const map = new Map<string, Array<{ id: string; title: string }>>()
    categoryOptions.forEach((category) => {
      category.itemIds.forEach((rawId) => {
        const itemId = String(rawId)
        const entry = map.get(itemId)
        const payload = { id: category.id, title: category.title }
        if (entry) {
          entry.push(payload)
        } else {
          map.set(itemId, [payload])
        }
      })
    })
    return map
  }, [categoryOptions])

  const handleReloadCategories = async () => {
    setIsLoadingCategories(true)
    try {
      DealCategoryConfigService.clearCache()
      const config = await DealCategoryConfigService.load()
      setCategoryConfig(config ?? { categories: [] })
    } catch (error) {
      console.error('Kon categorieblokken niet verversen:', error)
      setStatus({
        type: 'error',
        message: 'Kon de categorieblokken niet verversen. Probeer het later opnieuw.',
      })
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setStatus(null), 3500)
      }
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleAssignProductToCategory = async (product: AmazonProduct, categoryId: string) => {
    const resolvedCategoryId = categoryId?.trim()
    const productId = String(product.id)

    if (!resolvedCategoryId) {
      setStatus({
        type: 'error',
        message: 'Selecteer eerst een blok om dit product toe te voegen.',
      })
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setStatus(null), 3500)
      }
      return
    }

    const targetCategory = categoryOptions.find((category) => category.id === resolvedCategoryId)
    if (!targetCategory) {
      setStatus({
        type: 'error',
        message: 'Kon het geselecteerde blok niet vinden. Vernieuw de blokken en probeer opnieuw.',
      })
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setStatus(null), 3500)
      }
      return
    }

    if (targetCategory.itemIds.some((id) => String(id) === productId)) {
      setStatus({ type: 'info', message: `${product.name} staat al in ${targetCategory.title}.` })
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setStatus(null), 3500)
      }
      return
    }

    setCategoryOperation({ productId, categoryId: resolvedCategoryId, type: 'add' })

    const updatedCategory: DealCategoryConfig['categories'][number] = {
      ...targetCategory,
      itemIds: [...targetCategory.itemIds, productId],
    }

    const updatedConfig: DealCategoryConfig = {
      categories: categoryOptions.map((category) =>
        category.id === resolvedCategoryId ? updatedCategory : category
      ),
    }

    try {
      const saved = await DealCategoryConfigService.save(updatedConfig)
      setCategoryConfig(saved)
      setStatus({
        type: 'success',
        message: `${product.name} toegevoegd aan ${targetCategory.title}.`,
      })
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setStatus(null), 3500)
      }
    } catch (error: any) {
      console.error('Kon product niet aan blok toevoegen:', error)
      setStatus({ type: 'error', message: error?.message ?? 'Toevoegen aan blok is mislukt.' })
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setStatus(null), 3500)
      }
    } finally {
      setCategoryOperation(null)
    }
  }

  const handleRemoveProductFromCategory = async (product: AmazonProduct, categoryId: string) => {
    const productId = String(product.id)
    const targetCategory = categoryOptions.find((category) => category.id === categoryId)

    if (!targetCategory) {
      setStatus({
        type: 'error',
        message: 'Kon het blok niet vinden. Vernieuw en probeer opnieuw.',
      })
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setStatus(null), 3500)
      }
      return
    }

    if (!targetCategory.itemIds.some((id) => String(id) === productId)) {
      setStatus({
        type: 'info',
        message: `${product.name} staat niet meer in ${targetCategory.title}.`,
      })
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setStatus(null), 3500)
      }
      return
    }

    setCategoryOperation({ productId, categoryId, type: 'remove' })

    const updatedCategory: DealCategoryConfig['categories'][number] = {
      ...targetCategory,
      itemIds: targetCategory.itemIds.filter((id) => String(id) !== productId),
    }

    const updatedConfig: DealCategoryConfig = {
      categories: categoryOptions.map((category) =>
        category.id === categoryId ? updatedCategory : category
      ),
    }

    try {
      const saved = await DealCategoryConfigService.save(updatedConfig)
      setCategoryConfig(saved)
      setStatus({
        type: 'success',
        message: `${product.name} verwijderd uit ${targetCategory.title}.`,
      })
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setStatus(null), 3500)
      }
    } catch (error: any) {
      console.error('Kon product niet uit blok verwijderen:', error)
      setStatus({ type: 'error', message: error?.message ?? 'Verwijderen uit blok is mislukt.' })
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setStatus(null), 3500)
      }
    } finally {
      setCategoryOperation(null)
    }
  }

  const resetForm = () => {
    setForm(defaultQuickForm)
    setEditingId(null)
    setShowAdvanced(false)
    setAutoFillState({ status: 'idle' })
    lastFetchedAsinRef.current = null
    inFlightAsinRef.current = null
  }

  const handleAffiliateLinkChange = (value: string) => {
    setForm((previous) => {
      const metadata = parseAmazonAffiliateLink(value)
      const nextName = previous.name.trim().length
        ? previous.name
        : (metadata.title ?? (metadata.asin ? `Amazon product ${metadata.asin}` : ''))
      return {
        ...previous,
        affiliateLink: value,
        name: nextName,
      }
    })
    setAutoFillState((current) => (current.status === 'error' ? { status: 'idle' } : current))
    lastFetchedAsinRef.current = null
  }

  const handleEdit = (product: AmazonProduct) => {
    setEditingId(product.id)
    setForm({
      affiliateLink: product.affiliateLink ?? '',
      imageUrl: product.imageLarge ?? product.image ?? '',
      name: product.name ?? '',
      price: product.price != null ? String(product.price) : '',
      prime: Boolean(product.prime),
      description: product.description ?? '',
      shortDescription: product.shortDescription ?? '',
      rating: product.rating != null ? String(product.rating) : '',
      reviewCount: product.reviewCount != null ? String(product.reviewCount) : '',
    })
    setShowAdvanced(true)
    setAutoFillState({ status: 'idle' })
    lastFetchedAsinRef.current = product.asin ?? null
  }

  const validateForm = (): string | null => {
    if (!form.affiliateLink.trim()) return 'Plak de Amazon affiliate link (met gifteez77-21 tag).'
    const metadata = parseAmazonAffiliateLink(form.affiliateLink.trim())
    if (!metadata.asin)
      return 'Kon geen ASIN vinden in de link. Controleer of dit een productdetailpagina is.'
    if (!form.imageUrl.trim())
      return 'Voeg een afbeelding URL toe (gebruik "Afbeeldingsadres kopiëren" op Amazon).'
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setStatus({ type: 'error', message: validationError })
      return
    }

    setIsSubmitting(true)

    try {
      const metadata = parseAmazonAffiliateLink(form.affiliateLink.trim())
      const asin = metadata.asin ?? metadata.fallbackId
      const name = form.name.trim() || metadata.title || `Amazon product ${asin}`
      const image = form.imageUrl.trim()
      const price = parsePrice(form.price)
      const description = form.description.trim()
      const shortDescription = form.shortDescription.trim()
      const ratingValue = form.rating.trim()
      const reviewCountValue = form.reviewCount.trim()
      const ratingParsed = ratingValue
        ? Number.parseFloat(ratingValue.replace(',', '.'))
        : undefined
      const normalisedReviewCount = reviewCountValue.replace(/[^0-9]/g, '')
      const reviewCountParsed = normalisedReviewCount
        ? Number.parseInt(normalisedReviewCount, 10)
        : undefined

      const payload: AmazonProductInput = {
        asin: asin.toUpperCase(),
        name,
        affiliateLink: form.affiliateLink.trim(),
        image,
        imageLarge: image,
        price,
        prime: form.prime,
        description: description || (editingId ? '' : undefined),
        shortDescription: shortDescription || (editingId ? '' : undefined),
      }

      if (typeof ratingParsed === 'number' && Number.isFinite(ratingParsed)) {
        payload.rating = Math.round(ratingParsed * 10) / 10
      } else if (editingId) {
        payload.rating = Number.NaN
      }
      if (typeof reviewCountParsed === 'number' && Number.isFinite(reviewCountParsed)) {
        payload.reviewCount = reviewCountParsed
      } else if (editingId) {
        payload.reviewCount = Number.NaN
      }

      if (editingId) {
        await AmazonProductLibrary.update(editingId, payload)
        setStatus({ type: 'success', message: 'Amazon-product bijgewerkt!' })
      } else {
        await AmazonProductLibrary.create(payload)
        setStatus({ type: 'success', message: 'Nieuw Amazon-product toegevoegd!' })
      }

      // Force reload products to ensure new item appears
      await AmazonProductLibrary.loadProducts()

      resetForm()
      window.setTimeout(() => setStatus(null), 3500)
    } catch (error: any) {
      console.error('Kon Amazon product niet opslaan:', error)
      setStatus({ type: 'error', message: error?.message ?? 'Onbekende fout bij opslaan.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" verwijderen uit de Amazon bibliotheek?`)) {
      return
    }

    try {
      await AmazonProductLibrary.remove(id)
      setStatus({ type: 'success', message: 'Product verwijderd.' })
      if (editingId === id) {
        resetForm()
      }
      window.setTimeout(() => setStatus(null), 3500)
    } catch (error: any) {
      console.error('Kon Amazon product niet verwijderen:', error)
      setStatus({ type: 'error', message: error?.message ?? 'Verwijderen mislukt.' })
    }
  }

  useEffect(() => {
    const link = form.affiliateLink.trim()
    const image = form.imageUrl.trim()
    if (!link || !image) {
      return undefined
    }

    const metadata = parseAmazonAffiliateLink(link)
    const asin = metadata.asin?.toUpperCase()
    if (!asin) {
      return undefined
    }

    const priceFilled = form.price.trim().length > 0
    const nameFilled = form.name.trim().length > 0
    const descriptionFilled = form.description.trim().length > 0
    const ratingFilled = form.rating.trim().length > 0
    const reviewCountFilled = form.reviewCount.trim().length > 0
    const fallbackName = metadata.title ?? `Amazon product ${asin}`
    const shouldFetch =
      !priceFilled ||
      !nameFilled ||
      form.name.trim() === fallbackName ||
      !descriptionFilled ||
      !ratingFilled ||
      !reviewCountFilled

    if (!shouldFetch) {
      return undefined
    }

    if (lastFetchedAsinRef.current === asin) {
      return undefined
    }

    if (inFlightAsinRef.current === asin) {
      return undefined
    }

    let cancelled = false
    lastFetchedAsinRef.current = asin
    inFlightAsinRef.current = asin
    setAutoFillState({ status: 'loading', asin, message: 'Productinfo ophalen bij Amazon…' })

    amazonGetItem(asin)
      .then((response) => {
        if (cancelled || inFlightAsinRef.current !== asin) {
          return
        }

        if (response.disabled) {
          setAutoFillState({
            status: 'error',
            asin,
            message: 'Automatisch aanvullen staat uit. Vul handmatig in.',
          })
          return
        }

        const item = response.item
        if (!item) {
          setAutoFillState({
            status: 'error',
            asin,
            message: 'Geen productinformatie gevonden voor deze link.',
          })
          return
        }

        setForm((previous) => {
          const next = { ...previous }
          const currentName = previous.name.trim()
          if (!currentName || currentName === fallbackName) {
            next.name = item.title ?? previous.name
          }
          if (!previous.price.trim() && typeof item.price?.value === 'number') {
            next.price = item.price.value.toFixed(2)
          }
          if (typeof item.prime === 'boolean') {
            next.prime = item.prime
          }
          if (!previous.imageUrl.trim()) {
            next.imageUrl =
              item.images.large ?? item.images.medium ?? item.images.small ?? previous.imageUrl
          }
          let descriptionFromApi = (item.description ?? '').trim()
          if (!descriptionFromApi && item.features?.length) {
            descriptionFromApi = item.features.join('\n')
          }
          if (!previous.description.trim() && descriptionFromApi) {
            next.description = descriptionFromApi
          }
          if (!previous.shortDescription.trim()) {
            const shortFromApi = item.features?.[0] ?? descriptionFromApi.split(/\n|\.\s/)[0] ?? ''
            next.shortDescription = shortFromApi
              ? shortFromApi.slice(0, 180)
              : previous.shortDescription
          }
          if (!previous.rating.trim() && typeof item.rating === 'number') {
            next.rating = item.rating.toFixed(1)
          }
          if (!previous.reviewCount.trim() && typeof item.reviewCount === 'number') {
            next.reviewCount = String(item.reviewCount)
          }
          return next
        })

        lastFetchedAsinRef.current = asin
        setAutoFillState({ status: 'success', asin, message: 'Productinfo automatisch aangevuld.' })
        window.setTimeout(() => {
          setAutoFillState((current) => {
            if (current.status === 'success' && current.asin === asin) {
              return { status: 'idle' }
            }
            return current
          })
        }, 4000)
      })
      .catch((error) => {
        if (cancelled || inFlightAsinRef.current !== asin) {
          return
        }
        console.error('Kon Amazon productinfo niet ophalen:', error)
        setAutoFillState({
          status: 'error',
          asin,
          message: 'Productinfo ophalen mislukt. Vul handmatig in.',
        })
        lastFetchedAsinRef.current = null
      })
      .finally(() => {
        if (inFlightAsinRef.current === asin) {
          inFlightAsinRef.current = null
        }
      })

    return () => {
      cancelled = true
    }
  }, [
    form.affiliateLink,
    form.imageUrl,
    form.name,
    form.price,
    form.description,
    form.rating,
    form.reviewCount,
  ])

  const totalPrime = useMemo(() => products.filter((item) => item.prime).length, [products])
  const averagePrice = useMemo(() => {
    const priced = products.filter((item) => typeof item.price === 'number')
    if (!priced.length) return undefined
    const sum = priced.reduce((total, item) => total + (item.price ?? 0), 0)
    return sum / priced.length
  }, [products])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl p-4 border border-rose-200">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCartIcon className="w-5 h-5 text-rose-600" />
            <span className="text-sm font-semibold text-rose-900">Totaal producten</span>
          </div>
          <div className="text-3xl font-bold text-rose-600">{products.length}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Prime beschikbaar</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{totalPrime}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center gap-2 mb-1">
            <StarIcon className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-900">Gemiddelde prijs</span>
          </div>
          <div className="text-3xl font-bold text-emerald-600">
            {averagePrice ? `€${averagePrice.toFixed(2)}` : 'n.v.t.'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-rose-100 rounded-xl">
              <SparklesIcon className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Amazon product bewerken' : 'Snel Amazon product toevoegen'}
              </h3>
              <p className="text-sm text-gray-500">Affiliate link + afbeelding URL is voldoende</p>
            </div>
          </div>
          {editingId && (
            <Button variant="secondary" onClick={resetForm} className="text-sm">
              <XIcon className="w-4 h-4 mr-1" /> Annuleren
            </Button>
          )}
        </div>

        {status && (
          <div
            className={`rounded-xl px-4 py-3 mb-4 text-sm font-medium flex items-center gap-2 ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : status.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {status.type === 'success' ? (
              <CheckIcon className="w-5 h-5" />
            ) : status.type === 'error' ? (
              <XIcon className="w-5 h-5" />
            ) : (
              <SparklesIcon className="w-5 h-5" />
            )}
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📎 Amazon affiliate link *
            </label>
            <input
              type="url"
              value={form.affiliateLink}
              onChange={(event) => handleAffiliateLinkChange(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              placeholder="https://www.amazon.nl/dp/ASIN?tag=gifteez77-21"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Gebruik SiteStripe op Amazon om de juiste link te kopiëren.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🖼️ Afbeelding URL *
            </label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              placeholder="https://m.media-amazon.com/images/I/..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Rechtsklik op de productafbeelding &rarr; "Afbeeldingsadres kopiëren".
            </p>
          </div>

          {form.imageUrl && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-600 mb-2">Voorbeeld</p>
              <img
                src={form.imageUrl}
                alt="Voorbeeld"
                className="h-32 w-32 object-contain rounded-lg border border-gray-200 mx-auto"
                onError={(event) => {
                  event.currentTarget.src = '/images/amazon-placeholder.png'
                }}
              />
            </div>
          )}

          {!showAdvanced && (
            <button
              type="button"
              onClick={() => setShowAdvanced(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <ChevronRightIcon className="w-4 h-4" /> Meer opties (naam, prijs, prime)
            </button>
          )}

          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ✏️ Productnaam
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  placeholder="Wordt automatisch ingevuld vanuit de link"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💰 Prijs (€)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, price: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    placeholder="59.99"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      ⭐ Beoordeling
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={form.rating}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, rating: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                      placeholder="4.7"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🗳️ Reviews
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.reviewCount}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, reviewCount: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                      placeholder="132"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <input
                  type="checkbox"
                  checked={form.prime}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, prime: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                />
                Markeer als Prime-bezorging
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Korte beschrijving
                  </label>
                  <textarea
                    value={form.shortDescription}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, shortDescription: event.target.value }))
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    placeholder="Handige samenvatting voor in overzichten"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Wordt gebruikt voor lijstjes en highlights (max ±180 tekens).
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📄 Complete beschrijving
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    placeholder="Wordt automatisch gevuld vanuit Amazon (features & reviews)."
                  />
                </div>
              </div>
            </div>
          )}

          {autoFillState.status !== 'idle' && (
            <div
              className={`rounded-lg px-3 py-2 text-sm flex items-center gap-2 border ${
                autoFillState.status === 'loading'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : autoFillState.status === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {autoFillState.status === 'loading' ? (
                <SpinnerIcon className="w-4 h-4 animate-spin" />
              ) : autoFillState.status === 'success' ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <XIcon className="w-4 h-4" />
              )}
              <span>{autoFillState.message}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="accent"
            disabled={isSubmitting}
            className="w-full py-3 text-base font-semibold"
          >
            {isSubmitting ? (
              <>
                <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Opslaan...
              </>
            ) : editingId ? (
              <>
                <CheckIcon className="w-5 h-5 inline mr-2" /> Wijzigingen opslaan
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 inline mr-2" /> Product toevoegen
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCartIcon className="w-5 h-5 text-rose-600" /> Jouw Amazon producten
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {isLoadingCategories ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                Blokken laden...
              </span>
            ) : (
              <span>
                {categoryOptions.length
                  ? `${categoryOptions.length} blokken beschikbaar`
                  : 'Geen blokken gevonden'}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                void handleReloadCategories()
              }}
              disabled={isLoadingCategories}
              className={`font-semibold transition ${
                isLoadingCategories
                  ? 'text-blue-300 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              Vernieuw blokken
            </button>
          </div>
        </div>

        {!isLoadingCategories && categoryOptions.length === 0 && (
          <div className="mb-4 rounded-lg border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            Er zijn nog geen handmatige blokken. Maak een blok via "Categorieblokken beheren" om
            producten direct te plaatsen.
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 text-gray-600 text-sm py-8">
            <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            Producten laden...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <ShoppingCartIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium mb-1">Nog geen producten</p>
            <p className="text-sm text-gray-400">
              Voeg je eerste Amazon product toe met het formulier hierboven.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {products.map((product) => {
              const image = product.imageLarge ?? product.image ?? '/images/amazon-placeholder.png'
              const productId = String(product.id)
              const memberships = productCategoryMap.get(productId) ?? []
              const defaultCategoryId = categoryOptions[0]?.id ?? ''
              const selectedCategoryId = categorySelections[productId]
              const resolvedCategoryId =
                selectedCategoryId &&
                categoryOptions.some((category) => category.id === selectedCategoryId)
                  ? selectedCategoryId
                  : defaultCategoryId
              const hasCategoryOperation = Boolean(categoryOperation)
              const isAddInProgress =
                categoryOperation?.type === 'add' && categoryOperation.productId === productId
              const disableAddButton = !resolvedCategoryId || hasCategoryOperation

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition"
                >
                  <img
                    src={image}
                    alt={product.name}
                    className="w-20 h-20 object-contain rounded-lg border border-gray-300 flex-shrink-0"
                    loading="lazy"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
                      <span className="font-semibold text-rose-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.prime && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                          Prime
                        </span>
                      )}
                      {typeof product.rating === 'number' && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                          <StarIcon className="w-4 h-4" />
                          {product.rating.toFixed(1)}
                          {typeof product.reviewCount === 'number' && product.reviewCount > 0 && (
                            <span className="text-gray-500 font-medium">
                              ({product.reviewCount})
                            </span>
                          )}
                        </span>
                      )}
                      <button
                        type="button"
                        className="text-xs font-medium text-rose-500 hover:text-rose-700"
                        onClick={() => navigator.clipboard?.writeText(product.affiliateLink ?? '')}
                      >
                        Kopieer link
                      </button>
                    </div>
                    {product.shortDescription && (
                      <p className="text-xs text-gray-600 mb-1">{product.shortDescription}</p>
                    )}
                    <p className="text-xs text-gray-500">ASIN: {product.asin}</p>
                    {memberships.length > 0 ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {memberships.map((membership) => {
                          const isRemoving =
                            categoryOperation?.type === 'remove' &&
                            categoryOperation.productId === productId &&
                            categoryOperation.categoryId === membership.id
                          const disableRemove = Boolean(categoryOperation)
                          return (
                            <span
                              key={membership.id}
                              className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                            >
                              {membership.title}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveProductFromCategory(product, membership.id)
                                }
                                disabled={disableRemove}
                                className={`rounded-full p-0.5 transition ${
                                  disableRemove && !isRemoving
                                    ? 'text-emerald-300 cursor-not-allowed'
                                    : 'text-emerald-700 hover:text-red-600'
                                }`}
                                aria-label={`Verwijder product uit ${membership.title}`}
                              >
                                {isRemoving ? (
                                  <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <XIcon className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </span>
                          )
                        })}
                      </div>
                    ) : (
                      categoryOptions.length > 0 && (
                        <p className="mt-3 text-xs text-amber-600">
                          Nog niet toegevoegd aan een blok.
                        </p>
                      )
                    )}
                    {categoryOptions.length > 0 && (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <select
                          value={resolvedCategoryId}
                          onChange={(event) =>
                            setCategorySelections((current) => ({
                              ...current,
                              [productId]: event.target.value,
                            }))
                          }
                          disabled={hasCategoryOperation}
                          className="min-w-[160px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                        >
                          {categoryOptions.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.title}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAssignProductToCategory(product, resolvedCategoryId)}
                          disabled={disableAddButton}
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                            disableAddButton
                              ? 'cursor-not-allowed bg-emerald-200 text-white'
                              : 'bg-emerald-500 text-white hover:bg-emerald-600'
                          }`}
                        >
                          {isAddInProgress ? (
                            <SpinnerIcon className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckIcon className="w-4 h-4" />
                          )}
                          Aan blok toevoegen
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Button
                      variant="primary"
                      onClick={() => handleEdit(product)}
                      className="text-xs py-2 px-3"
                    >
                      Bewerk
                    </Button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="text-xs font-medium text-red-600 hover:text-red-800 px-3"
                    >
                      Verwijder
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-2">Zo voeg je razendsnel producten toe</h4>
            <ol className="text-sm text-blue-700 space-y-2">
              <li>
                <strong>1.</strong> Open het product op Amazon.nl
              </li>
              <li>
                <strong>2.</strong> Kopieer via SiteStripe de affiliate link (Text &rarr; Short
                Link)
              </li>
              <li>
                <strong>3.</strong> Rechtsklik op de productfoto &rarr; "Afbeeldingsadres kopiëren"
              </li>
              <li>
                <strong>4.</strong> Plak beide in het formulier hierboven en klik op{' '}
                <em>Product toevoegen</em>
              </li>
            </ol>
            <p className="text-sm text-blue-600 mt-3 font-medium">
              Naam en ASIN worden automatisch ingevuld. Geavanceerde velden zijn optioneel.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AmazonProductManager
